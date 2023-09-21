/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/platform/extensions/common/extensions"], function (require, exports, errors_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$BF = exports.$AF = void 0;
    class $AF {
        constructor() {
            this.a = new Map();
            this.b = new WeakMap();
        }
        register(extensionPointName, generator) {
            this.a.set(extensionPointName, generator);
        }
        /**
         * This can run correctly only on the renderer process because that is the only place
         * where all extension points and all implicit activation events generators are known.
         */
        readActivationEvents(extensionDescription) {
            if (!this.b.has(extensionDescription)) {
                this.b.set(extensionDescription, this.c(extensionDescription));
            }
            return this.b.get(extensionDescription);
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
                    result[extensions_1.$Vl.toKey(extensionDescription.identifier)] = activationEvents;
                }
            }
            return result;
        }
        c(desc) {
            if (typeof desc.main === 'undefined' && typeof desc.browser === 'undefined') {
                return [];
            }
            const activationEvents = (Array.isArray(desc.activationEvents) ? desc.activationEvents.slice(0) : []);
            if (!desc.contributes) {
                // no implicit activation events
                return activationEvents;
            }
            for (const extPointName in desc.contributes) {
                const generator = this.a.get(extPointName);
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
                    (0, errors_1.$Y)(err);
                }
            }
            return activationEvents;
        }
    }
    exports.$AF = $AF;
    exports.$BF = new $AF();
});
//# sourceMappingURL=implicitActivationEvents.js.map