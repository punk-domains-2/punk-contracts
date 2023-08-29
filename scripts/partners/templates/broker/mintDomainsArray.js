// script to generate domains from an array of names
// npx hardhat run scripts/partners/templates/broker/mintDomainsArray.js --network flare

const namesArray = [
  {
    "address": "0xb29050965a5ac70ab487aa47546cdcbc97dae45d",
    "name": "techie"
  },
  {
    "address": "0x5ffd23b1b0350debb17a2cb668929ac5f76d0e18",
    "name": "tekr"
  }
]

const tldAddress = "0xBDACF94dDCAB51c39c2dD50BffEe60Bb8021949a";
const minterAddress = "0x63f8691b048e68E1C3d6E135aDc81291A9bb1987";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Calling methods with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const tldInterface = new ethers.utils.Interface([
    "function getDomainHolder(string calldata _domainName) public view returns(address)"
  ]);

  const minterInterface = new ethers.utils.Interface([
    "function ownerFreeMint(string memory, address) external returns(uint256 tokenId)"
  ]);

  const tldContract = new ethers.Contract(tldAddress, tldInterface, deployer);
  const minterContract = new ethers.Contract(minterAddress, minterInterface, deployer);

  // loop through the namesArray
  for (let nameObj of namesArray) {
    const domainName = String(nameObj.name).toLowerCase().trim().replace(".flr", "");
    const recipient = nameObj.address;

    // check if there is already domain holder for punk domainName
    const domainHolder = await tldContract.getDomainHolder(domainName);

    // if domain name not minted yet, mint it
    if (domainHolder == ethers.constants.AddressZero) {
      console.log("Minting domain:", domainName, "for address:", recipient);

      try {
        if (recipient && recipient !== ethers.constants.AddressZero) {
          const tx = await minterContract.ownerFreeMint(domainName, recipient);
          await tx.wait();
        }
      } catch (e) {
        console.log("Domain already minted", e);
        continue;
      }

      console.log("Domain minted:", domainName);
    } else {
      console.log("Domain already minted:", domainName);
      await sleep(2000);
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });