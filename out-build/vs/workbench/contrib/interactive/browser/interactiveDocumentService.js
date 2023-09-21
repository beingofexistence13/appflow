/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation"], function (require, exports, event_1, lifecycle_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$2ib = exports.$1ib = void 0;
    exports.$1ib = (0, instantiation_1.$Bh)('IInteractiveDocumentService');
    class $2ib extends lifecycle_1.$kc {
        constructor() {
            super();
            this.a = this.B(new event_1.$fd());
            this.onWillAddInteractiveDocument = this.a.event;
            this.b = this.B(new event_1.$fd());
            this.onWillRemoveInteractiveDocument = this.b.event;
        }
        willCreateInteractiveDocument(notebookUri, inputUri, languageId) {
            this.a.fire({
                notebookUri,
                inputUri,
                languageId
            });
        }
        willRemoveInteractiveDocument(notebookUri, inputUri) {
            this.b.fire({
                notebookUri,
                inputUri
            });
        }
    }
    exports.$2ib = $2ib;
});
//# sourceMappingURL=interactiveDocumentService.js.map