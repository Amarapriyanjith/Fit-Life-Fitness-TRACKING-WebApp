import { useEffect, useState } from "react";

import {
    addDoc,
    collection,
    doc,
    getDoc,
    deleteDoc,
    getDocs,
    serverTimestamp,
    setDoc
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

    const [calories, setCalories] = useState(0);
    const [calorieInput, setCalorieInput] = useState("");

    const [savedMeals, setSavedMeals] = useState([]);

    const calorieGoal = 600;

    // Load today's total calories from Firestore on component mount
    useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!user) {
            setCalories(0);
            setSavedMeals([]);
            return;
        }

        try {
            const today = getTodayKey();

            // Load today's calories
            const calorieRef = doc(
                db,
                "users",
                user.uid,
                "calorieTracking",
                today
            );

            const calorieSnap = await getDoc(calorieRef);

            if (calorieSnap.exists()) {
                setCalories(calorieSnap.data().calories || 0);
            } else {
                setCalories(0);
            }

            // Load saved meals
            const mealsRef = collection(
                db,
                "users",
                user.uid,
                "nutritionPlans"
            );

            const mealsSnap = await getDocs(mealsRef);

            const meals = mealsSnap.docs.map((mealDoc) => ({
                id: mealDoc.id,
                ...mealDoc.data()
            }));

            setSavedMeals(meals);
        } catch (error) {
            console.error("Error loading nutrition data:", error);
        }
    });

    return () => unsubscribe();
}, []);

    // Handle adding manual calorie input
    const handleAddCalories = async (e) => {
        e.preventDefault();

        const user = auth.currentUser;

        if (!user) {
            setMessage(
                "Please log in to track your calories."
            );
            return;
        }

        const amount = parseInt(calorieInput);

        if (!amount || amount <= 0) {
            setMessage(
                "Please enter a valid calorie amount."
            );
            return;
        }

        setSavingCalories(true);
        setMessage("");

        try {
            const today = getTodayKey();
            const newTotal = calories + amount;

            const calorieRef = doc(
                db,
                "users",
                user.uid,
                "calorieTracking",
                today
            );

            await setDoc(
                calorieRef,
                {
                    calories: newTotal,
                    date: today,
                    updatedAt: serverTimestamp()
                },
                { merge: true }
            );

            setCalories(newTotal);
            setCalorieInput("");

            setMessage(
                `${amount} kcal added successfully!`
            );
        } catch (error) {
            console.error(
                "Error saving calories:",
                error
            );

            setMessage(
                "Calories could not be saved. Please try again."
            );
        }

        setSavingCalories(false);
    };

    // Handle adding a specific meal to the user's plan
    const handleAddMeal = async (meal) => {
        const user = auth.currentUser;

        if (!user) {
            setMessage(
                "Please log in to add a meal to your plan."
            );
            return;
        }

        // Track saving state specifically for the clicked meal
        setSavingMealName(meal.name);
        setMessage("");

        try {
            await addDoc(
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

            setMessage(
                `${meal.name} added to your plan successfully!`
            );
        } catch (error) {
            console.error(
                "Error adding meal:",
                error
            );

            setMessage(
                "Meal could not be added. Please try again."
            );
        }

        // Reset saving state after completion
        setSavingMealName(null);
    };

        const handleRemoveMeal = async (mealId, mealName) => {
        const user = auth.currentUser;

        if (!user) {
            setMessage("Please log in to manage your meal plan.");
            return;
        }

        const confirmRemove = window.confirm(
            `Are you sure you want to remove ${mealName} from your plan?`
        );

        if (!confirmRemove) return;

        try {
            await deleteDoc(
                doc(
                    db,
                    "users",
                    user.uid,
                    "nutritionPlans",
                    mealId
                )
            );

            setSavedMeals((previousMeals) =>
                previousMeals.filter(
                    (meal) => meal.id !== mealId
                )
            );

            setMessage(
                `${mealName} removed from your plan.`
            );

        } catch (error) {
            console.error(
                "Error removing meal:",
                error
            );

            setMessage(
                "Meal could not be removed. Please try again."
            );
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