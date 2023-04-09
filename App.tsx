import * as React from 'react';
import { useState } from 'react';
import { IoIosArrowBack } from 'react-icons/io';
import './style.css';

export default function App() {

  return (
    <div>
      <Games/>
    </div>
  );
}

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

  const handleGameClick = (game) => {
    console.log(game)
    setSelectedGame(game);
  };

  const handleBackClick = () => {
    setSelectedGame(null);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-800 text-white">
      <header className="flex justify-center items-center h-4 bg-gray-900">
      </header>
      {selectedGame ? (<div className="flex flex-1 flex-col">
        <canvas className="bg-gray-200 w-100"/>
        <div className="bg-gray-300 text-center"> HUD </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-wrap items-center justify-center overflow-y-auto">
          {games.map((game) => (
            <div className="bg-gray-900 m-1 p-5" key={game.name} onClick={handleGameClick} >
              {game.name}
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
        <p className="mx-auto text-gray-500">© 2023</p>
      </footer>
    </div>
  );
};

