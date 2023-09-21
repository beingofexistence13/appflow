/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/actions", "vs/base/common/keyCodes", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/editor/common/core/position", "vs/editor/common/editorContextKeys", "vs/editor/common/services/languageFeatures", "vs/editor/contrib/message/browser/messageController", "vs/nls!vs/workbench/contrib/debug/browser/debugEditorActions", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/common/contextkeys", "vs/workbench/common/views", "vs/workbench/contrib/debug/browser/breakpointsView", "vs/workbench/contrib/debug/browser/disassemblyView", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugUtils", "vs/workbench/contrib/debug/common/disassemblyViewInput", "vs/workbench/services/editor/common/editorService"], function (require, exports, dom_1, actions_1, keyCodes_1, editorExtensions_1, codeEditorService_1, position_1, editorContextKeys_1, languageFeatures_1, messageController_1, nls, actions_2, configuration_1, contextkey_1, contextView_1, uriIdentity_1, contextkeys_1, views_1, breakpointsView_1, disassemblyView_1, debug_1, debugUtils_1, disassemblyViewInput_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$nRb = exports.$mRb = exports.$lRb = void 0;
    class ToggleBreakpointAction extends actions_2.$Wu {
        constructor() {
            super({
                id: 'editor.debug.action.toggleBreakpoint',
                title: {
                    value: nls.localize(0, null),
                    original: 'Debug: Toggle Breakpoint',
                    mnemonicTitle: nls.localize(1, null),
                },
                precondition: debug_1.$ZG,
                keybinding: {
                    when: contextkey_1.$Ii.or(editorContextKeys_1.EditorContextKeys.editorTextFocus, debug_1.$dH),
                    primary: 67 /* KeyCode.F9 */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                menu: {
                    id: actions_2.$Ru.MenubarDebugMenu,
                    when: debug_1.$ZG,
                    group: '4_new_breakpoint',
                    order: 1
                }
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.$9C);
            const debugService = accessor.get(debug_1.$nH);
            const activePane = editorService.activeEditorPane;
            if (activePane instanceof disassemblyView_1.$7Fb) {
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
            const codeEditorService = accessor.get(codeEditorService_1.$nV);
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
    class ConditionalBreakpointAction extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.debug.action.conditionalBreakpoint',
                label: nls.localize(2, null),
                alias: 'Debug: Add Conditional Breakpoint...',
                precondition: debug_1.$ZG,
                menuOpts: {
                    menuId: actions_2.$Ru.MenubarNewBreakpointMenu,
                    title: nls.localize(3, null),
                    group: '1_breakpoints',
                    order: 1,
                    when: debug_1.$ZG
                }
            });
        }
        async run(accessor, editor) {
            const debugService = accessor.get(debug_1.$nH);
            const position = editor.getPosition();
            if (position && editor.hasModel() && debugService.canSetBreakpointsIn(editor.getModel())) {
                editor.getContribution(debug_1.$iH)?.showBreakpointWidget(position.lineNumber, undefined, 0 /* BreakpointWidgetContext.CONDITION */);
            }
        }
    }
    class LogPointAction extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.debug.action.addLogPoint',
                label: nls.localize(4, null),
                precondition: debug_1.$ZG,
                alias: 'Debug: Add Logpoint...',
                menuOpts: [
                    {
                        menuId: actions_2.$Ru.MenubarNewBreakpointMenu,
                        title: nls.localize(5, null),
                        group: '1_breakpoints',
                        order: 4,
                        when: debug_1.$ZG,
                    }
                ]
            });
        }
        async run(accessor, editor) {
            const debugService = accessor.get(debug_1.$nH);
            const position = editor.getPosition();
            if (position && editor.hasModel() && debugService.canSetBreakpointsIn(editor.getModel())) {
                editor.getContribution(debug_1.$iH)?.showBreakpointWidget(position.lineNumber, position.column, 2 /* BreakpointWidgetContext.LOG_MESSAGE */);
            }
        }
    }
    class EditBreakpointAction extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.debug.action.editBreakpoint',
                label: nls.localize(6, null),
                alias: 'Debug: Edit Existing Breakpoint',
                precondition: debug_1.$ZG,
                menuOpts: {
                    menuId: actions_2.$Ru.MenubarNewBreakpointMenu,
                    title: nls.localize(7, null),
                    group: '1_breakpoints',
                    order: 1,
                    when: debug_1.$ZG
                }
            });
        }
        async run(accessor, editor) {
            const debugService = accessor.get(debug_1.$nH);
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
            editor.getContribution(debug_1.$iH)?.showBreakpointWidget(closestBreakpoint.lineNumber, closestBreakpoint.column);
        }
    }
    class OpenDisassemblyViewAction extends editorExtensions_1.$uV {
        static { this.ID = 'editor.debug.action.openDisassemblyView'; }
        constructor() {
            super({
                id: OpenDisassemblyViewAction.ID,
                title: {
                    value: nls.localize(8, null),
                    original: 'Open Disassembly View',
                    mnemonicTitle: nls.localize(9, null)
                },
                precondition: debug_1.$fH,
                menu: [
                    {
                        id: actions_2.$Ru.EditorContext,
                        group: 'debug',
                        order: 5,
                        when: contextkey_1.$Ii.and(debug_1.$yG, contextkeys_1.$Cdb.toNegated(), debug_1.$uG.isEqualTo('stopped'), editorContextKeys_1.EditorContextKeys.editorTextFocus, debug_1.$cH, debug_1.$eH)
                    },
                    {
                        id: actions_2.$Ru.DebugCallStackContext,
                        group: 'z_commands',
                        order: 50,
                        when: contextkey_1.$Ii.and(debug_1.$yG, debug_1.$uG.isEqualTo('stopped'), debug_1.$IG.isEqualTo('stackFrame'), debug_1.$cH)
                    },
                    {
                        id: actions_2.$Ru.CommandPalette,
                        when: contextkey_1.$Ii.and(debug_1.$yG, debug_1.$uG.isEqualTo('stopped'), debug_1.$cH)
                    }
                ]
            });
        }
        runEditorCommand(accessor, editor, ...args) {
            if (editor.hasModel()) {
                const editorService = accessor.get(editorService_1.$9C);
                editorService.openEditor(disassemblyViewInput_1.$GFb.instance, { pinned: true, revealIfOpened: true });
            }
        }
    }
    class ToggleDisassemblyViewSourceCodeAction extends actions_2.$Wu {
        static { this.ID = 'debug.action.toggleDisassemblyViewSourceCode'; }
        static { this.configID = 'debug.disassemblyView.showSourceCode'; }
        constructor() {
            super({
                id: ToggleDisassemblyViewSourceCodeAction.ID,
                title: {
                    value: nls.localize(10, null),
                    original: 'Toggle Source Code in Disassembly View',
                    mnemonicTitle: nls.localize(11, null)
                },
                f1: true,
            });
        }
        run(accessor, editor, ...args) {
            const configService = accessor.get(configuration_1.$8h);
            if (configService) {
                const value = configService.getValue('debug').disassemblyView.showSourceCode;
                configService.updateValue(ToggleDisassemblyViewSourceCodeAction.configID, !value);
            }
        }
    }
    class $lRb extends editorExtensions_1.$sV {
        static { this.ID = 'editor.debug.action.runToCursor'; }
        static { this.LABEL = nls.localize(12, null); }
        constructor() {
            super({
                id: $lRb.ID,
                label: $lRb.LABEL,
                alias: 'Debug: Run to Cursor',
                precondition: contextkey_1.$Ii.and(debug_1.$ZG, contextkeys_1.$Cdb.toNegated(), contextkey_1.$Ii.or(editorContextKeys_1.EditorContextKeys.editorTextFocus, debug_1.$dH)),
                contextMenuOpts: {
                    group: 'debug',
                    order: 2,
                    when: debug_1.$yG
                }
            });
        }
        async run(accessor, editor) {
            const position = editor.getPosition();
            if (!(editor.hasModel() && position)) {
                return;
            }
            const uri = editor.getModel().uri;
            const debugService = accessor.get(debug_1.$nH);
            const viewModel = debugService.getViewModel();
            const uriIdentityService = accessor.get(uriIdentity_1.$Ck);
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
    exports.$lRb = $lRb;
    class $mRb extends editorExtensions_1.$sV {
        static { this.ID = 'editor.debug.action.selectionToRepl'; }
        static { this.LABEL = nls.localize(13, null); }
        constructor() {
            super({
                id: $mRb.ID,
                label: $mRb.LABEL,
                alias: 'Debug: Evaluate in Console',
                precondition: contextkey_1.$Ii.and(debug_1.$yG, editorContextKeys_1.EditorContextKeys.editorTextFocus),
                contextMenuOpts: {
                    group: 'debug',
                    order: 0
                }
            });
        }
        async run(accessor, editor) {
            const debugService = accessor.get(debug_1.$nH);
            const viewsService = accessor.get(views_1.$$E);
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
            await viewsService.openView(debug_1.$rG, false);
        }
    }
    exports.$mRb = $mRb;
    class $nRb extends editorExtensions_1.$sV {
        static { this.ID = 'editor.debug.action.selectionToWatch'; }
        static { this.LABEL = nls.localize(14, null); }
        constructor() {
            super({
                id: $nRb.ID,
                label: $nRb.LABEL,
                alias: 'Debug: Add to Watch',
                precondition: contextkey_1.$Ii.and(debug_1.$yG, editorContextKeys_1.EditorContextKeys.editorTextFocus),
                contextMenuOpts: {
                    group: 'debug',
                    order: 1
                }
            });
        }
        async run(accessor, editor) {
            const debugService = accessor.get(debug_1.$nH);
            const viewsService = accessor.get(views_1.$$E);
            const languageFeaturesService = accessor.get(languageFeatures_1.$hF);
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
                const evaluatableExpression = await (0, debugUtils_1.$oF)(languageFeaturesService, model, position);
                if (!evaluatableExpression) {
                    return;
                }
                expression = evaluatableExpression.matchingExpression;
            }
            if (!expression) {
                return;
            }
            await viewsService.openView(debug_1.$lG);
            debugService.addWatchExpression(expression);
        }
    }
    exports.$nRb = $nRb;
    class ShowDebugHoverAction extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.debug.action.showDebugHover',
                label: nls.localize(15, null),
                alias: 'Debug: Show Hover',
                precondition: debug_1.$yG,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 39 /* KeyCode.KeyI */),
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        async run(accessor, editor) {
            const position = editor.getPosition();
            if (!position || !editor.hasModel()) {
                return;
            }
            return editor.getContribution(debug_1.$hH)?.showHover(position, true);
        }
    }
    const NO_TARGETS_MESSAGE = nls.localize(16, null);
    class StepIntoTargetsAction extends editorExtensions_1.$sV {
        static { this.ID = 'editor.debug.action.stepIntoTargets'; }
        static { this.LABEL = nls.localize(17, null); }
        constructor() {
            super({
                id: StepIntoTargetsAction.ID,
                label: StepIntoTargetsAction.LABEL,
                alias: 'Debug: Step Into Target',
                precondition: contextkey_1.$Ii.and(debug_1.$XG, debug_1.$yG, debug_1.$uG.isEqualTo('stopped'), editorContextKeys_1.EditorContextKeys.editorTextFocus),
                contextMenuOpts: {
                    group: 'debug',
                    order: 1.5
                }
            });
        }
        async run(accessor, editor) {
            const debugService = accessor.get(debug_1.$nH);
            const contextMenuService = accessor.get(contextView_1.$WZ);
            const uriIdentityService = accessor.get(uriIdentity_1.$Ck);
            const session = debugService.getViewModel().focusedSession;
            const frame = debugService.getViewModel().focusedStackFrame;
            const selection = editor.getSelection();
            const targetPosition = selection?.getPosition() || (frame && { lineNumber: frame.range.startLineNumber, column: frame.range.startColumn });
            if (!session || !frame || !editor.hasModel() || !uriIdentityService.extUri.isEqual(editor.getModel().uri, frame.source.uri)) {
                if (targetPosition) {
                    messageController_1.$M2.get(editor)?.showMessage(NO_TARGETS_MESSAGE, targetPosition);
                }
                return;
            }
            const targets = await session.stepInTargets(frame.frameId);
            if (!targets?.length) {
                messageController_1.$M2.get(editor)?.showMessage(NO_TARGETS_MESSAGE, targetPosition);
                return;
            }
            // If there is a selection, try to find the best target with a position to step into.
            if (selection) {
                const positionalTargets = [];
                for (const target of targets) {
                    if (target.line) {
                        positionalTargets.push({
                            start: new position_1.$js(target.line, target.column || 1),
                            end: target.endLine ? new position_1.$js(target.endLine, target.endColumn || 1) : undefined,
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
            const editorCoords = (0, dom_1.$FO)(editor.getDomNode());
            const x = editorCoords.left + cursorCoords.left;
            const y = editorCoords.top + cursorCoords.top + cursorCoords.height;
            contextMenuService.showContextMenu({
                getAnchor: () => ({ x, y }),
                getActions: () => {
                    return targets.map(t => new actions_1.$gi(`stepIntoTarget:${t.id}`, t.label, undefined, true, () => session.stepIn(frame.thread.threadId, t.id)));
                }
            });
        }
    }
    class GoToBreakpointAction extends editorExtensions_1.$sV {
        constructor(d, opts) {
            super(opts);
            this.d = d;
        }
        async run(accessor, editor) {
            const debugService = accessor.get(debug_1.$nH);
            const editorService = accessor.get(editorService_1.$9C);
            const uriIdentityService = accessor.get(uriIdentity_1.$Ck);
            if (editor.hasModel()) {
                const currentUri = editor.getModel().uri;
                const currentLine = editor.getPosition().lineNumber;
                //Breakpoints returned from `getBreakpoints` are already sorted.
                const allEnabledBreakpoints = debugService.getModel().getBreakpoints({ enabledOnly: true });
                //Try to find breakpoint in current file
                let moveBreakpoint = this.d
                    ? allEnabledBreakpoints.filter(bp => uriIdentityService.extUri.isEqual(bp.uri, currentUri) && bp.lineNumber > currentLine).shift()
                    : allEnabledBreakpoints.filter(bp => uriIdentityService.extUri.isEqual(bp.uri, currentUri) && bp.lineNumber < currentLine).pop();
                //Try to find breakpoints in following files
                if (!moveBreakpoint) {
                    moveBreakpoint =
                        this.d
                            ? allEnabledBreakpoints.filter(bp => bp.uri.toString() > currentUri.toString()).shift()
                            : allEnabledBreakpoints.filter(bp => bp.uri.toString() < currentUri.toString()).pop();
                }
                //Move to first or last possible breakpoint
                if (!moveBreakpoint && allEnabledBreakpoints.length) {
                    moveBreakpoint = this.d ? allEnabledBreakpoints[0] : allEnabledBreakpoints[allEnabledBreakpoints.length - 1];
                }
                if (moveBreakpoint) {
                    return (0, breakpointsView_1.$$Fb)(moveBreakpoint, false, true, false, debugService, editorService);
                }
            }
        }
    }
    class GoToNextBreakpointAction extends GoToBreakpointAction {
        constructor() {
            super(true, {
                id: 'editor.debug.action.goToNextBreakpoint',
                label: nls.localize(18, null),
                alias: 'Debug: Go to Next Breakpoint',
                precondition: debug_1.$ZG
            });
        }
    }
    class GoToPreviousBreakpointAction extends GoToBreakpointAction {
        constructor() {
            super(false, {
                id: 'editor.debug.action.goToPreviousBreakpoint',
                label: nls.localize(19, null),
                alias: 'Debug: Go to Previous Breakpoint',
                precondition: debug_1.$ZG
            });
        }
    }
    class CloseExceptionWidgetAction extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.debug.action.closeExceptionWidget',
                label: nls.localize(20, null),
                alias: 'Close Exception Widget',
                precondition: debug_1.$_G,
                kbOpts: {
                    primary: 9 /* KeyCode.Escape */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        async run(_accessor, editor) {
            const contribution = editor.getContribution(debug_1.$hH);
            contribution?.closeExceptionWidget();
        }
    }
    (0, actions_2.$Xu)(OpenDisassemblyViewAction);
    (0, actions_2.$Xu)(ToggleDisassemblyViewSourceCodeAction);
    (0, actions_2.$Xu)(ToggleBreakpointAction);
    (0, editorExtensions_1.$xV)(ConditionalBreakpointAction);
    (0, editorExtensions_1.$xV)(LogPointAction);
    (0, editorExtensions_1.$xV)(EditBreakpointAction);
    (0, editorExtensions_1.$xV)($lRb);
    (0, editorExtensions_1.$xV)(StepIntoTargetsAction);
    (0, editorExtensions_1.$xV)($mRb);
    (0, editorExtensions_1.$xV)($nRb);
    (0, editorExtensions_1.$xV)(ShowDebugHoverAction);
    (0, editorExtensions_1.$xV)(GoToNextBreakpointAction);
    (0, editorExtensions_1.$xV)(GoToPreviousBreakpointAction);
    (0, editorExtensions_1.$xV)(CloseExceptionWidgetAction);
});
//# sourceMappingURL=debugEditorActions.js.map