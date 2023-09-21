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
define(["require", "exports", "vs/base/common/arraysFind", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/editor/common/core/range", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/notification/common/notification", "vs/workbench/contrib/mergeEditor/browser/model/lineRange", "vs/workbench/contrib/mergeEditor/browser/utils"], function (require, exports, arraysFind_1, lifecycle_1, observable_1, range_1, nls_1, configuration_1, notification_1, lineRange_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MergeEditorViewModel = void 0;
    let MergeEditorViewModel = class MergeEditorViewModel extends lifecycle_1.Disposable {
        constructor(model, inputCodeEditorView1, inputCodeEditorView2, resultCodeEditorView, baseCodeEditorView, showNonConflictingChanges, configurationService, notificationService) {
            super();
            this.model = model;
            this.inputCodeEditorView1 = inputCodeEditorView1;
            this.inputCodeEditorView2 = inputCodeEditorView2;
            this.resultCodeEditorView = resultCodeEditorView;
            this.baseCodeEditorView = baseCodeEditorView;
            this.showNonConflictingChanges = showNonConflictingChanges;
            this.configurationService = configurationService;
            this.notificationService = notificationService;
            this.manuallySetActiveModifiedBaseRange = (0, observable_1.observableValue)(this, { range: undefined, counter: 0 });
            this.attachedHistory = this._register(new AttachedHistory(this.model.resultTextModel));
            this.shouldUseAppendInsteadOfAccept = (0, utils_1.observableConfigValue)('mergeEditor.shouldUseAppendInsteadOfAccept', false, this.configurationService);
            this.counter = 0;
            this.lastFocusedEditor = (0, observable_1.derivedObservableWithWritableCache)(this, (reader, lastValue) => {
                const editors = [
                    this.inputCodeEditorView1,
                    this.inputCodeEditorView2,
                    this.resultCodeEditorView,
                    this.baseCodeEditorView.read(reader),
                ];
                const view = editors.find((e) => e && e.isFocused.read(reader));
                return view ? { view, counter: this.counter++ } : lastValue || { view: undefined, counter: this.counter++ };
            });
            this.baseShowDiffAgainst = (0, observable_1.derived)(this, reader => {
                const lastFocusedEditor = this.lastFocusedEditor.read(reader);
                if (lastFocusedEditor.view === this.inputCodeEditorView1) {
                    return 1;
                }
                else if (lastFocusedEditor.view === this.inputCodeEditorView2) {
                    return 2;
                }
                return undefined;
            });
            this.selectionInBase = (0, observable_1.derived)(this, reader => {
                const sourceEditor = this.lastFocusedEditor.read(reader).view;
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
                const focusedEditor = this.lastFocusedEditor.read(reader);
                const manualRange = this.manuallySetActiveModifiedBaseRange.read(reader);
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
                    const range = this.getRangeOfModifiedBaseRange(focusedEditor.view, r, reader);
                    return range.isEmpty
                        ? range.startLineNumber === cursorLineNumber
                        : range.contains(cursorLineNumber);
                });
            });
            this._register(resultCodeEditorView.editor.onDidChangeModelContent(e => {
                if (this.model.isApplyingEditInResult || e.isRedoing || e.isUndoing) {
                    return;
                }
                const baseRangeStates = [];
                for (const change of e.changes) {
                    const rangeInBase = this.model.translateResultRangeToBase(range_1.Range.lift(change.range));
                    const baseRanges = this.model.findModifiedBaseRangesInRange(new lineRange_1.LineRange(rangeInBase.startLineNumber, rangeInBase.endLineNumber - rangeInBase.startLineNumber));
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
                this.attachedHistory.pushAttachedHistoryElement(element);
                element.redo();
            }));
        }
        getRangeOfModifiedBaseRange(editor, modifiedBaseRange, reader) {
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
            this.manuallySetActiveModifiedBaseRange.set({ range, counter: this.counter++ }, tx);
        }
        setState(baseRange, state, tx, inputNumber) {
            this.manuallySetActiveModifiedBaseRange.set({ range: baseRange, counter: this.counter++ }, tx);
            this.model.setState(baseRange, state, inputNumber, tx);
        }
        goToConflict(getModifiedBaseRange) {
            let editor = this.lastFocusedEditor.get().view;
            if (!editor) {
                editor = this.resultCodeEditorView;
            }
            const curLineNumber = editor.editor.getPosition()?.lineNumber;
            if (curLineNumber === undefined) {
                return;
            }
            const modifiedBaseRange = getModifiedBaseRange(editor, curLineNumber);
            if (modifiedBaseRange) {
                const range = this.getRangeOfModifiedBaseRange(editor, modifiedBaseRange, undefined);
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
            this.goToConflict((e, l) => this.model.modifiedBaseRanges
                .get()
                .find((r) => predicate(r) &&
                this.getRangeOfModifiedBaseRange(e, r, undefined).startLineNumber > l) ||
                this.model.modifiedBaseRanges
                    .get()
                    .find((r) => predicate(r)));
        }
        goToPreviousModifiedBaseRange(predicate) {
            this.goToConflict((e, l) => (0, arraysFind_1.findLast)(this.model.modifiedBaseRanges.get(), (r) => predicate(r) &&
                this.getRangeOfModifiedBaseRange(e, r, undefined).endLineNumberExclusive < l) ||
                (0, arraysFind_1.findLast)(this.model.modifiedBaseRanges.get(), (r) => predicate(r)));
        }
        toggleActiveConflict(inputNumber) {
            const activeModifiedBaseRange = this.activeModifiedBaseRange.get();
            if (!activeModifiedBaseRange) {
                this.notificationService.error((0, nls_1.localize)('noConflictMessage', "There is currently no conflict focused that can be toggled."));
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
    exports.MergeEditorViewModel = MergeEditorViewModel;
    exports.MergeEditorViewModel = MergeEditorViewModel = __decorate([
        __param(6, configuration_1.IConfigurationService),
        __param(7, notification_1.INotificationService)
    ], MergeEditorViewModel);
    class AttachedHistory extends lifecycle_1.Disposable {
        constructor(model) {
            super();
            this.model = model;
            this.attachedHistory = [];
            this.previousAltId = this.model.getAlternativeVersionId();
            this._register(model.onDidChangeContent((e) => {
                const currentAltId = model.getAlternativeVersionId();
                if (e.isRedoing) {
                    for (const item of this.attachedHistory) {
                        if (this.previousAltId < item.altId && item.altId <= currentAltId) {
                            item.element.redo();
                        }
                    }
                }
                else if (e.isUndoing) {
                    for (let i = this.attachedHistory.length - 1; i >= 0; i--) {
                        const item = this.attachedHistory[i];
                        if (currentAltId < item.altId && item.altId <= this.previousAltId) {
                            item.element.undo();
                        }
                    }
                }
                else {
                    // The user destroyed the redo stack by performing a non redo/undo operation.
                    // Thus we also need to remove all history elements after the last version id.
                    while (this.attachedHistory.length > 0
                        && this.attachedHistory[this.attachedHistory.length - 1].altId > this.previousAltId) {
                        this.attachedHistory.pop();
                    }
                }
                this.previousAltId = currentAltId;
            }));
        }
        /**
         * Pushes an history item that is tied to the last text edit (or an extension of it).
         * When the last text edit is undone/redone, so is is this history item.
         */
        pushAttachedHistoryElement(element) {
            this.attachedHistory.push({ altId: this.model.getAlternativeVersionId(), element });
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld01vZGVsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbWVyZ2VFZGl0b3IvYnJvd3Nlci92aWV3L3ZpZXdNb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFvQnpGLElBQU0sb0JBQW9CLEdBQTFCLE1BQU0sb0JBQXFCLFNBQVEsc0JBQVU7UUFPbkQsWUFDaUIsS0FBdUIsRUFDdkIsb0JBQXlDLEVBQ3pDLG9CQUF5QyxFQUN6QyxvQkFBMEMsRUFDMUMsa0JBQStELEVBQy9ELHlCQUErQyxFQUN4QyxvQkFBNEQsRUFDN0QsbUJBQTBEO1lBRWhGLEtBQUssRUFBRSxDQUFDO1lBVFEsVUFBSyxHQUFMLEtBQUssQ0FBa0I7WUFDdkIseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFxQjtZQUN6Qyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXFCO1lBQ3pDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBc0I7WUFDMUMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUE2QztZQUMvRCw4QkFBeUIsR0FBekIseUJBQXlCLENBQXNCO1lBQ3ZCLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDNUMsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFzQjtZQWRoRSx1Q0FBa0MsR0FBRyxJQUFBLDRCQUFlLEVBRW5FLElBQUksRUFBRSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7WUFFekIsb0JBQWUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBZSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztZQTREbkYsbUNBQThCLEdBQUcsSUFBQSw2QkFBcUIsRUFDckUsNENBQTRDLEVBQzVDLEtBQUssRUFDTCxJQUFJLENBQUMsb0JBQW9C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