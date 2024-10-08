// Deploy FlexiPunkMetadata contract
// npx hardhat run scripts/partners/meow/deployMetadata.js --network superposition

const tldAddress = "0x4087fb91A1fBdef05761C02714335D232a2Bf3a1";

async function main() {
  const contractName = "MeowMetadata";

  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // deploy contract
  const contract = await ethers.getContractFactory(contractName);
  const instance = await contract.deploy();
  
  console.log("Metadata contract address:", instance.address);

  // create TLD contract instance (from FlexiPunkTLD)
  const tldContract = await ethers.getContractAt("FlexiPunkTLD", tldAddress);

  // set metadata contract address in the TLD contract via changeMetadataAddress()
  const tx = await tldContract.changeMetadataAddress(instance.address);
  await tx.wait();

  console.log("Metadata contract address set in TLD contract");

  console.log("Wait a minute and then run this command to verify contracts on Etherscan:");
  console.log("npx hardhat verify --network " + network.name + " " + instance.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });