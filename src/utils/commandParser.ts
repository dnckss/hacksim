import { CommandResult, GameState } from '../types';

type CommandHandler = (args: string[], state: GameState) => CommandResult;

// 인풋에 삽입되면 위험한거 걸러주기
const sanitizeInput = (input: string): string => {
  return input.replace(/[;&|`$]/g, '').trim();
};

// 패스 인증
const validatePath = (path: string): boolean => {
  
  if (path.includes('..') || path.includes('~')) {
    return false;
  }

  if (/[<>:"|?*]/.test(path)) {
    return false;
  }
  return true;
};

const parseCommand = (input: string): { command: string; args: string[] } => {
  const sanitized = sanitizeInput(input);
  const parts = sanitized.split(' ');
  const command = parts[0].toLowerCase();
  const args = parts.slice(1).map(arg => sanitizeInput(arg));
  return { command, args };
};

const handlers: Record<string, CommandHandler> = {
  ls: (args, state) => {
    const path = args[0] || state.currentPath;
    if (!validatePath(path)) {
      return { output: ['ls: Invalid path'], error: true };
    }
    
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

    if (!validatePath(args[0])) {
      return { output: ['cd: Invalid path'], error: true };
    }

    const newPath = resolvePath(args[0], state.currentPath);
    const directory = state.fileSystem[newPath];
    
    if (!directory || directory.type !== 'directory') {
      return { output: [`cd: ${args[0]}: No such directory`], error: true };
    }
    
    // Check permissions for admin directory
    if (newPath.includes('/home/admin') && !state.isAdmin) {
      return { output: ['cd: Permission denied'], error: true };
    }
    
    state.currentPath = newPath;
    return { output: [''] };
  },
  
  cat: (args, state) => {
    if (!args.length) {
      return { output: ['Usage: cat <file>'], error: true };
    }

    if (!validatePath(args[0])) {
      return { output: ['cat: Invalid path'], error: true };
    }

    const filePath = resolvePath(args[0], state.currentPath);
    
    // Check permissions for admin files
    if (filePath.includes('/home/admin') && !state.isAdmin) {
      return { output: ['cat: Permission denied'], error: true };
    }
    
    const file = state.fileSystem[filePath];
    
    if (!file) {
      return { output: [`cat: ${args[0]}: No such file or directory`], error: true };
    }
    
    if (file.type !== 'file') {
      return { output: [`cat: ${args[0]}: Is a directory`], error: true };
    }

    const filename = filePath.split('/').pop()?.toLowerCase();
    if (filename?.startsWith('flag') && filename?.endsWith('.txt')) {
      state.flags[filename.replace('.txt', '')] = true;
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

    const encoding = sanitizeInput(args[0].toLowerCase());
    const string = sanitizeInput(args.slice(1).join(' '));

    if (encoding === 'base64') {
      try {
        const decoded = atob(string);
        // Validate decoded content
        if (!/^[a-zA-Z0-9_{}]+$/.test(decoded)) {
          return { output: ['Error: Invalid decoded content'], error: true };
        }
        return { output: [decoded] };
      } catch (e) {
        return { output: ['Error: Invalid base64 string'], error: true };
      }
    }

    return { output: [`decode: Unsupported encoding: ${encoding}`], error: true };
  },

  set: (args, state) => {
    if (!state.isAdmin && state.username !== 'guest') {
      return { output: ['set: Permission denied. Only guest can attempt to set admin privileges.'], error: true };
    }

    if (args.length < 2) {
      return { output: ['Usage: set <variable> <value>'], error: true };
    }

    const variable = sanitizeInput(args[0].toLowerCase());
    const value = sanitizeInput(args[1].toLowerCase());

    // Rate limiting for admin privilege attempts
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

    const username = sanitizeInput(args[0].toLowerCase());

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

function resolvePath(path: string, currentPath: string): string {
  if (!validatePath(path)) {
    throw new Error('Invalid path');
  }
  
  if (path.startsWith('/')) {
    return normalizePath(path);
  }
  
  return normalizePath(`${currentPath}/${path}`);
}

function normalizePath(path: string): string {
  const parts = path.split('/').filter(Boolean);
  const normalizedParts: string[] = [];
  
  for (const part of parts) {
    if (part === '.') {
      continue;
    } else if (part === '..') {
      if (normalizedParts.length === 0) {
        throw new Error('Invalid path');
      }
      normalizedParts.pop();
    } else {
      normalizedParts.push(part);
    }
  }
  
  return `/${normalizedParts.join('/')}`;
}

export function executeCommand(input: string, state: GameState): CommandResult {
  if (!input.trim()) {
    return { output: [''] };
  }
  
  try {
    const { command, args } = parseCommand(input);
    state.commandHistory.push(input);
    
    const handler = handlers[command];
    if (handler) {
      return handler(args, state);
    }
    
    return {
      output: [`${command}: command not found`],
      error: true
    };
  } catch (error) {
    return {
      output: ['Error: Invalid command or arguments'],
      error: true
    };
  }
}