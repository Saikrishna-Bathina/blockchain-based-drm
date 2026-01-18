# Blockchain-Based Digital Rights Management (DRM) System

A comprehensive DRM platform leveraging Blockchain for transparent ownership/licensing, IPFS for decentralized storage, and AI-powered Originality Checks to prevent piracy.

## 📚 Documentation
Detailed documentation is available in the `docs/` directory:

-   **[Backend Documentation](docs/backend/README.md)**: API Setup, Auth, Encryption, Streaming.
-   **[Frontend Documentation](docs/frontend/README.md)**: React App, Wallet Integration, Marketplace.
-   **[Blockchain Documentation](docs/blockchain/README.md)**: Smart Contracts, Deployment, Testing.
-   **[Originality Engine](docs/originality_engine/README.md)**: AI detection services.
-   **[Step-by-Step Walkthrough](walkthrough.md)**: Guide to running the full system locally.

## 🚀 Quick Start

### Prerequisites
-   Node.js (v18+)
-   MongoDB (Running locally or Atlas URI)
-   MetaMask Browser Extension (Chrome/Firefox/Brave)

### 1. Start Blockchain (Hardhat Node)
```bash
cd blockchain
npm install
npx hardhat node
```
*Leave this running.*

### 2. Deploy Contracts
In a new terminal:
```bash
cd blockchain
npx hardhat run scripts/deploy.js --network localhost
```
*Note the deployed addresses.*

### 3. Start Backend
In a new terminal:
```bash
cd backend
# Create .env file (see docs/backend/README.md)
npm install
npm run dev
```

### 4. Start Frontend
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173`.

## 🌟 Features

-   **Asset Registration**: Upload Video, Audio, Image, Text. Encrypted & stored on IPFS.
-   **Originality Check**: AI verification to ensure uniqueness before minting.
-   **NFT Minting**: Ownership tokenized as ERC721 on Ethereum.
-   **Licensing Marketplace**: Buy/Sell licenses (Watch, Rent, Commercial) securely.
-   **Secure Streaming**: Decrypts content on-the-fly only for valid license holders.
-   **Dynamic Watermarking**: Forensic watermarking overlay on video streams.

## 🛠 Tech Stack

-   **Frontend**: React, Vite, Tailwind CSS, Ethers.js.
-   **Backend**: Node.js, Express, MongoDB.
-   **Blockchain**: Hardhat, Solidity (ERC721).
-   **Storage**: IPFS, Local Encrypted Storage.
-   **AI/ML**: Python (Originality Detection).
