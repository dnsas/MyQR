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

  const qrData = `Nom: ${nom}, Prenom: ${prenom}, Classe: ${classe}, Date: ${date}`;

  db.collection("eleves").add({
    nom: nom,
    prenom: prenom,
    classe: classe,
    dateCreation: date
  })
    .then((docRef) => {
      console.log("Document written with ID: ", docRef.id);

      const canvas = document.getElementById('qrCanvas');
      const ctx = canvas.getContext('2d');
      const size = 400;
      canvas.width = size;
      canvas.height = size;

      // Créer un dégradé de fond
      const gradient = ctx.createLinearGradient(0, 0, size, size);
      gradient.addColorStop(0, '#0099ff');
      gradient.addColorStop(1, '#6600ff');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);

      // Générer le QR code
      const qr = new QRious({
        element: canvas,
        value: qrData,
        size: size * 0.7, // QR code plus petit pour laisser de la place au logo
        backgroundAlpha: 0 // Fond transparent pour le QR code
      });

      // Ajouter un effet de points au QR code
      const imageData = ctx.getImageData(0, 0, size, size);
      const data = imageData.data;
      const dotSize = 8;

      // Dessiner les points du QR code
      for (let y = 0; y < size; y += dotSize) {
        for (let x = 0; x < size; x += dotSize) {
          const i = (y * size + x) * 4;
          if (data[i] === 0) { // Si le pixel est noir
            ctx.beginPath();
            ctx.arc(x + dotSize / 2, y + dotSize / 2, dotSize / 2 - 1, 0, Math.PI * 2);
            ctx.fillStyle = 'white'; // Couleur des points
            ctx.fill();
          }
        }
      }

      // Ajouter le logo par-dessus le QR code
      const logo = new Image();
      logo.crossOrigin = "anonymous";
      logo.src = 'logo.png';
      logo.onload = function () {
        const logoSize = size * 0.2; // Taille du logo
        const logoX = (size - logoSize) / 2; // Centrer le logo
        const logoY = (size - logoSize) / 2;
        ctx.drawImage(logo, logoX, logoY, logoSize, logoSize); // Dessiner le logo

        document.getElementById('loading-spinner').style.display = 'none';
        document.querySelector('.qr_code').style.display = 'block';
        document.getElementById('downloadBtn').style.display = 'block';
        document.getElementById('shareBtn').style.display = 'block';
        showSuccessAlert("QR Code généré avec succès !");
      };

      logo.onerror = function () {
        console.error("Erreur de chargement du logo");
        document.getElementById('loading-spinner').style.display = 'none';
        document.querySelector('.qr_code').style.display = 'block';
        document.getElementById('downloadBtn').style.display = 'block';
        document.getElementById('shareBtn').style.display = 'block';
        showErrorAlert("Erreur de chargement du logo, mais le QR Code a été généré.");
      };
    })
    .catch((error) => {
      console.error("Error adding document: ", error);
      document.getElementById('loading-spinner').style.display = 'none';
      showErrorAlert("Erreur lors de la sauvegarde des données. Veuillez réessayer.");
    });
}

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