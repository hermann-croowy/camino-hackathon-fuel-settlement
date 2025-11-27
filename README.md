<p align="center">
  <img src="https://github.com/juuroudojo/images/blob/main/camino-logo.png" height="150" />
</p>

# Fuel Settlement dApp

![](https://img.shields.io/badge/Solidity-363636?logo=solidity&logoColor=white) ![](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black) ![](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white) ![](https://img.shields.io/badge/Hardhat-FFF100?logo=hardhat&logoColor=black) ![](https://img.shields.io/badge/Camino_Network-00C389?logoColor=white)

> Blockchain-powered instant settlement for aviation fuel supply chains

## About The Challenge

Current B2B aviation payment cycles create significant cash flow challenges: suppliers deliver services immediately but wait **30-90 days** for payment, while airlines manage credit risk and complex reconciliation processes. The manual verification required for each invoice — did the fuel quantity match the order? was it delivered to the correct aircraft? — adds delays and potential for disputes.

This challenge explores how smart contracts on **Camino Network** can automate the full supplier payment cycle: from service registration to validation and instant payment execution. Using blockchain-based logic, payments are released automatically once pre-set conditions are met — ensuring **transparency**, **trust**, and **speed**.

## Our Solution

The Fuel Settlement dApp demonstrates how **instant settlement benefits both parties**:

- **Suppliers** receive immediate payment upon delivery confirmation, improving their working capital
- **Airlines** gain transparent verification, reducing reconciliation overhead and disputes
- **Both parties** benefit from an immutable audit trail showing exactly when service was delivered, who authorized it, and when payment executed

### How It Works

Our smart contract (`FuelSettlement.sol`) implements a complete fuel order lifecycle:

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Created   │ ───► │  Delivered  │ ───► │   Settled   │      │  Cancelled  │
│  (Escrow)   │      │ (Confirmed) │      │   (Paid)    │      │ (Refunded)  │
└─────────────┘      └─────────────┘      └─────────────┘      └─────────────┘
       │                                                              ▲
       └──────────────────────────────────────────────────────────────┘
                              (Airline cancels or Supplier declines)
```

1. **Order Creation**: Airline creates a fuel order specifying supplier, quantity, and price. Funds are locked in escrow.
2. **Delivery Confirmation**: Supplier confirms fuel delivery (could be triggered by IoT sensors or manual input)
3. **Instant Settlement**: Upon confirmation, payment is automatically released to supplier via CAM tokens
4. **Dispute Protection**: Either party can cancel/decline before delivery, with automatic refund to airline

### Key Features

- **Escrow-based Payments**: Funds locked on order creation, released automatically on delivery confirmation
- **Role-based Access Control**: Airlines create/cancel orders; Suppliers confirm/decline deliveries
- **Immutable Audit Trail**: All transactions recorded on Camino blockchain
- **CAM Token Settlement**: Native token payments on Camino Columbus testnet
- **Real-time Order Tracking**: Frontend displays order status, quantities, and payment amounts
- **Invoice Generation**: PDF invoice creation for completed orders

### Smart Contract Architecture

```solidity
enum OrderStatus { Created, Delivered, Settled, Cancelled, Declined }

struct FuelOrder {
    uint256 orderId;
    address payable supplier;
    uint256 quantityLitres;
    uint256 pricePerLitre;
    uint256 totalAmount;
    OrderStatus status;
    bool deliveryConfirmed;
}
```

**Core Functions:**
- `createFuelOrder()` — Airline creates order with escrowed payment
- `confirmDelivery()` — Supplier confirms delivery, triggering instant payment
- `cancelOrder()` — Airline cancels order before delivery (full refund)
- `declineOrder()` — Supplier declines order (full refund to airline)

## Built With

**Smart Contracts:**
- Solidity ^0.8.9
- Hardhat
- OpenZeppelin Contracts
- Ethers.js v5

**Frontend:**
- React 18
- Vite
- TailwindCSS
- React Router
- Lucide Icons

**Blockchain:**
- Camino Network (Columbus Testnet)
- CAM Tokens

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14.x or higher)
- [MetaMask](https://metamask.io/) or [Camino Wallet](https://suite.camino.network)
- CAM tokens on Columbus testnet

### Installation

1. Clone the repository:
```bash
git clone https://github.com/hermann-croowy/camino-hackathon-fuel-settlement.git
cd camino-hackathon-fuel-settlement
```

2. Install dependencies:
```bash
npm install
cd front-end/vite-project
npm install
```

3. Configure environment variables:
```bash
# In project root, create .env for contract deployment
cp .env.example .env
# Edit with your private key and RPC URL

# In front-end/vite-project, create .env for frontend
cd front-end/vite-project
cp .env.example .env
```

4. Set the contract address in `front-end/vite-project/.env`:
```env
VITE_FUEL_SETTLEMENT_ADDRESS=0x81605cE13a42Cb0Bb024660d3C89Ad3e7fE8B2EF
```

**Note:** Replace with your deployed FuelSettlement contract address.

### Network Configuration

Add Camino Columbus Network to MetaMask:

| Setting | Value |
|---------|-------|
| **Network Name** | Camino Columbus |
| **RPC URL** | https://columbus.camino.network/ext/bc/C/rpc |
| **Chain ID** | 501 |
| **Currency Symbol** | CAM |
| **Block Explorer** | https://columbus-explorer.camino.network/ |

### Deploy Smart Contract

```bash
# Compile contracts
npx hardhat compile

# Deploy to Columbus testnet
npx hardhat run scripts/deploy.ts --network columbus
```

### Run Frontend

```bash
cd front-end/vite-project
npm run dev
```

The app will start at [http://localhost:5173](http://localhost:5173)

## Usage

### As an Airline

1. Connect your wallet (must be the contract deployer address)
2. Navigate to "Create Order"
3. Enter supplier address, fuel quantity (litres), and price per litre
4. Confirm the transaction — funds are locked in escrow
5. View orders in "Orders" section
6. Cancel orders if needed before delivery

### As a Supplier

1. Connect your wallet (must match the supplier address on the order)
2. Navigate to "Supplier Orders" to view assigned orders
3. Confirm delivery when fuel has been supplied
4. Receive instant payment in CAM tokens
5. Generate and download invoices for completed orders

### Order Status Flow

| Status | Description |
|--------|-------------|
| **Created** | Order placed, funds in escrow |
| **Delivered** | Supplier confirmed delivery |
| **Settled** | Payment released to supplier |
| **Cancelled** | Airline cancelled, funds refunded |
| **Declined** | Supplier declined, funds refunded |

## Deployed Contracts

| Contract | Address | Network |
|----------|---------|---------|
| FuelSettlement | `0x81605cE13a42Cb0Bb024660d3C89Ad3e7fE8B2EF` | Columbus Testnet |

## Future Enhancements

- **Camino Messenger Integration**: Extend with aviation-specific message types for fuel orders, pricing, and delivery confirmation
- **IoT Sensor Integration**: Automatic delivery confirmation via fuel truck sensors
- **Multi-signature Approval**: Complex approval workflows for large orders
- **Analytics Dashboard**: Real-time reporting on settlement metrics and supplier performance

## Testing

```bash
# Run smart contract tests
npx hardhat test

# Run frontend locally
cd front-end/vite-project
npm run dev
```

## Authors

👤 **Hermann Wagner**
- GitHub: [@hermann-croowy](https://github.com/hermann-croowy)
- LinkedIn: [Hermann Wagner](https://www.linkedin.com/in/hermann-wagner/)

👤 **Niklas Retzl**
- GitHub: [@Nretzl](https://github.com/Nretzl)
- LinkedIn: [Niklas Retzl](https://www.linkedin.com/in/niklas-retzl-093702368/)

👤 **Luis Fernando Jiménez**
- GitHub: [@lu-jim](https://github.com/lu-jim)
- LinkedIn: [Luis Jiménez](https://www.linkedin.com/in/lujim/)

## Contributing

Contributions, issues, and feature requests are welcome!

[Open an issue here](https://github.com/hermann-croowy/camino-hackathon-fuel-settlement/issues/new).

## Show your support

Give a ⭐️ if you like this project!

## Acknowledgments

<p align="center">
  <img src="https://github.com/juuroudojo/images/blob/main/camino-logo.png" height="80" />
</p>

Special thanks to:

- **[Chain4Travel](https://chain4travel.com/)** for organizing this hackathon and building the Camino Network
- **[Camino Network](https://camino.network/)** for providing the blockchain infrastructure for the travel industry
- **[Vueling](https://www.vueling.com/)** for the challenge prompt and guidance on aviation fuel settlement workflows

### Hackathon Organizers

- **Tech Tourism Cluster**
- **ACCIÓ** — Catalonia Trade & Investment, Generalitat de Catalunya
- **Hospitalidad Emprendedora**
- **Chain4Travel**

### Partners

- **Vueling**
- **TeamLabs**
- **Future Travel**
- **Barcelona Travel Hub**
- **Nubemsystems**
- **Clorian Ticketing**

---

*Built with ❤️ at the Camino Network Hackathon 2025*
