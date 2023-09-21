/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/node/processes"], function (require, exports, processes) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const sender = processes.$vl(process);
    process.on('message', msg => {
        sender.send(msg);
    });
    sender.send('ready');
});
//# sourceMappingURL=fork.js.map