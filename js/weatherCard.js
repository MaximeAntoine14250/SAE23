function createCard(data) {
  // Créer de nouvelles divs
  let weatherTmin = document.createElement("div");
  let weatherTmax = document.createElement("div");
  let weatherPrain = document.createElement("div");
  let weatherSunHours = document.createElement("div");
  // Ajouter du contenu aux div
  weatherTmin.textContent = `température minimale : ${data.forecast.tmin}°C`;
  weatherTmax.textContent = `température maximale : ${data.forecast.tmax}°C`;
  weatherPrain.textContent = `Probabilité de pluie : ${data.forecast.probarain}%`;
  weatherSunHours.textContent = `Ensoleillement journalier : ${displayHours(
    data.forecast.sun_hours
  )}`;

  // Sélectionner les sections
  let weatherSection = document.getElementById("weatherInformation");
  let requestSection = document.getElementById("cityForm");
  // Ajouter les nouvelles div à la section
  weatherSection.appendChild(weatherTmin);
  weatherSection.appendChild(weatherTmax);
  weatherSection.appendChild(weatherPrain);
  weatherSection.appendChild(weatherSunHours);

  // Ajouter un bouton de retour vers le formulaire
  let reloadButton = document.createElement("div");
  reloadButton.textContent = "Nouvelle recherche";
  reloadButton.classList.add("reloadButton");
  document.body.appendChild(reloadButton);
  // Ajouter un listener sur le bouton
  reloadButton.addEventListener("click", function () {
    location.reload();
  });

  // Gérer la visibilité des sections
  requestSection.style.display = "none";
  weatherSection.style.display = "flex";
}

function displayHours(sunHours) {
  return sunHours + (sunHours > 1 ? " heures" : " heure");
}
