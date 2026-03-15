# Chapter 3: System Analysis

## 3.1 Existing System
In the existing ecosystem, digital platforms use proprietary algorithms and centralized databases (like SQL or NoSQL stores) to track who purchased a license and who uploaded the content. Additionally, when originality checking exists, content is merely evaluated by simple cryptographic MD5/SHA hashes, resulting in frequent duplicate attacks when one single pixel or single byte is altered.

*[Image Suggestion: Structure diagram of a traditional DRM system highlighting central servers as a single point of failure]*

### 3.1.1 Drawbacks
* **Centralized Authority:** A single database failure or a malicious administrator can alter ownership rights and wipe out creator royalties.
* **Ineffective Duplicate Detection:** Cryptographic hashes fail entirely against minor cropping, re-encoding, or paraphrasing.
* **High Transaction Fees for Middlemen:** Distributors take up to 30-50% and royalties are opaque and delayed.
* **Static Media Links:** Unauthorized users frequently extract the streaming URL and bypass the DRM layer entirely.

---

## 3.2 Proposed System
The proposed project directly solves these constraints by constructing a trifecta architecture:

1. **Originality Engine:** A Python-based multi-modal processing server that extracts features (pHash, MinHash, Spectrograms) and cross-verifies new uploads against a vast vector index database.
2. **Smart Contract Ledger:** A solidity-based Ethereum infrastructure that logs licenses, handles automated royalty distributions, and verifies the identity of the user cryptographically via Web3 wallets like Metamask.
3. **Encrypted Data Pipeline:** A secured Node.js backend acting as the DRM gateway, only unlocking content AES keys based on zero-knowledge style proofs of blockchain ownership status to stream data securely.

*[Image Suggestion: Proposed System Architecture Diagram showing the flow between the Creator, Originality Engine, Smart Contract, IPFS, and Consumer]*

---

## 3.3 System Architecture Flow
The system architecture flows asynchronously as follows:
1. A creator submits an asset with metadata to the Originality Engine via the React frontend.
2. The Engine validates uniqueness via Euclidean/Cosine distance thresholds against existing signatures in the registry.
3. If unique, the React frontend signs the corresponding transaction using Web3 and Metamask.
4. The Smart Contract validates the deployment and logs the ERC-721 NFT in the blockchain state.
5. The backend stores the AES-encrypted version of the file in the decentralized IPFS bucket securely.
6. When a purchaser buys a license on-chain, their wallet signs a cryptographic request. The Backend ensures they own the NFT and issues a 10-minute JWT token allowing client-side hardware decryption for playback logic.

---

## 3.4 Hardware and Software Requirements

### 3.4.1 Hardware Requirements
* **Processor:** Intel i5 / AMD Ryzen 5 or equivalent for standard operations.
* **RAM:** 8 GB Minimum (16 GB Recommended for running the Machine Learning Semantic models locally).
* **Storage:** 50 GB SSD to comfortably store the Local Databases and Model Weights.

### 3.4.2 Software Requirements
* **Operating System:** Windows, Linux, or macOS.
* **Programming Languages & Frameworks:** JavaScript / TypeScript (Node.js, React, Vite), Python (Originality Engine), Solidity (Smart Contracts).
* **Blockchain Environment:** Hardhat / Truffle development suite, MetaMask extension, Sepolia Ethereum Testnet.
* **Database & Storage:** SQLite (Feature indexing), MongoDB (Metadata mappings), IPFS (InterPlanetary File System).
* **AI/ML Libraries:** PyTorch, Sentence-Transformers, pyPDF, FFmpeg.
