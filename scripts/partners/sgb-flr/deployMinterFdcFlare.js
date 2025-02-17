// npx hardhat run scripts/partners/sgb-flr/deployMinterFdcFlare.js --network flare

const contractNameFactory = "MinterFdcFlare";

const minterFtsoAddress = "0x30E89295b9C73Ee9A74003FbcAAd67054434330F";
const gaeServerAddress = "0xf2a0e381007a0bd42c40516b00f1464628bd7b30";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // deploy contract
  const contract = await ethers.getContractFactory(contractNameFactory);
  const instance = await contract.deploy(minterFtsoAddress);

  await instance.deployed();
  
  console.log("Contract address:", instance.address);

  // add GAE server address to MinterFdcFlare contract as manager
  await instance.addManager(gaeServerAddress);

  // add MinterFdcFlare address to MinterFtso contract as manager
  const minterFtsoContract = await ethers.getContractFactory("MinterFtso");
  const minterFtsoInstance = await minterFtsoContract.attach(minterFtsoAddress);

  await minterFtsoInstance.addManager(instance.address);

  console.log("Wait a minute and then run this command to verify contract on the block explorer:");
  console.log("npx hardhat verify --network --contract contracts/partners/sgb-flr/MinterFdcFlare.sol:MinterFdcFlare " + network.name + " " + instance.address + " " + minterFtsoAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });