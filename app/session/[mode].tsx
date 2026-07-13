import { useEffect, useRef, useState, useCallback } from "react";
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, USER_ID, XP } from "../../src/constants";
import { CHAPTER_NAMES } from "../../src/types";
import type { Question } from "../../src/types";
import { EXAM_CONFIGS } from "../../src/types";
import {
  getDueCards, getNewCards, getDiemLietQuestions,
  getQuestionById, recordAnswer, saveExamSession,
  getQuestionsCount, getQuestionsByChapter,
} from "../../src/db/operations";
import { useUserStore } from "../../src/stores/userStore";
import { getUserStats } from "../../src/db/operations";

type Mode = "srs" | "diemliet" | "exam" | `chapter-${number}`;
type Phase = "question" | "answer" | "done";

interface SessionState {
  questions: Question[];
  currentIndex: number;
  selectedOption: number | null;
  isCorrect: boolean | null;
  answers: Record<number, number>;
  startTime: number;
  phase: Phase;
}

export default function SessionScreen() {
  const { mode } = useLocalSearchParams<{ mode: string }>();
  const earnXp = useUserStore((s) => s.earnXp);

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<SessionState | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Kept in sync with `session` so the exam countdown (set up once in a
  // useEffect below) always finishes with the latest answers instead of
  // the stale snapshot captured when the interval was created.
  const sessionRef = useRef<SessionState | null>(null);
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  const isExam = mode === "exam";
  const isDiemLiet = mode === "diemliet";

  useEffect(() => {
    loadQuestions();
  }, [mode]);

  // Countdown timer for exam mode
  useEffect(() => {
    if (!isExam || timeLeft === null || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t === null || t <= 1) {
          clearInterval(timer);
          finishSession();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isExam, timeLeft !== null]);

  async function loadQuestions() {
    setLoading(true);
    let questions: Question[] = [];

    if (mode === "srs") {
      // Mix due cards + new cards
      const dueCards = await getDueCards(USER_ID, 15);
      const dueQs = await Promise.all(dueCards.map((c) => getQuestionById(c.questionId)));
      const validDue = dueQs.filter(Boolean) as Question[];

      if (validDue.length < 15) {
        const stats = await getUserStats(USER_ID);
        const newQs = await getNewCards(USER_ID, stats.licenseClass, 20 - validDue.length);
        questions = [...validDue, ...newQs];
      } else {
        questions = validDue;
      }

      if (questions.length === 0) {
        // No cards due — show all questions
        const allDue = await getDueCards(USER_ID, 20);
        const allQs = await Promise.all(allDue.map((c) => getQuestionById(c.questionId)));
        questions = allQs.filter(Boolean) as Question[];
        if (questions.length === 0) {
          const newQs = await getNewCards(USER_ID, "B", 20);
          questions = newQs;
        }
      }
    } else if (mode === "diemliet") {
      questions = await getDiemLietQuestions();
      // Shuffle
      questions = questions.sort(() => Math.random() - 0.5);
    } else if (mode === "exam") {
      const stats = await getUserStats(USER_ID);
      const lc = stats.licenseClass;
      const config = EXAM_CONFIGS[lc];
      // Get all available questions and shuffle for exam
      const allChapters = [1, 2, 3, 4, 5, 6, 7];
      const allQs: Question[] = [];
      for (const ch of allChapters) {
        const chQs = await getQuestionsByChapter(ch);
        allQs.push(...chQs);
      }
      // Ensure at least 1 điểm liệt question in exam
      const diemLietQs = allQs.filter((q) => q.isDiemLiet).sort(() => Math.random() - 0.5);
      const normalQs = allQs.filter((q) => !q.isDiemLiet).sort(() => Math.random() - 0.5);
      const picked = diemLietQs.slice(0, 1);
      const needed = config.totalQuestions - picked.length;
      picked.push(...normalQs.slice(0, needed));
      questions = picked.sort(() => Math.random() - 0.5);
      setTimeLeft(config.timeLimitSeconds);
    } else if (mode?.startsWith("chapter-")) {
      const chapter = parseInt(mode.replace("chapter-", ""), 10);
      questions = await getQuestionsByChapter(chapter);
      questions = questions.sort(() => Math.random() - 0.5).slice(0, 20);
    }

    if (questions.length === 0) {
      Alert.alert("Chưa có câu hỏi", "Seed dữ liệu chưa đủ. Thêm câu hỏi để tiếp tục.", [
        { text: "OK", onPress: () => router.back() },
      ]);
      setLoading(false);
      return;
    }

    setSession({
      questions,
      currentIndex: 0,
      selectedOption: null,
      isCorrect: null,
      answers: {},
      startTime: Date.now(),
      phase: "question",
    });
    setLoading(false);
  }

  function selectOption(optionIndex: number) {
    if (!session || session.phase !== "question") return;
    const q = session.questions[session.currentIndex];
    const correct = optionIndex === q.answer;

    setSession((s) => s && ({
      ...s,
      selectedOption: optionIndex,
      isCorrect: correct,
      answers: { ...s.answers, [q.id]: optionIndex },
      phase: isExam ? "question" : "answer",
    }));

    if (isExam) {
      // In exam mode: auto-advance after brief pause
      setTimeout(() => advanceQuestion(optionIndex, correct), 300);
    }
  }

  function advanceQuestion(selectedOption?: number, correct?: boolean) {
    if (!session) return;
    const nextIndex = session.currentIndex + 1;

    if (!isExam && session.phase === "answer") {
      const q = session.questions[session.currentIndex];
      const isCorrect = session.isCorrect ?? false;
      recordAnswer(USER_ID, q.id, isCorrect);
      earnXp(isCorrect ? (q.isDiemLiet ? XP.correctDiemLiet : XP.correctNormal) : 0);
    }

    if (nextIndex >= session.questions.length) {
      finishSession();
      return;
    }

    setSession((s) => s && ({
      ...s,
      currentIndex: nextIndex,
      selectedOption: null,
      isCorrect: null,
      phase: "question",
    }));
  }

  async function finishSession() {
    const session = sessionRef.current;
    if (!session) return;

    if (isExam) {
      const stats = await getUserStats(USER_ID);
      const lc = stats.licenseClass ?? "B";
      const config = EXAM_CONFIGS[lc as keyof typeof EXAM_CONFIGS] ?? EXAM_CONFIGS["B"];
      const total = session.questions.length;
      let correct = 0;
      let failedDiemLiet = false;

      for (const q of session.questions) {
        const selected = session.answers[q.id];
        if (selected === q.answer) {
          correct++;
        } else if (q.isDiemLiet) {
          failedDiemLiet = true;
        }
      }

      const passed = correct >= config.passingScore && !failedDiemLiet;
      const duration = Math.round((Date.now() - session.startTime) / 1000);

      saveExamSession({
        id: `exam_${Date.now()}`,
        userId: USER_ID,
        licenseClass: config.licenseClass,
        answers: session.answers,
        score: correct,
        passed,
        failedDiemLiet,
        durationSeconds: duration,
        createdAt: new Date().toISOString(),
      });

      if (passed) earnXp(XP.examPass);

      router.replace({
        pathname: "/result",
        params: {
          score: correct,
          total,
          passed: passed ? "1" : "0",
          failedDiemLiet: failedDiemLiet ? "1" : "0",
          passing: config.passingScore,
          duration,
        },
      });
    } else {
      router.back();
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!session) return null;

  const q = session.questions[session.currentIndex];
  const progress = (session.currentIndex + 1) / session.questions.length;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.counter}>
          {isExam && timeLeft !== null
            ? `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")}`
            : `${session.currentIndex + 1}/${session.questions.length}`}
        </Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Badges row */}
        <View style={styles.badgeRow}>
          {q.isDiemLiet && (
            <View style={styles.diemLietBadge}>
              <Text style={styles.diemLietText}>⚠️ ĐIỂM LIỆT</Text>
            </View>
          )}
          {q.chapter === 7 && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>MỚI 1/7/2026</Text>
            </View>
          )}
          {q.type === "truefalse" && (
            <View style={styles.tfBadge}>
              <Text style={styles.tfBadgeText}>ĐÚNG / SAI</Text>
            </View>
          )}
        </View>

        {q.isDiemLiet && (
          <View style={styles.diemLietWarning}>
            <Text style={styles.diemLietWarningText}>Sai câu này = Trượt toàn bài dù đúng hết câu còn lại</Text>
          </View>
        )}

        {/* Chapter badge */}
        <Text style={styles.chapterBadge}>Chương {q.chapter}: {CHAPTER_NAMES[q.chapter]}</Text>

        {/* Question */}
        <Text style={styles.question}>
          Câu {q.id}. {q.content}
        </Text>

        {/* Options */}
        <View style={styles.options}>
          {q.options.map((opt, i) => {
            let optStyle = styles.option;
            let textStyle = styles.optionText;

            if (session.phase === "answer") {
              if (i === q.answer) {
                optStyle = { ...optStyle, ...styles.optionCorrect } as any;
                textStyle = { ...textStyle, ...styles.optionTextCorrect } as any;
              } else if (i === session.selectedOption && !session.isCorrect) {
                optStyle = { ...optStyle, ...styles.optionWrong } as any;
                textStyle = { ...textStyle, ...styles.optionTextWrong } as any;
              }
            } else if (isExam && session.selectedOption === i) {
              optStyle = { ...optStyle, ...styles.optionSelected } as any;
            }

            const label = q.type === "truefalse"
              ? (i === 0 ? "✓" : i === 1 ? "✗" : ["C", "D"][i - 2])
              : ["A", "B", "C", "D"][i];

            return (
              <TouchableOpacity
                key={i}
                style={optStyle}
                onPress={() => selectOption(i)}
                disabled={session.phase === "answer" || (isExam && session.selectedOption !== null)}
                activeOpacity={0.7}
              >
                <Text style={styles.optionLabel}>{label}</Text>
                <Text style={[textStyle, { flex: 1 }]}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Explanation (SRS/DiemLiet mode only) */}
        {session.phase === "answer" && (
          <View style={[styles.explanation, session.isCorrect ? styles.explanationCorrect : styles.explanationWrong]}>
            <Text style={styles.explanationIcon}>{session.isCorrect ? "✅" : "❌"}</Text>
            <Text style={styles.explanationText}>{q.explanation}</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom action */}
      {!isExam && (
        <View style={styles.bottomBar}>
          {session.phase === "question" ? (
            <Text style={styles.hintText}>Chọn một đáp án bên trên</Text>
          ) : (
            <TouchableOpacity
              style={[styles.nextBtn, session.isCorrect ? styles.nextBtnCorrect : styles.nextBtnWrong]}
              onPress={() => advanceQuestion()}
            >
              <Text style={styles.nextBtnText}>
                {session.currentIndex + 1 >= session.questions.length ? "Hoàn thành" : "Câu tiếp →"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeBtn: {
    width: 32, height: 32,
    justifyContent: "center", alignItems: "center",
  },
  closeText: { fontSize: 18, color: COLORS.textSecondary, fontWeight: "600" },
  progressBarBg: { flex: 1, height: 6, backgroundColor: COLORS.border, borderRadius: 3 },
  progressBarFill: { height: 6, backgroundColor: COLORS.primary, borderRadius: 3 },
  counter: { fontSize: 13, fontWeight: "700", color: COLORS.text, minWidth: 36, textAlign: "right" },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  badgeRow: { flexDirection: "row", gap: 8, marginBottom: 10, flexWrap: "wrap" },
  diemLietBadge: {
    backgroundColor: COLORS.dangerLight,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  diemLietText: { fontSize: 12, fontWeight: "800", color: COLORS.danger },
  diemLietWarning: {
    backgroundColor: COLORS.dangerLight,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  diemLietWarningText: { fontSize: 13, fontWeight: "600", color: COLORS.danger, textAlign: "center" },
  newBadge: {
    backgroundColor: "#FDF6B2",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#C27803",
  },
  newBadgeText: { fontSize: 12, fontWeight: "800", color: "#C27803" },
  tfBadge: {
    backgroundColor: "#EDE9FE",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#7E3AF2",
  },
  tfBadgeText: { fontSize: 12, fontWeight: "800", color: "#7E3AF2" },
  chapterBadge: { fontSize: 12, color: COLORS.primary, fontWeight: "600", marginBottom: 8 },
  question: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    lineHeight: 26,
    marginBottom: 24,
  },
  options: { gap: 10 },
  option: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  optionSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  optionCorrect: { borderColor: COLORS.success, backgroundColor: COLORS.successLight },
  optionWrong: { borderColor: COLORS.danger, backgroundColor: COLORS.dangerLight },
  optionLabel: {
    fontSize: 14, fontWeight: "800", color: COLORS.textSecondary,
    width: 24, textAlign: "center",
  },
  optionText: { fontSize: 15, color: COLORS.text, lineHeight: 22 },
  optionTextCorrect: { color: COLORS.success, fontWeight: "700" },
  optionTextWrong: { color: COLORS.danger, fontWeight: "700" },
  explanation: {
    marginTop: 20,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  explanationCorrect: { backgroundColor: COLORS.successLight },
  explanationWrong: { backgroundColor: COLORS.dangerLight },
  explanationIcon: { fontSize: 18 },
  explanationText: { flex: 1, fontSize: 14, color: COLORS.text, lineHeight: 20 },
  bottomBar: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  hintText: { textAlign: "center", color: COLORS.textSecondary, fontSize: 14 },
  nextBtn: { borderRadius: 14, padding: 16, alignItems: "center" },
  nextBtnCorrect: { backgroundColor: COLORS.success },
  nextBtnWrong: { backgroundColor: COLORS.danger },
  nextBtnText: { fontSize: 16, fontWeight: "800", color: COLORS.white },
});
