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
define(["require", "exports", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/resources", "vs/workbench/contrib/inlineChat/browser/inlineChatController", "vs/workbench/contrib/inlineChat/browser/inlineChatSession", "vs/workbench/contrib/notebook/browser/services/notebookEditorService", "vs/workbench/contrib/notebook/common/notebookCommon"], function (require, exports, errors_1, lifecycle_1, network_1, resources_1, inlineChatController_1, inlineChatSession_1, notebookEditorService_1, notebookCommon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$HJb = void 0;
    let $HJb = class $HJb {
        constructor(sessionService, notebookEditorService) {
            this.a = new lifecycle_1.$jc();
            this.a.add(sessionService.registerSessionKeyComputer(network_1.Schemas.vscodeNotebookCell, {
                getComparisonKey: (_editor, uri) => {
                    const data = notebookCommon_1.CellUri.parse(uri);
                    if (!data) {
                        throw (0, errors_1.$6)('Expected notebook');
                    }
                    for (const editor of notebookEditorService.listNotebookEditors()) {
                        if ((0, resources_1.$bg)(editor.textModel?.uri, data.notebook)) {
                            return `<notebook>${editor.getId()}#${uri}`;
                        }
                    }
                    throw (0, errors_1.$6)('Expected notebook');
                }
            }));
            this.a.add(sessionService.onWillStartSession(newSessionEditor => {
                const candidate = notebookCommon_1.CellUri.parse(newSessionEditor.getModel().uri);
                if (!candidate) {
                    return;
                }
                for (const notebookEditor of notebookEditorService.listNotebookEditors()) {
                    if ((0, resources_1.$bg)(notebookEditor.textModel?.uri, candidate.notebook)) {
                        let found = false;
                        const editors = [];
                        for (const [, codeEditor] of notebookEditor.codeEditors) {
                            editors.push(codeEditor);
                            found = codeEditor === newSessionEditor || found;
                        }
                        if (found) {
                            // found the this editor in the outer notebook editor -> make sure to
                            // cancel all sibling sessions
                            for (const editor of editors) {
                                if (editor !== newSessionEditor) {
                                    inlineChatController_1.$Qqb.get(editor)?.finishExistingSession();
                                }
                            }
                            break;
                        }
                    }
                }
            }));
        }
        dispose() {
            this.a.dispose();
        }
    };
    exports.$HJb = $HJb;
    exports.$HJb = $HJb = __decorate([
        __param(0, inlineChatSession_1.$bqb),
        __param(1, notebookEditorService_1.$1rb)
    ], $HJb);
});
//# sourceMappingURL=inlineChatNotebook.js.map