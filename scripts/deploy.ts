import {ethers} from "hardhat"

async function main() {
    const FuelSettlement = await ethers.getContractFactory("FuelSettlement");
    const fuelSettlement = await FuelSettlement.deploy();

    await fuelSettlement.deployed();

    console.log("FuelSettlement deployed to:", fuelSettlement.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });