const { ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
    const uploadBtn = document.getElementById('upload-btn');
    const blurBtn = document.getElementById('blur-btn');
    const img = document.getElementById('displayed-image');
    let currentImagePath = null;
  
    if (uploadBtn) {
      uploadBtn.addEventListener('click', async () => {
        const filePath = await ipcRenderer.invoke('select-image');
        if (filePath) {
          currentImagePath = filePath;
          img.src = filePath;
          img.style.display = 'block';
        }
      });
    }
  
    if (blurBtn) {
      blurBtn.addEventListener('click', async () => {
        if (currentImagePath) {
          try {
            const blurredImagePath = await ipcRenderer.invoke('blur-image', currentImagePath);
            img.src = blurredImagePath; // Update the image with the blurred version
          } catch (error) {
            console.error('Error blurring image:', error);
          }
        }
      });
    }
});