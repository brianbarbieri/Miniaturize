const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { execFile } = require('child_process');

let mainWindow;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 800,
        webPreferences: {
        preload: path.join(__dirname, 'renderer.js'),    // enabling this loads things twice
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true, 
        },
    });

    mainWindow.loadFile('index.html');
    mainWindow.maximize();

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
});

ipcMain.handle('select-image', async () => {
  console.log('Selecting image...');
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Images', extensions: ['jpg', 'png', 'gif'] },
    ],
  });
  return result.filePaths[0]; // Return the selected file path.
});

ipcMain.handle('blur-image', async (_, { input_path, box, saturation }) => {
    // generate random uuid
    const uuid = Math.random().toString(36).substring(2, 9);
    const outputPath = path.join(__dirname, "temp",  uuid+ '_image.jpg');
    return new Promise((resolve, reject) => {
        // console.log(input_path, outputPath, JSON.stringify([box.left, box.top, box.right, box.bottom]), saturation);
        // execFile('python', ['image_blur.py', input_path, outputPath, JSON.stringify([box.left, box.top, box.right, box.bottom]), saturation], (error, stdout, stderr) => {
          execFile('python', ['tilt_shift.py', input_path, outputPath, saturation], (error, stdout, stderr) => { // sat == dof
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
