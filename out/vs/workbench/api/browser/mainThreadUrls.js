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
define(["require", "exports", "vs/workbench/api/common/extHost.protocol", "../../services/extensions/common/extHostCustomers", "vs/platform/url/common/url", "vs/workbench/services/extensions/browser/extensionUrlHandler", "vs/platform/extensions/common/extensions"], function (require, exports, extHost_protocol_1, extHostCustomers_1, url_1, extensionUrlHandler_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadUrls = void 0;
    class ExtensionUrlHandler {
        constructor(proxy, handle, extensionId, extensionDisplayName) {
            this.proxy = proxy;
            this.handle = handle;
            this.extensionId = extensionId;
            this.extensionDisplayName = extensionDisplayName;
        }
        handleURL(uri, options) {
            if (!extensions_1.ExtensionIdentifier.equals(this.extensionId, uri.authority)) {
                return Promise.resolve(false);
            }
            return Promise.resolve(this.proxy.$handleExternalUri(this.handle, uri)).then(() => true);
        }
    }
    let MainThreadUrls = class MainThreadUrls {
        constructor(context, urlService, extensionUrlHandler) {
            this.urlService = urlService;
            this.extensionUrlHandler = extensionUrlHandler;
            this.handlers = new Map();
            this.proxy = context.getProxy(extHost_protocol_1.ExtHostContext.ExtHostUrls);
        }
        $registerUriHandler(handle, extensionId, extensionDisplayName) {
            const handler = new ExtensionUrlHandler(this.proxy, handle, extensionId, extensionDisplayName);
            const disposable = this.urlService.registerHandler(handler);
            this.handlers.set(handle, { extensionId, disposable });
            this.extensionUrlHandler.registerExtensionHandler(extensionId, handler);
            return Promise.resolve(undefined);
        }
        $unregisterUriHandler(handle) {
            const tuple = this.handlers.get(handle);
            if (!tuple) {
                return Promise.resolve(undefined);
            }
            const { extensionId, disposable } = tuple;
            this.extensionUrlHandler.unregisterExtensionHandler(extensionId);
            this.handlers.delete(handle);
            disposable.dispose();
            return Promise.resolve(undefined);
        }
        async $createAppUri(uri) {
            return this.urlService.create(uri);
        }
        dispose() {
            this.handlers.forEach(({ disposable }) => disposable.dispose());
            this.handlers.clear();
        }
    };
    exports.MainThreadUrls = MainThreadUrls;
    exports.MainThreadUrls = MainThreadUrls = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadUrls),
        __param(1, url_1.IURLService),
        __param(2, extensionUrlHandler_1.IExtensionUrlHandler)
    ], MainThreadUrls);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZFVybHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2Jyb3dzZXIvbWFpblRocmVhZFVybHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBVWhHLE1BQU0sbUJBQW1CO1FBRXhCLFlBQ2tCLEtBQXVCLEVBQ3ZCLE1BQWMsRUFDdEIsV0FBZ0MsRUFDaEMsb0JBQTRCO1lBSHBCLFVBQUssR0FBTCxLQUFLLENBQWtCO1lBQ3ZCLFdBQU0sR0FBTixNQUFNLENBQVE7WUFDdEIsZ0JBQVcsR0FBWCxXQUFXLENBQXFCO1lBQ2hDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBUTtRQUNsQyxDQUFDO1FBRUwsU0FBUyxDQUFDLEdBQVEsRUFBRSxPQUF5QjtZQUM1QyxJQUFJLENBQUMsZ0NBQW1CLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFO2dCQUNqRSxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDOUI7WUFFRCxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzFGLENBQUM7S0FDRDtJQUdNLElBQU0sY0FBYyxHQUFwQixNQUFNLGNBQWM7UUFLMUIsWUFDQyxPQUF3QixFQUNYLFVBQXdDLEVBQy9CLG1CQUEwRDtZQURsRCxlQUFVLEdBQVYsVUFBVSxDQUFhO1lBQ2Qsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFzQjtZQUx6RSxhQUFRLEdBQUcsSUFBSSxHQUFHLEVBQXlFLENBQUM7WUFPbkcsSUFBSSxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLGlDQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDM0QsQ0FBQztRQUVELG1CQUFtQixDQUFDLE1BQWMsRUFBRSxXQUFnQyxFQUFFLG9CQUE0QjtZQUNqRyxNQUFNLE9BQU8sR0FBRyxJQUFJLG1CQUFtQixDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBQy9GLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRTVELElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyx3QkFBd0IsQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFFeEUsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ25DLENBQUM7UUFFRCxxQkFBcUIsQ0FBQyxNQUFjO1lBQ25DLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRXhDLElBQUksQ0FBQyxLQUFLLEVBQUU7Z0JBQ1gsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2FBQ2xDO1lBRUQsTUFBTSxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsR0FBRyxLQUFLLENBQUM7WUFFMUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLDBCQUEwQixDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ2pFLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzdCLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUVyQixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDbkMsQ0FBQztRQUVELEtBQUssQ0FBQyxhQUFhLENBQUMsR0FBa0I7WUFDckMsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNwQyxDQUFDO1FBRUQsT0FBTztZQUNOLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFDaEUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN2QixDQUFDO0tBQ0QsQ0FBQTtJQS9DWSx3Q0FBYzs2QkFBZCxjQUFjO1FBRDFCLElBQUEsdUNBQW9CLEVBQUMsOEJBQVcsQ0FBQyxjQUFjLENBQUM7UUFROUMsV0FBQSxpQkFBVyxDQUFBO1FBQ1gsV0FBQSwwQ0FBb0IsQ0FBQTtPQVJWLGNBQWMsQ0ErQzFCIn0=