import React from 'react';

interface CommandOutputProps {
  commandHistory: string[];
  outputs: { text: string; error?: boolean; success?: boolean }[][];
  username: string;
  hostname: string;
  currentPath: string;
}

export const CommandOutput: React.FC<CommandOutputProps> = ({
  commandHistory,
  outputs,
  username,
  hostname,
  currentPath
}) => {
  return (
    <div className="whitespace-pre-wrap font-mono text-sm">
      {/* Welcome message */}
      <div className="mb-4">
        <div className="text-cyan-400 font-bold">환영합니다! Hacksim 터미널에 접속하셨습니다</div>
        <div className="text-gray-400">사용 가능한 명령어를 확인하려면 help를 입력해주세요!</div>
      </div>
      
      {/* Command outputs */}
      {commandHistory.map((cmd, index) => (
        <div key={`command-${index}`} className="mb-2">
          {/* Command prompt */}
          <div className="flex flex-wrap">
            <span className="text-green-500 whitespace-nowrap mr-2">
              {username}@{hostname}:{currentPath}$
            </span>
            <span className="text-green-400">{cmd}</span>
          </div>
          
          {/* Command output */}
          {outputs[index] && (
            <div className="mt-1 ml-2">
              {outputs[index].map((line, lineIndex) => (
                <div 
                  key={`output-${index}-${lineIndex}`}
                  className={`${
                    line.error 
                      ? 'text-red-400' 
                      : line.success 
                        ? 'text-yellow-300 font-bold' 
                        : 'text-gray-300'
                  }`}
                >
                  {line.text}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};