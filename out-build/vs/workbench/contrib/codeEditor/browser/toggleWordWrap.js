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
define(["require", "exports", "vs/nls!vs/workbench/contrib/codeEditor/browser/toggleWordWrap", "vs/base/common/lifecycle", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/editor/common/editorContextKeys", "vs/base/common/codicons", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/services/editor/common/editorService"], function (require, exports, nls, lifecycle_1, editorExtensions_1, codeEditorService_1, actions_1, contextkey_1, editorContextKeys_1, codicons_1, platform_1, contributions_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Onb = exports.$Nnb = void 0;
    const transientWordWrapState = 'transientWordWrapState';
    const isWordWrapMinifiedKey = 'isWordWrapMinified';
    const isDominatedByLongLinesKey = 'isDominatedByLongLines';
    const CAN_TOGGLE_WORD_WRAP = new contextkey_1.$2i('canToggleWordWrap', false, true);
    const EDITOR_WORD_WRAP = new contextkey_1.$2i('editorWordWrap', false, nls.localize(0, null));
    /**
     * Store (in memory) the word wrap state for a particular model.
     */
    function $Nnb(model, state, codeEditorService) {
        codeEditorService.setTransientModelProperty(model, transientWordWrapState, state);
    }
    exports.$Nnb = $Nnb;
    /**
     * Read (in memory) the word wrap state for a particular model.
     */
    function $Onb(model, codeEditorService) {
        return codeEditorService.getTransientModelProperty(model, transientWordWrapState);
    }
    exports.$Onb = $Onb;
    const TOGGLE_WORD_WRAP_ID = 'editor.action.toggleWordWrap';
    class ToggleWordWrapAction extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: TOGGLE_WORD_WRAP_ID,
                label: nls.localize(1, null),
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
            const codeEditorService = accessor.get(codeEditorService_1.$nV);
            if (!canToggleWordWrap(codeEditorService, editor)) {
                return;
            }
            const model = editor.getModel();
            // Read the current state
            const transientState = $Onb(model, codeEditorService);
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
            $Nnb(model, newState, codeEditorService);
            // if we are in a diff editor, update the other editor (if possible)
            const diffEditor = findDiffEditorContainingCodeEditor(editor, codeEditorService);
            if (diffEditor) {
                const originalEditor = diffEditor.getOriginalEditor();
                const modifiedEditor = diffEditor.getModifiedEditor();
                const otherEditor = (originalEditor === editor ? modifiedEditor : originalEditor);
                if (canToggleWordWrap(codeEditorService, otherEditor)) {
                    $Nnb(otherEditor.getModel(), newState, codeEditorService);
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
    let ToggleWordWrapController = class ToggleWordWrapController extends lifecycle_1.$kc {
        static { this.ID = 'editor.contrib.toggleWordWrapController'; }
        constructor(a, b, c) {
            super();
            this.a = a;
            this.b = b;
            this.c = c;
            const options = this.a.getOptions();
            const wrappingInfo = options.get(144 /* EditorOption.wrappingInfo */);
            const isWordWrapMinified = this.b.createKey(isWordWrapMinifiedKey, wrappingInfo.isWordWrapMinified);
            const isDominatedByLongLines = this.b.createKey(isDominatedByLongLinesKey, wrappingInfo.isDominatedByLongLines);
            let currentlyApplyingEditorConfig = false;
            this.B(a.onDidChangeConfiguration((e) => {
                if (!e.hasChanged(144 /* EditorOption.wrappingInfo */)) {
                    return;
                }
                const options = this.a.getOptions();
                const wrappingInfo = options.get(144 /* EditorOption.wrappingInfo */);
                isWordWrapMinified.set(wrappingInfo.isWordWrapMinified);
                isDominatedByLongLines.set(wrappingInfo.isDominatedByLongLines);
                if (!currentlyApplyingEditorConfig) {
                    // I am not the cause of the word wrap getting changed
                    ensureWordWrapSettings();
                }
            }));
            this.B(a.onDidChangeModel((e) => {
                ensureWordWrapSettings();
            }));
            this.B(c.onDidChangeTransientModelProperty(() => {
                ensureWordWrapSettings();
            }));
            const ensureWordWrapSettings = () => {
                if (!canToggleWordWrap(this.c, this.a)) {
                    return;
                }
                const transientState = $Onb(this.a.getModel(), this.c);
                // Apply the state
                try {
                    currentlyApplyingEditorConfig = true;
                    this.f(transientState);
                }
                finally {
                    currentlyApplyingEditorConfig = false;
                }
            };
        }
        f(state) {
            const wordWrapOverride2 = state ? state.wordWrapOverride : 'inherit';
            this.a.updateOptions({
                wordWrapOverride2: wordWrapOverride2
            });
        }
    };
    ToggleWordWrapController = __decorate([
        __param(1, contextkey_1.$3i),
        __param(2, codeEditorService_1.$nV)
    ], ToggleWordWrapController);
    let DiffToggleWordWrapController = class DiffToggleWordWrapController extends lifecycle_1.$kc {
        static { this.ID = 'diffeditor.contrib.toggleWordWrapController'; }
        constructor(a, b) {
            super();
            this.a = a;
            this.b = b;
            this.B(this.a.onDidChangeModel(() => {
                this.c();
            }));
        }
        c() {
            const originalEditor = this.a.getOriginalEditor();
            const modifiedEditor = this.a.getModifiedEditor();
            if (!originalEditor.hasModel() || !modifiedEditor.hasModel()) {
                return;
            }
            const originalTransientState = $Onb(originalEditor.getModel(), this.b);
            const modifiedTransientState = $Onb(modifiedEditor.getModel(), this.b);
            if (originalTransientState && !modifiedTransientState && canToggleWordWrap(this.b, originalEditor)) {
                $Nnb(modifiedEditor.getModel(), originalTransientState, this.b);
                this.a.updateOptions({});
            }
            if (!originalTransientState && modifiedTransientState && canToggleWordWrap(this.b, modifiedEditor)) {
                $Nnb(originalEditor.getModel(), modifiedTransientState, this.b);
                this.a.updateOptions({});
            }
        }
    };
    DiffToggleWordWrapController = __decorate([
        __param(1, codeEditorService_1.$nV)
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
        constructor(f, g, h) {
            this.f = f;
            this.g = g;
            this.h = h;
            window.addEventListener('focus', () => this.i(), true);
            window.addEventListener('blur', () => this.i(), true);
            this.f.onDidActiveEditorChange(() => this.i());
            this.a = CAN_TOGGLE_WORD_WRAP.bindTo(this.h);
            this.b = EDITOR_WORD_WRAP.bindTo(this.h);
            this.c = null;
            this.d = new lifecycle_1.$jc();
            this.i();
        }
        i() {
            const activeEditor = this.g.getFocusedCodeEditor() || this.g.getActiveCodeEditor();
            if (this.c === activeEditor) {
                // no change
                return;
            }
            this.d.clear();
            this.c = activeEditor;
            if (activeEditor) {
                this.d.add(activeEditor.onDidChangeModel(() => this.j()));
                this.d.add(activeEditor.onDidChangeConfiguration((e) => {
                    if (e.hasChanged(144 /* EditorOption.wrappingInfo */)) {
                        this.j();
                    }
                }));
                this.j();
            }
        }
        j() {
            if (!canToggleWordWrap(this.g, this.c)) {
                return this.k(false, false);
            }
            else {
                const wrappingInfo = this.c.getOption(144 /* EditorOption.wrappingInfo */);
                this.k(true, wrappingInfo.wrappingColumn !== -1);
            }
        }
        k(canToggleWordWrap, isWordWrap) {
            this.a.set(canToggleWordWrap);
            this.b.set(isWordWrap);
        }
    };
    EditorWordWrapContextKeyTracker = __decorate([
        __param(0, editorService_1.$9C),
        __param(1, codeEditorService_1.$nV),
        __param(2, contextkey_1.$3i)
    ], EditorWordWrapContextKeyTracker);
    const workbenchRegistry = platform_1.$8m.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(EditorWordWrapContextKeyTracker, 2 /* LifecyclePhase.Ready */);
    (0, editorExtensions_1.$AV)(ToggleWordWrapController.ID, ToggleWordWrapController, 0 /* EditorContributionInstantiation.Eager */); // eager because it needs to change the editor word wrap configuration
    (0, editorExtensions_1.$BV)(DiffToggleWordWrapController.ID, DiffToggleWordWrapController);
    (0, editorExtensions_1.$xV)(ToggleWordWrapAction);
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorTitle, {
        command: {
            id: TOGGLE_WORD_WRAP_ID,
            title: nls.localize(2, null),
            icon: codicons_1.$Pj.wordWrap
        },
        group: 'navigation',
        order: 1,
        when: contextkey_1.$Ii.and(contextkey_1.$Ii.has(isDominatedByLongLinesKey), contextkey_1.$Ii.has(isWordWrapMinifiedKey))
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorTitle, {
        command: {
            id: TOGGLE_WORD_WRAP_ID,
            title: nls.localize(3, null),
            icon: codicons_1.$Pj.wordWrap
        },
        group: 'navigation',
        order: 1,
        when: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.inDiffEditor.negate(), contextkey_1.$Ii.has(isDominatedByLongLinesKey), contextkey_1.$Ii.not(isWordWrapMinifiedKey))
    });
    // View menu
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarViewMenu, {
        command: {
            id: TOGGLE_WORD_WRAP_ID,
            title: nls.localize(4, null),
            toggled: EDITOR_WORD_WRAP,
            precondition: CAN_TOGGLE_WORD_WRAP
        },
        order: 1,
        group: '5_editor'
    });
});
//# sourceMappingURL=toggleWordWrap.js.map