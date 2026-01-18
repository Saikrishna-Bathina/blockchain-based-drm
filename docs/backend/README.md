# Backend Documentation

The backend is built with Node.js and Express, connected to a MongoDB database. It handles user authentication, file uploads, originality checks, encryption, IPFS interaction, and secure streaming.

## Table of Contents
- [Setup](#setup)
- [Architecture](#architecture)
- [API Reference](#api-reference)
- [Smart Contract Integration](#smart-contract-integration)

## Setup

1.  **Prerequisites**: Node.js (v18+), MongoDB (v6+), IPFS Daemon (Optional, for local node).
2.  **Install Dependencies**:
    ```bash
    cd backend
    npm install
    ```
3.  **Environment Variables**:
    Create a `.env` file in `backend/` with the following:
    ```env
    NODE_ENV=development
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/blockchain-drm
    JWT_SECRET=your_jwt_secret_key
    JWT_EXPIRE=30d
    
    # Blockchain
    RPC_URL=http://127.0.0.1:8545
    DRM_LICENSING_ADDRESS=<Deployed_Contract_Address>
    ```

4.  **Run Server**:
    ```bash
    npm run dev
    ```

## Architecture

-   **Controllers**:
    -   `auth.js`: Handles Register, Login, Wallet Connection.
    -   `asset.js`: Handles Uploads, Originality Check triggering, Encryption, IPFS pinning.
    -   `stream.js`: Handles Secure Streaming token verification and file decryption on-the-fly.

-   **Services**:
    -   `encryptionService.js`: AES-256-CBC encryption/decryption.
    -   `ipfsService.js`: Interacts with IPFS node.
    -   `originalityService.js`: Calls external Python Originality Engine.

## API Reference

### Authentication
-   `POST /api/v1/auth/register`: Register new user.
-   `POST /api/v1/auth/login`: Login user (returns JWT).
-   `POST /api/v1/auth/users/connect-wallet`: Link MetaMask wallet.

### Assets
-   `POST /api/v1/assets/upload`: Upload file (Multipart Form).
    -   Fields: `file`, `title`, `description`, `contentType`, `licenseTerms` (JSON).
-   `GET /api/v1/assets`: List verified assets (supports `search`, `contentType`, `sort`).
-   `GET /api/v1/assets/:id`: Get asset details.
-   `PUT /api/v1/assets/:id/mint`: Update asset with Blockchain Token ID after minting.

### Streaming
-   `GET /api/v1/assets/:id/stream`: Secure stream endpoint.
    -   Headers: `Authorization: Bearer <token>` or Query param `?token=<token>`.
    -   Validates User's ownership or Blockchain License.
    -   Supports Range requests (seeking).
    -   Dynamic Watermarking: Add `?watermark=true` (requires FFmpeg).

## Smart Contract Integration
The backend listens to or queries the **DRMLicensing** contract to verify if a user has purchased a license before allowing streaming access.
