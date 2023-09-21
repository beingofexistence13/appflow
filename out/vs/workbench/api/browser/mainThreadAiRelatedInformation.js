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
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/workbench/api/common/extHost.protocol", "vs/workbench/services/aiRelatedInformation/common/aiRelatedInformation", "vs/workbench/services/extensions/common/extHostCustomers"], function (require, exports, cancellation_1, lifecycle_1, extHost_protocol_1, aiRelatedInformation_1, extHostCustomers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadAiRelatedInformation = void 0;
    let MainThreadAiRelatedInformation = class MainThreadAiRelatedInformation extends lifecycle_1.Disposable {
        constructor(context, _aiRelatedInformationService) {
            super();
            this._aiRelatedInformationService = _aiRelatedInformationService;
            this._registrations = this._register(new lifecycle_1.DisposableMap());
            this._proxy = context.getProxy(extHost_protocol_1.ExtHostContext.ExtHostAiRelatedInformation);
        }
        $getAiRelatedInformation(query, types) {
            // TODO: use a real cancellation token
            return this._aiRelatedInformationService.getRelatedInformation(query, types, cancellation_1.CancellationToken.None);
        }
        $registerAiRelatedInformationProvider(handle, type) {
            const provider = {
                provideAiRelatedInformation: (query, token) => {
                    return this._proxy.$provideAiRelatedInformation(handle, query, token);
                },
            };
            this._registrations.set(handle, this._aiRelatedInformationService.registerAiRelatedInformationProvider(type, provider));
        }
        $unregisterAiRelatedInformationProvider(handle) {
            this._registrations.deleteAndDispose(handle);
        }
    };
    exports.MainThreadAiRelatedInformation = MainThreadAiRelatedInformation;
    exports.MainThreadAiRelatedInformation = MainThreadAiRelatedInformation = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadAiRelatedInformation),
        __param(1, aiRelatedInformation_1.IAiRelatedInformationService)
    ], MainThreadAiRelatedInformation);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZEFpUmVsYXRlZEluZm9ybWF0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9icm93c2VyL21haW5UaHJlYWRBaVJlbGF0ZWRJbmZvcm1hdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFVekYsSUFBTSw4QkFBOEIsR0FBcEMsTUFBTSw4QkFBK0IsU0FBUSxzQkFBVTtRQUk3RCxZQUNDLE9BQXdCLEVBQ00sNEJBQTJFO1lBRXpHLEtBQUssRUFBRSxDQUFDO1lBRnVDLGlDQUE0QixHQUE1Qiw0QkFBNEIsQ0FBOEI7WUFKekYsbUJBQWMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUkseUJBQWEsRUFBVSxDQUFDLENBQUM7WUFPN0UsSUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLGlDQUFjLENBQUMsMkJBQTJCLENBQUMsQ0FBQztRQUM1RSxDQUFDO1FBRUQsd0JBQXdCLENBQUMsS0FBYSxFQUFFLEtBQStCO1lBQ3RFLHNDQUFzQztZQUN0QyxPQUFPLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLGdDQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3RHLENBQUM7UUFFRCxxQ0FBcUMsQ0FBQyxNQUFjLEVBQUUsSUFBNEI7WUFDakYsTUFBTSxRQUFRLEdBQWtDO2dCQUMvQywyQkFBMkIsRUFBRSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRTtvQkFDN0MsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLDRCQUE0QixDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ3ZFLENBQUM7YUFDRCxDQUFDO1lBQ0YsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxvQ0FBb0MsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUN6SCxDQUFDO1FBRUQsdUNBQXVDLENBQUMsTUFBYztZQUNyRCxJQUFJLENBQUMsY0FBYyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzlDLENBQUM7S0FDRCxDQUFBO0lBN0JZLHdFQUE4Qjs2Q0FBOUIsOEJBQThCO1FBRDFDLElBQUEsdUNBQW9CLEVBQUMsOEJBQVcsQ0FBQyw4QkFBOEIsQ0FBQztRQU85RCxXQUFBLG1EQUE0QixDQUFBO09BTmxCLDhCQUE4QixDQTZCMUMifQ==