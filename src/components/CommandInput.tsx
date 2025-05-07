import React, { forwardRef, useImperativeHandle, useState, KeyboardEvent, ChangeEvent } from 'react';

interface CommandInputProps {
  onSubmit: (command: string) => void;
  onHistoryNavigation: (direction: 'up' | 'down') => string | undefined;
  username: string;
  hostname: string;
  currentPath: string;
}

export const CommandInput = forwardRef<HTMLInputElement, CommandInputProps>(
  ({ onSubmit, onHistoryNavigation, username, hostname, currentPath }, ref) => {
    const [command, setCommand] = useState('');
    const inputRef = React.useRef<HTMLInputElement>(null);
    
    useImperativeHandle(ref, () => inputRef.current!);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (command.trim()) {
        onSubmit(command);
        setCommand('');
      }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        const historyCommand = onHistoryNavigation(e.key === 'ArrowUp' ? 'up' : 'down');
        if (historyCommand !== undefined) {
          setCommand(historyCommand);
        }
      }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      setCommand(e.target.value);
    };

    return (
      <form onSubmit={handleSubmit} className="flex items-center w-full">
        <div className="text-green-500 whitespace-nowrap mr-2">
          {username}@{hostname}:{currentPath}$
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={command}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="flex-grow bg-transparent border-none outline-none text-green-400 caret-green-400"
          autoFocus
          autoComplete="off"
          spellCheck="false"
        />
      </form>
    );
  }
);