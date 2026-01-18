# Text Originality Engine

This module implements a robust text originality verification system that combines **Syntactic Analysis (MinHash)** and **Semantic Analysis (SBERT)** to detect exact duplicates, near-duplicates, and AI-paraphrased content.

## Features

1.  **Dual-Layer Detection**:
    *   **Layer 1: Syntactic (MinHash)**: Uses Jaccard Similarity to detect copy-paste plagiarism and minor edits (typos, reordering). Very fast.
    *   **Layer 2: Semantic (SBERT)**: Uses Cosine Similarity on sentence embeddings (`all-MiniLM-L6-v2`) to detect deeply paraphrased content where the meaning is same but words are different (e.g., "The cat sat on the mat" vs "The feline rested on the rug").
2.  **Format Support**: Extracts text from `.txt`, `.pdf`, and `.docx` files.
3.  **Efficiency**: Uses a lightweight SQLite database to store compact signatures (MinHash Binary BLOBS) and Vector Embeddings.

## Environment Setup (Windows)

Due to specific dependency conflicts on Windows (specifically `torch` DLL errors and `numpy` version mismatches), follow these exact steps to set up the environment.

### 1. Prerequisites
- Python **3.11** (Standard Windows Installer, not MSYS2/Conda)

### 2. Create Virtual Environment
Run the following commands in PowerShell from the `textFiles` directory:

```powershell
# Create a new virtual environment
py -3.11 -m venv ..\venv311_cpu

# Activate it (Optional for manual use, but scripts use direct paths)
..\venv311_cpu\Scripts\Activate.ps1
```

### 3. Install Dependencies
Install modules with specific versions to ensure stability:

```powershell
# 1. Install Torch (CPU Version) - Essential to fix WinError 1114
..\venv311_cpu\Scripts\pip install "torch==2.1.0" -f https://download.pytorch.org/whl/cpu

# 2. Install Transformers (Compatible with Torch 2.1)
..\venv311_cpu\Scripts\pip install "transformers==4.35.0"

# 3. Install Sentence Transformers
..\venv311_cpu\Scripts\pip install "sentence-transformers==2.7.0"

# 4. Install NumPy (Legacy support for SBERT)
..\venv311_cpu\Scripts\pip install "numpy<2.0"

# 5. Install Other Utilities
..\venv311_cpu\Scripts\pip install datasketch pypdf python-docx scipy scikit-learn
```

---

## Usage

You can run the engine using the python interpreter from your virtual environment.

### 1. Register a Document
Extracts text, computes signatures (MinHash + SBERT), and saves to the database.

```powershell
..\venv311_cpu\Scripts\python main.py register <path_to_file> --id <unique_id>
```

**Example:**
```powershell
..\venv311_cpu\Scripts\python main.py register ..\tests\text\testing1.txt --id text-001
```

### 2. Check Originality
Compares an input document against **all** registered assets in the database.

```powershell
..\venv311_cpu\Scripts\python main.py check <path_to_file>
```

**Example:**
```powershell
..\venv311_cpu\Scripts\python main.py check ..\tests\text\testing2.txt
```

---

## Understanding the Output

The engine classifies the relationship between the input text and the database match:

| Classification | Meaning | Thresholds |
| :--- | :--- | :--- |
| **DUPLICATE (Exact)** | The text is identical or has extremely minor changes. | MinHash > 0.95 |
| **SEMANTIC DUPLICATE** | The text is rewritten/paraphrased but means the same thing. (AI Plagiarism). | SBERT > 0.85 |
| **NEAR DUPLICATE** | The text has significant overlap (e.g., edited copies). | MinHash > 0.60 |
| **POTENTIAL MATCH**| Some semantic similarity detected, but not definitive. | SBERT > 0.75 |
| **ORIGINAL** | No significant match found. | Scores below thresholds |

### Sample Output (Semantic Match)
```text
[SUCCESS] Registered text asset text-001 (SBERT: Yes)
------------------------------
CLASSIFICATION: SEMANTIC DUPLICATE (AI/Paraphrased)
CLOSEST MATCH : text-001 (Similarity: 0.98)
------------------------------
```
*In this example, even if words are different, the high similarity score (0.98) confirms the meaning is identical.*

## Troubleshooting

### `WinError 1114` (DLL Initialization Failed)
*   **Cause**: Incompatible `torch` version or missing OpenMP libraries.
*   **Fix**: Ensure you installed `torch==2.1.0` from the CPU index as described in the Setup section. Do **not** install the latest `torch` (2.5+) from standard PyPI on Windows without CUDA.

### `AttributeError: module 'torch.utils._pytree' ...`
*   **Cause**: `transformers` library is too new for Torch 2.1.
*   **Fix**: Downgrade transformers: `pip install transformers==4.35.0`.

### `NumPy` Array API Errors
*   **Cause**: New NumPy 2.0 breaks older libraries.
*   **Fix**: Downgrade NumPy: `pip install "numpy<2.0"`.
