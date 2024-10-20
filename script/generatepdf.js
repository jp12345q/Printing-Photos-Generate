// This script is a picture tranfer into pdf file
// Like generate for layout, paper, picture, sizing.
fetch('form/imageform.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('inputform').innerHTML = data;

        let uploadedImages = [];

        // Get id from imageform.html
        const imageUploadInput = document.getElementById('imageUpload');
        const imageUrlInput = document.getElementById('imageUrl');
        const imageCountMessage = document.getElementById('imageCountMessage');

        // Function to update the image count message and list of images
        function updateImageCount() {
            imageCountMessage.textContent = `${uploadedImages.length} image(s) added.`;
            updateImageList(); 
        }

        // Function to update the dropdown with the uploaded images
        function updateImageList() {
            const imageDropdown = document.getElementById('imageDropdown');
            imageDropdown.innerHTML = ''; // Clear previous images

            uploadedImages.forEach((image, index) => {
                const imageItem = document.createElement('div');
                imageItem.className = 'image-item'; // Add a class for styling

                const imageName = document.createElement('span');
                imageName.textContent = image.name;
                
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.classList.add('delete-btn');
                
                // Delete image on button click
                deleteButton.addEventListener('click', () => {
                    uploadedImages.splice(index, 1); // Remove the image from the array
                    updateImageCount(); // Update the count message
                    updateImageList(); // Refresh the dropdown
                });

                imageItem.appendChild(imageName); // Add image name
                imageItem.appendChild(deleteButton); // Add delete button
                imageDropdown.appendChild(imageItem); // Add item to dropdown
            });
        }

        // Toggle image dropdown visibility
        document.getElementById('toggleImageListButton').addEventListener('click', () => {
            const imageDropdown = document.getElementById('imageDropdown');
            imageDropdown.style.display = imageDropdown.style.display === 'none' ? 'block' : 'none';
        });

        // Handle file input uploads (allow duplicates)
        imageUploadInput.addEventListener('change', function() {
            const newFiles = Array.from(imageUploadInput.files);
            
            newFiles.forEach(file => {
                uploadedImages.push(file);
            });

            imageUploadInput.value = '';
            updateImageCount();
            updateImageList(); // Update the dropdown list
        });
        

    // Handle file input uploads (allow duplicates)
    imageUploadInput.addEventListener('change', function() {
        const newFiles = Array.from(imageUploadInput.files);

        newFiles.forEach(file => {
            uploadedImages.push(file);
        });

        imageUploadInput.value = '';
        updateImageCount();
    });

    // Handle image URL input when pressing Enter
    imageUrlInput.addEventListener('keydown', async function(event) {
        if (event.key === 'Enter') {  // Trigger when Enter key is pressed
            const url = imageUrlInput.value;
            if (url) {
                try {
                    const response = await fetch(url);
                    const blob = await response.blob();

                    // Convert blob to file-like object and store it
                    const file = new File([blob], 'uploaded_image', { type: blob.type });
                    uploadedImages.push(file);
                    updateImageCount();
                    imageUrlInput.value = '';  // Clear the URL input field
                } catch (error) {
                    alert('Failed to load image from URL.');
                }
            }
        }
    });

        // Show or hide the glossy package options based on paper type selection
    document.getElementById('paperType').addEventListener('change', function() {
        const paperType = this.value;
        const glossyPackageDropdown = document.getElementById('glossyPackage');
        const layoutSelect = document.getElementById('layout');
        const pictureSizeSelect = document.getElementById('picture_size');
        const customSizeWidth = document.getElementById('customWidth');
        const customSizeHeight = document.getElementById('customHeight');
        
        // Show package dropdown if glossy paper is selected
        if (paperType === 'glossy') {
            glossyPackageDropdown.style.display = 'block';
            layoutSelect.disabled = true;
            pictureSizeSelect.disabled = true;
            customSizeWidth.disabled = true;
            customSizeHeight.disabled = true;
        } else {
            glossyPackageDropdown.style.display = 'none';
            layoutSelect.disabled = false;
            pictureSizeSelect.disabled = false;
            customSizeWidth.disabled = false;
            customSizeHeight.disabled = false;
        }
    });

    // Clear Button
    document.getElementById('clearButton').addEventListener('click', function() {
        // Clear image upload input
        document.getElementById('imageUpload').value = '';
        document.getElementById('imageUrl').value = '';
        imageCountMessage.textContent = 'No images added.'; // Reset message
        uploadedImages = [];  // Clear image array
        updateImageList(); 

        // Reset form fields
        document.getElementById('paper_size').selectedIndex = 0;
        document.getElementById('orientation').selectedIndex = 0;
        document.getElementById('picture_size').selectedIndex = 0;
        document.getElementById('layout').selectedIndex = 0;
        document.getElementById('paperType').selectedIndex = 0;
        document.getElementById('glossyPackage').style.display = 'none';
        document.getElementById('customHeight').value = '';
        document.getElementById('customWidth').value = '';

        const imageDropdown = document.getElementById('imageDropdown');
        imageDropdown.style.display = 'none';

        // Clear the PDF preview iframe
        document.getElementById('pdfPreview').src = '';

        // Clear the canvas (optional, depending on your layout)
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Re-enable the dropdowns and inputs
        const layoutSelect = document.getElementById('layout');
        const pictureSizeSelect = document.getElementById('picture_size');
        const customSizeWidth = document.getElementById('customWidth');
        const customSizeHeight = document.getElementById('customHeight');

        layoutSelect.disabled = false;
        pictureSizeSelect.disabled = false;
        customSizeWidth.disabled = false;
        customSizeHeight.disabled = false;

    });

    // Paste from clipboard functionality
    window.addEventListener('paste', (event) => {
        const clipboardItems = event.clipboardData.items;
        for (let item of clipboardItems) {
            if (item.type.startsWith('image/')) {
                const blob = item.getAsFile();
                const file = new File([blob], 'pasted_image', { type: blob.type });
                uploadedImages.push(file);
                updateImageCount();
            }
        }
    });

    //For the outline side the picture / glossy only trigger
    function drawDashedRect(doc, x, y, width, height, dashLength = 1) {
        const dashPattern = [dashLength, dashLength];
        doc.setDrawColor(0, 0, 0); 
        doc.setLineWidth(0.1); 
    
        doc.line(x, y, x + width, y, 'S'); 
        doc.line(x + width, y, x + width, y + height, 'S'); 
        doc.line(x + width, y + height, x, y + height, 'S'); 
        doc.line(x, y + height, x, y, 'S'); 
    }

    //For mobile device download link
    function isMobileDevice() {
        return /Mobi|Android/i.test(navigator.userAgent);
    }

    // Function for tranfer picture to pdf file
    window.generatePDF = async function() { 
        const { jsPDF } = window.jspdf;

        const paperSize = document.getElementById('paper_size').value;
        const orientation = document.getElementById('orientation').value;
        const pictureSize = document.getElementById('picture_size').value;
        const layout = document.getElementById('layout').value;
        const paperType = document.getElementById('paperType').value;
        const glossyPackage = document.getElementById('glossyPackage').value; 

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
        } else if (pictureSize === 'A4') {
            if (orientation === 'landscape') {
                imgWidth = 290;  
                imgHeight = 200; 
            } else {
                imgWidth = 200;
                imgHeight = 290;
            }
        } else if (pictureSize === 'Legal') {
            if (orientation === 'landscape'){
                imgWidth = 328;
                imgHeight = 210;
            } else {
                imgWidth = 210;
                imgHeight = 328;
            }
        }

        // Convert inches to pixels if custom dimensions are provided
        function inchesToPixels(inches) {
            const dpi = 96; // Standard DPI (Dots Per Inch)
            return inches * dpi;
        }

        // Check if the user provided custom dimensions
        const customWidthInches = parseFloat(document.getElementById('customWidth').value);
        const customHeightInches = parseFloat(document.getElementById('customHeight').value);

        if (!isNaN(customWidthInches) && !isNaN(customHeightInches)) {
            // Convert the custom dimensions from inches to mm
            imgWidth = inchesToPixels(customWidthInches) * 0.264583;  // 1 pixel = 0.264583 mm
            imgHeight = inchesToPixels(customHeightInches) * 0.264583;
        }

        console.log(`Image dimensions: ${imgWidth} mm width, ${imgHeight} mm height`);

        // show output using canvas
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');

        // Determine the layout (rows and columns)
        // Check if the orientation is landscape
        const isLandscape = (orientation === 'landscape');

        // Adjust columns and rows based on layout and orientation
        let cols, rows;

        if (layout === '1x1') {
            rows = 1; cols = 1;
        } else if (layout === '1x2') {
            rows = isLandscape ? 1 : 2; 
            cols = isLandscape ? 2 : 1;
        } else if (layout === '1x3') {
            rows = isLandscape ? 1 : 3; 
            cols = isLandscape ? 3 : 1;
        } else if (layout === '2x1') {
            rows = isLandscape ? 2 : 1; 
            cols = isLandscape ? 1 : 2;
        } else if (layout === '2x2') {
            rows = 2; cols = 2; // Same for both orientations
        } else if (layout === '2x3') {
            rows = isLandscape ? 2 : 3; 
            cols = isLandscape ? 3 : 2;
        } else if (layout === '3x2') {
            rows = isLandscape ? 3 : 2; 
            cols = isLandscape ? 2 : 3;
        } else if (layout === '3x3') {
            rows = 3; cols = 3; // Same for both orientations
        } else if (layout === '3x4') {
            rows = isLandscape ? 3 : 4; 
            cols = isLandscape ? 4 : 3;
        } else if (layout === '4x1') {
            rows = isLandscape ? 4 : 1; 
            cols = isLandscape ? 1 : 4;
        } else if (layout === '4x2') {
            rows = isLandscape ? 4 : 2; 
            cols = isLandscape ? 2 : 4;
        } else if (layout === '4x3') {
            rows = isLandscape ? 4 : 3; 
            cols = isLandscape ? 3 : 4;
        } else if (layout === '4x4') {
            rows = 4; cols = 4; // Same for both orientations
        }
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const canvasData = uploadedImages.map(image => URL.createObjectURL(image));
        const cellWidth = pageWidth / cols;
        const cellHeight = pageHeight / rows;

        // Handle glossy package options
        if (paperType === 'glossy') {
            if (glossyPackage === '2by2') {
                cols = 3;
                rows = 1;
                imgWidth = 58.8;
                imgHeight = 58.8;
                await handleGlossyPackage(uploadedImages, doc, cols, rows, 6, imgWidth, imgHeight, ctx, canvas);
            } else if (glossyPackage === '1by1') {
                cols = 5;
                rows = 2;
                imgWidth = 25.4;
                imgHeight = 25.4;
                await handleGlossyPackage(uploadedImages, doc, cols, rows, 10, imgWidth, imgHeight, ctx, canvas);
            } else if (glossyPackage === 'both') {
                // Handle 2by2 layout 
                cols = 4;
                rows = 1;
                imgWidth = 58.8;  
                imgHeight = 58.8;
                await handleGlossyPackage(uploadedImages, doc, cols, rows, 4, imgWidth, imgHeight, ctx, canvas);

                // Reset position for next row to prevent spacing issues
                const resetYPosition = true;
                // Handle 1by1 layout 
                cols = 4;
                rows = 1;
                imgWidth = 25.4; 
                imgHeight = 25.4; 
                await handleGlossyPackage(uploadedImages, doc, cols, rows, 4, imgWidth, imgHeight, ctx, canvas, resetYPosition);
            }
        }

        // Function to handle glossy package image placement
        async function handleGlossyPackage(images, doc, cols, rows, totalPieces, imgWidth, imgHeight, ctx, canvas, resetYPosition = false) {
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const cellWidth = pageWidth / cols;
            const cellHeight = imgHeight; 

            let yPosition = 8;  // This keeps track of the Y position for rows

            if (resetYPosition) {
                // Reset Y position when starting a new layout (e.g., from 2by2 to 1by1)
                yPosition = 70;
            }

            for (let i = 0; i < totalPieces; i++) {
                const image = images[i % images.length];
        
                if (image instanceof File || image instanceof Blob) {
                    const img = new Image();
                    const url = URL.createObjectURL(image);
                    img.src = url;
        
                    await new Promise(resolve => {
                        img.onload = () => {
                            const glossyResolutionFactor = 9; // Higher resolution for glossy paper
                            const enhancedImgWidth = imgWidth * glossyResolutionFactor;
                            const enhancedImgHeight = imgHeight * glossyResolutionFactor;
        
                            // Set canvas size for glossy
                            canvas.width = enhancedImgWidth;
                            canvas.height = enhancedImgHeight;
        
                            ctx.drawImage(img, 0, 0, enhancedImgWidth, enhancedImgHeight);
                            const imgData = canvas.toDataURL('image/png', 1.0);
        
                            const col = i % cols;
                            const row = Math.floor(i / cols);
                            
                            // No offsets for continuous placement, place images directly
                            const xOffset = 0;
                            const yOffset = 0;

                            const x = col * cellWidth + xOffset;
                            const y = row * cellHeight + yOffset + yPosition;
                
                            // Add image to the PDF
                            doc.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight, undefined, 'NONE');
                            // Draw dashed outline around the image
                            drawDashedRect(doc, x, y, imgWidth, imgHeight);
                            resolve();  
                        };
                    });
                }
            }
        }

        // Plain paper logic
        if (paperType === 'plain') {
            if (uploadedImages.length === 0) {
                document.getElementById('warningModal').style.display = 'block';
                return; // Early exit if there are no images
            }

            for (let i = 0; i < uploadedImages.length; i++) {
                const image = uploadedImages[i];
                const img = new Image();
                const url = URL.createObjectURL(image);

                img.src = url;

                await new Promise((resolve) => {
                    img.onload = () => {
                        // Higher resolution factor for better image quality
                        const higherResolutionFactor = 6;
                        const enhancedImgWidth = imgWidth * higherResolutionFactor;
                        const enhancedImgHeight = imgHeight * higherResolutionFactor;

                        // Set canvas to higher resolution
                        canvas.width = enhancedImgWidth;
                        canvas.height = enhancedImgHeight;

                        // Draw the image onto the canvas at enhanced resolution
                        ctx.drawImage(img, 0, 0, enhancedImgWidth, enhancedImgHeight);

                        // Convert to PNG for maximum quality
                        const imgData = canvas.toDataURL('image/png', 1.0);

                        // Calculate image position
                        const col = i % cols;
                        const row = Math.floor((i % (cols * rows)) / cols);

                        const xOffset = (cellWidth - imgWidth) / 2;
                        const yOffset = (cellHeight - imgHeight) / 2;

                        const x = col * cellWidth + xOffset;
                        const y = row * cellHeight + yOffset;

                        // Add image to the PDF
                        doc.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight, undefined, 'NONE');
                        resolve();
                    };
                    img.onerror = (error) => {
                        console.error('Error loading image:', error);
                        reject(error);
                    };
                });

                // Add new page if the current page is full
                if ((i + 1) % (cols * rows) === 0 && i < uploadedImages.length - 1) {
                    doc.addPage();
                }
            }
        }

        // Preview the generated PDF in the iframe
        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        document.getElementById('pdfPreview').src = pdfUrl;

        if (isMobileDevice()) {
            // For mobile devices, trigger the download
            const downloadLink = document.createElement('a');
            downloadLink.href = pdfUrl;
            downloadLink.download = 'generated.pdf';
            downloadLink.click();
        } else {
            // For desktop, show the PDF preview in the iframe
            const iframe = document.getElementById('pdfPreview');
            iframe.src = pdfUrl;
        }
    }

    window.onclick = function(event) {
        const modal = document.getElementById('warningModal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    }

});