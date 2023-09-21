/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/product/common/product", "vs/base/common/platform", "vs/platform/telemetry/common/telemetry", "vs/platform/opener/common/opener", "vs/base/common/uri", "vs/platform/actions/common/actions", "vs/base/common/keyCodes", "vs/platform/product/common/productService", "vs/platform/action/common/actionCommonCategories"], function (require, exports, nls_1, product_1, platform_1, telemetry_1, opener_1, uri_1, actions_1, keyCodes_1, productService_1, actionCommonCategories_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class KeybindingsReferenceAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.keybindingsReference'; }
        static { this.AVAILABLE = !!(platform_1.isLinux ? product_1.default.keyboardShortcutsUrlLinux : platform_1.isMacintosh ? product_1.default.keyboardShortcutsUrlMac : product_1.default.keyboardShortcutsUrlWin); }
        constructor() {
            super({
                id: KeybindingsReferenceAction.ID,
                title: {
                    value: (0, nls_1.localize)('keybindingsReference', "Keyboard Shortcuts Reference"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miKeyboardShortcuts', comment: ['&& denotes a mnemonic'] }, "&&Keyboard Shortcuts Reference"),
                    original: 'Keyboard Shortcuts Reference'
                },
                category: actionCommonCategories_1.Categories.Help,
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: null,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 48 /* KeyCode.KeyR */)
                },
                menu: {
                    id: actions_1.MenuId.MenubarHelpMenu,
                    group: '2_reference',
                    order: 1
                }
            });
        }
        run(accessor) {
            const productService = accessor.get(productService_1.IProductService);
            const openerService = accessor.get(opener_1.IOpenerService);
            const url = platform_1.isLinux ? productService.keyboardShortcutsUrlLinux : platform_1.isMacintosh ? productService.keyboardShortcutsUrlMac : productService.keyboardShortcutsUrlWin;
            if (url) {
                openerService.open(uri_1.URI.parse(url));
            }
        }
    }
    class OpenIntroductoryVideosUrlAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.openVideoTutorialsUrl'; }
        static { this.AVAILABLE = !!product_1.default.introductoryVideosUrl; }
        constructor() {
            super({
                id: OpenIntroductoryVideosUrlAction.ID,
                title: {
                    value: (0, nls_1.localize)('openVideoTutorialsUrl', "Video Tutorials"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miVideoTutorials', comment: ['&& denotes a mnemonic'] }, "&&Video Tutorials"),
                    original: 'Video Tutorials'
                },
                category: actionCommonCategories_1.Categories.Help,
                f1: true,
                menu: {
                    id: actions_1.MenuId.MenubarHelpMenu,
                    group: '2_reference',
                    order: 2
                }
            });
        }
        run(accessor) {
            const productService = accessor.get(productService_1.IProductService);
            const openerService = accessor.get(opener_1.IOpenerService);
            if (productService.introductoryVideosUrl) {
                openerService.open(uri_1.URI.parse(productService.introductoryVideosUrl));
            }
        }
    }
    class OpenTipsAndTricksUrlAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.openTipsAndTricksUrl'; }
        static { this.AVAILABLE = !!product_1.default.tipsAndTricksUrl; }
        constructor() {
            super({
                id: OpenTipsAndTricksUrlAction.ID,
                title: {
                    value: (0, nls_1.localize)('openTipsAndTricksUrl', "Tips and Tricks"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miTipsAndTricks', comment: ['&& denotes a mnemonic'] }, "Tips and Tri&&cks"),
                    original: 'Tips and Tricks'
                },
                category: actionCommonCategories_1.Categories.Help,
                f1: true,
                menu: {
                    id: actions_1.MenuId.MenubarHelpMenu,
                    group: '2_reference',
                    order: 3
                }
            });
        }
        run(accessor) {
            const productService = accessor.get(productService_1.IProductService);
            const openerService = accessor.get(opener_1.IOpenerService);
            if (productService.tipsAndTricksUrl) {
                openerService.open(uri_1.URI.parse(productService.tipsAndTricksUrl));
            }
        }
    }
    class OpenDocumentationUrlAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.openDocumentationUrl'; }
        static { this.AVAILABLE = !!(platform_1.isWeb ? product_1.default.serverDocumentationUrl : product_1.default.documentationUrl); }
        constructor() {
            super({
                id: OpenDocumentationUrlAction.ID,
                title: {
                    value: (0, nls_1.localize)('openDocumentationUrl', "Documentation"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miDocumentation', comment: ['&& denotes a mnemonic'] }, "&&Documentation"),
                    original: 'Documentation'
                },
                category: actionCommonCategories_1.Categories.Help,
                f1: true,
                menu: {
                    id: actions_1.MenuId.MenubarHelpMenu,
                    group: '1_welcome',
                    order: 3
                }
            });
        }
        run(accessor) {
            const productService = accessor.get(productService_1.IProductService);
            const openerService = accessor.get(opener_1.IOpenerService);
            const url = platform_1.isWeb ? productService.serverDocumentationUrl : productService.documentationUrl;
            if (url) {
                openerService.open(uri_1.URI.parse(url));
            }
        }
    }
    class OpenNewsletterSignupUrlAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.openNewsletterSignupUrl'; }
        static { this.AVAILABLE = !!product_1.default.newsletterSignupUrl; }
        constructor() {
            super({
                id: OpenNewsletterSignupUrlAction.ID,
                title: { value: (0, nls_1.localize)('newsletterSignup', "Signup for the VS Code Newsletter"), original: 'Signup for the VS Code Newsletter' },
                category: actionCommonCategories_1.Categories.Help,
                f1: true
            });
        }
        run(accessor) {
            const productService = accessor.get(productService_1.IProductService);
            const openerService = accessor.get(opener_1.IOpenerService);
            const telemetryService = accessor.get(telemetry_1.ITelemetryService);
            openerService.open(uri_1.URI.parse(`${productService.newsletterSignupUrl}?machineId=${encodeURIComponent(telemetryService.machineId)}`));
        }
    }
    class OpenYouTubeUrlAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.openYouTubeUrl'; }
        static { this.AVAILABLE = !!product_1.default.youTubeUrl; }
        constructor() {
            super({
                id: OpenYouTubeUrlAction.ID,
                title: {
                    value: (0, nls_1.localize)('openYouTubeUrl', "Join Us on YouTube"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miYouTube', comment: ['&& denotes a mnemonic'] }, "&&Join Us on YouTube"),
                    original: 'Join Us on YouTube'
                },
                category: actionCommonCategories_1.Categories.Help,
                f1: true,
                menu: {
                    id: actions_1.MenuId.MenubarHelpMenu,
                    group: '3_feedback',
                    order: 1
                }
            });
        }
        run(accessor) {
            const productService = accessor.get(productService_1.IProductService);
            const openerService = accessor.get(opener_1.IOpenerService);
            if (productService.youTubeUrl) {
                openerService.open(uri_1.URI.parse(productService.youTubeUrl));
            }
        }
    }
    class OpenRequestFeatureUrlAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.openRequestFeatureUrl'; }
        static { this.AVAILABLE = !!product_1.default.requestFeatureUrl; }
        constructor() {
            super({
                id: OpenRequestFeatureUrlAction.ID,
                title: {
                    value: (0, nls_1.localize)('openUserVoiceUrl', "Search Feature Requests"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miUserVoice', comment: ['&& denotes a mnemonic'] }, "&&Search Feature Requests"),
                    original: 'Search Feature Requests'
                },
                category: actionCommonCategories_1.Categories.Help,
                f1: true,
                menu: {
                    id: actions_1.MenuId.MenubarHelpMenu,
                    group: '3_feedback',
                    order: 2
                }
            });
        }
        run(accessor) {
            const productService = accessor.get(productService_1.IProductService);
            const openerService = accessor.get(opener_1.IOpenerService);
            if (productService.requestFeatureUrl) {
                openerService.open(uri_1.URI.parse(productService.requestFeatureUrl));
            }
        }
    }
    class OpenLicenseUrlAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.openLicenseUrl'; }
        static { this.AVAILABLE = !!(platform_1.isWeb ? product_1.default.serverLicense : product_1.default.licenseUrl); }
        constructor() {
            super({
                id: OpenLicenseUrlAction.ID,
                title: {
                    value: (0, nls_1.localize)('openLicenseUrl', "View License"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miLicense', comment: ['&& denotes a mnemonic'] }, "View &&License"),
                    original: 'View License'
                },
                category: actionCommonCategories_1.Categories.Help,
                f1: true,
                menu: {
                    id: actions_1.MenuId.MenubarHelpMenu,
                    group: '4_legal',
                    order: 1
                }
            });
        }
        run(accessor) {
            const productService = accessor.get(productService_1.IProductService);
            const openerService = accessor.get(opener_1.IOpenerService);
            const url = platform_1.isWeb ? productService.serverLicenseUrl : productService.licenseUrl;
            if (url) {
                if (platform_1.language) {
                    const queryArgChar = url.indexOf('?') > 0 ? '&' : '?';
                    openerService.open(uri_1.URI.parse(`${url}${queryArgChar}lang=${platform_1.language}`));
                }
                else {
                    openerService.open(uri_1.URI.parse(url));
                }
            }
        }
    }
    class OpenPrivacyStatementUrlAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.openPrivacyStatementUrl'; }
        static { this.AVAILABE = !!product_1.default.privacyStatementUrl; }
        constructor() {
            super({
                id: OpenPrivacyStatementUrlAction.ID,
                title: {
                    value: (0, nls_1.localize)('openPrivacyStatement', "Privacy Statement"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miPrivacyStatement', comment: ['&& denotes a mnemonic'] }, "Privac&&y Statement"),
                    original: 'Privacy Statement'
                },
                category: actionCommonCategories_1.Categories.Help,
                f1: true,
                menu: {
                    id: actions_1.MenuId.MenubarHelpMenu,
                    group: '4_legal',
                    order: 2
                }
            });
        }
        run(accessor) {
            const productService = accessor.get(productService_1.IProductService);
            const openerService = accessor.get(opener_1.IOpenerService);
            if (productService.privacyStatementUrl) {
                openerService.open(uri_1.URI.parse(productService.privacyStatementUrl));
            }
        }
    }
    // --- Actions Registration
    if (KeybindingsReferenceAction.AVAILABLE) {
        (0, actions_1.registerAction2)(KeybindingsReferenceAction);
    }
    if (OpenIntroductoryVideosUrlAction.AVAILABLE) {
        (0, actions_1.registerAction2)(OpenIntroductoryVideosUrlAction);
    }
    if (OpenTipsAndTricksUrlAction.AVAILABLE) {
        (0, actions_1.registerAction2)(OpenTipsAndTricksUrlAction);
    }
    if (OpenDocumentationUrlAction.AVAILABLE) {
        (0, actions_1.registerAction2)(OpenDocumentationUrlAction);
    }
    if (OpenNewsletterSignupUrlAction.AVAILABLE) {
        (0, actions_1.registerAction2)(OpenNewsletterSignupUrlAction);
    }
    if (OpenYouTubeUrlAction.AVAILABLE) {
        (0, actions_1.registerAction2)(OpenYouTubeUrlAction);
    }
    if (OpenRequestFeatureUrlAction.AVAILABLE) {
        (0, actions_1.registerAction2)(OpenRequestFeatureUrlAction);
    }
    if (OpenLicenseUrlAction.AVAILABLE) {
        (0, actions_1.registerAction2)(OpenLicenseUrlAction);
    }
    if (OpenPrivacyStatementUrlAction.AVAILABE) {
        (0, actions_1.registerAction2)(OpenPrivacyStatementUrlAction);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVscEFjdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYnJvd3Nlci9hY3Rpb25zL2hlbHBBY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBZWhHLE1BQU0sMEJBQTJCLFNBQVEsaUJBQU87aUJBRS9CLE9BQUUsR0FBRyx1Q0FBdUMsQ0FBQztpQkFDN0MsY0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLGtCQUFPLENBQUMsQ0FBQyxDQUFDLGlCQUFPLENBQUMseUJBQXlCLENBQUMsQ0FBQyxDQUFDLHNCQUFXLENBQUMsQ0FBQyxDQUFDLGlCQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLGlCQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQztRQUU5SjtZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsMEJBQTBCLENBQUMsRUFBRTtnQkFDakMsS0FBSyxFQUFFO29CQUNOLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxzQkFBc0IsRUFBRSw4QkFBOEIsQ0FBQztvQkFDdkUsYUFBYSxFQUFFLElBQUEsY0FBUSxFQUFDLEVBQUUsR0FBRyxFQUFFLHFCQUFxQixFQUFFLE9BQU8sRUFBRSxDQUFDLHVCQUF1QixDQUFDLEVBQUUsRUFBRSxnQ0FBZ0MsQ0FBQztvQkFDN0gsUUFBUSxFQUFFLDhCQUE4QjtpQkFDeEM7Z0JBQ0QsUUFBUSxFQUFFLG1DQUFVLENBQUMsSUFBSTtnQkFDekIsRUFBRSxFQUFFLElBQUk7Z0JBQ1IsVUFBVSxFQUFFO29CQUNYLE1BQU0sNkNBQW1DO29CQUN6QyxJQUFJLEVBQUUsSUFBSTtvQkFDVixPQUFPLEVBQUUsSUFBQSxtQkFBUSxFQUFDLGlEQUE2QixFQUFFLGlEQUE2QixDQUFDO2lCQUMvRTtnQkFDRCxJQUFJLEVBQUU7b0JBQ0wsRUFBRSxFQUFFLGdCQUFNLENBQUMsZUFBZTtvQkFDMUIs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