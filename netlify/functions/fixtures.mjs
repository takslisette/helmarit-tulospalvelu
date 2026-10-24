
export default async () => {
    // Luetaan API-avain Netlifyn ympäristömuuttujista.
    const apiKey = process.env.API_FOOTBALL_KEY;

    if (!apiKey) {
        return new Response(
            JSON.stringify({ error: "API-avain puuttuu palvelimen asetuksista." }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" }
            }
        );
    }

    try {
        // Haetaan Suomen maajoukkueen ottelut kaudelta 2024.
        const url = new URL("https://v3.football.api-sports.io/fixtures");
        url.searchParams.set("team", "1771");
        url.searchParams.set("season", "2024");

        const response = await fetch(url, {
            headers: {
                "x-apisports-key": apiKey
            }
        });

        if (!response.ok) {
            return new Response(
                JSON.stringify({ error: "Ottelutietojen haku epäonnistui." }),
                {
                    status: 502,
                    headers: { "Content-Type": "application/json" }
                }
            );
        }

        const data = await response.json();

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        return new Response(
            JSON.stringify({ error: "Yhteys ottelutietoihin epäonnistui." }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" }
            }
        );
    }
};
