export function Plumbertower(canvas) {
  gameobjectInit(canvas, gameobject);
  gameloop(render, update, gameobject);
}

function gameloop(render, update_, gobj) {
  let lastRenderTime = 0;
  let interval = 1000 / 30;
  const update = (currentTime) => {
    const deltaTime = currentTime - lastRenderTime;

    // update game state based on deltaTime
    if (deltaTime > interval) {
      lastRenderTime = currentTime;
      update_(gobj);
      render(gobj);
    }

    // render the game state

    // request the next frame
    requestAnimationFrame(update);
  };

  requestAnimationFrame(update);
}

function update(gobj: typeof gameobject) {
  const { floor } = gobj;
  // floor.scale += 0.01;
  floor.x += 1;

  floor.container.forEach((e) => {
    e.x = floor.x + e.x;
  });
}

function render(gobj: typeof gameobject) {
  const {
    canvas: { context },
    floor,
  } = gobj;

  floor.container.forEach((e) => {
    context.fillRect(e.x, e.y, e.width, e.height);
  });
}

function gameobjectInit(canvas_, gobj: typeof gameobject) {
  ['element', 'context', 'HUD'].map((key) => {
    gobj.canvas[key] = canvas_[key];
  });

  const { floor, canvas } = gobj;
  floor.element.width = canvas.element.width;
  floor.height = canvas.element.height / 2;
  floor.container = Array(2)
    .fill(0)
    .map((e, i) => ({
      width: floor.scale * floor.element.width,
      height: floor.scale * floor.element.height,
      x: floor.x,
      y: floor.y + i * floor.height,
    }));
}

const gameobject = {
  canvas: {
    element: null,
    context: null,
    HUD: null,
  },
  floor: {
    element: { width: 1, height: 1, x: 0, y: 0 },
    container: [],
    height: 1,
    x: 0,
    y: 0,
    scale: 1,
  },
};
