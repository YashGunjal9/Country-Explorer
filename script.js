document.addEventListener("DOMContentLoaded", () => {
  const search = document.querySelector(".search");
  const searchInput = document.getElementById("searchInput");
  const resultDiv = document.getElementById("result");

  let allCountries = [];
  let countriesLoaded = false;

  /* Fetch Countries */

  async function fetchCountries() {
    try {
      resultDiv.classList.remove("hidden");

      resultDiv.innerHTML = `
                <div class="loading">
                    <i class="fas fa-spinner fa-spin"></i>
                    Loading countries...
                </div>
            `;

      const response = await fetch(
        "https://countries.dev/countries?sort=name&order=asc",
      );

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      allCountries = await response.json();

      if (!Array.isArray(allCountries)) {
        throw new Error("Invalid API response");
      }

      countriesLoaded = true;

      searchCountry();
    } catch (error) {
      console.error("Error:", error);

      resultDiv.innerHTML = `
                <div class="error">
                    <i class="fas fa-exclamation-circle"></i>
                    <h3>Unable to load countries</h3>
                    <p>${error.message}</p>
                </div>
            `;
    }
  }

  /* Display Countries */

  function displayCountries(countries) {
    if (countries.length === 0) {
      resultDiv.classList.remove("hidden");

      resultDiv.innerHTML = `
                <div class="error">
                    <i class="fas fa-search"></i>
                    <h3>No countries found</h3>
                    <p>Try another country name, capital or ISO code.</p>
                </div>
            `;

      return;
    }

    resultDiv.classList.remove("hidden");

    resultDiv.innerHTML = `
            <div class="countries-grid">

                ${countries
                  .map((country) => {
                    const countryName = country.name || "N/A";

                    const capital = country.capital || "N/A";

                    const population =
                      country.population != null
                        ? Number(country.population).toLocaleString()
                        : "N/A";

                    const region = country.region || "N/A";

                    const isoCode = country.alpha2Code || "N/A";

                    const flag = country.flags?.png || country.flags?.svg || "";

                    /* Currency */

                    const currencies =
                      Array.isArray(country.currencies) &&
                      country.currencies.length > 0
                        ? country.currencies
                            .map((currency) => {
                              const name = currency.name || "N/A";

                              const symbol = currency.symbol
                                ? ` (${currency.symbol})`
                                : "";

                              return `${name}${symbol}`;
                            })
                            .join(", ")
                        : "N/A";

                    /* Languages */

                    const languages =
                      Array.isArray(country.languages) &&
                      country.languages.length > 0
                        ? country.languages
                            .map((language) => language.name || language)
                            .join(", ")
                        : "N/A";

                    /* Dial Code */

                    const dialCode =
                      Array.isArray(country.callingCodes) &&
                      country.callingCodes.length > 0
                        ? country.callingCodes
                            .map((code) => `+${code}`)
                            .join(", ")
                        : "N/A";

                    return `
                        <div class="country-card">

                            <div class="flag-container">

                                ${
                                  flag
                                    ? `
                                            <img
                                                src="${flag}"
                                                alt="${countryName} Flag"
                                                class="country-flag"
                                                loading="lazy"
                                            >
                                        `
                                    : `
                                            <span class="flag-fallback">
                                                ${country.flag || "🌍"}
                                            </span>
                                        `
                                }

                            </div>


                            <h2 class="country-name">
                                ${countryName}
                            </h2>


                            <div class="country-info">

                                <div class="info-item">
                                    <h3>Capital</h3>
                                    <p>${capital}</p>
                                </div>


                                <div class="info-item">
                                    <h3>Population</h3>
                                    <p>${population}</p>
                                </div>


                                <div class="info-item">
                                    <h3>Currency</h3>
                                    <p>${currencies}</p>
                                </div>


                                <div class="info-item">
                                    <h3>Region</h3>
                                    <p>${region}</p>
                                </div>


                                <div class="info-item">
                                    <h3>Languages</h3>
                                    <p>${languages}</p>
                                </div>


                                <div class="info-item">
                                    <h3>ISO Code</h3>
                                    <p>${isoCode}</p>
                                </div>


                                <div class="info-item">
                                    <h3>Dial Code</h3>
                                    <p>${dialCode}</p>
                                </div>

                            </div>

                        </div>
                    `;
                  })
                  .join("")}

            </div>
        `;

    /* Handle Broken Flags */

    const flagImages = resultDiv.querySelectorAll(".country-flag");

    flagImages.forEach((image, index) => {
      image.addEventListener("error", () => {
        const country = countries[index];

        image.style.display = "none";

        const fallback = document.createElement("span");

        fallback.className = "flag-fallback";

        fallback.textContent = country.flag || "🌍";

        image.parentElement.appendChild(fallback);
      });
    });
  }

  /* Search Countries */

  function searchCountry() {
    const searchValue = searchInput.value.trim().toLowerCase();

    /* Empty Search */

    if (!searchValue) {
      resultDiv.classList.add("hidden");

      return;
    }

    /* Load Countries Only After Search */

    if (!countriesLoaded) {
      fetchCountries();

      return;
    }

    /* Common Country Aliases */

    const countryAliases = {
      usa: "united states of america",
      us: "united states of america",

      uk: "united kingdom",
      gb: "united kingdom",

      uae: "united arab emirates",

      russia: "russia",

      "south korea": "south korea",
      korea: "south korea",

      "north korea": "north korea",

      "czech republic": "czechia",

      holland: "netherlands",

      vietnam: "viet nam",

      laos: "lao people's democratic republic",

      iran: "iran",

      syria: "syria",

      tanzania: "tanzania",

      bolivia: "bolivia",

      venezuela: "venezuela",
    };

    /* Convert Alias */

    const normalizedSearch = countryAliases[searchValue] || searchValue;

    /* Exact Match */

    const exactMatches = allCountries.filter((country) => {
      const name = (country.name || "").toLowerCase();

      const iso2 = (country.alpha2Code || "").toLowerCase();

      const iso3 = (country.alpha3Code || "").toLowerCase();

      return (
        name === normalizedSearch ||
        iso2 === searchValue ||
        iso3 === searchValue
      );
    });

    /* Show Exact Match */

    if (exactMatches.length > 0) {
      displayCountries(exactMatches);

      return;
    }

    /* Partial Search */

    const filteredCountries = allCountries.filter((country) => {
      const name = (country.name || "").toLowerCase();

      const capital = (country.capital || "").toLowerCase();

      const iso2 = (country.alpha2Code || "").toLowerCase();

      const iso3 = (country.alpha3Code || "").toLowerCase();

      return (
        name.includes(searchValue) ||
        capital.includes(searchValue) ||
        iso2.includes(searchValue) ||
        iso3.includes(searchValue)
      );
    });

    displayCountries(filteredCountries);
  }

  /* Search Button */

  search.addEventListener("click", () => {
    searchCountry();
  });

  /* Enter Key */

  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      searchCountry();
    }
  });
});
