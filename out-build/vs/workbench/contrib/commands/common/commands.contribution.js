/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/commands/common/commands.contribution", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/log/common/log", "vs/platform/notification/common/notification"], function (require, exports, nls, actions_1, commands_1, log_1, notification_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /** Runs several commands passed to it as an argument */
    class RunCommands extends actions_1.$Wu {
        constructor() {
            super({
                id: 'runCommands',
                title: { value: nls.localize(0, null), original: 'Run Commands' },
                f1: false,
                description: {
                    description: nls.localize(1, null),
                    args: [
                        {
                            name: 'args',
                            schema: {
                                type: 'object',
                                required: ['commands'],
                                properties: {
                                    commands: {
                                        type: 'array',
                                        description: nls.localize(2, null),
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
            const notificationService = accessor.get(notification_1.$Yu);
            if (!this.a(args)) {
                notificationService.error(nls.localize(3, null));
                return;
            }
            if (args.commands.length === 0) {
                notificationService.warn(nls.localize(4, null));
                return;
            }
            const commandService = accessor.get(commands_1.$Fr);
            const logService = accessor.get(log_1.$5i);
            let i = 0;
            try {
                for (; i < args.commands.length; ++i) {
                    const cmd = args.commands[i];
                    logService.debug(`runCommands: executing ${i}-th command: ${JSON.stringify(cmd)}`);
                    const r = await this.b(commandService, cmd);
                    logService.debug(`runCommands: executed ${i}-th command with return value: ${JSON.stringify(r)}`);
                }
            }
            catch (err) {
                logService.debug(`runCommands: executing ${i}-th command resulted in an error: ${err instanceof Error ? err.message : JSON.stringify(err)}`);
                notificationService.error(err);
            }
        }
        a(args) {
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
        b(commandService, cmd) {
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
    (0, actions_1.$Xu)(RunCommands);
});
//# sourceMappingURL=commands.contribution.js.map