import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../src/constants";
import type { LicenseClass } from "../src/types";
import { setLicenseClass } from "../src/db/operations";
import { USER_ID } from "../src/constants";

const LICENSE_OPTIONS: { class: LicenseClass; label: string; desc: string; emoji: string }[] = [
  { class: "A1", emoji: "🛵", label: "Hạng A1", desc: "Xe mô tô ≤125cc — 50 câu / 25 phút" },
  { class: "A",  emoji: "🏍️", label: "Hạng A",  desc: "Xe mô tô >125cc — 50 câu / 25 phút" },
  { class: "B1", emoji: "🚗", label: "Hạng B1", desc: "Xe số tự động — 60 câu / 30 phút" },
  { class: "B",  emoji: "🚙", label: "Hạng B",  desc: "Xe ô tô con (số sàn) — 60 câu / 30 phút" },
  { class: "C1", emoji: "🚛", label: "Hạng C1", desc: "Xe tải 3,5–7,5 tấn — 70 câu / 35 phút" },
  { class: "C",  emoji: "🚚", label: "Hạng C",  desc: "Xe tải >7,5 tấn — 80 câu / 40 phút" },
  { class: "D",  emoji: "🚌", label: "Hạng D",  desc: "Xe khách — 90 câu / 45 phút" },
];

export default function OnboardingScreen() {
  const [selected, setSelected] = useState<LicenseClass>("B");

  async function handleStart() {
    await setLicenseClass(USER_ID, selected);
    router.replace("/");
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.emoji}>🚦</Text>
          <Text style={styles.title}>Lái Thông Minh</Text>
          <Text style={styles.subtitle}>
            Ôn thi lý thuyết theo quy định mới{"\n"}hiệu lực 1/7/2026
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>✅ Nghị định 94/2026 · Công văn 2333/C08-P5</Text>
          </View>
        </View>

        <Text style={styles.label}>Bạn muốn thi hạng nào?</Text>

        <View style={styles.options}>
          {LICENSE_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.class}
              style={[styles.option, selected === opt.class && styles.optionSelected]}
              onPress={() => setSelected(opt.class)}
              activeOpacity={0.7}
            >
              <Text style={styles.optionEmoji}>{opt.emoji}</Text>
              <View style={styles.optionInfo}>
                <Text style={[styles.optionLabel, selected === opt.class && styles.optionLabelSelected]}>
                  {opt.label}
                </Text>
                <Text style={styles.optionDesc}>{opt.desc}</Text>
              </View>
              {selected === opt.class && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.features}>
          {[
            { icon: "🧠", text: "SRS thông minh như Anki — không học vẹt" },
            { icon: "⚠️", text: "Drill riêng 60 câu điểm liệt" },
            { icon: "📊", text: "Dự đoán xác suất đậu của bạn" },
            { icon: "📱", text: "Học offline — không cần mạng" },
          ].map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.startBtn} onPress={handleStart} activeOpacity={0.85}>
          <Text style={styles.startBtnText}>Bắt đầu học hạng {selected} →</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>Miễn phí · Không quảng cáo trong phiên học</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  container: { padding: 24, paddingBottom: 48 },
  hero: { alignItems: "center", marginBottom: 32, paddingTop: 24 },
  emoji: { fontSize: 64, marginBottom: 12 },
  title: { fontSize: 32, fontWeight: "900", color: COLORS.primary },
  subtitle: { fontSize: 16, color: COLORS.textSecondary, textAlign: "center", marginTop: 8, lineHeight: 22 },
  badge: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 12,
  },
  badgeText: { fontSize: 11, color: COLORS.primary, fontWeight: "700" },
  label: { fontSize: 17, fontWeight: "800", color: COLORS.text, marginBottom: 14 },
  options: { gap: 10, marginBottom: 28 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: COLORS.background,
    borderRadius: 14,
    padding: 14,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  optionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  optionEmoji: { fontSize: 28 },
  optionInfo: { flex: 1 },
  optionLabel: { fontSize: 15, fontWeight: "700", color: COLORS.text },
  optionLabelSelected: { color: COLORS.primary },
  optionDesc: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  checkmark: { fontSize: 20, color: COLORS.primary, fontWeight: "900" },
  features: {
    gap: 12,
    marginBottom: 28,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 18,
  },
  featureRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  featureIcon: { fontSize: 22 },
  featureText: { fontSize: 14, color: COLORS.text, flex: 1, lineHeight: 20 },
  startBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    marginBottom: 16,
  },
  startBtnText: { fontSize: 17, fontWeight: "900", color: COLORS.white },
  footer: { textAlign: "center", fontSize: 12, color: COLORS.textSecondary },
});
