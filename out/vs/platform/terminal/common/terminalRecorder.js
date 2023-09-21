/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalRecorder = void 0;
    var Constants;
    (function (Constants) {
        Constants[Constants["MaxRecorderDataSize"] = 1048576] = "MaxRecorderDataSize"; // 1MB
    })(Constants || (Constants = {}));
    class TerminalRecorder {
        constructor(cols, rows) {
            this._totalDataLength = 0;
            this._entries = [{ cols, rows, data: [] }];
        }
        handleResize(cols, rows) {
            if (this._entries.length > 0) {
                const lastEntry = this._entries[this._entries.length - 1];
                if (lastEntry.data.length === 0) {
                    // last entry is just a resize, so just remove it
                    this._entries.pop();
                }
            }
            if (this._entries.length > 0) {
                const lastEntry = this._entries[this._entries.length - 1];
                if (lastEntry.cols === cols && lastEntry.rows === rows) {
                    // nothing changed
                    return;
                }
                if (lastEntry.cols === 0 && lastEntry.rows === 0) {
                    // we finally received a good size!
                    lastEntry.cols = cols;
                    lastEntry.rows = rows;
                    return;
                }
            }
            this._entries.push({ cols, rows, data: [] });
        }
        handleData(data) {
            const lastEntry = this._entries[this._entries.length - 1];
            lastEntry.data.push(data);
            this._totalDataLength += data.length;
            while (this._totalDataLength > 1048576 /* Constants.MaxRecorderDataSize */) {
                const firstEntry = this._entries[0];
                const remainingToDelete = this._totalDataLength - 1048576 /* Constants.MaxRecorderDataSize */;
                if (remainingToDelete >= firstEntry.data[0].length) {
                    // the first data piece must be deleted
                    this._totalDataLength -= firstEntry.data[0].length;
                    firstEntry.data.shift();
                    if (firstEntry.data.length === 0) {
                        // the first entry must be deleted
                        this._entries.shift();
                    }
                }
                else {
                    // the first data piece must be partially deleted
                    firstEntry.data[0] = firstEntry.data[0].substr(remainingToDelete);
                    this._totalDataLength -= remainingToDelete;
                }
            }
        }
        generateReplayEventSync() {
            // normalize entries to one element per data array
            this._entries.forEach((entry) => {
                if (entry.data.length > 0) {
                    entry.data = [entry.data.join('')];
                }
            });
            return {
                events: this._entries.map(entry => ({ cols: entry.cols, rows: entry.rows, data: entry.data[0] ?? '' })),
                // No command restoration is needed when relaunching terminals
                commands: {
                    isWindowsPty: false,
                    commands: []
                }
            };
        }
        async generateReplayEvent() {
            return this.generateReplayEventSync();
        }
    }
    exports.TerminalRecorder = TerminalRecorder;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxSZWNvcmRlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3Rlcm1pbmFsL2NvbW1vbi90ZXJtaW5hbFJlY29yZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUtoRyxJQUFXLFNBRVY7SUFGRCxXQUFXLFNBQVM7UUFDbkIsNkVBQWlDLENBQUEsQ0FBQyxNQUFNO0lBQ3pDLENBQUMsRUFGVSxTQUFTLEtBQVQsU0FBUyxRQUVuQjtJQVlELE1BQWEsZ0JBQWdCO1FBSzVCLFlBQVksSUFBWSxFQUFFLElBQVk7WUFGOUIscUJBQWdCLEdBQVcsQ0FBQyxDQUFDO1lBR3BDLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDNUMsQ0FBQztRQUVELFlBQVksQ0FBQyxJQUFZLEVBQUUsSUFBWTtZQUN0QyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDN0IsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDMUQsSUFBSSxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7b0JBQ2hDLGlEQUFpRDtvQkFDakQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQztpQkFDcEI7YUFDRDtZQUVELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUM3QixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUMxRCxJQUFJLFNBQVMsQ0FB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