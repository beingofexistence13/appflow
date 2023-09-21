/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/policy/common/policy"], function (require, exports, event_1, lifecycle_1, policy_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$16b = exports.$Z6b = void 0;
    class $Z6b {
        constructor(b) {
            this.b = b;
            this.a = new lifecycle_1.$jc();
        }
        listen(_, event) {
            switch (event) {
                case 'onDidChange': return event_1.Event.map(this.b.onDidChange, names => names.reduce((r, name) => ({ ...r, [name]: this.b.getPolicyValue(name) ?? null }), {}), this.a);
            }
            throw new Error(`Event not found: ${event}`);
        }
        call(_, command, arg) {
            switch (command) {
                case 'updatePolicyDefinitions': return this.b.updatePolicyDefinitions(arg);
            }
            throw new Error(`Call not found: ${command}`);
        }
        dispose() {
            this.a.dispose();
        }
    }
    exports.$Z6b = $Z6b;
    class $16b extends policy_1.$$m {
        constructor(policiesData, a) {
            super();
            this.a = a;
            for (const name in policiesData) {
                const { definition, value } = policiesData[name];
                this.f[name] = definition;
                if (value !== undefined) {
                    this.g.set(name, value);
                }
            }
            this.a.listen('onDidChange')(policies => {
                for (const name in policies) {
                    const value = policies[name];
                    if (value === null) {
                        this.g.delete(name);
                    }
                    else {
                        this.g.set(name, value);
                    }
                }
                this.h.fire(Object.keys(policies));
            });
        }
        async j(policyDefinitions) {
            const result = await this.a.call('updatePolicyDefinitions', policyDefinitions);
            for (const name in result) {
                this.g.set(name, result[name]);
            }
        }
    }
    exports.$16b = $16b;
});
//# sourceMappingURL=policyIpc.js.map