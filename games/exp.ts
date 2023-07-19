export function test(canvas) {
  new logics(gameobjects(canvas));
}

class logics {
  interval = null;
  animations = [];
  constructor(private gobject) {
    this.frameupdate();
    const inputAction = () => {
      const { game, player } = gobject;
      if (!game.over) this.actions.jump();
      else {
        game.over = false;
        game.score = 0;
        game.speed = game.initialspeed;
        this.actions.destroyandcreatenew();
        player.x = player.initialpos.x;
        player.y = player.initialpos.y;
        player.actions.jump.y = 0;
        player.actions.jump.done = false;
        this.actions.updatespec(false);
        this.setupdatespeed();
      }
    };

    ['keydown', 'click'].forEach((eventType) =>
      document.addEventListener(eventType, (e) => {
        inputAction();
      })
    );
    this.animations = animationgenerator(gobject);
  }

  setupdatespeed() {
    this.interval && clearInterval(this.interval);
    const newinterval =
      1000 / (this.gobject.game.speed + this.gobject.game.score);
    this.interval = setInterval(() => this.update(this.gobject), newinterval);
  }

  frameupdate() {
    requestAnimationFrame(() => this.frameupdate());
    if (this.gobject.canvas.context && !this.gobject.game.over) {
      this.render(this.gobject);
    }
  }

  actions = {
    jump: () => {
      const { player } = this.gobject;
      player.actions.jump.done = false;
      player.actions.jump.y = -50;
    },
    jumpstate: () => {
      const { player } = this.gobject;
      if (!player.actions.jump.done) {
        player.y += player.actions.jump.y / 100;
        player.actions.jump.y++;
      }
    },
    hit: () => {
      const { canvas, player, obstacle } = this.gobject;
      const xplayer = player.x + player.height;
      if (
        player.y + player.height > canvas.height ||
        obstacle.container.some(
          (e) =>
            e.x <= xplayer &&
            e.x + e.width >= player.x &&
            (e.y >= player.y || e.y + e.height <= player.y + player.height)
        )
      ) {
        this.actions.updatespec(true);
      }
    },
    gc: () => {
      const { obstacle } = this.gobject;
      obstacle.container.forEach((o) => {
        if (o.x < -o.width) {
          this.actions.destroyandcreatenew();
        } else o.x -= 0.5;
      });
    },
    destroyandcreatenew: () => {
      const { obstacle, canvas, game } = this.gobject;
      const random = this.utility.randomrange;
      obstacle.container.pop();
      const passway_h = (canvas.height * random(3, 6)) / 8;

      const pipe = {
        x: random(70, 50),
        width: obstacle.element.width,
        y: ((canvas.height - passway_h) * random(1, 5)) / 5,
        height: passway_h,
      };

      obstacle.container.push(pipe);
      game.score += 1;
      this.actions.updatespec(false);
      this.setupdatespeed();
    },
    updatespec: (gameover) => {
      const { game, canvas } = this.gobject;
      if (gameover) {
        game.over = true;
        canvas.HUD.innerText = `GAME-OVER | score:${game.score} | highscore:${game.highscore}`;
        return;
      }
      game.score > game.highscore && (game.highscore = game.score);
      canvas.HUD.innerText = `score:${game.score} | highscore:${game.highscore}`;
    },
  };

  utility = {
    randomrange: function (max, min) {
      return Math.floor(Math.random() * (max - min) + min);
    },
  };

  count = 0;
  update({ obstacle }) {
    if (this.gobject.game.over) return;
    if (this.count < 10) {
      this.count++;
    }
    obstacle.x -= 0.25;
    this.actions.jumpstate();
    this.actions.hit();
    this.actions.gc();
  }

  render({ canvas, obstacle }) {
    canvas.context.clearRect(0, 0, canvas.width, canvas.height);
    this.animations.forEach((e) => e());

    obstacle.container.forEach((e) => {
      canvas.context.fillRect(e.x, 0, e.width, e.y);
      canvas.context.fillRect(
        e.x,
        e.y + e.height,
        e.width,
        canvas.height - e.y - e.height
      );
    });
  }
}

function gameobjects(canvas: {
  element: any;
  context: CanvasRenderingContext2D;
  width: number;
  height: number;
  HUD: HTMLElement;
}) {
  return {
    firstframe: 0,
    canvas: {
      element: canvas,
      context: canvas.context,
      x: 0,
      y: 0,
      width: canvas.width,
      height: canvas.height,
      HUD: canvas.HUD,
    },
    player: {
      initialpos: { x: canvas.width / 5, y: (canvas.height - 5) / 2 },
      x: 0,
      y: 0,
      width: 6,
      height: 5,
      actions: {
        jump: {
          limit: 15,
          speed: 1,
          y: 0,
          limitreched: false,
          done: true,
        },
        damage: {},
      },
    },
    obstacle: {
      container: [{ x: 50, y: 45, width: 10, height: canvas.height }],
      element: {
        x: 50,
        y: 45,
        width: 5,
        height: 5,
      },
    },
    game: {
      spec: null,
      speed: 50,
      initialspeed: 50,
      score: 0,
      highscore: 0,
      over: true,
    },
  };
}

function animationgenerator({ canvas, player, firstframe }) {
  return [
    () => {
      const pixels = [
        [0, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 0],
        [1, 1, 1, 0, 1, 1],
        [1, 1, 1, 1, 1, 0],
        [0, 1, 1, 1, 1, 0],
      ];
      const height = pixels.length;
      if (firstframe > 10) {
        firstframe = 0;
      }
      firstframe++;

      if (firstframe < 5) {
        pixels[0] = [0, 0, 0, 0, 0, 0];
      } else {
        pixels[0] = [1, 1, 1, 0, 0, 0];
      }

      pixels.forEach((rows, i) => {
        rows.forEach((pixel, j) => {
          pixel && canvas.context.fillRect(player.x + j, player.y + i, 1, 1);
        });
      });
    },
  ];
}