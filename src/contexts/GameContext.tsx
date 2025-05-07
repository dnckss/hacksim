import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { GameState, Mission } from '../types';
import { initializeMission, getMission, getAllMissions } from '../utils/gameEngine';

// Define the context shape
interface GameContextType {
  gameState: GameState;
  currentMission: Mission | null;
  currentMissionId: number;
  missions: Mission[];
  updateGameState: (state: GameState) => void;
  completeMission: () => void;
  selectMission: (id: number) => void;
}

// Initial context state
const initialContext: GameContextType = {
  gameState: {} as GameState,
  currentMission: null,
  currentMissionId: 1,
  missions: [],
  updateGameState: () => {},
  completeMission: () => {},
  selectMission: () => {}
};

// Create the context
const GameContext = createContext<GameContextType>(initialContext);

// Action types
type GameAction = 
  | { type: 'UPDATE_GAME_STATE'; payload: GameState }
  | { type: 'COMPLETE_MISSION' }
  | { type: 'SELECT_MISSION'; payload: number };

// Reducer
function gameReducer(state: GameContextType, action: GameAction): GameContextType {
  switch (action.type) {
    case 'UPDATE_GAME_STATE':
      return {
        ...state,
        gameState: action.payload
      };
    case 'COMPLETE_MISSION':
      const nextMissionId = state.currentMissionId + 1;
      const nextMission = getMission(nextMissionId);
      
      if (!nextMission) {
        return state; // No more missions
      }
      
      return {
        ...state,
        currentMissionId: nextMissionId,
        currentMission: nextMission,
        gameState: initializeMission(nextMissionId)
      };
    case 'SELECT_MISSION':
      if (action.payload > state.currentMissionId) {
        return state; // Can't skip ahead
      }
      
      const selectedMission = getMission(action.payload);
      if (!selectedMission) {
        return state;
      }
      
      return {
        ...state,
        currentMissionId: action.payload,
        currentMission: selectedMission,
        gameState: initializeMission(action.payload)
      };
    default:
      return state;
  }
}

// Provider component
export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial missions & state
  const [state, dispatch] = useReducer(gameReducer, {
    ...initialContext,
    missions: getAllMissions(),
    currentMissionId: 1,
    currentMission: getMission(1) || null,
    gameState: initializeMission(1)
  });

  // Define dispatch functions
  const updateGameState = (gameState: GameState) => {
    dispatch({ type: 'UPDATE_GAME_STATE', payload: gameState });
  };

  const completeMission = () => {
    dispatch({ type: 'COMPLETE_MISSION' });
    
    // Save progress to localStorage
    const nextMissionId = state.currentMissionId + 1;
    localStorage.setItem('currentMissionId', nextMissionId.toString());
  };

  const selectMission = (id: number) => {
    dispatch({ type: 'SELECT_MISSION', payload: id });
  };

  // Load saved mission progress from localStorage on initial load
  useEffect(() => {
    const savedMissionId = localStorage.getItem('currentMissionId');
    if (savedMissionId) {
      const missionId = parseInt(savedMissionId, 10);
      if (!isNaN(missionId) && missionId > 0 && missionId <= state.missions.length) {
        selectMission(missionId);
      }
    }
  }, []);

  return (
    <GameContext.Provider
      value={{
        ...state,
        updateGameState,
        completeMission,
        selectMission
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

// Hook for using the game context
export const useGame = () => useContext(GameContext);