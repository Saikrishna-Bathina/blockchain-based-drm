# Chapter 3: System Analysis

## 3.1 Existing System and Its Limitations
In the existing ecosystem, digital platforms use proprietary algorithms and centralized databases (like SQL or NoSQL stores) to track who purchased a license and who uploaded the content. 

### 3.1.1 Vulnerability of Centralized Storage
Current DRM platforms store the master copies of digital assets on centralized cloud servers (e.g., AWS S3). While they map these assets to user accounts securely on the front end, a single database breach or malicious insider can leak the entire database of high-resolution files.

### 3.1.2 The "Brittle Hash" Problem in Duplicate Detection
When traditional systems attempt to check for plagiarism or duplicate uploads, they rely on cryptographic hashes like MD5, SHA-1, or SHA-256. Cryptographic hashes are designed to guarantee data integrity; if a 100MB video has a single megabyte flipped (or even a single pixel changed out of millions), the resulting SHA-256 hash completely changes.
* **The Pirate's Advantage:** A malicious user can download a copyrighted image, change a single invisible pixel, and re-upload it. The traditional DRM system generates a different SHA-256 hash, assumes the image is completely new, and grants the pirate copyright. 

### 3.1.3 Static Media Links
Even when standard DRM hides content, the streaming mechanism often relies on authenticated static URLs. Advanced users can open the browser's Network Developer Tools, extract the `.mp4` or `.m3u8` streaming URL, and bypass the DRM layer entirely to download the raw file.

---

## 3.2 Proposed System
The proposed project directly solves these constraints by constructing a trifecta architecture that decouples ownership verification, uniqueness validation, and secure storage into three isolated but interacting layers.

### 3.2.1 Layer 1: The AI Originality Engine Gateway
Before an asset is ever stored or minted, it passes through a Python-based microservice. It ignores the brittle byte-data and instead analyzes the *human-perceivable* structure of the file using Machine Learning arrays (pHash, MinHash, Spectrograms, SBERT). It queries a localized SQLite/FAISS vector database and rejects the upload if it determines the file is a manipulation of an existing registered asset.

### 3.2.2 Layer 2: Decentralized Smart Contract Ledger
Once validated as unique, the system interfaces with an Ethereum Smart Contract. This solidity-based infrastructure handles the financial and ownership logic. Instead of a database row saying `user=Alice, owns=Song1`, the blockchain creates an ERC-721 token that Alice physically holds in her MetaMask wallet. The smart contract contains the logic to accept Ether (ETH) payments, verify the price, and automatically distribute royalties directly to the original creator.

### 3.2.3 Layer 3: InterPlanetary File System (IPFS) & Encrypted Pipelines
We move storage away from centralized AWS buckets to IPFS, a decentralized peer-to-peer storage network. 
* To prevent IPFS users from just downloading the public file, our Node.js backend AES-256 encrypts the file *before* it leaves our server.
* The backend acts as the DRM gateway: it only unlocks the AES decryption keys based on zero-knowledge style proofs of blockchain ownership status to stream data securely to an authorized consumer.

*[Image Suggestion: A detailed Architecture Diagram showing Layer 1 (Python ML Engine), Layer 2 (Ethereum Smart Contract), and Layer 3 (Node.js/IPFS Storage)]*

---

## 3.3 Hardware and Software Requirements

### 3.3.1 Hardware Requirements
* **Processor:** Minimum Intel i5 / AMD Ryzen 5 or equivalent. (Intel i7 / Ryzen 7 recommended for faster ML inference times).
* **RAM:** 8 GB Minimum. 16 GB to 32 GB Recommended (Crucial for running the Sentence-BERT PyTorch models and processing long Audio Spectrogram arrays simultaneously in memory).
* **Storage:** 50 GB SSD for the application state, local DBs, and the SBERT Transformer model weights.

### 3.3.2 Software Requirements
* **Operating System:** Cross-platform (Windows, Linux environment preferred for Python library compilation, or macOS).
* **Frontend:** React.js via Vite, TailwindCSS for UI.
* **Backend:** Node.js, Express.js.
* **AI/ML Engine:** Python 3.11+, PyTorch, Sentence-Transformers (for NLP semantic analysis), ImageHash, DataSketch, librosa (for audio).
* **Blockchain Environment:** Solidity, Hardhat/Truffle development suite, MetaMask browser extension, Sepolia Ethereum Testnet (for zero-cost deployment testing).
* **Storage:** IPFS Desktop or Pinata API.
