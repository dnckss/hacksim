import React, { useState, useRef, useEffect } from 'react';
import { CommandInput } from './CommandInput';
import { CommandOutput } from './CommandOutput';
import { GameState } from '../types';
import { processCommand } from '../utils/gameEngine';
import { Terminal as LucideTerminal } from 'lucide-react';
import toast from 'react-hot-toast';

interface TerminalProps {
  gameState: GameState;
  mission: any;  
  onMissionComplete: () => void;
  onUpdateGameState: (state: GameState) => void;
}

export const Terminal: React.FC<TerminalProps> = ({ 
  gameState, 
  mission, 
  onMissionComplete,
  onUpdateGameState
}) => {
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [outputs, setOutputs] = useState<{ text: string; error?: boolean }[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [outputs]);

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleCommand = (command: string) => {
    const { result, missionComplete } = processCommand(command, gameState, mission);
    
    onUpdateGameState({ ...gameState });
    
    if (result.special === 'clear') {
      setOutputs([]);
      setCommandHistory([...commandHistory, command]);
      return;
    }
    
    setCommandHistory([...commandHistory, command]);
    
    const outputLines = result.output.map(line => ({
      text: line,
      error: result.error
    }));
    
    setOutputs([...outputs, outputLines]);
    setHistoryIndex(-1);
    
    if (missionComplete || result.special === 'missionComplete') {
      toast.success(mission.successMessage, {
        duration: 5000,
        position: 'top-center',
        style: {
          background: '#10B981',
          color: '#fff',
          fontWeight: 'bold'
        }
      });
      onMissionComplete();
    }
  };

  const handleHistoryNavigation = (direction: 'up' | 'down') => {
    if (commandHistory.length === 0) return;
    
    let newIndex = historyIndex;
    
    if (direction === 'up') {
      newIndex = historyIndex < 0 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
    } else {
      newIndex = Math.min(commandHistory.length - 1, historyIndex + 1);
      if (newIndex === commandHistory.length - 1) {
        newIndex = -1;
      }
    }
    
    setHistoryIndex(newIndex);
    return newIndex >= 0 ? commandHistory[newIndex] : '';
  };

  return (
    <div 
      ref={terminalRef}
      className="flex flex-col w-full h-full bg-gray-900 text-green-400 font-mono p-2 rounded-md overflow-auto"
      onClick={focusInput}
      style={{ minHeight: '400px' }}
    >
      <div className="flex items-center gap-2 mb-4 border-b border-gray-700 pb-2">
        <LucideTerminal className="text-green-500" size={20} />
        <h2 className="text-green-500 text-xl font-bold">
          HackSim Terminal
        </h2>
      </div>
      
      <div className="mb-4 p-2 bg-gray-800 rounded border-l-4 border-green-500">
        <h3 className="text-white font-bold">Mission: {mission.title}</h3>
        <p className="text-gray-400 text-sm">{mission.description}</p>
      </div>
      
      <div className="flex-grow overflow-auto mb-2">
        <CommandOutput 
          commandHistory={commandHistory}
          outputs={outputs}
          username={gameState.username}
          hostname={gameState.hostname}
          currentPath={gameState.currentPath}
        />
      </div>
      
      <CommandInput
        ref={inputRef}
        onSubmit={handleCommand}
        onHistoryNavigation={handleHistoryNavigation}
        username={gameState.username}
        hostname={gameState.hostname}
        currentPath={gameState.currentPath}
      />
    </div>
  );
};