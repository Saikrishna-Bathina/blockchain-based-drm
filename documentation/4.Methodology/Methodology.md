# Chapter 4: Methodology

## 4.1 Problem Statement
Design and develop a complete decentralized architecture for Digital Rights Management that cryptographically locks the distribution of proprietary content exclusively to verified licensed parties, whilst ensuring the absolute originality of all minted assets.

---

## 4.2 The Originality Engine: A Deeper Look
The Originality Engine is the core microservice developed fundamentally to evaluate data streams of diverse MIME types and compare them quantitatively against existing system fingerprints. 
Traditional DRM directly hash-checks the file byte-for-byte using MD5 or SHA-256 signatures. The issue with this method is that flipping a single unseen pixel, slightly cropping an image, or changing an audio bitrate alters the hash entirely, destroying the plagiarism check.
Our Originality Engine works differently by deriving "Perceptual Hashes" (pHash) and Semantic similarities. These algorithms analyze the structure or meaning of the content itself. Let’s break down the logic for each asset type.

*[Image Suggestion: A 4-way flowchart separating an incoming file by extension into Image Data, Text Data, Audio Data, and Video Data processing streams]*

---

## 4.3 Image Modality: Perceptual Hashing (pHash)
### 4.3.1 Step-by-Step Processing Pipeline
Image uniqueness is handled via Perceptual Hashing (pHash). It focuses on structural frequencies rather than exact binary data.
1. **Grayscale Conversion:** The uploaded image is stripped of color to remove superficial color-grading manipulations.
2. **Resizing (32x32):** The image is forced into a standard 32x32 pixel block. This ignores scaling and aspect-ratio modifications.
3. **Discrete Cosine Transform (DCT):** A mathematical transformation separates the image into a collection of frequencies and scalars.
4. **Low-Frequency Focus:** The algorithm keeps only the top-left 8x8 block of the DCT output (the lowest frequencies), which represent the core structure (edges, shapes) while discarding high noise (tiny details, watermarks).
5. **Compute the Median:** It calculates the median value of the remaining 64 pixels.
6. **Binary Encoding:** Each pixel is set to `1` if above the median, and `0` if below. This creates a highly compressed 64-bit vector or fingerprint.

### 4.3.2 Sample Example: The Hamming Distance
When checking a new image against the database:
- **Original Signature:** `101010 ... 11`
- **New Image Signature:** `101011 ... 11`
The system computes the **Hamming Distance**, checking how many bits are different. In this example, only 1 bit flipped. 
We set a security threshold `< 8`. If the Hamming Distance between the new image and any database image is below 8, it is immediately triggered as a duplicate, even if an attacker rotated or compressed it.

---

## 4.4 Text Modality: MinHash and SBERT
Text methodology is inherently difficult because an attacker might simply copy-paste a document (Exact Match), or completely rewrite the document using synonyms (Paraphrasing Match). We solve this using two parallel pipelines.

### 4.4.1 Lexical Pipeline: MinHash (Locality Sensitive Hashing)
This focuses on exact matches or heavily copied sentences.
1. **Shingling (n-grams):** The engine strips punctuation and breaks the uploaded text into structural blocks. Example: "The quick fox jumped" becomes `{ "the quick fox", "quick fox jumped" }`.
2. **Permutations:** It runs hundreds of randomized hashing functions over the shingles.
3. **MinHash Matrix:** It forms a compact signature.
4. **Jaccard Similarity Comparison:** The engine compares the intersection over the union of two documents. A score close to `1.0` means they share identical vocabulary structure.

### 4.4.2 Semantic Pipeline: Sentence-BERT (SBERT)
This pipeline focuses entirely on meaning, designed natively in PyTorch utilizing advanced Natural Language Processing.
1. **Deep Neural Encoding:** The entire text is fed into a lightweight SBERT Transformer model (`all-MiniLM-L6-v2`).
2. **Vectors Extraction:** The model analyzes contextual relationships between words and outputs an interconnected 384-dimensional dense vector space. 
3. **Cosine-Similarity:** When Alice uploads a document describing "A rapidly accelerating vehicle", and Bob uploads "A fast moving car", the lexical match is 0%, but the SBERT Cosine Similarity approaches `> 0.90` due to spatial encoding vector proximity.
4. **The Verdict:** If the similarity score triggers the `> 0.85` threshold, the system flags the upload as a **"SEMANTIC DUPLICATE (AI/Paraphrased)"**.

*[Image Suggestion: A 3D graph showing two dense vectors pointing in a similar direction representing SBERT Semantic match vs a word-cloud representing MinHash]*

---

## 4.5 Audio Modality: Spectrogram Fingerprinting
Audio manipulation consists of altering pitch, changing tempo, cutting sections, or boosting the bass. A standard hash fails against all these attacks.
### 4.5.1 Step-by-Step Processing Pipeline
1. **Waveform Extraction:** The engine uses Python's `librosa` library to read the raw audio time-series data.
2. **Constant-Q Transform (CQT):** Unlike a standard Fourier Transform, CQT isolates musically relevant frequencies directly correlated to human pitch perception.
3. **Spectrogram Generation:** The audio wave is mapped onto a 2D matrix (Time vs. Frequency vs. Amplitude).
4. **Constellation Mapping & Peak Finding:** The engine filters out background noise and isolates the loudest amplitudes in local time-frequency blocks, forming a 'Constellation Map'—similar to looking at stars in the night sky.
5. **Hashing Anchor Points:** It creates pairs of peaks based on their relative time distance. This temporal distance remains identical even if the volume is muted.
6. **Target Matching:** By checking how many exact peak-pairs align temporally with existing database audio tracks, the system outputs an Originality score, blocking mashed-up or equalized songs.

---

## 4.6 Video Modality: Multi-Modal Demuxing
Video data is incredibly complex and requires hybrid verification techniques to ensure the visual track isn't stolen while replacing the music, or vice versa.
### 4.6.1 Step-by-Step Processing Pipeline
1. **Audio/Video Separation (Demuxing):** The `moviepy` library isolates the `.mp4` into a separate `.mp3` audio track and a mute video track.
2. **Audio Track Delegation:** The separated audio channel is instantly piped into the Audio Spectrogram Engine (Section 4.5) to check against registered music/voiceovers.
3. **Keyframe Extraction:** Videos have too many frames (30fps) to hash optimally. The engine extracts precisely 1 keyframe per second representing the visual scene.
4. **Sequential pHashing:** Every extracted keyframe is passed through the Image pHash Engine (Section 4.3). The collective array of 64-bit strings forms a temporal hash sequence.
5. **Frame Alignment Matching:** The engine checks for sequence intersections against its database. If 30 consecutive keyframe hashes match an existing video's sequences, the video is flagged as a direct copy or segment rip.

*[Image Suggestion: A diagram showing an MP4 splitting into a visual timeline (frames) and an audio waveform, both pointing to their respective AI detection engines]*
