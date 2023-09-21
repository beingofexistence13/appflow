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
define(["require", "exports", "vs/nls", "vs/base/common/lifecycle", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/editor/common/editorContextKeys", "vs/base/common/codicons", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/services/editor/common/editorService"], function (require, exports, nls, lifecycle_1, editorExtensions_1, codeEditorService_1, actions_1, contextkey_1, editorContextKeys_1, codicons_1, platform_1, contributions_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.readTransientState = exports.writeTransientState = void 0;
    const transientWordWrapState = 'transientWordWrapState';
    const isWordWrapMinifiedKey = 'isWordWrapMinified';
    const isDominatedByLongLinesKey = 'isDominatedByLongLines';
    const CAN_TOGGLE_WORD_WRAP = new contextkey_1.RawContextKey('canToggleWordWrap', false, true);
    const EDITOR_WORD_WRAP = new contextkey_1.RawContextKey('editorWordWrap', false, nls.localize('editorWordWrap', 'Whether the editor is currently using word wrapping.'));
    /**
     * Store (in memory) the word wrap state for a particular model.
     */
    function writeTransientState(model, state, codeEditorService) {
        codeEditorService.setTransientModelProperty(model, transientWordWrapState, state);
    }
    exports.writeTransientState = writeTransientState;
    /**
     * Read (in memory) the word wrap state for a particular model.
     */
    function readTransientState(model, codeEditorService) {
        return codeEditorService.getTransientModelProperty(model, transientWordWrapState);
    }
    exports.readTransientState = readTransientState;
    const TOGGLE_WORD_WRAP_ID = 'editor.action.toggleWordWrap';
    class ToggleWordWrapAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: TOGGLE_WORD_WRAP_ID,
                label: nls.localize('toggle.wordwrap', "View: Toggle Word Wrap"),
                alias: 'View: Toggle Word Wrap',
                precondition: undefined,
                kbOpts: {
                    kbExpr: null,
                    primary: 512 /* KeyMod.Alt */ | 56 /* KeyCode.KeyZ */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(accessor, editor) {
            const codeEditorService = accessor.get(codeEditorService_1.ICodeEditorService);
            if (!canToggleWordWrap(codeEditorService, editor)) {
                return;
            }
            const model = editor.getModel();
            // Read the current state
            const transientState = readTransientState(model, codeEditorService);
            // Compute the new state
            let newState;
            if (transientState) {
                newState = null;
            }
            else {
                const actualWrappingInfo = editor.getOption(144 /* EditorOption.wrappingInfo */);
                const wordWrapOverride = (actualWrappingInfo.wrappingColumn === -1 ? 'on' : 'off');
                newState = { wordWrapOverride };
            }
            // Write the new state
            // (this will cause an event and the controller will apply the state)
            writeTransientState(model, newState, codeEditorService);
            // if we are in a diff editor, update the other editor (if possible)
            const diffEditor = findDiffEditorContainingCodeEditor(editor, codeEditorService);
            if (diffEditor) {
                const originalEditor = diffEditor.getOriginalEditor();
                const modifiedEditor = diffEditor.getModifiedEditor();
                const otherEditor = (originalEditor === editor ? modifiedEditor : originalEditor);
                if (canToggleWordWrap(codeEditorService, otherEditor)) {
                    writeTransientState(otherEditor.getModel(), newState, codeEditorService);
                    diffEditor.updateOptions({});
                }
            }
        }
    }
    /**
     * If `editor` is the original or modified editor of a diff editor, it returns it.
     * It returns null otherwise.
     */
    function findDiffEditorContainingCodeEditor(editor, codeEditorService) {
        if (!editor.getOption(61 /* EditorOption.inDiffEditor */)) {
            return null;
        }
        for (const diffEditor of codeEditorService.listDiffEditors()) {
            const originalEditor = diffEditor.getOriginalEditor();
            const modifiedEditor = diffEditor.getModifiedEditor();
            if (originalEditor === editor || modifiedEditor === editor) {
                return diffEditor;
            }
        }
        return null;
    }
    let ToggleWordWrapController = class ToggleWordWrapController extends lifecycle_1.Disposable {
        static { this.ID = 'editor.contrib.toggleWordWrapController'; }
        constructor(_editor, _contextKeyService, _codeEditorService) {
            super();
            this._editor = _editor;
            this._contextKeyService = _contextKeyService;
            this._codeEditorService = _codeEditorService;
            const options = this._editor.getOptions();
            const wrappingInfo = options.get(144 /* EditorOption.wrappingInfo */);
            const isWordWrapMinified = this._contextKeyService.createKey(isWordWrapMinifiedKey, wrappingInfo.isWordWrapMinified);
            const isDominatedByLongLines = this._contextKeyService.createKey(isDominatedByLongLinesKey, wrappingInfo.isDominatedByLongLines);
            let currentlyApplyingEditorConfig = false;
            this._register(_editor.onDidChangeConfiguration((e) => {
                if (!e.hasChanged(144 /* EditorOption.wrappingInfo */)) {
                    return;
                }
                const options = this._editor.getOptions();
                const wrappingInfo = options.get(144 /* EditorOption.wrappingInfo */);
                isWordWrapMinified.set(wrappingInfo.isWordWrapMinified);
                isDominatedByLongLines.set(wrappingInfo.isDominatedByLongLines);
                if (!currentlyApplyingEditorConfig) {
                    // I am not the cause of the word wrap getting changed
                    ensureWordWrapSettings();
                }
            }));
            this._register(_editor.onDidChangeModel((e) => {
                ensureWordWrapSettings();
            }));
            this._register(_codeEditorService.onDidChangeTransientModelProperty(() => {
                ensureWordWrapSettings();
            }));
            const ensureWordWrapSettings = () => {
                if (!canToggleWordWrap(this._codeEditorService, this._editor)) {
                    return;
                }
                const transientState = readTransientState(this._editor.getModel(), this._codeEditorService);
                // Apply the state
                try {
                    currentlyApplyingEditorConfig = true;
                    this._applyWordWrapState(transientState);
                }
                finally {
                    currentlyApplyingEditorConfig = false;
                }
            };
        }
        _applyWordWrapState(state) {
            const wordWrapOverride2 = state ? state.wordWrapOverride : 'inherit';
            this._editor.updateOptions({
                wordWrapOverride2: wordWrapOverride2
            });
        }
    };
    ToggleWordWrapController = __decorate([
        __param(1, contextkey_1.IContextKeyService),
        __param(2, codeEditorService_1.ICodeEditorService)
    ], ToggleWordWrapController);
    let DiffToggleWordWrapController = class DiffToggleWordWrapController extends lifecycle_1.Disposable {
        static { this.ID = 'diffeditor.contrib.toggleWordWrapController'; }
        constructor(_diffEditor, _codeEditorService) {
            super();
            this._diffEditor = _diffEditor;
            this._codeEditorService = _codeEditorService;
            this._register(this._diffEditor.onDidChangeModel(() => {
                this._ensureSyncedWordWrapToggle();
            }));
        }
        _ensureSyncedWordWrapToggle() {
            const originalEditor = this._diffEditor.getOriginalEditor();
            const modifiedEditor = this._diffEditor.getModifiedEditor();
            if (!originalEditor.hasModel() || !modifiedEditor.hasModel()) {
                return;
            }
            const originalTransientState = readTransientState(originalEditor.getModel(), this._codeEditorService);
            const modifiedTransientState = readTransientState(modifiedEditor.getModel(), this._codeEditorService);
            if (originalTransientState && !modifiedTransientState && canToggleWordWrap(this._codeEditorService, originalEditor)) {
                writeTransientState(modifiedEditor.getModel(), originalTransientState, this._codeEditorService);
                this._diffEditor.updateOptions({});
            }
            if (!originalTransientState && modifiedTransientState && canToggleWordWrap(this._codeEditorService, modifiedEditor)) {
                writeTransientState(originalEditor.getModel(), modifiedTransientState, this._codeEditorService);
                this._diffEditor.updateOptions({});
            }
        }
    };
    DiffToggleWordWrapController = __decorate([
        __param(1, codeEditorService_1.ICodeEditorService)
    ], DiffToggleWordWrapController);
    function canToggleWordWrap(codeEditorService, editor) {
        if (!editor) {
            return false;
        }
        if (editor.isSimpleWidget) {
            // in a simple widget...
            return false;
        }
        // Ensure correct word wrap settings
        const model = editor.getModel();
        if (!model) {
            return false;
        }
        if (model.uri.scheme === 'output') {
            // in output editor
            return false;
        }
        if (editor.getOption(61 /* EditorOption.inDiffEditor */)) {
            // this editor belongs to a diff editor
            for (const diffEditor of codeEditorService.listDiffEditors()) {
                if (diffEditor.getOriginalEditor() === editor && !diffEditor.renderSideBySide) {
                    // this editor is the left side of an inline diff editor
                    return false;
                }
            }
        }
        return true;
    }
    let EditorWordWrapContextKeyTracker = class EditorWordWrapContextKeyTracker {
        constructor(_editorService, _codeEditorService, _contextService) {
            this._editorService = _editorService;
            this._codeEditorService = _codeEditorService;
            this._contextService = _contextService;
            window.addEventListener('focus', () => this._update(), true);
            window.addEventListener('blur', () => this._update(), true);
            this._editorService.onDidActiveEditorChange(() => this._update());
            this._canToggleWordWrap = CAN_TOGGLE_WORD_WRAP.bindTo(this._contextService);
            this._editorWordWrap = EDITOR_WORD_WRAP.bindTo(this._contextService);
            this._activeEditor = null;
            this._activeEditorListener = new lifecycle_1.DisposableStore();
            this._update();
        }
        _update() {
            const activeEditor = this._codeEditorService.getFocusedCodeEditor() || this._codeEditorService.getActiveCodeEditor();
            if (this._activeEditor === activeEditor) {
                // no change
                return;
            }
            this._activeEditorListener.clear();
            this._activeEditor = activeEditor;
            if (activeEditor) {
                this._activeEditorListener.add(activeEditor.onDidChangeModel(() => this._updateFromCodeEditor()));
                this._activeEditorListener.add(activeEditor.onDidChangeConfiguration((e) => {
                    if (e.hasChanged(144 /* EditorOption.wrappingInfo */)) {
                        this._updateFromCodeEditor();
                    }
                }));
                this._updateFromCodeEditor();
            }
        }
        _updateFromCodeEditor() {
            if (!canToggleWordWrap(this._codeEditorService, this._activeEditor)) {
                return this._setValues(false, false);
            }
            else {
                const wrappingInfo = this._activeEditor.getOption(144 /* EditorOption.wrappingInfo */);
                this._setValues(true, wrappingInfo.wrappingColumn !== -1);
            }
        }
        _setValues(canToggleWordWrap, isWordWrap) {
            this._canToggleWordWrap.set(canToggleWordWrap);
            this._editorWordWrap.set(isWordWrap);
        }
    };
    EditorWordWrapContextKeyTracker = __decorate([
        __param(0, editorService_1.IEditorService),
        __param(1, codeEditorService_1.ICodeEditorService),
        __param(2, contextkey_1.IContextKeyService)
    ], EditorWordWrapContextKeyTracker);
    const workbenchRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(EditorWordWrapContextKeyTracker, 2 /* LifecyclePhase.Ready */);
    (0, editorExtensions_1.registerEditorContribution)(ToggleWordWrapController.ID, ToggleWordWrapController, 0 /* EditorContributionInstantiation.Eager */); // eager because it needs to change the editor word wrap configuration
    (0, editorExtensions_1.registerDiffEditorContribution)(DiffToggleWordWrapController.ID, DiffToggleWordWrapController);
    (0, editorExtensions_1.registerEditorAction)(ToggleWordWrapAction);
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitle, {
        command: {
            id: TOGGLE_WORD_WRAP_ID,
            title: nls.localize('unwrapMinified', "Disable wrapping for this file"),
            icon: codicons_1.Codicon.wordWrap
        },
        group: 'navigation',
        order: 1,
        when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has(isDominatedByLongLinesKey), contextkey_1.ContextKeyExpr.has(isWordWrapMinifiedKey))
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitle, {
        command: {
            id: TOGGLE_WORD_WRAP_ID,
            title: nls.localize('wrapMinified', "Enable wrapping for this file"),
            icon: codicons_1.Codicon.wordWrap
        },
        group: 'navigation',
        order: 1,
        when: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.inDiffEditor.negate(), contextkey_1.ContextKeyExpr.has(isDominatedByLongLinesKey), contextkey_1.ContextKeyExpr.not(isWordWrapMinifiedKey))
    });
    // View menu
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarViewMenu, {
        command: {
            id: TOGGLE_WORD_WRAP_ID,
            title: nls.localize({ key: 'miToggleWordWrap', comment: ['&& denotes a mnemonic'] }, "&&Word Wrap"),
            toggled: EDITOR_WORD_WRAP,
            precondition: CAN_TOGGLE_WORD_WRAP
        },
        order: 1,
        group: '5_editor'
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9nZ2xlV29yZFdyYXAuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9jb2RlRWRpdG9yL2Jyb3dzZXIvdG9nZ2xlV29yZFdyYXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBcUJoRyxNQUFNLHNCQUFzQixHQUFHLHdCQUF3QixDQUFDO0lBQ3hELE1BQU0scUJBQXFCLEdBQUcsb0JBQW9CLENBQUM7SUFDbkQsTUFBTSx5QkFBeUIsR0FBRyx3QkFBd0IsQ0FBQztJQUMzRCxNQUFNLG9CQUFvQixHQUFHLElBQUksMEJBQWEsQ0FBVSxtQkFBbUIsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDMUYsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLDBCQUFhLENBQVUsZ0JBQWdCLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsc0RBQXNELENBQUMsQ0FBQyxDQUFDO0lBU3JLOztPQUVHO0lBQ0gsU0FBZ0IsbUJBQW1CLENBQUMsS0FBaUIsRUFBRSxLQUFxQyxFQUFFLGlCQUFxQztRQUNsSSxpQkFBaUIsQ0FBQyx5QkFBeUIsQ0FBQyxLQUFLLEVBQUUsc0JBQXNCLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDbkYsQ0FBQztJQUZELGtEQUVDO0lBRUQ7O09BRUc7SUFDSCxTQUFnQixrQkFBa0IsQ0FBQyxLQUFpQixFQUFFLGlCQUFxQztRQUMxRixPQUFPLGlCQUFpQixDQUFDLHlCQUF5QixDQUFDLEtBQUssRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO0lBQ25GLENBQUM7SUFGRCxnREFFQztJQUVELE1BQU0sbUJBQW1CLEdBQUcsOEJBQThCLENBQUM7SUFDM0QsTUFBTSxvQkFBcUIsU0FBUSwrQkFBWTtRQUU5QztZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsbUJBQW1C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