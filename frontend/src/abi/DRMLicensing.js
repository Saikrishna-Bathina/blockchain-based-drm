export const DRMLicensingABI = [
    "function purchaseLicense(uint256 tokenId, string memory licenseType) public payable",
    "function checkLicense(address user, uint256 tokenId) public view returns (bool)",
    "function setLicenseTerms(uint256 tokenId, uint256 _l1Price, uint256 _l2Price, uint256 _l3Price, uint256 _l4Price) public",
    "event LicensePurchased(uint256 indexed tokenId, address indexed buyer, string licenseType, uint256 price)"
];
