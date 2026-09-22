import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Import separated backend auth service
import { loginUser } from "../services/authService";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    // Handle user login form submission
    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        const result = await loginUser(email, password);

        if (result.success) {
            // Redirect to the dashboard upon successful login
            navigate("/dashboard");
        } else {
            setError(result.message);
        }
    };

    return (
        <div style={{ minHeight: '75vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: '#f5f8fc' }}>
            <div style={{ width: '100%', maxWidth: '440px', background: '#fff', border: '1px solid #e7ecf3', borderRadius: '20px', padding: '35px', boxShadow: '0 15px 35px rgba(16, 32, 58, 0.08)' }}>
                <div style={{ fontSize: '11px', letterSpacing: '2px', fontWeight: '800', color: '#1769ff', marginBottom: '8px' }}>WELCOME BACK</div>
                <h1 style={{ font: '800 28px/1.2 Outfit', margin: '0 0 8px', color: '#101828' }}>Log in to your <span style={{ color: '#1769ff' }}>FitLife account.</span></h1>
                <p style={{ color: '#667085', fontSize: '14px', marginBottom: '25px' }}>Enter your details to access your account.</p>

                <form onSubmit={handleLogin} style={{ display: 'grid', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#667085', marginBottom: '6px', textTransform: 'uppercase' }}>Email</label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #e7ecf3', outline: 'none', fontSize: '14px', background: '#fff', color: '#101828' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#667085', marginBottom: '6px', textTransform: 'uppercase' }}>Password</label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #e7ecf3', outline: 'none', fontSize: '14px', background: '#fff', color: '#101828' }}
                        />
                    </div>

                    {error && (
                        <p style={{ background: '#fef2f2', color: '#dc2626', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', margin: 0, border: '1px solid #fee2e2' }}>
                            {error}
                        </p>
                    )}

                    <button type="submit" style={{ width: '100%', marginTop: '5px', padding: '13px', background: '#1769ff', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', boxShadow: '0 10px 24px rgba(23, 105, 255, 0.25)' }}>
                        Login
                    </button>
                </form>

                <p style={{ textAlign: 'center', fontSize: '13px', color: '#667085', marginTop: '20px', marginBottom: 0 }}>
                    Don't have an account?{" "}
                    <span onClick={() => navigate("/register")} style={{ color: '#1769ff', fontWeight: '700', cursor: 'pointer' }}>
                        Sign Up
                    </span>
                </p>
            </div>
        </div>
    );
}

export default Login;