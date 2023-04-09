import * as React from 'react';
import { useState, useRef } from 'react';
import { IoIosArrowBack } from 'react-icons/io';
import { Jumpingjack } from './games/jumpingjack';
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
};

const games = [
  {
    name: 'Jumping Jack',
    thumbnail: 'https://via.placeholder.com/150x150',
  },
  {
    name: 'Game 2',
    thumbnail: 'https://via.placeholder.com/150x150',
  },
  {
    name: 'Game 3',
    thumbnail: 'https://via.placeholder.com/150x150',
  },
  {
    name: 'Game 4',
    thumbnail: 'https://via.placeholder.com/150x150',
  },
];

const Games = () => {
  const [selectedGame, setSelectedGame] = useState(null);
  const canvas = useRef();
  const HUD = useRef();
  const handleGameClick = (game) => {
    setSelectedGame(game);
    setTimeout(() => run(canvas.current, HUD.current, game), 0);
  };

  const handleBackClick = () => {
    setSelectedGame(null);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-800 text-white">
      <header className="flex justify-center items-center h-6 bg-gray-900 font-bold text-gray-500">
        JS arcade games collection
        <span className="font-bold">{selectedGame}</span>
      </header>
      {selectedGame ? (
        <div className="flex flex-1 flex-col">
          <canvas
            ref={canvas}
            className="bg-gray-600 w-100"
            style={{ imageRendering: 'pixelated' }}
          />
          <div ref={HUD} className="bg-green-400 text-center">
            {' '}
            HUD{' '}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-wrap items-center justify-center overflow-y-auto">
          {games.map(({ name }) => (
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
  console.log(canvas, HUD, game);
  new gameclass[game]({
    element: canvas,
    context: canvas.getContext('2d'),
    width: 50,
    height: 50,
    HUD: HUD,
  });
}
