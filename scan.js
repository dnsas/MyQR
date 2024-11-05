const scanner = new Instascan.Scanner({
    video: document.getElementById('preview')
});

const cameraSelector = document.getElementById('cameraSelector');
const resultDiv = document.getElementById('result');
const qrDataList = document.getElementById('qrDataList');
const rescanButton = document.getElementById('rescanButton');

scanner.addListener('scan', function (content) {
    displayQRData(content);
    resultDiv.style.display = 'block';
    console.log('Données scannées : ', content);
    scanner.stop();
});

function displayQRData(content) {
    const qrDataCard = document.createElement('div');
    qrDataCard.className = 'qr-data-card';

    const title = document.createElement('h3');
    title.textContent = 'Données scannées';

    const data = document.createElement('p');
    data.textContent = content;

    qrDataCard.appendChild(title);
    qrDataCard.appendChild(data);

    qrDataList.innerHTML = '';
    qrDataList.appendChild(qrDataCard);
}

rescanButton.addEventListener('click', function () {
    resultDiv.style.display = 'none';
    qrDataList.innerHTML = '';
    scanner.start(cameras[cameraSelector.value]);
});

Instascan.Camera.getCameras()
    .then(cameras => {
        if (cameras.length > 0) {
            cameras.forEach((camera, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.text = camera.label || `Caméra ${index + 1}`;
                cameraSelector.add(option);
            });

            cameraSelector.addEventListener('change', function () {
                scanner.stop();
                scanner.start(cameras[cameraSelector.value]);
            });

            scanner.start(cameras[cameraSelector.value]);
        } else {
            console.error('Aucune caméra trouvée.');
            alert('Aucune caméra trouvée. Vérifiez vos paramètres de caméra.');
        }
    })
    .catch(e => {
        console.error('Erreur : ', e);
        alert('Erreur lors de l\'accès à la caméra. Assurez-vous que les permissions sont accordées.');
    });