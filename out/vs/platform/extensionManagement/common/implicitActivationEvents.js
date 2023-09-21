/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/platform/extensions/common/extensions"], function (require, exports, errors_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ImplicitActivationEvents = exports.ImplicitActivationEventsImpl = void 0;
    class ImplicitActivationEventsImpl {
        constructor() {
            this._generators = new Map();
            this._cache = new WeakMap();
        }
        register(extensionPointName, generator) {
            this._generators.set(extensionPointName, generator);
        }
        /**
         * This can run correctly only on the renderer process because that is the only place
         * where all extension points and all implicit activation events generators are known.
         */
        readActivationEvents(extensionDescription) {
            if (!this._cache.has(extensionDescription)) {
                this._cache.set(extensionDescription, this._readActivationEvents(extensionDescription));
            }
            return this._cache.get(extensionDescription);
        }
        /**
         * This can run correctly only on the renderer process because that is the only place
         * where all extension points and all implicit activation events generators are known.
         */
        createActivationEventsMap(extensionDescriptions) {
            const result = Object.create(null);
            for (const extensionDescription of extensionDescriptions) {
                const activationEvents = this.readActivationEvents(extensionDescription);
                if (activationEvents.length > 0) {
                    result[extensions_1.ExtensionIdentifier.toKey(extensionDescription.identifier)] = activationEvents;
                }
            }
            return result;
        }
        _readActivationEvents(desc) {
            if (typeof desc.main === 'undefined' && typeof desc.browser === 'undefined') {
                return [];
            }
            const activationEvents = (Array.isArray(desc.activationEvents) ? desc.activationEvents.slice(0) : []);
            if (!desc.contributes) {
                // no implicit activation events
                return activationEvents;
            }
            for (const extPointName in desc.contributes) {
                const generator = this._generators.get(extPointName);
                if (!generator) {
                    // There's no generator for this extension point
                    continue;
                }
                const contrib = desc.contributes[extPointName];
                const contribArr = Array.isArray(contrib) ? contrib : [contrib];
                try {
                    generator(contribArr, activationEvents);
                }
                catch (err) {
                    (0, errors_1.onUnexpectedError)(err);
                }
            }
            return activationEvents;
        }
    }
    exports.ImplicitActivationEventsImpl = ImplicitActivationEventsImpl;
    exports.ImplicitActivationEvents = new ImplicitActivationEventsImpl();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1wbGljaXRBY3RpdmF0aW9uRXZlbnRzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vZXh0ZW5zaW9uTWFuYWdlbWVudC9jb21tb24vaW1wbGljaXRBY3RpdmF0aW9uRXZlbnRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVNoRyxNQUFhLDRCQUE0QjtRQUF6QztZQUVrQixnQkFBVyxHQUFHLElBQUksR0FBRyxFQUEyQyxDQUFDO1lBQ2pFLFdBQU0sR0FBRyxJQUFJLE9BQU8sRUFBbUMsQ0FBQztRQTREMUUsQ0FBQztRQTFETyxRQUFRLENBQUksa0JBQTBCLEVBQUUsU0FBd0M7WUFDdEYsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDckQsQ0FBQztRQUVEOzs7V0FHRztRQUNJLG9CQUFvQixDQUFDLG9CQUEyQztZQUN0RSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsRUFBRTtnQkFDM0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLHFCQUFxQixDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQzthQUN4RjtZQUNELE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUUsQ0FBQztRQUMvQyxDQUFDO1FBRUQ7OztXQUdHO1FBQ0kseUJBQXlCLENBQUMscUJBQThDO1lBQzlFLE1BQU0sTUFBTSxHQUF3QyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3hFLEtBQUssTUFBTSxvQkFBb0IsSUFBSSxxQkFBcUIsRUFBRTtnQkFDekQsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsb0JBQW9CLENBQUMsQ0FBQztnQkFDekUsSUFBSSxnQkFBZ0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO29CQUNoQyxNQUFNLENBQUMsZ0NBQW1CLENBQUMsS0FBSyxDQUFDLG9CQUFvQixDQUFDLFVBQVUsQ0FBQyxDQUFDLEdBQUcsZ0JBQWdCLENBQUM7aUJBQ3RGO2FBQ0Q7WUFDRCxPQUFPLE1BQU0sQ0FBQztRQUNmLENBQUM7UUFFTyxxQkFBcUIsQ0FBQyxJQUEyQjtZQUN4RCxJQUFJLE9BQU8sSUFBSSxDQUFDLElBQUksS0FBSyxXQUFXLElBQUksT0FBTyxJQUFJLENBQUMsT0FBTyxLQUFLLFdBQVcsRUFBRTtnQkFDNUUsT0FBTyxFQUFFLENBQUM7YUFDVjtZQUVELE1BQU0sZ0JBQWdCLEdBQWEsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNoSCxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFDdEIsZ0NBQWdDO2dCQUNoQyxPQUFPLGdCQUFnQixDQUFDO2FBQ3hCO1lBRUQsS0FBSyxNQUFNLFlBQVksSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO2dCQUM1QyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDckQsSUFBSSxDQUFDLFNBQVMsRUFBRTtvQkFDZixnREFBZ0Q7b0JBQ2hELFNBQVM7aUJBQ1Q7Z0JBQ0QsTUFBTSxPQUFPLEdBQUksSUFBSSxDQUFDLFdBQW1CLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQ3hELE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDaEUsSUFBSTtvQkFDSCxTQUFTLENBQUMsVUFBVSxFQUFFLGdCQUFnQixDQUFDLENBQUM7aUJBQ3hDO2dCQUFDLE9BQU8sR0FBRyxFQUFFO29CQUNiLElBQUEsMEJBQWlCLEVBQUMsR0FBRyxDQUFDLENBQUM7aUJBQ3ZCO2FBQ0Q7WUFFRCxPQUFPLGdCQUFnQixDQUFDO1FBQ3pCLENBQUM7S0FDRDtJQS9ERCxvRUErREM7SUFFWSxRQUFBLHdCQUF3QixHQUFpQyxJQUFJLDRCQUE0QixFQUFFLENBQUMifQ==