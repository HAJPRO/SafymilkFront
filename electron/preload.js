const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getPrinters: () => ipcRenderer.invoke('get-printers'),
  getUsbDevices: () => ipcRenderer.invoke('get-usb-devices'),
  printToPrinter: (data) => ipcRenderer.invoke('print-to-printer', data) // Yangi qator
  
});