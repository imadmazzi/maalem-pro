
export type QuoteStatus = 'draft' | 'sent' | 'paid' | 'unpaid' | 'rejected' | 'deposit_only' | 'accepted' | 'cancelled';

export interface BusinessProfile {
    name: string;
    phone: string;
    email: string;
    address: string;
    logo?: string;
    ice?: string; // Auto-Entrepreneur/ICE number
    patent?: string;
    rc?: string;
}

export interface Client {
    id: string;
    name: string;
    phone: string;
    address?: string;
    email?: string;
    ice?: string;
}

export interface Service {
    id: string;
    name: string;
    unitPrice: number;
    unit?: string; // e.g., 'm2', 'h', 'pcs'
    description?: string;
}

export interface QuoteItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
}

export interface Quote {
    id: string;
    number: string;
    date: string;
    dueDate?: string;
    clientId: string;
    clientName: string; // Denormalized for simpler display
    items: QuoteItem[];
    subtotal: number;
    tvaRate: number; // 0 or 20 usually
    tvaAmount: number;
    total: number;
    deposit?: number; // Advance Payment (Arboun)
    signature?: string; // Client Signature (Base64)
    status: QuoteStatus;
    notes?: string;
}


