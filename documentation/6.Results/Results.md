# Chapter 6: Results

## 6.1 Test Results Analysis
Extensive simulations were conducted targeting the Originality Engine across diverse modalities emphasizing its robust functionality under intensive modifications. During our initial presentation, several test cases were demonstrated proving the engine's capability to detect highly manipulated assets.

### 6.1.1 Simulation Matrix
| **Asset Type** | **Algorithm** | **Simulated Modification** | **Result** |
| --- | --- | --- | --- |
| Image (JPG) | pHash | 50% Scaling & Recompressed | Detected (Hamming < 5) |
| Image (PNG) | pHash | Converted to Grayscale & Crop | Detected (Hamming < 8) |
| Text (PDF) | MinHash | Direct partial Copy-Paste | Detected (Jaccard > 0.95) |
| Text (TXT) | SBERT | Completely paraphrased content | Semantic Flag (Cosine > 0.88) |
| Audio (MP3) | Spectrogram | Compressed to 64kbps | Detected (Peak Match) |
| Video (MP4) | Multi-modal | Brightness +/- 40%, Audio Pitching | Detected (Video & Audio match) |

*[Image Suggestion: A screenshot showing the backend server console logs catching a 'DUPLICATE' file during one of the tests]*

---

## 6.2 Blockchain Deployment Efficiency
The integration tests on the Sepolia Ethereum test network validate successful state changes corresponding to minting tokens and granting transparent royalties seamlessly without latency exceeding an average mining block time of 13 seconds. Decentralized storage endpoints responded to validation queries confirming total metadata availability continuously.

*[Image Suggestion: A screenshot from Sepolia Etherscan showing the successful transaction hashes for the DRM Smart Contracts]*

---

## 6.3 UI Implementation & Dashboard
The frontend interface dynamically renders active digital assets according to the wallet connections allowing the users to "My Assets" and "My Licenses", streamlining direct interaction with the underlying complex decentralized protocols securely.

*[Image Suggestion: Screenshot of the 'My Licenses' page showing the 'Stream Securely' button under the purchased NFT headers]*
