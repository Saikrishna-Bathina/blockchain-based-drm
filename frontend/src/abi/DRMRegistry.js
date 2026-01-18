export const DRMRegistryABI = [
    "function registerAsset(address to, string memory contentHash, string memory metadataURI) public returns (uint256)",
    "event AssetRegistered(uint256 indexed tokenId, address indexed creator, string contentHash)",
    "function getAsset(uint256 tokenId) public view returns (tuple(uint256 id, string contentHash, string contentMetadataURI, address creator, uint256 timestamp))"
];
