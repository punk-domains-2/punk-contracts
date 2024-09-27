// Run tests:
// npx hardhat test test/partners/meow/meowEligibilty.test.js

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

describe(".meow reservations contract", function () {
  let contract;
  let owner, writer;
  let acc1, acc2;
  let users = [];

  beforeEach(async () => {
    [owner, writer, acc1, acc2] = await ethers.getSigners();

    // Create mock user addresses
    for (let i = 0; i < 30; i++) {  // Changed from 20 to 30
      users.push(ethers.Wallet.createRandom().address);
    }

    const MeowEligibility = await ethers.getContractFactory("MeowReservations");
    contract = await MeowEligibility.deploy(writer.address);
  });

  it("checks the writer", async function () {
    expect(await contract.writer()).to.equal(writer.address);
  });

  it("allows writer to set reserved name", async function () {
    const tx = await contract.connect(writer).setResName("CoolCat", acc1.address);
    const receipt = await tx.wait();
    calculateGasCosts("setResName", receipt);

    expect(await contract.reservedNames("CoolCat")).to.equal(acc1.address);
  });

  it("allows writer to set reserved names in bulk", async function () {
    const addresses = users.slice(0, 30);
    const names = [
      "CoolCat123456789", "SuperDog123456789", "CleverFox12345678",
      "SmartBird12345678", "FastHare123456789", "StrongBear1234567",
      "WiseLion123456789", "QuickMouse123456", "BraveTiger1234567",
      "NinjaPanda1234567", "SwiftEagle1234567", "CuteRabbit1234567",
      "WiseOwl1234567890", "SlyFox12345678901", "MightyLion1234567",
      "GentleElephant123", "PlayfulDolphin123", "CleverMonkey12345",
      "GracefulSwan12345", "LoyalDog123456789",
      "FierceLeopard12345", "HappyHippo1234567", "SneakySnake123456",
      "JollyGiraffe12345", "MerryMeerkat1234", "BusyBeaver1234567",
      "ZanyZebra12345678", "TalentedTurtle123", "EnergenticEmu1234",
      "FriendlyFlamingo12"
    ];
    
    const tx = await contract.connect(writer).setResNames(names, addresses);
    const receipt = await tx.wait();
    calculateGasCosts("setResNames", receipt);

    for (let i = 0; i < names.length; i++) {
      expect(await contract.reservedNames(names[i])).to.equal(addresses[i]);
    }
  });

  it("prevents non-writer from setting reserved name", async function () {
    await expect(contract.connect(acc1).setResName("CoolCat", acc2.address))
      .to.be.revertedWith("Only writer can set reserved name");
  });

  it("prevents non-writer from setting reserved names in bulk", async function () {
    const addresses = [acc1.address, acc2.address];
    const names = ["CoolCat", "SuperDog"];
    await expect(contract.connect(acc1).setResNames(names, addresses))
      .to.be.revertedWith("Only writer can set reserved name");
  });

  it("allows manager to set reserved name", async function () {
    await contract.connect(owner).addManager(acc1.address);
    await contract.connect(acc1).setResNameManager("CoolCat", acc2.address);
    expect(await contract.reservedNames("CoolCat")).to.equal(acc2.address);
  });

});
