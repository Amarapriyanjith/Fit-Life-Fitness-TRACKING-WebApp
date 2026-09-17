import { useEffect, useState } from "react";
import {
    doc,
    getDoc,
    setDoc,
    deleteDoc,
    collection,
    getDocs,
    addDoc,
    serverTimestamp
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";

const mealData = [
    {
        type: "Breakfast",
        icon: "🥣",
        name: "Oatmeal & Banana",
        description: "Healthy oats with banana and milk.",
        calories: 350
    },
    {
        type: "Lunch",
        icon: "🍗",
        name: "Chicken Rice Bowl",
        description: "Rice with grilled chicken and vegetables.",
        calories: 550
    },
    {
        type: "Dinner",
        icon: "🥗",
        name: "Chicken Salad",
        description: "Fresh vegetables with grilled chicken.",
        calories: 400
    },
    {
        type: "Snack",
        icon: "🍎",
        name: "Apple & Nuts",
        description: "Apple with a small serving of mixed nuts.",
        calories: 200
    }
];

// Get today's local date string (YYYY-MM-DD)
const getTodayKey = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();

    const localDate = new Date(
        now.getTime() - offset * 60000
    );

    return localDate.toISOString().slice(0, 10);
};

function Nutrition() {
    const [message, setMessage] = useState("");
    
    // Separate saving states for calories form and individual meal cards
    const [savingCalories, setSavingCalories] = useState(false);
    const [savingMealName, setSavingMealName] = useState(null);

    // Initialize state from LocalStorage cache for instant load
    const [calories, setCalories] = useState(() => Number(localStorage.getItem("fitlife_cache_nutrition_calories")) || 0);
    const [calorieInput, setCalorieInput] = useState("");

    const [savedMeals, setSavedMeals] = useState(() => {
        const saved = localStorage.getItem("fitlife_cache_nutrition_meals");
        return saved ? JSON.parse(saved) : [];
    });

    const calorieGoal = 600;

    // Load today's total calories and saved meals in parallel on component mount
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
                const calorieRef = doc(db, "users", user.uid, "calorieTracking", today);
                const mealsRef = collection(db, "users", user.uid, "nutritionPlans");

                // Fetch calorie data and saved meals concurrently using Promise.all
                const [calorieSnap, mealsSnap] = await Promise.all([
                    getDoc(calorieRef),
                    getDocs(mealsRef)
                ]);

                // Handle today's calories
                if (calorieSnap.exists()) {
                    const cal = calorieSnap.data().calories || 0;
                    setCalories(cal);
                    localStorage.setItem("fitlife_cache_nutrition_calories", cal);
                } else {
                    setCalories(0);
                    localStorage.setItem("fitlife_cache_nutrition_calories", 0);
                }

                // Handle saved meals list
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

    // Handle adding manual calorie input with Optimistic UI Update
    const handleAddCalories = async (e) => {
        e.preventDefault();

        const user = auth.currentUser;

        if (!user) {
            setMessage("Please log in to track your calories.");
            return;
        }

        const amount = parseInt(calorieInput);

        if (!amount || amount <= 0) {
            setMessage("Please enter a valid calorie amount.");
            return;
        }

        setSavingCalories(true);
        setMessage("");

        const previousCalories = calories;
        const newTotal = calories + amount;

        // Instant UI update (Optimistic update)
        setCalories(newTotal);
        localStorage.setItem("fitlife_cache_nutrition_calories", newTotal);
        setCalorieInput("");
        setMessage(`${amount} kcal added successfully!`);

        try {
            const today = getTodayKey();
            const calorieRef = doc(
                db,
                "users",
                user.uid,
                "calorieTracking",
                today
            );

            // Background sync with Firebase
            await setDoc(
                calorieRef,
                {
                    calories: newTotal,
                    date: today,
                    updatedAt: serverTimestamp()
                },
                { merge: true }
            );

        } catch (error) {
            console.error("Error saving calories:", error);
            setMessage("Calories could not be saved. Please try again.");
            
            // Rollback state if background sync fails
            setCalories(previousCalories);
            localStorage.setItem("fitlife_cache_nutrition_calories", previousCalories);
        }

        setSavingCalories(false);
    };

    // Handle adding a specific meal to the user's plan with Optimistic UI Update
    const handleAddMeal = async (meal) => {
        const user = auth.currentUser;

        if (!user) {
            setMessage("Please log in to add a meal to your plan.");
            return;
        }

        setSavingMealName(meal.name);
        setMessage("");

        // Create a temporary meal object for instant local UI update
        const tempId = "temp_" + Date.now();
        const newMealItem = {
            id: tempId,
            mealType: meal.type,
            mealName: meal.name,
            description: meal.description,
            calories: meal.calories
        };

        const previousMeals = savedMeals;
        const updatedMeals = [newMealItem, ...savedMeals];

        // Instant UI update
        setSavedMeals(updatedMeals);
        localStorage.setItem("fitlife_cache_nutrition_meals", JSON.stringify(updatedMeals));
        setMessage(`${meal.name} added to your plan successfully!`);

        try {
            const docRef = await addDoc(
                collection(
                    db,
                    "users",
                    user.uid,
                    "nutritionPlans"
                ),
                {
                    mealType: meal.type,
                    mealName: meal.name,
                    description: meal.description,
                    calories: meal.calories,
                    addedAt: serverTimestamp()
                }
            );

            // Replace temporary ID with actual Firestore ID in state
            setSavedMeals((currentMeals) =>
                currentMeals.map((m) => m.id === tempId ? { ...m, id: docRef.id } : m)
            );
            localStorage.setItem("fitlife_cache_nutrition_meals", JSON.stringify(
                updatedMeals.map((m) => m.id === tempId ? { ...m, id: docRef.id } : m)
            ));

        } catch (error) {
            console.error("Error adding meal:", error);
            setMessage("Meal could not be added. Please try again.");
            
            // Rollback state if addition fails
            setSavedMeals(previousMeals);
            localStorage.setItem("fitlife_cache_nutrition_meals", JSON.stringify(previousMeals));
        }

        setSavingMealName(null);
    };

    // Handle removing a meal from the user's plan instantly without confirmation popup
    const handleRemoveMeal = async (mealId, mealName) => {
        const user = auth.currentUser;

        if (!user) {
            setMessage("Please log in to manage your meal plan.");
            return;
        }

        const previousMeals = savedMeals;
        const updatedMeals = savedMeals.filter((meal) => meal.id !== mealId);

        // Instant UI removal (Optimistic update)
        setSavedMeals(updatedMeals);
        localStorage.setItem("fitlife_cache_nutrition_meals", JSON.stringify(updatedMeals));
        setMessage(`${mealName} removed from your plan.`);

        try {
            // Background deletion from Firebase
            await deleteDoc(
                doc(
                    db,
                    "users",
                    user.uid,
                    "nutritionPlans",
                    mealId
                )
            );

        } catch (error) {
            console.error("Error removing meal:", error);
            setMessage("Meal could not be removed. Please try again.");
            
            // Rollback state if deletion fails
            setSavedMeals(previousMeals);
            localStorage.setItem("fitlife_cache_nutrition_meals", JSON.stringify(previousMeals));
        }
    };

    const progress =
        Math.min((calories / calorieGoal) * 100, 100);

    return (
        <div>
            <main>

                <section className="page-hero">
                    <div className="container">

                        <div className="eyebrow">
                            EAT BETTER
                        </div>

                        <h1>
                            Simple nutrition for
                            <br />
                            <span>everyday progress.</span>
                        </h1>

                        <p>
                            Choose simple, beginner-friendly
                            meals and track your daily calories.
                        </p>

                    </div>
                </section>


                <section className="section">
                    <div className="container">

                        <div className="section-head">
                            <div>

                                <div className="eyebrow">
                                    DAILY CALORIES
                                </div>

                                <h2>
                                    Track what you
                                    <span> eat.</span>
                                </h2>

                            </div>

                            <p>
                                Keep track of your daily calorie
                                intake and build healthier habits.
                            </p>

                        </div>


                        <div className="stats-grid">

                            <div className="stat-card">

                                <span>
                                    TODAY'S CALORIES
                                </span>

                                <strong>
                                    {calories}
                                    <small>
                                        {" "}
                                        / {calorieGoal} kcal
                                    </small>
                                </strong>

                                <div className="progress">
                                    <i
                                        style={{
                                            width: `${progress}%`
                                        }}
                                    ></i>
                                </div>

                                <p>
                                    Daily calorie target
                                </p>

                            </div>

                        </div>


                        <div
                            className="bmi-box"
                            style={{ marginTop: "30px" }}
                        >

                            <div>

                                <div className="eyebrow">
                                    ADD CALORIES
                                </div>

                                <h2>
                                    Record your
                                    <span> intake.</span>
                                </h2>

                                <p>
                                    Enter the calories you
                                    consumed and add them to
                                    today's total.
                                </p>

                            </div>


                            <form onSubmit={handleAddCalories}>

                                <label>
                                    Calories (kcal)

                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="300"
                                        value={calorieInput}
                                        onChange={(e) =>
                                            setCalorieInput(
                                                e.target.value
                                            )
                                        }
                                        required
                                    />

                                </label>


                                <button
                                    className="btn primary"
                                    type="submit"
                                    disabled={savingCalories}
                                >
                                    {savingCalories
                                        ? "Saving..."
                                        : "Add Calories →"}
                                </button>

                            </form>

                        </div>


                        {message && (
                            <div
                                className="bmi-result"
                                style={{
                                    marginTop: "20px"
                                }}
                            >
                                {message}
                            </div>
                        )}

                    </div>
                </section>


                <section className="section">

                    <div className="container">

                        <div className="section-head">

                            <div>

                                <div className="eyebrow">
                                    MEAL PLANS
                                </div>

                                <h2>
                                    Healthy meals made
                                    <span> simple.</span>
                                </h2>

                            </div>

                        </div>


                    <div className="meal-grid">

                        {mealData.map((meal, index) => (

                            <div
                                className="meal"
                                key={index}
                            >

                                <div className="meal-icon">
                                    {meal.icon}
                                </div>

                                <span className="tag">
                                    {meal.type}
                                </span>

                                <h3>
                                    {meal.name}
                                </h3>

                                <p>
                                    {meal.description}
                                </p>

                                <strong>
                                    {meal.calories} kcal
                                </strong>



                                <button
                                    className="btn primary"
                                    onClick={() =>
                                        handleAddMeal(meal)
                                    }
                                    disabled={savingMealName === meal.name}
                                    style={{
                                        marginTop: "15px",
                                        width: "100%"
                                    }}
                                >
                                    {savingMealName === meal.name
                                        ? "Saving..."
                                        : "Add to plan →"}
                                </button>

                            </div>

                        ))}

                    </div>


                    {/* My saved meals */}

                    {savedMeals.length > 0 && (
                        <div className="saved-meals-section">

                            <div className="section-head">

                                <div>
                                    <div className="eyebrow">
                                        MY MEAL PLAN
                                    </div>

                                    <h2>
                                        Your saved <span>meals.</span>
                                    </h2>
                                </div>

                                <p>
                                    Meals you have added to your personal nutrition plan.
                                </p>

                            </div>

                            <div className="saved-meals-grid">

                                {savedMeals.map((meal) => (

                                    <div
                                        className="saved-meal-card"
                                        key={meal.id}
                                    >

                                        <div className="saved-meal-icon">
                                            {meal.mealType === "Breakfast"
                                                ? "🥣"
                                                : meal.mealType === "Lunch"
                                                ? "🍗"
                                                : meal.mealType === "Dinner"
                                                ? "🥗"
                                                : "🍎"}
                                        </div>

                                        <div>

                                            <span className="tag">
                                                {meal.mealType}
                                            </span>

                                            <h3>
                                                {meal.mealName}
                                            </h3>

                                            <p>
                                                {meal.description}
                                            </p>

                                            <strong>
                                                {meal.calories} kcal
                                            </strong>

                                            <button className="btn secondary remove-meal-btn"
                                                onClick={() =>
                                                    handleRemoveMeal(
                                                        meal.id,
                                                        meal.mealName
                                                    )
                                                }
                                            >
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


                <section className="dark-section">

                    <div className="container cta-center">

                        <div className="eyebrow">
                            SMALL CHANGES
                        </div>

                        <h2>
                            Eat well.
                            <span> Feel better.</span>
                        </h2>

                        <p>
                            Consistent healthy choices can
                            help you build better habits.
                        </p>

                    </div>

                </section>

            </main>


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
                        Smart personalized fitness
                        for beginners.
                    </p>

                    <small>
                        © 2026 FitLife Project
                    </small>

                </div>

            </footer>

        </div>
    );
}

export default Nutrition;