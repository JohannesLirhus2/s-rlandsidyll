// Header initialization - handles mobile menu and auth state
// This script runs after the header component is loaded into the DOM

console.log("📄 header.js loading...");

// Wait for header component to be loaded
function initializeHeader() {
    console.log("🔧 Initializing header...");
    
    // Mobile menu functionality
    const mobileMenuButton = document.getElementById("mobile-menu-button");
    const closeMobileMenu = document.getElementById("close-mobile-menu");
    const mobileMenu = document.getElementById("mobile-menu");
    const mobileMenuOverlay = document.getElementById("mobile-menu-overlay");
    
    console.log("📱 Mobile menu elements:", {
        button: !!mobileMenuButton,
        closeBtn: !!closeMobileMenu,
        menu: !!mobileMenu,
        overlay: !!mobileMenuOverlay
    });
    
    if (mobileMenuButton && mobileMenu && mobileMenuOverlay) {
        mobileMenuButton.addEventListener("click", (e) => {
            e.preventDefault();
            console.log("📱 Mobile menu button clicked - opening menu");
            mobileMenuOverlay.classList.remove("hidden");
            mobileMenu.classList.remove("translate-x-full");
        });
        
        if (closeMobileMenu) {
            closeMobileMenu.addEventListener("click", (e) => {
                e.preventDefault();
                console.log("📱 Close button clicked");
                mobileMenuOverlay.classList.add("hidden");
                mobileMenu.classList.add("translate-x-full");
            });
        }
        
        mobileMenuOverlay.addEventListener("click", () => {
            console.log("📱 Overlay clicked - closing menu");
            mobileMenuOverlay.classList.add("hidden");
            mobileMenu.classList.add("translate-x-full");
        });
        
        console.log("✅ Mobile menu handlers attached");
    } else {
        console.log("❌ Missing mobile menu elements");
    }
    
    // Profile submenu toggle (mobile)
    const profileToggle = document.getElementById("mobile-profile-toggle");
    const profileSubmenu = document.getElementById("mobile-profile-submenu");
    const profileChevron = document.getElementById("mobile-profile-chevron");
    
    if (profileToggle && profileSubmenu && profileChevron) {
        profileToggle.addEventListener("click", () => {
            console.log("📱 Profile toggle clicked");
            profileSubmenu.classList.toggle("hidden");
            profileChevron.classList.toggle("rotate-180");
        });
        console.log("✅ Profile submenu toggle attached");
    }
    
    // Profile menu dropdown toggle (desktop)
    const profileMenuButton = document.getElementById("profile-menu-button");
    const profileDropdown = document.getElementById("profile-dropdown");
    
    if (profileMenuButton && profileDropdown) {
        profileMenuButton.addEventListener("click", (e) => {
            e.stopPropagation();
            console.log("💻 Profile menu button clicked");
            profileDropdown.classList.toggle("hidden");
        });
        console.log("✅ Profile menu dropdown attached");
        
        // Close dropdown when clicking outside
        document.addEventListener("click", (e) => {
            const container = document.getElementById("profile-menu-container");
            if (container && !e.target.closest("#profile-menu-container")) {
                profileDropdown.classList.add("hidden");
            }
        });
    }
}

// Auth state handler
function setupAuthStateHandler() {
    console.log("🔑 Setting up auth state handler...");
    
    // Import auth check function and related modules
    Promise.all([
        import("./auth.js"),
        import("./firebase.js")
    ]).then(([authModule, firebaseModule]) => {
        const { checkAuthState, getUserAccess, signOutUser } = authModule;
        const { db } = firebaseModule;
        
        // Need to import Firestore functions
        import("https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js").then(firebaseFs => {
            const { doc, getDoc } = firebaseFs;
            
            console.log("✅ Auth modules imported");
            
            async function updateLoginButtonVisibility(user) {
                console.log("🔑 Auth state changed:", user ? "LOGGED IN (" + user.email + ")" : "LOGGED OUT");
                
                const loginButton = document.getElementById("login-button");
                const profileMenuContainer = document.getElementById("profile-menu-container");
                const profileMenuImage = document.getElementById("profile-menu-image");
                const profileMenuInitials = document.getElementById("profile-menu-initials");
                const mobileLoginButton = document.getElementById("mobile-login-button");
                const mobileProfileSection = document.getElementById("mobile-profile-section");
                const mobileProfileImage = document.getElementById("mobile-profile-image");
                const mobileProfileInitials = document.getElementById("mobile-profile-initials");
                const mobileProfileName = document.getElementById("mobile-profile-name");
                
                if (user) {
                    // User is logged in
                    if (loginButton) {
                        loginButton.classList.add("hidden");
                        loginButton.style.display = "none";
                    }
                    if (mobileLoginButton) {
                        mobileLoginButton.classList.add("hidden");
                        mobileLoginButton.style.display = "none";
                    }
                    if (profileMenuContainer) {
                        profileMenuContainer.classList.remove("hidden");
                    }
                    if (mobileProfileSection) {
                        mobileProfileSection.classList.remove("hidden");
                    }
                    console.log("  ✓ Login buttons hidden, profile shown");
                    
                    // Load profile picture
                    try {
                        const userAccess = await getUserAccess(user.uid);
                        
                        if (userAccess && userAccess["author-name"]) {
                            // Load author data
                            const authorRef = doc(db, "authors", userAccess["author-name"]);
                            const authorDoc = await getDoc(authorRef);
                            
                            if (authorDoc.exists()) {
                                const authorData = authorDoc.data();
                                const publicName = authorData.public_name || authorData["public-name"] || userAccess["author-name"];
                                
                                console.log("  ✓ Author data loaded:", publicName);
                                
                                // Set desktop profile picture
                                if (authorData.img && profileMenuImage) {
                                    profileMenuImage.src = authorData.img;
                                    profileMenuImage.style.display = "block";
                                    if (profileMenuInitials) profileMenuInitials.style.display = "none";
                                } else if (profileMenuInitials) {
                                    // Show initials
                                    const initials = publicName.split(" ").map(n => n[0]).join("").toUpperCase();
                                    profileMenuInitials.textContent = initials;
                                    profileMenuInitials.style.display = "block";
                                    if (profileMenuImage) profileMenuImage.style.display = "none";
                                }
                                
                                // Set mobile profile picture
                                if (mobileProfileName) {
                                    mobileProfileName.textContent = publicName;
                                }
                                if (authorData.img && mobileProfileImage) {
                                    mobileProfileImage.src = authorData.img;
                                    mobileProfileImage.classList.remove("hidden");
                                    if (mobileProfileInitials) mobileProfileInitials.style.display = "none";
                                } else if (mobileProfileInitials) {
                                    const initials = publicName.split(" ").map(n => n[0]).join("").toUpperCase();
                                    mobileProfileInitials.textContent = initials;
                                    if (mobileProfileImage) mobileProfileImage.classList.add("hidden");
                                    mobileProfileInitials.style.display = "block";
                                }
                            }
                        } else {
                            // No author name, show user initial
                            const email = user.email || "U";
                            const initial = email[0].toUpperCase();
                            if (profileMenuInitials) {
                                profileMenuInitials.textContent = initial;
                                profileMenuInitials.style.display = "block";
                            }
                            if (profileMenuImage) profileMenuImage.style.display = "none";
                            
                            if (mobileProfileInitials) {
                                mobileProfileInitials.textContent = initial;
                                mobileProfileInitials.style.display = "block";
                            }
                            if (mobileProfileImage) {
                                mobileProfileImage.classList.add("hidden");
                            }
                            if (mobileProfileName) {
                                mobileProfileName.textContent = user.email;
                            }
                        }
                    } catch (error) {
                        console.error("  ⚠️ Error loading profile data:", error);
                        // Fallback to showing initial
                        const email = user.email || "U";
                        const initial = email[0].toUpperCase();
                        if (profileMenuInitials) {
                            profileMenuInitials.textContent = initial;
                            profileMenuInitials.style.display = "block";
                        }
                        if (profileMenuImage) profileMenuImage.style.display = "none";
                    }
                    
                    // Set up logout handlers
                    const menuLogout = document.getElementById("menu-logout");
                    const mobileMenuLogout = document.getElementById("mobile-menu-logout");
                    
                    if (menuLogout) {
                        menuLogout.addEventListener("click", async () => {
                            const originalText = menuLogout.textContent;
                            menuLogout.textContent = "Logger ut...";
                            menuLogout.disabled = true;
                            
                            const result = await signOutUser();
                            if (result.success) {
                                window.location.href = "index.html";
                            } else {
                                menuLogout.textContent = originalText;
                                menuLogout.disabled = false;
                                alert("Kunne ikke logge ut. Vennligst prøv igjen.");
                            }
                        });
                        console.log("  ✓ Desktop logout handler set up");
                    }
                    
                    if (mobileMenuLogout) {
                        mobileMenuLogout.addEventListener("click", async () => {
                            const originalText = mobileMenuLogout.textContent;
                            mobileMenuLogout.textContent = "Logger ut...";
                            mobileMenuLogout.disabled = true;
                            
                            const result = await signOutUser();
                            if (result.success) {
                                window.location.href = "index.html";
                            } else {
                                mobileMenuLogout.textContent = originalText;
                                mobileMenuLogout.disabled = false;
                                alert("Kunne ikke logge ut. Vennligst prøv igjen.");
                            }
                        });
                        console.log("  ✓ Mobile logout handler set up");
                    }
                    
                    // Set up menu item click handlers
                    const menuNewRecipe = document.getElementById("menu-new-recipe");
                    const menuMyAccount = document.getElementById("menu-my-account");
                    const mobileNewRecipeLink = document.getElementById("mobile-new-recipe-link");
                    const mobileMenuMyAccount = document.getElementById("mobile-menu-my-account");
                    
                    // Get access levels
                    try {
                        const userAccess = await getUserAccess(user.uid);
                        const hasPublishAccess = userAccess && (userAccess.publish_recipes === true || userAccess.admin === true);
                        const hasEditorAccess = userAccess && (userAccess.redaktør === true || userAccess.redaktoer === true);
                        const hasSpecialAccess = hasPublishAccess || hasEditorAccess;
                        
                        // Desktop: Show/hide "Ny oppskrift" based on access
                        if (menuNewRecipe) {
                            if (hasPublishAccess || hasEditorAccess) {
                                menuNewRecipe.classList.remove("hidden");
                                menuNewRecipe.onclick = () => window.location.href = "ny-oppskrift.html";
                            } else {
                                menuNewRecipe.classList.add("hidden");
                            }
                        }
                        
                        // Desktop: "Min profil" navigation
                        if (menuMyAccount) {
                            menuMyAccount.onclick = () => {
                                window.location.href = hasSpecialAccess ? "min-konto-adm.html" : "min-konto.html";
                            };
                        }
                        
                        // Mobile: Show/hide "Ny oppskrift" link based on access
                        if (mobileNewRecipeLink) {
                            if (hasPublishAccess || hasEditorAccess) {
                                mobileNewRecipeLink.classList.remove("hidden");
                            } else {
                                mobileNewRecipeLink.classList.add("hidden");
                            }
                        }
                        
                        // Mobile: "Min profil" navigation
                        if (mobileMenuMyAccount) {
                            mobileMenuMyAccount.href = hasSpecialAccess ? "min-konto-adm.html" : "min-konto.html";
                        }
                        
                        console.log("  ✓ Access levels set - publish:", hasPublishAccess, "editor:", hasEditorAccess);
                    } catch (error) {
                        console.error("  ⚠️ Error getting access levels:", error);
                    }
                
                } else {
                    // User is logged out
                    if (loginButton) {
                        loginButton.classList.remove("hidden");
                        loginButton.style.display = "";
                    }
                    if (mobileLoginButton) {
                        mobileLoginButton.classList.remove("hidden");
                        mobileLoginButton.style.display = "";
                    }
                    if (profileMenuContainer) {
                        profileMenuContainer.classList.add("hidden");
                    }
                    if (mobileProfileSection) {
                        mobileProfileSection.classList.add("hidden");
                    }
                    console.log("  ✓ Login buttons shown, profile hidden");
                }
            }
            
            try {
                checkAuthState(updateLoginButtonVisibility);
                console.log("✅ Auth state listener set up");
            } catch (error) {
                console.error("❌ Error setting up auth state listener:", error);
            }
        });
    }).catch(error => {
        console.error("❌ Error importing modules:", error);
    });
}

// Check if header is already in DOM, or wait for it
function checkHeader() {
    const headerPlaceholder = document.getElementById("header-placeholder");
    const mobileMenuButton = document.getElementById("mobile-menu-button");
    
    if (mobileMenuButton) {
        console.log("✅ Header already loaded, initializing...");
        initializeHeader();
        setupAuthStateHandler();
    } else if (headerPlaceholder) {
        console.log("⏳ Waiting for componentsLoaded event...");
        // Listen for custom event from component-loader (dispatched on window)
        window.addEventListener("componentsLoaded", () => {
            console.log("✅ componentsLoaded event received");
            setTimeout(() => {
                initializeHeader();
                setupAuthStateHandler();
            }, 50);
        });
    } else {
        console.log("⚠️  Header placeholder not found");
    }
}

// Run when DOM is ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", checkHeader);
} else {
    checkHeader();
}

console.log("✅ header.js loaded");
