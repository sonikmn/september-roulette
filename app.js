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

let movies = [
"interstellar",
"parasite",
"whiplash",
"the shining",
"hereditary",
"arrival"
];

let rotation = 0;
let spinning = false;

const colors = [
"#d9d2c5",
"#c9d2d0",
"#ded9c8",
"#d0d0d0",
"#d6c8c2",
"#c9ced8",
"#ddd2b8",
"#cfd8c5"
];

function drawWheel() {
const size = canvas.width;
const center = size / 2;
const radius = size / 2 - 10;

ctx.clearRect(0, 0, size, size);

if (movies.length === 0) {
ctx.beginPath();
ctx.arc(center, center, radius, 0, Math.PI * 2);
ctx.fillStyle = "#e5e2dc";
ctx.fill();

ctx.fillStyle = "#8c8c8c";
ctx.font = "28px -apple-system, BlinkMacSystemFont, sans-serif";
ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.fillText("добавь фильмы", center, center);

return;
}

const slice = (Math.PI * 2) / movies.length;

ctx.save();

ctx.translate(center, center);
ctx.rotate(rotation);
ctx.translate(-center, -center);

for (let i = 0; i < movies.length; i++) {
const start = i * slice;
const end = start + slice;

ctx.beginPath();
ctx.moveTo(center, center);
ctx.arc(center, center, radius, start, end);
ctx.closePath();

ctx.fillStyle = colors[i % colors.length];
ctx.fill();

ctx.strokeStyle = "#ffffff";
ctx.lineWidth = 5;
ctx.stroke();

ctx.save();

ctx.translate(center, center);
ctx.rotate(start + slice / 2);

ctx.fillStyle = "#191919";
ctx.font = "bold 24px -apple-system, BlinkMacSystemFont, sans-serif";
ctx.textAlign = "right";
ctx.textBaseline = "middle";

let text = movies[i];

if (text.length > 18) {
text = text.substring(0, 17) + "…";
}

ctx.fillText(text, radius - 35, 0);

ctx.restore();
}

ctx.restore();

ctx.beginPath();
ctx.arc(center, center, radius, 0, Math.PI * 2);
ctx.strokeStyle = "#191919";
ctx.lineWidth = 7;
ctx.stroke();
}

function renderMovies() {
movieList.innerHTML = "";

movieCount.textContent = movies.length;

movies.forEach((movie, index) => {
const item = document.createElement("div");
item.className = "movie";

const name = document.createElement("span");
name.className = "movie-name";
name.textContent = movie;

const deleteButton = document.createElement("button");
deleteButton.className = "delete-movie";
deleteButton.textContent = "×";

deleteButton.addEventListener("click", () => {
if (spinning) return;

movies.splice(index, 1);

renderMovies();
drawWheel();
});

item.appendChild(name);
item.appendChild(deleteButton);

movieList.appendChild(item);
});
}

function addMovie() {
const movie = movieInput.value.trim();

if (!movie || spinning) return;

movies.push(movie);

movieInput.value = "";

renderMovies();
drawWheel();

movieInput.focus();
}

addButton.addEventListener("click", addMovie);

movieInput.addEventListener("keydown", (event) => {
if (event.key === "Enter") {
addMovie();
}
});

function spin() {
if (spinning || movies.length < 2) {
if (movies.length < 2 && !spinning) {
alert("добавь минимум 2 фильма");
}

return;
}

spinning = true;

spinButton.disabled = true;
addButton.disabled = true;
movieInput.disabled = true;

result.classList.add("hidden");

const winner = Math.floor(Math.random() * movies.length);

const slice = (Math.PI * 2) / movies.length;

/*
указатель находится сверху.
вычисляем угол, на котором окажется выбранный сектор.
*/

const targetAngle =
-(winner * slice + slice / 2) - Math.PI / 2;

const currentNormalized =
rotation % (Math.PI * 2);

const difference =
targetAngle - currentNormalized;

const extraSpins =
(5 + Math.floor(Math.random() * 3)) * Math.PI * 2;

const finalRotation =
rotation + difference + extraSpins;

const startRotation = rotation;
const duration = 4200;

const startTime = performance.now();

function animate(currentTime) {
const elapsed = currentTime - startTime;

const progress = Math.min(elapsed / duration, 1);

/*
cubic ease-out:
сначала быстро, потом красиво замедляется
*/

const eased =
1 - Math.pow(1 - progress, 4);

rotation =
startRotation +
(finalRotation - startRotation) * eased;

drawWheel();

if (progress < 1) {
requestAnimationFrame(animate);
} else {
rotation = finalRotation;

spinning = false;

spinButton.disabled = false;
addButton.disabled = false;
movieInput.disabled = false;

resultMovie.textContent = movies[winner];

result.classList.remove("hidden");
}
}

requestAnimationFrame(animate);
}

spinButton.addEventListener("click", spin);

againButton.addEventListener("click", () => {
result.classList.add("hidden");
spin();
});

renderMovies();
drawWheel();
