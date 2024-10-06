fetch('form/paperform/previewpdf.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('preview1').innerHTML = data;
    });
