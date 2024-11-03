// Création d'une instance de l'objet Instascan.Scanner pour scanner les QR codes
const scanner = new Instascan.Scanner({
    video: document.getElementById('preview')
});

// Récupération des éléments du DOM nécessaires
const cameraSelector = document.getElementById('cameraSelector');
const resultDiv = document.getElementById('result');
const qrDataList = document.getElementById('qrDataList');
const rescanButton = document.getElementById('rescanButton');

// Ajout d'un écouteur d'événements pour le scanner
scanner.addListener('scan', function (content) {
    displayQRData(content);
    resultDiv.style.display = 'block';
    console.log('Données : ', content);
    scanner.stop();
});

// Fonction pour afficher les données du QR code
// Fonction pour afficher les données du QR code
function displayQRData(content) {
    const qrDataCard = document.createElement('div');
    qrDataCard.className = 'qr-data-card';

    // Supposons que le contenu est une chaîne formatée comme "Nom; Prénom; Classe; Date"
    const dataParts = content.split(';'); // Séparez le contenu par un point-virgule

    const title = document.createElement('h3');
    title.textContent = 'Données scannées';

    qrDataCard.appendChild(title);

    // Créez des paragraphes pour chaque partie de données
    const name = document.createElement('p');
    name.textContent = `Nom: ${dataParts[0].trim()}`; // Nom
    qrDataCard.appendChild(name);
    
    const firstName = document.createElement('p');
    firstName.textContent = `Prénom: ${dataParts[1].trim()}`; // Prénom
    qrDataCard.appendChild(firstName);
    
    const classInfo = document.createElement('p');
    classInfo.textContent = `Classe: ${dataParts[2].trim()}`; // Classe
    qrDataCard.appendChild(classInfo);
    
    const dateInfo = document.createElement('p');
    dateInfo.textContent = `Date: ${dataParts[3].trim()}`; // Date
    qrDataCard.appendChild(dateInfo);

    qrDataList.innerHTML = ''; // Efface les résultats précédents
    qrDataList.appendChild(qrDataCard);
}
// Ajout d'un écouteur d'événements pour le bouton de rescanner
rescanButton.addEventListener('click', function () {
    resultDiv.style.display = 'none';
    qrDataList.innerHTML = ''; // Efface les résultats précédents
    scanner.start(cameras[cameraSelector.value]);
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
