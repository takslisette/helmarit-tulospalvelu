
"use strict";

// Sivun HTML-elementit
const matchesList = document.querySelector("#matches-list");
const statusMessage = document.querySelector("#status-message");
const upcomingButton = document.querySelector("#upcoming-button");
const finishedButton = document.querySelector("#finished-button");

// Valitaan aluksi tulevat ottelut
let selectedFilter = "upcoming";

// Väliaikainen testidata käyttöliittymän testaamiseen.
// Korvataan tämä myöhemmin API:sta haettavilla tiedoilla.
const matches = [
    {
        date: "2026-11-01T16:00:00",
        homeTeam: "Suomi",
        awayTeam: "Vastustaja",
        homeScore: null,
        awayScore: null,
        status: "Tuleva ottelu"
    },
    {
        date: "2026-10-01T18:00:00",
        homeTeam: "Suomi",
        awayTeam: "Vastustaja",
        homeScore: 2,
        awayScore: 1,
        status: "Päättynyt"
    }
];

// Muotoillaan päivämäärä suomenkieliseen muotoon
function formatDate(dateString) {
    const date = new Date(dateString);

    return new Intl.DateTimeFormat("fi-FI", {
        dateStyle: "medium",
        timeStyle: "short"
    }).format(date);
}

// Näytetään ottelut valitun suodattimen perusteella
function renderMatches() {
    matchesList.replaceChildren();

    const now = new Date();

    const filteredMatches = matches.filter((match) => {
        const matchDate = new Date(match.date);

        if (selectedFilter === "upcoming") {
            return matchDate > now && match.homeScore === null;
        }

        return match.homeScore !== null;
    });

    // Kerrotaan käyttäjälle, jos otteluita ei löydy
    if (filteredMatches.length === 0) {
        statusMessage.textContent = "Tässä näkymässä ei ole otteluita.";
        return;
    }

    statusMessage.textContent = `Otteluita: ${filteredMatches.length}`;

    filteredMatches.forEach((match) => {
        // Luodaan kortti jokaiselle ottelulle
        const card = document.createElement("article");
        card.classList.add("match-card");

        const date = document.createElement("p");
        date.classList.add("match-date");
        date.textContent = formatDate(match.date);

        const teams = document.createElement("div");
        teams.classList.add("match-teams");

        const teamNames = document.createElement("span");
        teamNames.textContent = `${match.homeTeam} – ${match.awayTeam}`;

        const score = document.createElement("span");
        score.classList.add("match-score");

        if (match.homeScore === null) {
            score.textContent = "VS";
        } else {
            score.textContent = `${match.homeScore} – ${match.awayScore}`;
        }

        const status = document.createElement("p");
        status.classList.add("match-status");
        status.textContent = match.status;

        teams.append(teamNames, score);
        card.append(date, teams, status);
        matchesList.append(card);
    });
}

// Vaihdetaan näkymää painikkeesta
upcomingButton.addEventListener("click", () => {
    selectedFilter = "upcoming";

    upcomingButton.classList.add("active");
    finishedButton.classList.remove("active");

    renderMatches();
});

finishedButton.addEventListener("click", () => {
    selectedFilter = "finished";

    finishedButton.classList.add("active");
    upcomingButton.classList.remove("active");

    renderMatches();
});

// Näytetään ottelut heti sivun latautuessa
renderMatches();
