// Calculate comprehensive daily wellness score percentage
export const calculateWellnessScore = (water, calories, bmi, workoutDone) => {
    const waterScore = (water / 8) * 30;
    const calorieScore = Math.min(calories / 600, 1) * 30;
    const bmiScore = bmi ? 20 : 0;
    const workoutScore = workoutDone ? 20 : 0;
    return Math.round(waterScore + calorieScore + bmiScore + workoutScore);
};

// Generate smart data analysis insight based on user habits
export const generateSmartInsight = (water, calories, workoutDone) => {
    if (water >= 6 && calories >= 400 && workoutDone) {
        return "✨ Optimal balance! Your hydration and nutrition align perfectly with your completed workout.";
    } else if (water < 4 && workoutDone) {
        return "💡 Tip: You completed your workout, but hydration is low. Drink more water to aid muscle recovery.";
    } else if (calories >= 500 && !workoutDone) {
        return "🔥 Tip: High calorie intake logged today. Complete your active workout to utilize your energy efficiently.";
    }
    return "🌱 Keep maintaining a steady routine across water, nutrition, and daily movement.";
};