import React, { useState } from "react";
import {
    addDoc,
    collection,
    getDocs,
    serverTimestamp
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { Link, useNavigate } from "react-router-dom";

import workoutBg from "../assets/images/warm-up-sets.jpg";

// Workout data categorized by fitness level
const workoutData = {

    // Beginner workouts
    beginner: [

        {
            icon: "🏃",
            title: "Full Body Starter",
            desc: "A simple full-body workout designed for beginners.",
            tag: "30 MINS",
            exercises: [
                {
                    id: "fbs-1",
                    name: "Shoulder Circles",
                    duration: 0.05,
                    videoUrl: "/videos/shoulder-circles.mp4"
                },
                {
                    id: "fbs-2",
                    name: "Torso Rotations",
                    duration: 0.05,
                    videoUrl: "/videos/torso-rotations.mp4"
                },
                {
                    id: "fbs-3",
                    name: "Leg Swings",
                    duration: 0.05,
                    videoUrl: "/videos/leg-swings.mp4"
                },
                {
                    id: "fbs-4",
                    name: "Bodyweight Squats",
                    duration: 0.05,
                    videoUrl: "/videos/squats.mp4"
                },
                {
                    id: "fbs-5",
                    name: "Cat-Cow Stretch",
                    duration: 0.05,
                    videoUrl: "/videos/cat-cow.mp4"
                },
                {
                    id: "fbs-6",
                    name: "World's Greatest Stretch",
                    duration: 0.05,
                    videoUrl: "/videos/greatest-stretch.mp4"
                }
            ]
        },

        {
            icon: "🧘",
            title: "Mobility & Stretch",
            desc: "Gentle movements and stretches to improve flexibility and mobility.",
            tag: "30 MINS",
            exercises: [
                {
                    id: "mas-1",
                    name: "Neck Stretch",
                    duration: 5
                },
                {
                    id: "mas-2",
                    name: "Shoulder Rolls",
                    duration: 5
                },
                {
                    id: "mas-3",
                    name: "Arm Circles",
                    duration: 5
                },
                {
                    id: "mas-4",
                    name: "Torso Rotation",
                    duration: 5
                },
                {
                    id: "mas-5",
                    name: "Hip Circles",
                    duration: 5
                },
                {
                    id: "mas-6",
                    name: "Hamstring Stretch",
                    duration: 5
                }
            ]
        },

        {
            icon: "💪",
            title: "Beginner Strength",
            desc: "Build basic strength using simple bodyweight exercises.",
            tag: "30 MINS",
            exercises: [
                {
                    id: "bgs-1",
                    name: "Bodyweight Squats",
                    duration: 5
                },
                {
                    id: "bgs-2",
                    name: "Wall Push-Ups",
                    duration: 5
                },
                {
                    id: "bgs-3",
                    name: "Glute Bridges",
                    duration: 5
                },
                {
                    id: "bgs-4",
                    name: "Chair Squats",
                    duration: 5
                },
                {
                    id: "bgs-5",
                    name: "Bird Dog",
                    duration: 5
                },
                {
                    id: "bgs-6",
                    name: "Standing Calf Raises",
                    duration: 5
                }
            ]
        }
    ],

    // Intermediate workouts
    intermediate: [

        {
            icon: "🔥",
            title: "Full Body Burn",
            desc: "A balanced workout combining strength and cardio movements.",
            tag: "30 MINS",
            exercises: [
                {
                    id: "fbb-1",
                    name: "Jumping Jacks",
                    duration: 5
                },
                {
                    id: "fbb-2",
                    name: "Bodyweight Squats",
                    duration: 5
                },
                {
                    id: "fbb-3",
                    name: "Push-Ups",
                    duration: 5
                },
                {
                    id: "fbb-4",
                    name: "Reverse Lunges",
                    duration: 5
                },
                {
                    id: "fbb-5",
                    name: "Mountain Climbers",
                    duration: 5
                },
                {
                    id: "fbb-6",
                    name: "Plank",
                    duration: 5
                }
            ]
        },

        {
            icon: "💪",
            title: "Upper Body Focus",
            desc: "Strengthen your chest, shoulders, arms and upper back.",
            tag: "30 MINS",
            exercises: [
                {
                    id: "ubf-1",
                    name: "Push-Ups",
                    duration: 5
                },
                {
                    id: "ubf-2",
                    name: "Shoulder Taps",
                    duration: 5
                },
                {
                    id: "ubf-3",
                    name: "Tricep Dips",
                    duration: 5
                },
                {
                    id: "ubf-4",
                    name: "Plank",
                    duration: 5
                },
                {
                    id: "ubf-5",
                    name: "Pike Push-Ups",
                    duration: 5
                },
                {
                    id: "ubf-6",
                    name: "Superman",
                    duration: 5
                }
            ]
        },

        {
            icon: "🏋️",
            title: "Lower Body Power",
            desc: "Develop strength and power in your legs and lower body.",
            tag: "30 MINS",
            exercises: [
                {
                    id: "lbp-1",
                    name: "Squats",
                    duration: 5
                },
                {
                    id: "lbp-2",
                    name: "Reverse Lunges",
                    duration: 5
                },
                {
                    id: "lbp-3",
                    name: "Glute Bridges",
                    duration: 5
                },
                {
                    id: "lbp-4",
                    name: "Jump Squats",
                    duration: 5
                },
                {
                    id: "lbp-5",
                    name: "Calf Raises",
                    duration: 5
                },
                {
                    id: "lbp-6",
                    name: "Wall Sit",
                    duration: 5
                }
            ]
        }
    ],

    // Advanced workouts
    advanced: [

        {
            icon: "🔥",
            title: "HIIT Challenge",
            desc: "A high-intensity workout combining explosive cardio movements.",
            tag: "30 MINS",
            exercises: [
                {
                    id: "hic-1",
                    name: "Burpees",
                    duration: 5
                },
                {
                    id: "hic-2",
                    name: "Jump Squats",
                    duration: 5
                },
                {
                    id: "hic-3",
                    name: "Mountain Climbers",
                    duration: 5
                },
                {
                    id: "hic-4",
                    name: "High Knees",
                    duration: 5
                },
                {
                    id: "hic-5",
                    name: "Plank Jacks",
                    duration: 5
                },
                {
                    id: "hic-6",
                    name: "Skater Jumps",
                    duration: 5
                }
            ]
        },

        {
            icon: "🏋️",
            title: "Strength Circuit",
            desc: "A challenging circuit focused on full-body strength development.",
            tag: "30 MINS",
            exercises: [
                {
                    id: "sc-1",
                    name: "Goblet Squats",
                    duration: 5
                },
                {
                    id: "sc-2",
                    name: "Push-Ups",
                    duration: 5
                },
                {
                    id: "sc-3",
                    name: "Dumbbell Rows",
                    duration: 5
                },
                {
                    id: "sc-4",
                    name: "Walking Lunges",
                    duration: 5
                },
                {
                    id: "sc-5",
                    name: "Shoulder Press",
                    duration: 5
                },
                {
                    id: "sc-6",
                    name: "Plank to Push-Up",
                    duration: 5
                }
            ]
        },

        {
            icon: "⚡",
            title: "Athletic Conditioning",
            desc: "Advanced movements designed to improve endurance, speed and conditioning.",
            tag: "30 MINS",
            exercises: [
                {
                    id: "ac-1",
                    name: "Sprint in Place",
                    duration: 5
                },
                {
                    id: "ac-2",
                    name: "Box Jumps",
                    duration: 5
                },
                {
                    id: "ac-3",
                    name: "Burpees",
                    duration: 5
                },
                {
                    id: "ac-4",
                    name: "Lateral Bounds",
                    duration: 5
                },
                {
                    id: "ac-5",
                    name: "Mountain Climbers",
                    duration: 5
                },
                {
                    id: "ac-6",
                    name: "High Knees",
                    duration: 5
                }
            ]
        }
    ]
};

// Workouts page component
export default function Workouts() {

    const [level, setLevel] = useState("beginner");
    const [message, setMessage] = useState("");
    const [savingWorkout, setSavingWorkout] = useState(null);

    const navigate = useNavigate();

    // Helper to get today's local date string (YYYY-MM-DD)
    const getTodayKey = () => {
        const now = new Date();
        const offset = now.getTimezoneOffset();
        const localDate = new Date(now.getTime() - offset * 60000);
        return localDate.toISOString().slice(0, 10);
    };

    // Add selected workout or resume active one without duplicating
    const handleAddWorkout = async (item) => {
        const user = auth.currentUser;

        if (!user) {
            setMessage("Please log in to add a workout.");
            return;
        }

        try {
            setSavingWorkout(item.title);
            setMessage("");

            const today = getTodayKey();

            // Check if the user already has an active workout for today in Firestore
            const workoutSnapshot = await getDocs(
                collection(db, "users", user.uid, "workoutPlans")
            );

            let existingWorkoutId = null;

            workoutSnapshot.docs.forEach((docSnap) => {
                const data = docSnap.data();
                // If the same workout exists, was active today, and is not yet completed, resume it
                if (data.workoutName === item.title && data.lastActiveDate === today && !data.completed) {
                    existingWorkoutId = docSnap.id;
                }
            });

            // If an active workout for today already exists, navigate directly to it instead of creating a new one
            if (existingWorkoutId) {
                navigate(`/workouts/${existingWorkoutId}`);
                return;
            }

            // Otherwise, create a new workout plan payload
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

            // Save new workout plan to Firestore
            const workoutRef = await addDoc(
                collection(
                    db,
                    "users",
                    user.uid,
                    "workoutPlans"
                ),
                workoutPayload
            );

            // Cache the active workout locally with today's date key for instant retrieval
            const cacheKey = `fitlife_cache_workout_${workoutRef.id}_${today}`;
            localStorage.setItem(cacheKey, JSON.stringify({
                id: workoutRef.id,
                ...workoutPayload,
                addedAt: new Date().toISOString()
            }));

            // Navigate directly to workout details page
            navigate(`/workouts/${workoutRef.id}`);

        } catch (error) {
            console.error("Error adding workout:", error);
            setMessage("Workout could not be added. Please try again.");
            setSavingWorkout(null);
        }
    };

    return (
        <div>
            <main>

                {/* Hero section with Right Background Image and Left Fade */}
                <section 
                    className="page-hero"
                    style={{
                        position: "relative",
                        overflow: "hidden",
                        minHeight: "260px",
                        display: "flex",
                        alignItems: "center"
                    }}
                >
                    {/* Background shaded image */}
                    <div 
                        style={{
                            position: "absolute",
                            top: 0,
                            right: 0,
                            width: "55%",
                            height: "100%",
                            backgroundImage: `url(${workoutBg})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            WebkitMaskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,1) 100%)",
                            maskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,1) 100%)",
                            pointerEvents: "none",
                            zIndex: 1
                        }} 
                    />

                    <div className="container" style={{ position: "relative", zIndex: 2 }}>

                        <div className="eyebrow">
                            MOVE WITH CONFIDENCE
                        </div>

                        <h1>
                            Workouts that meet
                            <br />
                            <span>
                                you where you are.
                            </span>
                        </h1>

                        <p style={{ maxWidth: "560px" }}>
                            Start small, learn the movements,
                            and build consistency. Select a
                            fitness level to explore a workout plan.
                        </p>

                    </div>
                </section>

                {/* Workout section */}
                <section className="section">
                    <div className="container">

                        {/* Level tabs */}
                        <div className="tabs">
                            <button
                                className={`tab ${
                                    level === "beginner"
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() => setLevel("beginner")}
                            >
                                Beginner
                            </button>

                            <button
                                className={`tab ${
                                    level === "intermediate"
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() => setLevel("intermediate")}
                            >
                                Intermediate
                            </button>

                            <button
                                className={`tab ${
                                    level === "advanced"
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() => setLevel("advanced")}
                            >
                                Advanced
                            </button>
                        </div>

                        {/* Message notification */}
                        {message && (
                            <div
                                style={{
                                    marginBottom: "20px",
                                    padding: "12px 16px",
                                    borderRadius: "8px",
                                    background: "#f0fdf4",
                                    color: "#166534",
                                    fontWeight: "600"
                                }}
                            >
                                {message}
                            </div>
                        )}

                        {/* Workout cards */}
                        <div
                            className="workout-grid"
                            id="workoutGrid"
                        >
                            {workoutData[level].map((item, index) => (
                                <div
                                    className="workout"
                                    key={index}
                                >
                                    <div className="w-icon">
                                        {item.icon}
                                    </div>

                                    <h3>
                                        {item.title}
                                    </h3>

                                    <p>
                                        {item.desc}
                                    </p>

                                    <span className="tag">
                                        {item.tag}
                                    </span>

                                    <small
                                        style={{
                                            display: "block",
                                            marginTop: "10px",
                                            color: "var(--muted)"
                                        }}
                                    >
                                        {item.exercises.length} exercises
                                    </small>

                                    <button
                                        className="btn primary"
                                        onClick={() => handleAddWorkout(item)}
                                        disabled={savingWorkout === item.title}
                                        style={{
                                            marginTop: "15px",
                                            width: "100%"
                                        }}
                                    >
                                        {savingWorkout === item.title
                                            ? "Opening..."
                                            : "View Workout →"}
                                    </button>
                                </div>
                            ))}
                        </div>

                    </div>
                </section>

                {/* Bottom call-to-action section */}
                <section className="dark-section">
                    <div className="container cta-center">

                        <div className="eyebrow">
                            READY?
                        </div>

                        <h2>
                            Your first workout can start{" "}
                            <span>
                                today.
                            </span>
                        </h2>

                        <Link
                            className="btn light"
                            to="/dashboard"
                        >
                            Open My Dashboard →
                        </Link>

                    </div>
                </section>

            </main>
        </div>
    );
}