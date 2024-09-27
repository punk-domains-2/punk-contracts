// npx hardhat run scripts/factories/flexi/callMethods.js --network superpositionTestnet

const forbiddenAddress = "";
const factoryAddress = "0x1D882E64bb7f4D49e67018d81254236A2A6465a3";
const tldAddress = ""; // .🥁 TLD
const metadataAddress = "";

const domainPrice = ethers.utils.parseUnits("0", "ether");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Calling methods with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const forbiddenInterface = new ethers.utils.Interface([
    "function factoryAddresses(address) external view returns(bool)",
    "function addFactoryAddress(address _fAddr) external"
  ]);

  const factoryInterface = new ethers.utils.Interface([
    "function tldNamesAddresses(string memory) external view returns(address)",
    "function ownerCreateTld(string memory _name, string memory _symbol, address _tldOwner, uint256 _domainPrice, bool _buyingEnabled) external returns(address)"
  ]);

  const tldInterface = new ethers.utils.Interface([
    "function buyingEnabled() external view returns(bool)",
    "function changePrice(uint256 _price) external",
    "function changeRoyaltyFeeReceiver(address _newReceiver) external",
    "function domainIdsNames(uint256 _tokenId) external view returns(string memory)",
    "function getDomainHolder(string memory _domainName) external view returns(address)",
    "function mint(string memory,address,address) external payable returns(uint256)",
    "function price() external view returns(uint256)",
    "function royaltyFeeReceiver() external view returns(address)",
    "function toggleBuyingDomains() external",
    "function tokenURI(uint256) external view returns(string memory)"
  ]);

  const metadataInterface = new ethers.utils.Interface([
    "function getMetadata(string calldata _domainName, string calldata _tld, uint256 _tokenId) external view returns(string memory)"
  ]);

  const forbiddenContract = new ethers.Contract(forbiddenAddress, forbiddenInterface, deployer);
  const factoryContract = new ethers.Contract(factoryAddress, factoryInterface, deployer);
  const tldContract = new ethers.Contract(tldAddress, tldInterface, deployer);
  const metadataContract = new ethers.Contract(metadataAddress, metadataInterface, deployer);

  // GET ROYALTY FEE RECEIVER
  // const royaltyFeeReceiver = await tldContract.royaltyFeeReceiver();
  // console.log("royaltyFeeReceiver before change:", royaltyFeeReceiver);

  // CHANGE ROYALTY FEE RECEIVER
  //const newReceiver = "0xE08033d0bDBcEbE7e619c3aE165E7957Ab577961";
  //const txChangeRfr = await tldContract.changeRoyaltyFeeReceiver(newReceiver);
  //txChangeRfr.wait();

  // GET ROYALTY FEE RECEIVER AFTER CHANGE
  //const royaltyFeeReceiverAfter = await tldContract.royaltyFeeReceiver();
  // console.log("royaltyFeeReceiver after change:", royaltyFeeReceiverAfter);

  //const minterBefore = await contract.minter();
  //console.log("Minter before: " + minterBefore);

  // ADD FACTORY ADDRESS TO THE FORBIDDEN CONTRACT
  //await forbiddenContract.addFactoryAddress(factoryAddress);

  //const factoryAdded = await forbiddenContract.factoryAddresses(factoryAddress);
  //console.log("factoryAdded:");
  //console.log(factoryAdded);

  //await minterContract.togglePaused();
  //await minterContract.transferOwnership(newOwnerAddress);

  // CREATE A NEW TLD
  const tldName = ".test";
  const tldSymbol = ".TEST";
   
  /* 
  const tx = await factoryContract.ownerCreateTld(
    tldName, // TLD name
    tldSymbol, // symbol
    deployer.address, // TLD owner
    domainPrice, // domain price
    false // buying enabled
  );

  tx.wait();
  */
  
  /* */
  const tldAddr = await factoryContract.tldNamesAddresses(tldName);
  
  console.log("TLD address: ");
  console.log(tldAddr);
  

  // toggle buying domains
  //await tldContract.toggleBuyingDomains();

  // check buyingEnabled state
  //const buyingEnabled = await tldContract.buyingEnabled();
  //console.log("buyingEnabled:", buyingEnabled);

  // change price
  //await tldContract.changePrice(domainPrice);

  // check price
  //const price = await tldContract.price();
  //console.log("price:", Number(price));

  // Mint a domain name
  /* 
  await tldContract.mint(
    "tempe", // domain name (without TLD)
    deployer.address, // domain holder
    ethers.constants.AddressZero, // referrer
    {
      value: domainPrice // pay  for the domain
    }
  );
  */

  //const metadata = await tldContract.tokenURI(1);
  //console.log("metadata:");
  //console.log(metadata);

  // GET METADATA FROM THE METADATA CONTRACT
  /*
  const metadata = await metadataContract.getMetadata(
    "tempe", // domain name (without TLD)
    ".fantom", // TLD
    1 // token ID
  );

  console.log("metadata:");
  console.log(metadata);
  */

  // GET DOMAIN NAME FROM THE TLD CONTRACT
  /*
  const tokenId = 1; //954;
  const domainName = await tldContract.domainIdsNames(tokenId);
  console.log(domainName);
  console.log("domainName:", domainName);
  */

  // GET DOMAIN HOLDER FROM THE TLD CONTRACT
  //const domainHolder = await tldContract.getDomainHolder("cryptofella");
  //console.log("domainHolder:", domainHolder);

  console.log("Method calls completed");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });