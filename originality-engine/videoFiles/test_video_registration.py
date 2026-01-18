import requests
import os
import sys

# Try to use moviepy to generate a dummy video if it exists
try:
    from moviepy.editor import ColorClip
    HAS_MOVIEPY = True
except ImportError:
    try:
        from moviepy import ColorClip # Newer versions? based on user's import
        HAS_MOVIEPY = True
    except ImportError:
        HAS_MOVIEPY = False

# Configuration
SERVER_URL = "http://localhost:5003"
TEST_FILE = "test_asset.mp4"
ASSET_ID = "test_video_001"

def create_dummy_video():
    if not HAS_MOVIEPY:
        print("Warning: moviepy not found for generating test video.")
        # Create a fake file just to test upload mechanism if engine wasn't strict (but engine IS strict)
        # So we really need a valid video file. 
        # Creating a dummy valid mp4 without moviepy/ffmpeg is hard.
        return False
    
    print("Generating 1-second dummy video...")
    try:
        clip = ColorClip(size=(320, 240), color=(0, 0, 255), duration=1.0)
        # fps=24 is standard
        clip.write_videofile(TEST_FILE, fps=24, logger=None)
        return True
    except Exception as e:
        print(f"Failed to generate video: {e}")
        return False

def test_register():
    if not os.path.exists(TEST_FILE):
        if not create_dummy_video():
            print(f"Error: {TEST_FILE} not found and could not be generated.")
            print("Please provide a valid video file named 'test_asset.mp4' to run this test.")
            return

    print(f"Testing Registration Endpoint: {SERVER_URL}/register")
    
    try:
        with open(TEST_FILE, 'rb') as f:
            files = {'file': f}
            data = {'id': ASSET_ID}
            
            response = requests.post(f"{SERVER_URL}/register", files=files, data=data)
            
            print(f"Status Code: {response.status_code}")
            try:
                print("Response JSON:", response.json())
            except:
                print("Response Text:", response.text)
                
            if response.status_code == 200:
                print("\n[SUCCESS] Video registered successfully!")
            else:
                print("\n[FAILURE] Registration failed.")
                
    except requests.exceptions.ConnectionError:
        print(f"\n[ERROR] Could not connect to {SERVER_URL}. Is the server running?")
    except Exception as e:
        print(f"\n[ERROR] An unexpected error occurred: {e}")

    # clean up? maybe keep for debugging
    # if os.path.exists(TEST_FILE): os.remove(TEST_FILE)

if __name__ == "__main__":
    test_register()
