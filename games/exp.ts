import { events, helper } from '../utility/utility';

export function test(canvas) {
  new logics(gameobjects(canvas));
}

class logics {
  interval = null;

  constructor(private gobject) {
    events.any(() => this.events.input.inputAction(gobject, this.actions));

    const animations = animationgenerator(gobject);
    events.lifecycle.render(() =>
      this.events.lifecycle.onrender(gobject, animations)
    );
  }

  actions = {
    jump: () => {
      const { jump } = this.gobject.player.actions;
      jump.done = false;
      jump.y = -50;
      console.log(jump.done);
    },

    jumpstate: () => {
      const { player, canvas, obstacle } = this.gobject;
      if (!player.actions.jump.done) {
        player.y += player.actions.jump.y / 300;
        const playery = player.y + player.height;

        if (playery > player.base.y) {
          player.actions.jump.y = 0;
          player.actions.jump.done = true;

          if (playery > player.base.y + canvas.height / obstacle.total) {
            player.base = obstacle.container[++player.baseIndex];
          }
        } else player.actions.jump.y++;
      } else {
        player.y = player.base.y - player.height;
      }
    },

    hit: () => {
      const { canvas, player, obstacle } = this.gobject;
      const xplayer = player.x + player.height;

      let last = obstacle.container[1];
      const last2 = obstacle.container[2];

      const playery = player.y + player.height;
      if (
        playery > last.y
        //|| obstacle.container.some(
        //   (e) =>
        //     e.x <= xplayer &&
        //     e.x + e.width >= player.x &&
        //     (e.y >= player.y || e.y + e.height <= playery)
        // )
      ) {
        //this.actions.updatespec(true);
      }
    },

    movement: () => {
      const { obstacle, canvas } = this.gobject;
      obstacle.container.forEach((o) => {
        if (o.y > canvas.height) {
          this.actions.destroyandcreatenew();
        } else o.y += 0.05;
      });
    },

    destroyandcreatenew: (n = 1) => {
      const { obstacle, game, player } = this.gobject;
      obstacle.container.shift();
      player.baseIndex && player.baseIndex--;

      for (let i = 0; i < n; i++)
        obstacle.container.push(this.generator.pipe(this.gobject));
      game.score += 1;
      this.actions.updatespec(false);
      this.events.lifecycle.update(this.gobject, this.actions);
    },

    updatespec: (gameover) => {
      const { game, canvas } = this.gobject;
      if (gameover) {
        game.over = true;
        canvas.HUD.innerText = `GAME-OVER | score:${game.score} | highscore:${game.highscore}`;
        return;
      }
      game.score > game.highscore && (game.highscore = game.score);
      canvas.HUD.innerText = `score:${game.score} | highscore:${game.highscore} afjwe ${this.gobject.player.actions.jump.done}`;
    },
  };

  generator = {
    pipe: function ({ obstacle, canvas }) {
      const random = helper.randomrange;
      const passway_w = (canvas.width * random(3, 5)) / 8;
      const distance =
        (obstacle.container.at(-1)?.y || 0) - canvas.height / obstacle.total;

      return {
        width: 50 || passway_w,
        x: 0, //((canvas.width - passway_w) * random(1, 5)) / 5,
        y: distance,
        height: 2,
      };
    },
  };

  events = {
    input: {
      inputAction: function ({ game, player, obstacle }, actions) {
        if (!game.over) actions.jump();
        else {
          game.over = false;
          game.score = 0;
          game.speed = game.initialspeed;
          obstacle.container = [];
          actions.destroyandcreatenew(obstacle.total);
          player.x = player.initialpos.x;
          player.base = obstacle.container[0];
          player.actions.jump.y = 0;
          player.actions.jump.done = false;
          actions.updatespec(false);
        }
      },
    },

    lifecycle: {
      update: function (gobject, actions) {
        events.lifecycle.update(
          () => this.onupdate(gobject, actions),
          (1 + Math.pow(2, -gobject.game.score / 100)) * gobject.game.speed
        );
      },

      count: 0,
      onupdate: function ({ game }, actions) {
        if (game.over) return;
        if (this.count < 10) {
          this.count++;
        }

        actions.jumpstate();
        actions.hit();
        actions.movement();
      },

      onrender: ({ canvas, obstacle, game }, animations) => {
        if (game.over) return;
        canvas.context.clearRect(0, 0, canvas.width, canvas.height);
        animations.forEach((e) => e());

        obstacle.container.forEach((e) => {
          canvas.context.fillRect(e.x, e.y, e.width, e.height);
        });
      },
    },
  };
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
      base: { y: 0 },
      baseIndex: 0,
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
      container: [{ x: 50, y: 45, width: 10, height: 10 }],
      element: {
        x: 50,
        y: 45,
        width: 5,
        height: 5,
      },
      total: 4,
    },
    game: {
      spec: null,
      speed: 5,
      initialspeed: 5,
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
        pixels[0] = [1, 1, 0, 0, 0, 0];
      } else {
        pixels[0] = [0, 0, 0, 0, 0, 0];
      }

      pixels.forEach((rows, i) => {
        rows.forEach((pixel, j) => {
          pixel && canvas.context.fillRect(player.x + j, player.y + i, 1, 1);
        });
      });
    },
  ];
}
