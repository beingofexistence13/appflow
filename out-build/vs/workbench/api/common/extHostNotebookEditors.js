/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/errors", "vs/base/common/event", "vs/platform/log/common/log", "vs/workbench/api/common/extHostTypeConverters"], function (require, exports, errors_1, event_1, log_1, typeConverters) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Wcc = void 0;
    let $Wcc = class $Wcc {
        constructor(c, d) {
            this.c = c;
            this.d = d;
            this.a = new event_1.$fd({ onListenerError: errors_1.$Z });
            this.b = new event_1.$fd({ onListenerError: errors_1.$Z });
            this.onDidChangeNotebookEditorSelection = this.a.event;
            this.onDidChangeNotebookEditorVisibleRanges = this.b.event;
        }
        $acceptEditorPropertiesChanged(id, data) {
            this.c.debug('ExtHostNotebook#$acceptEditorPropertiesChanged', id, data);
            const editor = this.d.getEditorById(id);
            // ONE: make all state updates
            if (data.visibleRanges) {
                editor._acceptVisibleRanges(data.visibleRanges.ranges.map(typeConverters.NotebookRange.to));
            }
            if (data.selections) {
                editor._acceptSelections(data.selections.selections.map(typeConverters.NotebookRange.to));
            }
            // TWO: send all events after states have been updated
            if (data.visibleRanges) {
                this.b.fire({
                    notebookEditor: editor.apiEditor,
                    visibleRanges: editor.apiEditor.visibleRanges
                });
            }
            if (data.selections) {
                this.a.fire(Object.freeze({
                    notebookEditor: editor.apiEditor,
                    selections: editor.apiEditor.selections
                }));
            }
        }
        $acceptEditorViewColumns(data) {
            for (const id in data) {
                const editor = this.d.getEditorById(id);
                editor._acceptViewColumn(typeConverters.ViewColumn.to(data[id]));
            }
        }
    };
    exports.$Wcc = $Wcc;
    exports.$Wcc = $Wcc = __decorate([
        __param(0, log_1.$5i)
    ], $Wcc);
});
//# sourceMappingURL=extHostNotebookEditors.js.map