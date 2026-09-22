import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";

// Import separated backend dashboard service
import { getTodayKey, fetchDashboardData, updateWaterInvoiced } from "../services/dashboardService";

function Dashboard() {
    const navigate = useNavigate();

    const [userName, setUserName] = useState(() => localStorage.getItem("fitlife_cache_name") || "");
    const [loading, setLoading] = useState(() => !localStorage.getItem("fitlife_cache_name"));
    const [waterCount, setWaterCount] = useState(() => Number(localStorage.getItem("fitlife_cache_water")) || 0);
    const [calories, setCalories] = useState(() => Number(localStorage.getItem("fitlife_cache_calories")) || 0);
    const [bmi, setBmi] = useState(() => {
        const saved = localStorage.getItem("fitlife_cache_bmi");
        return saved ? JSON.parse(saved) : null;
    });

    const [workout, setWorkout] = useState(() => {
        const saved = localStorage.getItem("fitlife_cache_workout");
        return saved ? JSON.parse(saved) : null;
    });

    const [workoutCompleted, setWorkoutCompleted] = useState(() => localStorage.getItem("fitlife_cache_workoutCompleted") === "true");
    const [completedWorkouts, setCompletedWorkouts] = useState(() => Number(localStorage.getItem("fitlife_cache_completedWorkouts")) || 0);

    // Beginner progression tracking states
    const [beginnerCompletedCount, setBeginnerCompletedCount] = useState(0);
    const [readyForIntermediate, setReadyForIntermediate] = useState(false);
    const REQUIRED_TARGET = 20;

    const [notificationsEnabled, setNotificationsEnabled] = useState(
        "Notification" in window &&
        Notification.permission === "granted" &&
        localStorage.getItem("fitlifeNotifications") !== "disabled"
    );

    // Set up periodic reminders for notifications
    useEffect(() => {
        if (!notificationsEnabled) return;

        const reminderTimer = setInterval(() => {
            if ("Notification" in window && Notification.permission === "granted") {
                if (waterCount < 8) {
                    new Notification("FitLife Water Reminder 💧", {
                        body: `You have had ${waterCount} of 8 glasses today. Don't forget to drink water!`
                    });
                } else if (calories < 600) {
                    new Notification("FitLife Calorie Reminder 🔥", {
                        body: `You have tracked ${calories} of 600 kcal today. Don't forget to track your calories!`
                    });
                } else if (!workoutCompleted) {
                    new Notification("FitLife Workout Reminder 🏃", {
                        body: "You have not completed today's workout yet. You've got this! 💪"
                    });
                } else {
                    new Notification("FitLife Daily Goals 🎉", {
                        body: "Amazing! You've completed your main goals today. Keep it up! 🌟"
                    });
                }
            }
        }, 1800000);

        return () => clearInterval(reminderTimer);
    }, [notificationsEnabled, waterCount, calories, workoutCompleted]);

    // Fetch user dashboard data with LocalStorage Caching for instant load
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                setLoading(false);
                navigate("/login");
                return;
            }

            try {
                const today = getTodayKey();
                const { userDoc, waterDoc, calorieDoc, bmiDoc, workoutSnapshot } = await fetchDashboardData(user.uid, today);

                if (userDoc.exists()) {
                    const name = userDoc.data().name || "User";
                    setUserName(name);
                    localStorage.setItem("fitlife_cache_name", name);
                }

                if (waterDoc.exists()) {
                    const glasses = waterDoc.data().glasses || 0;
                    setWaterCount(glasses);
                    localStorage.setItem("fitlife_cache_water", glasses);
                } else {
                    setWaterCount(0);
                    localStorage.setItem("fitlife_cache_water", 0);
                }

                if (calorieDoc.exists()) {
                    const cal = calorieDoc.data().calories || 0;
                    setCalories(cal);
                    localStorage.setItem("fitlife_cache_calories", cal);
                } else {
                    setCalories(0);
                    localStorage.setItem("fitlife_cache_calories", 0);
                }

                if (bmiDoc.exists()) {
                    const bmiData = bmiDoc.data();
                    setBmi(bmiData);
                    localStorage.setItem("fitlife_cache_bmi", JSON.stringify(bmiData));
                } else {
                    setBmi(null);
                    localStorage.removeItem("fitlife_cache_bmi");
                }

                if (!workoutSnapshot.empty) {
                    const workoutPlans = workoutSnapshot.docs.map((workoutDoc) => ({
                        id: workoutDoc.id,
                        ...workoutDoc.data()
                    }));

                    workoutPlans.sort((a, b) => {
                        const dateA = a.addedAt?.toMillis?.() || 0;
                        const dateB = b.addedAt?.toMillis?.() || 0;
                        return dateB - dateA;
                    });

                    const latestWorkout = workoutPlans[0];
                    setWorkout(latestWorkout);
                    localStorage.setItem("fitlife_cache_workout", JSON.stringify(latestWorkout));

                    const isCompleted = latestWorkout.completed === true && latestWorkout.lastActiveDate === today;
                    setWorkoutCompleted(isCompleted);
                    localStorage.setItem("fitlife_cache_workoutCompleted", isCompleted);

                    const completedCount = workoutPlans.filter(
                        (item) => item.completed === true && item.completedDate === today
                    ).length;

                    setCompletedWorkouts(completedCount);
                    localStorage.setItem("fitlife_cache_completedWorkouts", completedCount);

                    const completedBeginners = workoutPlans.filter(
                        (item) => item.level === "beginner" && item.completed === true
                    ).length;

                    setBeginnerCompletedCount(completedBeginners);
                    setReadyForIntermediate(completedBeginners >= REQUIRED_TARGET);

                } else {
                    setWorkout(null);
                    setWorkoutCompleted(false);
                    setCompletedWorkouts(0);
                    setBeginnerCompletedCount(0);
                    setReadyForIntermediate(false);
                    localStorage.removeItem("fitlife_cache_workout");
                    localStorage.setItem("fitlife_cache_workoutCompleted", "false");
                    localStorage.setItem("fitlife_cache_completedWorkouts", "0");
                }

            } catch (error) {
                console.error("Error loading dashboard:", error);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    // Add one glass of water instantly
    const addWater = async () => {
        if (waterCount >= 8) return;
        const user = auth.currentUser;
        if (!user) return;

        const previousCount = waterCount;
        const newWaterCount = waterCount + 1;
        setWaterCount(newWaterCount);
        localStorage.setItem("fitlife_cache_water", newWaterCount);

        try {
            await updateWaterInvoiced(user.uid, getTodayKey(), newWaterCount);
        } catch (error) {
            console.error("Error saving water intake:", error);
            setWaterCount(previousCount);
            localStorage.setItem("fitlife_cache_water", previousCount);
        }
    };

    // Remove one glass of water instantly
    const removeWater = async () => {
        if (waterCount <= 0) return;
        const user = auth.currentUser;
        if (!user) return;

        const previousCount = waterCount;
        const newWaterCount = waterCount - 1;
        setWaterCount(newWaterCount);
        localStorage.setItem("fitlife_cache_water", newWaterCount);

        try {
            await updateWaterInvoiced(user.uid, getTodayKey(), newWaterCount);
        } catch (error) {
            console.error("Error removing water intake:", error);
            setWaterCount(previousCount);
            localStorage.setItem("fitlife_cache_water", previousCount);
        }
    };

    if (loading && !userName) {
        return (
            <main>
                <section className="section">
                    <div className="container">
                        <div className="dash-card loading-card">
                            <div className="loading-spinner"></div>
                            <h3>Loading your dashboard...</h3>
                            <p>Please wait while we load your fitness data.</p>
                        </div>
                    </div>
                </section>
            </main>
        );
    }

    return (
        <>
            <main>
                <section className="dash-head">
                    <div className="container">
                        <div>
                            <div className="eyebrow">GOOD EVENING</div>
                            <h1>Welcome to your <span>FitLife.</span></h1>
                            <p>Hello {userName || "User"} ! Here's a simple snapshot of your day.</p>
                        </div>
                        <Link to="/tracking" className="btn primary">＋ Log Activity</Link>
                    </div>
                </section>

                <section className="section">
                    <div className="container">
                        <div className="dash-grid">
                            <div className="dash-main">
                                {/* Fitness Level Progression Banner */}
                                <div className="dash-card" style={{ marginBottom: "20px", background: readyForIntermediate ? "#f0fdf4" : "#f8fafc", border: readyForIntermediate ? "1px solid #22c55e" : "1px solid #e2e8f0" }}>
                                    <div className="card-title">
                                        <h3>🚀 Fitness Level Progression</h3>
                                        <span>{beginnerCompletedCount} / {REQUIRED_TARGET} Beginner Workouts</span>
                                    </div>
                                    
                                    {readyForIntermediate ? (
                                        <div>
                                            <p style={{ color: "#166534", fontWeight: "600", marginTop: "8px" }}>
                                                🎉 Congratulations! You have successfully passed the Beginner level. You can now access Intermediate workouts!
                                            </p>
                                            <button className="btn primary" style={{ marginTop: "12px" }} onClick={() => navigate("/workouts")}>
                                                Explore Intermediate Workouts →
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            <p style={{ color: "#64748b", marginTop: "8px" }}>
                                                Complete {REQUIRED_TARGET - beginnerCompletedCount} more beginner workouts to reach the Intermediate level. Keep going! 💪
                                            </p>
                                            <div className="progress" style={{ marginTop: "10px" }}>
                                                <i style={{ width: `${Math.min((beginnerCompletedCount / REQUIRED_TARGET) * 100, 100)}%` }}></i>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="dash-card score">
                                    <div>
                                        <span>DAILY WELLNESS SCORE</span>
                                        <strong>
                                            {Math.round(
                                                (waterCount / 8) * 30 +
                                                Math.min(calories / 600, 1) * 30 +
                                                (bmi ? 20 : 0) +
                                                (workoutCompleted ? 20 : 0)
                                            )}
                                        </strong>
                                        <p>
                                            {(() => {
                                                const score = Math.round(
                                                    (waterCount / 8) * 30 +
                                                    Math.min(calories / 600, 1) * 30 +
                                                    (bmi ? 20 : 0) +
                                                    (workoutCompleted ? 20 : 0)
                                                );
                                                if (score >= 90) return "Excellent! You're doing great! 🎉";
                                                if (score >= 70) return "Great progress! Keep going. 💪";
                                                return "Keep building your healthy routine. 🌱";
                                            })()}
                                        </p>
                                    </div>
                                    <div className="ring">
                                        {Math.round(
                                            (waterCount / 8) * 30 +
                                            Math.min(calories / 600, 1) * 30 +
                                            (bmi ? 20 : 0) +
                                            (workoutCompleted ? 20 : 0)
                                        )}%
                                    </div>
                                </div>

                                <div className="dash-card">
                                    <div className="card-title">
                                        <h3>Today's movement</h3>
                                        <Link to="/workouts">Change plan →</Link>
                                    </div>

                                    {workout ? (
                                        <div className="activity">
                                            <span className="activity-icon">🏃</span>
                                            <div>
                                                <b>{workout.workoutName}</b>
                                                <small>{workout.duration} • {workout.level}</small>
                                            </div>
                                            {workoutCompleted ? (
                                                <button className="btn small-btn" disabled>Completed ✓</button>
                                            ) : (
                                                <button className="btn small-btn" onClick={() => navigate(`/workouts/${workout.id}`)}>
                                                    Continue Workout →
                                                </button>
                                            )}
                                            <p style={{ marginTop: "10px", fontWeight: "600" }}>Workouts completed: {completedWorkouts}</p>
                                            <small style={{ color: "#18b981", fontWeight: "600" }}>
                                                {completedWorkouts >= 1 ? "Daily workout goal completed! 🎉" : "Complete your workout to reach today's goal. 💪"}
                                            </small>
                                        </div>
                                    ) : (
                                        <div className="activity">
                                            <span className="activity-icon">🏃</span>
                                            <div>
                                                <b>No workout selected</b>
                                                <small>Choose a workout from the workouts page.</small>
                                            </div>
                                            <Link to="/workouts" className="btn small-btn">Choose workout</Link>
                                        </div>
                                    )}
                                </div>

                                <div className="dash-card">
                                    <div className="card-title">
                                        <h3>Daily calories</h3>
                                        <span>{calories} / 600 kcal</span>
                                    </div>
                                    <div className="progress">
                                        <i style={{ width: `${Math.min((calories / 600) * 100, 100)}%` }}></i>
                                    </div>
                                    <p>
                                        {calories >= 600 ? "Daily calorie goal reached! 🎉" : calories >= 300 ? "Good progress! Keep going. 💪" : "Start tracking your calories today. 🍎"}
                                    </p>
                                    <Link to="/nutrition" className="btn small-btn">＋ Add calories</Link>
                                </div>

                                <div className="dash-card">
                                    <div className="card-title">
                                        <h3>Water intake</h3>
                                        <span>{waterCount} / 8 glasses</span>
                                    </div>
                                    <div className="water-glasses">
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map((glass) => (
                                            <span key={glass} className={glass <= waterCount ? "filled" : ""}>💧</span>
                                        ))}
                                    </div>
                                    <p>
                                        {waterCount === 8 ? "Daily water goal completed! 🎉" : waterCount >= 4 ? "Good progress! Almost there. 💪" : "Keep going! You need more water. 💧"}
                                    </p>
                                    <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                                        <button className="btn small-btn" onClick={addWater} disabled={waterCount >= 8}>＋ Add water</button>
                                        <button className="btn small-btn" onClick={removeWater} disabled={waterCount <= 0}>− Remove</button>
                                    </div>
                                </div>

                                <div className="dash-card notification-card">
                                    <div className="card-title">
                                        <h3>Notifications</h3>
                                        <span>{notificationsEnabled ? "Enabled" : "Disabled"}</span>
                                    </div>
                                    <p>{notificationsEnabled ? "FitLife will remind you about your daily fitness goals." : "Enable notifications to receive fitness reminders."}</p>
                                    <button className="btn small-btn" onClick={async () => {
                                        if (notificationsEnabled) {
                                            setNotificationsEnabled(false);
                                            localStorage.setItem("fitlifeNotifications", "disabled");
                                        } else {
                                            if ("Notification" in window) {
                                                const permission = await Notification.requestPermission();
                                                if (permission === "granted") {
                                                    setNotificationsEnabled(true);
                                                    localStorage.setItem("fitlifeNotifications", "enabled");
                                                    new Notification("FitLife Notifications", { body: "Notifications are now enabled! 💪" });
                                                }
                                            }
                                        }
                                    }}>
                                        {notificationsEnabled ? "🔕 Disable Notifications" : "🔔 Enable Notifications"}
                                    </button>
                                </div>

                                <div className="dash-card">
                                    <div className="card-title">
                                        <h3>Today's progress</h3>
                                        <span>Daily goals</span>
                                    </div>
                                    <div className="activity">
                                        <span className="activity-icon">💧</span>
                                        <div>
                                            <b>Water</b>
                                            <small>{waterCount} / 8 glasses</small>
                                        </div>
                                        <strong>{waterCount >= 8 ? "✓" : "—"}</strong>
                                    </div>
                                    <div className="activity">
                                        <span className="activity-icon">🍎</span>
                                        <div>
                                            <b>Calories</b>
                                            <small>{calories} / 600 kcal</small>
                                        </div>
                                        <strong>{calories >= 600 ? "✓" : "—"}</strong>
                                    </div>
                                    <div className="activity">
                                        <span className="activity-icon">🏃</span>
                                        <div>
                                            <b>Workout</b>
                                            <small>{completedWorkouts} / 1 completed</small>
                                        </div>
                                        <strong>{completedWorkouts >= 1 ? "✓" : "—"}</strong>
                                    </div>
                                    <div className="activity">
                                        <span className="activity-icon">⚖️</span>
                                        <div>
                                            <b>BMI</b>
                                            <small>{bmi ? "Calculated" : "Not calculated"}</small>
                                        </div>
                                        <strong>{bmi ? "✓" : "—"}</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="dash-side">
                                <div className="dash-card bmi-dashboard-card">
                                    <div className="card-title">
                                        <h3>BMI</h3>
                                        <Link to="/tracking">Update →</Link>
                                    </div>
                                    {bmi ? (
                                        <div className="activity">
                                            <span className="activity-icon">⚖️</span>
                                            <div>
                                                <b>{bmi.bmi}</b>
                                                <small>{bmi.status}</small>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="activity">
                                            <span className="activity-icon">⚖️</span>
                                            <div>
                                                <b>BMI not calculated</b>
                                                <small>Calculate your BMI to see it here.</small>
                                            </div>
                                            <Link to="/tracking" className="btn small-btn">Calculate</Link>
                                        </div>
                                    )}
                                </div>

                                <aside className="side-card">
                                    <div className="eyebrow">QUICK ACTIONS</div>
                                    <Link to="/tracking">📏 Calculate BMI <b>→</b></Link>
                                    <Link to="/nutrition">🥗 View meal plan <b>→</b></Link>
                                    <Link to="/workouts">⚡ Find a workout <b>→</b></Link>
                                </aside>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer>
                <div className="container footer">
                    <div className="brand">
                        <span className="brand-mark">F</span>
                        <span>Fit<span>Life</span></span>
                    </div>
                    <p>Your simple daily fitness companion.</p>
                    <small>Demo dashboard • FitLife Project</small>
                </div>
            </footer>
        </>
    );
}

export default Dashboard;