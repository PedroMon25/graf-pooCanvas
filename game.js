
"use strict";

// ==========================================
// CONFIGURACIÓN DEL CANVAS Y CONTROLES
// ==========================================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const botonReiniciar = document.getElementById("reiniciar");
const selectorModo = document.getElementById("modoJuego");
const puntosJugador = document.getElementById("puntosJugador");
const puntosIA = document.getElementById("puntosIA");
const estadoModo = document.getElementById("estadoModo");
const descripcionModo = document.getElementById("descripcionModo");

// ==========================================
// CLASE BALL: REPRESENTA CADA PELOTA
// ==========================================
class Ball {
    constructor(x, y, radius, speedX, speedY, color) {
        this.startX = x;
        this.startY = y;
        this.radius = radius;
        this.initialSpeedX = speedX;
        this.initialSpeedY = speedY;
        this.color = color;

        this.reset();
    }

    reset(direction = Math.sign(this.initialSpeedX)) {
        this.x = this.startX;
        this.y = this.startY;

        this.speedX = Math.abs(this.initialSpeedX) * direction;
        this.speedY = this.initialSpeedY;

        this.lastPaddle = null;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.closePath();
    }

    move() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Rebote superior.
        if (this.y - this.radius <= 0) {
            this.y = this.radius;
            this.speedY = Math.abs(this.speedY);
        }

        // Rebote inferior.
        if (this.y + this.radius >= canvas.height) {
            this.y = canvas.height - this.radius;
            this.speedY = -Math.abs(this.speedY);
        }

        // Devuelve qué lado dejó la pelota.
        // El marcador se actualiza desde Game.
        if (this.x + this.radius < 0) {
            return "left";
        }

        if (this.x - this.radius > canvas.width) {
            return "right";
        }

        return null;
    }
}

// ==========================================
// CLASE PADDLE: REPRESENTA CADA PALETA
// ==========================================
class Paddle {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.speed = 7;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 12;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
    }

    move(direction) {
        if (direction === "up") {
            this.y -= this.speed;
        } else if (direction === "down") {
            this.y += this.speed;
        }

        // Mantener la paleta dentro del campo.
        this.y = Math.max(
            0,
            Math.min(canvas.height - this.height, this.y)
        );
    }

    autoMove(ball) {
        if (!ball) return;

        const center = this.y + this.height / 2;
        const target = ball.y;

        if (target < center - 8) {
            this.move("up");
        } else if (target > center + 8) {
            this.move("down");
        }
    }
}

// ==========================================
// CLASE GAME: ADMINISTRA LA PARTIDA
// ==========================================
class Game {
    constructor() {
        // Cinco pelotas con diferentes tamaños,
        // colores y velocidades.
        this.balls = [
            new Ball(400, 300, 8,  3.0,  2.0, "#ffffff"),
            new Ball(400, 240, 12, 4.0, -2.5, "#ff4d6d"),
            new Ball(400, 360, 10, 2.5,  3.5, "#ffd166"),
            new Ball(340, 200, 6,  5.0,  2.0, "#4cc9f0"),
            new Ball(460, 400, 15, 3.5, -3.0, "#b8f35a")
        ];

        // Jugador: 200 px de alto, el doble
        // de los 100 px del ejemplo original.
        this.paddle1 = new Paddle(
            20,
            canvas.height / 2 - 100,
            12,
            200,
            "#00e5a8"
        );

        // Paleta de la IA: 100 px de alto.
        this.paddle2 = new Paddle(
            canvas.width - 32,
            canvas.height / 2 - 50,
            12,
            100,
            "#ff8c42"
        );

        this.keys = {};
        this.scorePlayer = 0;
        this.scoreIA = 0;
        this.mode = selectorModo.value;

        this.handleInput();
        this.updateScore();
        this.updateModeText();
    }

    // --------------------------------------
    // REINICIAR PELOTAS, POSICIONES Y PUNTOS
    // --------------------------------------
    reset() {
        this.balls.forEach((ball) => ball.reset());

        this.paddle1.y =
            canvas.height / 2 - this.paddle1.height / 2;

        this.paddle2.y =
            canvas.height / 2 - this.paddle2.height / 2;

        this.scorePlayer = 0;
        this.scoreIA = 0;

        this.keys = {};
        this.updateScore();
    }

    // --------------------------------------
    // ACTUALIZAR MARCADOR
    // --------------------------------------
    updateScore() {
        puntosJugador.textContent = this.scorePlayer;
        puntosIA.textContent = this.scoreIA;
    }

    // --------------------------------------
    // CAMBIAR MODO DE JUEGO
    // --------------------------------------
    updateModeText() {
        if (this.mode === "manual") {
            estadoModo.textContent = "Modo manual";
            descripcionModo.textContent =
                "Utiliza las flechas arriba y abajo para mover tu paleta.";
        } else {
            estadoModo.textContent = "Modo automático: IA vs IA";
            descripcionModo.textContent =
                "Ambas paletas se mueven automáticamente. ¡Observa la partida!";
        }
    }

    // --------------------------------------
    // DIBUJAR TODOS LOS ELEMENTOS
    // --------------------------------------
    draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Línea central.
        ctx.save();
        ctx.strokeStyle = "#26364b";
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 12]);

        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();
        ctx.restore();

        // Dibujar las cinco pelotas.
        this.balls.forEach((ball) => ball.draw());

        // Dibujar paletas.
        this.paddle1.draw();
        this.paddle2.draw();

        ctx.fillStyle = "#aebbd0";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.fillText(
            `Pelotas activas: ${this.balls.length}`,
            canvas.width / 2,
            24
        );
    }

    // --------------------------------------
    // SELECCIONAR PELOTA PARA CADA IA
    // --------------------------------------
    getNearestBall(paddle) {
        return this.balls.reduce((nearest, ball) => {
            if (!nearest) return ball;

            const distance = Math.abs(
                paddle.x - ball.x
            );

            const nearestDistance = Math.abs(
                paddle.x - nearest.x
            );

            return distance < nearestDistance
                ? ball
                : nearest;
        }, null);
    }

    // --------------------------------------
    // DETECTAR COLISIONES
    // --------------------------------------
    checkCollision(ball, paddle, isLeftPaddle) {
        const overlapsY =
            ball.y + ball.radius >= paddle.y &&
            ball.y - ball.radius <= paddle.y + paddle.height;

        const overlapsX =
            ball.x + ball.radius >= paddle.x &&
            ball.x - ball.radius <= paddle.x + paddle.width;

        // Permite registrar una nueva colisión
        // cuando la pelota ya se separó de la paleta.
        if (!overlapsX || !overlapsY) {
            if (!overlapsX) {
                ball.lastPaddle = null;
            }
            return;
        }

        if (ball.lastPaddle === paddle) return;

        const movingTowardPaddle = isLeftPaddle
            ? ball.speedX < 0
            : ball.speedX > 0;

        if (!movingTowardPaddle) return;

        // Rebote horizontal.
        if (isLeftPaddle) {
            ball.x = paddle.x + paddle.width + ball.radius;
            ball.speedX = Math.abs(ball.speedX);
        } else {
            ball.x = paddle.x - ball.radius;
            ball.speedX = -Math.abs(ball.speedX);
        }

        // Cambiar el ángulo según el punto de contacto.
        const paddleCenter = paddle.y + paddle.height / 2;

        const relativeHit =
            (ball.y - paddleCenter) / (paddle.height / 2);

        ball.speedY += relativeHit * 0.8;

        ball.speedY = Math.max(
            -6,
            Math.min(6, ball.speedY)
        );

        ball.lastPaddle = paddle;
    }

    // --------------------------------------
    // ACTUALIZAR EL JUEGO
    // --------------------------------------
    update() {
        // En modo manual, las flechas controlan
        // la paleta del jugador.
        if (this.mode === "manual") {
            if (this.keys["ArrowUp"]) {
                this.paddle1.move("up");
            }

            if (this.keys["ArrowDown"]) {
                this.paddle1.move("down");
            }
        } else {
            // En automático, la IA controla
            // también la paleta izquierda.
            const ballForPlayer = this.getNearestBall(
                this.paddle1
            );

            this.paddle1.autoMove(ballForPlayer);
        }

        // La paleta derecha siempre es controlada por IA.
        const ballForIA = this.getNearestBall(this.paddle2);
        this.paddle2.autoMove(ballForIA);

        // Actualizar todas las pelotas.
        this.balls.forEach((ball) => {
            const exitSide = ball.move();

            // Si salió por la izquierda, anota la IA.
            if (exitSide === "left") {
                this.scoreIA++;
                this.updateScore();

                // Regresa la pelota y la envía hacia la derecha.
                ball.reset(1);
                return;
            }

            // Si salió por la derecha, anota el jugador.
            if (exitSide === "right") {
                this.scorePlayer++;
                this.updateScore();

                // Regresa la pelota y la envía hacia la izquierda.
                ball.reset(-1);
                return;
            }

            // Todas las pelotas comprueban ambas paletas.
            this.checkCollision(ball, this.paddle1, true);
            this.checkCollision(ball, this.paddle2, false);
        });
    }

    // --------------------------------------
    // CAPTURAR TECLAS Y BOTONES
    // --------------------------------------
    handleInput() {
        window.addEventListener("keydown", (event) => {
            if (
                event.key === "ArrowUp" ||
                event.key === "ArrowDown"
            ) {
                event.preventDefault();

                if (this.mode === "manual") {
                    this.keys[event.key] = true;
                }
            }
        });

        window.addEventListener("keyup", (event) => {
            this.keys[event.key] = false;
        });

        window.addEventListener("blur", () => {
            this.keys = {};
        });

        // Reiniciar los puntos y las posiciones.
        botonReiniciar.addEventListener("click", () => {
            this.reset();
        });

        // Cambiar entre manual y automático.
        selectorModo.addEventListener("change", () => {
            this.mode = selectorModo.value;
            this.keys = {};
            this.updateModeText();
        });
    }

    // --------------------------------------
    // CICLO DE ANIMACIÓN
    // --------------------------------------
    run() {
        const gameLoop = () => {
            this.update();
            this.draw();
            requestAnimationFrame(gameLoop);
        };

        gameLoop();
    }
}

// ==========================================
// INICIAR EL JUEGO
// ==========================================
const game = new Game();
game.run();
