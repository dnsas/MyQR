const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

export default firebaseConfig;

// Initialisation de Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Variables globales
let isAuthenticated = false;


// Fonction pour vérifier le mot de passe
function checkPassword() {
    const passwordInput = document.getElementById('passwordInput');
    db.collection("settings").doc("auth").get().then((doc) => {
        if (doc.exists && doc.data().password === passwordInput.value) {
            isAuthenticated = true;
            document.getElementById('loginOverlay').style.display = 'none';
            document.getElementById('container').style.display = 'block';
            initializePage();
        } else {
            alert("Mot de passe incorrect. Veuillez réessayer.");
        }
    }).catch((error) => {
        console.error("Erreur lors de la vérification du mot de passe:", error);
    });
}


// Fonction pour initialiser la page après connexion
function initializePage() {
    chargerClasses();
    afficherDonnees();
}

// Fonction pour charger les classes
function chargerClasses() {
    if (!isAuthenticated) {
        console.error("Utilisateur non authentifié");
        return;
    }
    db.collection("eleves").get().then((querySnapshot) => {
        const classes = new Set();
        querySnapshot.forEach((doc) => {
            classes.add(doc.data().classe);
        });
        const selectElement = document.getElementById('classeSelect');
        selectElement.innerHTML = '<option value="">Toutes les classes</option>';
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

// Fonction pour tronquer le texte
function tronquerTexte(texte, longueurMax) {
    return texte.length > longueurMax ? texte.substring(0, longueurMax - 3) + '...' : texte;
}

// Fonction pour afficher les données
function afficherDonnees() {
    if (!isAuthenticated) {
        console.error("Utilisateur non authentifié");
        return;
    }
    const classeSelectionnee = document.getElementById('classeSelect').value;
    let query = db.collection("eleves");
    
    if (classeSelectionnee) {
        query = query.where("classe", "==", classeSelectionnee);
    }

    query.get().then((querySnapshot) => {
        let html = '';
        let nombreEleves = 0;
        querySnapshot.forEach((doc) => {
            nombreEleves++;
            const data = doc.data();
            const nomTronque = tronquerTexte(data.nom, 15);
            const prenomTronque = tronquerTexte(data.prenom, 15);
            const classeTronquee = tronquerTexte(data.classe, 20);
            html += `
                <div class="eleve-card" data-eleve-id="${doc.id}">
                    <div class="eleve-card-inner">
                        <div class="eleve-card-front">
                            <h3 title="${data.prenom} ${data.nom}">${prenomTronque} ${nomTronque}</h3>
                            <p title="Classe: ${data.classe}">Classe: ${classeTronquee}</p>
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
        
        const nombreElevesElement = document.getElementById('nombre-eleves');
        if (nombreElevesElement) {
            nombreElevesElement.textContent = `Nombre d'élèves : ${nombreEleves}`;
        }
    }).catch((error) => {
        console.error("Erreur lors de la récupération des données:", error);
        document.getElementById('eleves-list').innerHTML = "<p>Erreur lors du chargement des données.</p>";
        
        const nombreElevesElement = document.getElementById('nombre-eleves');
        if (nombreElevesElement) {
            nombreElevesElement.textContent = "Nombre d'élèves : 0";
        }
    });
}

// Fonction pour supprimer un élève
function supprimerEleve(eleveId) {
    if (!isAuthenticated) {
        console.error("Utilisateur non authentifié");
        return;
    }
    if (confirm("Êtes-vous sûr de vouloir supprimer cet élève ?")) {
        db.collection("eleves").doc(eleveId).delete().then(() => {
            console.log("Élève supprimé avec succès");
            afficherDonnees();
        }).catch((error) => {
            console.error("Erreur lors de la suppression de l'élève: ", error);
            alert("Erreur lors de la suppression de l'élève.");
        });
    }
}

// Fonction pour voir le QR Code
function voirQRCode(nom, prenom, classe, dateCreation, eleveId) {
    const encodedNom = encodeURIComponent(nom);
    const encodedPrenom = encodeURIComponent(prenom);
    const encodedClasse = encodeURIComponent(classe);

    const qrData = `Nom: ${encodedNom}, Prenom: ${encodedPrenom}, Classe: ${encodedClasse}, Date de création : ${dateCreation}`;

    const qrcodeElement = document.getElementById(`qrcode-${eleveId}`);
    qrcodeElement.innerHTML = '';

    const containerWidth = qrcodeElement.offsetWidth;

    const canvas = document.createElement('canvas');
    canvas.width = containerWidth;
    canvas.height = containerWidth;
    qrcodeElement.appendChild(canvas);

    new QRious({
        element: canvas,
        value: qrData,
        size: containerWidth,
    });

    const logo = new Image();
    logo.crossOrigin = "anonymous";
    logo.src = 'logo.png';
    logo.onload = function () {
        const ctx = canvas.getContext('2d');
        if (ctx) {
            const logoSize = containerWidth * 0.2;
            const x = (canvas.width / 2) - (logoSize / 2);
            const y = (canvas.height / 2) - (logoSize / 2);
            ctx.drawImage(logo, x, y, logoSize, logoSize);
        } else {
            console.error('Unable to get 2D context from canvas');
        }
    };
}

// Fonction pour retourner la carte
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

// Fonction pour retourner à l'accueil
function retourAccueil() {
    window.location.href = 'home.html';
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('loginOverlay').style.display = 'flex';
});