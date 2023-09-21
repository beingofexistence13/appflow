/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/base/common/resources", "vs/base/common/uri", "vs/nls!vs/workbench/contrib/mergeEditor/browser/commands/commands", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/dialogs/common/dialogs", "vs/platform/opener/common/opener", "vs/platform/storage/common/storage", "vs/workbench/contrib/mergeEditor/browser/mergeEditorInput", "vs/workbench/contrib/mergeEditor/browser/view/mergeEditor", "vs/workbench/contrib/mergeEditor/common/mergeEditor", "vs/workbench/services/editor/common/editorService"], function (require, exports, codicons_1, resources_1, uri_1, nls_1, actions_1, contextkey_1, dialogs_1, opener_1, storage_1, mergeEditorInput_1, mergeEditor_1, mergeEditor_2, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$iTb = exports.$hTb = exports.$gTb = exports.$fTb = exports.$eTb = exports.$dTb = exports.$cTb = exports.$bTb = exports.$aTb = exports.$_Sb = exports.$$Sb = exports.$0Sb = exports.$9Sb = exports.$8Sb = exports.$7Sb = exports.$6Sb = exports.$5Sb = exports.$4Sb = exports.$3Sb = exports.$2Sb = void 0;
    class MergeEditorAction extends actions_1.$Wu {
        constructor(desc) {
            super(desc);
        }
        run(accessor) {
            const { activeEditorPane } = accessor.get(editorService_1.$9C);
            if (activeEditorPane instanceof mergeEditor_1.$YSb) {
                const vm = activeEditorPane.viewModel.get();
                if (!vm) {
                    return;
                }
                this.runWithViewModel(vm, accessor);
            }
        }
    }
    class MergeEditorAction2 extends actions_1.$Wu {
        constructor(desc) {
            super(desc);
        }
        run(accessor, ...args) {
            const { activeEditorPane } = accessor.get(editorService_1.$9C);
            if (activeEditorPane instanceof mergeEditor_1.$YSb) {
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
    class $2Sb extends actions_1.$Wu {
        constructor() {
            super({
                id: '_open.mergeEditor',
                title: { value: (0, nls_1.localize)(0, null), original: 'Open Merge Editor' },
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
            accessor.get(editorService_1.$9C).openEditor(input);
        }
    }
    exports.$2Sb = $2Sb;
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
                return new mergeEditorInput_1.$gkb(uri_1.URI.parse(obj, true), undefined, undefined, undefined);
            }
            if (!obj || typeof obj !== 'object') {
                throw new TypeError('invalid argument');
            }
            if (isUriComponents(obj)) {
                return new mergeEditorInput_1.$gkb(uri_1.URI.revive(obj), undefined, undefined, undefined);
            }
            const o = obj;
            const title = o.title;
            const uri = toUri(o.uri);
            const detail = o.detail;
            const description = o.description;
            return new mergeEditorInput_1.$gkb(uri, title, detail, description);
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
    class $3Sb extends actions_1.$Wu {
        constructor() {
            super({
                id: 'merge.mixedLayout',
                title: {
                    value: (0, nls_1.localize)(1, null),
                    original: 'Mixed Layout',
                },
                toggled: mergeEditor_2.$6jb.isEqualTo('mixed'),
                menu: [
                    {
                        id: actions_1.$Ru.EditorTitle,
                        when: mergeEditor_2.$4jb,
                        group: '1_merge',
                        order: 9,
                    },
                ],
                precondition: mergeEditor_2.$4jb,
            });
        }
        run(accessor) {
            const { activeEditorPane } = accessor.get(editorService_1.$9C);
            if (activeEditorPane instanceof mergeEditor_1.$YSb) {
                activeEditorPane.setLayoutKind('mixed');
            }
        }
    }
    exports.$3Sb = $3Sb;
    class $4Sb extends actions_1.$Wu {
        constructor() {
            super({
                id: 'merge.columnLayout',
                title: { value: (0, nls_1.localize)(2, null), original: 'Column Layout' },
                toggled: mergeEditor_2.$6jb.isEqualTo('columns'),
                menu: [{
                        id: actions_1.$Ru.EditorTitle,
                        when: mergeEditor_2.$4jb,
                        group: '1_merge',
                        order: 10,
                    }],
                precondition: mergeEditor_2.$4jb,
            });
        }
        run(accessor) {
            const { activeEditorPane } = accessor.get(editorService_1.$9C);
            if (activeEditorPane instanceof mergeEditor_1.$YSb) {
                activeEditorPane.setLayoutKind('columns');
            }
        }
    }
    exports.$4Sb = $4Sb;
    class $5Sb extends actions_1.$Wu {
        constructor() {
            super({
                id: 'merge.showNonConflictingChanges',
                title: {
                    value: (0, nls_1.localize)(3, null),
                    original: 'Show Non-Conflicting Changes',
                },
                toggled: mergeEditor_2.$9jb.isEqualTo(true),
                menu: [
                    {
                        id: actions_1.$Ru.EditorTitle,
                        when: mergeEditor_2.$4jb,
                        group: '3_merge',
                        order: 9,
                    },
                ],
                precondition: mergeEditor_2.$4jb,
            });
        }
        run(accessor) {
            const { activeEditorPane } = accessor.get(editorService_1.$9C);
            if (activeEditorPane instanceof mergeEditor_1.$YSb) {
                activeEditorPane.toggleShowNonConflictingChanges();
            }
        }
    }
    exports.$5Sb = $5Sb;
    class $6Sb extends actions_1.$Wu {
        constructor() {
            super({
                id: 'merge.showBase',
                title: {
                    value: (0, nls_1.localize)(4, null),
                    original: 'Show Base',
                },
                toggled: mergeEditor_2.$7jb.isEqualTo(true),
                menu: [
                    {
                        id: actions_1.$Ru.EditorTitle,
                        when: contextkey_1.$Ii.and(mergeEditor_2.$4jb, mergeEditor_2.$6jb.isEqualTo('columns')),
                        group: '2_merge',
                        order: 9,
                    },
                ]
            });
        }
        run(accessor) {
            const { activeEditorPane } = accessor.get(editorService_1.$9C);
            if (activeEditorPane instanceof mergeEditor_1.$YSb) {
                activeEditorPane.toggleBase();
            }
        }
    }
    exports.$6Sb = $6Sb;
    class $7Sb extends actions_1.$Wu {
        constructor() {
            super({
                id: 'merge.showBaseTop',
                title: {
                    value: (0, nls_1.localize)(5, null),
                    original: 'Show Base Top',
                },
                toggled: contextkey_1.$Ii.and(mergeEditor_2.$7jb, mergeEditor_2.$8jb),
                menu: [
                    {
                        id: actions_1.$Ru.EditorTitle,
                        when: contextkey_1.$Ii.and(mergeEditor_2.$4jb, mergeEditor_2.$6jb.isEqualTo('mixed')),
                        group: '2_merge',
                        order: 10,
                    },
                ],
            });
        }
        run(accessor) {
            const { activeEditorPane } = accessor.get(editorService_1.$9C);
            if (activeEditorPane instanceof mergeEditor_1.$YSb) {
                activeEditorPane.toggleShowBaseTop();
            }
        }
    }
    exports.$7Sb = $7Sb;
    class $8Sb extends actions_1.$Wu {
        constructor() {
            super({
                id: 'merge.showBaseCenter',
                title: {
                    value: (0, nls_1.localize)(6, null),
                    original: 'Show Base Center',
                },
                toggled: contextkey_1.$Ii.and(mergeEditor_2.$7jb, mergeEditor_2.$8jb.negate()),
                menu: [
                    {
                        id: actions_1.$Ru.EditorTitle,
                        when: contextkey_1.$Ii.and(mergeEditor_2.$4jb, mergeEditor_2.$6jb.isEqualTo('mixed')),
                        group: '2_merge',
                        order: 11,
                    },
                ],
            });
        }
        run(accessor) {
            const { activeEditorPane } = accessor.get(editorService_1.$9C);
            if (activeEditorPane instanceof mergeEditor_1.$YSb) {
                activeEditorPane.toggleShowBaseCenter();
            }
        }
    }
    exports.$8Sb = $8Sb;
    const mergeEditorCategory = {
        value: (0, nls_1.localize)(7, null),
        original: 'Merge Editor',
    };
    class $9Sb extends MergeEditorAction {
        constructor() {
            super({
                id: 'merge.openResult',
                icon: codicons_1.$Pj.goToFile,
                title: {
                    value: (0, nls_1.localize)(8, null),
                    original: 'Open File',
                },
                category: mergeEditorCategory,
                menu: [{
                        id: actions_1.$Ru.EditorTitle,
                        when: mergeEditor_2.$4jb,
                        group: 'navigation',
                        order: 1,
                    }],
                precondition: mergeEditor_2.$4jb,
            });
        }
        runWithViewModel(viewModel, accessor) {
            const editorService = accessor.get(editorService_1.$9C);
            editorService.openEditor({ resource: viewModel.model.resultTextModel.uri });
        }
    }
    exports.$9Sb = $9Sb;
    class $0Sb extends MergeEditorAction {
        constructor() {
            super({
                id: 'merge.goToNextUnhandledConflict',
                category: mergeEditorCategory,
                title: {
                    value: (0, nls_1.localize)(9, null),
                    original: 'Go to Next Unhandled Conflict',
                },
                icon: codicons_1.$Pj.arrowDown,
                menu: [
                    {
                        id: actions_1.$Ru.EditorTitle,
                        when: mergeEditor_2.$4jb,
                        group: 'navigation',
                        order: 3
                    },
                ],
                f1: true,
                precondition: mergeEditor_2.$4jb,
            });
        }
        runWithViewModel(viewModel) {
            viewModel.model.telemetry.reportNavigationToNextConflict();
            viewModel.goToNextModifiedBaseRange(r => !viewModel.model.isHandled(r).get());
        }
    }
    exports.$0Sb = $0Sb;
    class $$Sb extends MergeEditorAction {
        constructor() {
            super({
                id: 'merge.goToPreviousUnhandledConflict',
                category: mergeEditorCategory,
                title: {
                    value: (0, nls_1.localize)(10, null),
                    original: 'Go to Previous Unhandled Conflict',
                },
                icon: codicons_1.$Pj.arrowUp,
                menu: [
                    {
                        id: actions_1.$Ru.EditorTitle,
                        when: mergeEditor_2.$4jb,
                        group: 'navigation',
                        order: 2
                    },
                ],
                f1: true,
                precondition: mergeEditor_2.$4jb,
            });
        }
        runWithViewModel(viewModel) {
            viewModel.model.telemetry.reportNavigationToPreviousConflict();
            viewModel.goToPreviousModifiedBaseRange(r => !viewModel.model.isHandled(r).get());
        }
    }
    exports.$$Sb = $$Sb;
    class $_Sb extends MergeEditorAction {
        constructor() {
            super({
                id: 'merge.toggleActiveConflictInput1',
                category: mergeEditorCategory,
                title: {
                    value: (0, nls_1.localize)(11, null),
                    original: 'Toggle Current Conflict from Left',
                },
                f1: true,
                precondition: mergeEditor_2.$4jb,
            });
        }
        runWithViewModel(viewModel) {
            viewModel.toggleActiveConflict(1);
        }
    }
    exports.$_Sb = $_Sb;
    class $aTb extends MergeEditorAction {
        constructor() {
            super({
                id: 'merge.toggleActiveConflictInput2',
                category: mergeEditorCategory,
                title: {
                    value: (0, nls_1.localize)(12, null),
                    original: 'Toggle Current Conflict from Right',
                },
                f1: true,
                precondition: mergeEditor_2.$4jb,
            });
        }
        runWithViewModel(viewModel) {
            viewModel.toggleActiveConflict(2);
        }
    }
    exports.$aTb = $aTb;
    class $bTb extends MergeEditorAction {
        constructor() {
            super({
                id: 'mergeEditor.compareInput1WithBase',
                category: mergeEditorCategory,
                title: {
                    value: (0, nls_1.localize)(13, null),
                    original: 'Compare Input 1 With Base',
                },
                shortTitle: (0, nls_1.localize)(14, null),
                f1: true,
                precondition: mergeEditor_2.$4jb,
                menu: { id: actions_1.$Ru.MergeInput1Toolbar }
            });
        }
        runWithViewModel(viewModel, accessor) {
            const editorService = accessor.get(editorService_1.$9C);
            mergeEditorCompare(viewModel, editorService, 1);
        }
    }
    exports.$bTb = $bTb;
    class $cTb extends MergeEditorAction {
        constructor() {
            super({
                id: 'mergeEditor.compareInput2WithBase',
                category: mergeEditorCategory,
                title: {
                    value: (0, nls_1.localize)(15, null),
                    original: 'Compare Input 2 With Base',
                },
                shortTitle: (0, nls_1.localize)(16, null),
                f1: true,
                precondition: mergeEditor_2.$4jb,
                menu: { id: actions_1.$Ru.MergeInput2Toolbar }
            });
        }
        runWithViewModel(viewModel, accessor) {
            const editorService = accessor.get(editorService_1.$9C);
            mergeEditorCompare(viewModel, editorService, 2);
        }
    }
    exports.$cTb = $cTb;
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
    class $dTb extends MergeEditorAction {
        constructor() {
            super({
                id: 'merge.openBaseEditor',
                category: mergeEditorCategory,
                title: {
                    value: (0, nls_1.localize)(17, null),
                    original: 'Open Base File',
                },
                f1: true,
                precondition: mergeEditor_2.$4jb,
            });
        }
        runWithViewModel(viewModel, accessor) {
            const openerService = accessor.get(opener_1.$NT);
            openerService.open(viewModel.model.base.uri);
        }
    }
    exports.$dTb = $dTb;
    class $eTb extends MergeEditorAction {
        constructor() {
            super({
                id: 'merge.acceptAllInput1',
                category: mergeEditorCategory,
                title: {
                    value: (0, nls_1.localize)(18, null),
                    original: 'Accept All Changes from Left',
                },
                f1: true,
                precondition: mergeEditor_2.$4jb,
                menu: [
                    { id: actions_1.$Ru.MergeInput1Toolbar, }
                ]
            });
        }
        runWithViewModel(viewModel) {
            viewModel.acceptAll(1);
        }
    }
    exports.$eTb = $eTb;
    class $fTb extends MergeEditorAction {
        constructor() {
            super({
                id: 'merge.acceptAllInput2',
                category: mergeEditorCategory,
                title: {
                    value: (0, nls_1.localize)(19, null),
                    original: 'Accept All Changes from Right',
                },
                f1: true,
                precondition: mergeEditor_2.$4jb,
                menu: [
                    { id: actions_1.$Ru.MergeInput2Toolbar, }
                ]
            });
        }
        runWithViewModel(viewModel) {
            viewModel.acceptAll(2);
        }
    }
    exports.$fTb = $fTb;
    class $gTb extends MergeEditorAction {
        constructor() {
            super({
                id: 'mergeEditor.resetResultToBaseAndAutoMerge',
                category: mergeEditorCategory,
                title: {
                    value: (0, nls_1.localize)(20, null),
                    original: 'Reset Result',
                },
                shortTitle: (0, nls_1.localize)(21, null),
                f1: true,
                precondition: mergeEditor_2.$4jb,
                menu: { id: actions_1.$Ru.MergeInputResultToolbar }
            });
        }
        runWithViewModel(viewModel, accessor) {
            viewModel.model.reset();
        }
    }
    exports.$gTb = $gTb;
    class $hTb extends actions_1.$Wu {
        constructor() {
            super({
                id: 'mergeEditor.resetCloseWithConflictsChoice',
                category: mergeEditorCategory,
                title: {
                    value: (0, nls_1.localize)(22, null),
                    original: 'Reset Choice for \'Close with Conflicts\'',
                },
                f1: true,
            });
        }
        run(accessor) {
            accessor.get(storage_1.$Vo).remove(mergeEditor_2.$_jb, 0 /* StorageScope.PROFILE */);
        }
    }
    exports.$hTb = $hTb;
    // this is an API command
    class $iTb extends MergeEditorAction2 {
        constructor() {
            super({
                id: 'mergeEditor.acceptMerge',
                category: mergeEditorCategory,
                title: {
                    value: (0, nls_1.localize)(23, null),
                    original: 'Complete Merge',
                },
                f1: false,
                precondition: mergeEditor_2.$4jb
            });
        }
        async runWithMergeEditor({ inputModel, editorIdentifier, viewModel }, accessor) {
            const dialogService = accessor.get(dialogs_1.$oA);
            const editorService = accessor.get(editorService_1.$9C);
            if (viewModel.model.unhandledConflictsCount.get() > 0) {
                const { confirmed } = await dialogService.confirm({
                    message: (0, nls_1.localize)(24, null, (0, resources_1.$fg)(inputModel.resultUri)),
                    detail: (0, nls_1.localize)(25, null),
                    primaryButton: (0, nls_1.localize)(26, null)
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
    exports.$iTb = $iTb;
});
//# sourceMappingURL=commands.js.map