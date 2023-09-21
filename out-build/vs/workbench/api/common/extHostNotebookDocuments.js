/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/uri"], function (require, exports, event_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Xcc = void 0;
    class $Xcc {
        constructor(c) {
            this.c = c;
            this.a = new event_1.$fd();
            this.onDidSaveNotebookDocument = this.a.event;
            this.b = new event_1.$fd();
            this.onDidChangeNotebookDocument = this.b.event;
        }
        $acceptModelChanged(uri, event, isDirty, newMetadata) {
            const document = this.c.getNotebookDocument(uri_1.URI.revive(uri));
            const e = document.acceptModelChanged(event.value, isDirty, newMetadata);
            this.b.fire(e);
        }
        $acceptDirtyStateChanged(uri, isDirty) {
            const document = this.c.getNotebookDocument(uri_1.URI.revive(uri));
            document.acceptDirty(isDirty);
        }
        $acceptModelSaved(uri) {
            const document = this.c.getNotebookDocument(uri_1.URI.revive(uri));
            this.a.fire(document.apiNotebook);
        }
    }
    exports.$Xcc = $Xcc;
});
//# sourceMappingURL=extHostNotebookDocuments.js.map