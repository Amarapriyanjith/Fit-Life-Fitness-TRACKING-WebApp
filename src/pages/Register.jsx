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
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
                name: name,
                email: email,
                createdAt: serverTimestamp()
            });

            navigate("/dashboard");
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                setError("This email is already registered! Please log in instead.");
                alert("මෙම විද්‍යුත් තැපැල් ලිපිනය (Email) දැනටමත් භාවිතා කර ඇත. කරුණාකර Login වන්න.");
            } else if (err.code === 'auth/weak-password') {
                setError("Password should be at least 6 characters long.");
            } else {
                setError(err.message);
            }
        }
    };

    return (
        <div style={{ minHeight: '75vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: '#f5f8fc' }}>
            <div style={{ width: '100%', maxWidth: '440px', background: '#fff', border: '1px solid #e7ecf3', borderRadius: '20px', padding: '35px', boxShadow: '0 15px 35px rgba(16, 32, 58, 0.08)' }}>
                <div style={{ fontSize: '11px', letterSpacing: '2px', fontWeight: '800', color: '#1769ff', marginBottom: '8px' }}>GET STARTED</div>
                <h1 style={{ font: '800 28px/1.2 Outfit', margin: '0 0 8px', color: '#101828' }}>Create your <span style={{ color: '#1769ff' }}>FitLife account.</span></h1>
                <p style={{ color: '#667085', fontSize: '14px', marginBottom: '25px' }}>Join FitLife today and start your fitness journey.</p>

                <form onSubmit={handleRegister} style={{ display: 'grid', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#667085', marginBottom: '6px', textTransform: 'uppercase' }}>Full Name</label>
                        <input
                            type="text"
                            placeholder="Enter your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #e7ecf3', outline: 'none', fontSize: '14px', background: '#fff', color: '#101828' }}
                        />
                    </div>

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
                            placeholder="Create a password"
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
                        Create Account
                    </button>
                </form>

                <p style={{ textAlign: 'center', fontSize: '13px', color: '#667085', marginTop: '20px', marginBottom: 0 }}>
                    Already have an account?{" "}
                    <span onClick={() => navigate("/login")} style={{ color: '#1769ff', fontWeight: '700', cursor: 'pointer' }}>
                        Login
                    </span>
                </p>
            </div>
        </div>
    );
}

export default Register;