const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { execFile } = require('child_process');

let mainWindow;

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'renderer.js'),
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true, 
    },
  });

  mainWindow.loadFile('index.html');
  mainWindow.webContents.openDevTools()

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});

ipcMain.handle('select-image', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Images', extensions: ['jpg', 'png', 'gif'] },
    ],
  });
  return result.filePaths[0]; // Return the selected file path.
});

ipcMain.handle('blur-image', async (_, inputPath) => {
    const outputPath = path.join(__dirname, 'blurred_image.jpg');
    return new Promise((resolve, reject) => {
      execFile('python', [path.join(__dirname, 'image_blur.py'), inputPath, outputPath], (error, stdout, stderr) => {
        if (error) {
          console.error('Error executing Python script:', stderr);
          reject(stderr);
        } else {
          console.log('Python script output:', stdout);
          resolve(outputPath); // Send the path to the blurred image
        }
      });
    });
});
