export function compileTemplateToHtml(template: any, overrides: Record<string, any> = {}): string {
    const blocks = template.blocks || [];
    let htmlStr = '';

    const renderStyle = (style: any) => {
        if (!style) return '';
        return Object.entries(style)
            .map(([k, v]) => {
                // Convert camelCase to kebab-case
                const kebabKey = k.replaceAll(/([A-Z])/g, '-$1').toLowerCase();
                return `${kebabKey}: ${v};`;
            })
            .join(' ');
    };

    const renderBlock = (block: any): string => {
        const props = { ...block.props, ...(overrides[block.id]) };
        const styleStr = renderStyle(block.style);

        switch (block.type) {
            case 'header':
                return `<h1 style="${styleStr}">${props.text || ''}</h1>`;
            case 'text':
                return `<p style="${styleStr}">${props.text || ''}</p>`;
            case 'divider':
                return `<hr style="border-top: 2px solid #e5e7eb; margin: 16px 0; ${styleStr}" />`;
            case 'logo':
                if (props.url) {
                    return `<div style="${styleStr}"><img src="${props.url}" style="width: ${props.width || '150px'}; max-width: 100%;" /></div>`;
                }
                return `<div style="${styleStr}"></div>`;
            case 'invoiceData': // Assume this is the items/totals block
            case 'invoiceItems': {
                const items = props.items || [];
                let rows = '';
                items.forEach((item: any) => {
                    const price = Number(item.price) || 0;
                    const qty = Number(item.qty) || 0;
                    const total = (price * qty).toFixed(2);
                    rows += `
                        <tr style="border-bottom: 1px solid #f3f4f6;">
                            <td style="padding: 8px;">${item.desc || ''}</td>
                            <td style="padding: 8px;">${qty}</td>
                            <td style="padding: 8px;">$${price.toFixed(2)}</td>
                            <td style="padding: 8px; text-align: right;">$${total}</td>
                        </tr>
                    `;
                });
                return `
                    <table style="width: 100%; border-collapse: collapse; ${styleStr}">
                        <thead>
                            <tr style="border-bottom: 2px solid #e5e7eb; text-align: left;">
                                <th style="padding: 8px;">Description</th>
                                <th style="padding: 8px;">Qty</th>
                                <th style="padding: 8px;">Price</th>
                                <th style="padding: 8px; text-align: right;">Total</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                `;
            }
            case 'totals': {
                const subtotal = Number(props.subtotal) || 0;
                const tax = Number(props.tax) || 0;
                const total = subtotal + tax;
                const width = block.style?.width || '250px';

                return `
                    <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px; ${styleStr}">
                        <div style="display: flex; justify-content: space-between; padding: 4px 0; width: ${width};">
                            <span>Subtotal:</span><span>$${subtotal.toFixed(2)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 4px 0; width: ${width};">
                            <span>Tax:</span><span>$${tax.toFixed(2)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-top: 2px solid #e5e7eb; font-weight: bold; width: ${width};">
                            <span>Total:</span><span>$${total.toFixed(2)}</span>
                        </div>
                    </div>
                `;
            }
            case 'container': {
                const childrenHtml = (block.children || []).map((childId: string) => {
                    const child = blocks.find((b: any) => b.id === childId);
                    return child ? renderBlock(child) : '';
                }).join('');
                return `<div style="position: relative; width: 100%; min-height: 50px; ${styleStr}">${childrenHtml}</div>`;
            }
            default:
                return '';
        }
    };

    // Render top-level blocks only
    const topLevelBlocks = blocks.filter((b: any) => !blocks.some((parent: any) => parent.children?.includes(b.id)));

    topLevelBlocks.forEach((block: any) => {
        htmlStr += renderBlock(block);
    });

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 40px; background: ${template.background || '#ffffff'}; }
                * { box-sizing: border-box; }
            </style>
        </head>
        <body>
            <div style="max-width: 800px; margin: 0 auto; background: white; min-height: 1000px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); padding: 40px;">
                ${htmlStr}
            </div>
        </body>
        </html>
    `;
}
