import { BigNumber } from "ethers";
import {ethers} from "hardhat"

// 0x81605cE13a42Cb0Bb024660d3C89Ad3e7fE8B2EF

async function main() {
    // Creating an interactable contract variable.
    // "ContractName" is the Contract/Interface of the contract we want to call (We need to have either the full code or interface compiled)
    //  contractaddr - address of the contract to be called
    const kyc = await ethers.getContractAt("FuelSettlement", "0x81605cE13a42Cb0Bb024660d3C89Ad3e7fE8B2EF")
    await kyc.getIn();
    
    console.log("\n Success \n" );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
