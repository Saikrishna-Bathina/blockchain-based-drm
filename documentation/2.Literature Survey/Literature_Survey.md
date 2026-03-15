# Chapter 2: Literature Survey

## 2.1 Overview
A profound analysis of the current state of DRM, perceptual hashing algorithms, privacy mechanisms, and Blockchain-as-a-Service integration was conducted to establish a foundation for the proposed architecture. This chapter reviews three primary research papers that guided the development of our Blockchain-Based DRM system.

---

## 2.2 Paper 1: Blockchain-Based Digital Rights Management in the Music Industry
**Authors:** Raffaele Fabio, Alexandra Cecilie  
**Published in:** Springer (2023)

### 2.2.1 Overview
This paper discusses how Blockchain can be used to manage music rights transparently. It focuses on solving problems like Metadata Inconsistency, Royalty Delays, and Opaque Ownership Structures in traditional DRM systems.

### 2.2.2 Methodology
* Proposed a public-permissioned Blockchain model for recording music ownership and license metadata.
* Used smart contracts for automatic royalty payouts.
* Introduced unique contributor identifiers to ensure clear ownership and proper crediting.

### 2.2.3 Key Findings
* Blockchain ensures Transparency and Immutability in music rights data.
* Smart contracts remove intermediaries and speed up royalty settlements.

### 2.2.4 Limitations
* Does not address music originality or plagiarism detection.
* Focused only on post-upload rights management.
* Applies only to the music industry — does not support images, PDFs, or other digital assets.

### 2.2.5 How Our Project Builds on It
We extend the paper’s idea by supporting **multiple digital assets** (music, video, images, PDFs), not just music. We also integrated an Originality Engine to handle pre-upload originality detection, completely solving the plagiarism loophole.

---

## 2.3 Paper 2: Privacy-Preserving Mechanisms for Blockchain-Based Digital Rights Management
**Authors:** Shaoqi Yuan, Wenzhong Yang, Xiaodan Tian  
**Published in:** MDPI (2024)

### 2.3.1 Overview
This paper focuses on maintaining user Privacy in blockchain-based DRM systems while keeping data verifiable.

### 2.3.2 Methodology
* Uses ZK-SNARK (Zero-Knowledge Proof) to prove ownership without revealing sensitive data.
* Stores large data files off-chain in IPFS to reduce blockchain load.
* Implements ECC Encryption for protecting Personally Identifiable Information (PII).

### 2.3.3 Key Findings
* Achieves strong Privacy and legal Traceability.
* ZK-SNARKs make it possible to verify ownership without exposing the actual song data.

### 2.3.4 Limitations
* Generating zk-SNARK proofs is computationally Expensive for large media files.
* Needs optimization for faster verification at scale.

### 2.3.5 How Our Project Builds on It
Instead of using heavy, computationally expensive ZK-SNARK proofs which slow down media streaming, our project uses **AES-256 encryption combined with IPFS** to ensure secure and private file storage, optimizing for real-time high-definition media streaming.

---

## 2.4 Paper 3: Blockchain as a Service (BaaS) Framework for Digital Rights Management
**Authors:** Jialin Shi  
**Published in:** ResearchGate (2024)

### 2.4.1 Overview
Introduces a Blockchain-as-a-Service (BaaS) model that simplifies DRM system creation for developers and organizations.

### 2.4.2 Methodology
* Implements a hybrid blockchain architecture using:
  * Hyperledger Fabric for rights confirmation (private core).
  * Ethereum/ERC20 for payments and public verification.
* Proposes a Digital Rights Coin (DRC) — an ERC20 token for licensing and payment.
* Uses Elliptic Curve Cryptography (ECC) for authentication and multi-signature for secure high-value transactions.

### 2.4.3 Key Findings
* Hybrid DLT systems balance privacy and public trust.
* Modular design (BaaS) makes DRM more accessible to smaller organizations.

### 2.4.4 Limitations
* Centralized key storage poses a single point of failure (SPOF).
* Using volatile crypto tokens (DRC) introduces payment instability.

### 2.4.5 How Our Project Builds on It
We improve on this BaaS model by using a fully decentralized storage solution (IPFS) and decentralized key management for absolute security. We eliminated the volatility of custom tokens by utilizing standard established cryptocurrency for royalty payments and, most importantly, integrated **AI Originality Checks before the rights confirmation happens**, stopping malicious registrations at the gateway.
