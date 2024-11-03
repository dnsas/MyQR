// Création d'une instance de l'objet Instascan.Scanner pour scanner les QR codes
const scanner = new Instascan.Scanner({
    video: document.getElementById('preview') // L'élément vidéo où le flux de la caméra sera affiché
});

// Récupération des éléments du DOM nécessaires
const cameraSelector = document.getElementById('cameraSelector'); // Sélecteur de caméra
const resultDiv = document.getElementById('result'); // Div qui affichera le résultat du scan
const qrData = document.getElementById('qrData'); // Élément qui affichera les données scannées
const rescanButton = document.getElementById('rescanButton'); // Bouton pour rescanner

// Ajout d'un écouteur d'événements pour le scanner
scanner.addListener('scan', function (content) {
    qrData.innerText = content; // Affiche les données scannées dans l'élément qrData
    resultDiv.style.display = 'block'; // Affiche le conteneur des résultats
    console.log('Données : ', content); // Affiche les données dans la console pour le débogage
    scanner.stop(); // Arrête le scanner après un scan réussi
});

// Ajout d'un écouteur d'événements pour le bouton de rescanner
rescanButton.addEventListener('click', function () {
    resultDiv.style.display = 'none'; // Cache le conteneur des résultats
    scanner.start(); // Redémarre le scanner pour un nouveau scan
});

// Récupération des caméras disponibles
Instascan.Camera.getCameras()
    .then(cameras => {
        if (cameras.length > 0) { // Vérifie s'il y a des caméras disponibles
            cameras.forEach((camera, index) => { // Parcourt chaque caméra trouvée
                const option = document.createElement('option'); // Crée un nouvel élément option pour le sélecteur
                option.value = index; // Définit la valeur de l'option comme l'index de la caméra
                option.text = camera.label || `Caméra ${index + 1}`; // Définit le texte affiché, utilise un label ou un nom par défaut
                cameraSelector.add(option); // Ajoute l'option au sélecteur de caméra
            });
            // Ajoute un écouteur d'événements pour changer de caméra
            cameraSelector.addEventListener('change', function () {
                scanner.stop(); // Arrête le scanner avant de changer de caméra
                scanner.start(cameras[cameraSelector.value]); // Démarre le scanner avec la caméra sélectionnée
            });
            // Démarre la première caméra par défaut
            scanner.start(cameras[cameraSelector.value]);
        } else {
            console.error('Aucune caméra trouvée.'); // Affiche une erreur si aucune caméra n'est disponible
            alert('Aucune caméra trouvée. Vérifiez vos paramètres de caméra.'); // Alerte l'utilisateur
        }
    })
    .catch(e => {
        console.error('Erreur : ', e); // Affiche une erreur dans la console en cas de problème
        alert('Erreur lors de l\'accès à la caméra. Assurez-vous que les permissions sont accordées.'); // Alerte l'utilisateur en cas d'erreur
    });
