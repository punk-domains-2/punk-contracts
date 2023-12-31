// Deploy metadata contract
// npx hardhat run scripts/partners/basepunk/deployMetadata.js --network base
// metadata contract will be automatically added to TLD contract (if not, do it manually)

const tldAddress = "0xc2C543D39426bfd1dB66bBde2Dd9E4a5c7212876";

async function main() {
  const contractName = "BasepunkTldMetadata";

  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // deploy contract
  const contract = await ethers.getContractFactory(contractName);
  const instance = await contract.deploy();
  await instance.deployed();

  console.log("Metadata contract address:", instance.address);

  console.log("Adding metadata contract to TLD contract");

  const tldContract = await ethers.getContractFactory("FlexiPunkTLD");
  const tldInstance = await tldContract.attach(tldAddress);

  await tldInstance.changeMetadataAddress(instance.address);

  console.log("Done!");

  console.log("Wait a minute and then run this command to verify contracts on Etherscan:");
  console.log("npx hardhat verify --network " + network.name + " " + instance.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });