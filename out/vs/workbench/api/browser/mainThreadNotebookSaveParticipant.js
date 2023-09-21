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
define(["require", "exports", "vs/nls", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/extensions/common/extHostCustomers", "../common/extHost.protocol", "vs/base/common/async", "vs/workbench/services/workingCopy/common/workingCopyFileService", "vs/workbench/contrib/notebook/common/notebookEditorModel"], function (require, exports, nls_1, instantiation_1, extHostCustomers_1, extHost_protocol_1, async_1, workingCopyFileService_1, notebookEditorModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SaveParticipant = void 0;
    class ExtHostNotebookDocumentSaveParticipant {
        constructor(extHostContext) {
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostNotebookDocumentSaveParticipant);
        }
        async participate(workingCopy, env, _progress, token) {
            if (!workingCopy.model || !(workingCopy.model instanceof notebookEditorModel_1.NotebookFileWorkingCopyModel)) {
                return undefined;
            }
            let _warningTimeout;
            const p = new Promise((resolve, reject) => {
                _warningTimeout = setTimeout(() => reject(new Error((0, nls_1.localize)('timeout.onWillSave', "Aborted onWillSaveNotebookDocument-event after 1750ms"))), 1750);
                this._proxy.$participateInSave(workingCopy.resource, env.reason, token).then(_ => {
                    clearTimeout(_warningTimeout);
                    return undefined;
                }).then(resolve, reject);
            });
            return (0, async_1.raceCancellationError)(p, token);
        }
    }
    let SaveParticipant = class SaveParticipant {
        constructor(extHostContext, instantiationService, workingCopyFileService) {
            this.workingCopyFileService = workingCopyFileService;
            this._saveParticipantDisposable = this.workingCopyFileService.addSaveParticipant(instantiationService.createInstance(ExtHostNotebookDocumentSaveParticipant, extHostContext));
        }
        dispose() {
            this._saveParticipantDisposable.dispose();
        }
    };
    exports.SaveParticipant = SaveParticipant;
    exports.SaveParticipant = SaveParticipant = __decorate([
        extHostCustomers_1.extHostCustomer,
        __param(1, instantiation_1.IInstantiationService),
        __param(2, workingCopyFileService_1.IWorkingCopyFileService)
    ], SaveParticipant);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZE5vdGVib29rU2F2ZVBhcnRpY2lwYW50LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9icm93c2VyL21haW5UaHJlYWROb3RlYm9va1NhdmVQYXJ0aWNpcGFudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFlaEcsTUFBTSxzQ0FBc0M7UUFJM0MsWUFBWSxjQUErQjtZQUMxQyxJQUFJLENBQUMsTUFBTSxHQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUMsaUNBQWMsQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO1FBQzlGLENBQUM7UUFFRCxLQUFLLENBQUMsV0FBVyxDQUFDLFdBQWdFLEVBQUUsR0FBMkIsRUFBRSxTQUFtQyxFQUFFLEtBQXdCO1lBRTdLLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxZQUFZLGtEQUE0QixDQUFDLEVBQUU7Z0JBQ3ZGLE9BQU8sU0FBUyxDQUFDO2FBQ2pCO1lBRUQsSUFBSSxlQUFvQixDQUFDO1lBRXpCLE1BQU0sQ0FBQyxHQUFHLElBQUksT0FBTyxDQUFNLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO2dCQUU5QyxlQUFlLEdBQUcsVUFBVSxDQUMzQixHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsSUFBQSxjQUFRLEVBQUMsb0JBQW9CLEVBQUUsdURBQXVELENBQUMsQ0FBQyxDQUFDLEVBQ2hILElBQUksQ0FDSixDQUFDO2dCQUNGLElBQUksQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRTtvQkFDaEYsWUFBWSxDQUFDLGVBQWUsQ0FBQyxDQUFDO29CQUM5QixPQUFPLFNBQVMsQ0FBQztnQkFDbEIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztZQUMxQixDQUFDLENBQUMsQ0FBQztZQUVILE9BQU8sSUFBQSw2QkFBcUIsRUFBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDeEMsQ0FBQztLQUNEO0lBR00sSUFBTSxlQUFlLEdBQXJCLE1BQU0sZUFBZTtRQUkzQixZQUNDLGNBQStCLEVBQ1Isb0JBQTJDLEVBQ3hCLHNCQUErQztZQUEvQywyQkFBc0IsR0FBdEIsc0JBQXNCLENBQXlCO1lBRXpGLElBQUksQ0FBQywwQkFBMEIsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsa0JBQWtCLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLHNDQUFzQyxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUM7UUFDL0ssQ0FBQztRQUVELE9BQU87WUFDTixJQUFJLENBQUMsMEJBQTBCLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDM0MsQ0FBQztLQUNELENBQUE7SUFmWSwwQ0FBZTs4QkFBZixlQUFlO1FBRDNCLGtDQUFlO1FBT2IsV0FBQSxxQ0FBcUIsQ0FBQTtRQUNyQixXQUFBLGdEQUF1QixDQUFBO09BUGIsZUFBZSxDQWUzQiJ9