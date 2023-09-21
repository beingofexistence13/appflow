/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/codicons", "vs/base/common/extpath", "vs/base/common/uri", "vs/editor/common/languages/language", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/clipboard/common/clipboardService", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/platform/quickinput/common/quickInput", "vs/workbench/contrib/mergeEditor/browser/view/mergeEditor", "vs/workbench/services/editor/common/editorService"], function (require, exports, buffer_1, codicons_1, extpath_1, uri_1, language_1, nls_1, actions_1, clipboardService_1, environment_1, files_1, quickInput_1, mergeEditor_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OpenSelectionInTemporaryMergeEditor = exports.MergeEditorOpenContentsFromJSON = void 0;
    const MERGE_EDITOR_CATEGORY = { value: (0, nls_1.localize)('mergeEditor', "Merge Editor (Dev)"), original: 'Merge Editor (Dev)' };
    class MergeEditorOpenContentsFromJSON extends actions_1.Action2 {
        constructor() {
            super({
                id: 'merge.dev.openContentsJson',
                category: MERGE_EDITOR_CATEGORY,
                title: {
                    value: (0, nls_1.localize)('merge.dev.openState', 'Open Merge Editor State from JSON'),
                    original: 'Open Merge Editor State from JSON',
                },
                icon: codicons_1.Codicon.layoutCentered,
                f1: true,
            });
        }
        async run(accessor, args) {
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const clipboardService = accessor.get(clipboardService_1.IClipboardService);
            const editorService = accessor.get(editorService_1.IEditorService);
            const languageService = accessor.get(language_1.ILanguageService);
            const env = accessor.get(environment_1.INativeEnvironmentService);
            const fileService = accessor.get(files_1.IFileService);
            if (!args) {
                args = {};
            }
            let content;
            if (!args.data) {
                const result = await quickInputService.input({
                    prompt: (0, nls_1.localize)('mergeEditor.enterJSON', 'Enter JSON'),
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
            const targetDir = uri_1.URI.joinPath(env.tmpDir, (0, extpath_1.randomPath)());
            const extension = languageService.getExtensions(content.languageId)[0] || '';
            const baseUri = uri_1.URI.joinPath(targetDir, `/base${extension}`);
            const input1Uri = uri_1.URI.joinPath(targetDir, `/input1${extension}`);
            const input2Uri = uri_1.URI.joinPath(targetDir, `/input2${extension}`);
            const resultUri = uri_1.URI.joinPath(targetDir, `/result${extension}`);
            const initialResultUri = uri_1.URI.joinPath(targetDir, `/initialResult${extension}`);
            async function writeFile(uri, content) {
                await fileService.writeFile(uri, buffer_1.VSBuffer.fromString(content));
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
    exports.MergeEditorOpenContentsFromJSON = MergeEditorOpenContentsFromJSON;
    async function promptOpenInitial(quickInputService, resultStateOverride) {
        if (resultStateOverride) {
            return resultStateOverride === 'initial';
        }
        const result = await quickInputService.pick([{ label: 'result', result: false }, { label: 'initial result', result: true }], { canPickMany: false });
        return result?.result;
    }
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
    class OpenSelectionInTemporaryMergeEditor extends MergeEditorAction {
        constructor() {
            super({
                id: 'merge.dev.openSelectionInTemporaryMergeEditor',
                category: MERGE_EDITOR_CATEGORY,
                title: {
                    value: (0, nls_1.localize)('merge.dev.openSelectionInTemporaryMergeEditor', 'Open Selection In Temporary Merge Editor'),
                    original: 'Open Selection In Temporary Merge Editor',
                },
                icon: codicons_1.Codicon.layoutCentered,
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
            new MergeEditorOpenContentsFromJSON().run(accessor, {
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
    exports.OpenSelectionInTemporaryMergeEditor = OpenSelectionInTemporaryMergeEditor;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGV2Q29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9tZXJnZUVkaXRvci9lbGVjdHJvbi1zYW5kYm94L2RldkNvbW1hbmRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQXFCaEcsTUFBTSxxQkFBcUIsR0FBcUIsRUFBRSxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsYUFBYSxFQUFFLG9CQUFvQixDQUFDLEVBQUUsUUFBUSxFQUFFLG9CQUFvQixFQUFFLENBQUM7SUFFekksTUFBYSwrQkFBZ0MsU0FBUSxpQkFBTztRQUMzRDtZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsNEJBQTRCO2dCQUNoQyxRQUFRLEVBQUUscUJBQXFCO2dCQUMvQixLQUFLLEVBQUU7b0JBQ04sS0FBSyxFQUFFLElBQUEsY0FBUSxFQUNkLHFCQUFxQixFQUNyQixtQ0FBbUMsQ0FDbkM7b0JBQ0QsUUFBUSxFQUFFLG1DQUFtQztpQkFDN0M7Z0JBQ0QsSUFBSSxFQUFFLGtCQUFPLENBQUMsY0FBYztnQkFDNUIsRUFBRSxFQUFFLElBQUk7YUFDUixDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUEwQixFQUFFLElBQTBFO1lBQy9HLE1BQU0saUJBQWlCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQywrQkFBa0IsQ0FBQyxDQUFDO1lBQzNELE1BQU0sZ0JBQWdCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxvQ0FBaUIsQ0FBQyxDQUFDO1lBQ3pELE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsOEJBQWMsQ0FBQyxDQUFDO1lBQ25ELE1BQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsMkJBQWdCLENBQUMsQ0FBQztZQUN2RCxNQUFNLEdBQUcsR0FBRyxRQUFRLENBQUMs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