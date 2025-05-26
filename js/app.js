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
    dayButtons.forEach((btn) => btn.classList.remove("active")); // On retire l'état actif à tous
    button.classList.add("active"); // On l'ajoute au bouton cliqué
    selectedDays = parseInt(button.getAttribute("data-days")); // On met à jour la variable avec la valeur du bouton
  });
});

// === API COMMUNES ===

// Fonction pour récupérer les communes à partir d'un code postal via l'API de l'État
async function fetchCommunesByCodePostal(codePostal) {
  try {
    // Ajout du paramètre fields=centre pour récupérer les coordonnées
    const response = await fetch(
      `https://geo.api.gouv.fr/communes?codePostal=${codePostal}&fields=nom,code,centre&format=json&geometry=centre`
    );
    const data = await response.json();

    console.log("Données reçues de l'API:", data); // Pour le débogage
    return data;
  } catch (error) {
    console.error("Erreur lors de la requête API:", error);
    throw error;
  }
}

function displayCommunes(data) {
  communeSelect.innerHTML = ""; // On vide les anciennes options

  if (data.length) {
    data.forEach((commune) => {
      console.log("Commune complète:", commune);

      const option = document.createElement("option");
      option.value = commune.code;
      option.textContent = commune.nom;

      // Gestion des coordonnées - CORRECTION COMPLÈTE
      let lat = null;
      let lon = null;

      // Vérification de plusieurs formats possibles
      if (commune.centre && commune.centre.coordinates) {
        // Format GeoJSON standard: [longitude, latitude]
        if (Array.isArray(commune.centre.coordinates) && commune.centre.coordinates.length >= 2) {
          lon = commune.centre.coordinates[0];
          lat = commune.centre.coordinates[1];
          console.log(`Format GeoJSON - ${commune.nom}: lat=${lat}, lon=${lon}`);
        }
      } else if (commune.centre && commune.centre.geometry && commune.centre.geometry.coordinates) {
        // Format avec geometry
        if (Array.isArray(commune.centre.geometry.coordinates) && commune.centre.geometry.coordinates.length >= 2) {
          lon = commune.centre.geometry.coordinates[0];
          lat = commune.centre.geometry.coordinates[1];
          console.log(`Format geometry - ${commune.nom}: lat=${lat}, lon=${lon}`);
        }
      } else if (commune.lat && commune.lon) {
        // Format direct
        lat = commune.lat;
        lon = commune.lon;
        console.log(`Format direct - ${commune.nom}: lat=${lat}, lon=${lon}`);
      } else if (commune.latitude && commune.longitude) {
        // Autre format possible
        lat = commune.latitude;
        lon = commune.longitude;
        console.log(`Format latitude/longitude - ${commune.nom}: lat=${lat}, lon=${lon}`);
      }

      // Si on n'a toujours pas de coordonnées, on essaie une requête séparée
      if (lat === null || lon === null) {
        console.warn(`Coordonnées non trouvées pour ${commune.nom}, code: ${commune.code}`);
        // On stocke le code pour une récupération ultérieure si nécessaire
        option.dataset.needsCoordinates = "true";
        option.dataset.lat = "Non disponible";
        option.dataset.lon = "Non disponible";
      } else {
        // Vérification que les coordonnées sont valides (en France métropolitaine approximativement)
        if (lat >= 41 && lat <= 51 && lon >= -5 && lon <= 10) {
          option.dataset.lat = lat.toString();
          option.dataset.lon = lon.toString();
          console.log(`✓ Coordonnées valides pour ${commune.nom}: lat=${lat}, lon=${lon}`);
        } else {
          console.warn(`⚠ Coordonnées hors limites pour ${commune.nom}: lat=${lat}, lon=${lon}`);
          option.dataset.lat = "Non disponible";
          option.dataset.lon = "Non disponible";
        }
      }

      communeSelect.appendChild(option);
    });

    communeSelect.style.display = "block";
    validationButton.style.display = "block";
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

// Fonction alternative pour récupérer les coordonnées si nécessaire
async function fetchCoordinatesForCommune(codeInsee) {
  try {
    const response = await fetch(
      `https://geo.api.gouv.fr/communes/${codeInsee}?fields=nom,centre&format=json&geometry=centre`
    );
    const data = await response.json();
    
    if (data.centre && data.centre.coordinates) {
      return {
        lat: data.centre.coordinates[1],
        lon: data.centre.coordinates[0]
      };
    }
    return null;
  } catch (error) {
    console.error("Erreur lors de la récupération des coordonnées:", error);
    return null;
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
      let latitude = selectedOption.dataset.lat;
      let longitude = selectedOption.dataset.lon;

      // Si les coordonnées ne sont pas disponibles, on essaie de les récupérer
      if (latitude === "Non disponible" || longitude === "Non disponible") {
        console.log("Tentative de récupération des coordonnées...");
        const coordinates = await fetchCoordinatesForCommune(selectedCommune);
        if (coordinates) {
          latitude = coordinates.lat.toString();
          longitude = coordinates.lon.toString();
          console.log(`Coordonnées récupérées: lat=${latitude}, lon=${longitude}`);
        }
      }

      console.log("Valeurs envoyées à createWeatherCards:");
      console.log("Commune:", communeName);
      console.log("Latitude:", latitude);
      console.log("Longitude:", longitude);

      // On regarde quelles options sont cochées (checkbox)
      const selectedOptions = {};
      checkboxOptions.forEach(option => {
        selectedOptions[option.id] = document.getElementById(option.id).checked;
      });

      // Appel à la fonction pour afficher les cartes météo
      createWeatherCards(data, selectedDays, communeName, latitude, longitude, selectedOptions);
    } catch (error) {
      console.error("Erreur lors de la requête API meteoConcept:", error);
      throw error;
    }
  }
});
