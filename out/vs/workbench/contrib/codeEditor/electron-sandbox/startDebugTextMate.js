/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/editor/common/core/range", "vs/platform/actions/common/actions", "vs/platform/action/common/actionCommonCategories", "vs/workbench/services/textMate/browser/textMateTokenizationFeature", "vs/editor/common/services/model", "vs/workbench/services/editor/common/editorService", "vs/base/common/uri", "vs/base/common/uuid", "vs/editor/browser/services/codeEditorService", "vs/workbench/services/host/browser/host", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/platform/log/common/log", "vs/base/common/resources", "vs/platform/files/common/files"], function (require, exports, nls, range_1, actions_1, actionCommonCategories_1, textMateTokenizationFeature_1, model_1, editorService_1, uri_1, uuid_1, codeEditorService_1, host_1, environmentService_1, log_1, resources_1, files_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class StartDebugTextMate extends actions_1.Action2 {
        static { this.resource = uri_1.URI.parse(`inmemory:///tm-log.txt`); }
        constructor() {
            super({
                id: 'editor.action.startDebugTextMate',
                title: { value: nls.localize('startDebugTextMate', "Start Text Mate Syntax Grammar Logging"), original: 'Start Text Mate Syntax Grammar Logging' },
                category: actionCommonCategories_1.Categories.Developer,
                f1: true
            });
        }
        _getOrCreateModel(modelService) {
            const model = modelService.getModel(StartDebugTextMate.resource);
            if (model) {
                return model;
            }
            return modelService.createModel('', null, StartDebugTextMate.resource);
        }
        _append(model, str) {
            const lineCount = model.getLineCount();
            model.applyEdits([{
                    range: new range_1.Range(lineCount, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */, lineCount, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */),
                    text: str
                }]);
        }
        async run(accessor) {
            const textMateService = accessor.get(textMateTokenizationFeature_1.ITextMateTokenizationService);
            const modelService = accessor.get(model_1.IModelService);
            const editorService = accessor.get(editorService_1.IEditorService);
            const codeEditorService = accessor.get(codeEditorService_1.ICodeEditorService);
            const hostService = accessor.get(host_1.IHostService);
            const environmentService = accessor.get(environmentService_1.INativeWorkbenchEnvironmentService);
            const loggerService = accessor.get(log_1.ILoggerService);
            const fileService = accessor.get(files_1.IFileService);
            const pathInTemp = (0, resources_1.joinPath)(environmentService.tmpDir, `vcode-tm-log-${(0, uuid_1.generateUuid)()}.txt`);
            await fileService.createFile(pathInTemp);
            const logger = loggerService.createLogger(pathInTemp, { name: 'debug textmate' });
            const model = this._getOrCreateModel(modelService);
            const append = (str) => {
                this._append(model, str + '\n');
                scrollEditor();
                logger.info(str);
                logger.flush();
            };
            await hostService.openWindow([{ fileUri: pathInTemp }], { forceNewWindow: true });
            const textEditorPane = await editorService.openEditor({
                resource: model.uri,
                options: { pinned: true }
            });
            if (!textEditorPane) {
                return;
            }
            const scrollEditor = () => {
                const editors = codeEditorService.listCodeEditors();
                for (const editor of editors) {
                    if (editor.hasModel()) {
                        if (editor.getModel().uri.toString() === StartDebugTextMate.resource.toString()) {
                            editor.revealLine(editor.getModel().getLineCount());
                        }
                    }
                }
            };
            append(`// Open the file you want to test to the side and watch here`);
            append(`// Output mirrored at ${pathInTemp}`);
            textMateService.startDebugMode((str) => {
                this._append(model, str + '\n');
                scrollEditor();
                logger.info(str);
                logger.flush();
            }, () => {
            });
        }
    }
    (0, actions_1.registerAction2)(StartDebugTextMate);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhcnREZWJ1Z1RleHRNYXRlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY29kZUVkaXRvci9lbGVjdHJvbi1zYW5kYm94L3N0YXJ0RGVidWdUZXh0TWF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQXFCaEcsTUFBTSxrQkFBbUIsU0FBUSxpQkFBTztpQkFFeEIsYUFBUSxHQUFHLFNBQUcsQ0FBQyxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQztRQUU5RDtZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsa0NBQWtDO2dCQUN0QyxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsRUFBRSx3Q0FBd0MsQ0FBQyxFQUFFLFFBQVEsRUFBRSx3Q0FBd0MsRUFBRTtnQkFDbEosUUFBUSxFQUFFLG1DQUFVLENBQUMsU0FBUztnQkFDOUIsRUFBRSxFQUFFLElBQUk7YUFDUixDQUFDLENBQUM7UUFDSixDQUFDO1FBRU8saUJBQWlCLENBQUMsWUFBMkI7WUFDcEQsTUFBTSxLQUFLLEdBQUcsWUFBWSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNqRSxJQUFJLEtBQUssRUFBRTtnQkFDVixPQUFPLEtBQUssQ0FBQzthQUNiO1lBQ0QsT0FBTyxZQUFZLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsa0JBQWtCLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDeEUsQ0FBQztRQUVPLE9BQU8sQ0FBQyxLQUFpQixFQUFFLEdBQVc7WUFDN0MsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ3ZDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFDakIsS0FBSyxFQUFFLElBQUksYUFBSyxDQUFDLFNBQVMscURB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