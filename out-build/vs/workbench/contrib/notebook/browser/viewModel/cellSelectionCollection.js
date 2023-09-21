/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$uob = void 0;
    function rangesEqual(a, b) {
        if (a.length !== b.length) {
            return false;
        }
        for (let i = 0; i < a.length; i++) {
            if (a[i].start !== b[i].start || a[i].end !== b[i].end) {
                return false;
            }
        }
        return true;
    }
    // Challenge is List View talks about `element`, which needs extra work to convert to ICellRange as we support Folding and Cell Move
    class $uob extends lifecycle_1.$kc {
        constructor() {
            super(...arguments);
            this.c = this.B(new event_1.$fd());
            this.f = null;
            this.g = [];
        }
        get onDidChangeSelection() { return this.c.event; }
        get selections() {
            return this.g;
        }
        get focus() {
            return this.f ?? { start: 0, end: 0 };
        }
        setState(primary, selections, forceEventEmit, source) {
            const changed = primary !== this.f || !rangesEqual(this.g, selections);
            this.f = primary;
            this.g = selections;
            if (changed || forceEventEmit) {
                this.c.fire(source);
            }
        }
        setSelections(selections, forceEventEmit, source) {
            this.setState(this.f, selections, forceEventEmit, source);
        }
    }
    exports.$uob = $uob;
});
//# sourceMappingURL=cellSelectionCollection.js.map