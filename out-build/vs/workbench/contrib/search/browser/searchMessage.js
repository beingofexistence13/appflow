/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/search/browser/searchMessage", "vs/base/browser/dom", "vs/base/common/linkedText", "vs/base/common/severity", "vs/platform/severityIcon/browser/severityIcon", "vs/workbench/services/search/common/searchExtTypes", "vs/base/common/network", "vs/platform/opener/browser/link", "vs/base/common/uri"], function (require, exports, nls, dom, linkedText_1, severity_1, severityIcon_1, searchExtTypes_1, network_1, link_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$3Ob = void 0;
    const $3Ob = (message, instantiationService, notificationService, openerService, commandService, disposableStore, triggerSearch) => {
        const div = dom.$('div.providerMessage');
        const linkedText = (0, linkedText_1.$IS)(message.text);
        dom.$0O(div, dom.$('.' +
            severityIcon_1.SeverityIcon.className(message.type === searchExtTypes_1.TextSearchCompleteMessageType.Information
                ? severity_1.default.Info
                : severity_1.default.Warning)
                .split(' ')
                .join('.')));
        for (const node of linkedText.nodes) {
            if (typeof node === 'string') {
                dom.$0O(div, document.createTextNode(node));
            }
            else {
                const link = instantiationService.createInstance(link_1.$40, div, node, {
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
                                notificationService.error(nls.localize(0, null, href));
                            }
                            else {
                                notificationService.error(nls.localize(1, null, href));
                            }
                        }
                    }
                });
                disposableStore.add(link);
            }
        }
        return div;
    };
    exports.$3Ob = $3Ob;
});
//# sourceMappingURL=searchMessage.js.map