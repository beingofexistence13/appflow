/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostCustomersRegistry = exports.$kbb = exports.$jbb = void 0;
    function $jbb(id) {
        return function (ctor) {
            ExtHostCustomersRegistryImpl.INSTANCE.registerNamedCustomer(id, ctor);
        };
    }
    exports.$jbb = $jbb;
    function $kbb(ctor) {
        ExtHostCustomersRegistryImpl.INSTANCE.registerCustomer(ctor);
    }
    exports.$kbb = $kbb;
    var ExtHostCustomersRegistry;
    (function (ExtHostCustomersRegistry) {
        function getNamedCustomers() {
            return ExtHostCustomersRegistryImpl.INSTANCE.getNamedCustomers();
        }
        ExtHostCustomersRegistry.getNamedCustomers = getNamedCustomers;
        function getCustomers() {
            return ExtHostCustomersRegistryImpl.INSTANCE.getCustomers();
        }
        ExtHostCustomersRegistry.getCustomers = getCustomers;
    })(ExtHostCustomersRegistry || (exports.ExtHostCustomersRegistry = ExtHostCustomersRegistry = {}));
    class ExtHostCustomersRegistryImpl {
        static { this.INSTANCE = new ExtHostCustomersRegistryImpl(); }
        constructor() {
            this.a = [];
            this.b = [];
        }
        registerNamedCustomer(id, ctor) {
            const entry = [id, ctor];
            this.a.push(entry);
        }
        getNamedCustomers() {
            return this.a;
        }
        registerCustomer(ctor) {
            this.b.push(ctor);
        }
        getCustomers() {
            return this.b;
        }
    }
});
//# sourceMappingURL=extHostCustomers.js.map