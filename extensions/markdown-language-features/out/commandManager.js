"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandManager = void 0;
const vscode = require("vscode");
class CommandManager {
    constructor() {
        this._commands = new Map();
    }
    dispose() {
        for (const registration of this._commands.values()) {
            registration.dispose();
        }
        this._commands.clear();
    }
    register(command) {
        this._registerCommand(command.id, command.execute, command);
        return new vscode.Disposable(() => {
            this._commands.delete(command.id);
        });
    }
    _registerCommand(id, impl, thisArg) {
        if (this._commands.has(id)) {
            return;
        }
        this._commands.set(id, vscode.commands.registerCommand(id, impl, thisArg));
    }
}
exports.CommandManager = CommandManager;
//# sourceMappingURL=commandManager.js.map