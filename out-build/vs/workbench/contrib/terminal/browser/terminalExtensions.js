/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/registry/common/platform"], function (require, exports, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalExtensionsRegistry = exports.$BKb = void 0;
    function $BKb(id, ctor, canRunInDetachedTerminals = false) {
        TerminalContributionRegistry.INSTANCE.registerTerminalContribution({ id, ctor, canRunInDetachedTerminals });
    }
    exports.$BKb = $BKb;
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
            this.a = [];
        }
        registerTerminalContribution(description) {
            this.a.push(description);
        }
        getTerminalContributions() {
            return this.a.slice(0);
        }
    }
    var Extensions;
    (function (Extensions) {
        Extensions["TerminalContributions"] = "terminal.contributions";
    })(Extensions || (Extensions = {}));
    platform_1.$8m.add("terminal.contributions" /* Extensions.TerminalContributions */, TerminalContributionRegistry.INSTANCE);
});
//# sourceMappingURL=terminalExtensions.js.map