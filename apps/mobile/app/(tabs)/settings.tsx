import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { useSession } from "@/lib/auth-context";

// Placeholder — real settings (profile, base currency, v2-scaffolded
// sections) built in feature 17. Sign Out lives here now (not speced
// anywhere yet, same gap web hit until its feature 13 Navbar) since the
// auth guard needs a real way to flip back to unauthenticated for testing.
export default function SettingsScreen() {
  const { user, signOut } = useSession();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center gap-4 px-4">
        <View className="items-center gap-1">
          <Text className="font-sans-semibold text-base text-text-primary">Settings</Text>
          {user ? <Text className="font-sans text-xs text-text-secondary">{user.email}</Text> : null}
          <Text className="font-sans text-xs text-text-muted">Coming soon</Text>
        </View>
        <Button label="Sign Out" onPress={() => signOut()} className="bg-error" />
      </View>
    </SafeAreaView>
  );
}
