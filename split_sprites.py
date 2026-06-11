import os
import sys

def main():
    # We will import PIL here, assuming it will be run in an environment where PIL is installed
    try:
        from PIL import Image
    except ImportError:
        print("PIL (Pillow) is not installed. Please run inside the virtual environment.")
        sys.exit(1)

    sprites_dir = "sprites"
    if not os.path.exists(sprites_dir):
        print(f"Error: Directory '{sprites_dir}' does not exist.")
        sys.exit(1)

    # Find all PNG files in the sprites directory
    files = [f for f in os.listdir(sprites_dir) if f.endswith('.png') and os.path.isfile(os.path.join(sprites_dir, f))]

    print(f"Found sprite sheets: {files}")

    cols = 6
    rows = 4

    for filename in files:
        name_without_ext = os.path.splitext(filename)[0]
        sheet_path = os.path.join(sprites_dir, filename)
        output_subdir = os.path.join(sprites_dir, name_without_ext)

        print(f"Processing '{filename}'...")
        try:
            with Image.open(sheet_path) as img:
                width, height = img.size
                cell_width = width // cols
                cell_height = height // rows

                print(f"  Dimensions: {width}x{height} pixels")
                print(f"  Frame dimensions (6x4 grid): {cell_width}x{cell_height} pixels")

                # Create subdirectory if it doesn't exist
                os.makedirs(output_subdir, exist_ok=True)

                frame_idx = 0
                for r in range(rows):
                    for c in range(cols):
                        # Crop coordinates: (left, upper, right, lower)
                        left = c * cell_width
                        upper = r * cell_height
                        right = (c + 1) * cell_width
                        lower = (r + 1) * cell_height

                        frame = img.crop((left, upper, right, lower))
                        frame_filename = f"sprite_{frame_idx}.png"
                        frame_path = os.path.join(output_subdir, frame_filename)
                        frame.save(frame_path)
                        frame_idx += 1

                print(f"  Successfully split into {frame_idx} sprites in '{output_subdir}'")

        except Exception as e:
            print(f"  Error processing '{filename}': {e}")

if __name__ == "__main__":
    main()
