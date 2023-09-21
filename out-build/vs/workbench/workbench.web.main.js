/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/platform/accessibility/common/accessibility", "vs/platform/contextview/browser/contextView", "vs/platform/contextview/browser/contextMenuService", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionTipsService", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionManagement/common/extensionManagementService", "vs/platform/log/common/log", "vs/platform/userDataSync/common/userDataSyncMachines", "vs/platform/userDataSync/common/userDataSync", "vs/platform/userDataSync/common/userDataSyncStoreService", "vs/platform/userDataSync/common/userDataSyncLocalStoreService", "vs/platform/userDataSync/common/userDataSyncService", "vs/platform/userDataSync/common/userDataSyncAccount", "vs/platform/userDataSync/common/userDataAutoSyncService", "vs/platform/accessibility/browser/accessibilityService", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/workbench/services/title/common/titleService", "vs/workbench/browser/parts/titlebar/titlebarPart", "vs/workbench/services/timer/browser/timerService", "vs/platform/diagnostics/common/diagnostics", "vs/platform/languagePacks/common/languagePacks", "vs/platform/languagePacks/browser/languagePacks", "vs/workbench/browser/web.factory", "vs/workbench/browser/web.api", "vs/base/common/uri", "vs/base/common/event", "vs/base/common/lifecycle", "vs/workbench/services/editor/common/editorGroupsService", "vs/platform/userDataSync/common/userDataSyncResourceProvider", "vs/platform/remote/common/remoteAuthorityResolver", "vs/workbench/workbench.common.main", "vs/workbench/browser/parts/dialogs/dialog.web.contribution", "vs/workbench/browser/web.main", "vs/workbench/services/integrity/browser/integrityService", "vs/workbench/services/search/browser/searchService", "vs/workbench/services/textfile/browser/browserTextFileService", "vs/workbench/services/keybinding/browser/keyboardLayoutService", "vs/workbench/services/extensions/browser/extensionService", "vs/workbench/services/extensionManagement/browser/webExtensionsScannerService", "vs/workbench/services/extensionManagement/common/extensionManagementServerService", "vs/workbench/services/extensionManagement/browser/extensionUrlTrustService", "vs/workbench/services/telemetry/browser/telemetryService", "vs/workbench/services/url/browser/urlService", "vs/workbench/services/update/browser/updateService", "vs/workbench/services/workspaces/browser/workspacesService", "vs/workbench/services/workspaces/browser/workspaceEditingService", "vs/workbench/services/dialogs/browser/fileDialogService", "vs/workbench/services/host/browser/browserHostService", "vs/workbench/services/lifecycle/browser/lifecycleService", "vs/workbench/services/clipboard/browser/clipboardService", "vs/workbench/services/localization/browser/localeService", "vs/workbench/services/path/browser/pathService", "vs/workbench/services/themes/browser/browserHostColorSchemeService", "vs/workbench/services/encryption/browser/encryptionService", "vs/workbench/services/secrets/browser/secretStorageService", "vs/workbench/services/workingCopy/browser/workingCopyBackupService", "vs/workbench/services/tunnel/browser/tunnelService", "vs/workbench/services/files/browser/elevatedFileService", "vs/workbench/services/workingCopy/browser/workingCopyHistoryService", "vs/workbench/services/userDataSync/browser/webUserDataSyncEnablementService", "vs/workbench/services/userDataProfile/browser/userDataProfileStorageService", "vs/workbench/services/configurationResolver/browser/configurationResolverService", "vs/platform/extensionResourceLoader/browser/extensionResourceLoaderService", "vs/workbench/contrib/logs/browser/logs.contribution", "vs/workbench/contrib/localization/browser/localization.contribution", "vs/workbench/contrib/performance/browser/performance.web.contribution", "vs/workbench/contrib/preferences/browser/keyboardLayoutPicker", "vs/workbench/contrib/debug/browser/extensionHostDebugService", "vs/workbench/contrib/welcomeBanner/browser/welcomeBanner.contribution", "vs/workbench/contrib/welcomeDialog/browser/welcomeDialog.contribution", "vs/workbench/contrib/webview/browser/webview.web.contribution", "vs/workbench/contrib/extensions/browser/extensions.web.contribution", "vs/workbench/contrib/terminal/browser/terminal.web.contribution", "vs/workbench/contrib/externalTerminal/browser/externalTerminal.contribution", "vs/workbench/contrib/terminal/browser/terminalInstanceService", "vs/workbench/contrib/tasks/browser/taskService", "vs/workbench/contrib/tags/browser/workspaceTagsService", "vs/workbench/contrib/issue/browser/issue.contribution", "vs/workbench/contrib/splash/browser/splash.contribution", "vs/workbench/contrib/remote/browser/remoteStartEntry.contribution"], function (require, exports, extensions_1, accessibility_1, contextView_1, contextMenuService_1, extensionManagement_1, extensionTipsService_1, extensionManagement_2, extensionManagementService_1, log_1, userDataSyncMachines_1, userDataSync_1, userDataSyncStoreService_1, userDataSyncLocalStoreService_1, userDataSyncService_1, userDataSyncAccount_1, userDataAutoSyncService_1, accessibilityService_1, telemetry_1, telemetryUtils_1, titleService_1, titlebarPart_1, timerService_1, diagnostics_1, languagePacks_1, languagePacks_2, web_factory_1, web_api_1, uri_1, event_1, lifecycle_1, editorGroupsService_1, userDataSyncResourceProvider_1, remoteAuthorityResolver_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Menu = exports.logger = exports.commands = exports.workspace = exports.window = exports.env = exports.RemoteAuthorityResolverErrorCode = exports.RemoteAuthorityResolverError = exports.LogLevel = exports.GroupOrientation = exports.Disposable = exports.Emitter = exports.Event = exports.URI = exports.create = void 0;
    Object.defineProperty(exports, "LogLevel", { enumerable: true, get: function () { return log_1.LogLevel; } });
    (0, extensions_1.$mr)(extensionManagement_2.$hcb, extensionManagementService_1.$E4b, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(accessibility_1.$1r, accessibilityService_1.$M4b, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(contextView_1.$WZ, contextMenuService_1.$B4b, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(userDataSync_1.$Fgb, userDataSyncStoreService_1.$3Ab, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(userDataSyncMachines_1.$sgb, userDataSyncMachines_1.$ugb, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(userDataSync_1.$Ggb, userDataSyncLocalStoreService_1.$F4b, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(userDataSyncAccount_1.$Ezb, userDataSyncAccount_1.$Fzb, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(userDataSync_1.$Qgb, userDataSyncService_1.$K4b, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(userDataSync_1.$Rgb, userDataSyncResourceProvider_1.$k5b, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(userDataSync_1.$Sgb, userDataAutoSyncService_1.$L4b, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(titleService_1.$ZRb, titlebarPart_1.$P4b, 0 /* InstantiationType.Eager */);
    (0, extensions_1.$mr)(extensionManagement_1.$6n, extensionTipsService_1.$C4b, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(timerService_1.$kkb, timerService_1.$mkb, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(telemetry_1.$0k, telemetryUtils_1.$co, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(diagnostics_1.$gm, diagnostics_1.$im, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(languagePacks_1.$Iq, languagePacks_2.$Q4b, 1 /* InstantiationType.Delayed */);
    Object.defineProperty(exports, "create", { enumerable: true, get: function () { return web_factory_1.$j5b; } });
    Object.defineProperty(exports, "commands", { enumerable: true, get: function () { return web_factory_1.commands; } });
    Object.defineProperty(exports, "env", { enumerable: true, get: function () { return web_factory_1.env; } });
    Object.defineProperty(exports, "window", { enumerable: true, get: function () { return web_factory_1.window; } });
    Object.defineProperty(exports, "workspace", { enumerable: true, get: function () { return web_factory_1.workspace; } });
    Object.defineProperty(exports, "logger", { enumerable: true, get: function () { return web_factory_1.logger; } });
    Object.defineProperty(exports, "Menu", { enumerable: true, get: function () { return web_api_1.Menu; } });
    Object.defineProperty(exports, "URI", { enumerable: true, get: function () { return uri_1.URI; } });
    Object.defineProperty(exports, "Event", { enumerable: true, get: function () { return event_1.Event; } });
    Object.defineProperty(exports, "Emitter", { enumerable: true, get: function () { return event_1.$fd; } });
    Object.defineProperty(exports, "Disposable", { enumerable: true, get: function () { return lifecycle_1.$kc; } });
    Object.defineProperty(exports, "GroupOrientation", { enumerable: true, get: function () { return editorGroupsService_1.GroupOrientation; } });
    Object.defineProperty(exports, "RemoteAuthorityResolverError", { enumerable: true, get: function () { return remoteAuthorityResolver_1.$Mk; } });
    Object.defineProperty(exports, "RemoteAuthorityResolverErrorCode", { enumerable: true, get: function () { return remoteAuthorityResolver_1.RemoteAuthorityResolverErrorCode; } });
});
//#endregion
//# sourceMappingURL=workbench.web.main.js.map