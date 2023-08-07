// Deploy forbidden contract
// npx hardhat run scripts/factories/flexi/deployForbiddenTlds.js --network taikoGrimsvotn

async function main() {
  const contractNameForb = "PunkForbiddenTlds";

  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const contractForb = await ethers.getContractFactory(contractNameForb);
  const instanceForb = await contractForb.deploy();
  
  console.log("ForbiddenTlds contract address:", instanceForb.address);

  console.log("Wait a minute and then run this command to verify contracts on block explorer:");
  console.log("npx hardhat verify --network " + network.name + " " + instanceForb.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });