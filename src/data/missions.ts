import { Mission } from '../types';

export const missions: Mission[] = [
  {
    id: 1,
    title: "Login Bypass",
    description: "Your first task is to bypass the login system and gain admin privileges.",
    initialPath: "/home/guest",
    initialContext: {
      username: "guest",
      hostname: "hackserver",
      isAdmin: false
    },
    fileSystem: {
      "/": {
        type: "directory",
        children: {
          "home": true,
          "etc": true
        }
      },
      "/home": {
        type: "directory",
        children: {
          "guest": true,
          "admin": true
        }
      },
      "/home/guest": {
        type: "directory",
        children: {
          "readme.txt": true,
          "system_notes.txt": true,
          "help_guide.txt": true
        }
      },
      "/home/guest/readme.txt": {
        type: "file",
        content: "Welcome to HackSim Terminal.\nYou need admin privileges to proceed.\nTry command 'whoami' to see your current user.\nCheck system_notes.txt for more information about system variables.\nUse 'help' command to see all available commands."
      },
      "/home/guest/system_notes.txt": {
        type: "file",
        content: "System Variables:\n- isAdmin: Controls admin access (true/false)\n\nUse 'set' command to modify system variables.\nExample: set isAdmin true"
      },
      "/home/guest/help_guide.txt": {
        type: "file",
        content: "Useful commands for exploration:\n- ls: List files in current directory\n- cd: Change directory\n- cat: Read file contents\n\nTip: Try exploring the /home/admin directory after gaining admin access."
      },
      "/home/admin": {
        type: "directory",
        children: {
          "flag1.txt": true,
          "mission_complete.txt": true
        }
      },
      "/home/admin/flag1.txt": {
        type: "file",
        content: "FLAG{Y0U_BYPAS5ED_AUTH}"
      },
      "/home/admin/mission_complete.txt": {
        type: "file",
        content: "Congratulations! You've found the flag.\nThis completes the first mission of gaining admin access."
      },
      "/etc": {
        type: "directory",
        children: {
          "passwd": true,
          "system_info.txt": true
        }
      },
      "/etc/passwd": {
        type: "file",
        content: "guest:x:1000:1000:/home/guest:/bin/bash\nadmin:x:0:0:/home/admin:/bin/bash"
      },
      "/etc/system_info.txt": {
        type: "file",
        content: "System directories:\n/home/guest - Current user directory\n/home/admin - Admin directory (requires privileges)\n/etc - System configuration files"
      }
    },
    objectives: [
      {
        description: "Gain admin privileges",
        checkCompletion: (state) => state.isAdmin === true
      },
      {
        description: "Access the flag in admin's home directory",
        checkCompletion: (state) => state.flags.flag1 === true
      }
    ],
    successMessage: "Congratulations! You've successfully bypassed the login system and gained admin privileges."
  },
  {
    id: 2,
    title: "Directory Exploration",
    description: "Now that you're logged in, explore the system to find hidden secrets.",
    initialPath: "/home/admin",
    initialContext: {
      username: "admin",
      hostname: "hackserver",
      isAdmin: true
    },
    fileSystem: {
      "/": {
        type: "directory",
        children: {
          "home": true,
          "var": true,
          "etc": true,
          "usr": true
        }
      },
      "/home": {
        type: "directory",
        children: {
          "admin": true
        }
      },
      "/home/admin": {
        type: "directory",
        children: {
          "note.txt": true
        }
      },
      "/home/admin/note.txt": {
        type: "file",
        content: "I've hidden important data in the system. Find the secrets directory."
      },
      "/var": {
        type: "directory",
        children: {
          "log": true,
          "hidden": true
        }
      },
      "/var/log": {
        type: "directory",
        children: {
          "system.log": true
        }
      },
      "/var/log/system.log": {
        type: "file",
        content: "WARNING: Unauthorized access attempt from IP 192.168.1.100\nINFO: Backup completed to /var/hidden/backup"
      },
      "/var/hidden": {
        type: "directory",
        children: {
          "backup": true
        }
      },
      "/var/hidden/backup": {
        type: "directory",
        children: {
          "secrets": true
        }
      },
      "/var/hidden/backup/secrets": {
        type: "directory",
        children: {
          "flag2.txt": true
        }
      },
      "/var/hidden/backup/secrets/flag2.txt": {
        type: "file",
        content: "FLAG{H1DD3N_D1R3CT0RY_F0UND}"
      }
    },
    objectives: [
      {
        description: "Find the hidden secrets directory",
        checkCompletion: (state) => 
          state.commandHistory.some(cmd => 
            cmd.startsWith("cd ") && 
            (state.currentPath === "/var/hidden/backup/secrets" || 
             cmd.includes("/var/hidden/backup/secrets"))
          )
      },
      {
        description: "Access the flag in the secrets directory",
        checkCompletion: (state) => state.flags.flag2 === true
      }
    ],
    successMessage: "Well done! You've successfully located the hidden secrets."
  },
  {
    id: 3,
    title: "Decoding the Encrypted",
    description: "You've found an encrypted file. Can you decode it to reveal its contents?",
    initialPath: "/home/admin",
    initialContext: {
      username: "admin",
      hostname: "hackserver",
      isAdmin: true
    },
    fileSystem: {
      "/": {
        type: "directory",
        children: {
          "home": true,
          "usr": true
        }
      },
      "/home": {
        type: "directory",
        children: {
          "admin": true
        }
      },
      "/home/admin": {
        type: "directory",
        children: {
          "encrypted.txt": true,
          "hint.txt": true,
          "decode_help.txt": true
        }
      },
      "/home/admin/encrypted.txt": {
        type: "file",
        content: "RkxBR3tCQVNFNjRfREVDMEQzRH0="
      },
      "/home/admin/hint.txt": {
        type: "file",
        content: "The file is encoded in a common format used for transmitting binary data over text-based mediums.\nTry using the 'decode' command with the appropriate encoding type."
      },
      "/home/admin/decode_help.txt": {
        type: "file",
        content: "Available decode commands:\n- decode base64 <string>\n\nExample usage:\ndecode base64 SGVsbG8="
      },
      "/usr": {
        type: "directory",
        children: {
          "bin": true
        }
      },
      "/usr/bin": {
        type: "directory",
        children: {
          "tools.txt": true
        }
      },
      "/usr/bin/tools.txt": {
        type: "file",
        content: "Available tools:\n- decode base64: Decode base64 encoded strings\n- encode base64: Encode strings to base64\n\nUse 'help' command for more information."
      }
    },
    objectives: [
      {
        description: "Decode the encrypted file",
        checkCompletion: (state) => 
          state.commandHistory.some(cmd => 
            cmd.startsWith("decode base64") && 
            cmd.includes("RkxBR3tCQVNFNjRfREVDMEQzRH0=")
          )
      }
    ],
    successMessage: "Excellent! You've successfully decoded the encrypted message and found the flag."
  }
];