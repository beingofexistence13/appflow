/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PartialCommandDetectionCapability = void 0;
    var Constants;
    (function (Constants) {
        /**
         * The minimum size of the prompt in which to assume the line is a command.
         */
        Constants[Constants["MinimumPromptLength"] = 2] = "MinimumPromptLength";
    })(Constants || (Constants = {}));
    /**
     * This capability guesses where commands are based on where the cursor was when enter was pressed.
     * It's very hit or miss but it's often correct and better than nothing.
     */
    class PartialCommandDetectionCapability extends lifecycle_1.DisposableStore {
        get commands() { return this._commands; }
        constructor(_terminal) {
            super();
            this._terminal = _terminal;
            this.type = 3 /* TerminalCapability.PartialCommandDetection */;
            this._commands = [];
            this._onCommandFinished = this.add(new event_1.Emitter());
            this.onCommandFinished = this._onCommandFinished.event;
            this.add(this._terminal.onData(e => this._onData(e)));
            this.add(this._terminal.parser.registerCsiHandler({ final: 'J' }, params => {
                if (params.length >= 1 && (params[0] === 2 || params[0] === 3)) {
                    this._clearCommandsInViewport();
                }
                // We don't want to override xterm.js' default behavior, just augment it
                return false;
            }));
        }
        _onData(data) {
            if (data === '\x0d') {
                this._onEnter();
            }
        }
        _onEnter() {
            if (!this._terminal) {
                return;
            }
            if (this._terminal.buffer.active.cursorX >= 2 /* Constants.MinimumPromptLength */) {
                const marker = this._terminal.registerMarker(0);
                if (marker) {
                    this._commands.push(marker);
                    this._onCommandFinished.fire(marker);
                }
            }
        }
        _clearCommandsInViewport() {
            // Find the number of commands on the tail end of the array that are within the viewport
            let count = 0;
            for (let i = this._commands.length - 1; i >= 0; i--) {
                if (this._commands[i].line < this._terminal.buffer.active.baseY) {
                    break;
                }
                count++;
            }
            // Remove them
            this._commands.splice(this._commands.length - count, count);
        }
    }
    exports.PartialCommandDetectionCapability = PartialCommandDetectionCapability;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFydGlhbENvbW1hbmREZXRlY3Rpb25DYXBhYmlsaXR5LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vdGVybWluYWwvY29tbW9uL2NhcGFiaWxpdGllcy9wYXJ0aWFsQ29tbWFuZERldGVjdGlvbkNhcGFiaWxpdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBU2hHLElBQVcsU0FLVjtJQUxELFdBQVcsU0FBUztRQUNuQjs7V0FFRztRQUNILHVFQUF1QixDQUFBO0lBQ3hCLENBQUMsRUFMVSxTQUFTLEtBQVQsU0FBUyxRQUtuQjtJQUVEOzs7T0FHRztJQUNILE1BQWEsaUNBQWtDLFNBQVEsMkJBQWU7UUFLckUsSUFBSSxRQUFRLEtBQXlCLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFLN0QsWUFDa0IsU0FBbUI7WUFFcEMsS0FBSyxFQUFFLENBQUM7WUFGUyxjQUFTLEdBQVQsU0FBUyxDQUFVO1lBVjVCLFNBQUksc0RBQThDO1lBRTFDLGNBQVMsR0FBYyxFQUFFLENBQUM7WUFJMUIsdUJBQWtCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLGVBQU8sRUFBVyxDQUFDLENBQUM7WUFDOUQsc0JBQWlCLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQztZQU0xRCxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsRUFBRSxNQUFNLENBQUMsRUFBRTtnQkFDMUUsSUFBSSxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO29CQUMvRCxJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztpQkFDaEM7Z0JBQ0Qsd0VBQXdFO2dCQUN4RSxPQUFPLEtBQUssQ0FBQztZQUNkLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRU8sT0FBTyxDQUFDLElBQVk7WUFDM0IsSUFBSSxJQUFJLEtBQUssTUFBTSxFQUFFO2dCQUNwQixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7YUFDaEI7UUFDRixDQUFDO1FBRU8sUUFBUTtZQUNmLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUNwQixPQUFPO2FBQ1A7WUFDRCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLHlDQUFpQyxFQUFFO2dCQUMxRSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDaEQsSUFBSSxNQUFNLEVBQUU7b0JBQ1gsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQzVCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7aUJBQ3JDO2FBQ0Q7UUFDRixDQUFDO1FBRU8sd0JBQXdCO1lBQy9CLHdGQUF3RjtZQUN4RixJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7WUFDZCxLQUFLLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNwRCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUU7b0JBQ2hFLE1BQU07aUJBQ047Z0JBQ0QsS0FBSyxFQUFFLENBQUM7YUFDUjtZQUNELGNBQWM7WUFDZCxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDN0QsQ0FBQztLQUNEO0lBdkRELDhFQXVEQyJ9