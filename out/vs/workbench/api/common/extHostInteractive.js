/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/workbench/api/common/extHostCommands"], function (require, exports, uri_1, extHostCommands_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostInteractive = void 0;
    class ExtHostInteractive {
        constructor(mainContext, _extHostNotebooks, _textDocumentsAndEditors, _commands, _logService) {
            this._extHostNotebooks = _extHostNotebooks;
            this._textDocumentsAndEditors = _textDocumentsAndEditors;
            this._commands = _commands;
            const openApiCommand = new extHostCommands_1.ApiCommand('interactive.open', '_interactive.open', 'Open interactive window and return notebook editor and input URI', [
                new extHostCommands_1.ApiCommandArgument('showOptions', 'Show Options', v => true, v => v),
                new extHostCommands_1.ApiCommandArgument('resource', 'Interactive resource Uri', v => true, v => v),
                new extHostCommands_1.ApiCommandArgument('controllerId', 'Notebook controller Id', v => true, v => v),
                new extHostCommands_1.ApiCommandArgument('title', 'Interactive editor title', v => true, v => v)
            ], new extHostCommands_1.ApiCommandResult('Notebook and input URI', (v) => {
                _logService.debug('[ExtHostInteractive] open iw with notebook editor id', v.notebookEditorId);
                if (v.notebookEditorId !== undefined) {
                    const editor = this._extHostNotebooks.getEditorById(v.notebookEditorId);
                    _logService.debug('[ExtHostInteractive] notebook editor found', editor.id);
                    return { notebookUri: uri_1.URI.revive(v.notebookUri), inputUri: uri_1.URI.revive(v.inputUri), notebookEditor: editor.apiEditor };
                }
                _logService.debug('[ExtHostInteractive] notebook editor not found, uris for the interactive document', v.notebookUri, v.inputUri);
                return { notebookUri: uri_1.URI.revive(v.notebookUri), inputUri: uri_1.URI.revive(v.inputUri) };
            }));
            this._commands.registerApiCommand(openApiCommand);
        }
        $willAddInteractiveDocument(uri, eol, languageId, notebookUri) {
            this._textDocumentsAndEditors.acceptDocumentsAndEditorsDelta({
                addedDocuments: [{
                        EOL: eol,
                        lines: [''],
                        languageId: languageId,
                        uri: uri,
                        isDirty: false,
                        versionId: 1,
                        notebook: this._extHostNotebooks.getNotebookDocument(uri_1.URI.revive(notebookUri))?.apiNotebook
                    }]
            });
        }
        $willRemoveInteractiveDocument(uri, notebookUri) {
            this._textDocumentsAndEditors.acceptDocumentsAndEditorsDelta({
                removedDocuments: [uri]
            });
        }
    }
    exports.ExtHostInteractive = ExtHostInteractive;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdEludGVyYWN0aXZlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9jb21tb24vZXh0SG9zdEludGVyYWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVVoRyxNQUFhLGtCQUFrQjtRQUM5QixZQUNDLFdBQXlCLEVBQ2pCLGlCQUE0QyxFQUM1Qyx3QkFBb0QsRUFDcEQsU0FBMEIsRUFDbEMsV0FBd0I7WUFIaEIsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUEyQjtZQUM1Qyw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTRCO1lBQ3BELGNBQVMsR0FBVCxTQUFTLENBQWlCO1lBR2xDLE1BQU0sY0FBYyxHQUFHLElBQUksNEJBQVUsQ0FDcEMsa0JBQWtCLEVBQ2xCLG1CQUFtQixFQUNuQixrRUFBa0UsRUFDbEU7Z0JBQ0MsSUFBSSxvQ0FBa0IsQ0FBQyxhQUFhLEVBQUUsY0FBYyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUN4RSxJQUFJLG9DQUFrQixDQUFDLFVBQVUsRUFBRSwwQkFBMEIsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDakYsSUFBSSxvQ0FBa0IsQ0FBQyxjQUFjLEVBQUUsd0JBQXdCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ25GLElBQUksb0NBQWtCLENBQUMsT0FBTyxFQUFFLDBCQUEwQixFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQzlFLEVBQ0QsSUFBSSxrQ0FBZ0IsQ0FBMkosd0JBQXdCLEVBQUUsQ0FBQyxDQUFxRixFQUFFLEVBQUU7Z0JBQ2xTLFdBQVcsQ0FBQyxLQUFLLENBQUMsc0RBQXNELEVBQUUsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUM7Z0JBQzlGLElBQUksQ0FBQyxDQUFDLGdCQUFnQixLQUFLLFNBQVMsRUFBRTtvQkFDckMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztvQkFDeEUsV0FBVyxDQUFDLEtBQUssQ0FBQyw0Q0FBNEMsRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQzNFLE9BQU8sRUFBRSxXQUFXLEVBQUUsU0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLEVBQUUsUUFBUSxFQUFFLFNBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLGNBQWMsRUFBRSxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7aUJBQ3RIO2dCQUNELFdBQVcsQ0FBQyxLQUFLLENBQUMsbUZBQW1GLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ2xJLE9BQU8sRUFBRSxXQUFXLEVBQUUsU0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLEVBQUUsUUFBUSxFQUFFLFNBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7WUFDckYsQ0FBQyxDQUFDLENBQ0YsQ0FBQztZQUNGLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDbkQsQ0FBQztRQUVELDJCQUEyQixDQUFDLEdBQWtCLEVBQUUsR0FBVyxFQUFFLFVBQWtCLEVBQUUsV0FBMEI7WUFDMUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLDhCQUE4QixDQUFDO2dCQUM1RCxjQUFjLEVBQUUsQ0FBQzt3QkFDaEIsR0FBRyxFQUFFLEdBQUc7d0JBQ1IsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDO3dCQUNYLFVBQVUsRUFBRSxVQUFVO3dCQUN0QixHQUFHLEVBQUUsR0FBRzt3QkFDUixPQUFPLEVBQUUsS0FBSzt3QkFDZCxTQUFTLEVBQUUsQ0FBQzt3QkFDWixRQUFRLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLG1CQUFtQixDQUFDLFNBQUcsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxXQUFXO3FCQUMxRixDQUFDO2FBQ0YsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELDhCQUE4QixDQUFDLEdBQWtCLEVBQUUsV0FBMEI7WUFDNUUsSUFBSSxDQUFDLHdCQUF3QixDQUFDLDhCQUE4QixDQUFDO2dCQUM1RCxnQkFBZ0IsRUFBRSxDQUFDLEdBQUcsQ0FBQzthQUN2QixDQUFDLENBQUM7UUFDSixDQUFDO0tBQ0Q7SUFuREQsZ0RBbURDIn0=