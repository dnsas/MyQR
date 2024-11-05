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

function chargerClasses() {
    db.collection("eleves").get().then((querySnapshot) => {
        const classes = new Set();
        querySnapshot.forEach((doc) => {
            classes.add(doc.data().classe);
        });
        const selectElement = document.getElementById('classeSelect');
        classes.forEach((classe) => {
            const option = document.createElement('option');
            option.value = classe;
            option.textContent = classe;
            selectElement.appendChild(option);
        });
    }).catch((error) => {
        console.error("Erreur lors du chargement des classes:", error);
    });
}

function afficherDonnees() {
    const classeSelectionnee = document.getElementById('classeSelect').value;
    let query = db.collection("eleves");
    
    if (classeSelectionnee) {
        query = query.where("classe", "==", classeSelectionnee);
    }

    query.get().then((querySnapshot) => {
        let html = '';
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            html += `
                <div class="eleve-card" data-eleve-id="${doc.id}">
                    <div class="eleve-card-inner">
                        <div class="eleve-card-front">
                            <h3>${data.prenom} ${data.nom}</h3>
                            <p>Classe: ${data.classe}</p>
                            <p>Date de création: ${data.dateCreation}</p>
                            <button onclick="retournerCarte(this)" class="view-qr-btn">Voir QR Code</button>
                            <button onclick="supprimerEleve('${doc.id}')" class="delete-btn">Supprimer</button>
                        </div>
                        <div class="eleve-card-back">
                            <div id="qrcode-${doc.id}"></div>
                            <button onclick="retournerCarte(this)" class="return-btn">Retour</button>
                        </div>
                    </div>
                </div>
            `;
        });
        document.getElementById('eleves-list').innerHTML = html;
    }).catch((error) => {
        console.error("Erreur lors de la récupération des données:", error);
        document.getElementById('eleves-list').innerHTML = "<p>Erreur lors du chargement des données.</p>";
    });
}

function supprimerEleve(eleveId) {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet élève ?")) {
        db.collection("eleves").doc(eleveId).delete().then(() => {
            console.log("Élève supprimé avec succès");
            afficherDonnees(); // Rafraîchir la liste après suppression
        }).catch((error) => {
            console.error("Erreur lors de la suppression de l'élève: ", error);
            alert("Erreur lors de la suppression de l'élève.");
        });
    }
}

function voirQRCode(nom, prenom, classe, dateCreation, eleveId) {
    // Encodez les données de la même manière que dans home.monqr.js
    const encodedNom = encodeURIComponent(nom);
    const encodedPrenom = encodeURIComponent(prenom);
    const encodedClasse = encodeURIComponent(classe);

    // Formatez les données exactement comme dans home.monqr.js
    const qrData = `Nom: ${encodedNom}, Prenom: ${encodedPrenom}, Classe: ${encodedClasse}, Date de création : ${dateCreation}`;

    const qrcodeElement = document.getElementById(`qrcode-${eleveId}`);
    qrcodeElement.innerHTML = ''; // Effacer le contenu précédent

    // Obtenez la largeur du conteneur
    const containerWidth = qrcodeElement.offsetWidth;

    // Créez un élément canvas manuellement
    const canvas = document.createElement('canvas');
    canvas.width = containerWidth;
    canvas.height = containerWidth; // Gardez le QR code carré
    qrcodeElement.appendChild(canvas);

    // Utilisez QRious avec le canvas créé
    new QRious({
        element: canvas,
        value: qrData,
        size: containerWidth,
    });

    // Ajoutez le logo si nécessaire
    const logo = new Image();
    logo.crossOrigin = "anonymous";
    logo.src = 'logo.png';
    logo.onload = function () {
        const ctx = canvas.getContext('2d');
        if (ctx) {
            const logoSize = containerWidth * 0.2; // Ajustez la taille du logo en fonction de la taille du conteneur
            const x = (canvas.width / 2) - (logoSize / 2);
            const y = (canvas.height / 2) - (logoSize / 2);
            ctx.drawImage(logo, x, y, logoSize, logoSize);
        } else {
            console.error('Unable to get 2D context from canvas');
        }
    };


}



function retournerCarte(button) {
    const card = button.closest('.eleve-card');
    card.classList.toggle('flipped');
    
    if (card.classList.contains('flipped')) {
        const nom = card.querySelector('h3').textContent.split(' ')[1];
        const prenom = card.querySelector('h3').textContent.split(' ')[0];
        const classe = card.querySelector('p:nth-child(2)').textContent.split(': ')[1];
        const dateCreation = card.querySelector('p:nth-child(3)').textContent.split(': ')[1];
        const eleveId = card.dataset.eleveId;
        voirQRCode(nom, prenom, classe, dateCreation, eleveId);
    }
}

function retourAccueil() {
    window.location.href = 'home.html';
}

document.addEventListener('DOMContentLoaded', () => {
    chargerClasses();
    afficherDonnees();
});