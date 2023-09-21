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
define(["require", "exports", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/ports", "vs/nls!vs/workbench/contrib/extensions/electron-sandbox/extensionProfileService", "vs/platform/commands/common/commands", "vs/platform/dialogs/common/dialogs", "vs/platform/extensions/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/native/common/native", "vs/platform/product/common/productService", "vs/workbench/contrib/extensions/common/runtimeExtensionsInput", "vs/workbench/contrib/extensions/electron-sandbox/runtimeExtensionsEditor", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/extensions/electron-sandbox/extensionHostProfiler", "vs/workbench/services/statusbar/browser/statusbar"], function (require, exports, errors_1, event_1, lifecycle_1, ports_1, nls, commands_1, dialogs_1, extensions_1, instantiation_1, native_1, productService_1, runtimeExtensionsInput_1, runtimeExtensionsEditor_1, editorService_1, extensions_2, extensionHostProfiler_1, statusbar_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$wac = void 0;
    let $wac = class $wac extends lifecycle_1.$kc {
        get state() { return this.h; }
        get lastProfile() { return this.f; }
        constructor(n, r, s, t, u, w, y) {
            super();
            this.n = n;
            this.r = r;
            this.s = s;
            this.t = t;
            this.u = u;
            this.w = w;
            this.y = y;
            this.a = this.B(new event_1.$fd());
            this.onDidChangeState = this.a.event;
            this.b = this.B(new event_1.$fd());
            this.onDidChangeLastProfile = this.b.event;
            this.c = new extensions_1.$Xl();
            this.h = runtimeExtensionsEditor_1.ProfileSessionState.None;
            this.m = this.B(new lifecycle_1.$lc());
            this.f = null;
            this.g = null;
            this.z(runtimeExtensionsEditor_1.ProfileSessionState.None);
            commands_1.$Gr.registerCommand('workbench.action.extensionHostProfiler.stop', () => {
                this.stopProfiling();
                this.r.openEditor(runtimeExtensionsInput_1.$5Ub.instance, { pinned: true });
            });
        }
        z(state) {
            if (this.h === state) {
                return;
            }
            this.h = state;
            if (this.h === runtimeExtensionsEditor_1.ProfileSessionState.Running) {
                this.C(true);
            }
            else if (this.h === runtimeExtensionsEditor_1.ProfileSessionState.Stopping) {
                this.C(false);
            }
            this.a.fire(undefined);
        }
        C(visible) {
            this.m.clear();
            if (visible) {
                const indicator = {
                    name: nls.localize(0, null),
                    text: nls.localize(1, null),
                    showProgress: true,
                    ariaLabel: nls.localize(2, null),
                    tooltip: nls.localize(3, null),
                    command: 'workbench.action.extensionHostProfiler.stop'
                };
                const timeStarted = Date.now();
                const handle = setInterval(() => {
                    this.j?.update({ ...indicator, text: nls.localize(4, null, Math.round((new Date().getTime() - timeStarted) / 1000)), });
                }, 1000);
                this.m.value = (0, lifecycle_1.$ic)(() => clearInterval(handle));
                if (!this.j) {
                    this.j = this.w.addEntry(indicator, 'status.profiler', 1 /* StatusbarAlignment.RIGHT */);
                }
                else {
                    this.j.update(indicator);
                }
            }
            else {
                if (this.j) {
                    this.j.dispose();
                    this.j = undefined;
                }
            }
        }
        async startProfiling() {
            if (this.h !== runtimeExtensionsEditor_1.ProfileSessionState.None) {
                return null;
            }
            const inspectPorts = await this.n.getInspectPorts(1 /* ExtensionHostKind.LocalProcess */, true);
            if (inspectPorts.length === 0) {
                return this.u.confirm({
                    type: 'info',
                    message: nls.localize(5, null),
                    detail: nls.localize(6, null, this.y.nameLong),
                    primaryButton: nls.localize(7, null)
                }).then(res => {
                    if (res.confirmed) {
                        this.t.relaunch({ addArgs: [`--inspect-extensions=${(0, ports_1.$JS)()}`] });
                    }
                });
            }
            if (inspectPorts.length > 1) {
                // TODO
                console.warn(`There are multiple extension hosts available for profiling. Picking the first one...`);
            }
            this.z(runtimeExtensionsEditor_1.ProfileSessionState.Starting);
            return this.s.createInstance(extensionHostProfiler_1.$vac, inspectPorts[0]).start().then((value) => {
                this.g = value;
                this.z(runtimeExtensionsEditor_1.ProfileSessionState.Running);
            }, (err) => {
                (0, errors_1.$Y)(err);
                this.z(runtimeExtensionsEditor_1.ProfileSessionState.None);
            });
        }
        stopProfiling() {
            if (this.h !== runtimeExtensionsEditor_1.ProfileSessionState.Running || !this.g) {
                return;
            }
            this.z(runtimeExtensionsEditor_1.ProfileSessionState.Stopping);
            this.g.stop().then((result) => {
                this.D(result);
                this.z(runtimeExtensionsEditor_1.ProfileSessionState.None);
            }, (err) => {
                (0, errors_1.$Y)(err);
                this.z(runtimeExtensionsEditor_1.ProfileSessionState.None);
            });
            this.g = null;
        }
        D(profile) {
            this.f = profile;
            this.b.fire(undefined);
        }
        getUnresponsiveProfile(extensionId) {
            return this.c.get(extensionId);
        }
        setUnresponsiveProfile(extensionId, profile) {
            this.c.set(extensionId, profile);
            this.D(profile);
        }
    };
    exports.$wac = $wac;
    exports.$wac = $wac = __decorate([
        __param(0, extensions_2.$MF),
        __param(1, editorService_1.$9C),
        __param(2, instantiation_1.$Ah),
        __param(3, native_1.$05b),
        __param(4, dialogs_1.$oA),
        __param(5, statusbar_1.$6$),
        __param(6, productService_1.$kj)
    ], $wac);
});
//# sourceMappingURL=extensionProfileService.js.map