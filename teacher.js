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
  
  function afficherDonneesClasse() {
    const classe = document.getElementById('classeInput').value.trim();
    if (!classe) {
      alert("Veuillez entrer une classe");
      return;
    }
  
    db.collection("eleves").where("classe", "==", classe).get()
      .then((querySnapshot) => {
        let html = '<h2>Élèves de la classe ' + classe + '</h2>';
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          html += `<p>Nom: ${data.nom}, Prénom: ${data.prenom}, Date: ${data.dateCreation}</p>`;
        });
        document.getElementById('resultats').innerHTML = html;
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des données: ", error);
        alert("Une erreur est survenue lors de la récupération des données.");
      });
  }
  