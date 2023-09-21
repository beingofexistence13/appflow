/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StopWatch = void 0;
    const hasPerformanceNow = (globalThis.performance && typeof globalThis.performance.now === 'function');
    class StopWatch {
        static create(highResolution) {
            return new StopWatch(highResolution);
        }
        constructor(highResolution) {
            this._now = hasPerformanceNow && highResolution === false ? Date.now : globalThis.performance.now.bind(globalThis.performance);
            this._startTime = this._now();
            this._stopTime = -1;
        }
        stop() {
            this._stopTime = this._now();
        }
        reset() {
            this._startTime = this._now();
            this._stopTime = -1;
        }
        elapsed() {
            if (this._stopTime !== -1) {
                return this._stopTime - this._startTime;
            }
            return this._now() - this._startTime;
        }
    }
    exports.StopWatch = StopWatch;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcHdhdGNoLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9jb21tb24vc3RvcHdhdGNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUtoRyxNQUFNLGlCQUFpQixHQUFHLENBQUMsVUFBVSxDQUFDLFdBQVcsSUFBSSxPQUFPLFVBQVUsQ0FBQyxXQUFXLENBQUMsR0FBRyxLQUFLLFVBQVUsQ0FBQyxDQUFDO0lBRXZHLE1BQWEsU0FBUztRQU9kLE1BQU0sQ0FBQyxNQUFNLENBQUMsY0FBd0I7WUFDNUMsT0FBTyxJQUFJLFNBQVMsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUN0QyxDQUFDO1FBRUQsWUFBWSxjQUF3QjtZQUNuQyxJQUFJLENBQUMsSUFBSSxHQUFHLGlCQUFpQixJQUFJLGNBQWMsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxXQUFZLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDaEksSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDOUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNyQixDQUFDO1FBRU0sSUFBSTtZQUNWLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzlCLENBQUM7UUFFTSxLQUFLO1lBQ1gsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDOUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNyQixDQUFDO1FBRU0sT0FBTztZQUNiLElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxDQUFDLENBQUMsRUFBRTtnQkFDMUIsT0FBTyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7YUFDeEM7WUFDRCxPQUFPLElBQUksQ0FBQyxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQ3RDLENBQUM7S0FDRDtJQWhDRCw4QkFnQ0MifQ==