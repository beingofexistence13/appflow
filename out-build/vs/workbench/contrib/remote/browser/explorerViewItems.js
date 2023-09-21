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
define(["require", "exports", "vs/nls!vs/workbench/contrib/remote/browser/explorerViewItems", "vs/platform/contextview/browser/contextView", "vs/workbench/services/remote/common/remoteExplorerService", "vs/base/common/types", "vs/workbench/services/environment/common/environmentService", "vs/platform/storage/common/storage", "vs/platform/contextkey/common/contextkey", "vs/base/browser/ui/actionbar/actionViewItems", "vs/platform/actions/common/actions", "vs/workbench/contrib/remote/browser/remoteExplorer", "vs/platform/theme/browser/defaultStyles", "vs/platform/workspace/common/virtualWorkspace", "vs/platform/workspace/common/workspace"], function (require, exports, nls, contextView_1, remoteExplorerService_1, types_1, environmentService_1, storage_1, contextkey_1, actionViewItems_1, actions_1, remoteExplorer_1, defaultStyles_1, virtualWorkspace_1, workspace_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$SXb = exports.$RXb = void 0;
    let $RXb = class $RXb extends actionViewItems_1.$OQ {
        constructor(action, a, contextViewService, c, h, s, y) {
            super(null, action, a, 0, contextViewService, defaultStyles_1.$B2, { ariaLabel: nls.localize(0, null) });
            this.a = a;
            this.c = c;
            this.h = h;
            this.s = s;
            this.y = y;
        }
        setSelectionForConnection() {
            let isSetForConnection = false;
            if (this.a.length > 0) {
                let index = 0;
                const remoteAuthority = this.h.remoteAuthority;
                let virtualWorkspace;
                if (!remoteAuthority) {
                    virtualWorkspace = (0, virtualWorkspace_1.$uJ)(this.y.getWorkspace())?.scheme;
                }
                isSetForConnection = true;
                const explorerType = remoteAuthority ? [remoteAuthority.split('+')[0]]
                    : (virtualWorkspace ? [virtualWorkspace]
                        : (this.s.get(remoteExplorerService_1.$usb, 1 /* StorageScope.WORKSPACE */)?.split(',') ?? this.s.get(remoteExplorerService_1.$usb, 0 /* StorageScope.PROFILE */)?.split(',')));
                if (explorerType !== undefined) {
                    index = this.H(explorerType);
                }
                this.select(index);
                this.c.targetType = this.a[index].authority;
            }
            return isSetForConnection;
        }
        setSelection() {
            const index = this.H(this.c.targetType);
            this.select(index);
        }
        H(explorerType) {
            let index = 0;
            for (let optionIterator = 0; (optionIterator < this.a.length) && (index === 0); optionIterator++) {
                for (let authorityIterator = 0; authorityIterator < this.a[optionIterator].authority.length; authorityIterator++) {
                    for (let i = 0; i < explorerType.length; i++) {
                        if (this.a[optionIterator].authority[authorityIterator] === explorerType[i]) {
                            index = optionIterator;
                            break;
                        }
                        else if (this.a[optionIterator].virtualWorkspace === explorerType[i]) {
                            index = optionIterator;
                            break;
                        }
                    }
                }
            }
            return index;
        }
        render(container) {
            if (this.a.length > 1) {
                super.render(container);
                container.classList.add('switch-remote');
            }
        }
        r(_, index) {
            return this.a[index];
        }
        static createOptionItems(views, contextKeyService) {
            const options = [];
            views.forEach(view => {
                if (view.group && view.group.startsWith('targets') && view.remoteAuthority && (!view.when || contextKeyService.contextMatchesRules(view.when))) {
                    options.push({ text: view.name, authority: (0, types_1.$kf)(view.remoteAuthority) ? view.remoteAuthority : [view.remoteAuthority], virtualWorkspace: view.virtualWorkspace });
                }
            });
            return options;
        }
    };
    exports.$RXb = $RXb;
    exports.$RXb = $RXb = __decorate([
        __param(2, contextView_1.$VZ),
        __param(3, remoteExplorerService_1.$tsb),
        __param(4, environmentService_1.$hJ),
        __param(5, storage_1.$Vo),
        __param(6, workspace_1.$Kh)
    ], $RXb);
    class $SXb extends actions_1.$Wu {
        static { this.ID = 'remote.explorer.switch'; }
        static { this.LABEL = nls.localize(1, null); }
        constructor() {
            super({
                id: $SXb.ID,
                title: $SXb.LABEL,
                menu: [{
                        id: actions_1.$Ru.ViewContainerTitle,
                        when: contextkey_1.$Ii.equals('viewContainer', remoteExplorer_1.$vvb),
                        group: 'navigation',
                        order: 1
                    }],
            });
        }
        async run(accessor, args) {
            accessor.get(remoteExplorerService_1.$tsb).targetType = args.authority;
        }
    }
    exports.$SXb = $SXb;
});
//# sourceMappingURL=explorerViewItems.js.map