/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/workbench/contrib/terminal/common/terminal", "vs/platform/instantiation/common/instantiation", "vs/base/common/uri"], function (require, exports, extensionsRegistry, terminal_1, instantiation_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$lWb = exports.$kWb = void 0;
    // terminal extension point
    const terminalsExtPoint = extensionsRegistry.$2F.registerExtensionPoint(terminal_1.$LM);
    exports.$kWb = (0, instantiation_1.$Bh)('terminalContributionsService');
    class $lWb {
        get terminalProfiles() { return this.a; }
        constructor() {
            this.a = [];
            terminalsExtPoint.setHandler(contributions => {
                this.a = contributions.map(c => {
                    return c.value?.profiles?.filter(p => hasValidTerminalIcon(p)).map(e => {
                        return { ...e, extensionIdentifier: c.description.identifier.value };
                    }) || [];
                }).flat();
            });
        }
    }
    exports.$lWb = $lWb;
    function hasValidTerminalIcon(profile) {
        return !profile.icon ||
            (typeof profile.icon === 'string' ||
                uri_1.URI.isUri(profile.icon) ||
                ('light' in profile.icon && 'dark' in profile.icon &&
                    uri_1.URI.isUri(profile.icon.light) && uri_1.URI.isUri(profile.icon.dark)));
    }
});
//# sourceMappingURL=terminalExtensionPoints.js.map