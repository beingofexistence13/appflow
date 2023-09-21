/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/lifecycle", "vs/base/common/platform"], function (require, exports, async_1, lifecycle_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalAutoResponder = void 0;
    /**
     * Tracks a terminal process's data stream and responds immediately when a matching string is
     * received. This is done in a low overhead way and is ideally run on the same process as the
     * where the process is handled to minimize latency.
     */
    class TerminalAutoResponder extends lifecycle_1.Disposable {
        constructor(proc, matchWord, response, logService) {
            super();
            this._pointer = 0;
            this._paused = false;
            /**
             * Each reply is throttled by a second to avoid resource starvation and responding to screen
             * reprints on Winodws.
             */
            this._throttled = false;
            this._register(proc.onProcessData(e => {
                if (this._paused || this._throttled) {
                    return;
                }
                const data = typeof e === 'string' ? e : e.data;
                for (let i = 0; i < data.length; i++) {
                    if (data[i] === matchWord[this._pointer]) {
                        this._pointer++;
                    }
                    else {
                        this._reset();
                    }
                    // Auto reply and reset
                    if (this._pointer === matchWord.length) {
                        logService.debug(`Auto reply match: "${matchWord}", response: "${response}"`);
                        proc.input(response);
                        this._throttled = true;
                        (0, async_1.timeout)(1000).then(() => this._throttled = false);
                        this._reset();
                    }
                }
            }));
        }
        _reset() {
            this._pointer = 0;
        }
        /**
         * No auto response will happen after a resize on Windows in case the resize is a result of
         * reprinting the screen.
         */
        handleResize() {
            if (platform_1.isWindows) {
                this._paused = true;
            }
        }
        handleInput() {
            this._paused = false;
        }
    }
    exports.TerminalAutoResponder = TerminalAutoResponder;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxBdXRvUmVzcG9uZGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vdGVybWluYWwvY29tbW9uL3Rlcm1pbmFsQXV0b1Jlc3BvbmRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFRaEc7Ozs7T0FJRztJQUNILE1BQWEscUJBQXNCLFNBQVEsc0JBQVU7UUFVcEQsWUFDQyxJQUEyQixFQUMzQixTQUFpQixFQUNqQixRQUFnQixFQUNoQixVQUF1QjtZQUV2QixLQUFLLEVBQUUsQ0FBQztZQWZELGFBQVEsR0FBRyxDQUFDLENBQUM7WUFDYixZQUFPLEdBQUcsS0FBSyxDQUFDO1lBRXhCOzs7ZUFHRztZQUNLLGVBQVUsR0FBRyxLQUFLLENBQUM7WUFVMUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUNyQyxJQUFJLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtvQkFDcEMsT0FBTztpQkFDUDtnQkFDRCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztnQkFDaEQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQ3JDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUU7d0JBQ3pDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztxQkFDaEI7eUJBQU07d0JBQ04sSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO3FCQUNkO29CQUNELHVCQUF1QjtvQkFDdkIsSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLFNBQVMsQ0FBQyxNQUFNLEVBQUU7d0JBQ3ZDLFVBQVUsQ0FBQyxLQUFLLENBQUMsc0JBQXNCLFNBQVMsaUJBQWlCLFFBQVEsR0FBRyxDQUFDLENBQUM7d0JBQzlFLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7d0JBQ3JCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO3dCQUN2QixJQUFBLGVBQU8sRUFBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUMsQ0FBQzt3QkFDbEQsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO3FCQUNkO2lCQUNEO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFTyxNQUFNO1lBQ2IsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFDbkIsQ0FBQztRQUVEOzs7V0FHRztRQUNILFlBQVk7WUFDWCxJQUFJLG9CQUFTLEVBQUU7Z0JBQ2QsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7YUFDcEI7UUFDRixDQUFDO1FBRUQsV0FBVztZQUNWLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1FBQ3RCLENBQUM7S0FDRDtJQTFERCxzREEwREMifQ==