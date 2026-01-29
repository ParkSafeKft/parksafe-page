import os
from PIL import Image
import sys

def resize_images():
    # Configuration
    source_file = 'public/ios_mapview.png'
    widths = [300, 480, 800]
    
    # Check if source exists
    if not os.path.exists(source_file):
        print(f"Error: Source file '{source_file}' not found.")
        print("Please make sure you are running this script from the project root directory.")
        return

    try:
        with Image.open(source_file) as img:
            # Convert to RGB if necessary (e.g. for WebP from RGBA PNG)
            # PNG supports RGBA, WebP supports RGBA.
            print(f"Opened {source_file} ({img.size[0]}x{img.size[1]})")

            for width in widths:
                # Calculate height maintaining aspect ratio
                aspect_ratio = img.height / img.width
                height = int(width * aspect_ratio)
                
                # Resize using high-quality resampling (LANCZOS)
                resized_img = img.resize((width, height), Image.Resampling.LANCZOS)
                
                # Generate filenames
                base_name, _ = os.path.splitext(source_file)
                # We want the output in the same folder as source
                # base_name includes 'public/ios_mapview'
                
                # Save as PNG
                png_output = f"{base_name}_{width}.png"
                resized_img.save(png_output, format='PNG', optimize=True)
                print(f"Saved {png_output}")

                # Save as WebP
                webp_output = f"{base_name}_{width}.webp"
                resized_img.save(webp_output, format='WEBP', quality=85)
                print(f"Saved {webp_output}")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    # Check for Pillow
    try:
        import PIL
    except ImportError:
        print("Error: The 'Pillow' library is required.")
        print("Please run: pip install Pillow")
        sys.exit(1)

    print("Starting image generation...")
    resize_images()
    print("Done!")
