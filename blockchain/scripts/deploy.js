const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const DRMRegistry = await hre.ethers.getContractFactory("DRMRegistry");
    const drmRegistry = await DRMRegistry.deploy();
    await drmRegistry.waitForDeployment();
    const drmRegistryAddress = await drmRegistry.getAddress();
    console.log("DRMRegistry deployed to:", drmRegistryAddress);

    const DRMLicensing = await hre.ethers.getContractFactory("DRMLicensing");
    const drmLicensing = await DRMLicensing.deploy(drmRegistryAddress);
    await drmLicensing.waitForDeployment();
    console.log("DRMLicensing deployed to:", await drmLicensing.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
