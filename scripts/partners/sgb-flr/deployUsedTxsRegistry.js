// npx hardhat run scripts/partners/sgb-flr/deployUsedTxsRegistry.js --network flare
// automatically adds UsedTxsRegistry address to MinterFdcSongbird/MinterFdcFlare contract

const contractNameFactory = "UsedTxsRegistry";
const minterFdcAddress = "0xC61D9DEe0796C0e75d18E14E53EDBaEB1C27d745";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // deploy contract
  const contract = await ethers.getContractFactory(contractNameFactory);
  const instance = await contract.deploy(minterFdcAddress);

  await instance.deployed();
  
  console.log("Contract address:", instance.address);

  console.log("Adding UsedTxsRegistry address to MinterFdcSongbird contract");

  const minterFdcContract = await ethers.getContractFactory("MinterFdcSongbird");
  const minterFdcInstance = await minterFdcContract.attach(minterFdcAddress);

  await minterFdcInstance.setUsedTxsRegistryAddress(instance.address);
  

  console.log("Wait a minute and then run this command to verify contract on the block explorer:");
  console.log("npx hardhat verify --network " + network.name + " " + instance.address + " " + minterFdcAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });