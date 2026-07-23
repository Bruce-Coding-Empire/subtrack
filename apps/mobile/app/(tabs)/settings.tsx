import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { ProfileSection } from "@/components/settings/ProfileSection";
import { SpendLimitSection } from "@/components/settings/SpendLimitSection";
import { Colors } from "@/constants/colors";
import { useSession } from "@/lib/auth-context";
import type { UserProfile } from "@/lib/types";
import { getCurrentUserProfile } from "@/lib/users";

export default function SettingsScreen() {
  const { signOut, updateUser } = useSession();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setRefreshKey((key) => key + 1);
    }, []),
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      const result = await getCurrentUserProfile();
      if (cancelled) return;

      if (result.success && result.data) {
        setProfile(result.data);
      } else {
        setError(result.error ?? "Failed to load settings — please try again");
      }
      setIsLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  function handleProfileSaved(updated: UserProfile) {
    setProfile(updated);
    updateUser(updated);
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView contentContainerClassName="gap-5 px-4 pt-4 pb-6">
        {profile ? (
          <View className="flex-row items-center gap-3">
            <View className="h-8 w-8 items-center justify-center rounded-full bg-accent-light">
              <Text className="font-sans-medium text-sm text-accent">
                {profile.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text className="font-sans-semibold text-lg text-text-primary">{profile.name}</Text>
          </View>
        ) : (
          <Text className="font-sans-semibold text-lg text-text-primary">Settings</Text>
        )}

        {isLoading ? (
          <View className="items-center py-16">
            <ActivityIndicator color={Colors.accent} />
          </View>
        ) : error || !profile ? (
          <Text className="py-16 text-center font-sans text-sm text-error">
            {error ?? "Failed to load settings"}
          </Text>
        ) : (
          <>
            <ProfileSection profile={profile} onSaved={handleProfileSaved} />
            <SpendLimitSection profile={profile} onSaved={handleProfileSaved} />
          </>
        )}

        <Button label="Sign Out" onPress={() => signOut()} className="bg-error" />
      </ScrollView>
    </SafeAreaView>
  );
}
