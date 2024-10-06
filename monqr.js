document.addEventListener("DOMContentLoaded", function() {
  var qr_nom = document.querySelector(".nom");
  var qr_prenom = document.querySelector(".prenom");
  var qr_classe = document.querySelector(".classe");
  var qrcode = document.querySelector(".qr_code");

 
  var dateElement = document.getElementById("current_date");
  var date = new Date();
  var formattedDate = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
  dateElement.innerHTML = "Date: " + formattedDate;

  function generator() {
    if (!qr_nom.value || !qr_prenom.value || !qr_classe.value) {
      alert("Veuillez remplir tous les champs !");
      return; }
    qrcode.style.display = "flex";  
    qrcode.innerHTML = ""; 
 
    let content = JSON.stringify({
      nom: qr_nom.value,
      prenom: qr_prenom.value,
      classe: qr_classe.value,
      date_creation: formattedDate 
    });


    new QRCode(qrcode, content);

    qr_nom.value = "";  
    qr_prenom.value = "";
    qr_classe.value = "";
  }


  document.querySelector("button").addEventListener("click", generator);
});


