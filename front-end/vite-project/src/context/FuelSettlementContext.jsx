import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import FuelSettlementABI from '../utils/FuelSettlement.json';

export const FuelSettlementContext = React.createContext();

const { ethereum } = window;

const getFuelSettlementContract = () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contractAddress = import.meta.env.VITE_FUEL_SETTLEMENT_ADDRESS || '0x81605cE13a42Cb0Bb024660d3C89Ad3e7fE8B2EF';
    const fuelSettlementContract = new ethers.Contract(contractAddress, FuelSettlementABI.abi, signer);
    return fuelSettlementContract;
}

export const FuelSettlementProvider = ({ children }) => {
    const [currentAccount, setCurrentAccount] = useState("");
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const checkIfWalletIsConnected = async () => {
        try {
            if (!ethereum) return alert("Please install wallet software");

            const accounts = await window.ethereum.request({ method: 'eth_accounts' });

            if (accounts.length) {
                setCurrentAccount(accounts[0]);
                getAllOrders();
            } else {
                console.log("No account found!");
            }
        } catch (error) {
            console.log(error);
        }
    }

    const connectWallet = async () => {
        try {
            if (!ethereum) return alert("Please install wallet software!");

            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

            setCurrentAccount(accounts[0]);
            getAllOrders();
        } catch (error) {
            console.log(error);
            throw new Error("No ethereum object.")
        }
    }

    const getAllOrders = async () => {
        try {
            if (!ethereum) return alert("Please install wallet software");

            setIsLoading(true);
            const fuelSettlementContract = getFuelSettlementContract();
            
            // Get the total number of orders
            const newOrderId = await fuelSettlementContract.newOrderId();
            const totalOrders = newOrderId.toNumber();

            // Fetch all orders
            const ordersPromises = [];
            for (let i = 0; i < totalOrders; i++) {
                ordersPromises.push(fuelSettlementContract.orders(i));
            }

            const ordersData = await Promise.all(ordersPromises);

            // Structure the orders data
            const structuredOrders = ordersData.map((order, index) => ({
                orderId: order.orderId.toNumber(),
                supplier: order.supplier,
                quantityLitres: order.quantityLitres.toNumber(),
                pricePerLitre: ethers.utils.formatEther(order.pricePerLitre),
                totalAmount: ethers.utils.formatEther(order.totalAmount),
                status: order.status,
                deliveryConfirmed: order.deliveryConfirmed
            }));

            setOrders(structuredOrders);
            setIsLoading(false);
        } catch (error) {
            console.log(error);
            setIsLoading(false);
            setError("Failed to fetch orders");
        }
    }

    const createFuelOrder = async (supplierAddress, quantityLitres, pricePerLitre) => {
        try {
            if (!ethereum) return alert("Please install wallet software");

            setIsLoading(true);
            setError(null);
            setSuccess(null);

            const fuelSettlementContract = getFuelSettlementContract();
            
            // Calculate total cost
            const pricePerLitreWei = ethers.utils.parseEther(pricePerLitre.toString());
            const totalCost = pricePerLitreWei.mul(quantityLitres);

            // Create the order
            const transaction = await fuelSettlementContract.createFuelOrder(
                supplierAddress,
                quantityLitres,
                pricePerLitreWei,
                { value: totalCost }
            );

            console.log('Loading -', transaction.hash);
            await transaction.wait();
            console.log('Success -', transaction.hash);

            setSuccess("Order created successfully!");
            setIsLoading(false);
            
            // Refresh orders list
            await getAllOrders();
        } catch (error) {
            console.log(error);
            setIsLoading(false);
            const errorMessage = error.message || "Failed to create order";
            setError(errorMessage);
            throw error;
        }
    }

    const cancelOrder = async (orderId) => {
        try {
            if (!ethereum) return alert("Please install wallet software");

            setIsLoading(true);
            setError(null);
            setSuccess(null);

            const fuelSettlementContract = getFuelSettlementContract();
            
            const transaction = await fuelSettlementContract.cancelOrder(orderId);

            console.log('Loading -', transaction.hash);
            await transaction.wait();
            console.log('Success -', transaction.hash);

            setSuccess("Order cancelled successfully!");
            setIsLoading(false);
            
            // Refresh orders list
            await getAllOrders();
        } catch (error) {
            console.log(error);
            setIsLoading(false);
            const errorMessage = error.message || "Failed to cancel order";
            setError(errorMessage);
            throw error;
        }
    }

    const confirmDelivery = async (orderId) => {
        try {
            if (!ethereum) return alert("Please install wallet software");

            setIsLoading(true);
            setError(null);
            setSuccess(null);

            const fuelSettlementContract = getFuelSettlementContract();
            
            const transaction = await fuelSettlementContract.confirmDelivery(orderId);

            console.log('Loading -', transaction.hash);
            await transaction.wait();
            console.log('Success -', transaction.hash);

            setSuccess("Delivery confirmed and payment settled!");
            setIsLoading(false);
            
            // Refresh orders list
            await getAllOrders();
        } catch (error) {
            console.log(error);
            setIsLoading(false);
            const errorMessage = error.message || "Failed to confirm delivery";
            setError(errorMessage);
            throw error;
        }
    }

    const declineOrder = async (orderId) => {
        try {
            if (!ethereum) return alert("Please install wallet software");

            setIsLoading(true);
            setError(null);
            setSuccess(null);

            const fuelSettlementContract = getFuelSettlementContract();
            
            const transaction = await fuelSettlementContract.declineOrder(orderId);

            console.log('Loading -', transaction.hash);
            await transaction.wait();
            console.log('Success -', transaction.hash);

            setSuccess("Order declined, funds refunded to airline!");
            setIsLoading(false);
            
            // Refresh orders list
            await getAllOrders();
        } catch (error) {
            console.log(error);
            setIsLoading(false);
            const errorMessage = error.message || "Failed to decline order";
            setError(errorMessage);
            throw error;
        }
    }

    useEffect(() => {
        checkIfWalletIsConnected();
    }, []);

    // Listen for account changes
    useEffect(() => {
        if (ethereum) {
            ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length > 0) {
                    setCurrentAccount(accounts[0]);
                    getAllOrders();
                } else {
                    setCurrentAccount("");
                    setOrders([]);
                }
            });
        }

        return () => {
            if (ethereum) {
                ethereum.removeListener('accountsChanged', () => {});
            }
        };
    }, []);

    return (
        <FuelSettlementContext.Provider value={{
            currentAccount,
            connectWallet,
            orders,
            getAllOrders,
            createFuelOrder,
            cancelOrder,
            confirmDelivery,
            declineOrder,
            isLoading,
            error,
            success,
            setError,
            setSuccess
        }}>
            {children}
        </FuelSettlementContext.Provider>
    );
}

