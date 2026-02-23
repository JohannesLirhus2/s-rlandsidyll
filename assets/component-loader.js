// Component Loader - Load reusable HTML components
// This module loads header and footer components into pages

class ComponentLoader {
    constructor() {
        this.cache = {};
        this.loadPromises = {};
    }

    async loadComponent(componentName, targetSelector) {
        try {
            // Check if already loading
            if (this.loadPromises[componentName]) {
                return await this.loadPromises[componentName];
            }

            // Check cache
            if (this.cache[componentName]) {
                this.insertComponent(componentName, targetSelector);
                return true;
            }

            // Load component
            this.loadPromises[componentName] = this.fetchComponent(componentName);
            const html = await this.loadPromises[componentName];
            
            this.cache[componentName] = html;
            this.insertComponent(componentName, targetSelector);
            
            return true;
        } catch (error) {
            console.error(`Error loading component ${componentName}:`, error);
            return false;
        } finally {
            delete this.loadPromises[componentName];
        }
    }

    async fetchComponent(componentName) {
        try {
            console.log(`    ⏳ Fetching component: components/${componentName}.html`);
            const response = await fetch(`components/${componentName}.html`);
            if (!response.ok) {
                throw new Error(`Failed to fetch component: HTTP ${response.status}`);
            }
            const html = await response.text();
            console.log(`    ✓ Successfully fetched ${componentName} component (${html.length} bytes)`);
            return html;
        } catch (error) {
            console.error(`    ❌ Error fetching ${componentName}:`, error);
            throw error;
        }
    }

    insertComponent(componentName, targetSelector) {
        console.log(`  🔧 Inserting ${componentName} component into ${targetSelector}`);
        const target = document.querySelector(targetSelector);
        if (target) {
            target.innerHTML = this.cache[componentName];
            console.log(`    ✓ Successfully inserted ${componentName} component`);
        } else {
            console.error(`    ❌ Target element not found: ${targetSelector}`);
        }
    }

    async loadAll(components) {
        const promises = components.map(({ name, target }) => 
            this.loadComponent(name, target)
        );
        return await Promise.all(promises);
    }
}

// Create singleton instance
const componentLoader = new ComponentLoader();

// Auto-load components on DOMContentLoaded
window.addEventListener('DOMContentLoaded', async () => {
    console.log("\n▓▓▓ Component Loader - DOMContentLoaded EVENT FIRED ▓▓▓");
    const componentsToLoad = [];

    // Check for header placeholder
    if (document.getElementById('header-placeholder')) {
        console.log("  ✓ Found header-placeholder, will load header component");
        componentsToLoad.push({ name: 'header', target: '#header-placeholder' });
    } else {
        console.log("  ⚠️ No header-placeholder found");
    }

    // Check for footer placeholder
    if (document.getElementById('footer-placeholder')) {
        console.log("  ✓ Found footer-placeholder, will load footer component");
        componentsToLoad.push({ name: 'footer', target: '#footer-placeholder' });
    } else {
        console.log("  ⚠️ No footer-placeholder found");
    }

    if (componentsToLoad.length > 0) {
        console.log(`  Loading ${componentsToLoad.length} component(s)...`);
        await componentLoader.loadAll(componentsToLoad);
        console.log("  ✓ All components loaded successfully");
        
        // Dispatch event to notify that components are loaded
        console.log("  Dispatching 'componentsLoaded' event...");
        window.dispatchEvent(new CustomEvent('componentsLoaded'));
        console.log("  ✓ componentsLoaded event dispatched");
    } else {
        console.log("  No components to load");
    }
});

export default componentLoader;
