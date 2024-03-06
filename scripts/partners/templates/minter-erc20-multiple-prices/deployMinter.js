// npx hardhat run scripts/partners/templates/minter-erc20-multiple-prices/deployMinter.js --network scroll
// it automatically adds minter address to the TLD contract as minter

const contractNameFactory = "MinterErc20MultiplePrices";

const devAddress = "0xb29050965A5AC70ab487aa47546cdCBc97dAE45D";
const teamAddress = "0x1e7487b34CDeF80536F70e085AC875d7b7cC6812";
const tldAddress = "0xc2C543D39426bfd1dB66bBde2Dd9E4a5c7212876";
const tokenAddress = "0xb65aD8d81d1E4Cb2975352338805AF6e39BA8Be8";

const paymentTokenDecimals = 18;

const price1char = ethers.utils.parseUnits("1000000000", paymentTokenDecimals);
const price2char = ethers.utils.parseUnits("100000000", paymentTokenDecimals);
const price3char = ethers.utils.parseUnits("30000000", paymentTokenDecimals);
const price4char = ethers.utils.parseUnits("800000", paymentTokenDecimals);
const price5char = ethers.utils.parseUnits("200000", paymentTokenDecimals);
const price6char = ethers.utils.parseUnits("50000", paymentTokenDecimals);

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // deploy contract
  const contract = await ethers.getContractFactory(contractNameFactory);
  const instance = await contract.deploy(
    tldAddress, devAddress, teamAddress, tokenAddress, 
    price1char, price2char, price3char, price4char, price5char, price6char
  );

  await instance.deployed();

  console.log("Contract address:", instance.address);

  // add minter address to the TLD contract
  console.log("Adding minter address to the TLD contract...");
  const contractTld = await ethers.getContractFactory("FlexiPunkTLD");
  const instanceTld = await contractTld.attach(tldAddress);

  const tx1 = await instanceTld.changeMinter(instance.address);
  await tx1.wait();

  console.log("Done!");

  console.log("Wait a minute and then run this command to verify contract on the block explorer:");
  console.log("npx hardhat verify --network " + network.name + " " + instance.address + " " + tldAddress + " " + devAddress + " " + teamAddress + " " + tokenAddress + ' "' + price1char + '" "' + price2char + '" "' + price3char + '" "' + price4char + '" "' + price5char + '" "' + price6char + '"');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });