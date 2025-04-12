const API_KEY = '43ea0eb19a1d3f0b1c3c8c3814d3766b'; 
const genres = [
	{
	  id: 28,
	  name: "Action",
	  img: "https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg" // Avengers: Infinity War
	},
	{
	  id: 35,
	  name: "Comedy",
	  img: "https://image.tmdb.org/t/p/w500/qmDpIHrmpJINaRKAfWQfftjCdyi.jpg" // The Intern
	},
	{
	  id: 18,
	  name: "Drama",
	  img: "https://image.tmdb.org/t/p/w500/rTmal9fDbwh5F0waol2hq35U4ah.jpg" // Joker
	},
	{
	  id: 27,
	  name: "Horror",
	  img: "https://image.tmdb.org/t/p/w500/6Wdl9N6dL0Hi0T1qJLWSz6gMLbd.jpg" // IT
	},
	{
	  id: 10749,
	  name: "Romance",
	  img: "https://image.tmdb.org/t/p/w500/kOVEVeg59E0wsnXmF9nrh6OmWII.jpg" // La La Land
	},
	{
		id: 12,
		name: "Adventure",
		img: "https://image.tmdb.org/t/p/w500/9PKZesKMnblFfKxEhQx45YQ2kIe.jpg"
	  },
	  {
		id: 14,
		name: "Fantasy",
		img: "https://image.tmdb.org/t/p/w500/8N0DNaF2EVkVddZtZNfvdC7cftE.jpg"
	  },
	  {
		id: 878,
		name: "Science Fiction",
		img: "https://image.tmdb.org/t/p/w500/8UlWHLMpgZm9bx6QYh0NFoq67TZ.jpg"
	  },
	  {
		id: 80,
		name: "Crime",
		img: "https://image.tmdb.org/t/p/w500/jDwZfgJWcFRx0ZVS0uv3Ioh6ZQK.jpg"
	  },
	  {
		id: 10751,
		name: "Family",
		img: "https://image.tmdb.org/t/p/w500/tNxcH7EojtPzj93B8J6iL8uhmGX.jpg"
	  }
	  
  ];
  

let currentMovieId = null;

window.onload = function () {
  init();
  bindListeners();
  createGenreCards();
  loadPopularMovies();
};

function init() {
  console.log("App initialized");
}

function bindListeners() {
  document.getElementById('searchBtn').addEventListener('click', searchMovies);
}

async function searchMovies() {
  const query = document.getElementById('searchBox').value.trim();
  if (!query) return;

  const url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    const results = document.getElementById('results');
    results.innerHTML = '';

    if (data.results.length === 0) {
      results.innerHTML = '<p>No movies found.</p>';
      return;
    }

    const rowDiv = document.createElement('div');
    rowDiv.classList.add('row');

    data.results.forEach(movie => {
      const posterPath = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : 'https://via.placeholder.com/200x300?text=No+Image';

      const colDiv = document.createElement('div');
      colDiv.classList.add('col-4');
      colDiv.innerHTML = `
        <img src="${posterPath}" alt="${movie.title}" />
        <h3>${movie.title}</h3>
        <p>${movie.release_date || 'N/A'}</p>
        <p>${movie.overview.slice(0, 100)}...</p>
      `;
	  colDiv.addEventListener('click', () => displayMovie(movie.id));
	  colDiv.style.cursor = 'pointer';
     
      rowDiv.appendChild(colDiv);
    });

    results.appendChild(rowDiv);
  } catch (error) {
    console.error('Error fetching movies:', error);
    document.getElementById('results').innerHTML = '<p>Error loading movies.</p>';
  }
}

async function displayMovie(id) {
  const modal = document.getElementById('movieModal');
  const modalDetails = document.getElementById('modalDetails');
  const closeBtn = document.querySelector('.close');
  currentMovieId = id;

  const detailsUrl = `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`;
  const creditsUrl = `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${API_KEY}`;

  try {
    const [detailsRes, creditsRes] = await Promise.all([
      fetch(detailsUrl),
      fetch(creditsUrl)
    ]);

    const movie = await detailsRes.json();
    const credits = await creditsRes.json();

    const posterPath = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : 'https://via.placeholder.com/200x300?text=No+Image';

    const topCast = credits.cast.slice(0, 5).map(actor => {
      const profilePath = actor.profile_path
        ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
        : 'https://via.placeholder.com/80x120?text=No+Image';

      return `
        <div class="cast-member" data-id="${actor.id}" style="display:flex; align-items:center; margin-bottom:10px; cursor:pointer;">
          <img src="${profilePath}" alt="${actor.name}" style="width:60px; height:90px; border-radius:6px; margin-right:10px;" />
          <div>
            <strong>${actor.name}</strong><br>
            <em>${actor.character}</em>
          </div>
        </div>
      `;
    }).join('');

    modalDetails.innerHTML = `
      <h2>${movie.title}</h2>
      <img src="${posterPath}" alt="${movie.title}" style="width:200px; border-radius:10px;" />
      <p><strong>Release Date:</strong> ${movie.release_date || 'N/A'}</p>
      <p><strong>Rating:</strong> ${movie.vote_average} / 10</p>
      <p><strong>Description:</strong><br>${movie.overview}</p>
      <p><strong>Top Cast:</strong></p>
      ${topCast}
    `;

    modalDetails.querySelectorAll('.cast-member').forEach(el => {
      el.addEventListener('click', () => {
        displayCastDetails(el.getAttribute('data-id'));
      });
    });
    
    modal.style.display = 'block';
	document.getElementById('movieModal').scrollIntoView({ behavior: 'smooth', block: 'center' });

    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = e => {
      if (e.target === modal) 
		modal.style.display = 'none';
	document.body.style.overflow='auto';
    };
  } catch (error) {
    console.error('Error fetching movie details:', error);
  }
}

async function displayCastDetails(actorId) {
  const modal = document.getElementById('movieModal');
  const modalDetails = document.getElementById('modalDetails');
  const personUrl = `https://api.themoviedb.org/3/person/${actorId}?api_key=${API_KEY}`;

  try {
    const res = await fetch(personUrl);
    const person = await res.json();

    const profilePath = person.profile_path
      ? `https://image.tmdb.org/t/p/w500${person.profile_path}`
      : 'https://via.placeholder.com/200x300?text=No+Image';

    modalDetails.innerHTML = `
      <h2>${person.name}</h2>
      <img src="${profilePath}" alt="${person.name}" style="width:200px; border-radius:10px;" />
      <p><strong>Birthday:</strong> ${person.birthday || 'N/A'}</p>
      <p><strong>Place of Birth:</strong> ${person.place_of_birth || 'N/A'}</p>
      <p><strong>Biography:</strong><br>${person.biography || 'N/A'}</p>
      <button class="button" id="backToMovie">Back to Movie</button>
    `;
    window.scrollTo({  behavior: 'smooth',block:'center' });
    document.getElementById('backToMovie').addEventListener('click', () => {
		displayMovie(currentMovieId);
	  });
  
	} catch (error) {
	  console.error('Error fetching cast details:', error);
	  modalDetails.innerHTML = '<p>Error loading actor details.</p>';
	}
  }


  function createGenreCards() {
	const container = document.getElementById('genreContainer');
	if (!container) return;

	genres.forEach(genre => {
		const col = document.createElement('div');
		col.classList.add('col-2');

		const card = document.createElement('div');
		card.classList.add('genre-card');
		card.setAttribute('data-id', genre.id);

		const imageUrl = genre.img ? genre.img : 'images/fallback.jpg';
		card.style.backgroundImage = `url('${imageUrl}')`;

		card.style.height = '700px';
		card.style.width = '400px';
		card.style.display = 'flex';
		card.style.justifyContent = 'center';
		card.style.alignItems = 'center';
		card.style.color = 'white';
		card.style.fontSize = '50px';
		card.style.fontWeight = 'bold';
		card.style.borderRadius = '15px';
		card.style.backgroundSize = 'cover';
		card.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
		card.style.cursor = 'pointer';

		card.textContent = genre.name;

		card.addEventListener('click', () => {
			const genreId = card.getAttribute('data-id');
			console.log(`Clicked genre: ${genre.name} (${genreId})`);
			fetchGenreMovies(genreId);
		});

		col.appendChild(card);
		container.appendChild(col);
	});
}

  
  async function loadPopularMovies() {
	const url = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`;
	try {
	  const response = await fetch(url);
	  const data = await response.json();
  
	  const container = document.getElementById('popularSlider');
container.innerHTML = '';
  
	  const scrollWrapper = document.createElement('div');
	  scrollWrapper.classList.add('horizontal-scroll');
  
	  data.results.slice(0, 10).forEach(movie => {
		const poster = movie.poster_path
		  ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
		  : 'https://via.placeholder.com/200x300?text=No+Image';
  
		const card = document.createElement('div');
		card.classList.add('movie-card');
		card.innerHTML = `
		  <img src="${poster}" alt="${movie.title}" />
		  <h3>${movie.title}</h3>
		`;
		card.addEventListener('click', () => displayMovie(movie.id));
		scrollWrapper.appendChild(card);
	  });
  
	  container.appendChild(scrollWrapper);
	} catch (error) {
	  console.error('Error loading popular movies:', error);
	}
  }
  

  async function fetchGenreMovies(genreId) {
	console.log("Fetching genre movies for:", genreId);
	const url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${genreId}`;
	try {
		const response = await fetch(url);
		const data = await response.json();
		console.log("Fetched data:", data);

		const results = document.getElementById('results');
		results.innerHTML = '';

		if (!data.results || data.results.length === 0) {
			// Comedy genre fallback image
			if (parseInt(genreId) === 35) {
				const fallback = document.createElement('div');
				fallback.classList.add('col-4');
				fallback.innerHTML = `
					<img src="images/hangover.jpg" alt="Comedy Placeholder" style="width:100%; border-radius:10px;" />
					<h3>Laughs Loading...</h3>
					<p>No comedy movies found right now. Enjoy this classic while you wait!</p>
				`;
				results.appendChild(fallback);
			} else {
				results.innerHTML = '<p>No movies found for this genre.</p>';
			}
			return;
		}

		const rowDiv = document.createElement('div');
		rowDiv.classList.add('row');

		data.results.forEach(movie => {
			const posterPath = movie.poster_path
				? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
				: 'https://via.placeholder.com/200x300?text=No+Image';

			const colDiv = document.createElement('div');
			colDiv.classList.add('col-4');
			colDiv.innerHTML = `
				<img src="${posterPath}" alt="${movie.title}" />
				<h3>${movie.title}</h3>
				<p>${movie.release_date || 'N/A'}</p>
				<p>${movie.overview.slice(0, 100)}...</p>
			`;

			const button = document.createElement('button');
			button.textContent = 'View Movie Data';
			button.onclick = () => displayMovie(movie.id);

			colDiv.appendChild(button);
			rowDiv.appendChild(colDiv);
		});

		results.appendChild(rowDiv);
		document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
	} catch (error) {
		console.error('Error loading genre movies:', error);
		document.getElementById('results').innerHTML = '<p>Error loading genre movies.</p>';
	}
}

