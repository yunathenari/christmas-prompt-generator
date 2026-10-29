/* -------------------------------
    BUTTONS
    ------------------------------ */

const btnStart = document.getElementById('btn-start');
const stepStart = document.getElementById('step-start');
const stepGenre = document.getElementById('step-genre');
const btnTryAgain = document.getElementById('btn-try-again');
const btnStartOver = document.getElementById('btn-start-over');
const stepResults = document.getElementById('step-results');

const state = {prompts: {}, selectedGenre: null};


btnStart.addEventListener('click', () => {
    stepStart.classList.remove('is-active');
    stepGenre.classList.add('is-active');
});

btnTryAgain.addEventListener('click', generateResult);

btnStartOver.addEventListener('click', () => {
    state.selectedGenre = null;
    stepResults.classList.remove('is-active');
    stepStart.classList.add('is-active');
});

/* -------------------------------
    COPY TO CLIPBOARD (HELP MY NECK IS IN PAINNNNNNNN)
    ------------------------------ */

const btnCopy = document.getElementById('btn-copy');

btnCopy.addEventListener('click', async () => {
    const resultPrompt = document.getElementById('result-prompt');
    const promptText = resultPrompt.textContent.trim()

    if (!promptText) return;

    try {
        await navigator.clipboard.writeText(promptText);

        btnCopy.textContent = '✓';
        btnCopy.classList.add('copied');

        setTimeout(() => {
            btnCopy.textContent = '🗎';
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
    const hasVisited = localStorage.getItem('hasVisited');

    if (!hasVisited) {
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
            context.globalAlpha = f.opacity;


            context.beginPath();
            context.arc(f.x, f.y, f.r, 0, Math.PI * 2);
            context.fill();
            f.y += f.speed;
            if (f.y > height) {
                f.y = -4;
                f.x = Math.random() * width;
            }
        });
        
        context.globalAlpha = 1
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

const genreimages = {
    "Angst": "images/angst.png",
    "Fluff": "images/fluff.png",
    "Spice": "images/spice.png",
    "Hurt/Comfort": "images/hurt-comfort.png",
};




function renderGenre(prompts) {
    const genreList = document.getElementById('genre-list'); 
    const genres = Object.keys(prompts);


    const htmlInput = genres
            .map((genre) =>  `
                    <button class="chip" data-genre="${genre}">
                        <img src="${genreimages[genre] || ''}" class="chip-icon" alt="">
                        <span class="chip-label">${genre}</span>             
                    </button>`
            ).join('');

    genreList.innerHTML = htmlInput

    const chipButtons = genreList.querySelectorAll('.chip');
        chipButtons.forEach((chip) => {
        chip.addEventListener('click', () => {
            state.selectedGenre = chip.dataset.genre;
            generateResult();
            stepGenre.classList.remove('is-active');
            stepResults.classList.add('is-active');
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
    if (!promptsForGenre) return;

    const authors = Object.keys(promptsForGenre);
    if (authors.length === 0) return;

    const chosenAuthor = pickRandom(authors);
    const prompts = promptsForGenre[chosenAuthor];
    if (!Array.isArray(prompts) || prompts.length === 0) return;

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
    const playlist = document.getElementById('playlist');
    const audio = document.getElementById('audio-player');
    const nowPlayingBtn = document.getElementById('now-playing-btn')

    let songs = [];
    let current = null;

    async function loadSongs() {


        try {
            const response = await fetch('songs.json')
            songs = await response.json();
            renderPlaylist();
            

        } catch (error) {
            console.error("Failed to load songs.json", error)
        }
    }

    function renderPlaylist() {
        playlist.innerHTML = songs
            .map((song, index) => `<button class="song-item" data-index="${index}">${song.title}</button>`)
            .join('')

        playlist.querySelectorAll('.song-item').forEach((btn) => {
            btn.addEventListener('click', () => playSong(Number(btn.dataset.index)));
        });
    }

    function playSong(index) {
        if (songs.length === 0 || !songs[index]) return;

        current = index;
        audio.src = songs[index].file;

        audio.play().catch(err => console.log("Failed to play song:", err));

        updatePlaying();
        updateNowPlaying(songs[index].title);
    }

    function playNext() {
        if (songs.length === 0) return;

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

    function updatePlayPauseIcon() {
        playPauseBtn.textContent = audio.paused ? '▶' : '⏸'
    }

    audio.addEventListener('play', updatePlayPauseIcon);
    audio.addEventListener('pause', updatePlayPauseIcon);




    function updateNowPlaying(title) {

        const nowplayingtrack = document.getElementById('now-playing-track');
        const nowplaylistmask = nowplayingtrack.parentElement;

        nowplayingtrack.classList.remove('is-scrolling');
        nowplayingtrack.textContent = `Now Playing: ${title}`;

        const isOverflowing = nowplayingtrack.scrollWidth > nowplaylistmask.clientWidth;

        if (isOverflowing) {
            nowplayingtrack.textContent = `Now Playing: ${title}     •     Now Playing: ${title}`;
            nowplayingtrack.classList.add('is-scrolling');
        }
    }

    function togglePlaylist() {
        playlist.classList.toggle('is-open');
    }


    function updatePlaying() {

        playlist.querySelectorAll('.song-item').forEach((btn, i) => {
            btn.classList.toggle('is-playing', i === current);
        });

    }

    playPauseBtn.addEventListener('click', () => {
        if (current === null) {
            togglePlaylist();
            return;
        }
        else if (audio.paused) {
            audio.play().catch((error) => {
                console.error('Failed to play song:', error)
            });

        } else {
            audio.pause();
        }
    });

    nextBtn.addEventListener('click', playNext);
    prevBtn.addEventListener('click', playPrev);

    nowPlayingBtn.addEventListener('click', togglePlaylist);

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
