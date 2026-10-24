
"use strict";

// Sivun HTML-elementit
const matchesList = document.querySelector("#matches-list");
const statusMessage = document.querySelector("#status-message");
const upcomingButton = document.querySelector("#upcoming-button");
const finishedButton = document.querySelector("#finished-button");

// Valitaan aluksi tulevat ottelut
let selectedFilter = "upcoming";

// Tähän tallennetaan API:sta haetut ottelut
let matches = [];

// Muotoillaan päivämäärä suomenkieliseen muotoon
function formatDate(dateString) {
    const date = new Date(dateString);

    return new Intl.DateTimeFormat("fi-FI", {
        dateStyle: "medium",
        timeStyle: "short"
    }).format(date);
}

// Haetaan ottelut Netlify-funktion kautta
async function loadMatches() {
    statusMessage.textContent = "Ladataan otteluita...";
    matchesList.replaceChildren();

    try {
        const response = await fetch("/.netlify/functions/fixtures");

        if (!response.ok) {
            throw new Error("Otteluiden hakeminen epäonnistui.");
        }

        const data = await response.json();

        if (data.errors && Object.keys(data.errors).length > 0) {
            throw new Error("Ottelutietojen API-haku epäonnistui.");
        }

        // Muutetaan API:n tiedot sivuston käyttämään muotoon
        matches = (data.response || []).map((item) => ({
            date: item.fixture.date,
            homeTeam: item.teams.home.name,
            awayTeam: item.teams.away.name,
            homeScore: item.goals.home,
            awayScore: item.goals.away,
            status: item.fixture.status.long,
            statusCode: item.fixture.status.short
        }));

        // Uusimmat ottelut ensin
        matches.sort((a, b) => new Date(b.date) - new Date(a.date));

        renderMatches();
    } catch (error) {
        console.error("Otteluiden lataaminen epäonnistui:", error);
        statusMessage.textContent =
            "Otteluiden lataaminen epäonnistui. Yritä myöhemmin uudelleen.";
    }
}

// Näytetään ottelut valitun suodattimen perusteella
function renderMatches() {
    matchesList.replaceChildren();

    const now = new Date();

    const filteredMatches = matches.filter((match) => {
        const matchDate = new Date(match.date);

        if (selectedFilter === "upcoming") {
            return matchDate > now &&
                match.homeScore === null &&
                match.awayScore === null;
        }

        return match.homeScore !== null &&
            match.awayScore !== null;
    });

    if (filteredMatches.length === 0) {
        if (selectedFilter === "upcoming") {
            statusMessage.textContent =
                "Tulevia otteluita ei löytynyt API:n palauttamista tiedoista.";
        } else {
            statusMessage.textContent =
                "Päättyneitä otteluita ei löytynyt.";
        }

        return;
    }

    statusMessage.textContent = `Otteluita: ${filteredMatches.length}`;

    filteredMatches.forEach((match) => {
        const card = document.createElement("article");
        card.classList.add("match-card");

        const date = document.createElement("p");
        date.classList.add("match-date");
        date.textContent = formatDate(match.date);

        const teams = document.createElement("div");
        teams.classList.add("match-teams");

        const teamNames = document.createElement("span");
        teamNames.textContent =
            `${match.homeTeam} – ${match.awayTeam}`;

        const score = document.createElement("span");
        score.classList.add("match-score");

        if (match.homeScore === null || match.awayScore === null) {
            score.textContent = "VS";
        } else {
            score.textContent =
                `${match.homeScore} – ${match.awayScore}`;
        }

        const status = document.createElement("p");
        status.classList.add("match-status");
        status.textContent = match.status;

        teams.append(teamNames, score);
        card.append(date, teams, status);
        matchesList.append(card);
    });
}

// Tulevat ottelut -painike
upcomingButton.addEventListener("click", () => {
    selectedFilter = "upcoming";

    upcomingButton.classList.add("active");
    finishedButton.classList.remove("active");

    renderMatches();
});

// Päättyneet ottelut -painike
finishedButton.addEventListener("click", () => {
    selectedFilter = "finished";

    finishedButton.classList.add("active");
    upcomingButton.classList.remove("active");

    renderMatches();
});

// Haetaan oikeat ottelut sivun latautuessa
loadMatches();
