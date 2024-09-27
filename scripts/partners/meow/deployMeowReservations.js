// Deploy FlexiPunkMetadata contract
// npx hardhat run scripts/partners/meow/deployMeowReservations.js --network superpositionTestnet

const writerAddress = "0xb29050965A5AC70ab487aa47546cdCBc97dAE45D";

async function main() {
  const contractName = "MeowReservations";

  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // deploy contract
  const contract = await ethers.getContractFactory(contractName);
  const instance = await contract.deploy(writerAddress);
  
  console.log("Contract address:", instance.address);

  console.log("Wait a minute and then run this command to verify contracts on block explorer:");
  console.log("npx hardhat verify --network " + network.name + " " + instance.address + " " + writerAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });