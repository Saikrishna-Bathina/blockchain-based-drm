# Chapter 5: System Implementation

## 5.1 Backend and JWT Implementation
The backend logic is constructed using Express.js. For streaming authenticated assets securely, standard static file-serving approaches (like NGINX direct linking) have been blocked. Instead, our Express server verifies blockchain ownership dynamically:

1. **Stream Tokens:** A temporary JSON Web Token (JWT) is minted uniquely upon cryptographic signature validation by Ethereum node providers (Ethers.js). The token acts as the short-lived session authorization, strictly tying the user's Metamask wallet signature to the requested asset ID.
2. **On-The-Fly Decryption:** Instead of sending the full decrypted file to the user's browser, the system sequentially reads AES-encrypted storage streams from IPFS. It pipes AES-decrypted byte buffers directly to the `HTTP 206 Partial Content` video/audio player stream, heavily minimizing the risk of the user downloading the native HD asset locally.

*[Image Suggestion: A sequence diagram showing the Handshake -> Metamask Signature -> JWT Generation -> Encrypted Stream Pipeline]*

---

## 5.2 Frontend Architecture
The progressive web application is developed using the React/Vite framework. It relies heavily on a dynamic DRM player component and Web3 integrations utilizing MetaMask. 
* **User Dashboard:** An intuitive upload dashboard allows the creator to simultaneously inject Data Blobs into IPFS storage buffers while firing API requests to the Python Originality Engine inference node prior to initiating wallet authorization requests.
* **Smart Contract Integration:** Uses `ethers.js` to communicate via JSON-RPC to the blockchain networks to fetch token ownership and prompt transactions directly via browser popups.

*[Image Suggestion: A screenshot of the React Application Dashboard showing the user's connected wallet and 'My Assets' list]*

---

## 5.3 Code Snippet: SBERT Cosine Similarity
The core of the Text Originality Engine logic utilizing the lightweight embedding model:

```python
def compute_embedding(text):
    # Using 'all-MiniLM-L6-v2' lightweight transformer
    return self.model.encode(text)

def match_semantic(target_emb, stored_emb):
    # Retrieve similarity matrix and extract the direct value
    similarity = cosine_similarity([target_emb], [stored_emb])[0][0]
    
    if similarity > 0.95:
        return "DUPLICATE (Exact)"
    elif similarity > 0.85:
        return "SEMANTIC DUPLICATE (Paraphrased)"
    return "ORIGINAL"
```

---

## 5.4 Code Snippet: Smart Contract License Minting
A standard Solidity function bridging the NFT with consumer payment validation:

```solidity
function purchaseLicense(uint256 assetId) external payable {
    require(assets[assetId].exists, "Asset does not exist");
    require(msg.value >= assets[assetId].price, "Insufficient funds");
    
    // Transfer funds to creator algorithm instantly
    payable(assets[assetId].creator).transfer(msg.value);
    
    // Grant the License on-chain
    userLicenses[msg.sender][assetId] = true;
    emit LicensePurchased(msg.sender, assetId);
}
```
