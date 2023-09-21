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
define(["require", "exports", "vs/nls!vs/workbench/api/browser/mainThreadNotebookSaveParticipant", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/extensions/common/extHostCustomers", "../common/extHost.protocol", "vs/base/common/async", "vs/workbench/services/workingCopy/common/workingCopyFileService", "vs/workbench/contrib/notebook/common/notebookEditorModel"], function (require, exports, nls_1, instantiation_1, extHostCustomers_1, extHost_protocol_1, async_1, workingCopyFileService_1, notebookEditorModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$csb = void 0;
    class ExtHostNotebookDocumentSaveParticipant {
        constructor(extHostContext) {
            this.a = extHostContext.getProxy(extHost_protocol_1.$2J.ExtHostNotebookDocumentSaveParticipant);
        }
        async participate(workingCopy, env, _progress, token) {
            if (!workingCopy.model || !(workingCopy.model instanceof notebookEditorModel_1.$asb)) {
                return undefined;
            }
            let _warningTimeout;
            const p = new Promise((resolve, reject) => {
                _warningTimeout = setTimeout(() => reject(new Error((0, nls_1.localize)(0, null))), 1750);
                this.a.$participateInSave(workingCopy.resource, env.reason, token).then(_ => {
                    clearTimeout(_warningTimeout);
                    return undefined;
                }).then(resolve, reject);
            });
            return (0, async_1.$wg)(p, token);
        }
    }
    let $csb = class $csb {
        constructor(extHostContext, instantiationService, b) {
            this.b = b;
            this.a = this.b.addSaveParticipant(instantiationService.createInstance(ExtHostNotebookDocumentSaveParticipant, extHostContext));
        }
        dispose() {
            this.a.dispose();
        }
    };
    exports.$csb = $csb;
    exports.$csb = $csb = __decorate([
        extHostCustomers_1.$kbb,
        __param(1, instantiation_1.$Ah),
        __param(2, workingCopyFileService_1.$HD)
    ], $csb);
});
//# sourceMappingURL=mainThreadNotebookSaveParticipant.js.map