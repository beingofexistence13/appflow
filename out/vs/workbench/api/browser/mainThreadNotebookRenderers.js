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
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/api/common/extHost.protocol", "vs/workbench/services/extensions/common/extHostCustomers", "vs/workbench/contrib/notebook/common/notebookRendererMessagingService"], function (require, exports, lifecycle_1, extHost_protocol_1, extHostCustomers_1, notebookRendererMessagingService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadNotebookRenderers = void 0;
    let MainThreadNotebookRenderers = class MainThreadNotebookRenderers extends lifecycle_1.Disposable {
        constructor(extHostContext, messaging) {
            super();
            this.messaging = messaging;
            this.proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostNotebookRenderers);
            this._register(messaging.onShouldPostMessage(e => {
                this.proxy.$postRendererMessage(e.editorId, e.rendererId, e.message);
            }));
        }
        $postMessage(editorId, rendererId, message) {
            return this.messaging.receiveMessage(editorId, rendererId, message);
        }
    };
    exports.MainThreadNotebookRenderers = MainThreadNotebookRenderers;
    exports.MainThreadNotebookRenderers = MainThreadNotebookRenderers = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadNotebookRenderers),
        __param(1, notebookRendererMessagingService_1.INotebookRendererMessagingService)
    ], MainThreadNotebookRenderers);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZE5vdGVib29rUmVuZGVyZXJzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9icm93c2VyL21haW5UaHJlYWROb3RlYm9va1JlbmRlcmVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFRekYsSUFBTSwyQkFBMkIsR0FBakMsTUFBTSwyQkFBNEIsU0FBUSxzQkFBVTtRQUcxRCxZQUNDLGNBQStCLEVBQ3FCLFNBQTRDO1lBRWhHLEtBQUssRUFBRSxDQUFDO1lBRjRDLGNBQVMsR0FBVCxTQUFTLENBQW1DO1lBR2hHLElBQUksQ0FBQyxLQUFLLEdBQUcsY0FBYyxDQUFDLFFBQVEsQ0FBQyxpQ0FBYyxDQUFDLHdCQUF3QixDQUFDLENBQUM7WUFDOUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ2hELElBQUksQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN0RSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUVELFlBQVksQ0FBQyxRQUE0QixFQUFFLFVBQWtCLEVBQUUsT0FBZ0I7WUFDOUUsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3JFLENBQUM7S0FDRCxDQUFBO0lBakJZLGtFQUEyQjswQ0FBM0IsMkJBQTJCO1FBRHZDLElBQUEsdUNBQW9CLEVBQUMsOEJBQVcsQ0FBQywyQkFBMkIsQ0FBQztRQU0zRCxXQUFBLG9FQUFpQyxDQUFBO09BTHZCLDJCQUEyQixDQWlCdkMifQ==