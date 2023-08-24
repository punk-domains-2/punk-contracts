// npx hardhat run scripts/partners/templates/ambassadors/deployMinter.js --network songbird
// it automatically adds minter address to the TLD contract as minter

const contractNameFactory = "MinterWithAmbassadors";

const ambassador1 = "0x17a2063e1f5C6034F4c94cfb0F4970483647a2E5"; // ambassador 1 address
const ambassador2 = "0x772bA1Faf2a2b49B452A5b287B2165cba89EfAE2"; // ambassador 2 address
const stakingAddress = "0xCA9749778327CD67700d3a777731a712330beB9A"; // staking contract address

const tldAddress = "0xBDACF94dDCAB51c39c2dD50BffEe60Bb8021949a";

const paymentTokenDecimals = 18;

const price1char = ethers.utils.parseUnits("42069", paymentTokenDecimals);
const price2char = ethers.utils.parseUnits("6969", paymentTokenDecimals);
const price3char = ethers.utils.parseUnits("1337", paymentTokenDecimals);
const price4char = ethers.utils.parseUnits("399", paymentTokenDecimals);
const price5char = ethers.utils.parseUnits("99", paymentTokenDecimals);

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // deploy contract
  const contract = await ethers.getContractFactory(contractNameFactory);
  const instance = await contract.deploy(
    ambassador1, ambassador2, tldAddress, stakingAddress,
    price1char, price2char, price3char, price4char, price5char
  );

  await instance.deployed();

  console.log("Contract address:", instance.address);

  // add minter address to the TLD contract
  console.log("Adding minter address to the TLD contract...");
  const contractTld = await ethers.getContractFactory("FlexiPunkTLD");
  const instanceTld = await contractTld.attach(tldAddress);

  await instanceTld.changeMinter(instance.address);

  console.log("Done!");

  console.log("Wait a minute and then run this command to verify contract on the block explorer:");
  console.log("npx hardhat verify --network " + network.name + " " + instance.address + " " + ambassador1 + " " + ambassador2 + " " + tldAddress + " " + stakingAddress + ' "' + price1char + '" "' + price2char + '" "' + price3char + '" "' + price4char + '" "' + price5char + '"');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });