// command-factory.js
import { MoveCommand } from './MoveCommand.js';
import { JumpCommand } from './JumpCommand.js';
import { AttackCommand } from './AttackCommand.js';
import { RotateCommand } from './RotateCommand.js';
import { ScaleCommand } from './ScaleCommand.js';

// Factory Map: Links command types to classes
const COMMAND_MAP = {
    'move': MoveCommand,
    'jump': JumpCommand,
    'attack': AttackCommand,
    'rotate': RotateCommand,
    'scale': ScaleCommand
};

export class CommandFactory {
    static createCommand(type, config = {}) {
        const CommandClass = COMMAND_MAP[type];

        if (!CommandClass) {
            console.warn(`Command type '${type}' is not recognized in the factory map.`);
            return null;
        }

        const command = new CommandClass();

        // Apply configuration if provided
        if (config && typeof config === 'object') {
            Object.assign(command, config);
        }

        return command;
    }

    static getAvailableCommands() {
        return Object.keys(COMMAND_MAP);
    }

    static registerCommand(type, CommandClass) {
        if (COMMAND_MAP[type]) {
            console.warn(`Command type '${type}' is already registered. Overwriting.`);
        }
        COMMAND_MAP[type] = CommandClass;
    }
}