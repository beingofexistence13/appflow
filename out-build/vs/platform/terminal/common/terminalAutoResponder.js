/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/lifecycle", "vs/base/common/platform"], function (require, exports, async_1, lifecycle_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$M$b = void 0;
    /**
     * Tracks a terminal process's data stream and responds immediately when a matching string is
     * received. This is done in a low overhead way and is ideally run on the same process as the
     * where the process is handled to minimize latency.
     */
    class $M$b extends lifecycle_1.$kc {
        constructor(proc, matchWord, response, logService) {
            super();
            this.a = 0;
            this.b = false;
            /**
             * Each reply is throttled by a second to avoid resource starvation and responding to screen
             * reprints on Winodws.
             */
            this.c = false;
            this.B(proc.onProcessData(e => {
                if (this.b || this.c) {
                    return;
                }
                const data = typeof e === 'string' ? e : e.data;
                for (let i = 0; i < data.length; i++) {
                    if (data[i] === matchWord[this.a]) {
                        this.a++;
                    }
                    else {
                        this.f();
                    }
                    // Auto reply and reset
                    if (this.a === matchWord.length) {
                        logService.debug(`Auto reply match: "${matchWord}", response: "${response}"`);
                        proc.input(response);
                        this.c = true;
                        (0, async_1.$Hg)(1000).then(() => this.c = false);
                        this.f();
                    }
                }
            }));
        }
        f() {
            this.a = 0;
        }
        /**
         * No auto response will happen after a resize on Windows in case the resize is a result of
         * reprinting the screen.
         */
        handleResize() {
            if (platform_1.$i) {
                this.b = true;
            }
        }
        handleInput() {
            this.b = false;
        }
    }
    exports.$M$b = $M$b;
});
//# sourceMappingURL=terminalAutoResponder.js.map