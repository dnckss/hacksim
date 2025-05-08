import React, { useState } from 'react';
import { Mission, GameState } from '../types';
import { CheckCircle, Circle, Lock } from 'lucide-react';

interface MissionPanelProps {
  missions: Mission[];
  currentMissionId: number;
  gameState: GameState;
  onSelectMission: (id: number) => void;
}

export const MissionPanel: React.FC<MissionPanelProps> = ({
  missions,
  currentMissionId,
  gameState,
  onSelectMission
}) => {
  const [flagInput, setFlagInput] = useState('');
  const [selectedMissionId, setSelectedMissionId] = useState<number | null>(null);

  const handleMissionClick = (mission: Mission) => {
    if (mission.id > currentMissionId) {
      setSelectedMissionId(mission.id);
    } else {
      onSelectMission(mission.id);
    }
  };

  const handleFlagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMissionId) return;

    const previousMission = missions.find(m => m.id === selectedMissionId - 1);
    if (!previousMission) return;

    const expectedFlag = previousMission.fileSystem[`/home/admin/flag${previousMission.id}.txt`]?.content;
    if (flagInput.trim() === expectedFlag) {
      onSelectMission(selectedMissionId);
      setSelectedMissionId(null);
      setFlagInput('');
    } else {
      alert('Incorrect flag! Please try again.');
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg overflow-y-auto max-w-md w-full">
      <h2 className="text-xl font-bold text-green-400 mb-4">Missions</h2>
      
      <div className="space-y-3">
        {missions.map((mission) => {
          const isCurrent = mission.id === currentMissionId;
          const isCompleted = mission.id < currentMissionId;
          const isLocked = mission.id > currentMissionId;
          
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
                  {isCurrent && (
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

      {selectedMissionId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-bold text-green-400 mb-4">Enter Flag to Unlock Mission {selectedMissionId}</h3>
            <form onSubmit={handleFlagSubmit}>
              <input
                type="text"
                value={flagInput}
                onChange={(e) => setFlagInput(e.target.value)}
                className="w-full bg-gray-900 text-green-400 p-2 rounded mb-4"
                placeholder="Enter flag from previous mission..."
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMissionId(null);
                    setFlagInput('');
                  }}
                  className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};