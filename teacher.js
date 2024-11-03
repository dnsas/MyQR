// Initialisation de Firebase
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
  
  // Initialisation de Firebase (votre code existant)

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

// Fonction pour afficher les données des élèves
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
                <div class="eleve-card">
                    <h3>${data.prenom} ${data.nom}</h3>
                    <p>Classe: ${data.classe}</p>
                    <p>Date de création: ${data.dateCreation}</p>
                </div>
            `;
        });
        document.getElementById('eleves-list').innerHTML = html;
    }).catch((error) => {
        console.error("Erreur lors de la récupération des données:", error);
        document.getElementById('eleves-list').innerHTML = "<p>Erreur lors du chargement des données.</p>";
    });
}

// Charger les classes et afficher toutes les données au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    chargerClasses();
    afficherDonnees();
});