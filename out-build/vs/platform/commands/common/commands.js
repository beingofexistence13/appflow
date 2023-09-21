/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/base/common/linkedList", "vs/base/common/types", "vs/platform/instantiation/common/instantiation"], function (require, exports, event_1, iterator_1, lifecycle_1, linkedList_1, types_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Gr = exports.$Fr = void 0;
    exports.$Fr = (0, instantiation_1.$Bh)('commandService');
    exports.$Gr = new class {
        constructor() {
            this.a = new Map();
            this.b = new event_1.$fd();
            this.onDidRegisterCommand = this.b.event;
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
                    (0, types_1.$zf)(args, constraints);
                    return actualHandler(accessor, ...args);
                };
            }
            // find a place to store the command
            const { id } = idOrCommand;
            let commands = this.a.get(id);
            if (!commands) {
                commands = new linkedList_1.$tc();
                this.a.set(id, commands);
            }
            const removeFn = commands.unshift(idOrCommand);
            const ret = (0, lifecycle_1.$ic)(() => {
                removeFn();
                const command = this.a.get(id);
                if (command?.isEmpty()) {
                    this.a.delete(id);
                }
            });
            // tell the world about this command
            this.b.fire(id);
            return ret;
        }
        registerCommandAlias(oldId, newId) {
            return exports.$Gr.registerCommand(oldId, (accessor, ...args) => accessor.get(exports.$Fr).executeCommand(newId, ...args));
        }
        getCommand(id) {
            const list = this.a.get(id);
            if (!list || list.isEmpty()) {
                return undefined;
            }
            return iterator_1.Iterable.first(list);
        }
        getCommands() {
            const result = new Map();
            for (const key of this.a.keys()) {
                const command = this.getCommand(key);
                if (command) {
                    result.set(key, command);
                }
            }
            return result;
        }
    };
    exports.$Gr.registerCommand('noop', () => { });
});
//# sourceMappingURL=commands.js.map