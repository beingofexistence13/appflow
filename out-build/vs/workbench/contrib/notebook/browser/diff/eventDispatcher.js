/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$FEb = exports.$EEb = exports.$DEb = exports.NotebookDiffViewEventType = void 0;
    var NotebookDiffViewEventType;
    (function (NotebookDiffViewEventType) {
        NotebookDiffViewEventType[NotebookDiffViewEventType["LayoutChanged"] = 1] = "LayoutChanged";
        NotebookDiffViewEventType[NotebookDiffViewEventType["CellLayoutChanged"] = 2] = "CellLayoutChanged";
        // MetadataChanged = 2,
        // CellStateChanged = 3
    })(NotebookDiffViewEventType || (exports.NotebookDiffViewEventType = NotebookDiffViewEventType = {}));
    class $DEb {
        constructor(source, value) {
            this.source = source;
            this.value = value;
            this.type = NotebookDiffViewEventType.LayoutChanged;
        }
    }
    exports.$DEb = $DEb;
    class $EEb {
        constructor(source) {
            this.source = source;
            this.type = NotebookDiffViewEventType.CellLayoutChanged;
        }
    }
    exports.$EEb = $EEb;
    class $FEb extends lifecycle_1.$kc {
        constructor() {
            super(...arguments);
            this.a = this.B(new event_1.$fd());
            this.onDidChangeLayout = this.a.event;
            this.b = this.B(new event_1.$fd());
            this.onDidChangeCellLayout = this.b.event;
        }
        emit(events) {
            for (let i = 0, len = events.length; i < len; i++) {
                const e = events[i];
                switch (e.type) {
                    case NotebookDiffViewEventType.LayoutChanged:
                        this.a.fire(e);
                        break;
                    case NotebookDiffViewEventType.CellLayoutChanged:
                        this.b.fire(e);
                        break;
                }
            }
        }
    }
    exports.$FEb = $FEb;
});
//# sourceMappingURL=eventDispatcher.js.map