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
    var RepositoryRenderer_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RepositoryRenderer = void 0;
    let RepositoryRenderer = class RepositoryRenderer {
        static { RepositoryRenderer_1 = this; }
        static { this.TEMPLATE_ID = 'repository'; }
        get templateId() { return RepositoryRenderer_1.TEMPLATE_ID; }
        constructor(actionViewItemProvider, scmViewService, commandService, contextMenuService, workspaceContextService) {
            this.actionViewItemProvider = actionViewItemProvider;
            this.scmViewService = scmViewService;
            this.commandService = commandService;
            this.contextMenuService = contextMenuService;
            this.workspaceContextService = workspaceContextService;
        }
        renderTemplate(container) {
            // hack
            if (container.classList.contains('monaco-tl-contents')) {
                container.parentElement.parentElement.querySelector('.monaco-tl-twistie').classList.add('force-twistie');
            }
            const provider = (0, dom_1.append)(container, (0, dom_1.$)('.scm-provider'));
            const label = (0, dom_1.append)(provider, (0, dom_1.$)('.label'));
            const name = (0, dom_1.append)(label, (0, dom_1.$)('span.name'));
            const description = (0, dom_1.append)(label, (0, dom_1.$)('span.description'));
            const actions = (0, dom_1.append)(provider, (0, dom_1.$)('.actions'));
            const toolBar = new toolbar_1.ToolBar(actions, this.contextMenuService, { actionViewItemProvider: this.actionViewItemProvider });
            const countContainer = (0, dom_1.append)(provider, (0, dom_1.$)('.count'));
            const count = new countBadge_1.CountBadge(countContainer, {}, defaultStyles_1.defaultCountBadgeStyles);
            const visibilityDisposable = toolBar.onDidChangeDropdownVisibility(e => provider.classList.toggle('active', e));
            const templateDisposable = (0, lifecycle_1.combinedDisposable)(visibilityDisposable, toolBar);
            return { label, name, description, countContainer, count, toolBar, elementDisposables: new lifecycle_1.DisposableStore(), templateDisposable };
        }
        renderElement(arg, index, templateData, height) {
            const repository = (0, util_1.isSCMRepository)(arg) ? arg : arg.element;
            if (repository.provider.rootUri) {
                const folder = this.workspaceContextService.getWorkspaceFolder(repository.provider.rootUri);
                if (folder?.uri.toString() === repository.provider.rootUri.toString()) {
                    templateData.name.textContent = folder.name;
                }
                else {
                    templateData.name.textContent = (0, resources_1.basename)(repository.provider.rootUri);
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
                statusPrimaryActions = commands.map(c => new util_1.StatusBarAction(c, this.commandService));
                updateToolbar();
                const count = repository.provider.count || 0;
                templateData.countContainer.setAttribute('data-count', String(count));
                templateData.count.setCount(count);
            };
            // TODO@joao TODO@lszomoru
            let disposed = false;
            templateData.elementDisposables.add((0, lifecycle_1.toDisposable)(() => disposed = true));
            templateData.elementDisposables.add(repository.provider.onDidChange(() => {
                if (disposed) {
                    return;
                }
                onDidChangeProvider();
            }));
            onDidChangeProvider();
            const menus = this.scmViewService.menus.getRepositoryMenus(repository.provider);
            templateData.elementDisposables.add((0, util_1.connectPrimaryMenu)(menus.titleMenu.menu, (primary, secondary) => {
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
    exports.RepositoryRenderer = RepositoryRenderer;
    exports.RepositoryRenderer = RepositoryRenderer = RepositoryRenderer_1 = __decorate([
        __param(1, scm_1.ISCMViewService),
        __param(2, commands_1.ICommandService),
        __param(3, contextView_1.IContextMenuService),
        __param(4, workspace_1.IWorkspaceContextService)
    ], RepositoryRenderer);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NtUmVwb3NpdG9yeVJlbmRlcmVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvc2NtL2Jyb3dzZXIvc2NtUmVwb3NpdG9yeVJlbmRlcmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFnQ3pGLElBQU0sa0JBQWtCLEdBQXhCLE1BQU0sa0JBQWtCOztpQkFFZCxnQkFBVyxHQUFHLFlBQVksQUFBZixDQUFnQjtRQUMzQyxJQUFJLFVBQVUsS0FBYSxPQUFPLG9CQUFrQixDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7UUFFbkUsWUFDUyxzQkFBK0MsRUFDOUIsY0FBK0IsRUFDL0IsY0FBK0IsRUFDM0Isa0JBQXVDLEVBQ2xDLHVCQUFpRDtZQUozRSwyQkFBc0IsR0FBdEIsc0JBQXNCLENBQXlCO1lBQzlCLG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQUMvQixtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFDM0IsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQjtZQUNsQyw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQTBCO1FBQ2hGLENBQUM7UUFFTCxjQUFjLENBQUMsU0FBc0I7WUFDcEMsT0FBTztZQUNQLElBQUksU0FBUyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsb0JBQW9CLENBQUMsRUFBRTtnQkFDdEQsU0FBUyxDQUFDLGFBQWMsQ0FBQyxhQUFjLENBQUMsYUFBYSxDQUFDLG9CQUFvQixDQUFrQixDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7YUFDN0g7WUFFRCxNQUFNLFFBQVEsR0FBRyxJQUFBLFlBQU0sRUFBQyxTQUFTLEVBQUUsSUFBQSxPQUFDLEVBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztZQUN2RCxNQUFNLEtBQUssR0FBRyxJQUFBLFlBQU0sRUFBQyxRQUFRLEVBQUUsSUFB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