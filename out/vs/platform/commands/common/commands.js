/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/base/common/linkedList", "vs/base/common/types", "vs/platform/instantiation/common/instantiation"], function (require, exports, event_1, iterator_1, lifecycle_1, linkedList_1, types_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CommandsRegistry = exports.ICommandService = void 0;
    exports.ICommandService = (0, instantiation_1.createDecorator)('commandService');
    exports.CommandsRegistry = new class {
        constructor() {
            this._commands = new Map();
            this._onDidRegisterCommand = new event_1.Emitter();
            this.onDidRegisterCommand = this._onDidRegisterCommand.event;
        }
        registerCommand(idOrCommand, handler) {
            if (!idOrCommand) {
                throw new Error(`invalid command`);
            }
            if (typeof idOrCommand === 'string') {
                if (!handler) {
                    throw new Error(`invalid command`);
                }
                return this.registerCommand({ id: idOrCommand, handler });
            }
            // add argument validation if rich command metadata is provided
            if (idOrCommand.description) {
                const constraints = [];
                for (const arg of idOrCommand.description.args) {
                    constraints.push(arg.constraint);
                }
                const actualHandler = idOrCommand.handler;
                idOrCommand.handler = function (accessor, ...args) {
                    (0, types_1.validateConstraints)(args, constraints);
                    return actualHandler(accessor, ...args);
                };
            }
            // find a place to store the command
            const { id } = idOrCommand;
            let commands = this._commands.get(id);
            if (!commands) {
                commands = new linkedList_1.LinkedList();
                this._commands.set(id, commands);
            }
            const removeFn = commands.unshift(idOrCommand);
            const ret = (0, lifecycle_1.toDisposable)(() => {
                removeFn();
                const command = this._commands.get(id);
                if (command?.isEmpty()) {
                    this._commands.delete(id);
                }
            });
            // tell the world about this command
            this._onDidRegisterCommand.fire(id);
            return ret;
        }
        registerCommandAlias(oldId, newId) {
            return exports.CommandsRegistry.registerCommand(oldId, (accessor, ...args) => accessor.get(exports.ICommandService).executeCommand(newId, ...args));
        }
        getCommand(id) {
            const list = this._commands.get(id);
            if (!list || list.isEmpty()) {
                return undefined;
            }
            return iterator_1.Iterable.first(list);
        }
        getCommands() {
            const result = new Map();
            for (const key of this._commands.keys()) {
                const command = this.getCommand(key);
                if (command) {
                    result.set(key, command);
                }
            }
            return result;
        }
    };
    exports.CommandsRegistry.registerCommand('noop', () => { });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9jb21tYW5kcy9jb21tb24vY29tbWFuZHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBVW5GLFFBQUEsZUFBZSxHQUFHLElBQUEsK0JBQWUsRUFBa0IsZ0JBQWdCLENBQUMsQ0FBQztJQStDckUsUUFBQSxnQkFBZ0IsR0FBcUIsSUFBSTtRQUFBO1lBRXBDLGNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBZ0MsQ0FBQztZQUVwRCwwQkFBcUIsR0FBRyxJQUFJLGVBQU8sRUFBVSxDQUFDO1lBQ3RELHlCQUFvQixHQUFrQixJQUFJLENBQUMscUJBQXFCLENBQUMsS0FBSyxDQUFDO1FBMkVqRixDQUFDO1FBekVBLGVBQWUsQ0FBQyxXQUE4QixFQUFFLE9BQXlCO1lBRXhFLElBQUksQ0FBQyxXQUFXLEVBQUU7Z0JBQ2pCLE1BQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQzthQUNuQztZQUVELElBQUksT0FBTyxXQUFXLEtBQUssUUFBUSxFQUFFO2dCQUNwQyxJQUFJLENBQUMsT0FBTyxFQUFFO29CQUNiLE1BQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztpQkFDbkM7Z0JBQ0QsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO2FBQzFEO1lBRUQsK0RBQStEO1lBQy9ELElBQUksV0FBVyxDQUFDLFdBQVcsRUFBRTtnQkFDNUIsTUFBTSxXQUFXLEdBQXNDLEVBQUUsQ0FBQztnQkFDMUQsS0FBSyxNQUFNLEdBQUcsSUFBSSxXQUFXLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRTtvQkFDL0MsV0FBVyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7aUJBQ2pDO2dC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