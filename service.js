// service.js

const QRCode = require('qrcode');

exports.formatData = (data) => {
    if (!data) {
        throw new Error('No data provided');
    }

    // Check for empty values in all possible fields
    if (data.url && typeof data.url === 'string' && data.url.trim() !== '') {
        return data.url;
    } else if (data.email && typeof data.email === 'string' && data.email.trim() !== '') {
        return `mailto:${data.email.trim()}`;
    } else if (data.text && typeof data.text === 'string' && data.text.trim() !== '') {
        return data.text.trim();
    } else if (data.id && data.price && 
               typeof data.id === 'string' && data.id.trim() !== '' && 
               typeof data.price === 'string' && data.price.trim() !== '') {
        return `Product ID: ${data.id.trim()}, Price: $${data.price.trim()}`;
    }

    throw new Error('No valid data provided for QR generation');
};

exports.generateQRCode = async (qrCodeText) => {
    try {
        if (!qrCodeText || typeof qrCodeText !== 'string' || qrCodeText.trim() === '') {
            throw new Error('Invalid or empty text for QR code');
        }

        const options = {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            margin: 2,
            width: 300,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        };

        return await QRCode.toBuffer(qrCodeText, options);
    } catch (err) {
        console.error('QR Generation Error:', err);
        throw err;
    }
};