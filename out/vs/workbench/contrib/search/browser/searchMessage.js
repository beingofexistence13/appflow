/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/browser/dom", "vs/base/common/linkedText", "vs/base/common/severity", "vs/platform/severityIcon/browser/severityIcon", "vs/workbench/services/search/common/searchExtTypes", "vs/base/common/network", "vs/platform/opener/browser/link", "vs/base/common/uri"], function (require, exports, nls, dom, linkedText_1, severity_1, severityIcon_1, searchExtTypes_1, network_1, link_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.renderSearchMessage = void 0;
    const renderSearchMessage = (message, instantiationService, notificationService, openerService, commandService, disposableStore, triggerSearch) => {
        const div = dom.$('div.providerMessage');
        const linkedText = (0, linkedText_1.parseLinkedText)(message.text);
        dom.append(div, dom.$('.' +
            severityIcon_1.SeverityIcon.className(message.type === searchExtTypes_1.TextSearchCompleteMessageType.Information
                ? severity_1.default.Info
                : severity_1.default.Warning)
                .split(' ')
                .join('.')));
        for (const node of linkedText.nodes) {
            if (typeof node === 'string') {
                dom.append(div, document.createTextNode(node));
            }
            else {
                const link = instantiationService.createInstance(link_1.Link, div, node, {
                    opener: async (href) => {
                        if (!message.trusted) {
                            return;
                        }
                        const parsed = uri_1.URI.parse(href, true);
                        if (parsed.scheme === network_1.Schemas.command && message.trusted) {
                            const result = await commandService.executeCommand(parsed.path);
                            if (result?.triggerSearch) {
                                triggerSearch();
                            }
                        }
                        else if (parsed.scheme === network_1.Schemas.https) {
                            openerService.open(parsed);
                        }
                        else {
                            if (parsed.scheme === network_1.Schemas.command && !message.trusted) {
                                notificationService.error(nls.localize('unable to open trust', "Unable to open command link from untrusted source: {0}", href));
                            }
                            else {
                                notificationService.error(nls.localize('unable to open', "Unable to open unknown link: {0}", href));
                            }
                        }
                    }
                });
                disposableStore.add(link);
            }
        }
        return div;
    };
    exports.renderSearchMessage = renderSearchMessage;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoTWVzc2FnZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3NlYXJjaC9icm93c2VyL3NlYXJjaE1lc3NhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBaUJ6RixNQUFNLG1CQUFtQixHQUFHLENBQ2xDLE9BQWtDLEVBQ2xDLG9CQUEyQyxFQUMzQyxtQkFBeUMsRUFDekMsYUFBNkIsRUFDN0IsY0FBK0IsRUFDL0IsZUFBZ0MsRUFDaEMsYUFBeUIsRUFDWCxFQUFFO1FBQ2hCLE1BQU0sR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUN6QyxNQUFNLFVBQVUsR0FBRyxJQUFBLDRCQUFlLEVBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pELEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUNiLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRztZQUNSLDJCQUFZLENBQUMsU0FBUyxDQUNyQixPQUFPLENBQUMsSUFBSSxLQUFLLDhDQUE2QixDQUFDLFdBQVc7Z0JBQ3pELENBQUMsQ0FBQyxrQkFBUSxDQUFDLElBQUk7Z0JBQ2YsQ0FBQyxDQUFDLGtCQUFRLENBQUMsT0FBTyxDQUFDO2lCQUNuQixLQUFLLENBQUMsR0FBRyxDQUFDO2lCQUNWLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFaEIsS0FBSyxNQUFNLElBQUksSUFBSSxVQUFVLENBQUMsS0FBSyxFQUFFO1lBQ3BDLElBQUksT0FBTyxJQUFJLEtBQUssUUFBUSxFQUFFO2dCQUM3QixHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7YUFDL0M7aUJBQU07Z0JBQ04sTUFBTSxJQUFJLEdBQUcsb0JBQW9CLENBQUMsY0FBYyxDQUFDLFdBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFO29CQUNqRSxNQUFNLEVBQUUsS0FBSyxFQUFDLElBQUksRUFBQyxFQUFFO3dCQUNwQixJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRTs0QkFBRSxPQUFPO3lCQUFFO3dCQUNqQyxNQUFNLE1BQU0sR0FBRyxTQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQzt3QkFDckMsSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLGlCQUFPLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxPQUFPLEVBQUU7NEJBQ3pELE1BQU0sTUFBTSxHQUFHLE1BQU0sY0FBYyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7NEJBQ2hFLElBQUssTUFBYyxFQUFFLGFBQWEsRUFBRTtnQ0FDbkMsYUFBYSxFQUFFLENBQUM7NkJBQ2hCO3lCQUNEOzZCQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxpQkFBTyxDQUFDLEtBQUssRUFBRTs0QkFDM0MsYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQzt5QkFDM0I7NkJBQU07NEJBQ04sSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLGlCQUFPLENBQUMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRTtnQ0FDMUQsbUJBQW1CLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsc0JBQXNCLEVBQUUsd0RBQXdELEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQzs2QkFDaEk7aUNBQU07Z0NBQ04sbUJBQW1CLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsa0NBQWtDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQzs2QkFDcEc7eUJBQ0Q7b0JBQ0YsQ0FBQztpQkFDRCxDQUFDLENBQUM7Z0JBQ0gsZUFBZSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUMxQjtTQUNEO1FBQ0QsT0FBTyxHQUFHLENBQUM7SUFDWixDQUFDLENBQUM7SUFoRFcsUUFBQSxtQkFBbUIsdUJBZ0Q5QiJ9