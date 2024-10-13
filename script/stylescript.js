//Style inside html
fetch('form/imageform.html')
    .then(response => response.text())
    .then(data => {
       document.getElementById('inputform').innerHTML = data;
    

});