//controller.js
const service = require('./service');

exports.generateQR = async (req, res) => {
    try {
        const { data } = req.body;

        if (!data) {
            return res.status(400).json({ error: 'No data provided' });
        }

        const qrCodeText = service.formatData(data);
        const qrCodeBuffer = await service.generateQRCode(qrCodeText);

        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', 'inline; filename=qrcode.png');
        res.send(qrCodeBuffer);
    } catch (err) {
        console.error('Error generating QR code:', err);
        res.status(400).json({ 
            error: err.message || 'Failed to generate QR code',
            details: err.stack
        });
    }
};
