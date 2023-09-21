/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/registry/common/platform"], function (require, exports, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalExtensionsRegistry = exports.registerTerminalContribution = void 0;
    function registerTerminalContribution(id, ctor, canRunInDetachedTerminals = false) {
        TerminalContributionRegistry.INSTANCE.registerTerminalContribution({ id, ctor, canRunInDetachedTerminals });
    }
    exports.registerTerminalContribution = registerTerminalContribution;
    var TerminalExtensionsRegistry;
    (function (TerminalExtensionsRegistry) {
        function getTerminalContributions() {
            return TerminalContributionRegistry.INSTANCE.getTerminalContributions();
        }
        TerminalExtensionsRegistry.getTerminalContributions = getTerminalContributions;
    })(TerminalExtensionsRegistry || (exports.TerminalExtensionsRegistry = TerminalExtensionsRegistry = {}));
    class TerminalContributionRegistry {
        static { this.INSTANCE = new TerminalContributionRegistry(); }
        constructor() {
            this._terminalContributions = [];
        }
        registerTerminalContribution(description) {
            this._terminalContributions.push(description);
        }
        getTerminalContributions() {
            return this._terminalContributions.slice(0);
        }
    }
    var Extensions;
    (function (Extensions) {
        Extensions["TerminalContributions"] = "terminal.contributions";
    })(Extensions || (Extensions = {}));
    platform_1.Registry.add("terminal.contributions" /* Extensions.TerminalContributions */, TerminalContributionRegistry.INSTANCE);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxFeHRlbnNpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVybWluYWwvYnJvd3Nlci90ZXJtaW5hbEV4dGVuc2lvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBb0JoRyxTQUFnQiw0QkFBNEIsQ0FBb0MsRUFBVSxFQUFFLElBQXVLLEVBQUUseUJBQXlCLEdBQUcsS0FBSztRQUNyUyw0QkFBNEIsQ0FBQyxRQUFRLENBQUMsNEJBQTRCLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLHlCQUF5QixFQUFzQyxDQUFDLENBQUM7SUFDakosQ0FBQztJQUZELG9FQUVDO0lBRUQsSUFBaUIsMEJBQTBCLENBSTFDO0lBSkQsV0FBaUIsMEJBQTBCO1FBQzFDLFNBQWdCLHdCQUF3QjtZQUN2QyxPQUFPLDRCQUE0QixDQUFDLFFBQVEsQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO1FBQ3pFLENBQUM7UUFGZSxtREFBd0IsMkJBRXZDLENBQUE7SUFDRixDQUFDLEVBSmdCLDBCQUEwQiwwQ0FBMUIsMEJBQTBCLFFBSTFDO0lBRUQsTUFBTSw0QkFBNEI7aUJBRVYsYUFBUSxHQUFHLElBQUksNEJBQTRCLEVBQUUsQUFBckMsQ0FBc0M7UUFJckU7WUFGaUIsMkJBQXNCLEdBQXVDLEVBQUUsQ0FBQztRQUdqRixDQUFDO1FBRU0sNEJBQTRCLENBQUMsV0FBNkM7WUFDaEYsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUMvQyxDQUFDO1FBRU0sd0JBQXdCO1lBQzlCLE9BQU8sSUFBSSxDQUFDLHNCQUFzQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3QyxDQUFDOztJQUdGLElBQVcsVUFFVjtJQUZELFdBQVcsVUFBVTtRQUNwQiw4REFBZ0QsQ0FBQTtJQUNqRCxDQUFDLEVBRlUsVUFBVSxLQUFWLFVBQVUsUUFFcEI7SUFFRCxtQkFBUSxDQUFDLEdBQUcsa0VBQW1DLDRCQUE0QixDQUFDLFFBQVEsQ0FBQyxDQUFDIn0=