// Deploy FlexiPunkMetadata contract
// npx hardhat run scripts/partners/fantom/deployMetadata.js --network opera

const tldAddress = "0xBDACF94dDCAB51c39c2dD50BffEe60Bb8021949a";

async function main() {
  const contractName = "FantomMetadata";

  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // deploy contract
  const contract = await ethers.getContractFactory(contractName);
  const instance = await contract.deploy();
  
  console.log("Metadata contract address:", instance.address);

  // create TLD contract instance
  const tldContract = await ethers.getContractFactory("FlexiPunkTLD");
  const tldInstance = await tldContract.attach(tldAddress);

  // set metadata contract address
  await tldInstance.changeMetadataAddress(instance.address);

  console.log("Wait a minute and then run this command to verify contracts on Etherscan:");
  console.log("npx hardhat verify --network " + network.name + " " + instance.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });