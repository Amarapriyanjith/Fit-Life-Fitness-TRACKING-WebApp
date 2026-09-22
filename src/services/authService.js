import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

// Handle user sign in (Login)
export const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (err) {
        let errorMessage = "Login failed. Please try again.";
        
        if (
            err.code === 'auth/user-not-found' || 
            err.code === 'auth/wrong-password' || 
            err.code === 'auth/invalid-credential'
        ) {
            errorMessage = "Invalid email or password. Please check your details.";
        }

        return { success: false, message: errorMessage };
    }
};

// Handle user registration and profile creation (Register)
export const registerUser = async (name, email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save user details to Firestore database
        await setDoc(doc(db, "users", user.uid), {
            name: name,
            email: email,
            createdAt: serverTimestamp()
        });

        return { success: true };
    } catch (err) {
        let errorMessage = err.message;
        
        if (err.code === 'auth/email-already-in-use') {
            errorMessage = "This email is already registered! Please log in instead.";
        } else if (err.code === 'auth/weak-password') {
            errorMessage = "Password should be at least 6 characters long.";
        }

        return { success: false, message: errorMessage };
    }
};