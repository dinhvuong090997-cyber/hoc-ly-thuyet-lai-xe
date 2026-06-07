import { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, USER_ID } from "../../src/constants";
import { CHAPTER_NAMES } from "../../src/types";
import { CHAPTER_COLORS } from "../../src/constants";
import { getUserStats, getUserProgress } from "../../src/db/operations";
import type { UserStats, LicenseClass } from "../../src/types";
import { EXAM_CONFIGS } from "../../src/types";
import { estimatePassProbability } from "../../src/engine/srs";

interface Progress {
  total: number;
  learned: number;
  due: number;
  diemLietMastered: number;
  diemLietTotal: number;
}

export default function HomeScreen() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    const [s, p] = await Promise.all([
      getUserStats(USER_ID),
      getUserProgress(USER_ID),
    ]);
    setStats(s);
    setProgress(p);
  }

  useEffect(() => { load(); }, []);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  const passPct = progress
    ? Math.min(99, Math.round((progress.learned / Math.max(progress.total, 1)) * 100))
    : 0;

  const licenseClass = (stats?.licenseClass ?? "B") as LicenseClass;
  const examConfig = EXAM_CONFIGS[licenseClass];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Lái Thông Minh</Text>
            <Text style={styles.subGreeting}>Hạng {licenseClass} · Quy định mới 1/7/2026</Text>
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakText}>{stats?.streakDays ?? 0}</Text>
          </View>
        </View>

        {/* Pass Probability Card */}
        <View style={styles.probCard}>
          <View style={styles.probHeader}>
            <Text style={styles.probLabel}>Xác suất đậu hôm nay</Text>
            <Text style={styles.probXp}>⚡ {stats?.totalXp ?? 0} XP</Text>
          </View>
          <Text style={styles.probPct}>{passPct}%</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${passPct}%` as any }]} />
          </View>
          <Text style={styles.probSub}>
            Đã học {progress?.learned ?? 0}/{progress?.total ?? 0} câu
          </Text>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Học ngay</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: COLORS.primary }]}
            onPress={() => router.push("/session/srs")}
          >
            <Text style={styles.actionEmoji}>🧠</Text>
            <Text style={styles.actionTitle}>Học SRS</Text>
            <Text style={styles.actionSub}>
              {progress?.due ?? 0} câu cần ôn
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: COLORS.danger }]}
            onPress={() => router.push("/session/diemliet")}
          >
            <Text style={styles.actionEmoji}>⚠️</Text>
            <Text style={styles.actionTitle}>60 Câu Điểm Liệt</Text>
            <Text style={styles.actionSub}>
              {progress?.diemLietMastered ?? 0}/{progress?.diemLietTotal ?? 0} mastered
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.examCard}
          onPress={() => router.push("/session/exam")}
        >
          <View>
            <Text style={styles.examTitle}>📝 Thi Thử Hạng {licenseClass}</Text>
            <Text style={styles.examSub}>
              {examConfig.totalQuestions} câu · {examConfig.timeLimitSeconds / 60} phút · Cần {examConfig.passingScore}/{examConfig.totalQuestions}
            </Text>
          </View>
          <Text style={styles.examArrow}>›</Text>
        </TouchableOpacity>

        {/* Chapters */}
        <Text style={styles.sectionTitle}>Học theo chương</Text>
        {Object.entries(CHAPTER_NAMES).map(([ch, name]) => (
          <TouchableOpacity
            key={ch}
            style={styles.chapterRow}
            onPress={() => router.push(`/session/chapter-${ch}`)}
          >
            <View style={[styles.chapterDot, { backgroundColor: CHAPTER_COLORS[Number(ch)] }]} />
            <View style={styles.chapterInfo}>
              <Text style={styles.chapterName}>Chương {ch}: {name}</Text>
            </View>
            <Text style={styles.chapterArrow}>›</Text>
          </TouchableOpacity>
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  greeting: { fontSize: 22, fontWeight: "800", color: COLORS.white },
  subGreeting: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  streakEmoji: { fontSize: 18 },
  streakText: { fontSize: 18, fontWeight: "800", color: COLORS.white },
  probCard: {
    margin: 16,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  probHeader: { flexDirection: "row", justifyContent: "space-between" },
  probLabel: { fontSize: 13, color: COLORS.textSecondary, fontWeight: "600" },
  probXp: { fontSize: 13, color: COLORS.xpGold, fontWeight: "700" },
  probPct: { fontSize: 48, fontWeight: "900", color: COLORS.primary, marginTop: 4 },
  progressBarBg: {
    height: 8, backgroundColor: COLORS.border, borderRadius: 4, marginTop: 8,
  },
  progressBarFill: {
    height: 8, backgroundColor: COLORS.primary, borderRadius: 4,
  },
  probSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 8 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 10,
  },
  actionsRow: { flexDirection: "row", gap: 12, marginHorizontal: 16, marginBottom: 12 },
  actionCard: {
    flex: 1, borderRadius: 16, padding: 16, gap: 4,
  },
  actionEmoji: { fontSize: 28 },
  actionTitle: { fontSize: 15, fontWeight: "800", color: COLORS.white, marginTop: 8 },
  actionSub: { fontSize: 12, color: "rgba(255,255,255,0.8)" },
  examCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  examTitle: { fontSize: 15, fontWeight: "700", color: COLORS.text },
  examSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 3 },
  examArrow: { fontSize: 24, color: COLORS.primary, fontWeight: "300" },
  chapterRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chapterDot: { width: 12, height: 12, borderRadius: 6 },
  chapterInfo: { flex: 1 },
  chapterName: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  chapterArrow: { fontSize: 20, color: COLORS.textSecondary },
});
