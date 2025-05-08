import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { GameState, Mission } from '../types';
import { initializeMission, getMission, getAllMissions } from '../utils/gameEngine';

interface GameContextType {
  gameState: GameState;
  currentMission: Mission | null;
  currentMissionId: number;
  highestMissionId: number;
  missions: Mission[];
  updateGameState: (state: GameState) => void;
  completeMission: () => void;
  selectMission: (id: number) => void;
}

const initialContext: GameContextType = {
  gameState: {} as GameState,
  currentMission: null,
  currentMissionId: 1,
  highestMissionId: 1,
  missions: [],
  updateGameState: () => {},
  completeMission: () => {},
  selectMission: () => {}
};

const GameContext = createContext<GameContextType>(initialContext);

type GameAction = 
  | { type: 'UPDATE_GAME_STATE'; payload: GameState }
  | { type: 'COMPLETE_MISSION' }
  | { type: 'SELECT_MISSION'; payload: number }
  | { type: 'SET_HIGHEST_MISSION'; payload: number };

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
        return state;
      }
      
      return {
        ...state,
        currentMissionId: nextMissionId,
        highestMissionId: Math.max(state.highestMissionId, nextMissionId),
        currentMission: nextMission,
        gameState: initializeMission(nextMissionId)
      };
    case 'SELECT_MISSION':
      if (action.payload > state.highestMissionId) {
        return state;
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
    case 'SET_HIGHEST_MISSION':
      return {
        ...state,
        highestMissionId: action.payload
      };
    default:
      return state;
  }
}

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, {
    ...initialContext,
    missions: getAllMissions(),
    currentMissionId: 1,
    highestMissionId: 1,
    currentMission: getMission(1) || null,
    gameState: initializeMission(1)
  });

  const updateGameState = (gameState: GameState) => {
    dispatch({ type: 'UPDATE_GAME_STATE', payload: gameState });
  };

  const completeMission = () => {
    dispatch({ type: 'COMPLETE_MISSION' });
    
    const nextMissionId = state.currentMissionId + 1;
    localStorage.setItem('currentMissionId', nextMissionId.toString());
    localStorage.setItem('highestMissionId', nextMissionId.toString());
  };

  const selectMission = (id: number) => {
    dispatch({ type: 'SELECT_MISSION', payload: id });
  };

  useEffect(() => {
    const savedMissionId = localStorage.getItem('currentMissionId');
    const savedHighestMissionId = localStorage.getItem('highestMissionId');
    
    if (savedMissionId && savedHighestMissionId) {
      const missionId = parseInt(savedMissionId, 10);
      const highestMissionId = parseInt(savedHighestMissionId, 10);
      
      if (!isNaN(missionId) && !isNaN(highestMissionId) && 
          missionId > 0 && missionId <= state.missions.length) {
        dispatch({ type: 'SET_HIGHEST_MISSION', payload: highestMissionId });
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

export const useGame = () => useContext(GameContext);