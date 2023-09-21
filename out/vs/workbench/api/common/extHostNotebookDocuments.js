/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/uri"], function (require, exports, event_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostNotebookDocuments = void 0;
    class ExtHostNotebookDocuments {
        constructor(_notebooksAndEditors) {
            this._notebooksAndEditors = _notebooksAndEditors;
            this._onDidSaveNotebookDocument = new event_1.Emitter();
            this.onDidSaveNotebookDocument = this._onDidSaveNotebookDocument.event;
            this._onDidChangeNotebookDocument = new event_1.Emitter();
            this.onDidChangeNotebookDocument = this._onDidChangeNotebookDocument.event;
        }
        $acceptModelChanged(uri, event, isDirty, newMetadata) {
            const document = this._notebooksAndEditors.getNotebookDocument(uri_1.URI.revive(uri));
            const e = document.acceptModelChanged(event.value, isDirty, newMetadata);
            this._onDidChangeNotebookDocument.fire(e);
        }
        $acceptDirtyStateChanged(uri, isDirty) {
            const document = this._notebooksAndEditors.getNotebookDocument(uri_1.URI.revive(uri));
            document.acceptDirty(isDirty);
        }
        $acceptModelSaved(uri) {
            const document = this._notebooksAndEditors.getNotebookDocument(uri_1.URI.revive(uri));
            this._onDidSaveNotebookDocument.fire(document.apiNotebook);
        }
    }
    exports.ExtHostNotebookDocuments = ExtHostNotebookDocuments;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdE5vdGVib29rRG9jdW1lbnRzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9jb21tb24vZXh0SG9zdE5vdGVib29rRG9jdW1lbnRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVVoRyxNQUFhLHdCQUF3QjtRQVFwQyxZQUNrQixvQkFBK0M7WUFBL0MseUJBQW9CLEdBQXBCLG9CQUFvQixDQUEyQjtZQVBoRCwrQkFBMEIsR0FBRyxJQUFJLGVBQU8sRUFBMkIsQ0FBQztZQUM1RSw4QkFBeUIsR0FBRyxJQUFJLENBQUMsMEJBQTBCLENBQUMsS0FBSyxDQUFDO1lBRTFELGlDQUE0QixHQUFHLElBQUksZUFBTyxFQUFzQyxDQUFDO1lBQ3pGLGdDQUEyQixHQUFHLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxLQUFLLENBQUM7UUFJM0UsQ0FBQztRQUVMLG1CQUFtQixDQUFDLEdBQWtCLEVBQUUsS0FBa0YsRUFBRSxPQUFnQixFQUFFLFdBQXNDO1lBQ25MLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxtQkFBbUIsQ0FBQyxTQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDaEYsTUFBTSxDQUFDLEdBQUcsUUFBUSxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ3pFLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDM0MsQ0FBQztRQUVELHdCQUF3QixDQUFDLEdBQWtCLEVBQUUsT0FBZ0I7WUFDNUQsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLG1CQUFtQixDQUFDLFNBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNoRixRQUFRLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQy9CLENBQUM7UUFFRCxpQkFBaUIsQ0FBQyxHQUFrQjtZQUNuQyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsbUJBQW1CLENBQUMsU0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ2hGLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzVELENBQUM7S0FDRDtJQTNCRCw0REEyQkMifQ==