import * as React from 'react';
import { useState, useRef } from 'react';
import { IoIosArrowBack } from 'react-icons/io';
import { Jumpingjack } from './games/jumpingjack';
import { unevenrunner } from './games/unevenrunner';
import './style.css';

export default function App() {
  return (
    <div>
      <Games />
    </div>
  );
}

const gameclass = {
  'Jumping Jack': Jumpingjack,
  'Uneven Runner': unevenrunner,
};

const Games = () => {
  const [selectedGame, setSelectedGame] = useState(Object.keys(gameclass)[1]);
  const canvas = useRef();
  const HUD = useRef();
  const handleGameClick = (game) => {
    setSelectedGame(game);
  };

  const handleBackClick = () => {
    setSelectedGame(null);
  };

  React.useEffect(() => {
    selectedGame && run(canvas.current, HUD.current, selectedGame);
  }, [selectedGame]);

  return (
    <div className="flex flex-col h-screen bg-gray-800 text-white">
      <header className="flex justify-center items-center h-6 bg-gray-900">
        <span className="font-bold">
          {selectedGame ? selectedGame : 'JS ARCADE COLLECTION'}
        </span>
      </header>
      {selectedGame ? (
        <div className="flex flex-1 flex-col">
          <canvas
            ref={canvas}
            className="bg-gray-600 w-100"
            style={{ imageRendering: 'pixelated' }}
          />
          <div ref={HUD} className="bg-green-800 text-center">
            {' '}
            HUD{' '}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-wrap items-center justify-center overflow-y-auto">
          {Object.keys(gameclass).map((name) => (
            <div
              className="bg-gray-900 m-1 p-5"
              key={name}
              onClick={() => handleGameClick(name)}
            >
              {name}
            </div>
          ))}
        </div>
      )}
      <footer className="flex justify-between items-center h-6 bg-gray-900">
        {selectedGame && (
          <button className="mx-4" onClick={handleBackClick}>
            <IoIosArrowBack size={24} />
          </button>
        )}
        <p className="text-gray-500 text-sm">10xvick © 2023</p>
      </footer>
    </div>
  );
};

function run(canvas, HUD, game) {
  console.log(gameclass, game);
  new gameclass[game]({
    element: canvas,
    context: canvas.getContext('2d'),
    width: 50,
    height: 50,
    HUD: HUD,
  });
}
