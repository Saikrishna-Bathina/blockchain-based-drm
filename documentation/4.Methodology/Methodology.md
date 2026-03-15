# Chapter 4: Methodology

## 4.1 Problem Statement
Design and develop a complete decentralized architecture for Digital Rights Management that cryptographically locks the distribution of proprietary content exclusively to verified licensed parties, whilst ensuring the absolute originality of all minted assets.

---

## 4.2 Originality Engine Implementation
The Originality Engine is a microservice developed fundamentally to evaluate data streams of diverse MIME types and compare them quantitatively against existing system fingerprints. Traditional DRM simply copies files blindly. Our system creates unique biological-like "fingerprints" for every file uploaded.

*[Image Suggestion: Flowchart of the Originality Engine deciding between Image, Text, Audio, and Video files, applying the correct model, and returning an Original vs. Duplicate verdict]*

### 4.2.1 Image Assets (pHash)
Image uniqueness is handled via Perceptual Hashing (pHash). This algorithm operates on structural frequencies rather than exact binary data.
* **Process:** The algorithm converts the image to grayscale, applies a Discrete Cosine Transform (DCT), filters high frequencies, and extracts a 64-bit sequence representing the core structure.
* **Detection:** Comparisons between two images are measured uniformly using Hamming Distance. If the Hamming Distance between two images is less than a configured threshold (e.g., < 8), a duplication flag is triggered. This catches resized, compressed, and slightly cropped images easily.

### 4.2.2 Text Assets (MinHash & SBERT)
The text methodology is designed natively in two parallel execution pipelines to catch both copy-paste plagiarism and AI-paraphrased plagiarism.
* **Lexical (MinHash):** Rapidly tokenizes document (txt/pdf/docx) strings into n-grams (shingles) and stores permutations into subsets. It approximates the Jaccard similarity to catch copy-paste or exact matches globally in milliseconds.
* **Semantic (SBERT):** A computationally heavy Sentence-BERT (SBERT) model embeds the extracted textual context into a 384-dimensional dense vector space. A Cosine-Similarity function evaluates the contextual proximity. Thus, even extensively paraphrased structural texts (like swapping nouns/verbs but keeping the same meaning) are successfully identified as Semantically Duplicated.

### 4.2.3 Audio and Video Extraction
Media data requires comprehensive multi-modal assessment. 
* **Audio:** Fingerprinting utilizes the generation of frequency-magnitude spectrograms from the audio wave tracks. Constant-Q transformation establishes distinct time-frequency patterns that detect audio manipulation independent of amplitude (volume changes).
* **Video:** Videos are structurally processed by uniformly extracting visual keyframes (e.g., 1 frame per second), calculating individual pHashes sequentially to form a hash sequence, and independently performing the Audio Fingerprinting analysis on the demuxed overlapping audio channel.

*[Image Suggestion: A 3D graph representing SBERT dense vector spaces or a spectrogram of an audio file]*

---

## 4.3 Smart Contract and Licensing Model
Tokens are categorized conforming to ERC-721 non-fungible token specifications on the Ethereum blockchain.
* **Metadata Integrity:** The ERC-721 metadata URI points to a JSON file holding hashes of the encrypted content, ensuring that the token directly corresponds to the DRM-secured media.
* **License Registry:** The `LicenseRegistry` contract interfaces direct payment transferences. When a user requests a license, the exact `msg.value` (payment) is checked against the set price, and if matched, it transfers funds immediately to the creator’s wallet address—automating royalties completely.

*[Image Suggestion: A diagram illustrating the flow of Ethereum or stablecoins from a consumer to the NFT Smart Contract and then to the Original Creator]*
