import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDBp5KVpu5CCuB2zi8EHlQj1tmlZGl4fkw",
  authDomain: "fitlife-6c595.firebaseapp.com" ,
  projectId: "fitlife-6c595",
  storageBucket: "fitlife-6c595.firebasestorage.app",
  messagingSenderId: "793952566736",
  appId: "1:793952566736:web:140fe0d67e1d7e30400dd5"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);