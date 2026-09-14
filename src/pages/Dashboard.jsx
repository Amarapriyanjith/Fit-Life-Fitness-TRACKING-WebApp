import { useEffect, useState } from "react";
import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";

import { Link } from "react-router-dom";


function Dashboard() {

    const [userName, setUserName] = useState("");
    const [loading, setLoading] = useState(true);

    // Water intake starts at 0
    const [waterCount, setWaterCount] = useState(0);


    // Get today's date in the user's local timezone
    const getTodayKey = () => {

        const now = new Date();

        const offset = now.getTimezoneOffset();

        const localDate = new Date(
            now.getTime() - offset * 60000
        );

        return localDate.toISOString().slice(0, 10);
    };


    useEffect(() => {

        const unsubscribe = onAuthStateChanged(
            auth,
            async (user) => {

                if (!user) {

                    setLoading(false);

                    return;
                }


                try {

                    
                    // 1. Get user profile
                    

                    const userDocRef = doc(
                        db,
                        "users",
                        user.uid
                    );

                    const userDoc = await getDoc(
                        userDocRef
                    );


                    if (userDoc.exists()) {

                        const data = userDoc.data();

                        setUserName(
                            data.name || "User"
                        );
                    }


                    
                    // 2. Get today's water record
                    

                    const today = getTodayKey();


                    const waterDocRef = doc(
                        db,
                        "users",
                        user.uid,
                        "waterIntake",
                        today
                    );


                    const waterDoc = await getDoc(
                        waterDocRef
                    );


                    if (waterDoc.exists()) {

                        // Today's record already exists

                        const data = waterDoc.data();


                        setWaterCount(
                            data.glasses || 0
                        );

                    } else {

                        
                        // New day
                        // Default = 0 glasses
                        

                        await setDoc(
                            waterDocRef,
                            {
                                glasses: 0,
                                date: today,
                                updatedAt: serverTimestamp()
                            }
                        );


                        setWaterCount(0);
                    }

                } catch (error) {

                    console.error(
                        "Error loading dashboard:",
                        error
                    );

                }


                setLoading(false);
            }
        );


        return () => unsubscribe();

    }, []);


    
    // Add one glass of water
    

   const addWater = async () => {

    if (waterCount >= 8) {
        return;
    }

    const user = auth.currentUser;

    if (!user) {
        alert("User is not logged in.");
        return;
    }

    try {

        const today = getTodayKey();

        const waterDocRef = doc(
            db,
            "users",
            user.uid,
            "waterIntake",
            today
        );

        const newWaterCount = waterCount + 1;

        await setDoc(
            waterDocRef,
            {
                glasses: newWaterCount,
                date: today,
                updatedAt: serverTimestamp()
            },
            {
                merge: true
            }
        );

        setWaterCount(newWaterCount);

        console.log(
            "Water saved successfully:",
            newWaterCount
        );

    } catch (error) {

        console.error(
            "Error saving water intake:",
            error
        );

        alert(
            "Water was not saved to Firestore.\n\n" +
            error.message
        );
    }
};


   
    // Loading screen
    

    if (loading) {

        return (
            <div className="container">
                <p>Loading...</p>
            </div>
        );
    }


    return (

        <>

            <main>

                {/*
                    DASHBOARD HEADER
                 */}

                <section className="dash-head">

                    <div className="container">

                        <div>

                            <div className="eyebrow">
                                GOOD EVENING
                            </div>


                            <h1>

                                Welcome to your{" "}

                                <span>
                                    FitLife.
                                </span>

                            </h1>


                            <p>

                                Hello{" "}

                                {userName || "User"}

                                ! Here's a simple
                                snapshot of your day.

                            </p>

                        </div>


                        <button
                            className="btn primary"
                            onClick={() =>
                                alert(
                                    "Great job! Daily activity saved."
                                )
                            }
                        >

                            ＋ Log Activity

                        </button>

                    </div>

                </section>


                {/*
                    DASHBOARD CONTENT
                 */}

                <section className="section">

                    <div className="container">

                        <div className="dash-grid">


                            {/*
                                MAIN DASHBOARD
                             */}

                            <div className="dash-main">


                                {/* 
                                    WELLNESS SCORE
                                 */}

                                <div className="dash-card score">

                                    <div>

                                        <span>
                                            DAILY WELLNESS SCORE
                                        </span>


                                        <strong>
                                            82
                                        </strong>


                                        <p>
                                            You're building a
                                            solid routine.
                                        </p>

                                    </div>


                                    <div className="ring">
                                        82%
                                    </div>

                                </div>


                                {/* 
                                    TODAY'S MOVEMENT
                                */}

                                <div className="dash-card">

                                    <div className="card-title">

                                        <h3>
                                            Today's movement
                                        </h3>


                                        <Link to="/workouts">

                                            Change plan →

                                        </Link>

                                    </div>


                                    <div className="activity">

                                        <span className="activity-icon">
                                            🏃
                                        </span>


                                        <div>

                                            <b>
                                                Full Body Beginner
                                            </b>


                                            <small>
                                                20 min • 6 exercises
                                            </small>

                                        </div>


                                        <button
                                            onClick={() =>
                                                alert(
                                                    "Workout marked as complete!"
                                                )
                                            }
                                        >

                                            Complete

                                        </button>

                                    </div>

                                </div>


                                {/* 
                                    WATER INTAKE
                                 */}

                                <div className="dash-card">

                                    <div className="card-title">

                                        <h3>
                                            Water intake
                                        </h3>


                                        <span>
                                            {waterCount} / 8 glasses
                                        </span>

                                    </div>


                                    {/* Water glasses */}

                                    <div className="water-row">

                                        {Array.from(
                                            { length: 8 },
                                            (_, index) => (

                                                <span
                                                    key={index}
                                                    className={
                                                        index <
                                                        waterCount
                                                            ? "water-glass filled"
                                                            : "water-glass"
                                                    }
                                                >

                                                    💧

                                                </span>

                                            )
                                        )}

                                    </div>


                                    {/* Add glass button */}

                                    <button
                                        className="btn small-btn"
                                        onClick={addWater}
                                        disabled={
                                            waterCount >= 8
                                        }
                                    >

                                        ＋ Add glass

                                    </button>

                                </div>

                            </div>


                            {/* 
                                SIDE CARD
                             */}

                            <aside className="side-card">

                                <div className="eyebrow">
                                    QUICK ACTIONS
                                </div>


                                <Link to="/tracking">

                                    📏 Calculate BMI

                                    <b>
                                        →
                                    </b>

                                </Link>


                                <Link to="/nutrition">

                                    🥗 View meal plan

                                    <b>
                                        →
                                    </b>

                                </Link>


                                <Link to="/workouts">

                                    ⚡ Find a workout

                                    <b>
                                        →
                                    </b>

                                </Link>


                                {/* Motivation */}

                                <div className="motivation">

                                    <span>
                                        “
                                    </span>


                                    <b>

                                        Consistency beats
                                        <br />
                                        perfection.

                                    </b>


                                    <small>
                                        — Your FitLife reminder
                                    </small>

                                </div>

                            </aside>

                        </div>

                    </div>

                </section>

            </main>


            {/* 
                FOOTER
             */}

            <footer>

                <div className="container footer">

                    <div className="brand">

                        <span className="brand-mark">
                            F
                        </span>


                        <span>

                            Fit
                            <span>
                                Life
                            </span>

                        </span>

                    </div>


                    <p>
                        Your simple daily fitness companion.
                    </p>


                    <small>
                        Demo dashboard • FitLife Project
                    </small>

                </div>

            </footer>

        </>

    );
}


export default Dashboard;