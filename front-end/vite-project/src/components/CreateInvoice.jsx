import React, { useContext, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { FuelSettlementContext } from '../context/FuelSettlementContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { DatePicker } from './ui/date-picker';
import { Loader } from './';
import { 
    VUELING_INFO, 
    DEMO_SUPPLIER_INFO, 
    DEFAULT_INVOICE_SETTINGS,
    generateInvoiceNumber,
    calculateEURValues,
    generateInvoicePDF 
} from '../utils/invoiceGenerator';

const CreateInvoice = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { orders, currentAccount, connectWallet, isLoading: contextLoading } = useContext(FuelSettlementContext);
    
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);
    
    // Find the order
    const order = orders.find(o => o.orderId === parseInt(orderId));
    
    // Form state - pre-filled with demo supplier data
    // ✅ Good: invoice number set in initial state since orderId is available from URL params
    const [formData, setFormData] = useState({
        // Exchange rate
        exchangeRate: DEFAULT_INVOICE_SETTINGS.exchangeRate,
        
        // Supplier information (pre-filled with demo data)
        ...DEMO_SUPPLIER_INFO,
        
        // Invoice metadata
        invoiceNumber: generateInvoiceNumber(orderId),
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        
        // Description
        description: DEFAULT_INVOICE_SETTINGS.description
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (field, date) => {
        setFormData(prev => ({ ...prev, [field]: date }));
    };

    const getEURValues = () => {
        return calculateEURValues(order, formData.exchangeRate);
    };

    const validateForm = () => {
        const required = ['supplierName', 'supplierTaxId', 'supplierAddress', 'supplierCity', 'supplierPostalCode', 'supplierCountry'];
        for (const field of required) {
            if (!formData[field].trim()) {
                return `Please fill in the supplier ${field.replace('supplier', '').toLowerCase()}`;
            }
        }
        if (!formData.exchangeRate || parseFloat(formData.exchangeRate) <= 0) {
            return 'Please enter a valid exchange rate';
        }
        return null;
    };

    const generatePDF = () => {
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsGenerating(true);
        setError(null);

        // Format dates as strings for PDF generation
        const pdfFormData = {
            ...formData,
            issueDate: formData.issueDate ? format(formData.issueDate, 'dd/MM/yyyy') : '',
            dueDate: formData.dueDate ? format(formData.dueDate, 'dd/MM/yyyy') : ''
        };

        const success = generateInvoicePDF(order, pdfFormData);
        
        if (success) {
            setIsGenerating(false);
        } else {
            setError('Failed to generate PDF. Please try again.');
            setIsGenerating(false);
        }
    };

    if (!currentAccount) {
        return (
            <div className="flex w-full justify-center items-center flex-1">
                <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto px-4 py-12">
                    <h1 className="text-3xl sm:text-4xl text-black py-1 text-center font-semibold">
                        Create Invoice
                    </h1>
                    <p className="text-center mt-4 text-black font-normal text-base opacity-70">
                        Generate an invoice for your fuel order
                    </p>
                    <div className="p-6 w-full flex flex-col justify-start items-center blue-glassmorphism mt-8">
                        <p className="text-black text-base mb-4 text-center">Connect your wallet to continue</p>
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

    if (contextLoading && orders.length === 0) {
        return (
            <div className="flex w-full justify-center items-center flex-1">
                <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto px-4 py-12">
                    <h1 className="text-3xl sm:text-4xl text-black py-1 text-center font-semibold">
                        Create Invoice
                    </h1>
                    <p className="text-center mt-4 text-black font-normal text-base opacity-70">
                        Loading order data...
                    </p>
                    <div className="mt-8">
                        <Loader />
                    </div>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex w-full justify-center items-center flex-1">
                <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto px-4 py-12">
                    <h1 className="text-3xl sm:text-4xl text-black py-1 text-center font-semibold">
                        Order Not Found
                    </h1>
                    <p className="text-center mt-4 text-black font-normal text-base opacity-70">
                        The order #{parseInt(orderId) + 1} could not be found.
                    </p>
                    <Button 
                        onClick={() => navigate('/')}
                        className="text-black mt-8 border-[1px] p-2 px-6 border-[#FCCC04] bg-[#FCCC04] hover:bg-[#e6b800] rounded-full cursor-pointer font-semibold vueling-lowercase"
                    >
                        back to orders
                    </Button>
                </div>
            </div>
        );
    }

    // Check if order is eligible for invoicing (Delivered or Settled)
    if (order.status !== 1 && order.status !== 2) {
        return (
            <div className="flex w-full justify-center items-center flex-1">
                <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto px-4 py-12">
                    <h1 className="text-3xl sm:text-4xl text-black py-1 text-center font-semibold">
                        Invoice Not Available
                    </h1>
                    <p className="text-center mt-4 text-black font-normal text-base opacity-70">
                        Invoices can only be generated for delivered or settled orders.
                    </p>
                    <Button 
                        onClick={() => navigate('/')}
                        className="text-black mt-8 border-[1px] p-2 px-6 border-[#FCCC04] bg-[#FCCC04] hover:bg-[#e6b800] rounded-full cursor-pointer font-semibold vueling-lowercase"
                    >
                        back to orders
                    </Button>
                </div>
            </div>
        );
    }

    const { pricePerLitreEUR, totalAmountEUR } = getEURValues();

    return (
        <div className="flex w-full justify-center items-start flex-1">
            <div className="flex flex-col w-full max-w-[1600px] mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Button
                        onClick={() => navigate('/')}
                        className="text-black p-2 h-auto border border-[#4C4C4B]/30 hover:bg-[#4C4C4B]/10 rounded-lg cursor-pointer bg-transparent"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl text-black font-semibold">
                            Create Invoice
                        </h1>
                        <p className="text-black/60 text-sm mt-1">Order #{order.orderId + 1}</p>
                    </div>
                </div>

                {error && (
                    <Alert variant="destructive" className="mb-6 bg-red-500/20 border-red-500">
                        <AlertDescription className="text-red-600">{error}</AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Left Column - Order Details & Exchange Rate */}
                    <div className="space-y-6">
                        {/* Order Summary */}
                        <div className="blue-glassmorphism p-6 rounded-2xl">
                            <h2 className="text-lg font-semibold text-black mb-4">Order Summary</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/30 rounded-xl p-4">
                                    <p className="text-black/60 text-sm mb-1">Quantity</p>
                                    <p className="text-xl font-semibold text-black">{order.quantityLitres} <span className="text-sm font-normal">Litres</span></p>
                                </div>
                                <div className="bg-white/30 rounded-xl p-4">
                                    <p className="text-black/60 text-sm mb-1">Price per Litre</p>
                                    <p className="text-xl font-semibold text-black">{order.pricePerLitre} <span className="text-sm font-normal">CAM</span></p>
                                </div>
                                <div className="col-span-2 bg-white/30 rounded-xl p-4">
                                    <p className="text-black/60 text-sm mb-1">Total Amount</p>
                                    <p className="text-2xl font-semibold text-black">{order.totalAmount} <span className="text-base font-normal">CAM</span></p>
                                </div>
                            </div>
                        </div>

                        {/* Exchange Rate */}
                        <div className="blue-glassmorphism p-6 rounded-2xl">
                            <h2 className="text-lg font-semibold text-black mb-4">Currency Conversion</h2>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="exchangeRate" className="text-black">Exchange Rate (1 CAM = X EUR)</Label>
                                    <Input
                                        id="exchangeRate"
                                        name="exchangeRate"
                                        type="number"
                                        step="0.0001"
                                        min="0"
                                        value={formData.exchangeRate}
                                        onChange={handleInputChange}
                                        className="mt-1 bg-white/50 border-gray-300 text-black"
                                        placeholder="1.00"
                                    />
                                </div>
                                <div className="bg-[#FCCC04]/20 rounded-xl p-4">
                                    <p className="text-black/60 text-sm mb-2">Converted Values (EUR)</p>
                                    <div className="flex justify-between">
                                        <span className="text-black">Price per Litre:</span>
                                        <span className="font-semibold text-black">€{pricePerLitreEUR}</span>
                                    </div>
                                    <div className="flex justify-between mt-1">
                                        <span className="text-black">Total Amount:</span>
                                        <span className="font-semibold text-black text-lg">€{totalAmountEUR}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Invoice Metadata */}
                        <div className="blue-glassmorphism p-6 rounded-2xl">
                            <h2 className="text-lg font-semibold text-black mb-4">Invoice Details</h2>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="invoiceNumber" className="text-black">Invoice Number</Label>
                                    <Input
                                        id="invoiceNumber"
                                        name="invoiceNumber"
                                        value={formData.invoiceNumber}
                                        onChange={handleInputChange}
                                        className="mt-1 bg-white/50 border-gray-300 text-black"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="issueDate" className="text-black">Issue Date</Label>
                                        <div className="mt-1">
                                            <DatePicker
                                                date={formData.issueDate}
                                                onDateChange={(date) => handleDateChange('issueDate', date)}
                                                placeholder="Select issue date"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="dueDate" className="text-black">Due Date</Label>
                                        <div className="mt-1">
                                            <DatePicker
                                                date={formData.dueDate}
                                                onDateChange={(date) => handleDateChange('dueDate', date)}
                                                placeholder="Select due date"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="description" className="text-black">Product/Service Description</Label>
                                    <Input
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className="mt-1 bg-white/50 border-gray-300 text-black"
                                        placeholder="Aviation Fuel (Jet A-1)"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Buyer & Supplier Info */}
                    <div className="space-y-6">
                        {/* Buyer (Vueling) - Read Only */}
                        <div className="blue-glassmorphism p-6 rounded-2xl">
                            <h2 className="text-lg font-semibold text-black mb-4">Buyer Information</h2>
                            <div className="bg-white/30 rounded-xl p-4">
                                <p className="font-semibold text-black">{VUELING_INFO.companyName}</p>
                                <p className="text-black/80 text-sm mt-1">CIF: {VUELING_INFO.taxId}</p>
                                <p className="text-black/80 text-sm mt-2">{VUELING_INFO.address}</p>
                                <p className="text-black/80 text-sm">{VUELING_INFO.addressLine2}</p>
                                <p className="text-black/80 text-sm">{VUELING_INFO.postalCode} {VUELING_INFO.city}</p>
                                <p className="text-black/80 text-sm">{VUELING_INFO.province}, {VUELING_INFO.country}</p>
                            </div>
                            <p className="text-black/50 text-xs mt-2">* Buyer information is pre-filled and cannot be modified</p>
                        </div>

                        {/* Supplier Information - Editable */}
                        <div className="blue-glassmorphism p-6 rounded-2xl">
                            <h2 className="text-lg font-semibold text-black mb-4">Supplier Information</h2>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="supplierName" className="text-black">Company Name *</Label>
                                    <Input
                                        id="supplierName"
                                        name="supplierName"
                                        value={formData.supplierName}
                                        onChange={handleInputChange}
                                        className="mt-1 bg-white/50 border-gray-300 text-black"
                                        placeholder="Fuel Supplier S.L."
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="supplierTaxId" className="text-black">Tax ID (CIF/NIF/VAT) *</Label>
                                    <Input
                                        id="supplierTaxId"
                                        name="supplierTaxId"
                                        value={formData.supplierTaxId}
                                        onChange={handleInputChange}
                                        className="mt-1 bg-white/50 border-gray-300 text-black"
                                        placeholder="B-12345678"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="supplierAddress" className="text-black">Address *</Label>
                                    <Input
                                        id="supplierAddress"
                                        name="supplierAddress"
                                        value={formData.supplierAddress}
                                        onChange={handleInputChange}
                                        className="mt-1 bg-white/50 border-gray-300 text-black"
                                        placeholder="Street name and number"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="supplierPostalCode" className="text-black">Postal Code *</Label>
                                        <Input
                                            id="supplierPostalCode"
                                            name="supplierPostalCode"
                                            value={formData.supplierPostalCode}
                                            onChange={handleInputChange}
                                            className="mt-1 bg-white/50 border-gray-300 text-black"
                                            placeholder="08001"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="supplierCity" className="text-black">City *</Label>
                                        <Input
                                            id="supplierCity"
                                            name="supplierCity"
                                            value={formData.supplierCity}
                                            onChange={handleInputChange}
                                            className="mt-1 bg-white/50 border-gray-300 text-black"
                                            placeholder="Barcelona"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="supplierCountry" className="text-black">Country *</Label>
                                    <Input
                                        id="supplierCountry"
                                        name="supplierCountry"
                                        value={formData.supplierCountry}
                                        onChange={handleInputChange}
                                        className="mt-1 bg-white/50 border-gray-300 text-black"
                                        placeholder="Spain"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="supplierEmail" className="text-black">Email</Label>
                                    <Input
                                        id="supplierEmail"
                                        name="supplierEmail"
                                        type="email"
                                        value={formData.supplierEmail}
                                        onChange={handleInputChange}
                                        className="mt-1 bg-white/50 border-gray-300 text-black"
                                        placeholder="billing@supplier.com"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="supplierPhone" className="text-black">Phone</Label>
                                    <Input
                                        id="supplierPhone"
                                        name="supplierPhone"
                                        type="tel"
                                        value={formData.supplierPhone}
                                        onChange={handleInputChange}
                                        className="mt-1 bg-white/50 border-gray-300 text-black"
                                        placeholder="+34 900 000 000"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Generate Button */}
                        <Button
                            onClick={generatePDF}
                            disabled={isGenerating}
                            className="w-full text-black border-[1px] p-4 h-auto border-[#FCCC04] bg-[#FCCC04] hover:bg-[#e6b800] rounded-xl cursor-pointer font-semibold vueling-lowercase flex items-center justify-center gap-2 text-lg"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader />
                                    generating...
                                </>
                            ) : (
                                <>
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    generate invoice
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateInvoice;


