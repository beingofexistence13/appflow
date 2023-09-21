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
define(["require", "exports", "vs/nls!vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/extensions", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/contextkey/common/contextkey", "vs/platform/configuration/common/configuration", "vs/platform/files/common/files", "vs/base/common/objects", "vs/base/common/platform", "vs/platform/workspace/common/workspace", "vs/workbench/common/resources", "vs/base/common/async", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/environment/common/environment", "vs/base/common/map"], function (require, exports, nls_1, instantiation_1, extensions_1, event_1, lifecycle_1, contextkey_1, configuration_1, files_1, objects_1, platform_1, workspace_1, resources_1, async_1, uriIdentity_1, environment_1, map_1) {
    "use strict";
    var $zD_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$zD = exports.$yD = exports.AutoSaveMode = exports.$xD = void 0;
    exports.$xD = new contextkey_1.$2i('autoSaveAfterShortDelayContext', false, true);
    var AutoSaveMode;
    (function (AutoSaveMode) {
        AutoSaveMode[AutoSaveMode["OFF"] = 0] = "OFF";
        AutoSaveMode[AutoSaveMode["AFTER_SHORT_DELAY"] = 1] = "AFTER_SHORT_DELAY";
        AutoSaveMode[AutoSaveMode["AFTER_LONG_DELAY"] = 2] = "AFTER_LONG_DELAY";
        AutoSaveMode[AutoSaveMode["ON_FOCUS_CHANGE"] = 3] = "ON_FOCUS_CHANGE";
        AutoSaveMode[AutoSaveMode["ON_WINDOW_CHANGE"] = 4] = "ON_WINDOW_CHANGE";
    })(AutoSaveMode || (exports.AutoSaveMode = AutoSaveMode = {}));
    exports.$yD = (0, instantiation_1.$Bh)('filesConfigurationService');
    let $zD = class $zD extends lifecycle_1.$kc {
        static { $zD_1 = this; }
        static { this.a = platform_1.$o ? files_1.$qk.AFTER_DELAY : files_1.$qk.OFF; }
        static { this.b = {
            providerReadonly: { value: (0, nls_1.localize)(0, null), isTrusted: true },
            sessionReadonly: { value: (0, nls_1.localize)(1, null, 'workbench.action.files.setActiveEditorWriteableInSession'), isTrusted: true },
            configuredReadonly: { value: (0, nls_1.localize)(2, null, `workbench.action.openSettings?${encodeURIComponent('["files.readonly"]')}`), isTrusted: true },
            fileLocked: { value: (0, nls_1.localize)(3, null, 'workbench.action.files.setActiveEditorWriteableInSession'), isTrusted: true },
            fileReadonly: { value: (0, nls_1.localize)(4, null), isTrusted: true }
        }; }
        constructor(contextKeyService, C, D, F, G, H) {
            super();
            this.C = C;
            this.D = D;
            this.F = F;
            this.G = G;
            this.H = H;
            this.f = this.B(new event_1.$fd());
            this.onAutoSaveConfigurationChange = this.f.event;
            this.g = this.B(new event_1.$fd());
            this.onFilesAssociationChange = this.g.event;
            this.h = this.B(new event_1.$fd());
            this.onReadonlyChange = this.h.event;
            this.u = this.B(new async_1.$Xg(() => this.I(files_1.$uk)));
            this.w = this.B(new async_1.$Xg(() => this.I(files_1.$vk)));
            this.z = new map_1.$zi(resource => this.G.extUri.getComparisonKey(resource));
            this.r = exports.$xD.bindTo(contextKeyService);
            const configuration = C.getValue();
            this.s = configuration?.files?.associations;
            this.t = configuration?.files?.hotExit || files_1.$rk.ON_EXIT;
            this.L(configuration);
            this.J();
        }
        I(config) {
            const matcher = this.B(new resources_1.$wD(resource => this.C.getValue(config, { resource }), event => event.affectsConfiguration(config), this.D, this.C));
            this.B(matcher.onExpressionChange(() => this.h.fire()));
            return matcher;
        }
        isReadonly(resource, stat) {
            // if the entire file system provider is readonly, we respect that
            // and do not allow to change readonly. we take this as a hint that
            // the provider has no capabilities of writing.
            const provider = this.H.getProvider(resource.scheme);
            if (provider && (0, files_1.$dk)(provider)) {
                return provider.readOnlyMessage ?? $zD_1.b.providerReadonly;
            }
            // session override always wins over the others
            const sessionReadonlyOverride = this.z.get(resource);
            if (typeof sessionReadonlyOverride === 'boolean') {
                return sessionReadonlyOverride === true ? $zD_1.b.sessionReadonly : false;
            }
            if (this.G.extUri.isEqualOrParent(resource, this.F.userRoamingDataHome) ||
                this.G.extUri.isEqual(resource, this.D.getWorkspace().configuration ?? undefined)) {
                return false; // explicitly exclude some paths from readonly that we need for configuration
            }
            // configured glob patterns win over stat information
            if (this.u.value.matches(resource)) {
                return !this.w.value.matches(resource) ? $zD_1.b.configuredReadonly : false;
            }
            // check if file is locked and configured to treat as readonly
            if (this.y && stat?.locked) {
                return $zD_1.b.fileLocked;
            }
            // check if file is marked readonly from the file system provider
            if (stat?.readonly) {
                return $zD_1.b.fileReadonly;
            }
            return false;
        }
        async updateReadonly(resource, readonly) {
            if (readonly === 'toggle') {
                let stat = undefined;
                try {
                    stat = await this.H.resolve(resource, { resolveMetadata: true });
                }
                catch (error) {
                    // ignore
                }
                readonly = !this.isReadonly(resource, stat);
            }
            if (readonly === 'reset') {
                this.z.delete(resource);
            }
            else {
                this.z.set(resource, readonly);
            }
            this.h.fire();
        }
        J() {
            // Files configuration changes
            this.B(this.C.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('files')) {
                    this.L(this.C.getValue());
                }
            }));
        }
        L(configuration) {
            // Auto Save
            const autoSaveMode = configuration?.files?.autoSave || $zD_1.a;
            switch (autoSaveMode) {
                case files_1.$qk.AFTER_DELAY:
                    this.j = configuration?.files?.autoSaveDelay;
                    this.m = false;
                    this.n = false;
                    break;
                case files_1.$qk.ON_FOCUS_CHANGE:
                    this.j = undefined;
                    this.m = true;
                    this.n = false;
                    break;
                case files_1.$qk.ON_WINDOW_CHANGE:
                    this.j = undefined;
                    this.m = false;
                    this.n = true;
                    break;
                default:
                    this.j = undefined;
                    this.m = false;
                    this.n = false;
                    break;
            }
            this.r.set(this.getAutoSaveMode() === 1 /* AutoSaveMode.AFTER_SHORT_DELAY */);
            this.f.fire(this.getAutoSaveConfiguration());
            // Check for change in files associations
            const filesAssociation = configuration?.files?.associations;
            if (!(0, objects_1.$Zm)(this.s, filesAssociation)) {
                this.s = filesAssociation;
                this.g.fire();
            }
            // Hot exit
            const hotExitMode = configuration?.files?.hotExit;
            if (hotExitMode === files_1.$rk.OFF || hotExitMode === files_1.$rk.ON_EXIT_AND_WINDOW_CLOSE) {
                this.t = hotExitMode;
            }
            else {
                this.t = files_1.$rk.ON_EXIT;
            }
            // Readonly
            const readonlyFromPermissions = Boolean(configuration?.files?.readonlyFromPermissions);
            if (readonlyFromPermissions !== Boolean(this.y)) {
                this.y = readonlyFromPermissions;
                this.h.fire();
            }
        }
        getAutoSaveMode() {
            if (this.m) {
                return 3 /* AutoSaveMode.ON_FOCUS_CHANGE */;
            }
            if (this.n) {
                return 4 /* AutoSaveMode.ON_WINDOW_CHANGE */;
            }
            if (typeof this.j === 'number' && this.j >= 0) {
                return this.j <= 1000 ? 1 /* AutoSaveMode.AFTER_SHORT_DELAY */ : 2 /* AutoSaveMode.AFTER_LONG_DELAY */;
            }
            return 0 /* AutoSaveMode.OFF */;
        }
        getAutoSaveConfiguration() {
            return {
                autoSaveDelay: typeof this.j === 'number' && this.j >= 0 ? this.j : undefined,
                autoSaveFocusChange: !!this.m,
                autoSaveApplicationChange: !!this.n
            };
        }
        async toggleAutoSave() {
            const currentSetting = this.C.getValue('files.autoSave');
            let newAutoSaveValue;
            if ([files_1.$qk.AFTER_DELAY, files_1.$qk.ON_FOCUS_CHANGE, files_1.$qk.ON_WINDOW_CHANGE].some(setting => setting === currentSetting)) {
                newAutoSaveValue = files_1.$qk.OFF;
            }
            else {
                newAutoSaveValue = files_1.$qk.AFTER_DELAY;
            }
            return this.C.updateValue('files.autoSave', newAutoSaveValue);
        }
        get isHotExitEnabled() {
            if (this.D.getWorkspace().transient) {
                // Transient workspace: hot exit is disabled because
                // transient workspaces are not restored upon restart
                return false;
            }
            return this.t !== files_1.$rk.OFF;
        }
        get hotExitConfiguration() {
            return this.t;
        }
        preventSaveConflicts(resource, language) {
            return this.C.getValue('files.saveConflictResolution', { resource, overrideIdentifier: language }) !== 'overwriteFileOnDisk';
        }
    };
    exports.$zD = $zD;
    exports.$zD = $zD = $zD_1 = __decorate([
        __param(0, contextkey_1.$3i),
        __param(1, configuration_1.$8h),
        __param(2, workspace_1.$Kh),
        __param(3, environment_1.$Ih),
        __param(4, uriIdentity_1.$Ck),
        __param(5, files_1.$6j)
    ], $zD);
    (0, extensions_1.$mr)(exports.$yD, $zD, 0 /* InstantiationType.Eager */);
});
//# sourceMappingURL=filesConfigurationService.js.map