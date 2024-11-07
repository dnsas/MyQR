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

// Vérification de la compatibilité avec getUserMedia
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    console.log("Accès aux médias autorisé");

    Instascan.Camera.getCameras()
        .then(cameras => {
            if (cameras.length > 0) {
                cameras.forEach((camera, index) => {
                    const option = document.createElement('option');
                    option.value = index;
                    option.text = camera.label || `Caméra ${index + 1}`;
                    cameraSelector.add(option);
                });

                // Lorsque l'utilisateur choisit une caméra
                cameraSelector.addEventListener('change', function () {
                    scanner.stop();
                    scanner.start(cameras[cameraSelector.value]);
                });

                // Démarrer le scanner avec la première caméra disponible
                scanner.start(cameras[cameraSelector.value]);

            } else {
                console.error('Aucune caméra trouvée.');
                showErrorAlert('Aucune caméra disponible. Vérifiez vos paramètres de caméra.');
            }
        })
        .catch(e => {
            console.error('Erreur lors de l\'accès aux caméras : ', e);
            showErrorAlert('Erreur lors de l\'accès à la caméra. Assurez-vous que les permissions sont accordées.');
        });

} else {
    console.error('API getUserMedia non supportée');
    showErrorAlert("Votre navigateur ne supporte pas l'accès à la caméra.");
}

function retourAccueil() {
    window.location.href = 'home.html';
}

function showAlert(message, type) {
    const alertContainer = document.getElementById('alert-container');
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    alertContainer.appendChild(alert);

    setTimeout(() => {
        alert.classList.add('show');
    }, 100);

    setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => {
            alertContainer.removeChild(alert);
        }, 300);
    }, 3000);
}

function showSuccessAlert(message) {
    showAlert(message, 'success');
}

function showErrorAlert(message) {
    showAlert(message, 'danger');
}
