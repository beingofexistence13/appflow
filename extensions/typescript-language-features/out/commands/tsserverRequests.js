"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.TSServerRequestCommand = void 0;
const cancellation_1 = require("../utils/cancellation");
class TSServerRequestCommand {
    constructor(lazyClientHost) {
        this.lazyClientHost = lazyClientHost;
        this.id = 'typescript.tsserverRequest';
    }
    execute(requestID, args, config) {
        // A cancellation token cannot be passed through the command infrastructure
        const token = cancellation_1.nulToken;
        // The list can be found in the TypeScript compiler as `const enum CommandTypes`,
        // to avoid extensions making calls which could affect the internal tsserver state
        // these are only read-y sorts of commands
        const allowList = [
            // Seeing the JS/DTS output for a file
            'emit-output',
            // Grabbing a file's diagnostics
            'semanticDiagnosticsSync',
            'syntacticDiagnosticsSync',
            'suggestionDiagnosticsSync',
            // Introspecting code at a position
            'quickinfo',
            'quickinfo-full',
            'completionInfo'
        ];
        if (!allowList.includes(requestID)) {
            return;
        }
        return this.lazyClientHost.value.serviceClient.execute(requestID, args, token, config);
    }
}
exports.TSServerRequestCommand = TSServerRequestCommand;
//# sourceMappingURL=tsserverRequests.js.map