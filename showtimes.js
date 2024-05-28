const proxyUrl = 'https://amcshowtimes-f9650fda1239.herokuapp.com/proxy?url=';
const apiKey = '95A776EF-F8DD-429E-B5F7-44988915688D';

async function fetchMovieData(url, headers) {
    const response = await fetch(proxyUrl + encodeURIComponent(url), { headers });
    return response.json();
}

function createMovieInfoElement(movie, absMovieTime, score) {
    const movieInfo = document.createElement('div');
    movieInfo.innerHTML = `
        <p>${movie} | ${absMovieTime} | score: ${score}</p>
    `;
    return movieInfo;
}

async function renderMovieData() {
    try {
        let urlShowtimes = 'https://api.amctheatres.com/v2/theatres/2110/showtimes?page-number=1&page-size=100';
        const headers = { "X-AMC-Vendor-Key": apiKey };
        const movieShowtimes = {};

        // Fetch movie showtimes data
        while (urlShowtimes) {
            const data = await fetchMovieData(urlShowtimes, headers);
            if (data.errors) {
                console.error('Error:', data.errors);
                return;
            }
            const showtimes = data["_embedded"]["showtimes"];
            try {
                urlShowtimes = data["_links"]['next']["href"];
            } catch (error) {
                urlShowtimes = null;
            }
            for (const showtime of showtimes) {
                const movie = showtime['movieName'];
                const movieId = showtime['movieId'];
                const absMovieTime = new Date(showtime['showDateTimeLocal']);
                if (!(movie in movieShowtimes) || movieShowtimes[movie][0] < absMovieTime) {
                    movieShowtimes[movie] = [absMovieTime, movieId];
                }
            }
        }

        // Inside the loop where you fetch and process movie data
        for (let movie in movieShowtimes) {
            let [abs_movie_time, movie_id] = movieShowtimes[movie];
            let url_movie = `https://api.amctheatres.com/v2/movies/${movie_id}`;
            let response = await fetch(proxyUrl + encodeURIComponent(url_movie), { headers });
            let movieData = await response.json();
            let score = movieData['score'];
            let earliest_showtime = new Date(movieData["earliestShowingUtc"]);

            // Create a new table row
            let row = document.createElement('tr');
            
            // Populate table cells with movie information
            row.innerHTML = `<td>${movie}</td><td>${abs_movie_time}</td>`;
            
            // Append the row to the table body
            document.getElementById('movieList').appendChild(row);
        }

    } catch (error) {
        console.error('Error occurred:', error);
    }
}

renderMovieData().catch(error => console.error('Unhandled promise rejection:', error));
