/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "./extHost.protocol", "vs/base/common/uri", "vs/base/common/lifecycle", "vs/base/common/errors", "vs/platform/extensions/common/extensions"], function (require, exports, extHost_protocol_1, uri_1, lifecycle_1, errors_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostUrls = void 0;
    class ExtHostUrls {
        static { this.HandlePool = 0; }
        constructor(mainContext) {
            this.handles = new extensions_1.ExtensionIdentifierSet();
            this.handlers = new Map();
            this._proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadUrls);
        }
        registerUriHandler(extension, handler) {
            const extensionId = extension.identifier;
            if (this.handles.has(extensionId)) {
                throw new Error(`Protocol handler already registered for extension ${extensionId}`);
            }
            const handle = ExtHostUrls.HandlePool++;
            this.handles.add(extensionId);
            this.handlers.set(handle, handler);
            this._proxy.$registerUriHandler(handle, extensionId, extension.displayName || extension.name);
            return (0, lifecycle_1.toDisposable)(() => {
                this.handles.delete(extensionId);
                this.handlers.delete(handle);
                this._proxy.$unregisterUriHandler(handle);
            });
        }
        $handleExternalUri(handle, uri) {
            const handler = this.handlers.get(handle);
            if (!handler) {
                return Promise.resolve(undefined);
            }
            try {
                handler.handleUri(uri_1.URI.revive(uri));
            }
            catch (err) {
                (0, errors_1.onUnexpectedError)(err);
            }
            return Promise.resolve(undefined);
        }
        async createAppUri(uri) {
            return uri_1.URI.revive(await this._proxy.$createAppUri(uri));
        }
    }
    exports.ExtHostUrls = ExtHostUrls;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFVybHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2NvbW1vbi9leHRIb3N0VXJscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFTaEcsTUFBYSxXQUFXO2lCQUVSLGVBQVUsR0FBRyxDQUFDLEFBQUosQ0FBSztRQU05QixZQUNDLFdBQXlCO1lBSmxCLFlBQU8sR0FBRyxJQUFJLG1DQUFzQixFQUFFLENBQUM7WUFDdkMsYUFBUSxHQUFHLElBQUksR0FBRyxFQUE2QixDQUFDO1lBS3ZELElBQUksQ0FBQyxNQUFNLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQyw4QkFBVyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ2hFLENBQUM7UUFFRCxrQkFBa0IsQ0FBQyxTQUFnQyxFQUFFLE9BQTBCO1lBQzlFLE1BQU0sV0FBVyxHQUFHLFNBQVMsQ0FBQyxVQUFVLENBQUM7WUFDekMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsRUFBRTtnQkFDbEMsTUFBTSxJQUFJLEtBQUssQ0FBQyxxREFBcUQsV0FBVyxFQUFFLENBQUMsQ0FBQzthQUNwRjtZQUVELE1BQU0sTUFBTSxHQUFHLFdBQVcsQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUN4QyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUM5QixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDbkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLEVBQUUsV0FBVyxFQUFFLFNBQVMsQ0FBQyxXQUFXLElBQUksU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRTlGLE9BQU8sSUFBQSx3QkFBWSxFQUFDLEdBQUcsRUFBRTtnQkFDeEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ2pDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUM3QixJQUFJLENBQUMsTUFBTSxDQUFDLHFCQUFxQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzNDLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELGtCQUFrQixDQUFDLE1BQWMsRUFBRSxHQUFrQjtZQUNwRCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUUxQyxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNiLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQzthQUNsQztZQUNELElBQUk7Z0JBQ0gsT0FBTyxDQUFDLFNBQVMsQ0FBQyxTQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7YUFDbkM7WUFBQyxPQUFPLEdBQUcsRUFBRTtnQkFDYixJQUFBLDBCQUFpQixFQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ3ZCO1lBRUQsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ25DLENBQUM7UUFFRCxLQUFLLENBQUMsWUFBWSxDQUFDLEdBQVE7WUFDMUIsT0FBTyxTQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN6RCxDQUFDOztJQWpERixrQ0FrREMifQ==