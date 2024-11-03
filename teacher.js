
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
                <div class="eleve-card">
                    <h3>${data.prenom} ${data.nom}</h3>
                    <p>Classe: ${data.classe}</p>
                    <p>Date de création: ${data.dateCreation}</p>
                    <button onclick="supprimerEleve('${doc.id}')" class="delete-btn">Supprimer</button>
                </div>
            `;
        });
        document.getElementById('eleves-list').innerHTML = html;
    }).catch((error) => {
        console.error("Erreur lors de la récupération des données:", error);
        document.getElementById('eleves-list').innerHTML = "<p>Erreur lors du chargement des données.</p>";
    });
}

// Fonction pour supprimer un élève
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


document.addEventListener('DOMContentLoaded', () => {
    chargerClasses();
    afficherDonnees();
});