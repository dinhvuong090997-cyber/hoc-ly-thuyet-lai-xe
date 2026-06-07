import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync("laithongminh.db");
  }
  return db;
}

export async function initDatabase(): Promise<void> {
  const database = await getDb();

  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    -- Hỗ trợ quy định mới sau 1/7/2026: câu Đúng/Sai, câu video clip tình huống
    CREATE TABLE IF NOT EXISTS questions (
      id            INTEGER PRIMARY KEY,
      chapter       INTEGER NOT NULL,
      content       TEXT    NOT NULL,
      options       TEXT    NOT NULL, -- JSON array
      answer        INTEGER NOT NULL, -- 0-based index
      explanation   TEXT    NOT NULL,
      image_url     TEXT,
      video_url     TEXT,             -- URL clip tình huống (câu dạng video)
      question_type TEXT    NOT NULL DEFAULT 'mcq', -- mcq | truefalse | video
      is_diem_liet  INTEGER NOT NULL DEFAULT 0,
      license_classes TEXT  NOT NULL  -- JSON array
    );

    CREATE TABLE IF NOT EXISTS card_progress (
      user_id       TEXT    NOT NULL,
      question_id   INTEGER NOT NULL REFERENCES questions(id),
      repetitions   INTEGER NOT NULL DEFAULT 0,
      ease_factor   REAL    NOT NULL DEFAULT 2.5,
      interval_days INTEGER NOT NULL DEFAULT 0,
      due_date      TEXT    NOT NULL DEFAULT (date('now')),
      total_attempts INTEGER NOT NULL DEFAULT 0,
      correct_count  INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (user_id, question_id)
    );

    CREATE INDEX IF NOT EXISTS idx_card_progress_due
      ON card_progress(user_id, due_date);

    CREATE TABLE IF NOT EXISTS exam_sessions (
      id               TEXT PRIMARY KEY,
      user_id          TEXT    NOT NULL,
      license_class    TEXT    NOT NULL,
      answers          TEXT    NOT NULL, -- JSON
      score            INTEGER NOT NULL,
      total_questions  INTEGER NOT NULL,
      passed           INTEGER NOT NULL DEFAULT 0,
      failed_diem_liet INTEGER NOT NULL DEFAULT 0,
      duration_seconds INTEGER NOT NULL,
      created_at       TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS user_stats (
      user_id        TEXT PRIMARY KEY,
      streak_days    INTEGER NOT NULL DEFAULT 0,
      longest_streak INTEGER NOT NULL DEFAULT 0,
      total_xp       INTEGER NOT NULL DEFAULT 0,
      last_study_date TEXT,
      license_class  TEXT    NOT NULL DEFAULT 'B'
    );
  `);
}
