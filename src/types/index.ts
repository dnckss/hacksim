export interface User {
  id: string;
  username: string;
  score: number;
  currentStage: number;
}

export interface CommandLog {
  id: string;
  userId: string;
  command: string;
  timestamp: Date;
}

export interface FileSystem {
  [key: string]: {
    type: 'file' | 'directory';
    content?: string;
    children?: { [key: string]: true };
  };
}

export interface Mission {
  id: number;
  title: string;
  description: string;
  initialPath: string;
  fileSystem: FileSystem;
  objectives: {
    description: string;
    checkCompletion: (state: GameState) => boolean;
  }[];
  successMessage: string;
  initialContext?: {
    username?: string;
    hostname?: string;
    isAdmin?: boolean;
  };
}

export interface CommandResult {
  output: string[];
  error?: boolean;
  special?: 'clear' | 'missionComplete';
}

export interface GameState {
  currentPath: string;
  fileSystem: FileSystem;
  commandHistory: string[];
  username: string;
  hostname: string;
  isAdmin: boolean;
  completedObjectives: { [key: number]: boolean };
  flags: { [key: string]: boolean };
}