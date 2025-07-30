document.addEventListener('DOMContentLoaded', () => {
    // --- GLOBAL STATE & CONFIG ---
    let CONFIG = {};
    let FILE_SYSTEM = {};
    let currentLang = 'en';
    let availableLangs = ['en'];
    let currentPath = [];
    let historyStack = [];

    // --- BASE FILE SYSTEM STRUCTURE (using universal, non-language keys) ---
    const BASE_FILE_SYSTEM = {
        "PC": { type: 'folder', children: {
            "C_DRIVE": { type: 'folder', children: {
                "Users": { type: 'folder', children: {
                    "Admin": { type: 'folder', children: {
                        "Desktop": { type: 'folder', children: {} },
                        "Documents": { type: 'folder', children: {} },
                        "Downloads": { type: 'folder', children: {} },
                    }}
                }},
                "ProgramFiles": { type: 'folder', children: {} },
                "Windows": { type: 'folder', children: {} }
            }},
            "D_DRIVE": { type: 'folder', children: {} }
        }}
    };

    // --- DOM ELEMENTS ---
    const getEl = (id) => document.getElementById(id);
    const desktop = getEl('desktop');
    const allWindows = document.querySelectorAll('.window');
    const folderWindow = { el: getEl('folderWindow'), title: getEl('folderWindow').querySelector('.title-bar-title'), body: getEl('folderWindow').querySelector('.window-body'), minimizeBtn: getEl('folderWindow').querySelector('.minimize-btn'), maximizeBtn: getEl('folderWindow').querySelector('.maximize-btn'), closeBtn: getEl('folderWindow').querySelector('.close-btn'), backBtn: getEl('backButton'), addressBar: getEl('addressBar') };
    const textViewerWindow = { el: getEl('textViewerWindow'), title: getEl('textViewerWindow').querySelector('.title-bar-title'), body: getEl('textViewerWindow').querySelector('.window-body'), minimizeBtn: getEl('textViewerWindow').querySelector('.minimize-btn'), maximizeBtn: getEl('textViewerWindow').querySelector('.maximize-btn'), closeBtn: getEl('textViewerWindow').querySelector('.close-btn') };
    const imageViewerWindow = { el: getEl('imageViewerWindow'), title: getEl('imageViewerWindow').querySelector('.title-bar-title'), img: getEl('imageViewerContent'), minimizeBtn: getEl('imageViewerWindow').querySelector('.minimize-btn'), maximizeBtn: getEl('imageViewerWindow').querySelector('.maximize-btn'), closeBtn: getEl('imageViewerWindow').querySelector('.close-btn') };
    const gameWindow = { el: getEl('gameWindow'), title: getEl('gameWindow').querySelector('.title-bar-title'), frame: getEl('gameFrame'), minimizeBtn: getEl('gameWindow').querySelector('.minimize-btn'), maximizeBtn: getEl('gameWindow').querySelector('.maximize-btn'), closeBtn: getEl('gameWindow').querySelector('.close-btn') };
    const settingsWindow = { el: getEl('settingsWindow'), title: getEl('settingsWindow').querySelector('.title-bar-title'), body: getEl('settingsWindow').querySelector('.window-body'), minimizeBtn: getEl('settingsWindow').querySelector('.minimize-btn'), maximizeBtn: getEl('settingsWindow').querySelector('.maximize-btn'), closeBtn: getEl('settingsWindow').querySelector('.close-btn') };
    const videoViewerWindow = { el: getEl('videoViewerWindow'), title: getEl('videoViewerWindow').querySelector('.title-bar-title'), video: getEl('videoViewerContent'), minimizeBtn: getEl('videoViewerWindow').querySelector('.minimize-btn'), maximizeBtn: getEl('videoViewerWindow').querySelector('.maximize-btn'), closeBtn: getEl('videoViewerWindow').querySelector('.close-btn') };
    const iframeViewerWindow = { el: getEl('iframeViewerWindow'), title: getEl('iframeViewerWindow').querySelector('.title-bar-title'), frame: getEl('iframeViewerContent'), minimizeBtn: getEl('iframeViewerWindow').querySelector('.minimize-btn'), maximizeBtn: getEl('iframeViewerWindow').querySelector('.maximize-btn'), closeBtn: getEl('iframeViewerWindow').querySelector('.close-btn') };
    const clock = getEl('clock');
    const startButton = getEl('startButton');
    const startMenu = getEl('startMenu');
    const languageSwitcher = getEl('languageSwitcher');
    const taskbarApps = getEl('taskbar-apps');

    // --- SVG ICONS ---
    const ICONS = { folder: `<svg xmlns="http://www.w3.org/2000/svg" fill="#4285F4" viewBox="0 0 48 48"><path d="M40 8H24l-4-4H8c-2.21 0-3.98 1.79-3.98 4L4 36c0 2.21 1.79 4 4 4h32c2.21 0 4-1.79 4-4V12c0-2.21-1.79-4-4-4z"/></svg>`, file: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M38 6H10c-2.21 0-4 1.79-4 4v28c0 2.21 1.79 4 4 4h28c2.21 0 4-1.79 4-4V14l-8-8z" fill="#90a4ae"/><path d="M28 6v10h10L28 6z" fill="#cfd8dc"/><path d="M38 42H10c-2.21 0-4-1.79-4-4V10c0-2.21 1.79-4 4-4h18" fill="#fff"/><path d="M18 22h12v2H18zm0 6h12v2H18zm0 6h8v2h-8z" fill="#7f8c8d"/></svg>`, image: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><g><path d="M38 6H10c-2.21 0-4 1.79-4 4v28c0 2.21 1.79 4 4 4h28c2.21 0 4-1.79 4-4V14l-8-8z" fill="#2196f3"/><path d="M28 6v10h10L28 6z" fill="#bbdefb"/><path d="M38 42H10c-2.21 0-4-1.79-4-4V10c0-2.21 1.79-4 4-4h18" fill="#e3f2fd"/><path d="m32 27-6 8-5-6-7 9h26l-8-11z" fill="#78909c"/></g></svg>`, game: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><g><path d="M38 6H10c-2.21 0-4 1.79-4 4v28c0 2.21 1.79 4 4 4h28c2.21 0 4-1.79 4-4V14l-8-8z" fill="#ff9800"/><path d="M28 6v10h10L28 6z" fill="#ffcc80"/><path d="M38 42H10c-2.21 0-4-1.79-4-4V10c0-2.21 1.79-4 4-4h18" fill="#fff3e0"/><path d="M18.6 33l-3.6-2.1 6-10.2 3.6 2.1-6 10.2zm12-12l-6-3.5-2.4 4.1 6 3.5 2.4-4.1z" fill="#795548"/></g></svg>`,
        video: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><g><path d="M38 6H10c-2.21 0-4 1.79-4 4v28c0 2.21 1.79 4 4 4h28c2.21 0 4-1.79 4-4V14l-8-8z" fill="#E53935"/><path d="M28 6v10h10L28 6z" fill="#FFCDD2"/><path d="M38 42H10c-2.21 0-4-1.79-4-4V10c0-2.21 1.79-4 4-4h18" fill="#FFEBEE"/><path d="M22 34V22l12 6-12 6z" fill="#B71C1C"/></g></svg>`,
        iframe: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><g><path d="M38 6H10c-2.21 0-4 1.79-4 4v28c0 2.21 1.79 4 4 4h28c2.21 0 4-1.79 4-4V14l-8-8z" fill="#039BE5"/><path d="M28 6v10h10L28 6z" fill="#B3E5FC"/><path d="M38 42H10c-2.21 0-4-1.79-4-4V10c0-2.21 1.79-4 4-4h18" fill="#E1F5FE"/><g fill="none" stroke="#01579B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M24 36c4.42 0 8-3.58 8-8s-3.58-8-8-8-8 3.58-8 8 3.58 8 8 8zM16 28h16M24 20c-2.21 2.67-2.21 9.33 0 12"/></g></g></svg>`};

    // --- UTILITIES & HELPERS ---
    const logError = (...args) => console.error('[QuestApp]', ...args);
    const getQuestPath = () => 'quest.json';
    const deepMerge = (target, source) => { for (const key in source) { if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) { if (!target[key]) Object.assign(target, { [key]: {} }); deepMerge(target[key], source[key]); } else { Object.assign(target, { [key]: source[key] }); } } return target; };
    const getLangString = (key, fallback = key) => CONFIG.localization?.[currentLang]?.[key] || fallback;
    const getSystemName = (key) => CONFIG.localization?.[currentLang]?.systemNames?.[key] || key;
    
    // --- WINDOW MANAGEMENT ---
    const setActiveWindow = (winEl) => { allWindows.forEach(win => { win.classList.remove('active'); win.style.zIndex = 998; }); if (winEl) { winEl.classList.add('active'); winEl.style.zIndex = 999; } };
    const openWindow = (winObj, title) => { winObj.el.classList.remove('hidden'); winObj.el.dataset.minimized = 'false'; setActiveWindow(winObj.el); if (title) winObj.title.textContent = title; updateTaskbar(); };
    
    const closeWindow = (winObj) => {
        winObj.el.classList.add('hidden');
        winObj.el.dataset.minimized = 'false';
        if (winObj.el.classList.contains('maximized')) {
            winObj.el.classList.remove('maximized');
        }

        if (winObj === videoViewerWindow) {
            winObj.video.pause();
            winObj.video.src = '';
        }
        if (winObj === iframeViewerWindow || winObj === gameWindow) {
            winObj.frame.src = 'about:blank';
        }
    
        // If the window being closed is the main folder explorer,
        // reset its path and history to prevent the "memory" bug.
        if (winObj === folderWindow) {
            currentPath = [];
            historyStack = [];
        }
    
        updateTaskbar();
    };

    const handleMinimize = (winObj) => { winObj.el.classList.add('hidden'); winObj.el.dataset.minimized = 'true'; updateTaskbar(); };
    const handleMaximize = (winObj) => { const winEl = winObj.el; if (winEl.classList.contains('maximized')) { const old = winEl.dataset.oldPosition.split(','); winEl.style.left = old[0]; winEl.style.top = old[1]; winEl.style.width = old[2]; winEl.style.height = old[3]; winEl.classList.remove('maximized'); } else { winEl.dataset.oldPosition = `${winEl.style.left},${winEl.style.top},${winEl.offsetWidth}px,${winEl.offsetHeight}px`; winEl.classList.add('maximized'); } };
    const makeDraggable = (windowEl) => { const titleBarEl = windowEl.querySelector('.title-bar'); if (!titleBarEl) return; let isDragging = false, offsetX, offsetY; const dragStart = (e) => { if (e.target.tagName === 'BUTTON' || windowEl.classList.contains('maximized')) return; isDragging = true; const event = e.type === 'touchstart' ? e.touches[0] : e; offsetX = event.clientX - windowEl.offsetLeft; offsetY = event.clientY - windowEl.offsetTop; document.body.style.cursor = 'move'; setActiveWindow(windowEl); }; const dragMove = (e) => { if (isDragging) { const event = e.type === 'touchmove' ? e.touches[0] : e; let newX = event.clientX - offsetX; let newY = event.clientY - offsetY; const desktopRect = desktop.getBoundingClientRect(); newX = Math.max(0, Math.min(newX, desktopRect.width - windowEl.offsetWidth)); newY = Math.max(0, Math.min(newY, desktopRect.height - windowEl.offsetHeight)); windowEl.style.left = `${newX}px`; windowEl.style.top = `${newY}px`; } }; const dragEnd = () => { isDragging = false; document.body.style.cursor = 'default'; }; titleBarEl.addEventListener('mousedown', dragStart); document.addEventListener('mousemove', dragMove); document.addEventListener('mouseup', dragEnd); titleBarEl.addEventListener('touchstart', dragStart, { passive: false }); document.addEventListener('touchmove', dragMove, { passive: false }); document.addEventListener('touchend', dragEnd); windowEl.addEventListener('mousedown', () => setActiveWindow(windowEl)); };
    
    // --- TASKBAR ---
    const updateTaskbar = () => {
        taskbarApps.innerHTML = '';
        const allWinObjs = [folderWindow, textViewerWindow, imageViewerWindow, gameWindow, settingsWindow, videoViewerWindow, iframeViewerWindow];
        allWinObjs.forEach(winObj => {
            const win = winObj.el;
            if (!win.classList.contains('hidden') || win.dataset.minimized === 'true') {
                const appBtn = document.createElement('button');
                appBtn.className = 'taskbar-app';
                appBtn.textContent = winObj.title.textContent;
                appBtn.onclick = () => {
                    if (win.dataset.minimized === 'true') { openWindow(winObj, winObj.title.textContent); }
                    else if (win.classList.contains('active')) { handleMinimize(winObj); }
                    else { setActiveWindow(win); }
                };
                taskbarApps.appendChild(appBtn);
            }
        });
    };

    // --- FILE SYSTEM & NAVIGATION ---
    const goBack = () => { if (historyStack.length > 0) { currentPath = historyStack.pop(); renderFolderContents(currentPath); } };
    const getObjectByPath = (pathArray) => { let currentLevel = FILE_SYSTEM; for (const part of pathArray) { if (currentLevel[part]?.children) { currentLevel = currentLevel[part].children; } else { logError("Path not found on part:", part); return null; } } return currentLevel; };
    const renderFolderContents = (pathArray) => { const content = getObjectByPath(pathArray); folderWindow.body.innerHTML = ''; if (content === null) { folderWindow.body.innerHTML = `<p>Cannot access this folder.</p>`; return; } const sortedKeys = Object.keys(content).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })); sortedKeys.forEach(name => { const item = content[name]; const iconDiv = document.createElement('div'); iconDiv.className = 'folder-icon'; iconDiv.tabIndex = 0; iconDiv.innerHTML = ICONS[item.type] || ICONS.file; const p = document.createElement('p'); p.textContent = item.type === 'folder' ? getSystemName(name) : name; iconDiv.appendChild(p); iconDiv.addEventListener('dblclick', () => handleItemDoubleClick(name, item)); folderWindow.body.appendChild(iconDiv); }); updateWindowTitleAndAddress(); };
    const handleItemDoubleClick = (name, item) => { const displayName = item.type === 'folder' ? getSystemName(name) : name; switch (item.type) { case 'folder': historyStack.push([...currentPath]); currentPath.push(name); renderFolderContents(currentPath); break; case 'file': openWindow(textViewerWindow, `${displayName} ${getLangString('notepadTitleSuffix')}`); textViewerWindow.body.textContent = item.content || ""; break; case 'image': openWindow(imageViewerWindow, displayName); imageViewerWindow.img.src = item.src || ''; break; case 'game': openWindow(gameWindow, displayName); gameWindow.frame.src = item.src || ''; break;         case 'video':
    openWindow(videoViewerWindow, displayName);
    videoViewerWindow.video.src = item.src || '';
    break;
case 'iframe':
    openWindow(iframeViewerWindow, displayName);
    iframeViewerWindow.frame.src = item.src || '';
    break; default: logError("Unknown file type:", item.type); } };
    
    const updateWindowTitleAndAddress = () => {
        const displayPath = getDisplayPath(currentPath);
        const title = displayPath.length > 0 ? displayPath[displayPath.length - 1] : getSystemName('PC');
        folderWindow.title.textContent = title;
        folderWindow.addressBar.innerHTML = '';
        displayPath.forEach((part, index) => {
            const span = document.createElement('span');
            span.textContent = part;
            span.className = 'breadcrumb-part';
            span.onclick = () => {
                const realPathIndex = currentPath.findIndex(p => getSystemName(p) === part);
                if(realPathIndex > -1) {
                    currentPath = currentPath.slice(0, realPathIndex + 1);
                    renderFolderContents(currentPath);
                }
            };
            folderWindow.addressBar.appendChild(span);
            if (index < displayPath.length - 1) {
                const separator = document.createElement('span');
                separator.className = 'breadcrumb-separator';
                separator.textContent = ` ${getLangString('addressSeparator')} `;
                folderWindow.addressBar.appendChild(separator);
            }
        });
        folderWindow.addressBar.scrollLeft = folderWindow.addressBar.scrollWidth;
        updateTaskbar();
    };

    const getDisplayPath = (path) => {
        // const desktopPathPrefix = ["PC", "C_DRIVE", "Users", "Admin", "Desktop"];
        // if (path.length >= desktopPathPrefix.length && desktopPathPrefix.every((v, i) => v === path[i])) {
        //     const deeperPath = path.slice(desktopPathPrefix.length);
        //     return [getSystemName("Desktop"), ...deeperPath.map(p => getSystemName(p))];
        // }
        return path.map(p => getSystemName(p));
    };

    // --- UI & APP LIFECYCLE ---
    const updateClock = () => { if (clock) clock.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); };
    const setTheme = (themeName) => { document.body.className = `${themeName}-theme`; };
    const setLanguage = (langCode) => { if (!CONFIG.localization?.[langCode]) { logError(`Language "${langCode}" not found in config.`); return; } currentLang = langCode; getEl('languageSwitcher').textContent = langCode.toUpperCase(); translateUI(); };
    const translateUI = () => { getEl('wallpaperOverlay').textContent = getLangString('welcomeText'); getEl('startMenuTitle').textContent = getLangString('startMenuTitle'); getEl('startMenuExplorer').textContent = getLangString('startExplorer'); getEl('startMenuSettings').textContent = getLangString('startSettings'); getEl('startMenuShutdown').textContent = getLangString('startShutdown'); settingsWindow.title.textContent = getLangString('settingsWindowTitle'); getEl('themeLabel').textContent = getLangString('themeLabel'); getEl('themeDarkOption').textContent = getLangString('themeDark'); getEl('themeLightOption').textContent = getLangString('themeLight'); imageViewerWindow.img.alt = getLangString('imagePreview'); if(!folderWindow.el.classList.contains('hidden')) { updateWindowTitleAndAddress(); renderFolderContents(currentPath); }};
    const cycleLanguage = () => { const currentIndex = availableLangs.indexOf(currentLang); const nextIndex = (currentIndex + 1) % availableLangs.length; setLanguage(availableLangs[nextIndex]); };
    const openRootExplorer = () => { currentPath = ['PC']; historyStack = []; renderFolderContents(currentPath); openWindow(folderWindow, getSystemName('PC')); };
    const setupEventListeners = () => { const windows = [folderWindow, textViewerWindow, imageViewerWindow, gameWindow, settingsWindow, videoViewerWindow, iframeViewerWindow]; windows.forEach(win => { win.closeBtn.addEventListener('click', () => closeWindow(win)); win.minimizeBtn.addEventListener('click', () => handleMinimize(win)); win.maximizeBtn.addEventListener('click', () => handleMaximize(win)); }); folderWindow.backBtn.addEventListener('click', goBack); const startButton = getEl('startButton'); const startMenu = getEl('startMenu'); startButton.addEventListener('click', (e) => { e.stopPropagation(); startMenu.classList.toggle('hidden'); }); getEl('desktop').addEventListener('click', () => { if (!startMenu.classList.contains('hidden')) startMenu.classList.add('hidden'); }); getEl('languageSwitcher').addEventListener('click', cycleLanguage); getEl('startMenuExplorer').addEventListener('click', () => { startMenu.classList.add('hidden'); openRootExplorer(); }); getEl('startMenuSettings').addEventListener('click', () => { startMenu.classList.add('hidden'); openWindow(settingsWindow, getLangString('settingsWindowTitle')); }); getEl('startMenuShutdown').addEventListener('click', () => { startMenu.classList.add('hidden'); if (confirm(getLangString('shutdownConfirm'))) window.close(); }); getEl('themeSelector').addEventListener('change', (e) => setTheme(e.target.value)); };
    const generateEmptyFolders = () => { const gen = CONFIG.settings?.folderGeneration; if (!gen?.enabled || !gen.targetPath || !gen.count) return; try { let target = FILE_SYSTEM; for (const part of gen.targetPath) { target = target[part].children; } const nameTemplate = getLangString('folderNameTemplate', 'Folder {}'); for (let i = 1; i <= gen.count; i++) { const folderName = nameTemplate.replace('{}', i); if (!target[folderName]) { target[folderName] = { type: 'folder', children: {} }; } } } catch (e) { logError("Failed to generate folders:", e); } };
    const setupWelcomeScreen = () => { const welcomeScreen = CONFIG.settings?.welcomeScreen; const loadingWallpaper = CONFIG.settings?.wallpapers?.loading; const defaultWallpaper = CONFIG.settings?.wallpapers?.default; if (loadingWallpaper) desktop.style.backgroundImage = `url('${loadingWallpaper}')`; if (welcomeScreen?.enabled) { setTimeout(() => { getEl('wallpaperOverlay').classList.add('hidden'); if (defaultWallpaper) desktop.style.backgroundImage = `url('${defaultWallpaper}')`; }, welcomeScreen.duration || 3000); } else { getEl('wallpaperOverlay').classList.add('hidden'); if (defaultWallpaper) desktop.style.backgroundImage = `url('${defaultWallpaper}')`; } };
    const setupDesktop = () => { if (!CONFIG.desktopItems) return; Object.entries(CONFIG.desktopItems).forEach(([id, item]) => { const iconEl = document.createElement('div'); iconEl.id = id; iconEl.className = 'icon'; iconEl.tabIndex = 0; if (item.style) Object.assign(iconEl.style, item.style); iconEl.innerHTML = item.iconSVG || ICONS[item.type] || ICONS.file; const p = document.createElement('p'); p.textContent = item.name; iconEl.appendChild(p); iconEl.addEventListener('dblclick', () => { currentPath = [...item.targetPath] || []; historyStack = []; renderFolderContents(currentPath); openWindow(folderWindow, getSystemName(currentPath[currentPath.length-1])); }); desktop.appendChild(iconEl); }); };

    // --- APP ENTRY POINT ---
    const initApp = () => {
        try {
            FILE_SYSTEM = deepMerge(JSON.parse(JSON.stringify(BASE_FILE_SYSTEM)), CONFIG.fileSystem);
            currentLang = CONFIG.settings?.defaultLanguage || 'en';
            availableLangs = Object.keys(CONFIG.localization || { en: {} });
            generateEmptyFolders();
            setupWelcomeScreen();
            setupDesktop();
            setupEventListeners();
            setLanguage(currentLang);
            updateClock();
            setInterval(updateClock, 30000);
            allWindows.forEach(win => makeDraggable(win));
        } catch (error) {
            logError("Error during app initialization:", error);
            desktop.innerHTML = `<div style="color: yellow; text-align: center; padding: 20px;">An error occurred during app initialization.</div>`;
        }
    };

    fetch(getQuestPath())
        .then(res => { if (!res.ok) throw new Error(`HTTP error ${res.status}`); return res.json() })
        .then(config => { CONFIG = config; initApp(); })
        .catch(err => { logError("Fatal: Could not load or parse quest file.", err); });
});