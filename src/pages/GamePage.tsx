import React, { useState } from 'react';
import { Terminal } from '../components/Terminal';
import { MissionPanel } from '../components/MissionPanel';
import { useGame } from '../contexts/GameContext';
import { Terminal as TerminalIcon, Award, Code } from 'lucide-react';

export const GamePage: React.FC = () => {
  const { 
    gameState, 
    currentMission, 
    currentMissionId,
    missions,
    updateGameState, 
    completeMission,
    selectMission
  } = useGame();
  
  const [showMissionPanel, setShowMissionPanel] = useState(false);
  
  if (!currentMission) {
    return <div className="text-center p-8">Loading...</div>;
  }
  
  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Code className="text-green-500" size={24} />
            <h1 className="text-2xl font-bold text-green-500">HackSim</h1>
          </div>
          
          <div className="flex gap-4 items-center">
            <button
              onClick={() => setShowMissionPanel(!showMissionPanel)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors"
            >
              <Award size={18} className="text-yellow-400" />
              <span className="hidden sm:inline">Missions</span>
            </button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow flex overflow-hidden relative">
        {/* Mission Panel (slide from left) */}
        <div 
          className={`absolute top-0 left-0 h-full w-80 bg-gray-900 transform transition-transform duration-300 ease-in-out z-20 
            ${showMissionPanel ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="h-full p-4 overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-green-500">Missions</h2>
              <button
                onClick={() => setShowMissionPanel(false)}
                className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors"
              >
                Close
              </button>
            </div>
            
            <MissionPanel
              missions={missions}
              currentMissionId={currentMissionId}
              gameState={gameState}
              onSelectMission={(id) => {
                selectMission(id);
                setShowMissionPanel(false);
              }}
            />
          </div>
        </div>
        
        {/* Overlay when mission panel is open */}
        {showMissionPanel && (
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 z-10"
            onClick={() => setShowMissionPanel(false)}
          />
        )}
        
        {/* Terminal Area */}
        <div className="w-full p-4 overflow-hidden flex flex-col">
          {/* Terminal Component */}
          <div className="flex-grow overflow-hidden flex flex-col">
            <Terminal 
              gameState={gameState}
              mission={currentMission}
              onMissionComplete={completeMission}
              onUpdateGameState={updateGameState}
            />
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 p-3 text-center text-sm text-gray-500">
        <div className="flex items-center justify-center gap-2">
          <TerminalIcon size={14} />
          <span>HackSim Terminal v1.0 - Type 'help' for available commands</span>
        </div>
      </footer>
    </div>
  );
};