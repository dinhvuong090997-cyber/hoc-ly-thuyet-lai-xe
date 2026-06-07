import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../src/constants";

export default function ResultScreen() {
  const { score, total, passed, failedDiemLiet, passing } = useLocalSearchParams<{
    score: string; total: string; passed: string; failedDiemLiet: string; passing: string;
  }>();

  const isPassed = passed === "1";
  const isFailedDiemLiet = failedDiemLiet === "1";
  const pct = Math.round((Number(score) / Number(total)) * 100);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: isPassed ? COLORS.success : COLORS.danger }]}>
      <View style={styles.container}>
        <Text style={styles.emoji}>{isPassed ? "🎉" : "😞"}</Text>
        <Text style={styles.result}>{isPassed ? "ĐẬU!" : "TRƯỢT"}</Text>
        <Text style={styles.score}>{score}/{total} câu đúng ({pct}%)</Text>

        {isFailedDiemLiet && (
          <View style={styles.diemLietBox}>
            <Text style={styles.diemLietMsg}>⚠️ Sai câu điểm liệt — Tự động trượt</Text>
          </View>
        )}

        {!isPassed && !isFailedDiemLiet && (
          <Text style={styles.sub}>Cần đúng ít nhất {passing} câu để đậu</Text>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => router.replace("/session/exam")}
          >
            <Text style={styles.retryText}>Thi lại</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.homeBtn}
            onPress={() => router.replace("/")}
          >
            <Text style={styles.homeText}>Về trang chủ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32, gap: 16 },
  emoji: { fontSize: 72 },
  result: { fontSize: 48, fontWeight: "900", color: COLORS.white },
  score: { fontSize: 22, fontWeight: "700", color: "rgba(255,255,255,0.9)" },
  diemLietBox: {
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
  },
  diemLietMsg: { fontSize: 15, color: COLORS.white, fontWeight: "700", textAlign: "center" },
  sub: { fontSize: 15, color: "rgba(255,255,255,0.8)", textAlign: "center" },
  actions: { gap: 12, width: "100%", marginTop: 24 },
  retryBtn: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  retryText: { fontSize: 16, fontWeight: "800", color: COLORS.text },
  homeBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  homeText: { fontSize: 16, fontWeight: "700", color: COLORS.white },
});
