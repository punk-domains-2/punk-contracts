// script to generate domains from an array of names
// npx hardhat run scripts/partners/templates/broker/mintDomainsArray.js --network base

const tldAddress = "";
const minterAddress = "";
const domainExtension = ".extension";

const namesArray = [
  {
    "address" : "0xaddress",
    "name" : "somename"
  },
  {
    "address" : "0xenterAddress",
    "name" : "othername"
  }
]

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
    const domainName = String(nameObj.name).toLowerCase().trim().replace(domainExtension, "");
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
        console.log("Domain "+domainName+domainExtension+" already minted", e);
        try {
          if (recipient && recipient !== ethers.constants.AddressZero) {
            const tx = await minterContract.ownerFreeMint(domainName+"0x", recipient);
            await tx.wait();
            console.log("Domain "+domainName+"0x"+domainExtension+" minted instead.");
          }
        } catch (e) {
          console.log("Domain with 0x appended also already minted", e);
          continue;
        }
      }

      console.log("Domain minted:", domainName);
      await sleep(1000);
    } else {
      console.log("Domain "+domainName+domainExtension+" already minted");
      try {
        if (recipient && recipient !== ethers.constants.AddressZero) {
          const tx = await minterContract.ownerFreeMint(domainName+"0x", recipient);
          await tx.wait();
          console.log("Domain "+domainName+"0x"+domainExtension+" minted instead.");
        }
      } catch (e) {
        console.log("Domain with 0x appended also already minted", e);
      }
      await sleep(1000);
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