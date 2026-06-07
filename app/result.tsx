import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../src/constants";

export default function ResultScreen() {
  const { score, total, passed, failedDiemLiet, passing, duration } = useLocalSearchParams<{
    score: string; total: string; passed: string; failedDiemLiet: string; passing: string; duration: string;
  }>();

  const isPassed = passed === "1";
  const isFailedDiemLiet = failedDiemLiet === "1";
  const scoreNum = Number(score);
  const totalNum = Number(total);
  const passingNum = Number(passing);
  const pct = Math.round((scoreNum / totalNum) * 100);
  const durationSec = Number(duration ?? 0);
  const durationMin = Math.floor(durationSec / 60);
  const durationRemSec = durationSec % 60;
  const missed = totalNum - scoreNum;

  const tip = isFailedDiemLiet
    ? "Ôn lại toàn bộ 60 câu điểm liệt trước khi thi. Sai 1 câu = trượt ngay dù đúng hết câu còn lại."
    : scoreNum < passingNum
    ? `Thiếu ${passingNum - scoreNum} câu nữa. Tập trung ôn SRS mỗi ngày để tăng xác suất đậu.`
    : "Xuất sắc! Tiếp tục duy trì streak học SRS hàng ngày.";

  const bgColor = isPassed ? COLORS.success : COLORS.danger;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bgColor }]}>
      <ScrollView contentContainerStyle={styles.container} bounces={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.emoji}>{isPassed ? "🎉" : isFailedDiemLiet ? "⚠️" : "📖"}</Text>
          <Text style={styles.result}>{isPassed ? "ĐẬU!" : "CHƯA ĐẠT"}</Text>
          <Text style={styles.score}>{score}/{total} câu đúng</Text>
          <View style={styles.pctBadge}>
            <Text style={styles.pctText}>{pct}%</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statsRow}>
            <StatBox label="Đúng" value={String(scoreNum)} color={COLORS.success} />
            <StatBox label="Sai" value={String(missed)} color={COLORS.danger} />
            <StatBox label="Cần đậu" value={`${passing}/${total}`} color={COLORS.primary} />
            {durationSec > 0 && (
              <StatBox label="Thời gian" value={`${durationMin}:${String(durationRemSec).padStart(2, "0")}`} color={COLORS.warning} />
            )}
          </View>

          {isFailedDiemLiet && (
            <View style={styles.diemLietAlert}>
              <Text style={styles.diemLietAlertTitle}>⚠️ Sai câu điểm liệt</Text>
              <Text style={styles.diemLietAlertSub}>Dù đúng hết câu còn lại vẫn bị trượt</Text>
            </View>
          )}

          {!isPassed && (
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, {
                width: `${Math.round((scoreNum / passingNum) * 100)}%` as any,
                backgroundColor: scoreNum >= passingNum ? COLORS.success : COLORS.warning,
              }]} />
            </View>
          )}

          <View style={styles.tipBox}>
            <Text style={styles.tipIcon}>{isPassed ? "✅" : "💡"}</Text>
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.retryBtn} onPress={() => router.replace("/session/exam")}>
            <Text style={styles.retryText}>🔄 Thi lại</Text>
          </TouchableOpacity>

          {(isFailedDiemLiet || !isPassed) && (
            <TouchableOpacity style={styles.studyBtn} onPress={() => router.replace("/session/diemliet")}>
              <Text style={styles.studyText}>⚠️ Ôn điểm liệt ngay</Text>
            </TouchableOpacity>
          )}

          {!isPassed && (
            <TouchableOpacity style={styles.srsBtn} onPress={() => router.replace("/session/srs")}>
              <Text style={styles.srsText}>🧠 Học SRS</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.homeBtn} onPress={() => router.replace("/")}>
            <Text style={styles.homeText}>← Về trang chủ</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statBoxValue, { color }]}>{value}</Text>
      <Text style={styles.statBoxLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 24, paddingBottom: 48, minHeight: "100%" },
  hero: { alignItems: "center", paddingVertical: 32, gap: 8 },
  emoji: { fontSize: 72 },
  result: { fontSize: 42, fontWeight: "900", color: COLORS.white },
  score: { fontSize: 20, fontWeight: "700", color: "rgba(255,255,255,0.9)" },
  pctBadge: {
    backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 6, marginTop: 4,
  },
  pctText: { fontSize: 16, fontWeight: "800", color: COLORS.white },
  statsCard: {
    backgroundColor: COLORS.white, borderRadius: 20, padding: 20,
    gap: 16, marginBottom: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  statsRow: { flexDirection: "row", justifyContent: "space-around" },
  statBox: { alignItems: "center", gap: 2 },
  statBoxValue: { fontSize: 22, fontWeight: "900" },
  statBoxLabel: { fontSize: 11, color: COLORS.textSecondary },
  diemLietAlert: {
    backgroundColor: COLORS.dangerLight, borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: COLORS.danger, alignItems: "center",
  },
  diemLietAlertTitle: { fontSize: 14, fontWeight: "800", color: COLORS.danger },
  diemLietAlertSub: { fontSize: 12, color: COLORS.danger, marginTop: 2 },
  progressBarBg: { height: 8, backgroundColor: COLORS.border, borderRadius: 4 },
  progressBarFill: { height: 8, borderRadius: 4 },
  tipBox: {
    flexDirection: "row", gap: 10, alignItems: "flex-start",
    backgroundColor: COLORS.background, borderRadius: 10, padding: 12,
  },
  tipIcon: { fontSize: 18 },
  tipText: { flex: 1, fontSize: 13, color: COLORS.text, lineHeight: 19 },
  actions: { gap: 10 },
  retryBtn: {
    backgroundColor: COLORS.white, borderRadius: 14,
    padding: 16, alignItems: "center",
  },
  retryText: { fontSize: 16, fontWeight: "800", color: COLORS.text },
  studyBtn: {
    backgroundColor: "rgba(0,0,0,0.15)", borderRadius: 14,
    padding: 16, alignItems: "center",
  },
  studyText: { fontSize: 15, fontWeight: "700", color: COLORS.white },
  srsBtn: {
    backgroundColor: "rgba(0,0,0,0.1)", borderRadius: 14,
    padding: 16, alignItems: "center",
  },
  srsText: { fontSize: 15, fontWeight: "700", color: COLORS.white },
  homeBtn: {
    borderRadius: 14, padding: 16, alignItems: "center",
  },
  homeText: { fontSize: 15, fontWeight: "600", color: "rgba(255,255,255,0.8)" },
});
