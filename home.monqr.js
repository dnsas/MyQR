function generateQRCode() {
  // Récupération des valeurs des champs
  const nom = document.querySelector('.nom').value.trim();
  const prenom = document.querySelector('.prenom').value.trim();
  const classe = document.querySelector('.classe').value.trim();

  // Vérification que tous les champs sont remplis
  if (!nom || !prenom || !classe) {
    alert("Veuillez remplir tous les champs !");
    return; // Ne pas continuer si les champs ne sont pas tous remplis
  }

  // Récupération de la date
  const date = new Date().toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // Création des données du QR code
  const qrData = `Nom: ${nom}, Prenom: ${prenom}, Classe: ${classe}, Date de création : ${date}`;

  const canvas = document.getElementById('qrCanvas');
  const qr = new QRious({
    element: canvas,
    value: qrData,
    size: 300,
  });

  // Ajout du logo au QR code
  const logo = new Image();
  logo.crossOrigin = "anonymous"; // Ajoutez cette ligne pour éviter les problèmes CORS
  logo.src = 'logo.png';
  logo.onload = function () {
    const ctx = canvas.getContext('2d');
    const logoSize = 60;
    const x = (canvas.width / 2) - (logoSize / 2);
    const y = (canvas.height / 2) - (logoSize / 2);
    ctx.drawImage(logo, x, y, logoSize, logoSize);

    // Afficher le code QR, le bouton de téléchargement et le bouton de partage
    document.querySelector('.qr_code').style.display = 'block';
    document.getElementById('downloadBtn').style.display = 'block';
    document.getElementById('shareBtn').style.display = 'block';
};

logo.onerror = function() {
    console.error("Erreur de chargement du logo");
    // Afficher quand même le QR code sans le logo
    document.querySelector('.qr_code').style.display = 'block';
    document.getElementById('downloadBtn').style.display = 'block';
    document.getElementById('shareBtn').style.display = 'block';
};
}


function downloadQRCode() {
  const canvas = document.getElementById('qrCanvas');
  if (!canvas) {
    console.error('Canvas not found!');
    return;
  }

  try {
    // Créer un lien pour le téléchargement
    const link = document.createElement('a');
    // Obtenir les données du canvas sous forme d'URL de données
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

  canvas.toBlob(function(blob) {
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