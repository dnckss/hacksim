import { GameState, Mission, CommandResult } from '../types';
import { executeCommand } from './commandParser';
import { missions } from '../data/missions';

// Initialize a new game state for a mission
export function initializeMission(missionId: number): GameState {
  const mission = missions.find(m => m.id === missionId);
  
  if (!mission) {
    throw new Error(`Mission ${missionId} not found`);
  }
  
  return {
    currentPath: mission.initialPath,
    fileSystem: { ...mission.fileSystem },
    commandHistory: [],
    username: mission.initialContext?.username || 'guest',
    hostname: mission.initialContext?.hostname || 'hackserver',
    isAdmin: mission.initialContext?.isAdmin || false,
    completedObjectives: {},
    flags: {}
  };
}

// Execute a command and update the game state
export function processCommand(input: string, state: GameState, mission: Mission): { result: CommandResult; missionComplete: boolean } {
  const result = executeCommand(input, state);
  const missionComplete = checkMissionCompletion(state, mission);
  
  return {
    result: missionComplete 
      ? { ...result, special: 'missionComplete' } 
      : result,
    missionComplete
  };
}

// Check if all mission objectives are completed
function checkMissionCompletion(state: GameState, mission: Mission): boolean {
  const allObjectivesCompleted = mission.objectives.every(
    (objective, index) => {
      const completed = objective.checkCompletion(state);
      state.completedObjectives[index] = completed;
      return completed;
    }
  );
  
  return allObjectivesCompleted;
}

// Get current mission
export function getCurrentMission(missionId: number): Mission | undefined {
  return missions.find(m => m.id === missionId);
}

// Get mission by ID
export function getMission(id: number): Mission | undefined {
  return missions.find(m => m.id === id);
}

// Get all missions
export function getAllMissions(): Mission[] {
  return missions;
}