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
define(["require", "exports", "vs/nls!vs/workbench/contrib/scm/browser/scmRepositoriesViewPane", "vs/workbench/browser/parts/views/viewPane", "vs/base/browser/dom", "vs/workbench/contrib/scm/common/scm", "vs/platform/instantiation/common/instantiation", "vs/platform/contextview/browser/contextView", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/common/keybinding", "vs/platform/theme/common/themeService", "vs/platform/list/browser/listService", "vs/platform/configuration/common/configuration", "vs/workbench/common/views", "vs/workbench/common/theme", "vs/platform/opener/common/opener", "vs/platform/telemetry/common/telemetry", "vs/workbench/contrib/scm/browser/scmRepositoryRenderer", "vs/workbench/contrib/scm/browser/util", "vs/base/common/iterator", "vs/css!./media/scm"], function (require, exports, nls_1, viewPane_1, dom_1, scm_1, instantiation_1, contextView_1, contextkey_1, keybinding_1, themeService_1, listService_1, configuration_1, views_1, theme_1, opener_1, telemetry_1, scmRepositoryRenderer_1, util_1, iterator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$WPb = void 0;
    class ListDelegate {
        getHeight() {
            return 22;
        }
        getTemplateId() {
            return scmRepositoryRenderer_1.$JPb.TEMPLATE_ID;
        }
    }
    let $WPb = class $WPb extends viewPane_1.$Ieb {
        constructor(options, b, keybindingService, contextMenuService, instantiationService, viewDescriptorService, contextKeyService, configurationService, openerService, themeService, telemetryService) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.b = b;
        }
        U(container) {
            super.U(container);
            const listContainer = (0, dom_1.$0O)(container, (0, dom_1.$)('.scm-view.scm-repositories-view'));
            const delegate = new ListDelegate();
            const renderer = this.Bb.createInstance(scmRepositoryRenderer_1.$JPb, (0, util_1.$IPb)(this.Bb));
            const identityProvider = { getId: (r) => r.provider.id };
            this.a = this.Bb.createInstance(listService_1.$p4, `SCM Main`, listContainer, delegate, [renderer], {
                identityProvider,
                horizontalScrolling: false,
                overrideStyles: {
                    listBackground: theme_1.$Iab
                },
                accessibilityProvider: {
                    getAriaLabel(r) {
                        return r.provider.label;
                    },
                    getWidgetAriaLabel() {
                        return (0, nls_1.localize)(0, null);
                    }
                }
            });
            this.B(this.a);
            this.B(this.a.onDidChangeSelection(this.m, this));
            this.B(this.a.onContextMenu(this.j, this));
            this.B(this.b.onDidChangeRepositories(this.f, this));
            this.B(this.b.onDidChangeVisibleRepositories(this.n, this));
            if (this.orientation === 0 /* Orientation.VERTICAL */) {
                this.B(this.yb.onDidChangeConfiguration(e => {
                    if (e.affectsConfiguration('scm.repositories.visible')) {
                        this.h();
                    }
                }));
            }
            this.f();
            this.n();
        }
        f() {
            this.a.splice(0, this.a.length, this.b.repositories);
            this.h();
        }
        focus() {
            this.a.domFocus();
        }
        W(height, width) {
            super.W(height, width);
            this.a.layout(height, width);
        }
        h() {
            if (this.orientation === 1 /* Orientation.HORIZONTAL */) {
                return;
            }
            const visibleCount = this.yb.getValue('scm.repositories.visible');
            const empty = this.a.length === 0;
            const size = Math.min(this.a.length, visibleCount) * 22;
            this.minimumBodySize = visibleCount === 0 ? 22 : size;
            this.maximumBodySize = visibleCount === 0 ? Number.POSITIVE_INFINITY : empty ? Number.POSITIVE_INFINITY : size;
        }
        j(e) {
            if (!e.element) {
                return;
            }
            const provider = e.element.provider;
            const menus = this.b.menus.getRepositoryMenus(provider);
            const menu = menus.repositoryMenu;
            const actions = (0, util_1.$GPb)(menu);
            this.xb.showContextMenu({
                getAnchor: () => e.anchor,
                getActions: () => actions,
                getActionsContext: () => provider
            });
        }
        m(e) {
            if (e.browserEvent && e.elements.length > 0) {
                const scrollTop = this.a.scrollTop;
                this.b.visibleRepositories = e.elements;
                this.a.scrollTop = scrollTop;
            }
        }
        n() {
            const oldSelection = this.a.getSelection();
            const oldSet = new Set(iterator_1.Iterable.map(oldSelection, i => this.a.element(i)));
            const set = new Set(this.b.visibleRepositories);
            const added = new Set(iterator_1.Iterable.filter(set, r => !oldSet.has(r)));
            const removed = new Set(iterator_1.Iterable.filter(oldSet, r => !set.has(r)));
            if (added.size === 0 && removed.size === 0) {
                return;
            }
            const selection = oldSelection
                .filter(i => !removed.has(this.a.element(i)));
            for (let i = 0; i < this.a.length; i++) {
                if (added.has(this.a.element(i))) {
                    selection.push(i);
                }
            }
            this.a.setSelection(selection);
            if (selection.length > 0 && selection.indexOf(this.a.getFocus()[0]) === -1) {
                this.a.setAnchor(selection[0]);
                this.a.setFocus([selection[0]]);
            }
        }
    };
    exports.$WPb = $WPb;
    exports.$WPb = $WPb = __decorate([
        __param(1, scm_1.$gI),
        __param(2, keybinding_1.$2D),
        __param(3, contextView_1.$WZ),
        __param(4, instantiation_1.$Ah),
        __param(5, views_1.$_E),
        __param(6, contextkey_1.$3i),
        __param(7, configuration_1.$8h),
        __param(8, opener_1.$NT),
        __param(9, themeService_1.$gv),
        __param(10, telemetry_1.$9k)
    ], $WPb);
});
//# sourceMappingURL=scmRepositoriesViewPane.js.map