export function test(canvas) {
  new Logics(gameObjects(canvas));
}

class Logics {
  interval = null;
  animations = [];

  constructor(gobject) {
    this.gobject = gobject;
    this.frameUpdate();
    const inputAction = () => {
      const { game, player } = this.gobject;
      if (!game.over) {
        this.actions.jump();
      } else {
        game.over = false;
        game.score = 0;
        game.speed = game.initialspeed;
        this.actions.generateFloors();
        player.y = player.initialpos.y;
        player.actions.jump.done = false;
        this.actions.updateSpec(false);
        this.setupUpdateSpeed();
      }
    };

    ['keydown', 'click'].forEach((eventType) =>
      document.addEventListener(eventType, (e) => {
        inputAction();
      })
    );

    this.animations = animationGenerator(gobject);
  }

  setupUpdateSpeed() {
    const { game } = this.gobject;
    this.interval && clearInterval(this.interval);
    const speedFactor = 1 + Math.pow(2, game.score / 100);

    this.interval = setInterval(
      () => this.update(this.gobject),
      speedFactor * game.speed
    );
  }

  frameUpdate() {
    requestAnimationFrame(() => this.frameUpdate());
    if (this.gobject.canvas.context && !this.gobject.game.over) {
      this.render(this.gobject);
    }
  }

  actions = {
    jump: () => {
      const { player } = this.gobject;
      if (player.actions.jump.done) return;
      player.actions.jump.y = -6;
      player.actions.jump.done = true;
    },
    generateFloors: () => {
      const { floor, canvas } = this.gobject;
      const floorCount = Math.ceil(canvas.height / 50);
      floor.container = [];
      for (let i = 0; i < floorCount; i++) {
        const newFloor = {
          x: Math.random() * (canvas.width - 50),
          y: canvas.height - 50 * i,
          width: 80,
          height: 20,
        };
        floor.container.push(newFloor);
      }
    },
    updatePlayerPosition: () => {
      const { player } = this.gobject;
      player.y += player.actions.jump.y;
      player.actions.jump.y += 0.3;
    },
    checkCollision: () => {
      const { canvas, player, floor } = this.gobject;
      const playerBottom = player.y + player.height;

      if (
        playerBottom > canvas.height ||
        floor.container.every(
          (f) =>
            !(
              playerBottom <= f.y ||
              player.y >= f.y + f.height ||
              player.x >= f.x + f.width ||
              player.x + player.width <= f.x
            )
        )
      ) {
        this.actions.updateSpec(true);
      }
    },
    removeFloorsBelow: () => {
      const { floor, canvas, player } = this.gobject;
      floor.container = floor.container.filter((f) => f.y < player.y);
      const lowestFloor = Math.min(...floor.container.map((f) => f.y));
      if (lowestFloor > 0) {
        const newFloor = {
          x: Math.random() * (canvas.width - 50),
          y: lowestFloor - 50,
          width: 80,
          height: 20,
        };
        floor.container.push(newFloor);
      }
    },
    updateSpec: (gameOver) => {
      const { game, canvas } = this.gobject;
      if (gameOver) {
        game.over = true;
        canvas.HUD.innerText = `GAME OVER | Score: ${game.score} | Highscore: ${game.highscore}`;
        return;
      }
      game.score > game.highscore && (game.highscore = game.score);
      canvas.HUD.innerText = `Score: ${game.score} | Highscore: ${game.highscore}`;
    },
  };

  update({ player, floor }) {
    if (this.gobject.game.over) return;
    this.actions.updatePlayerPosition();
    this.actions.checkCollision();
    this.actions.removeFloorsBelow();
  }

  render({ canvas, player, floor }) {
    canvas.context.clearRect(0, 0, canvas.width, canvas.height);
    this.animations.forEach((e) => e());

    floor.container.forEach((f) => {
      canvas.context.fillStyle = '#000';
      canvas.context.fillRect(f.x, f.y, f.width, f.height);
    });

    canvas.context.fillStyle = '#F00';
    canvas.context.fillRect(player.x, player.y, player.width, player.height);
  }
}

function gameObjects(canvas) {
  return {
    canvas: {
      element: canvas,
      context: canvas.getContext('2d'),
      width: canvas.width,
      height: canvas.height,
      HUD: document.createElement('div'),
    },
    player: {
      initialpos: { x: canvas.width / 2 - 10, y: canvas.height - 50 },
      x: canvas.width / 2 - 10,
      y: canvas.height - 50,
      width: 20,
      height: 20,
      actions: {
        jump: {
          y: 0,
          done: true,
        },
      },
    },
    floor: {
      container: [],
    },
    game: {
      speed: 1,
      initialspeed: 1,
      score: 0,
      highscore: 0,
      over: true,
    },
  };
}

function animationGenerator({ canvas, player }) {
  return [
    () => {
      const pixels = [
        [0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 0],
        [1, 1, 1, 0, 1, 1],
        [1, 1, 1, 1, 1, 0],
        [0, 1, 1, 1, 1, 0],
      ];
      const height = pixels.length;
      let firstFrame = 0;

      return () => {
        if (firstFrame > 10) {
          firstFrame = 0;
        }
        firstFrame++;

        if (firstFrame < 5) {
          pixels[0] = [1, 1, 0, 0, 0, 0];
        } else {
          pixels[0] = [0, 0, 0, 0, 0, 0];
        }

        canvas.context.fillStyle = '#F00';
        pixels.forEach((rows, i) => {
          rows.forEach((pixel, j) => {
            if (pixel) {
              canvas.context.fillRect(player.x + j * 2, player.y + i * 2, 2, 2);
            }
          });
        });
      };
    },
  ];
}
