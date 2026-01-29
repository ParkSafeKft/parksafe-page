import os
from PIL import Image
import sys

def resize_images():
    # 1. IOS MAPVIEW (Responsive)
    source_file = 'public/ios_mapview.png'
    widths = [300, 480, 800]
    
    if os.path.exists(source_file):
        try:
            with Image.open(source_file) as img:
                print(f"Opened {source_file} ({img.size[0]}x{img.size[1]})")
                for width in widths:
                    aspect_ratio = img.height / img.width
                    height = int(width * aspect_ratio)
                    resized_img = img.resize((width, height), Image.Resampling.LANCZOS)
                    base_name, _ = os.path.splitext(source_file)
                    
                    # Save PNG
                    png_output = f"{base_name}_{width}.png"
                    resized_img.save(png_output, format='PNG', optimize=True)
                    print(f"Saved {png_output}")

                    # Save WebP
                    webp_output = f"{base_name}_{width}.webp"
                    resized_img.save(webp_output, format='WEBP', quality=85)
                    print(f"Saved {webp_output}")
        except Exception as e:
            print(f"Error processing {source_file}: {e}")
    else:
        print(f"Warning: {source_file} not found.")

    # 2. LOGO OPTIMIZATION
    logo_file = 'public/logo.png'
    if os.path.exists(logo_file):
        try:
            with Image.open(logo_file) as img:
                print(f"Opened {logo_file} ({img.size[0]}x{img.size[1]})")
                
                # Only resize if it's huge (e.g., > 512px width)
                if img.width > 512:
                    print("Logo is large, resizing to 512px width...")
                    aspect_ratio = img.height / img.width
                    new_width = 512
                    new_height = int(new_width * aspect_ratio)
                    resized_img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                    
                    # Overwrite with optimized version
                    resized_img.save(logo_file, format='PNG', optimize=True)
                    print(f"Optimized {logo_file}")
                else:
                    print("Logo is already small enough. Optimizing only...")
                    img.save(logo_file, format='PNG', optimize=True)
                    print(f"Optimized {logo_file}")

        except Exception as e:
            print(f"Error processing {logo_file}: {e}")
    else:
        print(f"Warning: {logo_file} not found.")

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
