export type GoalWeights = {
  strength: number;      // 0-100, all four must sum to 100
  endurance: number;
  mobility: number;
  fatLoss: number;
};

export type CheckpointOutcome = {
  label: string;         // Plain language: "Do 3 unassisted pull-ups"
  metric: string;        // Numeric: "+18% upper push strength"
  category: keyof GoalWeights;
};

export type Checkpoint = {
  week: number;
  status: "upcoming" | "active" | "completed" | "adjusted";
  projectedOutcomes: CheckpointOutcome[];
  actualCompletionRate: number;   // 0-1, filled in when completed
  userGoalWeights: GoalWeights;   // What goals were weighted at this checkpoint
  adjustment: {
    previousWeights: GoalWeights;
    newWeights: GoalWeights;
    reason: string;
    adjustedAt: string;           // ISO date
  } | null;
};

export type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: string;                   // "8-10" or "30 seconds"
  restSeconds: number;
  muscleTarget: string;
  formCue: string;                // One actionable sentence, never generic
  commonMistake: string;          // One sentence
  equipmentAlternatives: {
    home: string;
    travel: string;
  };
  adaptiveScaling: {
    ifRPEAbove8: string;          // e.g. "reduce reps by 2"
    ifRPEBelow6: string;          // e.g. "add 5% load"
  };
};

export type Day = {
  dayNumber: number;              // 1-7
  isRestDay: boolean;
  focus: string;                  // e.g. "Upper push" or "Active recovery"
  estimatedDurationMinutes: number;
  exercises: Exercise[];
  coachNote: string;              // 1-2 sentence, conversational
};

export type Week = {
  weekNumber: number;
  isDeloadWeek: boolean;
  theme: string;                  // e.g. "Volume building"
  days: Day[];
  locked: boolean;                // true once user completes this week
};

export type CheckpointPlan = {
  id: string;
  userId: string;
  createdAt: string;
  goal: string;
  durationWeeks: number;
  currentWeek: number;
  checkpoints: Checkpoint[];
  weeks: Week[];
};

/**
 * Generates an adaptive plan with checkpoints.
 * Periodization logic:
 * - Inserts checkpoints every 3 weeks.
 * - Inserts a deload week (50% volume) every 4th week automatically.
 * - Never removes mobility work even if mobility weight = 0.
 * - Distributes days based on goal weights.
 */
export function generatePlanFromGoals(
  userId: string,
  goal: string,
  durationWeeks: number,
  goalWeights: GoalWeights,
  equipment: string[],
  constraints: string[]
): CheckpointPlan {
  const weeks: Week[] = [];
  const checkpoints: Checkpoint[] = [];
  
  for (let w = 1; w <= durationWeeks; w++) {
    const isDeloadWeek = w % 4 === 0;
    
    // Determine days distribution based on goal weights
    // strength > 60: 4 strength days, 1 endurance, 1 mobility, 1 rest
    // endurance > 60: 2 strength, 3 endurance, 1 mobility, 1 rest
    // balanced: 3 strength, 2 endurance, 1 mobility, 1 rest
    let strengthDays = 3;
    let enduranceDays = 2;
    let mobilityDays = 1;
    
    if (goalWeights.strength > 60) {
      strengthDays = 4;
      enduranceDays = 1;
      mobilityDays = 1;
    } else if (goalWeights.endurance > 60) {
      strengthDays = 2;
      enduranceDays = 3;
      mobilityDays = 1;
    }
    
    // Mobility is non-negotiable
    if (mobilityDays === 0) mobilityDays = 1;
    
    const days: Day[] = [];
    for (let d = 1; d <= 7; d++) {
      let focus = "Rest";
      let isRestDay = true;
      
      if (d <= strengthDays) {
        focus = "Strength";
        isRestDay = false;
      } else if (d <= strengthDays + enduranceDays) {
        focus = "Endurance";
        isRestDay = false;
      } else if (d <= strengthDays + enduranceDays + mobilityDays) {
        focus = "Mobility";
        isRestDay = false;
      }
      
      days.push({
        dayNumber: d,
        isRestDay,
        focus,
        // Deload weeks reduce volume/duration
        estimatedDurationMinutes: isRestDay ? 0 : (isDeloadWeek ? 30 : 45),
        exercises: [], // In a full implementation, AI populates this
        coachNote: isDeloadWeek ? "Focus on form, movement quality, and recovery." : "Push the intensity and track your RPE."
      });
    }

    weeks.push({
      weekNumber: w,
      isDeloadWeek,
      theme: isDeloadWeek ? "Active Recovery & Adaptation" : "Volume & Intensity Building",
      days,
      locked: false
    });
    
    // Insert checkpoints every 3 weeks
    if (w % 3 === 0) {
      checkpoints.push({
        week: w,
        status: w === 3 ? "active" : "upcoming",
        projectedOutcomes: [
          { label: "Sustain consistent output without early fatigue", metric: "+10% capacity", category: "endurance" },
          { label: "Increase absolute load on primary lifts", metric: "+5% load", category: "strength" }
        ],
        actualCompletionRate: 0,
        userGoalWeights: { ...goalWeights },
        adjustment: null
      });
    }
  }

  return {
    id: "plan_" + Date.now(),
    userId,
    createdAt: new Date().toISOString(),
    goal,
    durationWeeks,
    currentWeek: 1,
    checkpoints,
    weeks
  };
}

/**
 * Adjusts the remainder of the plan based on a checkpoint review.
 * - Locks all weeks up to and including the checkpoint week.
 * - Regenerates future weeks with new goal weights.
 * - Preserves locked week data.
 */
export function adjustPlanFromCheckpoint(
  plan: CheckpointPlan,
  checkpointIndex: number,
  newGoalWeights: GoalWeights,
  reason: string
): CheckpointPlan {
  const updatedPlan = { ...plan };
  // Clone to avoid mutating original
  updatedPlan.checkpoints = [...plan.checkpoints];
  updatedPlan.weeks = [...plan.weeks];
  
  const checkpoint = { ...updatedPlan.checkpoints[checkpointIndex] };
  if (!checkpoint) return updatedPlan;
  
  // Record the adjustment
  checkpoint.adjustment = {
    previousWeights: checkpoint.userGoalWeights,
    newWeights: newGoalWeights,
    reason,
    adjustedAt: new Date().toISOString()
  };
  checkpoint.userGoalWeights = newGoalWeights;
  checkpoint.status = "adjusted";
  updatedPlan.checkpoints[checkpointIndex] = checkpoint;

  // Update weeks
  let strengthDays = 3;
  let enduranceDays = 2;
  let mobilityDays = 1;
  
  if (newGoalWeights.strength > 60) {
    strengthDays = 4;
    enduranceDays = 1;
    mobilityDays = 1;
  } else if (newGoalWeights.endurance > 60) {
    strengthDays = 2;
    enduranceDays = 3;
    mobilityDays = 1;
  }

  updatedPlan.weeks = updatedPlan.weeks.map(week => {
    // Lock all weeks up to and including the checkpoint week
    if (week.weekNumber <= checkpoint.week) {
      return { ...week, locked: true };
    }
    
    // Regenerate all weeks AFTER the checkpoint
    const newDays = week.days.map((day, idx) => {
      const d = idx + 1;
      let focus = "Rest";
      let isRestDay = true;
      
      if (d <= strengthDays) { focus = "Strength"; isRestDay = false; }
      else if (d <= strengthDays + enduranceDays) { focus = "Endurance"; isRestDay = false; }
      else if (d <= strengthDays + enduranceDays + mobilityDays) { focus = "Mobility"; isRestDay = false; }
      
      return { ...day, focus, isRestDay };
    });
    
    return { ...week, days: newDays };
  });

  return updatedPlan;
}

/**
 * Returns a summary of the next upcoming checkpoint for the dashboard or review screen.
 */
export function getNextCheckpointSummary(plan: CheckpointPlan): {
  daysUntilCheckpoint: number;
  projectedOutcomes: CheckpointOutcome[];
  currentCompletionRate: number;
  suggestedAdjustment: string | null;
} {
  const nextCheckpoint = plan.checkpoints.find(c => c.week >= plan.currentWeek);
  
  if (!nextCheckpoint) {
    return {
      daysUntilCheckpoint: 0,
      projectedOutcomes: [],
      currentCompletionRate: 1,
      suggestedAdjustment: null
    };
  }

  // Calculate days until checkpoint
  const weeksUntil = nextCheckpoint.week - plan.currentWeek;
  const daysUntilCheckpoint = Math.max(0, weeksUntil * 7);

  // In a real implementation, this would be calculated from db logs. Using a mock static value.
  const currentCompletionRate = nextCheckpoint.actualCompletionRate || 0.85; 

  let suggestedAdjustment = null;
  if (currentCompletionRate < 0.7) {
    suggestedAdjustment = "Your completion rate is a bit low. Consider shifting more weight to recovery/mobility for the next phase to build consistency.";
  }

  return {
    daysUntilCheckpoint,
    projectedOutcomes: nextCheckpoint.projectedOutcomes,
    currentCompletionRate,
    suggestedAdjustment
  };
}
