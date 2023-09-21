/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/base/common/resources", "vs/base/common/uri", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/dialogs/common/dialogs", "vs/platform/opener/common/opener", "vs/platform/storage/common/storage", "vs/workbench/contrib/mergeEditor/browser/mergeEditorInput", "vs/workbench/contrib/mergeEditor/browser/view/mergeEditor", "vs/workbench/contrib/mergeEditor/common/mergeEditor", "vs/workbench/services/editor/common/editorService"], function (require, exports, codicons_1, resources_1, uri_1, nls_1, actions_1, contextkey_1, dialogs_1, opener_1, storage_1, mergeEditorInput_1, mergeEditor_1, mergeEditor_2, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AcceptMerge = exports.ResetCloseWithConflictsChoice = exports.ResetToBaseAndAutoMergeCommand = exports.AcceptAllInput2 = exports.AcceptAllInput1 = exports.OpenBaseFile = exports.CompareInput2WithBaseCommand = exports.CompareInput1WithBaseCommand = exports.ToggleActiveConflictInput2 = exports.ToggleActiveConflictInput1 = exports.GoToPreviousUnhandledConflict = exports.GoToNextUnhandledConflict = exports.OpenResultResource = exports.ShowHideCenterBase = exports.ShowHideTopBase = exports.ShowHideBase = exports.ShowNonConflictingChanges = exports.SetColumnLayout = exports.SetMixedLayout = exports.OpenMergeEditor = void 0;
    class MergeEditorAction extends actions_1.Action2 {
        constructor(desc) {
            super(desc);
        }
        run(accessor) {
            const { activeEditorPane } = accessor.get(editorService_1.IEditorService);
            if (activeEditorPane instanceof mergeEditor_1.MergeEditor) {
                const vm = activeEditorPane.viewModel.get();
                if (!vm) {
                    return;
                }
                this.runWithViewModel(vm, accessor);
            }
        }
    }
    class MergeEditorAction2 extends actions_1.Action2 {
        constructor(desc) {
            super(desc);
        }
        run(accessor, ...args) {
            const { activeEditorPane } = accessor.get(editorService_1.IEditorService);
            if (activeEditorPane instanceof mergeEditor_1.MergeEditor) {
                const vm = activeEditorPane.viewModel.get();
                if (!vm) {
                    return;
                }
                return this.runWithMergeEditor({
                    viewModel: vm,
                    inputModel: activeEditorPane.inputModel.get(),
                    input: activeEditorPane.input,
                    editorIdentifier: {
                        editor: activeEditorPane.input,
                        groupId: activeEditorPane.group.id,
                    }
                }, accessor, ...args);
            }
        }
    }
    class OpenMergeEditor extends actions_1.Action2 {
        constructor() {
            super({
                id: '_open.mergeEditor',
                title: { value: (0, nls_1.localize)('title', "Open Merge Editor"), original: 'Open Merge Editor' },
            });
        }
        run(accessor, ...args) {
            const validatedArgs = IRelaxedOpenArgs.validate(args[0]);
            const input = {
                base: { resource: validatedArgs.base },
                input1: { resource: validatedArgs.input1.uri, label: validatedArgs.input1.title, description: validatedArgs.input1.description, detail: validatedArgs.input1.detail },
                input2: { resource: validatedArgs.input2.uri, label: validatedArgs.input2.title, description: validatedArgs.input2.description, detail: validatedArgs.input2.detail },
                result: { resource: validatedArgs.output },
                options: { preserveFocus: true }
            };
            accessor.get(editorService_1.IEditorService).openEditor(input);
        }
    }
    exports.OpenMergeEditor = OpenMergeEditor;
    var IRelaxedOpenArgs;
    (function (IRelaxedOpenArgs) {
        function validate(obj) {
            if (!obj || typeof obj !== 'object') {
                throw new TypeError('invalid argument');
            }
            const o = obj;
            const base = toUri(o.base);
            const output = toUri(o.output);
            const input1 = toInputData(o.input1);
            const input2 = toInputData(o.input2);
            return { base, input1, input2, output };
        }
        IRelaxedOpenArgs.validate = validate;
        function toInputData(obj) {
            if (typeof obj === 'string') {
                return new mergeEditorInput_1.MergeEditorInputData(uri_1.URI.parse(obj, true), undefined, undefined, undefined);
            }
            if (!obj || typeof obj !== 'object') {
                throw new TypeError('invalid argument');
            }
            if (isUriComponents(obj)) {
                return new mergeEditorInput_1.MergeEditorInputData(uri_1.URI.revive(obj), undefined, undefined, undefined);
            }
            const o = obj;
            const title = o.title;
            const uri = toUri(o.uri);
            const detail = o.detail;
            const description = o.description;
            return new mergeEditorInput_1.MergeEditorInputData(uri, title, detail, description);
        }
        function toUri(obj) {
            if (typeof obj === 'string') {
                return uri_1.URI.parse(obj, true);
            }
            else if (obj && typeof obj === 'object') {
                return uri_1.URI.revive(obj);
            }
            throw new TypeError('invalid argument');
        }
        function isUriComponents(obj) {
            if (!obj || typeof obj !== 'object') {
                return false;
            }
            const o = obj;
            return typeof o.scheme === 'string'
                && typeof o.authority === 'string'
                && typeof o.path === 'string'
                && typeof o.query === 'string'
                && typeof o.fragment === 'string';
        }
    })(IRelaxedOpenArgs || (IRelaxedOpenArgs = {}));
    class SetMixedLayout extends actions_1.Action2 {
        constructor() {
            super({
                id: 'merge.mixedLayout',
                title: {
                    value: (0, nls_1.localize)('layout.mixed', 'Mixed Layout'),
                    original: 'Mixed Layout',
                },
                toggled: mergeEditor_2.ctxMergeEditorLayout.isEqualTo('mixed'),
                menu: [
                    {
                        id: actions_1.MenuId.EditorTitle,
                        when: mergeEditor_2.ctxIsMergeEditor,
                        group: '1_merge',
                        order: 9,
                    },
                ],
                precondition: mergeEditor_2.ctxIsMergeEditor,
            });
        }
        run(accessor) {
            const { activeEditorPane } = accessor.get(editorService_1.IEditorService);
            if (activeEditorPane instanceof mergeEditor_1.MergeEditor) {
                activeEditorPane.setLayoutKind('mixed');
            }
        }
    }
    exports.SetMixedLayout = SetMixedLayout;
    class SetColumnLayout extends actions_1.Action2 {
        constructor() {
            super({
                id: 'merge.columnLayout',
                title: { value: (0, nls_1.localize)('layout.column', "Column Layout"), original: 'Column Layout' },
                toggled: mergeEditor_2.ctxMergeEditorLayout.isEqualTo('columns'),
                menu: [{
                        id: actions_1.MenuId.EditorTitle,
                        when: mergeEditor_2.ctxIsMergeEditor,
                        group: '1_merge',
                        order: 10,
                    }],
                precondition: mergeEditor_2.ctxIsMergeEditor,
            });
        }
        run(accessor) {
            const { activeEditorPane } = accessor.get(editorService_1.IEditorService);
            if (activeEditorPane instanceof mergeEditor_1.MergeEditor) {
                activeEditorPane.setLayoutKind('columns');
            }
        }
    }
    exports.SetColumnLayout = SetColumnLayout;
    class ShowNonConflictingChanges extends actions_1.Action2 {
        constructor() {
            super({
                id: 'merge.showNonConflictingChanges',
                title: {
                    value: (0, nls_1.localize)('showNonConflictingChanges', 'Show Non-Conflicting Changes'),
                    original: 'Show Non-Conflicting Changes',
                },
                toggled: mergeEditor_2.ctxMergeEditorShowNonConflictingChanges.isEqualTo(true),
                menu: [
                    {
                        id: actions_1.MenuId.EditorTitle,
                        when: mergeEditor_2.ctxIsMergeEditor,
                        group: '3_merge',
                        order: 9,
                    },
                ],
                precondition: mergeEditor_2.ctxIsMergeEditor,
            });
        }
        run(accessor) {
            const { activeEditorPane } = accessor.get(editorService_1.IEditorService);
            if (activeEditorPane instanceof mergeEditor_1.MergeEditor) {
                activeEditorPane.toggleShowNonConflictingChanges();
            }
        }
    }
    exports.ShowNonConflictingChanges = ShowNonConflictingChanges;
    class ShowHideBase extends actions_1.Action2 {
        constructor() {
            super({
                id: 'merge.showBase',
                title: {
                    value: (0, nls_1.localize)('layout.showBase', 'Show Base'),
                    original: 'Show Base',
                },
                toggled: mergeEditor_2.ctxMergeEditorShowBase.isEqualTo(true),
                menu: [
                    {
                        id: actions_1.MenuId.EditorTitle,
                        when: contextkey_1.ContextKeyExpr.and(mergeEditor_2.ctxIsMergeEditor, mergeEditor_2.ctxMergeEditorLayout.isEqualTo('columns')),
                        group: '2_merge',
                        order: 9,
                    },
                ]
            });
        }
        run(accessor) {
            const { activeEditorPane } = accessor.get(editorService_1.IEditorService);
            if (activeEditorPane instanceof mergeEditor_1.MergeEditor) {
                activeEditorPane.toggleBase();
            }
        }
    }
    exports.ShowHideBase = ShowHideBase;
    class ShowHideTopBase extends actions_1.Action2 {
        constructor() {
            super({
                id: 'merge.showBaseTop',
                title: {
                    value: (0, nls_1.localize)('layout.showBaseTop', 'Show Base Top'),
                    original: 'Show Base Top',
                },
                toggled: contextkey_1.ContextKeyExpr.and(mergeEditor_2.ctxMergeEditorShowBase, mergeEditor_2.ctxMergeEditorShowBaseAtTop),
                menu: [
                    {
                        id: actions_1.MenuId.EditorTitle,
                        when: contextkey_1.ContextKeyExpr.and(mergeEditor_2.ctxIsMergeEditor, mergeEditor_2.ctxMergeEditorLayout.isEqualTo('mixed')),
                        group: '2_merge',
                        order: 10,
                    },
                ],
            });
        }
        run(accessor) {
            const { activeEditorPane } = accessor.get(editorService_1.IEditorService);
            if (activeEditorPane instanceof mergeEditor_1.MergeEditor) {
                activeEditorPane.toggleShowBaseTop();
            }
        }
    }
    exports.ShowHideTopBase = ShowHideTopBase;
    class ShowHideCenterBase extends actions_1.Action2 {
        constructor() {
            super({
                id: 'merge.showBaseCenter',
                title: {
                    value: (0, nls_1.localize)('layout.showBaseCenter', 'Show Base Center'),
                    original: 'Show Base Center',
                },
                toggled: contextkey_1.ContextKeyExpr.and(mergeEditor_2.ctxMergeEditorShowBase, mergeEditor_2.ctxMergeEditorShowBaseAtTop.negate()),
                menu: [
                    {
                        id: actions_1.MenuId.EditorTitle,
                        when: contextkey_1.ContextKeyExpr.and(mergeEditor_2.ctxIsMergeEditor, mergeEditor_2.ctxMergeEditorLayout.isEqualTo('mixed')),
                        group: '2_merge',
                        order: 11,
                    },
                ],
            });
        }
        run(accessor) {
            const { activeEditorPane } = accessor.get(editorService_1.IEditorService);
            if (activeEditorPane instanceof mergeEditor_1.MergeEditor) {
                activeEditorPane.toggleShowBaseCenter();
            }
        }
    }
    exports.ShowHideCenterBase = ShowHideCenterBase;
    const mergeEditorCategory = {
        value: (0, nls_1.localize)('mergeEditor', 'Merge Editor'),
        original: 'Merge Editor',
    };
    class OpenResultResource extends MergeEditorAction {
        constructor() {
            super({
                id: 'merge.openResult',
                icon: codicons_1.Codicon.goToFile,
                title: {
                    value: (0, nls_1.localize)('openfile', 'Open File'),
                    original: 'Open File',
                },
                category: mergeEditorCategory,
                menu: [{
                        id: actions_1.MenuId.EditorTitle,
                        when: mergeEditor_2.ctxIsMergeEditor,
                        group: 'navigation',
                        order: 1,
                    }],
                precondition: mergeEditor_2.ctxIsMergeEditor,
            });
        }
        runWithViewModel(viewModel, accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            editorService.openEditor({ resource: viewModel.model.resultTextModel.uri });
        }
    }
    exports.OpenResultResource = OpenResultResource;
    class GoToNextUnhandledConflict extends MergeEditorAction {
        constructor() {
            super({
                id: 'merge.goToNextUnhandledConflict',
                category: mergeEditorCategory,
                title: {
                    value: (0, nls_1.localize)('merge.goToNextUnhandledConflict', 'Go to Next Unhandled Conflict'),
                    original: 'Go to Next Unhandled Conflict',
                },
                icon: codicons_1.Codicon.arrowDown,
                menu: [
                    {
                        id: actions_1.MenuId.EditorTitle,
                        when: mergeEditor_2.ctxIsMergeEditor,
                        group: 'navigation',
                        order: 3
                    },
                ],
                f1: true,
                precondition: mergeEditor_2.ctxIsMergeEditor,
            });
        }
        runWithViewModel(viewModel) {
            viewModel.model.telemetry.reportNavigationToNextConflict();
            viewModel.goToNextModifiedBaseRange(r => !viewModel.model.isHandled(r).get());
        }
    }
    exports.GoToNextUnhandledConflict = GoToNextUnhandledConflict;
    class GoToPreviousUnhandledConflict extends MergeEditorAction {
        constructor() {
            super({
                id: 'merge.goToPreviousUnhandledConflict',
                category: mergeEditorCategory,
                title: {
                    value: (0, nls_1.localize)('merge.goToPreviousUnhandledConflict', 'Go to Previous Unhandled Conflict'),
                    original: 'Go to Previous Unhandled Conflict',
                },
                icon: codicons_1.Codicon.arrowUp,
                menu: [
                    {
                        id: actions_1.MenuId.EditorTitle,
                        when: mergeEditor_2.ctxIsMergeEditor,
                        group: 'navigation',
                        order: 2
                    },
                ],
                f1: true,
                precondition: mergeEditor_2.ctxIsMergeEditor,
            });
        }
        runWithViewModel(viewModel) {
            viewModel.model.telemetry.reportNavigationToPreviousConflict();
            viewModel.goToPreviousModifiedBaseRange(r => !viewModel.model.isHandled(r).get());
        }
    }
    exports.GoToPreviousUnhandledConflict = GoToPreviousUnhandledConflict;
    class ToggleActiveConflictInput1 extends MergeEditorAction {
        constructor() {
            super({
                id: 'merge.toggleActiveConflictInput1',
                category: mergeEditorCategory,
                title: {
                    value: (0, nls_1.localize)('merge.toggleCurrentConflictFromLeft', 'Toggle Current Conflict from Left'),
                    original: 'Toggle Current Conflict from Left',
                },
                f1: true,
                precondition: mergeEditor_2.ctxIsMergeEditor,
            });
        }
        runWithViewModel(viewModel) {
            viewModel.toggleActiveConflict(1);
        }
    }
    exports.ToggleActiveConflictInput1 = ToggleActiveConflictInput1;
    class ToggleActiveConflictInput2 extends MergeEditorAction {
        constructor() {
            super({
                id: 'merge.toggleActiveConflictInput2',
                category: mergeEditorCategory,
                title: {
                    value: (0, nls_1.localize)('merge.toggleCurrentConflictFromRight', 'Toggle Current Conflict from Right'),
                    original: 'Toggle Current Conflict from Right',
                },
                f1: true,
                precondition: mergeEditor_2.ctxIsMergeEditor,
            });
        }
        runWithViewModel(viewModel) {
            viewModel.toggleActiveConflict(2);
        }
    }
    exports.ToggleActiveConflictInput2 = ToggleActiveConflictInput2;
    class CompareInput1WithBaseCommand extends MergeEditorAction {
        constructor() {
            super({
                id: 'mergeEditor.compareInput1WithBase',
                category: mergeEditorCategory,
                title: {
                    value: (0, nls_1.localize)('mergeEditor.compareInput1WithBase', 'Compare Input 1 With Base'),
                    original: 'Compare Input 1 With Base',
                },
                shortTitle: (0, nls_1.localize)('mergeEditor.compareWithBase', 'Compare With Base'),
                f1: true,
                precondition: mergeEditor_2.ctxIsMergeEditor,
                menu: { id: actions_1.MenuId.MergeInput1Toolbar }
            });
        }
        runWithViewModel(viewModel, accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            mergeEditorCompare(viewModel, editorService, 1);
        }
    }
    exports.CompareInput1WithBaseCommand = CompareInput1WithBaseCommand;
    class CompareInput2WithBaseCommand extends MergeEditorAction {
        constructor() {
            super({
                id: 'mergeEditor.compareInput2WithBase',
                category: mergeEditorCategory,
                title: {
                    value: (0, nls_1.localize)('mergeEditor.compareInput2WithBase', 'Compare Input 2 With Base'),
                    original: 'Compare Input 2 With Base',
                },
                shortTitle: (0, nls_1.localize)('mergeEditor.compareWithBase', 'Compare With Base'),
                f1: true,
                precondition: mergeEditor_2.ctxIsMergeEditor,
                menu: { id: actions_1.MenuId.MergeInput2Toolbar }
            });
        }
        runWithViewModel(viewModel, accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            mergeEditorCompare(viewModel, editorService, 2);
        }
    }
    exports.CompareInput2WithBaseCommand = CompareInput2WithBaseCommand;
    async function mergeEditorCompare(viewModel, editorService, inputNumber) {
        editorService.openEditor(editorService.activeEditor, { pinned: true });
        const model = viewModel.model;
        const base = model.base;
        const input = inputNumber === 1 ? viewModel.inputCodeEditorView1.editor : viewModel.inputCodeEditorView2.editor;
        const lineNumber = input.getPosition().lineNumber;
        await editorService.openEditor({
            original: { resource: base.uri },
            modified: { resource: input.getModel().uri },
            options: {
                selection: {
                    startLineNumber: lineNumber,
                    startColumn: 1,
                },
                revealIfOpened: true,
                revealIfVisible: true,
            }
        });
    }
    class OpenBaseFile extends MergeEditorAction {
        constructor() {
            super({
                id: 'merge.openBaseEditor',
                category: mergeEditorCategory,
                title: {
                    value: (0, nls_1.localize)('merge.openBaseEditor', 'Open Base File'),
                    original: 'Open Base File',
                },
                f1: true,
                precondition: mergeEditor_2.ctxIsMergeEditor,
            });
        }
        runWithViewModel(viewModel, accessor) {
            const openerService = accessor.get(opener_1.IOpenerService);
            openerService.open(viewModel.model.base.uri);
        }
    }
    exports.OpenBaseFile = OpenBaseFile;
    class AcceptAllInput1 extends MergeEditorAction {
        constructor() {
            super({
                id: 'merge.acceptAllInput1',
                category: mergeEditorCategory,
                title: {
                    value: (0, nls_1.localize)('merge.acceptAllInput1', 'Accept All Changes from Left'),
                    original: 'Accept All Changes from Left',
                },
                f1: true,
                precondition: mergeEditor_2.ctxIsMergeEditor,
                menu: [
                    { id: actions_1.MenuId.MergeInput1Toolbar, }
                ]
            });
        }
        runWithViewModel(viewModel) {
            viewModel.acceptAll(1);
        }
    }
    exports.AcceptAllInput1 = AcceptAllInput1;
    class AcceptAllInput2 extends MergeEditorAction {
        constructor() {
            super({
                id: 'merge.acceptAllInput2',
                category: mergeEditorCategory,
                title: {
                    value: (0, nls_1.localize)('merge.acceptAllInput2', 'Accept All Changes from Right'),
                    original: 'Accept All Changes from Right',
                },
                f1: true,
                precondition: mergeEditor_2.ctxIsMergeEditor,
                menu: [
                    { id: actions_1.MenuId.MergeInput2Toolbar, }
                ]
            });
        }
        runWithViewModel(viewModel) {
            viewModel.acceptAll(2);
        }
    }
    exports.AcceptAllInput2 = AcceptAllInput2;
    class ResetToBaseAndAutoMergeCommand extends MergeEditorAction {
        constructor() {
            super({
                id: 'mergeEditor.resetResultToBaseAndAutoMerge',
                category: mergeEditorCategory,
                title: {
                    value: (0, nls_1.localize)('mergeEditor.resetResultToBaseAndAutoMerge', 'Reset Result'),
                    original: 'Reset Result',
                },
                shortTitle: (0, nls_1.localize)('mergeEditor.resetResultToBaseAndAutoMerge.short', 'Reset'),
                f1: true,
                precondition: mergeEditor_2.ctxIsMergeEditor,
                menu: { id: actions_1.MenuId.MergeInputResultToolbar }
            });
        }
        runWithViewModel(viewModel, accessor) {
            viewModel.model.reset();
        }
    }
    exports.ResetToBaseAndAutoMergeCommand = ResetToBaseAndAutoMergeCommand;
    class ResetCloseWithConflictsChoice extends actions_1.Action2 {
        constructor() {
            super({
                id: 'mergeEditor.resetCloseWithConflictsChoice',
                category: mergeEditorCategory,
                title: {
                    value: (0, nls_1.localize)('mergeEditor.resetChoice', 'Reset Choice for \'Close with Conflicts\''),
                    original: 'Reset Choice for \'Close with Conflicts\'',
                },
                f1: true,
            });
        }
        run(accessor) {
            accessor.get(storage_1.IStorageService).remove(mergeEditor_2.StorageCloseWithConflicts, 0 /* StorageScope.PROFILE */);
        }
    }
    exports.ResetCloseWithConflictsChoice = ResetCloseWithConflictsChoice;
    // this is an API command
    class AcceptMerge extends MergeEditorAction2 {
        constructor() {
            super({
                id: 'mergeEditor.acceptMerge',
                category: mergeEditorCategory,
                title: {
                    value: (0, nls_1.localize)('mergeEditor.acceptMerge', 'Complete Merge'),
                    original: 'Complete Merge',
                },
                f1: false,
                precondition: mergeEditor_2.ctxIsMergeEditor
            });
        }
        async runWithMergeEditor({ inputModel, editorIdentifier, viewModel }, accessor) {
            const dialogService = accessor.get(dialogs_1.IDialogService);
            const editorService = accessor.get(editorService_1.IEditorService);
            if (viewModel.model.unhandledConflictsCount.get() > 0) {
                const { confirmed } = await dialogService.confirm({
                    message: (0, nls_1.localize)('mergeEditor.acceptMerge.unhandledConflicts.message', "Do you want to complete the merge of {0}?", (0, resources_1.basename)(inputModel.resultUri)),
                    detail: (0, nls_1.localize)('mergeEditor.acceptMerge.unhandledConflicts.detail', "The file contains unhandled conflicts."),
                    primaryButton: (0, nls_1.localize)({ key: 'mergeEditor.acceptMerge.unhandledConflicts.accept', comment: ['&& denotes a mnemonic'] }, "&&Complete with Conflicts")
                });
                if (!confirmed) {
                    return {
                        successful: false
                    };
                }
            }
            await inputModel.accept();
            await editorService.closeEditor(editorIdentifier);
            return {
                successful: true
            };
        }
    }
    exports.AcceptMerge = AcceptMerge;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9tZXJnZUVkaXRvci9icm93c2VyL2NvbW1hbmRzL2NvbW1hbmRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQXNCaEcsTUFBZSxpQkFBa0IsU0FBUSxpQkFBTztRQUMvQyxZQUFZLElBQStCO1lBQzFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNiLENBQUM7UUFFRCxHQUFHLENBQUMsUUFBMEI7WUFDN0IsTUFBTSxFQUFFLGdCQUFnQixFQUFFLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyw4QkFBYyxDQUFDLENBQUM7WUFDMUQsSUFBSSxnQkFBZ0IsWUFBWSx5QkFBVyxFQUFFO2dCQUM1QyxNQUFNLEVBQUUsR0FBRyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQzVDLElBQUksQ0FBQyxFQUFFLEVBQUU7b0JBQ1IsT0FBTztpQkFDUDtnQkFDRCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDO2FBQ3BDO1FBQ0YsQ0FBQztLQUdEO0lBU0QsTUFBZSxrQkFBbUIsU0FBUSxpQkFBTztRQUNoRCxZQUFZLElBQStCO1lBQzFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNiLENBQUM7UUFFUSxHQUFHLENBQUMsUUFBMEIsRUFBRSxHQUFHLElBQVc7WUFDdEQsTUFBTSxFQUFFLGdCQUFnQixFQUFFLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyw4QkFBYyxDQUFDLENBQUM7WUFDMUQsSUFBSSxnQkFBZ0IsWUFBWSx5QkFBVyxFQUFFO2dCQUM1QyxNQUFNLEVBQUUsR0FBRyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQzVDLElBQUksQ0FBQyxFQUFFLEVBQUU7b0JB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