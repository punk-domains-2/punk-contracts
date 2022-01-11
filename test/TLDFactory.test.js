const { expect } = require("chai");

describe("Web3PandaTLDFactory", function () {
  let contract;
  let signer;

  const tldPrice = ethers.utils.parseUnits("1", "ether");

  beforeEach(async function () {
    [signer] = await ethers.getSigners();

    const Web3PandaTLDFactory = await ethers.getContractFactory("Web3PandaTLDFactory");
    contract = await Web3PandaTLDFactory.deploy(tldPrice);
  });

  it("should confirm forbidden TLD names defined in the constructor", async function () {
    const forbiddenCom = await contract.forbidden(".com");
    expect(forbiddenCom).to.be.true;

    const forbiddenEth = await contract.forbidden(".eth");
    expect(forbiddenEth).to.be.true;
  });

  it("should create a new valid TLD", async function () {
    await contract.toggleBuyingTlds(); // enable buying TLDs

    const price = await contract.price();
    expect(price).to.equal(tldPrice);

    await expect(contract.createTld(
      ".web3", // TLD
      "WEB3", // symbol
      signer.address, // TLD owner
      ethers.utils.parseUnits("0.2", "ether"), // domain price
      false, // buying enabled
      {
        value: tldPrice // pay 1 ETH for the TLD
      }
    )).to.emit(contract, "TldCreated");

    // get TLD from array by index
    const firstTld = await contract.tlds(0);
    expect(firstTld).to.equal(".web3");

    // get TLD address by name
    const firstTldAddress = await contract.tldNamesAddresses(".web3");
    expect(firstTldAddress.startsWith("0x")).to.be.true;
  });

  it("should fail to create a new valid TLD if Buying TLDs disabled", async function () {
    const price = await contract.price();
    expect(price).to.equal(tldPrice);

    await expect(contract.createTld(
      ".web3", // TLD
      "WEB3", // symbol
      signer.address, // TLD owner
      ethers.utils.parseUnits("0.2", "ether"), // domain price
      false, // buying enabled
      {
        value: tldPrice // pay 1 ETH for the TLD
      }
    )).to.be.revertedWith('Buying TLDs disabled');
  });

  it("should fail to create a new valid TLD if payment is too low", async function () {
    await contract.toggleBuyingTlds(); // enable buying TLDs

    const price = await contract.price();
    expect(price).to.equal(tldPrice);

    await expect(contract.createTld(
      ".web3", // TLD
      "WEB3", // symbol
      signer.address, // TLD owner
      ethers.utils.parseUnits("0.2", "ether"), // domain price
      false, // buying enabled
      {
        value: ethers.utils.parseUnits("0.9", "ether") // pay 0.9 ETH for the TLD - TOO LOW!
      }
    )).to.be.revertedWith('Value below price');
  });

  it("should fail to create a new valid TLD if more than 1 dot in the name", async function () {
    await contract.toggleBuyingTlds(); // enable buying TLDs

    const price = await contract.price();
    expect(price).to.equal(tldPrice);

    await expect(contract.createTld(
      ".web.3", // TLD
      "WEB3", // symbol
      signer.address, // TLD owner
      ethers.utils.parseUnits("0.2", "ether"), // domain price
      false, // buying enabled
      {
        value: tldPrice // pay 1 ETH for the TLD
      }
    )).to.be.revertedWith('Name must have 1 dot');
  });

  it("should fail to create a new valid TLD if no dot in the name", async function () {
    await contract.toggleBuyingTlds(); // enable buying TLDs

    const price = await contract.price();
    expect(price).to.equal(tldPrice);

    await expect(contract.createTld(
      "web3", // TLD
      "WEB3", // symbol
      signer.address, // TLD owner
      ethers.utils.parseUnits("0.2", "ether"), // domain price
      false, // buying enabled
      {
        value: tldPrice // pay 1 ETH for the TLD
      }
    )).to.be.revertedWith('Name must have 1 dot');
  });

  it("should fail to create a new valid TLD if name does not start with dot", async function () {
    await contract.toggleBuyingTlds(); // enable buying TLDs

    const price = await contract.price();
    expect(price).to.equal(tldPrice);

    await expect(contract.createTld(
      "web.3", // TLD
      "WEB3", // symbol
      signer.address, // TLD owner
      ethers.utils.parseUnits("0.2", "ether"), // domain price
      false, // buying enabled
      {
        value: tldPrice // pay 1 ETH for the TLD
      }
    )).to.be.revertedWith('Name must start with dot');
  });

  it("should fail to create a new valid TLD if name is of length 1", async function () {
    await contract.toggleBuyingTlds(); // enable buying TLDs

    const price = await contract.price();
    expect(price).to.equal(tldPrice);

    await expect(contract.createTld(
      ".", // TLD
      "WEB3", // symbol
      signer.address, // TLD owner
      ethers.utils.parseUnits("0.2", "ether"), // domain price
      false, // buying enabled
      {
        value: tldPrice // pay 1 ETH for the TLD
      }
    )).to.be.revertedWith('TLD too short');
  });

  it("should fail to create a new valid TLD with empty name", async function () {
    await contract.toggleBuyingTlds(); // enable buying TLDs

    const price = await contract.price();
    expect(price).to.equal(tldPrice);

    await expect(contract.createTld(
      "", // TLD
      "WEB3", // symbol
      signer.address, // TLD owner
      ethers.utils.parseUnits("0.2", "ether"), // domain price
      false, // buying enabled
      {
        value: tldPrice // pay 1 ETH for the TLD
      }
    )).to.be.revertedWith('TLD too short');
  });

  it("should fail to create a new valid TLD if TLD already exists", async function () {
    await contract.toggleBuyingTlds(); // enable buying TLDs

    const price = await contract.price();
    expect(price).to.equal(tldPrice);

    // create a valid TLD
    await expect(contract.createTld(
      ".web3", // TLD
      "WEB3", // symbol
      signer.address, // TLD owner
      ethers.utils.parseUnits("0.2", "ether"), // domain price
      false, // buying enabled
      {
        value: tldPrice // pay 1 ETH for the TLD
      }
    )).to.emit(contract, "TldCreated");

    // try to create a TLD with the same name
    await expect(contract.createTld(
      ".web3", // TLD
      "WEB3", // symbol
      signer.address, // TLD owner
      ethers.utils.parseUnits("0.2", "ether"), // domain price
      false, // buying enabled
      {
        value: tldPrice // pay 1 ETH for the TLD
      }
    )).to.be.revertedWith('TLD already exists');
  });

  it("should fail to create a new valid TLD if TLD name is too long", async function () {
    await contract.toggleBuyingTlds(); // enable buying TLDs

    const price = await contract.price();
    expect(price).to.equal(tldPrice);

    // try to create a TLD with the same name
    await expect(contract.createTld(
      ".web3dfferopfmeomeriovneriovneriovndferfgergf", // TLD
      "WEB3", // symbol
      signer.address, // TLD owner
      ethers.utils.parseUnits("0.2", "ether"), // domain price
      false, // buying enabled
      {
        value: tldPrice // pay 1 ETH for the TLD
      }
    )).to.be.revertedWith('TLD too long');

  });

  it("should fail to create a new valid TLD if TLD name is forbidden", async function () {
    await contract.toggleBuyingTlds(); // enable buying TLDs

    const price = await contract.price();
    expect(price).to.equal(tldPrice);

    // try to create a TLD that's on the forbidden list
    await expect(contract.createTld(
      ".com", // TLD
      "COM", // symbol
      signer.address, // TLD owner
      ethers.utils.parseUnits("0.2", "ether"), // domain price
      false, // buying enabled
      {
        value: tldPrice // pay 1 ETH for the TLD
      }
    )).to.be.revertedWith('Forbidden TLD');

  });

});
