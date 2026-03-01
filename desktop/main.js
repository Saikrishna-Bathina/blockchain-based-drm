const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        backgroundColor: '#000000',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        title: "Secure DRM Delivery",
        icon: path.join(__dirname, 'icon.png') // Path to icon if you have one
    });

    // Enable protection to block screenshots and screen recordings
    mainWindow.setContentProtection(true);

    // DEBUG: Open DevTools to see console errors
    mainWindow.webContents.openDevTools();

    // Load the frontend (Vite dev server or production build)
    // For development, we use localhost:5173 (standard Vite port)
    const startUrl = process.env.ELECTRON_START_URL || 'http://localhost:5173';
    mainWindow.loadURL(startUrl);

    // Disable Default Context Menu
    mainWindow.webContents.on('context-menu', (e) => {
        e.preventDefault();
    });

    // Prevent navigation to external sites
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    // Disable Developer Tools in production
    if (app.isPackaged) {
        mainWindow.webContents.on('devtools-opened', () => {
            mainWindow.webContents.closeDevTools();
        });
    }
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});
