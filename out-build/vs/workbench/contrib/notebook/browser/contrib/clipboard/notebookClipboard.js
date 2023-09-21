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
define(["require", "exports", "vs/nls!vs/workbench/contrib/notebook/browser/contrib/clipboard/notebookClipboard", "vs/base/common/lifecycle", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/services/editor/common/editorService", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/editor/contrib/clipboard/browser/clipboard", "vs/platform/clipboard/common/clipboardService", "vs/workbench/contrib/notebook/common/model/notebookCellTextModel", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookService", "vs/base/common/platform", "vs/platform/actions/common/actions", "vs/workbench/contrib/notebook/browser/controller/coreActions", "vs/platform/contextkey/common/contextkey", "vs/platform/contextkey/common/contextkeys", "vs/editor/browser/editorExtensions", "vs/platform/action/common/actionCommonCategories", "vs/platform/log/common/log", "vs/platform/commands/common/commands", "vs/workbench/services/log/common/logConstants"], function (require, exports, nls_1, lifecycle_1, platform_1, contributions_1, editorService_1, notebookContextKeys_1, notebookBrowser_1, clipboard_1, clipboardService_1, notebookCellTextModel_1, notebookCommon_1, notebookService_1, platform, actions_1, coreActions_1, contextkey_1, contextkeys_1, editorExtensions_1, actionCommonCategories_1, log_1, commands_1, logConstants_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$iFb = exports.$hFb = exports.$gFb = exports.$fFb = void 0;
    let _logging = false;
    function toggleLogging() {
        _logging = !_logging;
    }
    function _log(loggerService, str) {
        if (_logging) {
            loggerService.info(`[NotebookClipboard]: ${str}`);
        }
    }
    function getFocusedWebviewDelegate(accessor) {
        const loggerService = accessor.get(log_1.$5i);
        const editorService = accessor.get(editorService_1.$9C);
        const editor = (0, notebookBrowser_1.$Zbb)(editorService.activeEditorPane);
        if (!editor) {
            _log(loggerService, '[Revive Webview] No notebook editor found for active editor pane, bypass');
            return;
        }
        if (!editor.hasEditorFocus()) {
            _log(loggerService, '[Revive Webview] Notebook editor is not focused, bypass');
            return;
        }
        if (!editor.hasWebviewFocus()) {
            _log(loggerService, '[Revive Webview] Notebook editor backlayer webview is not focused, bypass');
            return;
        }
        const webview = editor.getInnerWebview();
        _log(loggerService, '[Revive Webview] Notebook editor backlayer webview is focused');
        return webview;
    }
    function withWebview(accessor, f) {
        const webview = getFocusedWebviewDelegate(accessor);
        if (webview) {
            f(webview);
            return true;
        }
        return false;
    }
    const PRIORITY = 105;
    editorExtensions_1.$CV.addImplementation(PRIORITY, 'notebook-webview', accessor => {
        return withWebview(accessor, webview => webview.undo());
    });
    editorExtensions_1.$DV.addImplementation(PRIORITY, 'notebook-webview', accessor => {
        return withWebview(accessor, webview => webview.redo());
    });
    clipboard_1.$i1?.addImplementation(PRIORITY, 'notebook-webview', accessor => {
        return withWebview(accessor, webview => webview.copy());
    });
    clipboard_1.$j1?.addImplementation(PRIORITY, 'notebook-webview', accessor => {
        return withWebview(accessor, webview => webview.paste());
    });
    clipboard_1.$h1?.addImplementation(PRIORITY, 'notebook-webview', accessor => {
        return withWebview(accessor, webview => webview.cut());
    });
    function $fFb(editor, activeCell, pasteCells) {
        if (!editor.hasModel()) {
            return false;
        }
        const textModel = editor.textModel;
        if (editor.isReadOnly) {
            return false;
        }
        const originalState = {
            kind: notebookCommon_1.SelectionStateType.Index,
            focus: editor.getFocus(),
            selections: editor.getSelections()
        };
        if (activeCell) {
            const currCellIndex = editor.getCellIndex(activeCell);
            const newFocusIndex = typeof currCellIndex === 'number' ? currCellIndex + 1 : 0;
            textModel.applyEdits([
                {
                    editType: 1 /* CellEditType.Replace */,
                    index: newFocusIndex,
                    count: 0,
                    cells: pasteCells.items.map(cell => (0, notebookCellTextModel_1.$IH)(cell))
                }
            ], true, originalState, () => ({
                kind: notebookCommon_1.SelectionStateType.Index,
                focus: { start: newFocusIndex, end: newFocusIndex + 1 },
                selections: [{ start: newFocusIndex, end: newFocusIndex + pasteCells.items.length }]
            }), undefined, true);
        }
        else {
            if (editor.getLength() !== 0) {
                return false;
            }
            textModel.applyEdits([
                {
                    editType: 1 /* CellEditType.Replace */,
                    index: 0,
                    count: 0,
                    cells: pasteCells.items.map(cell => (0, notebookCellTextModel_1.$IH)(cell))
                }
            ], true, originalState, () => ({
                kind: notebookCommon_1.SelectionStateType.Index,
                focus: { start: 0, end: 1 },
                selections: [{ start: 1, end: pasteCells.items.length + 1 }]
            }), undefined, true);
        }
        return true;
    }
    exports.$fFb = $fFb;
    function $gFb(accessor, editor, targetCell) {
        if (!editor.hasModel()) {
            return false;
        }
        if (editor.hasOutputTextSelection()) {
            document.execCommand('copy');
            return true;
        }
        const clipboardService = accessor.get(clipboardService_1.$UZ);
        const notebookService = accessor.get(notebookService_1.$ubb);
        const selections = editor.getSelections();
        if (targetCell) {
            const targetCellIndex = editor.getCellIndex(targetCell);
            const containingSelection = selections.find(selection => selection.start <= targetCellIndex && targetCellIndex < selection.end);
            if (!containingSelection) {
                clipboardService.writeText(targetCell.getText());
                notebookService.setToCopy([targetCell.model], true);
                return true;
            }
        }
        const selectionRanges = (0, notebookBrowser_1.$1bb)(editor, editor.getSelections());
        const selectedCells = (0, notebookBrowser_1.$2bb)(editor, selectionRanges);
        if (!selectedCells.length) {
            return false;
        }
        clipboardService.writeText(selectedCells.map(cell => cell.getText()).join('\n'));
        notebookService.setToCopy(selectedCells.map(cell => cell.model), true);
        return true;
    }
    exports.$gFb = $gFb;
    function $hFb(accessor, editor, targetCell) {
        if (!editor.hasModel() || editor.isReadOnly) {
            return false;
        }
        const textModel = editor.textModel;
        const clipboardService = accessor.get(clipboardService_1.$UZ);
        const notebookService = accessor.get(notebookService_1.$ubb);
        const selections = editor.getSelections();
        if (targetCell) {
            // from ui
            const targetCellIndex = editor.getCellIndex(targetCell);
            const containingSelection = selections.find(selection => selection.start <= targetCellIndex && targetCellIndex < selection.end);
            if (!containingSelection) {
                clipboardService.writeText(targetCell.getText());
                // delete cell
                const focus = editor.getFocus();
                const newFocus = focus.end <= targetCellIndex ? focus : { start: focus.start - 1, end: focus.end - 1 };
                const newSelections = selections.map(selection => (selection.end <= targetCellIndex ? selection : { start: selection.start - 1, end: selection.end - 1 }));
                textModel.applyEdits([
                    { editType: 1 /* CellEditType.Replace */, index: targetCellIndex, count: 1, cells: [] }
                ], true, { kind: notebookCommon_1.SelectionStateType.Index, focus: editor.getFocus(), selections: selections }, () => ({ kind: notebookCommon_1.SelectionStateType.Index, focus: newFocus, selections: newSelections }), undefined, true);
                notebookService.setToCopy([targetCell.model], false);
                return true;
            }
        }
        const focus = editor.getFocus();
        const containingSelection = selections.find(selection => selection.start <= focus.start && focus.end <= selection.end);
        if (!containingSelection) {
            // focus is out of any selection, we should only cut this cell
            const targetCell = editor.cellAt(focus.start);
            clipboardService.writeText(targetCell.getText());
            const newFocus = focus.end === editor.getLength() ? { start: focus.start - 1, end: focus.end - 1 } : focus;
            const newSelections = selections.map(selection => (selection.end <= focus.start ? selection : { start: selection.start - 1, end: selection.end - 1 }));
            textModel.applyEdits([
                { editType: 1 /* CellEditType.Replace */, index: focus.start, count: 1, cells: [] }
            ], true, { kind: notebookCommon_1.SelectionStateType.Index, focus: editor.getFocus(), selections: selections }, () => ({ kind: notebookCommon_1.SelectionStateType.Index, focus: newFocus, selections: newSelections }), undefined, true);
            notebookService.setToCopy([targetCell.model], false);
            return true;
        }
        const selectionRanges = (0, notebookBrowser_1.$1bb)(editor, editor.getSelections());
        const selectedCells = (0, notebookBrowser_1.$2bb)(editor, selectionRanges);
        if (!selectedCells.length) {
            return false;
        }
        clipboardService.writeText(selectedCells.map(cell => cell.getText()).join('\n'));
        const edits = selectionRanges.map(range => ({ editType: 1 /* CellEditType.Replace */, index: range.start, count: range.end - range.start, cells: [] }));
        const firstSelectIndex = selectionRanges[0].start;
        /**
         * If we have cells, 0, 1, 2, 3, 4, 5, 6
         * and cells 1, 2 are selected, and then we delete cells 1 and 2
         * the new focused cell should still be at index 1
         */
        const newFocusedCellIndex = firstSelectIndex < textModel.cells.length - 1
            ? firstSelectIndex
            : Math.max(textModel.cells.length - 2, 0);
        textModel.applyEdits(edits, true, { kind: notebookCommon_1.SelectionStateType.Index, focus: editor.getFocus(), selections: selectionRanges }, () => {
            return {
                kind: notebookCommon_1.SelectionStateType.Index,
                focus: { start: newFocusedCellIndex, end: newFocusedCellIndex + 1 },
                selections: [{ start: newFocusedCellIndex, end: newFocusedCellIndex + 1 }]
            };
        }, undefined, true);
        notebookService.setToCopy(selectedCells.map(cell => cell.model), false);
        return true;
    }
    exports.$hFb = $hFb;
    let $iFb = class $iFb extends lifecycle_1.$kc {
        constructor(a) {
            super();
            this.a = a;
            const PRIORITY = 105;
            if (clipboard_1.$i1) {
                this.B(clipboard_1.$i1.addImplementation(PRIORITY, 'notebook-clipboard', accessor => {
                    return this.runCopyAction(accessor);
                }));
            }
            if (clipboard_1.$j1) {
                this.B(clipboard_1.$j1.addImplementation(PRIORITY, 'notebook-clipboard', accessor => {
                    return this.runPasteAction(accessor);
                }));
            }
            if (clipboard_1.$h1) {
                this.B(clipboard_1.$h1.addImplementation(PRIORITY, 'notebook-clipboard', accessor => {
                    return this.runCutAction(accessor);
                }));
            }
        }
        b() {
            const editor = (0, notebookBrowser_1.$Zbb)(this.a.activeEditorPane);
            const activeCell = editor?.getActiveCell();
            return {
                editor,
                activeCell
            };
        }
        c(editor) {
            const windowSelection = window.getSelection();
            if (windowSelection?.rangeCount !== 1) {
                return false;
            }
            const activeSelection = windowSelection.getRangeAt(0);
            if (activeSelection.startContainer === activeSelection.endContainer && activeSelection.endOffset - activeSelection.startOffset === 0) {
                return false;
            }
            let container = activeSelection.commonAncestorContainer;
            const body = editor.getDomNode();
            if (!body.contains(container)) {
                return false;
            }
            while (container
                &&
                    container !== body) {
                if (container.classList && container.classList.contains('monaco-editor')) {
                    return true;
                }
                container = container.parentNode;
            }
            return false;
        }
        runCopyAction(accessor) {
            const loggerService = accessor.get(log_1.$5i);
            const activeElement = document.activeElement;
            if (activeElement && ['input', 'textarea'].indexOf(activeElement.tagName.toLowerCase()) >= 0) {
                _log(loggerService, '[NotebookEditor] focus is on input or textarea element, bypass');
                return false;
            }
            const { editor } = this.b();
            if (!editor) {
                _log(loggerService, '[NotebookEditor] no active notebook editor, bypass');
                return false;
            }
            if (this.c(editor)) {
                _log(loggerService, '[NotebookEditor] focus is on embed monaco editor, bypass');
                return false;
            }
            _log(loggerService, '[NotebookEditor] run copy actions on notebook model');
            return $gFb(accessor, editor, undefined);
        }
        runPasteAction(accessor) {
            const activeElement = document.activeElement;
            if (activeElement && ['input', 'textarea'].indexOf(activeElement.tagName.toLowerCase()) >= 0) {
                return false;
            }
            const notebookService = accessor.get(notebookService_1.$ubb);
            const pasteCells = notebookService.getToCopy();
            if (!pasteCells) {
                return false;
            }
            const { editor, activeCell } = this.b();
            if (!editor) {
                return false;
            }
            return $fFb(editor, activeCell, pasteCells);
        }
        runCutAction(accessor) {
            const activeElement = document.activeElement;
            if (activeElement && ['input', 'textarea'].indexOf(activeElement.tagName.toLowerCase()) >= 0) {
                return false;
            }
            const { editor } = this.b();
            if (!editor) {
                return false;
            }
            return $hFb(accessor, editor, undefined);
        }
    };
    exports.$iFb = $iFb;
    exports.$iFb = $iFb = __decorate([
        __param(0, editorService_1.$9C)
    ], $iFb);
    const workbenchContributionsRegistry = platform_1.$8m.as(contributions_1.Extensions.Workbench);
    workbenchContributionsRegistry.registerWorkbenchContribution($iFb, 2 /* LifecyclePhase.Ready */);
    const COPY_CELL_COMMAND_ID = 'notebook.cell.copy';
    const CUT_CELL_COMMAND_ID = 'notebook.cell.cut';
    const PASTE_CELL_COMMAND_ID = 'notebook.cell.paste';
    const PASTE_CELL_ABOVE_COMMAND_ID = 'notebook.cell.pasteAbove';
    (0, actions_1.$Xu)(class extends coreActions_1.$dpb {
        constructor() {
            super({
                id: COPY_CELL_COMMAND_ID,
                title: (0, nls_1.localize)(0, null),
                menu: {
                    id: actions_1.$Ru.NotebookCellTitle,
                    when: notebookContextKeys_1.$Ynb,
                    group: "1_copy" /* CellOverflowToolbarGroups.Copy */,
                },
                keybinding: platform.$m ? undefined : {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */,
                    win: { primary: 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */, secondary: [2048 /* KeyMod.CtrlCmd */ | 19 /* KeyCode.Insert */] },
                    when: contextkey_1.$Ii.and(notebookContextKeys_1.$Ynb, contextkey_1.$Ii.not(contextkeys_1.$83)),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                }
            });
        }
        async runWithContext(accessor, context) {
            $gFb(accessor, context.notebookEditor, context.cell);
        }
    });
    (0, actions_1.$Xu)(class extends coreActions_1.$dpb {
        constructor() {
            super({
                id: CUT_CELL_COMMAND_ID,
                title: (0, nls_1.localize)(1, null),
                menu: {
                    id: actions_1.$Ru.NotebookCellTitle,
                    when: contextkey_1.$Ii.and(notebookContextKeys_1.$Ynb, notebookContextKeys_1.$3nb, notebookContextKeys_1.$aob),
                    group: "1_copy" /* CellOverflowToolbarGroups.Copy */,
                },
                keybinding: platform.$m ? undefined : {
                    when: contextkey_1.$Ii.and(notebookContextKeys_1.$Ynb, contextkey_1.$Ii.not(contextkeys_1.$83)),
                    primary: 2048 /* KeyMod.CtrlCmd */ | 54 /* KeyCode.KeyX */,
                    win: { primary: 2048 /* KeyMod.CtrlCmd */ | 54 /* KeyCode.KeyX */, secondary: [1024 /* KeyMod.Shift */ | 20 /* KeyCode.Delete */] },
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                }
            });
        }
        async runWithContext(accessor, context) {
            $hFb(accessor, context.notebookEditor, context.cell);
        }
    });
    (0, actions_1.$Xu)(class extends coreActions_1.$bpb {
        constructor() {
            super({
                id: PASTE_CELL_COMMAND_ID,
                title: (0, nls_1.localize)(2, null),
                menu: {
                    id: actions_1.$Ru.NotebookCellTitle,
                    when: contextkey_1.$Ii.and(notebookContextKeys_1.$Ynb, notebookContextKeys_1.$3nb),
                    group: "1_copy" /* CellOverflowToolbarGroups.Copy */,
                },
                keybinding: platform.$m ? undefined : {
                    when: contextkey_1.$Ii.and(notebookContextKeys_1.$Ynb, contextkey_1.$Ii.not(contextkeys_1.$83)),
                    primary: 2048 /* KeyMod.CtrlCmd */ | 52 /* KeyCode.KeyV */,
                    win: { primary: 2048 /* KeyMod.CtrlCmd */ | 52 /* KeyCode.KeyV */, secondary: [1024 /* KeyMod.Shift */ | 19 /* KeyCode.Insert */] },
                    linux: { primary: 2048 /* KeyMod.CtrlCmd */ | 52 /* KeyCode.KeyV */, secondary: [1024 /* KeyMod.Shift */ | 19 /* KeyCode.Insert */] },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        async runWithContext(accessor, context) {
            const notebookService = accessor.get(notebookService_1.$ubb);
            const pasteCells = notebookService.getToCopy();
            if (!context.notebookEditor.hasModel() || context.notebookEditor.isReadOnly) {
                return;
            }
            if (!pasteCells) {
                return;
            }
            $fFb(context.notebookEditor, context.cell, pasteCells);
        }
    });
    (0, actions_1.$Xu)(class extends coreActions_1.$dpb {
        constructor() {
            super({
                id: PASTE_CELL_ABOVE_COMMAND_ID,
                title: (0, nls_1.localize)(3, null),
                keybinding: {
                    when: contextkey_1.$Ii.and(notebookContextKeys_1.$Ynb, contextkey_1.$Ii.not(contextkeys_1.$83)),
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 52 /* KeyCode.KeyV */,
                    weight: coreActions_1.$0ob
                },
            });
        }
        async runWithContext(accessor, context) {
            const notebookService = accessor.get(notebookService_1.$ubb);
            const pasteCells = notebookService.getToCopy();
            const editor = context.notebookEditor;
            const textModel = editor.textModel;
            if (editor.isReadOnly) {
                return;
            }
            if (!pasteCells) {
                return;
            }
            const originalState = {
                kind: notebookCommon_1.SelectionStateType.Index,
                focus: editor.getFocus(),
                selections: editor.getSelections()
            };
            const currCellIndex = context.notebookEditor.getCellIndex(context.cell);
            const newFocusIndex = currCellIndex;
            textModel.applyEdits([
                {
                    editType: 1 /* CellEditType.Replace */,
                    index: currCellIndex,
                    count: 0,
                    cells: pasteCells.items.map(cell => (0, notebookCellTextModel_1.$IH)(cell))
                }
            ], true, originalState, () => ({
                kind: notebookCommon_1.SelectionStateType.Index,
                focus: { start: newFocusIndex, end: newFocusIndex + 1 },
                selections: [{ start: newFocusIndex, end: newFocusIndex + pasteCells.items.length }]
            }), undefined, true);
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.toggleNotebookClipboardLog',
                title: { value: (0, nls_1.localize)(4, null), original: 'Toggle Notebook Clipboard Troubleshooting' },
                category: actionCommonCategories_1.$Nl.Developer,
                f1: true
            });
        }
        run(accessor) {
            toggleLogging();
            if (_logging) {
                const commandService = accessor.get(commands_1.$Fr);
                commandService.executeCommand(logConstants_1.$nhb);
            }
        }
    });
});
//# sourceMappingURL=notebookClipboard.js.map