const runner = document.getElementById("runner");
const track = document.querySelector(".game-track");
const scoreElement = document.getElementById("score");
const timerElement = document.getElementById("timer");
const malware = document.querySelector(".malware");
const dangerFill = document.getElementById("danger-fill");
const malwareStatus = document.getElementById("malware-status");
const playerName = document.querySelector(".game-header h3").innerText;

let currentLane = 2;
let score = 0;
let hitCount = 0;
let timeLeft = 180;
let gameSpeed = 1;
let gameEnded = false;
let gameStarted = false;
let isPaused = false;


const lanePositions = ["15%", "48%", "81%"];

function updateRunnerPosition() {
    runner.style.left = lanePositions[currentLane - 1];
}

function jump() {
    if (runner.classList.contains("jump")) {
        return;
    }

    runner.classList.add("jump");

    setTimeout(function () {
        runner.classList.remove("jump");
    }, 500);
}

function duckStart() {
    runner.classList.add("duck");
}

function duckEnd() {
    runner.classList.remove("duck");
}

function finishGame(reason) {
    if (gameEnded) {
        return;
    }

    gameEnded = true;

    window.location.href =
        "/result?name=" + encodeURIComponent(playerName) +
        "&score=" + encodeURIComponent(score) +
        "&hits=" + encodeURIComponent(hitCount) +
        "&reason=" + encodeURIComponent(reason);
}

function updateTimer() {
    if (gameEnded || isPaused || !gameStarted) {
    return;
}

    let minutes = Math.floor(timeLeft / 60);
    let seconds = timeLeft % 60;

    timerElement.innerText =
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");

    timeLeft = timeLeft - 1;

    if (timeLeft < 0) {
        finishGame("completed");
    }
}

function increaseSpeed() {
    if (gameEnded || isPaused || !gameStarted) {
        return;
    }

    gameSpeed = gameSpeed + 0.15;
}

function createShield() {
    if (gameEnded || isPaused || !gameStarted) {
        return;
    }

    let shield = document.createElement("div");
    shield.classList.add("shield");
    shield.innerText = "🛡️";

    let shieldLane = Math.floor(Math.random() * 3) + 1;
    shield.style.left = lanePositions[shieldLane - 1];
    shield.style.top = "-60px";

    track.appendChild(shield);

    let shieldTop = -60;

    let shieldMovement = setInterval(function () {
        if (isPaused) {
    return;
}
        shieldTop = shieldTop + (5 * gameSpeed);
        shield.style.top = shieldTop + "px";

        let shieldSize = 0.4 + (shieldTop / 550);
        shield.style.transform = "scale(" + shieldSize + ")";

        let shieldNearPlayer =
            shieldTop > 330 && shieldTop < 500;

        if (shieldNearPlayer && shieldLane === currentLane) {
            score = score + 1;
            scoreElement.innerText = score;

            clearInterval(shieldMovement);
            shield.remove();
        }

        if (shieldTop > 560 || gameEnded) {
            clearInterval(shieldMovement);
            shield.remove();
        }
    }, 20);
}

function createObstacle() {
    if (gameEnded || isPaused || !gameStarted) {
        return;
    }

    let obstacle = document.createElement("div");
    obstacle.classList.add("obstacle");

    let obstacleTypes = [
    { icon: "✉️", label: "PHISHING EMAIL", action: "jump" },
    { icon: "💾", label: "USB TRAP", action: "jump" },
    { icon: "🔗", label: "FAKE LINK", action: "jump" },
    { icon: "🎣", label: "PHISHING HOOK", action: "duck" }
];

    let selectedObstacle =
        obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];

    obstacle.innerHTML =
    '<span class="obstacle-icon">' + selectedObstacle.icon + '</span>' +
    '<span class="obstacle-label">' + selectedObstacle.label + '</span>';

    let obstacleLane = Math.floor(Math.random() * 3) + 1;
    obstacle.style.left = lanePositions[obstacleLane - 1];
    obstacle.style.top = "-60px";

    track.appendChild(obstacle);

    let obstacleTop = -60;

    let obstacleMovement = setInterval(function () {
        if (isPaused) {
    return;
}
        obstacleTop = obstacleTop + (4 * gameSpeed);
        obstacle.style.top = obstacleTop + "px";

        let obstacleSize = 0.4 + (obstacleTop / 550);
        obstacle.style.transform = "scale(" + obstacleSize + ")";

        let playerIsJumping = runner.classList.contains("jump");
        let playerIsDucking = runner.classList.contains("duck");

        let playerAvoidedObstacle =
            (selectedObstacle.action === "jump" && playerIsJumping) ||
            (selectedObstacle.action === "duck" && playerIsDucking);

        let obstacleNearPlayer =
            obstacleTop > 410 && obstacleTop < 470;

        if (
            obstacleNearPlayer &&
            obstacleLane === currentLane &&
            !playerAvoidedObstacle
        ) {
            hitCount = hitCount + 1;
            dangerFill.style.width = (hitCount * 25) + "%";

            malware.style.left = (5 + hitCount * 10) + "%";

            if (hitCount < 4) {
                malwareStatus.innerText =
                    (4 - hitCount) + " HITS LEFT";
            }

            clearInterval(obstacleMovement);
            obstacle.remove();

            if (hitCount >= 4) {
                malwareStatus.innerText = "CAUGHT";
                finishGame("caught");
            }
        }

        if (obstacleTop > 560 || gameEnded) {
            clearInterval(obstacleMovement);
            obstacle.remove();
        }
    }, 20);
}

document.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft" && currentLane > 1) {
        currentLane = currentLane - 1;
        updateRunnerPosition();
    }

    if (event.key === "ArrowRight" && currentLane < 3) {
        currentLane = currentLane + 1;
        updateRunnerPosition();
    }

    if (event.code === "Space") {
        event.preventDefault();
        jump();
    }

    if (event.key === "ArrowDown") {
        duckStart();
    }
});

document.addEventListener("keyup", function (event) {
    if (event.key === "ArrowDown") {
        duckEnd();
    }
});

document.getElementById("left-button").addEventListener("click", function () {
    if (currentLane > 1) {
        currentLane = currentLane - 1;
        updateRunnerPosition();
    }
});

document.getElementById("right-button").addEventListener("click", function () {
    if (currentLane < 3) {
        currentLane = currentLane + 1;
        updateRunnerPosition();
    }
});

document.getElementById("jump-button").addEventListener("click", jump);

document.getElementById("duck-button").addEventListener("pointerdown", duckStart);
document.getElementById("duck-button").addEventListener("pointerup", duckEnd);
document.getElementById("duck-button").addEventListener("pointerleave", duckEnd);

updateRunnerPosition();

setInterval(updateTimer, 1000);
setInterval(increaseSpeed, 30000);
setInterval(createShield, 1800);
setInterval(createObstacle, 3000);
document.getElementById("pause-button").addEventListener("click", function () {
    isPaused = !isPaused;

    document.body.classList.toggle("game-paused", isPaused);

    if (isPaused) {
        this.innerText = "RESUME";
        runner.classList.remove("duck");
    } else {
        this.innerText = "PAUSE";
    }
});
document.getElementById("start-run-button").addEventListener("click", function () {
    let countdownText = document.getElementById("countdown-text");
    let startButton = document.getElementById("start-run-button");

    startButton.style.display = "none";

    let number = 3;
    countdownText.innerText = number;

    let countdown = setInterval(function () {
        number = number - 1;

        if (number > 0) {
            countdownText.innerText = number;
        } else {
            clearInterval(countdown);

            countdownText.innerText = "GO!";

            setTimeout(function () {
                document.getElementById("start-overlay").style.display = "none";
                gameStarted = true;
            }, 850);
        }
    }, 1000);
});