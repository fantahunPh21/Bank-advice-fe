import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

/**
 * Generates a Proforma PDF based on the provided record data.
 */
export const generateProformaPDF = (record) => {
    console.log('Generating PDF for record:', record)
    try {
        const doc = new jsPDF()

        // Set font
        doc.setFont('helvetica')

        // --- Header Section ---
        doc.setDrawColor(0, 0, 255)
        doc.setLineWidth(0.5)
        doc.rect(10, 10, 190, 25) // Header box

        doc.line(50, 10, 50, 35)
        doc.line(150, 10, 150, 35)

        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text('STEELY R.M.I', 15, 20)
        doc.setFontSize(8)
        doc.text('APOLLO', 15, 25)

        doc.setFontSize(9)
        doc.setTextColor(255, 0, 0)
        doc.text('Company Name:', 55, 15)
        doc.setTextColor(0, 0, 0)
        doc.text('STEELY R.M.I. Pvt. Ltd. Co.', 55, 25)
        doc.setFontSize(7)
        doc.text('(Amharic Name Placeholder)', 55, 20)

        doc.setFontSize(9)
        doc.setTextColor(255, 0, 0)
        doc.text('Document No: SRMI-OF-170', 155, 15)

        doc.rect(10, 35, 190, 10)
        doc.line(50, 35, 50, 45)
        doc.line(150, 35, 150, 45)
        doc.line(180, 35, 180, 45)

        doc.setTextColor(255, 0, 0)
        doc.setFontSize(10)
        doc.text('Title:', 15, 41)

        doc.setTextColor(0, 0, 0)
        doc.text('OUTGOING LETTER', 80, 41)

        doc.setTextColor(255, 0, 0)
        doc.setFontSize(8)
        doc.text('Revision No. 01', 152, 41)
        doc.text('Page 1 of 1', 182, 41)

        // --- Invoice Info Section ---
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.text('PAYMENT ADVICE', 40, 60)

        const complaintId = record.customerComplaintsId || 'N/A'
        doc.setFontSize(10)
        doc.text(`ADVICE NO: ${complaintId}/${new Date().getFullYear()}`, 140, 65)
        doc.setFont('helvetica', 'normal')
        doc.text('Ref No: SRMI /3051/25', 140, 70)
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 140, 75)
        doc.text(`Phone No: ${record.customers?.phone || record.customers?.phoneNumber || '0911692883'}`, 140, 80)
        doc.text(`Email: ${record.customerEmail || ''}`, 140, 85)

        doc.setFont('helvetica', 'bold')
        doc.text('To: ', 30, 80)
        doc.setFont('helvetica', 'normal')
        doc.text(record.customerName || '', 40, 80)
        doc.text('Addis Ababa', 40, 85)
        doc.text(`Tin No: ${record.customers?.tin || '0051190216'}`, 40, 90)

        const createdDate = record.createdDate ? new Date(record.createdDate).toLocaleDateString() : 'N/A'
        doc.text(`As per your request dated ${createdDate}`, 20, 100)

        // --- Materials Table ---
        const tableData = record.materials?.map((m, index) => [
            index + 1,
            m.materialName || '',
            m.uom || 'Berga',
            m.quantity || 0,
            Number(m.unitPrice || 0).toLocaleString(),
            Number(m.totalPrice || 0).toLocaleString()
        ]) || []

        const total = record.materials?.reduce((sum, m) => sum + Number(m.totalPrice || 0), 0) || 0

        autoTable(doc, {
            startY: 105,
            head: [['S.N', 'Description', 'Unit', 'Quantity', 'Unit Price Including Vat', 'Total Price Including Vat']],
            body: tableData,
            foot: [['', '', '', '', 'Total', Number(total).toLocaleString()]],
            theme: 'grid',
            headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], lineWidth: 0.1, fontStyle: 'bold' },
            footStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], lineWidth: 0.1, fontStyle: 'bold' },
            bodyStyles: { textColor: [0, 0, 0], lineWidth: 0.1 },
            margin: { left: 10, right: 10 }
        })

        const finalY = (doc.lastAutoTable?.finalY || 105) + 10

        // --- Terms & Conditions ---
        doc.setFont('helvetica', 'bold')
        doc.text('Terms & Conditions', 10, finalY)
        doc.rect(10, finalY + 2, 190, 60)

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        const terms = [
            '1. Our products meet the standards of CES 101-2:2021, Ø 12 is Grade- 60 while Ø 14 is Grade-75.',
            '2. The above prices are valid for two days.',
            '3. Loading will be done by Steely RMI PLC at no cost.',
            '4. The material will be loaded from our manufacturing facility in Bishoftu town.',
            '5. Transport shall be arranged by the customer.',
            '6. Payment: 100% advance payment, and before making payment, please get confirmation from our sales staff.',
            '7. This quotation (price and quantity) is a declaration of our intention and is valid only if payment is made within the validity period.',
            'Note That: - for any difference in the calculation of price, the unit cost shall govern the contract.'
        ]

        terms.forEach((term, i) => {
            doc.text(term, 15, finalY + 8 + (i * 5))
        })

        // Payment Instruments
        doc.setFont('helvetica', 'bold')
        doc.text('Payment Instruments', 12, finalY + 50)
        doc.setFont('helvetica', 'normal')
        doc.text('- Bank transfer (advance deposit) to our accounts.', 12, finalY + 55)

        // --- Footer ---
        doc.text('For,', 10, finalY + 70)
        doc.text('Steely RMI PLC', 10, finalY + 75)
        doc.text('Marketing Department', 10, finalY + 100)

        const pageHeight = doc.internal.pageSize.height
        doc.setFontSize(7)
        doc.setTextColor(100, 100, 100)
        doc.text('Tel. Off: +251(0)116 67 76 58, +251 957 10 10 10 (Marketing) Sales: +251(0)911 23 7754', 105, pageHeight - 15, { align: 'center' })
        doc.text('Fax: +251(0)116 67 75 63, +251(0)116 67 51 01 (Tin No. 0001656447)', 105, pageHeight - 12, { align: 'center' })
        doc.text('Email: steelymarketing@yahoo.com (Web Site: www.steelyrmiplc.com) P.O. Box: 10742(A.A Ethiopia)', 105, pageHeight - 9, { align: 'center' })
        doc.text('Address: Addis Ababa, Gurd Shola, Century Mall (HQ)', 105, pageHeight - 6, { align: 'center' })

        // Save PDF
        doc.save(`PaymentAdvice_${complaintId}.pdf`)
    } catch (error) {
        console.error('Error generating PDF:', error)
        alert(`Failed to generate PDF: ${error.message || 'Unknown error'}`)
    }
}
