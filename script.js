
/* -------------------------------
    BUTTONS
    ------------------------------ */

const btnStart = document.getElementById('btn-start');
const stepStart = document.getElementById('step-start');
const stepGenre = document.getElementById('step-genre');
const btnTryAgain = document.getElementById('btn-try-again');
const btnStartOver = document.getElementById('btn-start-over');
const state = {prompts: {}, selectedGenre: null,};


btnStart.addEventListener('click', () => {
    stepStart.classList.remove('is-active');
    stepGenre.classList.add('is-active');
});

btnTryAgain.addEventListener('click', () => {
    generateResult();
});

btnStartOver.addEventListener('click', () => {
    state.selectedGenre = null;
    document.getElementById('step-results').classList.remove('is-active');
    stepStart.classList.add('is-active');
});

/* -------------------------------
    COPY TO CLIPBOARD (HELP MY NECK IS IN PAINNNNNNNN)
    ------------------------------ */

const btnCopy = document.getElementById('btn-copy');

btnCopy.addEventListener('click', async () => {
    const promptText = document.getElementById('result-prompt').textContent;

    if (!promptText || promptText === 'prompt goes here') return;

    try {
        await navigator.clipboard.writeText(promptText);

        btnCopy.textContent = '✓ Copied';
        btnCopy.classList.add('copied');

        setTimeout(() => {
            btnCopy.textContent = '📋';
            btnCopy.classList.remove('copied')
        }, 1500);
    } catch (err) {
        console.error('Failed to copy text:', err);
    }
});


/* -------------------------------
    WELCOME SIGN
    ------------------------------ */
(function welcomeSign() {
    const overlay = document.getElementById('welcome-overlay');
    const closeBtn = document.getElementById('welcome-close');
    const hasVistedOnce = localStorage.getItem('hasVisited');

    if (!hasVistedOnce) {
        overlay.classList.add('is-visible');
    }

    closeBtn.addEventListener('click', () => {
        overlay.classList.remove('is-visible');
        localStorage.setItem('hasVisited', 'true');
    });
})();




/* -------------------------------
    SNOW
    ------------------------------ */
(function snow() {
    const canvas = document.getElementById('snow-canvas');
    const context = canvas.getContext('2d')
    let flakes = [];
    let width, height;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    function makeFlakes() {
        const count = 60;
        flakes = Array.from({length: count}, () => {
            const isFar = Math.random() < 0.5;
            return {
            x: Math.random() * width,
            y: Math.random() * height,
            r: isFar ?  Math.random() * 1 + 0.4 : Math.random() * 2.4 + 1.4,
            speed: isFar ? Math.random() * 0.6 + 0.25 : Math.random() * 0.6 + 0.5,
            opacity: isFar ? Math.random() * 0.3 + 0.15 : Math.random() * 0.4 + 0.5,
            };
        });
    }

    function tick() {
        context.clearRect(0, 0, width, height);
        context.fillStyle = '#f4ecd8';
        flakes.forEach((f) => {
            context.beginPath();
            context.arc(f.x, f.y, f.r, 0, Math.PI * 2);
            context.fill();
            f.y += f.speed;
            if (f.y > height) {
                f.y = -4;
                f.x = Math.random() * width;
            }
        });
        requestAnimationFrame(tick);
    }

    resize();
    makeFlakes();
    window.addEventListener('resize', () => {
        resize();
        makeFlakes();
    });
    requestAnimationFrame(tick);
})();



/* -------------------------------
    DATA AND GENRES
    ------------------------------ */


function renderGenre(prompts) {
    const genreList = document.getElementById('genre-list'); 
    const genres = Object.keys(prompts);

    const htmlInput = genres
                .map((genre) => `<button class="chip" data-genre="${genre}">${genre}</button>`)
                .join('');

    genreList.innerHTML = htmlInput

    const chipButtons = genreList.querySelectorAll('.chip');
        chipButtons.forEach((chip) => {
        chip.addEventListener('click', () => {
            state.selectedGenre = chip.dataset.genre;
            generateResult();
            stepGenre.classList.remove('is-active');
            document.getElementById('step-results').classList.add('is-active');
    });
});
}

function pickRandom(array) {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex]
}


async function loadData() {

    const response = await fetch('prompts.json')
    state.prompts = await response.json();

    renderGenre(state.prompts)
}

loadData();

function generateResult() {
    const promptsForGenre = state.prompts[state.selectedGenre];
    const authors = Object.keys(promptsForGenre);
    const chosenAuthor = pickRandom(authors);

    const prompts = promptsForGenre[chosenAuthor];
    const chosenPrompt = pickRandom(prompts);

    
    const resultedPrompt = document.getElementById('result-prompt');
    const resultedAuthor = document.getElementById('result-author');
    const chosenGenre = document.getElementById('result-genre-label');

    chosenGenre.textContent = state.selectedGenre;
    resultedPrompt.textContent = chosenPrompt;
    resultedAuthor.textContent =  `By ${chosenAuthor}`;
}




/* ----------------------------------
    MUSIC PLAYER
    --------------------------------- */

(function musicPlayer() {
    const playPauseBtn = document.getElementById('play-pause-btn');
    const prevBtn = document.getElementById('btn-prev');
    const nextBtn = document.getElementById('btn-next');
    const playlist1 = document.getElementById('playlist');
    const audio = document.getElementById('audio-player');
    const nowPlayingBtn = document.getElementById('now-playing-btn')

    let songs = [];
    let current = null;

    async function loadSongs() {


        try {
            const response = await fetch('songs.json')
            songs = await response.json();
            renderPlaylist();
            

        } catch (e) {
            console.error("Failed to load songs.json", e)
        }
    }

    function renderPlaylist() {
        playlist1.innerHTML = songs
            .map((song, index) => `<button class="song-item" data-index="${index}">${song.title}</button>`)
            .join('')

        playlist1.querySelectorAll('.song-item').forEach((btn) => {
            btn.addEventListener('click', () => playSong(Number(btn.dataset.index)));
        });
    }

    function playSong(index) {
        if (songs.length === 0) return;
        current = index;
        audio.src = songs[index].file;
        audio.play().catch(err => console.log("Autoplay prevented:", err));
        playPauseBtn.textContent = '⏸'
        updatePlaying();
        updateNowPlaying(songs[index].title);
    }

    function playNext() {
        if (current === null) {
            playSong(0);
        } else {
            const nextIndex = (current + 1) % songs.length;
            playSong(nextIndex)
        }
    }


    function playPrev() {
        if (current === null) {
            playSong(songs.length - 1);
        } else {
            const prevIndex = (current - 1 + songs.length) % songs.length;
            playSong(prevIndex);
        }
    }




    function updateNowPlaying(title) {

        const track1 = document.getElementById('now-playing-track');
        const mask1 = track1.parentElement;

        track1.classList.remove('is-scrolling');
        track1.textContent = `Now Playing: ${title}`;

        const isOverflowing = track1.scrollWidth > mask1.clientWidth;

        if (isOverflowing) {
            track1.textContent = `Now Playing: ${title}     •     Now Playing: ${title}`;
            track1.classList.add('is-scrolling');
        }

    }

    function updatePlaying() {

        playlist1.querySelectorAll('.song-item').forEach((btn, i) => {
            btn.classList.toggle('is-playing', i === current);
        });

    }

    playPauseBtn.addEventListener('click', () => {
        if (current === null) {
            playlist1.classList.toggle('is-open');
            return;
        }
        if (audio.paused) {
            audio.play();
            playPauseBtn.textContent = '⏸' 
        } else {
            audio.pause();
            playPauseBtn.textContent = '▶'
        }
    });

    nextBtn.addEventListener('click', playNext);
    prevBtn.addEventListener('click', playPrev);

    nowPlayingBtn.addEventListener('click', () => {
        playlist1.classList.toggle('is-open');
    });

    audio.addEventListener('ended', playNext);

    loadSongs();

    const welcomeCloseBtn = document.getElementById('welcome-close')

    btnStart.addEventListener('click', () => {
        if (current === null) {
            playSong(0);
        }
    })

        welcomeCloseBtn.addEventListener('click', () => {
        if (current === null) {
            playSong(0);
        }
});

})();