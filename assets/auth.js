import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
import { auth, db } from "./firebase.js";

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Function to sign in with email and password
export async function signInWithEmail(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error("Error signing in with email/password:", error);
        return { success: false, error: error.message };
    }
}

// Function to sign in with Google
export async function signInWithGoogle() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return { success: true, user: result.user };
    } catch (error) {
        console.error("Error signing in with Google:", error);
        return { success: false, error: error.message };
    }
}

// Function to sign out
export async function signOutUser() {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        console.error("Error signing out:", error);
        return { success: false, error: error.message };
    }
}

// Check authentication state
export function checkAuthState(callback) {
    console.log("✓ checkAuthState: Setting up onAuthStateChanged listener");
    onAuthStateChanged(auth, (user) => {
        console.log("✓✓ onAuthStateChanged FIRED with user:", user ? user.email : "NULL/undefined");
        if (user) {
            console.log("✓✓✓ User object exists, email:", user.email, "UID:", user.uid);
        } else {
            console.log("✓✓✓ User is null - user is NOT logged in");
        }
        callback(user);
    });
}

// Get user access data from Firestore
export async function getUserAccess(uid) {
    try {
        const userAccessRef = doc(db, "user_access", uid);
        const userAccessDoc = await getDoc(userAccessRef);
        
        if (userAccessDoc.exists()) {
            return userAccessDoc.data();
        } else {
            console.log("No user_access document found for UID:", uid);
            return null;
        }
    } catch (error) {
        console.error("Error fetching user access:", error);
        return null;
    }
}

// Display error message
function showError(message) {
    const errorDiv = document.getElementById("error-message");
    if (errorDiv) {
        const errorText = errorDiv.querySelector("p");
        if (errorText) {
            errorText.textContent = message;
        }
        errorDiv.classList.remove("hidden");
        setTimeout(() => {
            errorDiv.classList.add("hidden");
        }, 5000);
    } else {
        alert(message);
    }
}

// Initialize login page authentication
window.addEventListener("DOMContentLoaded", () => {
    // Check if user is already logged in (only redirect from login page)
    const isLoginPage = window.location.pathname.includes("login.html");
    if (isLoginPage) {
        checkAuthState((user) => {
            if (user) {
                // User is signed in, redirect to index
                window.location.href = "index.html";
            }
        });
    }

    // Get form elements
    const loginForm = document.getElementById("login-form");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const googleButton = document.getElementById("google-signin-button");

    // Handle email/password login
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const email = emailInput.value.trim();
            const password = passwordInput.value;

            if (!email || !password) {
                showError("Vennligst fyll inn både e-post og passord.");
                return;
            }

            // Show loading state
            const submitButton = loginForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.textContent = "Logger inn...";
            submitButton.disabled = true;

            const result = await signInWithEmail(email, password);

            if (result.success) {
                // Success - redirect to index
                window.location.href = "index.html";
            } else {
                // Show error
                submitButton.textContent = originalText;
                submitButton.disabled = false;
                
                // Map Firebase error codes to Norwegian messages
                let errorMessage = "En feil oppstod. Vennligst prøv igjen.";
                if (result.error.includes("wrong-password") || result.error.includes("user-not-found")) {
                    errorMessage = "Feil e-post eller passord.";
                } else if (result.error.includes("invalid-email")) {
                    errorMessage = "Ugyldig e-postadresse.";
                } else if (result.error.includes("too-many-requests")) {
                    errorMessage = "For mange forsøk. Vennligst prøv igjen senere.";
                }
                
                showError(errorMessage);
            }
        });
    }

    // Handle Google Sign-In
    if (googleButton) {
        googleButton.addEventListener("click", async (e) => {
            e.preventDefault();
            
            // Show loading state
            const buttonContent = googleButton.querySelector(".gsi-material-button-contents");
            const originalText = buttonContent.textContent;
            buttonContent.textContent = "Signing in...";
            googleButton.disabled = true;

            const result = await signInWithGoogle();

            if (result.success) {
                // Success - redirect to index
                window.location.href = "index.html";
            } else {
                // Show error
                buttonContent.textContent = originalText;
                googleButton.disabled = false;
                
                let errorMessage = "Kunne ikke logge inn med Google. Vennligst prøv igjen.";
                if (result.error.includes("popup-closed")) {
                    errorMessage = "Popup-vinduet ble lukket. Vennligst prøv igjen.";
                } else if (result.error.includes("cancelled")) {
                    return; // User cancelled, no need to show error
                }
                
                showError(errorMessage);
            }
        });
    }

    // Handle password visibility toggle
    const passwordToggle = passwordInput?.parentElement.querySelector('button[type="button"]');
    if (passwordToggle && passwordInput) {
        passwordToggle.addEventListener('click', () => {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            const icon = passwordToggle.querySelector('.material-symbols-outlined');
            icon.textContent = type === 'password' ? 'visibility' : 'visibility_off';
        });
    }
});
