
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
  logo.src = 'logo.png';
  logo.onload = function () {
      const ctx = canvas.getContext('2d');
      const logoSize = 60;
      const x = (canvas.width / 2) - (logoSize / 2);
      const y = (canvas.height / 2) - (logoSize / 2);
      ctx.drawImage(logo, x, y, logoSize, logoSize);
  };

  // Afficher le code QR et le bouton de téléchargement
  document.querySelector('.qr_code').style.display = 'block';
  document.getElementById('downloadBtn').style.display = 'block';
}
