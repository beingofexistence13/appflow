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
define(["require", "exports", "vs/nls", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/extensions/common/extHostCustomers", "vs/base/common/async", "vs/platform/workspace/common/editSessions", "vs/workbench/api/common/extHost.protocol"], function (require, exports, nls_1, instantiation_1, extHostCustomers_1, async_1, editSessions_1, extHost_protocol_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditSessionIdentityCreateParticipant = void 0;
    class ExtHostEditSessionIdentityCreateParticipant {
        constructor(extHostContext) {
            this.timeout = 10000;
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostWorkspace);
        }
        async participate(workspaceFolder, token) {
            const p = new Promise((resolve, reject) => {
                setTimeout(() => reject(new Error((0, nls_1.localize)('timeout.onWillCreateEditSessionIdentity', "Aborted onWillCreateEditSessionIdentity-event after 10000ms"))), this.timeout);
                this._proxy.$onWillCreateEditSessionIdentity(workspaceFolder.uri, token, this.timeout).then(resolve, reject);
            });
            return (0, async_1.raceCancellationError)(p, token);
        }
    }
    let EditSessionIdentityCreateParticipant = class EditSessionIdentityCreateParticipant {
        constructor(extHostContext, instantiationService, _editSessionIdentityService) {
            this._editSessionIdentityService = _editSessionIdentityService;
            this._saveParticipantDisposable = this._editSessionIdentityService.addEditSessionIdentityCreateParticipant(instantiationService.createInstance(ExtHostEditSessionIdentityCreateParticipant, extHostContext));
        }
        dispose() {
            this._saveParticipantDisposable.dispose();
        }
    };
    exports.EditSessionIdentityCreateParticipant = EditSessionIdentityCreateParticipant;
    exports.EditSessionIdentityCreateParticipant = EditSessionIdentityCreateParticipant = __decorate([
        extHostCustomers_1.extHostCustomer,
        __param(1, instantiation_1.IInstantiationService),
        __param(2, editSessions_1.IEditSessionIdentityService)
    ], EditSessionIdentityCreateParticipant);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZEVkaXRTZXNzaW9uSWRlbnRpdHlQYXJ0aWNpcGFudC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvYnJvd3Nlci9tYWluVGhyZWFkRWRpdFNlc3Npb25JZGVudGl0eVBhcnRpY2lwYW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVloRyxNQUFNLDJDQUEyQztRQUtoRCxZQUFZLGNBQStCO1lBRjFCLFlBQU8sR0FBRyxLQUFLLENBQUM7WUFHaEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxjQUFjLENBQUMsUUFBUSxDQUFDLGlDQUFjLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUN4RSxDQUFDO1FBRUQsS0FBSyxDQUFDLFdBQVcsQ0FBQyxlQUFnQyxFQUFFLEtBQXdCO1lBQzNFLE1BQU0sQ0FBQyxHQUFHLElBQUksT0FBTyxDQUFNLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO2dCQUU5QyxVQUFVLENBQ1QsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLElBQUEsY0FBUSxFQUFDLHlDQUF5QyxFQUFFLDZEQUE2RCxDQUFDLENBQUMsQ0FBQyxFQUMzSSxJQUFJLENBQUMsT0FBTyxDQUNaLENBQUM7Z0JBQ0YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQ0FBZ0MsQ0FBQyxlQUFlLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztZQUM5RyxDQUFDLENBQUMsQ0FBQztZQUVILE9BQU8sSUFBQSw2QkFBcUIsRUFBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDeEMsQ0FBQztLQUNEO0lBR00sSUFBTSxvQ0FBb0MsR0FBMUMsTUFBTSxvQ0FBb0M7UUFJaEQsWUFDQyxjQUErQixFQUNSLG9CQUEyQyxFQUNwQiwyQkFBd0Q7WUFBeEQsZ0NBQTJCLEdBQTNCLDJCQUEyQixDQUE2QjtZQUV0RyxJQUFJLENBQUMsMEJBQTBCLEdBQUcsSUFBSSxDQUFDLDJCQUEyQixDQUFDLHVDQUF1QyxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQywyQ0FBMkMsRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDO1FBQzlNLENBQUM7UUFFRCxPQUFPO1lBQ04sSUFBSSxDQUFDLDBCQUEwQixDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzNDLENBQUM7S0FDRCxDQUFBO0lBZlksb0ZBQW9DO21EQUFwQyxvQ0FBb0M7UUFEaEQsa0NBQWU7UUFPYixXQUFBLHFDQUFxQixDQUFBO1FBQ3JCLFdBQUEsMENBQTJCLENBQUE7T0FQakIsb0NBQW9DLENBZWhEIn0=