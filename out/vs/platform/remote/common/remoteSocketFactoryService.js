/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation"], function (require, exports, lifecycle_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RemoteSocketFactoryService = exports.IRemoteSocketFactoryService = void 0;
    exports.IRemoteSocketFactoryService = (0, instantiation_1.createDecorator)('remoteSocketFactoryService');
    class RemoteSocketFactoryService {
        constructor() {
            this.factories = {};
        }
        register(type, factory) {
            this.factories[type] ??= [];
            this.factories[type].push(factory);
            return (0, lifecycle_1.toDisposable)(() => {
                const idx = this.factories[type]?.indexOf(factory);
                if (typeof idx === 'number' && idx >= 0) {
                    this.factories[type]?.splice(idx, 1);
                }
            });
        }
        getSocketFactory(messagePassing) {
            const factories = (this.factories[messagePassing.type] || []);
            return factories.find(factory => factory.supports(messagePassing));
        }
        connect(connectTo, path, query, debugLabel) {
            const socketFactory = this.getSocketFactory(connectTo);
            if (!socketFactory) {
                throw new Error(`No socket factory found for ${connectTo}`);
            }
            return socketFactory.connect(connectTo, path, query, debugLabel);
        }
    }
    exports.RemoteSocketFactoryService = RemoteSocketFactoryService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlU29ja2V0RmFjdG9yeVNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9yZW1vdGUvY29tbW9uL3JlbW90ZVNvY2tldEZhY3RvcnlTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU9uRixRQUFBLDJCQUEyQixHQUFHLElBQUEsK0JBQWUsRUFBOEIsNEJBQTRCLENBQUMsQ0FBQztJQXFCdEgsTUFBYSwwQkFBMEI7UUFBdkM7WUFHa0IsY0FBUyxHQUEwRCxFQUFFLENBQUM7UUF5QnhGLENBQUM7UUF2Qk8sUUFBUSxDQUFpQyxJQUFPLEVBQUUsT0FBMEI7WUFDbEYsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDNUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDcEMsT0FBTyxJQUFBLHdCQUFZLEVBQUMsR0FBRyxFQUFFO2dCQUN4QixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDbkQsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRTtvQkFDeEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO2lCQUNyQztZQUNGLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVPLGdCQUFnQixDQUFpQyxjQUF5QztZQUNqRyxNQUFNLFNBQVMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBd0IsQ0FBQztZQUNyRixPQUFPLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7UUFDcEUsQ0FBQztRQUVNLE9BQU8sQ0FBQyxTQUEyQixFQUFFLElBQVksRUFBRSxLQUFhLEVBQUUsVUFBa0I7WUFDMUYsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3ZELElBQUksQ0FBQyxhQUFhLEVBQUU7Z0JBQ25CLE1BQU0sSUFBSSxLQUFLLENBQUMsK0JBQStCLFNBQVMsRUFBRSxDQUFDLENBQUM7YUFDNUQ7WUFDRCxPQUFPLGFBQWEsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDbEUsQ0FBQztLQUNEO0lBNUJELGdFQTRCQyJ9