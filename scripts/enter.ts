import {ethers} from "hardhat"

const CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS";

async function createOrder() {
    const contract = await ethers.getContractAt("FuelSettlement", CONTRACT_ADDRESS);

    const supplierAddress = "0x..."; // supplier wallet
    const quantityLitres = 5000;
    const pricePerLitre = ethers.utils.parseEther("0.001");
    const totalCost = ethers.utils.parseEther("5"); // 5000 * 0.001

    const tx = await contract.createFuelOrder(
        supplierAddress,
        quantityLitres,
        pricePerLitre,
        { value: totalCost }
    );
    await tx.wait();

    console.log("Order created!");
}

async function confirmDelivery(orderId: number) {
    const contract = await ethers.getContractAt("FuelSettlement", CONTRACT_ADDRESS);

    const tx = await contract.confirmDelivery(orderId);
    await tx.wait();

    console.log(`Order ${orderId} delivery confirmed and payment settled!`);
}

async function declineOrder(orderId: number) {
    const contract = await ethers.getContractAt("FuelSettlement", CONTRACT_ADDRESS);

    const tx = await contract.declineOrder(orderId);
    await tx.wait();

    console.log(`Order ${orderId} declined, funds refunded to airline!`);
}

async function cancelOrder(orderId: number) {
    const contract = await ethers.getContractAt("FuelSettlement", CONTRACT_ADDRESS);

    const tx = await contract.cancelOrder(orderId);
    await tx.wait();

    console.log(`Order ${orderId} cancelled, funds refunded!`);
}

async function main() {
    // Uncomment the action you want to perform:

    // await createOrder();
    // await confirmDelivery(0);
    // await declineOrder(0);
    // await cancelOrder(0);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
