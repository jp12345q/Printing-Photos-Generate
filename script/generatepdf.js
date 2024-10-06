// This script is a picture tranfer into pdf file
// Like generate for layout, paper, picture, sizing.
fetch('form/imageform.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('inputform').innerHTML = data;

    const imageUploadInput = document.getElementById('imageUpload');
    const imageCountMessage = document.getElementById('imageCountMessage');
    let uploadedImages = [];

    // Update the image count message and store the images
    imageUploadInput.addEventListener('change', function() {
    const newFiles = Array.from(imageUploadInput.files);
    uploadedImages = [...uploadedImages, ...newFiles];  // Accumulate the images
    imageCountMessage.textContent = `${uploadedImages.length} image(s) added.`;
    });

    document.getElementById('clearButton').addEventListener('click', function() {
        // Clear image upload input
        document.getElementById('imageUpload').value = '';

        // Clear the image count message
        document.getElementById('imageCountMessage').textContent = 'No images added.';

        // Clear the uploadedImages array
        uploadedImages = [];

        // Reset form fields (paper size, orientation, picture size, and layout)
        document.getElementById('paper_size').selectedIndex = 0;
        document.getElementById('orientation').selectedIndex = 0;
        document.getElementById('picture_size').selectedIndex = 0;
        document.getElementById('layout').selectedIndex = 0;

        // Clear the PDF preview iframe
        document.getElementById('pdfPreview').src = '';

        // Clear the canvas (optional, depending on your layout)
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    window.generatePDF = async function() { 
        const { jsPDF } = window.jspdf;

        const paperSize = document.getElementById('paper_size').value;
        const orientation = document.getElementById('orientation').value;
        const pictureSize = document.getElementById('picture_size').value;
        const layout = document.getElementById('layout').value;

        // Determine the page size and orientation
        let doc;
        if (paperSize === 'A4') {
            doc = new jsPDF({
                orientation: orientation,
                unit: 'mm',
                format: 'a4' // A4 size in mm
            });
        } else if (paperSize === 'Legal') {
            doc = new jsPDF({
                orientation: orientation,
                unit: 'mm',
                format: [216, 356]  // Legal size in mm
            });
        } else if (paperSize === 'Letter') {
            doc = new jsPDF({
                orientation: orientation,
                unit: 'mm',
                format: 'letter' // letter aka short bond paper size in mm
            });
        }

        // Picture size in mm
        let imgWidth, imgHeight;
        if (pictureSize === '1x1') {
            imgWidth = 25.4;
            imgHeight = 25.4;
        } else if (pictureSize === '2x2') {
            imgWidth = 50.8;
            imgHeight = 50.8;
        } else if (pictureSize === 'wallet') {
            imgWidth = 50.8;
            imgHeight = 76.2;
        } else if (pictureSize === '2r') {
            imgWidth = 63.5;
            imgHeight = 88.9;
        } else if (pictureSize === '3r') {
            imgWidth = 88.9;
            imgHeight = 127;
        } else if (pictureSize === '4r') {
            imgWidth = 101.6;
            imgHeight = 152.4;
        } else if (pictureSize === '5r') {
            imgWidth = 127;
            imgHeight = 177.8;
        } else if (pictureSize === '6r') {
            imgWidth = 152.4;
            imgHeight = 203.2;
        } else if (pictureSize === '8r') {
            imgWidth = 203.2;
            imgHeight = 254;
        }

        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');

        // Determine the layout (rows and columns)
        let cols, rows;
        if (layout === '1x1') {
            rows = 1; cols = 1;
        } else if (layout === '1x2') {
            rows = 2; cols = 1;
        } else if (layout === '1x3') {
            rows = 3; cols = 1;
        } else if (layout === '2x1') {
            rows = 1; cols = 2;
        } else if (layout === '2x2') {
            rows = 2; cols = 2;
        } else if (layout === '2x3') {
            rows = 3; cols = 2;
        } else if (layout === '3x2') {
            rows = 2; cols = 3;
        } else if (layout === '3x3') {
            rows = 3; cols = 3;
        } else if (layout === '3x4') {
            rows = 3; cols = 4;
        }

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const cellWidth = pageWidth / cols;
        const cellHeight = pageHeight / rows;

        for (let i = 0; i < uploadedImages.length; i++) {
            const image = uploadedImages[i];
            const img = new Image();
            const url = URL.createObjectURL(image);
            
            img.src = url;
        
            await new Promise((resolve) => {
                img.onload = () => {
                    // Higher resolution factor to enhance quality further
                    const higherResolutionFactor = 4;  // 4x resolution for better image quality
                    const enhancedImgWidth = imgWidth * higherResolutionFactor;
                    const enhancedImgHeight = imgHeight * higherResolutionFactor;
        
                    // Set canvas to higher resolution
                    canvas.width = enhancedImgWidth;
                    canvas.height = enhancedImgHeight;
        
                    // Draw the image onto the canvas at enhanced resolution
                    ctx.drawImage(img, 0, 0, enhancedImgWidth, enhancedImgHeight);
        
                    // Convert to PNG for maximum quality and lossless compression
                    const imgData = canvas.toDataURL('image/png', 1.0);  // 1.0 ensures maximum quality for PNG
        
                    //Remaining picture tranfer to next paper
                    const col = i % cols;
                    const row = Math.floor((i % (cols * rows)) / cols);
        
                    // Center the image on the page
                    const xOffset = (cellWidth - imgWidth) / 2;
                    const yOffset = (cellHeight - imgHeight) / 2;
        
                    const x = col * cellWidth + xOffset;
                    const y = row * cellHeight + yOffset;
        
                    // Add image to the PDF 
                    doc.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight, undefined, 'NONE');
                    resolve();
                };
            });
        
            // Logic to add a new page if needed after the current one is full
            if ((i + 1) % (cols * rows) === 0 && i < uploadedImages.length - 1) {
                doc.addPage(); // Move to the next page after filling the current one
            }
        }

        // Preview the generated PDF in the iframe
        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        document.getElementById('pdfPreview').src = pdfUrl;
    }
});