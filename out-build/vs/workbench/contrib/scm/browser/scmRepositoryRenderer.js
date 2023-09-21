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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/browser/dom", "vs/workbench/contrib/scm/common/scm", "vs/base/browser/ui/countBadge/countBadge", "vs/platform/contextview/browser/contextView", "vs/platform/commands/common/commands", "./util", "vs/base/browser/ui/toolbar/toolbar", "vs/platform/workspace/common/workspace", "vs/base/common/resources", "vs/platform/theme/browser/defaultStyles", "vs/css!./media/scm"], function (require, exports, lifecycle_1, dom_1, scm_1, countBadge_1, contextView_1, commands_1, util_1, toolbar_1, workspace_1, resources_1, defaultStyles_1) {
    "use strict";
    var $JPb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$JPb = void 0;
    let $JPb = class $JPb {
        static { $JPb_1 = this; }
        static { this.TEMPLATE_ID = 'repository'; }
        get templateId() { return $JPb_1.TEMPLATE_ID; }
        constructor(a, b, d, f, g) {
            this.a = a;
            this.b = b;
            this.d = d;
            this.f = f;
            this.g = g;
        }
        renderTemplate(container) {
            // hack
            if (container.classList.contains('monaco-tl-contents')) {
                container.parentElement.parentElement.querySelector('.monaco-tl-twistie').classList.add('force-twistie');
            }
            const provider = (0, dom_1.$0O)(container, (0, dom_1.$)('.scm-provider'));
            const label = (0, dom_1.$0O)(provider, (0, dom_1.$)('.label'));
            const name = (0, dom_1.$0O)(label, (0, dom_1.$)('span.name'));
            const description = (0, dom_1.$0O)(label, (0, dom_1.$)('span.description'));
            const actions = (0, dom_1.$0O)(provider, (0, dom_1.$)('.actions'));
            const toolBar = new toolbar_1.$6R(actions, this.f, { actionViewItemProvider: this.a });
            const countContainer = (0, dom_1.$0O)(provider, (0, dom_1.$)('.count'));
            const count = new countBadge_1.$nR(countContainer, {}, defaultStyles_1.$v2);
            const visibilityDisposable = toolBar.onDidChangeDropdownVisibility(e => provider.classList.toggle('active', e));
            const templateDisposable = (0, lifecycle_1.$hc)(visibilityDisposable, toolBar);
            return { label, name, description, countContainer, count, toolBar, elementDisposables: new lifecycle_1.$jc(), templateDisposable };
        }
        renderElement(arg, index, templateData, height) {
            const repository = (0, util_1.$zPb)(arg) ? arg : arg.element;
            if (repository.provider.rootUri) {
                const folder = this.g.getWorkspaceFolder(repository.provider.rootUri);
                if (folder?.uri.toString() === repository.provider.rootUri.toString()) {
                    templateData.name.textContent = folder.name;
                }
                else {
                    templateData.name.textContent = (0, resources_1.$fg)(repository.provider.rootUri);
                }
                templateData.label.title = `${repository.provider.label}: ${repository.provider.rootUri.fsPath}`;
                templateData.description.textContent = repository.provider.label;
            }
            else {
                templateData.label.title = repository.provider.label;
                templateData.name.textContent = repository.provider.label;
                templateData.description.textContent = '';
            }
            let statusPrimaryActions = [];
            let menuPrimaryActions = [];
            let menuSecondaryActions = [];
            const updateToolbar = () => {
                templateData.toolBar.setActions([...statusPrimaryActions, ...menuPrimaryActions], menuSecondaryActions);
            };
            const onDidChangeProvider = () => {
                const commands = repository.provider.statusBarCommands || [];
                statusPrimaryActions = commands.map(c => new util_1.$HPb(c, this.d));
                updateToolbar();
                const count = repository.provider.count || 0;
                templateData.countContainer.setAttribute('data-count', String(count));
                templateData.count.setCount(count);
            };
            // TODO@joao TODO@lszomoru
            let disposed = false;
            templateData.elementDisposables.add((0, lifecycle_1.$ic)(() => disposed = true));
            templateData.elementDisposables.add(repository.provider.onDidChange(() => {
                if (disposed) {
                    return;
                }
                onDidChangeProvider();
            }));
            onDidChangeProvider();
            const menus = this.b.menus.getRepositoryMenus(repository.provider);
            templateData.elementDisposables.add((0, util_1.$EPb)(menus.titleMenu.menu, (primary, secondary) => {
                menuPrimaryActions = primary;
                menuSecondaryActions = secondary;
                updateToolbar();
            }));
            templateData.toolBar.context = repository.provider;
        }
        renderCompressedElements() {
            throw new Error('Should never happen since node is incompressible');
        }
        disposeElement(group, index, template) {
            template.elementDisposables.clear();
        }
        disposeTemplate(templateData) {
            templateData.elementDisposables.dispose();
            templateData.templateDisposable.dispose();
        }
    };
    exports.$JPb = $JPb;
    exports.$JPb = $JPb = $JPb_1 = __decorate([
        __param(1, scm_1.$gI),
        __param(2, commands_1.$Fr),
        __param(3, contextView_1.$WZ),
        __param(4, workspace_1.$Kh)
    ], $JPb);
});
//# sourceMappingURL=scmRepositoryRenderer.js.map