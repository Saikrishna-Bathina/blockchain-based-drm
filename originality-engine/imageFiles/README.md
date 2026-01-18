# Image Originality Engine

This module implements a robust image originality verification system using **Perceptual Hashing (pHash)**. Unlike cryptographic hashes (MD5/SHA) which change completely with a single bit change, pHash generates a fingerprint based on the visual structure of the image. This allows the system to detect duplicates even if they have been modified.

## Core Features

The engine is robust against the following modifications:
1.  **Rotation**: Automatically checks 0Â°, 90Â°, 180Â°, and 270Â° orientations.
2.  **Mirroring**: Automatically checks horizontally flipped (mirrored) images.
3.  **Cropping / Partial Matches**:
    *   During registration, the system segments the image into **9 parts** (Full, Top/Bottom/Left/Right Halves, and 4 Quadrants).
    *   It can detect if an input image matches any of these segments.
4.  **Color & Contrast**: Resistant to changes in brightness, contrast, saturation, and exposure.
5.  **Resizing/Compression**: pHash is inherently robust to resolution changes and JPEG compression.

## Classification Logic

The system compares the "Hamming Distance" between image fingerprints (0-64 scale).

*   **DUPLICATE**: Distance < 25 (Includes Exact, Modified, and Partial matches).
*   **ORIGINAL**: Distance >= 25.

## Setup

### 1. Requirements
Ensure you have Python installed (preferably 3.11+).
Install dependencies:
```bash
pip install -r ../requirements.txt
```
*(Dependencies: `imagehash`, `Pillow`)*

### 2. Database
The system uses the shared SQLite database at `originality-engine/audioFiles/fingerprints.db`.
The schema includes an `image_hashes` table with support for segmentation.

## Usage

**Note:** It is recommended to use the helper script `run_image.ps1` (or `run_image.bat`) located in the parent directory to ensure the correct Python environment is used.

### Run commands from `originality-engine/` directory:

### 1. Register an Asset
Registers an image into the database. You MUST provide a Unique ID.
```powershell
.\run_image.ps1 register <path_to_image> --id <unique_asset_id>
```
*Example:*
```powershell
.\run_image.ps1 register tests/images/art.png --id "asset-uuid-101"
```

### 2. Check Originality
Checks if an input image is original or a duplicate of a registered asset.
```powershell
.\run_image.ps1 check <path_to_image>
```
*Example:*
```powershell
.\run_image.ps1 check tests/images/art_modified.png
```

### Output format
```text
CLASSIFICATION: DUPLICATE
CLOSEST MATCH ID : asset-uuid-101 (Distance: 12)
```
or for partial matches:
```text
CLASSIFICATION: DUPLICATE - Partial (top_half)
CLOSEST MATCH ID : asset-uuid-101 (Distance: 2)
```
