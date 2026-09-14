import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            navigate("/dashboard");

        } catch (error) {
            setError("Invalid email or password.");
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">

                <h1>Welcome Back</h1>
                <p>Login to your FitLife account</p>

                <form onSubmit={handleLogin}>

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
                        placeholder="Enter your password"
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
                        Login
                    </button>

                </form>

                <p>
                    Don't have an account?

                    <span
                        onClick={() => navigate("/register")}
                        className="auth-link"
                    >
                        Sign Up
                    </span>
                </p>

            </div>
        </div>
    );
}

export default Login;