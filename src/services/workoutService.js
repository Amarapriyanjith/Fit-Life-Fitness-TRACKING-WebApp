import { doc, getDoc, setDoc, addDoc, collection, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

// Get today's local date string (YYYY-MM-DD)
export const getTodayKey = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localDate = new Date(now.getTime() - offset * 60000);
    return localDate.toISOString().slice(0, 10);
};

// Fetch specific workout plan details from Firebase
export const fetchWorkoutDetailsFromFirebase = async (userUid, workoutId) => {
    const workoutRef = doc(db, "users", userUid, "workoutPlans", workoutId);
    const workoutSnapshot = await getDoc(workoutRef);
    return workoutSnapshot;
};

// Update completed exercises progress in Firebase
export const updateExerciseProgressInFirebase = async (userUid, workoutId, updatedCompletedExercises) => {
    const workoutRef = doc(db, "users", userUid, "workoutPlans", workoutId);
    await setDoc(workoutRef, {
        completedExercises: updatedCompletedExercises
    }, { merge: true });
};

// Mark the full workout as completed in Firebase
export const completeFullWorkoutInFirebase = async (userUid, workoutId, todayKey) => {
    const workoutRef = doc(db, "users", userUid, "workoutPlans", workoutId);
    await setDoc(workoutRef, {
        completed: true,
        completedAt: serverTimestamp(),
        completedDate: todayKey
    }, { merge: true });
};

// Check and handle active workout creation or resumption from Workouts list
export const handleWorkoutSelection = async (userUid, item, level, today) => {
    const workoutSnapshot = await getDocs(
        collection(db, "users", userUid, "workoutPlans")
    );

    let existingWorkoutId = null;

    workoutSnapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.workoutName === item.title && data.lastActiveDate === today && !data.completed) {
            existingWorkoutId = docSnap.id;
        }
    });

    if (existingWorkoutId) {
        return existingWorkoutId;
    }

    const workoutPayload = {
        workoutName: item.title,
        level: level,
        duration: item.tag,
        description: item.desc,
        exercises: item.exercises,
        completedExercises: [],
        completed: false,
        lastActiveDate: today,
        addedAt: serverTimestamp()
    };

    const workoutRef = await addDoc(
        collection(db, "users", userUid, "workoutPlans"),
        workoutPayload
    );

    return workoutRef.id;
};