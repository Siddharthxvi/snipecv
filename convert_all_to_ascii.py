import os
import sys
import glob
import time
from playwright.sync_api import sync_playwright

def process_image(page, image_path, txt_output_path):
    print(f"Converting {image_path}...")
    
    # Reload page to reset state and avoid any stuck UI issues
    page.goto('https://vaultandzn.com/pages/ascii-art-generator/#scroll')
    page.wait_for_load_state("networkidle")
    
    # Locate inputs using prefix matches (since suffix IDs contain dynamic template strings)
    file_input = page.wait_for_selector('input[id^="ascii-file-"]')
    width_input = page.wait_for_selector('input[id^="ascii-width-number-"]')
    generate_btn = page.wait_for_selector('button[id^="ascii-generate-"]')
    download_btn = page.wait_for_selector('button[id^="ascii-download-template-"]')
    
    # 1. Upload the image file
    file_input.set_input_files(image_path)
    
    # 2. Set width to 160 chars
    width_input.fill("160")
    
    # 3. Trigger ASCII generation
    generate_btn.click()
    
    # Wait for the download button to be enabled or output to be ready (small buffer)
    page.wait_for_timeout(2000)
    
    # 4. Trigger download and capture the download event
    with page.expect_download(timeout=10000) as download_info:
        download_btn.click()
    
    download = download_info.value
    download.save_as(txt_output_path)
    print(f"  Saved ASCII art -> {txt_output_path}")

def main():
    input_base_dir = "sprites_upscaled"
    output_base_dir = "ascii_outputs"
    
    if not os.path.exists(input_base_dir):
        print(f"Input base directory '{input_base_dir}' does not exist.")
        sys.exit(1)
        
    folders = ["logo", "briefcase", "rocket", "terminal"]
    
    with sync_playwright() as p:
        # Launch Chromium headless
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        for folder in folders:
            input_folder_path = os.path.join(input_base_dir, folder)
            output_folder_path = os.path.join(output_base_dir, folder)
            
            if not os.path.exists(input_folder_path):
                continue
                
            os.makedirs(output_folder_path, exist_ok=True)
            print(f"Processing folder: {folder}")
            
            # Find and sort all frames in the directory
            files = sorted(glob.glob(os.path.join(input_folder_path, "*.png")))
            
            for file_path in files:
                filename = os.path.basename(file_path)
                name_without_ext = os.path.splitext(filename)[0]
                txt_filename = f"{name_without_ext}.txt"
                txt_output_path = os.path.join(output_folder_path, txt_filename)
                
                try:
                    process_image(page, os.path.abspath(file_path), os.path.abspath(txt_output_path))
                except Exception as e:
                    print(f"  Error processing {filename}: {e}")
                    # Try once more on failure
                    try:
                        print("  Retrying...")
                        process_image(page, os.path.abspath(file_path), os.path.abspath(txt_output_path))
                    except Exception as retry_err:
                        print(f"  Retry failed: {retry_err}")
                        
        browser.close()
    print("All images successfully processed!")

if __name__ == "__main__":
    main()
