// Fonction pour créer les cartes météo
function createWeatherCards(data, days, communeName, latitude, longitude, selectedOptions) {
  // Récupérer les sections
  const weatherSection = document.getElementById("weatherInformation");
  const requestSection = document.getElementById("cityForm");
  
  // Vider la section météo
  weatherSection.innerHTML = "";
  
  // Afficher les informations de localisation si demandées
  if (selectedOptions["show-lat"] || selectedOptions["show-lon"]) {
    const locationInfo = document.createElement("div");
    locationInfo.className = "location-info";
    
    const locationTitle = document.createElement("h2");
    locationTitle.textContent = `${communeName}`;
    locationInfo.appendChild(locationTitle);
    
    const locationCoords = document.createElement("p");
    let coordsText = "";
    if (selectedOptions["show-lat"]) coordsText += `Latitude: ${latitude}`;
    if (selectedOptions["show-lat"] && selectedOptions["show-lon"]) coordsText += " | ";
    if (selectedOptions["show-lon"]) coordsText += `Longitude: ${longitude}`;
    locationCoords.textContent = coordsText;
    locationInfo.appendChild(locationCoords);
    
    weatherSection.appendChild(locationInfo);
  }
  
  // Limiter le nombre de jours à afficher
  const nbDays = Math.min(days, data.forecast.length);
  
  // Créer une carte pour chaque jour
  for (let i = 0; i < nbDays; i++) {
    const forecast = data.forecast[i];
    const date = new Date(forecast.datetime);
    

    // Créer un container pour ce jour
    const dayContainer = document.createElement("div");
    dayContainer.className = "weather-day";
    
    // Ajouter la date
    const dateHeader = document.createElement("h3");
    dateHeader.textContent = formatDate(date);
    dayContainer.appendChild(dateHeader);
    
    // Créer la carte météo
    const weatherCard = document.createElement("div");
    weatherCard.className = "weather-card";
    
    // Section principale avec icône et températures
    const weatherMain = document.createElement("div");
    weatherMain.className = "weather-main";
    
    // Icône météo
    const weatherIcon = document.createElement("div");
    weatherIcon.className = "weather-icon";
    const iconElement = document.createElement("i");
    iconElement.className = getWeatherIcon(forecast.weather);
    weatherIcon.appendChild(iconElement);
    weatherMain.appendChild(weatherIcon);
    
    // Températures
    const weatherTemps = document.createElement("div");
    weatherTemps.className = "weather-temps";
    const tempMin = document.createElement("p");
    tempMin.textContent = `Min: ${forecast.tmin}°C`;
    const tempMax = document.createElement("p");
    tempMax.textContent = `Max: ${forecast.tmax}°C`;
    weatherTemps.appendChild(tempMin);
    weatherTemps.appendChild(tempMax);
    weatherMain.appendChild(weatherTemps);
    
    weatherCard.appendChild(weatherMain);
    
    // Grille d'informations
    const infoGrid = document.createElement("div");
    infoGrid.className = "weather-info-grid";
    
    // Probabilité de pluie (toujours affichée)
    addInfoItem(infoGrid, `Probabilité de pluie: ${forecast.probarain}%`);
    
    // Ensoleillement (toujours affiché)
    addInfoItem(infoGrid, `Ensoleillement: ${displayHours(forecast.sun_hours)}`);
    
    // Informations optionnelles
    if (selectedOptions["show-rain"]) {
      addInfoItem(infoGrid, `Cumul de pluie: ${forecast.rr10} mm`);
    }
    
    if (selectedOptions["show-wind"]) {
      addInfoItem(infoGrid, `Vent moyen: ${forecast.wind10m} km/h`);
    }
    
    if (selectedOptions["show-wind-dir"]) {
      addInfoItem(infoGrid, `Direction du vent: ${forecast.dirwind10m}°`);
    }
    
    weatherCard.appendChild(infoGrid);
    dayContainer.appendChild(weatherCard);
    weatherSection.appendChild(dayContainer);
    
  }
  
  // Ajouter un bouton de retour vers le formulaire
  const reloadButton = document.createElement("div");
  reloadButton.textContent = "Nouvelle recherche";
  reloadButton.className = "reloadButton";
  weatherSection.appendChild(reloadButton);
  
  // Ajouter un listener sur le bouton
  reloadButton.addEventListener("click", function () {
    location.reload();
  });
  
  // Gérer la visibilité des sections
  requestSection.style.display = "none";
  weatherSection.style.display = "flex";
}

// Fonction pour ajouter un élément d'information
function addInfoItem(container, text) {
  const infoItem = document.createElement("div");
  infoItem.className = "weather-info-item";
  infoItem.textContent = text;
  container.appendChild(infoItem);
}

// Fonction pour formater la date
function formatDate(date) {
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  return date.toLocaleDateString('fr-FR', options).charAt(0).toUpperCase() + date.toLocaleDateString('fr-FR', options).slice(1);
}

// Fonction pour afficher les heures
function displayHours(sunHours) {
  return sunHours + (sunHours > 1 ? " heures" : " heure");
}

// Fonction pour déterminer l'icône météo en fonction du code
function getWeatherIcon(weatherCode) {
  // Codes météo selon la documentation de l'API MeteoConcept
  const weatherIcons = {
    0: "fas fa-sun", // Soleil
    1: "fas fa-cloud-sun", // Peu nuageux
    2: "fas fa-cloud", // Ciel voilé
    3: "fas fa-cloud", // Nuageux
    4: "fas fa-cloud", // Très nuageux
    5: "fas fa-smog", // Brouillard
    6: "fas fa-cloud-rain", // Brouillard givrant
    7: "fas fa-cloud-showers-heavy", // Pluie faible
    8: "fas fa-cloud-rain", // Pluie verglaçante
    9: "fas fa-cloud-showers-heavy", // Pluie forte
    10: "fas fa-cloud-meatball", // Pluie et neige
    11: "fas fa-cloud-rain", // Averses faibles
    12: "fas fa-cloud-showers-heavy", // Averses fortes
    13: "fas fa-bolt", // Averses orageuses
    14: "fas fa-cloud-meatball", // Tempête de neige
    15: "fas fa-snowflake", // Neige faible
    16: "fas fa-snowflake", // Neige forte
    17: "fas fa-cloud-meatball", // Grêle
    18: "fas fa-bolt", // Orage faible
    19: "fas fa-bolt", // Orage fort
    20: "fas fa-tornado", // Tempête
    21: "fas fa-tornado", // Tempête tropicale
    22: "fas fa-hurricane", // Ouragan
    23: "fas fa-cloud-sun", // Éclaircies
    24: "fas fa-cloud-showers-heavy", // Pluie et orage
    25: "fas fa-snowflake", // Neige
    26: "fas fa-cloud-meatball", // Neige intermittente
    27: "fas fa-cloud-sun-rain", // Averses et éclaircies
    28: "fas fa-cloud-showers-heavy", // Pluie intermittente
    29: "fas fa-cloud-rain", // Pluie modérée
    30: "fas fa-cloud-showers-heavy", // Averses
    31: "fas fa-cloud-sun-rain", // Averses et éclaircies
    32: "fas fa-cloud-rain", // Pluie intermittente
    40: "fas fa-cloud-sun", // Éclaircies
    41: "fas fa-cloud-sun-rain", // Averses et éclaircies
    42: "fas fa-cloud-sun", // Éclaircies
    43: "fas fa-cloud-sun-rain", // Averses et éclaircies
    44: "fas fa-cloud-sun", // Éclaircies
    45: "fas fa-cloud-sun-rain", // Averses et éclaircies
    46: "fas fa-cloud-sun", // Éclaircies
    47: "fas fa-cloud-sun-rain", // Averses et éclaircies
    48: "fas fa-smog", // Brume
    49: "fas fa-smog", // Brume
    50: "fas fa-smog", // Brume
    51: "fas fa-smog", // Brume
    52: "fas fa-smog", // Brume
    53: "fas fa-smog", // Brume
    54: "fas fa-smog", // Brume
    55: "fas fa-smog", // Brume
    56: "fas fa-smog", // Brume
    57: "fas fa-smog", // Brume
    58: "fas fa-smog", // Brume
    59: "fas fa-smog", // Brume
    60: "fas fa-bolt", // Orage
    61: "fas fa-bolt", // Orage
    62: "fas fa-bolt", // Orage
    63: "fas fa-bolt", // Orage
    64: "fas fa-bolt", // Orage
    65: "fas fa-bolt", // Orage
    66: "fas fa-bolt", // Orage
    67: "fas fa-bolt", // Orage
    68: "fas fa-bolt", // Orage
    69: "fas fa-bolt", // Orage
    70: "fas fa-bolt", // Orage
    71: "fas fa-bolt", // Orage
    72: "fas fa-bolt", // Orage
    73: "fas fa-bolt", // Orage
    74: "fas fa-bolt", // Orage
    75: "fas fa-bolt", // Orage
    76: "fas fa-bolt", // Orage
    77: "fas fa-bolt", // Orage
    78: "fas fa-bolt", // Orage
    79: "fas fa-bolt", // Orage
    80: "fas fa-bolt", // Orage
    81: "fas fa-bolt", // Orage
    82: "fas fa-bolt", // Orage
    83: "fas fa-bolt", // Orage
    84: "fas fa-bolt", // Orage
    85: "fas fa-bolt", // Orage
    86: "fas fa-bolt", // Orage
    87: "fas fa-bolt", // Orage
    88: "fas fa-bolt", // Orage
    89: "fas fa-bolt", // Orage
    90: "fas fa-bolt", // Orage
    91: "fas fa-bolt", // Orage
    92: "fas fa-bolt", // Orage
    93: "fas fa-bolt", // Orage
    94: "fas fa-bolt", // Orage
    95: "fas fa-bolt", // Orage
    96: "fas fa-bolt", // Orage
    97: "fas fa-bolt", // Orage
    98: "fas fa-bolt", // Orage
    99: "fas fa-bolt", // Orage
    100: "fas fa-bolt", // Orage
    235: "fas fa-cloud-sun" // Code par défaut
  };

  return weatherIcons[weatherCode] || "fas fa-cloud"; // Retourne l'icône correspondant au code ou une icône par défaut
}