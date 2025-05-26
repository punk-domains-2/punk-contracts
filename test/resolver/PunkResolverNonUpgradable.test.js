// test for the PunkResolverNonUpgradable.sol smart contract
// npx hardhat test test/resolver/PunkResolverNonUpgradable.test.js

const { expect } = require("chai");

function calculateGasCosts(testName, receipt) {
  console.log(testName + " gasUsed: " + receipt.gasUsed);

  // coin prices in USD
  const eth = 1000;
  
  const gasCostEthereum = ethers.utils.formatUnits(String(Number(ethers.utils.parseUnits("20", "gwei")) * Number(receipt.gasUsed)), "ether");
  const gasCostArbitrum = ethers.utils.formatUnits(String(Number(ethers.utils.parseUnits("1.25", "gwei")) * Number(receipt.gasUsed)), "ether");

  console.log(testName + " gas cost (Ethereum): $" + String(Number(gasCostEthereum)*eth));
  console.log(testName + " gas cost (Arbitrum): $" + String(Number(gasCostArbitrum)*eth));
}

describe("PunkResolverNonUpgradable", function () {
  let tldContract1;
  let tldName1 = ".tld1";
  let tldSymbol1 = ".TLD1";

  let tldContract2;
  let tldName2 = ".tld2";
  let tldSymbol2 = ".TLD2";

  let tldContract3;
  let tldName3 = ".tld3";
  let tldSymbol3 = ".TLD3";

  let tldPrice = ethers.utils.parseUnits("0.0001", "ether");
  let tldRoyalty = 0;

  let resolverContract;

  let factoryContract1;
  let factoryContract2;
  let factoryContract3;

  let user1;
  let user2;
  let owner;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const PunkForbiddenTlds = await ethers.getContractFactory("PunkForbiddenTlds");
    const forbTldsContract = await PunkForbiddenTlds.deploy();

    const FlexiPunkMetadata = await ethers.getContractFactory("FlexiPunkMetadata");
    const flexiMetadataContract = await FlexiPunkMetadata.deploy();

    const PunkTLDFactory = await ethers.getContractFactory("FlexiPunkTLDFactory");
    const priceToCreateTld = ethers.utils.parseUnits("1", "ether");

    factoryContract1 = await PunkTLDFactory.deploy(priceToCreateTld, forbTldsContract.address, flexiMetadataContract.address);
    factoryContract2 = await PunkTLDFactory.deploy(priceToCreateTld, forbTldsContract.address, flexiMetadataContract.address);
    factoryContract3 = await PunkTLDFactory.deploy(priceToCreateTld, forbTldsContract.address, flexiMetadataContract.address);

    await forbTldsContract.addFactoryAddress(factoryContract1.address);
    await forbTldsContract.addFactoryAddress(factoryContract2.address);
    await forbTldsContract.addFactoryAddress(factoryContract3.address);

    resolverContract = await ethers.getContractFactory("PunkResolverNonUpgradable");
    resolverContract = await resolverContract.deploy();

    await resolverContract.addFactoryAddress(factoryContract1.address);
    await resolverContract.addFactoryAddress(factoryContract2.address);
    await resolverContract.addFactoryAddress(factoryContract3.address);
    
    const tx = await factoryContract1.ownerCreateTld(
      tldName1, 
      tldSymbol1, 
      owner.address, 
      tldPrice, 
      true
    );
    const receipt = await tx.wait();
    calculateGasCosts("ownerCreateTld", receipt);

    // Get the TLD contract address from the event logs
    const event = receipt.events.find(e => e.event === 'TldCreated');
    const tldContract1Address = event.args.tldAddress;
    console.log("tldContract1: ", tldContract1Address);

    tldContract1 = await ethers.getContractAt("FlexiPunkTLD", tldContract1Address);
  });

  it("should confirm TLD name & symbol directly via the TLD contract", async function () {
    const _tldName = await tldContract1.name();
    expect(_tldName).to.equal(tldName1);
    const _tldSymbol = await tldContract1.symbol();
    expect(_tldSymbol).to.equal(tldSymbol1);
  });

  it("should get domain holder", async function () {
    // Register a domain
    const domainName = "test";
    const price = ethers.utils.parseUnits("0.1", "ether");
    await tldContract1.mint(
      domainName, // domain name
      user1.address, // domain holder
      user1.address, // referrer
      { value: price } // price
    );
    
    // Check domain holder
    const holder = await resolverContract.getDomainHolder(domainName, tldName1);
    expect(holder).to.equal(user1.address);
  });

  it("should get domain token URI", async function () {
    // Register a domain
    const domainName = "test";
    const price = ethers.utils.parseUnits("0.1", "ether");
    await tldContract1.mint(
      domainName, // domain name
      user1.address, // domain holder
      user1.address, // referrer
      { value: price } // price
    );
    
    // Get token ID
    const domain = await tldContract1.domains(domainName);
    const tokenId = domain[1];
    console.log("tokenId: ", tokenId);
    
    // Check token URI
    const tokenUri = await resolverContract.getDomainTokenUri(domainName, tldName1);
    console.log("tokenUri: ", tokenUri);
    expect(tokenUri).to.not.equal("");

    // Parse the tokenUri

    // Remove the data:application/json;base64, prefix
    const base64Data = tokenUri.replace('data:application/json;base64,', '');
    // Decode base64 to string
    const jsonString = Buffer.from(base64Data, 'base64').toString();
    const tokenUriJson = JSON.parse(jsonString);
    console.log("tokenUriJson: ", tokenUriJson);
    
    // Verify the decoded data
    expect(tokenUriJson.name).to.equal(domainName + tldName1);
    expect(tokenUriJson.description).to.equal("");
    expect(tokenUriJson.image).to.include("data:image/svg+xml;base64,");
  });

  it("should get TLD address", async function () {
    const tldAddress = await resolverContract.getTldAddress(tldName1);
    expect(tldAddress).to.equal(tldContract1.address);
  });

  it("should get TLD factory address", async function () {
    const factoryAddress = await resolverContract.getTldFactoryAddress(tldName1);
    expect(factoryAddress).to.equal(factoryContract1.address);
  });

  it("should get TLDs list", async function () {
    const tlds = await resolverContract.getTlds();
    expect(tlds).to.include(tldName1);
    expect(tlds).to.include(tldContract1.address.toLowerCase());
  });

  it("should set and get custom default domain", async function () {
    // Register a domain
    const domainName = "test";
    const price = ethers.utils.parseUnits("0.1", "ether");
    await tldContract1.mint(
      domainName, // domain name
      user1.address, // domain holder
      user1.address, // referrer
      { value: price } // price
    );

    // register another domain
    const domainName2 = "test2";
    await tldContract1.mint(
      domainName2, // domain name
      user1.address, // domain holder
      user1.address, // referrer
      { value: price } // price
    );
    
    // Set the first domain as default domain
    await tldContract1.connect(user1).editDefaultDomain(domainName);

    // check the first domain is the default domain
    const defaultDomain1 = await resolverContract.getDefaultDomain(user1.address, tldName1);
    expect(defaultDomain1).to.equal(domainName);
    
    // Set the second domain as custom default domain in resolver
    await resolverContract.connect(user1).setCustomDefaultDomain(domainName2, tldName1);
    
    // check the second domain is the first default domain (because it is set in the resolver contract)
    const defaultDomain2 = await resolverContract.getFirstDefaultDomain(user1.address);
    expect(defaultDomain2).to.equal(domainName2 + tldName1);

    // check the first domain is the default domain (because it is set in the TLD contract)
    const defaultDomain3 = await resolverContract.getDefaultDomain(user1.address, tldName1);
    expect(defaultDomain3).to.equal(domainName);
  });

  it("should get default domain for specific TLD", async function () {
    // Register a domain
    const domainName = "test";
    const price = ethers.utils.parseUnits("0.1", "ether");
    await tldContract1.mint(
      domainName, // domain name
      user1.address, // domain holder
      user1.address, // referrer
      { value: price } // price
    );
    
    // Set as default domain (not needed because it is automatically set in the TLD contract when the first domain is minted)
    // await tldContract1.connect(user1).editDefaultDomain(domainName);
    
    // Get default domain for TLD
    const defaultDomain = await resolverContract.getDefaultDomain(user1.address, tldName1);
    expect(defaultDomain).to.equal(domainName);
  });

  it("should get all default domains", async function () {
    // Register domains in multiple TLDs
    const domainName1 = "test1";
    const domainName2 = "test2";
    const price = ethers.utils.parseUnits("0.1", "ether");
    
    // Create second TLD
    const tx = await factoryContract2.ownerCreateTld(
      tldName2, 
      tldSymbol2, 
      owner.address, 
      tldPrice, 
      true
    );
    const receipt = await tx.wait();
    const event = receipt.events.find(e => e.event === 'TldCreated');
    tldContract2 = await ethers.getContractAt("FlexiPunkTLD", event.args.tldAddress);
    
    // Mint domains
    await tldContract1.mint(domainName1, user1.address, user1.address, { value: price });
    await tldContract2.mint(domainName2, user1.address, user1.address, { value: price });
    
    // Get all default domains
    const defaultDomains = await resolverContract.getDefaultDomains(user1.address);
    console.log("defaultDomains: ", defaultDomains);
    expect(defaultDomains).to.include(domainName1 + tldName1);
    expect(defaultDomains).to.include(domainName2 + tldName2);
  });

  it("should handle deprecated TLDs", async function () {
    // Register a domain
    const domainName = "test";
    const price = ethers.utils.parseUnits("0.1", "ether");
    await tldContract1.mint(
      domainName, // domain name
      user1.address, // domain holder
      user1.address, // referrer
      { value: price } // price
    );
    
    // Set as default domain
    await tldContract1.connect(user1).editDefaultDomain(domainName);

    // check the domain is the default domain
    const defaultDomain1 = await resolverContract.getDefaultDomain(user1.address, tldName1);
    expect(defaultDomain1).to.equal(domainName);
    
    // Deprecate TLD
    await resolverContract.addDeprecatedTldAddress(tldContract1.address);
    
    // Check that deprecated TLD is not returned
    const tldAddress = await resolverContract.getTldAddress(tldName1);
    expect(tldAddress).to.equal(ethers.constants.AddressZero);
    
    const defaultDomain2 = await resolverContract.getDefaultDomain(user1.address, tldName1);
    expect(defaultDomain2).to.equal("");
  });
});