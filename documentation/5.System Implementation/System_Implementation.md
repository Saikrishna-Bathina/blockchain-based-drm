# Chapter 5: System Implementation

## 5.1 Frontend Architecture (React + Web3)
The progressive web application is developed using the React framework via Vite for rapid HMR (Hot Module Replacement) and optimized build assets. It establishes the bridge between the user's local hardware and the decentralized Ethereum Virtual Machine (EVM).

### 5.1.1 Connecting the Web3 Wallet (MetaMask)
The frontend utilizes the `ethers.js` library to interact with the Ethereum blockchain via the Injected Web3 Provider (`window.ethereum`). 
* When a user visits the platform, they click `Connect Wallet`.
* `ethers.js` requests the user's public address (e.g., `0x1234...ABCD`).
* This address acts as their universal, password-less login identity. All assets they mint, and all licenses they purchase, are cryptographically tied to this 42-character hex string.

### 5.1.2 The Asset Upload Workflow
An intuitive upload dashboard directs the user through a multi-step process:
1. **Metadata Collection:** Title, Description, Price (in ETH), and the raw file buffer.
2. **Phase 1 - Originality Execution:** The file buffer is sent via HTTP POST to the Python Originality Engine. The frontend waits for the JSON response. If the response contains `"status": "DUPLICATE"`, the UI instantly blocks the transaction and shows an error toast.
3. **Phase 2 - IPFS Storage:** If unique, the file is encrypted using a unique AES-256 key, and the ciphertext is pinned to the InterPlanetary File System (IPFS) utilizing the Pinata API. IPFS returns a unique Content Identifier (CID).
4. **Phase 3 - Smart Contract Minting:** A JSON metadata object is constructed containing the IPFS CID, and uploaded to IPFS itself. The resulting Metadata URI is sent to the Smart Contract's `mintAsset` function via an Ethereum transaction popup in MetaMask. 

*[Image Suggestion: A screenshot of the React Application Dashboard showing the user's connected wallet and the multi-step progress bar during an asset upload]*

---

## 5.2 Smart Contract Implementation (Solidity)
The core logic resides in a centralized `.sol` file deployed to the Sepolia Ethereum Testnet. The contract handles the ERC-721 logic, structural mappings, and the state-changing functions.

### 5.2.1 License Registry and Payments
The Smart Contract eliminates the need for a traditional payment gateway (like Stripe) or a distribution publisher holding funds. The logic strictly enforces payment conditions before changing the state variables.

```solidity
// Struct defining a registered asset
struct Asset {
    address payable creator;
    uint256 price;
    string metadataURI;
    bool exists;
}

// Mapping from Asset ID to the Asset details
mapping(uint256 => Asset) public assets;

// Mapping from Consumer Address to Asset ID to License Status
mapping(address => mapping(uint256 => bool)) public userLicenses;
```

### 5.2.2 The Purchase Function Flow
When a consumer clicks "Buy License" for `0.05 ETH`:
1. The `purchaseLicense(uint256 assetId)` function executes.
2. `require(msg.value >= assets[assetId].price)` verifies the consumer actually attached `0.05 ETH` to the transaction.
3. `payable(assets[assetId].creator).transfer(msg.value)` immediately routes the ETH to the creator's wallet.
4. `userLicenses[msg.sender][assetId] = true` updates the specific consumer's address as an authorized owner of the asset.

*[Image Suggestion: A screenshot of Remix IDE or Hardhat showing the successful compilation and deployment of the Smart Contract]*

---

## 5.3 Backend and Security Pipeline (Node.js)
The backend logic is constructed using Express.js. For streaming authenticated assets securely, standard static file-serving approaches (like NGINX direct linking) are blocked. If we just gave the IPFS link to the consumer, they could share it with the world.

### 5.3.1 Cryptographic Handshake (EIP-712 / Personal Sign)
To prove the user owns the `0x1234...ABCD` wallet interacting with the DRM server:
1. The Backend generates a random `nonce` (e.g., "Sign this message to prove identity: 987654").
2. The Frontend triggers a MetaMask `personal_sign` popup. The user signs the text string with their private key.
3. The Backend uses `ethers.utils.verifyMessage()` to recover the public address from the cryptographic signature.
4. If it matches, the Backend queries the Smart Contract (`userLicenses[wallet][assetId]`) via the Infura RPC node.

### 5.3.2 Stream Tokens (JWT)
If the Smart Contract returns `true` (valid license), the backend generates a short-lived JSON Web Token (JWT) signed with a secret `HMAC SHA256` key. This token is strictly valid for 10 minutes and tied to the specific `assetId`.

### 5.3.3 On-The-Fly Decryption Streaming
When the DRM video player requests chunks of the video:
1. The Express route validates the JWT.
2. It fetches the encrypted chunk from IPFS.
3. It creates an AES-256 Decipher stream in Node.js memory.
4. It pipes the AES-decrypted byte buffers directly into the `HTTP 206 Partial Content` response.
This ensures the physical unencrypted file *never* touches a hard drive, existing only in RAM while streaming, completely mitigating unauthorized downloading.

*[Image Suggestion: A screenshot of the backend terminal logs showing the JWT validation and the "Streaming File..." HTTP 206 logs]*

---

## 5.4 Originality Engine API (Python/Flask)
The engine operates as an independent REST API to prevent locking the main Node thread during heavy tensor calculations. 

### 5.4.1 Flask Routing
```python
@app.route('/api/originality', methods=['POST'])
def check_originality():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
        
    file = request.files['file']
    file_type = file.content_type
    
    # Delegate to corresponding ML inference method
    if file_type.startswith('image/'):
        result, score = image_model.verify(file)
    elif file_type.startswith('video/'):
        result, score = video_model.verify(file)
    elif file_type == 'application/pdf':
        text = extract_text_from_pdf(file)
        result, score = sbert_model.match_semantic(text)
        
    return jsonify({"status": result, "similarity_score": score})
```
By utilizing this microservice design, the computationally expensive SBERT Transformers and Audio Spectrogram arrays can scale horizontally across parallel GPU instances if the server load increases, completely isolated from the fast Node.js Express user-facing web server.
