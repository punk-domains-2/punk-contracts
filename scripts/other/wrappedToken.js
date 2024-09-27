// npx hardhat run scripts/other/wrappedToken.js --network superposition

const wrappedToken = "0x1fB719f10b56d7a85DCD32f27f897375fB21cfdd";

async function main() {
  const [ owner ] = await ethers.getSigners();

  console.log("Running script with the account:", owner.address);
  console.log("Account balance:", (await owner.getBalance()).toString());

  const intrfc = new ethers.utils.Interface([
    "function deposit() external payable",
    "function withdraw(uint256 amount) external"
  ]);

  console.log(`Depositing 1 wei to ${wrappedToken}`);

  try {
    const contract = new ethers.Contract(wrappedToken, intrfc, owner);
    const tx = await contract.deposit({ value: 1 });
    await tx.wait();
  } catch (error) {
    console.log(error);
  }

  console.log("Done");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });