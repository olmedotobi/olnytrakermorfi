export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "veryActive";

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

export function calculateBMR(weight: number, height: number, age: number, gender: string): number {
  if (gender === "male") {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  }
  return 10 * weight + 6.25 * height - 5 * age - 161;
}

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

export function calculateMacros(calories: number) {
  return {
    protein: Math.round((calories * 0.25) / 4),
    carbs: Math.round((calories * 0.45) / 4),
    fat: Math.round((calories * 0.3) / 9),
  };
}

export function getCaloriesFromGrams(caloriesPer100g: number, grams: number): number {
  return Math.round((caloriesPer100g * grams) / 100);
}

export function adjustedCalorieGoal(tdee: number, currentWeight: number, targetWeight: number): number {
  const diff = currentWeight - targetWeight;
  const adjustment = Math.min(Math.abs(diff) * 50, 500) * Math.sign(diff);
  return Math.round(tdee - adjustment);
}

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: "Sedentario (sin ejercicio)",
  light: "Ligero (1-3 días/semana)",
  moderate: "Moderado (3-5 días/semana)",
  active: "Activo (6-7 días/semana)",
  veryActive: "Muy activo (2 veces/día)",
};
