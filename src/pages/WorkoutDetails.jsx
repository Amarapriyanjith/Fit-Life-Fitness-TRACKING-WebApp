import React, { useEffect, useState } from "react";

import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "firebase/firestore";

import {
    onAuthStateChanged
} from "firebase/auth";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import { auth, db } from "../firebase";


export default function WorkoutDetails() {

    const { workoutId } = useParams();

    const navigate = useNavigate();

        // Get today's date
    const getTodayKey = () => {

        const now = new Date();

        const offset =
            now.getTimezoneOffset();

        const localDate =
            new Date(
                now.getTime() -
                offset * 60000
            );

        return localDate
            .toISOString()
            .slice(0, 10);
    };


    const [workout, setWorkout] = useState(null);

    const [loading, setLoading] = useState(true);

    const [currentExercise, setCurrentExercise] =
        useState(0);

    const [completedExercises, setCompletedExercises] =
        useState([]);

    const [timeLeft, setTimeLeft] =
        useState(0);

    const [exerciseStarted, setExerciseStarted] =
        useState(false);

    const [timerRunning, setTimerRunning] =
        useState(false);

    const [message, setMessage] =
        useState("");


    // Load workout after Firebase authentication is ready
    useEffect(() => {

        const unsubscribe = onAuthStateChanged(
            auth,
            async (user) => {

                if (!user) {

                    navigate("/login");

                    return;
                }

                try {

                    const workoutRef = doc(
                        db,
                        "users",
                        user.uid,
                        "workoutPlans",
                        workoutId
                    );

                    const workoutSnapshot =
                        await getDoc(workoutRef);


                    if (!workoutSnapshot.exists()) {

                        setMessage(
                            "Workout not found."
                        );

                        setLoading(false);

                        return;
                    }


                    const data =
                        workoutSnapshot.data();


                    const exercises =
                        data.exercises || [];


                    const completed =
                        data.completedExercises || [];


                    setWorkout({
                        id: workoutSnapshot.id,
                        ...data
                    });


                    setCompletedExercises(
                        completed
                    );


                    // Find the first incomplete exercise
                    const firstIncomplete =
                        exercises.findIndex(
                            (exercise) =>
                                !completed.includes(
                                    exercise.id
                                )
                        );


                    if (firstIncomplete >= 0) {

                        setCurrentExercise(
                            firstIncomplete
                        );

                    } else {

                        setCurrentExercise(0);

                    }

                } catch (error) {

                    console.error(
                        "Error loading workout:",
                        error
                    );

                    setMessage(
                        "Could not load the workout."
                    );

                } finally {

                    setLoading(false);

                }

            }
        );


        // Clean up authentication listener
        return () => unsubscribe();

    }, [workoutId, navigate]);


    // Set timer when exercise changes
    useEffect(() => {

        if (!workout) {
            return;
        }


        const exercises =
            workout.exercises || [];


        const exercise =
            exercises[currentExercise];


        if (!exercise) {
            return;
        }


        setTimeLeft(
            exercise.duration * 60
        );


        setExerciseStarted(false);

        setTimerRunning(false);


    }, [currentExercise, workout]);


    // Run exercise timer
    useEffect(() => {

        if (!timerRunning) {
            return;
        }


        if (timeLeft <= 0) {

            setTimerRunning(false);

            return;
        }


        const timer =
            setInterval(() => {

                setTimeLeft(
                    (previousTime) =>
                        previousTime - 1
                );

            }, 1000);


        return () =>
            clearInterval(timer);


    }, [timerRunning, timeLeft]);


    // Format timer
    const formatTime = (seconds) => {

        const minutes =
            Math.floor(seconds / 60);


        const remainingSeconds =
            seconds % 60;


        return `${String(minutes).padStart(
            2,
            "0"
        )}:${String(remainingSeconds).padStart(
            2,
            "0"
        )}`;

    };


    // Start exercise timer
    const startExercise = () => {

        setExerciseStarted(true);

        setTimerRunning(true);

        setMessage("");

    };


    // Complete current exercise
    const completeExercise = async () => {

        const user = auth.currentUser;


        if (!user || !workout) {
            return;
        }


        // User must start the exercise first
        if (!exerciseStarted) {
            return;
        }


        // Timer must finish
        if (timeLeft > 0) {
            return;
        }


        const exercise =
            workout.exercises[currentExercise];


        if (!exercise) {
            return;
        }


        // Prevent duplicate completion
        if (
            completedExercises.includes(
                exercise.id
            )
        ) {
            return;
        }


        try {

            const updatedCompleted = [
                ...completedExercises,
                exercise.id
            ];


            const workoutRef = doc(
                db,
                "users",
                user.uid,
                "workoutPlans",
                workout.id
            );


            await setDoc(
                workoutRef,
                {
                    completedExercises:
                        updatedCompleted
                },
                {
                    merge: true
                }
            );


            setCompletedExercises(
                updatedCompleted
            );


            setTimerRunning(false);


            // Move to next exercise
            if (
                currentExercise <
                workout.exercises.length - 1
            ) {

                setCurrentExercise(
                    currentExercise + 1
                );

            }


            setMessage(
                "Exercise completed! Great job! 💪"
            );


        } catch (error) {

            console.error(
                "Error completing exercise:",
                error
            );


            setMessage(
                "Could not save exercise progress."
            );

        }

    };


    // Complete the full workout
    const completeWorkout = async () => {

        const user = auth.currentUser;


        if (!user || !workout) {
            return;
        }


        const totalExercises =
            workout.exercises?.length || 0;


        // Make sure every exercise is completed
        if (
            completedExercises.length <
            totalExercises
        ) {

            return;
        }


        // Confirmation before completing workout
        const confirmComplete =
            window.confirm(
                "Are you sure you completed today's workout?"
            );


        if (!confirmComplete) {
            return;
        }


        try {

            const workoutRef = doc(
                db,
                "users",
                user.uid,
                "workoutPlans",
                workout.id
            );


            await setDoc(
                workoutRef,
                {
                    completed: true,
                    completedAt:
                        serverTimestamp(),
                    completedDate:
                        getTodayKey()
                },
                {
                    merge: true
                }
            );


            setWorkout({
                ...workout,
                completed: true
            });


            setMessage(
                "Workout completed successfully! 🎉"
            );


        } catch (error) {

            console.error(
                "Error completing workout:",
                error
            );


            setMessage(
                "Could not complete the workout."
            );

        }

    };


    // Loading screen
    if (loading) {

        return (

            <main>

                <section className="section">

                    <div className="container">

                        <div className="dash-card workout-loading">

                            <div className="loading-spinner"></div>

                            <h3>
                                Loading workout...
                            </h3>

                            <p>
                                Please wait while we
                                load your exercises.
                            </p>

                        </div>

                    </div>

                </section>

            </main>

        );

    }


    // Workout not found
    if (!workout) {

        return (

            <main>

                <section className="section">

                    <div className="container">

                        <div className="dash-card workout-error">

                            <h3>
                                Workout not found
                            </h3>

                            <p>
                                {message}
                            </p>

                            <button
                                className="btn primary"
                                onClick={() =>
                                    navigate(
                                        "/workouts"
                                    )
                                }
                            >
                                Back to Workouts
                            </button>

                        </div>

                    </div>

                </section>

            </main>

        );

    }


    const exercises =
        workout.exercises || [];


    const totalExercises =
        exercises.length;


    const allExercisesCompleted =
        totalExercises > 0 &&
        completedExercises.length >=
            totalExercises;


    const exercise =
        exercises[currentExercise];


    // Workout already completed
    if (workout.completed) {

        return (

            <main>

                <section className="section">

                    <div className="container">

                        <div className="dash-card workout-completed">

                            <div className="completed-icon">
                                🎉
                            </div>

                            <h1>
                                Workout Completed!
                            </h1>

                            <p>
                                You completed all{" "}
                                {totalExercises} exercises
                                in this workout.
                            </p>

                            <button
                                className="btn primary"
                                onClick={() =>
                                    navigate(
                                        "/dashboard"
                                    )
                                }
                            >
                                Back to Dashboard
                            </button>

                        </div>

                    </div>

                </section>

            </main>

        );

    }


    // Workout has no exercises
    if (totalExercises === 0) {

        return (

            <main>

                <section className="section">

                    <div className="container">

                        <div className="dash-card workout-error">

                            <h2>
                                No exercises found
                            </h2>

                            <p>
                                This workout plan does
                                not contain any exercises.
                            </p>

                            <button
                                className="btn primary"
                                onClick={() =>
                                    navigate(
                                        "/workouts"
                                    )
                                }
                            >
                                Choose Another Workout
                            </button>

                        </div>

                    </div>

                </section>

            </main>

        );

    }


    return (

        <main>

            {/* Workout header */}

            <section className="page-hero">

                <div className="container">

                    <div className="eyebrow">
                        {workout.level}
                    </div>

                    <h1>
                        {workout.workoutName}
                    </h1>

                    <p>
                        {workout.description}
                    </p>

                </div>

            </section>


            {/* Workout details */}

            <section className="section">

                <div className="container">

                    <div className="workout-details-container">


                        {/* Workout progress */}

                        <div className="dash-card workout-progress-card">

                            <div className="card-title">

                                <h3>
                                    Workout Progress
                                </h3>

                                <span>
                                    {
                                        completedExercises.length
                                    }{" "}
                                    /{" "}
                                    {totalExercises}
                                </span>

                            </div>


                            <div className="workout-progress">

                                <div
                                    className="workout-progress-bar"
                                    style={{
                                        width: `${
                                            (completedExercises.length /
                                                totalExercises) *
                                            100
                                        }%`
                                    }}
                                ></div>

                            </div>

                        </div>


                        {/* Current exercise */}

                        {!allExercisesCompleted &&
                            exercise && (

                                <div className="dash-card current-exercise-card">

                                    <div className="exercise-number">

                                        EXERCISE{" "}
                                        {currentExercise +
                                            1}{" "}
                                        OF{" "}
                                        {totalExercises}

                                    </div>


                                    {/* Exercise demonstration */}
{/* Exercise demonstration */}
<div className="exercise-demo">
  {workout?.exercises?.[currentExercise]?.videoUrl ? (
    <video
      key={workout.exercises[currentExercise].videoUrl}
      src={workout.exercises[currentExercise].videoUrl}
      autoPlay
      loop
      muted
      playsInline
      controls
      style={{
        width: "100%",
        maxHeight: "300px",
        borderRadius: "12px",
        objectFit: "contain",
        display: "block"
      }}
    />
  ) : (
    <>
      <div className="exercise-demo-icon">
        🏃
      </div>
      <h3>Exercise Demonstration</h3>
      <p>Video coming soon</p>
    </>
  )}
</div>
                                     {/* Exercise demonstration */}

 
                                    <h2>
                                        {exercise.name}
                                    </h2>


                                    <p>
                                        Exercise duration:{" "}
                                        {
                                            exercise.duration
                                        }{" "}
                                        minutes
                                    </p>


                                    {/* Timer */}

                                    <div
                                        className={`exercise-timer ${
                                            timeLeft === 0 &&
                                            exerciseStarted
                                                ? "timer-finished"
                                                : ""
                                        }`}
                                    >
                                        {formatTime(
                                            timeLeft
                                        )}
                                    </div>


                                    {/* Start exercise */}

                                    {!exerciseStarted && (

                                        <button
                                            className="btn primary"
                                            onClick={
                                                startExercise
                                            }
                                        >
                                            ▶ Start Exercise
                                        </button>

                                    )}


                                    {/* Timer running */}

                                    {exerciseStarted &&
                                        timerRunning && (

                                            <div className="exercise-running">

                                                <p>
                                                    Exercise
                                                    in
                                                    progress...
                                                </p>

                                                <button
                                                    className="btn"
                                                    disabled
                                                >
                                                    Timer Running
                                                </button>

                                            </div>

                                        )}


                                    {/* Complete exercise */}

                                    {exerciseStarted &&
                                        !timerRunning &&
                                        timeLeft === 0 && (

                                            <button
                                                className="btn primary"
                                                onClick={
                                                    completeExercise
                                                }
                                            >
                                                ✓ Complete Exercise
                                            </button>

                                        )}


                                    {/* Message */}

                                    {message && (

                                        <p className="exercise-message">
                                            {message}
                                        </p>

                                    )}

                                </div>

                            )}


                        {/* All exercises completed */}

                        {allExercisesCompleted && (

                            <div className="dash-card all-exercises-completed">

                                <div className="completed-icon">
                                    🎉
                                </div>

                                <h2>
                                    All Exercises Completed!
                                </h2>

                                <p>
                                    You completed{" "}
                                    {totalExercises} /{" "}
                                    {totalExercises}{" "}
                                    exercises.
                                </p>

                                <button
                                    className="btn primary"
                                    onClick={
                                        completeWorkout
                                    }
                                >
                                    ✓ Complete Workout
                                </button>


                                {message && (

                                    <p className="exercise-message">
                                        {message}
                                    </p>

                                )}

                            </div>

                        )}


                        {/* Exercise list */}

                        <div className="dash-card exercise-list-card">

                            <div className="card-title">

                                <h3>
                                    Exercises
                                </h3>

                                <span>
                                    {totalExercises} total
                                </span>

                            </div>


                            {exercises.map(
                                (item, index) => {

                                    const isCompleted =
                                        completedExercises.includes(
                                            item.id
                                        );


                                    const isCurrent =
                                        index ===
                                        currentExercise;


                                    return (

                                        <div
                                            className="exercise-list-item"
                                            key={item.id}
                                        >

                                            <div className="exercise-list-left">

                                                <span
                                                    className={`exercise-list-number ${
                                                        isCompleted
                                                            ? "completed"
                                                            : isCurrent
                                                            ? "current"
                                                            : ""
                                                    }`}
                                                >
                                                    {isCompleted
                                                        ? "✓"
                                                        : index +
                                                          1}
                                                </span>


                                                <div>

                                                    <b>
                                                        {
                                                            item.name
                                                        }
                                                    </b>

                                                    <small>
                                                        {
                                                            item.duration
                                                        }{" "}
                                                        minutes
                                                    </small>

                                                </div>

                                            </div>


                                            <span
                                                className={`exercise-status ${
                                                    isCompleted
                                                        ? "completed"
                                                        : isCurrent
                                                        ? "current"
                                                        : ""
                                                }`}
                                            >
                                                {isCompleted
                                                    ? "Completed"
                                                    : isCurrent
                                                    ? "Current"
                                                    : "Upcoming"}
                                            </span>

                                        </div>

                                    );

                                }
                            )}

                        </div>


                        {/* Back button */}

                        <div className="workout-back">

                            <button
                                className="btn"
                                onClick={() =>
                                    navigate(
                                        "/workouts"
                                    )
                                }
                            >
                                ← Back to Workouts
                            </button>

                        </div>

                    </div>

                </div>

            </section>

        </main>

    );

}