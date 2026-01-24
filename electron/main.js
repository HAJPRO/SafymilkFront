const { app, BrowserWindow,ipcMain } = require('electron');
const path = require('path');
const si = require('systeminformation');
const { autoUpdater } = require("electron-updater");

// Dastur ishga tushganda yangilanishlarni tekshirish
app.on('ready', () => {
  autoUpdater.checkForUpdatesAndNotify();
});

// Yangilanish yuklab bo'lingach, xabar berish
autoUpdater.on('update-downloaded', () => {
  // Foydalanuvchiga xabar chiqarish yoki dasturni avtomatik yangilash
  autoUpdater.quitAndInstall();
});
function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    // Title bar sarlavhasi
    title: "Safymilk | ERP System", 
    // Ikonka manzili (Fayl mavjudligiga ishonch hosil qiling)
    icon: path.join(__dirname, 'safymilk_logo_7'), 
    webPreferences: {
      nodeIntegration: false,
    contextIsolation: true,
    preload: path.join(__dirname, 'preload.js'),
      // DevTools-ni har doim ochiq saqlash (Siz so'ragan qator)
      devTools: true 
    },
  });

  // Vite build qilgan index.html ni yuklash
  win.loadFile(path.join(__dirname, '../dist/index.html'));

  // Xatolarni ko'rish uchun DevTools-ni darhol ochish
  win.webContents.openDevTools();

  // Menyuni olib tashlash (Agar kerak bo'lsa, toza ko'rinish uchun)
  // win.setMenu(null); 
}

// Front-enddan 'get-usb-devices' so'rovi kelganda ishlaydi

ipcMain.handle('get-printers', async () => {
  // Barcha oynalar ichidan hozirgisini olamiz
  const win = BrowserWindow.getAllWindows()[0]; 
  if (!win) return [];
  // Electron'ning o'zining printer olish funksiyasi
  return await win.webContents.getPrintersAsync();
});


// Front-enddan chop etish so'rovi kelganda
ipcMain.handle('print-to-printer', async (event, { content, printerName, width, height }) => {
  const win = new BrowserWindow({
    show: false,
    webPreferences: { offscreen: true }
  });

  await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(content)}`);

  return new Promise((resolve, reject) => {
    // Kontent to'liq yuklanishi uchun qisqa vaqt kutamiz
    setTimeout(() => {
      win.webContents.print({
        silent: true,
        deviceName: printerName,
        printBackground: true,
        margins: { marginType: 'none' }, // Chekka masofalarni nolga tushiradi
        pageSize: { 
          width: width * 1000, 
          height: height * 1000 
        },
        scaleFactor: 100 // Masshtabni 1:1 saqlaydi
      }, (success, failureReason) => {
        win.close();
        if (success) resolve(true);
        else reject(failureReason);
      });
    }, 500); 
  });
});




app.whenReady().then(createWindow);

// ... qolgan kodlar o'zgarishsiz qoladi