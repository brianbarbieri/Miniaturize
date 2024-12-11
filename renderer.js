const {
    ipcRenderer
} = require('electron');

window.addEventListener('DOMContentLoaded', () => {
    const uploadBtn = document.getElementById('upload-btn');
    const applyBtn = document.getElementById('process-btn');
    const img = document.getElementById('displayed-image');
    const lineUp = document.getElementById('follow-line-up');
    const lineDown = document.getElementById('follow-line-down');
    const pointElement = document.getElementById('follow-point');

    const lineUpSelect = document.getElementById('select-line-up');
    const lineDownSelect = document.getElementById('select-line-down');
    const pointElementSelect = document.getElementById('select-point');
    // const imageContainer = document.getElementById('image-container');

    let currentImagePath = null;
    let y = null;

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

    const slider = document.getElementById('dof-slider');
    const valueDisplay = document.getElementById('dof-value');

    // Update value display when the slider value changes
    slider.addEventListener('input', () => {
        valueDisplay.textContent = slider.value;
    });

    // Track mouse movements to update the box
    img.addEventListener('mousemove', (e) => {
        if (!currentImagePath) return; // Only move box if in the first click state

        // Get image position relative to the page
        const rect = img.getBoundingClientRect();

        // const c = imageContainer.getBoundingClientRect();

        // Calculate the mouse position relative to the image
        // const offsetX = e.clientX - rect.left - (c.left - rect.left);
        const offsetY = e.clientY - rect.top;
        
        // TODO make sure the lines do not go outside of the image

        // Update the position of the point
        pointElement.style.left = `50%`;
        pointElement.style.top = `${offsetY}px`;
        pointElement.style.display = 'block'; // Ensure the point is visible

        // update line above and below
        dof = parseInt(valueDisplay.innerHTML) / 2;

        lineUp.style.top = `${offsetY - dof}px`;
        lineDown.style.top = `${offsetY + dof}px`;
        lineUp.style.display = 'block';
        lineDown.style.display = 'block';
    });

    const addRange = (e) => {
        if (!currentImagePath) return; // Don't allow drawing if no image is loaded
        const rect = img.getBoundingClientRect();

        // Calculate the mouse position relative to the image
        const offsetY = e.clientY - rect.top;
        
        // TODO make sure the lines do not go outside of the image

        // Update the position of the point
        pointElementSelect.style.left = `50%`;
        pointElementSelect.style.top = `${offsetY}px`;
        pointElementSelect.style.display = 'block'; // Ensure the point is visible

        // update line above and below
        dof = parseInt(valueDisplay.innerHTML) / 2;

        lineUpSelect.style.top = `${offsetY - dof}px`;
        lineDownSelect.style.top = `${offsetY + dof}px`;
        lineUpSelect.style.display = 'block';
        lineDownSelect.style.display = 'block';

        applyBtn.disabled = false;
        y = offsetY / rect.height;
        console.log(y)
    }

    // Click to start and end drawing the box
    pointElement.addEventListener('click', (e) => {
        addRange(e)
    });
    img.addEventListener('click', (e) => {
        addRange(e)
    });
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
                img.src = "./loading.gif";
                const blurredImagePath = await ipcRenderer.invoke('tilt-image', {
                    input_path: currentImagePath,
                    dof: parseInt(valueDisplay.innerHTML),
                    focus_height: y
                });
                img.src = blurredImagePath; // Show the blurred image
                clickCount = 0; // Reset click count

            } catch (error) {
                console.error('Error applying blur:', error);
            }
        }
    });
});