/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/codeEditor/electron-sandbox/startDebugTextMate", "vs/editor/common/core/range", "vs/platform/actions/common/actions", "vs/platform/action/common/actionCommonCategories", "vs/workbench/services/textMate/browser/textMateTokenizationFeature", "vs/editor/common/services/model", "vs/workbench/services/editor/common/editorService", "vs/base/common/uri", "vs/base/common/uuid", "vs/editor/browser/services/codeEditorService", "vs/workbench/services/host/browser/host", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/platform/log/common/log", "vs/base/common/resources", "vs/platform/files/common/files"], function (require, exports, nls, range_1, actions_1, actionCommonCategories_1, textMateTokenizationFeature_1, model_1, editorService_1, uri_1, uuid_1, codeEditorService_1, host_1, environmentService_1, log_1, resources_1, files_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class StartDebugTextMate extends actions_1.$Wu {
        static { this.a = uri_1.URI.parse(`inmemory:///tm-log.txt`); }
        constructor() {
            super({
                id: 'editor.action.startDebugTextMate',
                title: { value: nls.localize(0, null), original: 'Start Text Mate Syntax Grammar Logging' },
                category: actionCommonCategories_1.$Nl.Developer,
                f1: true
            });
        }
        b(modelService) {
            const model = modelService.getModel(StartDebugTextMate.a);
            if (model) {
                return model;
            }
            return modelService.createModel('', null, StartDebugTextMate.a);
        }
        c(model, str) {
            const lineCount = model.getLineCount();
            model.applyEdits([{
                    range: new range_1.$ks(lineCount, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */, lineCount, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */),
                    text: str
                }]);
        }
        async run(accessor) {
            const textMateService = accessor.get(textMateTokenizationFeature_1.$qBb);
            const modelService = accessor.get(model_1.$yA);
            const editorService = accessor.get(editorService_1.$9C);
            const codeEditorService = accessor.get(codeEditorService_1.$nV);
            const hostService = accessor.get(host_1.$VT);
            const environmentService = accessor.get(environmentService_1.$1$b);
            const loggerService = accessor.get(log_1.$6i);
            const fileService = accessor.get(files_1.$6j);
            const pathInTemp = (0, resources_1.$ig)(environmentService.tmpDir, `vcode-tm-log-${(0, uuid_1.$4f)()}.txt`);
            await fileService.createFile(pathInTemp);
            const logger = loggerService.createLogger(pathInTemp, { name: 'debug textmate' });
            const model = this.b(modelService);
            const append = (str) => {
                this.c(model, str + '\n');
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
                        if (editor.getModel().uri.toString() === StartDebugTextMate.a.toString()) {
                            editor.revealLine(editor.getModel().getLineCount());
                        }
                    }
                }
            };
            append(`// Open the file you want to test to the side and watch here`);
            append(`// Output mirrored at ${pathInTemp}`);
            textMateService.startDebugMode((str) => {
                this.c(model, str + '\n');
                scrollEditor();
                logger.info(str);
                logger.flush();
            }, () => {
            });
        }
    }
    (0, actions_1.$Xu)(StartDebugTextMate);
});
//# sourceMappingURL=startDebugTextMate.js.map