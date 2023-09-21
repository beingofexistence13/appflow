/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/actions", "vs/base/common/keyCodes", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/editor/common/core/position", "vs/editor/common/editorContextKeys", "vs/editor/common/services/languageFeatures", "vs/editor/contrib/message/browser/messageController", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/common/contextkeys", "vs/workbench/common/views", "vs/workbench/contrib/debug/browser/breakpointsView", "vs/workbench/contrib/debug/browser/disassemblyView", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugUtils", "vs/workbench/contrib/debug/common/disassemblyViewInput", "vs/workbench/services/editor/common/editorService"], function (require, exports, dom_1, actions_1, keyCodes_1, editorExtensions_1, codeEditorService_1, position_1, editorContextKeys_1, languageFeatures_1, messageController_1, nls, actions_2, configuration_1, contextkey_1, contextView_1, uriIdentity_1, contextkeys_1, views_1, breakpointsView_1, disassemblyView_1, debug_1, debugUtils_1, disassemblyViewInput_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SelectionToWatchExpressionsAction = exports.SelectionToReplAction = exports.RunToCursorAction = void 0;
    class ToggleBreakpointAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'editor.debug.action.toggleBreakpoint',
                title: {
                    value: nls.localize('toggleBreakpointAction', "Debug: Toggle Breakpoint"),
                    original: 'Debug: Toggle Breakpoint',
                    mnemonicTitle: nls.localize({ key: 'miToggleBreakpoint', comment: ['&& denotes a mnemonic'] }, "Toggle &&Breakpoint"),
                },
                precondition: debug_1.CONTEXT_DEBUGGERS_AVAILABLE,
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.or(editorContextKeys_1.EditorContextKeys.editorTextFocus, debug_1.CONTEXT_DISASSEMBLY_VIEW_FOCUS),
                    primary: 67 /* KeyCode.F9 */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                menu: {
                    id: actions_2.MenuId.MenubarDebugMenu,
                    when: debug_1.CONTEXT_DEBUGGERS_AVAILABLE,
                    group: '4_new_breakpoint',
                    order: 1
                }
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const debugService = accessor.get(debug_1.IDebugService);
            const activePane = editorService.activeEditorPane;
            if (activePane instanceof disassemblyView_1.DisassemblyView) {
                const location = activePane.focusedAddressAndOffset;
                if (location) {
                    const bps = debugService.getModel().getInstructionBreakpoints();
                    const toRemove = bps.find(bp => bp.address === location.address);
                    if (toRemove) {
                        debugService.removeInstructionBreakpoints(toRemove.instructionReference, toRemove.offset);
                    }
                    else {
                        debugService.addInstructionBreakpoint(location.reference, location.offset, location.address);
                    }
                }
                return;
            }
            const codeEditorService = accessor.get(codeEditorService_1.ICodeEditorService);
            const editor = codeEditorService.getFocusedCodeEditor() || codeEditorService.getActiveCodeEditor();
            if (editor?.hasModel()) {
                const modelUri = editor.getModel().uri;
                const canSet = debugService.canSetBreakpointsIn(editor.getModel());
                // Does not account for multi line selections, Set to remove multiple cursor on the same line
                const lineNumbers = [...new Set(editor.getSelections().map(s => s.getPosition().lineNumber))];
                await Promise.all(lineNumbers.map(async (line) => {
                    const bps = debugService.getModel().getBreakpoints({ lineNumber: line, uri: modelUri });
                    if (bps.length) {
                        await Promise.all(bps.map(bp => debugService.removeBreakpoints(bp.getId())));
                    }
                    else if (canSet) {
                        await debugService.addBreakpoints(modelUri, [{ lineNumber: line }]);
                    }
                }));
            }
        }
    }
    class ConditionalBreakpointAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.debug.action.conditionalBreakpoint',
                label: nls.localize('conditionalBreakpointEditorAction', "Debug: Add Conditional Breakpoint..."),
                alias: 'Debug: Add Conditional Breakpoint...',
                precondition: debug_1.CONTEXT_DEBUGGERS_AVAILABLE,
                menuOpts: {
                    menuId: actions_2.MenuId.MenubarNewBreakpointMenu,
                    title: nls.localize({ key: 'miConditionalBreakpoint', comment: ['&& denotes a mnemonic'] }, "&&Conditional Breakpoint..."),
                    group: '1_breakpoints',
                    order: 1,
                    when: debug_1.CONTEXT_DEBUGGERS_AVAILABLE
                }
            });
        }
        async run(accessor, editor) {
            const debugService = accessor.get(debug_1.IDebugService);
            const position = editor.getPosition();
            if (position && editor.hasModel() && debugService.canSetBreakpointsIn(editor.getModel())) {
                editor.getContribution(debug_1.BREAKPOINT_EDITOR_CONTRIBUTION_ID)?.showBreakpointWidget(position.lineNumber, undefined, 0 /* BreakpointWidgetContext.CONDITION */);
            }
        }
    }
    class LogPointAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.debug.action.addLogPoint',
                label: nls.localize('logPointEditorAction', "Debug: Add Logpoint..."),
                precondition: debug_1.CONTEXT_DEBUGGERS_AVAILABLE,
                alias: 'Debug: Add Logpoint...',
                menuOpts: [
                    {
                        menuId: actions_2.MenuId.MenubarNewBreakpointMenu,
                        title: nls.localize({ key: 'miLogPoint', comment: ['&& denotes a mnemonic'] }, "&&Logpoint..."),
                        group: '1_breakpoints',
                        order: 4,
                        when: debug_1.CONTEXT_DEBUGGERS_AVAILABLE,
                    }
                ]
            });
        }
        async run(accessor, editor) {
            const debugService = accessor.get(debug_1.IDebugService);
            const position = editor.getPosition();
            if (position && editor.hasModel() && debugService.canSetBreakpointsIn(editor.getModel())) {
                editor.getContribution(debug_1.BREAKPOINT_EDITOR_CONTRIBUTION_ID)?.showBreakpointWidget(position.lineNumber, position.column, 2 /* BreakpointWidgetContext.LOG_MESSAGE */);
            }
        }
    }
    class EditBreakpointAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.debug.action.editBreakpoint',
                label: nls.localize('EditBreakpointEditorAction', "Debug: Edit Breakpoint"),
                alias: 'Debug: Edit Existing Breakpoint',
                precondition: debug_1.CONTEXT_DEBUGGERS_AVAILABLE,
                menuOpts: {
                    menuId: actions_2.MenuId.MenubarNewBreakpointMenu,
                    title: nls.localize({ key: 'miEditBreakpoint', comment: ['&& denotes a mnemonic'] }, "&&Edit Breakpoint"),
                    group: '1_breakpoints',
                    order: 1,
                    when: debug_1.CONTEXT_DEBUGGERS_AVAILABLE
                }
            });
        }
        async run(accessor, editor) {
            const debugService = accessor.get(debug_1.IDebugService);
            const position = editor.getPosition();
            const debugModel = debugService.getModel();
            if (!(editor.hasModel() && position)) {
                return;
            }
            const lineBreakpoints = debugModel.getBreakpoints({ lineNumber: position.lineNumber });
            if (lineBreakpoints.length === 0) {
                return;
            }
            const breakpointDistances = lineBreakpoints.map(b => {
                if (!b.column) {
                    return position.column;
                }
                return Math.abs(b.column - position.column);
            });
            const closestBreakpointIndex = breakpointDistances.indexOf(Math.min(...breakpointDistances));
            const closestBreakpoint = lineBreakpoints[closestBreakpointIndex];
            editor.getContribution(debug_1.BREAKPOINT_EDITOR_CONTRIBUTION_ID)?.showBreakpointWidget(closestBreakpoint.lineNumber, closestBreakpoint.column);
        }
    }
    class OpenDisassemblyViewAction extends editorExtensions_1.EditorAction2 {
        static { this.ID = 'editor.debug.action.openDisassemblyView'; }
        constructor() {
            super({
                id: OpenDisassemblyViewAction.ID,
                title: {
                    value: nls.localize('openDisassemblyView', "Open Disassembly View"),
                    original: 'Open Disassembly View',
                    mnemonicTitle: nls.localize({ key: 'miDisassemblyView', comment: ['&& denotes a mnemonic'] }, "&&DisassemblyView")
                },
                precondition: debug_1.CONTEXT_FOCUSED_STACK_FRAME_HAS_INSTRUCTION_POINTER_REFERENCE,
                menu: [
                    {
                        id: actions_2.MenuId.EditorContext,
                        group: 'debug',
                        order: 5,
                        when: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_IN_DEBUG_MODE, contextkeys_1.PanelFocusContext.toNegated(), debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped'), editorContextKeys_1.EditorContextKeys.editorTextFocus, debug_1.CONTEXT_DISASSEMBLE_REQUEST_SUPPORTED, debug_1.CONTEXT_LANGUAGE_SUPPORTS_DISASSEMBLE_REQUEST)
                    },
                    {
                        id: actions_2.MenuId.DebugCallStackContext,
                        group: 'z_commands',
                        order: 50,
                        when: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_IN_DEBUG_MODE, debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped'), debug_1.CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo('stackFrame'), debug_1.CONTEXT_DISASSEMBLE_REQUEST_SUPPORTED)
                    },
                    {
                        id: actions_2.MenuId.CommandPalette,
                        when: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_IN_DEBUG_MODE, debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped'), debug_1.CONTEXT_DISASSEMBLE_REQUEST_SUPPORTED)
                    }
                ]
            });
        }
        runEditorCommand(accessor, editor, ...args) {
            if (editor.hasModel()) {
                const editorService = accessor.get(editorService_1.IEditorService);
                editorService.openEditor(disassemblyViewInput_1.DisassemblyViewInput.instance, { pinned: true, revealIfOpened: true });
            }
        }
    }
    class ToggleDisassemblyViewSourceCodeAction extends actions_2.Action2 {
        static { this.ID = 'debug.action.toggleDisassemblyViewSourceCode'; }
        static { this.configID = 'debug.disassemblyView.showSourceCode'; }
        constructor() {
            super({
                id: ToggleDisassemblyViewSourceCodeAction.ID,
                title: {
                    value: nls.localize('toggleDisassemblyViewSourceCode', "Toggle Source Code in Disassembly View"),
                    original: 'Toggle Source Code in Disassembly View',
                    mnemonicTitle: nls.localize({ key: 'mitogglesource', comment: ['&& denotes a mnemonic'] }, "&&ToggleSource")
                },
                f1: true,
            });
        }
        run(accessor, editor, ...args) {
            const configService = accessor.get(configuration_1.IConfigurationService);
            if (configService) {
                const value = configService.getValue('debug').disassemblyView.showSourceCode;
                configService.updateValue(ToggleDisassemblyViewSourceCodeAction.configID, !value);
            }
        }
    }
    class RunToCursorAction extends editorExtensions_1.EditorAction {
        static { this.ID = 'editor.debug.action.runToCursor'; }
        static { this.LABEL = nls.localize('runToCursor', "Run to Cursor"); }
        constructor() {
            super({
                id: RunToCursorAction.ID,
                label: RunToCursorAction.LABEL,
                alias: 'Debug: Run to Cursor',
                precondition: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_DEBUGGERS_AVAILABLE, contextkeys_1.PanelFocusContext.toNegated(), contextkey_1.ContextKeyExpr.or(editorContextKeys_1.EditorContextKeys.editorTextFocus, debug_1.CONTEXT_DISASSEMBLY_VIEW_FOCUS)),
                contextMenuOpts: {
                    group: 'debug',
                    order: 2,
                    when: debug_1.CONTEXT_IN_DEBUG_MODE
                }
            });
        }
        async run(accessor, editor) {
            const position = editor.getPosition();
            if (!(editor.hasModel() && position)) {
                return;
            }
            const uri = editor.getModel().uri;
            const debugService = accessor.get(debug_1.IDebugService);
            const viewModel = debugService.getViewModel();
            const uriIdentityService = accessor.get(uriIdentity_1.IUriIdentityService);
            let column = undefined;
            const focusedStackFrame = viewModel.focusedStackFrame;
            if (focusedStackFrame && uriIdentityService.extUri.isEqual(focusedStackFrame.source.uri, uri) && focusedStackFrame.range.startLineNumber === position.lineNumber) {
                // If the cursor is on a line different than the one the debugger is currently paused on, then send the breakpoint on the line without a column
                // otherwise set it at the precise column #102199
                column = position.column;
            }
            await debugService.runTo(uri, position.lineNumber, column);
        }
    }
    exports.RunToCursorAction = RunToCursorAction;
    class SelectionToReplAction extends editorExtensions_1.EditorAction {
        static { this.ID = 'editor.debug.action.selectionToRepl'; }
        static { this.LABEL = nls.localize('evaluateInDebugConsole', "Evaluate in Debug Console"); }
        constructor() {
            super({
                id: SelectionToReplAction.ID,
                label: SelectionToReplAction.LABEL,
                alias: 'Debug: Evaluate in Console',
                precondition: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_IN_DEBUG_MODE, editorContextKeys_1.EditorContextKeys.editorTextFocus),
                contextMenuOpts: {
                    group: 'debug',
                    order: 0
                }
            });
        }
        async run(accessor, editor) {
            const debugService = accessor.get(debug_1.IDebugService);
            const viewsService = accessor.get(views_1.IViewsService);
            const viewModel = debugService.getViewModel();
            const session = viewModel.focusedSession;
            if (!editor.hasModel() || !session) {
                return;
            }
            const selection = editor.getSelection();
            let text;
            if (selection.isEmpty()) {
                text = editor.getModel().getLineContent(selection.selectionStartLineNumber).trim();
            }
            else {
                text = editor.getModel().getValueInRange(selection);
            }
            await session.addReplExpression(viewModel.focusedStackFrame, text);
            await viewsService.openView(debug_1.REPL_VIEW_ID, false);
        }
    }
    exports.SelectionToReplAction = SelectionToReplAction;
    class SelectionToWatchExpressionsAction extends editorExtensions_1.EditorAction {
        static { this.ID = 'editor.debug.action.selectionToWatch'; }
        static { this.LABEL = nls.localize('addToWatch', "Add to Watch"); }
        constructor() {
            super({
                id: SelectionToWatchExpressionsAction.ID,
                label: SelectionToWatchExpressionsAction.LABEL,
                alias: 'Debug: Add to Watch',
                precondition: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_IN_DEBUG_MODE, editorContextKeys_1.EditorContextKeys.editorTextFocus),
                contextMenuOpts: {
                    group: 'debug',
                    order: 1
                }
            });
        }
        async run(accessor, editor) {
            const debugService = accessor.get(debug_1.IDebugService);
            const viewsService = accessor.get(views_1.IViewsService);
            const languageFeaturesService = accessor.get(languageFeatures_1.ILanguageFeaturesService);
            if (!editor.hasModel()) {
                return;
            }
            let expression = undefined;
            const model = editor.getModel();
            const selection = editor.getSelection();
            if (!selection.isEmpty()) {
                expression = model.getValueInRange(selection);
            }
            else {
                const position = editor.getPosition();
                const evaluatableExpression = await (0, debugUtils_1.getEvaluatableExpressionAtPosition)(languageFeaturesService, model, position);
                if (!evaluatableExpression) {
                    return;
                }
                expression = evaluatableExpression.matchingExpression;
            }
            if (!expression) {
                return;
            }
            await viewsService.openView(debug_1.WATCH_VIEW_ID);
            debugService.addWatchExpression(expression);
        }
    }
    exports.SelectionToWatchExpressionsAction = SelectionToWatchExpressionsAction;
    class ShowDebugHoverAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.debug.action.showDebugHover',
                label: nls.localize('showDebugHover', "Debug: Show Hover"),
                alias: 'Debug: Show Hover',
                precondition: debug_1.CONTEXT_IN_DEBUG_MODE,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 39 /* KeyCode.KeyI */),
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        async run(accessor, editor) {
            const position = editor.getPosition();
            if (!position || !editor.hasModel()) {
                return;
            }
            return editor.getContribution(debug_1.EDITOR_CONTRIBUTION_ID)?.showHover(position, true);
        }
    }
    const NO_TARGETS_MESSAGE = nls.localize('editor.debug.action.stepIntoTargets.notAvailable', "Step targets are not available here");
    class StepIntoTargetsAction extends editorExtensions_1.EditorAction {
        static { this.ID = 'editor.debug.action.stepIntoTargets'; }
        static { this.LABEL = nls.localize({ key: 'stepIntoTargets', comment: ['Step Into Targets lets the user step into an exact function he or she is interested in.'] }, "Step Into Target"); }
        constructor() {
            super({
                id: StepIntoTargetsAction.ID,
                label: StepIntoTargetsAction.LABEL,
                alias: 'Debug: Step Into Target',
                precondition: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_STEP_INTO_TARGETS_SUPPORTED, debug_1.CONTEXT_IN_DEBUG_MODE, debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped'), editorContextKeys_1.EditorContextKeys.editorTextFocus),
                contextMenuOpts: {
                    group: 'debug',
                    order: 1.5
                }
            });
        }
        async run(accessor, editor) {
            const debugService = accessor.get(debug_1.IDebugService);
            const contextMenuService = accessor.get(contextView_1.IContextMenuService);
            const uriIdentityService = accessor.get(uriIdentity_1.IUriIdentityService);
            const session = debugService.getViewModel().focusedSession;
            const frame = debugService.getViewModel().focusedStackFrame;
            const selection = editor.getSelection();
            const targetPosition = selection?.getPosition() || (frame && { lineNumber: frame.range.startLineNumber, column: frame.range.startColumn });
            if (!session || !frame || !editor.hasModel() || !uriIdentityService.extUri.isEqual(editor.getModel().uri, frame.source.uri)) {
                if (targetPosition) {
                    messageController_1.MessageController.get(editor)?.showMessage(NO_TARGETS_MESSAGE, targetPosition);
                }
                return;
            }
            const targets = await session.stepInTargets(frame.frameId);
            if (!targets?.length) {
                messageController_1.MessageController.get(editor)?.showMessage(NO_TARGETS_MESSAGE, targetPosition);
                return;
            }
            // If there is a selection, try to find the best target with a position to step into.
            if (selection) {
                const positionalTargets = [];
                for (const target of targets) {
                    if (target.line) {
                        positionalTargets.push({
                            start: new position_1.Position(target.line, target.column || 1),
                            end: target.endLine ? new position_1.Position(target.endLine, target.endColumn || 1) : undefined,
                            target
                        });
                    }
                }
                positionalTargets.sort((a, b) => b.start.lineNumber - a.start.lineNumber || b.start.column - a.start.column);
                const needle = selection.getPosition();
                // Try to find a target with a start and end that is around the cursor
                // position. Or, if none, whatever is before the cursor.
                const best = positionalTargets.find(t => t.end && needle.isBefore(t.end) && t.start.isBeforeOrEqual(needle)) || positionalTargets.find(t => t.end === undefined && t.start.isBeforeOrEqual(needle));
                if (best) {
                    session.stepIn(frame.thread.threadId, best.target.id);
                    return;
                }
            }
            // Otherwise, show a context menu and have the user pick a target
            editor.revealLineInCenterIfOutsideViewport(frame.range.startLineNumber);
            const cursorCoords = editor.getScrolledVisiblePosition(targetPosition);
            const editorCoords = (0, dom_1.getDomNodePagePosition)(editor.getDomNode());
            const x = editorCoords.left + cursorCoords.left;
            const y = editorCoords.top + cursorCoords.top + cursorCoords.height;
            contextMenuService.showContextMenu({
                getAnchor: () => ({ x, y }),
                getActions: () => {
                    return targets.map(t => new actions_1.Action(`stepIntoTarget:${t.id}`, t.label, undefined, true, () => session.stepIn(frame.thread.threadId, t.id)));
                }
            });
        }
    }
    class GoToBreakpointAction extends editorExtensions_1.EditorAction {
        constructor(isNext, opts) {
            super(opts);
            this.isNext = isNext;
        }
        async run(accessor, editor) {
            const debugService = accessor.get(debug_1.IDebugService);
            const editorService = accessor.get(editorService_1.IEditorService);
            const uriIdentityService = accessor.get(uriIdentity_1.IUriIdentityService);
            if (editor.hasModel()) {
                const currentUri = editor.getModel().uri;
                const currentLine = editor.getPosition().lineNumber;
                //Breakpoints returned from `getBreakpoints` are already sorted.
                const allEnabledBreakpoints = debugService.getModel().getBreakpoints({ enabledOnly: true });
                //Try to find breakpoint in current file
                let moveBreakpoint = this.isNext
                    ? allEnabledBreakpoints.filter(bp => uriIdentityService.extUri.isEqual(bp.uri, currentUri) && bp.lineNumber > currentLine).shift()
                    : allEnabledBreakpoints.filter(bp => uriIdentityService.extUri.isEqual(bp.uri, currentUri) && bp.lineNumber < currentLine).pop();
                //Try to find breakpoints in following files
                if (!moveBreakpoint) {
                    moveBreakpoint =
                        this.isNext
                            ? allEnabledBreakpoints.filter(bp => bp.uri.toString() > currentUri.toString()).shift()
                            : allEnabledBreakpoints.filter(bp => bp.uri.toString() < currentUri.toString()).pop();
                }
                //Move to first or last possible breakpoint
                if (!moveBreakpoint && allEnabledBreakpoints.length) {
                    moveBreakpoint = this.isNext ? allEnabledBreakpoints[0] : allEnabledBreakpoints[allEnabledBreakpoints.length - 1];
                }
                if (moveBreakpoint) {
                    return (0, breakpointsView_1.openBreakpointSource)(moveBreakpoint, false, true, false, debugService, editorService);
                }
            }
        }
    }
    class GoToNextBreakpointAction extends GoToBreakpointAction {
        constructor() {
            super(true, {
                id: 'editor.debug.action.goToNextBreakpoint',
                label: nls.localize('goToNextBreakpoint', "Debug: Go to Next Breakpoint"),
                alias: 'Debug: Go to Next Breakpoint',
                precondition: debug_1.CONTEXT_DEBUGGERS_AVAILABLE
            });
        }
    }
    class GoToPreviousBreakpointAction extends GoToBreakpointAction {
        constructor() {
            super(false, {
                id: 'editor.debug.action.goToPreviousBreakpoint',
                label: nls.localize('goToPreviousBreakpoint', "Debug: Go to Previous Breakpoint"),
                alias: 'Debug: Go to Previous Breakpoint',
                precondition: debug_1.CONTEXT_DEBUGGERS_AVAILABLE
            });
        }
    }
    class CloseExceptionWidgetAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.debug.action.closeExceptionWidget',
                label: nls.localize('closeExceptionWidget', "Close Exception Widget"),
                alias: 'Close Exception Widget',
                precondition: debug_1.CONTEXT_EXCEPTION_WIDGET_VISIBLE,
                kbOpts: {
                    primary: 9 /* KeyCode.Escape */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        async run(_accessor, editor) {
            const contribution = editor.getContribution(debug_1.EDITOR_CONTRIBUTION_ID);
            contribution?.closeExceptionWidget();
        }
    }
    (0, actions_2.registerAction2)(OpenDisassemblyViewAction);
    (0, actions_2.registerAction2)(ToggleDisassemblyViewSourceCodeAction);
    (0, actions_2.registerAction2)(ToggleBreakpointAction);
    (0, editorExtensions_1.registerEditorAction)(ConditionalBreakpointAction);
    (0, editorExtensions_1.registerEditorAction)(LogPointAction);
    (0, editorExtensions_1.registerEditorAction)(EditBreakpointAction);
    (0, editorExtensions_1.registerEditorAction)(RunToCursorAction);
    (0, editorExtensions_1.registerEditorAction)(StepIntoTargetsAction);
    (0, editorExtensions_1.registerEditorAction)(SelectionToReplAction);
    (0, editorExtensions_1.registerEditorAction)(SelectionToWatchExpressionsAction);
    (0, editorExtensions_1.registerEditorAction)(ShowDebugHoverAction);
    (0, editorExtensions_1.registerEditorAction)(GoToNextBreakpointAction);
    (0, editorExtensions_1.registerEditorAction)(GoToPreviousBreakpointAction);
    (0, editorExtensions_1.registerEditorAction)(CloseExceptionWidgetAction);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdFZGl0b3JBY3Rpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZGVidWcvYnJvd3Nlci9kZWJ1Z0VkaXRvckFjdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBNkJoRyxNQUFNLHNCQUF1QixTQUFRLGlCQUFPO1FBQzNDO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSxzQ0FBc0M7Z0JBQzFDLEtBQUssRUFBRTtvQkFDTixLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyx3QkFBd0IsRUFBRSwwQkFBMEIsQ0FBQztvQkFDekUsUUFBUSxFQUFFLDBCQUEwQjtvQkFDcEMsYUFBYSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxHQUFHLEVBQUUsb0JBQW9CLEVBQUUsT0FBTyxFQUFFLENBQUMsdUJBQXVCLENBQUMsRUFBRSxFQUFFLHFCQUFxQixDQUFDO2lCQUNySDtnQkFDRCxZQUFZLEVBQUUsbUNBQTJCO2dCQUN6QyxVQUFVLEVBQUU7b0JBQ1gsSUFBSSxFQUFFLDJCQUFjLENBQUMsRUFBRSxDQUFDLHFDQUFpQixDQUFDLGVBQWUsRUFBRSxzQ0FBOEIsQ0FBQztvQkFDMUYsT0FBTyxxQkFBWTtvQkFDbkIsTUFBTSwwQ0FBZ0M7aUJBQ3RDO2dCQUNELElBQUksRUFBRTtvQkFDTCxFQUFFLEVBQUUsZ0JBQU0sQ0FBQyxnQkFBZ0I7b0JBQzNCLElBQUksRUFBRSxtQ0FBMkI7b0JBQ2pDLEtBQUssRUFBRSxrQkFBa0I7b0JBQ3pCLEtBQUssRUFBRSxDQUFDO2lCQUNSO2FBQ0QsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBMEI7WUFDbkMsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyw4QkFBYyxDQUFDLENBQUM7WUFDbkQsTUFB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