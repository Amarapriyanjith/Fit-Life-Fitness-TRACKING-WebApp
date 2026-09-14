import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");

        try {
            // Create Firebase Authentication account
            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            const user = userCredential.user;

            // Save user information in Firestore
            await setDoc(doc(db, "users", user.uid), {
                name: name,
                email: email,
                createdAt: serverTimestamp()
            });

            // Go to dashboard
            navigate("/dashboard");

        } catch (error) {
            console.error(error);
            setError(error.message);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">

                <h1>Create Account</h1>
                <p>Join FitLife today</p>

                <form onSubmit={handleRegister}>

                    <label>Full Name</label>

                    <input
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />

                    <label>Email</label>

                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label>Password</label>

                    <input
                        type="password"
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    {error && (
                        <p className="auth-error">
                            {error}
                        </p>
                    )}

                    <button type="submit">
                        Create Account
                    </button>

                </form>

                <p>
                    Already have an account?

                    <span
                        onClick={() => navigate("/login")}
                        className="auth-link"
                    >
                        Login
                    </span>
                </p>

            </div>
        </div>
    );
}

export default Register;