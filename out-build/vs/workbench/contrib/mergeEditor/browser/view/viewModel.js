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
define(["require", "exports", "vs/base/common/arraysFind", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/editor/common/core/range", "vs/nls!vs/workbench/contrib/mergeEditor/browser/view/viewModel", "vs/platform/configuration/common/configuration", "vs/platform/notification/common/notification", "vs/workbench/contrib/mergeEditor/browser/model/lineRange", "vs/workbench/contrib/mergeEditor/browser/utils"], function (require, exports, arraysFind_1, lifecycle_1, observable_1, range_1, nls_1, configuration_1, notification_1, lineRange_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$bkb = void 0;
    let $bkb = class $bkb extends lifecycle_1.$kc {
        constructor(model, inputCodeEditorView1, inputCodeEditorView2, resultCodeEditorView, baseCodeEditorView, showNonConflictingChanges, c, f) {
            super();
            this.model = model;
            this.inputCodeEditorView1 = inputCodeEditorView1;
            this.inputCodeEditorView2 = inputCodeEditorView2;
            this.resultCodeEditorView = resultCodeEditorView;
            this.baseCodeEditorView = baseCodeEditorView;
            this.showNonConflictingChanges = showNonConflictingChanges;
            this.c = c;
            this.f = f;
            this.a = (0, observable_1.observableValue)(this, { range: undefined, counter: 0 });
            this.b = this.B(new AttachedHistory(this.model.resultTextModel));
            this.shouldUseAppendInsteadOfAccept = (0, utils_1.$fjb)('mergeEditor.shouldUseAppendInsteadOfAccept', false, this.c);
            this.g = 0;
            this.h = (0, observable_1.derivedObservableWithWritableCache)(this, (reader, lastValue) => {
                const editors = [
                    this.inputCodeEditorView1,
                    this.inputCodeEditorView2,
                    this.resultCodeEditorView,
                    this.baseCodeEditorView.read(reader),
                ];
                const view = editors.find((e) => e && e.isFocused.read(reader));
                return view ? { view, counter: this.g++ } : lastValue || { view: undefined, counter: this.g++ };
            });
            this.baseShowDiffAgainst = (0, observable_1.derived)(this, reader => {
                const lastFocusedEditor = this.h.read(reader);
                if (lastFocusedEditor.view === this.inputCodeEditorView1) {
                    return 1;
                }
                else if (lastFocusedEditor.view === this.inputCodeEditorView2) {
                    return 2;
                }
                return undefined;
            });
            this.selectionInBase = (0, observable_1.derived)(this, reader => {
                const sourceEditor = this.h.read(reader).view;
                if (!sourceEditor) {
                    return undefined;
                }
                const selections = sourceEditor.selection.read(reader) || [];
                const rangesInBase = selections.map((selection) => {
                    if (sourceEditor === this.inputCodeEditorView1) {
                        return this.model.translateInputRangeToBase(1, selection);
                    }
                    else if (sourceEditor === this.inputCodeEditorView2) {
                        return this.model.translateInputRangeToBase(2, selection);
                    }
                    else if (sourceEditor === this.resultCodeEditorView) {
                        return this.model.translateResultRangeToBase(selection);
                    }
                    else if (sourceEditor === this.baseCodeEditorView.read(reader)) {
                        return selection;
                    }
                    else {
                        return selection;
                    }
                });
                return {
                    rangesInBase,
                    sourceEditor
                };
            });
            this.activeModifiedBaseRange = (0, observable_1.derived)(this, (reader) => {
                /** @description activeModifiedBaseRange */
                const focusedEditor = this.h.read(reader);
                const manualRange = this.a.read(reader);
                if (manualRange.counter > focusedEditor.counter) {
                    return manualRange.range;
                }
                if (!focusedEditor.view) {
                    return;
                }
                const cursorLineNumber = focusedEditor.view.cursorLineNumber.read(reader);
                if (!cursorLineNumber) {
                    return undefined;
                }
                const modifiedBaseRanges = this.model.modifiedBaseRanges.read(reader);
                return modifiedBaseRanges.find((r) => {
                    const range = this.j(focusedEditor.view, r, reader);
                    return range.isEmpty
                        ? range.startLineNumber === cursorLineNumber
                        : range.contains(cursorLineNumber);
                });
            });
            this.B(resultCodeEditorView.editor.onDidChangeModelContent(e => {
                if (this.model.isApplyingEditInResult || e.isRedoing || e.isUndoing) {
                    return;
                }
                const baseRangeStates = [];
                for (const change of e.changes) {
                    const rangeInBase = this.model.translateResultRangeToBase(range_1.$ks.lift(change.range));
                    const baseRanges = this.model.findModifiedBaseRangesInRange(new lineRange_1.$6ib(rangeInBase.startLineNumber, rangeInBase.endLineNumber - rangeInBase.startLineNumber));
                    if (baseRanges.length === 1) {
                        const isHandled = this.model.isHandled(baseRanges[0]).get();
                        if (!isHandled) {
                            baseRangeStates.push(baseRanges[0]);
                        }
                    }
                }
                if (baseRangeStates.length === 0) {
                    return;
                }
                const element = {
                    model: this.model,
                    redo() {
                        (0, observable_1.transaction)(tx => {
                            /** @description Mark conflicts touched by manual edits as handled */
                            for (const r of baseRangeStates) {
                                this.model.setHandled(r, true, tx);
                            }
                        });
                    },
                    undo() {
                        (0, observable_1.transaction)(tx => {
                            /** @description Mark conflicts touched by manual edits as handled */
                            for (const r of baseRangeStates) {
                                this.model.setHandled(r, false, tx);
                            }
                        });
                    },
                };
                this.b.pushAttachedHistoryElement(element);
                element.redo();
            }));
        }
        j(editor, modifiedBaseRange, reader) {
            if (editor === this.resultCodeEditorView) {
                return this.model.getLineRangeInResult(modifiedBaseRange.baseRange, reader);
            }
            else if (editor === this.baseCodeEditorView.get()) {
                return modifiedBaseRange.baseRange;
            }
            else {
                const input = editor === this.inputCodeEditorView1 ? 1 : 2;
                return modifiedBaseRange.getInputRange(input);
            }
        }
        setActiveModifiedBaseRange(range, tx) {
            this.a.set({ range, counter: this.g++ }, tx);
        }
        setState(baseRange, state, tx, inputNumber) {
            this.a.set({ range: baseRange, counter: this.g++ }, tx);
            this.model.setState(baseRange, state, inputNumber, tx);
        }
        n(getModifiedBaseRange) {
            let editor = this.h.get().view;
            if (!editor) {
                editor = this.resultCodeEditorView;
            }
            const curLineNumber = editor.editor.getPosition()?.lineNumber;
            if (curLineNumber === undefined) {
                return;
            }
            const modifiedBaseRange = getModifiedBaseRange(editor, curLineNumber);
            if (modifiedBaseRange) {
                const range = this.j(editor, modifiedBaseRange, undefined);
                editor.editor.focus();
                let startLineNumber = range.startLineNumber;
                let endLineNumberExclusive = range.endLineNumberExclusive;
                if (range.startLineNumber > editor.editor.getModel().getLineCount()) {
                    (0, observable_1.transaction)(tx => {
                        this.setActiveModifiedBaseRange(modifiedBaseRange, tx);
                    });
                    startLineNumber = endLineNumberExclusive = editor.editor.getModel().getLineCount();
                }
                editor.editor.setPosition({
                    lineNumber: startLineNumber,
                    column: editor.editor.getModel().getLineFirstNonWhitespaceColumn(startLineNumber),
                });
                editor.editor.revealLinesNearTop(startLineNumber, endLineNumberExclusive, 0 /* ScrollType.Smooth */);
            }
        }
        goToNextModifiedBaseRange(predicate) {
            this.n((e, l) => this.model.modifiedBaseRanges
                .get()
                .find((r) => predicate(r) &&
                this.j(e, r, undefined).startLineNumber > l) ||
                this.model.modifiedBaseRanges
                    .get()
                    .find((r) => predicate(r)));
        }
        goToPreviousModifiedBaseRange(predicate) {
            this.n((e, l) => (0, arraysFind_1.$db)(this.model.modifiedBaseRanges.get(), (r) => predicate(r) &&
                this.j(e, r, undefined).endLineNumberExclusive < l) ||
                (0, arraysFind_1.$db)(this.model.modifiedBaseRanges.get(), (r) => predicate(r)));
        }
        toggleActiveConflict(inputNumber) {
            const activeModifiedBaseRange = this.activeModifiedBaseRange.get();
            if (!activeModifiedBaseRange) {
                this.f.error((0, nls_1.localize)(0, null));
                return;
            }
            (0, observable_1.transaction)(tx => {
                /** @description Toggle Active Conflict */
                this.setState(activeModifiedBaseRange, this.model.getState(activeModifiedBaseRange).get().toggle(inputNumber), tx, inputNumber);
            });
        }
        acceptAll(inputNumber) {
            (0, observable_1.transaction)(tx => {
                /** @description Toggle Active Conflict */
                for (const range of this.model.modifiedBaseRanges.get()) {
                    this.setState(range, this.model.getState(range).get().withInputValue(inputNumber, true), tx, inputNumber);
                }
            });
        }
    };
    exports.$bkb = $bkb;
    exports.$bkb = $bkb = __decorate([
        __param(6, configuration_1.$8h),
        __param(7, notification_1.$Yu)
    ], $bkb);
    class AttachedHistory extends lifecycle_1.$kc {
        constructor(c) {
            super();
            this.c = c;
            this.a = [];
            this.b = this.c.getAlternativeVersionId();
            this.B(c.onDidChangeContent((e) => {
                const currentAltId = c.getAlternativeVersionId();
                if (e.isRedoing) {
                    for (const item of this.a) {
                        if (this.b < item.altId && item.altId <= currentAltId) {
                            item.element.redo();
                        }
                    }
                }
                else if (e.isUndoing) {
                    for (let i = this.a.length - 1; i >= 0; i--) {
                        const item = this.a[i];
                        if (currentAltId < item.altId && item.altId <= this.b) {
                            item.element.undo();
                        }
                    }
                }
                else {
                    // The user destroyed the redo stack by performing a non redo/undo operation.
                    // Thus we also need to remove all history elements after the last version id.
                    while (this.a.length > 0
                        && this.a[this.a.length - 1].altId > this.b) {
                        this.a.pop();
                    }
                }
                this.b = currentAltId;
            }));
        }
        /**
         * Pushes an history item that is tied to the last text edit (or an extension of it).
         * When the last text edit is undone/redone, so is is this history item.
         */
        pushAttachedHistoryElement(element) {
            this.a.push({ altId: this.c.getAlternativeVersionId(), element });
        }
    }
});
//# sourceMappingURL=viewModel.js.map