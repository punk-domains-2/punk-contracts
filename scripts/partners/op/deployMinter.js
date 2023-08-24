// npx hardhat run scripts/partners/op/deployMinter.js --network optimisticEthereum
// it automatically adds minter address to the TLD contract as minter

const contractNameFactory = "OpMinter";

const tldAddress = "0xC16aCAdf99E4540E6f4E6Da816fd6D2A2C6E1d4F";
const recipient = "add-recipient";

const paymentTokenDecimals = 18;

const price1char = ethers.utils.parseUnits("4.20", paymentTokenDecimals);
const price2char = ethers.utils.parseUnits("0.69", paymentTokenDecimals);
const price3char = ethers.utils.parseUnits("0.10", paymentTokenDecimals);
const price4char = ethers.utils.parseUnits("0.02", paymentTokenDecimals);
const price5char = ethers.utils.parseUnits("0.01", paymentTokenDecimals);

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // deploy contract
  const contract = await ethers.getContractFactory(contractNameFactory);
  const instance = await contract.deploy(
    tldAddress, recipient, 
    price1char, price2char, price3char, price4char, price5char
  );

  await instance.deployed();

  console.log("Contract address:", instance.address);

  console.log("Wait a minute and then run this command to verify contract on the block explorer:");
  console.log("npx hardhat verify --network " + network.name + " " + instance.address + " " + tldAddress + " " + recipient + ' "' +  price1char + '" "' + price2char + '" "' + price3char + '" "' + price4char + '" "' + price5char + '"');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });