export type BlockType = 'text' | 'header' | 'divider' | 'invoice-items' | 'totals' | 'container' | 'logo';

export interface Block {
    id: string;
    type: BlockType;
    props: Record<string, any>;
    style: Record<string, any>; // Simplified for backend (no React dependency)
    x: number;
    y: number;
    parentId?: string;
}

export interface InvoiceDocument {
    id: string;
    name?: string;
    blocks: Block[];
    background?: string;
}
