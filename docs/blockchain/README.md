# Blockchain Documentation

This component handles the decentralized registry of assets and the licensing logic using Ethereum Smart Contracts.

## Table of Contents
- [Smart Contracts](#smart-contracts)
- [Deployment](#deployment)
- [Testing](#testing)

## Smart Contracts

### 1. `DRMRegistry.sol`
-   **Standard**: ERC721 (Non-Fungible Token).
-   **Purpose**: Represents ownership of the digital asset.
-   **Key Functions**:
    -   `registerAsset(to, contentHash, metadataURI)`: Mints a new NFT to the creator. Stores IPFS CID.
    -   `getAsset(tokenId)`: Returns asset details.

### 2. `DRMLicensing.sol`
-   **Purpose**: Manages license terms and purchases.
-   **Key Functions**:
    -   `setLicenseTerms(tokenId, ...prices)`: Sets prices for Watch, Rent, Commercial use.
    -   `purchaseLicense(tokenId, licenseType)`: User sends ETH to buy a license. Records the license on-chain.
    -   `checkLicense(user, tokenId)`: Returns `true` if the user has a valid license.

## Deployment

We use **Hardhat** for development and deployment.

1.  **Install Dependencies**:
    ```bash
    cd blockchain
    npm install
    ```

2.  **Start Local Node**:
    ```bash
    npx hardhat node
    ```
    *Keeps running in a separate terminal.*

3.  **Deploy Contracts**:
    ```bash
    npx hardhat run scripts/deploy.js --network localhost
    ```
    **Important**: Copy the deployed `DRMRegistry` and `DRMLicensing` addresses and update them in:
    -   `backend/.env`
    -   `frontend/src/pages/UploadAsset.jsx`
    -   `frontend/src/pages/AssetDetails.jsx`

## Testing

Run unit tests (Mocha/Chai):
```bash
npx hardhat test
```
