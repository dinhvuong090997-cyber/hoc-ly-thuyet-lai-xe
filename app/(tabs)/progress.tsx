import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, USER_ID } from "../../src/constants";
import { getUserStats, getUserProgress, getRecentExams } from "../../src/db/operations";
import type { UserStats, ExamSession } from "../../src/types";

interface Progress {
  total: number; learned: number; due: number;
  diemLietMastered: number; diemLietTotal: number;
}

export default function ProgressScreen() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [history, setHistory] = useState<ExamSession[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    const [s, p, h] = await Promise.all([
      getUserStats(USER_ID),
      getUserProgress(USER_ID),
      getRecentExams(USER_ID, 10),
    ]);
    setStats(s); setProgress(p); setHistory(h);
  }

  useEffect(() => { load(); }, []);

  const passRate = history.length > 0
    ? Math.round((history.filter((e) => e.passed).length / history.length) * 100) : 0;

  const coverage = progress
    ? Math.round((progress.learned / Math.max(progress.total, 1)) * 100) : 0;

  const diemLietPct = progress
    ? Math.round((progress.diemLietMastered / Math.max(progress.diemLietTotal, 1)) * 100) : 0;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Tiến Độ</Text>
        <View style={styles.xpBadge}>
          <Text style={styles.xpText}>⚡ {stats?.totalXp ?? 0} XP</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
      >
        {/* Streak */}
        <View style={styles.streakCard}>
          <View style={styles.streakItem}>
            <Text style={styles.streakNum}>🔥 {stats?.streakDays ?? 0}</Text>
            <Text style={styles.streakLabel}>Streak hiện tại</Text>
          </View>
          <View style={styles.streakDivider} />
          <View style={styles.streakItem}>
            <Text style={styles.streakNum}>🏆 {stats?.longestStreak ?? 0}</Text>
            <Text style={styles.streakLabel}>Kỷ lục streak</Text>
          </View>
          <View style={styles.streakDivider} />
          <View style={styles.streakItem}>
            <Text style={styles.streakNum}>📝 {history.length}</Text>
            <Text style={styles.streakLabel}>Lần thi thử</Text>
          </View>
        </View>

        {/* Coverage */}
        <Text style={styles.sectionTitle}>Độ phủ câu hỏi</Text>
        <View style={styles.statsCard}>
          <StatRow label="Tổng đã học" value={`${progress?.learned ?? 0}/${progress?.total ?? 0}`} pct={coverage} color={COLORS.primary} />
          <StatRow label="Câu điểm liệt mastered" value={`${progress?.diemLietMastered ?? 0}/${progress?.diemLietTotal ?? 0}`} pct={diemLietPct} color={COLORS.danger} />
          <StatRow label="Tỷ lệ đậu khi thi thử" value={`${passRate}%`} pct={passRate} color={COLORS.success} />
        </View>

        {/* Exam history */}
        {history.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>10 lần thi thử gần nhất</Text>
            {history.map((exam) => (
              <View key={exam.id} style={styles.examRow}>
                <View style={[styles.examDot, { backgroundColor: exam.passed ? COLORS.success : COLORS.danger }]} />
                <Text style={styles.examDate}>{new Date(exam.createdAt).toLocaleDateString("vi-VN")}</Text>
                <Text style={styles.examScore}>{exam.score}/{Object.keys(exam.answers).length}</Text>
                <Text style={[styles.examResult, { color: exam.passed ? COLORS.success : COLORS.danger }]}>
                  {exam.passed ? "ĐẬU" : exam.failedDiemLiet ? "LIỆT" : "TRƯỢT"}
                </Text>
              </View>
            ))}
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatRow({ label, value, pct, color }: { label: string; value: string; pct: number; color: string }) {
  return (
    <View style={styles.statRow}>
      <View style={styles.statInfo}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${Math.min(pct, 100)}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary, padding: 20, paddingBottom: 24,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  title: { fontSize: 24, fontWeight: "900", color: COLORS.white },
  xpBadge: { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  xpText: { fontSize: 14, fontWeight: "800", color: COLORS.white },
  scroll: { flex: 1, padding: 16 },
  streakCard: {
    backgroundColor: COLORS.white, borderRadius: 16, padding: 20,
    flexDirection: "row", justifyContent: "space-around",
    marginBottom: 20, borderWidth: 1, borderColor: COLORS.border,
  },
  streakItem: { alignItems: "center", gap: 4 },
  streakNum: { fontSize: 22, fontWeight: "800", color: COLORS.text },
  streakLabel: { fontSize: 11, color: COLORS.textSecondary, textAlign: "center" },
  streakDivider: { width: 1, backgroundColor: COLORS.border },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: COLORS.text, marginBottom: 10 },
  statsCard: {
    backgroundColor: COLORS.white, borderRadius: 16, padding: 16,
    gap: 16, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border,
  },
  statRow: { gap: 6 },
  statInfo: { flexDirection: "row", justifyContent: "space-between" },
  statLabel: { fontSize: 13, color: COLORS.textSecondary },
  statValue: { fontSize: 13, fontWeight: "700", color: COLORS.text },
  barBg: { height: 6, backgroundColor: COLORS.border, borderRadius: 3 },
  barFill: { height: 6, borderRadius: 3 },
  examRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: COLORS.white, borderRadius: 10, padding: 12,
    marginBottom: 6, borderWidth: 1, borderColor: COLORS.border,
  },
  examDot: { width: 8, height: 8, borderRadius: 4 },
  examDate: { flex: 1, fontSize: 13, color: COLORS.textSecondary },
  examScore: { fontSize: 14, fontWeight: "700", color: COLORS.text },
  examResult: { fontSize: 12, fontWeight: "800", minWidth: 44, textAlign: "right" },
});
