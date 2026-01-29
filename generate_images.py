import os
from PIL import Image
import sys

def resize_images():
    # 1. IOS MAPVIEW (Responsive)
    source_file = 'public/ios_mapview.png'
    # Added 600w for 2x pixel density on mobile (300px * 2 = 600px)
    widths = [300, 480, 600, 800]
    
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
                    # Lower quality to 75 (standard for web) to reduce size significantly
                    resized_img.save(webp_output, format='WEBP', quality=75)
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
                
                # --- A. Create Main Optimized Logo (Max 512px) ---
                if img.width > 512:
                    print("Logo is large, resizing to 512px width...")
                    aspect_ratio = img.height / img.width
                    new_width = 512
                    new_height = int(new_width * aspect_ratio)
                    resized_img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                    resized_img.save(logo_file, format='PNG', optimize=True)
                    print(f"Optimized {logo_file}")
                else:
                    print("Logo is already small enough. Optimizing only...")
                    img.save(logo_file, format='PNG', optimize=True)
                    print(f"Optimized {logo_file}")

                # --- B. Create Small Logo for Header (64px) ---
                # We use 64px for 40px display to look sharp on Retina screens (approx 1.5x - 2x)
                small_width = 64
                aspect_ratio = img.height / img.width
                small_height = int(small_width * aspect_ratio)
                small_img = img.resize((small_width, small_height), Image.Resampling.LANCZOS)
                
                small_output_png = 'public/logo_64.png'
                small_img.save(small_output_png, format='PNG', optimize=True)
                print(f"Saved {small_output_png}")

                small_output_webp = 'public/logo_64.webp'
                # Lower quality to 80 for logo (logos need slightly higher quality than photos)
                small_img.save(small_output_webp, format='WEBP', quality=80)
                print(f"Saved {small_output_webp}")

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
