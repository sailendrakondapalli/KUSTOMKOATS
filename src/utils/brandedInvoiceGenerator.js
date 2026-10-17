import jsPDF from 'jspdf'
import 'jspdf-autotable'
import QRCode from 'qrcode'

/**
 * Generate Branded Invoice with KUSTOMKOATS Watermark and Product QR Codes
 * @param {Object} order - Order object with order_items
 * @param {string} siteUrl - Base URL of the website (e.g., 'https://kustomkoats.in')
 */
export async function generateBrandedInvoice(order, siteUrl = 'https://kustomkoats.in') {
  const doc = new jsPDF()
  const orderId = order.display_order_id || '#' + String(order.id).slice(-6).toUpperCase()
  const addr = order.parsedAddress || {}

  // --- WATERMARK: "KUSTOMKOATS" with low opacity ---
  doc.setTextColor(220, 220, 220) // Light gray
  doc.setFontSize(60)
  doc.setFont(undefined, 'bold')
  doc.saveGraphicsState()
  doc.setGState(new doc.GState({ opacity: 0.08 })) // Very low opacity
  
  // Rotate and position watermark in center
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  doc.text('KUSTOMKOATS', pageWidth / 2, pageHeight / 2, {
    align: 'center',
    angle: 45 // 45-degree diagonal
  })
  doc.restoreGraphicsState()

  // Reset text color for rest of document
  doc.setTextColor(0, 0, 0)

  // --- COMPANY HEADER ---
  doc.setFillColor(202, 42, 49) // KUSTOMKOATS brand color
  doc.rect(0, 0, 210, 35, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont(undefined, 'bold')
  doc.text('KUSTOM KOATS ENTERPRISES', 105, 15, { align: 'center' })
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  doc.text('Kumar Paints', 105, 21, { align: 'center' })
  doc.text('S1/803, Near Toad Farms, Kondhwa, Pune 411048, Maharashtra', 105, 26, { align: 'center' })
  doc.text('Contact No: 9960811119 | GST NO: 27BZAPK4893D1ZZT', 105, 31, { align: 'center' })

  // --- INVOICE TITLE ---
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(18)
  doc.setFont(undefined, 'bold')
  doc.text('TAX INVOICE', 105, 48, { align: 'center' })

  // --- INVOICE DETAILS (Left) ---
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  doc.text(`Invoice: ${orderId}`, 14, 60)
  doc.text(`Date: ${new Date(order.created_at).toLocaleDateString('en-IN')}`, 14, 66)
  doc.text(`Place of Service: Andhra Pradesh`, 14, 72)
  doc.text(`State Code: AP-37`, 14, 78)

  // --- CUSTOMER DETAILS (Right Box) ---
  doc.setFont(undefined, 'bold')
  doc.text('Customer Details:', 140, 60)
  doc.setFont(undefined, 'normal')
  doc.setFontSize(9)
  doc.text(`Address: ${addr.address1 || addr.addressLine1 || 'N/A'}`, 140, 66)
  doc.text(`${addr.city || 'N/A'}, ${addr.state || 'N/A'} - ${addr.pincode || addr.zipCode || 'N/A'}`, 140, 72)
  doc.text(`Contact No: ${addr.phone || order.guest_phone || 'N/A'}`, 140, 78)
  if (addr.email) {
    doc.text(`GST No: ${addr.gst || '-'}`, 140, 84)
  }

  // --- ITEMS TABLE WITH QR CODES ---
  const tableStartY = 95
  const items = order.order_items || []
  
  // Generate QR codes for each product
  const itemsWithQR = await Promise.all(items.map(async (item) => {
    const productId = item.products?.id || item.product_id
    const productUrl = `${siteUrl}/products/${productId}`
    
    // Generate QR code as data URL
    try {
      const qrDataUrl = await QRCode.toDataURL(productUrl, {
        width: 60,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      
      return {
        ...item,
        qrCode: qrDataUrl
      }
    } catch (error) {
      console.error('QR code generation failed:', error)
      return {
        ...item,
        qrCode: null
      }
    }
  }))

  // Create table data with QR code placeholder
  const tableData = itemsWithQR.map((item, index) => [
    (index + 1).toString(),
    item.products?.name || 'Product',
    '', // QR code column (will add image later)
    '18.00%', // GST Rate
    item.quantity.toString(),
    `₹${item.price?.toLocaleString('en-IN')}`,
    item.products?.hsn_code || '32089090',
    `₹${(item.quantity * item.price)?.toLocaleString('en-IN')}`
  ])

  doc.autoTable({
    startY: tableStartY,
    head: [['S.No', 'Description', 'QR', 'GST Rate', 'Qty', 'Rate', 'HSN Code', 'Amount Rs']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [0, 0, 0],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 9
    },
    styles: {
      fontSize: 8,
      cellPadding: 2,
      lineColor: [0, 0, 0],
      lineWidth: 0.5,
      minCellHeight: 14 // Ensure minimum height for QR codes
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' }, // S.No
      1: { cellWidth: 55 }, // Description
      2: { cellWidth: 20, halign: 'center' }, // QR Code
      3: { cellWidth: 20, halign: 'center' }, // GST Rate
      4: { cellWidth: 12, halign: 'center' }, // Qty
      5: { cellWidth: 25, halign: 'right' }, // Rate
      6: { cellWidth: 22, halign: 'center' }, // HSN Code
      7: { cellWidth: 25, halign: 'right' } // Amount
    },
    didDrawCell: (data) => {
      // Add QR code images to the QR column
      if (data.column.index === 2 && data.row.section === 'body') {
        const item = itemsWithQR[data.row.index]
        if (item && item.qrCode) {
          // Center the QR code in the cell
          const cellHeight = data.cell.height
          const cellWidth = data.cell.width
          const qrSize = Math.min(cellHeight - 4, cellWidth - 4, 12) // Max 12px, fit within cell
          
          const cellX = data.cell.x + (cellWidth - qrSize) / 2
          const cellY = data.cell.y + (cellHeight - qrSize) / 2
          
          try {
            doc.addImage(item.qrCode, 'PNG', cellX, cellY, qrSize, qrSize)
          } catch (error) {
            console.error('Failed to add QR code to PDF:', error)
          }
        }
      }
    }
  })

  // --- TOTALS ---
  const finalY = doc.lastAutoTable.finalY + 5
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
  const gstAmount = subtotal * 0.18 // 18% GST
  const total = subtotal + gstAmount

  // Subtotal
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  doc.text('Subtotal:', 140, finalY)
  doc.text(`₹${subtotal.toFixed(2)}`, 190, finalY, { align: 'right' })

  // GST @ 18.00%
  doc.text('IGST @ 18.00%:', 140, finalY + 6)
  doc.text(`₹${gstAmount.toFixed(2)}`, 190, finalY + 6, { align: 'right' })

  // Rounding off
  doc.text('Rounding off:', 140, finalY + 12)
  doc.text('₹0.00', 190, finalY + 12, { align: 'right' })

  // Total
  doc.setFont(undefined, 'bold')
  doc.setFontSize(11)
  doc.setDrawColor(0)
  doc.line(140, finalY + 15, 190, finalY + 15)
  doc.text('Total:', 140, finalY + 21)
  doc.text(`₹${total.toFixed(2)}`, 190, finalY + 21, { align: 'right' })

  // --- TERMS AND CONDITIONS ---
  const termsY = finalY + 35
  doc.setFont(undefined, 'bold')
  doc.setFontSize(9)
  doc.text('Terms and Conditions:', 14, termsY)
  doc.setFont(undefined, 'normal')
  doc.setFontSize(8)
  const terms = [
    'Goods once sold will not be taken back. Kustom Koats Enterprises is not responsible for any',
    'loss or damage to the goods once they leave our warehouse. All deliveries interstate or',
    'interstate are handled by third-party logistics/transport companies. Delivery timelines, transit',
    'damage, or delays are solely the responsibility of the transporter. Dispatch of goods will take',
    'approximately 7 working days after full payment is received.'
  ]
  terms.forEach((line, index) => {
    doc.text(line, 14, termsY + 6 + (index * 4))
  })

  // --- BANK DETAILS ---
  const bankY = termsY + 32
  doc.setFont(undefined, 'bold')
  doc.setFontSize(9)
  doc.text('BANK DETAILS:', 14, bankY)
  doc.setFont(undefined, 'normal')
  doc.setFontSize(8)
  doc.text('KUSTOM KOATS ENTERPRISES', 14, bankY + 5)
  doc.text('ICICI Bank', 14, bankY + 9)
  doc.text('A/C NO: 017105000016', 14, bankY + 13)
  doc.text('IFSC CODE: ICIC0003385', 14, bankY + 17)
  doc.text('PUNE, MAHARASHTRA.', 14, bankY + 21)

  // --- FOOTER ---
  doc.setFontSize(7)
  doc.setFont(undefined, 'italic')
  doc.setTextColor(100)
  doc.text('Subject to Pune Jurisdiction', 105, 280, { align: 'center' })
  doc.text('This is a Computer Generated Copy', 105, 284, { align: 'center' })
  doc.text('Thankyou For Your Business', 105, 288, { align: 'center' })

  // --- SAVE PDF ---
  const fileName = `Invoice-${orderId}.pdf`
  doc.save(fileName)
  
  return fileName
}

/**
 * Generate Branded Invoice for Printing (opens in new window for print dialog)
 * @param {Object} order - Order object with order_items
 * @param {string} siteUrl - Base URL of the website (e.g., 'https://kustomkoats.in')
 */
export async function printBrandedInvoice(order, siteUrl = 'https://kustomkoats.in') {
  const doc = new jsPDF()
  const orderId = order.display_order_id || '#' + String(order.id).slice(-6).toUpperCase()
  const addr = order.parsedAddress || {}

  // --- WATERMARK: "KUSTOMKOATS" with low opacity ---
  doc.setTextColor(220, 220, 220) // Light gray
  doc.setFontSize(60)
  doc.setFont(undefined, 'bold')
  doc.saveGraphicsState()
  doc.setGState(new doc.GState({ opacity: 0.08 })) // Very low opacity
  
  // Rotate and position watermark in center
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  doc.text('KUSTOMKOATS', pageWidth / 2, pageHeight / 2, {
    align: 'center',
    angle: 45 // 45-degree diagonal
  })
  doc.restoreGraphicsState()

  // Reset text color for rest of document
  doc.setTextColor(0, 0, 0)

  // --- COMPANY HEADER ---
  doc.setFillColor(202, 42, 49) // KUSTOMKOATS brand color
  doc.rect(0, 0, 210, 35, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont(undefined, 'bold')
  doc.text('KUSTOM KOATS ENTERPRISES', 105, 15, { align: 'center' })
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  doc.text('Kumar Paints', 105, 21, { align: 'center' })
  doc.text('S1/803, Near Toad Farms, Kondhwa, Pune 411048, Maharashtra', 105, 26, { align: 'center' })
  doc.text('Contact No: 9960811119 | GST NO: 27BZAPK4893D1ZZT', 105, 31, { align: 'center' })

  // --- INVOICE TITLE ---
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(18)
  doc.setFont(undefined, 'bold')
  doc.text('TAX INVOICE', 105, 48, { align: 'center' })

  // --- INVOICE DETAILS (Left) ---
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  doc.text(`Invoice: ${orderId}`, 14, 60)
  doc.text(`Date: ${new Date(order.created_at).toLocaleDateString('en-IN')}`, 14, 66)
  doc.text(`Place of Service: Andhra Pradesh`, 14, 72)
  doc.text(`State Code: AP-37`, 14, 78)

  // --- CUSTOMER DETAILS (Right Box) ---
  doc.setFont(undefined, 'bold')
  doc.text('Customer Details:', 140, 60)
  doc.setFont(undefined, 'normal')
  doc.setFontSize(9)
  doc.text(`Address: ${addr.address1 || addr.addressLine1 || 'N/A'}`, 140, 66)
  doc.text(`${addr.city || 'N/A'}, ${addr.state || 'N/A'} - ${addr.pincode || addr.zipCode || 'N/A'}`, 140, 72)
  doc.text(`Contact No: ${addr.phone || order.guest_phone || 'N/A'}`, 140, 78)
  if (addr.email) {
    doc.text(`GST No: ${addr.gst || '-'}`, 140, 84)
  }

  // --- ITEMS TABLE WITH QR CODES ---
  const tableStartY = 95
  const items = order.order_items || []
  
  // Generate QR codes for each product
  const itemsWithQR = await Promise.all(items.map(async (item) => {
    const productId = item.products?.id || item.product_id
    const productUrl = `${siteUrl}/products/${productId}`
    
    // Generate QR code as data URL
    try {
      const qrDataUrl = await QRCode.toDataURL(productUrl, {
        width: 60,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      
      return {
        ...item,
        qrCode: qrDataUrl
      }
    } catch (error) {
      console.error('QR code generation failed:', error)
      return {
        ...item,
        qrCode: null
      }
    }
  }))

  // Create table data with QR code placeholder
  const tableData = itemsWithQR.map((item, index) => [
    (index + 1).toString(),
    item.products?.name || 'Product',
    '', // QR code column (will add image later)
    '18.00%', // GST Rate
    item.quantity.toString(),
    `₹${item.price?.toLocaleString('en-IN')}`,
    item.products?.hsn_code || '32089090',
    `₹${(item.quantity * item.price)?.toLocaleString('en-IN')}`
  ])

  doc.autoTable({
    startY: tableStartY,
    head: [['S.No', 'Description', 'QR', 'GST Rate', 'Qty', 'Rate', 'HSN Code', 'Amount Rs']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [0, 0, 0],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 9
    },
    styles: {
      fontSize: 8,
      cellPadding: 2,
      lineColor: [0, 0, 0],
      lineWidth: 0.5,
      minCellHeight: 14 // Ensure minimum height for QR codes
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' }, // S.No
      1: { cellWidth: 55 }, // Description
      2: { cellWidth: 20, halign: 'center' }, // QR Code
      3: { cellWidth: 20, halign: 'center' }, // GST Rate
      4: { cellWidth: 12, halign: 'center' }, // Qty
      5: { cellWidth: 25, halign: 'right' }, // Rate
      6: { cellWidth: 22, halign: 'center' }, // HSN Code
      7: { cellWidth: 25, halign: 'right' } // Amount
    },
    didDrawCell: (data) => {
      // Add QR code images to the QR column
      if (data.column.index === 2 && data.row.section === 'body') {
        const item = itemsWithQR[data.row.index]
        if (item && item.qrCode) {
          // Center the QR code in the cell
          const cellHeight = data.cell.height
          const cellWidth = data.cell.width
          const qrSize = Math.min(cellHeight - 4, cellWidth - 4, 12) // Max 12px, fit within cell
          
          const cellX = data.cell.x + (cellWidth - qrSize) / 2
          const cellY = data.cell.y + (cellHeight - qrSize) / 2
          
          try {
            doc.addImage(item.qrCode, 'PNG', cellX, cellY, qrSize, qrSize)
          } catch (error) {
            console.error('Failed to add QR code to PDF:', error)
          }
        }
      }
    }
  })

  // --- TOTALS ---
  const finalY = doc.lastAutoTable.finalY + 5
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
  const gstAmount = subtotal * 0.18 // 18% GST
  const total = subtotal + gstAmount

  // Subtotal
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  doc.text('Subtotal:', 140, finalY)
  doc.text(`₹${subtotal.toFixed(2)}`, 190, finalY, { align: 'right' })

  // GST @ 18.00%
  doc.text('IGST @ 18.00%:', 140, finalY + 6)
  doc.text(`₹${gstAmount.toFixed(2)}`, 190, finalY + 6, { align: 'right' })

  // Rounding off
  doc.text('Rounding off:', 140, finalY + 12)
  doc.text('₹0.00', 190, finalY + 12, { align: 'right' })

  // Total
  doc.setFont(undefined, 'bold')
  doc.setFontSize(11)
  doc.setDrawColor(0)
  doc.line(140, finalY + 15, 190, finalY + 15)
  doc.text('Total:', 140, finalY + 21)
  doc.text(`₹${total.toFixed(2)}`, 190, finalY + 21, { align: 'right' })

  // --- TERMS AND CONDITIONS ---
  const termsY = finalY + 35
  doc.setFont(undefined, 'bold')
  doc.setFontSize(9)
  doc.text('Terms and Conditions:', 14, termsY)
  doc.setFont(undefined, 'normal')
  doc.setFontSize(8)
  const terms = [
    'Goods once sold will not be taken back. Kustom Koats Enterprises is not responsible for any',
    'loss or damage to the goods once they leave our warehouse. All deliveries interstate or',
    'interstate are handled by third-party logistics/transport companies. Delivery timelines, transit',
    'damage, or delays are solely the responsibility of the transporter. Dispatch of goods will take',
    'approximately 7 working days after full payment is received.'
  ]
  terms.forEach((line, index) => {
    doc.text(line, 14, termsY + 6 + (index * 4))
  })

  // --- BANK DETAILS ---
  const bankY = termsY + 32
  doc.setFont(undefined, 'bold')
  doc.setFontSize(9)
  doc.text('BANK DETAILS:', 14, bankY)
  doc.setFont(undefined, 'normal')
  doc.setFontSize(8)
  doc.text('KUSTOM KOATS ENTERPRISES', 14, bankY + 5)
  doc.text('ICICI Bank', 14, bankY + 9)
  doc.text('A/C NO: 017105000016', 14, bankY + 13)
  doc.text('IFSC CODE: ICIC0003385', 14, bankY + 17)
  doc.text('PUNE, MAHARASHTRA.', 14, bankY + 21)

  // --- FOOTER ---
  doc.setFontSize(7)
  doc.setFont(undefined, 'italic')
  doc.setTextColor(100)
  doc.text('Subject to Pune Jurisdiction', 105, 280, { align: 'center' })
  doc.text('This is a Computer Generated Copy', 105, 284, { align: 'center' })
  doc.text('Thankyou For Your Business', 105, 288, { align: 'center' })

  // --- OPEN IN NEW WINDOW FOR PRINTING ---
  // Convert PDF to blob and open in new window
  const pdfBlob = doc.output('blob')
  const pdfUrl = URL.createObjectURL(pdfBlob)
  
  // Open PDF in new window
  const printWindow = window.open(pdfUrl, '_blank')
  
  // Trigger print dialog after PDF loads
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print()
      // Clean up the blob URL after printing
      setTimeout(() => {
        URL.revokeObjectURL(pdfUrl)
      }, 1000)
    }
  }
  
  return orderId
}
