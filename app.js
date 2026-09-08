const tg = window.Telegram?.WebApp;

if (tg) {
    tg.ready();
    tg.expand();
}

const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");

const movieInput = document.getElementById("movieInput");
const addButton = document.getElementById("addButton");

const movieList = document.getElementById("movieList");
const movieCount = document.getElementById("movieCount");

const spinButton = document.getElementById("spinButton");

const result = document.getElementById("result");
const resultMovie = document.getElementById("resultMovie");

const againButton = document.getElementById("againButton");

const STORAGE_KEY = "september-roulette-movies";


/* цвета */

const baseColors = [
    "#e9d7ff",
    "#ffd6e7",
    "#ffe6cc",
    "#fff4b8",
    "#d4fbd8",
    "#d6f0ff",
    "#e0e7ff",
    "#e9d7ff"
];

const glowColors = [
    "#c9a0ff",
    "#ff8fb1",
    "#ffb347",
    "#ffe866",
    "#98f5a1",
    "#7dd3fc",
    "#c9a0ff",
    "#ff6ec7"
];


let movies = loadMovies();

let rotation = 0;
let spinning = false;


/* загрузка сохранённых фильмов */

function loadMovies() {

    try {

        const saved =
            localStorage.getItem(STORAGE_KEY);

        if (saved) {

            const parsed =
                JSON.parse(saved);

            if (
                Array.isArray(parsed) &&
                parsed.length > 0
            ) {

                return parsed.filter(
                    item =>
                        typeof item === "string" &&
                        item.trim()
                );
            }
        }

    } catch (error) {

        console.log(
            "не удалось загрузить список:",
            error
        );
    }

    return [
        "interstellar",
        "parasite",
        "whiplash",
        "the shining",
        "hereditary",
        "arrival"
    ];
}


/* сохранение */

function saveMovies() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(movies)
        );

    } catch (error) {

        console.log(
            "не удалось сохранить список:",
            error
        );
    }
}


/* сокращение длинных названий */

function fitText(text, maxLength) {

    if (text.length <= maxLength) {
        return text;
    }

    return text.slice(0, maxLength - 1) + "…";
}


/* рисуем колесо */

function drawWheel() {

    const size = canvas.width;

    const center = size / 2;

    const radius = size / 2 - 12;


    ctx.clearRect(
        0,
        0,
        size,
        size
    );


    /* пустое колесо */

    if (movies.length === 0) {

        ctx.beginPath();

        ctx.arc(
            center,
            center,
            radius,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "#f0ede9";

        ctx.fill();


        ctx.fillStyle = "#8a8a8a";

        ctx.font =
            "500 26px DM Sans, sans-serif";

        ctx.textAlign = "center";

        ctx.textBaseline = "middle";

        ctx.fillText(
            "добавь варианты",
            center,
            center
        );

        return;
    }


    const slice =
        (Math.PI * 2) / movies.length;


    ctx.save();

    ctx.translate(
        center,
        center
    );

    ctx.rotate(rotation);

    ctx.translate(
        -center,
        -center
    );


    /* сектора */

    for (
        let i = 0;
        i < movies.length;
        i++
    ) {

        const start =
            i * slice;

        const end =
            start + slice;


        /* мягкий градиент */

        const gradient =
            ctx.createRadialGradient(
                center - radius * 0.28,
                center - radius * 0.32,
                10,

                center,
                center,
                radius
            );


        gradient.addColorStop(
            0,
            "#ffffff"
        );

        gradient.addColorStop(
            0.16,
            baseColors[
                i % baseColors.length
            ]
        );

        gradient.addColorStop(
            0.72,
            baseColors[
                i % baseColors.length
            ]
        );

        gradient.addColorStop(
            1,
            glowColors[
                i % glowColors.length
            ]
        );


        /* сектор */

        ctx.beginPath();

        ctx.moveTo(
            center,
            center
        );

        ctx.arc(
            center,
            center,
            radius,
            start,
            end
        );

        ctx.closePath();


        ctx.fillStyle = gradient;

        ctx.fill();


        /* разделитель */

        ctx.strokeStyle =
            "rgba(255,255,255,.88)";

        ctx.lineWidth = 4;

        ctx.stroke();


        /* текст */

        ctx.save();

        ctx.translate(
            center,
            center
        );

        ctx.rotate(
            start + slice / 2
        );


        const label =
            fitText(
                movies[i],
                movies.length > 12
                    ? 11
                    : 18
            );


        ctx.fillStyle =
            "#242424";


        ctx.font =
            `500 ${
                movies.length > 12
                    ? 17
                    : 21
            }px DM Sans, sans-serif`;


        ctx.textAlign =
            "right";

        ctx.textBaseline =
            "middle";


        ctx.fillText(
            label,
            radius - 32,
            0
        );


        ctx.restore();
    }


    ctx.restore();


    /* внешняя рамка */

    ctx.beginPath();

    ctx.arc(
        center,
        center,
        radius,
        0,
        Math.PI * 2
    );

    ctx.strokeStyle =
        "rgba(30,30,30,.82)";

    ctx.lineWidth = 5;

    ctx.stroke();


    /* внутренняя тонкая линия */

    ctx.beginPath();

    ctx.arc(
        center,
        center,
        radius - 7,
        0,
        Math.PI * 2
    );

    ctx.strokeStyle =
        "rgba(255,255,255,.75)";

    ctx.lineWidth = 2;

    ctx.stroke();
}


/* список фильмов */

function renderMovies() {

    movieList.innerHTML = "";


    movieCount.textContent =
        String(movies.length).padStart(2, "0");


    movies.forEach(
        (movie, index) => {

            const item =
                document.createElement("div");

            item.className =
                "movie";


            const name =
                document.createElement("span");

            name.className =
                "movie-name";

            name.textContent =
                movie;


            const deleteButton =
                document.createElement("button");

            deleteButton.className =
                "delete-movie";

            deleteButton.type =
                "button";

            deleteButton.textContent =
                "×";


            deleteButton.addEventListener(
                "click",
                () => {

                    if (spinning) {
                        return;
                    }


                    movies.splice(
                        index,
                        1
                    );


                    saveMovies();

                    renderMovies();

                    drawWheel();
                }
            );


            item.appendChild(name);

            item.appendChild(
                deleteButton
            );

            movieList.appendChild(item);
        }
    );
}


/* добавить фильм */

function addMovie() {

    const movie =
        movieInput.value.trim();


    if (
        !movie ||
        spinning
    ) {
        return;
    }


    /* проверяем дубликаты */

    if (
        movies.some(
            item =>
                item.toLowerCase() ===
                movie.toLowerCase()
        )
    ) {

        movieInput.value = "";

        movieInput.placeholder =
            "такой вариант уже есть";


        setTimeout(
            () => {
                movieInput.placeholder =
                    "название фильма";
            },
            1800
        );

        return;
    }


    movies.push(movie);


    saveMovies();


    movieInput.value = "";


    renderMovies();

    drawWheel();


    movieInput.focus();
}


addButton.addEventListener(
    "click",
    addMovie
);


movieInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            event.preventDefault();

            addMovie();
        }
    }
);


/* вращение */

function spin() {

    if (spinning) {
        return;
    }


    if (movies.length < 2) {

        movieInput.focus();

        movieInput.placeholder =
            "нужно минимум 2 варианта";


        setTimeout(
            () => {
                movieInput.placeholder =
                    "название фильма";
            },
            1800
        );

        return;
    }


    spinning = true;


    spinButton.disabled = true;

    addButton.disabled = true;

    movieInput.disabled = true;


    result.classList.add(
        "hidden"
    );


    /* выбираем победителя */

    const winner =
        Math.floor(
            Math.random() *
            movies.length
        );


    const slice =
        (Math.PI * 2) /
        movies.length;


    /*
        сектор должен оказаться
        ровно под верхним указателем
    */

    const targetAngle =
        -(
            winner * slice +
            slice / 2
        ) -
        Math.PI / 2;


    const current =
        (
            rotation %
            (Math.PI * 2)
        +
            Math.PI * 2
        ) %
        (Math.PI * 2);


    let difference =
        targetAngle -
        current;


    while (difference < 0) {

        difference +=
            Math.PI * 2;
    }


    /* 5–7 полных оборотов */

    const extraSpins =
        (
            5 +
            Math.floor(
                Math.random() * 3
            )
        ) *
        Math.PI *
        2;


    const startRotation =
        rotation;


    const finalRotation =
        rotation +
        extraSpins +
        difference;


    const duration =
        4300;


    const startTime =
        performance.now();


    /* анимация */

    function animate(now) {

        const progress =
            Math.min(
                (now - startTime) /
                duration,
                1
            );


        /* красивое замедление */

        const eased =
            1 -
            Math.pow(
                1 - progress,
                4
            );


        rotation =
            startRotation +
            (
                finalRotation -
                startRotation
            ) *
            eased;


        drawWheel();


        if (progress < 1) {

            requestAnimationFrame(
                animate
            );

            return;
        }


        rotation =
            finalRotation;


        drawWheel();


        spinning = false;


        spinButton.disabled =
            false;

        addButton.disabled =
            false;

        movieInput.disabled =
            false;


        /* результат */

        resultMovie.textContent =
            movies[winner];


        result.classList.remove(
            "hidden"
        );


        result.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });
    }


    requestAnimationFrame(
        animate
    );
}


spinButton.addEventListener(
    "click",
    spin
);


/* крутить снова */

againButton.addEventListener(
    "click",
    () => {

        result.classList.add(
            "hidden"
        );

        spin();
    }
);


/* первый запуск */

renderMovies();

drawWheel();