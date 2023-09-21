/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/extHostTypes"], function (require, exports, errors_1, extHostConverter, extHostTypes) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Ecc = void 0;
    class $Ecc {
        static { this.apiEditorsToExtHost = new WeakMap(); }
        constructor(id, f, notebookData, visibleRanges, selections, viewColumn) {
            this.id = id;
            this.f = f;
            this.notebookData = notebookData;
            this.a = [];
            this.b = [];
            this.d = false;
            this.a = selections;
            this.b = visibleRanges;
            this.c = viewColumn;
        }
        get apiEditor() {
            if (!this.e) {
                const that = this;
                this.e = {
                    get notebook() {
                        return that.notebookData.apiNotebook;
                    },
                    get selection() {
                        return that.a[0];
                    },
                    set selection(selection) {
                        this.selections = [selection];
                    },
                    get selections() {
                        return that.a;
                    },
                    set selections(value) {
                        if (!Array.isArray(value) || !value.every(extHostTypes.$nL.isNotebookRange)) {
                            throw (0, errors_1.$5)('selections');
                        }
                        that.a = value;
                        that.g(value);
                    },
                    get visibleRanges() {
                        return that.b;
                    },
                    revealRange(range, revealType) {
                        that.f.$tryRevealRange(that.id, extHostConverter.NotebookRange.from(range), revealType ?? extHostTypes.NotebookEditorRevealType.Default);
                    },
                    get viewColumn() {
                        return that.c;
                    },
                };
                $Ecc.apiEditorsToExtHost.set(this.e, this);
            }
            return this.e;
        }
        get visible() {
            return this.d;
        }
        _acceptVisibility(value) {
            this.d = value;
        }
        _acceptVisibleRanges(value) {
            this.b = value;
        }
        _acceptSelections(selections) {
            this.a = selections;
        }
        g(value) {
            this.f.$trySetSelections(this.id, value.map(extHostConverter.NotebookRange.from));
        }
        _acceptViewColumn(value) {
            this.c = value;
        }
    }
    exports.$Ecc = $Ecc;
});
//# sourceMappingURL=extHostNotebookEditor.js.map