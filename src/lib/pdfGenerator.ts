import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Quote, BusinessProfile } from './types';
import ArabicReshaper from 'arabic-reshaper';
import bidiFactory from 'bidi-js';

// Font URL for Amiri (Regular) - Better for PDF Generation
const FONT_URL = 'https://fonts.gstatic.com/s/amiri/v26/J7aRnpd8CGxBHpUrtLMA7w.ttf';


// Initialize Bidi support
let bidi: any = null;
let isFontLoaded = false;

const initBidi = async () => {
    if (!bidi) {
        bidi = await bidiFactory();
    }
};

const processArabic = (text: string): string => {
    if (!text) return text;

    // If font didn't load, return original text to avoid garbled "þ" characters (WinAnsi fallback)
    // At least disconnected Arabic is readable-ish compared to garbage.
    if (!isFontLoaded) return text;

    // Check if text contains Arabic characters
    const hasArabic = /[\u0600-\u06FF]/.test(text);

    if (hasArabic) {
        try {
            // 1. Reshape
            let shaped = text;
            if (typeof ArabicReshaper === 'object' && typeof (ArabicReshaper as any).convertArabic === 'function') {
                shaped = (ArabicReshaper as any).convertArabic(text);
            } else if (typeof ArabicReshaper === 'function') {
                shaped = (ArabicReshaper as any)(text);
            }

            // 2. Reorder
            if (bidi) {
                const levels = bidi.getEmbeddingLevels(shaped, 'rtl');
                return bidi.getReorderedString(shaped, levels, 'rtl');
            }
            return shaped.split('').reverse().join('');
        } catch (e) {
            console.error("Error processing Arabic text:", e);
            return text;
        }
    }
    return text;
};

const fetchFont = async (url: string): Promise<string> => {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch font');
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                resolve(result.split(',')[1]);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Error loading font:', error);
        return '';
    }
};


const createQuoteDoc = async (quote: Quote, business: BusinessProfile): Promise<jsPDF> => {
    // Ensure Bidi is ready
    await initBidi();

    const doc = new jsPDF();

    // Load and Add Arabic Font
    let fontBase64 = '';
    try {
        fontBase64 = await fetchFont(FONT_URL);
        if (fontBase64) {
            doc.addFileToVFS('Amiri.ttf', fontBase64);
            doc.addFont('Amiri.ttf', 'Amiri', 'normal');
            doc.setFont('Amiri');
            isFontLoaded = true;
        } else {
            throw new Error("Empty font data");
        }
    } catch (e) {
        console.error("CRITICAL: Arabic font failed to load.", e);
        isFontLoaded = false;
        alert("Erreur: La police arabe n'a pas pu être chargée. Le texte pourrait être incorrect. Vérifiez votre connexion internet.");
    }

    // --- Header Section ---

    // Logo (Top Left)
    if (business.logo) {
        try {
            const logoSize = 30;
            doc.addImage(business.logo, 'JPEG', 14, 15, logoSize, logoSize);
        } catch (e) {
            console.error("Error adding logo to PDF", e);
            doc.setFillColor(240, 240, 240);
            doc.rect(14, 15, 30, 30, 'F');
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text("LOGO", 29, 32, { align: "center", angle: 45 });
        }
    } else {
        doc.setFillColor(240, 240, 240);
        doc.rect(14, 15, 30, 30, 'F');
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text("LOGO", 29, 32, { align: "center", angle: 45 });
    }

    // Business Info
    const infoX = 50;
    doc.setFontSize(18);
    doc.setTextColor(0, 35, 102); // Royal Blue
    doc.setFont('Amiri'); // Ensure Arabic font is active
    doc.text(processArabic(business.name), infoX, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(processArabic(business.address), infoX, 27);
    doc.text(`${business.phone} | ${business.email}`, infoX, 32);
    doc.text(`ICE: ${business.ice || 'N/A'}`, infoX, 37);

    // Quote Info
    doc.setFontSize(22);
    doc.setTextColor(0, 35, 102);
    doc.text("DEVIS", 195, 25, { align: "right" });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`N°: ${quote.number}`, 195, 35, { align: "right" });
    doc.text(`Date: ${new Date(quote.date).toLocaleDateString('fr-MA')}`, 195, 40, { align: "right" });

    // Dividers
    doc.setDrawColor(200);
    doc.line(14, 55, 196, 55);

    // --- Client Info Section ---
    doc.setFontSize(12);
    doc.setTextColor(0, 35, 102);
    doc.text("Client:", 14, 65);

    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text(processArabic(quote.clientName), 14, 72);
    // Address placeholder if available in future
    // doc.text(quote.clientAddress, 14, 77);

    // --- Items Table ---
    const tableColumn = ["Description", "Qté", "Prix Unit. (DH)", "Total (DH)"];
    const tableRows: any[] = quote.items.map(item => [
        processArabic(item.description),
        item.quantity,
        item.unitPrice.toFixed(2),
        (item.quantity * item.unitPrice).toFixed(2)
    ]);

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 90,
        theme: 'grid',
        styles: {
            font: fontBase64 ? 'Amiri' : 'helvetica',
            fontSize: 10,
            cellPadding: 3,
        },
        headStyles: {
            fillColor: [0, 35, 102],
            textColor: 255,
            fontStyle: 'bold'
        },
        columnStyles: {
            0: { cellWidth: 'auto' }, // Description
            1: { cellWidth: 20, halign: 'center' }, // Qty
            2: { cellWidth: 30, halign: 'right' }, // Unit Price
            3: { cellWidth: 35, halign: 'right' }, // Total
        },
        margin: { left: 14, right: 14 }
    });

    // --- Totals Section ---
    const finalY = (doc as any).lastAutoTable.finalY + 10;

    // Draw box for totals
    const boxWidth = 80;
    const boxX = 196 - boxWidth;

    doc.setFillColor(248, 248, 250);
    const boxHeight = (quote.deposit && quote.deposit > 0) ? 60 : 35;
    doc.rect(boxX, finalY, boxWidth, boxHeight, 'F');

    doc.setFontSize(10);
    doc.setTextColor(50);

    // Total HT
    doc.text("Total HT:", boxX + 5, finalY + 8);
    doc.text(`${quote.subtotal.toFixed(2)} DH`, 191, finalY + 8, { align: "right" });

    // TVA
    doc.text(`TVA (${quote.tvaRate}%):`, boxX + 5, finalY + 16);
    doc.text(`${quote.tvaAmount.toFixed(2)} DH`, 191, finalY + 16, { align: "right" });

    doc.setDrawColor(200);
    doc.line(boxX + 5, finalY + 22, 191, finalY + 22);

    // Total TTC
    doc.setFontSize(12);
    doc.setTextColor(0, 35, 102);
    doc.setFont(fontBase64 ? 'Amiri' : 'helvetica', 'bold');
    doc.text("Total TTC:", boxX + 5, finalY + 30);
    doc.text(`${quote.total.toFixed(2)} DH`, 191, finalY + 30, { align: "right" });

    // Advance & Remaining
    if (quote.deposit && quote.deposit > 0) {
        const remaining = quote.total - quote.deposit;

        doc.setDrawColor(200);
        doc.line(boxX + 5, finalY + 36, 191, finalY + 36);

        // Advance
        doc.setFontSize(10);
        doc.setTextColor(50);
        doc.setFont(fontBase64 ? 'Amiri' : 'helvetica', 'normal');
        doc.text("Avance:", boxX + 5, finalY + 42);
        doc.text(`- ${quote.deposit.toFixed(2)} DH`, 191, finalY + 42, { align: "right" });

        // Remaining
        doc.setFontSize(12);
        doc.setTextColor(0, 35, 102);
        doc.setFont(fontBase64 ? 'Amiri' : 'helvetica', 'bold');
        doc.text("Reste à payer:", boxX + 5, finalY + 50);
        doc.text(`${remaining.toFixed(2)} DH`, 191, finalY + 50, { align: "right" });

        // Redraw box outline if needed, but fill is mostly enough
    }


    // --- Footer & Signature ---
    const pageHeight = doc.internal.pageSize.height;

    // Notes / Terms
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.setFont(fontBase64 ? 'Amiri' : 'helvetica', 'normal');
    doc.text("Conditions de paiement: Avance à la commande, solde à la livraison.", 14, finalY + 20);
    doc.text("Validité de l'offre: 15 jours.", 14, finalY + 25);

    // Signature Area
    const signY = Math.max(finalY + 50, 220); // Push down but ensure space
    doc.setFontSize(10);
    doc.setTextColor(0);

    doc.text("Bon pour accord", 14, signY);

    if (quote.signature) {
        try {
            // Signature is expected to be a data URL (PNG)
            doc.addImage(quote.signature, 'PNG', 14, signY + 2, 40, 20);
        } catch (e) {
            console.error("Error adding signature to PDF", e);
            doc.text("Signature Client", 14, signY + 5);
        }
    } else {
        doc.text("Signature Client", 14, signY + 5);
    }

    doc.text("Signature du Professionnel", 140, signY);
    doc.text(processArabic(business.name), 140, signY + 5);

    // Bottom Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Merci de votre confiance.", 105, pageHeight - 10, { align: "center" });

    return doc;
};

export const generateQuotePDF = async (quote: Quote, business: BusinessProfile) => {
    const doc = await createQuoteDoc(quote, business);
    doc.save(`Devis_${quote.number}.pdf`);
};

export const generateQuoteBlob = async (quote: Quote, business: BusinessProfile): Promise<Blob> => {
    const doc = await createQuoteDoc(quote, business);
    return doc.output('blob');
};
