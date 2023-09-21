/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation"], function (require, exports, event_1, iterator_1, lifecycle_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NullPolicyService = exports.AbstractPolicyService = exports.IPolicyService = void 0;
    exports.IPolicyService = (0, instantiation_1.createDecorator)('policy');
    class AbstractPolicyService extends lifecycle_1.Disposable {
        constructor() {
            super(...arguments);
            this.policyDefinitions = {};
            this.policies = new Map();
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
        }
        async updatePolicyDefinitions(policyDefinitions) {
            const size = Object.keys(this.policyDefinitions).length;
            this.policyDefinitions = { ...policyDefinitions, ...this.policyDefinitions };
            if (size !== Object.keys(this.policyDefinitions).length) {
                await this._updatePolicyDefinitions(policyDefinitions);
            }
            return iterator_1.Iterable.reduce(this.policies.entries(), (r, [name, value]) => ({ ...r, [name]: value }), {});
        }
        getPolicyValue(name) {
            return this.policies.get(name);
        }
        serialize() {
            return iterator_1.Iterable.reduce(Object.entries(this.policyDefinitions), (r, [name, definition]) => ({ ...r, [name]: { definition, value: this.policies.get(name) } }), {});
        }
    }
    exports.AbstractPolicyService = AbstractPolicyService;
    class NullPolicyService {
        constructor() {
            this.onDidChange = event_1.Event.None;
        }
        async updatePolicyDefinitions() { return {}; }
        getPolicyValue() { return undefined; }
        serialize() { return undefined; }
    }
    exports.NullPolicyService = NullPolicyService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9saWN5LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vcG9saWN5L2NvbW1vbi9wb2xpY3kudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBWW5GLFFBQUEsY0FBYyxHQUFHLElBQUEsK0JBQWUsRUFBaUIsUUFBUSxDQUFDLENBQUM7SUFXeEUsTUFBc0IscUJBQXNCLFNBQVEsc0JBQVU7UUFBOUQ7O1lBR1csc0JBQWlCLEdBQXdDLEVBQUUsQ0FBQztZQUM1RCxhQUFRLEdBQUcsSUFBSSxHQUFHLEVBQTJCLENBQUM7WUFFckMsaUJBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUF5QixDQUFDLENBQUM7WUFDOUUsZ0JBQVcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQztRQXNCaEQsQ0FBQztRQXBCQSxLQUFLLENBQUMsdUJBQXVCLENBQUMsaUJBQXNEO1lBQ25GLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsTUFBTSxDQUFDO1lBQ3hELElBQUksQ0FBQyxpQkFBaUIsR0FBRyxFQUFFLEdBQUcsaUJBQWlCLEVBQUUsR0FBRyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUU3RSxJQUFJLElBQUksS0FBSyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLE1BQU0sRUFBRTtnQkFDeEQsTUFBTSxJQUFJLENBQUMsd0JBQXdCLENBQUMsaUJBQWlCLENBQUMsQ0FBQzthQUN2RDtZQUVELE9BQU8sbUJBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN0RyxDQUFDO1FBRUQsY0FBYyxDQUFDLElBQWdCO1lBQzlCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDaEMsQ0FBQztRQUVELFNBQVM7WUFDUixPQUFPLG1CQUFRLENBQUMsTUFBTSxDQUEwRyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDN1EsQ0FBQztLQUdEO0lBN0JELHNEQTZCQztJQUVELE1BQWEsaUJBQWlCO1FBQTlCO1lBRVUsZ0JBQVcsR0FBRyxhQUFLLENBQUMsSUFBSSxDQUFDO1FBSW5DLENBQUM7UUFIQSxLQUFLLENBQUMsdUJBQXVCLEtBQUssT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzlDLGNBQWMsS0FBSyxPQUFPLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFDdEMsU0FBUyxLQUFLLE9BQU8sU0FBUyxDQUFDLENBQUMsQ0FBQztLQUNqQztJQU5ELDhDQU1DIn0=