import argparse
import sys
import os
from originality import ImageOriginalityRequest
from flask import Flask, request, jsonify
from flask_cors import CORS
import uuid

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend access
engine = ImageOriginalityRequest()

UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/check', methods=['POST'])
def check_image():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    filename = str(uuid.uuid4()) + "_" + file.filename
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    try:
        classification, match_id, dist = engine.check_originality(filepath)
        
        # Handle numpy int64 and infinity for JSON serialization
        d_val = -1
        if dist != float('inf'):
            d_val = int(dist)

        response = {
            "status": classification, # "DUPLICATE..." or "ORIGINAL"
            "match_id": match_id if match_id else None,
            "distance": d_val
        }
        
        return jsonify(response)
    finally:
        if os.path.exists(filepath):
            os.remove(filepath)

@app.route('/register', methods=['POST'])
def register_image():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    image_id = request.form.get('id')
    if not image_id:
        return jsonify({"error": "Missing 'id' parameter"}), 400

    filename = str(uuid.uuid4()) + "_" + file.filename
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    try:
        success, msg = engine.register_image(filepath, image_id)
        if success:
            return jsonify({"status": "success", "message": msg})
        else:
            return jsonify({"status": "error", "message": msg}), 500
    finally:
        # For registration, we might want to keep the file, but current logic mimics audio
        # where we process and delete temp file unless we decide to store it.
        # Original logic processed from path.
        if os.path.exists(filepath):
            os.remove(filepath)

def start_server():
    print("Starting Image Originality Server on port 8081...")
    # Using 8081 to avoid conflict if audio server is running on 8080
    app.run(host='0.0.0.0', port=8081, debug=True)

def main():
    parser = argparse.ArgumentParser(description="Image Originality Engine CLI & Server")
    subparsers = parser.add_subparsers(dest="command", help="Command to run")

    # Register Command
    register_parser = subparsers.add_parser("register", help="Register an image")
    register_parser.add_argument("image_path", help="Path to the image file")
    register_parser.add_argument("--id", help="Unique ID for the asset", required=True)

    # Check Command
    check_parser = subparsers.add_parser("check", help="Check originality of an image")
    check_parser.add_argument("image_path", help="Path to the image file")

    # Server Command (optional explicit command)
    server_parser = subparsers.add_parser("server", help="Start the HTTP server")

    args = parser.parse_args()
    
    # If no arguments provided, start server by default (or help? let's default to server based on request flow)
    # But standard CLI requires commands. Let's make "server" default if no args, or explicitly check.
    if args.command is None:
        # Default to server mode
        start_server()
        return

    if args.command == "server":
        start_server()
        return

    # CLI Logic
    if args.command == "register":
        if not os.path.exists(args.image_path):
            print(f"Error: File not found {args.image_path}")
            return

        success, msg = engine.register_image(args.image_path, args.id)
        if success:
            print(f"[SUCCESS] {msg}")
        else:
            print(f"[FAILED] {msg}")

    elif args.command == "check":
        if not os.path.exists(args.image_path):
            print(f"Error: File not found {args.image_path}")
            return

        classification, match_id, dist = engine.check_originality(args.image_path)
        print("-" * 30)
        print(f"CLASSIFICATION: {classification}")
        if match_id:
            print(f"CLOSEST MATCH ID : {match_id} (Distance: {dist})")
        else:
            print(f"DISTANCE         : {dist} (No close match found)")
        print("-" * 30)

if __name__ == "__main__":
    main()
