document.addEventListener("DOMContentLoaded", function () {
  const userTab = document.querySelector("[data-userWeather]");
  const searchTab = document.querySelector("[data-searchWeather]");
  const userContainer = document.querySelector(".weather-container");
  const grantAccessContainer = document.querySelector(".grant-location-container");
  const searchForm = document.querySelector("[data-searchForm]");
  const loadingScreen = document.querySelector(".loading-container");
  const userInfoContainer = document.querySelector(".user-info-container");

  let oldTab = userTab;
  const API_KEY = "b1435e659f352683bc640b45c335ac64";
  oldTab.classList.add("current-tab");



  // function for switch tab
  function switchTab(newTab) {
    if (newTab !== oldTab) {
      oldTab.classList.remove("current-tab");
      oldTab = newTab;
      oldTab.classList.add("current-tab");

      if (!searchForm.classList.contains("active")) {
        userInfoContainer.classList.remove("active");
        if (grantAccessContainer) {
          grantAccessContainer.classList.remove("active");
        }
        searchForm.classList.add("active");
      } else {
        searchForm.classList.remove("active");
        userInfoContainer.classList.remove("active");

         getfromSessionStorage();
      }
    }
  }



  // for user tab - your weather wala
  userTab.addEventListener("click", () => {
    switchTab(userTab);
  });

  // search tab - search wala
  searchTab.addEventListener("click", () => {
    switchTab(searchTab);
  });


  

  // check if coordinates are already present in session storage
  function getfromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");

    if (!localCoordinates) {
      if (grantAccessContainer) {
        grantAccessContainer.classList.add("active");
      }
    } else {
      const coordinates = JSON.parse(localCoordinates);
      fetchUserWeatherInfo(coordinates);
    }
  }

  async function fetchUserWeatherInfo(coordinates) {
    const { lat, lon } = coordinates;

    if (grantAccessContainer) {
      grantAccessContainer.classList.remove("active");
    }
    loadingScreen.classList.add("active");

    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
      const data = await response.json();

      loadingScreen.classList.remove("active");
      userInfoContainer.classList.add("active");
      renderWeatherInfo(data);
    } catch (error) {
      loadingScreen.classList.remove("active");
      console.log("Error Found", error);
    }
  }

  function renderWeatherInfo(weatherInfo) {
    // Assuming 'weatherInfo' is the correct variable
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temperature = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather[0]?.description;
    weatherIcon.src = `https://openweathermap.org/img/w/${weatherInfo?.weather[0]?.icon}.png`;
    temperature.innerText = `${weatherInfo?.main?.temp} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity} %`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all} %`;
  }

  const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  };

  function success(pos) {
    const crd = pos.coords;

    console.log("Your current position is:");
    console.log(`Latitude : ${crd.latitude}`);
    console.log(`Longitude: ${crd.longitude}`);
    console.log(`More or less ${crd.accuracy} meters.`);
    const userCoordinates = {
      lat: crd.latitude,
      lon: crd.longitude,
    };
    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
  }

  function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
  }

  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(success, error, options);
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  }

  const grantAccessButton = document.querySelector("[data-grantAccess]");
  grantAccessButton.addEventListener("click", getLocation);

  const searchInput = document.querySelector("[data-searchInput]");
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();

    let cityName = searchInput.value;

    if (cityName === "") return;
    else fetchSearchWeatherInfo(cityName);
  });

  async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    if (grantAccessContainer) {
      grantAccessContainer.classList.remove("active");
    }

    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metrics`);
      const data = await response.json();

      loadingScreen.classList.remove("active");
      userInfoContainer.classList.add("active");
      renderWeatherInfo(data);
    } catch (error) {
      console.log("Error Found", error);
    }
  }
});
