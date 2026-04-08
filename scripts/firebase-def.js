import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-analytics.js";
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import { getFirestore, collection, getDocs, query, orderBy, limit, where, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCuPwDoIylo-MS_sWfAu9n_yhHIfk1fnls",
    authDomain: "soerlandsidyll2.firebaseapp.com",
    projectId: "soerlandsidyll2",
    storageBucket: "soerlandsidyll2.firebasestorage.app",
    messagingSenderId: "391276662095",
    appId: "1:391276662095:web:b483bf57619a63cbaf493a",
    measurementId: "G-KZHZ8HMVVC"
};

const app = initializeApp(firebaseConfig);
getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Export auth and db for use in other modules
export { auth, db };

// Store all recipes globally for filtering
let allRecipes = [];
let currentTag = null;

// Function to load recipes from Firebase
export async function loadRecipes() {
    try {
        const recipesCollection = collection(db, "recipes");
        const q = query(
            recipesCollection,
            orderBy("created_date", "desc"),
            limit(150)
        );
        const snapshot = await getDocs(q);
        const recipes = [];
        
        snapshot.forEach((doc) => {
            const data = doc.data();
            // Exclude deleted recipes
            if (data.deleted !== true) {
                recipes.push({
                    id: doc.id,
                    ...data
                });
            }
        });
        
        return recipes;
    } catch (error) {
        console.error("Error loading recipes:", error);
        return [];
    }
}
