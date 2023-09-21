/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainProcessService = exports.IMainProcessService = void 0;
    exports.IMainProcessService = (0, instantiation_1.createDecorator)('mainProcessService');
    /**
     * An implementation of `IMainProcessService` that leverages `IPCServer`.
     */
    class MainProcessService {
        constructor(server, router) {
            this.server = server;
            this.router = router;
        }
        getChannel(channelName) {
            return this.server.getChannel(channelName, this.router);
        }
        registerChannel(channelName, channel) {
            this.server.registerChannel(channelName, channel);
        }
    }
    exports.MainProcessService = MainProcessService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblByb2Nlc3NTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vaXBjL2NvbW1vbi9tYWluUHJvY2Vzc1NlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBTW5GLFFBQUEsbUJBQW1CLEdBQUcsSUFBQSwrQkFBZSxFQUFzQixvQkFBb0IsQ0FBQyxDQUFDO0lBSTlGOztPQUVHO0lBQ0gsTUFBYSxrQkFBa0I7UUFJOUIsWUFDUyxNQUFpQixFQUNqQixNQUFvQjtZQURwQixXQUFNLEdBQU4sTUFBTSxDQUFXO1lBQ2pCLFdBQU0sR0FBTixNQUFNLENBQWM7UUFDekIsQ0FBQztRQUVMLFVBQVUsQ0FBQyxXQUFtQjtZQUM3QixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDekQsQ0FBQztRQUVELGVBQWUsQ0FBQyxXQUFtQixFQUFFLE9BQStCO1lBQ25FLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNuRCxDQUFDO0tBQ0Q7SUFoQkQsZ0RBZ0JDIn0=