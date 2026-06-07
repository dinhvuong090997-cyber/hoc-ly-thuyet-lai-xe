import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { initDatabase } from "../src/db/schema";
import { seedQuestions, getQuestionsCount, getUserStats } from "../src/db/operations";
import { SAMPLE_QUESTIONS } from "../src/db/seed/questions";
import { COLORS, USER_ID } from "../src/constants";

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    async function setup() {
      await initDatabase();
      const count = await getQuestionsCount();
      if (count === 0) {
        await seedQuestions(SAMPLE_QUESTIONS);
      }
      // Show onboarding if first time (no user stats yet)
      const stats = await getUserStats(USER_ID);
      setDbReady(true);
      if (!stats.lastStudyDate && stats.totalXp === 0) {
        // First launch — go to onboarding
        router.replace("/onboarding");
      }
    }
    setup();
  }, []);

  if (!dbReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen
          name="session/[mode]"
          options={{ presentation: "fullScreenModal", animation: "slide_from_bottom" }}
        />
        <Stack.Screen
          name="result"
          options={{ presentation: "fullScreenModal", animation: "fade" }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.primary,
  },
});
