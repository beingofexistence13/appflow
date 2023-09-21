/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/uri", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/extHostTypes"], function (require, exports, event_1, uri_1, extHostTypeConverters_1, extHostTypes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostNotebookDocumentSaveParticipant = void 0;
    class ExtHostNotebookDocumentSaveParticipant {
        constructor(_logService, _notebooksAndEditors, _mainThreadBulkEdits, _thresholds = { timeout: 1500, errors: 3 }) {
            this._logService = _logService;
            this._notebooksAndEditors = _notebooksAndEditors;
            this._mainThreadBulkEdits = _mainThreadBulkEdits;
            this._thresholds = _thresholds;
            this._onWillSaveNotebookDocumentEvent = new event_1.AsyncEmitter();
        }
        dispose() {
        }
        getOnWillSaveNotebookDocumentEvent(extension) {
            return (listener, thisArg, disposables) => {
                const wrappedListener = function wrapped(e) { listener.call(thisArg, e); };
                wrappedListener.extension = extension;
                return this._onWillSaveNotebookDocumentEvent.event(wrappedListener, undefined, disposables);
            };
        }
        async $participateInSave(resource, reason, token) {
            const revivedUri = uri_1.URI.revive(resource);
            const document = this._notebooksAndEditors.getNotebookDocument(revivedUri);
            if (!document) {
                throw new Error('Unable to resolve notebook document');
            }
            const edits = [];
            await this._onWillSaveNotebookDocumentEvent.fireAsync({ notebook: document.apiNotebook, reason: extHostTypeConverters_1.TextDocumentSaveReason.to(reason) }, token, async (thenable, listener) => {
                const now = Date.now();
                const data = await await Promise.resolve(thenable);
                if (Date.now() - now > this._thresholds.timeout) {
                    this._logService.warn('onWillSaveNotebookDocument-listener from extension', listener.extension.identifier);
                }
                if (token.isCancellationRequested) {
                    return;
                }
                if (data) {
                    if (data instanceof extHostTypes_1.WorkspaceEdit) {
                        edits.push(data);
                    }
                    else {
                        // ignore invalid data
                        this._logService.warn('onWillSaveNotebookDocument-listener from extension', listener.extension.identifier, 'ignored due to invalid data');
                    }
                }
                return;
            });
            if (token.isCancellationRequested) {
                return false;
            }
            if (edits.length === 0) {
                return true;
            }
            const dto = { edits: [] };
            for (const edit of edits) {
                const { edits } = extHostTypeConverters_1.WorkspaceEdit.from(edit);
                dto.edits = dto.edits.concat(edits);
            }
            return this._mainThreadBulkEdits.$tryApplyWorkspaceEdit(dto);
        }
    }
    exports.ExtHostNotebookDocumentSaveParticipant = ExtHostNotebookDocumentSaveParticipant;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdE5vdGVib29rRG9jdW1lbnRTYXZlUGFydGljaXBhbnQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2NvbW1vbi9leHRIb3N0Tm90ZWJvb2tEb2N1bWVudFNhdmVQYXJ0aWNpcGFudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFtQmhHLE1BQWEsc0NBQXNDO1FBSWxELFlBQ2tCLFdBQXdCLEVBQ3hCLG9CQUErQyxFQUMvQyxvQkFBOEMsRUFDOUMsY0FBbUQsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUU7WUFIL0UsZ0JBQVcsR0FBWCxXQUFXLENBQWE7WUFDeEIseUJBQW9CLEdBQXBCLG9CQUFvQixDQUEyQjtZQUMvQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQTBCO1lBQzlDLGdCQUFXLEdBQVgsV0FBVyxDQUFvRTtZQU5oRixxQ0FBZ0MsR0FBRyxJQUFJLG9CQUFZLEVBQWlDLENBQUM7UUFRdEcsQ0FBQztRQUVELE9BQU87UUFDUCxDQUFDO1FBRUQsa0NBQWtDLENBQUMsU0FBZ0M7WUFDbEUsT0FBTyxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLEVBQUU7Z0JBQ3pDLE1BQU0sZUFBZSxHQUFzRCxTQUFTLE9BQU8sQ0FBQyxDQUFDLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzlILGVBQWUsQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO2dCQUN0QyxPQUFPLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUFFLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUM3RixDQUFDLENBQUM7UUFDSCxDQUFDO1FBRUQsS0FBSyxDQUFDLGtCQUFrQixDQUFDLFFBQXVCLEVBQUUsTUFBa0IsRUFBRSxLQUF3QjtZQUM3RixNQUFNLFVBQVUsR0FBRyxTQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3hDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUUzRSxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUNkLE1BQU0sSUFBSSxLQUFLLENBQUMscUNBQXFDLENBQUMsQ0FBQzthQUN2RDtZQUVELE1BQU0sS0FBSyxHQUFvQixFQUFFLENBQUM7WUFFbEMsTUFBTSxJQUFJLENBQUMsZ0NBQWdDLENBQUMsU0FBUyxDQUFDLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxXQUFXLEVBQUUsTUFBTSxFQUFFLDhDQUFzQixDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsUUFBMEIsRUFBRSxRQUFRLEVBQUUsRUFBRTtnQkFDMUwsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUN2QixNQUFNLElBQUksR0FBRyxNQUFNLE1BQU0sT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDbkQsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFO29CQUNoRCxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxvREFBb0QsRUFBc0QsUUFBUyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQztpQkFDaEs7Z0JBRUQsSUFBSSxLQUFLLENBQUMsdUJBQXVCLEVBQUU7b0JBQ2xDLE9BQU87aUJBQ1A7Z0JBRUQsSUFBSSxJQUFJLEVBQUU7b0JBQ1QsSUFBSSxJQUFJLFlBQVksNEJBQWEsRUFBRTt3QkFDbEMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDakI7eUJBQU07d0JBQ04sc0JBQXNCO3dCQUN0QixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxvREFBb0QsRUFBc0QsUUFBUyxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsNkJBQTZCLENBQUMsQ0FBQztxQkFDL0w7aUJBQ0Q7Z0JBRUQsT0FBTztZQUNSLENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxLQUFLLENBQUMsdUJBQXVCLEVBQUU7Z0JBQ2xDLE9BQU8sS0FBSyxDQUFDO2FBQ2I7WUFFRCxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUN2QixPQUFPLElBQUksQ0FBQzthQUNaO1lBRUQsTUFBTSxHQUFHLEdBQXNCLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxDQUFDO1lBQzdDLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxFQUFFO2dCQUN6QixNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcscUNBQXNCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNwRCxHQUFHLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ3BDO1lBRUQsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsc0JBQXNCLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDOUQsQ0FBQztLQUNEO0lBeEVELHdGQXdFQyJ9