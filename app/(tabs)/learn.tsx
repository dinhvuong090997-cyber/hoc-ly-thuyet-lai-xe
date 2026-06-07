import { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, USER_ID, CHAPTER_COLORS } from "../../src/constants";
import { CHAPTER_NAMES } from "../../src/types";
import { getDueCards, getUserProgress, getChapterStats } from "../../src/db/operations";

interface ChapterStat { total: number; learned: number }

export default function LearnScreen() {
  const [dueCount, setDueCount] = useState(0);
  const [diemLietMastered, setDiemLietMastered] = useState(0);
  const [diemLietTotal, setDiemLietTotal] = useState(0);
  const [chapterStats, setChapterStats] = useState<Record<number, ChapterStat>>({});

  async function load() {
    const [cards, progress, chStats] = await Promise.all([
      getDueCards(USER_ID, 100),
      getUserProgress(USER_ID),
      getChapterStats(USER_ID),
    ]);
    setDueCount(cards.length);
    setDiemLietMastered(progress.diemLietMastered);
    setDiemLietTotal(progress.diemLietTotal);
    setChapterStats(chStats);
  }

  useFocusEffect(useCallback(() => { load(); }, []));

  const diemLietPct = diemLietTotal > 0 ? Math.round((diemLietMastered / diemLietTotal) * 100) : 0;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Học Thông Minh</Text>
        <Text style={styles.sub}>SRS tự động sắp xếp câu cần ôn hôm nay</Text>
      </View>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* SRS Main */}
        <TouchableOpacity
          style={[styles.bigCard, { backgroundColor: COLORS.primary }]}
          onPress={() => router.push("/session/srs")}
          activeOpacity={0.85}
        >
          <View style={styles.bigCardLeft}>
            <Text style={styles.bigCardEmoji}>🧠</Text>
            <View>
              <Text style={styles.bigCardTitle}>Học SRS</Text>
              <Text style={styles.bigCardSub}>
                {dueCount > 0 ? `${dueCount} câu cần ôn hôm nay` : "Tất cả câu đã thuộc — học mới"}
              </Text>
            </View>
          </View>
          <View style={styles.dueBadge}>
            <Text style={styles.dueBadgeText}>{dueCount}</Text>
          </View>
        </TouchableOpacity>

        {/* Diem Liet */}
        <TouchableOpacity
          style={[styles.bigCard, { backgroundColor: COLORS.danger }]}
          onPress={() => router.push("/session/diemliet")}
          activeOpacity={0.85}
        >
          <View style={styles.bigCardLeft}>
            <Text style={styles.bigCardEmoji}>⚠️</Text>
            <View>
              <Text style={styles.bigCardTitle}>60 Câu Điểm Liệt</Text>
              <Text style={styles.bigCardSub}>Sai 1 câu = trượt toàn bài</Text>
            </View>
          </View>
          <View style={styles.diemLietProgress}>
            <Text style={styles.diemLietPctText}>{diemLietPct}%</Text>
            <Text style={styles.diemLietSubText}>{diemLietMastered}/{diemLietTotal}</Text>
          </View>
        </TouchableOpacity>

        {/* By Chapter */}
        <Text style={styles.sectionTitle}>Học theo chương</Text>
        {Object.entries(CHAPTER_NAMES).map(([ch, name]) => {
          const chNum = Number(ch);
          const stat = chapterStats[chNum] ?? { total: 0, learned: 0 };
          const pct = stat.total > 0 ? Math.round((stat.learned / stat.total) * 100) : 0;
          const color = CHAPTER_COLORS[chNum];
          const isNew = chNum === 7;
          return (
            <TouchableOpacity
              key={ch}
              style={styles.chapterCard}
              onPress={() => router.push(`/session/chapter-${ch}`)}
              activeOpacity={0.75}
            >
              <View style={[styles.chapterAccent, { backgroundColor: color }]} />
              <View style={styles.chapterBody}>
                <View style={styles.chapterTopRow}>
                  <View style={styles.chapterTitleRow}>
                    <Text style={styles.chapterNum}>Chương {ch}</Text>
                    {isNew && <View style={styles.newTag}><Text style={styles.newTagText}>MỚI</Text></View>}
                  </View>
                  <Text style={styles.chapterCount}>{stat.learned}/{stat.total}</Text>
                </View>
                <Text style={styles.chapterName}>{name}</Text>
                <View style={styles.chapterBarBg}>
                  <View style={[styles.chapterBarFill, { width: `${pct}%` as any, backgroundColor: color }]} />
                </View>
              </View>
              <Text style={styles.chapterArrow}>›</Text>
            </TouchableOpacity>
          );
        })}
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
  bigCard: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderRadius: 18, padding: 18, marginBottom: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12, shadowRadius: 8, elevation: 4,
  },
  bigCardLeft: { flexDirection: "row", alignItems: "center", gap: 14, flex: 1 },
  bigCardEmoji: { fontSize: 36 },
  bigCardTitle: { fontSize: 17, fontWeight: "800", color: COLORS.white },
  bigCardSub: { fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  dueBadge: {
    backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 6, minWidth: 42, alignItems: "center",
  },
  dueBadgeText: { fontSize: 20, fontWeight: "900", color: COLORS.white },
  diemLietProgress: { alignItems: "flex-end" },
  diemLietPctText: { fontSize: 20, fontWeight: "900", color: COLORS.white },
  diemLietSubText: { fontSize: 11, color: "rgba(255,255,255,0.7)" },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: COLORS.text, marginTop: 4, marginBottom: 10 },
  chapterCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: COLORS.white, borderRadius: 14,
    marginBottom: 8, overflow: "hidden",
    borderWidth: 1, borderColor: COLORS.border,
  },
  chapterAccent: { width: 5, alignSelf: "stretch" },
  chapterBody: { flex: 1, padding: 12, gap: 4 },
  chapterTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  chapterTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  chapterNum: { fontSize: 11, fontWeight: "700", color: COLORS.textSecondary },
  newTag: {
    backgroundColor: "#FDF6B2", borderRadius: 4,
    paddingHorizontal: 5, paddingVertical: 1,
    borderWidth: 1, borderColor: "#C27803",
  },
  newTagText: { fontSize: 9, fontWeight: "800", color: "#C27803" },
  chapterCount: { fontSize: 11, fontWeight: "600", color: COLORS.textSecondary },
  chapterName: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  chapterBarBg: { height: 4, backgroundColor: COLORS.border, borderRadius: 2, marginTop: 4 },
  chapterBarFill: { height: 4, borderRadius: 2 },
  chapterArrow: { fontSize: 20, color: COLORS.textSecondary, paddingRight: 12 },
});
