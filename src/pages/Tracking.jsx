import React, { useEffect, useState } from "react";
import {
    doc,
    setDoc,
    serverTimestamp,
    collection,
    getDocs
} from "firebase/firestore";

import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function Tracking() {

    const [height, setHeight] = useState("");

    const [weight, setWeight] = useState("");

    const [bmiResult, setBmiResult] = useState(
        "Your result will appear here."
    );

    const [recommendation, setRecommendation] = useState("");

    const [saving, setSaving] = useState(false);

    const [waterCount, setWaterCount] = useState(0);

    const [calories, setCalories] = useState(0);

    const [calorieInput, setCalorieInput] = useState("");

    const [weeklyStreak, setWeeklyStreak] = useState(0);

    const [weeklyProgress, setWeeklyProgress] = useState([]);


    // Load today's water and weekly activity
    useEffect(() => {

        const loadTrackingData = async (user) => {

            try {

                // Get today's date
                const now = new Date();

                const offset = now.getTimezoneOffset();

                const localDate = new Date(
                    now.getTime() - offset * 60000
                );

                const today = localDate
                    .toISOString()
                    .slice(0, 10);


                // Load water intake
                const waterSnapshot = await getDocs(
                    collection(
                        db,
                        "users",
                        user.uid,
                        "waterIntake"
                    )
                );

                const todayWater = waterSnapshot.docs.find(
                    (item) => item.id === today
                );

                if (todayWater) {

                    setWaterCount(
                        todayWater.data().glasses || 0
                    );

                } else {

                    setWaterCount(0);

                }


                // Find active days
                const activeDates = new Set();


                // Water activity
                waterSnapshot.docs.forEach((item) => {

                    const data = item.data();

                    if (data.glasses > 0) {

                        activeDates.add(item.id);

                    }

                });


                // Load today's calories
                const calorieSnapshot = await getDocs(
                    collection(
                        db,
                        "users",
                        user.uid,
                        "calorieTracking"
                    )
                );

                const todayCalories =
                    calorieSnapshot.docs.find(
                        (item) => item.id === today
                    );

                if (todayCalories) {

                    setCalories(
                        todayCalories.data().calories || 0
                    );

                } else {

                    setCalories(0);

                }


                // Add calorie activity dates
                calorieSnapshot.docs.forEach((item) => {

                    const data = item.data();

                    if (data.calories > 0) {

                        activeDates.add(item.id);

                    }

                });


                // Workout activity
                const workoutSnapshot = await getDocs(
                    collection(
                        db,
                        "users",
                        user.uid,
                        "workoutPlans"
                    )
                );

                workoutSnapshot.docs.forEach((item) => {

                    const data = item.data();

                    if (
                        data.completed === true &&
                        data.completedAt
                    ) {

                        const completedDate =
                            data.completedAt
                                .toDate()
                                .toISOString()
                                .slice(0, 10);

                        activeDates.add(completedDate);

                    }

                });


                // Calculate 7-day streak

                let streak = 0;

                const checkDate = new Date();

                for (let i = 0; i < 7; i++) {

                    const offset =
                        checkDate.getTimezoneOffset();

                    const localCheckDate = new Date(
                        checkDate.getTime() -
                        offset * 60000
                    );

                    const dateKey = localCheckDate
                        .toISOString()
                        .slice(0, 10);


                    if (activeDates.has(dateKey)) {

                        streak++;

                        checkDate.setDate(
                            checkDate.getDate() - 1
                        );

                    } else {

                        break;

                    }

                }

                setWeeklyStreak(streak);


                // Build 7-day progress history

                const progressData = [];

                for (let i = 6; i >= 0; i--) {

                    const date = new Date();

                    date.setDate(
                        date.getDate() - i
                    );

                    const offset =
                        date.getTimezoneOffset();

                    const localDate = new Date(
                        date.getTime() -
                        offset * 60000
                    );

                    const dateKey = localDate
                        .toISOString()
                        .slice(0, 10);


                    // Water
                    const waterDoc =
                        waterSnapshot.docs.find(
                            (item) => item.id === dateKey
                        );

                    const water = waterDoc
                        ? waterDoc.data().glasses || 0
                        : 0;


                    // Calories
                    const calorieDoc =
                        calorieSnapshot.docs.find(
                            (item) => item.id === dateKey
                        );

                    const dailyCalories = calorieDoc
                        ? calorieDoc.data().calories || 0
                        : 0;


                    // Workouts
                    const dailyWorkouts =
                        workoutSnapshot.docs.filter(
                            (item) => {

                                const data = item.data();

                                return (
                                    data.completed === true &&
                                    (
                                        data.completedDate === dateKey ||
                                        (
                                            !data.completedDate &&
                                            data.completedAt &&
                                            data.completedAt
                                                .toDate()
                                                .toISOString()
                                                .slice(0, 10) === dateKey
                                        )
                                    )
                                );

                            }
                        ).length;


                    progressData.push({
                        date: dateKey,
                        water: water,
                        calories: dailyCalories,
                        workouts: dailyWorkouts
                    });

                }

                setWeeklyProgress(progressData);


            } catch (error) {

                console.error(
                    "Error loading tracking data:",
                    error
                );

            }

        };


        const unsubscribe = onAuthStateChanged(
            auth,
            (user) => {

                if (user) {

                    loadTrackingData(user);

                } else {

                    setWaterCount(0);

                    setCalories(0);

                    setWeeklyStreak(0);

                    setWeeklyProgress([]);

                }

            }
        );


        return () => unsubscribe();

    }, []);


    // Save today's calories
    const handleSaveCalories = async (e) => {

        e.preventDefault();

        const user = auth.currentUser;

        if (!user) {

            return;

        }


        const calorieValue =
            parseInt(calorieInput, 10);

        if (!calorieValue || calorieValue < 0) {

            return;

        }


        setSaving(true);


        try {

            const now = new Date();

            const offset =
                now.getTimezoneOffset();

            const localDate = new Date(
                now.getTime() -
                offset * 60000
            );

            const today = localDate
                .toISOString()
                .slice(0, 10);


            const calorieDocRef = doc(
                db,
                "users",
                user.uid,
                "calorieTracking",
                today
            );


            // Add the new calories to today's existing calories
            const newCalories =
                calories + calorieValue;


            await setDoc(
                calorieDocRef,
                {
                    calories: newCalories,
                    date: today,
                    updatedAt: serverTimestamp()
                },
                {
                    merge: true
                }
            );


            // Update the screen
            setCalories(newCalories);


            // Clear input
            setCalorieInput("");


            console.log(
                "Calories added successfully:",
                calorieValue,
                "Total:",
                newCalories
            );


        } catch (error) {

            console.error(
                "Error saving calories:",
                error
            );

        } finally {

            setSaving(false);

        }

    };


    // Calculate BMI
    const handleCalculateBMI = async (e) => {

        e.preventDefault();


        if (!height || !weight) {

            return;

        }


        const hInMeters =
            parseFloat(height) / 100;

        const wInKg =
            parseFloat(weight);


        if (
            hInMeters <= 0 ||
            wInKg <= 0
        ) {

            setBmiResult(
                "Please enter valid height and weight values."
            );

            setRecommendation("");

            return;

        }


        // Calculate BMI
        const bmiValue =
            wInKg /
            (hInMeters * hInMeters);


        const bmi =
            bmiValue.toFixed(1);


        // Check BMI category

        let status = "";

        let healthRecommendation = "";


        if (bmiValue < 18.5) {

            status = "Underweight";

            healthRecommendation =
                "Focus on balanced meals with enough calories, protein, fruits, and vegetables. Consider speaking with a healthcare professional about healthy weight gain.";

        } else if (
            bmiValue >= 18.5 &&
            bmiValue < 25
        ) {

            status = "Normal weight";

            healthRecommendation =
                "Your BMI is within the normal range. Maintain a balanced diet, regular physical activity, good hydration, and consistent healthy habits.";

        } else if (
            bmiValue >= 25 &&
            bmiValue < 30
        ) {

            status = "Overweight";

            healthRecommendation =
                "Focus on regular physical activity, balanced meals, portion control, and healthy hydration. Gradual lifestyle changes can support a healthier weight.";

        } else {

            status = "Obese";

            healthRecommendation =
                "Focus on gradual healthy lifestyle changes, regular physical activity, and balanced nutrition. Consider discussing your health goals with a healthcare professional.";

        }


        setBmiResult(
            `Your BMI is ${bmi} (${status})`
        );


        setRecommendation(
            healthRecommendation
        );


        // Save BMI result to Firestore

        const user = auth.currentUser;


        if (!user) {

            return;

        }


        setSaving(true);


        try {

            const bmiDocRef = doc(
                db,
                "users",
                user.uid,
                "healthData",
                "bmi"
            );


            await setDoc(
                bmiDocRef,
                {
                    height: parseFloat(height),
                    weight: parseFloat(weight),
                    bmi: parseFloat(bmi),
                    status: status,
                    recommendation:
                        healthRecommendation,
                    updatedAt: serverTimestamp()
                },
                {
                    merge: true
                }
            );


            console.log(
                "BMI saved successfully:",
                bmi
            );


        } catch (error) {

            console.error(
                "Error saving BMI:",
                error
            );

        }


        setSaving(false);

    };


    return (

        <div>

            <main>

                <section className="page-hero">

                    <div className="container">

                        <div className="eyebrow">
                            KNOW YOUR PROGRESS
                        </div>


                        <h1>

                            Track the habits that

                            <br />

                            <span>
                                move you forward.
                            </span>

                        </h1>


                        <p>

                            FitLife keeps the important numbers
                            visible without turning fitness into
                            a spreadsheet.

                        </p>

                    </div>

                </section>


                <section className="section">

                    <div className="container">


                        <div className="stats-grid">


                            {/* WATER */}

                            <div className="stat-card">

                                <span>
                                    WATER
                                </span>


                                <strong>

                                    {(waterCount * 0.3125).toFixed(1)}

                                    <small>
                                        / 2.5 L
                                    </small>

                                </strong>


                                <div className="progress">

                                    <i
                                        style={{
                                            width:
                                                `${Math.min(
                                                    (waterCount / 8) * 100,
                                                    100
                                                )}%`
                                        }}
                                    ></i>

                                </div>


                                <p>
                                    8 glasses goal
                                </p>

                            </div>


                            {/* CALORIES */}

                            <div className="stat-card">

                                <span>
                                    ACTIVE CALORIES
                                </span>


                                <strong>

                                    {calories}

                                    <small>
                                        kcal
                                    </small>

                                </strong>


                                <div className="progress">

                                    <i
                                        style={{
                                            width:
                                                `${Math.min(
                                                    (calories / 600) * 100,
                                                    100
                                                )}%`
                                        }}
                                    ></i>

                                </div>


                                <p>
                                    600 kcal target
                                </p>


                                <form
                                    className="calorie-form"
                                    onSubmit={
                                        handleSaveCalories
                                    }
                                >

                                    <input
                                        type="number"
                                        min="0"
                                        max="5000"
                                        placeholder="Enter calories"
                                        value={calorieInput}
                                        onChange={(e) =>
                                            setCalorieInput(
                                                e.target.value
                                            )
                                        }
                                    />


                                    <button
                                        className="btn primary"
                                        type="submit"
                                        disabled={saving}
                                    >

                                        {saving
                                            ? "Saving..."
                                            : "Save Calories"}

                                    </button>

                                </form>

                            </div>


                            {/* STREAK */}

                            <div className="stat-card">

                                <span>
                                    WEEKLY STREAK
                                </span>


                                <strong>

                                    {weeklyStreak}

                                    <small>
                                        days
                                    </small>

                                </strong>


                                <div className="streak">

                                    {[0, 1, 2, 3, 4, 5, 6].map(
                                        (day) => (

                                            <span key={day}>

                                                {day < weeklyStreak
                                                    ? "🔥"
                                                    : "○"}

                                            </span>

                                        )
                                    )}

                                </div>


                                <p>
                                    Keep your momentum
                                </p>

                            </div>


                        </div>


                        {/* PROGRESS HISTORY */}

                        <div className="progress-history-card">

                            <div className="section-head">

                                <div>

                                    <div className="eyebrow">
                                        PROGRESS HISTORY
                                    </div>


                                    <h2>

                                        Your last{" "}

                                        <span>
                                            7 days.
                                        </span>

                                    </h2>

                                </div>


                                <p>

                                    Review your recent water,
                                    calorie, and workout activity.

                                </p>

                            </div>


                            <div className="progress-history">

                                {weeklyProgress.map((day) => (

                                    <div
                                        className="progress-history-row"
                                        key={day.date}
                                    >


                                        <div className="progress-history-date">

                                            <strong>

                                                {new Date(
                                                    `${day.date}T00:00:00`
                                                ).toLocaleDateString(
                                                    "en-US",
                                                    {
                                                        weekday: "short"
                                                    }
                                                )}

                                            </strong>


                                            <small>
                                                {day.date}
                                            </small>

                                        </div>


                                        <div className="progress-history-item">

                                            <span>
                                                💧 Water
                                            </span>


                                            <strong>
                                                {day.water} / 8
                                            </strong>

                                        </div>


                                        <div className="progress-history-item">

                                            <span>
                                                🔥 Calories
                                            </span>


                                            <strong>
                                                {day.calories} kcal
                                            </strong>

                                        </div>


                                        <div className="progress-history-item">

                                            <span>
                                                🏋️ Workout
                                            </span>


                                            <strong>

                                                {day.workouts > 0
                                                    ? "Completed"
                                                    : "Not completed"}

                                            </strong>

                                        </div>


                                    </div>

                                ))}

                            </div>

                        </div>


                        {/* BMI */}

                        <div className="bmi-box">


                            <div>

                                <div className="eyebrow">
                                    BMI CALCULATOR
                                </div>


                                <h2>

                                    Understand your{" "}

                                    <span>
                                        starting point.
                                    </span>

                                </h2>


                                <p>

                                    Enter your height and weight
                                    to calculate BMI. This is a
                                    general screening measure,
                                    not a diagnosis.

                                </p>

                            </div>


                            <form
                                onSubmit={
                                    handleCalculateBMI
                                }
                            >


                                <label>

                                    Height (cm)

                                    <input
                                        id="height"
                                        type="number"
                                        min="80"
                                        max="250"
                                        placeholder="170"
                                        value={height}
                                        onChange={(e) =>
                                            setHeight(
                                                e.target.value
                                            )
                                        }
                                        required
                                    />

                                </label>


                                <label>

                                    Weight (kg)

                                    <input
                                        id="weight"
                                        type="number"
                                        min="20"
                                        max="300"
                                        placeholder="65"
                                        value={weight}
                                        onChange={(e) =>
                                            setWeight(
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
                                        : "Calculate BMI"}

                                </button>


                                <div
                                    id="bmiResult"
                                    className="bmi-result"
                                >

                                    {bmiResult}

                                </div>


                                {recommendation && (

                                    <div
                                        className="bmi-result"
                                        style={{
                                            marginTop: "15px"
                                        }}
                                    >

                                        <strong>
                                            Health Recommendation
                                        </strong>

                                        <p>
                                            {recommendation}
                                        </p>

                                    </div>

                                )}

                            </form>

                        </div>


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