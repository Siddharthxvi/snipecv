import os
import sys

def process_folder(folder_path, output_folder_path, target_size=(1024, 1024)):
    from PIL import Image

    files = sorted([f for f in os.listdir(folder_path) if f.endswith(".png")])
    if not files:
        return

    # Phase 1: Determine the common bounding box across all frames in the folder
    min_left = None
    min_upper = None
    max_right = None
    max_lower = None

    loaded_images = []

    for filename in files:
        img_path = os.path.join(folder_path, filename)
        img = Image.open(img_path).convert("RGBA")
        loaded_images.append((filename, img))
        
        # Get bounding box of non-zero alpha pixels
        bbox = img.getbbox()
        if bbox:
            left, upper, right, lower = bbox
            min_left = left if min_left is None else min(min_left, left)
            min_upper = upper if min_upper is None else min(min_upper, upper)
            max_right = right if max_right is None else max(max_right, right)
            max_lower = lower if max_lower is None else max(max_lower, lower)

    if min_left is None:
        print(f"  Warning: No content found in {folder_path}")
        return

    common_w = max_right - min_left
    common_h = max_lower - min_upper
    
    print(f"  Unified bounding box: left={min_left}, upper={min_upper}, right={max_right}, lower={max_lower} ({common_w}x{common_h})")

    # Phase 2: Crop, upscale, and center each image
    target_w, target_h = target_size
    
    # Calculate scale factor to fit within target size while preserving aspect ratio
    scale = min(target_w / common_w, target_h / common_h)
    new_w = int(common_w * scale)
    new_h = int(common_h * scale)
    
    # Coordinates to center the pasted sprite on the canvas
    paste_x = (target_w - new_w) // 2
    paste_y = (target_h - new_h) // 2

    for filename, img in loaded_images:
        # Crop to the unified bounding box
        cropped = img.crop((min_left, min_upper, max_right, max_lower))
        
        # Resize using nearest neighbor to keep pixel art crisp
        resized = cropped.resize((new_w, new_h), Image.Resampling.NEAREST)
        
        # Create a new transparent background canvas
        canvas = Image.new("RGBA", target_size, (0, 0, 0, 0))
        canvas.paste(resized, (paste_x, paste_y), resized)
        
        output_file = os.path.join(output_folder_path, filename)
        canvas.save(output_file, "PNG")
        print(f"  Processed {filename} -> {output_file}")

def main():
    try:
        from PIL import Image
    except ImportError:
        print("PIL is not installed.")
        sys.exit(1)

    sprites_dir = "sprites"
    output_base_dir = "sprites_upscaled"
    
    folders = ["logo", "briefcase", "rocket", "terminal"]
    
    for folder in folders:
        input_folder_path = os.path.join(sprites_dir, folder)
        output_folder_path = os.path.join(output_base_dir, folder)
        
        if not os.path.exists(input_folder_path):
            print(f"Skipping folder: '{input_folder_path}' (does not exist)")
            continue
            
        os.makedirs(output_folder_path, exist_ok=True)
        print(f"Processing folder '{folder}'...")
        try:
            process_folder(input_folder_path, output_folder_path, target_size=(1024, 1024))
        except Exception as e:
            print(f"  Error processing folder {folder}: {e}")

if __name__ == "__main__":
    main()
