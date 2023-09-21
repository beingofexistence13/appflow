/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/parts/ipc/electron-sandbox/ipc.electron"], function (require, exports, lifecycle_1, ipc_electron_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ElectronIPCMainProcessService = void 0;
    /**
     * An implementation of `IMainProcessService` that leverages Electron's IPC.
     */
    class ElectronIPCMainProcessService extends lifecycle_1.Disposable {
        constructor(windowId) {
            super();
            this.mainProcessConnection = this._register(new ipc_electron_1.Client(`window:${windowId}`));
        }
        getChannel(channelName) {
            return this.mainProcessConnection.getChannel(channelName);
        }
        registerChannel(channelName, channel) {
            this.mainProcessConnection.registerChannel(channelName, channel);
        }
    }
    exports.ElectronIPCMainProcessService = ElectronIPCMainProcessService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblByb2Nlc3NTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vaXBjL2VsZWN0cm9uLXNhbmRib3gvbWFpblByb2Nlc3NTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU9oRzs7T0FFRztJQUNILE1BQWEsNkJBQThCLFNBQVEsc0JBQVU7UUFNNUQsWUFDQyxRQUFnQjtZQUVoQixLQUFLLEVBQUUsQ0FBQztZQUVSLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUkscUJBQWlCLENBQUMsVUFBVSxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDMUYsQ0FBQztRQUVELFVBQVUsQ0FBQyxXQUFtQjtZQUM3QixPQUFPLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDM0QsQ0FBQztRQUVELGVBQWUsQ0FBQyxXQUFtQixFQUFFLE9BQStCO1lBQ25FLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxlQUFlLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ2xFLENBQUM7S0FDRDtJQXJCRCxzRUFxQkMifQ==