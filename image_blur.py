from PIL import Image, ImageFilter
import numpy as np
import traceback
import sys
import json

def blur_image(input_path, output_path, box):
    try:
        print(input_path)
        img = Image.open(input_path)
        box = list(map(int, box))
        width, height = img.size

        # Step 2: Define the box region (e.g., top-left and bottom-right corners)
        box_top_left = (100, 500)  # x, y of top-left
        box_bottom_right = (800, 1000)  # x, y of bottom-right

        # Step 3: Create a distance-based blur mask
        mask = np.zeros((height, width), dtype=np.float32)

        box_center_x = (box_top_left[0] + box_bottom_right[0]) // 2
        box_center_y = (box_top_left[1] + box_bottom_right[1]) // 2

        # Compute distance from the center of the box
        for y in range(height):
            for x in range(width):
                distance = np.sqrt((x - box_center_x)**2 + (y - box_center_y)**2)
                mask[y, x] = distance

                # Normalize the mask to a range suitable for blur radii
                max_blur_radius = 5  # Adjust this value for stronger/weaker blur
                mask = (mask / mask.max()) * max_blur_radius

                # Step 4: Apply a blur based on the mask
                blurred_image = img.copy()

                # Loop through the image pixels
                for y in range(height):
                    for x in range(width):
                        # Get blur radius for the current pixel
                        radius = int(mask[y, x])
                        
                        # Define crop bounds (ensure they're within the image)
                        left = max(0, x - radius)
                        upper = max(0, y - radius)
                        right = min(width, x + radius + 1)
                        lower = min(height, y + radius + 1)
                        
                        # Crop and apply blur
                        cropped = img.crop((left, upper, right, lower))
                        blurred_cropped = cropped.filter(ImageFilter.GaussianBlur(radius=radius))
                        
                        # Safely determine the center of the cropped region
                        center_x = (blurred_cropped.size[0] - 1) // 2
                        center_y = (blurred_cropped.size[1] - 1) // 2
                        
                        # Get the pixel value from the center of the blurred crop
                        pixel_value = blurred_cropped.getpixel((center_x, center_y))
                        blurred_image.putpixel((x, y), pixel_value)
        output_img = change_contrast(blurred_image, 50)
        output_img.save(output_path)
        print("Success")
    except Exception as e:
        print(f"Error: {e}")
        print(traceback.format_exc())

def change_contrast(img, level):
    factor = (259 * (level + 255)) / (255 * (259 - level))
    def contrast(c):
        return 128 + factor * (c - 128)
    return img.point(contrast)

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python image_blur.py <input_path> <output_path> <box>")
    else:
        input_path = sys.argv[1]
        output_path = sys.argv[2]
        box = json.loads(sys.argv[3])  # Pass box as JSON string
        blur_image(input_path, output_path, tuple(box))