/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/lifecycle", "vs/platform/contextkey/common/contextkey", "./viewsWelcomeExtensionPoint", "vs/platform/registry/common/platform", "vs/workbench/common/views", "vs/workbench/services/extensions/common/extensions"], function (require, exports, nls, lifecycle_1, contextkey_1, viewsWelcomeExtensionPoint_1, platform_1, views_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ViewsWelcomeContribution = void 0;
    const viewsRegistry = platform_1.Registry.as(views_1.Extensions.ViewsRegistry);
    class ViewsWelcomeContribution extends lifecycle_1.Disposable {
        constructor(extensionPoint) {
            super();
            this.viewWelcomeContents = new Map();
            extensionPoint.setHandler((_, { added, removed }) => {
                for (const contribution of removed) {
                    for (const welcome of contribution.value) {
                        const disposable = this.viewWelcomeContents.get(welcome);
                        disposable?.dispose();
                    }
                }
                const welcomesByViewId = new Map();
                for (const contribution of added) {
                    for (const welcome of contribution.value) {
                        const { group, order } = parseGroupAndOrder(welcome, contribution);
                        const precondition = contextkey_1.ContextKeyExpr.deserialize(welcome.enablement);
                        const id = viewsWelcomeExtensionPoint_1.ViewIdentifierMap[welcome.view] ?? welcome.view;
                        let viewContentMap = welcomesByViewId.get(id);
                        if (!viewContentMap) {
                            viewContentMap = new Map();
                            welcomesByViewId.set(id, viewContentMap);
                        }
                        viewContentMap.set(welcome, {
                            content: welcome.contents,
                            when: contextkey_1.ContextKeyExpr.deserialize(welcome.when),
                            precondition,
                            group,
                            order
                        });
                    }
                }
                for (const [id, viewContentMap] of welcomesByViewId) {
                    const disposables = viewsRegistry.registerViewWelcomeContent2(id, viewContentMap);
                    for (const [welcome, disposable] of disposables) {
                        this.viewWelcomeContents.set(welcome, disposable);
                    }
                }
            });
        }
    }
    exports.ViewsWelcomeContribution = ViewsWelcomeContribution;
    function parseGroupAndOrder(welcome, contribution) {
        let group;
        let order;
        if (welcome.group) {
            if (!(0, extensions_1.isProposedApiEnabled)(contribution.description, 'contribViewsWelcome')) {
                contribution.collector.warn(nls.localize('ViewsWelcomeExtensionPoint.proposedAPI', "The viewsWelcome contribution in '{0}' requires 'enabledApiProposals: [\"contribViewsWelcome\"]' in order to use the 'group' proposed property.", contribution.description.identifier.value));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld3NXZWxjb21lQ29udHJpYnV0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvd2VsY29tZVZpZXdzL2NvbW1vbi92aWV3c1dlbGNvbWVDb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBWWhHLE1BQU0sYUFBYSxHQUFHLG1CQUFRLENBQUMsRUFBRSxDQUFpQixrQkFBdUIsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUV6RixNQUFhLHdCQUF5QixTQUFRLHNCQUFVO1FBSXZELFlBQVksY0FBMkQ7WUFDdEUsS0FBSyxFQUFFLENBQUM7WUFIRCx3QkFBbUIsR0FBRyxJQUFJLEdBQUcsRUFBNEIsQ0FBQztZQUtqRSxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUU7Z0JBQ25ELEtBQUssTUFBTSxZQUFZLElBQUksT0FBTyxFQUFFO29CQUNuQyxLQUFLLE1BQU0sT0FBTyxJQUFJLFlBQVksQ0FBQyxLQUFLLEVBQUU7d0JBQ3pDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7d0JBRXpELFVBQVUsRUFBRSxPQUFPLEVBQUUsQ0FBQztxQkFDdEI7aUJBQ0Q7Z0JBRUQsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLEdBQUcsRUFBb0QsQ0FBQztnQkFFckYsS0FBSyxNQUFNLFlBQVksSUFBSSxLQUFLLEVBQUU7b0JBQ2pDLEtBQUssTUFBTSxPQUFPLElBQUksWUFBWSxDQUFDLEtBQUssRUFBRTt3QkFDekMsTUFBTSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsR0FBRyxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLENBQUM7d0JBQ25FLE1BQU0sWUFBWSxHQUFHLDJCQUFjLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQzt3QkFFcEUsTUFBTSxFQUFFLEdBQUcsOENBQWlCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUM7d0JBQzNELElBQUksY0FBYyxHQUFHLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQzt3QkFDOUMsSUFBSSxDQUFDLGNBQWMsRUFBRTs0QkFDcEIsY0FBYyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7NEJBQzNCLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsY0FBYyxDQUFDLENBQUM7eUJBQ3pDO3dCQUVELGNBQWMsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFOzRCQUMzQixPQUFPLEVBQUUsT0FBTyxDQUFDLFFBQVE7NEJBQ3pCLElBQUksRUFBRSwyQkFBYyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDOzRCQUM5QyxZQUFZOzRCQUNaLEtBQUs7NEJBQ0wsS0FBSzt5QkFDTCxDQUFDLENBQUM7cUJBQ0g7aUJBQ0Q7Z0JBRUQsS0FBSyxNQUFNLENBQUMsRUFBRSxFQUFFLGNBQWMsQ0FBQyxJQUFJLGdCQUFnQixFQUFFO29CQUNwRCxNQUFNLFdBQVcsR0FBRyxhQUFhLENBQUMsMkJBQTJCLENBQUMsRUFBRSxFQUFFLGNBQWMsQ0FBQyxDQUFDO29CQUVsRixLQUFLLE1BQU0sQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLElBQUksV0FBVyxFQUFFO3dCQUNoRCxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQztxQkFDbEQ7aUJBQ0Q7WUFDRixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7S0FDRDtJQWpERCw0REFpREM7SUFFRCxTQUFTLGtCQUFrQixDQUFDLE9BQW9CLEVBQUUsWUFBNkQ7UUFFOUcsSUFBSSxLQUF5QixDQUFDO1FBQzlCLElBQUksS0FBeUIsQ0FBQztRQUM5QixJQUFJLE9BQU8sQ0FBQyxLQUFLLEVBQUU7WUFDbEIsSUFBSSxDQUFDLElBQUEsaUNBQW9CLEVBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxxQkFBcUIsQ0FBQyxFQUFFO2dCQUMzRSxZQUFZLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLHdDQUF3QyxFQUFFLGlKQUFpSixFQUFFLFlBQVksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ2xSLE9BQU8sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUM7YUFDeEI7WUFFRCxNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMzQyxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUU7Z0JBQ1osS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDckMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxTQUFTLENBQUM7YUFDM0Q7aUJBQU07Z0JBQ04sS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUM7YUFDdEI7U0FDRDtRQUNELE9BQU8sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUM7SUFDekIsQ0FBQyJ9