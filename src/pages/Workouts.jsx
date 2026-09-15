import React, { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import { Link } from "react-router-dom";

// Predefined workout data categorized by fitness levels matching your design screenshots
const workoutData = {
    beginner: [
        {
            icon: "🚶‍♂️",
            title: "Full Body Starter",
            desc: "20 min • 6 exercises",
            tag: "Easy"
        },
        {
            icon: "🧘",
            title: "Mobility & Stretch",
            desc: "15 min • 5 exercises",
            tag: "Recovery"
        },
        {
            icon: "🏋️‍♂️",
            title: "Beginner Strength",
            desc: "25 min • 7 exercises",
            tag: "Low impact"
        }
    ],

    intermediate: [
        {
            icon: "🏃‍♂️",
            title: "Full Body Burn",
            desc: "35 min • 8 exercises",
            tag: "Moderate"
        },
        {
            icon: "💪",
            title: "Upper Body Focus",
            desc: "30 min • 7 exercises",
            tag: "Strength"
        },
        {
            icon: "🦵",
            title: "Lower Body Power",
            desc: "32 min • 8 exercises",
            tag: "Strength"
        }
    ],

    advanced: [
        {
            icon: "🔥",
            title: "HIIT Challenge",
            desc: "40 min • 10 exercises",
            tag: "High intensity"
        },
        {
            icon: "⚡",
            title: "Strength Circuit",
            desc: "45 min • 9 exercises",
            tag: "Advanced"
        },
        {
            icon: "🏆",
            title: "Athletic Conditioning",
            desc: "50 min • 12 exercises",
            tag: "Expert"
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
                    duration: item.desc,
                    tag: item.tag,
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
                                        height: "100%",
                                        position: "relative"
                                    }}
                                >
                                    {/* Top row containing Icon and Small Tag (like Easy, Moderate, High intensity) */}
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "15px" }}>
                                        <div className="w-icon" style={{ fontSize: "28px", margin: 0 }}>
                                            {item.icon}
                                        </div>
                                        <span className="tag" style={{ background: "#eff6ff", color: "#2563eb", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" }}>
                                            {item.tag}
                                        </span>
                                    </div>

                                    <h3 style={{ marginBottom: "8px" }}>
                                        {item.title}
                                    </h3>
                                    
                                    <p style={{ flexGrow: 1, color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>
                                        {item.desc}
                                    </p>

                                    {/* Add to Plan Action Button */}
                                    <button
                                        className="btn primary"
                                        onClick={() => handleAddToPlan(item)}
                                        disabled={savingTitle === item.title} 
                                        style={{
                                            marginTop: "auto",
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