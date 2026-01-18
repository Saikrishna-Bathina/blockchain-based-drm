# Frontend Module Documentation

## 📖 Introduction
The Frontend is the user-facing interface of the DRM system, built with **React** and **Tailwind CSS**. It provides a modern, responsive dashboard for creators to upload assets, manage their portfolio, and interact with the blockchain using **MetaMask**.

## 🏗 Architecture
*   **Framework**: React (Vite build tool).
*   **Styling**: Tailwind CSS + Shadcn UI components.
*   **State Management**: React Context API (`AuthContext`).
*   **Routing**: React Router DOM.
*   **Web3 Interaction**: Ethers.js (v6).

## 🔑 Key Concepts

### 1. Wallet Abstraction & Connectivity
*   **MetaMask Integration**: The app connects directly to the browser's MetaMask extension via `window.ethereum`.
*   **Network Handling**: Logic in `AuthContext` forces the wallet to switch to **Hardhat Localhost (Chain ID 31337)**. If the network doesn't exist in the user's wallet, the app programmatically requests to add it.
*   **Ethers.js Provider**: Used to wrap the `window.ethereum` object to sign transactions (Minting) and query blockchain state (fetch balances).

### 2. The Upload & Minting Flow
This is the core feature implemented in `UploadAsset.jsx`:
1.  **File Selection**: User drops a file (Video/Image/Audio/Text).
2.  **API Upload**: File is sent to Backend (`/api/v1/assets/upload`).
3.  **Visual Status Tracker**: A dynamic progress bar shows the asset's state:
    *   *Analyzing* (AI Check)
    *   *Duplicate* (Rejected)
    *   *Verified* (Approved)
    *   *Securing* (IPFS Upload)
    *   *Minting* (Blockchain Transaction)
4.  **Minting**: Once `Verified` and `Secured`, the "Mint NFT" button enables. Clicking it triggers a smart contract call (`registerAsset`) using the user's wallet.

## 📂 Folder Structure
*   `src/components/ui/`: Reusable UI atoms (Buttons, Cards, Inputs).
*   `src/context/`: Global state providers.
    *   `AuthContext.jsx`: Handles User Login + Wallet Connection.
*   `src/pages/`: Main application views.
    *   `Dashboard.jsx`: User overview.
    *   `UploadAsset.jsx`: The main creation flow.
    *   `MyAssets.jsx`: Gallery of owned NFTs.
    *   `Marketplace.jsx`: Public listing of licensed assets.
*   `src/abi/`: JSON Artifacts of compiled Smart Contracts (ABI).

## 🔌 Key Components

### AuthContext.jsx
The heart of the application. It exposes:
*   `user`: The authenticated user object.
*   `provider`: The Ethers.js provider instance.
*   `connectWallet()`: Initiates MetaMask connection.
*   `switchNetwork()`: Manually forces network change to Localhost.

### UploadAsset.jsx
Handles the complex state machine of an asset upload. It polls the backend for status updates on the originality check and handles the conditional rendering of the Mint button.

## 🚀 Execution Flow

1.  **Start Dev Server**: `npm run dev`.
2.  **Access**: Open `http://localhost:5173`.
3.  **Interaction**: App communicates with Backend API (Port 5000) and MetaMask Extension.
