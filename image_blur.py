from PIL import Image, ImageFilter, ImageEnhance, ImageDraw
import os
import traceback
import sys
import json

def blur_image(input_path, output_path, box, contrast=1):
    try:
        img = Image.open(input_path)
        if not None in box:
            # print("Blurring image outside of: ", box)
            # width, height = img.size

            # # Define the sharp box region (left, upper, right, lower)
            # sharp_box = (int(width*box[0]), int(height*box[1]), int(width*box[2]), int(height*box[3]))

            # # Create a blurred version of the image
            # blurred_img = img.filter(ImageFilter.GaussianBlur(radius=20))

            # # Crop the sharp region from the original image
            # sharp_region = img.crop(sharp_box)

            # # Paste the sharp region back onto the blurred image
            # blurred_img.paste(sharp_region, sharp_box)
            # img = blurred_img

            # Print the specified sharp region
            print("Blurring image outside of: ", box)
            width, height = img.size

            # Define the sharp box region (left, upper, right, lower)
            sharp_box = (int(width * box[0]), int(height * box[1]), int(width * box[2]), int(height * box[3]))

            # Create progressively blurred versions of the image
            blurred_img1 = img.filter(ImageFilter.GaussianBlur(radius=5))
            blurred_img2 = img.filter(ImageFilter.GaussianBlur(radius=15))
            blurred_img3 = img.filter(ImageFilter.GaussianBlur(radius=30))

            # Create a mask for blending
            mask = Image.new("L", img.size, 0)  # Start with a black mask (0 = sharp region)
            draw = ImageDraw.Draw(mask)

            # Draw a gradient outside the sharp box
            gradient_width = 100  # Width of the gradient transition
            for i in range(gradient_width):
                alpha = int(255 * (i / gradient_width))  # Gradually increase alpha
                inset_box = (
                    sharp_box[0] - i, sharp_box[1] - i,
                    sharp_box[2] + i, sharp_box[3] + i
                )
                draw.rectangle(inset_box, outline=alpha, fill=alpha)

            # Blend the images with the gradient mask
            partially_blurred = Image.composite(img, blurred_img1, mask)
            mask = mask.filter(ImageFilter.GaussianBlur(radius=10))  # Smooth the mask edges further
            img = Image.composite(partially_blurred, blurred_img3, mask)

        if contrast:
            converter = ImageEnhance.Color(img)
            output_img = converter.enhance(contrast)
            print("Enhaced image by: ", contrast)
        else:
            output_img = img

        # remove all files in the folder temp
        for file in os.listdir("temp"):
            os.remove(os.path.join("temp", file))
        output_img.save(output_path)
        print("Success")
    except Exception as e:
        print(f"Error: {e}")
        print(traceback.format_exc())

if __name__ == "__main__":
    # if len(sys.argv) != 5:
    #     print("Usage: python image_blur.py <input_path> <output_path> <box> <contrast>")
    # else:
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    box = json.loads(sys.argv[3])  # Pass box as JSON string
    contrast = float(sys.argv[4])
    print("Input path: ", input_path)
    print("Output path: ", output_path)
    print("Box: ", box)
    print("Contrast: ", contrast)
    blur_image(input_path, output_path, tuple(box), contrast=contrast)