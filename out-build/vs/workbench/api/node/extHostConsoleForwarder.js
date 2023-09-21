/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/workbench/api/common/extHostConsoleForwarder", "vs/workbench/api/common/extHostInitDataService", "vs/workbench/api/common/extHostRpcService"], function (require, exports, extHostConsoleForwarder_1, extHostInitDataService_1, extHostRpcService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Ndc = void 0;
    const MAX_STREAM_BUFFER_LENGTH = 1024 * 1024;
    let $Ndc = class $Ndc extends extHostConsoleForwarder_1.$cdc {
        constructor(extHostRpc, initData) {
            super(extHostRpc, initData);
            this.g = false;
            this.j('stderr', 'error');
            this.j('stdout', 'log');
        }
        f(method, original, args) {
            const stream = method === 'error' || method === 'warn' ? process.stderr : process.stdout;
            this.g = true;
            stream.write(`\n${"START_NATIVE_LOG" /* NativeLogMarkers.Start */}\n`);
            original.apply(console, args);
            stream.write(`\n${"END_NATIVE_LOG" /* NativeLogMarkers.End */}\n`);
            this.g = false;
        }
        /**
         * Wraps process.stderr/stdout.write() so that it is transmitted to the
         * renderer or CLI. It both calls through to the original method as well
         * as to console.log with complete lines so that they're made available
         * to the debugger/CLI.
         */
        j(streamName, severity) {
            const stream = process[streamName];
            const original = stream.write;
            let buf = '';
            Object.defineProperty(stream, 'write', {
                set: () => { },
                get: () => (chunk, encoding, callback) => {
                    if (!this.g) {
                        buf += chunk.toString(encoding);
                        const eol = buf.length > MAX_STREAM_BUFFER_LENGTH ? buf.length : buf.lastIndexOf('\n');
                        if (eol !== -1) {
                            console[severity](buf.slice(0, eol));
                            buf = buf.slice(eol + 1);
                        }
                    }
                    original.call(stream, chunk, encoding, callback);
                },
            });
        }
    };
    exports.$Ndc = $Ndc;
    exports.$Ndc = $Ndc = __decorate([
        __param(0, extHostRpcService_1.$2L),
        __param(1, extHostInitDataService_1.$fM)
    ], $Ndc);
});
//# sourceMappingURL=extHostConsoleForwarder.js.map