import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, USER_ID } from "../../src/constants";
import { EXAM_CONFIGS, type LicenseClass } from "../../src/types";
import { getRecentExams, getUserStats } from "../../src/db/operations";
import type { ExamSession } from "../../src/types";

export default function ExamScreen() {
  const [licenseClass, setLicenseClass] = useState<LicenseClass>("B");
  const [history, setHistory] = useState<ExamSession[]>([]);

  useEffect(() => {
    getUserStats(USER_ID).then((s) => setLicenseClass(s.licenseClass));
    getRecentExams(USER_ID, 5).then(setHistory);
  }, []);

  const config = EXAM_CONFIGS[licenseClass];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Thi Thử</Text>
        <Text style={styles.sub}>Đề thi theo chuẩn BCA 2025</Text>
      </View>

      <ScrollView style={styles.scroll}>
        {/* Exam card */}
        <View style={styles.examCard}>
          <Text style={styles.examClass}>Hạng {licenseClass}</Text>
          <View style={styles.examStats}>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{config.totalQuestions}</Text>
              <Text style={styles.statLabel}>câu hỏi</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>{config.timeLimitSeconds / 60}</Text>
              <Text style={styles.statLabel}>phút</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>{config.passingScore}</Text>
              <Text style={styles.statLabel}>câu để đậu</Text>
            </View>
          </View>

          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              ⚠️ Mỗi đề có 1 câu điểm liệt. Sai câu đó = trượt ngay dù đúng hết câu còn lại.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.startBtn}
            onPress={() => router.push("/session/exam")}
          >
            <Text style={styles.startBtnText}>Bắt đầu thi thử →</Text>
          </TouchableOpacity>
        </View>

        {/* History */}
        {history.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Lịch sử thi thử</Text>
            {history.map((exam) => (
              <View key={exam.id} style={[styles.historyRow, exam.passed && styles.historyPassed]}>
                <View>
                  <Text style={styles.historyScore}>
                    {exam.score}/{Object.keys(exam.answers).length} câu
                  </Text>
                  <Text style={styles.historyDate}>
                    {new Date(exam.createdAt).toLocaleDateString("vi-VN")}
                    {exam.failedDiemLiet ? " · Sai câu điểm liệt" : ""}
                  </Text>
                </View>
                <View style={[styles.historyBadge, exam.passed ? styles.badgePassed : styles.badgeFailed]}>
                  <Text style={styles.historyBadgeText}>{exam.passed ? "ĐẬU" : "TRƯỢT"}</Text>
                </View>
              </View>
            ))}
          </>
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.primary, padding: 20, paddingBottom: 24 },
  title: { fontSize: 24, fontWeight: "900", color: COLORS.white },
  sub: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 4 },
  scroll: { flex: 1, padding: 16 },
  examCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  examClass: { fontSize: 28, fontWeight: "900", color: COLORS.primary, marginBottom: 20 },
  examStats: { flexDirection: "row", justifyContent: "space-around", marginBottom: 20 },
  stat: { alignItems: "center" },
  statNum: { fontSize: 32, fontWeight: "900", color: COLORS.text },
  statLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: COLORS.border },
  warningBox: {
    backgroundColor: COLORS.warningLight,
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  warningText: { fontSize: 13, color: COLORS.warning, lineHeight: 18 },
  startBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  startBtnText: { fontSize: 16, fontWeight: "800", color: COLORS.white },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: COLORS.text, marginBottom: 10 },
  historyRow: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  historyPassed: { borderColor: COLORS.success },
  historyScore: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  historyDate: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  historyBadge: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  badgePassed: { backgroundColor: COLORS.successLight },
  badgeFailed: { backgroundColor: COLORS.dangerLight },
  historyBadgeText: { fontSize: 12, fontWeight: "800" },
});
