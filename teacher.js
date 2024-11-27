
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

let isAuthenticated = false;

function showLoadingSpinner() {
    document.getElementById('loading-spinner').style.display = 'flex';
}

function hideLoadingSpinner() {
    document.getElementById('loading-spinner').style.display = 'none';
}

function checkEnter(event) {
    if (event.key === "Enter") {  // Vérifie si la touche pressée est "Entrée"
        checkPassword();  // Appelle la fonction checkPassword
    }
}


function checkPassword() {
    showLoadingSpinner();
    const passwordInput = document.getElementById('passwordInput');
    db.collection("settings").doc("auth").get().then((doc) => {
        if (
            (doc.exists && doc.data().password === passwordInput.value) || 
            (doc.exists && doc.data().password2 === passwordInput.value)
        ) {
            isAuthenticated = true;
            document.getElementById('loginOverlay').style.display = 'none';
            document.getElementById('container').style.display = 'block';
            showSuccessAlert("Connexion réussie !");
            initializePage();
        } else {
            showErrorAlert("Mot de passe incorrect. Veuillez réessayer.");
        }
        hideLoadingSpinner();
    }).catch((error) => {
        showErrorAlert("Erreur lors de la vérification du mot de passe. Veuillez réessayer.");
        hideLoadingSpinner();
    });
}

function initializePage() {
    chargerClasses();
    afficherDonnees();
}

function chargerClasses() {
    if (!isAuthenticated) {
        console.error("Utilisateur non authentifié");
        return;
    }
    showLoadingSpinner();
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
        hideLoadingSpinner();
    }).catch((error) => {
        console.error("Erreur lors du chargement des classes:", error);
        hideLoadingSpinner();
    });
}

function tronquerTexte(texte, longueurMax) {
    return texte.length > longueurMax ? texte.substring(0, longueurMax - 3) + '...' : texte;
}

function afficherDonnees() {
    if (!isAuthenticated) {
        console.error("Utilisateur non authentifié");
        return;
    }
    showLoadingSpinner();
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
        hideLoadingSpinner();
    }).catch((error) => {
        console.error("Erreur lors de la récupération des données:", error);
        document.getElementById('eleves-list').innerHTML = "<p>Erreur lors du chargement des données.</p>";
        
        const nombreElevesElement = document.getElementById('nombre-eleves');
        if (nombreElevesElement) {
            nombreElevesElement.textContent = "Nombre d'élèves : 0";
        }
        hideLoadingSpinner();
    });
}

function supprimerEleve(eleveId) {
    if (!isAuthenticated) {
        console.error("Utilisateur non authentifié");
        return;
    }

    // Récupérer les informations de l'élève
    db.collection("eleves").doc(eleveId).get().then((doc) => {
        if (doc.exists) {
            const eleveData = doc.data();
            const nomComplet = `${eleveData.prenom} ${eleveData.nom}`;

            // Mettre à jour le message de confirmation
            const confirmationMessage = document.getElementById('confirmation-message');
            confirmationMessage.textContent = `Êtes-vous sûr de vouloir supprimer l'élève ${nomComplet} ?`;

            // Afficher la boîte de dialogue
            const confirmationDialog = document.getElementById('confirmation-dialog');
            confirmationDialog.style.display = 'flex';

            // Gérer le clic sur le bouton "Supprimer"
            document.getElementById('confirm-yes').onclick = function() {
                showLoadingSpinner();
                db.collection("eleves").doc(eleveId).delete().then(() => {
                    console.log("Élève supprimé avec succès");
                    showSuccessAlert(`L'élève ${nomComplet} a été supprimé avec succès.`);
                    afficherDonnees();
                    confirmationDialog.style.display = 'none'; // Fermer la boîte de dialogue
                }).catch((error) => {
                    console.error("Erreur lors de la suppression de l'élève:", error);
                    showErrorAlert(`Erreur lors de la suppression de l'élève ${nomComplet}.`);
                    hideLoadingSpinner();
                    confirmationDialog.style.display = 'none'; // Fermer la boîte de dialogue
                });
            };

            // Gérer le clic sur le bouton "Annuler"
            document.getElementById('confirm-no').onclick = function() {
                confirmationDialog.style.display = 'none'; // Fermer la boîte de dialogue
            };
        } else {
            console.error("Aucun élève trouvé avec cet ID");
            showErrorAlert("Erreur : Élève non trouvé.");
        }
    }).catch((error) => {
        console.error("Erreur lors de la récupération des données de l'élève:", error);
        showErrorAlert("Erreur lors de la récupération des données de l'élève.");
    });
}

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
            const logoSize = containerWidth * 1.5;
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


document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('loginOverlay').style.display = 'flex';
});


function togglePasswordVisibility() {
    const passwordInput = document.getElementById('passwordInput');
    const togglePassword = document.getElementById('togglePassword');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        togglePassword.classList.remove('fa-eye');
        togglePassword.classList.add('fa-eye-slash'); // Change l'icône
    } else {
        passwordInput.type = 'password';
        togglePassword.classList.remove('fa-eye-slash');
        togglePassword.classList.add('fa-eye');
    }
}
