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
define(["require", "exports", "vs/editor/common/model", "vs/nls", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/extensions/common/extHostCustomers", "vs/workbench/services/textfile/common/textfiles", "../common/extHost.protocol", "vs/base/common/async"], function (require, exports, model_1, nls_1, instantiation_1, extHostCustomers_1, textfiles_1, extHost_protocol_1, async_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SaveParticipant = void 0;
    class ExtHostSaveParticipant {
        constructor(extHostContext) {
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostDocumentSaveParticipant);
        }
        async participate(editorModel, env, _progress, token) {
            if (!editorModel.textEditorModel || !(0, model_1.shouldSynchronizeModel)(editorModel.textEditorModel)) {
                // the model never made it to the extension
                // host meaning we cannot participate in its save
                return undefined;
            }
            const p = new Promise((resolve, reject) => {
                setTimeout(() => reject(new Error((0, nls_1.localize)('timeout.onWillSave', "Aborted onWillSaveTextDocument-event after 1750ms"))), 1750);
                this._proxy.$participateInSave(editorModel.resource, env.reason).then(values => {
                    if (!values.every(success => success)) {
                        return Promise.reject(new Error('listener failed'));
                    }
                    return undefined;
                }).then(resolve, reject);
            });
            return (0, async_1.raceCancellationError)(p, token);
        }
    }
    // The save participant can change a model before its saved to support various scenarios like trimming trailing whitespace
    let SaveParticipant = class SaveParticipant {
        constructor(extHostContext, instantiationService, _textFileService) {
            this._textFileService = _textFileService;
            this._saveParticipantDisposable = this._textFileService.files.addSaveParticipant(instantiationService.createInstance(ExtHostSaveParticipant, extHostContext));
        }
        dispose() {
            this._saveParticipantDisposable.dispose();
        }
    };
    exports.SaveParticipant = SaveParticipant;
    exports.SaveParticipant = SaveParticipant = __decorate([
        extHostCustomers_1.extHostCustomer,
        __param(1, instantiation_1.IInstantiationService),
        __param(2, textfiles_1.ITextFileService)
    ], SaveParticipant);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZFNhdmVQYXJ0aWNpcGFudC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvYnJvd3Nlci9tYWluVGhyZWFkU2F2ZVBhcnRpY2lwYW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWNoRyxNQUFNLHNCQUFzQjtRQUkzQixZQUFZLGNBQStCO1lBQzFDLElBQUksQ0FBQyxNQUFNLEdBQUcsY0FBYyxDQUFDLFFBQVEsQ0FBQyxpQ0FBYyxDQUFDLDhCQUE4QixDQUFDLENBQUM7UUFDdEYsQ0FBQztRQUVELEtBQUssQ0FBQyxXQUFXLENBQUMsV0FBaUMsRUFBRSxHQUEyQixFQUFFLFNBQW1DLEVBQUUsS0FBd0I7WUFFOUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLElBQUksQ0FBQyxJQUFBLDhCQUFzQixFQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsRUFBRTtnQkFDekYsMkNBQTJDO2dCQUMzQyxpREFBaUQ7Z0JBQ2pELE9BQU8sU0FBUyxDQUFDO2FBQ2pCO1lBRUQsTUFBTSxDQUFDLEdBQUcsSUFBSSxPQUFPLENBQU0sQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7Z0JBRTlDLFVBQVUsQ0FDVCxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsSUFBQSxjQUFRLEVBQUMsb0JBQW9CLEVBQUUsbURBQW1ELENBQUMsQ0FBQyxDQUFDLEVBQzVHLElBQUksQ0FDSixDQUFDO2dCQUNGLElBQUksQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO29CQUM5RSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFO3dCQUN0QyxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO3FCQUNwRDtvQkFDRCxPQUFPLFNBQVMsQ0FBQztnQkFDbEIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztZQUMxQixDQUFDLENBQUMsQ0FBQztZQUVILE9BQU8sSUFBQSw2QkFBcUIsRUFBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDeEMsQ0FBQztLQUNEO0lBRUQsMEhBQTBIO0lBRW5ILElBQU0sZUFBZSxHQUFyQixNQUFNLGVBQWU7UUFJM0IsWUFDQyxjQUErQixFQUNSLG9CQUEyQyxFQUMvQixnQkFBa0M7WUFBbEMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtZQUVyRSxJQUFJLENBQUMsMEJBQTBCLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsc0JBQXNCLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQztRQUMvSixDQUFDO1FBRUQsT0FBTztZQUNOLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUMzQyxDQUFDO0tBQ0QsQ0FBQTtJQWZZLDBDQUFlOzhCQUFmLGVBQWU7UUFEM0Isa0NBQWU7UUFPYixXQUFBLHFDQUFxQixDQUFBO1FBQ3JCLFdBQUEsNEJBQWdCLENBQUE7T0FQTixlQUFlLENBZTNCIn0=