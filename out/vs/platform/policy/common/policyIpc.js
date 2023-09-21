/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/policy/common/policy"], function (require, exports, event_1, lifecycle_1, policy_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PolicyChannelClient = exports.PolicyChannel = void 0;
    class PolicyChannel {
        constructor(service) {
            this.service = service;
            this.disposables = new lifecycle_1.DisposableStore();
        }
        listen(_, event) {
            switch (event) {
                case 'onDidChange': return event_1.Event.map(this.service.onDidChange, names => names.reduce((r, name) => ({ ...r, [name]: this.service.getPolicyValue(name) ?? null }), {}), this.disposables);
            }
            throw new Error(`Event not found: ${event}`);
        }
        call(_, command, arg) {
            switch (command) {
                case 'updatePolicyDefinitions': return this.service.updatePolicyDefinitions(arg);
            }
            throw new Error(`Call not found: ${command}`);
        }
        dispose() {
            this.disposables.dispose();
        }
    }
    exports.PolicyChannel = PolicyChannel;
    class PolicyChannelClient extends policy_1.AbstractPolicyService {
        constructor(policiesData, channel) {
            super();
            this.channel = channel;
            for (const name in policiesData) {
                const { definition, value } = policiesData[name];
                this.policyDefinitions[name] = definition;
                if (value !== undefined) {
                    this.policies.set(name, value);
                }
            }
            this.channel.listen('onDidChange')(policies => {
                for (const name in policies) {
                    const value = policies[name];
                    if (value === null) {
                        this.policies.delete(name);
                    }
                    else {
                        this.policies.set(name, value);
                    }
                }
                this._onDidChange.fire(Object.keys(policies));
            });
        }
        async _updatePolicyDefinitions(policyDefinitions) {
            const result = await this.channel.call('updatePolicyDefinitions', policyDefinitions);
            for (const name in result) {
                this.policies.set(name, result[name]);
            }
        }
    }
    exports.PolicyChannelClient = PolicyChannelClient;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9saWN5SXBjLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vcG9saWN5L2NvbW1vbi9wb2xpY3lJcGMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBUWhHLE1BQWEsYUFBYTtRQUl6QixZQUFvQixPQUF1QjtZQUF2QixZQUFPLEdBQVAsT0FBTyxDQUFnQjtZQUYxQixnQkFBVyxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1FBRU4sQ0FBQztRQUVoRCxNQUFNLENBQUMsQ0FBVSxFQUFFLEtBQWE7WUFDL0IsUUFBUSxLQUFLLEVBQUU7Z0JBQ2QsS0FBSyxhQUFhLENBQUMsQ0FBQyxPQUFPLGFBQUssQ0FBQyxHQUFHLENBQ25DLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUN4QixLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQVMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUM3RyxJQUFJLENBQUMsV0FBVyxDQUNoQixDQUFDO2FBQ0Y7WUFFRCxNQUFNLElBQUksS0FBSyxDQUFDLG9CQUFvQixLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQzlDLENBQUM7UUFFRCxJQUFJLENBQUMsQ0FBVSxFQUFFLE9BQWUsRUFBRSxHQUFTO1lBQzFDLFFBQVEsT0FBTyxFQUFFO2dCQUNoQixLQUFLLHlCQUF5QixDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLHVCQUF1QixDQUFDLEdBQTBDLENBQUMsQ0FBQzthQUN4SDtZQUVELE1BQU0sSUFBSSxLQUFLLENBQUMsbUJBQW1CLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFDL0MsQ0FBQztRQUVELE9BQU87WUFDTixJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzVCLENBQUM7S0FDRDtJQTdCRCxzQ0E2QkM7SUFFRCxNQUFhLG1CQUFvQixTQUFRLDhCQUFxQjtRQUU3RCxZQUFZLFlBQXFGLEVBQW1CLE9BQWlCO1lBQ3BJLEtBQUssRUFBRSxDQUFDO1lBRDJHLFlBQU8sR0FBUCxPQUFPLENBQVU7WUFFcEksS0FBSyxNQUFNLElBQUksSUFBSSxZQUFZLEVBQUU7Z0JBQ2hDLE1BQU0sRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNqRCxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEdBQUcsVUFBVSxDQUFDO2dCQUMxQyxJQUFJLEtBQUssS0FBSyxTQUFTLEVBQUU7b0JBQ3hCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztpQkFDL0I7YUFDRDtZQUNELElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFTLGFBQWEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUNyRCxLQUFLLE1BQU0sSUFBSSxJQUFJLFFBQVEsRUFBRTtvQkFDNUIsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLElBQTZCLENBQUMsQ0FBQztvQkFFdEQsSUFBSSxLQUFLLEtBQUssSUFBSSxFQUFFO3dCQUNuQixJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDM0I7eUJBQU07d0JBQ04sSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO3FCQUMvQjtpQkFDRDtnQkFFRCxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDL0MsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRVMsS0FBSyxDQUFDLHdCQUF3QixDQUFDLGlCQUFzRDtZQUM5RixNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFzQyx5QkFBeUIsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1lBQzFILEtBQUssTUFBTSxJQUFJLElBQUksTUFBTSxFQUFFO2dCQUMxQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7YUFDdEM7UUFDRixDQUFDO0tBRUQ7SUFqQ0Qsa0RBaUNDIn0=