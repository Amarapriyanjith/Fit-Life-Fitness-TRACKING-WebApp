import { useEffect, useState } from "react";
import {
    addDoc,
    collection,
    doc,
    getDoc,
    serverTimestamp,
    setDoc
} from "firebase/firestore";
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
    const [saving, setSaving] = useState(false);
    const [calories, setCalories] = useState(0);
    const [calorieInput, setCalorieInput] = useState("");

    const calorieGoal = 600;

    useEffect(() => {
        const loadCalories = async () => {
            const user = auth.currentUser;

            if (!user) return;

            try {
                const today = getTodayKey();

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
            } catch (error) {
                console.error(
                    "Error loading calories:",
                    error
                );
            }
        };

        loadCalories();
    }, []);

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

        setSaving(true);
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

        setSaving(false);
    };

    const handleAddMeal = async (meal) => {
        const user = auth.currentUser;

        if (!user) {
            setMessage(
                "Please log in to add a meal to your plan."
            );
            return;
        }

        setSaving(true);
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

        setSaving(false);
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
                                    disabled={saving}
                                >
                                    {saving
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
                                        disabled={saving}
                                        style={{
                                            marginTop: "15px",
                                            width: "100%"
                                        }}
                                    >
                                        {saving
                                            ? "Saving..."
                                            : "Add to plan →"}
                                    </button>

                                </div>

                            ))}

                        </div>

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