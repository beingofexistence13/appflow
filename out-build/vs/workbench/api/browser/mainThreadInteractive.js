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
define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/common/languages/modesRegistry", "vs/workbench/api/common/extHost.protocol", "vs/workbench/services/extensions/common/extHostCustomers", "vs/workbench/contrib/interactive/browser/interactiveDocumentService"], function (require, exports, lifecycle_1, modesRegistry_1, extHost_protocol_1, extHostCustomers_1, interactiveDocumentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$dsb = void 0;
    let $dsb = class $dsb {
        constructor(extHostContext, interactiveDocumentService) {
            this.b = new lifecycle_1.$jc();
            this.a = extHostContext.getProxy(extHost_protocol_1.$2J.ExtHostInteractive);
            this.b.add(interactiveDocumentService.onWillAddInteractiveDocument((e) => {
                this.a.$willAddInteractiveDocument(e.inputUri, '\n', modesRegistry_1.$Yt, e.notebookUri);
            }));
            this.b.add(interactiveDocumentService.onWillRemoveInteractiveDocument((e) => {
                this.a.$willRemoveInteractiveDocument(e.inputUri, e.notebookUri);
            }));
        }
        dispose() {
            this.b.dispose();
        }
    };
    exports.$dsb = $dsb;
    exports.$dsb = $dsb = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadInteractive),
        __param(1, interactiveDocumentService_1.$1ib)
    ], $dsb);
});
//# sourceMappingURL=mainThreadInteractive.js.map