import { type InvoiceDocument } from '../types/document';

export const templates: Record<string, InvoiceDocument> = {
    modern: {
        id: 'template-modern',
        blocks: [
            { id: 't1', type: 'header', props: { text: 'INVOICE' }, style: { fontSize: '2.5rem', color: '#2563eb', marginBottom: '1rem' }, x: 40, y: 40 },
            { id: 't2', type: 'text', props: { text: 'Date: 2023-10-25\nInvoice #: INV-001' }, style: { color: '#4b5563', marginBottom: '2rem' }, x: 40, y: 120 },
            { id: 't3', type: 'divider', props: {}, style: {}, x: 40, y: 180 },
            { id: 't4', type: 'invoice-items', props: { items: [{ desc: 'Web Design', qty: 1, price: 1200 }, { desc: 'Hosting', qty: 12, price: 25 }] }, style: { marginBottom: '2rem' }, x: 40, y: 220 },
            { id: 't5', type: 'totals', props: { subtotal: 1500, tax: 150 }, style: {}, x: 504, y: 350 },
        ]
    },
    minimal: {
        id: 'template-minimal',
        blocks: [
            { id: 'm1', type: 'header', props: { text: 'Invoice' }, style: { fontSize: '2rem', fontWeight: 'normal', marginBottom: '2rem' }, x: 40, y: 40 },
            { id: 'm2', type: 'invoice-items', props: { items: [{ desc: 'Consulting', qty: 5, price: 150 }] }, style: { marginBottom: '2rem' }, x: 40, y: 120 },
            { id: 'm3', type: 'totals', props: { subtotal: 750, tax: 0 }, style: {}, x: 504, y: 220 },
        ]
    },
    margarita: {
        id: 'template-margarita',
        background: '#f2e8cf', // Refined Cream
        blocks: [
            // Sidebar Background
            { id: 'marg-bg-1', type: 'container', props: { hidePlaceholder: true }, style: { width: '120px', height: '1123px', backgroundColor: '#e9e4d1' }, x: 0, y: 0 },

            // Vertical Name
            { id: 'marg-name', type: 'header', props: { text: 'Margarita Perez' }, style: { fontSize: '32px', color: '#002855', transform: 'rotate(-90deg)', transformOrigin: 'left bottom', whiteSpace: 'nowrap', fontWeight: 'bold' }, x: 70, y: 400 },

            // Vertical "invoice" (Reduced size to avoid overlap)
            { id: 'marg-invoice-label', type: 'header', props: { text: 'invoice' }, style: { fontSize: '80px', color: '#002855', transform: 'rotate(-90deg)', transformOrigin: 'left bottom', opacity: 1, fontWeight: '900' }, x: 100, y: 1000 },

            // Top Info
            { id: 'marg-inv-no', type: 'text', props: { text: 'Invoice No. 01234\n29th January, 2030' }, style: { color: '#002855', textAlign: 'right', lineHeight: '1.4', fontSize: '14px' }, x: 500, y: 60 },

            // Billed To
            { id: 'marg-billed-label', type: 'text', props: { text: 'BILLED TO' }, style: { color: '#002855', borderBottom: '1px solid #002855', paddingBottom: '2px', fontWeight: 'bold', fontSize: '14px', width: '120px' }, x: 580, y: 140 },
            { id: 'marg-billed-val', type: 'text', props: { text: 'Resse Miller\nhello@reallygreatsite.com' }, style: { color: '#002855', textAlign: 'right', marginTop: '4px', fontSize: '14px' }, x: 500, y: 170 },

            // Horizontal Divider (Manual)
            { id: 'marg-div-1', type: 'container', props: { hidePlaceholder: true }, style: { width: '600px', height: '1px', backgroundColor: '#002855' }, x: 154, y: 250 },

            // Table Headers
            { id: 'marg-th-1', type: 'text', props: { text: 'DESCRIPTION' }, style: { color: '#002855', fontWeight: 'bold', fontSize: '13px' }, x: 220, y: 280 },
            { id: 'marg-th-2', type: 'text', props: { text: 'SUBTOTAL' }, style: { color: '#002855', fontWeight: 'bold', textAlign: 'right', fontSize: '13px' }, x: 500, y: 280 },

            // Table Items
            { id: 'marg-item-1', type: 'text', props: { text: 'Copywriting for 1 Blog' }, style: { color: '#002855', fontSize: '14px' }, x: 220, y: 340 },
            { id: 'marg-item-1-val', type: 'text', props: { text: '$100' }, style: { color: '#002855', textAlign: 'right', fontSize: '14px' }, x: 500, y: 340 },

            { id: 'marg-item-2', type: 'text', props: { text: '10 Social Media Posts' }, style: { color: '#002855', fontSize: '14px' }, x: 220, y: 390 },
            { id: 'marg-item-2-val', type: 'text', props: { text: '$100' }, style: { color: '#002855', textAlign: 'right', fontSize: '14px' }, x: 500, y: 390 },

            { id: 'marg-item-3', type: 'text', props: { text: '20 Hours Administration Work' }, style: { color: '#002855', fontSize: '14px' }, x: 220, y: 440 },
            { id: 'marg-item-3-val', type: 'text', props: { text: '$400' }, style: { color: '#002855', textAlign: 'right', fontSize: '14px' }, x: 500, y: 440 },

            // Total Divider
            { id: 'marg-div-2', type: 'container', props: { hidePlaceholder: true }, style: { width: '480px', height: '1px', backgroundColor: '#002855' }, x: 200, y: 480 },

            // Total Value
            { id: 'marg-total-label', type: 'text', props: { text: 'TOTAL' }, style: { color: '#002855', fontWeight: 'bold', fontSize: '14px' }, x: 220, y: 500 },
            { id: 'marg-total-val', type: 'text', props: { text: '$600' }, style: { color: '#002855', fontWeight: 'bold', textAlign: 'right', fontSize: '14px' }, x: 500, y: 500 },

            // Payments Footer
            { id: 'marg-pay-label', type: 'text', props: { text: 'PAYMENTS' }, style: { color: '#002855', borderBottom: '1px solid #002855', fontWeight: 'bold', fontSize: '14px', display: 'inline-block' }, x: 220, y: 750 },
            { id: 'marg-pay-val', type: 'text', props: { text: 'Margarita Perez\n012345678901' }, style: { color: '#002855', marginTop: '8px', fontSize: '14px' }, x: 220, y: 780 },
            { id: 'marg-pay-scan', type: 'text', props: { text: 'Scan the QR code to pay.' }, style: { color: '#002855', fontSize: '13px' }, x: 220, y: 830 },

            // Questions
            { id: 'marg-ques-label', type: 'text', props: { text: 'QUESTIONS?' }, style: { color: '#d4a373', fontWeight: 'bold', fontSize: '14px' }, x: 220, y: 860 },
            { id: 'marg-ques-val', type: 'text', props: { text: 'Email me at hello@reallygreatsite.com' }, style: { color: '#d4a373', fontSize: '14px' }, x: 220, y: 890 },

            // QR Placeholder
            { id: 'marg-qr', type: 'container', props: { hidePlaceholder: true }, style: { width: '80px', height: '80px', backgroundColor: '#002855', borderRadius: '4px' }, x: 620, y: 850 },
        ]
    },
    bigbear: {
        id: 'template-bigbear',
        background: '#f9fafb',
        blocks: [
            // Main Outer Border
            { id: 'bb-border', type: 'container', props: { hidePlaceholder: true }, style: { width: '714px', height: '1043px', border: '2px solid #064e3b', borderRadius: '12px', backgroundColor: 'white' }, x: 40, y: 40 },

            // Header Section
            { id: 'bb-header-cont', type: 'container', props: { hidePlaceholder: true }, style: { width: '710px', height: '80px', borderBottom: '1px solid #064e3b', display: 'flex', alignItems: 'center' }, x: 42, y: 42 },
            { id: 'bb-logo', type: 'header', props: { text: 'BigBear Containers' }, style: { color: '#064e3b', fontWeight: '900', fontSize: '24px' }, x: 70, y: 65 },
            { id: 'bb-phone', type: 'text', props: { text: '(800) 769-6080' }, style: { color: '#064e3b', fontWeight: 'bold', fontSize: '14px' }, x: 600, y: 70 },

            // Main Content Area
            { id: 'bb-main-label', type: 'header', props: { text: 'Invoice' }, style: { fontSize: '28px', fontWeight: 'bold', color: '#111827' }, x: 80, y: 150 },
            { id: 'bb-issued', type: 'text', props: { text: 'Issued date: 04/20/2024' }, style: { color: '#6b7280', fontSize: '12px' }, x: 80, y: 195 },
            { id: 'bb-due', type: 'text', props: { text: 'Due date: 04/20/2024' }, style: { color: '#6b7280', fontSize: '12px', textAlign: 'right' }, x: 400, y: 195 },

            // Customer Info Box
            { id: 'bb-cust-box', type: 'container', props: { hidePlaceholder: true }, style: { width: '400px', height: '110px', backgroundColor: '#f3f4f6', borderRadius: '8px', padding: '16px' }, x: 80, y: 220 },
            { id: 'bb-cust-text', type: 'text', props: { text: 'Customer contact info\nDaria Boichuk\nboychuk.dar@gmail.com\n+44 376 2653 276\nGreen str. 54, NY, USA' }, style: { fontSize: '11px', lineHeight: '1.6' }, x: 96, y: 236 },

            // "Payment Method" Sidebar Box
            { id: 'bb-side-box', type: 'container', props: { hidePlaceholder: true }, style: { width: '220px', height: '440px', backgroundColor: '#f3f4f6', borderRadius: '8px' }, x: 510, y: 150 },
            { id: 'bb-side-title', type: 'text', props: { text: 'Payment Method' }, style: { fontWeight: 'bold', color: '#111827', fontSize: '14px' }, x: 526, y: 166 },
            { id: 'bb-side-desc', type: 'text', props: { text: 'Select by clicking on one of possible variants' }, style: { fontSize: '9px', color: '#6b7280', width: '180px' }, x: 526, y: 185 },

            // Payment Options list
            { id: 'bb-opt-1', type: 'container', props: { hidePlaceholder: true }, style: { width: '188px', height: '32px', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: 'white' }, x: 526, y: 210 },
            { id: 'bb-opt-1-text', type: 'text', props: { text: 'DEBIT / CREDIT CARD' }, style: { fontSize: '10px', fontWeight: 'bold', paddingLeft: '8px', paddingTop: '8px' }, x: 526, y: 210 },

            { id: 'bb-opt-2', type: 'container', props: { hidePlaceholder: true }, style: { width: '188px', height: '32px', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: 'white' }, x: 526, y: 250 },
            { id: 'bb-opt-2-text', type: 'text', props: { text: 'E-CHECK' }, style: { fontSize: '10px', fontWeight: 'bold', paddingLeft: '8px', paddingTop: '8px' }, x: 526, y: 250 },

            // Table Header Bar (Grey)
            { id: 'bb-th-bar', type: 'container', props: { hidePlaceholder: true }, style: { width: '300px', height: '28px', backgroundColor: '#e5e7eb' }, x: 80, y: 360 },
            {
                id: 'bb-items', type: 'invoice-items', props: {
                    items: [{ desc: '20ft Standard Used, WWT\nDelivered From Long Island, CA', qty: 1, price: 2850 }],
                    cellStyle: { fontSize: '11px' }
                }, style: { width: '400px' }, x: 80, y: 360
            },

            { id: 'bb-total-amt', type: 'text', props: { text: 'Total Amount: $2,850.00' }, style: { fontSize: '18px', fontWeight: 'bold', color: '#064e3b', textAlign: 'right' }, x: 300, y: 600 },

            // Footer Address Bar
            { id: 'bb-footer-bar', type: 'container', props: { hidePlaceholder: true }, style: { width: '706px', height: '60px', borderTop: '1px solid #064e3b', display: 'flex', alignItems: 'center' }, x: 42, y: 1021 },
            { id: 'bb-addr', type: 'text', props: { text: '5401 West Kennedy Blvd, Suite 100 Tampa FL 33609\n8am - 6pm EST' }, style: { fontSize: '10px', color: '#6b7280' }, x: 80, y: 1040 },
        ]
    },
    toko: {
        id: 'template-toko',
        background: 'white',
        blocks: [
            // Left Accent Bar (Orange)
            { id: 'toko-accent', type: 'container', props: { hidePlaceholder: true }, style: { width: '40px', height: '1123px', backgroundColor: '#ff6b00' }, x: 0, y: 0 },

            // Header Content
            { id: 'toko-logo', type: 'header', props: { text: 'toko\nKelontong' }, style: { color: '#ff6b00', fontSize: '32px', fontStyle: 'italic', fontWeight: 'bold' }, x: 80, y: 60 },
            // SHIFTED "INVOICE" right to avoid date overlap
            { id: 'toko-title', type: 'header', props: { text: 'INVOICE' }, style: { color: '#ff6b00', fontSize: '72px', fontWeight: '900', letterSpacing: '4px' }, x: 450, y: 40 },
            { id: 'toko-date', type: 'text', props: { text: 'December 26, 2019' }, style: { fontSize: '18px', fontWeight: 'bold' }, x: 450, y: 150 },

            // Addresses
            { id: 'toko-to-lbl', type: 'text', props: { text: 'TO.' }, style: { fontSize: '12px', fontWeight: 'bold', textAlign: 'right' }, x: 650, y: 200 },
            { id: 'toko-to-val', type: 'text', props: { text: 'Mrs. Margareth\n\nCompany Name\nAddress, and City Name\n2424 Country Name' }, style: { textAlign: 'right', fontSize: '14px', lineHeight: '1.6' }, x: 480, y: 220 },

            { id: 'toko-isn', type: 'text', props: { text: 'NO / ISN 01.12.2019' }, style: { fontWeight: 'bold', fontSize: '14px' }, x: 80, y: 320 },

            // Item Table Border Lines
            { id: 'toko-line-1', type: 'container', props: { hidePlaceholder: true }, style: { width: '600px', height: '2px', backgroundColor: '#333' }, x: 80, y: 360 },
            {
                id: 'toko-items', type: 'invoice-items', props: {
                    items: [
                        { desc: 'Kunyit Asam\nipsum dolor sit amet, consectetuer adipiscing elit...', qty: 3, price: 10 },
                        { desc: 'Sabun Sirih\nipsum dolor sit amet, consectetuer adipiscing elit...', qty: 2, price: 12 },
                        { desc: 'Cream Siang, MALAM\nipsum dolor sit amet, consectetuer adipiscing elit...', qty: 5, price: 30 }
                    ],
                    cellStyle: { border: 'none', padding: '12px 0' }
                }, style: { width: '600px', border: 'none' }, x: 80, y: 370
            },
            { id: 'toko-line-2', type: 'container', props: { hidePlaceholder: true }, style: { width: '600px', height: '2px', backgroundColor: '#333' }, x: 80, y: 640 },

            // Totals
            { id: 'toko-totals', type: 'totals', props: { subtotal: 164, tax: 16.4, totalRowStyle: { borderTop: 'none' } }, style: { width: '200px' }, x: 500, y: 660 },

            // Grand Total (Highlighted Box)
            { id: 'toko-grand', type: 'container', props: { hidePlaceholder: true }, style: { width: '320px', height: '48px', backgroundColor: '#ff6b00', borderRadius: '4px' }, x: 400, y: 760 },
            { id: 'toko-grand-lbl', type: 'text', props: { text: 'GRAND TOTAL' }, style: { color: 'white', fontSize: '18px', fontWeight: 'bold' }, x: 420, y: 772 },
            { id: 'toko-grand-val', type: 'text', props: { text: '$ 180.40' }, style: { color: 'white', fontSize: '18px', fontWeight: 'bold', textAlign: 'right', width: '100px' }, x: 580, y: 772 },
        ]
    },
    pink: {
        id: 'template-pink',
        background: '#fdf7f8',
        blocks: [
            // Left Sidebar Accent (Dark Teal)
            { id: 'pink-side', type: 'container', props: { hidePlaceholder: true }, style: { width: '80px', height: '1123px', backgroundColor: '#1a3a3a' }, x: 0, y: 0 },

            // Mauve Bottom Accent
            { id: 'pink-bottom', type: 'container', props: { hidePlaceholder: true }, style: { width: '794px', height: '140px', backgroundColor: '#d8b4bc' }, x: 0, y: 983 },

            // Main Content - Adjusted Y to avoid edge overlap
            { id: 'pink-title', type: 'header', props: { text: 'INVOICE' }, style: { color: '#d8b4bc', fontSize: '64px', fontWeight: 'lighter', letterSpacing: '8px', opacity: 0.8 }, x: 460, y: 80 },

            { id: 'pink-to-lbl', type: 'text', props: { text: 'INVOICE TO' }, style: { fontSize: '11px', fontWeight: 'bold', color: '#6b7280' }, x: 120, y: 180 },
            { id: 'pink-to-val', type: 'text', props: { text: "Client's Name\nCompany Name inc." }, style: { fontSize: '16px', fontWeight: 'bold', lineHeight: '1.4' }, x: 120, y: 200 },

            { id: 'pink-inv-data', type: 'text', props: { text: 'Invoice Date : September 05, 2019' }, style: { fontSize: '13px', textAlign: 'right' }, x: 450, y: 220 },

            // Table Header Bar (Mauve)
            { id: 'pink-th-bar', type: 'container', props: { hidePlaceholder: true }, style: { width: '634px', height: '36px', backgroundColor: '#d8b4bc', borderRadius: '2px' }, x: 120, y: 300 },
            { id: 'pink-th-txt', type: 'text', props: { text: 'Items Description       Unit Price        Qnt          Total' }, style: { color: 'white', fontWeight: 'bold', fontSize: '12px', paddingLeft: '10px', paddingTop: '10px' }, x: 120, y: 300 },

            // Items Table
            {
                id: 'pink-items', type: 'invoice-items', props: {
                    items: [
                        { desc: 'Items Name\nLoreum ipsum dolor sit amet, consectetuer adipiscing...', qty: 1, price: 0 },
                        { desc: 'Items Name\nDuis autem vel eum iriure dolor in hendrerit in...', qty: 1, price: 0 }
                    ],
                    cellStyle: { fontSize: '12px', padding: '15px 0' }
                }, style: { width: '634px', border: 'none' }, x: 120, y: 340
            },

            // Totals Section
            { id: 'pink-subtotal', type: 'text', props: { text: 'SUBTOTAL :' }, style: { fontSize: '13px', textAlign: 'right', fontWeight: 'bold' }, x: 500, y: 580 },
            { id: 'pink-vat', type: 'text', props: { text: 'Tax VAT 15% :' }, style: { fontSize: '13px', textAlign: 'right' }, x: 500, y: 610 },
            { id: 'pink-disc', type: 'text', props: { text: 'DISCOUNT 5% :' }, style: { fontSize: '13px', textAlign: 'right' }, x: 500, y: 640 },

            // Total Due Box
            { id: 'pink-due-box', type: 'container', props: { hidePlaceholder: true }, style: { width: '300px', height: '48px', backgroundColor: '#d8b4bc', borderRadius: '4px' }, x: 454, y: 680 },
            { id: 'pink-due-lbl', type: 'text', props: { text: 'TOTAL DUE :' }, style: { color: 'white', fontWeight: 'bold', fontSize: '16px' }, x: 474, y: 694 },
            { id: 'pink-due-val', type: 'text', props: { text: '$ 000,00' }, style: { color: 'white', fontWeight: 'bold', textAlign: 'right', fontSize: '16px', width: '100px' }, x: 620, y: 694 },

            { id: 'pink-footer-txt', type: 'text', props: { text: 'Thank you for your business' }, style: { fontSize: '12px', fontStyle: 'italic', color: '#666' }, x: 120, y: 920 },
        ]
    },
    globex: {
        id: 'template-globex',
        background: 'white',
        blocks: [
            // Dark Header Bar
            { id: 'glob-head', type: 'container', props: { hidePlaceholder: true }, style: { width: '794px', height: '260px', backgroundColor: '#1e293b' }, x: 0, y: 0 },
            { id: 'glob-logo-icon', type: 'container', props: { hidePlaceholder: true }, style: { width: '40px', height: '40px', border: '3px solid white', borderRadius: '4px' }, x: 60, y: 60 },
            { id: 'glob-logo', type: 'header', props: { text: 'GLOBEX' }, style: { fontSize: '36px', fontWeight: 'bold', color: 'white' }, x: 60, y: 105 },
            { id: 'glob-slogan', type: 'text', props: { text: 'IDEA FOR INVOICE' }, style: { color: '#94a3b8', fontSize: '12px', letterSpacing: '4px', fontWeight: 'bold' }, x: 60, y: 145 },

            { id: 'glob-title', type: 'header', props: { text: 'INVOICE' }, style: { fontSize: '56px', color: 'white', textAlign: 'right', fontWeight: 'bold', letterSpacing: '2px' }, x: 450, y: 60 },
            { id: 'glob-inv-data', type: 'text', props: { text: 'INVOICE NO : #123456\nDATE : 01/01/2020' }, style: { color: 'white', fontSize: '13px', textAlign: 'right', lineHeight: '1.6' }, x: 550, y: 145 },

            // Invoice To
            { id: 'glob-to-lbl', type: 'text', props: { text: 'Invoice To' }, style: { fontSize: '16px', fontWeight: 'bold' }, x: 100, y: 300 },
            { id: 'glob-to-val', type: 'text', props: { text: 'Mr. WILLIAM\n123 East Street, Richmond,\nNew York, 22601\ndominicwilliams@gmail.com' }, style: { fontSize: '13px', color: '#4b5563', lineHeight: '1.6' }, x: 100, y: 330 },

            { id: 'glob-due-lbl', type: 'text', props: { text: 'DUE DATE : 01/01/2021\nTOTAL DUE : $ 1320' }, style: { fontSize: '13px', fontWeight: 'bold', textAlign: 'right' }, x: 480, y: 300 },

            // Table Header Accent
            { id: 'glob-th-bg', type: 'container', props: { hidePlaceholder: true }, style: { width: '634px', height: '40px', backgroundColor: '#334155', borderRadius: '4px' }, x: 80, y: 440 },
            // Table
            {
                id: 'glob-items', type: 'invoice-items', props: {
                    items: [
                        { desc: 'Web Designs', qty: 1, price: 100 },
                        { desc: 'Logo Designs', qty: 2, price: 100 },
                        { desc: 'Flyer Designs', qty: 4, price: 100 },
                        { desc: 'Graphic Designs', qty: 3, price: 100 },
                        { desc: 'Stationary Designs', qty: 2, price: 100 }
                    ],
                    cellStyle: { padding: '12px 10px', fontSize: '13px' }
                }, style: { width: '634px', border: 'none', color: '#334155' }, x: 80, y: 440
            },

            // Totals
            { id: 'glob-sub', type: 'text', props: { text: 'SUB TOTAL : $ 1200' }, style: { fontSize: '13px', textAlign: 'right', fontWeight: 'bold' }, x: 500, y: 760 },
            { id: 'glob-tax', type: 'text', props: { text: 'TAX 10% : $ 120' }, style: { fontSize: '13px', textAlign: 'right', fontWeight: 'bold', padding: '10px', backgroundColor: '#f1f5f9', borderRadius: '4px', width: '130px' }, x: 534, y: 790 },
            { id: 'glob-total', type: 'text', props: { text: 'GRAND TOTAL : $ 1320' }, style: { fontSize: '15px', textAlign: 'right', fontWeight: 'bold', color: '#1e293b' }, x: 500, y: 840 },

            { id: 'glob-footer', type: 'text', props: { text: 'THANK YOU FOR YOUR BUSINESS' }, style: { fontSize: '12px', fontWeight: 'bold', color: '#334155', textAlign: 'center', width: '634px' }, x: 80, y: 1000 },
        ]
    }
};
