/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uuid"], function (require, exports, uuid_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InspectProfilingService = void 0;
    class InspectProfilingService {
        constructor() {
            this._sessions = new Map();
        }
        async startProfiling(options) {
            const prof = await new Promise((resolve_1, reject_1) => { require(['v8-inspect-profiler'], resolve_1, reject_1); });
            const session = await prof.startProfiling({ port: options.port, checkForPaused: true });
            const id = (0, uuid_1.generateUuid)();
            this._sessions.set(id, session);
            return id;
        }
        async stopProfiling(sessionId) {
            const session = this._sessions.get(sessionId);
            if (!session) {
                throw new Error(`UNKNOWN session '${sessionId}'`);
            }
            const result = await session.stop();
            this._sessions.delete(sessionId);
            return result.profile;
        }
    }
    exports.InspectProfilingService = InspectProfilingService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZmlsaW5nU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3Byb2ZpbGluZy9ub2RlL3Byb2ZpbGluZ1NlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBTWhHLE1BQWEsdUJBQXVCO1FBQXBDO1lBSWtCLGNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBNEIsQ0FBQztRQW1CbEUsQ0FBQztRQWpCQSxLQUFLLENBQUMsY0FBYyxDQUFDLE9BQXlCO1lBQzdDLE1BQU0sSUFBSSxHQUFHLHNEQUFhLHFCQUFxQiwyQkFBQyxDQUFDO1lBQ2pELE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ3hGLE1BQU0sRUFBRSxHQUFHLElBQUEsbUJBQVksR0FBRSxDQUFDO1lBQzFCLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUNoQyxPQUFPLEVBQUUsQ0FBQztRQUNYLENBQUM7UUFFRCxLQUFLLENBQUMsYUFBYSxDQUFDLFNBQWlCO1lBQ3BDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzlDLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ2IsTUFBTSxJQUFJLEtBQUssQ0FBQyxvQkFBb0IsU0FBUyxHQUFHLENBQUMsQ0FBQzthQUNsRDtZQUNELE1BQU0sTUFBTSxHQUFHLE1BQU0sT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3BDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ2pDLE9BQU8sTUFBTSxDQUFDLE9BQU8sQ0FBQztRQUN2QixDQUFDO0tBQ0Q7SUF2QkQsMERBdUJDIn0=