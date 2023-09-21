/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation"], function (require, exports, event_1, iterator_1, lifecycle_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$_m = exports.$$m = exports.$0m = void 0;
    exports.$0m = (0, instantiation_1.$Bh)('policy');
    class $$m extends lifecycle_1.$kc {
        constructor() {
            super(...arguments);
            this.f = {};
            this.g = new Map();
            this.h = this.B(new event_1.$fd());
            this.onDidChange = this.h.event;
        }
        async updatePolicyDefinitions(policyDefinitions) {
            const size = Object.keys(this.f).length;
            this.f = { ...policyDefinitions, ...this.f };
            if (size !== Object.keys(this.f).length) {
                await this.j(policyDefinitions);
            }
            return iterator_1.Iterable.reduce(this.g.entries(), (r, [name, value]) => ({ ...r, [name]: value }), {});
        }
        getPolicyValue(name) {
            return this.g.get(name);
        }
        serialize() {
            return iterator_1.Iterable.reduce(Object.entries(this.f), (r, [name, definition]) => ({ ...r, [name]: { definition, value: this.g.get(name) } }), {});
        }
    }
    exports.$$m = $$m;
    class $_m {
        constructor() {
            this.onDidChange = event_1.Event.None;
        }
        async updatePolicyDefinitions() { return {}; }
        getPolicyValue() { return undefined; }
        serialize() { return undefined; }
    }
    exports.$_m = $_m;
});
//# sourceMappingURL=policy.js.map