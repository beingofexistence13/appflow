/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "./descriptors"], function (require, exports, descriptors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$nr = exports.$mr = exports.InstantiationType = void 0;
    const _registry = [];
    var InstantiationType;
    (function (InstantiationType) {
        /**
         * Instantiate this service as soon as a consumer depends on it. _Note_ that this
         * is more costly as some upfront work is done that is likely not needed
         */
        InstantiationType[InstantiationType["Eager"] = 0] = "Eager";
        /**
         * Instantiate this service as soon as a consumer uses it. This is the _better_
         * way of registering a service.
         */
        InstantiationType[InstantiationType["Delayed"] = 1] = "Delayed";
    })(InstantiationType || (exports.InstantiationType = InstantiationType = {}));
    function $mr(id, ctorOrDescriptor, supportsDelayedInstantiation) {
        if (!(ctorOrDescriptor instanceof descriptors_1.$yh)) {
            ctorOrDescriptor = new descriptors_1.$yh(ctorOrDescriptor, [], Boolean(supportsDelayedInstantiation));
        }
        _registry.push([id, ctorOrDescriptor]);
    }
    exports.$mr = $mr;
    function $nr() {
        return _registry;
    }
    exports.$nr = $nr;
});
//# sourceMappingURL=extensions.js.map