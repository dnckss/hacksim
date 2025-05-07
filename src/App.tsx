import React from 'react';
import { GameProvider } from './contexts/GameContext';
import { GamePage } from './pages/GamePage';

function App() {
  return (
    <GameProvider>
      <GamePage />
    </GameProvider>
  );
}

export default App;