import { CheckpointPlan, Exercise } from './adaptiveLogic';

export type SessionLog = {
  completedAt: string;
  totalTimeSeconds: number;
  exerciseLogs: Array<{
    exerciseId: string;
    setsCompleted: number;
    rpeRatings: Array<1 | 2 | 3>;   // 1=too easy, 2=felt right, 3=too hard
    repsActual: number[];
  }>;
};

/**
 * Analyzes a completed session log and updates future occurrences
 * of the same exercises in the user's plan to implement progressive overload.
 */
export function applyProgressiveOverload(
  plan: CheckpointPlan,
  sessionLog: SessionLog
): CheckpointPlan {
  // Deep clone the plan to avoid mutating the original
  const updatedPlan = JSON.parse(JSON.stringify(plan)) as CheckpointPlan;

  sessionLog.exerciseLogs.forEach(log => {
    let needsLoadIncrease = false;
    let needsVolumeDecrease = false;

    // Check for "Too Easy" for 2 sets in a row
    let consecutiveEasy = 0;
    for (const rpe of log.rpeRatings) {
      if (rpe === 1) {
        consecutiveEasy++;
        if (consecutiveEasy >= 2) {
          needsLoadIncrease = true;
          break;
        }
      } else {
        consecutiveEasy = 0;
      }
    }

    // Check for "Too Hard" (average RPE > 2.5 or two 3s)
    const hardCount = log.rpeRatings.filter(r => r === 3).length;
    if (hardCount >= 2 || (log.rpeRatings.length > 0 && log.rpeRatings.reduce((a, b) => a + b, 0) / log.rpeRatings.length >= 2.5)) {
      needsVolumeDecrease = true;
    }

    if (!needsLoadIncrease && !needsVolumeDecrease) {
      return; 
    }

    // Find the name of the exercise that was logged
    let exerciseName = "";
    for (const week of plan.weeks) {
      for (const day of week.days) {
        const ex = day.exercises.find(e => e.id === log.exerciseId);
        if (ex) {
          exerciseName = ex.name;
          break;
        }
      }
      if (exerciseName) break;
    }

    if (!exerciseName) return;

    // Find the NEXT occurrence of this exercise in unlocked weeks and adjust it
    let adjusted = false;
    updatedPlan.weeks.forEach(week => {
      if (week.locked || adjusted) return;

      week.days.forEach(day => {
        if (adjusted) return;

        day.exercises.forEach(ex => {
          if (ex.name === exerciseName && !adjusted) {
            adjusted = true;
            
            if (needsLoadIncrease) {
              // Increase reps by 2, or add a set if reps can't be parsed
              const repMatch = ex.reps.match(/(\d+)/);
              if (repMatch) {
                 const currentReps = parseInt(repMatch[1], 10);
                 ex.reps = ex.reps.replace(repMatch[1], (currentReps + 2).toString());
                 if (!ex.formCue.includes("LOAD INCREASE")) {
                   ex.formCue = "LOAD INCREASE: " + ex.formCue;
                 }
              } else {
                 ex.sets += 1;
              }
            } else if (needsVolumeDecrease) {
              // Decrease reps by 2
              const repMatch = ex.reps.match(/(\d+)/);
              if (repMatch) {
                 const currentReps = parseInt(repMatch[1], 10);
                 ex.reps = ex.reps.replace(repMatch[1], Math.max(1, currentReps - 2).toString());
                 if (!ex.formCue.includes("VOLUME REDUCED")) {
                   ex.formCue = "VOLUME REDUCED: " + ex.formCue;
                 }
              }
            }
          }
        });
      });
    });
  });

  return updatedPlan;
}
