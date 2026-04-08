


/*


    DENNE KODEN ER UNDER UTVIKLING!

    Denne versjonen er ikkje publisert til Github per no, og er ikkje ferdig utvikla. 
    Dersom ein publiserer denne versjonen til main, vil det ikkje fungere - og sida vil gå ned. 




*/






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
let currentAuthor = "";

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

// Function to search recipes with client-side filtering
export async function searchRecipes(searchQuery = "", tag = null, author = null) {
    let recipes = allRecipes;

    if (author && author.trim() !== "") {
        const authorQuery = author.toLowerCase().trim();
        recipes = recipes.filter(recipe => (recipe.author || "").toLowerCase() === authorQuery);
    }
    
    //Filter by tag
    if (tag) {
    recipes = recipes.filter(recipe => recipe[tag.toLowerCase()] === true);
}

    // Filter by text search if provided
    if (searchQuery && searchQuery.trim() !== "") {
        const lowerQuery = searchQuery.toLowerCase().trim();
        recipes = recipes.filter(recipe => {
            const title = (recipe.title || "").toLowerCase();
            const description = (recipe.description || "").toLowerCase();
            return title.includes(lowerQuery) || description.includes(lowerQuery);
        });
    }
    
    return recipes;
}


// Function to render recipes in the container
export function renderRecipes(recipes) {
    const container = document.getElementById("recipesContainer");
    if (!container) return;
    
    container.innerHTML = "";
    
    //Ingen oppskrifter beskjed
    if (recipes.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center py-12"><p class="text-slate-500 text-sm">Ingen oppskrifter funnet.</p></div>';
        return;
    }
    
    //Oppskrifter loop
    recipes.forEach((recipe) => {
        const recipeCard = document.createElement("a");
        recipeCard.href = `oppskrift.html?id=${recipe.id}`;
        recipeCard.className = "group cursor-pointer bg-white border border-slate-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow block";
        
        const imageUrl = recipe.img_url || "https://via.placeholder.com/400";
        const title = recipe.title || "Recipe";
        const description = recipe.description || "";
        const category = recipe.category || "Oppskrift"; // You may want to add category field to Firebase
        
        recipeCard.innerHTML = `
            <div class="relative aspect-square overflow-hidden bg-slate-100">
                <img alt="${title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="${imageUrl}"/>
                <div class="absolute top-2 left-2">
                    <span class="bg-white/90 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-accent border border-slate-100 shadow-sm">${category}</span>
                </div>
            </div>
            <div class="p-4">
                <h3 class="text-base font-bold text-slate-900 group-hover:text-accent transition-colors line-clamp-1 mb-1">${title}</h3>
                <p class="text-slate-500 font-display text-xs line-clamp-2 leading-relaxed">${description}</p>
            </div>
        `;
        
        container.appendChild(recipeCard);
    });
}

//Global søkefunksjon
export async function searchAndRenderRecipes(query = "", tag = null, author = null){
    renderRecipes(await searchRecipes(query, tag, author));
}

//Check for URL parameters.
async function URL_params_search() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('q') || "";
    const authorQuery = urlParams.get('author') || "";
    const tagQuery = urlParams.get('tag') || "";

    currentAuthor = authorQuery;
    currentTag = tagQuery && tagQuery.trim() !== "" ? tagQuery.toLowerCase().trim() : currentTag;

    if (searchQuery || authorQuery || tagQuery) {
        // If there's a search query, perform the search
        const searchInput = document.getElementById("searchInput");
        const headerSearchInput = document.getElementById("headerSearchInput");
        
        if (searchInput) {
            searchInput.value = searchQuery;
        }
        if (headerSearchInput) {
            headerSearchInput.value = searchQuery;
        }

        const recipes = await searchRecipes(searchQuery || "", currentTag, currentAuthor || "");
        renderRecipes(recipes);
    } else {
        // Otherwise, render all recipes
        renderRecipes(allRecipes);
    }
}
        

// MAIN function
window.addEventListener("DOMContentLoaded", async () => {
    
    //Loading recipes
    allRecipes = await loadRecipes();

    //Sjekker etter søkeord i URL og filtrerer. 
    await URL_params_search();
     
    
    // Set up search functionality
    const searchInput = document.getElementById("searchInput");
    const headerSearchInput = document.getElementById("headerSearchInput");
    const headerSearchButton = document.getElementById("headerSearchButton");
    const searchButton = document.getElementById("searchButton");
    
    
    //Add event listeners hero section search
    if (searchInput && searchButton) {
        // Search on button click
        searchButton.addEventListener("click", async () => {
            const query = searchInput.value;
            await searchAndRenderRecipes(query);
        });
        
        // Search on Enter key
        searchInput.addEventListener("keypress", async (e) => {
            if (e.key === "Enter") {
                const query = searchInput.value;
                await searchAndRenderRecipes(query);
            }
        });
        
        // Search as user types (only for hero section search)
        searchInput.addEventListener("input", async () => {
            const query = searchInput.value;
            await searchAndRenderRecipes(query);
        });
    }
    
    // Add event listners for header searchbox
    if (headerSearchInput) {
        // Navigate on Enter key
        headerSearchInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                const query = headerSearchInput.value;
                if (query?.trim()) window.location.href = `https://sørlandsidyll.no/?q=${encodeURIComponent(query.trim())}`;
            }
        });
     
         // Header search button
    if (headerSearchButton) {
        headerSearchButton.addEventListener("click", () => {
            const query = headerSearchInput ? headerSearchInput.value : "";
            if (query?.trim()) window.location.href = `https://sørlandsidyll.no/?q=${encodeURIComponent(query.trim())}`;
        });
    }
    }
    
    // Set up tag filter buttons
    const tagFilterButtons = document.querySelectorAll(".tag-filter");
    const allButton = document.getElementById("tagFilter-all");
    const bannerButtons = document.querySelectorAll(".tag-filter[data-banner='true']");
    const sectionButtons = document.querySelectorAll(".tag-filter:not([data-banner='true'])");
    
    tagFilterButtons.forEach((button) => {
        button.addEventListener("click", async () => {
            const tag = button.getAttribute("data-tag");
            
            // Check if this button is already selected (toggle functionality)
            if (currentTag === tag) {
                // Toggle off - show all recipes
                currentTag = null;
                
                // Reset all button styling
                allButton.classList.add("bg-accent", "text-white");
                sectionButtons.forEach(btn => {
                    btn.classList.remove("bg-accent", "text-white");
                    btn.classList.add("bg-slate-100", "text-slate-600");
                });
                
                // Reset banner buttons to unselected state
                bannerButtons.forEach(btn => {
                    btn.classList.remove("bg-accent", "tag-filter-active-banner");
                    btn.classList.add("bg-white/10", "hover:bg-white/20");
                    btn.classList.add("text-white");
                });
            } else {
                // Toggle on - apply the filter
                currentTag = tag;
                
                // Update banner button styling (always white text, accent bg when selected)
                bannerButtons.forEach(btn => {
                    if (btn === button) {
                        btn.classList.add("bg-accent", "tag-filter-active-banner");
                        btn.classList.remove("bg-white/10", "hover:bg-white/20");
                    } else {
                        btn.classList.remove("bg-accent", "tag-filter-active-banner");
                        btn.classList.add("bg-white/10", "hover:bg-white/20");
                    }
                    btn.classList.add("text-white");
                });
                
                // Update section button styling (slate when unselected, accent when selected)
                sectionButtons.forEach(btn => {
                    if (btn === button) {
                        btn.classList.add("bg-accent", "text-white");
                        btn.classList.remove("bg-slate-100", "text-slate-600");
                    } else {
                        btn.classList.remove("bg-accent", "text-white");
                        btn.classList.add("bg-slate-100", "text-slate-600");
                    }
                });
                
                if (allButton) {
                    allButton.classList.remove("bg-accent", "text-white");
                    allButton.classList.add("bg-slate-100", "text-slate-600");
                }
            }
            
            // Re-apply search with Firebase query
            const searchInput = document.getElementById("searchInput");
            const query = searchInput ? searchInput.value : "";
            const recipes = await searchRecipes(query, currentTag, currentAuthor || "");
            renderRecipes(recipes);
        });
    });
    
    // "All" button to show all recipes
    if (allButton) {
        allButton.addEventListener("click", async () => {
            currentTag = null;
            
            // Update button styling
            allButton.classList.add("bg-accent", "text-white");
            sectionButtons.forEach(btn => {
                btn.classList.remove("bg-accent", "text-white");
                btn.classList.add("bg-slate-100", "text-slate-600");
            });
            
            // Reset banner buttons to unselected state
            bannerButtons.forEach(btn => {
                btn.classList.remove("bg-accent", "tag-filter-active-banner");
                btn.classList.add("bg-white/10", "hover:bg-white/20");
                btn.classList.add("text-white");
            });
            
            // Re-apply search with Firebase query
            const searchInput = document.getElementById("searchInput");
            const query = searchInput ? searchInput.value : "";
            const recipes = await searchRecipes(query, null, currentAuthor || "");
            renderRecipes(recipes);
        });
    }
});
