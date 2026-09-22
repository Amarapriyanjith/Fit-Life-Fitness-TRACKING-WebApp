import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

// Get today's local date string (YYYY-MM-DD)
export const getTodayKey = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localDate = new Date(now.getTime() - offset * 60000);
    return localDate.toISOString().slice(0, 10);
};

// Fetch all tracking related data from Firebase
export const fetchTrackingDataFromFirebase = async (userUid) => {
    const [waterSnapshot, calorieSnapshot, workoutSnapshot] = await Promise.all([
        getDocs(collection(db, "users", userUid, "waterIntake")),
        getDocs(collection(db, "users", userUid, "calorieTracking")),
        getDocs(collection(db, "users", userUid, "workoutPlans"))
    ]);

    return { waterSnapshot, calorieSnapshot, workoutSnapshot };
};

// Save updated calories to Firebase
export const saveCaloriesToFirebase = async (userUid, today, newCalories) => {
    const calorieDocRef = doc(db, "users", userUid, "calorieTracking", today);
    await setDoc(calorieDocRef, {
        calories: newCalories,
        date: today,
        updatedAt: serverTimestamp()
    }, { merge: true });
};

// Save BMI data to Firebase
export const saveBmiDataToFirebase = async (userUid, bmiPayload) => {
    const bmiDocRef = doc(db, "users", userUid, "healthData", "bmi");
    await setDoc(bmiDocRef, {
        ...bmiPayload,
        updatedAt: serverTimestamp()
    }, { merge: true });
};