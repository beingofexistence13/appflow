/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/workbench/contrib/notebook/browser/notebookViewEvents"], function (require, exports, event_1, lifecycle_1, notebookViewEvents_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Lnb = void 0;
    class $Lnb extends lifecycle_1.$kc {
        constructor() {
            super(...arguments);
            this.a = this.B(new event_1.$fd());
            this.onDidChangeLayout = this.a.event;
            this.b = this.B(new event_1.$fd());
            this.onDidChangeMetadata = this.b.event;
            this.c = this.B(new event_1.$fd());
            this.onDidChangeCellState = this.c.event;
        }
        emit(events) {
            for (let i = 0, len = events.length; i < len; i++) {
                const e = events[i];
                switch (e.type) {
                    case notebookViewEvents_1.NotebookViewEventType.LayoutChanged:
                        this.a.fire(e);
                        break;
                    case notebookViewEvents_1.NotebookViewEventType.MetadataChanged:
                        this.b.fire(e);
                        break;
                    case notebookViewEvents_1.NotebookViewEventType.CellStateChanged:
                        this.c.fire(e);
                        break;
                }
            }
        }
    }
    exports.$Lnb = $Lnb;
});
//# sourceMappingURL=eventDispatcher.js.map