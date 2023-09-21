/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uuid"], function (require, exports, uuid_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$77b = void 0;
    class $77b {
        constructor() {
            this.a = new Map();
        }
        async startProfiling(options) {
            const prof = await new Promise((resolve_1, reject_1) => { require(['v8-inspect-profiler'], resolve_1, reject_1); });
            const session = await prof.startProfiling({ port: options.port, checkForPaused: true });
            const id = (0, uuid_1.$4f)();
            this.a.set(id, session);
            return id;
        }
        async stopProfiling(sessionId) {
            const session = this.a.get(sessionId);
            if (!session) {
                throw new Error(`UNKNOWN session '${sessionId}'`);
            }
            const result = await session.stop();
            this.a.delete(sessionId);
            return result.profile;
        }
    }
    exports.$77b = $77b;
});
//# sourceMappingURL=profilingService.js.map