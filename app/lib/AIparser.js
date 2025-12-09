/**
 * Parse Shopify rich text metafield to plain text
 * @param {string} value - JSON string of rich text
 * @returns {string} Plain text content
 */
export function parseRichText(value) {
    if (!value) return '';

    try {
        const richText = JSON.parse(value);
        return walkRichTextNode(richText);
    } catch (error) {
        console.error('Error parsing rich text:', error);
        return '';
    }
}

/**
 * Recursively walk rich text nodes
 */
function walkRichTextNode(node) {
    if (!node) return '';

    if (node.type === 'text') {
        return node.value || '';
    }

    if (node.type === 'root' || node.type === 'paragraph') {
        return (node.children || []).map(walkRichTextNode).join('');
    }

    if (node.type === 'list') {
        return (node.children || [])
            .map((item) => `• ${walkRichTextNode(item)}`)
            .join('\n');
    }

    if (node.type === 'list-item') {
        return (node.children || []).map(walkRichTextNode).join('');
    }

    if (node.type === 'heading') {
        const text = (node.children || []).map(walkRichTextNode).join('');
        return `\n${text}\n`;
    }

    // Default: process children
    if (Array.isArray(node.children)) {
        return node.children.map(walkRichTextNode).join('');
    }

    return '';
}