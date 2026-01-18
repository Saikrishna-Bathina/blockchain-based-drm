# Frontend Documentation

The frontend is a React application built with Vite and Tailwind CSS. It interacts with the Backend API for content management and the Ethereum Blockchain (via ethers.js) for licensing and ownership.

## Table of Contents
- [Setup](#setup)
- [Key Features](#key-features)
- [Project Structure](#project-structure)
- [Wallet Integration](#wallet-integration)

## Setup

1.  **Prerequisites**: Node.js (v18+), MetaMask Extension.
2.  **Install Dependencies**:
    ```bash
    cd frontend
    npm install
    ```
3.  **Environment Variables** (Optional, for overrides):
    Create `.env` if needed for API URL override (Defaults to localhost:5000 in `lib/api.js`).

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Access at `http://localhost:5173`.

## Key Features

-   **Dashboard**: Overview of user activity.
-   **Upload Asset**: Drag-and-drop interface to upload files, set license prices, and register on-chain.
-   **Marketplace**: Browse and search for verifiable digital assets.
-   **Asset Details**: View metadata, verify originality score, purchase licenses, and stream content.
-   **Secure Player**: Video/Audio player that authenticates with the backend and supports watermarking.

## Project Structure

-   `src/components/ui`: Reusable UI components (Buttons, Cards, Inputs).
-   `src/pages`: Main view components (`UploadAsset`, `Marketplace`, `AssetDetails`).
-   `src/context`: Global state (`AuthContext` for User & Wallet).
-   `src/lib`: Utilities (`api.js` for Axios setup).
-   `src/abi`: Smart Contract ABIs (`DRMRegistry.js`, `DRMLicensing.js`).

## Wallet Integration

-   **Library**: `ethers.js` (v6).
-   **Connection**: Handled in `AuthContext`.
-   **Signing**:
    -   **Login**: Signs a message to verify identity without password.
    -   **Minting**: Calls `registerAsset` on `DRMRegistry`.
    -   **Purchasing**: Calls `purchaseLicense` on `DRMLicensing` (sending ETH).
