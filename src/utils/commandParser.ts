import { CommandResult, GameState } from '../types';

type CommandHandler = (args: string[], state: GameState) => CommandResult;

// Helper function to split command and args
const parseCommand = (input: string): { command: string; args: string[] } => {
  const parts = input.trim().split(' ');
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);
  return { command, args };
};

// Command handlers
const handlers: Record<string, CommandHandler> = {
  ls: (args, state) => {
    const path = args[0] || state.currentPath;
    const directoryPath = resolvePath(path, state.currentPath);
    
    const directory = state.fileSystem[directoryPath];
    if (!directory || directory.type !== 'directory') {
      return { output: [`ls: ${path}: No such directory`], error: true };
    }
    
    const contents = Object.keys(directory.children || {})
      .map(name => {
        const fullPath = directoryPath === '/' ? `/${name}` : `${directoryPath}/${name}`;
        const entry = state.fileSystem[fullPath];
        return entry.type === 'directory' ? `${name}/` : name;
      })
      .sort();
    
    return { output: contents.length ? contents : [''] };
  },
  
  cd: (args, state) => {
    if (!args.length) {
      return { output: ['Usage: cd <directory>'], error: true };
    }

    const newPath = resolvePath(args[0], state.currentPath);
    
    const directory = state.fileSystem[newPath];
    if (!directory || directory.type !== 'directory') {
      return { output: [`cd: ${args[0]}: No such directory`], error: true };
    }
    
    state.currentPath = newPath;
    return { output: [''] };
  },
  
  cat: (args, state) => {
    if (!args.length) {
      return { output: ['Usage: cat <file>'], error: true };
    }

    const filePath = resolvePath(args[0], state.currentPath);
    const file = state.fileSystem[filePath];
    
    if (!file) {
      return { output: [`cat: ${args[0]}: No such file or directory`], error: true };
    }
    
    if (file.type !== 'file') {
      return { output: [`cat: ${args[0]}: Is a directory`], error: true };
    }

    // Check if this is a flag file
    const filename = filePath.split('/').pop()?.toLowerCase();
    if (filename?.startsWith('flag') && filename?.endsWith('.txt')) {
      const flagName = filename.replace('.txt', '');
      state.flags[flagName] = true;
    }
    
    return { output: file.content ? file.content.split('\n') : [''] };
  },
  
  clear: (_, __) => {
    return { output: [], special: 'clear' };
  },
  
  whoami: (_, state) => {
    return { output: [state.username] };
  },
  
  pwd: (_, state) => {
    return { output: [state.currentPath] };
  },

  help: (_, __) => {
    return {
      output: [
        'Available commands:',
        '  ls [directory]    - List directory contents',
        '  cd <directory>    - Change current directory',
        '  cat <file>        - Display file contents',
        '  pwd               - Print working directory',
        '  whoami            - Display current user',
        '  clear             - Clear the screen',
        '  help              - Display this help message',
        '  decode base64 <string> - Decode base64 encoded string',
        '  set <variable> <value> - Set system variables (admin only)',
        '  login <username>  - Attempt to login as another user'
      ]
    };
  },

  decode: (args, _) => {
    if (args.length < 2) {
      return { output: ['Usage: decode <encoding> <string>'], error: true };
    }

    const encoding = args[0].toLowerCase();
    const string = args.slice(1).join(' ');

    if (encoding === 'base64') {
      try {
        const decoded = atob(string);
        return { output: [decoded] };
      } catch (e) {
        return { output: ['Error: Invalid base64 string'], error: true };
      }
    }

    return { output: [`decode: Unsupported encoding: ${encoding}`], error: true };
  },

  set: (args, state) => {
    if (args.length < 2) {
      return { output: ['Usage: set <variable> <value>'], error: true };
    }

    const variable = args[0].toLowerCase();
    const value = args[1].toLowerCase();

    if (variable === 'isadmin') {
      if (value === 'true') {
        state.isAdmin = true;
        state.username = 'admin';
        return { output: ['Admin privileges activated.'] };
      } else if (value === 'false') {
        state.isAdmin = false;
        state.username = 'guest';
        return { output: ['Admin privileges deactivated.'] };
      }
      return { output: [`set: Invalid value for ${variable}: ${value}. Expected true or false.`], error: true };
    }

    return { output: [`set: Unknown variable: ${variable}`], error: true };
  },

  login: (args, state) => {
    if (args.length !== 1) {
      return { output: ['Usage: login <username>'], error: true };
    }

    const username = args[0].toLowerCase();

    if (username === 'admin') {
      if (state.isAdmin) {
        return { output: ['You are already logged in as admin.'] };
      }
      return { output: ['login: Authentication failed. Admin access requires elevated privileges.'], error: true };
    }

    if (username === 'guest') {
      state.isAdmin = false;
      state.username = 'guest';
      return { output: ['Logged in as guest.'] };
    }

    return { output: [`login: User ${username} does not exist.`], error: true };
  }
};

// Helper functions
function resolvePath(path: string, currentPath: string): string {
  // Handle absolute paths
  if (path.startsWith('/')) {
    return normalizePath(path);
  }
  
  // Handle relative paths
  const resolvedPath = normalizePath(`${currentPath}/${path}`);
  return resolvedPath;
}

function normalizePath(path: string): string {
  const parts = path.split('/').filter(Boolean);
  const normalizedParts: string[] = [];
  
  for (const part of parts) {
    if (part === '.') {
      continue;
    } else if (part === '..') {
      normalizedParts.pop();
    } else {
      normalizedParts.push(part);
    }
  }
  
  return `/${normalizedParts.join('/')}`;
}

export function executeCommand(input: string, state: GameState): CommandResult {
  // Handle empty input
  if (!input.trim()) {
    return { output: [''] };
  }
  
  // Parse command and args
  const { command, args } = parseCommand(input);
  
  // Add to command history
  state.commandHistory.push(input);
  
  // Execute command if it exists
  const handler = handlers[command];
  if (handler) {
    return handler(args, state);
  }
  
  // Command not found
  return {
    output: [`${command}: command not found`],
    error: true
  };
}