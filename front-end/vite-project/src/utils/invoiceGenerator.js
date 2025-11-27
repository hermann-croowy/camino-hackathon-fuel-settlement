import { jsPDF } from 'jspdf';

// Hardcoded Vueling (Airline/Buyer) information
export const VUELING_INFO = {
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

// Demo supplier data for quick invoice generation
export const DEMO_SUPPLIER_INFO = {
    supplierName: 'AeroFuel Services S.L.',
    supplierTaxId: 'B-98765432',
    supplierAddress: 'Polígono Industrial Aeroportuario, Nave 12',
    supplierCity: 'El Prat de Llobregat',
    supplierPostalCode: '08820',
    supplierCountry: 'Spain',
    supplierEmail: 'facturacion@aerofuel.es',
    supplierPhone: '+34 934 567 890'
};

// Default invoice settings
export const DEFAULT_INVOICE_SETTINGS = {
    exchangeRate: '0.85', // 1 CAM = 0.85 EUR
    description: 'Aviation Fuel (Jet A-1)',
};

/**
 * Generate invoice number based on order ID
 */
export const generateInvoiceNumber = (orderId) => {
    const timestamp = Date.now();
    return `VLG-FUEL-${orderId}-${timestamp.toString().slice(-6)}`;
};

/**
 * Calculate EUR values based on exchange rate
 */
export const calculateEURValues = (order, exchangeRate) => {
    const rate = parseFloat(exchangeRate) || 1;
    const pricePerLitreEUR = (parseFloat(order?.pricePerLitre || 0) * rate).toFixed(4);
    const totalAmountEUR = (parseFloat(order?.totalAmount || 0) * rate).toFixed(2);
    return { pricePerLitreEUR, totalAmountEUR };
};

/**
 * Generate PDF invoice
 * @param {Object} order - The order object
 * @param {Object} formData - Invoice form data (supplier info, exchange rate, etc.)
 * @returns {boolean} - Success status
 */
export const generateInvoicePDF = (order, formData) => {
    try {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        const contentWidth = pageWidth - (margin * 2);
        
        const { pricePerLitreEUR, totalAmountEUR } = calculateEURValues(order, formData.exchangeRate);

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
        doc.text(`Order Reference: #${order.orderId + 1}`, margin + 5, yPos + 5.5);

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
        
        return true;
    } catch (err) {
        console.error('Error generating PDF:', err);
        return false;
    }
};

/**
 * Generate a quick invoice with demo data
 * @param {Object} order - The order object
 * @returns {boolean} - Success status
 */
export const generateQuickInvoice = (order) => {
    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const formData = {
        ...DEMO_SUPPLIER_INFO,
        ...DEFAULT_INVOICE_SETTINGS,
        invoiceNumber: generateInvoiceNumber(order.orderId),
        issueDate: today,
        dueDate: dueDate,
    };
    
    return generateInvoicePDF(order, formData);
};

