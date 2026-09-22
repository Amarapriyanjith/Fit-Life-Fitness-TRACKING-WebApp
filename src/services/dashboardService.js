import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

// Get today's local date string (YYYY-MM-DD)
export const getTodayKey = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localDate = new Date(now.getTime() - offset * 60000);
    return localDate.toISOString().slice(0, 10);
};

// Fetch all dashboard related data from Firebase in parallel
export const fetchDashboardData = async (userUid, today) => {
    const [userDoc, waterDoc, calorieDoc, bmiDoc, workoutSnapshot] = await Promise.all([
        getDoc(doc(db, "users", userUid)),
        getDoc(doc(db, "users", userUid, "waterIntake", today)),
        getDoc(doc(db, "users", userUid, "calorieTracking", today)),
        getDoc(doc(db, "users", userUid, "healthData", "bmi")),
        getDocs(collection(db, "users", userUid, "workoutPlans"))
    ]);

    return { userDoc, waterDoc, calorieDoc, bmiDoc, workoutSnapshot };
};

// Update water intake in Firebase
export const updateWaterInvoiced = async (userUid, today, newCount) => {
    const waterDocRef = doc(db, "users", userUid, "waterIntake", today);
    await setDoc(waterDocRef, {
        glasses: newCount,
        date: today,
        updatedAt: serverTimestamp()
    }, { merge: true });
};