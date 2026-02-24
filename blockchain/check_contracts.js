const { ethers } = require("hardhat");

async function main() {
    const registryAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
    const licensingAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

    console.log("Checking contract code at addresses...");

    const code1 = await ethers.provider.getCode(registryAddress);
    const code2 = await ethers.provider.getCode(licensingAddress);

    console.log(`Registry (${registryAddress}) code length: ${code1.length}`);
    console.log(`Licensing (${licensingAddress}) code length: ${code2.length}`);

    if (code1 === "0x" || code2 === "0x") {
        console.error("ERROR: Contracts are NOT deployed at these addresses!");
    } else {
        console.log("Contracts appear to be deployed.");

        // Try to get asset 0
        try {
            const Registry = await ethers.getContractFactory("DRMRegistry");
            const registry = Registry.attach(registryAddress);

            const asset = await registry.getAsset(0);
            console.log("Asset 0:", asset);
        } catch (e) {
            console.error("Failed to fetch Asset 0 (might not exist):", e.message);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
