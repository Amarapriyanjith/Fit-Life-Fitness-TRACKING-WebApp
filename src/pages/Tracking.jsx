import React, { useState } from "react";
import {
    doc,
    setDoc,
    serverTimestamp
} from "firebase/firestore";

import { auth, db } from "../firebase";


export default function Tracking() {

    const [height, setHeight] = useState("");

    const [weight, setWeight] = useState("");

    const [bmiResult, setBmiResult] = useState(
        "Your result will appear here."
    );

    const [recommendation, setRecommendation] = useState("");

    const [saving, setSaving] = useState(false);


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

        } else if (bmiValue >= 18.5 && bmiValue < 25) {

            status = "Normal weight";

            healthRecommendation =
                "Your BMI is within the normal range. Maintain a balanced diet, regular physical activity, good hydration, and consistent healthy habits.";

        } else if (bmiValue >= 25 && bmiValue < 30) {

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
                    recommendation: healthRecommendation,
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


                            <div className="stat-card">

                                <span>
                                    WATER
                                </span>


                                <strong>
                                    1.6
                                    <small>
                                        / 2.5 L
                                    </small>
                                </strong>


                                <div className="progress">

                                    <i
                                        style={{
                                            width: "64%"
                                        }}
                                    ></i>

                                </div>


                                <p>
                                    8 glasses goal
                                </p>

                            </div>


                            <div className="stat-card">

                                <span>
                                    ACTIVE CALORIES
                                </span>


                                <strong>
                                    420
                                    <small>
                                        kcal
                                    </small>
                                </strong>


                                <div className="progress">

                                    <i
                                        style={{
                                            width: "70%"
                                        }}
                                    ></i>

                                </div>


                                <p>
                                    600 kcal target
                                </p>

                            </div>


                            <div className="stat-card">

                                <span>
                                    WEEKLY STREAK
                                </span>


                                <strong>
                                    5
                                    <small>
                                        days
                                    </small>
                                </strong>


                                <div className="streak">
                                    🔥 🔥 🔥 🔥 🔥 ○ ○
                                </div>


                                <p>
                                    Keep your momentum
                                </p>

                            </div>


                        </div>


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