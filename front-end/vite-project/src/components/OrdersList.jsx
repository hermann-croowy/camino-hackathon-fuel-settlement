import React, { useContext, useEffect } from 'react';
import { FuelSettlementContext } from '../context/FuelSettlementContext';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';

const OrdersList = () => {
    const {
        currentAccount,
        orders,
        getAllOrders,
        cancelOrder,
        isLoading
    } = useContext(FuelSettlementContext);

    useEffect(() => {
        if (currentAccount) {
            getAllOrders();
        }
    }, [currentAccount, getAllOrders]);

    const getStatusLabel = (status) => {
        const statusMap = {
            0: 'Created',
            1: 'Delivered',
            2: 'Settled',
            3: 'Cancelled',
            4: 'Declined'
        };
        return statusMap[status] || 'Unknown';
    };

    const getStatusColor = (status) => {
        const colorMap = {
            0: 'bg-[#FCCC04]', // Created - Vueling Gold
            1: 'bg-green-500', // Delivered
            2: 'bg-[#4C4C4B]', // Settled - Vueling Dim Gray
            3: 'bg-gray-500', // Cancelled
            4: 'bg-red-500' // Declined
        };
        return colorMap[status] || 'bg-gray-500';
    };

    if (!currentAccount) {
        return (
            <div className="flex w-full justify-center items-center flex-1 min-h-full">
                <div className="flex mf:flex-row flex-col items-start justify-between md:p-20 py-12 px-4 w-full">
                    <div className="flex flex-1 justify-start flex-col mf:mr-10">
                        <h1 className="text-3xl sm:text-5xl text-black py-1">
                            Orders
                        </h1>
                        <p className="text-left mt-5 text-black font-normal md:w-9/12 w-11/12 text-base">
                            View and manage all your fuel orders.
                        </p>
                    </div>
                    <div className="flex flex-col flex-1 items-center justify-center w-full mf:mt-0 mt-10">
                        <div className="p-5 sm:w-96 w-full flex flex-col justify-start items-center blue-glassmorphism">
                            <Alert>
                                <AlertDescription className="text-black">Please connect your wallet to view orders</AlertDescription>
                            </Alert>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="flex w-full justify-center items-center flex-1 min-h-full">
                <div className="flex mf:flex-row flex-col items-start justify-between md:p-20 py-12 px-4 w-full">
                    <div className="flex flex-1 justify-start flex-col mf:mr-10">
                        <h1 className="text-3xl sm:text-5xl text-black py-1">
                            Orders
                        </h1>
                        <p className="text-left mt-5 text-black font-normal md:w-9/12 w-11/12 text-base">
                            View and manage all your fuel orders.
                        </p>
                    </div>
                    <div className="flex flex-col flex-1 items-center justify-center w-full mf:mt-0 mt-10">
                        <div className="p-5 sm:w-96 w-full flex flex-col justify-start items-center blue-glassmorphism">
                            <Alert>
                                <AlertDescription className="text-black">No orders found</AlertDescription>
                            </Alert>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex w-full justify-center items-center flex-1 min-h-full">
            <div className="flex mf:flex-row flex-col items-start justify-between md:p-20 py-12 px-4 w-full">
                <div className="flex flex-1 justify-start flex-col mf:mr-10">
                    <h1 className="text-3xl sm:text-5xl text-black py-1">
                        Orders
                    </h1>
                    <p className="text-left mt-5 text-black font-normal md:w-9/12 w-11/12 text-base">
                        View and manage all your fuel orders.
                    </p>
                </div>
                <div className="flex flex-col flex-1 items-center justify-start w-full mf:mt-0 mt-10 space-y-4">
                    {orders.map((order) => (
                        <div key={order.orderId} className="p-5 sm:w-96 w-full flex flex-col justify-start items-center blue-glassmorphism">
                            <div className="w-full flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-black">Order #{order.orderId}</h3>
                                    <p className="text-sm text-black mt-1 opacity-70">
                                        Supplier: {order.supplier.slice(0, 6)}...{order.supplier.slice(-4)}
                                    </p>
                                </div>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        order.status === 0 || order.status === 2 
                                            ? 'text-black' 
                                            : 'text-white'
                                    } ${getStatusColor(order.status)}`}
                                >
                                    {getStatusLabel(order.status)}
                                </span>
                            </div>
                            
                            <div className="w-full space-y-3 mb-4">
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-black opacity-70">Quantity</p>
                                    <p className="text-lg font-semibold text-black">{order.quantityLitres} L</p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-black opacity-70">Price/Litre</p>
                                    <p className="text-lg font-semibold text-black">{order.pricePerLitre} CAM</p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-black opacity-70">Total Amount</p>
                                    <p className="text-lg font-semibold text-black">{order.totalAmount} CAM</p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-black opacity-70">Delivery</p>
                                    <p className="text-lg font-semibold text-black">
                                        {order.deliveryConfirmed ? 'Confirmed' : 'Pending'}
                                    </p>
                                </div>
                            </div>

                            <div className="h-[1px] w-full bg-black opacity-20 my-2" />

                            {order.status === 0 && (
                                <Button
                                    variant="destructive"
                                    onClick={() => cancelOrder(order.orderId)}
                                    disabled={isLoading}
                                    className="text-black w-full mt-2 border-[1px] p-2 border-red-500 hover:bg-red-500/20 rounded-full cursor-pointer bg-transparent vueling-lowercase"
                                >
                                    cancel order
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OrdersList;

