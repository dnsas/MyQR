/* Modifié !!!*/
const scanner = new Instascan.Scanner({
    video: document.getElementById('preview')
});

const cameraSelector = document.getElementById('cameraSelector');
const resultDiv = document.getElementById('result');
const qrDataList = document.getElementById('qrDataList');
const rescanButton = document.getElementById('rescanButton');

function showLoadingSpinner() {
    document.getElementById('loading-spinner').style.display = 'flex';
}

function hideLoadingSpinner() {
    document.getElementById('loading-spinner').style.display = 'none';
}

scanner.addListener('scan', function (content) {
    displayQRData(content);
    resultDiv.style.display = 'block';
    console.log('Données scannées : ', content);
    scanner.stop();
    showSuccessAlert('QR Code scanné avec succès !');
});

function displayQRData(content) {
    const qrDataCard = document.createElement('div');
    qrDataCard.className = 'qr-data-card';

    const title = document.createElement('h3');
    title.textContent = 'Données scannées';

    const data = document.createElement('p');
    
    if (content.startsWith('https://')) {
        const link = document.createElement('a');
        link.href = content;
        link.textContent = content;
        link.target = '_blank'; // Ouvre le lien dans un nouvel onglet
        data.appendChild(link);
    } else {
        data.textContent = content;
    }

    qrDataCard.appendChild(title);
    qrDataCard.appendChild(data);

    qrDataList.innerHTML = '';
    qrDataList.appendChild(qrDataCard);
}
rescanButton.addEventListener('click', function () {
    resultDiv.style.display = 'none';
    qrDataList.innerHTML = '';
    showLoadingSpinner();
    scanner.start(cameras[cameraSelector.value])
        .then(() => {
            hideLoadingSpinner();
            showSuccessAlert('Scanner prêt pour un nouveau scan.');
        })
        .catch(error => {
            hideLoadingSpinner();
            showErrorAlert('Erreur lors du démarrage du scanner.');
        });
});

// Vérification de la compatibilité avec getUserMedia
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    showLoadingSpinner();

    navigator.mediaDevices.getUserMedia({ video: true })
        .then(function(stream) {
            hideLoadingSpinner();
            showSuccessAlert("Accès à la caméra autorisé");
            stream.getTracks().forEach(track => track.stop()); // Arrêter le flux immédiatement
            initializeScanner();
        })
        .catch(function(error) {
            hideLoadingSpinner();
            showErrorAlert("Accès à la caméra refusé. Veuillez autoriser l'accès et recharger la page.");
            console.error("Erreur d'accès à la caméra:", error);
        });
} else {
    showErrorAlert("Votre navigateur ne supporte pas l'accès à la caméra.");
    console.error('API getUserMedia non supportée');
}

function initializeScanner() {
    showLoadingSpinner();
    Instascan.Camera.getCameras()
        .then(cameras => {
            hideLoadingSpinner();
            if (cameras.length > 0) {
                cameras.forEach((camera, index) => {
                    const option = document.createElement('option');
                    option.value = index;
                    option.text = camera.label || `Caméra ${index + 1}`;
                    cameraSelector.add(option);
                });

                cameraSelector.addEventListener('change', function () {
                    showLoadingSpinner();
                    scanner.stop();
                    scanner.start(cameras[cameraSelector.value])
                        .then(() => {
                            hideLoadingSpinner();
                            showSuccessAlert('Caméra changée avec succès.');
                        })
                        .catch(error => {
                            hideLoadingSpinner();
                            showErrorAlert('Erreur lors du changement de caméra.');
                        });
                });

                showLoadingSpinner();
                scanner.start(cameras[cameraSelector.value])
                    .then(() => {
                        hideLoadingSpinner();
                        showSuccessAlert('Scanner initialisé et prêt à l\'emploi.');
                    })
                    .catch(error => {
                        hideLoadingSpinner();
                        showErrorAlert('Erreur lors de l\'initialisation du scanner.');
                    });
            } else {
                showErrorAlert('Aucune caméra disponible. Vérifiez vos paramètres de caméra.');
            }
        })
        .catch(e => {
            hideLoadingSpinner();
            showErrorAlert('Erreur lors de l\'accès à la caméra. Assurez-vous que les permissions sont accordées.');
            console.error('Erreur lors de l\'accès aux caméras : ', e);
        });
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
