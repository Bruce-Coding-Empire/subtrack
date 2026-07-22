import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Input } from "@/components/ui/Input";
import { SubscriptionCard } from "@/components/subscriptions/SubscriptionCard";
import { Colors } from "@/constants/colors";
import { listSubscriptions } from "@/lib/subscriptions";
import type { Subscription, SubscriptionStatus } from "@/lib/types";

type StatusFilter = SubscriptionStatus | "all";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "cancelled", label: "Cancelled" },
];

export default function SubscriptionsScreen() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [status, debouncedSearch]);

  useFocusEffect(
    useCallback(() => {
      setRefreshKey((key) => key + 1);
    }, []),
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (page === 1) setIsLoading(true);
      else setIsLoadingMore(true);
      setError(null);

      const result = await listSubscriptions({
        status: status === "all" ? undefined : status,
        search: debouncedSearch || undefined,
        page,
        limit: PAGE_SIZE,
      });
      if (cancelled) return;

      if (result.success && result.data) {
        const data = result.data;
        setSubscriptions((current) => (page === 1 ? data.items : [...current, ...data.items]));
        setTotal(data.total);
      } else {
        setError(result.error ?? "Failed to load subscriptions — please try again");
      }
      setIsLoading(false);
      setIsLoadingMore(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [status, debouncedSearch, page, refreshKey]);

  function handleEndReached() {
    if (isLoading || isLoadingMore || subscriptions.length >= total) return;
    setPage((current) => current + 1);
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="gap-3 px-4 pt-4 pb-3">
        <Text className="font-sans-semibold text-lg text-text-primary">Subscriptions</Text>
        <View>
          <Input placeholder="Search subscriptions" value={search} onChangeText={setSearch} className="pl-9" />
          <Feather
            name="search"
            size={16}
            color={Colors.textMuted}
            style={{ position: "absolute", left: 12, top: 10 }}
          />
        </View>
        <View className="flex-row items-center gap-1 rounded-md border border-border bg-surface p-1">
          {STATUS_FILTERS.map((filter) => {
            const isActive = status === filter.value;
            return (
              <Pressable
                key={filter.value}
                onPress={() => setStatus(filter.value)}
                className={`flex-1 items-center rounded-md py-1.5 ${isActive ? "bg-accent" : ""}`}
              >
                <Text
                  className={`font-sans-medium text-xs ${isActive ? "text-accent-foreground" : "text-text-secondary"}`}
                >
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {error ? (
        <Text className="px-4 py-16 text-center font-sans text-sm text-error">{error}</Text>
      ) : isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={Colors.accent} />
        </View>
      ) : (
        <FlatList
          data={subscriptions}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-3 px-4 pb-6"
          renderItem={({ item }) => (
            <SubscriptionCard subscription={item} onPress={() => router.push(`/subscription/${item.id}`)} />
          )}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            <Text className="py-16 text-center font-sans text-sm text-text-muted">
              No subscriptions match your filters.
            </Text>
          }
          ListFooterComponent={isLoadingMore ? <ActivityIndicator className="py-4" color={Colors.accent} /> : null}
        />
      )}
    </SafeAreaView>
  );
}
