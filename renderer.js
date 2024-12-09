const { ipcRenderer } = require('electron');

// Ensure the DOM is fully loaded
window.addEventListener('DOMContentLoaded', () => {
  const uploadBtn = document.getElementById('upload-btn');
  if (uploadBtn) {
    uploadBtn.addEventListener('click', async () => {
      const filePath = await ipcRenderer.invoke('select-image');
      if (filePath) {
        const img = document.getElementById('displayed-image');
        if (img) {
          img.src = filePath; // Display the selected image
          img.style.display = 'block';
        } else {
          console.error('Image element not found.');
        }
      }
    });
  } else {
    console.error('Upload button not found.');
  }
});
