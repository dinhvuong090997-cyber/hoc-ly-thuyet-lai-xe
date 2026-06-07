import type { CardProgress } from "../types";

// Grade: how well the user remembered
// 0 = blackout (complete fail)
// 1 = incorrect but remembered on seeing answer
// 2 = incorrect but easy to recall
// 3 = correct with serious difficulty
// 4 = correct with hesitation
// 5 = perfect recall
export type SRSGrade = 0 | 1 | 2 | 3 | 4 | 5;

export interface SRSResult {
  repetitions: number;
  easeFactor: number;
  interval: number;
  dueDate: string;
}

export function gradeCard(card: Pick<CardProgress, "repetitions" | "easeFactor" | "interval">, grade: SRSGrade): SRSResult {
  let { repetitions, easeFactor, interval } = card;

  if (grade < 3) {
    // Failed — reset
    repetitions = 0;
    interval = 1;
  } else {
    // Passed
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions++;
  }

  // Update ease factor (minimum 1.3)
  easeFactor = Math.max(
    1.3,
    easeFactor + 0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)
  );

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + interval);

  return {
    repetitions,
    easeFactor,
    interval,
    dueDate: dueDate.toISOString().split("T")[0],
  };
}

// Convert user UI answer (correct/wrong) to SRS grade
export function answerToGrade(correct: boolean, wasHesitant = false): SRSGrade {
  if (!correct) return 1;
  return wasHesitant ? 3 : 4;
}

export function isDue(dueDate: string): boolean {
  const today = new Date().toISOString().split("T")[0];
  return dueDate <= today;
}

export function isNew(card: Pick<CardProgress, "repetitions">): boolean {
  return card.repetitions === 0;
}

// Estimate pass probability based on card states
export function estimatePassProbability(cards: Pick<CardProgress, "repetitions" | "correctCount" | "totalAttempts">[]): number {
  if (cards.length === 0) return 0;
  const learned = cards.filter((c) => c.repetitions >= 2);
  const accuracy = cards.reduce((sum, c) => {
    if (c.totalAttempts === 0) return sum;
    return sum + c.correctCount / c.totalAttempts;
  }, 0) / cards.length;
  const coverage = learned.length / cards.length;
  return Math.round(coverage * 0.6 * 100 + accuracy * 0.4 * 100);
}
