/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/codicons", "vs/base/common/uri", "vs/editor/common/languages/language", "vs/nls!vs/workbench/contrib/mergeEditor/browser/commands/devCommands", "vs/platform/actions/common/actions", "vs/platform/clipboard/common/clipboardService", "vs/platform/dialogs/common/dialogs", "vs/platform/files/common/files", "vs/platform/notification/common/notification", "vs/platform/quickinput/common/quickInput", "vs/workbench/contrib/mergeEditor/browser/view/mergeEditor", "vs/workbench/contrib/mergeEditor/common/mergeEditor", "vs/workbench/services/editor/common/editorService"], function (require, exports, buffer_1, codicons_1, uri_1, language_1, nls_1, actions_1, clipboardService_1, dialogs_1, files_1, notification_1, quickInput_1, mergeEditor_1, mergeEditor_2, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$lTb = exports.$kTb = exports.$jTb = void 0;
    const MERGE_EDITOR_CATEGORY = { value: (0, nls_1.localize)(0, null), original: 'Merge Editor (Dev)' };
    class $jTb extends actions_1.$Wu {
        constructor() {
            super({
                id: 'merge.dev.copyContentsJson',
                category: MERGE_EDITOR_CATEGORY,
                title: {
                    value: (0, nls_1.localize)(1, null),
                    original: 'Copy Merge Editor State as JSON',
                },
                icon: codicons_1.$Pj.layoutCentered,
                f1: true,
                precondition: mergeEditor_2.$4jb,
            });
        }
        run(accessor) {
            const { activeEditorPane } = accessor.get(editorService_1.$9C);
            const clipboardService = accessor.get(clipboardService_1.$UZ);
            const notificationService = accessor.get(notification_1.$Yu);
            if (!(activeEditorPane instanceof mergeEditor_1.$YSb)) {
                notificationService.info({
                    name: (0, nls_1.localize)(2, null),
                    message: (0, nls_1.localize)(3, null)
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
                name: (0, nls_1.localize)(4, null),
                message: (0, nls_1.localize)(5, null),
            });
        }
    }
    exports.$jTb = $jTb;
    class $kTb extends actions_1.$Wu {
        constructor() {
            super({
                id: 'merge.dev.saveContentsToFolder',
                category: MERGE_EDITOR_CATEGORY,
                title: {
                    value: (0, nls_1.localize)(6, null),
                    original: 'Save Merge Editor State to Folder',
                },
                icon: codicons_1.$Pj.layoutCentered,
                f1: true,
                precondition: mergeEditor_2.$4jb,
            });
        }
        async run(accessor) {
            const { activeEditorPane } = accessor.get(editorService_1.$9C);
            const notificationService = accessor.get(notification_1.$Yu);
            const dialogService = accessor.get(dialogs_1.$qA);
            const fileService = accessor.get(files_1.$6j);
            const languageService = accessor.get(language_1.$ct);
            if (!(activeEditorPane instanceof mergeEditor_1.$YSb)) {
                notificationService.info({
                    name: (0, nls_1.localize)(7, null),
                    message: (0, nls_1.localize)(8, null)
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
                title: (0, nls_1.localize)(9, null)
            });
            if (!result) {
                return;
            }
            const targetDir = result[0];
            const extension = languageService.getExtensions(model.resultTextModel.getLanguageId())[0] || '';
            async function write(fileName, source) {
                await fileService.writeFile(uri_1.URI.joinPath(targetDir, fileName + extension), buffer_1.$Fd.fromString(source), {});
            }
            await Promise.all([
                write('base', model.base.getValue()),
                write('input1', model.input1.textModel.getValue()),
                write('input2', model.input2.textModel.getValue()),
                write('result', model.resultTextModel.getValue()),
                write('initialResult', model.getInitialResultValue()),
            ]);
            notificationService.info({
                name: (0, nls_1.localize)(10, null),
                message: (0, nls_1.localize)(11, null),
            });
        }
    }
    exports.$kTb = $kTb;
    class $lTb extends actions_1.$Wu {
        constructor() {
            super({
                id: 'merge.dev.loadContentsFromFolder',
                category: MERGE_EDITOR_CATEGORY,
                title: {
                    value: (0, nls_1.localize)(12, null),
                    original: 'Load Merge Editor State from Folder',
                },
                icon: codicons_1.$Pj.layoutCentered,
                f1: true
            });
        }
        async run(accessor, args) {
            const dialogService = accessor.get(dialogs_1.$qA);
            const editorService = accessor.get(editorService_1.$9C);
            const fileService = accessor.get(files_1.$6j);
            const quickInputService = accessor.get(quickInput_1.$Gq);
            if (!args) {
                args = {};
            }
            let targetDir;
            if (!args.folderUri) {
                const result = await dialogService.showOpenDialog({
                    canSelectFiles: false,
                    canSelectFolders: true,
                    canSelectMany: false,
                    title: (0, nls_1.localize)(13, null)
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
    exports.$lTb = $lTb;
    async function promptOpenInitial(quickInputService, resultStateOverride) {
        if (resultStateOverride) {
            return resultStateOverride === 'initial';
        }
        const result = await quickInputService.pick([{ label: 'result', result: false }, { label: 'initial result', result: true }], { canPickMany: false });
        return result?.result;
    }
});
//# sourceMappingURL=devCommands.js.map