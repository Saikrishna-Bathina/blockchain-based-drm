# Backend Module Documentation

## 📖 Introduction
The Backend is the central orchestration layer of the DRM system. Built with **Node.js** and **Express**, it manages user authentication, metadata storage, and communication between the frontend, blockchain, and AI originality engine. It serves as the bridge that ensures securely uploaded assets are verified before being committed to the blockchain.

## 🏗 Architecture
*   **Runtime**: Node.js (v18+)
*   **Framework**: Express.js
*   **Database**: MongoDB (Mongoose ODM)
*   **Storage**: IPFS (via Pinata) used for decentralized asset storage.
*   **Authentication**: JWT (JSON Web Tokens) for session management; Crypto Signatures for wallet verification.

## 🔑 Key Concepts

### 1. Hybrid Authentication
The system uses a unique hybrid auth flow:
*   **Traditional**: Email/Password for standard login (returns a JWT).
*   **Web3**: Wallet Connect (MetaMask) is linked to the user account.
    *   **Challenge**: The backend generates a nonce/message.
    *   **Sign**: The user signs it with their private key.
    *   **Verify**: Backend recovers the address from the signature using `ethers.verifyMessage`. If it matches, the wallet is linked.

### 2. Asset Lifecycle Management
1.  **Upload**: User uploads file + metadata.
2.  **Originality Check**: Backend sends the file path to the **Python Originality Engine**.
3.  **Result Handling**:
    *   If **Original**: Status updated to `verified`. IPFS upload is permitted.
    *   If **Duplicate**: Status set to `duplicate`. Flow stops.
4.  **IPFS Pinning**: Verified assets are uploaded to IPFS via Pinata. The resulting CID (Content ID) is returned to the frontend for minting.

## 📂 Folder Structure
*   `src/controllers/`: Business logic (Auth, Assets).
*   `src/models/`: Database Schemas (User, Asset, License).
*   `src/routes/`: API Endpoint definitions.
*   `src/middleware/`: Auth verification (`protect`), Error handling.
*   `src/utils/`: Helper functions (IPFS upload, S3 wrappers).

## 🗄️ Database Schemas

### User Model
*   `username`, `email`: Standard profile info.
*   `walletAddress`: The linked Ethereum address (Unique).
*   `nonce`: Random string used for signature verification to prevent replay attacks.

### Asset Model
*   `title`, `description`, `contentType`: Metadata.
*   `creator`: Reference to User ID.
*   `originalityScore`: 0-100 score from AI engine.
*   `cid`: IPFS Content ID (only present if verified).
*   `blockchainId`: Token ID (updated after minting).
*   `licenseParams`: Licensing configuration (price, types).

## 🔌 API Endpoints

### Authentication
*   `POST /api/v1/auth/register`: Create new user.
*   `POST /api/v1/auth/login`: Login with credentials.
*   `PUT /api/v1/auth/connect-wallet`: Link MetaMask address.
*   `GET /api/v1/auth/me`: Get current user profile.

### Assets
*   `POST /api/v1/assets/upload`: Upload raw file (storage local temp).
*   `POST /api/v1/assets/check-originality`: Trigger AI check.
*   `PUT /api/v1/assets/:id/secure`: Upload to IPFS (if verified).
*   `GET /api/v1/assets`: List all assets.

## 🚀 Execution Flow

1.  **Start Server**: `npm start` (Runs on Port 5000).
2.  **Connect DB**: Mongoose connects to `MONGO_URI`.
3.  **Listen**: Express app listens for HTTP requests.
