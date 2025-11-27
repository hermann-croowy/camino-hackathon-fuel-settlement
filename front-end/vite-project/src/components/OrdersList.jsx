import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FuelSettlementContext } from '../context/FuelSettlementContext';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Loader } from './';

const ORDERS_PER_PAGE = 5;

const OrdersList = () => {
    const navigate = useNavigate();
    const {
        currentAccount,
        connectWallet,
        orders,
        getAllOrders,
        cancelOrder,
        isLoading,
        error,
        success,
        setError,
        setSuccess
    } = useContext(FuelSettlementContext);

    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [actionLoading, setActionLoading] = useState(false);
    const [isFetchingOrders, setIsFetchingOrders] = useState(false);

    // Force refresh orders when component mounts and when account changes
    const refreshOrders = useCallback(async () => {
        if (currentAccount) {
            setIsFetchingOrders(true);
            try {
                await getAllOrders();
            } finally {
                setIsFetchingOrders(false);
            }
        }
    }, [currentAccount, getAllOrders]);

    // Fetch orders on mount and when account changes
    useEffect(() => {
        refreshOrders();
    }, [refreshOrders]);

    // Also refresh on page focus (when user comes back to the tab)
    useEffect(() => {
        const handleFocus = async () => {
            if (currentAccount && !isFetchingOrders) {
                setIsFetchingOrders(true);
                try {
                    await getAllOrders();
                } finally {
                    setIsFetchingOrders(false);
                }
            }
        };
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [currentAccount, getAllOrders, isFetchingOrders]);

    useEffect(() => {
        // Clear messages after 5 seconds
        if (error) {
            const timer = setTimeout(() => setError(null), 5000);
            return () => clearTimeout(timer);
        }
        if (success) {
            const timer = setTimeout(() => setSuccess(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [error, success, setError, setSuccess]);

    // Pagination calculations
    const totalPages = Math.ceil(orders.length / ORDERS_PER_PAGE);
    const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
    const endIndex = startIndex + ORDERS_PER_PAGE;
    const paginatedOrders = orders.slice(startIndex, endIndex);

    // Reset to page 1 if current page becomes invalid
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(1);
        }
    }, [currentPage, totalPages]);

    // Auto-select first order on current page if none selected
    useEffect(() => {
        if (paginatedOrders.length > 0 && !paginatedOrders.find(o => o.orderId === selectedOrderId)) {
            setSelectedOrderId(paginatedOrders[0].orderId);
        }
    }, [paginatedOrders, selectedOrderId]);

    const selectedOrder = orders.find(order => order.orderId === selectedOrderId);

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
            0: 'bg-[#FCCC04] text-black', // Created - Vueling Gold
            1: 'bg-green-500 text-white', // Delivered
            2: 'bg-[#4C4C4B] text-white', // Settled - Vueling Dim Gray
            3: 'bg-gray-500 text-white', // Cancelled
            4: 'bg-red-500 text-white' // Declined
        };
        return colorMap[status] || 'bg-gray-500 text-white';
    };

    const handleAction = async (action, orderId) => {
        try {
            setActionLoading(true);
            await action(orderId);
        } catch (err) {
            console.error('Action failed:', err);
        } finally {
            setActionLoading(false);
        }
    };

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    if (!currentAccount) {
        return (
            <div className="flex w-full justify-center items-center flex-1 min-h-full">
                <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto px-4 py-12">
                    <h1 className="text-3xl sm:text-4xl text-black py-1 text-center font-semibold">
                        Orders
                    </h1>
                    <p className="text-center mt-4 text-black font-normal text-base opacity-70">
                        View and manage all your fuel orders
                    </p>
                    <div className="p-6 w-full flex flex-col justify-start items-center blue-glassmorphism mt-8">
                        <p className="text-black text-base mb-4 text-center">Connect your wallet to view your orders</p>
                        <Button 
                            onClick={connectWallet}
                            className="text-black w-full border-[1px] p-2 border-[#FCCC04] bg-[#FCCC04] hover:bg-[#e6b800] rounded-full cursor-pointer font-semibold vueling-lowercase"
                        >
                            connect wallet
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (isFetchingOrders && orders.length === 0) {
        return (
            <div className="flex w-full justify-center items-center flex-1 min-h-full">
                <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto px-4 py-12">
                    <h1 className="text-3xl sm:text-4xl text-black py-1 text-center font-semibold">
                        Orders
                    </h1>
                    <p className="text-center mt-4 text-black font-normal text-base opacity-70">
                        Loading your orders...
                    </p>
                    <div className="mt-8">
                        <Loader />
                    </div>
                </div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="flex w-full justify-center items-center flex-1 min-h-full">
                <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto px-4 py-12">
                    <h1 className="text-3xl sm:text-4xl text-black py-1 text-center font-semibold">
                        Orders
                    </h1>
                    <p className="text-center mt-4 text-black font-normal text-base opacity-70">
                        View and manage all your fuel orders
                    </p>
                    <div className="p-6 w-full flex flex-col justify-start items-center blue-glassmorphism mt-8">
                        <Alert>
                            <AlertDescription className="text-black">No orders found. Create your first order!</AlertDescription>
                        </Alert>
                        <Button 
                            onClick={() => navigate('/create-order')}
                            className="text-black w-full mt-4 border-[1px] p-2 border-[#FCCC04] bg-[#FCCC04] hover:bg-[#e6b800] rounded-full cursor-pointer font-semibold vueling-lowercase"
                        >
                            new order
                        </Button>
                        <Button 
                            onClick={refreshOrders}
                            className="text-black w-full mt-2 border-[1px] p-2 border-[#4C4C4B] hover:bg-[#4C4C4B]/20 rounded-full cursor-pointer bg-transparent vueling-lowercase"
                        >
                            refresh orders
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex w-full justify-center items-start flex-1 min-h-full">
            <div className="flex flex-col lg:flex-row w-full max-w-6xl mx-auto px-4 py-8 gap-6">
                {/* Left Panel - Order Index */}
                <div className="lg:w-1/3 w-full">
                    <div className="sticky top-8">
                        <div className="flex justify-between items-start mb-2">
                            <h1 className="text-2xl sm:text-3xl text-black font-semibold">
                                Orders
                            </h1>
                            <div className="flex gap-2">
                                <Button
                                    onClick={refreshOrders}
                                    disabled={isFetchingOrders}
                                    className="text-black p-2 h-auto border border-[#4C4C4B]/30 hover:bg-green-500/10 hover:border-green-500/50 hover:text-green-600 rounded-lg cursor-pointer bg-transparent transition-colors duration-200"
                                    title="Refresh orders"
                                >
                                    <svg className={`w-4 h-4 ${isFetchingOrders ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </Button>
                            </div>
                        </div>
                        <p className="text-black font-normal text-sm opacity-70 mb-4">
                            {orders.length} order{orders.length !== 1 ? 's' : ''} total
                        </p>

                        {/* New Order Button */}
                        <Button 
                            onClick={() => navigate('/create-order')}
                            className="text-black w-full mb-4 border-[1px] p-3 border-[#FCCC04] bg-[#FCCC04] hover:bg-[#e6b800] rounded-xl cursor-pointer font-semibold vueling-lowercase flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            new order
                        </Button>

                        {/* Feedback Messages */}
                        {error && (
                            <Alert variant="destructive" className="mb-4 bg-red-500/20 border-red-500">
                                <AlertDescription className="text-red-600 text-sm">{error}</AlertDescription>
                            </Alert>
                        )}
                        {success && (
                            <Alert className="mb-4 bg-green-500/20 border-green-500">
                                <AlertDescription className="text-green-600 text-sm">{success}</AlertDescription>
                            </Alert>
                        )}

                        {/* Order List */}
                        <div className="space-y-2 mb-4">
                            {paginatedOrders.map((order) => (
                                <button
                                    key={order.orderId}
                                    onClick={() => setSelectedOrderId(order.orderId)}
                                    className={`w-full p-4 rounded-xl text-left transition-all duration-200 ${
                                        selectedOrderId === order.orderId
                                            ? 'bg-[#FCCC04]/30 border-2 border-[#FCCC04]'
                                            : 'bg-white/50 border border-gray-200 hover:border-[#FCCC04]/50'
                                    }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-black">Order #{order.orderId}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                            {getStatusLabel(order.status)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mt-2 text-sm">
                                        <span className="text-black/60">{order.quantityLitres} L</span>
                                        <span className="font-medium text-black">{order.totalAmount} CAM</span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between bg-white/50 rounded-xl p-3 border border-gray-200">
                                <Button
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="text-black p-2 h-auto border border-[#4C4C4B]/30 hover:bg-[#4C4C4B]/10 rounded-lg cursor-pointer bg-transparent disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </Button>
                                
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => goToPage(page)}
                                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                                                currentPage === page
                                                    ? 'bg-[#FCCC04] text-black'
                                                    : 'text-black/60 hover:bg-[#FCCC04]/20'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>

                                <Button
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="text-black p-2 h-auto border border-[#4C4C4B]/30 hover:bg-[#4C4C4B]/10 rounded-lg cursor-pointer bg-transparent disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Button>
                            </div>
                        )}

                        {/* Page info */}
                        {totalPages > 1 && (
                            <p className="text-center text-black/50 text-xs mt-2">
                                Showing {startIndex + 1}-{Math.min(endIndex, orders.length)} of {orders.length} orders
                            </p>
                        )}
                    </div>
                </div>

                {/* Right Panel - Order Detail */}
                <div className="lg:w-2/3 w-full">
                    {selectedOrder ? (
                        <div className="blue-glassmorphism p-6 rounded-2xl">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-6 pb-4 border-b border-black/10">
                                <div>
                                    <h2 className="text-2xl font-semibold text-black">Order #{selectedOrder.orderId}</h2>
                                    <p className="text-black/60 text-sm mt-1">Fuel order details</p>
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(selectedOrder.status)}`}>
                                    {getStatusLabel(selectedOrder.status)}
                                </span>
                            </div>

                            {/* Order Details Grid */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-white/30 rounded-xl p-4">
                                    <p className="text-black/60 text-sm mb-1">Quantity</p>
                                    <p className="text-2xl font-semibold text-black">{selectedOrder.quantityLitres} <span className="text-base font-normal">Litres</span></p>
                                </div>
                                <div className="bg-white/30 rounded-xl p-4">
                                    <p className="text-black/60 text-sm mb-1">Price per Litre</p>
                                    <p className="text-2xl font-semibold text-black">{selectedOrder.pricePerLitre} <span className="text-base font-normal">CAM</span></p>
                                </div>
                                <div className="bg-white/30 rounded-xl p-4">
                                    <p className="text-black/60 text-sm mb-1">Total Amount</p>
                                    <p className="text-2xl font-semibold text-black">{selectedOrder.totalAmount} <span className="text-base font-normal">CAM</span></p>
                                </div>
                                <div className="bg-white/30 rounded-xl p-4">
                                    <p className="text-black/60 text-sm mb-1">Delivery Status</p>
                                    <p className="text-2xl font-semibold text-black">
                                        {selectedOrder.deliveryConfirmed ? (
                                            <span className="text-green-600">Confirmed</span>
                                        ) : (
                                            <span className="text-[#FCCC04]">Pending</span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Supplier Address */}
                            <div className="bg-white/30 rounded-xl p-4 mb-6">
                                <p className="text-black/60 text-sm mb-1">Supplier Address</p>
                                <p className="text-black font-mono text-sm break-all">{selectedOrder.supplier}</p>
                            </div>

                            {/* Actions */}
                            {selectedOrder.status === 0 ? (
                                <div className="border-t border-black/10 pt-6">
                                    <h3 className="text-lg font-semibold text-black mb-4">Available Actions</h3>
                                    {actionLoading ? (
                                        <div className="flex justify-center py-4">
                                            <Loader />
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-3">
                                            <Button
                                                onClick={() => handleAction(cancelOrder, selectedOrder.orderId)}
                                                disabled={actionLoading}
                                                className="text-red-500 border-2 p-3 h-auto border-red-500 bg-white hover:bg-red-500 hover:text-white rounded-xl cursor-pointer font-semibold vueling-lowercase flex flex-col items-center gap-1 transition-all duration-200"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                </svg>
                                                cancel order
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="border-t border-black/10 pt-6">
                                    <div className="bg-white/30 rounded-xl p-4 text-center mb-4">
                                        <p className="text-black/60">
                                            {selectedOrder.status === 1 && "This order has been delivered and is awaiting settlement."}
                                            {selectedOrder.status === 2 && "This order has been completed and settled."}
                                            {selectedOrder.status === 3 && "This order was cancelled."}
                                            {selectedOrder.status === 4 && "This order was declined by the supplier."}
                                        </p>
                                    </div>
                                    {/* Invoice button for Delivered (1) or Settled (2) orders */}
                                    {(selectedOrder.status === 1 || selectedOrder.status === 2) && (
                                        <Button
                                            onClick={() => navigate(`/create-invoice/${selectedOrder.orderId}`)}
                                            className="w-full text-black border-2 p-3 h-auto border-[#FCCC04] bg-[#FCCC04] hover:bg-[#e6b800] rounded-xl cursor-pointer font-semibold vueling-lowercase flex items-center justify-center gap-2 transition-all duration-200"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            create invoice
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="blue-glassmorphism p-6 rounded-2xl flex items-center justify-center min-h-[400px]">
                            <p className="text-black/60">Select an order from the list to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrdersList;
