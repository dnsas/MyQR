// Importation des modules Firebase nécessaires
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Initialisation de Firebase avec votre configuration
const firebaseConfig = {
    apiKey: "AIzaSyAzq0WiQRklgpSeqPqjnDZcISWGRtywwU4",
    authDomain: "gestion-des-qrcodes.firebaseapp.com",
    projectId: "gestion-des-qrcodes",
    storageBucket: "gestion-des-qrcodes.firebasestorage.app",
    messagingSenderId: "118022748151",
    appId: "1:118022748151:web:5a1df3c3eb636bf16b60f2",
    measurementId: "G-9YMVMQJSRN"
};

// Initialisation de l'application Firebase
const app = initializeApp(firebaseConfig);

// Récupération de Firestore
const db = getFirestore(app);

// Fonction pour afficher des alertes
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

// Fonction pour générer le QR Code
function generateQRCode() {
    const nom = encodeURIComponent(document.querySelector('.nom').value.trim());
    const prenom = encodeURIComponent(document.querySelector('.prenom').value.trim());
    const classe = encodeURIComponent(document.querySelector('.classe').value.trim());

    if (!nom || !prenom || !classe) {
        showErrorAlert("Veuillez remplir tous les champs !");
        return;
    }

    document.getElementById('loading-spinner').style.display = 'flex';

    const date = new Date().toLocaleString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });

    const qrData = `Nom: ${nom}, Prenom: ${prenom}, Classe: ${classe}, Date de création : ${date}`;

    // Ajout de l'élève dans Firestore
    db.collection("eleves").add({
        nom: nom,
        prenom: prenom,
        classe: classe,
        dateCreation: date
    })
    .then((docRef) => {
        console.log("Document écrit avec ID: ", docRef.id);

        // Création du QR code avec QRCodeStyling
        const qrCode = new QRCodeStyling({
            width: 300,   // Taille du QR code
            height: 300,  // Taille du QR code
            data: qrData, // Données à encoder dans le QR code
            dotsOptions: {
                color: "#3498db",  // Couleur des points (bleu)
                type: "rounded",   // Points arrondis
            },
            backgroundOptions: {
                color: "#ffffff",  // Fond blanc
            }
        });

        // Affichage du QR code dans le canevas
        const canvasElement = document.getElementById('qrCanvas');
        qrCode.append(canvasElement);

        document.getElementById('loading-spinner').style.display = 'none';
        document.querySelector('.qr_code').style.display = 'block';
        document.getElementById('downloadBtn').style.display = 'block';
        document.getElementById('shareBtn').style.display = 'block';
        showSuccessAlert("QR Code généré avec succès !");
    })
    .catch((error) => {
        console.error("Erreur lors de l'ajout du document : ", error);
        document.getElementById('loading-spinner').style.display = 'none';
        showErrorAlert("Erreur lors de la sauvegarde des données. Veuillez réessayer.");
    });
}

// Fonction pour télécharger le QR Code
function downloadQRCode() {
    const canvas = document.getElementById('qrCanvas');
    if (!canvas) {
        showErrorAlert('Erreur : Canvas non trouvé !');
        return;
    }

    try {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'qrcode.png';
        link.click();
        showSuccessAlert('QR Code téléchargé avec succès !');
    } catch (error) {
        console.error('Error creating download link:', error);
        showErrorAlert("Une erreur s'est produite lors du téléchargement. Veuillez réessayer.");
    }
}

// Fonction pour partager le QR Code
function shareQRCode() {
    const canvas = document.getElementById('qrCanvas');
    if (!canvas) {
        showErrorAlert('Erreur : Canvas non trouvé !');
        return;
    }

    canvas.toBlob(function (blob) {
        const file = new File([blob], "qrcode.png", { type: "image/png" });
        const shareData = {
            files: [file],
            title: 'Mon QR Code',
            text: 'Voici mon QR Code généré'
        };

        if (navigator.share && navigator.canShare(shareData)) {
            navigator.share(shareData)
                .then(() => showSuccessAlert('QR Code partagé avec succès !'))
                .catch((error) => {
                    console.error('Erreur lors du partage:', error);
                    showErrorAlert("Erreur lors du partage du QR Code.");
                });
        } else {
            showErrorAlert("Le partage n'est pas pris en charge sur votre appareil ou navigateur.");
        }
    }, 'image/png');
}
