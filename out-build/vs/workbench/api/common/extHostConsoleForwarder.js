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
define(["require", "exports", "vs/base/common/objects", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostInitDataService", "vs/workbench/api/common/extHostRpcService"], function (require, exports, objects_1, extHost_protocol_1, extHostInitDataService_1, extHostRpcService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$cdc = void 0;
    let $cdc = class $cdc {
        constructor(extHostRpc, initData) {
            this.a = extHostRpc.getProxy(extHost_protocol_1.$1J.MainThreadConsole);
            this.b = initData.consoleForward.includeStack;
            this.c = initData.consoleForward.logNative;
            // Pass console logging to the outside so that we have it in the main side if told so
            this.d('info', 'log');
            this.d('log', 'log');
            this.d('warn', 'warn');
            this.d('error', 'error');
        }
        /**
         * Wraps a console message so that it is transmitted to the renderer. If
         * native logging is turned on, the original console message will be written
         * as well. This is needed since the console methods are "magic" in V8 and
         * are the only methods that allow later introspection of logged variables.
         *
         * The wrapped property is not defined with `writable: false` to avoid
         * throwing errors, but rather a no-op setting. See https://github.com/microsoft/vscode-extension-telemetry/issues/88
         */
        d(method, severity) {
            const that = this;
            const original = console[method];
            Object.defineProperty(console, method, {
                set: () => { },
                get: () => function () {
                    that.e(method, severity, original, arguments);
                },
            });
        }
        e(method, severity, original, args) {
            this.a.$logExtensionHostMessage({
                type: '__$console',
                severity,
                arguments: safeStringifyArgumentsToArray(args, this.b)
            });
            if (this.c) {
                this.f(method, original, args);
            }
        }
    };
    exports.$cdc = $cdc;
    exports.$cdc = $cdc = __decorate([
        __param(0, extHostRpcService_1.$2L),
        __param(1, extHostInitDataService_1.$fM)
    ], $cdc);
    const MAX_LENGTH = 100000;
    /**
     * Prevent circular stringify and convert arguments to real array
     */
    function safeStringifyArgumentsToArray(args, includeStack) {
        const argsArray = [];
        // Massage some arguments with special treatment
        if (args.length) {
            for (let i = 0; i < args.length; i++) {
                let arg = args[i];
                // Any argument of type 'undefined' needs to be specially treated because
                // JSON.stringify will simply ignore those. We replace them with the string
                // 'undefined' which is not 100% right, but good enough to be logged to console
                if (typeof arg === 'undefined') {
                    arg = 'undefined';
                }
                // Any argument that is an Error will be changed to be just the error stack/message
                // itself because currently cannot serialize the error over entirely.
                else if (arg instanceof Error) {
                    const errorObj = arg;
                    if (errorObj.stack) {
                        arg = errorObj.stack;
                    }
                    else {
                        arg = errorObj.toString();
                    }
                }
                argsArray.push(arg);
            }
        }
        // Add the stack trace as payload if we are told so. We remove the message and the 2 top frames
        // to start the stacktrace where the console message was being written
        if (includeStack) {
            const stack = new Error().stack;
            if (stack) {
                argsArray.push({ __$stack: stack.split('\n').slice(3).join('\n') });
            }
        }
        try {
            const res = (0, objects_1.$1m)(argsArray);
            if (res.length > MAX_LENGTH) {
                return 'Output omitted for a large object that exceeds the limits';
            }
            return res;
        }
        catch (error) {
            return `Output omitted for an object that cannot be inspected ('${error.toString()}')`;
        }
    }
});
//# sourceMappingURL=extHostConsoleForwarder.js.map