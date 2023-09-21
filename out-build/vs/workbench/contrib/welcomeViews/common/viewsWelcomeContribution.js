/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/welcomeViews/common/viewsWelcomeContribution", "vs/base/common/lifecycle", "vs/platform/contextkey/common/contextkey", "./viewsWelcomeExtensionPoint", "vs/platform/registry/common/platform", "vs/workbench/common/views", "vs/workbench/services/extensions/common/extensions"], function (require, exports, nls, lifecycle_1, contextkey_1, viewsWelcomeExtensionPoint_1, platform_1, views_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$bZb = void 0;
    const viewsRegistry = platform_1.$8m.as(views_1.Extensions.ViewsRegistry);
    class $bZb extends lifecycle_1.$kc {
        constructor(extensionPoint) {
            super();
            this.a = new Map();
            extensionPoint.setHandler((_, { added, removed }) => {
                for (const contribution of removed) {
                    for (const welcome of contribution.value) {
                        const disposable = this.a.get(welcome);
                        disposable?.dispose();
                    }
                }
                const welcomesByViewId = new Map();
                for (const contribution of added) {
                    for (const welcome of contribution.value) {
                        const { group, order } = parseGroupAndOrder(welcome, contribution);
                        const precondition = contextkey_1.$Ii.deserialize(welcome.enablement);
                        const id = viewsWelcomeExtensionPoint_1.$_Yb[welcome.view] ?? welcome.view;
                        let viewContentMap = welcomesByViewId.get(id);
                        if (!viewContentMap) {
                            viewContentMap = new Map();
                            welcomesByViewId.set(id, viewContentMap);
                        }
                        viewContentMap.set(welcome, {
                            content: welcome.contents,
                            when: contextkey_1.$Ii.deserialize(welcome.when),
                            precondition,
                            group,
                            order
                        });
                    }
                }
                for (const [id, viewContentMap] of welcomesByViewId) {
                    const disposables = viewsRegistry.registerViewWelcomeContent2(id, viewContentMap);
                    for (const [welcome, disposable] of disposables) {
                        this.a.set(welcome, disposable);
                    }
                }
            });
        }
    }
    exports.$bZb = $bZb;
    function parseGroupAndOrder(welcome, contribution) {
        let group;
        let order;
        if (welcome.group) {
            if (!(0, extensions_1.$PF)(contribution.description, 'contribViewsWelcome')) {
                contribution.collector.warn(nls.localize(0, null, contribution.description.identifier.value));
                return { group, order };
            }
            const idx = welcome.group.lastIndexOf('@');
            if (idx > 0) {
                group = welcome.group.substr(0, idx);
                order = Number(welcome.group.substr(idx + 1)) || undefined;
            }
            else {
                group = welcome.group;
            }
        }
        return { group, order };
    }
});
//# sourceMappingURL=viewsWelcomeContribution.js.map