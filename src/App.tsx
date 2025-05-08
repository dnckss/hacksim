import React from 'react';
import { GameProvider } from './contexts/GameContext';
import { GamePage } from './pages/GamePage';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <GameProvider>
      <Toaster />
      <GamePage />
    </GameProvider>
  );
}

export default App;