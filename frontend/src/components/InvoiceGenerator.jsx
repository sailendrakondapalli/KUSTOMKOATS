import { useState } from 'react'
import { X, Plus, Trash2, FileText } from 'lucide-react'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import toast from 'react-hot-toast'

const CARD_BG = "#5B1E28"
const CARD_BORDER = "rgba(255,255,255,0.07)"
const TEXT_PRIMARY = "#F3EBDD"
const TEXT_MUTED = "rgba(243,235,221,0.45)"
const ACCENT = "#B8955A"

const inputStyle = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 5,
  padding: "8px 12px",
  color: TEXT_PRIMARY,
  fontSize: "0.875rem",
  fontFamily: "'Inter', sans-serif",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
}

export default function InvoiceGenerator({ enquiry, onClose }) {
  const [invoiceData, setInvoiceData] = useState(() => {
    // Generate invoice number
    const lastInvoiceNum = localStorage.getItem('lastInvoiceNumber') || '0'
    const newInvoiceNum = String(parseInt(lastInvoiceNum) + 1).padStart(3, '0')
    
    // Load saved business details
    const savedBusinessName = localStorage.getItem('businessName') || ''
    const savedBusinessAddress = localStorage.getItem('businessAddress') || ''
    const savedBusinessContact = localStorage.getItem('businessContact') || ''
    
    return {
      invoiceNumber: `INV-${newInvoiceNum}`,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [{ description: '', quantity: 1, unitPrice: 0 }],
      taxRate: 18,
      paymentTerms: 'Payment due within 15 days',
      businessName: savedBusinessName,
      businessAddress: savedBusinessAddress,
      businessContact: savedBusinessContact
    }
  })

  const updateField = (field, value) => {
    setInvoiceData(prev => ({ ...prev, [field]: value }))
  }

  const updateItem = (index, field, value) => {
    setInvoiceData(prev => {
      const newItems = [...prev.items]
      newItems[index] = { ...newItems[index], [field]: field === 'quantity' || field === 'unitPrice' ? Number(value) : value }
      return { ...prev, items: newItems }
    })
  }

  const addItem = () => {
    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unitPrice: 0 }]
    }))
  }

  const removeItem = (index) => {
    if (invoiceData.items.length > 1) {
      setInvoiceData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }))
    }
  }

  const calculateSubtotal = () => {
    return invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  }

  const calculateTax = () => {
    return calculateSubtotal() * (invoiceData.taxRate / 100)
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  const generatePDF = () => {
    // Validation
    if (!invoiceData.businessName) {
      toast.error('Business name is required')
      return
    }
    if (invoiceData.items.some(item => !item.description || item.quantity <= 0 || item.unitPrice <= 0)) {
      toast.error('Please fill all item details with valid values')
      return
    }

    // Save business details
    localStorage.setItem('businessName', invoiceData.businessName)
    localStorage.setItem('businessAddress', invoiceData.businessAddress)
    localStorage.setItem('businessContact', invoiceData.businessContact)
    localStorage.setItem('lastInvoiceNumber', invoiceData.invoiceNumber.split('-')[1])

    // Generate PDF
    const doc = new jsPDF()
    
    // Header - Business Info
    doc.setFontSize(20)
    doc.setTextColor(40, 40, 40)
    doc.text(invoiceData.businessName, 20, 20)
    
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    if (invoiceData.businessAddress) {
      const addressLines = doc.splitTextToSize(invoiceData.businessAddress, 80)
      doc.text(addressLines, 20, 28)
    }
    if (invoiceData.businessContact) {
      doc.text(invoiceData.businessContact, 20, invoiceData.businessAddress ? 40 : 34)
    }
    
    // Invoice Title
    doc.setFontSize(24)
    doc.setTextColor(216, 199, 174)
    doc.text('INVOICE', 150, 20)
    
    // Invoice Details
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Invoice #: ${invoiceData.invoiceNumber}`, 150, 28)
    doc.text(`Date: ${new Date(invoiceData.invoiceDate).toLocaleDateString('en-IN')}`, 150, 34)
    doc.text(`Due Date: ${new Date(invoiceData.dueDate).toLocaleDateString('en-IN')}`, 150, 40)
    
    // Customer Info
    doc.setFontSize(12)
    doc.setTextColor(40, 40, 40)
    doc.text('Bill To:', 20, 55)
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(enquiry.name, 20, 62)
    doc.text(enquiry.phone, 20, 68)
    if (enquiry.email) {
      doc.text(enquiry.email, 20, 74)
    }
    
    // Items Table
    const tableData = invoiceData.items.map(item => [
      item.description,
      item.quantity.toString(),
      `₹${item.unitPrice.toFixed(2)}`,
      `₹${(item.quantity * item.unitPrice).toFixed(2)}`
    ])
    
    doc.autoTable({
      startY: 85,
      head: [['Description', 'Quantity', 'Unit Price', 'Total']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [216, 199, 174],
        textColor: [23, 22, 20],
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 10,
        textColor: [60, 60, 60]
      },
      columnStyles: {
        0: { cellWidth: 90 },
        1: { cellWidth: 30, halign: 'center' },
        2: { cellWidth: 35, halign: 'right' },
        3: { cellWidth: 35, halign: 'right' }
      }
    })
    
    // Calculate final Y position
    const finalY = doc.lastAutoTable.finalY + 10
    
    // Totals
    const subtotal = calculateSubtotal()
    const tax = calculateTax()
    const total = calculateTotal()
    
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text('Subtotal:', 130, finalY)
    doc.text(`₹${subtotal.toFixed(2)}`, 190, finalY, { align: 'right' })
    
    doc.text(`Tax (${invoiceData.taxRate}%):`, 130, finalY + 7)
    doc.text(`₹${tax.toFixed(2)}`, 190, finalY + 7, { align: 'right' })
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(40, 40, 40)
    doc.text('Total:', 130, finalY + 15)
    doc.text(`₹${total.toFixed(2)}`, 190, finalY + 15, { align: 'right' })
    
    // Payment Terms
    if (invoiceData.paymentTerms) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(100, 100, 100)
      doc.text('Payment Terms:', 20, finalY + 30)
      const termsLines = doc.splitTextToSize(invoiceData.paymentTerms, 170)
      doc.text(termsLines, 20, finalY + 36)
    }
    
    // Create PDF blob
    const pdfBlob = doc.output('blob')
    const fileName = `${invoiceData.invoiceNumber}.pdf`
    
    // Prepare WhatsApp message
    const cleanPhone = enquiry.phone.replace(/\D/g, '')
    const phoneWithCode = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`
    const message = `Dear ${enquiry.name},\n\nYour invoice ${invoiceData.invoiceNumber} is ready.\n\n*Total Amount:* ₹${total.toFixed(2)}\n*Due Date:* ${new Date(invoiceData.dueDate).toLocaleDateString('en-IN')}\n\nThank you for your business!`
    
    // Download PDF
    const pdfUrl = URL.createObjectURL(pdfBlob)
    const link = document.createElement('a')
    link.href = pdfUrl
    link.download = fileName
    link.click()
    
    // Open WhatsApp directly to the contact
    setTimeout(() => {
      const encodedMessage = encodeURIComponent(message)
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneWithCode}&text=${encodedMessage}`
      window.open(whatsappUrl, '_blank')
      
      toast.success('Invoice downloaded! Opening WhatsApp - please attach the PDF from your downloads.')
    }, 500)
    
    onClose()
  }

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.75)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      padding: 20,
      overflowY: "auto"
    }} onClick={onClose}>
      <div 
        style={{
          background: CARD_BG,
          border: `1px solid ${CARD_BORDER}`,
          borderRadius: 12,
          padding: 28,
          maxWidth: 700,
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)"
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <FileText size={24} style={{ color: ACCENT }} />
            <h2 style={{ 
              fontFamily: "'Cormorant Garamond', serif", 
              fontSize: "1.5rem", 
              fontWeight: 700, 
              color: TEXT_PRIMARY,
              margin: 0
            }}>
              Generate Invoice
            </h2>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: TEXT_MUTED, cursor: "pointer", padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        {/* Customer Info */}
        <div style={{ 
          background: "rgba(255,255,255,0.03)", 
          border: `1px solid ${CARD_BORDER}`,
          borderRadius: 6,
          padding: 14,
          marginBottom: 20
        }}>
          <p style={{ color: TEXT_MUTED, fontSize: "0.75rem", marginBottom: 8, fontFamily: "'Inter', sans-serif" }}>Bill To:</p>
          <p style={{ color: TEXT_PRIMARY, fontSize: "0.875rem", fontWeight: 600, marginBottom: 4 }}>{enquiry.name}</p>
          <p style={{ color: TEXT_MUTED, fontSize: "0.8125rem" }}>{enquiry.phone}</p>
          {enquiry.email && <p style={{ color: TEXT_MUTED, fontSize: "0.8125rem" }}>{enquiry.email}</p>}
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ marginBottom: 20 }}>
          <div>
            <label style={{ color: TEXT_MUTED, fontSize: "0.75rem", marginBottom: 6, display: "block" }}>Invoice Number</label>
            <input
              type="text"
              value={invoiceData.invoiceNumber}
              readOnly
              style={{ ...inputStyle, cursor: "not-allowed", opacity: 0.7 }}
            />
          </div>
          <div>
            <label style={{ color: TEXT_MUTED, fontSize: "0.75rem", marginBottom: 6, display: "block" }}>Invoice Date</label>
            <input
              type="date"
              value={invoiceData.invoiceDate}
              onChange={e => updateField('invoiceDate', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ color: TEXT_MUTED, fontSize: "0.75rem", marginBottom: 6, display: "block" }}>Due Date</label>
            <input
              type="date"
              value={invoiceData.dueDate}
              onChange={e => updateField('dueDate', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ color: TEXT_MUTED, fontSize: "0.75rem", marginBottom: 6, display: "block" }}>Tax Rate (%)</label>
            <input
              type="number"
              value={invoiceData.taxRate}
              onChange={e => updateField('taxRate', e.target.value)}
              style={inputStyle}
              min="0"
              max="100"
              step="0.01"
            />
          </div>
        </div>

        {/* Line Items */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <label style={{ color: TEXT_PRIMARY, fontSize: "0.875rem", fontWeight: 600 }}>Line Items</label>
            <button
              onClick={addItem}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: ACCENT,
                color: "#5B1E28",
                border: "none",
                borderRadius: 4,
                padding: "6px 12px",
                cursor: "pointer",
                fontSize: "0.75rem",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600
              }}
            >
              <Plus size={14} /> Add Item
            </button>
          </div>

          {invoiceData.items.map((item, index) => (
            <div key={index} style={{ 
              background: "rgba(255,255,255,0.03)", 
              border: `1px solid ${CARD_BORDER}`,
              borderRadius: 6,
              padding: 12,
              marginBottom: 10
            }}>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <input
                    type="text"
                    placeholder="Description"
                    value={item.description}
                    onChange={e => updateItem(index, 'description', e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={e => updateItem(index, 'quantity', e.target.value)}
                    style={inputStyle}
                    min="1"
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={item.unitPrice}
                    onChange={e => updateItem(index, 'unitPrice', e.target.value)}
                    style={inputStyle}
                    min="0"
                    step="0.01"
                  />
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: TEXT_PRIMARY, fontSize: "0.875rem", flex: 1 }}>
                      ₹{(item.quantity * item.unitPrice).toFixed(2)}
                    </span>
                    {invoiceData.items.length > 1 && (
                      <button
                        onClick={() => removeItem(index)}
                        style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer" }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div style={{ 
          background: "rgba(255,255,255,0.05)", 
          border: `1px solid ${CARD_BORDER}`,
          borderRadius: 6,
          padding: 14,
          marginBottom: 20
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ color: TEXT_MUTED, fontSize: "0.875rem" }}>Subtotal:</span>
            <span style={{ color: TEXT_PRIMARY, fontSize: "0.875rem" }}>₹{calculateSubtotal().toFixed(2)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ color: TEXT_MUTED, fontSize: "0.875rem" }}>Tax ({invoiceData.taxRate}%):</span>
            <span style={{ color: TEXT_PRIMARY, fontSize: "0.875rem" }}>₹{calculateTax().toFixed(2)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, borderTop: `1px solid ${CARD_BORDER}` }}>
            <span style={{ color: TEXT_PRIMARY, fontSize: "1rem", fontWeight: 600 }}>Total:</span>
            <span style={{ color: ACCENT, fontSize: "1rem", fontWeight: 700 }}>₹{calculateTotal().toFixed(2)}</span>
          </div>
        </div>

        {/* Business Details */}
        <div className="grid grid-cols-1 gap-4" style={{ marginBottom: 20 }}>
          <div>
            <label style={{ color: TEXT_MUTED, fontSize: "0.75rem", marginBottom: 6, display: "block" }}>Business Name *</label>
            <input
              type="text"
              value={invoiceData.businessName}
              onChange={e => updateField('businessName', e.target.value)}
              style={inputStyle}
              placeholder="Your Business Name"
            />
          </div>
          <div>
            <label style={{ color: TEXT_MUTED, fontSize: "0.75rem", marginBottom: 6, display: "block" }}>Business Address</label>
            <textarea
              value={invoiceData.businessAddress}
              onChange={e => updateField('businessAddress', e.target.value)}
              style={{ ...inputStyle, resize: "none" }}
              rows={2}
              placeholder="Your Business Address"
            />
          </div>
          <div>
            <label style={{ color: TEXT_MUTED, fontSize: "0.75rem", marginBottom: 6, display: "block" }}>Business Contact</label>
            <input
              type="text"
              value={invoiceData.businessContact}
              onChange={e => updateField('businessContact', e.target.value)}
              style={inputStyle}
              placeholder="Phone / Email / GST"
            />
          </div>
          <div>
            <label style={{ color: TEXT_MUTED, fontSize: "0.75rem", marginBottom: 6, display: "block" }}>Payment Terms</label>
            <textarea
              value={invoiceData.paymentTerms}
              onChange={e => updateField('paymentTerms', e.target.value)}
              style={{ ...inputStyle, resize: "none" }}
              rows={2}
              placeholder="Payment terms and conditions"
            />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={generatePDF}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: ACCENT,
              color: "#5B1E28",
              border: "none",
              borderRadius: 6,
              padding: "12px 20px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.875rem",
              fontFamily: "'Inter', sans-serif"
            }}
          >
            <FileText size={16} />
            Generate & Send Invoice
          </button>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.06)",
              color: TEXT_MUTED,
              border: `1px solid ${CARD_BORDER}`,
              borderRadius: 6,
              padding: "12px 20px",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontFamily: "'Inter', sans-serif"
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
