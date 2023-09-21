/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$4Vb = void 0;
    var Constants;
    (function (Constants) {
        Constants[Constants["MaxRecorderDataSize"] = 1048576] = "MaxRecorderDataSize"; // 1MB
    })(Constants || (Constants = {}));
    class $4Vb {
        constructor(cols, rows) {
            this.b = 0;
            this.a = [{ cols, rows, data: [] }];
        }
        handleResize(cols, rows) {
            if (this.a.length > 0) {
                const lastEntry = this.a[this.a.length - 1];
                if (lastEntry.data.length === 0) {
                    // last entry is just a resize, so just remove it
                    this.a.pop();
                }
            }
            if (this.a.length > 0) {
                const lastEntry = this.a[this.a.length - 1];
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
            this.a.push({ cols, rows, data: [] });
        }
        handleData(data) {
            const lastEntry = this.a[this.a.length - 1];
            lastEntry.data.push(data);
            this.b += data.length;
            while (this.b > 1048576 /* Constants.MaxRecorderDataSize */) {
                const firstEntry = this.a[0];
                const remainingToDelete = this.b - 1048576 /* Constants.MaxRecorderDataSize */;
                if (remainingToDelete >= firstEntry.data[0].length) {
                    // the first data piece must be deleted
                    this.b -= firstEntry.data[0].length;
                    firstEntry.data.shift();
                    if (firstEntry.data.length === 0) {
                        // the first entry must be deleted
                        this.a.shift();
                    }
                }
                else {
                    // the first data piece must be partially deleted
                    firstEntry.data[0] = firstEntry.data[0].substr(remainingToDelete);
                    this.b -= remainingToDelete;
                }
            }
        }
        generateReplayEventSync() {
            // normalize entries to one element per data array
            this.a.forEach((entry) => {
                if (entry.data.length > 0) {
                    entry.data = [entry.data.join('')];
                }
            });
            return {
                events: this.a.map(entry => ({ cols: entry.cols, rows: entry.rows, data: entry.data[0] ?? '' })),
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
    exports.$4Vb = $4Vb;
});
//# sourceMappingURL=terminalRecorder.js.map