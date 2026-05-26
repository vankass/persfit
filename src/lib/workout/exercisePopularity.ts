const POPULARITY_RANK: Record<string, number> = {
  // Chest
  Pushups: 100,
  "Barbell_Bench_Press_-_Medium_Grip": 98,
  Dumbbell_Bench_Press: 95,
  Incline_Dumbbell_Press: 90,
  Decline_Barbell_Bench_Press: 85,
  "Incline_Push-Up": 88,
  "Decline_Push-Up": 82,
  "Close-Grip_Barbell_Bench_Press": 80,
  Cable_Chest_Press: 72,

  // Back / lats
  Pullups: 100,
  "Chin-Up": 95,
  Bent_Over_Barbell_Row: 92,
  Barbell_Deadlift: 98,
  Romanian_Deadlift: 90,
  Sumo_Deadlift: 85,
  "Bent_Over_Two-Dumbbell_Row": 88,
  Inverted_Row: 85,
  "Close-Grip_Front_Lat_Pulldown": 88,
  "Full_Range-Of-Motion_Lat_Pulldown": 86,
  "Cable_Rope_Rear-Delt_Rows": 70,
  Face_Pull: 75,

  // Shoulders
  Barbell_Shoulder_Press: 95,
  Dumbbell_Shoulder_Press: 92,
  Arnold_Dumbbell_Press: 85,
  Push_Press: 80,
  Cable_Shoulder_Press: 75,
  Cable_Seated_Lateral_Raise: 70,

  // Legs
  Barbell_Squat: 100,
  Barbell_Full_Squat: 98,
  Bodyweight_Squat: 95,
  Goblet_Squat: 90,
  Dumbbell_Squat: 88,
  Front_Squat_Clean_Grip: 85,
  Box_Squat: 82,
  Hack_Squat: 80,
  Leg_Press: 88,
  Barbell_Lunge: 85,
  Bodyweight_Walking_Lunge: 88,
  Dumbbell_Lunges: 85,
  Barbell_Walking_Lunge: 82,
  Barbell_Step_Ups: 78,
  Good_Morning: 75,
  Overhead_Squat: 70,
  Glute_Ham_Raise: 72,
  Barbell_Glute_Bridge: 80,
  Barbell_Hip_Thrust: 85,
  Calf_Raise_On_A_Dumbbell: 70,
  Barbell_Seated_Calf_Raise: 72,

  // Arms
  Barbell_Curl: 90,
  "EZ-Bar_Curl": 85,
  Incline_Dumbbell_Curl: 82,
  Preacher_Curl: 80,
  Concentration_Curls: 75,
  "Close-Grip_EZ_Bar_Curl": 78,
  Triceps_Pushdown: 90,
  "EZ-Bar_Skullcrusher": 85,
  Bench_Dips: 75,
  "Dips_-_Triceps_Version": 78,
  Cable_Lying_Triceps_Extension: 72,

  // Core
  Plank: 100,
  Crunches: 95,
  "Sit-Up": 90,
  "3_4_Sit-Up": 85,
  Hanging_Leg_Raise: 88,
  Reverse_Crunch: 85,
  Russian_Twist: 82,
  Cable_Crunch: 80,
  Decline_Crunch: 78,
  Ab_Roller: 75,
  Mountain_Climbers: 85,
  "Cross-Body_Crunch": 70,
};

const POPULARITY_WEIGHT = 3;

export function getPopularityScore(exerciseId: string): number {
  return POPULARITY_RANK[exerciseId] ?? 0;
}

export function getPopularityBonus(exerciseId: string): number {
  return getPopularityScore(exerciseId) * POPULARITY_WEIGHT;
}
