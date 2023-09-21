/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/console"], function (require, exports, console_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Bcb = exports.$Acb = void 0;
    function $Acb(logService, entry, label = null) {
        const args = (0, console_1.$Op)(entry).args;
        let firstArg = args.shift();
        if (typeof firstArg !== 'string') {
            return;
        }
        if (!entry.severity) {
            entry.severity = 'info';
        }
        if (label) {
            if (!/^\[/.test(label)) {
                label = `[${label}]`;
            }
            if (!/ $/.test(label)) {
                label = `${label} `;
            }
            firstArg = label + firstArg;
        }
        switch (entry.severity) {
            case 'log':
            case 'info':
                logService.info(firstArg, ...args);
                break;
            case 'warn':
                logService.warn(firstArg, ...args);
                break;
            case 'error':
                logService.error(firstArg, ...args);
                break;
        }
    }
    exports.$Acb = $Acb;
    function $Bcb(logService, entry, label) {
        const args = (0, console_1.$Op)(entry).args;
        const firstArg = args.shift();
        if (typeof firstArg !== 'string' || entry.severity !== 'error') {
            return;
        }
        if (!/^\[/.test(label)) {
            label = `[${label}]`;
        }
        if (!/ $/.test(label)) {
            label = `${label} `;
        }
        logService.error(label + firstArg, ...args);
    }
    exports.$Bcb = $Bcb;
});
//# sourceMappingURL=remoteConsoleUtil.js.map