import jsPDF from 'jspdf'
import 'jspdf-autotable'
import QRCode from 'qrcode'

// Helper function to convert number to words (Indian format)
function numberToWordsINR(num) {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  
  if (num === 0) return 'Zero'
  
  let words = ''
  const crore = Math.floor(num / 10000000)
  const lakh = Math.floor((num % 10000000) / 100000)
  const thousand = Math.floor((num % 100000) / 1000)
  const hundred = Math.floor((num % 1000) / 100)
  const remainder = num % 100
  
  if (crore > 0) words += numberToWordsINR(crore) + ' Crore '
  if (lakh > 0) words += numberToWordsINR(lakh) + ' Lakh '
  if (thousand > 0) words += numberToWordsINR(thousand) + ' Thousand '
  if (hundred > 0) words += ones[hundred] + ' Hundred '
  
  if (remainder > 0) {
    if (remainder < 10) words += ones[remainder]
    else if (remainder < 20) words += teens[remainder - 10]
    else {
      words += tens[Math.floor(remainder / 10)]
      if (remainder % 10 > 0) words += ' ' + ones[remainder % 10]
    }
  }
  
  return words.trim()
}

/**
 * Generate JSW Dulux Style Tax Invoice for Kustom Koats
 * @param {Object} order - Order object with order_items
 * @param {string} siteUrl - Base URL of the website
 */
export async function generateJSWStyleInvoice(order, siteUrl = 'https://kustomkoats.in') {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 10
  
  // Parse address
  const addr = order.parsedAddress || {}
  const orderId = order.display_order_id || order.id?.toString().slice(-8).toUpperCase()
  const items = order.order_items || []
  
  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
  const gstRate = 0.18 // 18% GST
  const gstAmount = subtotal * gstRate
  const total = subtotal + gstAmount
  const roundingOff = Math.round(total) - total
  const finalTotal = Math.round(total)
  
  // Generate QR Code
  const invoiceQRData = `Invoice: ${orderId}\nDate: ${new Date(order.created_at).toLocaleDateString('en-IN')}\nAmount: ₹${finalTotal}`
  const qrCodeDataUrl = await QRCode.toDataURL(invoiceQRData, { width: 150, margin: 1 })
  
  // ========== PAGE 1 ==========
  
  // Company Header
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('KUSTOM KOATS ENTERPRISES (formerly Kumar Paints)', margin, margin + 4)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.text('S1/803, NEAR TOAD FARMS', margin, margin + 8)
  doc.text('KONDHWA BK - HAVELI', margin, margin + 11)
  doc.text('WAGHOLI, Pune', margin, margin + 14)
  doc.text('WAGHOLI, MAHARASHTRA 411207', margin, margin + 17)
  doc.text('Maharashtra', margin, margin + 20)
  doc.text('GSTIN No: 27BZAPK4893D1ZZT', margin, margin + 23)
  
  // Document identifiers
  doc.setFontSize(6)
  doc.text(`CIN: L24292WB1954PLC021516`, margin, margin + 27)
  doc.text(`PAN: AAACI4297A`, margin, margin + 30)
  doc.text(`IRN: [Generated IRN Hash]`, margin, margin + 33)
  
  // TAX INVOICE title
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('TAX INVOICE', pageWidth - margin - 45, margin + 8)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text('DUPLICATE FOR TRANSPORTER', pageWidth - margin - 45, margin + 12)
  
  // QR Code
  doc.addImage(qrCodeDataUrl, 'PNG', pageWidth - margin - 35, margin + 15, 30, 30)
  
  // Bill To and Invoice Details section
  const sectionY = margin + 48
  
  // Left box - Bill To
  doc.setDrawColor(0)
  doc.setLineWidth(0.1)
  doc.rect(margin, sectionY, (pageWidth - 2 * margin) / 2 - 1, 35)
  
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.text('Bill To:', margin + 2, sectionY + 4)
  doc.setFont('helvetica', 'normal')
  doc.text(addr.full_name || order.guest_name || 'Customer', margin + 2, sectionY + 8)
  doc.text(`${addr.address1 || addr.addressLine1 || ''}`, margin + 2, sectionY + 11)
  doc.text(`${addr.city || ''}, ${addr.state || ''}`, margin + 2, sectionY + 14)
  doc.text(`PIN: ${addr.pincode || addr.zipCode || ''}`, margin + 2, sectionY + 17)
  doc.text(`State Name/Code: 27 Maharashtra`, margin + 2, sectionY + 20)
  doc.text(`GSTIN No: ${addr.gstin || '27BZAPK4893D1ZZT'}`, margin + 2, sectionY + 23)
  
  // Right box - Invoice Details
  doc.rect((pageWidth / 2) + 1, sectionY, (pageWidth - 2 * margin) / 2 - 1, 35)
  
  doc.setFont('helvetica', 'bold')
  doc.text('Invoice No:', (pageWidth / 2) + 3, sectionY + 4)
  doc.setFont('helvetica', 'normal')
  doc.text(`${orderId} / ${new Date(order.created_at).toLocaleDateString('en-IN')} / 03.06.2026`, (pageWidth / 2) + 20, sectionY + 4)
  
  doc.setFont('helvetica', 'bold')
  doc.text('Delivery No:', (pageWidth / 2) + 3, sectionY + 8)
  doc.setFont('helvetica', 'normal')
  doc.text(`9107138919 / ${new Date(order.created_at).toLocaleDateString('en-IN')}`, (pageWidth / 2) + 20, sectionY + 8)
  
  doc.setFont('helvetica', 'bold')
  doc.text('PO Number:', (pageWidth / 2) + 3, sectionY + 12)
  doc.setFont('helvetica', 'normal')
  doc.text(`ORDER BY MAIL ${new Date(order.created_at).toLocaleDateString('en-IN')}`, (pageWidth / 2) + 20, sectionY + 12)
  
  doc.setFont('helvetica', 'bold')
  doc.text('Place of Supply/Delivery', (pageWidth / 2) + 3, sectionY + 16)
  doc.setFont('helvetica', 'normal')
  doc.text('Consignee: 3307620', (pageWidth / 2) + 3, sectionY + 20)
  doc.text(addr.full_name || order.guest_name || 'Customer', (pageWidth / 2) + 3, sectionY + 23)
  doc.text(`${addr.city || ''}, ${addr.state || ''}`, (pageWidth / 2) + 3, sectionY + 26)
  doc.text(`GSTIN No: ${addr.gstin || '27BZAPK4893D1ZZT'}`, (pageWidth / 2) + 3, sectionY + 29)
  
  // Product Details Table
  const tableStartY = sectionY + 38
  
  const tableColumns = [
    { header: 'Product Code\nDescription of Goods', dataKey: 'product' },
    { header: 'HSN Code', dataKey: 'hsn' },
    { header: 'Pack L/KG', dataKey: 'pack' },
    { header: 'QTY PC/P/KG', dataKey: 'qty_pc' },
    { header: 'Total QTY L/KG', dataKey: 'qty_total' },
    { header: 'Rate per unit INR', dataKey: 'rate' },
    { header: 'Gross Value INR', dataKey: 'gross' },
    { header: 'Other Disc. INR', dataKey: 'disc_other' },
    { header: 'Cash Disc. INR', dataKey: 'disc_cash' },
    { header: 'Value before Tax INR', dataKey: 'taxable' },
    { header: 'CGST/IGST Rate %', dataKey: 'cgst_rate' },
    { header: 'CGST/IGST Amt INR', dataKey: 'cgst_amt' },
    { header: 'SGST/UTGST Rate %', dataKey: 'sgst_rate' },
    { header: 'SGST/UTGST Amt INR', dataKey: 'sgst_amt' },
    { header: 'K.P. CESS Amount INR', dataKey: 'cess' },
    { header: 'Total Value INR', dataKey: 'total' }
  ]
  
  const tableData = items.map((item, idx) => {
    const itemPrice = item.price || 0
    const itemQty = item.quantity || 1
    const itemGross = itemPrice * itemQty
    const itemCGST = itemGross * (gstRate / 2)
    const itemSGST = itemGross * (gstRate / 2)
    const itemTotal = itemGross + itemCGST + itemSGST
    
    return {
      product: `${item.products?.custom_id || 'N' + (idx + 1)}\n${item.products?.name || 'Product'}`,
      hsn: item.products?.hsn_code || '32089090',
      pack: '1.000',
      qty_pc: itemQty.toString(),
      qty_total: itemQty.toString(),
      rate: itemPrice.toFixed(2),
      gross: itemGross.toFixed(2),
      disc_other: '0.00',
      disc_cash: '0.00',
      taxable: itemGross.toFixed(2),
      cgst_rate: '9.00%',
      cgst_amt: itemCGST.toFixed(2),
      sgst_rate: '9.00%',
      sgst_amt: itemSGST.toFixed(2),
      cess: '0.00',
      total: itemTotal.toFixed(2)
    }
  })
  
  doc.autoTable({
    startY: tableStartY,
    head: [tableColumns.map(col => col.header)],
    body: tableData.map(row => tableColumns.map(col => row[col.dataKey])),
    theme: 'grid',
    styles: {
      fontSize: 5.5,
      cellPadding: 0.8,
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
      textColor: [0, 0, 0]
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      lineWidth: 0.1
    },
    columnStyles: {
      0: { cellWidth: 25, fontSize: 5 },
      1: { cellWidth: 12, halign: 'center' },
      2: { cellWidth: 10, halign: 'right' },
      3: { cellWidth: 8, halign: 'right' },
      4: { cellWidth: 10, halign: 'right' },
      5: { cellWidth: 12, halign: 'right' },
      6: { cellWidth: 13, halign: 'right' },
      7: { cellWidth: 11, halign: 'right' },
      8: { cellWidth: 11, halign: 'right' },
      9: { cellWidth: 15, halign: 'right' },
      10: { cellWidth: 10, halign: 'center' },
      11: { cellWidth: 12, halign: 'right' },
      12: { cellWidth: 10, halign: 'center' },
      13: { cellWidth: 12, halign: 'right' },
      14: { cellWidth: 10, halign: 'right' },
      15: { cellWidth: 12, halign: 'right', fontStyle: 'bold' }
    },
    margin: { left: margin, right: margin },
    tableWidth: 'auto',
    didDrawPage: (data) => {
      // Page 1 of 2
      doc.setFontSize(6)
      doc.text('Page 1 of 2', pageWidth / 2, pageHeight - 5, { align: 'center' })
    }
  })
  
  // ========== PAGE 2 ==========
  doc.addPage()
  
  // Repeat header on page 2
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('KUSTOM KOATS ENTERPRISES', margin, margin + 4)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.text('TAX INVOICE', pageWidth - margin - 30, margin + 4)
  doc.text(`Invoice No: ${orderId}`, margin, margin + 8)
  doc.text(`Date: ${new Date(order.created_at).toLocaleDateString('en-IN')}`, margin, margin + 11)
  
  // HSN-wise Tax Summary
  let page2Y = margin + 18
  
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.text('HSN-wise Summary', margin, page2Y)
  page2Y += 3
  
  // Group items by HSN
  const hsnGroups = {}
  items.forEach(item => {
    const hsn = item.products?.hsn_code || '32089090'
    if (!hsnGroups[hsn]) {
      hsnGroups[hsn] = {
        hsn,
        quantity: 0,
        taxable: 0,
        cgst: 0,
        sgst: 0,
        total: 0
      }
    }
    const itemGross = (item.price || 0) * (item.quantity || 1)
    hsnGroups[hsn].quantity += item.quantity || 1
    hsnGroups[hsn].taxable += itemGross
    hsnGroups[hsn].cgst += itemGross * (gstRate / 2)
    hsnGroups[hsn].sgst += itemGross * (gstRate / 2)
    hsnGroups[hsn].total += itemGross + (itemGross * gstRate)
  })
  
  const hsnSummaryData = Object.values(hsnGroups).map(group => [
    group.hsn,
    group.quantity.toString(),
    group.taxable.toFixed(2),
    '9.00%',
    group.cgst.toFixed(2),
    '9.00%',
    group.sgst.toFixed(2),
    '0.00',
    group.total.toFixed(2)
  ])
  
  // Add totals row
  const totalRow = [
    'Total',
    items.reduce((sum, item) => sum + (item.quantity || 1), 0).toString(),
    subtotal.toFixed(2),
    '',
    (gstAmount / 2).toFixed(2),
    '',
    (gstAmount / 2).toFixed(2),
    '0.00',
    (subtotal + gstAmount).toFixed(2)
  ]
  hsnSummaryData.push(totalRow)
  
  doc.autoTable({
    startY: page2Y,
    head: [['HSN\nCode', 'Quantity', 'Taxable\nAmount INR', 'CGST\nRate %', 'CGST Amt\nINR', 'SGST\nRate %', 'SGST Amt\nINR', 'TCG Base\nAmount', 'Total\nAmount INR']],
    body: hsnSummaryData,
    theme: 'grid',
    styles: {
      fontSize: 6,
      cellPadding: 1,
      lineColor: [0, 0, 0],
      lineWidth: 0.1
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 15, halign: 'right' },
      2: { cellWidth: 20, halign: 'right' },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 18, halign: 'right' },
      5: { cellWidth: 15, halign: 'center' },
      6: { cellWidth: 18, halign: 'right' },
      7: { cellWidth: 18, halign: 'right' },
      8: { cellWidth: 20, halign: 'right', fontStyle: 'bold' }
    },
    margin: { left: margin, right: margin }
  })
  
  page2Y = doc.lastAutoTable.finalY + 6
  
  // Transport and Package Information
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.text('Transport Details', margin, page2Y)
  page2Y += 4
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6)
  doc.text(`Transporter: ${order.tracking_id || '260736'}`, margin, page2Y)
  doc.text(`Lorry No: `, margin, page2Y + 3)
  doc.text(`Cartons: 1`, margin + 60, page2Y)
  doc.text(`Total Weight (KG): ${(items.length * 8.288).toFixed(3)}`, margin + 60, page2Y + 3)
  doc.text(`Total Quantity: ${items.reduce((sum, item) => sum + (item.quantity || 1), 0)}.000 LT / 0.000 KG / 0 PC`, margin + 60, page2Y + 6)
  
  page2Y += 12
  
  // Invoice Summary (Right side)
  const summaryX = pageWidth - margin - 60
  let summaryY = doc.lastAutoTable.finalY + 6
  
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.text('Invoice Summary', summaryX, summaryY)
  summaryY += 4
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6)
  doc.text('Total Material Value:', summaryX, summaryY)
  doc.text(subtotal.toFixed(2), summaryX + 40, summaryY, { align: 'right' })
  summaryY += 3
  
  doc.text('Other Discounts:', summaryX, summaryY)
  doc.text('0.00', summaryX + 40, summaryY, { align: 'right' })
  summaryY += 3
  
  doc.text('Cash Discount @ 0.00 %:', summaryX, summaryY)
  doc.text('0.00', summaryX + 40, summaryY, { align: 'right' })
  summaryY += 3
  
  doc.text('Taxable Value / Value before TAX:', summaryX, summaryY)
  doc.text(subtotal.toFixed(2), summaryX + 40, summaryY, { align: 'right' })
  summaryY += 3
  
  doc.text('Central GST @ 9.00 %:', summaryX, summaryY)
  doc.text((gstAmount / 2).toFixed(2), summaryX + 40, summaryY, { align: 'right' })
  summaryY += 3
  
  doc.text('State GST @ 9.00 %:', summaryX, summaryY)
  doc.text((gstAmount / 2).toFixed(2), summaryX + 40, summaryY, { align: 'right' })
  summaryY += 3
  
  doc.text('Rounding Off:', summaryX, summaryY)
  doc.text(roundingOff.toFixed(2), summaryX + 40, summaryY, { align: 'right' })
  summaryY += 4
  
  doc.setFont('helvetica', 'bold')
  doc.text('Total:', summaryX, summaryY)
  doc.text(finalTotal.toFixed(2), summaryX + 40, summaryY, { align: 'right' })
  
  // Amount in Words
  page2Y += 20
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.text('As per agreed terms please pay INR 16851:', margin, page2Y)
  page2Y += 4
  
  const amountWords = numberToWordsINR(finalTotal)
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(6)
  doc.text(`RUPEES : ${amountWords.toUpperCase()} ONLY`, margin, page2Y)
  
  page2Y += 6
  
  // Declaration and Signature
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6)
  doc.rect(margin, page2Y, 80, 20)
  doc.text('The total quantity as detailed in this invoice', margin + 2, page2Y + 3)
  doc.text('has been received in sound condition', margin + 2, page2Y + 6)
  
  doc.text('Signature', margin + 2, page2Y + 16)
  doc.text('Name of the Signatory    For JSW Dulux Limited', margin + 20, page2Y + 16)
  doc.text('Designation / Status', margin + 2, page2Y + 19)
  doc.text('Place', margin + 50, page2Y + 19)
  doc.text('Date         E & O E', margin + 70, page2Y + 19)
  
  // Dealer Details
  doc.rect(summaryX - 5, page2Y, 60, 20)
  doc.text("Dealer's Name, Signature and Date of Receipt", summaryX - 3, page2Y + 3)
  
  // Company Registration
  page2Y += 24
  doc.setFontSize(5.5)
  doc.text('REGISTERED OFFICE: KUSTOM KOATS ENTERPRISES, S1/803, Kondhwa, Pune, Maharashtra - 411048', margin, page2Y)
  doc.text('CIN No: +91 9222777925, Fax: +91 33 22217925; Website: www.kustomkoats.in', margin, page2Y + 3)
  
  // Order Details
  doc.setFontSize(6)
  doc.text(`Order No.`, margin, page2Y + 8)
  doc.text(`Order Date`, margin + 30, page2Y + 8)
  doc.text(`Order_Time`, margin + 60, page2Y + 8)
  doc.text(`Dispatch Date`, margin + 90, page2Y + 8)
  doc.text(`Dispatch Time`, margin + 130, page2Y + 8)
  doc.text(`${orderId}`, margin, page2Y + 11)
  doc.text(`${new Date(order.created_at).toLocaleDateString('en-IN')}`, margin + 30, page2Y + 11)
  doc.text(`18:01`, margin + 60, page2Y + 11)
  doc.text(`${new Date(order.created_at).toLocaleDateString('en-IN')}`, margin + 90, page2Y + 11)
  doc.text(`19:15`, margin + 130, page2Y + 11)
  
  // Page 2 of 2
  doc.setFontSize(6)
  doc.text('Page 2 of 2', pageWidth / 2, pageHeight - 5, { align: 'center' })
  
  // Save PDF
  const fileName = `TaxInvoice-${orderId}.pdf`
  doc.save(fileName)
  
  return fileName
}

/**
 * Print JSW Style Invoice
 */
export async function printJSWStyleInvoice(order, siteUrl = 'https://kustomkoats.in') {
  const doc = await generateJSWStyleInvoice(order, siteUrl)
  // Implementation similar to printBrandedInvoice
  return doc
}
