// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract DRMRegistry is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    struct Asset {
        uint256 id;
        string contentHash; // CID or Hash of the encrypted content
        string contentMetadataURI; // IPFS URI for metadata
        address creator;
        uint256 timestamp;
    }

    mapping(uint256 => Asset) public assets;
    mapping(string => bool) private _contentHashExists;

    event AssetRegistered(uint256 indexed tokenId, address indexed creator, string contentHash);

    constructor() ERC721("DRMAsset", "DRM") Ownable(msg.sender) {}

    function registerAsset(address to, string memory contentHash, string memory metadataURI) public returns (uint256) {
        require(!_contentHashExists[contentHash], "Content already registered");

        uint256 tokenId = _nextTokenId++;
        _mint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);

        assets[tokenId] = Asset({
            id: tokenId,
            contentHash: contentHash,
            contentMetadataURI: metadataURI,
            creator: to,
            timestamp: block.timestamp
        });

        _contentHashExists[contentHash] = true;

        emit AssetRegistered(tokenId, to, contentHash);

        return tokenId;
    }

    function getAsset(uint256 tokenId) public view returns (Asset memory) {
        return assets[tokenId];
    }
    
    function isContentRegistered(string memory contentHash) public view returns (bool) {
        return _contentHashExists[contentHash];
    }
}
