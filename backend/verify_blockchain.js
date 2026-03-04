const { ethers } = require('ethers');

async function verify() {
    const RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";
    const DRM_LICENSING_ADDRESS = "0x9f0ec638885dEb4973386554439AD81B9ec40fC8";
    const DRMLicensingABI = [
        "function checkLicense(address user, uint256 tokenId) public view returns (bool)"
    ];

    console.log("Connecting to RPC:", RPC_URL);
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    try {
        const network = await provider.getNetwork();
        console.log("Connected to Network:", network.name, "ChainId:", network.chainId);

        const contract = new ethers.Contract(DRM_LICENSING_ADDRESS, DRMLicensingABI, provider);

        // Test with a random address or a known one if possible
        const testWallet = "0x0000000000000000000000000000000000000000";
        const hasLicense = await contract.checkLicense(testWallet, 1);
        console.log(`License Check for ${testWallet} on asset 1:`, hasLicense);

        console.log("✅ Blockchain Connectivity Verified!");
    } catch (err) {
        console.error("❌ Verification Failed:", err.message);
    }
}

verify();
