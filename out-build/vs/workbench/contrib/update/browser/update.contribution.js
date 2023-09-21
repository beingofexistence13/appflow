/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/update/browser/update.contribution", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/platform/action/common/actionCommonCategories", "vs/platform/actions/common/actions", "vs/workbench/contrib/update/browser/update", "vs/platform/product/common/product", "vs/platform/update/common/update", "vs/platform/instantiation/common/instantiation", "vs/base/common/platform", "vs/platform/dialogs/common/dialogs", "vs/base/common/labels", "vs/workbench/contrib/update/common/update", "vs/platform/contextkey/common/contextkeys", "vs/platform/opener/common/opener", "vs/platform/product/common/productService", "vs/base/common/uri", "vs/platform/contextkey/common/contextkey", "vs/platform/update/common/update.config.contribution"], function (require, exports, nls_1, platform_1, contributions_1, actionCommonCategories_1, actions_1, update_1, product_1, update_2, instantiation_1, platform_2, dialogs_1, labels_1, update_3, contextkeys_1, opener_1, productService_1, uri_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$BYb = exports.$AYb = void 0;
    const workbench = platform_1.$8m.as(contributions_1.Extensions.Workbench);
    workbench.registerWorkbenchContribution(update_1.$xYb, 3 /* LifecyclePhase.Restored */);
    workbench.registerWorkbenchContribution(update_1.$yYb, 3 /* LifecyclePhase.Restored */);
    workbench.registerWorkbenchContribution(update_1.$zYb, 3 /* LifecyclePhase.Restored */);
    // Release notes
    class $AYb extends actions_1.$Wu {
        constructor() {
            super({
                id: update_3.$xUb,
                title: {
                    value: (0, nls_1.localize)(0, null),
                    mnemonicTitle: (0, nls_1.localize)(1, null),
                    original: 'Show Release Notes'
                },
                category: { value: product_1.default.nameShort, original: product_1.default.nameShort },
                f1: true,
                precondition: update_1.$uYb,
                menu: [{
                        id: actions_1.$Ru.MenubarHelpMenu,
                        group: '1_welcome',
                        order: 5,
                        when: update_1.$uYb,
                    }]
            });
        }
        async run(accessor) {
            const instantiationService = accessor.get(instantiation_1.$Ah);
            const productService = accessor.get(productService_1.$kj);
            const openerService = accessor.get(opener_1.$NT);
            try {
                await (0, update_1.$wYb)(instantiationService, productService.version);
            }
            catch (err) {
                if (productService.releaseNotesUrl) {
                    await openerService.open(uri_1.URI.parse(productService.releaseNotesUrl));
                }
                else {
                    throw new Error((0, nls_1.localize)(2, null, productService.nameLong));
                }
            }
        }
    }
    exports.$AYb = $AYb;
    (0, actions_1.$Xu)($AYb);
    // Update
    class $BYb extends actions_1.$Wu {
        constructor() {
            super({
                id: 'update.checkForUpdate',
                title: { value: (0, nls_1.localize)(3, null), original: 'Check for Updates...' },
                category: { value: product_1.default.nameShort, original: product_1.default.nameShort },
                f1: true,
                precondition: update_1.$sYb.isEqualTo("idle" /* StateType.Idle */),
            });
        }
        async run(accessor) {
            const updateService = accessor.get(update_2.$UT);
            return updateService.checkForUpdates(true);
        }
    }
    exports.$BYb = $BYb;
    class DownloadUpdateAction extends actions_1.$Wu {
        constructor() {
            super({
                id: 'update.downloadUpdate',
                title: { value: (0, nls_1.localize)(4, null), original: 'Download Update' },
                category: { value: product_1.default.nameShort, original: product_1.default.nameShort },
                f1: true,
                precondition: update_1.$sYb.isEqualTo("available for download" /* StateType.AvailableForDownload */)
            });
        }
        async run(accessor) {
            await accessor.get(update_2.$UT).downloadUpdate();
        }
    }
    class InstallUpdateAction extends actions_1.$Wu {
        constructor() {
            super({
                id: 'update.installUpdate',
                title: { value: (0, nls_1.localize)(5, null), original: 'Install Update' },
                category: { value: product_1.default.nameShort, original: product_1.default.nameShort },
                f1: true,
                precondition: update_1.$sYb.isEqualTo("downloaded" /* StateType.Downloaded */)
            });
        }
        async run(accessor) {
            await accessor.get(update_2.$UT).applyUpdate();
        }
    }
    class RestartToUpdateAction extends actions_1.$Wu {
        constructor() {
            super({
                id: 'update.restartToUpdate',
                title: { value: (0, nls_1.localize)(6, null), original: 'Restart to Update' },
                category: { value: product_1.default.nameShort, original: product_1.default.nameShort },
                f1: true,
                precondition: update_1.$sYb.isEqualTo("ready" /* StateType.Ready */)
            });
        }
        async run(accessor) {
            await accessor.get(update_2.$UT).quitAndInstall();
        }
    }
    class DownloadAction extends actions_1.$Wu {
        static { this.ID = 'workbench.action.download'; }
        constructor() {
            super({
                id: DownloadAction.ID,
                title: {
                    value: (0, nls_1.localize)(7, null, product_1.default.nameLong),
                    original: `Download ${product_1.default.downloadUrl}`
                },
                precondition: contextkey_1.$Ii.and(contextkeys_1.$23, update_1.$vYb),
                f1: true,
                menu: [{
                        id: actions_1.$Ru.StatusBarWindowIndicatorMenu,
                        when: contextkey_1.$Ii.and(contextkeys_1.$23, update_1.$vYb)
                    }]
            });
        }
        run(accessor) {
            const productService = accessor.get(productService_1.$kj);
            const openerService = accessor.get(opener_1.$NT);
            if (productService.downloadUrl) {
                openerService.open(uri_1.URI.parse(productService.downloadUrl));
            }
        }
    }
    (0, actions_1.$Xu)(DownloadAction);
    (0, actions_1.$Xu)($BYb);
    (0, actions_1.$Xu)(DownloadUpdateAction);
    (0, actions_1.$Xu)(InstallUpdateAction);
    (0, actions_1.$Xu)(RestartToUpdateAction);
    if (platform_2.$i) {
        class DeveloperApplyUpdateAction extends actions_1.$Wu {
            constructor() {
                super({
                    id: '_update.applyupdate',
                    title: { value: (0, nls_1.localize)(8, null), original: 'Apply Update...' },
                    category: actionCommonCategories_1.$Nl.Developer,
                    f1: true,
                    precondition: update_1.$sYb.isEqualTo("idle" /* StateType.Idle */)
                });
            }
            async run(accessor) {
                const updateService = accessor.get(update_2.$UT);
                const fileDialogService = accessor.get(dialogs_1.$qA);
                const updatePath = await fileDialogService.showOpenDialog({
                    title: (0, nls_1.localize)(9, null),
                    filters: [{ name: 'Setup', extensions: ['exe'] }],
                    canSelectFiles: true,
                    openLabel: (0, labels_1.$lA)((0, nls_1.localize)(10, null))
                });
                if (!updatePath || !updatePath[0]) {
                    return;
                }
                await updateService._applySpecificUpdate(updatePath[0].fsPath);
            }
        }
        (0, actions_1.$Xu)(DeveloperApplyUpdateAction);
    }
});
//# sourceMappingURL=update.contribution.js.map