// npx hardhat run scripts/partners/sgb-flr/deployMinterFtso.js --network songbird
// automatically adds minter address to TLD contract (but check manually)

const contractNameFactory = "MinterFtso";

const distributorAddress = "0x97203DE4aB5f1064618C727D80f16840DB8F4d59";
const tldAddress = "0xBDACF94dDCAB51c39c2dD50BffEe60Bb8021949a";
const nativeCoinTicker = "SGB";

const paymentTokenDecimals = 18;

// IMPORTANT: PRICES IN US DOLLARS!!!
const price1char = ethers.utils.parseUnits("1337", paymentTokenDecimals);
const price2char = ethers.utils.parseUnits("420", paymentTokenDecimals);
const price3char = ethers.utils.parseUnits("69", paymentTokenDecimals);
const price4char = ethers.utils.parseUnits("7", paymentTokenDecimals);
const price5char = ethers.utils.parseUnits("1", paymentTokenDecimals);

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // deploy contract
  const contract = await ethers.getContractFactory(contractNameFactory);
  const instance = await contract.deploy(
    distributorAddress, tldAddress, nativeCoinTicker,
    price1char, price2char, price3char, price4char, price5char
  );

  await instance.deployed();
  
  console.log("Minter address:", instance.address);

  /* */
  console.log("Adding minter address to TLD contract");

  const tldContract = await ethers.getContractFactory("FlexiPunkTLD");
  const tldInstance = await tldContract.attach(tldAddress);

  await tldInstance.changeMinter(instance.address);
  

  console.log("Wait a minute and then run this command to verify contract on the block explorer:");
  console.log("npx hardhat verify --network " + network.name + " " + instance.address + " " + distributorAddress + " " + tldAddress + ' "' + nativeCoinTicker + '" "' + price1char + '" "' + price2char + '" "' + price3char + '" "' + price4char + '" "' + price5char + '"');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });