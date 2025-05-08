import React from 'react';
import { Mission, GameState } from '../types';
import { CheckCircle, Circle, Lock } from 'lucide-react';

interface MissionPanelProps {
  missions: Mission[];
  currentMissionId: number;
  highestMissionId: number;
  gameState: GameState;
  onSelectMission: (id: number) => void;
}

export const MissionPanel: React.FC<MissionPanelProps> = ({
  missions,
  currentMissionId,
  highestMissionId,
  gameState,
  onSelectMission
}) => {
  const handleMissionClick = (mission: Mission) => {
    if (mission.id <= highestMissionId) {
      onSelectMission(mission.id);
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg overflow-y-auto max-w-md w-full">
      <h2 className="text-xl font-bold text-green-400 mb-4">Missions</h2>
      
      <div className="space-y-3">
        {missions.map((mission) => {
          const isCurrent = mission.id === currentMissionId;
          const isCompleted = mission.id < currentMissionId;
          const isLocked = mission.id > highestMissionId;
          
          return (
            <div 
              key={mission.id}
              className={`
                p-3 rounded-md cursor-pointer transition-all
                ${isCurrent ? 'bg-gray-700 border-l-4 border-green-500' : 'bg-gray-900'}
                ${isLocked ? 'opacity-50' : 'hover:bg-gray-700'}
              `}
              onClick={() => handleMissionClick(mission)}
            >
              <div className="flex items-center gap-2">
                <div className="text-lg">
                  {isCompleted && (
                    <CheckCircle className="text-green-500" size={20} />
                  )}
                  {isCurrent && !isCompleted && (
                    <Circle className="text-yellow-400" size={20} />
                  )}
                  {isLocked && (
                    <Lock className="text-gray-500" size={20} />
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-bold text-white">
                    Mission {mission.id}: {mission.title}
                  </h3>
                  {!isLocked && (
                    <p className="text-sm text-gray-400">{mission.description}</p>
                  )}
                </div>
              </div>
              
              {isCurrent && (
                <div className="mt-3 pl-7">
                  <h4 className="text-sm font-bold text-gray-300 mb-1">Objectives:</h4>
                  <ul className="space-y-1">
                    {mission.objectives.map((objective, idx) => (
                      <li 
                        key={idx} 
                        className="flex items-center gap-2 text-sm"
                      >
                        {gameState.completedObjectives[idx] ? (
                          <CheckCircle className="text-green-500" size={14} />
                        ) : (
                          <Circle className="text-gray-400" size={14} />
                        )}
                        <span className={gameState.completedObjectives[idx] ? 'text-green-400' : 'text-gray-400'}>
                          {objective.description}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};