/**
 * Enhanced Download Functionality Script
 * Enables downloading of PNG images when clicked
 * Also supports explicit download buttons
 */

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
    let currentApiUrl = null; // store last generated URL

    // Tab switching
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
    generateBtn.addEventListener('click', function () {
        const activeTab = document.querySelector('.qr-tab.active').getAttribute('data-tab');
        let inputValue = '';

        if (activeTab === 'link') {
            inputValue = document.querySelector('#linkTab input').value;
            currentQRData = { url: inputValue };
        } else if (activeTab === 'email') {
            inputValue = document.querySelector('#emailTab input').value;
            currentQRData = { email: inputValue };
        } else {
            inputValue = document.querySelector('#textTab textarea').value;
            currentQRData = { text: inputValue };
        }

        if (!inputValue.trim()) {
            qrPreview.innerHTML = '<p class="text-danger">Please enter a value</p>';
            return;
        }

        const encodedData = encodeURIComponent(inputValue);
        currentApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedData}`;

        qrPreview.innerHTML = '<div class="spinner-border text-primary" role="status"></div>';

        // Load QR image
        const img = new Image();
        img.src = currentApiUrl;
        img.className = "img-fluid";
        img.alt = "Generated QR Code";

        img.onload = async function () {
            qrPreview.innerHTML = '';
            qrPreview.appendChild(img);

            // Fetch as blob for downloading
            const response = await fetch(currentApiUrl);
            currentQRBlob = await response.blob();
        };
    });

    // Download functionality
    downloadOptions.forEach(option => {
        option.addEventListener('click', async function(e) {
            e.preventDefault();
            
            if (!currentQRData) {
                alert('Please generate a QR code first');
                return;
            }

            const format = this.textContent.trim().toLowerCase();
            await downloadQR(format, currentQRData);
        });
    });

    // Helper: Generate filename
    function makeFilename(data) {
        let filename = 'qrcode';

        if (data.url) {
            try {
                const urlObj = new URL(data.url);
                filename = `qr-url-${urlObj.hostname.replace('www.', '')}`;
            } catch {
                filename = `qr-url-${data.url.substring(0, 20).replace(/[^a-z0-9]/gi, '_')}`;
            }
        }
        else if (data.email) {
            filename = `qr-email-${data.email.split('@')[0]}`;
        }
        else if (data.text) {
            filename = `qr-text-${data.text.substring(0, 20).replace(/[^a-z0-9]/gi, '_')}`;
        }

        return filename;
    }

    // Download QR function
    async function downloadQR(format, data) {
        let filename = makeFilename(data);

        let urlToFetch = currentApiUrl;

        // Adjust format
        if (format === 'svg') {
            urlToFetch = urlToFetch.replace('create-qr-code/', 'create-qr-code/?format=svg&');
            filename += '.svg';
        } else if (format === 'pro') {
            urlToFetch = urlToFetch.replace('200x200', '1000x1000'); // higher quality PNG
            filename += '-pro.png';
        } else {
            filename += '.png';
        }

        // Fetch fresh blob if needed
        const response = await fetch(urlToFetch);
        const blob = await response.blob();

        // Download
        const a = document.createElement('a');
        const url = URL.createObjectURL(blob);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();

        // Cleanup
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }
});
