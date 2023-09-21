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
define(["require", "exports", "vs/nls!vs/workbench/contrib/extensions/electron-sandbox/runtimeExtensionsEditor", "vs/base/common/actions", "vs/platform/telemetry/common/telemetry", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/extensions/common/extensions", "vs/platform/theme/common/themeService", "vs/workbench/services/extensions/common/extensions", "vs/platform/contextview/browser/contextView", "vs/platform/notification/common/notification", "vs/platform/contextkey/common/contextkey", "vs/platform/storage/common/storage", "vs/platform/label/common/label", "vs/workbench/contrib/extensions/electron-sandbox/extensionsSlowActions", "vs/workbench/services/environment/common/environmentService", "vs/workbench/contrib/extensions/common/reportExtensionIssueAction", "vs/workbench/contrib/extensions/browser/abstractRuntimeExtensionsEditor", "vs/base/common/buffer", "vs/base/common/uri", "vs/platform/files/common/files", "vs/platform/native/common/native", "vs/platform/profiling/common/profiling", "vs/platform/clipboard/common/clipboardService"], function (require, exports, nls, actions_1, telemetry_1, instantiation_1, extensions_1, themeService_1, extensions_2, contextView_1, notification_1, contextkey_1, storage_1, label_1, extensionsSlowActions_1, environmentService_1, reportExtensionIssueAction_1, abstractRuntimeExtensionsEditor_1, buffer_1, uri_1, files_1, native_1, profiling_1, clipboardService_1) {
    "use strict";
    var $oac_1, $qac_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$qac = exports.$pac = exports.$oac = exports.$nac = exports.ProfileSessionState = exports.$mac = exports.$lac = exports.$kac = void 0;
    exports.$kac = (0, instantiation_1.$Bh)('extensionHostProfileService');
    exports.$lac = new contextkey_1.$2i('profileSessionState', 'none');
    exports.$mac = new contextkey_1.$2i('extensionHostProfileRecorded', false);
    var ProfileSessionState;
    (function (ProfileSessionState) {
        ProfileSessionState[ProfileSessionState["None"] = 0] = "None";
        ProfileSessionState[ProfileSessionState["Starting"] = 1] = "Starting";
        ProfileSessionState[ProfileSessionState["Running"] = 2] = "Running";
        ProfileSessionState[ProfileSessionState["Stopping"] = 3] = "Stopping";
    })(ProfileSessionState || (exports.ProfileSessionState = ProfileSessionState = {}));
    let $nac = class $nac extends abstractRuntimeExtensionsEditor_1.$6Ub {
        constructor(telemetryService, themeService, contextKeyService, extensionsWorkbenchService, extensionService, notificationService, contextMenuService, instantiationService, storageService, labelService, environmentService, clipboardService, ub) {
            super(telemetryService, themeService, contextKeyService, extensionsWorkbenchService, extensionService, notificationService, contextMenuService, instantiationService, storageService, labelService, environmentService, clipboardService);
            this.ub = ub;
            this.rb = this.ub.lastProfile;
            this.sb = exports.$mac.bindTo(contextKeyService);
            this.tb = exports.$lac.bindTo(contextKeyService);
            this.B(this.ub.onDidChangeLastProfile(() => {
                this.rb = this.ub.lastProfile;
                this.sb.set(!!this.rb);
                this.hb();
            }));
            this.B(this.ub.onDidChangeState(() => {
                const state = this.ub.state;
                this.tb.set(ProfileSessionState[state].toLowerCase());
            }));
        }
        lb() {
            return this.rb;
        }
        mb(extensionId) {
            return this.ub.getUnresponsiveProfile(extensionId);
        }
        nb(element) {
            if (element.unresponsiveProfile) {
                return this.y.createInstance(extensionsSlowActions_1.$iac, element.description, element.unresponsiveProfile);
            }
            return null;
        }
        ob(element) {
            if (element.marketplaceInfo) {
                return this.y.createInstance(reportExtensionIssueAction_1.$94b, element.description);
            }
            return null;
        }
        pb() {
            return this.y.createInstance($qac, $qac.ID, $qac.LABEL);
        }
        qb() {
            const state = this.ub.state;
            const profileAction = (state === ProfileSessionState.Running
                ? this.y.createInstance($pac, $pac.ID, $pac.LABEL)
                : this.y.createInstance($oac, $oac.ID, $oac.LABEL));
            return profileAction;
        }
    };
    exports.$nac = $nac;
    exports.$nac = $nac = __decorate([
        __param(0, telemetry_1.$9k),
        __param(1, themeService_1.$gv),
        __param(2, contextkey_1.$3i),
        __param(3, extensions_1.$Pfb),
        __param(4, extensions_2.$MF),
        __param(5, notification_1.$Yu),
        __param(6, contextView_1.$WZ),
        __param(7, instantiation_1.$Ah),
        __param(8, storage_1.$Vo),
        __param(9, label_1.$Vz),
        __param(10, environmentService_1.$hJ),
        __param(11, clipboardService_1.$UZ),
        __param(12, exports.$kac)
    ], $nac);
    let $oac = class $oac extends actions_1.$gi {
        static { $oac_1 = this; }
        static { this.ID = 'workbench.extensions.action.extensionHostProfile'; }
        static { this.LABEL = nls.localize(0, null); }
        constructor(id = $oac_1.ID, label = $oac_1.LABEL, a) {
            super(id, label);
            this.a = a;
        }
        run() {
            this.a.startProfiling();
            return Promise.resolve();
        }
    };
    exports.$oac = $oac;
    exports.$oac = $oac = $oac_1 = __decorate([
        __param(2, exports.$kac)
    ], $oac);
    let $pac = class $pac extends actions_1.$gi {
        static { this.ID = 'workbench.extensions.action.stopExtensionHostProfile'; }
        static { this.LABEL = nls.localize(1, null); }
        constructor(id = $oac.ID, label = $oac.LABEL, a) {
            super(id, label);
            this.a = a;
        }
        run() {
            this.a.stopProfiling();
            return Promise.resolve();
        }
    };
    exports.$pac = $pac;
    exports.$pac = $pac = __decorate([
        __param(2, exports.$kac)
    ], $pac);
    let $qac = class $qac extends actions_1.$gi {
        static { $qac_1 = this; }
        static { this.LABEL = nls.localize(2, null); }
        static { this.ID = 'workbench.extensions.action.saveExtensionHostProfile'; }
        constructor(id = $qac_1.ID, label = $qac_1.LABEL, a, b, c, f) {
            super(id, label, undefined, false);
            this.a = a;
            this.b = b;
            this.c = c;
            this.f = f;
            this.c.onDidChangeLastProfile(() => {
                this.enabled = (this.c.lastProfile !== null);
            });
        }
        run() {
            return Promise.resolve(this.g());
        }
        async g() {
            const picked = await this.a.showSaveDialog({
                title: nls.localize(3, null),
                buttonLabel: nls.localize(4, null),
                defaultPath: `CPU-${new Date().toISOString().replace(/[\-:]/g, '')}.cpuprofile`,
                filters: [{
                        name: 'CPU Profiles',
                        extensions: ['cpuprofile', 'txt']
                    }]
            });
            if (!picked || !picked.filePath || picked.canceled) {
                return;
            }
            const profileInfo = this.c.lastProfile;
            let dataToWrite = profileInfo ? profileInfo.data : {};
            let savePath = picked.filePath;
            if (this.b.isBuilt) {
                // when running from a not-development-build we remove
                // absolute filenames because we don't want to reveal anything
                // about users. We also append the `.txt` suffix to make it
                // easier to attach these files to GH issues
                dataToWrite = profiling_1.Utils.rewriteAbsolutePaths(dataToWrite, 'piiRemoved');
                savePath = savePath + '.txt';
            }
            return this.f.writeFile(uri_1.URI.file(savePath), buffer_1.$Fd.fromString(JSON.stringify(profileInfo ? profileInfo.data : {}, null, '\t')));
        }
    };
    exports.$qac = $qac;
    exports.$qac = $qac = $qac_1 = __decorate([
        __param(2, native_1.$05b),
        __param(3, environmentService_1.$hJ),
        __param(4, exports.$kac),
        __param(5, files_1.$6j)
    ], $qac);
});
//# sourceMappingURL=runtimeExtensionsEditor.js.map