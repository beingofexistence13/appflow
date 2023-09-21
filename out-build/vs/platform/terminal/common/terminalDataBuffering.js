/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Skb = void 0;
    class $Skb {
        constructor(b) {
            this.b = b;
            this.a = new Map();
        }
        dispose() {
            for (const buffer of this.a.values()) {
                buffer.dispose();
            }
        }
        startBuffering(id, event, throttleBy = 5) {
            const disposable = event((e) => {
                const data = (typeof e === 'string' ? e : e.data);
                let buffer = this.a.get(id);
                if (buffer) {
                    buffer.data.push(data);
                    return;
                }
                const timeoutId = setTimeout(() => this.flushBuffer(id), throttleBy);
                buffer = {
                    data: [data],
                    timeoutId: timeoutId,
                    dispose: () => {
                        clearTimeout(timeoutId);
                        this.flushBuffer(id);
                        disposable.dispose();
                    }
                };
                this.a.set(id, buffer);
            });
            return disposable;
        }
        stopBuffering(id) {
            const buffer = this.a.get(id);
            buffer?.dispose();
        }
        flushBuffer(id) {
            const buffer = this.a.get(id);
            if (buffer) {
                this.a.delete(id);
                this.b(id, buffer.data.join(''));
            }
        }
    }
    exports.$Skb = $Skb;
});
//# sourceMappingURL=terminalDataBuffering.js.map