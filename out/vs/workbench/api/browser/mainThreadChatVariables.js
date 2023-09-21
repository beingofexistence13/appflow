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
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/api/common/extHost.protocol", "vs/workbench/contrib/chat/common/chatVariables", "vs/workbench/services/extensions/common/extHostCustomers"], function (require, exports, lifecycle_1, extHost_protocol_1, chatVariables_1, extHostCustomers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadChatSlashCommands = void 0;
    let MainThreadChatSlashCommands = class MainThreadChatSlashCommands {
        constructor(extHostContext, _chatVariablesService) {
            this._chatVariablesService = _chatVariablesService;
            this._variables = new lifecycle_1.DisposableMap();
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostChatVariables);
        }
        dispose() {
            this._variables.clearAndDisposeAll();
        }
        $registerVariable(handle, data) {
            const registration = this._chatVariablesService.registerVariable(data, (messageText, _arg, _model, token) => {
                return this._proxy.$resolveVariable(handle, messageText, token);
            });
            this._variables.set(handle, registration);
        }
        $unregisterVariable(handle) {
            this._variables.deleteAndDispose(handle);
        }
    };
    exports.MainThreadChatSlashCommands = MainThreadChatSlashCommands;
    exports.MainThreadChatSlashCommands = MainThreadChatSlashCommands = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadChatVariables),
        __param(1, chatVariables_1.IChatVariablesService)
    ], MainThreadChatSlashCommands);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZENoYXRWYXJpYWJsZXMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2Jyb3dzZXIvbWFpblRocmVhZENoYXRWYXJpYWJsZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBUXpGLElBQU0sMkJBQTJCLEdBQWpDLE1BQU0sMkJBQTJCO1FBS3ZDLFlBQ0MsY0FBK0IsRUFDUixxQkFBNkQ7WUFBNUMsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtZQUpwRSxlQUFVLEdBQUcsSUFBSSx5QkFBYSxFQUFVLENBQUM7WUFNekQsSUFBSSxDQUFDLE1BQU0sR0FBRyxjQUFjLENBQUMsUUFBUSxDQUFDLGlDQUFjLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUM1RSxDQUFDO1FBRUQsT0FBTztZQUNOLElBQUksQ0FBQyxVQUFVLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUN0QyxDQUFDO1FBRUQsaUJBQWlCLENBQUMsTUFBYyxFQUFFLElBQXVCO1lBQ3hELE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRTtnQkFDM0csT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDakUsQ0FBQyxDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDM0MsQ0FBQztRQUVELG1CQUFtQixDQUFDLE1BQWM7WUFDakMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMxQyxDQUFDO0tBQ0QsQ0FBQTtJQTFCWSxrRUFBMkI7MENBQTNCLDJCQUEyQjtRQUR2QyxJQUFBLHVDQUFvQixFQUFDLDhCQUFXLENBQUMsdUJBQXVCLENBQUM7UUFRdkQsV0FBQSxxQ0FBcUIsQ0FBQTtPQVBYLDJCQUEyQixDQTBCdkMifQ==