const firebaseConfig = {
  apiKey: "FIREBASE_API_KEY",
  authDomain: "FIREBASE_AUTH_DOMAIN",
  projectId: "FIREBASE_PROJECT_ID",
  storageBucket: "FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "FIREBASE_MESSAGING_SENDER_ID",
  appId: "FIREBASE_APP_ID",
  measurementId: "FIREBASE_MEASUREMENT_ID"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

function generateQRCode() {
  const nom = encodeURIComponent(document.querySelector('.nom').value.trim());
  const prenom = encodeURIComponent(document.querySelector('.prenom').value.trim());
  const classe = encodeURIComponent(document.querySelector('.classe').value.trim());

  if (!nom || !prenom || !classe) {
    alert("Veuillez remplir tous les champs !");
    return;
  }

  // Afficher le cercle de chargement
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

  db.collection("eleves").add({
    nom: nom,
    prenom: prenom,
    classe: classe,
    dateCreation: date
  })
    .then((docRef) => {
      console.log("Document written with ID: ", docRef.id);

      const canvas = document.getElementById('qrCanvas');
      const qr = new QRious({
        element: canvas,
        value: qrData,
        size: 300,
      });

      const logo = new Image();
      logo.crossOrigin = "anonymous";
      logo.src = 'logo.png';
      logo.onload = function () {
        const ctx = canvas.getContext('2d');
        const logoSize = 60;
        const x = (canvas.width / 2) - (logoSize / 2);
        const y = (canvas.height / 2) - (logoSize / 2);
        ctx.drawImage(logo, x, y, logoSize, logoSize);

        // Cacher le cercle de chargement et afficher le QR code
        document.getElementById('loading-spinner').style.display = 'none';
        document.querySelector('.qr_code').style.display = 'block';
        document.getElementById('downloadBtn').style.display = 'block';
        document.getElementById('shareBtn').style.display = 'block';
      };

      logo.onerror = function () {
        console.error("Erreur de chargement du logo");
        // Cacher le cercle de chargement même en cas d'erreur
        document.getElementById('loading-spinner').style.display = 'none';
        document.querySelector('.qr_code').style.display = 'block';
        document.getElementById('downloadBtn').style.display = 'block';
        document.getElementById('shareBtn').style.display = 'block';
      };
    })
    .catch((error) => {
      console.error("Error adding document: ", error);
      // Cacher le cercle de chargement en cas d'erreur
      document.getElementById('loading-spinner').style.display = 'none';
      alert("Erreur lors de la sauvegarde des données. Veuillez réessayer.");
    });
}

// Les fonctions downloadQRCode et shareQRCode restent inchangées

function downloadQRCode() {
  const canvas = document.getElementById('qrCanvas');
  if (!canvas) {
    console.error('Canvas not found!');
    return;
  }

  try {
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'qrcode.png';
    link.click();
    console.log('Download link created and clicked');
  } catch (error) {
    console.error('Error creating download link:', error);
    alert("Une erreur s'est produite lors de la création du lien de téléchargement. Veuillez réessayer.");
  }
}

function shareQRCode() {
  const canvas = document.getElementById('qrCanvas');
  if (!canvas) {
    console.error('Canvas not found!');
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
        .then(() => console.log('QR Code partagé avec succès'))
        .catch((error) => console.error('Erreur lors du partage:', error));
    } else {
      alert("Le partage n'est pas pris en charge sur votre appareil ou navigateur.");
    }
  }, 'image/png');
}