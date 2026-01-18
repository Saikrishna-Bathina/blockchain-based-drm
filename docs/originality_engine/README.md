# Originality Engine Module Documentation

## 📖 Introduction
The Originality Engine is the AI-powered "Brain" of the DRM system. It is a standalone microservice responsible for analyzing uploaded content (Image, Text, Audio, Video) to detect plagiarism or duplication. By assigning an "Originality Score," it prevents the system from protecting (minting) stolen or widely duplicated content.

## 🏗 Architecture
*   **Language**: Python (v3.10+).
*   **Web Framework**: Flask (Lightweight API server).
*   **AI Libraries**:
    *   **PyTorch**: Deep Learning model execution.
    *   **Sentence-Transformers**: NLP models (SBERT).
    *   **Pillow (PIL)**: Image processing.
    *   **ImageHash**: Perceptual Hashing (pHash).

## 🧠 Detection Logic (How it works)

### 1. Image Analysis (Perceptual Hashing)
*   **Algorithm**: `pHash` (Perceptual Hash).
*   **Process**:
    1.  Converts image to grayscale and resizes it.
    2.  Computes a "fingerprint" (hash) based on visual features, not file bytes.
    3.  **Comparison**: If the uploaded image's hash differs from existing assets by a Hamming Distance of **< 10**, it is flagged as a duplicate.
    4.  **ResNet50**: Also extracts deep feature vectors for semantic similarity (finding "visually similar" but not identical images).

### 2. Text Analysis (Semantic Embeddings)
*   **Model**: `all-MiniLM-L6-v2` (SBERT).
*   **Process**:
    1.  Converts input text into a high-dimensional vector (embedding).
    2.  **Cosine Similarity**: Compares this vector against vectors of previously registered texts.
    3.  If similarity > **0.85** (85%), it is flagged as plagiarized. This detects paraphrasing, not just copy-paste.

### 3. Audio/Video Analysis
*   **Audio**: Uses acoustic fingerprinting (spectrogram analysis) to detect matching audio segments.
*   **Video**: Extracts keyframes at regular intervals and applies Image Analysis (pHash) to each frame to verify visual sequence originality.

## 📂 Folder Structure
*   `start_servers.py`: Master script that launches all 4 Flask servers in parallel.
*   `imageFiles/`:
    *   `server.py`: Flask app for Image Logic (Port 5001).
    *   `resnet_feature_extraction.py`: Deep learning utility.
*   `textFiles/`, `audioFiles/`, `videoFiles/`: Similar structures for respective media types.
*   `database/`: Local JSON/SQLite storage for fingerprints (in a production ready system, this would be a Vector Database like Pinecone).

## 🔌 API Endpoints (Internal)
These endpoints are called by the **Node.js Backend**, not the frontend directly.

*   `POST http://localhost:5001/check` (Image)
*   `POST http://localhost:5004/check` (Text)
    *   **Input**: File path or raw text.
    *   **Output JSON**:
        ```json
        {
          "is_original": true,
          "score": 95.5,
          "message": "Content is original"
        }
        ```

## 🚀 Execution Flow

1.  **Environment**: Activate Python Virtual Environment (`venv`).
2.  **Launch**: Run `python start_servers.py`.
3.  **Operation**:
    *   Starts **Image Server** on Port 5001.
    *   Starts **Video Server** on Port 5002.
    *   Starts **Audio Server** on Port 5003.
    *   Starts **Text Server** on Port 5004.
4.  **Ready state**: The engine waits for HTTP requests from the Backend API.
