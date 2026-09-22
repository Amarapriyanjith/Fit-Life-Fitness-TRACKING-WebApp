import { useEffect, useState, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

// Import separated backend services
import { getTodayKey, fetchNutritionData, saveCaloriesToFirebase, addMealToFirebase, removeMealFromFirebase } from "../services/nutritionService";
import nutritionBg from "../assets/images/Nutrition.jpg";

// Meal options with fixed standard calories
const mealData = [
    {
        type: "Breakfast",
        icon: "🥣",
        name: "Oatmeal & Banana",
        description: "Healthy oats with banana and milk.",
        calories: 350
    },
    {
        type: "Breakfast",
        icon: "🍳",
        name: "Eggs & Toast",
        description: "Two boiled/scrambled eggs with whole wheat toast.",
        calories: 280
    },
    {
        type: "Lunch",
        icon: "🍗",
        name: "Chicken Rice Bowl",
        description: "Rice with grilled chicken and vegetables.",
        calories: 550
    },
    {
        type: "Lunch",
        icon: "🍛",
        name: "Vegetable Rice & Dhal",
        description: "Traditional rice and curry with lentils.",
        calories: 450
    },
    {
        type: "Dinner",
        icon: "🥗",
        name: "Chicken Salad",
        description: "Fresh vegetables with grilled chicken.",
        calories: 400
    },
    {
        type: "Dinner",
        icon: "🍲",
        name: "Soup & Bread",
        description: "Warm vegetable or chicken soup with a slice of bread.",
        calories: 300
    },
    {
        type: "Snack",
        icon: "🍎",
        name: "Apple & Nuts",
        description: "Apple with a small serving of mixed nuts.",
        calories: 200
    },
    {
        type: "Snack",
        icon: "🍌",
        name: "Banana Smoothie",
        description: "Blended banana with milk and a touch of honey.",
        calories: 250
    }
];

function Nutrition() {
    const [message, setMessage] = useState("");
    const [isWarning, setIsWarning] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    
    const [savingCalories, setSavingCalories] = useState(false);
    const [savingMealName, setSavingMealName] = useState(null);

    const [calories, setCalories] = useState(() => Number(localStorage.getItem("fitlife_cache_nutrition_calories")) || 0);
    const [calorieInput, setCalorieInput] = useState("");

    const [savedMeals, setSavedMeals] = useState(() => {
        const saved = localStorage.getItem("fitlife_cache_nutrition_meals");
        return saved ? JSON.parse(saved) : [];
    });

    const savedMealsRef = useRef(null);
    const calorieGoal = 600;

    // Load data on mount
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                setCalories(0);
                setSavedMeals([]);
                localStorage.removeItem("fitlife_cache_nutrition_calories");
                localStorage.removeItem("fitlife_cache_nutrition_meals");
                return;
            }

            try {
                const today = getTodayKey();
                const { calorieSnap, mealsSnap } = await fetchNutritionData(user.uid, today);

                if (calorieSnap.exists()) {
                    const cal = calorieSnap.data().calories || 0;
                    setCalories(cal);
                    localStorage.setItem("fitlife_cache_nutrition_calories", cal);
                } else {
                    setCalories(0);
                    localStorage.setItem("fitlife_cache_nutrition_calories", 0);
                }

                const meals = mealsSnap.docs.map((mealDoc) => ({
                    id: mealDoc.id,
                    ...mealDoc.data()
                }));

                setSavedMeals(meals);
                localStorage.setItem("fitlife_cache_nutrition_meals", JSON.stringify(meals));

            } catch (error) {
                console.error("Error loading nutrition data:", error);
            }
        });

        return () => unsubscribe();
    }, []);

    // Trigger floating toast message helper
    const triggerToast = (msg) => {
        setToastMessage(msg);
        setShowToast(true);
        setTimeout(() => {
            setShowToast(false);
        }, 4000);
    };

    // Handle adding manual calorie input
    const handleAddCalories = async (e) => {
        e.preventDefault();
        const user = auth.currentUser;

        if (!user) {
            setMessage("Please log in to track your calories.");
            setIsWarning(true);
            return;
        }

        const amount = parseInt(calorieInput);

        if (!amount || amount <= 0) {
            setMessage("Please enter a valid calorie amount greater than 0.");
            setIsWarning(true);
            return;
        }

        if (amount > 2000) {
            setMessage("⚠️ Warning: Unusually high calorie amount for a single entry.");
            setIsWarning(true);
            return;
        }

        setSavingCalories(true);
        setMessage("");
        setIsWarning(false);

        const previousCalories = calories;
        const newTotal = calories + amount;

        setCalories(newTotal);
        localStorage.setItem("fitlife_cache_nutrition_calories", newTotal);
        setCalorieInput("");
        setMessage(`${amount} kcal added successfully! 🎉`);
        triggerToast(`${amount} kcal added successfully! 🎉`);

        try {
            const today = getTodayKey();
            await saveCaloriesToFirebase(user.uid, today, newTotal);
        } catch (error) {
            console.error("Error saving calories:", error);
            setMessage("Calories could not be saved. Please try again.");
            setIsWarning(true);
            setCalories(previousCalories);
            localStorage.setItem("fitlife_cache_nutrition_calories", previousCalories);
        }

        setSavingCalories(false);
    };

    // Handle adding a specific meal with auto-scroll and toast
    const handleAddMeal = async (meal) => {
        const user = auth.currentUser;

        if (!user) {
            setMessage("Please log in to add a meal to your plan.");
            setIsWarning(true);
            return;
        }

        const calculatedCalories = meal.calories;

        setSavingMealName(meal.name);
        setMessage("");
        setIsWarning(false);

        const tempId = "temp_" + Date.now();
        const newMealItem = {
            id: tempId,
            mealType: meal.type,
            mealName: meal.name,
            description: meal.description,
            calories: calculatedCalories
        };

        const previousCalories = calories;
        const newTotalCalories = calories + calculatedCalories;
        const previousMeals = savedMeals;
        const updatedMeals = [newMealItem, ...savedMeals];

        setSavedMeals(updatedMeals);
        setCalories(newTotalCalories);
        localStorage.setItem("fitlife_cache_nutrition_meals", JSON.stringify(updatedMeals));
        localStorage.setItem("fitlife_cache_nutrition_calories", newTotalCalories);
        
        const successMsg = `${meal.name} added successfully (+${calculatedCalories} kcal)! 🎉`;
        setMessage(successMsg);
        triggerToast(successMsg);

        // Smooth auto-scroll to "Your saved meals" section
        if (savedMealsRef.current) {
            savedMealsRef.current.scrollIntoView({ behavior: "smooth" });
        }

        try {
            const today = getTodayKey();
            const mealPayload = {
                mealType: meal.type,
                mealName: meal.name,
                description: meal.description,
                calories: calculatedCalories
            };

            const docId = await addMealToFirebase(user.uid, today, newTotalCalories, mealPayload);

            setSavedMeals((currentMeals) =>
                currentMeals.map((m) => m.id === tempId ? { ...m, id: docId } : m)
            );
            localStorage.setItem("fitlife_cache_nutrition_meals", JSON.stringify(
                updatedMeals.map((m) => m.id === tempId ? { ...m, id: docId } : m)
            ));

        } catch (error) {
            console.error("Error adding meal:", error);
            setMessage("Meal could not be added. Please try again.");
            setIsWarning(true);
            setSavedMeals(previousMeals);
            setCalories(previousCalories);
            localStorage.setItem("fitlife_cache_nutrition_meals", JSON.stringify(previousMeals));
            localStorage.setItem("fitlife_cache_nutrition_calories", previousCalories);
        }

        setSavingMealName(null);
    };

    // Handle removing a meal
    const handleRemoveMeal = async (mealId, mealName, mealCalories) => {
        const user = auth.currentUser;

        if (!user) {
            setMessage("Please log in to manage your meal plan.");
            setIsWarning(true);
            return;
        }

        const previousMeals = savedMeals;
        const previousCalories = calories;
        
        const updatedMeals = savedMeals.filter((meal) => meal.id !== mealId);
        const newTotalCalories = Math.max(0, calories - mealCalories);

        setSavedMeals(updatedMeals);
        setCalories(newTotalCalories);
        localStorage.setItem("fitlife_cache_nutrition_meals", JSON.stringify(updatedMeals));
        localStorage.setItem("fitlife_cache_nutrition_calories", newTotalCalories);
        setMessage(`${mealName} removed and calories updated.`);
        triggerToast(`${mealName} removed.`);

        try {
            const today = getTodayKey();
            await removeMealFromFirebase(user.uid, today, mealId, newTotalCalories);
        } catch (error) {
            console.error("Error removing meal:", error);
            setMessage("Meal could not be removed. Please try again.");
            setIsWarning(true);
            setSavedMeals(previousMeals);
            setCalories(previousCalories);
            localStorage.setItem("fitlife_cache_nutrition_meals", JSON.stringify(previousMeals));
            localStorage.setItem("fitlife_cache_nutrition_calories", previousCalories);
        }
    };

    const progress = Math.min((calories / calorieGoal) * 100, 100);

    return (
        <div>
            {/* Floating Toast Notification for immediate feedback */}
            {showToast && (
                <div style={{
                    position: "fixed",
                    top: "20px",
                    right: "20px",
                    zIndex: 9999,
                    background: "#101828",
                    color: "#fff",
                    padding: "12px 20px",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                    fontSize: "14px",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    animation: "fadeInOut 0.3s ease"
                }}>
                    <span>✨</span> {toastMessage}
                </div>
            )}

            <main>
                <section className="page-hero" style={{ position: "relative", overflow: "hidden", minHeight: "260px", display: "flex", alignItems: "center" }}>
                    <div style={{ position: "absolute", top: 0, right: 0, width: "55%", height: "100%", backgroundImage: `url(${nutritionBg})`, backgroundSize: "cover", backgroundPosition: "center", WebkitMaskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,1) 100%)", maskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,1) 100%)", pointerEvents: "none", zIndex: 1 }} />
                    <div className="container" style={{ position: "relative", zIndex: 2 }}>
                        <div className="eyebrow">EAT BETTER</div>
                        <h1>Simple nutrition for<br /><span>everyday progress.</span></h1>
                        <p style={{ maxWidth: "560px" }}>Choose simple, beginner-friendly meals and track your daily calories effortlessly.</p>
                    </div>
                </section>

                <section className="section">
                    <div className="container">
                        <div className="section-head">
                            <div>
                                <div className="eyebrow">DAILY CALORIES</div>
                                <h2>Track what you<span> eat.</span></h2>
                            </div>
                            <p>Select meals below or enter custom calories to build healthier habits.</p>
                        </div>

                        <div className="stats-grid">
                            <div className="stat-card">
                                <span>TODAY'S CALORIES</span>
                                <strong>{calories}<small> / {calorieGoal} kcal</small></strong>
                                <div className="progress"><i style={{ width: `${progress}%` }}></i></div>
                                <p>Daily calorie target</p>
                            </div>
                        </div>

                        <div className="bmi-box" style={{ marginTop: "30px" }}>
                            <div>
                                <div className="eyebrow">CUSTOM ENTRY</div>
                                <h2>Record custom<span> calories.</span></h2>
                                <p>If you ate something not listed below, you can enter the exact calorie amount here.</p>
                            </div>

                            <form onSubmit={handleAddCalories}>
                                <label>
                                    Calories (kcal)
                                    <input type="number" min="1" max="5000" placeholder="300" value={calorieInput} onChange={(e) => setCalorieInput(e.target.value)} required />
                                </label>
                                <button className="btn primary" type="submit" disabled={savingCalories}>
                                    {savingCalories ? "Saving..." : "Add Calories →"}
                                </button>
                            </form>
                        </div>

                        {message && (
                            <div className="bmi-result" style={{ marginTop: "20px", background: isWarning ? "#fef2f2" : "#f0fdf4", color: isWarning ? "#dc2626" : "#166534", border: isWarning ? "1px solid #fee2e2" : "1px solid #bbf7d0" }}>
                                {message}
                            </div>
                        )}
                    </div>
                </section>

                <section className="section">
                    <div className="container">
                        <div className="section-head">
                            <div>
                                <div className="eyebrow">MEAL PLANS</div>
                                <h2>Healthy meals made<span> simple.</span></h2>
                            </div>
                            <p>Choose a meal to automatically add it to your daily total.</p>
                        </div>

                        <div className="meal-grid">
                            {mealData.map((meal, index) => (
                                <div className="meal" key={index}>
                                    <div className="meal-icon">{meal.icon}</div>
                                    <span className="tag">{meal.type}</span>
                                    <h3>{meal.name}</h3>
                                    <p>{meal.description}</p>
                                    <strong>{meal.calories} kcal</strong>
                                    <button className="btn primary" onClick={() => handleAddMeal(meal)} disabled={savingMealName === meal.name} style={{ marginTop: "15px", width: "100%" }}>
                                        {savingMealName === meal.name ? "Adding..." : "Add to plan →"}
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Ref attached here so clicking 'Add to plan' smoothly scrolls user to their saved meals */}
                        <div ref={savedMealsRef}></div>

                        {savedMeals.length > 0 && (
                            <div className="saved-meals-section" style={{ marginTop: "50px" }}>
                                <div className="section-head">
                                    <div>
                                        <div className="eyebrow">MY MEAL PLAN</div>
                                        <h2>Your saved <span>meals.</span></h2>
                                    </div>
                                    <p>Meals you have added to your personal nutrition plan today.</p>
                                </div>

                                <div className="saved-meals-grid">
                                    {savedMeals.map((meal) => (
                                        <div className="saved-meal-card" key={meal.id}>
                                            <div className="saved-meal-icon">
                                                {meal.mealType === "Breakfast" ? "🥣" : meal.mealType === "Lunch" ? "🍗" : meal.mealType === "Dinner" ? "🥗" : "🍎"}
                                            </div>
                                            <div>
                                                <span className="tag">{meal.mealType}</span>
                                                <h3>{meal.mealName}</h3>
                                                <p>{meal.description}</p>
                                                <strong>{meal.calories} kcal</strong>
                                                <button className="btn secondary remove-meal-btn" onClick={() => handleRemoveMeal(meal.id, meal.mealName, meal.calories)}>
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <footer>
                <div className="container footer">
                    <div className="brand">
                        <span className="brand-mark">F</span>
                        <span>Fit<span>Life</span></span>
                    </div>
                    <p>Smart personalized fitness for beginners.</p>
                    <small>© 2026 FitLife Project</small>
                </div>
            </footer>
        </div>
    );
}

export default Nutrition;