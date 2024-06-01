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

async function renderMovieData(theatre_id, theatre_name) {
    try {
        let urlShowtimes = `https://api.amctheatres.com/v2/theatres/${theatre_id}/showtimes?page-number=1&page-size=100`;
        const headers = { "X-AMC-Vendor-Key": apiKey };
        let movieShowtimes = {};

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
                    movieShowtimes[movie] = [absMovieTime, showtime['showDateTimeLocal'], movieId];
                }
            }
        }

        var movieShowtimesList = Object.keys(movieShowtimes).map(function(key) {
            return [key, movieShowtimes[key][0], movieShowtimes[key][1]];
        });

        movieShowtimesList.sort(function(first, second) {
            return first[1] - second[1];
        });
        let header = document.getElementById("theatre_header")
        header.innerHTML = `< ${theatre_name} >`
        let table = document.getElementById('movieList')
        table.innerHTML=''
        for (var i = 0; i < movieShowtimesList.length; i++) {
            let [movie, abs_movie_time, local_movie_time, movie_id] = movieShowtimesList[i];
            let row = table.insertRow(i)
            let time_arr = local_movie_time.split('T')
            row.innerHTML = `<td>${movie}</td><td>${time_arr[1]} | ${time_arr[0]}</td>`;
            
        }

    } catch (error) {
        console.error('Error occurred:', error);
    }
}

theatre_list = [2110, 2112, 2195]
theatre_index = 0 //default to village 7
theatre_id_to_name = {
    2110 : "Village 7",
    2112 : "Union Square 6",
    2195 : "Kips Bay 15",

}

async function changeTheatre(direction) {
  theatre_index = (theatre_list.length + direction + theatre_index) % theatre_list.length
  let header = document.getElementById("theatre_header")
        header.innerHTML = `< ${theatre_id_to_name[theatre_list[theatre_index]]} >`
}









document.getElementById("hitit").addEventListener("click", function(){renderMovieData(theatre_list[theatre_index], theatre_id_to_name[theatre_list[theatre_index]])});
document.getElementById("rocker-right").addEventListener("click", function(){changeTheatre(1)});
document.getElementById("rocker-left").addEventListener("click", function(){changeTheatre(-1)});