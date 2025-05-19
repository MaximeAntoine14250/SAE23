// Sélection des éléments HTML nécessaires
const codePostalInput = document.getElementById("code-postal"); // Champ de saisie du code postal
const communeSelect = document.getElementById("communeSelect"); // Liste déroulante des communes
const validationButton = document.getElementById("validationButton"); // Bouton de validation
const dayButtons = document.querySelectorAll(".day-button"); // Boutons pour sélectionner le nombre de jours
const darkModeToggle = document.getElementById("darkModeToggle"); // Bouton pour activer/désactiver le dark mode

// Variables globales utilisées dans le script
let selectedDays = 1; // Nombre de jours sélectionnés pour la météo (1 par défaut)
let weatherData = null; // Données météo à récupérer plus tard

// Liste des options affichables (coordonnées, pluie, vent...)
const checkboxOptions = [
  { id: "show-lat", property: "latitude" },
  { id: "show-lon", property: "longitude" },
  { id: "show-rain", property: "rr10" },
  { id: "show-wind", property: "wind10m" },
  { id: "show-wind-dir", property: "dirwind10m" }
];

// === DARK MODE ===

// Si l'utilisateur avait activé le dark mode précédemment, on le réactive automatiquement
if (localStorage.getItem("darkMode") === "enabled") {
  document.body.classList.add("dark-mode");
  darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>'; // Icône de soleil pour désactiver le dark mode
}

// Gestionnaire d'événement pour basculer le dark mode quand on clique sur l'icône
darkModeToggle.addEventListener("click", () => {
  if (document.body.classList.contains("dark-mode")) {
    // Si le dark mode est activé, on le désactive
    document.body.classList.remove("dark-mode");
    localStorage.setItem("darkMode", "disabled");
    darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>'; // Icône de lune pour activer
  } else {
    // Sinon, on l'active
    document.body.classList.add("dark-mode");
    localStorage.setItem("darkMode", "enabled");
    darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>'; // Icône de soleil
  }
});

// === GESTION DES BOUTONS DE JOUR ===

// Chaque bouton de jour met à jour la variable selectedDays et ajoute la classe "active"
dayButtons.forEach((button) => {
  button.addEventListener("click", () => {
    dayButtons.forEach((btn) => btn.classList.remove("active")); // On retire l’état actif à tous
    button.classList.add("active"); // On l’ajoute au bouton cliqué
    selectedDays = parseInt(button.getAttribute("data-days")); // On met à jour la variable avec la valeur du bouton
  });
});

// === API COMMUNES ===

// Fonction pour récupérer les communes à partir d’un code postal via l’API de l’État
async function fetchCommunesByCodePostal(codePostal) {
  try {
    const response = await fetch(
      `https://geo.api.gouv.fr/communes?codePostal=${codePostal}`
    );
    const data = await response.json();

    console.log("Données reçues de l'API:", data); // Pour le débogage
    return data;
  } catch (error) {
    console.error("Erreur lors de la requête API:", error);
    throw error;
  }
}

// Fonction pour afficher les communes récupérées dans la liste déroulante
function displayCommunes(data) {
  communeSelect.innerHTML = ""; // On vide les anciennes options

  if (data.length) {
    data.forEach((commune) => {
      console.log("Commune:", commune.nom);
      console.log("Centre:", commune.centre);

      const option = document.createElement("option");
      option.value = commune.code;
      option.textContent = commune.nom;

      // Gestion des coordonnées
      let lat = "Non disponible";
      let lon = "Non disponible";

      if (commune.centre && commune.centre.coordinates) {
        lon = commune.centre.coordinates[0];
        lat = commune.centre.coordinates[1];
      } else if (commune.coordonnees) {
        lat = commune.coordonnees.lat;
        lon = commune.coordonnees.lon;
      } else if (commune.geom) {
        console.log("Géométrie présente mais format différent");
      }

      // On stocke les coordonnées dans les attributs de l'option
      option.dataset.lat = lat;
      option.dataset.lon = lon;

      console.log(`Commune ${commune.nom}: lat=${lat}, lon=${lon}`);

      communeSelect.appendChild(option); // On ajoute l’option à la liste
    });

    communeSelect.style.display = "block"; // On affiche la liste
    validationButton.style.display = "block"; // On affiche le bouton de validation
  } else {
    // Si aucune commune n'est trouvée
    const existingMessage = document.getElementById("error-message");
    if (!existingMessage) {
      const message = document.createElement("p");
      message.id = "error-message";
      message.textContent = "Le code postal saisi n'est pas valide";
      message.classList.add("errorMessage");
      document.body.appendChild(message);
    }

    communeSelect.style.display = "none";
    validationButton.style.display = "none";

    // Rechargement automatique de la page après 3 secondes
    setTimeout(() => location.reload(), 3000);
  }
}

// === API MÉTÉO ===

// Fonction pour récupérer la météo en fonction de la commune sélectionnée (INSEE)
async function fetchMeteoByCommune(selectedCommune, days) {
  try {
    const response = await fetch(
      `https://api.meteo-concept.com/api/forecast/daily?token=e48896092d71f8ca66bb502954fad8915ecf0d60728188e38a298143516d16bb&insee=${selectedCommune}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur lors de la requête API:", error);
    throw error;
  }
}

// === GESTION DES ÉVÉNEMENTS ===

// Lorsqu'on entre un code postal, on tente de récupérer les communes associées
codePostalInput.addEventListener("input", async () => {
  const codePostal = codePostalInput.value;
  communeSelect.style.display = "none";
  validationButton.style.display = "none";

  if (/^\d{5}$/.test(codePostal)) { // Vérifie si le code postal est bien composé de 5 chiffres
    try {
      const data = await fetchCommunesByCodePostal(codePostal);
      displayCommunes(data);
    } catch (error) {
      console.error(
        "Une erreur est survenue lors de la recherche de la commune :",
        error
      );
      throw error;
    }
  }
});

// Quand on clique sur le bouton de validation
validationButton.addEventListener("click", async () => {
  const selectedCommune = communeSelect.value;

  if (selectedCommune) {
    try {
      const data = await fetchMeteoByCommune(selectedCommune, selectedDays);

      // On récupère les infos supplémentaires sur la commune sélectionnée
      const selectedOption = communeSelect.options[communeSelect.selectedIndex];
      const communeName = selectedOption.textContent;
      const latitude = selectedOption.dataset.lat;
      const longitude = selectedOption.dataset.lon;

      console.log("Valeurs envoyées à createWeatherCards:");
      console.log("Commune:", communeName);
      console.log("Latitude:", latitude);
      console.log("Longitude:", longitude);

      // On regarde quelles options sont cochées (checkbox)
      const selectedOptions = {};
      checkboxOptions.forEach(option => {
        selectedOptions[option.id] = document.getElementById(option.id).checked;
      });

      // Appel à la fonction (non incluse ici) pour afficher les cartes météo
      createWeatherCards(data, selectedDays, communeName, latitude, longitude, selectedOptions);
    } catch (error) {
      console.error("Erreur lors de la requête API meteoConcept:", error);
      throw error;
    }
  }
});
