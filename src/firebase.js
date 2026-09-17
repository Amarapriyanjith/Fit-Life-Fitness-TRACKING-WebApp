// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Securely fetch credentials from the .env file
const firebaseConfig = {
 
  apiKey: "AIzaSyDBp5KVpu5CCuB2zi8EHlQj1tmlZGl4fkw",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "1:793952566736:web:ca26383df98354ad400dd5",
  appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Exports required for Navbar.jsx and other pages
export const auth = getAuth(app);
export const db = getFirestore(app);





