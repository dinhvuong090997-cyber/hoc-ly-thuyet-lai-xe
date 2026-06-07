export type LicenseClass = "A1" | "A" | "B1" | "B" | "C1" | "C" | "D1" | "D2" | "D";

export interface Question {
  id: number;
  chapter: number;
  content: string;
  options: string[];
  answer: number; // 0-based index of correct option
  explanation: string;
  imageUrl?: string;
  isDiemLiet: boolean;
  licenseClasses: LicenseClass[];
}

export interface CardProgress {
  userId: string;
  questionId: number;
  repetitions: number;
  easeFactor: number;
  interval: number; // days
  dueDate: string; // ISO date string
  totalAttempts: number;
  correctCount: number;
}

export interface ExamSession {
  id: string;
  userId: string;
  licenseClass: LicenseClass;
  answers: Record<number, number>; // questionId -> selectedOption
  score: number;
  passed: boolean;
  failedDiemLiet: boolean;
  durationSeconds: number;
  createdAt: string;
}

export interface UserStats {
  userId: string;
  streakDays: number;
  longestStreak: number;
  totalXp: number;
  lastStudyDate: string | null;
  licenseClass: LicenseClass;
}

export interface ExamConfig {
  licenseClass: LicenseClass;
  totalQuestions: number;
  timeLimitSeconds: number;
  passingScore: number;
  questionPoolSize: number; // subset of 600 used for this class
}

export const EXAM_CONFIGS: Record<LicenseClass, ExamConfig> = {
  A1: { licenseClass: "A1", totalQuestions: 25, timeLimitSeconds: 19 * 60, passingScore: 21, questionPoolSize: 250 },
  A:  { licenseClass: "A",  totalQuestions: 25, timeLimitSeconds: 19 * 60, passingScore: 23, questionPoolSize: 250 },
  B1: { licenseClass: "B1", totalQuestions: 25, timeLimitSeconds: 19 * 60, passingScore: 23, questionPoolSize: 300 },
  B:  { licenseClass: "B",  totalQuestions: 30, timeLimitSeconds: 20 * 60, passingScore: 27, questionPoolSize: 600 },
  C1: { licenseClass: "C1", totalQuestions: 35, timeLimitSeconds: 22 * 60, passingScore: 32, questionPoolSize: 600 },
  C:  { licenseClass: "C",  totalQuestions: 40, timeLimitSeconds: 24 * 60, passingScore: 36, questionPoolSize: 600 },
  D1: { licenseClass: "D1", totalQuestions: 45, timeLimitSeconds: 26 * 60, passingScore: 41, questionPoolSize: 600 },
  D2: { licenseClass: "D2", totalQuestions: 45, timeLimitSeconds: 26 * 60, passingScore: 41, questionPoolSize: 600 },
  D:  { licenseClass: "D",  totalQuestions: 45, timeLimitSeconds: 26 * 60, passingScore: 41, questionPoolSize: 600 },
};

export const CHAPTER_NAMES: Record<number, string> = {
  1: "Quy tắc giao thông",
  2: "Văn hóa & Đạo đức",
  3: "Kỹ thuật lái xe",
  4: "Cấu tạo xe",
  5: "Biển báo đường bộ",
  6: "Tình huống & Sa hình",
};

// Confirmed điểm liệt question IDs from BCA official list
export const DIEM_LIET_IDS = new Set([
  19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 30, 32, 34, 35,
  47, 48, 52, 53, 55, 58, 63, 64, 65, 66, 67, 68, 70, 71,
  72, 73, 74, 85, 86, 87, 88, 89, 90, 91, 92, 93, 97, 98,
  102, 117, 163, 165, 167, 197, 198, 206, 215, 226, 234,
  245, 246, 252, 253, 254, 255, 260,
]);
