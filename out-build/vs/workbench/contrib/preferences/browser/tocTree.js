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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/list/listWidget", "vs/base/browser/ui/tree/abstractTree", "vs/base/common/iterator", "vs/nls!vs/workbench/contrib/preferences/browser/tocTree", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/list/browser/listService", "vs/platform/theme/browser/defaultStyles", "vs/platform/theme/common/colorRegistry", "vs/workbench/contrib/preferences/browser/settingsTree", "vs/workbench/contrib/preferences/browser/settingsTreeModels", "vs/workbench/contrib/preferences/common/settingsEditorColorRegistry", "vs/workbench/services/environment/common/environmentService"], function (require, exports, DOM, listWidget_1, abstractTree_1, iterator_1, nls_1, configuration_1, contextkey_1, instantiation_1, listService_1, defaultStyles_1, colorRegistry_1, settingsTree_1, settingsTreeModels_1, settingsEditorColorRegistry_1, environmentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$5Db = exports.$4Db = exports.$3Db = exports.$2Db = void 0;
    const $ = DOM.$;
    let $2Db = class $2Db {
        constructor(d, f) {
            this.d = d;
            this.f = f;
            this.a = null;
        }
        get settingsTreeRoot() {
            return this.b;
        }
        set settingsTreeRoot(value) {
            this.b = value;
            this.update();
        }
        get currentSearchModel() {
            return this.a;
        }
        set currentSearchModel(model) {
            this.a = model;
            this.update();
        }
        get children() {
            return this.b.children;
        }
        update() {
            if (this.b) {
                this.h(this.b);
            }
        }
        h(group) {
            group.children.forEach(child => {
                if (child instanceof settingsTreeModels_1.$sDb) {
                    this.h(child);
                }
            });
            const childCount = group.children
                .filter(child => child instanceof settingsTreeModels_1.$sDb)
                .reduce((acc, cur) => acc + cur.count, 0);
            group.count = childCount + this.j(group);
        }
        j(group) {
            return group.children.filter(child => {
                if (!(child instanceof settingsTreeModels_1.$uDb)) {
                    return false;
                }
                if (this.a && !this.a.root.containsSetting(child.setting.key)) {
                    return false;
                }
                // Check everything that the SettingsFilter checks except whether it's filtered by a category
                const isRemote = !!this.f.remoteAuthority;
                return child.matchesScope(this.d.settingsTarget, isRemote) &&
                    child.matchesAllTags(this.d.tagFilters) &&
                    child.matchesAnyFeature(this.d.featureFilters) &&
                    child.matchesAnyExtension(this.d.extensionFilters) &&
                    child.matchesAnyId(this.d.idFilters);
            }).length;
        }
    };
    exports.$2Db = $2Db;
    exports.$2Db = $2Db = __decorate([
        __param(1, environmentService_1.$hJ)
    ], $2Db);
    const TOC_ENTRY_TEMPLATE_ID = 'settings.toc.entry';
    class $3Db {
        constructor() {
            this.templateId = TOC_ENTRY_TEMPLATE_ID;
        }
        renderTemplate(container) {
            return {
                labelElement: DOM.$0O(container, $('.settings-toc-entry')),
                countElement: DOM.$0O(container, $('.settings-toc-count'))
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
    exports.$3Db = $3Db;
    class TOCTreeDelegate {
        getTemplateId(element) {
            return TOC_ENTRY_TEMPLATE_ID;
        }
        getHeight(element) {
            return 22;
        }
    }
    function $4Db(model, tree) {
        const groupChildren = model.children.filter(c => c instanceof settingsTreeModels_1.$sDb);
        return iterator_1.Iterable.map(groupChildren, g => {
            const hasGroupChildren = g.children.some(c => c instanceof settingsTreeModels_1.$sDb);
            return {
                element: g,
                collapsed: undefined,
                collapsible: hasGroupChildren,
                children: g instanceof settingsTreeModels_1.$sDb ?
                    $4Db(g, tree) :
                    undefined
            };
        });
    }
    exports.$4Db = $4Db;
    class SettingsAccessibilityProvider {
        getWidgetAriaLabel() {
            return (0, nls_1.localize)(0, null);



        }
        getAriaLabel(element) {
            if (!element) {
                return '';
            }
            if (element instanceof settingsTreeModels_1.$sDb) {
                return (0, nls_1.localize)(1, null, element.label);
            }
            return '';
        }
        getAriaLevel(element) {
            let i = 1;
            while (element instanceof settingsTreeModels_1.$sDb && element.parent) {
                i++;
                element = element.parent;
            }
            return i;
        }
    }
    let $5Db = class $5Db extends listService_1.$t4 {
        constructor(container, viewState, contextKeyService, listService, configurationService, instantiationService) {
            // test open mode
            const filter = instantiationService.createInstance(settingsTree_1.$YDb, viewState);
            const options = {
                filter,
                multipleSelectionSupport: false,
                identityProvider: {
                    getId(e) {
                        return e.id;
                    }
                },
                styleController: id => new listWidget_1.$uQ(DOM.$XO(container), id),
                accessibilityProvider: instantiationService.createInstance(SettingsAccessibilityProvider),
                collapseByDefault: true,
                horizontalScrolling: false,
                hideTwistiesOfChildlessElements: true,
                renderIndentGuides: abstractTree_1.RenderIndentGuides.None
            };
            super('SettingsTOC', container, new TOCTreeDelegate(), [new $3Db()], options, instantiationService, contextKeyService, listService, configurationService);
            this.style((0, defaultStyles_1.$A2)({
                listBackground: colorRegistry_1.$ww,
                listFocusOutline: colorRegistry_1.$zv,
                listActiveSelectionBackground: colorRegistry_1.$ww,
                listActiveSelectionForeground: settingsEditorColorRegistry_1.$YCb,
                listFocusAndSelectionBackground: colorRegistry_1.$ww,
                listFocusAndSelectionForeground: settingsEditorColorRegistry_1.$YCb,
                listFocusBackground: colorRegistry_1.$ww,
                listFocusForeground: settingsEditorColorRegistry_1.$ZCb,
                listHoverForeground: settingsEditorColorRegistry_1.$ZCb,
                listHoverBackground: colorRegistry_1.$ww,
                listInactiveSelectionBackground: colorRegistry_1.$ww,
                listInactiveSelectionForeground: settingsEditorColorRegistry_1.$YCb,
                listInactiveFocusBackground: colorRegistry_1.$ww,
                listInactiveFocusOutline: colorRegistry_1.$ww,
                treeIndentGuidesStroke: undefined,
                treeInactiveIndentGuidesStroke: undefined
            }));
        }
    };
    exports.$5Db = $5Db;
    exports.$5Db = $5Db = __decorate([
        __param(2, contextkey_1.$3i),
        __param(3, listService_1.$03),
        __param(4, configuration_1.$8h),
        __param(5, instantiation_1.$Ah)
    ], $5Db);
});
//# sourceMappingURL=tocTree.js.map