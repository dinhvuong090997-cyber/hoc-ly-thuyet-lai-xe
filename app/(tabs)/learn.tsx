import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, USER_ID } from "../../src/constants";
import { CHAPTER_NAMES } from "../../src/types";
import { CHAPTER_COLORS } from "../../src/constants";
import { getDueCards, getQuestionsCount } from "../../src/db/operations";

export default function LearnScreen() {
  const [dueCount, setDueCount] = useState(0);

  useEffect(() => {
    getDueCards(USER_ID, 100).then((cards) => setDueCount(cards.length));
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Học Thông Minh</Text>
        <Text style={styles.sub}>SRS tự động sắp xếp câu cần ôn</Text>
      </View>
      <ScrollView style={styles.scroll}>
        {/* SRS Main */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: COLORS.primary }]}
          onPress={() => router.push("/session/srs")}
        >
          <Text style={styles.cardEmoji}>🧠</Text>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Học SRS</Text>
            <Text style={styles.cardSub}>{dueCount} câu cần ôn hôm nay</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* Diem Liet */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: COLORS.danger }]}
          onPress={() => router.push("/session/diemliet")}
        >
          <Text style={styles.cardEmoji}>⚠️</Text>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>60 Câu Điểm Liệt</Text>
            <Text style={styles.cardSub}>Sai 1 câu = trượt toàn bài</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* By Chapter */}
        <Text style={styles.sectionTitle}>Học theo chương</Text>
        {Object.entries(CHAPTER_NAMES).map(([ch, name]) => (
          <TouchableOpacity
            key={ch}
            style={styles.chapterCard}
            onPress={() => router.push(`/session/chapter-${ch}`)}
          >
            <View style={[styles.chapterAccent, { backgroundColor: CHAPTER_COLORS[Number(ch)] }]} />
            <View style={styles.chapterInfo}>
              <Text style={styles.chapterTitle}>Chương {ch}</Text>
              <Text style={styles.chapterName}>{name}</Text>
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
  header: {
    backgroundColor: COLORS.primary,
    padding: 20,
    paddingBottom: 24,
  },
  title: { fontSize: 24, fontWeight: "900", color: COLORS.white },
  sub: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 4 },
  scroll: { flex: 1, padding: 16 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    gap: 14,
  },
  cardEmoji: { fontSize: 32 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: "800", color: COLORS.white },
  cardSub: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  arrow: { fontSize: 24, color: "rgba(255,255,255,0.6)" },
  sectionTitle: {
    fontSize: 15, fontWeight: "700", color: COLORS.text,
    marginTop: 8, marginBottom: 10,
  },
  chapterCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chapterAccent: { width: 5, alignSelf: "stretch" },
  chapterInfo: { flex: 1, padding: 14 },
  chapterTitle: { fontSize: 11, fontWeight: "700", color: COLORS.textSecondary },
  chapterName: { fontSize: 14, fontWeight: "600", color: COLORS.text, marginTop: 2 },
  chapterArrow: { fontSize: 20, color: COLORS.textSecondary, paddingRight: 14 },
});
