/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/log/common/log", "vs/platform/notification/common/notification"], function (require, exports, nls, actions_1, commands_1, log_1, notification_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /** Runs several commands passed to it as an argument */
    class RunCommands extends actions_1.Action2 {
        constructor() {
            super({
                id: 'runCommands',
                title: { value: nls.localize('runCommands', "Run Commands"), original: 'Run Commands' },
                f1: false,
                description: {
                    description: nls.localize('runCommands.description', "Run several commands"),
                    args: [
                        {
                            name: 'args',
                            schema: {
                                type: 'object',
                                required: ['commands'],
                                properties: {
                                    commands: {
                                        type: 'array',
                                        description: nls.localize('runCommands.commands', "Commands to run"),
                                        items: {
                                            anyOf: [
                                                {
                                                    $ref: 'vscode://schemas/keybindings#/definitions/commandNames'
                                                },
                                                {
                                                    type: 'string',
                                                },
                                                {
                                                    type: 'object',
                                                    required: ['command'],
                                                    properties: {
                                                        command: {
                                                            'anyOf': [
                                                                {
                                                                    $ref: 'vscode://schemas/keybindings#/definitions/commandNames'
                                                                },
                                                                {
                                                                    type: 'string'
                                                                },
                                                            ]
                                                        }
                                                    },
                                                    $ref: 'vscode://schemas/keybindings#/definitions/commandsSchemas'
                                                }
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    ]
                }
            });
        }
        // dev decisions:
        // - this command takes a single argument-object because
        //	- keybinding definitions don't allow running commands with several arguments
        //  - and we want to be able to take on different other arguments in future, e.g., `runMode : 'serial' | 'concurrent'`
        async run(accessor, args) {
            const notificationService = accessor.get(notification_1.INotificationService);
            if (!this._isCommandArgs(args)) {
                notificationService.error(nls.localize('runCommands.invalidArgs', "'runCommands' has received an argument with incorrect type. Please, review the argument passed to the command."));
                return;
            }
            if (args.commands.length === 0) {
                notificationService.warn(nls.localize('runCommands.noCommandsToRun', "'runCommands' has not received commands to run. Did you forget to pass commands in the 'runCommands' argument?"));
                return;
            }
            const commandService = accessor.get(commands_1.ICommandService);
            const logService = accessor.get(log_1.ILogService);
            let i = 0;
            try {
                for (; i < args.commands.length; ++i) {
                    const cmd = args.commands[i];
                    logService.debug(`runCommands: executing ${i}-th command: ${JSON.stringify(cmd)}`);
                    const r = await this._runCommand(commandService, cmd);
                    logService.debug(`runCommands: executed ${i}-th command with return value: ${JSON.stringify(r)}`);
                }
            }
            catch (err) {
                logService.debug(`runCommands: executing ${i}-th command resulted in an error: ${err instanceof Error ? err.message : JSON.stringify(err)}`);
                notificationService.error(err);
            }
        }
        _isCommandArgs(args) {
            if (!args || typeof args !== 'object') {
                return false;
            }
            if (!('commands' in args) || !Array.isArray(args.commands)) {
                return false;
            }
            for (const cmd of args.commands) {
                if (typeof cmd === 'string') {
                    continue;
                }
                if (typeof cmd === 'object' && typeof cmd.command === 'string') {
                    continue;
                }
                return false;
            }
            return true;
        }
        _runCommand(commandService, cmd) {
            let commandID, commandArgs;
            if (typeof cmd === 'string') {
                commandID = cmd;
            }
            else {
                commandID = cmd.command;
                commandArgs = cmd.args;
            }
            if (commandArgs === undefined) {
                return commandService.executeCommand(commandID);
            }
            else {
                if (Array.isArray(commandArgs)) {
                    return commandService.executeCommand(commandID, ...commandArgs);
                }
                else {
                    return commandService.executeCommand(commandID, commandArgs);
                }
            }
        }
    }
    (0, actions_1.registerAction2)(RunCommands);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZHMuY29udHJpYnV0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY29tbWFuZHMvY29tbW9uL2NvbW1hbmRzLmNvbnRyaWJ1dGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQWVoRyx3REFBd0Q7SUFDeEQsTUFBTSxXQUFZLFNBQVEsaUJBQU87UUFFaEM7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLGFBQWE7Z0JBQ2pCLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxjQUFjLENBQUMsRUFBRSxRQUFRLEVBQUUsY0FBYyxFQUFFO2dCQUN2RixFQUFFLEVBQUUsS0FBSztnQkFDVCxXQUFXLEVBQUU7b0JBQ1osV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMseUJBQXlCLEVBQUUsc0JBQXNCLENBQUM7b0JBQzVFLElBQUksRUFBRTt3QkFDTDs0QkFDQyxJQUFJLEVBQUUsTUFBTTs0QkFDWixNQUFNLEVBQUU7Z0NBQ1AsSUFBSSxFQUFFLFFBQVE7Z0NBQ2QsUUFBUSxFQUFFLENBQUMsVUFBVSxDQUFDO2dDQUN0QixVQUFVLEVBQUU7b0NBQ1gsUUFBUSxFQUFFO3dDQUNULElBQUksRUFBRSxPQUFPO3dDQUNiLFdBQVcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLHNCQUFzQixFQUFFLGlCQUFpQixDQUFDO3dDQUNwRSxLQUFLLEVBQUU7NENBQ04sS0FBSyxFQUFFO2dEQUNOO29EQUNDLElBQUksRUFBRSx3REFBd0Q7aURBQzlEO2dEQUNEO29EQUNDLElBQUksRUFBRSxRQUFRO2lEQUNkO2dEQUNEO29EQUNDLElBQUksRUFBRSxRQUFRO29EQUNkLFFBQVEsRUFBRSxDQUFDLFNBQVMsQ0FBQztvREFDckIsVUFBVSxFQUFFO3dEQUNYLE9BQU8s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