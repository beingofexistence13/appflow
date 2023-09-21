"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeRequestCancellerFactory = exports.NodeRequestCanceller = void 0;
const fs = __importStar(require("fs"));
const temp_electron_1 = require("../utils/temp.electron");
class NodeRequestCanceller {
    constructor(_serverId, _tracer) {
        this._serverId = _serverId;
        this._tracer = _tracer;
        this.cancellationPipeName = (0, temp_electron_1.getTempFile)('tscancellation');
    }
    tryCancelOngoingRequest(seq) {
        if (!this.cancellationPipeName) {
            return false;
        }
        this._tracer.trace(this._serverId, `TypeScript Server: trying to cancel ongoing request with sequence number ${seq}`);
        try {
            fs.writeFileSync(this.cancellationPipeName + seq, '');
        }
        catch {
            // noop
        }
        return true;
    }
}
exports.NodeRequestCanceller = NodeRequestCanceller;
exports.nodeRequestCancellerFactory = new class {
    create(serverId, tracer) {
        return new NodeRequestCanceller(serverId, tracer);
    }
};
//# sourceMappingURL=cancellation.electron.js.map