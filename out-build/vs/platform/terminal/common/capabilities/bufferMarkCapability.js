/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$iib = void 0;
    /**
     * Manages "marks" in the buffer which are lines that are tracked when lines are added to or removed
     * from the buffer.
     */
    class $iib extends lifecycle_1.$kc {
        constructor(f) {
            super();
            this.f = f;
            this.type = 4 /* TerminalCapability.BufferMarkDetection */;
            this.a = new Map();
            this.b = new Map();
            this.c = this.B(new event_1.$fd());
            this.onMarkAdded = this.c.event;
        }
        *markers() {
            for (const m of this.a.values()) {
                yield m;
            }
            for (const m of this.b.values()) {
                yield m;
            }
        }
        addMark(properties) {
            const marker = properties?.marker || this.f.registerMarker();
            const id = properties?.id;
            if (!marker) {
                return;
            }
            if (id) {
                this.a.set(id, marker);
                marker.onDispose(() => this.a.delete(id));
            }
            else {
                this.b.set(marker.id, marker);
                marker.onDispose(() => this.b.delete(marker.id));
            }
            this.c.fire({ marker, id, hidden: properties?.hidden, hoverMessage: properties?.hoverMessage });
        }
        getMark(id) {
            return this.a.get(id);
        }
    }
    exports.$iib = $iib;
});
//# sourceMappingURL=bufferMarkCapability.js.map