/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/codicons", "vs/base/common/extpath", "vs/base/common/uri", "vs/editor/common/languages/language", "vs/nls!vs/workbench/contrib/mergeEditor/electron-sandbox/devCommands", "vs/platform/actions/common/actions", "vs/platform/clipboard/common/clipboardService", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/platform/quickinput/common/quickInput", "vs/workbench/contrib/mergeEditor/browser/view/mergeEditor", "vs/workbench/services/editor/common/editorService"], function (require, exports, buffer_1, codicons_1, extpath_1, uri_1, language_1, nls_1, actions_1, clipboardService_1, environment_1, files_1, quickInput_1, mergeEditor_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Zac = exports.$Yac = void 0;
    const MERGE_EDITOR_CATEGORY = { value: (0, nls_1.localize)(0, null), original: 'Merge Editor (Dev)' };
    class $Yac extends actions_1.$Wu {
        constructor() {
            super({
                id: 'merge.dev.openContentsJson',
                category: MERGE_EDITOR_CATEGORY,
                title: {
                    value: (0, nls_1.localize)(1, null),
                    original: 'Open Merge Editor State from JSON',
                },
                icon: codicons_1.$Pj.layoutCentered,
                f1: true,
            });
        }
        async run(accessor, args) {
            const quickInputService = accessor.get(quickInput_1.$Gq);
            const clipboardService = accessor.get(clipboardService_1.$UZ);
            const editorService = accessor.get(editorService_1.$9C);
            const languageService = accessor.get(language_1.$ct);
            const env = accessor.get(environment_1.$Jh);
            const fileService = accessor.get(files_1.$6j);
            if (!args) {
                args = {};
            }
            let content;
            if (!args.data) {
                const result = await quickInputService.input({
                    prompt: (0, nls_1.localize)(2, null),
                    value: await clipboardService.readText(),
                });
                if (result === undefined) {
                    return;
                }
                content =
                    result !== ''
                        ? JSON.parse(result)
                        : { base: '', input1: '', input2: '', result: '', languageId: 'plaintext' };
            }
            else {
                content = args.data;
            }
            const targetDir = uri_1.URI.joinPath(env.tmpDir, (0, extpath_1.$Qf)());
            const extension = languageService.getExtensions(content.languageId)[0] || '';
            const baseUri = uri_1.URI.joinPath(targetDir, `/base${extension}`);
            const input1Uri = uri_1.URI.joinPath(targetDir, `/input1${extension}`);
            const input2Uri = uri_1.URI.joinPath(targetDir, `/input2${extension}`);
            const resultUri = uri_1.URI.joinPath(targetDir, `/result${extension}`);
            const initialResultUri = uri_1.URI.joinPath(targetDir, `/initialResult${extension}`);
            async function writeFile(uri, content) {
                await fileService.writeFile(uri, buffer_1.$Fd.fromString(content));
            }
            const shouldOpenInitial = await promptOpenInitial(quickInputService, args.resultState);
            await Promise.all([
                writeFile(baseUri, content.base),
                writeFile(input1Uri, content.input1),
                writeFile(input2Uri, content.input2),
                writeFile(resultUri, shouldOpenInitial ? (content.initialResult || '') : content.result),
                writeFile(initialResultUri, content.initialResult || ''),
            ]);
            const input = {
                base: { resource: baseUri },
                input1: { resource: input1Uri, label: 'Input 1', description: 'Input 1', detail: '(from JSON)' },
                input2: { resource: input2Uri, label: 'Input 2', description: 'Input 2', detail: '(from JSON)' },
                result: { resource: resultUri },
            };
            editorService.openEditor(input);
        }
    }
    exports.$Yac = $Yac;
    async function promptOpenInitial(quickInputService, resultStateOverride) {
        if (resultStateOverride) {
            return resultStateOverride === 'initial';
        }
        const result = await quickInputService.pick([{ label: 'result', result: false }, { label: 'initial result', result: true }], { canPickMany: false });
        return result?.result;
    }
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
    class $Zac extends MergeEditorAction {
        constructor() {
            super({
                id: 'merge.dev.openSelectionInTemporaryMergeEditor',
                category: MERGE_EDITOR_CATEGORY,
                title: {
                    value: (0, nls_1.localize)(3, null),
                    original: 'Open Selection In Temporary Merge Editor',
                },
                icon: codicons_1.$Pj.layoutCentered,
                f1: true,
            });
        }
        async runWithViewModel(viewModel, accessor) {
            const rangesInBase = viewModel.selectionInBase.get()?.rangesInBase;
            if (!rangesInBase || rangesInBase.length === 0) {
                return;
            }
            const base = rangesInBase
                .map((r) => viewModel.model.base.getValueInRange(r))
                .join('\n');
            const input1 = rangesInBase
                .map((r) => viewModel.inputCodeEditorView1.editor.getModel().getValueInRange(viewModel.model.translateBaseRangeToInput(1, r)))
                .join('\n');
            const input2 = rangesInBase
                .map((r) => viewModel.inputCodeEditorView2.editor.getModel().getValueInRange(viewModel.model.translateBaseRangeToInput(2, r)))
                .join('\n');
            const result = rangesInBase
                .map((r) => viewModel.resultCodeEditorView.editor.getModel().getValueInRange(viewModel.model.translateBaseRangeToResult(r)))
                .join('\n');
            new $Yac().run(accessor, {
                data: {
                    base,
                    input1,
                    input2,
                    result,
                    languageId: viewModel.resultCodeEditorView.editor.getModel().getLanguageId()
                }
            });
        }
    }
    exports.$Zac = $Zac;
});
//# sourceMappingURL=devCommands.js.map