import React, { useState, useEffect } from 'react';
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
  
  // Handle window resize for responsive layout
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Close mission panel when switching to mobile
  useEffect(() => {
    if (isMobile) {
      setShowMissionPanel(false);
    }
  }, [isMobile]);
  
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
      <main className="flex-grow flex overflow-hidden">
        {/* Mission Panel (hidden on mobile unless toggled) */}
        {(showMissionPanel || !isMobile) && (
          <div 
            className={`
              ${isMobile ? 'absolute inset-0 z-10 p-4 bg-gray-900 bg-opacity-95' : 'w-1/3 p-4 border-r border-gray-800'}
            `}
          >
            {isMobile && (
              <button
                onClick={() => setShowMissionPanel(false)}
                className="mb-4 px-3 py-1 bg-gray-800 rounded-md"
              >
                Close
              </button>
            )}
            
            <MissionPanel
              missions={missions}
              currentMissionId={currentMissionId}
              gameState={gameState}
              onSelectMission={selectMission}
            />
          </div>
        )}
        
        {/* Terminal Area */}
        <div className={`${isMobile || showMissionPanel ? 'w-full' : 'w-2/3'} p-4 overflow-hidden flex flex-col`}>
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