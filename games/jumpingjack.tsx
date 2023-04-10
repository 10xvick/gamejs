export class Jumpingjack {
  constructor(canvas) {
    new logics(new gameobjects(canvas));
  }
}

class logics {
  interval = null;
  constructor(private gobject: gameobjects) {
    this.frameupdate();
    const inputAction = () => {
      if (!gobject.game.over) this.actions.jump();
      else {
        gobject.game.over = false;
        gobject.game.score = 0;
        gobject.game.speed = gobject.game.initialspeed;
        gobject.obstacle.container = [
          Object.assign({}, gobject.obstacle.element),
        ];
        gobject.player.x = gobject.player.initialpos.x;
        gobject.player.y = gobject.player.initialpos.y;
        this.actions.updatespec(false);
        this.setupdatespeed();
      }
    };

    ['keydown', 'click'].forEach((eventType) =>
      document.addEventListener(eventType, (e) => {
        inputAction();
      })
    );
  }

  setupdatespeed() {
    this.interval && clearInterval(this.interval);
    const newinterval =
      1000 / (this.gobject.game.speed + this.gobject.game.score);
    this.interval = setInterval(() => this.update(this.gobject), newinterval);
  }

  frameupdate() {
    requestAnimationFrame(() => this.frameupdate());
    if (this.gobject.canvas.context) {
      this.render(this.gobject);
    }
  }

  actions = {
    jump: () => {
      const { player } = this.gobject;
      if (player.actions.jump.done) {
        player.actions.jump.done = false;
        player.actions.jump.y = -50;
      }
    },
    jumpstate: () => {
      const { player, canvas } = this.gobject;
      if (!player.actions.jump.done) {
        player.y += player.actions.jump.y / 100;
        player.actions.jump.y++;
        if (player.y >= canvas.height - player.pixels.length) {
          player.y = canvas.height - player.pixels.length;
          player.actions.jump.done = true;
        }
      }
    },
    hit: () => {
      const { player, obstacle } = this.gobject;
      const xplayer = player.x + player.pixels.length;
      const yplayer = player.y + player.pixels[0].length;
      if (
        obstacle.container.some(
          (e) =>
            e.x <= xplayer &&
            e.x + e.width >= player.x &&
            e.y + e.height >= player.y &&
            e.y <= yplayer
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
      this.gobject.obstacle.container.pop();
      const height = this.utility.randomrange(10, 4);
      const obs = {
        x: this.utility.randomrange(70, 50),
        width: this.utility.randomrange(6, 1),
        height: height,
        y: this.gobject.canvas.height - height,
      };
      this.gobject.obstacle.container.push(obs);
      this.gobject.game.score += 1;
      this.actions.updatespec(false);
      this.setupdatespeed();
    },
    updatespec: (gameover) => {
      if (gameover) {
        this.gobject.game.over = true;
        this.gobject.canvas.HUD.innerText = `GAME-OVER | score:${this.gobject.game.score} | highscore:${this.gobject.game.highscore}`;
        return;
      }
      this.gobject.game.score > this.gobject.game.highscore &&
        (this.gobject.game.highscore = this.gobject.game.score);
      this.gobject.canvas.HUD.innerText = `score:${this.gobject.game.score} | highscore:${this.gobject.game.highscore}`;
    },
  };

  utility = {
    randomrange: function (max, min) {
      return Math.floor(Math.random() * (max - min) + min);
    },
  };

  count = 0;
  update({ obstacle, parser }) {
    if (this.gobject.game.over) return;
    if (this.count < 10) {
      this.count++;
    }
    obstacle.x -= 0.25;
    this.actions.jumpstate();
    this.actions.hit();
    this.actions.gc();
    parser.playerwalkanim();
  }

  render({ canvas, player, obstacle }: gameobjects) {
    canvas.context.clearRect(0, 0, canvas.width, canvas.height);
    const drawplayer = (player) => {
      player.pixels.forEach((rows, i) => {
        rows.forEach((pixel, j) => {
          pixel && canvas.context.fillRect(player.x + j, player.y + i, 1, 1);
        });
      });
    };
    drawplayer(player);
    obstacle.container.forEach((e) =>
      canvas.context.fillRect(e.x, e.y, e.width, e.height)
    );
  }
}

class gameobjects {
  constructor(canvas: {
    element: any;
    context: CanvasRenderingContext2D;
    width: number;
    height: number;
    HUD: HTMLElement;
  }) {
    this.canvas = { ...this.canvas, ...canvas };
    [canvas.element.width, canvas.element.height] = [
      this.canvas.width,
      this.canvas.height,
    ];
    this.player.width = this.player.pixels[0].length;
    this.player.height = this.player.pixels.length;
    this.player.initialpos = {
      x: this.canvas.width / 2 - this.player.width * 1.5,
      y: this.canvas.height - this.player.height,
    };
  }

  firstframe = 0;

  parser = {
    playerwalkanim: () => {
      const pix = this.player.pixels;
      const height = this.player.pixels.length;
      if (this.firstframe > 10) {
        this.firstframe = 0;
      }
      this.firstframe++;

      if (this.firstframe < 5) {
        pix[height - 2] = [0, 1, 0, 0, 0, 0, 1, 0];
        pix[height - 1] = [0, 1, 1, 0, 0, 0, 1, 1];
      } else {
        pix[height - 2] = [0, 0, 1, 0, 0, 1, 0, 0];
        pix[height - 1] = [0, 0, 1, 1, 0, 1, 1, 0];
      }
    },
  };

  canvas = {
    element: null,
    context: null,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    HUD: null,
  };
  player = {
    initialpos: { x: 10, y: 40 },
    x: 10,
    y: 40,
    width: 1,
    height: 1,
    pixels: [
      [0, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 0, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
    ],
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
  };
  obstacle = {
    container: [{ x: 50, y: 45, width: 10, height: 5 }],
    element: {
      x: 50,
      y: 45,
      width: 5,
      height: 5,
    },
  };
  game = {
    spec: null,
    speed: 50,
    initialspeed: 50,
    score: 0,
    highscore: 0,
    over: true,
  };
}
