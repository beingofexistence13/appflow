/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/list/listWidget", "vs/base/browser/ui/tree/abstractTree", "vs/base/common/iterator", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/list/browser/listService", "vs/platform/theme/browser/defaultStyles", "vs/platform/theme/common/colorRegistry", "vs/workbench/contrib/preferences/browser/settingsTree", "vs/workbench/contrib/preferences/browser/settingsTreeModels", "vs/workbench/contrib/preferences/common/settingsEditorColorRegistry", "vs/workbench/services/environment/common/environmentService"], function (require, exports, DOM, listWidget_1, abstractTree_1, iterator_1, nls_1, configuration_1, contextkey_1, instantiation_1, listService_1, defaultStyles_1, colorRegistry_1, settingsTree_1, settingsTreeModels_1, settingsEditorColorRegistry_1, environmentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TOCTree = exports.createTOCIterator = exports.TOCRenderer = exports.TOCTreeModel = void 0;
    const $ = DOM.$;
    let TOCTreeModel = class TOCTreeModel {
        constructor(_viewState, environmentService) {
            this._viewState = _viewState;
            this.environmentService = environmentService;
            this._currentSearchModel = null;
        }
        get settingsTreeRoot() {
            return this._settingsTreeRoot;
        }
        set settingsTreeRoot(value) {
            this._settingsTreeRoot = value;
            this.update();
        }
        get currentSearchModel() {
            return this._currentSearchModel;
        }
        set currentSearchModel(model) {
            this._currentSearchModel = model;
            this.update();
        }
        get children() {
            return this._settingsTreeRoot.children;
        }
        update() {
            if (this._settingsTreeRoot) {
                this.updateGroupCount(this._settingsTreeRoot);
            }
        }
        updateGroupCount(group) {
            group.children.forEach(child => {
                if (child instanceof settingsTreeModels_1.SettingsTreeGroupElement) {
                    this.updateGroupCount(child);
                }
            });
            const childCount = group.children
                .filter(child => child instanceof settingsTreeModels_1.SettingsTreeGroupElement)
                .reduce((acc, cur) => acc + cur.count, 0);
            group.count = childCount + this.getGroupCount(group);
        }
        getGroupCount(group) {
            return group.children.filter(child => {
                if (!(child instanceof settingsTreeModels_1.SettingsTreeSettingElement)) {
                    return false;
                }
                if (this._currentSearchModel && !this._currentSearchModel.root.containsSetting(child.setting.key)) {
                    return false;
                }
                // Check everything that the SettingsFilter checks except whether it's filtered by a category
                const isRemote = !!this.environmentService.remoteAuthority;
                return child.matchesScope(this._viewState.settingsTarget, isRemote) &&
                    child.matchesAllTags(this._viewState.tagFilters) &&
                    child.matchesAnyFeature(this._viewState.featureFilters) &&
                    child.matchesAnyExtension(this._viewState.extensionFilters) &&
                    child.matchesAnyId(this._viewState.idFilters);
            }).length;
        }
    };
    exports.TOCTreeModel = TOCTreeModel;
    exports.TOCTreeModel = TOCTreeModel = __decorate([
        __param(1, environmentService_1.IWorkbenchEnvironmentService)
    ], TOCTreeModel);
    const TOC_ENTRY_TEMPLATE_ID = 'settings.toc.entry';
    class TOCRenderer {
        constructor() {
            this.templateId = TOC_ENTRY_TEMPLATE_ID;
        }
        renderTemplate(container) {
            return {
                labelElement: DOM.append(container, $('.settings-toc-entry')),
                countElement: DOM.append(container, $('.settings-toc-count'))
            };
        }
        renderElement(node, index, template) {
            const element = node.element;
            const count = element.count;
            const label = element.label;
            template.labelElement.textContent = label;
            template.labelElement.title = label;
            if (count) {
                template.countElement.textContent = ` (${count})`;
            }
            else {
                template.countElement.textContent = '';
            }
        }
        disposeTemplate(templateData) {
        }
    }
    exports.TOCRenderer = TOCRenderer;
    class TOCTreeDelegate {
        getTemplateId(element) {
            return TOC_ENTRY_TEMPLATE_ID;
        }
        getHeight(element) {
            return 22;
        }
    }
    function createTOCIterator(model, tree) {
        const groupChildren = model.children.filter(c => c instanceof settingsTreeModels_1.SettingsTreeGroupElement);
        return iterator_1.Iterable.map(groupChildren, g => {
            const hasGroupChildren = g.children.some(c => c instanceof settingsTreeModels_1.SettingsTreeGroupElement);
            return {
                element: g,
                collapsed: undefined,
                collapsible: hasGroupChildren,
                children: g instanceof settingsTreeModels_1.SettingsTreeGroupElement ?
                    createTOCIterator(g, tree) :
                    undefined
            };
        });
    }
    exports.createTOCIterator = createTOCIterator;
    class SettingsAccessibilityProvider {
        getWidgetAriaLabel() {
            return (0, nls_1.localize)({
                key: 'settingsTOC',
                comment: ['A label for the table of contents for the full settings list']
            }, "Settings Table of Contents");
        }
        getAriaLabel(element) {
            if (!element) {
                return '';
            }
            if (element instanceof settingsTreeModels_1.SettingsTreeGroupElement) {
                return (0, nls_1.localize)('groupRowAriaLabel', "{0}, group", element.label);
            }
            return '';
        }
        getAriaLevel(element) {
            let i = 1;
            while (element instanceof settingsTreeModels_1.SettingsTreeGroupElement && element.parent) {
                i++;
                element = element.parent;
            }
            return i;
        }
    }
    let TOCTree = class TOCTree extends listService_1.WorkbenchObjectTree {
        constructor(container, viewState, contextKeyService, listService, configurationService, instantiationService) {
            // test open mode
            const filter = instantiationService.createInstance(settingsTree_1.SettingsTreeFilter, viewState);
            const options = {
                filter,
                multipleSelectionSupport: false,
                identityProvider: {
                    getId(e) {
                        return e.id;
                    }
                },
                styleController: id => new listWidget_1.DefaultStyleController(DOM.createStyleSheet(container), id),
                accessibilityProvider: instantiationService.createInstance(SettingsAccessibilityProvider),
                collapseByDefault: true,
                horizontalScrolling: false,
                hideTwistiesOfChildlessElements: true,
                renderIndentGuides: abstractTree_1.RenderIndentGuides.None
            };
            super('SettingsTOC', container, new TOCTreeDelegate(), [new TOCRenderer()], options, instantiationService, contextKeyService, listService, configurationService);
            this.style((0, defaultStyles_1.getListStyles)({
                listBackground: colorRegistry_1.editorBackground,
                listFocusOutline: colorRegistry_1.focusBorder,
                listActiveSelectionBackground: colorRegistry_1.editorBackground,
                listActiveSelectionForeground: settingsEditorColorRegistry_1.settingsHeaderForeground,
                listFocusAndSelectionBackground: colorRegistry_1.editorBackground,
                listFocusAndSelectionForeground: settingsEditorColorRegistry_1.settingsHeaderForeground,
                listFocusBackground: colorRegistry_1.editorBackground,
                listFocusForeground: settingsEditorColorRegistry_1.settingsHeaderHoverForeground,
                listHoverForeground: settingsEditorColorRegistry_1.settingsHeaderHoverForeground,
                listHoverBackground: colorRegistry_1.editorBackground,
                listInactiveSelectionBackground: colorRegistry_1.editorBackground,
                listInactiveSelectionForeground: settingsEditorColorRegistry_1.settingsHeaderForeground,
                listInactiveFocusBackground: colorRegistry_1.editorBackground,
                listInactiveFocusOutline: colorRegistry_1.editorBackground,
                treeIndentGuidesStroke: undefined,
                treeInactiveIndentGuidesStroke: undefined
            }));
        }
    };
    exports.TOCTree = TOCTree;
    exports.TOCTree = TOCTree = __decorate([
        __param(2, contextkey_1.IContextKeyService),
        __param(3, listService_1.IListService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, instantiation_1.IInstantiationService)
    ], TOCTree);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9jVHJlZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3ByZWZlcmVuY2VzL2Jyb3dzZXIvdG9jVHJlZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFvQmhHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFFVCxJQUFNLFlBQVksR0FBbEIsTUFBTSxZQUFZO1FBS3hCLFlBQ1MsVUFBb0MsRUFDZCxrQkFBd0Q7WUFEOUUsZUFBVSxHQUFWLFVBQVUsQ0FBMEI7WUFDTix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQThCO1lBTC9FLHdCQUFtQixHQUE2QixJQUFJLENBQUM7UUFPN0QsQ0FBQztRQUVELElBQUksZ0JBQWdCO1lBQ25CLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDO1FBQy9CLENBQUM7UUFFRCxJQUFJLGdCQUFnQixDQUFDLEtBQStCO1lBQ25ELElBQUksQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLENBQUM7WUFDL0IsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2YsQ0FBQztRQUVELElBQUksa0JBQWtCO1lBQ3JCLE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDO1FBQ2pDLENBQUM7UUFFRCxJQUFJLGtCQUFrQixDQUFDLEtBQStCO1lBQ3JELElBQUksQ0FBQyxtQkFBbUIsR0FBRyxLQUFLLENBQUM7WUFDakMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2YsQ0FBQztRQUVELElBQUksUUFBUTtZQUNYLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQztRQUN4QyxDQUFDO1FBRUQsTUFBTTtZQUNMLElBQUksSUFBSSxDQUFDLGlCQUFpQixFQUFFO2dCQUMzQixJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7YUFDOUM7UUFDRixDQUFDO1FBRU8sZ0JBQWdCLENBQUMsS0FBK0I7WUFDdkQsS0FBSyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQzlCLElBQUksS0FBSyxZQUFZLDZDQUF3QixFQUFFO29CQUM5QyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUM7aUJBQzdCO1lBQ0YsQ0FBQyxDQUFDLENBQUM7WUFFSCxNQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsUUFBUTtpQkFDL0IsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxZQUFZLDZDQUF3QixDQUFDO2lCQUMxRCxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLEdBQThCLEdBQUksQ0FBQyxLQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFeEUsS0FBSyxDQUFDLEtBQUssR0FBRyxVQUFVLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN0RCxDQUFDO1FBRU8sYUFBYSxDQUFDLEtBQStCO1lBQ3BELE9BQU8sS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ3BDLElBQUksQ0FBQyxDQUFDLEtBQUssWUFBWSwrQ0FBMEIsQ0FBQyxFQUFFO29CQUNuRCxPQUFPLEtBQUssQ0FBQztpQkFDYjtnQkFFRCxJQUFJLElBQUksQ0FBQyxtQkFBbUIsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7b0JBQ2xHLE9BQU8sS0FBSyxDQUFDO2lCQUNiO2dCQUVELDZGQUE2RjtnQkFDN0YsTUFBTSxRQUFRLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxlQUFlLENBQUM7Z0JBQzNELE9BQU8sS0FBSyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsRUFBRSxRQUFRLENBQUM7b0JBQ2xFLEtBQUssQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUM7b0JBQ2hELEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQztvQkFDdkQsS0FBSyxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUM7b0JBQzNELEtBQUssQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNoRCxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFDWCxDQUFDO0tBQ0QsQ0FBQTtJQXhFWSxvQ0FBWTsyQkFBWixZQUFZO1FBT3RCLFdBQUEsaURBQTRCLENBQUE7T0FQbEIsWUFBWSxDQXdFeEI7SUFFRCxNQUFNLHFCQUFxQixHQUFHLG9CQUFvQixDQUFDO0lBT25ELE1BQWEsV0FBVztRQUF4QjtZQUVDLGVBQVUsR0FBRyxxQkFBcUIsQ0FBQztRQTBCcEMsQ0FBQztRQXhCQSxjQUFjLENBQUMsU0FBc0I7WUFDcEMsT0FBTztnQkFDTixZQUFZLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUM7Z0JBQzdELFlBQVksRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMscUJBQXFCLENBQUMsQ0FBQzthQUM3RCxDQUFDO1FBQ0gsQ0FBQztRQUVELGFBQWEsQ0FBQyxJQUF5QyxFQUFFLEtBQWEsRUFBRSxRQUEyQjtZQUNsRyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1lBQzdCLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUM7WUFDNUIsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQztZQUU1QixRQUFRLENBQUMsWUFBWSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7WUFDMUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBRXBDLElBQUksS0FBSyxFQUFFO2dCQUNWLFFBQVEsQ0FBQyxZQUFZLENBQUMsV0FBVyxHQUFHLEtBQUssS0FBSyxHQUFHLENBQUM7YUFDbEQ7aUJBQU07Z0JBQ04sUUFBUSxDQUFDLFlBQVksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO2FBQ3ZDO1FBQ0YsQ0FBQztRQUVELGVBQWUsQ0FBQyxZQUErQjtRQUMvQyxDQUFDO0tBQ0Q7SUE1QkQsa0NBNEJDO0lBRUQsTUFBTSxlQUFlO1FBQ3BCLGFBQWEsQ0FBQyxPQUE0QjtZQUN6QyxPQUFPLHFCQUFxQixDQUFDO1FBQzlCLENBQUM7UUFFRCxTQUFTLENBQUMsT0FBNEI7WUFDckMsT0FBTyxFQUFFLENBQUM7UUFDWCxDQUFDO0tBQ0Q7SUFFRCxTQUFnQixpQkFBaUIsQ0FBQyxLQUE4QyxFQUFFLElBQWE7UUFDOUYsTUFBTSxhQUFhLEdBQStCLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxZQUFZLDZDQUF3QixDQUFDLENBQUM7UUFFcEgsT0FBTyxtQkFBUSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLEVBQUU7WUFDdEMsTUFBTSxnQkFBZ0IsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsWUFBWSw2Q0FBd0IsQ0FBQyxDQUFDO1lBRXJGLE9BQU87Z0JBQ04sT0FBTyxFQUFFLENBQUM7Z0JBQ1YsU0FBUyxFQUFFLFNBQVM7Z0JBQ3BCLFdBQVcsRUFBRSxnQkFBZ0I7Z0JBQzdCLFFBQVEsRUFBRSxDQUFDLFlBQVksNkNBQXdCLENBQUMsQ0FBQztvQkFDaEQsaUJBQWlCLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBQzVCLFNBQVM7YUFDVixDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDO0lBZkQsOENBZUM7SUFFRCxNQUFNLDZCQUE2QjtRQUNsQyxrQkFBa0I7WUFDakIsT0FBTyxJQUFBLGNBQVEsRUFBQztnQkFDZixHQUFHLEVBQUUsYUFBYTtnQkFDbEIsT0FBTyxFQUFFLENBQUMsOERBQThELENBQUM7YUFDekUsRUFDQSw0QkFBNEIsQ0FBQyxDQUFDO1FBQ2hDLENBQUM7UUFFRCxZQUFZLENBQUMsT0FBNEI7WUFDeEMsSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDYixPQUFPLEVBQUUsQ0FBQzthQUNWO1lBRUQsSUFBSSxPQUFPLFlBQVksNkNBQXdCLEVBQUU7Z0JBQ2hELE9BQU8sSUFBQSxjQUFRLEVBQUMsbUJBQW1CLEVBQUUsWUFBWSxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNsRTtZQUVELE9BQU8sRUFBRSxDQUFDO1FBQ1gsQ0FBQztRQUVELFlBQVksQ0FBQyxPQUFpQztZQUM3QyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDVixPQUFPLE9BQU8sWUFBWSw2Q0FBd0IsSUFBSSxPQUFPLENBQUMsTUFBTSxFQUFFO2dCQUNyRSxDQUFDLEVBQUUsQ0FBQztnQkFDSixPQUFPLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQzthQUN6QjtZQUVELE9BQU8sQ0FBQyxDQUFDO1FBQ1YsQ0FBQztLQUNEO0lBRU0sSUFBTSxPQUFPLEdBQWIsTUFBTSxPQUFRLFNBQVEsaUNBQTZDO1FBQ3pFLFlBQ0MsU0FBc0IsRUFDdEIsU0FBbUMsRUFDZixpQkFBcUMsRUFDM0MsV0FBeUIsRUFDaEIsb0JBQTJDLEVBQzNDLG9CQUEyQztZQUVsRSxpQkFBaUI7WUFFakIsTUFBTSxNQUFNLEdBQUcsb0JBQW9CLENBQUMsY0FBYyxDQUFDLGlDQUFrQixFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ2xGLE1BQU0sT0FBTyxHQUFnRTtnQkFDNUUsTUFBTTtnQkFDTix3QkFBd0IsRUFBRSxLQUFLO2dCQUMvQixnQkFBZ0IsRUFBRTtvQkFDakIsS0FBSyxDQUFDLENBQUM7d0JBQ04sT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDO29CQUNiLENBQUM7aUJBQ0Q7Z0JBQ0QsZUFBZSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxtQ0FBc0IsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUN0RixxQkFBcUIsRUFBRSxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsNkJBQTZCLENBQUM7Z0JBQ3pGLGlCQUFpQixFQUFFLElBQUk7Z0JBQ3ZCLG1CQUFtQixFQUFFLEtBQUs7Z0JBQzFCLCtCQUErQixFQUFFLElBQUk7Z0JBQ3JDLGtCQUFrQixFQUFFLGlDQUFrQixDQUFDLElBQUk7YUFDM0MsQ0FBQztZQUVGLEtBQUssQ0FDSixhQUFhLEVBQ2IsU0FBUyxFQUNULElBQUksZUFBZSxFQUFFLEVBQ3JCLENBQUMsSUFBSSxXQUFXLEVBQUUsQ0FBQyxFQUNuQixPQUFPLEVBQ1Asb0JBQW9CLEVBQ3BCLGlCQUFpQixFQUNqQixXQUFXLEVBQ1gsb0JBQW9CLENBQ3BCLENBQUM7WUFFRixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUEsNkJBQWEsRUFBQztnQkFDeEIsY0FBYyxFQUFFLGdDQUFnQjtnQkFDaEMsZ0JBQWdCLEVBQUUsMkJBQVc7Z0JBQzdCLDZCQUE2QixFQUFFLGdDQUFnQjtnQkFDL0MsNkJBQTZCLEVBQUUsc0RBQXdCO2dCQUN2RCwrQkFBK0IsRUFBRSxnQ0FBZ0I7Z0JBQ2pELCtCQUErQixFQUFFLHNEQUF3QjtnQkFDekQsbUJBQW1CLEVBQUUsZ0NBQWdCO2dCQUNyQyxtQkFBbUIsRUFBRSwyREFBNkI7Z0JBQ2xELG1CQUFtQixFQUFFLDJEQUE2QjtnQkFDbEQsbUJBQW1CLEVBQUUsZ0NBQWdCO2dCQUNyQywrQkFBK0IsRUFBRSxnQ0FBZ0I7Z0JBQ2pELCtCQUErQixFQUFFLHNEQUF3QjtnQkFDekQsMkJBQTJCLEVBQUUsZ0NBQWdCO2dCQUM3Qyx3QkFBd0IsRUFBRSxnQ0FBZ0I7Z0JBQzFDLHNCQUFzQixFQUFFLFNBQVM7Z0JBQ2pDLDhCQUE4QixFQUFFLFNBQVM7YUFDekMsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO0tBQ0QsQ0FBQTtJQTNEWSwwQkFBTztzQkFBUCxPQUFPO1FBSWpCLFdBQUEsK0JBQWtCLENBQUE7UUFDbEIsV0FBQSwwQkFBWSxDQUFBO1FBQ1osV0FBQSxxQ0FBcUIsQ0FBQTtRQUNyQixXQUFBLHFDQUFxQixDQUFBO09BUFgsT0FBTyxDQTJEbkIifQ==