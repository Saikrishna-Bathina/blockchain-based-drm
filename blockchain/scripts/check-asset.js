const hre = require("hardhat");

const DRM_REGISTRY_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Same address as in frontend

async function main() {
    const contract = await hre.ethers.getContractAt("DRMRegistry", DRM_REGISTRY_ADDRESS);

    // Check if contract exists at address
    const code = await hre.ethers.provider.getCode(DRM_REGISTRY_ADDRESS);
    if (code === "0x") {
        console.error("❌ CRITICAL: No contract code found at " + DRM_REGISTRY_ADDRESS);
        console.error("   The node was likely restarted. You must Re-Deploy contracts.");
        return;
    }
    console.log("✅ Contract detected at address.");

    // Check Token ID 0, 1, 2, 3
    const tokenIds = [0, 1, 2, 3];

    console.log(`Reading from Contract at: ${DRM_REGISTRY_ADDRESS}\n`);

    for (let id of tokenIds) {
        try {
            const asset = await contract.getAsset(id);
            // Ethers v6 uses BigInt (0n)
            if (asset.timestamp > 0n) {
                console.log(`✅ Asset Found (Token ID: ${id})`);
                console.log(`   - Creator: ${asset.creator}`);
                console.log(`   - Content Hash (CID): ${asset.contentHash}`);
                console.log(`   - Metadata URI: ${asset.contentMetadataURI}`);
                console.log(`   - Timestamp: ${new Date(Number(asset.timestamp) * 1000).toLocaleString()}\n`);
            } else {
                console.log(`⚠️ Token ID ${id}: Exists but empty? (Timestamp 0)`);
            }
        } catch (error) {
            // If it reverts, it usually means it doesn't exist
            // console.log(`ℹ️  Token ID ${id} not found.`);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
