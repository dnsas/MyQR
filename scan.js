const scanner = new Instascan.Scanner({
    video: document.getElementById('preview')
});
const cameraSelector = document.getElementById('cameraSelector');
const resultDiv = document.getElementById('result');
const qrData = document.getElementById('qrData');
const rescanButton = document.getElementById('rescanButton');

scanner.addListener('scan', function (content) {
    qrData.innerText = content; // Affiche les données scannées
    resultDiv.style.display = 'block'; // Affiche le conteneur des résultats
    console.log('Données : ', content);
    scanner.stop(); // Arrête le scanner après un scan réussi
});

rescanButton.addEventListener('click', function () {
    resultDiv.style.display = 'none'; // Cache le conteneur des résultats
    scanner.start(); // Redémarre le scanner
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
                scanner.stop(); // Arrête le scanner avant de changer de caméra
                scanner.start(cameras[cameraSelector.value]);
            });
            // Démarre la première caméra par défaut
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