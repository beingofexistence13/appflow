/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LineDataEventAddon = void 0;
    /**
     * Provides extensions to the xterm object in a modular, testable way.
     */
    class LineDataEventAddon extends lifecycle_1.Disposable {
        constructor(_initializationPromise) {
            super();
            this._initializationPromise = _initializationPromise;
            this._isOsSet = false;
            this._onLineData = this._register(new event_1.Emitter());
            this.onLineData = this._onLineData.event;
        }
        async activate(xterm) {
            this._xterm = xterm;
            // If there is an initialization promise, wait for it before registering the event
            await this._initializationPromise;
            // Fire onLineData when a line feed occurs, taking into account wrapped lines
            this._register(xterm.onLineFeed(() => {
                const buffer = xterm.buffer;
                const newLine = buffer.active.getLine(buffer.active.baseY + buffer.active.cursorY);
                if (newLine && !newLine.isWrapped) {
                    this._sendLineData(buffer.active, buffer.active.baseY + buffer.active.cursorY - 1);
                }
            }));
            // Fire onLineData when disposing object to flush last line
            this._register((0, lifecycle_1.toDisposable)(() => {
                const buffer = xterm.buffer;
                this._sendLineData(buffer.active, buffer.active.baseY + buffer.active.cursorY);
            }));
        }
        setOperatingSystem(os) {
            if (this._isOsSet || !this._xterm) {
                return;
            }
            this._isOsSet = true;
            // Force line data to be sent when the cursor is moved, the main purpose for
            // this is because ConPTY will often not do a line feed but instead move the
            // cursor, in which case we still want to send the current line's data to tasks.
            if (os === 1 /* OperatingSystem.Windows */) {
                const xterm = this._xterm;
                this._register(xterm.parser.registerCsiHandler({ final: 'H' }, () => {
                    const buffer = xterm.buffer;
                    this._sendLineData(buffer.active, buffer.active.baseY + buffer.active.cursorY);
                    return false;
                }));
            }
        }
        _sendLineData(buffer, lineIndex) {
            let line = buffer.getLine(lineIndex);
            if (!line) {
                return;
            }
            let lineData = line.translateToString(true);
            while (lineIndex > 0 && line.isWrapped) {
                line = buffer.getLine(--lineIndex);
                if (!line) {
                    break;
                }
                lineData = line.translateToString(false) + lineData;
            }
            this._onLineData.fire(lineData);
        }
    }
    exports.LineDataEventAddon = LineDataEventAddon;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGluZURhdGFFdmVudEFkZG9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVybWluYWwvYnJvd3Nlci94dGVybS9saW5lRGF0YUV2ZW50QWRkb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBT2hHOztPQUVHO0lBQ0gsTUFBYSxrQkFBbUIsU0FBUSxzQkFBVTtRQVFqRCxZQUE2QixzQkFBc0M7WUFDbEUsS0FBSyxFQUFFLENBQUM7WUFEb0IsMkJBQXNCLEdBQXRCLHNCQUFzQixDQUFnQjtZQUwzRCxhQUFRLEdBQUcsS0FBSyxDQUFDO1lBRVIsZ0JBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFVLENBQUMsQ0FBQztZQUM1RCxlQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUM7UUFJN0MsQ0FBQztRQUVELEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBb0I7WUFDbEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7WUFFcEIsa0ZBQWtGO1lBQ2xGLE1BQU0sSUFBSSxDQUFDLHNCQUFzQixDQUFDO1lBRWxDLDZFQUE2RTtZQUM3RSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFO2dCQUNwQyxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO2dCQUM1QixNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUNuRixJQUFJLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUU7b0JBQ2xDLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQztpQkFDbkY7WUFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosMkRBQTJEO1lBQzNELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBQSx3QkFBWSxFQUFDLEdBQUcsRUFBRTtnQkFDaEMsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztnQkFDNUIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDaEYsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFRCxrQkFBa0IsQ0FBQyxFQUFtQjtZQUNyQyxJQUFJLElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNsQyxPQUFPO2FBQ1A7WUFDRCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztZQUVyQiw0RUFBNEU7WUFDNUUsNEVBQTRFO1lBQzVFLGdGQUFnRjtZQUNoRixJQUFJLEVBQUUsb0NBQTRCLEVBQUU7Z0JBQ25DLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7Z0JBQzFCLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUU7b0JBQ25FLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7b0JBQzVCLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUMvRSxPQUFPLEtBQUssQ0FBQztnQkFDZCxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ0o7UUFDRixDQUFDO1FBRU8sYUFBYSxDQUFDLE1BQWUsRUFBRSxTQUFpQjtZQUN2RCxJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3JDLElBQUksQ0FBQyxJQUFJLEVBQUU7Z0JBQ1YsT0FBTzthQUNQO1lBQ0QsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzVDLE9BQU8sU0FBUyxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUN2QyxJQUFJLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO2dCQUNuQyxJQUFJLENBQUMsSUFBSSxFQUFFO29CQUNWLE1BQU07aUJBQ047Z0JBQ0QsUUFBUSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsR0FBRyxRQUFRLENBQUM7YUFDcEQ7WUFDRCxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNqQyxDQUFDO0tBQ0Q7SUFwRUQsZ0RBb0VDIn0=