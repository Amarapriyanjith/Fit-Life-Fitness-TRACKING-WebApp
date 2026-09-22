import { doc, getDoc, setDoc, deleteDoc, collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

// Get today's local date string (YYYY-MM-DD)
export const getTodayKey = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localDate = new Date(now.getTime() - offset * 60000);
    return localDate.toISOString().slice(0, 10);
};

// Fetch today's calories and saved meals in parallel
export const fetchNutritionData = async (userUid, today) => {
    const calorieRef = doc(db, "users", userUid, "calorieTracking", today);
    const mealsRef = collection(db, "users", userUid, "nutritionPlans");

    const [calorieSnap, mealsSnap] = await Promise.all([
        getDoc(calorieRef),
        getDocs(mealsRef)
    ]);

    return { calorieSnap, mealsSnap };
};

// Save custom or tracked calories to Firebase
export const saveCaloriesToFirebase = async (userUid, today, newTotal) => {
    const calorieRef = doc(db, "users", userUid, "calorieTracking", today);
    await setDoc(calorieRef, {
        calories: newTotal,
        date: today,
        updatedAt: serverTimestamp()
    }, { merge: true });
};

// Add a specific meal to Firebase collection
export const addMealToFirebase = async (userUid, today, newTotalCalories, mealDataPayload) => {
    const calorieRef = doc(db, "users", userUid, "calorieTracking", today);

    const [docRef] = await Promise.all([
        addDoc(collection(db, "users", userUid, "nutritionPlans"), {
            ...mealDataPayload,
            addedAt: serverTimestamp()
        }),
        setDoc(calorieRef, {
            calories: newTotalCalories,
            date: today,
            updatedAt: serverTimestamp()
        }, { merge: true })
    ]);

    return docRef.id;
};

// Remove a meal from Firebase and update daily calories
export const removeMealFromFirebase = async (userUid, today, mealId, newTotalCalories) => {
    const calorieRef = doc(db, "users", userUid, "calorieTracking", today);

    await Promise.all([
        deleteDoc(doc(db, "users", userUid, "nutritionPlans", mealId)),
        setDoc(calorieRef, {
            calories: newTotalCalories,
            date: today,
            updatedAt: serverTimestamp()
        }, { merge: true })
    ]);
};