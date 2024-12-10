const {
    ipcRenderer
} = require('electron');

let isLoaded = false;

window.addEventListener('DOMContentLoaded', () => {
    if (isLoaded) return;
    isLoaded = true;
    console.log('DOMContentLoaded');
    console.trace();

    const uploadBtn = document.getElementById('upload-btn');
    const applyBtn = document.getElementById('process-btn');
    const img = document.getElementById('displayed-image');
    const lineUp = document.getElementById('follow-line-up');
    const lineDown = document.getElementById('follow-line-down');
    const pointElement = document.getElementById('follow-point');
    const imageContainer = document.getElementById('image-container');
    const sat = document.getElementById('saturation-value');

    let startX, startY;
    let currentImagePath = null;
    let boxCoordinates = null;
    let clickCount = 0;


    // Handle image upload
    if (uploadBtn) {
        uploadBtn.addEventListener('click', async (event) => {
            event.stopPropagation();
            console.log('Clicked...');
            const filePath = await ipcRenderer.invoke('select-image');
            if (filePath) {
                currentImagePath = filePath;
                img.src = filePath;
                img.style.display = 'block';
            }
        });
    }

    // Track mouse movements to update the box
    img.addEventListener('mousemove', (e) => {
        if (!currentImagePath) return; // Only move box if in the first click state

        // Get image position relative to the page
        const rect = img.getBoundingClientRect();

        const c = imageContainer.getBoundingClientRect();

        // Calculate the mouse position relative to the image
        const offsetX = e.clientX - rect.left - (c.left - rect.left);
        const offsetY = e.clientY - rect.top;

        // Update the position of the point
        pointElement.style.left = `50%`;
        pointElement.style.top = `${offsetY}px`;
        pointElement.style.display = 'block'; // Ensure the point is visible

        // update line above and below
        dof = parseInt(sat.innerHTML) / 2;

        lineUp.style.top = `${offsetY - dof}px`;
        lineDown.style.top = `${offsetY + dof}px`;
        lineUp.style.display = 'block';
        lineDown.style.display = 'block';
    });

    // Click to start and end drawing the box
    // img.addEventListener('click', (e) => {
    //     if (!currentImagePath) return; // Don't allow drawing if no image is loaded

    //     // Only allow drawing on the image
    //     if (e.target === img) {
    //         // Get image position relative to the page
    //         const rect = img.getBoundingClientRect();
    //         const c = imageContainer.getBoundingClientRect();
    //         console.log(e.clientX, rect.left, c.left)

    //         // Calculate the mouse position relative to the image
    //         const offsetX = e.clientX - rect.left - (c.left - rect.left);
    //         const offsetY = e.clientY - rect.top;

    //         if (clickCount === 0) {
    //             // First click: register the starting point
    //             startX = offsetX;
    //             startY = offsetY;

    //             // Initialize the selection box styles
    //             selectionBox.style.left = `${startX}px`;
    //             selectionBox.style.top = `${startY}px`;
    //             selectionBox.style.width = '0';
    //             selectionBox.style.height = '0';
    //             selectionBox.style.display = 'block'; // Make the box visible
    //             clickCount = 1;
    //         } else if (clickCount === 1) {
    //             // Second click: register the ending point and finalize the box
    //             const endX = offsetX;
    //             const endY = offsetY;

    //             // Calculate the box's coordinates
    //             boxCoordinates = {
    //                 left: Math.min(startX, endX) / c.width,
    //                 top: Math.min(startY, endY) / c.height,
    //                 right: Math.max(startX, endX) / c.width,
    //                 bottom: Math.max(startY, endY) / c.height,
    //             };

    //             // Adjust the size of the box
    //             selectionBox.style.width = `${Math.abs(endX - startX)}px`;
    //             selectionBox.style.height = `${Math.abs(endY - startY)}px`;
    //             selectionBox.style.left = `${Math.min(startX, endX)}px`;
    //             selectionBox.style.top = `${Math.min(startY, endY)}px`;

    //             console.log('Box Coordinates:', boxCoordinates); // Log the box coordinates

    //             clickCount = 2;
    //         } else {
    //             selectionBox.style.display = 'none';
    //             clickCount = 0; // Reset click count
    //         }
    //     }
    // });

    // Apply blur effect to the selected area
    applyBtn.addEventListener('click', async () => {
        if (currentImagePath) {
            try {
                if (!boxCoordinates) {
                    boxCoordinates = {}
                }
                img.src = "./loading.gif";
                selectionBox.style.display = 'none'; // Hide the selection box after blur

                const blurredImagePath = await ipcRenderer.invoke('blur-image', {
                    input_path: currentImagePath,
                    box: boxCoordinates,
                    saturation: sat.innerHTML
                });
                img.src = blurredImagePath; // Show the blurred image
                clickCount = 0; // Reset click count

            } catch (error) {
                console.error('Error applying blur:', error);
            }
        }
    });
});