/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/browser/actions/helpActions", "vs/platform/product/common/product", "vs/base/common/platform", "vs/platform/telemetry/common/telemetry", "vs/platform/opener/common/opener", "vs/base/common/uri", "vs/platform/actions/common/actions", "vs/base/common/keyCodes", "vs/platform/product/common/productService", "vs/platform/action/common/actionCommonCategories"], function (require, exports, nls_1, product_1, platform_1, telemetry_1, opener_1, uri_1, actions_1, keyCodes_1, productService_1, actionCommonCategories_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class KeybindingsReferenceAction extends actions_1.$Wu {
        static { this.ID = 'workbench.action.keybindingsReference'; }
        static { this.AVAILABLE = !!(platform_1.$k ? product_1.default.keyboardShortcutsUrlLinux : platform_1.$j ? product_1.default.keyboardShortcutsUrlMac : product_1.default.keyboardShortcutsUrlWin); }
        constructor() {
            super({
                id: KeybindingsReferenceAction.ID,
                title: {
                    value: (0, nls_1.localize)(0, null),
                    mnemonicTitle: (0, nls_1.localize)(1, null),
                    original: 'Keyboard Shortcuts Reference'
                },
                category: actionCommonCategories_1.$Nl.Help,
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: null,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 48 /* KeyCode.KeyR */)
                },
                menu: {
                    id: actions_1.$Ru.MenubarHelpMenu,
                    group: '2_reference',
                    order: 1
                }
            });
        }
        run(accessor) {
            const productService = accessor.get(productService_1.$kj);
            const openerService = accessor.get(opener_1.$NT);
            const url = platform_1.$k ? productService.keyboardShortcutsUrlLinux : platform_1.$j ? productService.keyboardShortcutsUrlMac : productService.keyboardShortcutsUrlWin;
            if (url) {
                openerService.open(uri_1.URI.parse(url));
            }
        }
    }
    class OpenIntroductoryVideosUrlAction extends actions_1.$Wu {
        static { this.ID = 'workbench.action.openVideoTutorialsUrl'; }
        static { this.AVAILABLE = !!product_1.default.introductoryVideosUrl; }
        constructor() {
            super({
                id: OpenIntroductoryVideosUrlAction.ID,
                title: {
                    value: (0, nls_1.localize)(2, null),
                    mnemonicTitle: (0, nls_1.localize)(3, null),
                    original: 'Video Tutorials'
                },
                category: actionCommonCategories_1.$Nl.Help,
                f1: true,
                menu: {
                    id: actions_1.$Ru.MenubarHelpMenu,
                    group: '2_reference',
                    order: 2
                }
            });
        }
        run(accessor) {
            const productService = accessor.get(productService_1.$kj);
            const openerService = accessor.get(opener_1.$NT);
            if (productService.introductoryVideosUrl) {
                openerService.open(uri_1.URI.parse(productService.introductoryVideosUrl));
            }
        }
    }
    class OpenTipsAndTricksUrlAction extends actions_1.$Wu {
        static { this.ID = 'workbench.action.openTipsAndTricksUrl'; }
        static { this.AVAILABLE = !!product_1.default.tipsAndTricksUrl; }
        constructor() {
            super({
                id: OpenTipsAndTricksUrlAction.ID,
                title: {
                    value: (0, nls_1.localize)(4, null),
                    mnemonicTitle: (0, nls_1.localize)(5, null),
                    original: 'Tips and Tricks'
                },
                category: actionCommonCategories_1.$Nl.Help,
                f1: true,
                menu: {
                    id: actions_1.$Ru.MenubarHelpMenu,
                    group: '2_reference',
                    order: 3
                }
            });
        }
        run(accessor) {
            const productService = accessor.get(productService_1.$kj);
            const openerService = accessor.get(opener_1.$NT);
            if (productService.tipsAndTricksUrl) {
                openerService.open(uri_1.URI.parse(productService.tipsAndTricksUrl));
            }
        }
    }
    class OpenDocumentationUrlAction extends actions_1.$Wu {
        static { this.ID = 'workbench.action.openDocumentationUrl'; }
        static { this.AVAILABLE = !!(platform_1.$o ? product_1.default.serverDocumentationUrl : product_1.default.documentationUrl); }
        constructor() {
            super({
                id: OpenDocumentationUrlAction.ID,
                title: {
                    value: (0, nls_1.localize)(6, null),
                    mnemonicTitle: (0, nls_1.localize)(7, null),
                    original: 'Documentation'
                },
                category: actionCommonCategories_1.$Nl.Help,
                f1: true,
                menu: {
                    id: actions_1.$Ru.MenubarHelpMenu,
                    group: '1_welcome',
                    order: 3
                }
            });
        }
        run(accessor) {
            const productService = accessor.get(productService_1.$kj);
            const openerService = accessor.get(opener_1.$NT);
            const url = platform_1.$o ? productService.serverDocumentationUrl : productService.documentationUrl;
            if (url) {
                openerService.open(uri_1.URI.parse(url));
            }
        }
    }
    class OpenNewsletterSignupUrlAction extends actions_1.$Wu {
        static { this.ID = 'workbench.action.openNewsletterSignupUrl'; }
        static { this.AVAILABLE = !!product_1.default.newsletterSignupUrl; }
        constructor() {
            super({
                id: OpenNewsletterSignupUrlAction.ID,
                title: { value: (0, nls_1.localize)(8, null), original: 'Signup for the VS Code Newsletter' },
                category: actionCommonCategories_1.$Nl.Help,
                f1: true
            });
        }
        run(accessor) {
            const productService = accessor.get(productService_1.$kj);
            const openerService = accessor.get(opener_1.$NT);
            const telemetryService = accessor.get(telemetry_1.$9k);
            openerService.open(uri_1.URI.parse(`${productService.newsletterSignupUrl}?machineId=${encodeURIComponent(telemetryService.machineId)}`));
        }
    }
    class OpenYouTubeUrlAction extends actions_1.$Wu {
        static { this.ID = 'workbench.action.openYouTubeUrl'; }
        static { this.AVAILABLE = !!product_1.default.youTubeUrl; }
        constructor() {
            super({
                id: OpenYouTubeUrlAction.ID,
                title: {
                    value: (0, nls_1.localize)(9, null),
                    mnemonicTitle: (0, nls_1.localize)(10, null),
                    original: 'Join Us on YouTube'
                },
                category: actionCommonCategories_1.$Nl.Help,
                f1: true,
                menu: {
                    id: actions_1.$Ru.MenubarHelpMenu,
                    group: '3_feedback',
                    order: 1
                }
            });
        }
        run(accessor) {
            const productService = accessor.get(productService_1.$kj);
            const openerService = accessor.get(opener_1.$NT);
            if (productService.youTubeUrl) {
                openerService.open(uri_1.URI.parse(productService.youTubeUrl));
            }
        }
    }
    class OpenRequestFeatureUrlAction extends actions_1.$Wu {
        static { this.ID = 'workbench.action.openRequestFeatureUrl'; }
        static { this.AVAILABLE = !!product_1.default.requestFeatureUrl; }
        constructor() {
            super({
                id: OpenRequestFeatureUrlAction.ID,
                title: {
                    value: (0, nls_1.localize)(11, null),
                    mnemonicTitle: (0, nls_1.localize)(12, null),
                    original: 'Search Feature Requests'
                },
                category: actionCommonCategories_1.$Nl.Help,
                f1: true,
                menu: {
                    id: actions_1.$Ru.MenubarHelpMenu,
                    group: '3_feedback',
                    order: 2
                }
            });
        }
        run(accessor) {
            const productService = accessor.get(productService_1.$kj);
            const openerService = accessor.get(opener_1.$NT);
            if (productService.requestFeatureUrl) {
                openerService.open(uri_1.URI.parse(productService.requestFeatureUrl));
            }
        }
    }
    class OpenLicenseUrlAction extends actions_1.$Wu {
        static { this.ID = 'workbench.action.openLicenseUrl'; }
        static { this.AVAILABLE = !!(platform_1.$o ? product_1.default.serverLicense : product_1.default.licenseUrl); }
        constructor() {
            super({
                id: OpenLicenseUrlAction.ID,
                title: {
                    value: (0, nls_1.localize)(13, null),
                    mnemonicTitle: (0, nls_1.localize)(14, null),
                    original: 'View License'
                },
                category: actionCommonCategories_1.$Nl.Help,
                f1: true,
                menu: {
                    id: actions_1.$Ru.MenubarHelpMenu,
                    group: '4_legal',
                    order: 1
                }
            });
        }
        run(accessor) {
            const productService = accessor.get(productService_1.$kj);
            const openerService = accessor.get(opener_1.$NT);
            const url = platform_1.$o ? productService.serverLicenseUrl : productService.licenseUrl;
            if (url) {
                if (platform_1.$v) {
                    const queryArgChar = url.indexOf('?') > 0 ? '&' : '?';
                    openerService.open(uri_1.URI.parse(`${url}${queryArgChar}lang=${platform_1.$v}`));
                }
                else {
                    openerService.open(uri_1.URI.parse(url));
                }
            }
        }
    }
    class OpenPrivacyStatementUrlAction extends actions_1.$Wu {
        static { this.ID = 'workbench.action.openPrivacyStatementUrl'; }
        static { this.AVAILABE = !!product_1.default.privacyStatementUrl; }
        constructor() {
            super({
                id: OpenPrivacyStatementUrlAction.ID,
                title: {
                    value: (0, nls_1.localize)(15, null),
                    mnemonicTitle: (0, nls_1.localize)(16, null),
                    original: 'Privacy Statement'
                },
                category: actionCommonCategories_1.$Nl.Help,
                f1: true,
                menu: {
                    id: actions_1.$Ru.MenubarHelpMenu,
                    group: '4_legal',
                    order: 2
                }
            });
        }
        run(accessor) {
            const productService = accessor.get(productService_1.$kj);
            const openerService = accessor.get(opener_1.$NT);
            if (productService.privacyStatementUrl) {
                openerService.open(uri_1.URI.parse(productService.privacyStatementUrl));
            }
        }
    }
    // --- Actions Registration
    if (KeybindingsReferenceAction.AVAILABLE) {
        (0, actions_1.$Xu)(KeybindingsReferenceAction);
    }
    if (OpenIntroductoryVideosUrlAction.AVAILABLE) {
        (0, actions_1.$Xu)(OpenIntroductoryVideosUrlAction);
    }
    if (OpenTipsAndTricksUrlAction.AVAILABLE) {
        (0, actions_1.$Xu)(OpenTipsAndTricksUrlAction);
    }
    if (OpenDocumentationUrlAction.AVAILABLE) {
        (0, actions_1.$Xu)(OpenDocumentationUrlAction);
    }
    if (OpenNewsletterSignupUrlAction.AVAILABLE) {
        (0, actions_1.$Xu)(OpenNewsletterSignupUrlAction);
    }
    if (OpenYouTubeUrlAction.AVAILABLE) {
        (0, actions_1.$Xu)(OpenYouTubeUrlAction);
    }
    if (OpenRequestFeatureUrlAction.AVAILABLE) {
        (0, actions_1.$Xu)(OpenRequestFeatureUrlAction);
    }
    if (OpenLicenseUrlAction.AVAILABLE) {
        (0, actions_1.$Xu)(OpenLicenseUrlAction);
    }
    if (OpenPrivacyStatementUrlAction.AVAILABE) {
        (0, actions_1.$Xu)(OpenPrivacyStatementUrlAction);
    }
});
//# sourceMappingURL=helpActions.js.map