// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./DRMRegistry.sol";

contract DRMLicensing is Ownable {
    DRMRegistry public drmRegistry;

    struct LicenseTerms {
        uint256 license1Price;
        uint256 license2Price;
        uint256 license3Price;
        uint256 license4Price;
    }

    struct License {
        uint256 tokenId;
        address licensee;
        string licenseType; // "license1", "license2", "license3", "license4"
        uint256 expiry; // 0 for lifetime
        uint256 timestamp;
    }

    mapping(uint256 => LicenseTerms) public assetLicenseTerms;
    mapping(address => mapping(uint256 => License)) public userLicenses;

    event LicensePurchased(uint256 indexed tokenId, address indexed buyer, string licenseType, uint256 price);
    event LicenseTermsSet(uint256 indexed tokenId, uint256 l1Price, uint256 l2Price, uint256 l3Price, uint256 l4Price);

    constructor(address _drmRegistryAddress) Ownable(msg.sender) {
        drmRegistry = DRMRegistry(_drmRegistryAddress);
    }

    function setLicenseTerms(
        uint256 tokenId, 
        uint256 _l1Price, 
        uint256 _l2Price, 
        uint256 _l3Price,
        uint256 _l4Price
    ) public {
        DRMRegistry.Asset memory asset = drmRegistry.getAsset(tokenId);
        require(asset.creator == msg.sender, "Only creator can set terms");
        
        assetLicenseTerms[tokenId] = LicenseTerms({
            license1Price: _l1Price,
            license2Price: _l2Price,
            license3Price: _l3Price,
            license4Price: _l4Price
        });

        emit LicenseTermsSet(tokenId, _l1Price, _l2Price, _l3Price, _l4Price);
    }

    function purchaseLicense(uint256 tokenId, string memory licenseType) public payable {
        LicenseTerms memory terms = assetLicenseTerms[tokenId];
        uint256 price = 0;
        uint256 expiry = 0;

        if (keccak256(bytes(licenseType)) == keccak256(bytes("license1"))) {
            price = terms.license1Price;
        } else if (keccak256(bytes(licenseType)) == keccak256(bytes("license2"))) {
            price = terms.license2Price;
        } else if (keccak256(bytes(licenseType)) == keccak256(bytes("license3"))) {
            price = terms.license3Price;
        } else if (keccak256(bytes(licenseType)) == keccak256(bytes("license4"))) {
            price = terms.license4Price;
        } else {
            revert("Invalid license type");
        }

        require(msg.value >= price, "Insufficient funds");

        // Transfer funds to creator
        DRMRegistry.Asset memory asset = drmRegistry.getAsset(tokenId);
        payable(asset.creator).transfer(msg.value);

        // Record license
        userLicenses[msg.sender][tokenId] = License({
            tokenId: tokenId,
            licensee: msg.sender,
            licenseType: licenseType,
            expiry: expiry,
            timestamp: block.timestamp
        });

        emit LicensePurchased(tokenId, msg.sender, licenseType, msg.value);
    }

    function checkLicense(address user, uint256 tokenId) public view returns (bool) {
        License memory license = userLicenses[user][tokenId];
        if (license.timestamp == 0) return false; // No license
        if (license.expiry != 0 && block.timestamp > license.expiry) return false; // Expired
        return true;
    }
}
