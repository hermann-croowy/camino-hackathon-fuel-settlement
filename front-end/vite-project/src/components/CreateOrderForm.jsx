import React, { useContext, useState, useEffect } from 'react';
import { FuelSettlementContext } from '../context/FuelSettlementContext';
import { Loader } from './';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';

const CreateOrderForm = () => {
    const {
        currentAccount,
        connectWallet,
        createFuelOrder,
        isLoading,
        error,
        success,
        setError,
        setSuccess
    } = useContext(FuelSettlementContext);

    const [formData, setFormData] = useState({
        supplierAddress: '',
        quantityLitres: '',
        pricePerLitre: ''
    });

    const [totalCost, setTotalCost] = useState('0');
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        // Calculate total cost when quantity or price changes
        const quantity = parseFloat(formData.quantityLitres) || 0;
        const price = parseFloat(formData.pricePerLitre) || 0;
        const total = quantity * price;
        setTotalCost(total.toFixed(6));
    }, [formData.quantityLitres, formData.pricePerLitre]);

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

    const handleChange = (e, name) => {
        const value = e.target.value;
        setFormData((prev) => ({ ...prev, [name]: value }));
        
        // Clear validation error for this field
        if (validationErrors[name]) {
            setValidationErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        handleChange(e, name);
    };

    const validateForm = () => {
        const errors = {};

        // Validate supplier address
        if (!formData.supplierAddress) {
            errors.supplierAddress = 'Supplier address is required';
        } else if (!/^0x[a-fA-F0-9]{40}$/.test(formData.supplierAddress)) {
            errors.supplierAddress = 'Invalid Ethereum address format';
        }

        // Validate quantity
        if (!formData.quantityLitres) {
            errors.quantityLitres = 'Quantity is required';
        } else {
            const quantity = parseFloat(formData.quantityLitres);
            if (isNaN(quantity) || quantity <= 0) {
                errors.quantityLitres = 'Quantity must be a positive number';
            }
        }

        // Validate price
        if (!formData.pricePerLitre) {
            errors.pricePerLitre = 'Price per litre is required';
        } else {
            const price = parseFloat(formData.pricePerLitre);
            if (isNaN(price) || price <= 0) {
                errors.pricePerLitre = 'Price must be a positive number';
            }
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!currentAccount) {
            alert('Please connect your wallet first');
            return;
        }

        if (!validateForm()) {
            return;
        }

        try {
            await createFuelOrder(
                formData.supplierAddress,
                parseInt(formData.quantityLitres),
                formData.pricePerLitre
            );

            // Reset form on success
            setFormData({
                supplierAddress: '',
                quantityLitres: '',
                pricePerLitre: ''
            });
        } catch (err) {
            console.error('Error creating order:', err);
        }
    };

    if (!currentAccount) {
        return (
            <div className="flex w-full justify-center items-center flex-1 min-h-full">
                <div className="flex mf:flex-row flex-col items-start justify-between md:p-20 py-12 px-4 w-full">
                    <div className="flex flex-1 justify-start flex-col mf:mr-10">
                        <h1 className="text-3xl sm:text-5xl text-black py-1">
                            Create Fuel <br /> Order
                        </h1>
                        <p className="text-left mt-5 text-black font-normal md:w-9/12 w-11/12 text-base">
                            Create a new fuel order. Only the airline address can create orders.
                        </p>
                    </div>
                    <div className="flex flex-col flex-1 items-center justify-center w-full mf:mt-0 mt-10">
                        <div className="p-5 sm:w-96 w-full flex flex-col justify-start items-center blue-glassmorphism">
                            <p className="text-black text-base mb-4">Connect your wallet to create a new fuel order</p>
                            <Button 
                                onClick={connectWallet}
                                className="text-black w-full mt-2 border-[1px] p-2 border-[#FCCC04] bg-[#FCCC04] hover:bg-[#e6b800] rounded-full cursor-pointer font-semibold vueling-lowercase"
                            >
                                connect wallet
                            </Button>
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
                        Create Fuel <br /> Order
                    </h1>
                    <p className="text-left mt-5 text-black font-normal md:w-9/12 w-11/12 text-base">
                        Create a new fuel order. Only the airline address can create orders.
                    </p>
                </div>
                <div className="flex flex-col flex-1 items-center justify-center w-full mf:mt-0 mt-10">
                    <div className="p-5 sm:w-96 w-full flex flex-col justify-start items-center blue-glassmorphism">
                        {error && (
                            <Alert variant="destructive" className="w-full mb-4 bg-red-500/20 border-red-500">
                                <AlertDescription className="text-red-300">{error}</AlertDescription>
                            </Alert>
                        )}

                        {success && (
                            <Alert className="w-full mb-4 bg-green-500/20 border-green-500">
                                <AlertDescription className="text-green-300">{success}</AlertDescription>
                            </Alert>
                        )}

                        <Input 
                            placeholder="Supplier Address (0x...)" 
                            name="supplierAddress" 
                            type="text" 
                            value={formData.supplierAddress}
                            onChange={handleInputChange}
                            step={undefined}
                            className="my-2 bg-transparent text-black border-black border-opacity-20 placeholder:text-black placeholder:opacity-50 focus-visible:ring-[#FCCC04] white-glassmorphism"
                        />
                        {validationErrors.supplierAddress && (
                            <p className="text-sm text-red-400 w-full text-left px-2">{validationErrors.supplierAddress}</p>
                        )}

                        <Input 
                            placeholder="Quantity (Litres)" 
                            name="quantityLitres" 
                            type="number" 
                            value={formData.quantityLitres}
                            onChange={handleInputChange}
                            step="1"
                            min="1"
                            className="my-2 bg-transparent text-black border-black border-opacity-20 placeholder:text-black placeholder:opacity-50 focus-visible:ring-[#FCCC04] white-glassmorphism"
                        />
                        {validationErrors.quantityLitres && (
                            <p className="text-sm text-red-400 w-full text-left px-2">{validationErrors.quantityLitres}</p>
                        )}

                        <Input 
                            placeholder="Price Per Litre (CAM)" 
                            name="pricePerLitre" 
                            type="number" 
                            value={formData.pricePerLitre}
                            onChange={handleInputChange}
                            step="0.000001"
                            min="0"
                            className="my-2 bg-transparent text-black border-black border-opacity-20 placeholder:text-black placeholder:opacity-50 focus-visible:ring-[#FCCC04] white-glassmorphism"
                        />
                        {validationErrors.pricePerLitre && (
                            <p className="text-sm text-red-400 w-full text-left px-2">{validationErrors.pricePerLitre}</p>
                        )}

                        <div className="h-[1px] w-full bg-black opacity-20 my-2" />

                        {totalCost !== '0' && (
                            <div className="w-full mb-2 px-2">
                                <p className="text-black font-normal text-sm">Total Cost:</p>
                                <p className="text-black font-semibold text-lg">{totalCost} CAM</p>
                            </div>
                        )}

                        {isLoading ? ( 
                            <Loader />
                        ) : (
                            <Button
                                type="button"
                                onClick={handleSubmit}
                                className="text-black w-full mt-2 border-[1px] p-2 border-[#FCCC04] bg-[#FCCC04] hover:bg-[#e6b800] rounded-full cursor-pointer font-semibold vueling-lowercase"
                            >
                                create order
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateOrderForm;

