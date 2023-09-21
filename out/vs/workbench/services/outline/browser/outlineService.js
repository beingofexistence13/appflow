/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/linkedList", "vs/platform/instantiation/common/extensions", "vs/workbench/services/outline/browser/outline", "vs/base/common/event"], function (require, exports, lifecycle_1, linkedList_1, extensions_1, outline_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class OutlineService {
        constructor() {
            this._factories = new linkedList_1.LinkedList();
            this._onDidChange = new event_1.Emitter();
            this.onDidChange = this._onDidChange.event;
        }
        canCreateOutline(pane) {
            for (const factory of this._factories) {
                if (factory.matches(pane)) {
                    return true;
                }
            }
            return false;
        }
        async createOutline(pane, target, token) {
            for (const factory of this._factories) {
                if (factory.matches(pane)) {
                    return await factory.createOutline(pane, target, token);
                }
            }
            return undefined;
        }
        registerOutlineCreator(creator) {
            const rm = this._factories.push(creator);
            this._onDidChange.fire();
            return (0, lifecycle_1.toDisposable)(() => {
                rm();
                this._onDidChange.fire();
            });
        }
    }
    (0, extensions_1.registerSingleton)(outline_1.IOutlineService, OutlineService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0bGluZVNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvb3V0bGluZS9icm93c2VyL291dGxpbmVTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBVWhHLE1BQU0sY0FBYztRQUFwQjtZQUlrQixlQUFVLEdBQUcsSUFBSSx1QkFBVSxFQUE2QixDQUFDO1lBRXpELGlCQUFZLEdBQUcsSUFBSSxlQUFPLEVBQVEsQ0FBQztZQUMzQyxnQkFBVyxHQUFnQixJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQztRQTRCN0QsQ0FBQztRQTFCQSxnQkFBZ0IsQ0FBQyxJQUFpQjtZQUNqQyxLQUFLLE1BQU0sT0FBTyxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7Z0JBQ3RDLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDMUIsT0FBTyxJQUFJLENBQUM7aUJBQ1o7YUFDRDtZQUNELE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUVELEtBQUssQ0FBQyxhQUFhLENBQUMsSUFBaUIsRUFBRSxNQUFxQixFQUFFLEtBQXdCO1lBQ3JGLEtBQUssTUFBTSxPQUFPLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtnQkFDdEMsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO29CQUMxQixPQUFPLE1BQU0sT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO2lCQUN4RDthQUNEO1lBQ0QsT0FBTyxTQUFTLENBQUM7UUFDbEIsQ0FBQztRQUVELHNCQUFzQixDQUFDLE9BQWtDO1lBQ3hELE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3pDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDekIsT0FBTyxJQUFBLHdCQUFZLEVBQUMsR0FBRyxFQUFFO2dCQUN4QixFQUFFLEVBQUUsQ0FBQztnQkFDTCxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQzFCLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztLQUNEO0lBR0QsSUFBQSw4QkFBaUIsRUFBQyx5QkFBZSxFQUFFLGNBQWMsb0NBQTRCLENBQUMifQ==