/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, errors_1, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$UN = void 0;
    class $UN extends lifecycle_1.$kc {
        constructor(c) {
            super();
            this.c = c;
            this.b = this.B(new event_1.$fd());
            this.onDidReceiveData = this.b.event;
            // Use BroadcastChannel
            if ('BroadcastChannel' in window) {
                try {
                    this.a = new BroadcastChannel(c);
                    const listener = (event) => {
                        this.b.fire(event.data);
                    };
                    this.a.addEventListener('message', listener);
                    this.B((0, lifecycle_1.$ic)(() => {
                        if (this.a) {
                            this.a.removeEventListener('message', listener);
                            this.a.close();
                        }
                    }));
                }
                catch (error) {
                    console.warn('Error while creating broadcast channel. Falling back to localStorage.', (0, errors_1.$8)(error));
                }
            }
            // BroadcastChannel is not supported. Use storage.
            if (!this.a) {
                this.c = `BroadcastDataChannel.${c}`;
                this.f();
            }
        }
        f() {
            const listener = (event) => {
                if (event.key === this.c && event.newValue) {
                    this.b.fire(JSON.parse(event.newValue));
                }
            };
            window.addEventListener('storage', listener);
            this.B((0, lifecycle_1.$ic)(() => window.removeEventListener('storage', listener)));
        }
        /**
         * Sends the data to other BroadcastChannel objects set up for this channel. Data can be structured objects, e.g. nested objects and arrays.
         * @param data data to broadcast
         */
        postData(data) {
            if (this.a) {
                this.a.postMessage(data);
            }
            else {
                // remove previous changes so that event is triggered even if new changes are same as old changes
                window.localStorage.removeItem(this.c);
                window.localStorage.setItem(this.c, JSON.stringify(data));
            }
        }
    }
    exports.$UN = $UN;
});
//# sourceMappingURL=broadcast.js.map