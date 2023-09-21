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
define(["require", "exports", "vs/nls", "vs/platform/contextview/browser/contextView", "vs/workbench/services/remote/common/remoteExplorerService", "vs/base/common/types", "vs/workbench/services/environment/common/environmentService", "vs/platform/storage/common/storage", "vs/platform/contextkey/common/contextkey", "vs/base/browser/ui/actionbar/actionViewItems", "vs/platform/actions/common/actions", "vs/workbench/contrib/remote/browser/remoteExplorer", "vs/platform/theme/browser/defaultStyles", "vs/platform/workspace/common/virtualWorkspace", "vs/platform/workspace/common/workspace"], function (require, exports, nls, contextView_1, remoteExplorerService_1, types_1, environmentService_1, storage_1, contextkey_1, actionViewItems_1, actions_1, remoteExplorer_1, defaultStyles_1, virtualWorkspace_1, workspace_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SwitchRemoteAction = exports.SwitchRemoteViewItem = void 0;
    let SwitchRemoteViewItem = class SwitchRemoteViewItem extends actionViewItems_1.SelectActionViewItem {
        constructor(action, optionsItems, contextViewService, remoteExplorerService, environmentService, storageService, workspaceContextService) {
            super(null, action, optionsItems, 0, contextViewService, defaultStyles_1.defaultSelectBoxStyles, { ariaLabel: nls.localize('remotes', 'Switch Remote') });
            this.optionsItems = optionsItems;
            this.remoteExplorerService = remoteExplorerService;
            this.environmentService = environmentService;
            this.storageService = storageService;
            this.workspaceContextService = workspaceContextService;
        }
        setSelectionForConnection() {
            let isSetForConnection = false;
            if (this.optionsItems.length > 0) {
                let index = 0;
                const remoteAuthority = this.environmentService.remoteAuthority;
                let virtualWorkspace;
                if (!remoteAuthority) {
                    virtualWorkspace = (0, virtualWorkspace_1.getVirtualWorkspaceLocation)(this.workspaceContextService.getWorkspace())?.scheme;
                }
                isSetForConnection = true;
                const explorerType = remoteAuthority ? [remoteAuthority.split('+')[0]]
                    : (virtualWorkspace ? [virtualWorkspace]
                        : (this.storageService.get(remoteExplorerService_1.REMOTE_EXPLORER_TYPE_KEY, 1 /* StorageScope.WORKSPACE */)?.split(',') ?? this.storageService.get(remoteExplorerService_1.REMOTE_EXPLORER_TYPE_KEY, 0 /* StorageScope.PROFILE */)?.split(',')));
                if (explorerType !== undefined) {
                    index = this.getOptionIndexForExplorerType(explorerType);
                }
                this.select(index);
                this.remoteExplorerService.targetType = this.optionsItems[index].authority;
            }
            return isSetForConnection;
        }
        setSelection() {
            const index = this.getOptionIndexForExplorerType(this.remoteExplorerService.targetType);
            this.select(index);
        }
        getOptionIndexForExplorerType(explorerType) {
            let index = 0;
            for (let optionIterator = 0; (optionIterator < this.optionsItems.length) && (index === 0); optionIterator++) {
                for (let authorityIterator = 0; authorityIterator < this.optionsItems[optionIterator].authority.length; authorityIterator++) {
                    for (let i = 0; i < explorerType.length; i++) {
                        if (this.optionsItems[optionIterator].authority[authorityIterator] === explorerType[i]) {
                            index = optionIterator;
                            break;
                        }
                        else if (this.optionsItems[optionIterator].virtualWorkspace === explorerType[i]) {
                            index = optionIterator;
                            break;
                        }
                    }
                }
            }
            return index;
        }
        render(container) {
            if (this.optionsItems.length > 1) {
                super.render(container);
                container.classList.add('switch-remote');
            }
        }
        getActionContext(_, index) {
            return this.optionsItems[index];
        }
        static createOptionItems(views, contextKeyService) {
            const options = [];
            views.forEach(view => {
                if (view.group && view.group.startsWith('targets') && view.remoteAuthority && (!view.when || contextKeyService.contextMatchesRules(view.when))) {
                    options.push({ text: view.name, authority: (0, types_1.isStringArray)(view.remoteAuthority) ? view.remoteAuthority : [view.remoteAuthority], virtualWorkspace: view.virtualWorkspace });
                }
            });
            return options;
        }
    };
    exports.SwitchRemoteViewItem = SwitchRemoteViewItem;
    exports.SwitchRemoteViewItem = SwitchRemoteViewItem = __decorate([
        __param(2, contextView_1.IContextViewService),
        __param(3, remoteExplorerService_1.IRemoteExplorerService),
        __param(4, environmentService_1.IWorkbenchEnvironmentService),
        __param(5, storage_1.IStorageService),
        __param(6, workspace_1.IWorkspaceContextService)
    ], SwitchRemoteViewItem);
    class SwitchRemoteAction extends actions_1.Action2 {
        static { this.ID = 'remote.explorer.switch'; }
        static { this.LABEL = nls.localize('remote.explorer.switch', "Switch Remote"); }
        constructor() {
            super({
                id: SwitchRemoteAction.ID,
                title: SwitchRemoteAction.LABEL,
                menu: [{
                        id: actions_1.MenuId.ViewContainerTitle,
                        when: contextkey_1.ContextKeyExpr.equals('viewContainer', remoteExplorer_1.VIEWLET_ID),
                        group: 'navigation',
                        order: 1
                    }],
            });
        }
        async run(accessor, args) {
            accessor.get(remoteExplorerService_1.IRemoteExplorerService).targetType = args.authority;
        }
    }
    exports.SwitchRemoteAction = SwitchRemoteAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwbG9yZXJWaWV3SXRlbXMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9yZW1vdGUvYnJvd3Nlci9leHBsb3JlclZpZXdJdGVtcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUF5QnpGLElBQU0sb0JBQW9CLEdBQTFCLE1BQU0sb0JBQXFCLFNBQVEsc0NBQXVDO1FBRWhGLFlBQ0MsTUFBZSxFQUNFLFlBQWlDLEVBQzdCLGtCQUF1QyxFQUM1QixxQkFBNkMsRUFDdkMsa0JBQWdELEVBQ3BELGNBQStCLEVBQ3RCLHVCQUFpRDtZQUU1RixLQUFLLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsQ0FBQyxFQUFFLGtCQUFrQixFQUFFLHNDQUFzQixFQUFFLEVBQUUsU0FBUyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLGVBQWUsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQVB6SCxpQkFBWSxHQUFaLFlBQVksQ0FBcUI7WUFFbEIsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF3QjtZQUN2Qyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQThCO1lBQ3BELG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQUN0Qiw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQTBCO1FBRzdGLENBQUM7UUFFTSx5QkFBeUI7WUFDL0IsSUFBSSxrQkFBa0IsR0FBRyxLQUFLLENBQUM7WUFDL0IsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQ2pDLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztnQkFDZCxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsZUFBZSxDQUFDO2dCQUNoRSxJQUFJLGdCQUFvQyxDQUFDO2dCQUN6QyxJQUFJLENBQUMsZUFBZSxFQUFFO29CQUNy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