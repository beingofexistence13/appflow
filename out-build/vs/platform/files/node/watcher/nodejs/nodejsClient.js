/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/files/common/watcher", "vs/platform/files/node/watcher/nodejs/nodejsWatcher"], function (require, exports, watcher_1, nodejsWatcher_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$2p = void 0;
    class $2p extends watcher_1.$Gp {
        constructor(onFileChanges, onLogMessage, verboseLogging) {
            super(onFileChanges, onLogMessage, verboseLogging);
            this.s();
        }
        r(disposables) {
            return disposables.add(new nodejsWatcher_1.$1p());
        }
    }
    exports.$2p = $2p;
});
//# sourceMappingURL=nodejsClient.js.map