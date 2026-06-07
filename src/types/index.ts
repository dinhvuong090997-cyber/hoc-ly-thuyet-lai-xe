export type LicenseClass = "A1" | "A" | "B1" | "B" | "C1" | "C" | "D1" | "D2" | "D";

// Dạng câu hỏi mới theo quy định sau 1/7/2026 (Công văn 2333/C08-P5)
export type QuestionType = "mcq" | "truefalse" | "video";

export interface Question {
  id: number;
  chapter: number;
  content: string;
  options: string[];
  answer: number; // 0-based index of correct option
  explanation: string;
  imageUrl?: string;
  videoUrl?: string;      // Cho câu dạng xem clip tình huống
  type?: QuestionType;    // mcq (mặc định), truefalse, video — optional, default "mcq"
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

// Áp dụng quy định mới sau 1/7/2026 (Công văn 2333/C08-P5 + Nghị định 94/2026/NĐ-CP)
// Bỏ thi mô phỏng — chỉ còn: Lý thuyết → Thực hành hình → Thực hành đường
// Số câu tăng gấp đôi, ngưỡng đậu ~90%
export const EXAM_CONFIGS: Record<LicenseClass, ExamConfig> = {
  A1: { licenseClass: "A1", totalQuestions: 50, timeLimitSeconds: 25 * 60, passingScore: 45, questionPoolSize: 600 },
  A:  { licenseClass: "A",  totalQuestions: 50, timeLimitSeconds: 25 * 60, passingScore: 45, questionPoolSize: 600 },
  B1: { licenseClass: "B1", totalQuestions: 60, timeLimitSeconds: 30 * 60, passingScore: 54, questionPoolSize: 600 },
  B:  { licenseClass: "B",  totalQuestions: 60, timeLimitSeconds: 30 * 60, passingScore: 54, questionPoolSize: 600 },
  C1: { licenseClass: "C1", totalQuestions: 70, timeLimitSeconds: 35 * 60, passingScore: 63, questionPoolSize: 600 },
  C:  { licenseClass: "C",  totalQuestions: 80, timeLimitSeconds: 40 * 60, passingScore: 72, questionPoolSize: 600 },
  D1: { licenseClass: "D1", totalQuestions: 90, timeLimitSeconds: 45 * 60, passingScore: 81, questionPoolSize: 600 },
  D2: { licenseClass: "D2", totalQuestions: 90, timeLimitSeconds: 45 * 60, passingScore: 81, questionPoolSize: 600 },
  D:  { licenseClass: "D",  totalQuestions: 90, timeLimitSeconds: 45 * 60, passingScore: 81, questionPoolSize: 600 },
};

export const CHAPTER_NAMES: Record<number, string> = {
  1: "Quy tắc giao thông",
  2: "Văn hóa & Đạo đức",
  3: "Kỹ thuật lái xe",
  4: "Cấu tạo xe",
  5: "Biển báo đường bộ",
  6: "Tình huống & Sa hình",
  7: "Luật hình sự & Xử phạt",  // Mới từ 1/7/2026
};

// Confirmed điểm liệt question IDs from BCA official list
export const DIEM_LIET_IDS = new Set([
  19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 30, 32, 34, 35,
  47, 48, 52, 53, 55, 58, 63, 64, 65, 66, 67, 68, 70, 71,
  72, 73, 74, 85, 86, 87, 88, 89, 90, 91, 92, 93, 97, 98,
  102, 117, 163, 165, 167, 197, 198, 206, 215, 226, 234,
  245, 246, 252, 253, 254, 255, 260,
]);
