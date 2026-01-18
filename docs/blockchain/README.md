# Blockchain Module Documentation

## 📖 Introduction
The Blockchain module provides the decentralized trust layer for the DRM system. It consists of **Smart Contracts** written in **Solidity** that run on an Ethereum-compatible network (Hardhat Localhost for development). It utilizes the **ERC721** standard to represent digital assets as unique Non-Fungible Tokens (NFTs), ensuring immutable proof of ownership.

## 🏗 Architecture
*   **Language**: Solidity (v0.8.x).
*   **Framework**: Hardhat (Development environment).
*   **Standards**: ERC721 (NFT), Ownable.
*   **Libraries**: OpenZeppelin (Secure base implementations).

## 📜 Smart Contracts

### 1. DRMRegistry.sol (The Asset Core)
This contract is the "ledger" of all creative works.
*   **Inheritance**: `ERC721URIStorage`.
*   **Functionality**:
    *   `registerAsset(address to, string memory contentHash, string memory metadataURI)`: Mints a new NFT.
    *   **Content Hash**: We store a hash of the content on-chain to prove integrity.
    *   **Metadata URI**: Links to the IPFS JSON containing title, description, and originality score.
    *   **Events**: Emits `AssetRegistered` which the frontend/backend can listen to for indexing.

### 2. DRMLicensing.sol (The Marketplace)
Handles the commercialization of assets.
*   **Functionality**:
    *   `createLicenseOptions(uint256 tokenId, ...)`: Asset owner defines pricing for different usage types (Personal, Commercial, Streaming).
    *   `purchaseLicense(uint256 tokenId, uint256 licenseType)`: A buyer sends ETH to purchase rights.
    *   **Payment Splitting**: Funds are automatically forwarded to the NFT owner.
    *   **Access Control**: Streaming services verify this contract to check if a user holds a valid license (e.g., "Has address X paid for Token Y?").

## 📂 Folder Structure
*   `contracts/`: Solidity source files (`.sol`).
*   `scripts/`: Automation scripts.
    *   `deploy.js`: Compiles contracts and deploys them to the active network.
    *   `fund_user.js`: Helper to send test ETH to a specific wallet.
*   `test/`: Unit tests for contracts.
*   `artifacts/`: Compiled JSON output (ABI and Bytecode) - generated after build.

## 🚀 Deployment & Execution

### 1. The Hardhat Node
We run a local blockchain that simulates Ethereum.
```bash
npx hardhat node
```
*   This spins up a network at `http://127.0.0.1:8545`.
*   It provides 20 test accounts, each pre-funded with 10,000 ETH.
*   **Crucial**: This terminal must stay open.

### 2. Deployment
To push our smart contracts to this local network:
```bash
npx hardhat run scripts/deploy.js --network localhost
```
*   This script acts as the "Genesis" event for our app.
*   It prints the fresh **Contract Addresses**. These addresses must be configured in the Backend (`.env`) and Frontend (`constants` or `.env`) so they know where to send transactions.

### 3. Verification
You can interact with the deployed contracts using the Hardhat Console:
```bash
npx hardhat console --network localhost
```
