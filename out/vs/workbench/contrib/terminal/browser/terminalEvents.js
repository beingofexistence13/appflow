/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createInstanceCapabilityEventMultiplexer = void 0;
    function createInstanceCapabilityEventMultiplexer(currentInstances, onAddInstance, onRemoveInstance, capabilityId, getEvent) {
        const store = new lifecycle_1.DisposableStore();
        const multiplexer = store.add(new event_1.EventMultiplexer());
        const capabilityListeners = store.add(new lifecycle_1.DisposableMap());
        function addCapability(instance, capability) {
            const listener = multiplexer.add(event_1.Event.map(getEvent(capability), data => ({ instance, data })));
            capabilityListeners.set(capability, listener);
        }
        // Existing capabilities
        for (const instance of currentInstances) {
            const capability = instance.capabilities.get(capabilityId);
            if (capability) {
                addCapability(instance, capability);
            }
        }
        // Added capabilities
        const addCapabilityMultiplexer = new event_1.DynamicListEventMultiplexer(currentInstances, onAddInstance, onRemoveInstance, instance => event_1.Event.map(instance.capabilities.onDidAddCapability, changeEvent => ({ instance, changeEvent })));
        addCapabilityMultiplexer.event(e => {
            if (e.changeEvent.id === capabilityId) {
                addCapability(e.instance, e.changeEvent.capability);
            }
        });
        // Removed capabilities
        const removeCapabilityMultiplexer = new event_1.DynamicListEventMultiplexer(currentInstances, onAddInstance, onRemoveInstance, instance => instance.capabilities.onDidRemoveCapability);
        removeCapabilityMultiplexer.event(e => {
            if (e.id === capabilityId) {
                capabilityListeners.deleteAndDispose(e.capability);
            }
        });
        return {
            dispose: () => store.dispose(),
            event: multiplexer.event
        };
    }
    exports.createInstanceCapabilityEventMultiplexer = createInstanceCapabilityEventMultiplexer;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxFdmVudHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXJtaW5hbC9icm93c2VyL3Rlcm1pbmFsRXZlbnRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU9oRyxTQUFnQix3Q0FBd0MsQ0FDdkQsZ0JBQXFDLEVBQ3JDLGFBQXVDLEVBQ3ZDLGdCQUEwQyxFQUMxQyxZQUFlLEVBQ2YsUUFBaUU7UUFFakUsTUFBTSxLQUFLLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7UUFDcEMsTUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLHdCQUFnQixFQUE0QyxDQUFDLENBQUM7UUFDaEcsTUFBTSxtQkFBbUIsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUkseUJBQWEsRUFBOEMsQ0FBQyxDQUFDO1FBRXZHLFNBQVMsYUFBYSxDQUFDLFFBQTJCLEVBQUUsVUFBeUM7WUFDNUYsTUFBTSxRQUFRLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxhQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEcsbUJBQW1CLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUMvQyxDQUFDO1FBRUQsd0JBQXdCO1FBQ3hCLEtBQUssTUFBTSxRQUFRLElBQUksZ0JBQWdCLEVBQUU7WUFDeEMsTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDM0QsSUFBSSxVQUFVLEVBQUU7Z0JBQ2YsYUFBYSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQzthQUNwQztTQUNEO1FBRUQscUJBQXFCO1FBQ3JCLE1BQU0sd0JBQXdCLEdBQUcsSUFBSSxtQ0FBMkIsQ0FDL0QsZ0JBQWdCLEVBQ2hCLGFBQWEsRUFDYixnQkFBZ0IsRUFDaEIsUUFBUSxDQUFDLEVBQUUsQ0FBQyxhQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsa0JBQWtCLEVBQUUsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FDM0csQ0FBQztRQUNGLHdCQUF3QixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUNsQyxJQUFJLENBQUMsQ0FBQyxXQUFXLENBQUMsRUFBRSxLQUFLLFlBQVksRUFBRTtnQkFDdEMsYUFBYSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUNwRDtRQUNGLENBQUMsQ0FBQyxDQUFDO1FBRUgsdUJBQXVCO1FBQ3ZCLE1BQU0sMkJBQTJCLEdBQUcsSUFBSSxtQ0FBMkIsQ0FDbEUsZ0JBQWdCLEVBQ2hCLGFBQWEsRUFDYixnQkFBZ0IsRUFDaEIsUUFBUSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLHFCQUFxQixDQUN2RCxDQUFDO1FBQ0YsMkJBQTJCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ3JDLElBQUksQ0FBQyxDQUFDLEVBQUUsS0FBSyxZQUFZLEVBQUU7Z0JBQzFCLG1CQUFtQixDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUNuRDtRQUNGLENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTztZQUNOLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFO1lBQzlCLEtBQUssRUFBRSxXQUFXLENBQUMsS0FBSztTQUN4QixDQUFDO0lBQ0gsQ0FBQztJQXRERCw0RkFzREMifQ==