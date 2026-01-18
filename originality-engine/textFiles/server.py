import os
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS
from originality import TextOriginalityRequest

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'docx'}

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize Engine
# Note: This might take a moment to load SBERT model
print("Initializing Text Originality Engine...")
engine = TextOriginalityRequest()
print("Engine initialized.")

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "text-originality-engine"})

@app.route('/register', methods=['POST'])
def register_text():
    # Check if ID is present
    asset_id = request.form.get('id')
    if not asset_id:
        return jsonify({"error": "Missing 'id' parameter"}), 400

    # Check if file is present
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = f"temp_register_{asset_id}_{file.filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        try:
            file.save(filepath)
            
            # Register asset
            success, msg = engine.register_text(filepath, asset_id)
            
            # Cleanup
            os.remove(filepath)
            
            if success:
                return jsonify({"success": True, "message": msg, "id": asset_id}), 200
            else:
                return jsonify({"success": False, "error": msg}), 500
                
        except Exception as e:
            if os.path.exists(filepath):
                os.remove(filepath)
            return jsonify({"success": False, "error": str(e)}), 500
    else:
        return jsonify({"error": "File type not allowed"}), 400

@app.route('/check', methods=['POST'])
def check_text():
    # Check if file is present
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = f"temp_check_{file.filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        try:
            file.save(filepath)
            
            # Check originality
            classification, match_id, similarity = engine.check_originality(filepath)
            
            # Cleanup
            os.remove(filepath)
            
            # Binary Classification Logic
            status = "Original" if classification == "ORIGINAL" else "Duplicate"

            result = {
                "status": status,
                "detailed_classification": classification,
                "closest_match_id": match_id,
                "similarity_score": round(float(similarity), 4),
                "criteria": {
                    "duplicate_exact_threshold": 0.95,
                    "semantic_duplicate_threshold": 0.85,
                    "near_duplicate_threshold": 0.60,
                    "potential_match_threshold": 0.75
                }
            }
            return jsonify(result), 200

        except Exception as e:
            if os.path.exists(filepath):
                os.remove(filepath)
            return jsonify({"error": str(e)}), 500
            
    else:
        return jsonify({"error": "File type not allowed"}), 400

if __name__ == '__main__':
    # Run on port 5002 to avoid conflicts
    print("Starting server on port 5002...")
    app.run(host='0.0.0.0', port=5002, debug=True, use_reloader=False)
