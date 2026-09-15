import React, { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import { Link } from "react-router-dom";

// Predefined workout data categorized by fitness levels (Beginner, Intermediate, Advanced)
const workoutData = {
    beginner: [
        {
            icon: "🧘",
            title: "Full Body Mobility",
            desc: "Gentle stretches to wake up joints and improve posture.",
            tag: "15 MINS"
        },
        {
            icon: "🚶",
            title: "Low-Impact Walking Cardio",
            desc: "Step-based routine designed to get your heart rate up safely.",
            tag: "20 MINS"
        },
        {
            icon: "🛋️",
            title: "Chair & Wall Strength",
            desc: "Build foundational strength using supportive furniture.",
            tag: "15 MINS"
        }
    ],

    intermediate: [
        {
            icon: "⚡",
            title: "Dynamic Core Sculpt",
            desc: "Strengthen your abdominal muscles with controlled movements.",
            tag: "25 MINS"
        },
        {
            icon: "🏋️",
            title: "Dumbbell Basics",
            desc: "Introduction to weighted exercises for muscle tone.",
            tag: "30 MINS"
        },
        {
            icon: "🏃",
            title: "Interval Jog & Walk",
            desc: "Alternating paces to boost endurance and stamina.",
            tag: "30 MINS"
        }
    ],

    advanced: [
        {
            icon: "🔥",
            title: "High Intensity HIIT",
            desc: "Push your limits with fast-paced explosive bodyweight moves.",
            tag: "40 MINS"
        },
        {
            icon: "💪",
            title: "Advanced Power Circuit",
            desc: "Challenging compound lifts and explosive strength drills.",
            tag: "45 MINS"
        },
        {
            icon: "🚴",
            title: "Endurance Cardio Blast",
            desc: "Maximum effort endurance training for peak conditioning.",
            tag: "50 MINS"
        }
    ]
};

export default function Workouts() {
    // State to track the currently selected fitness level tab ("beginner" by default)
    const [level, setLevel] = useState("beginner");
    
    // State to handle feedback messages shown to the user (success/error alerts)
    const [message, setMessage] = useState("");

    // State to keep track of which specific workout card is currently saving/loading
    const [savingTitle, setSavingTitle] = useState(null);

    // Function to handle saving a selected workout directly to the logged-in user's Firebase Firestore plan
    const handleAddToPlan = async (item) => {
        const user = auth.currentUser;

        // Guard clause: Make sure the user is authenticated before writing to the database
        if (!user) {
            setMessage("Please log in to add a workout to your plan.");
            return;
        }

        // Set the active loading state for this specific card and clear old messages
        setSavingTitle(item.title); 
        setMessage("");

        try {
            // Push the workout details into the user's personal sub-collection in Firestore
            await addDoc(
                collection(db, "users", user.uid, "workoutPlans"),
                {
                    workoutName: item.title,
                    level: level,
                    duration: item.tag,
                    description: item.desc,
                    addedAt: serverTimestamp() // Automatically capture server time
                }
            );

            // Notify the user of success
            setMessage(`${item.title} added to your plan successfully!`);
        } catch (error) {
            console.error("Error adding workout:", error);
            setMessage("Workout could not be added. Please try again.");
        }

        // Reset the loading state back to normal once the async operation finishes
        setSavingTitle(null);
    };

    return (
        <div>
            <main>
                {/* Hero Header Section */}
                <section className="page-hero">
                    <div className="container">
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
                        <p>
                            Start small, learn the movements,
                            and build consistency. Select a
                            fitness level to explore a sample plan.
                        </p>
                    </div>
                </section>

                {/* Workout Selection & Cards Section */}
                <section className="section">
                    <div className="container">
                        
                        {/* Tab Switchers for Fitness Levels */}
                        <div className="tabs">
                            <button
                                className={`tab ${
                                    level === "beginner" ? "active" : ""
                                }`}
                                onClick={() => setLevel("beginner")}
                            >
                                Beginner
                            </button>

                            <button
                                className={`tab ${
                                    level === "intermediate" ? "active" : ""
                                }`}
                                onClick={() => setLevel("intermediate")}
                            >
                                Intermediate
                            </button>

                            <button
                                className={`tab ${
                                    level === "advanced" ? "active" : ""
                                }`}
                                onClick={() => setLevel("advanced")}
                            >
                                Advanced
                            </button>
                        </div>

                        {/* Conditional Alert Message Banner */}
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

                        {/* Dynamic Grid Rendering Workouts Based on Current Tab */}
                        <div
                            className="workout-grid"
                            id="workoutGrid"
                        >
                            {workoutData[level].map((item, index) => (
                                <div
                                    className="workout"
                                    key={index}
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        height: "100%"
                                    }}
                                >
                                    <div className="w-icon">
                                        {item.icon}
                                    </div>

                                    <h3>
                                        {item.title}
                                    </h3>

                                    
                                    <p style={{ flexGrow: 1 }}>
                                        {item.desc}
                                    </p>

                                    <span className="tag">
                                        {item.tag}
                                    </span>

                                    {/* Add to Plan Action Button */}
                                    <button
                                        className="btn primary"
                                        onClick={() => handleAddToPlan(item)}
                                        disabled={savingTitle === item.title} 
                                        style={{
                                            marginTop: "15px",
                                            width: "100%"
                                        }}
                                    >
                                        {savingTitle === item.title
                                            ? "Saving..."
                                            : "Add to plan →"}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Bottom Call to Action Section */}
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

            {/* Site Footer */}
            <footer>
                <div className="container footer">
                    <div className="brand">
                        <span className="brand-mark">
                            F
                        </span>
                        <span>
                            Fit<span>Life</span>
                        </span>
                    </div>

                    <p>
                        Smart personalized fitness for beginners.
                    </p>

                    <small>
                        © 2026 FitLife Project
                    </small>
                </div>
            </footer>
        </div>
    );
}