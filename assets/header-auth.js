import { checkAuthState, signOutUser, getUserAccess } from "./auth.js";
import { db } from "./firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

console.log("\n╔═══════════════════════════════════════════════════╗");
console.log("║   📍 header-auth.js MODULE LOADING STARTED     ║");
console.log("║   ✓ All imports loaded successfully            ║");
console.log("╚═══════════════════════════════════════════════════╝");

// IMMEDIATE: Create a stub on window to show we're loading
window.__headerAuthLoading = true;
console.log("📍 Set window.__headerAuthLoading = true - beginning initialization");

// Cache for user data to avoid multiple Firebase calls
let userDataCache = null;
let authorDataCache = null;
let headerAuthInitialized = false;

// Update header based on authentication state
async function updateHeaderAuthState(user) {
    console.log("\n========== START updateHeaderAuthState ==========");
    console.log("AUTH STATE:", user ? "LOGGED IN (" + user.email + ")" : "LOGGED OUT");
    
    // Declare all elements at the top
    const loginButton = document.getElementById("login-button");
    const profileMenuContainer = document.getElementById("profile-menu-container");
    const profileMenuButton = document.getElementById("profile-menu-button");
    const profileMenuImage = document.getElementById("profile-menu-image");
    const profileMenuInitials = document.getElementById("profile-menu-initials");
    const profileDropdown = document.getElementById("profile-dropdown");
    const menuNewRecipe = document.getElementById("menu-new-recipe");
    const menuEditRecipes = document.getElementById("menu-edit-recipes");
    const menuMyAccount = document.getElementById("menu-my-account");
    const menuLogout = document.getElementById("menu-logout");
    const bannerNewRecipeButton = document.getElementById("banner-new-recipe-button");
    const searchButton = document.getElementById("searchButton");
    
    const mobileLoginButton = document.getElementById("mobile-login-button");
    const mobileProfileSection = document.getElementById("mobile-profile-section");
    const mobileProfileToggle = document.getElementById("mobile-profile-toggle");
    const mobileProfileSubmenu = document.getElementById("mobile-profile-submenu");
    const mobileProfileImage = document.getElementById("mobile-profile-image");
    const mobileProfileInitials = document.getElementById("mobile-profile-initials");
    const mobileProfileName = document.getElementById("mobile-profile-name");
    const mobileProfileChevron = document.getElementById("mobile-profile-chevron");
    const mobileMenuNewRecipe = document.getElementById("mobile-menu-new-recipe");
    const mobileMenuEditRecipes = document.getElementById("mobile-menu-edit-recipes");
    const mobileMenuMyAccount = document.getElementById("mobile-menu-my-account");
    const mobileMenuLogout = document.getElementById("mobile-menu-logout");
    
    console.log("\n🔍 ELEMENT STATUS REPORT:");
    console.log("  loginButton:", { exists: !!loginButton });
    console.log("  profileMenuContainer:", { exists: !!profileMenuContainer });
    console.log("  mobileLoginButton:", { exists: !!mobileLoginButton });
    console.log("  mobileProfileSection:", { exists: !!mobileProfileSection });
    console.log("  menuLogout:", { exists: !!menuLogout });
    console.log("  mobileMenuLogout:", { exists: !!mobileMenuLogout });
    
    if (user) {
        console.log("\n>>> APPLYING LOGGED-IN STATE >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
        
        // HIDE LOGIN BUTTON (desktop)
        if (loginButton) {
            console.log("\n  🔧 HIDING login button");
            loginButton.classList.add("hidden");
            loginButton.style.display = "none";
        } else {
            console.warn("  ❌ loginButton NOT FOUND");
        }
        
        // HIDE MOBILE LOGIN BUTTON
        if (mobileLoginButton) {
            console.log("\n  🔧 HIDING mobile login button");
            mobileLoginButton.classList.add("hidden");
            mobileLoginButton.style.display = "none";
        } else {
            console.warn("  ❌ mobileLoginButton NOT FOUND");
        }
        
        // SHOW PROFILE MENU (desktop)
        if (profileMenuContainer) {
            console.log("\n  🔧 SHOWING profile menu");
            profileMenuContainer.classList.remove("hidden");
            profileMenuContainer.style.display = "";
        } else {
            console.warn("  ❌ profileMenuContainer NOT FOUND");
        }
        
        // SHOW MOBILE PROFILE SECTION
        if (mobileProfileSection) {
            console.log("\n  🔧 SHOWING mobile profile section");
            mobileProfileSection.classList.remove("hidden");
            mobileProfileSection.style.display = "";
        } else {
            console.warn("  ❌ mobileProfileSection NOT FOUND");
        }
        
        // Load profile picture and set up menu
        try {
            // Fetch user access data once and cache it
            if (!userDataCache || userDataCache.uid !== user.uid) {
                userDataCache = await getUserAccess(user.uid);
                userDataCache.uid = user.uid;
            }
            const userAccess = userDataCache;
            
            const hasPublishAccess = userAccess && (userAccess.publish_recipes === true || userAccess.admin === true);
            const hasEditorAccess = userAccess && (userAccess.redaktør === true || userAccess.redaktoer === true);
            const hasSpecialAccess = hasPublishAccess || hasEditorAccess;
            
            console.log("Access levels - publish:", hasPublishAccess, "editor:", hasEditorAccess);

            // Load author data if available
            if (userAccess && userAccess["author-name"]) {
                // Check cache for author data
                if (!authorDataCache || authorDataCache.authorName !== userAccess["author-name"]) {
                    const authorRef = doc(db, "authors", userAccess["author-name"]);
                    const authorDoc = await getDoc(authorRef);
                    
                    if (authorDoc.exists()) {
                        authorDataCache = {
                            authorName: userAccess["author-name"],
                            ...authorDoc.data()
                        };
                    } else {
                        authorDataCache = null;
                    }
                }
                
                const authorData = authorDataCache;
                    const publicName = authorData.public_name || authorData["public-name"] || userAccess["author-name"];
                    
                    console.log("Author data loaded:", publicName);
                    
                    // Set desktop profile picture
                    if (authorData.img && profileMenuImage) {
                        profileMenuImage.src = authorData.img;
                        profileMenuImage.style.display = "block";
                        if (profileMenuInitials) profileMenuInitials.style.display = "none";
                    } else {
                        // Show initials
                        const name = publicName || "U";
                        const initials = name.split(" ").map(n => n[0]).join("").toUpperCase();
                        if (profileMenuInitials) {
                            profileMenuInitials.textContent = initials;
                            profileMenuInitials.style.display = "block";
                        }
                        if (profileMenuImage) profileMenuImage.style.display = "none";
                    }
                    
                    // Set mobile profile picture and name
                    if (mobileProfileName) {
                        mobileProfileName.textContent = publicName;
                    }
                    if (authorData.img && mobileProfileImage) {
                        mobileProfileImage.src = authorData.img;
                        mobileProfileImage.classList.remove("hidden");
                        if (mobileProfileInitials) mobileProfileInitials.style.display = "none";
                    } else if (mobileProfileInitials) {
                        const name = publicName || "U";
                        const initials = name.split(" ").map(n => n[0]).join("").toUpperCase();
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
                
                // Mobile
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

            // Setup menu visibility based on access (desktop)
            if (menuNewRecipe && menuEditRecipes) {
                if (hasPublishAccess || hasEditorAccess) {
                    menuNewRecipe.classList.remove("hidden");
                } else {
                    menuNewRecipe.classList.add("hidden");
                }

                if (hasEditorAccess) {
                    menuEditRecipes.classList.remove("hidden");
                } else {
                    menuEditRecipes.classList.add("hidden");
                }
            }
            
            // Setup mobile menu visibility based on access
            if (mobileMenuNewRecipe && mobileMenuEditRecipes) {
                // Show "Ny oppskrift" if user has publish or editor access
                if (hasPublishAccess || hasEditorAccess) {
                    mobileMenuNewRecipe.classList.remove("hidden");
                } else {
                    mobileMenuNewRecipe.classList.add("hidden");
                }

                if (hasEditorAccess) {
                    mobileMenuEditRecipes.classList.remove("hidden");
                } else {
                    mobileMenuEditRecipes.classList.add("hidden");
                }
            }

            // Set mobile menu "Min konto" link based on user privileges
            if (mobileMenuMyAccount) {
                mobileMenuMyAccount.href = hasSpecialAccess ? "min-konto-adm.html" : "min-konto.html";
            }

            // Setup menu button click handlers
            if (menuNewRecipe) {
                menuNewRecipe.onclick = () => {
                    window.location.href = "ny-oppskrift.html";
                };
            }

            if (menuEditRecipes) {
                menuEditRecipes.onclick = () => {
                    window.location.href = "rediger-oppskrifter.html";
                };
            }

            if (menuMyAccount) {
                menuMyAccount.onclick = () => {
                    window.location.href = hasSpecialAccess ? "min-konto-adm.html" : "min-konto.html";
                };
            }
        } catch (error) {
            console.error("Error loading user profile:", error);
        }

        // Show banner button if has publish or editor access (desktop only)
        if (bannerNewRecipeButton) {
            try {
                // Use cached user access data
                if (!userDataCache || userDataCache.uid !== user.uid) {
                    userDataCache = await getUserAccess(user.uid);
                    userDataCache.uid = user.uid;
                }
                const userAccess = userDataCache;
                
                const hasPublishAccess = userAccess && (userAccess.publish_recipes === true || userAccess.admin === true);
                const hasEditorAccess = userAccess && (userAccess.redaktør === true || userAccess.redaktoer === true);
                if (hasPublishAccess || hasEditorAccess) {
                    // Show button on desktop only
                    bannerNewRecipeButton.classList.remove("hidden");
                    bannerNewRecipeButton.classList.add("md:block");
                    bannerNewRecipeButton.onclick = () => {
                        window.location.href = "ny-oppskrift.html";
                    };
                } else {
                    // Ensure button is hidden if no access
                    bannerNewRecipeButton.classList.add("hidden");
                    bannerNewRecipeButton.classList.remove("md:block");
                }
            } catch (error) {
                bannerNewRecipeButton.classList.add("hidden");
                bannerNewRecipeButton.classList.remove("md:block");
            }
        }
    } else {
        console.log("\n>>> APPLYING LOGGED-OUT STATE >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
        
        // Clear caches
        userDataCache = null;
        authorDataCache = null;
        
        // SHOW LOGIN BUTTON (desktop)
        if (loginButton) {
            console.log("\n  🔧 SHOWING login button");
            loginButton.classList.remove("hidden");
            loginButton.style.display = "";
            console.log("    After showing - classes:", loginButton.className);
            console.log("    After showing - computed display:", window.getComputedStyle(loginButton).display);
        } else {
            console.warn("  ❌ loginButton NOT FOUND");
        }
        
        // SHOW MOBILE LOGIN BUTTON
        if (mobileLoginButton) {
            console.log("\n  🔧 SHOWING mobile login button");
            mobileLoginButton.classList.remove("hidden");
            mobileLoginButton.style.display = "";
        } else {
            console.warn("  ❌ mobileLoginButton NOT FOUND");
        }
        
        // HIDE PROFILE MENU (desktop)
        if (profileMenuContainer) {
            console.log("\n  🔧 HIDING profile menu container");
            profileMenuContainer.classList.add("hidden");
            profileMenuContainer.style.display = "none";
            console.log("    After hiding - classes:", profileMenuContainer.className);
            console.log("    After hiding - computed display:", window.getComputedStyle(profileMenuContainer).display);
        } else {
            console.warn("  ❌ profileMenuContainer NOT FOUND");
        }
        
        // HIDE MOBILE PROFILE SECTION
        if (mobileProfileSection) {
            console.log("\n  🔧 HIDING mobile profile section");
            mobileProfileSection.classList.add("hidden");
            mobileProfileSection.style.display = "none";
        } else {
            console.warn("  ❌ mobileProfileSection NOT FOUND");
        }
        
        if (searchButton) {
            console.log("\n  🔧 SHOWING search button");
            searchButton.classList.remove("hidden");
            searchButton.style.display = "";
        }
        if (bannerNewRecipeButton) {
            console.log("  🔧 HIDING banner new recipe button");
            bannerNewRecipeButton.classList.add("hidden");
            bannerNewRecipeButton.style.display = "none";
        }
    }
    
    console.log("========== END updateHeaderAuthState ==========\n");
}

// Initialize header authentication
function initializeHeaderAuth() {
    // Prevent duplicate initialization
    if (headerAuthInitialized) {
        console.log("⚠️ initializeHeaderAuth already initialized, skipping duplicate call");
        return;
    }
    headerAuthInitialized = true;
    
    console.log("\n╔═══════════════════════════════════════════════════╗");
    console.log("║           ▶️  initializeHeaderAuth CALLED           ║");
    console.log("╚═══════════════════════════════════════════════════╝");
    
    const profileMenuButton = document.getElementById("profile-menu-button");
    const profileDropdown = document.getElementById("profile-dropdown");
    const menuLogout = document.getElementById("menu-logout");
    const mobileMenuLogout = document.getElementById("mobile-menu-logout");
    
    // Mobile menu elements
    const mobileMenuButton = document.getElementById("mobile-menu-button");
    const closeMobileMenuButton = document.getElementById("close-mobile-menu");
    const mobileMenu = document.getElementById("mobile-menu");
    const mobileMenuOverlay = document.getElementById("mobile-menu-overlay");
    const mobileProfileToggle = document.getElementById("mobile-profile-toggle");
    const mobileProfileSubmenu = document.getElementById("mobile-profile-submenu");
    const mobileProfileChevron = document.getElementById("mobile-profile-chevron");

    console.log("Element check after component load:");
    console.log("  ✓ profileMenuButton:", !!profileMenuButton);
    console.log("  ✓ menuLogout:", !!menuLogout);
    console.log("  ✓ mobileMenuButton:", !!mobileMenuButton);
    console.log("  ✓ mobileMenu:", !!mobileMenu);
    console.log("  ✓ mobileMenuOverlay:", !!mobileMenuOverlay);
    console.log("  ✓ closeMobileMenuButton:", !!closeMobileMenuButton);
    
    // Critical elements - at least one from desktop and mobile
    const hasDesktopElements = profileMenuButton && menuLogout;
    const hasMobileElements = mobileMenuButton && mobileMenu && mobileMenuOverlay;
    
    if (!hasDesktopElements && !hasMobileElements) {
        console.log("⚠️ ❌ NO HEADER ELEMENTS FOUND!!! Header component may not have loaded!");
        console.log("⚠️ Retrying in 200ms...");
        headerAuthInitialized = false; // Reset flag for retry
        setTimeout(initializeHeaderAuth, 200);
        return;
    }

    console.log("✓ Header elements found, setting up event listeners");
    console.log("  - Desktop elements OK:", hasDesktopElements);
    console.log("  - Mobile elements OK:", hasMobileElements);

    // ========== MOBILE MENU TOGGLE ==========
    if (mobileMenuButton && mobileMenu && mobileMenuOverlay) {
        console.log("\n📱 SETTING UP MOBILE MENU HANDLERS:");
        
        mobileMenuButton.addEventListener("click", () => {
            console.log("  📱 Mobile menu button CLICKED - opening menu");
            mobileMenuOverlay.classList.remove("hidden");
            mobileMenu.classList.remove("translate-x-full");
        });
        
        closeMobileMenuButton?.addEventListener("click", () => {
            console.log("  📱 Close mobile menu button CLICKED");
            mobileMenuOverlay.classList.add("hidden");
            mobileMenu.classList.add("translate-x-full");
        });
        
        mobileMenuOverlay.addEventListener("click", () => {
            console.log("  📱 Mobile overlay CLICKED - closing menu");
            mobileMenuOverlay.classList.add("hidden");
            mobileMenu.classList.add("translate-x-full");
        });
        
        console.log("  ✓ Mobile menu handlers attached successfully");
    } else {
        console.log("\n📱 SKIPPING MOBILE MENU - Missing elements:");
        console.log("  - mobileMenuButton:", !!mobileMenuButton);
        console.log("  - mobileMenu:", !!mobileMenu);
        console.log("  - mobileMenuOverlay:", !!mobileMenuOverlay);
    }
    
    // Mobile profile submenu toggle
    if (mobileProfileToggle && mobileProfileSubmenu) {
        console.log("Setting up mobile profile toggle...");
        mobileProfileToggle.addEventListener("click", () => {
            console.log("▪ Mobile profile toggle clicked");
            mobileProfileSubmenu.classList.toggle("hidden");
            if (mobileProfileChevron) {
                mobileProfileChevron.classList.toggle("rotate-180");
            }
        });
        console.log("✓ Mobile profile toggle set up");
    }

    // Toggle profile menu dropdown (desktop)
    if (profileMenuButton && profileDropdown) {
        console.log("Setting up desktop profile menu...");
        profileMenuButton.addEventListener("click", (e) => {
            e.stopPropagation();
            console.log("▪ Profile menu button clicked");
            profileDropdown.classList.toggle("hidden");
        });
        console.log("✓ Desktop profile menu set up");
    }

    // Close menu when clicking outside (desktop)
    if (profileDropdown) {
        document.addEventListener("click", (e) => {
            const container = document.getElementById("profile-menu-container");
            if (container && !e.target.closest("#profile-menu-container")) {
                profileDropdown.classList.add("hidden");
            }
        });
    }

    // Handle desktop logout
    if (menuLogout) {
        console.log("Setting up desktop logout button...");
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
        console.log("✓ Desktop logout button set up");
    }
    
    // Handle mobile logout
    if (mobileMenuLogout) {
        console.log("Setting up mobile logout button...");
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
        console.log("✓ Mobile logout button set up");
    }

    console.log("✓ All event listeners set up, now calling checkAuthState");
    
    // Check auth state and update header
    try {
        checkAuthState((user) => {
            console.log("✓✓✓ checkAuthState callback FIRED with user:", user ? user.email : "NULL");
            updateHeaderAuthState(user);
        });
    } catch (error) {
        console.error("❌ Error calling checkAuthState:", error);
        // Try fallback: directly check if user is logged in
        console.log("⚠️ Attempting fallback auth check...");
        updateHeaderAuthState(null);
    }
}
// Make initializeHeaderAuth available globally for direct calls
try {
    console.log("📍 About to assign initializeHeaderAuth to window...");
    console.log("  - typeof initializeHeaderAuth:", typeof initializeHeaderAuth);
    
    window.initializeHeaderAuth = initializeHeaderAuth;
    
    console.log("✅ window.initializeHeaderAuth is NOW AVAILABLE on window object");
    console.log("  - window.initializeHeaderAuth defined:", typeof window.initializeHeaderAuth);
} catch (error) {
    console.error("❌ ERROR assigning initializeHeaderAuth to window:", error);
    console.error("  - Error message:", error.message);
    console.error("  - Error stack:", error.stack);
    
    // Fallback: create a placeholder
    window.initializeHeaderAuth = function() {
        console.error("❌ initializeHeaderAuth stub called - original function failed to load!");
    };
}

// Clear the loading flag
window.__headerAuthLoading = false;
console.log("📍 Set window.__headerAuthLoading = false - module fully loaded");

// Initialize on DOMContentLoaded (for pages with inline header)
console.log("📌 Registering DOMContentLoaded listener... (current readyState:", document.readyState + ")");

window.addEventListener("DOMContentLoaded", () => {
    console.log("\n▓▓▓ DOMContentLoaded EVENT FIRED ▓▓▓");
    
    // Check if header exists directly in the page (inline)
    const hasInlineHeader = document.getElementById("profile-menu-button") !== null;
    
    if (hasInlineHeader) {
        console.log("✓ Found inline header elements in DOM, calling initializeHeaderAuth immediately");
        setTimeout(initializeHeaderAuth, 50); // Small delay to ensure DOM is ready
    } else {
        console.log("⚠️ No inline header found, waiting for components to load via component-loader");
    }
});

// FALLBACK: If DOMContentLoaded has already fired, call our handler immediately
if (document.readyState !== "loading") {
    console.log("📌 DOMContentLoaded likely already fired, triggering handler now...");
    setTimeout(() => {
        console.log("\n▓▓▓ Fallback DOMContentLoaded handler (delayed) ▓▓▓");
        const hasInlineHeader = document.getElementById("profile-menu-button") !== null;
        if (hasInlineHeader) {
            console.log("✓ Found inline header elements in DOM, calling initializeHeaderAuth");
            setTimeout(initializeHeaderAuth, 50);
        } else {
            console.log("⚠️ No inline header found, waiting for components to load");
        }
    }, 100);
}

// Initialize on componentsLoaded (for pages using component loader)
console.log("📌 Registering componentsLoaded listener...");

window.addEventListener("componentsLoaded", () => {
    console.log("\n▓▓▓ componentsLoaded EVENT FIRED ▓▓▓");
    console.log("Components loaded via component-loader, calling initializeHeaderAuth");
    
    // Check that header elements now exist
    const profileMenuButton = document.getElementById("profile-menu-button");
    const mobileMenuButton = document.getElementById("mobile-menu-button");
    
    console.log("After component load - profileMenuButton found:", !!profileMenuButton);
    console.log("After component load - mobileMenuButton found:", !!mobileMenuButton);
    
    if (profileMenuButton && mobileMenuButton) {
        initializeHeaderAuth();
    } else {
        console.log("⚠️ Header elements not found after components loaded, retrying in 200ms...");
        setTimeout(initializeHeaderAuth, 200);
    }
});

console.log("\n╔════════════════════════════════════════════╗");
console.log("║  🔐 header-auth.js MODULE LOADED           ║");
console.log("║  Waiting for DOMContentLoaded or          ║");
console.log("║  componentsLoaded events...                ║");
console.log("╚════════════════════════════════════════════╝\n");
