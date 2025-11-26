pragma solidity ^0.8.9;

contract FuelSettlement {

    // --- Data Structures ---

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

    // --- State Variables ---

    address payable public airline;
    uint256 public newOrderId;
    mapping(uint256 => FuelOrder) public orders;

    // --- Events ---

    event OrderCreated(uint256 indexed orderId, address indexed supplier, uint256 totalAmount);
    event DeliveryConfirmed(uint256 indexed orderId, uint256 timestamp);
    event PaymentSettled(uint256 indexed orderId, address recipient, uint256 amount);
    event OrderDeclined(uint256 indexed orderId, uint256 timestamp);

    // --- Constructor ---

    constructor() {
        airline = payable(msg.sender);
    }

    // --- Modifiers ---

    modifier onlyAirline() {
        require(msg.sender == airline, "Not the airline");
        _;
    }

    modifier onlySupplier(uint256 _orderId) {
        require(msg.sender == orders[_orderId].supplier, "Not the designated supplier");
        _;
    }

    // --- Core Functions ---

    function createFuelOrder(
        address payable _supplier,
        uint256 _quantityLitres,
        uint256 _pricePerLitre
    ) public payable onlyAirline {
        uint256 calculatedTotal = _quantityLitres * _pricePerLitre;
        require(msg.value == calculatedTotal, "Deposit must match calculated cost exactly");

        orders[newOrderId] = FuelOrder({
            orderId: newOrderId,
            supplier: _supplier,
            quantityLitres: _quantityLitres,
            pricePerLitre: _pricePerLitre,
            totalAmount: msg.value,
            status: OrderStatus.Created,
            deliveryConfirmed: false
        });

        emit OrderCreated(newOrderId, _supplier, msg.value);
        newOrderId++;
    }

    function confirmDelivery(uint256 _orderId) public onlySupplier(_orderId) {
        FuelOrder storage order = orders[_orderId];

        require(order.status == OrderStatus.Created, "Order not in active state");
        require(!order.deliveryConfirmed, "Delivery already confirmed");

        order.deliveryConfirmed = true;
        order.status = OrderStatus.Delivered;

        emit DeliveryConfirmed(_orderId, block.timestamp);

        _settlePayment(_orderId);
    }

    function _settlePayment(uint256 _orderId) internal {
        FuelOrder storage order = orders[_orderId];

        require(address(this).balance >= order.totalAmount, "Insufficient contract balance");

        (bool sent, ) = order.supplier.call{value: order.totalAmount}("");
        require(sent, "Failed to send CAM tokens");

        order.status = OrderStatus.Settled;

        emit PaymentSettled(_orderId, order.supplier, order.totalAmount);
    }

    function cancelOrder(uint256 _orderId) public onlyAirline {
        FuelOrder storage order = orders[_orderId];
        require(order.status == OrderStatus.Created, "Cannot cancel processed order");

        order.status = OrderStatus.Cancelled;

        (bool sent, ) = airline.call{value: order.totalAmount}("");
        require(sent, "Refund failed");
    }

    function declineOrder(uint256 _orderId) public onlySupplier(_orderId) {
        FuelOrder storage order = orders[_orderId];
        require(order.status == OrderStatus.Created, "Order not in active state");

        order.status = OrderStatus.Declined;

        (bool sent, ) = airline.call{value: order.totalAmount}("");
        require(sent, "Refund failed");

        emit OrderDeclined(_orderId, block.timestamp);
    }
}
