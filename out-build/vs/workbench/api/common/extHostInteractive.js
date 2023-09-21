/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/workbench/api/common/extHostCommands"], function (require, exports, uri_1, extHostCommands_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Ycc = void 0;
    class $Ycc {
        constructor(mainContext, a, b, c, _logService) {
            this.a = a;
            this.b = b;
            this.c = c;
            const openApiCommand = new extHostCommands_1.$pM('interactive.open', '_interactive.open', 'Open interactive window and return notebook editor and input URI', [
                new extHostCommands_1.$nM('showOptions', 'Show Options', v => true, v => v),
                new extHostCommands_1.$nM('resource', 'Interactive resource Uri', v => true, v => v),
                new extHostCommands_1.$nM('controllerId', 'Notebook controller Id', v => true, v => v),
                new extHostCommands_1.$nM('title', 'Interactive editor title', v => true, v => v)
            ], new extHostCommands_1.$oM('Notebook and input URI', (v) => {
                _logService.debug('[ExtHostInteractive] open iw with notebook editor id', v.notebookEditorId);
                if (v.notebookEditorId !== undefined) {
                    const editor = this.a.getEditorById(v.notebookEditorId);
                    _logService.debug('[ExtHostInteractive] notebook editor found', editor.id);
                    return { notebookUri: uri_1.URI.revive(v.notebookUri), inputUri: uri_1.URI.revive(v.inputUri), notebookEditor: editor.apiEditor };
                }
                _logService.debug('[ExtHostInteractive] notebook editor not found, uris for the interactive document', v.notebookUri, v.inputUri);
                return { notebookUri: uri_1.URI.revive(v.notebookUri), inputUri: uri_1.URI.revive(v.inputUri) };
            }));
            this.c.registerApiCommand(openApiCommand);
        }
        $willAddInteractiveDocument(uri, eol, languageId, notebookUri) {
            this.b.acceptDocumentsAndEditorsDelta({
                addedDocuments: [{
                        EOL: eol,
                        lines: [''],
                        languageId: languageId,
                        uri: uri,
                        isDirty: false,
                        versionId: 1,
                        notebook: this.a.getNotebookDocument(uri_1.URI.revive(notebookUri))?.apiNotebook
                    }]
            });
        }
        $willRemoveInteractiveDocument(uri, notebookUri) {
            this.b.acceptDocumentsAndEditorsDelta({
                removedDocuments: [uri]
            });
        }
    }
    exports.$Ycc = $Ycc;
});
//# sourceMappingURL=extHostInteractive.js.map