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
define(["require", "exports", "vs/editor/common/model", "vs/nls!vs/workbench/api/browser/mainThreadSaveParticipant", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/extensions/common/extHostCustomers", "vs/workbench/services/textfile/common/textfiles", "../common/extHost.protocol", "vs/base/common/async"], function (require, exports, model_1, nls_1, instantiation_1, extHostCustomers_1, textfiles_1, extHost_protocol_1, async_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Kkb = void 0;
    class ExtHostSaveParticipant {
        constructor(extHostContext) {
            this.a = extHostContext.getProxy(extHost_protocol_1.$2J.ExtHostDocumentSaveParticipant);
        }
        async participate(editorModel, env, _progress, token) {
            if (!editorModel.textEditorModel || !(0, model_1.$Gu)(editorModel.textEditorModel)) {
                // the model never made it to the extension
                // host meaning we cannot participate in its save
                return undefined;
            }
            const p = new Promise((resolve, reject) => {
                setTimeout(() => reject(new Error((0, nls_1.localize)(0, null))), 1750);
                this.a.$participateInSave(editorModel.resource, env.reason).then(values => {
                    if (!values.every(success => success)) {
                        return Promise.reject(new Error('listener failed'));
                    }
                    return undefined;
                }).then(resolve, reject);
            });
            return (0, async_1.$wg)(p, token);
        }
    }
    // The save participant can change a model before its saved to support various scenarios like trimming trailing whitespace
    let $Kkb = class $Kkb {
        constructor(extHostContext, instantiationService, b) {
            this.b = b;
            this.a = this.b.files.addSaveParticipant(instantiationService.createInstance(ExtHostSaveParticipant, extHostContext));
        }
        dispose() {
            this.a.dispose();
        }
    };
    exports.$Kkb = $Kkb;
    exports.$Kkb = $Kkb = __decorate([
        extHostCustomers_1.$kbb,
        __param(1, instantiation_1.$Ah),
        __param(2, textfiles_1.$JD)
    ], $Kkb);
});
//# sourceMappingURL=mainThreadSaveParticipant.js.map