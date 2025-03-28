/**
 * Enhanced Download Functionality Script
 * Enables downloading of PNG images when clicked
 * Also supports explicit download buttons
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const generateBtn = document.getElementById('generateBtn');
    const qrPreview = document.getElementById('qrPreview');
    const downloadOptions = document.querySelectorAll('.download-option');
    let currentQRBlob = null;
    let currentQRData = null;

    // Tab switching functionality
    document.querySelectorAll('.qr-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.qr-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('show', 'active'));
            
            const tabId = this.getAttribute('data-tab') + 'Tab';
            document.getElementById(tabId).classList.add('show', 'active');
        });
    });

    // Generate QR Code
    generateBtn.addEventListener('click', async function() {
        const activeTab = document.querySelector('.qr-tab.active').getAttribute('data-tab');
        let data = {};

        // Get data from active tab
        switch(activeTab) {
            case 'link':
                data.url = document.querySelector('#linkTab input').value;
                break;
            case 'email':
                data.email = document.querySelector('#emailTab input').value;
                break;
            case 'text':
                data.text = document.querySelector('#textTab textarea').value;
                break;
        }

        // Validate input
        if (!validateInput(data, activeTab)) {
            alert('Please enter valid input data');
            return;
        }

        try {
            generateBtn.disabled = true;
            generateBtn.textContent = 'Generating...';
            qrPreview.innerHTML = '<div class="spinner-border text-primary" role="status"></div>';

            // Send to backend
            const response = await fetch('http://localhost:3000/generate-qr', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data })
            });

            if (!response.ok) {
                throw new Error('Failed to generate QR code');
            }

            const blob = await response.blob();
            currentQRBlob = blob;
            currentQRData = data;

            // Display QR code
            const imageUrl = URL.createObjectURL(blob);
            qrPreview.innerHTML = `<img src="${imageUrl}" class="img-fluid" alt="Generated QR Code">`;
            
        } catch (error) {
            console.error('Error:', error);
            qrPreview.innerHTML = `<p class="text-danger">Error: ${error.message}</p>`;
        } finally {
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate QR Code';
        }
    });

    // Download functionality - Updated to work with your HTML structure
    downloadOptions.forEach(option => {
        // First remove any existing click handlers
        const newOption = option.cloneNode(true);
        option.parentNode.replaceChild(newOption, option);
        
        // Add new click handler
        newOption.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (!currentQRBlob) {
                alert('Please generate a QR code first');
                return;
            }

            const format = this.textContent.toLowerCase();
            downloadQR(currentQRBlob, format, currentQRData);
        });
    });

    // Helper functions
    function validateInput(data, tab) {
        switch(tab) {
            case 'link':
                return data.url && isValidUrl(data.url);
            case 'email':
                return data.email && isValidEmail(data.email);
            case 'text':
                return data.text && data.text.trim() !== '';
            default:
                return false;
        }
    }

    function isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function downloadQR(blob, format, data) {
        let filename = 'qrcode';
        
        // Create meaningful filename based on content
        if (data.url) {
            try {
                const urlObj = new URL(data.url);
                filename = `qr-url-${urlObj.hostname.replace('www.', '')}`;
            } catch {
                filename = `qr-url-${data.url.substring(0, 20).replace(/[^a-z0-9]/gi, '_')}`;
            }
        }
        else if (data.email) filename = `qr-email-${data.email.split('@')[0]}`;
        else if (data.text) filename = `qr-text-${data.text.substring(0, 20).replace(/[^a-z0-9]/gi, '_')}`;
        
        // Handle different download formats
        switch(format) {
            case 'png':
                filename += '.png';
                break;
            case 'svg':
                // In a real implementation, you would need to generate SVG format from your backend
                alert('SVG download would be implemented here - connect to your backend');
                return;
            case 'pro':
                // For PRO version (higher quality)
                alert('PRO version would use higher quality settings - connect to your backend');
                return;
            default:
                filename += '.png';
        }

        // Create download link and trigger click
        const a = document.createElement('a');
        const url = URL.createObjectURL(blob);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }
});