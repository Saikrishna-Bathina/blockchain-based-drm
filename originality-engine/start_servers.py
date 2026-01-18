import subprocess
import os
import sys
import time
import signal

# Configuration
# Assuming this script is run from 'originality-engine' root
BASE_DIR = os.getcwd()

# Paths to services
AUDIO_DIR = os.path.join(BASE_DIR, "audioFiles")
IMAGE_DIR = os.path.join(BASE_DIR, "imageFiles")
VIDEO_DIR = os.path.join(BASE_DIR, "videoFiles")

# Virtual Environment Path
# User seems to be using 'venv311_cpu' located in 'originality-engine'
VENV_PYTHON = os.path.join(BASE_DIR, "venv311_cpu", "Scripts", "python.exe")

if not os.path.exists(VENV_PYTHON):
    # Fallback to system python if venv not found where expected
    print(f"Warning: venv python not found at {VENV_PYTHON}. Using system python.")
    VENV_PYTHON = sys.executable

processes = []

def start_service(name, cmd, cwd):
    print(f"[{name}] Starting service...")
    try:
        # shell=False is safer, but shell=True might be needed for some env var loading
        p = subprocess.Popen(
            cmd, 
            cwd=cwd, 
            shell=True, # keeping True for Windows convenience with potential path issues
            creationflags=subprocess.CREATE_NEW_CONSOLE # Opens in new window so logs are visible
        )
        processes.append((name, p))
        print(f"[{name}] Started with PID {p.pid}")
    except Exception as e:
        print(f"[{name}] Failed to start: {e}")

def main():
    print("--- Starting Originality Engine Microservices ---")

    # 1. Start Audio Server (Go)
    # Assuming 'go' is in PATH. 
    # Command: go run . 
    # Use 'main.go' specifically if '.' is ambiguous, but '.' is better for packages.
    # We'll try 'go run .'
    start_service("Audio Server", "go run .", AUDIO_DIR)
    
    # 2. Start Image Server (Python)
    # Command: python main.py
    start_service("Image Server", [VENV_PYTHON, "main.py"], IMAGE_DIR)

    # 3. Start Video Server (Python)
    # Command: python server.py
    # Adding a small delay to ensure dependencies might be up (though not strictly necessary)
    time.sleep(2) 
    start_service("Video Server", [VENV_PYTHON, "server.py"], VIDEO_DIR)

    # 4. Start Text Server (Python)
    # Command: python server.py
    TEXT_DIR = os.path.join(BASE_DIR, "textFiles")
    start_service("Text Server", [VENV_PYTHON, "server.py"], TEXT_DIR)

    print("\nAll services launched in separate windows.")
    print("Press Ctrl+C to exit this launcher (Note: This won't close the external windows automatically).")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nExiting launcher.")

if __name__ == "__main__":
    main()
