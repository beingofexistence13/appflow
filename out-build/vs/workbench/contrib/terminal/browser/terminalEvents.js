/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$bWb = void 0;
    function $bWb(currentInstances, onAddInstance, onRemoveInstance, capabilityId, getEvent) {
        const store = new lifecycle_1.$jc();
        const multiplexer = store.add(new event_1.$ld());
        const capabilityListeners = store.add(new lifecycle_1.$sc());
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
        const addCapabilityMultiplexer = new event_1.$md(currentInstances, onAddInstance, onRemoveInstance, instance => event_1.Event.map(instance.capabilities.onDidAddCapability, changeEvent => ({ instance, changeEvent })));
        addCapabilityMultiplexer.event(e => {
            if (e.changeEvent.id === capabilityId) {
                addCapability(e.instance, e.changeEvent.capability);
            }
        });
        // Removed capabilities
        const removeCapabilityMultiplexer = new event_1.$md(currentInstances, onAddInstance, onRemoveInstance, instance => instance.capabilities.onDidRemoveCapability);
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
    exports.$bWb = $bWb;
});
//# sourceMappingURL=terminalEvents.js.map