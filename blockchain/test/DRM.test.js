const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DRM System", function () {
    let DRMRegistry, drmRegistry;
    let DRMLicensing, drmLicensing;
    let owner, creator, buyer, otherAccount;

    beforeEach(async function () {
        [owner, creator, buyer, otherAccount] = await ethers.getSigners();

        // Deploy Registry
        DRMRegistry = await ethers.getContractFactory("DRMRegistry");
        drmRegistry = await DRMRegistry.deploy();

        // Deploy Licensing
        DRMLicensing = await ethers.getContractFactory("DRMLicensing");
        drmLicensing = await DRMLicensing.deploy(await drmRegistry.getAddress());
    });

    describe("DRMRegistry", function () {
        it("Should register an asset successfully", async function () {
            const contentHash = "QmTestHash123";
            const metadataURI = "ipfs://QmTestMetadata";

            const tx = await drmRegistry.connect(creator).registerAsset(creator.address, contentHash, metadataURI);
            await tx.wait();

            expect(await drmRegistry.balanceOf(creator.address)).to.equal(1);
        });
    });

    describe("DRMLicensing", function () {
        it("Should allow purchasing a license", async function () {
            const contentHash = "QmTestHash";
            const meta = "ipfs://test";
            const mintTx = await drmRegistry.connect(creator).registerAsset(creator.address, contentHash, meta);
            await mintTx.wait();

            // Retrieve TokenID via Event
            const filter = drmRegistry.filters.Transfer(null, creator.address);
            const events = await drmRegistry.queryFilter(filter);
            const event = events[events.length - 1];
            const actualTokenId = event.args[2];

            const watchPrice = ethers.parseEther("0.1");
            const rentPrice = ethers.parseEther("0.05");
            const commPrice = ethers.parseEther("1.0");

            await drmLicensing.connect(creator).setLicenseTerms(actualTokenId, watchPrice, rentPrice, commPrice);

            await drmLicensing.connect(buyer).purchaseLicense(actualTokenId, "watch", { value: watchPrice });

            expect(await drmLicensing.checkLicense(buyer.address, actualTokenId)).to.equal(true);
        });
    });
});
