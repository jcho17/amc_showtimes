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

async function getMovieCurrentRun(movie_id, headers) {
    let earliest_showtime_url = `https://api.amctheatres.com/v2/movies/${movie_id}/`;
    let data = await fetchMovieData(earliest_showtime_url, headers)
    release_date = data["releaseDateUtc"]
    release_date.replace("T", " ");
    release_date.replace(/-/g,'/');
    let run_length_in_ms = new Date() - new Date(release_date)
    let run_length_in_days = Math.floor(run_length_in_ms/ 8.64e+7)
    if (run_length_in_days < 0){
        run_length_in_days = "Unreleased"
    } else {
        run_length_in_days = run_length_in_days.toString() + " days";
    }
    return run_length_in_days
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
                if (!(movie in movieShowtimes)) {
                    run_length_in_days = await getMovieCurrentRun(movieId, headers);
                    movieShowtimes[movie] = [absMovieTime, showtime['showDateTimeLocal'], run_length_in_days];
                } else if (movieShowtimes[movie][0] < absMovieTime) {
                    movieShowtimes[movie] = [absMovieTime, showtime['showDateTimeLocal'], movieShowtimes[movie][2]];
                }
            }
        }

        var movieShowtimesList = Object.keys(movieShowtimes).map(function(key) {
            return [key, movieShowtimes[key][0], movieShowtimes[key][1],  movieShowtimes[key][2]];
        });

        movieShowtimesList.sort(function(first, second) {
            return first[1] - second[1];
        });
        let header = document.getElementById("theatre_header")
        header.innerHTML = `< ${theatre_name} >`
        let table = document.getElementById('movieList')
        table.innerHTML=''
        for (var i = 0; i < movieShowtimesList.length; i++) {

        }
        for (var i = 0; i < movieShowtimesList.length; i++) {
            let [movie, abs_movie_time, local_movie_time, run_length_in_days] = movieShowtimesList[i];
            let time_arr = local_movie_time.split('T')
            let row = table.insertRow(i)
            row.innerHTML = `<td>${movie}</td><td>${time_arr[1]} | ${time_arr[0]}</td><td>${run_length_in_days}</td>`;
            
        }

    } catch (error) {
        console.error('Error occurred:', error);
    }
}

theatre_list = [2110, 2112, 2195]

theatre_id_to_showtimes_cache = {}
theatre_index = 0 //default to village 7
theatre_id_to_name = {
    2110 : "Village 7",
    2112 : "Union Square 6",
    2195 : "Kips Bay 15",

}

async function changeTheatre(direction) { 
  curr_theatre_id = theatre_list[theatre_index]
  // setting cache (only if cache has not been set and page has been generated)
  if (!(curr_theatre_id in theatre_id_to_showtimes_cache) & document.getElementById('movieList').innerHTML != ``){
    theatre_id_to_showtimes_cache[curr_theatre_id] = document.getElementById('movieList').innerHTML
  }
  theatre_index = (theatre_list.length + direction + theatre_index) % theatre_list.length
  new_theatre_id = theatre_list[theatre_index]
  console.log(theatre_id_to_showtimes_cache)
  // getting cache if available
  if (new_theatre_id in theatre_id_to_showtimes_cache){
    document.getElementById('movieList').innerHTML = theatre_id_to_showtimes_cache[new_theatre_id]
  } else {
    document.getElementById('movieList').innerHTML=''
  }
  let header = document.getElementById("theatre_header")
        header.innerHTML = `< ${theatre_id_to_name[new_theatre_id]} >`
}









document.getElementById("hitit").addEventListener("click", function(){renderMovieData(theatre_list[theatre_index], theatre_id_to_name[theatre_list[theatre_index]])});
document.getElementById("rocker-right").addEventListener("click", function(){changeTheatre(1)});
document.getElementById("rocker-left").addEventListener("click", function(){changeTheatre(-1)});