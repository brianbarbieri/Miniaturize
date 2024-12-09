from PIL import Image, ImageFilter
import sys

def blur_image(input_path, output_path):
    try:
        img = Image.open(input_path)
        blurred_img = img.filter(ImageFilter.GaussianBlur(5))  # Apply Gaussian blur
        blurred_img.save(output_path)
        print("Success")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python image_blur.py <input_path> <output_path>")
    else:
        input_path = sys.argv[1]
        output_path = sys.argv[2]
        blur_image(input_path, output_path)
