import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FuelSettlementContext } from '../context/FuelSettlementContext';
import { Loader } from './';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';

const CreateOrderForm = () => {
    const navigate = useNavigate();
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

    const [validationErrors, setValidationErrors] = useState({});

    // ✅ Good: calculated during rendering instead of useEffect + state
    const quantity = parseFloat(formData.quantityLitres) || 0;
    const price = parseFloat(formData.pricePerLitre) || 0;
    const totalCost = (quantity * price).toFixed(6);

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
                <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto px-4 py-12">
                    <h1 className="text-3xl sm:text-4xl text-black py-1 text-center font-semibold">
                        Create Order
                    </h1>
                    <p className="text-center mt-4 text-black font-normal text-base opacity-70">
                        Create a new fuel order for your airline
                    </p>
                    <div className="p-6 w-full flex flex-col justify-start items-center blue-glassmorphism mt-8">
                        <p className="text-black text-base mb-4 text-center">Connect your wallet to create a new fuel order</p>
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

    return (
        <div className="flex w-full justify-center items-start flex-1 min-h-full">
            <div className="flex flex-col lg:flex-row w-full max-w-6xl mx-auto px-4 py-8 gap-6">
                {/* Left Panel - Form Info */}
                <div className="lg:w-1/3 w-full">
                    <div className="sticky top-8">
                        <h1 className="text-2xl sm:text-3xl text-black font-semibold mb-2">
                            Create Order
                        </h1>
                        <p className="text-black font-normal text-sm opacity-70 mb-4">
                            Create a new fuel order for your airline
                        </p>

                        {/* Quick Info Card */}
                        <div className="blue-glassmorphism p-4 rounded-xl mb-4">
                            <h3 className="text-black font-semibold text-sm mb-3">Order Requirements</h3>
                            <ul className="space-y-2 text-sm text-black/70">
                                <li className="flex items-start gap-2">
                                    <svg className="w-4 h-4 mt-0.5 text-[#FCCC04]" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>Valid supplier wallet address</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <svg className="w-4 h-4 mt-0.5 text-[#FCCC04]" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>Fuel quantity in litres</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <svg className="w-4 h-4 mt-0.5 text-[#FCCC04]" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>Agreed price per litre in CAM</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <svg className="w-4 h-4 mt-0.5 text-[#FCCC04]" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>Sufficient CAM balance for payment</span>
                                </li>
                            </ul>
                        </div>

                        {/* View Orders Button */}
                        <Button 
                            onClick={() => navigate('/orders')}
                            className="text-black w-full border-[1px] p-3 border-[#4C4C4B]/30 hover:bg-[#4C4C4B]/10 rounded-xl cursor-pointer bg-transparent vueling-lowercase flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            view orders
                        </Button>
                    </div>
                </div>

                {/* Right Panel - Order Form */}
                <div className="lg:w-2/3 w-full">
                    <div className="blue-glassmorphism p-6 rounded-2xl">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-6 pb-4 border-b border-black/10">
                            <div>
                                <h2 className="text-2xl font-semibold text-black">New Fuel Order</h2>
                                <p className="text-black/60 text-sm mt-1">Fill in the order details below</p>
                            </div>
                            <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-[#FCCC04] text-black">
                                Draft
                            </span>
                        </div>

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

                        {/* Form Fields */}
                        <div className="space-y-4 mb-6">
                            {/* Supplier Address */}
                            <div className="bg-white/30 rounded-xl p-4">
                                <label className="text-black text-sm mb-2 block">Supplier Address</label>
                                <Input 
                                    placeholder="0x..." 
                                    name="supplierAddress" 
                                    type="text" 
                                    value={formData.supplierAddress}
                                    onChange={handleInputChange}
                                    step={undefined}
                                    className="bg-white/50 text-black border-2 border-black placeholder:text-black/40 focus-visible:ring-[#FCCC04] rounded-lg"
                                />
                                {validationErrors.supplierAddress && (
                                    <p className="text-sm text-red-500 mt-1">{validationErrors.supplierAddress}</p>
                                )}
                            </div>

                            {/* Quantity and Price Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-white/30 rounded-xl p-4">
                                    <label className="text-black text-sm mb-2 block">Quantity (Litres)</label>
                                    <Input 
                                        placeholder="Enter quantity" 
                                        name="quantityLitres" 
                                        type="number" 
                                        value={formData.quantityLitres}
                                        onChange={handleInputChange}
                                        step="1"
                                        min="1"
                                        className="bg-white/50 text-black border-2 border-black placeholder:text-black/40 focus-visible:ring-[#FCCC04] rounded-lg"
                                    />
                                    {validationErrors.quantityLitres && (
                                        <p className="text-sm text-red-500 mt-1">{validationErrors.quantityLitres}</p>
                                    )}
                                </div>

                                <div className="bg-white/30 rounded-xl p-4">
                                    <label className="text-black text-sm mb-2 block">Price per Litre (CAM)</label>
                                    <Input 
                                        placeholder="Enter price" 
                                        name="pricePerLitre" 
                                        type="number" 
                                        value={formData.pricePerLitre}
                                        onChange={handleInputChange}
                                        step="0.000001"
                                        min="0"
                                        className="bg-white/50 text-black border-2 border-black placeholder:text-black/40 focus-visible:ring-[#FCCC04] rounded-lg"
                                    />
                                    {validationErrors.pricePerLitre && (
                                        <p className="text-sm text-red-500 mt-1">{validationErrors.pricePerLitre}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        {(formData.quantityLitres || formData.pricePerLitre) && (
                            <div className="bg-white/30 rounded-xl p-4 mb-6">
                                <h3 className="text-black font-semibold text-sm mb-3">Order Summary</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-black/60 text-xs mb-1">Quantity</p>
                                        <p className="text-lg font-semibold text-black">{formData.quantityLitres || '0'} <span className="text-sm font-normal">L</span></p>
                                    </div>
                                    <div>
                                        <p className="text-black/60 text-xs mb-1">Price/Litre</p>
                                        <p className="text-lg font-semibold text-black">{formData.pricePerLitre || '0'} <span className="text-sm font-normal">CAM</span></p>
                                    </div>
                                    <div>
                                        <p className="text-black/60 text-xs mb-1">Total Cost</p>
                                        <p className="text-lg font-semibold text-[#FCCC04]">{totalCost} <span className="text-sm font-normal">CAM</span></p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="border-t border-black/10 pt-6">
                            {isLoading ? (
                                <div className="flex justify-center py-4">
                                    <Loader />
                                </div>
                            ) : (
                                <Button
                                    type="button"
                                    onClick={handleSubmit}
                                    className="text-black w-full border-[1px] p-3 h-auto border-[#FCCC04] bg-[#FCCC04] hover:bg-[#e6b800] rounded-xl cursor-pointer font-semibold vueling-lowercase flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    create order
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateOrderForm;

