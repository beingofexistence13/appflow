/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CwdDetectionCapability = void 0;
    class CwdDetectionCapability extends lifecycle_1.Disposable {
        constructor() {
            super(...arguments);
            this.type = 0 /* TerminalCapability.CwdDetection */;
            this._cwd = '';
            this._cwds = new Map();
            this._onDidChangeCwd = this._register(new event_1.Emitter());
            this.onDidChangeCwd = this._onDidChangeCwd.event;
        }
        /**
         * Gets the list of cwds seen in this session in order of last accessed.
         */
        get cwds() {
            return Array.from(this._cwds.keys());
        }
        getCwd() {
            return this._cwd;
        }
        updateCwd(cwd) {
            const didChange = this._cwd !== cwd;
            this._cwd = cwd;
            const count = this._cwds.get(this._cwd) || 0;
            this._cwds.delete(this._cwd); // Delete to put it at the bottom of the iterable
            this._cwds.set(this._cwd, count + 1);
            if (didChange) {
                this._onDidChangeCwd.fire(cwd);
            }
        }
    }
    exports.CwdDetectionCapability = CwdDetectionCapability;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3dkRGV0ZWN0aW9uQ2FwYWJpbGl0eS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3Rlcm1pbmFsL2NvbW1vbi9jYXBhYmlsaXRpZXMvY3dkRGV0ZWN0aW9uQ2FwYWJpbGl0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFNaEcsTUFBYSxzQkFBdUIsU0FBUSxzQkFBVTtRQUF0RDs7WUFDVSxTQUFJLDJDQUFtQztZQUN4QyxTQUFJLEdBQUcsRUFBRSxDQUFDO1lBQ1YsVUFBSyxHQUFHLElBQUksR0FBRyxFQUFzQyxDQUFDO1lBUzdDLG9CQUFlLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBVSxDQUFDLENBQUM7WUFDaEUsbUJBQWMsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQztRQWdCdEQsQ0FBQztRQXhCQTs7V0FFRztRQUNILElBQUksSUFBSTtZQUNQLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7UUFDdEMsQ0FBQztRQUtELE1BQU07WUFDTCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDbEIsQ0FBQztRQUVELFNBQVMsQ0FBQyxHQUFXO1lBQ3BCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxJQUFJLEtBQUssR0FBRyxDQUFDO1lBQ3BDLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO1lBQ2hCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDN0MsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsaURBQWlEO1lBQy9FLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLElBQUksU0FBUyxFQUFFO2dCQUNkLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQy9CO1FBQ0YsQ0FBQztLQUNEO0lBN0JELHdEQTZCQyJ9