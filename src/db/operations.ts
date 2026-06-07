import { getDb } from "./schema";
import type { Question, CardProgress, ExamSession, UserStats, LicenseClass } from "../types";
import { gradeCard, answerToGrade, isDue, type SRSGrade } from "../engine/srs";

// ── Questions ──────────────────────────────────────────────────────────────

export async function seedQuestions(questions: Question[]): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    for (const q of questions) {
      await db.runAsync(
        `INSERT OR IGNORE INTO questions
           (id, chapter, content, options, answer, explanation, image_url, video_url, question_type, is_diem_liet, license_classes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          q.id,
          q.chapter,
          q.content,
          JSON.stringify(q.options),
          q.answer,
          q.explanation,
          q.imageUrl ?? null,
          q.videoUrl ?? null,
          q.type ?? "mcq",
          q.isDiemLiet ? 1 : 0,
          JSON.stringify(q.licenseClasses),
        ]
      );
    }
  });
}

export async function getQuestionById(id: number): Promise<Question | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<any>(
    "SELECT * FROM questions WHERE id = ?",
    [id]
  );
  if (!row) return null;
  return rowToQuestion(row);
}

export async function getQuestionsByChapter(chapter: number): Promise<Question[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<any>(
    "SELECT * FROM questions WHERE chapter = ? ORDER BY id",
    [chapter]
  );
  return rows.map(rowToQuestion);
}

export async function getDiemLietQuestions(): Promise<Question[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<any>(
    "SELECT * FROM questions WHERE is_diem_liet = 1 ORDER BY id"
  );
  return rows.map(rowToQuestion);
}

export async function getQuestionsCount(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ count: number }>("SELECT COUNT(*) as count FROM questions");
  return row?.count ?? 0;
}

// ── SRS / Card Progress ────────────────────────────────────────────────────

export async function getDueCards(userId: string, limit = 20): Promise<CardProgress[]> {
  const db = await getDb();
  const today = new Date().toISOString().split("T")[0];
  const rows = await db.getAllAsync<any>(
    `SELECT * FROM card_progress
     WHERE user_id = ? AND due_date <= ?
     ORDER BY due_date ASC
     LIMIT ?`,
    [userId, today, limit]
  );
  return rows.map(rowToCardProgress);
}

export async function getNewCards(userId: string, licenseClass: LicenseClass, limit = 10): Promise<Question[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<any>(
    `SELECT q.* FROM questions q
     LEFT JOIN card_progress cp ON cp.question_id = q.id AND cp.user_id = ?
     WHERE cp.question_id IS NULL
       AND json_each.value = ?
     ORDER BY q.id
     LIMIT ?`,
    [userId, licenseClass, limit]
  );
  // Fallback: simpler query without JSON each
  if (rows.length === 0) {
    const allRows = await db.getAllAsync<any>(
      `SELECT q.* FROM questions q
       LEFT JOIN card_progress cp ON cp.question_id = q.id AND cp.user_id = ?
       WHERE cp.question_id IS NULL
       ORDER BY q.id
       LIMIT ?`,
      [userId, limit]
    );
    return allRows.map(rowToQuestion);
  }
  return rows.map(rowToQuestion);
}

export async function recordAnswer(
  userId: string,
  questionId: number,
  correct: boolean
): Promise<void> {
  const db = await getDb();

  const existing = await db.getFirstAsync<any>(
    "SELECT * FROM card_progress WHERE user_id = ? AND question_id = ?",
    [userId, questionId]
  );

  const grade: SRSGrade = answerToGrade(correct);

  if (!existing) {
    const result = gradeCard({ repetitions: 0, easeFactor: 2.5, interval: 0 }, grade);
    await db.runAsync(
      `INSERT INTO card_progress
         (user_id, question_id, repetitions, ease_factor, interval_days, due_date, total_attempts, correct_count)
       VALUES (?, ?, ?, ?, ?, ?, 1, ?)`,
      [
        userId,
        questionId,
        result.repetitions,
        result.easeFactor,
        result.interval,
        result.dueDate,
        correct ? 1 : 0,
      ]
    );
  } else {
    const card = rowToCardProgress(existing);
    const result = gradeCard(card, grade);
    await db.runAsync(
      `UPDATE card_progress
       SET repetitions = ?, ease_factor = ?, interval_days = ?, due_date = ?,
           total_attempts = total_attempts + 1,
           correct_count = correct_count + ?
       WHERE user_id = ? AND question_id = ?`,
      [
        result.repetitions,
        result.easeFactor,
        result.interval,
        result.dueDate,
        correct ? 1 : 0,
        userId,
        questionId,
      ]
    );
  }
}

export async function getUserProgress(userId: string): Promise<{
  total: number;
  learned: number;
  due: number;
  diemLietMastered: number;
  diemLietTotal: number;
}> {
  const db = await getDb();
  const today = new Date().toISOString().split("T")[0];

  const total = await db.getFirstAsync<{ count: number }>("SELECT COUNT(*) as count FROM questions");
  const learned = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM card_progress WHERE user_id = ? AND repetitions >= 2",
    [userId]
  );
  const due = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM card_progress WHERE user_id = ? AND due_date <= ?",
    [userId, today]
  );
  const diemLietTotal = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM questions WHERE is_diem_liet = 1"
  );
  const diemLietMastered = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM card_progress cp
     JOIN questions q ON q.id = cp.question_id
     WHERE cp.user_id = ? AND q.is_diem_liet = 1 AND cp.repetitions >= 2`,
    [userId]
  );

  return {
    total: total?.count ?? 0,
    learned: learned?.count ?? 0,
    due: due?.count ?? 0,
    diemLietMastered: diemLietMastered?.count ?? 0,
    diemLietTotal: diemLietTotal?.count ?? 0,
  };
}

// ── Exam Sessions ──────────────────────────────────────────────────────────

export async function saveExamSession(session: ExamSession): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO exam_sessions
       (id, user_id, license_class, answers, score, total_questions, passed, failed_diem_liet, duration_seconds, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      session.id,
      session.userId,
      session.licenseClass,
      JSON.stringify(session.answers),
      session.score,
      Object.keys(session.answers).length,
      session.passed ? 1 : 0,
      session.failedDiemLiet ? 1 : 0,
      session.durationSeconds,
      session.createdAt,
    ]
  );
}

export async function getRecentExams(userId: string, limit = 10): Promise<ExamSession[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<any>(
    "SELECT * FROM exam_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
    [userId, limit]
  );
  return rows.map((r: any) => ({
    id: r.id,
    userId: r.user_id,
    licenseClass: r.license_class as LicenseClass,
    answers: JSON.parse(r.answers),
    score: r.score,
    passed: r.passed === 1,
    failedDiemLiet: r.failed_diem_liet === 1,
    durationSeconds: r.duration_seconds,
    createdAt: r.created_at,
  }));
}

// ── User Stats & Gamification ──────────────────────────────────────────────

export async function getUserStats(userId: string): Promise<UserStats> {
  const db = await getDb();
  const row = await db.getFirstAsync<any>(
    "SELECT * FROM user_stats WHERE user_id = ?",
    [userId]
  );
  if (!row) {
    await db.runAsync(
      "INSERT OR IGNORE INTO user_stats (user_id) VALUES (?)",
      [userId]
    );
    return {
      userId,
      streakDays: 0,
      longestStreak: 0,
      totalXp: 0,
      lastStudyDate: null,
      licenseClass: "B",
    };
  }
  return {
    userId: row.user_id,
    streakDays: row.streak_days,
    longestStreak: row.longest_streak,
    totalXp: row.total_xp,
    lastStudyDate: row.last_study_date,
    licenseClass: row.license_class as LicenseClass,
  };
}

export async function addXp(userId: string, xp: number): Promise<void> {
  const db = await getDb();
  const today = new Date().toISOString().split("T")[0];
  const stats = await getUserStats(userId);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  let newStreak = stats.streakDays;
  if (stats.lastStudyDate === yesterdayStr) {
    newStreak++;
  } else if (stats.lastStudyDate !== today) {
    newStreak = 1;
  }

  await db.runAsync(
    `UPDATE user_stats
     SET total_xp = total_xp + ?,
         streak_days = ?,
         longest_streak = MAX(longest_streak, ?),
         last_study_date = ?
     WHERE user_id = ?`,
    [xp, newStreak, newStreak, today, userId]
  );
}

export async function getChapterStats(userId: string): Promise<Record<number, { total: number; learned: number }>> {
  const db = await getDb();
  const result: Record<number, { total: number; learned: number }> = {};
  for (const ch of [1, 2, 3, 4, 5, 6, 7]) {
    const total = await db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM questions WHERE chapter = ?", [ch]
    );
    const learned = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM card_progress cp
       JOIN questions q ON q.id = cp.question_id
       WHERE cp.user_id = ? AND q.chapter = ? AND cp.repetitions >= 2`,
      [userId, ch]
    );
    result[ch] = { total: total?.count ?? 0, learned: learned?.count ?? 0 };
  }
  return result;
}

export async function setLicenseClass(userId: string, licenseClass: LicenseClass): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    "INSERT INTO user_stats (user_id, license_class) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET license_class = ?",
    [userId, licenseClass, licenseClass]
  );
}

// ── Row mappers ─────────────────────────────────────────────────────────────

function rowToQuestion(row: any): Question {
  return {
    id: row.id,
    chapter: row.chapter,
    content: row.content,
    options: JSON.parse(row.options),
    answer: row.answer,
    explanation: row.explanation,
    imageUrl: row.image_url ?? undefined,
    videoUrl: row.video_url ?? undefined,
    type: (row.question_type ?? "mcq") as Question["type"],
    isDiemLiet: row.is_diem_liet === 1,
    licenseClasses: JSON.parse(row.license_classes),
  };
}

function rowToCardProgress(row: any): CardProgress {
  return {
    userId: row.user_id,
    questionId: row.question_id,
    repetitions: row.repetitions,
    easeFactor: row.ease_factor,
    interval: row.interval_days,
    dueDate: row.due_date,
    totalAttempts: row.total_attempts,
    correctCount: row.correct_count,
  };
}
