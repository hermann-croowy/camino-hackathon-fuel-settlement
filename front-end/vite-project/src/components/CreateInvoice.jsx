import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FuelSettlementContext } from '../context/FuelSettlementContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Loader } from './';
import { jsPDF } from 'jspdf';

// Hardcoded Vueling (Airline/Buyer) information
const VUELING_INFO = {
    companyName: 'Vueling Airlines S.A.',
    taxId: 'B-63876841',
    address: 'Parque de Negocios Mas Blau II',
    addressLine2: 'Pla de l\'Estany, 5',
    postalCode: '08820',
    city: 'El Prat de Llobregat',
    province: 'Barcelona',
    country: 'Spain',
    email: 'facturacion@vueling.com',
    phone: '+34 931 518 158'
};

const CreateInvoice = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { orders, currentAccount, connectWallet, isLoading: contextLoading } = useContext(FuelSettlementContext);
    
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);
    
    // Find the order
    const order = orders.find(o => o.orderId === parseInt(orderId));
    
    // Form state
    const [formData, setFormData] = useState({
        // Exchange rate
        exchangeRate: '1.00',
        
        // Supplier information
        supplierName: '',
        supplierTaxId: '',
        supplierAddress: '',
        supplierCity: '',
        supplierPostalCode: '',
        supplierCountry: 'Spain',
        supplierEmail: '',
        supplierPhone: '',
        
        // Invoice metadata
        invoiceNumber: '',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        
        // Description
        description: 'Aviation Fuel (Jet A-1)'
    });

    // Generate invoice number on mount
    useEffect(() => {
        const timestamp = Date.now();
        const invoiceNum = `VLG-FUEL-${orderId}-${timestamp.toString().slice(-6)}`;
        setFormData(prev => ({ ...prev, invoiceNumber: invoiceNum }));
    }, [orderId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const calculateEURValues = () => {
        const rate = parseFloat(formData.exchangeRate) || 1;
        const pricePerLitreEUR = (parseFloat(order?.pricePerLitre || 0) * rate).toFixed(4);
        const totalAmountEUR = (parseFloat(order?.totalAmount || 0) * rate).toFixed(2);
        return { pricePerLitreEUR, totalAmountEUR };
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

        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 20;
            const contentWidth = pageWidth - (margin * 2);
            
            const { pricePerLitreEUR, totalAmountEUR } = calculateEURValues();

            // Colors
            const vuelingYellow = [252, 204, 4];
            const darkGray = [76, 76, 75];
            const black = [0, 0, 0];

            // Header with Vueling branding
            doc.setFillColor(...vuelingYellow);
            doc.rect(0, 0, pageWidth, 35, 'F');
            
            doc.setTextColor(...black);
            doc.setFontSize(28);
            doc.setFont('helvetica', 'bold');
            doc.text('INVOICE', margin, 24);
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`No: ${formData.invoiceNumber}`, pageWidth - margin, 15, { align: 'right' });
            doc.text(`Date: ${formData.issueDate}`, pageWidth - margin, 22, { align: 'right' });
            doc.text(`Due: ${formData.dueDate}`, pageWidth - margin, 29, { align: 'right' });

            let yPos = 50;

            // Two column layout for buyer and supplier
            const colWidth = (contentWidth - 10) / 2;

            // Buyer (Vueling) section
            doc.setFillColor(245, 245, 245);
            doc.rect(margin, yPos, colWidth, 55, 'F');
            
            doc.setTextColor(...darkGray);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text('BUYER', margin + 5, yPos + 8);
            
            doc.setTextColor(...black);
            doc.setFontSize(10);
            doc.text(VUELING_INFO.companyName, margin + 5, yPos + 18);
            
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.text(`CIF: ${VUELING_INFO.taxId}`, margin + 5, yPos + 25);
            doc.text(VUELING_INFO.address, margin + 5, yPos + 32);
            doc.text(VUELING_INFO.addressLine2, margin + 5, yPos + 38);
            doc.text(`${VUELING_INFO.postalCode} ${VUELING_INFO.city}`, margin + 5, yPos + 44);
            doc.text(`${VUELING_INFO.province}, ${VUELING_INFO.country}`, margin + 5, yPos + 50);

            // Supplier section
            const supplierX = margin + colWidth + 10;
            doc.setFillColor(245, 245, 245);
            doc.rect(supplierX, yPos, colWidth, 55, 'F');
            
            doc.setTextColor(...darkGray);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text('SUPPLIER', supplierX + 5, yPos + 8);
            
            doc.setTextColor(...black);
            doc.setFontSize(10);
            doc.text(formData.supplierName, supplierX + 5, yPos + 18);
            
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.text(`Tax ID: ${formData.supplierTaxId}`, supplierX + 5, yPos + 25);
            doc.text(formData.supplierAddress, supplierX + 5, yPos + 32);
            doc.text(`${formData.supplierPostalCode} ${formData.supplierCity}`, supplierX + 5, yPos + 38);
            doc.text(formData.supplierCountry, supplierX + 5, yPos + 44);
            if (formData.supplierEmail) {
                doc.text(formData.supplierEmail, supplierX + 5, yPos + 50);
            }

            yPos += 70;

            // Order reference
            doc.setFillColor(...vuelingYellow);
            doc.rect(margin, yPos, contentWidth, 8, 'F');
            doc.setTextColor(...black);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text(`Order Reference: #${order.orderId}`, margin + 5, yPos + 5.5);

            yPos += 15;

            // Table header
            doc.setFillColor(...darkGray);
            doc.rect(margin, yPos, contentWidth, 10, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            
            const col1 = margin + 5;
            const col2 = margin + 85;
            const col3 = margin + 115;
            const col4 = margin + 145;
            
            doc.text('DESCRIPTION', col1, yPos + 7);
            doc.text('QTY (L)', col2, yPos + 7);
            doc.text('UNIT PRICE', col3, yPos + 7);
            doc.text('TOTAL', col4, yPos + 7);

            yPos += 10;

            // Table row
            doc.setFillColor(255, 255, 255);
            doc.rect(margin, yPos, contentWidth, 12, 'F');
            doc.setDrawColor(220, 220, 220);
            doc.line(margin, yPos + 12, margin + contentWidth, yPos + 12);
            
            doc.setTextColor(...black);
            doc.setFont('helvetica', 'normal');
            doc.text(formData.description, col1, yPos + 8);
            doc.text(order.quantityLitres.toString(), col2, yPos + 8);
            doc.text(`€${pricePerLitreEUR}`, col3, yPos + 8);
            doc.text(`€${totalAmountEUR}`, col4, yPos + 8);

            yPos += 20;

            // Totals section
            const totalsX = margin + contentWidth - 70;
            
            doc.setFillColor(245, 245, 245);
            doc.rect(totalsX, yPos, 70, 30, 'F');
            
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.text('Subtotal:', totalsX + 5, yPos + 10);
            doc.text(`€${totalAmountEUR}`, totalsX + 65, yPos + 10, { align: 'right' });
            
            doc.text('VAT (0%):', totalsX + 5, yPos + 18);
            doc.text('€0.00', totalsX + 65, yPos + 18, { align: 'right' });
            
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.text('TOTAL:', totalsX + 5, yPos + 27);
            doc.text(`€${totalAmountEUR}`, totalsX + 65, yPos + 27, { align: 'right' });

            yPos += 45;

            // Exchange rate note
            doc.setFontSize(8);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(100, 100, 100);
            doc.text(`Exchange rate applied: 1 CAM = ${formData.exchangeRate} EUR`, margin, yPos);
            doc.text(`Original amount: ${order.totalAmount} CAM`, margin, yPos + 5);

            yPos += 20;

            // Payment terms
            doc.setFillColor(245, 245, 245);
            doc.rect(margin, yPos, contentWidth, 25, 'F');
            
            doc.setTextColor(...black);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text('Payment Terms', margin + 5, yPos + 8);
            
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.text('Payment is due within 30 days of invoice date.', margin + 5, yPos + 15);
            doc.text('Please reference the invoice number in your payment.', margin + 5, yPos + 21);

            // Footer
            const footerY = doc.internal.pageSize.getHeight() - 15;
            doc.setFillColor(...vuelingYellow);
            doc.rect(0, footerY - 5, pageWidth, 20, 'F');
            
            doc.setTextColor(...black);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text('Vueling Airlines S.A. | www.vueling.com', pageWidth / 2, footerY + 3, { align: 'center' });
            doc.text('This invoice was generated electronically and is valid without signature.', pageWidth / 2, footerY + 8, { align: 'center' });

            // Save the PDF
            doc.save(`Invoice_${formData.invoiceNumber}.pdf`);
            
            setIsGenerating(false);
        } catch (err) {
            console.error('Error generating PDF:', err);
            setError('Failed to generate PDF. Please try again.');
            setIsGenerating(false);
        }
    };

    if (!currentAccount) {
        return (
            <div className="flex w-full justify-center items-center flex-1 min-h-full">
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
            <div className="flex w-full justify-center items-center flex-1 min-h-full">
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
            <div className="flex w-full justify-center items-center flex-1 min-h-full">
                <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto px-4 py-12">
                    <h1 className="text-3xl sm:text-4xl text-black py-1 text-center font-semibold">
                        Order Not Found
                    </h1>
                    <p className="text-center mt-4 text-black font-normal text-base opacity-70">
                        The order #{orderId} could not be found.
                    </p>
                    <Button 
                        onClick={() => navigate('/orders')}
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
            <div className="flex w-full justify-center items-center flex-1 min-h-full">
                <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto px-4 py-12">
                    <h1 className="text-3xl sm:text-4xl text-black py-1 text-center font-semibold">
                        Invoice Not Available
                    </h1>
                    <p className="text-center mt-4 text-black font-normal text-base opacity-70">
                        Invoices can only be generated for delivered or settled orders.
                    </p>
                    <Button 
                        onClick={() => navigate('/orders')}
                        className="text-black mt-8 border-[1px] p-2 px-6 border-[#FCCC04] bg-[#FCCC04] hover:bg-[#e6b800] rounded-full cursor-pointer font-semibold vueling-lowercase"
                    >
                        back to orders
                    </Button>
                </div>
            </div>
        );
    }

    const { pricePerLitreEUR, totalAmountEUR } = calculateEURValues();

    return (
        <div className="flex w-full justify-center items-start flex-1 min-h-full">
            <div className="flex flex-col w-full max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Button
                        onClick={() => navigate('/orders')}
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
                        <p className="text-black/60 text-sm mt-1">Order #{order.orderId}</p>
                    </div>
                </div>

                {error && (
                    <Alert variant="destructive" className="mb-6 bg-red-500/20 border-red-500">
                        <AlertDescription className="text-red-600">{error}</AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                                        <Input
                                            id="issueDate"
                                            name="issueDate"
                                            type="date"
                                            value={formData.issueDate}
                                            onChange={handleInputChange}
                                            className="mt-1 bg-white/50 border-gray-300 text-black"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="dueDate" className="text-black">Due Date</Label>
                                        <Input
                                            id="dueDate"
                                            name="dueDate"
                                            type="date"
                                            value={formData.dueDate}
                                            onChange={handleInputChange}
                                            className="mt-1 bg-white/50 border-gray-300 text-black"
                                        />
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

