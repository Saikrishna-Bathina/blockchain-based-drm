# Blockchain-Based Digital Rights Management (DRM) System

A comprehensive DRM platform leveraging Blockchain for transparent ownership/licensing, IPFS for decentralized storage, and AI-powered Originality Checks to prevent piracy.

---

## 📋 Prerequisites

Before running the project, ensure you have the following installed on your system:

1.  **Node.js (v18+)**: [Download Here](https://nodejs.org/)
2.  **started MongoDB (Locally or Atlas)**: [Download Community Server](https://www.mongodb.com/try/download/community)
3.  **Python (v3.10+)**: [Download Here](https://www.python.org/)
4.  **Go (v1.19+)**: [Download Here](https://go.dev/dl/) (Required for Audio Analysis)
5.  **FFmpeg**: [Download Here](https://ffmpeg.org/download.html) (Required for Audio/Video processing) -> **Ensure it is added to your System PATH.**
6.  **MetaMask Extension**: Installed in your browser (Chrome/Edge/Brave).
7.  **Git**: [Download Here](https://git-scm.com/)

---

## 📂 Project Structure

-   `blockchain/`: Hardhat project for Smart Contracts (ERC721).
-   `backend/`: Node.js/Express server for API, Auth, and Metadata.
-   `frontend/`: React/Vite application for the User Interface.
-   `originality-engine/`: Python Flask servers for Image/Audio/Video/Text analysis.

---

## 🛠️ Step-by-Step Installation & Execution

Follow these steps **in order** to set up the project on a fresh system.

### Phase 1: Blockchain Setup (Hardhat)

1.  Open a terminal in the `blockchain` folder:
    ```bash
    cd blockchain
    npm install
    ```
2.  Start the Local Hardhat Node:
    ```bash
    npx hardhat node
    ```
    > **KEEP THIS TERMINAL RUNNING.** This simulates the Ethereum blockchain locally.

3.  **Deploy Smart Contracts**:
    Open a **NEW** terminal (Terminal 2), navigate to `blockchain`, and run:
    ```bash
    npx hardhat run scripts/deploy.js --network localhost
    ```
    *   Copy the **Registry Address** and **Licensing Address** printed in the output. You might need them later (though the frontend/backend usually configures them).

### Phase 2: Originality Engine Setup (Python AI)

1.  Open a **NEW** terminal (Terminal 3) in `originality-engine`:
    ```bash
    cd originality-engine
    ```
2.  Create and Activate a Virtual Environment:
    ```bash
    # Windows
    python -m venv venv
    .\venv\Scripts\activate
    ```
3.  **Install Python Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
    *(Note: This includes `torch`, `sentence-transformers`, `flask`, `numpy`, etc. It may take a few minutes).*

4.  **Verify Go & FFmpeg**:
    *   Open terminal and run `go version` -> Should show Go 1.19+.
    *   Run `ffmpeg -version` -> Should show FFmpeg details.
    *   *Note: MinGW/GCC is NOT required.*

5.  **Start the AI Servers:**
    We have a script to run all engine servers (Image, Text, Audio, Video) at once.
    ```bash
    python start_servers.py
    ```
    > **KEEP THIS TERMINAL RUNNING.** (Ports: 5001, 5002, 5003, 5004)

### Phase 3: Backend Setup (Node.js API)

1.  Open a **NEW** terminal (Terminal 4) in `backend`:
    ```bash
    cd backend
    npm install
    ```
2.  **Environment Configuration**:
    Create a file named `.env` in the `backend/` folder and paste the following (fill in your keys):
    ```env
    PORT=5000
    MONGO_URI=mongodb://127.0.0.1:27017/drm_system
    JWT_SECRET=your_super_secret_key_123
    
    # Pinata (IPFS) Keys - Register at https://app.pinata.cloud
    PINATA_API_KEY=your_pinata_api_key
    PINATA_SECRET_API_KEY=your_pinata_secret_key
    PINATA_JWT=your_pinata_jwt_token
    ```
3.  Start the Backend Server:
    ```bash
    npm start
    ```
    > **KEEP THIS TERMINAL RUNNING.** (Port: 5000)

### Phase 4: Frontend Setup (React UI)

1.  Open a **NEW** terminal (Terminal 5) in `frontend`:
    ```bash
    cd frontend
    npm install
    ```
2.  Start the Application:
    ```bash
    npm run dev
    ```
3.  Open your browser and visit: `http://localhost:5173`

---

## 🦊 Metamask Configuration (Critical)

To interact with the local blockchain, you must configure MetaMask:

1.  Click the MetaMask extension icon.
2.  Go to **Settings** > **Networks** > **Add Network** > **Add a network manually**.
3.  Enter specific details:
    *   **Network Name**: Hardhat Local
    *   **RPC URL**: `http://127.0.0.1:8545`
    *   **Chain ID**: `31337`
    *   **Currency Symbol**: `ETH`
4.  **Import Test Account**:
    *   Go to your **Blockchain Terminal (Terminal 1)**.
    *   Scroll up to see the list of "Account #0", "Account #1", etc., and their **Private Keys**.
    *   Copy the Private Key of "Account #0".
    *   In MetaMask: Click **Account** (top center) > **Add account or hardware wallet** > **Import account**.
    *   Paste the private key.
    *   You should now see **10000 ETH** (or similar) in your balance.

---

## 🧪 Testing the Flow

1.  **Register/Login**: Create an account on the frontend.
2.  **Connect Wallet**: Click "Connect Wallet" and select the imported Hardhat account.
3.  **Upload Asset**: Go to Dashboard > Upload. Select an image/video.
4.  **Originality Check**: The system will talk to the Python Engine.
    *   *Green Check*: Original.
    *   *Red X*: Duplicate (if you re-upload the same file).
5.  **Mint NFT**: If original, click "Mint". MetaMask will pop up to sign the transaction.
6.  **Verify**: Check "My Assets" to see your tokenized content.

---

## ⚠️ Troubleshooting

*   **Error: "Unexpected token" / "is not valid JSON" (Backend)**:
    *   This happens if the frontend sends a raw string instead of a JSON object.
    *   **Fix**: Hard Refresh the browser (`Ctrl+F5`) to ensure the latest `Register.jsx` code (`{ username, ... }`) is loaded.
*   **Error: "Nonce too high" in MetaMask**:
    *   Go to MetaMask Settings > Advanced > Clear activity tab data. This resets your transaction history for the local network.
*   **Error: "Connection Refused" (Backend)**:
    *   Ensure MongoDB is running (`mongod` in a separate terminal if not a service).
*   **Error: "Module not found" (Python)**:
    *   Ensure you activated the virtual environment (`.\venv\Scripts\activate`) before running `start_servers.py`.

---
