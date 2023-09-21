/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/types", "vs/nls!vs/platform/userDataSync/common/userDataSync", "vs/platform/configuration/common/configurationRegistry", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/instantiation/common/instantiation", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/platform/registry/common/platform"], function (require, exports, arrays_1, types_1, nls_1, configurationRegistry_1, extensionManagement_1, instantiation_1, jsonContributionRegistry_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Xgb = exports.$Wgb = exports.$Vgb = exports.$Ugb = exports.$Tgb = exports.$Sgb = exports.$Rgb = exports.$Qgb = exports.$Pgb = exports.$Ogb = exports.$Ngb = exports.MergeState = exports.Change = exports.SyncStatus = exports.$Mgb = exports.$Lgb = exports.$Kgb = exports.UserDataSyncErrorCode = exports.$Jgb = exports.$Igb = exports.$Hgb = exports.$Ggb = exports.$Fgb = exports.$Egb = exports.$Dgb = exports.$Cgb = exports.$Bgb = exports.SyncResource = exports.$Agb = exports.$zgb = exports.$ygb = exports.$xgb = exports.$wgb = exports.$vgb = void 0;
    function $vgb() {
        const allSettings = platform_1.$8m.as(configurationRegistry_1.$an.Configuration).getConfigurationProperties();
        return Object.keys(allSettings).filter(setting => !!allSettings[setting].disallowSyncIgnore);
    }
    exports.$vgb = $vgb;
    function $wgb() {
        const allSettings = platform_1.$8m.as(configurationRegistry_1.$an.Configuration).getConfigurationProperties();
        const ignoreSyncSettings = Object.keys(allSettings).filter(setting => !!allSettings[setting].ignoreSync);
        const machineSettings = Object.keys(allSettings).filter(setting => allSettings[setting].scope === 2 /* ConfigurationScope.MACHINE */ || allSettings[setting].scope === 6 /* ConfigurationScope.MACHINE_OVERRIDABLE */);
        const disallowedSettings = $vgb();
        return (0, arrays_1.$Kb)([...ignoreSyncSettings, ...machineSettings, ...disallowedSettings]);
    }
    exports.$wgb = $wgb;
    exports.$xgb = 'settingsSync';
    exports.$ygb = 'settingsSync.keybindingsPerPlatform';
    function $zgb() {
        const ignoredSettingsSchemaId = 'vscode://schemas/ignoredSettings';
        const configurationRegistry = platform_1.$8m.as(configurationRegistry_1.$an.Configuration);
        configurationRegistry.registerConfiguration({
            id: 'settingsSync',
            order: 30,
            title: (0, nls_1.localize)(0, null),
            type: 'object',
            properties: {
                [exports.$ygb]: {
                    type: 'boolean',
                    description: (0, nls_1.localize)(1, null),
                    default: true,
                    scope: 1 /* ConfigurationScope.APPLICATION */,
                    tags: ['sync', 'usesOnlineServices']
                },
                'settingsSync.ignoredExtensions': {
                    'type': 'array',
                    markdownDescription: (0, nls_1.localize)(2, null),
                    items: [{
                            type: 'string',
                            pattern: extensionManagement_1.$Mn,
                            errorMessage: (0, nls_1.localize)(3, null)
                        }],
                    'default': [],
                    'scope': 1 /* ConfigurationScope.APPLICATION */,
                    uniqueItems: true,
                    disallowSyncIgnore: true,
                    tags: ['sync', 'usesOnlineServices']
                },
                'settingsSync.ignoredSettings': {
                    'type': 'array',
                    description: (0, nls_1.localize)(4, null),
                    'default': [],
                    'scope': 1 /* ConfigurationScope.APPLICATION */,
                    $ref: ignoredSettingsSchemaId,
                    additionalProperties: true,
                    uniqueItems: true,
                    disallowSyncIgnore: true,
                    tags: ['sync', 'usesOnlineServices']
                }
            }
        });
        const jsonRegistry = platform_1.$8m.as(jsonContributionRegistry_1.$9m.JSONContribution);
        const registerIgnoredSettingsSchema = () => {
            const disallowedIgnoredSettings = $vgb();
            const defaultIgnoredSettings = $wgb();
            const settings = Object.keys(configurationRegistry_1.$bn.properties).filter(setting => !defaultIgnoredSettings.includes(setting));
            const ignoredSettings = defaultIgnoredSettings.filter(setting => !disallowedIgnoredSettings.includes(setting));
            const ignoredSettingsSchema = {
                items: {
                    type: 'string',
                    enum: [...settings, ...ignoredSettings.map(setting => `-${setting}`)]
                },
            };
            jsonRegistry.registerSchema(ignoredSettingsSchemaId, ignoredSettingsSchema);
        };
        return configurationRegistry.onDidUpdateConfiguration(() => registerIgnoredSettingsSchema());
    }
    exports.$zgb = $zgb;
    function $Agb(thing) {
        return thing
            && (0, types_1.$lf)(thing)
            && (0, types_1.$jf)(thing.id)
            && Array.isArray(thing.scopes);
    }
    exports.$Agb = $Agb;
    var SyncResource;
    (function (SyncResource) {
        SyncResource["Settings"] = "settings";
        SyncResource["Keybindings"] = "keybindings";
        SyncResource["Snippets"] = "snippets";
        SyncResource["Tasks"] = "tasks";
        SyncResource["Extensions"] = "extensions";
        SyncResource["GlobalState"] = "globalState";
        SyncResource["Profiles"] = "profiles";
        SyncResource["WorkspaceState"] = "workspaceState";
    })(SyncResource || (exports.SyncResource = SyncResource = {}));
    exports.$Bgb = ["settings" /* SyncResource.Settings */, "keybindings" /* SyncResource.Keybindings */, "snippets" /* SyncResource.Snippets */, "tasks" /* SyncResource.Tasks */, "extensions" /* SyncResource.Extensions */, "globalState" /* SyncResource.GlobalState */, "profiles" /* SyncResource.Profiles */];
    function $Cgb(collection, ...paths) {
        return collection ? [collection, ...paths] : paths;
    }
    exports.$Cgb = $Cgb;
    function $Dgb(collection, syncResource, environmentService, extUri) {
        return extUri.joinPath(environmentService.userDataSyncHome, ...$Cgb(collection, syncResource, `lastSync${syncResource}.json`));
    }
    exports.$Dgb = $Dgb;
    exports.$Egb = (0, instantiation_1.$Bh)('IUserDataSyncStoreManagementService');
    exports.$Fgb = (0, instantiation_1.$Bh)('IUserDataSyncStoreService');
    exports.$Ggb = (0, instantiation_1.$Bh)('IUserDataSyncLocalStoreService');
    //#endregion
    // #region User Data Sync Headers
    exports.$Hgb = 'x-operation-id';
    exports.$Igb = 'X-Execution-Id';
    function $Jgb(executionId) {
        const headers = {};
        headers[exports.$Igb] = executionId;
        return headers;
    }
    exports.$Jgb = $Jgb;
    //#endregion
    // #region User Data Sync Error
    var UserDataSyncErrorCode;
    (function (UserDataSyncErrorCode) {
        // Client Errors (>= 400 )
        UserDataSyncErrorCode["Unauthorized"] = "Unauthorized";
        UserDataSyncErrorCode["Forbidden"] = "Forbidden";
        UserDataSyncErrorCode["NotFound"] = "NotFound";
        UserDataSyncErrorCode["MethodNotFound"] = "MethodNotFound";
        UserDataSyncErrorCode["Conflict"] = "Conflict";
        UserDataSyncErrorCode["Gone"] = "Gone";
        UserDataSyncErrorCode["PreconditionFailed"] = "PreconditionFailed";
        UserDataSyncErrorCode["TooLarge"] = "TooLarge";
        UserDataSyncErrorCode["UpgradeRequired"] = "UpgradeRequired";
        UserDataSyncErrorCode["PreconditionRequired"] = "PreconditionRequired";
        UserDataSyncErrorCode["TooManyRequests"] = "RemoteTooManyRequests";
        UserDataSyncErrorCode["TooManyRequestsAndRetryAfter"] = "TooManyRequestsAndRetryAfter";
        // Local Errors
        UserDataSyncErrorCode["RequestFailed"] = "RequestFailed";
        UserDataSyncErrorCode["RequestCanceled"] = "RequestCanceled";
        UserDataSyncErrorCode["RequestTimeout"] = "RequestTimeout";
        UserDataSyncErrorCode["RequestProtocolNotSupported"] = "RequestProtocolNotSupported";
        UserDataSyncErrorCode["RequestPathNotEscaped"] = "RequestPathNotEscaped";
        UserDataSyncErrorCode["RequestHeadersNotObject"] = "RequestHeadersNotObject";
        UserDataSyncErrorCode["NoCollection"] = "NoCollection";
        UserDataSyncErrorCode["NoRef"] = "NoRef";
        UserDataSyncErrorCode["EmptyResponse"] = "EmptyResponse";
        UserDataSyncErrorCode["TurnedOff"] = "TurnedOff";
        UserDataSyncErrorCode["SessionExpired"] = "SessionExpired";
        UserDataSyncErrorCode["ServiceChanged"] = "ServiceChanged";
        UserDataSyncErrorCode["DefaultServiceChanged"] = "DefaultServiceChanged";
        UserDataSyncErrorCode["LocalTooManyProfiles"] = "LocalTooManyProfiles";
        UserDataSyncErrorCode["LocalTooManyRequests"] = "LocalTooManyRequests";
        UserDataSyncErrorCode["LocalPreconditionFailed"] = "LocalPreconditionFailed";
        UserDataSyncErrorCode["LocalInvalidContent"] = "LocalInvalidContent";
        UserDataSyncErrorCode["LocalError"] = "LocalError";
        UserDataSyncErrorCode["IncompatibleLocalContent"] = "IncompatibleLocalContent";
        UserDataSyncErrorCode["IncompatibleRemoteContent"] = "IncompatibleRemoteContent";
        UserDataSyncErrorCode["Unknown"] = "Unknown";
    })(UserDataSyncErrorCode || (exports.UserDataSyncErrorCode = UserDataSyncErrorCode = {}));
    class $Kgb extends Error {
        constructor(message, code, resource, operationId) {
            super(message);
            this.code = code;
            this.resource = resource;
            this.operationId = operationId;
            this.name = `${this.code} (UserDataSyncError) syncResource:${this.resource || 'unknown'} operationId:${this.operationId || 'unknown'}`;
        }
    }
    exports.$Kgb = $Kgb;
    class $Lgb extends $Kgb {
        constructor(message, url, code, serverCode, operationId) {
            super(message, code, undefined, operationId);
            this.url = url;
            this.serverCode = serverCode;
        }
    }
    exports.$Lgb = $Lgb;
    class $Mgb extends $Kgb {
        constructor(message, code) {
            super(message, code);
        }
    }
    exports.$Mgb = $Mgb;
    (function ($Kgb) {
        function toUserDataSyncError(error) {
            if (error instanceof $Kgb) {
                return error;
            }
            const match = /^(.+) \(UserDataSyncError\) syncResource:(.+) operationId:(.+)$/.exec(error.name);
            if (match && match[1]) {
                const syncResource = match[2] === 'unknown' ? undefined : match[2];
                const operationId = match[3] === 'unknown' ? undefined : match[3];
                return new $Kgb(error.message, match[1], syncResource, operationId);
            }
            return new $Kgb(error.message, "Unknown" /* UserDataSyncErrorCode.Unknown */);
        }
        $Kgb.toUserDataSyncError = toUserDataSyncError;
    })($Kgb || (exports.$Kgb = $Kgb = {}));
    var SyncStatus;
    (function (SyncStatus) {
        SyncStatus["Uninitialized"] = "uninitialized";
        SyncStatus["Idle"] = "idle";
        SyncStatus["Syncing"] = "syncing";
        SyncStatus["HasConflicts"] = "hasConflicts";
    })(SyncStatus || (exports.SyncStatus = SyncStatus = {}));
    var Change;
    (function (Change) {
        Change[Change["None"] = 0] = "None";
        Change[Change["Added"] = 1] = "Added";
        Change[Change["Modified"] = 2] = "Modified";
        Change[Change["Deleted"] = 3] = "Deleted";
    })(Change || (exports.Change = Change = {}));
    var MergeState;
    (function (MergeState) {
        MergeState["Preview"] = "preview";
        MergeState["Conflict"] = "conflict";
        MergeState["Accepted"] = "accepted";
    })(MergeState || (exports.MergeState = MergeState = {}));
    //#endregion
    // #region keys synced only in web
    exports.$Ngb = 'sync.store.url.type';
    function $Ogb(resource) { return `sync.enable.${resource}`; }
    exports.$Ogb = $Ogb;
    // #endregion
    // #region User Data Sync Services
    exports.$Pgb = (0, instantiation_1.$Bh)('IUserDataSyncEnablementService');
    exports.$Qgb = (0, instantiation_1.$Bh)('IUserDataSyncService');
    exports.$Rgb = (0, instantiation_1.$Bh)('IUserDataSyncResourceProviderService');
    exports.$Sgb = (0, instantiation_1.$Bh)('IUserDataAutoSyncService');
    exports.$Tgb = (0, instantiation_1.$Bh)('IUserDataSyncUtilService');
    exports.$Ugb = (0, instantiation_1.$Bh)('IUserDataSyncLogService');
    //#endregion
    exports.$Vgb = 'userDataSync';
    exports.$Wgb = 'vscode-userdata-sync';
    exports.$Xgb = 'preview';
});
//# sourceMappingURL=userDataSync.js.map