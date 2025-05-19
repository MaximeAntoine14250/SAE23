// Sélection des éléments
const codePostalInput = document.getElementById("code-postal");
const communeSelect = document.getElementById("communeSelect");
const validationButton = document.getElementById("validationButton");
const dayButtons = document.querySelectorAll(".day-button");
const darkModeToggle = document.getElementById("darkModeToggle");

// Variables globales
let selectedDays = 1;
let weatherData = null;
const checkboxOptions = [
  { id: "show-lat", property: "latitude" },
  { id: "show-lon", property: "longitude" },
  { id: "show-rain", property: "rr10" },
  { id: "show-wind", property: "wind10m" },
  { id: "show-wind-dir", property: "dirwind10m" }
];

// Initialiser le dark mode selon les préférences sauvegardées
if (localStorage.getItem("darkMode") === "enabled") {
  document.body.classList.add("dark-mode");
  darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}

// Fonction pour basculer le dark mode
darkModeToggle.addEventListener("click", () => {
  if (document.body.classList.contains("dark-mode")) {
    document.body.classList.remove("dark-mode");
    localStorage.setItem("darkMode", "disabled");
    darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  } else {
    document.body.classList.add("dark-mode");
    localStorage.setItem("darkMode", "enabled");
    darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  }
});

// Sélection du nombre de jours
dayButtons.forEach((button) => {
  button.addEventListener("click", () => {
    dayButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    selectedDays = parseInt(button.getAttribute("data-days"));
  });
});

// Fonction pour effectuer la requête API des communes en utilisant le code postal
async function fetchCommunesByCodePostal(codePostal) {
  try {
    const response = await fetch(
      `https://geo.api.gouv.fr/communes?codePostal=${codePostal}`
    );
    const data = await response.json();
    console.table(data);
    return data;
  } catch (error) {
    console.error("Erreur lors de la requête API:", error);
    throw error;
  }
}

// Fonction pour afficher les communes dans la liste déroulante
function displayCommunes(data) {
  communeSelect.innerHTML = "";
  // S'il y a au moins une commune retournée dans data
  if (data.length) {
    data.forEach((commune) => {
      const option = document.createElement("option");
      option.value = commune.code;
      option.textContent = commune.nom;
      option.dataset.lat = commune.centre?.coordinates[1] || "";
      option.dataset.lon = commune.centre?.coordinates[0] || "";
      communeSelect.appendChild(option);
    });
    communeSelect.style.display = "block";
    validationButton.style.display = "block";
  } else {
    // Supprimer un message précédent s'il existe déjà
    const existingMessage = document.getElementById("error-message");
    if (!existingMessage) {
      const message = document.createElement("p");
      message.id = "error-message";
      message.textContent = "Le code postal saisi n'est pas valide";
      message.classList.add("errorMessage");
      document.body.appendChild(message);
    }

    // Masquer les éléments inutiles
    communeSelect.style.display = "none";
    validationButton.style.display = "none";

    // Recharger la page après 3 secondes
    setTimeout(() => location.reload(), 3000);
  }
}

// Fonction pour effectuer la requête API de météo en utilisant le code de la commune sélectionnée
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

// Ajout de l'écouteur d'événement "input" sur le champ code postal
codePostalInput.addEventListener("input", async () => {
  const codePostal = codePostalInput.value;
  communeSelect.style.display = "none";
  validationButton.style.display = "none";

  if (/^\d{5}$/.test(codePostal)) {
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

// Ajout de l'écouteur d'événement "click" sur le bouton de validation
validationButton.addEventListener("click", async () => {
  const selectedCommune = communeSelect.value;
  if (selectedCommune) {
    try {
      const data = await fetchMeteoByCommune(selectedCommune, selectedDays);
      
      // Récupérer les coordonnées de la commune
      const selectedOption = communeSelect.options[communeSelect.selectedIndex];
      const communeName = selectedOption.textContent;
      const latitude = selectedOption.dataset.lat;
      const longitude = selectedOption.dataset.lon;
      
      // Récupérer les options cochées
      const selectedOptions = {};
      checkboxOptions.forEach(option => {
        selectedOptions[option.id] = document.getElementById(option.id).checked;
      });
      
      createWeatherCards(data, selectedDays, communeName, latitude, longitude, selectedOptions);
    } catch (error) {
      console.error("Erreur lors de la requête API meteoConcept:", error);
      throw error;
    }
  }
});