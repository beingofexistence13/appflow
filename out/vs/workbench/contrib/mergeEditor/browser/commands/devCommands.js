/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/codicons", "vs/base/common/uri", "vs/editor/common/languages/language", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/clipboard/common/clipboardService", "vs/platform/dialogs/common/dialogs", "vs/platform/files/common/files", "vs/platform/notification/common/notification", "vs/platform/quickinput/common/quickInput", "vs/workbench/contrib/mergeEditor/browser/view/mergeEditor", "vs/workbench/contrib/mergeEditor/common/mergeEditor", "vs/workbench/services/editor/common/editorService"], function (require, exports, buffer_1, codicons_1, uri_1, language_1, nls_1, actions_1, clipboardService_1, dialogs_1, files_1, notification_1, quickInput_1, mergeEditor_1, mergeEditor_2, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MergeEditorLoadContentsFromFolder = exports.MergeEditorSaveContentsToFolder = exports.MergeEditorCopyContentsToJSON = void 0;
    const MERGE_EDITOR_CATEGORY = { value: (0, nls_1.localize)('mergeEditor', "Merge Editor (Dev)"), original: 'Merge Editor (Dev)' };
    class MergeEditorCopyContentsToJSON extends actions_1.Action2 {
        constructor() {
            super({
                id: 'merge.dev.copyContentsJson',
                category: MERGE_EDITOR_CATEGORY,
                title: {
                    value: (0, nls_1.localize)('merge.dev.copyState', 'Copy Merge Editor State as JSON'),
                    original: 'Copy Merge Editor State as JSON',
                },
                icon: codicons_1.Codicon.layoutCentered,
                f1: true,
                precondition: mergeEditor_2.ctxIsMergeEditor,
            });
        }
        run(accessor) {
            const { activeEditorPane } = accessor.get(editorService_1.IEditorService);
            const clipboardService = accessor.get(clipboardService_1.IClipboardService);
            const notificationService = accessor.get(notification_1.INotificationService);
            if (!(activeEditorPane instanceof mergeEditor_1.MergeEditor)) {
                notificationService.info({
                    name: (0, nls_1.localize)('mergeEditor.name', 'Merge Editor'),
                    message: (0, nls_1.localize)('mergeEditor.noActiveMergeEditor', "No active merge editor")
                });
                return;
            }
            const model = activeEditorPane.model;
            if (!model) {
                return;
            }
            const contents = {
                languageId: model.resultTextModel.getLanguageId(),
                base: model.base.getValue(),
                input1: model.input1.textModel.getValue(),
                input2: model.input2.textModel.getValue(),
                result: model.resultTextModel.getValue(),
                initialResult: model.getInitialResultValue(),
            };
            const jsonStr = JSON.stringify(contents, undefined, 4);
            clipboardService.writeText(jsonStr);
            notificationService.info({
                name: (0, nls_1.localize)('mergeEditor.name', 'Merge Editor'),
                message: (0, nls_1.localize)('mergeEditor.successfullyCopiedMergeEditorContents', "Successfully copied merge editor state"),
            });
        }
    }
    exports.MergeEditorCopyContentsToJSON = MergeEditorCopyContentsToJSON;
    class MergeEditorSaveContentsToFolder extends actions_1.Action2 {
        constructor() {
            super({
                id: 'merge.dev.saveContentsToFolder',
                category: MERGE_EDITOR_CATEGORY,
                title: {
                    value: (0, nls_1.localize)('merge.dev.saveContentsToFolder', 'Save Merge Editor State to Folder'),
                    original: 'Save Merge Editor State to Folder',
                },
                icon: codicons_1.Codicon.layoutCentered,
                f1: true,
                precondition: mergeEditor_2.ctxIsMergeEditor,
            });
        }
        async run(accessor) {
            const { activeEditorPane } = accessor.get(editorService_1.IEditorService);
            const notificationService = accessor.get(notification_1.INotificationService);
            const dialogService = accessor.get(dialogs_1.IFileDialogService);
            const fileService = accessor.get(files_1.IFileService);
            const languageService = accessor.get(language_1.ILanguageService);
            if (!(activeEditorPane instanceof mergeEditor_1.MergeEditor)) {
                notificationService.info({
                    name: (0, nls_1.localize)('mergeEditor.name', 'Merge Editor'),
                    message: (0, nls_1.localize)('mergeEditor.noActiveMergeEditor', "No active merge editor")
                });
                return;
            }
            const model = activeEditorPane.model;
            if (!model) {
                return;
            }
            const result = await dialogService.showOpenDialog({
                canSelectFiles: false,
                canSelectFolders: true,
                canSelectMany: false,
                title: (0, nls_1.localize)('mergeEditor.selectFolderToSaveTo', 'Select folder to save to')
            });
            if (!result) {
                return;
            }
            const targetDir = result[0];
            const extension = languageService.getExtensions(model.resultTextModel.getLanguageId())[0] || '';
            async function write(fileName, source) {
                await fileService.writeFile(uri_1.URI.joinPath(targetDir, fileName + extension), buffer_1.VSBuffer.fromString(source), {});
            }
            await Promise.all([
                write('base', model.base.getValue()),
                write('input1', model.input1.textModel.getValue()),
                write('input2', model.input2.textModel.getValue()),
                write('result', model.resultTextModel.getValue()),
                write('initialResult', model.getInitialResultValue()),
            ]);
            notificationService.info({
                name: (0, nls_1.localize)('mergeEditor.name', 'Merge Editor'),
                message: (0, nls_1.localize)('mergeEditor.successfullySavedMergeEditorContentsToFolder', "Successfully saved merge editor state to folder"),
            });
        }
    }
    exports.MergeEditorSaveContentsToFolder = MergeEditorSaveContentsToFolder;
    class MergeEditorLoadContentsFromFolder extends actions_1.Action2 {
        constructor() {
            super({
                id: 'merge.dev.loadContentsFromFolder',
                category: MERGE_EDITOR_CATEGORY,
                title: {
                    value: (0, nls_1.localize)('merge.dev.loadContentsFromFolder', 'Load Merge Editor State from Folder'),
                    original: 'Load Merge Editor State from Folder',
                },
                icon: codicons_1.Codicon.layoutCentered,
                f1: true
            });
        }
        async run(accessor, args) {
            const dialogService = accessor.get(dialogs_1.IFileDialogService);
            const editorService = accessor.get(editorService_1.IEditorService);
            const fileService = accessor.get(files_1.IFileService);
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            if (!args) {
                args = {};
            }
            let targetDir;
            if (!args.folderUri) {
                const result = await dialogService.showOpenDialog({
                    canSelectFiles: false,
                    canSelectFolders: true,
                    canSelectMany: false,
                    title: (0, nls_1.localize)('mergeEditor.selectFolderToSaveTo', 'Select folder to save to')
                });
                if (!result) {
                    return;
                }
                targetDir = result[0];
            }
            else {
                targetDir = args.folderUri;
            }
            const targetDirInfo = await fileService.resolve(targetDir);
            function findFile(name) {
                return targetDirInfo.children.find(c => c.name.startsWith(name))?.resource;
            }
            const shouldOpenInitial = await promptOpenInitial(quickInputService, args.resultState);
            const baseUri = findFile('base');
            const input1Uri = findFile('input1');
            const input2Uri = findFile('input2');
            const resultUri = findFile(shouldOpenInitial ? 'initialResult' : 'result');
            const input = {
                base: { resource: baseUri },
                input1: { resource: input1Uri, label: 'Input 1', description: 'Input 1', detail: '(from file)' },
                input2: { resource: input2Uri, label: 'Input 2', description: 'Input 2', detail: '(from file)' },
                result: { resource: resultUri },
            };
            editorService.openEditor(input);
        }
    }
    exports.MergeEditorLoadContentsFromFolder = MergeEditorLoadContentsFromFolder;
    async function promptOpenInitial(quickInputService, resultStateOverride) {
        if (resultStateOverride) {
            return resultStateOverride === 'initial';
        }
        const result = await quickInputService.pick([{ label: 'result', result: false }, { label: 'initial result', result: true }], { canPickMany: false });
        return result?.result;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGV2Q29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9tZXJnZUVkaXRvci9icm93c2VyL2NvbW1hbmRzL2RldkNvbW1hbmRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQW9CaEcsTUFBTSxxQkFBcUIsR0FBcUIsRUFBRSxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsYUFBYSxFQUFFLG9CQUFvQixDQUFDLEVBQUUsUUFBUSxFQUFFLG9CQUFvQixFQUFFLENBQUM7SUFFekksTUFBYSw2QkFBOEIsU0FBUSxpQkFBTztRQUN6RDtZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsNEJBQTRCO2dCQUNoQyxRQUFRLEVBQUUscUJBQXFCO2dCQUMvQixLQUFLLEVBQUU7b0JBQ04sS0FBSyxFQUFFLElBQUEsY0FBUSxFQUNkLHFCQUFxQixFQUNyQixpQ0FBaUMsQ0FDakM7b0JBQ0QsUUFBUSxFQUFFLGlDQUFpQztpQkFDM0M7Z0JBQ0QsSUFBSSxFQUFFLGtCQUFPLENBQUMsY0FBYztnQkFDNUIsRUFBRSxFQUFFLElBQUk7Z0JBQ1IsWUFBWSxFQUFFLDhCQUFnQjthQUM5QixDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsR0FBRyxDQUFDLFFBQTBCO1lBQzdCLE1BQU0sRUFBRSxnQkFBZ0IsRUFBRSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsOEJBQWMsQ0FBQyxDQUFDO1lBQzFELE1BQU0sZ0JBQWdCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxvQ0FBaUIsQ0FBQyxDQUFDO1lBQ3pELE1BQU0sbUJBQW1CLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxtQ0FBb0IsQ0FBQyxDQUFDO1lBRS9ELElBQUksQ0FBQyxDQUFDLGdCQUFnQixZQUFZLHlCQUFXLENBQUMsRUFBRTtnQkFDL0MsbUJBQW1CLENBQUMsSUFBSSxD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