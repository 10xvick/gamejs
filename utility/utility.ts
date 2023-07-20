export const events = {
  any: (fn) => {
    let keypressed = false;
    ['keydown', 'touchstart'].forEach((eventType) =>
      document.addEventListener(eventType, (e) => {
        if (!keypressed) {
          fn();
          keypressed = true;
        }
      })
    );
    ['keyup', 'touchend'].forEach((eventType) =>
      document.addEventListener(eventType, (e) => {
        keypressed = false;
      })
    );
  },
};

export const helper = {
  randomrange: function (max, min) {
    return Math.floor(Math.random() * (max - min) + min);
  },
};
