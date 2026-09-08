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


/* цвета колеса */

const baseColors = [
    "#e9d7ff",
    "#ffd6e7",
    "#ffe6cc",
    "#fff4b8",
    "#d4fbd8",
    "#d6f0ff",
    "#e0e7ff"
];


let movies = loadMovies();

let rotation = 0;

let spinning = false;


/* загрузка фильмов */

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
        "finding nemo",
        "pirates of the caribbean",
        "twilight",
        "men in black",
        "donnie darko",
        "leon"
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


/* сокращение текста */

function fitText(text, maxLength) {

    if (text.length <= maxLength) {
        return text;
    }

    return text.slice(
        0,
        maxLength - 1
    ) + "…";
}


/* -------------------------
   рисуем колесо
------------------------- */

function drawWheel() {

    const size = canvas.width;

    const center = size / 2;

    const radius =
        size / 2 - 14;


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

        ctx.fillStyle =
            "rgba(240, 237, 233, 0.55)";

        ctx.fill();


        ctx.fillStyle =
            "#9a9898";

        ctx.font =
            "500 26px DM Sans, sans-serif";

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";

        ctx.fillText(
            "добавь варианты",
            center,
            center
        );

        return;
    }


    const slice =
        (Math.PI * 2) /
        movies.length;


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


    /* -------------------------
       сектора
    ------------------------- */

    for (
        let i = 0;
        i < movies.length;
        i++
    ) {

        const start =
            i * slice;

        const end =
            start + slice;


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


        ctx.fillStyle =
            hexToRgba(
                baseColors[
                    i % baseColors.length
                ],
                0.72
            );

        ctx.fill();


        /*
           очень тонкий разделитель
        */

        ctx.strokeStyle =
            "rgba(255, 255, 255, 0.62)";

        ctx.lineWidth = 3;

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
            "rgba(45, 43, 45, 0.82)";


        ctx.font =
            `500 ${
                movies.length > 12
                    ? 17
                    : 21
            }px "Zen Kaku Gothic New", sans-serif`;


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


    /*
       мягкая внешняя рамка
    */

    ctx.beginPath();

    ctx.arc(
        center,
        center,
        radius,
        0,
        Math.PI * 2
    );

    ctx.strokeStyle =
        "rgba(90, 82, 95, 0.16)";

    ctx.lineWidth = 5;

    ctx.stroke();


    /*
       внутренняя тонкая линия
    */

    ctx.beginPath();

    ctx.arc(
        center,
        center,
        radius - 5,
        0,
        Math.PI * 2
    );

    ctx.strokeStyle =
        "rgba(255, 255, 255, 0.38)";

    ctx.lineWidth = 1.5;

    ctx.stroke();


    /*
       непрозрачная центральная
       подложка для кнопки lets go

       она полностью закрывает
       линии секторов под кнопкой
    */

    const buttonRadius =
        radius * 0.235;


    ctx.beginPath();

    ctx.arc(
        center,
        center,
        buttonRadius,
        0,
        Math.PI * 2
    );


    const buttonGradient =
        ctx.createLinearGradient(
            center - buttonRadius,
            center - buttonRadius,
            center + buttonRadius,
            center + buttonRadius
        );


    buttonGradient.addColorStop(
        0,
        "#ffd6e7"
    );

    buttonGradient.addColorStop(
        0.45,
        "#e9d7ff"
    );

    buttonGradient.addColorStop(
        1,
        "#d4fbd8"
    );


    ctx.fillStyle =
        buttonGradient;

    ctx.fill();


    /*
       мягкая граница
    */

    ctx.strokeStyle =
        "rgba(255, 255, 255, 0.85)";

    ctx.lineWidth = 3;

    ctx.stroke();
}


/* hex → rgba */

function hexToRgba(hex, alpha) {

    const value =
        hex.replace("#", "");

    const r =
        parseInt(
            value.substring(0, 2),
            16
        );

    const g =
        parseInt(
            value.substring(2, 4),
            16
        );

    const b =
        parseInt(
            value.substring(4, 6),
            16
        );

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}


/* -------------------------
   список вариантов
------------------------- */

function renderMovies() {

    movieList.innerHTML = "";


    movieCount.textContent =
        String(
            movies.length
        ).padStart(2, "0");


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


/* -------------------------
   добавить вариант
------------------------- */

function addMovie() {

    const movie =
        movieInput.value.trim();


    if (
        !movie ||
        spinning
    ) {
        return;
    }


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


/* -------------------------
   вращение
------------------------- */

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


    const winner =
        Math.floor(
            Math.random() *
            movies.length
        );


    const slice =
        (Math.PI * 2) /
        movies.length;


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


    function animate(now) {

        const progress =
            Math.min(
                (now - startTime) /
                duration,
                1
            );


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


/* снова */

againButton.addEventListener(
    "click",
    () => {

        result.classList.add(
            "hidden"
        );

        spin();
    }
);


/* запуск */

renderMovies();

drawWheel();