const hre = require("hardhat");

async function main() {
    console.log("--- Blockchain Diagnostic Report ---");

    // 1. Network Info
    const network = await hre.ethers.provider.getNetwork();
    console.log(`Network: ${network.name}`);
    console.log(`Chain ID: ${network.chainId}`);

    // 2. Account Balances
    const accounts = [
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // Default Hardhat Account 1 (Deployer)
        "0x90f79bf6eb2c4f870365e785982e1f101e93b906", // Account from Profile Page
        "0xbda5747bfd65f08dab54cb465ab97d405b1b1a7e"  // Account from Purchase Error
    ];

    console.log("\n--- Account Balances ---");
    for (const addr of accounts) {
        const balance = await hre.ethers.provider.getBalance(addr);
        console.log(`${addr}: ${hre.ethers.formatEther(balance)} ETH`);
    }

    // 3. Contract Vertification
    const contracts = [
        { name: "DRMRegistry", address: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0" },
        { name: "DRMLicensing", address: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9" }
    ];

    console.log("\n--- Contract Verification ---");
    for (const contract of contracts) {
        const code = await hre.ethers.provider.getCode(contract.address);
        console.log(`${contract.name} (${contract.address}): ${code !== "0x" ? "DEPLOYED (" + code.length + " bytes)" : "NOT DEPLOYED"}`);
    }

    console.log("\n--- End of Report ---");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
