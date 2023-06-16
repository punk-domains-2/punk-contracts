// Deploy factory contract only (ForbiddenTlds and FlexiPunkMetadata need to be already deployed)
// after deployment, factory address will be automatically added to the ForbiddenTlds whitelist and to the Resolver
// if not, do it manually
// npx hardhat run scripts/factories/standard/deployFactoryOnly.js --network optimisticGoerli

async function main() {
  const contractNameFactory = "PunkTLDFactory"; // standard factory
  const forbAddress = "<enter-forbidden-tlds-contract-address>";
  const resolverAddress = "<enter-resolver-address>"; // IMPORTANT: this script is made for non-upgradable Resolver. If you're using upgradable Resolver, you need to modify this script below (find: PunkResolverNonUpgradable line)

  let tldPrice = "0.01"; // price on testnets

  // mainnet prices
  if (network.config.chainId === 1 || network.config.chainId === 10 || network.config.chainId === 42161) {
    tldPrice = "40"; // ETH
  } else if (network.config.chainId === 137) {
    tldPrice = "80000"; // MATIC
  } else if (network.config.chainId === 100) {
    tldPrice = "75000"; // XDAI
  } else if (network.config.chainId === 56) {
    tldPrice = "250"; // BNB
  } else if (network.config.chainId === 19) {
    tldPrice = "2000000"; // SGB
  } else if (network.config.chainId === 250) {
    tldPrice = "270000"; // FTM
  }

  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // deploy contract1
  const contractFactory = await ethers.getContractFactory(contractNameFactory);

  const tldPriceWei = ethers.utils.parseUnits(tldPrice, "ether");
  const instanceFactory = await contractFactory.deploy(tldPriceWei, forbAddress);
  await instanceFactory.deployed();

  console.log("Factory contract deployed to:", instanceFactory.address);

  console.log("Adding factory contract to the ForbiddenTlds whitelist");

  // add factory address to the ForbiddenTlds whitelist
  const contractForbiddenTlds = await ethers.getContractFactory("PunkForbiddenTlds");
  const instanceForbiddenTlds = await contractForbiddenTlds.attach(forbAddress);

  await instanceForbiddenTlds.addFactoryAddress(instanceFactory.address);

  console.log("Done!");

  console.log("Adding factory contract to the Resolver");

  // add factory address to the Resolver
  const contractResolver = await ethers.getContractFactory("PunkResolverNonUpgradable");
  const instanceResolver = await contractResolver.attach(resolverAddress);

  await instanceResolver.addFactoryAddress(instanceFactory.address);

  console.log("Done!");

  console.log("Wait a minute and then run this command to verify contracts on Etherscan:");
  console.log("npx hardhat verify --network " + network.name + " " + instanceFactory.address + ' "' + tldPriceWei + '" ' + forbAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });