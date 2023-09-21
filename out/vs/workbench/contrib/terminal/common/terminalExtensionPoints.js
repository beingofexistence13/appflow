/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/workbench/contrib/terminal/common/terminal", "vs/platform/instantiation/common/instantiation", "vs/base/common/uri"], function (require, exports, extensionsRegistry, terminal_1, instantiation_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalContributionService = exports.ITerminalContributionService = void 0;
    // terminal extension point
    const terminalsExtPoint = extensionsRegistry.ExtensionsRegistry.registerExtensionPoint(terminal_1.terminalContributionsDescriptor);
    exports.ITerminalContributionService = (0, instantiation_1.createDecorator)('terminalContributionsService');
    class TerminalContributionService {
        get terminalProfiles() { return this._terminalProfiles; }
        constructor() {
            this._terminalProfiles = [];
            terminalsExtPoint.setHandler(contributions => {
                this._terminalProfiles = contributions.map(c => {
                    return c.value?.profiles?.filter(p => hasValidTerminalIcon(p)).map(e => {
                        return { ...e, extensionIdentifier: c.description.identifier.value };
                    }) || [];
                }).flat();
            });
        }
    }
    exports.TerminalContributionService = TerminalContributionService;
    function hasValidTerminalIcon(profile) {
        return !profile.icon ||
            (typeof profile.icon === 'string' ||
                uri_1.URI.isUri(profile.icon) ||
                ('light' in profile.icon && 'dark' in profile.icon &&
                    uri_1.URI.isUri(profile.icon.light) && uri_1.URI.isUri(profile.icon.dark)));
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxFeHRlbnNpb25Qb2ludHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXJtaW5hbC9jb21tb24vdGVybWluYWxFeHRlbnNpb25Qb2ludHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBUWhHLDJCQUEyQjtJQUMzQixNQUFNLGlCQUFpQixHQUFHLGtCQUFrQixDQUFDLGtCQUFrQixDQUFDLHNCQUFzQixDQUF5QiwwQ0FBK0IsQ0FBQyxDQUFDO0lBUW5JLFFBQUEsNEJBQTRCLEdBQUcsSUFBQSwrQkFBZSxFQUErQiw4QkFBOEIsQ0FBQyxDQUFDO0lBRTFILE1BQWEsMkJBQTJCO1FBSXZDLElBQUksZ0JBQWdCLEtBQUssT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO1FBRXpEO1lBSFEsc0JBQWlCLEdBQTZDLEVBQUUsQ0FBQztZQUl4RSxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLEVBQUU7Z0JBQzVDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFO29CQUM5QyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFO3dCQUN0RSxPQUFPLEVBQUUsR0FBRyxDQUFDLEVBQUUsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7b0JBQ3RFLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDVixDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNYLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztLQUNEO0lBZkQsa0VBZUM7SUFFRCxTQUFTLG9CQUFvQixDQUFDLE9BQXFDO1FBQ2xFLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSTtZQUNuQixDQUNDLE9BQU8sT0FBTyxDQUFDLElBQUksS0FBSyxRQUFRO2dCQUNoQyxTQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7Z0JBQ3ZCLENBQ0MsT0FBTyxJQUFJLE9BQU8sQ0FBQyxJQUFJLElBQUksTUFBTSxJQUFJLE9BQU8sQ0FBQyxJQUFJO29CQUNqRCxTQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksU0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUM3RCxDQUNELENBQUM7SUFDSixDQUFDIn0=