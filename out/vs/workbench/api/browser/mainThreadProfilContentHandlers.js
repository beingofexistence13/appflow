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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/marshalling", "vs/workbench/api/common/extHost.protocol", "vs/workbench/services/extensions/common/extHostCustomers", "vs/workbench/services/userDataProfile/common/userDataProfile"], function (require, exports, lifecycle_1, marshalling_1, extHost_protocol_1, extHostCustomers_1, userDataProfile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadProfileContentHandlers = void 0;
    let MainThreadProfileContentHandlers = class MainThreadProfileContentHandlers extends lifecycle_1.Disposable {
        constructor(context, userDataProfileImportExportService) {
            super();
            this.userDataProfileImportExportService = userDataProfileImportExportService;
            this.registeredHandlers = this._register(new lifecycle_1.DisposableMap());
            this.proxy = context.getProxy(extHost_protocol_1.ExtHostContext.ExtHostProfileContentHandlers);
        }
        async $registerProfileContentHandler(id, name, description, extensionId) {
            this.registeredHandlers.set(id, this.userDataProfileImportExportService.registerProfileContentHandler(id, {
                name,
                description,
                extensionId,
                saveProfile: async (name, content, token) => {
                    const result = await this.proxy.$saveProfile(id, name, content, token);
                    return result ? (0, marshalling_1.revive)(result) : null;
                },
                readProfile: async (uri, token) => {
                    return this.proxy.$readProfile(id, uri, token);
                },
            }));
        }
        async $unregisterProfileContentHandler(id) {
            this.registeredHandlers.deleteAndDispose(id);
        }
    };
    exports.MainThreadProfileContentHandlers = MainThreadProfileContentHandlers;
    exports.MainThreadProfileContentHandlers = MainThreadProfileContentHandlers = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadProfileContentHandlers),
        __param(1, userDataProfile_1.IUserDataProfileImportExportService)
    ], MainThreadProfileContentHandlers);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZFByb2ZpbENvbnRlbnRIYW5kbGVycy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvYnJvd3Nlci9tYWluVGhyZWFkUHJvZmlsQ29udGVudEhhbmRsZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVd6RixJQUFNLGdDQUFnQyxHQUF0QyxNQUFNLGdDQUFpQyxTQUFRLHNCQUFVO1FBTS9ELFlBQ0MsT0FBd0IsRUFDYSxrQ0FBd0Y7WUFFN0gsS0FBSyxFQUFFLENBQUM7WUFGOEMsdUNBQWtDLEdBQWxDLGtDQUFrQyxDQUFxQztZQUo3Ryx1QkFBa0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUkseUJBQWEsRUFBdUIsQ0FBQyxDQUFDO1lBTzlGLElBQUksQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxpQ0FBYyxDQUFDLDZCQUE2QixDQUFDLENBQUM7UUFDN0UsQ0FBQztRQUVELEtBQUssQ0FBQyw4QkFBOEIsQ0FBQyxFQUFVLEVBQUUsSUFBWSxFQUFFLFdBQStCLEVBQUUsV0FBbUI7WUFDbEgsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLGtDQUFrQyxDQUFDLDZCQUE2QixDQUFDLEVBQUUsRUFBRTtnQkFDekcsSUFBSTtnQkFDSixXQUFXO2dCQUNYLFdBQVc7Z0JBQ1gsV0FBVyxFQUFFLEtBQUssRUFBRSxJQUFZLEVBQUUsT0FBZSxFQUFFLEtBQXdCLEVBQUUsRUFBRTtvQkFDOUUsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztvQkFDdkUsT0FBTyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUEsb0JBQU0sRUFBcUIsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztnQkFDM0QsQ0FBQztnQkFDRCxXQUFXLEVBQUUsS0FBSyxFQUFFLEdBQVEsRUFBRSxLQUF3QixFQUFFLEVBQUU7b0JBQ3pELE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDaEQsQ0FBQzthQUNELENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUVELEtBQUssQ0FBQyxnQ0FBZ0MsQ0FBQyxFQUFVO1lBQ2hELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM5QyxDQUFDO0tBRUQsQ0FBQTtJQWpDWSw0RUFBZ0M7K0NBQWhDLGdDQUFnQztRQUQ1QyxJQUFBLHVDQUFvQixFQUFDLDhCQUFXLENBQUMsZ0NBQWdDLENBQUM7UUFTaEUsV0FBQSxxREFBbUMsQ0FBQTtPQVJ6QixnQ0FBZ0MsQ0FpQzVDIn0=