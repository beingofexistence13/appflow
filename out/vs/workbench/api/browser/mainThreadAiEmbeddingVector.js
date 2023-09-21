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
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/api/common/extHost.protocol", "vs/workbench/services/aiEmbeddingVector/common/aiEmbeddingVectorService", "vs/workbench/services/extensions/common/extHostCustomers"], function (require, exports, lifecycle_1, extHost_protocol_1, aiEmbeddingVectorService_1, extHostCustomers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadAiEmbeddingVector = void 0;
    let MainThreadAiEmbeddingVector = class MainThreadAiEmbeddingVector extends lifecycle_1.Disposable {
        constructor(context, _AiEmbeddingVectorService) {
            super();
            this._AiEmbeddingVectorService = _AiEmbeddingVectorService;
            this._registrations = this._register(new lifecycle_1.DisposableMap());
            this._proxy = context.getProxy(extHost_protocol_1.ExtHostContext.ExtHostAiEmbeddingVector);
        }
        $registerAiEmbeddingVectorProvider(model, handle) {
            const provider = {
                provideAiEmbeddingVector: (strings, token) => {
                    return this._proxy.$provideAiEmbeddingVector(handle, strings, token);
                },
            };
            this._registrations.set(handle, this._AiEmbeddingVectorService.registerAiEmbeddingVectorProvider(model, provider));
        }
        $unregisterAiEmbeddingVectorProvider(handle) {
            this._registrations.deleteAndDispose(handle);
        }
    };
    exports.MainThreadAiEmbeddingVector = MainThreadAiEmbeddingVector;
    exports.MainThreadAiEmbeddingVector = MainThreadAiEmbeddingVector = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadAiEmbeddingVector),
        __param(1, aiEmbeddingVectorService_1.IAiEmbeddingVectorService)
    ], MainThreadAiEmbeddingVector);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZEFpRW1iZWRkaW5nVmVjdG9yLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9icm93c2VyL21haW5UaHJlYWRBaUVtYmVkZGluZ1ZlY3Rvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFTekYsSUFBTSwyQkFBMkIsR0FBakMsTUFBTSwyQkFBNEIsU0FBUSxzQkFBVTtRQUkxRCxZQUNDLE9BQXdCLEVBQ0cseUJBQXFFO1lBRWhHLEtBQUssRUFBRSxDQUFDO1lBRm9DLDhCQUF5QixHQUF6Qix5QkFBeUIsQ0FBMkI7WUFKaEYsbUJBQWMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUkseUJBQWEsRUFBVSxDQUFDLENBQUM7WUFPN0UsSUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLGlDQUFjLENBQUMsd0JBQXdCLENBQUMsQ0FBQztRQUN6RSxDQUFDO1FBRUQsa0NBQWtDLENBQUMsS0FBYSxFQUFFLE1BQWM7WUFDL0QsTUFBTSxRQUFRLEdBQStCO2dCQUM1Qyx3QkFBd0IsRUFBRSxDQUFDLE9BQWlCLEVBQUUsS0FBd0IsRUFBRSxFQUFFO29CQUN6RSxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMseUJBQXlCLENBQzNDLE1BQU0sRUFDTixPQUFPLEVBQ1AsS0FBSyxDQUNMLENBQUM7Z0JBQ0gsQ0FBQzthQUNELENBQUM7WUFDRixJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLHlCQUF5QixDQUFDLGlDQUFpQyxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ3BILENBQUM7UUFFRCxvQ0FBb0MsQ0FBQyxNQUFjO1lBQ2xELElBQUksQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDOUMsQ0FBQztLQUNELENBQUE7SUE1Qlksa0VBQTJCOzBDQUEzQiwyQkFBMkI7UUFEdkMsSUFBQSx1Q0FBb0IsRUFBQyw4QkFBVyxDQUFDLDJCQUEyQixDQUFDO1FBTzNELFdBQUEsb0RBQXlCLENBQUE7T0FOZiwyQkFBMkIsQ0E0QnZDIn0=