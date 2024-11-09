// Configuration de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAzq0WiQRklgpSeqPqjnDZcISWGRtywwU4",
  authDomain: "gestion-des-qrcodes.firebaseapp.com",
  projectId: "gestion-des-qrcodes",
  storageBucket: "gestion-des-qrcodes.firebasestorage.app",
  messagingSenderId: "118022748151",
  appId: "1:118022748151:web:5a1df3c3eb636bf16b60f2",
  measurementId: "G-9YMVMQJSRN"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

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

  // Configuration de QRCodeStyling
  const qrCode = new QRCodeStyling({
    width: 300,
    height: 300,
    data: qrData,
    dotsOptions: {
      color: "#000000",
      type: "rounded" // Remplace les carrés par des points arrondis
    },
    backgroundOptions: {
      color: "transparent" // Fond transparent
    },
    imageOptions: {
      crossOrigin: "anonymous",
      margin: 10
    }
  });

  // Charger le logo et l'ajouter comme arrière-plan
  const logo = new Image();
  logo.crossOrigin = "anonymous";
  logo.src = 'logo.png';
  logo.onload = function () {
    qrCode.update({
      image: logo.src,
      imageOptions: {
        hideBackgroundDots: true,  // Cache les points sous le logo
        imageSize: 0.4,           // Ajuste la taille du logo par rapport au QR Code
        margin: 8
      }
    });

    qrCode.append(document.getElementById("qrCanvasContainer"));

    document.getElementById('loading-spinner').style.display = 'none';
    document.querySelector('.qr_code').style.display = 'block';
    document.getElementById('downloadBtn').style.display = 'block';
    document.getElementById('shareBtn').style.display = 'block';
    showSuccessAlert("QR Code généré avec succès !");
  };

  logo.onerror = function () {
    console.error("Erreur de chargement du logo");
    document.getElementById('loading-spinner').style.display = 'none';
    showErrorAlert("Erreur de chargement du logo, mais le QR Code a été généré.");
  };

  // Ensuite, enregistrer les données dans la base
  db.collection("eleves").add({
    nom: nom,
    prenom: prenom,
    classe: classe,
    dateCreation: date
  })
    .then((docRef) => {
      console.log("Document written with ID: ", docRef.id);
    })
    .catch((error) => {
      console.error("Error adding document: ", error);
      showErrorAlert("Erreur lors de la sauvegarde des données. Veuillez réessayer.");
    });
}

function downloadQRCode() {
  const qrCodeContainer = document.getElementById('qrCanvasContainer');
  if (!qrCodeContainer) {
    showErrorAlert('Erreur : QR Code non trouvé !');
    return;
  }

  qrCode.download({ name: "qrcode", extension: "png" });
  showSuccessAlert('QR Code téléchargé avec succès !');
}

function shareQRCode() {
  const qrCodeContainer = document.getElementById('qrCanvasContainer');
  if (!qrCodeContainer) {
    showErrorAlert('Erreur : QR Code non trouvé !');
    return;
  }

  qrCodeContainer.toBlob(function (blob) {
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
