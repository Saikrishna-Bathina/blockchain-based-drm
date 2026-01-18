import os
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS
from originality import VideoOriginalityRequest

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'mp4', 'mkv', 'avi', 'mov'}

app = Flask(__name__)
CORS(app)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

print("Initializing Video Originality Engine...")
try:
    engine = VideoOriginalityRequest()
    print("Video Engine initialized.")
except Exception as e:
    print(f"Failed to initialize Video Engine: {e}")
    engine = None

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/health', methods=['GET'])
def health_check():
    status = "healthy" if engine else "degraded"
    return jsonify({"status": status, "service": "video-originality-engine"})

@app.route('/check', methods=['POST'])
def check_video():
    if not engine:
        return jsonify({"error": "Engine not initialized"}), 500

    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = f"temp_video_{file.filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        try:
            file.save(filepath)
            
            result = engine.check_originality(filepath)
            
            # Cleanup
            if os.path.exists(filepath): os.remove(filepath)
            
            return jsonify(result), 200

        except Exception as e:
            if os.path.exists(filepath): os.remove(filepath)
            return jsonify({"error": str(e)}), 500
    else:
        return jsonify({"error": "File type not allowed"}), 400

@app.route('/register', methods=['POST'])
def register_video_endpoint():
    if not engine:
        return jsonify({"error": "Engine not initialized"}), 500

    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    asset_id = request.form.get('id')

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if not asset_id:
        return jsonify({"error": "Missing 'id' parameter"}), 400

    if file and allowed_file(file.filename):
        filename = f"temp_reg_{file.filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        try:
            file.save(filepath)
            
            success, details = engine.register_video(filepath, asset_id)
            
            # Cleanup
            if os.path.exists(filepath): os.remove(filepath)
            
            if success:
                return jsonify({"status": "success", "details": details}), 200
            else:
                return jsonify({"status": "failed", "details": details}), 500

        except Exception as e:
            if os.path.exists(filepath): os.remove(filepath)
            return jsonify({"error": str(e)}), 500
    else:
        return jsonify({"error": "File type not allowed"}), 400

if __name__ == '__main__':
    # Run on port 5003 for video
    print("Starting video server on port 5003...")
    app.run(host='0.0.0.0', port=5003, debug=True, use_reloader=False)
