"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.noopToken = void 0;
const vscode = require("vscode");
exports.noopToken = new class {
    constructor() {
        this._onCancellationRequestedEmitter = new vscode.EventEmitter();
        this.onCancellationRequested = this._onCancellationRequestedEmitter.event;
    }
    get isCancellationRequested() { return false; }
};
//# sourceMappingURL=cancellation.js.map