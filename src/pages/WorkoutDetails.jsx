import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate, useParams } from "react-router-dom";
import { auth } from "../firebase";

// Import separated backend services and utility helpers
import { getTodayKey, fetchWorkoutDetailsFromFirebase, updateExerciseProgressInFirebase, completeFullWorkoutInFirebase } from "../services/workoutService";

export default function WorkoutDetails() {
    const { workoutId } = useParams();
    const navigate = useNavigate();

    const [workout, setWorkout] = useState(() => {
        const saved = localStorage.getItem(`fitlife_cache_workout_${workoutId}`);
        return saved ? JSON.parse(saved) : null;
    });

    const [loading, setLoading] = useState(() => !localStorage.getItem(`fitlife_cache_workout_${workoutId}`));
    const [currentExercise, setCurrentExercise] = useState(0);
    const [completedExercises, setCompletedExercises] = useState(() => {
        const saved = localStorage.getItem(`fitlife_cache_workout_${workoutId}`);
        if (saved) {
            const parsed = JSON.parse(saved);
            return parsed.completedExercises || [];
        }
        return [];
    });

    const [timeLeft, setTimeLeft] = useState(0);
    const [exerciseStarted, setExerciseStarted] = useState(false);
    const [timerRunning, setTimerRunning] = useState(false);
    const [message, setMessage] = useState("");

    // Load workout details and sync with Firestore in background
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                setLoading(false);
                navigate("/login");
                return;
            }

            try {
                const workoutSnapshot = await fetchWorkoutDetailsFromFirebase(user.uid, workoutId);

                if (!workoutSnapshot.exists()) {
                    setMessage("Workout not found.");
                    setLoading(false);
                    return;
                }

                const data = workoutSnapshot.data();
                const exercises = data.exercises || [];
                const completed = data.completedExercises || [];

                const fullWorkoutData = {
                    id: workoutSnapshot.id,
                    ...data
                };

                setWorkout(fullWorkoutData);
                setCompletedExercises(completed);

                localStorage.setItem(
                    `fitlife_cache_workout_${workoutId}`,
                    JSON.stringify(fullWorkoutData)
                );

                const firstIncomplete = exercises.findIndex(
                    (exercise) => !completed.includes(exercise.id)
                );

                setCurrentExercise(firstIncomplete >= 0 ? firstIncomplete : 0);

            } catch (error) {
                console.error("Error loading workout:", error);
                setMessage("Could not load the workout.");
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [workoutId, navigate]);

    // Set timer when exercise changes
    useEffect(() => {
        if (!workout) return;
        const exercises = workout.exercises || [];
        const exercise = exercises[currentExercise];
        if (!exercise) return;

        setTimeLeft(exercise.duration * 60);
        setExerciseStarted(false);
        setTimerRunning(false);
    }, [currentExercise, workout]);

    // Run exercise timer
    useEffect(() => {
        if (!timerRunning) return;
        if (timeLeft <= 0) {
            setTimerRunning(false);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((previousTime) => previousTime - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timerRunning, timeLeft]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
    };

    const startExercise = () => {
        setExerciseStarted(true);
        setTimerRunning(true);
        setMessage("");
    };

    const pauseExercise = () => setTimerRunning(false);
    const resumeExercise = () => setTimerRunning(true);

    const resetExercise = () => {
        const exercises = workout.exercises || [];
        const exercise = exercises[currentExercise];
        if (exercise) setTimeLeft(exercise.duration * 60);
        setTimerRunning(false);
        setExerciseStarted(false);
    };

    const completeExercise = async () => {
        const user = auth.currentUser;
        if (!user || !workout || !exerciseStarted || timeLeft > 0) return;

        const exercise = workout.exercises[currentExercise];
        if (!exercise || completedExercises.includes(exercise.id)) return;

        try {
            const updatedCompleted = [...completedExercises, exercise.id];
            setCompletedExercises(updatedCompleted);
            setTimerRunning(false);

            if (currentExercise < workout.exercises.length - 1) {
                setCurrentExercise(currentExercise + 1);
            }

            setMessage("Exercise completed! Great job! 💪");

            const updatedWorkoutCache = { ...workout, completedExercises: updatedCompleted };
            setWorkout(updatedWorkoutCache);
            localStorage.setItem(`fitlife_cache_workout_${workoutId}`, JSON.stringify(updatedWorkoutCache));

            await updateExerciseProgressInFirebase(user.uid, workout.id, updatedCompleted);

        } catch (error) {
            console.error("Error completing exercise:", error);
            setMessage("Could not save exercise progress.");
        }
    };

    const completeWorkout = async () => {
        const user = auth.currentUser;
        if (!user || !workout) return;

        const totalExercises = workout.exercises?.length || 0;
        if (completedExercises.length < totalExercises) return;

        try {
            const completedWorkoutState = { ...workout, completed: true };
            setWorkout(completedWorkoutState);
            localStorage.setItem(`fitlife_cache_workout_${workoutId}`, JSON.stringify(completedWorkoutState));
            setMessage("Workout completed successfully! 🎉");

            await completeFullWorkoutInFirebase(user.uid, workout.id, getTodayKey());

        } catch (error) {
            console.error("Error completing workout:", error);
            setMessage("Could not complete the workout.");
        }
    };

    if (loading && !workout) {
        return (
            <main>
                <section className="section">
                    <div className="container">
                        <div className="dash-card workout-loading">
                            <div className="loading-spinner"></div>
                            <h3>Loading workout...</h3>
                        </div>
                    </div>
                </section>
            </main>
        );
    }

    if (!workout) {
        return (
            <main>
                <section className="section">
                    <div className="container">
                        <div className="dash-card workout-error">
                            <h3>Workout not found</h3>
                            <p>{message}</p>
                            <button className="btn primary" onClick={() => navigate("/workouts")}>Back to Workouts</button>
                        </div>
                    </div>
                </section>
            </main>
        );
    }

    const exercises = workout.exercises || [];
    const totalExercises = exercises.length;
    const allExercisesCompleted = totalExercises > 0 && completedExercises.length >= totalExercises;
    const exercise = exercises[currentExercise];

    if (workout.completed) {
        return (
            <main>
                <section className="section">
                    <div className="container">
                        <div className="dash-card workout-completed">
                            <div className="completed-icon">🎉</div>
                            <h1>Workout Completed!</h1>
                            <p>You completed all {totalExercises} exercises in this workout.</p>
                            <button className="btn primary" onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
                        </div>
                    </div>
                </section>
            </main>
        );
    }

    return (
        <main>
            <section className="page-hero">
                <div className="container">
                    <div className="eyebrow">{workout.level}</div>
                    <h1>{workout.workoutName}</h1>
                    <p>{workout.description}</p>
                </div>
            </section>

            <section className="section">
                <div className="container">
                    <div className="workout-details-container">
                        <div className="dash-card workout-progress-card">
                            <div className="card-title">
                                <h3>Workout Progress</h3>
                                <span>{completedExercises.length} / {totalExercises}</span>
                            </div>
                            <div className="workout-progress">
                                <div className="workout-progress-bar" style={{ width: `${(completedExercises.length / totalExercises) * 100}%` }}></div>
                            </div>
                        </div>

                        {!allExercisesCompleted && exercise && (
                            <div className="dash-card current-exercise-card">
                                <div className="exercise-number">EXERCISE {currentExercise + 1} OF {totalExercises}</div>
                                <div className="exercise-demo">
                                    {exercise?.videoUrl ? (
                                        <video key={exercise.videoUrl} src={exercise.videoUrl} autoPlay loop muted playsInline controls style={{ width: "100%", maxHeight: "300px", borderRadius: "12px", objectFit: "contain" }} />
                                    ) : (
                                        <>
                                            <div className="exercise-demo-icon">🏃</div>
                                            <h3>Exercise Demonstration</h3>
                                            <p>Video coming soon</p>
                                        </>
                                    )}
                                </div>

                                <h2>{exercise.name}</h2>
                                <p>Exercise duration: {exercise.duration} minutes</p>

                                <div className={`exercise-timer ${timeLeft === 0 && exerciseStarted ? "timer-finished" : ""}`}>
                                    {formatTime(timeLeft)}
                                </div>

                                {!exerciseStarted && (
                                    <button className="btn primary" onClick={startExercise}>▶ Start Exercise</button>
                                )}

                                {exerciseStarted && (
                                    <div className="exercise-running" style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "15px" }}>
                                        {timerRunning ? (
                                            <button className="btn secondary" onClick={pauseExercise}>⏸ Pause</button>
                                        ) : (
                                            <button className="btn primary" onClick={resumeExercise} disabled={timeLeft === 0}>▶ Resume</button>
                                        )}
                                        <button className="btn" onClick={resetExercise} style={{ background: "#fee2e2", color: "#991b1b", border: "none" }}>🔄 Reset Timer</button>
                                    </div>
                                )}

                                {exerciseStarted && !timerRunning && timeLeft === 0 && (
                                    <button className="btn primary" onClick={completeExercise} style={{ marginTop: "15px" }}>✓ Complete Exercise</button>
                                )}

                                {message && <p className="exercise-message">{message}</p>}
                            </div>
                        )}

                        {allExercisesCompleted && (
                            <div className="dash-card all-exercises-completed">
                                <div className="completed-icon">🎉</div>
                                <h2>All Exercises Completed!</h2>
                                <p>You completed {totalExercises} / {totalExercises} exercises.</p>
                                <button className="btn primary" onClick={completeWorkout}>✓ Complete Workout</button>
                                {message && <p className="exercise-message">{message}</p>}
                            </div>
                        )}

                        <div className="workout-back">
                            <button className="btn" onClick={() => navigate("/workouts")}>← Back to Workouts</button>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}