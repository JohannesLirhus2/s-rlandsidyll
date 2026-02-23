# Component System - Sørlandsidyll

## Overview
The website now uses a reusable component system for header and footer elements. This simplifies maintenance by centralizing common HTML in separate files.

## Structure
```
components/
  ├── header.html  - Reusable header with navigation
  └── footer.html  - Reusable footer
assets/
  ├── component-loader.js - Loads components into pages
  ├── header-auth.js - Handles authentication & header updates
  └── ...other assets
```

## How It Works

### 1. Component Files
- `components/header.html` - Contains the complete header markup
- `components/footer.html` - Contains the complete footer markup

### 2. Component Loader
The `component-loader.js` module:
- Automatically loads components on page load
- Caches component HTML to avoid repeated fetches
- Dispatches `componentsLoaded` event when ready

### 3. Using Components in Pages

Add to `<head>`:
```html
<script type="module" src="assets/component-loader.js"></script>
```

In `<body>`, replace header/footer with placeholders:
```html
<body>
  <div id="header-placeholder"></div>
  <main>
    <!-- Page content -->
  </main>
  <div id="footer-placeholder"></div>
</body>
```

### 4. Firebase Optimization
- User access data is cached to avoid duplicate Firebase calls
- Author data is cached per session
- Caches are cleared on logout

## Benefits
1. **Single Source of Truth**: Edit header/footer once, applies everywhere
2. **Reduced Redundancy**: No duplicated HTML across pages
3. **Better Performance**: Cached Firebase requests
4. **Easier Maintenance**: Changes propagate automatically

## Migration Status
✅ index.html
✅ oppskrifter.html
✅ oppskrift.html
✅ ny-oppskrift.html
✅ min-konto.html
✅ min-konto-adm.html
✅ login.html

All pages successfully migrated to component system!
