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
define(["require", "exports", "vs/nls!vs/workbench/contrib/debug/browser/debugStatus", "vs/base/common/lifecycle", "vs/workbench/contrib/debug/common/debug", "vs/platform/configuration/common/configuration", "vs/workbench/services/statusbar/browser/statusbar"], function (require, exports, nls, lifecycle_1, debug_1, configuration_1, statusbar_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$YRb = void 0;
    let $YRb = class $YRb {
        constructor(d, f, configurationService) {
            this.d = d;
            this.f = f;
            this.b = [];
            const addStatusBarEntry = () => {
                this.c = this.d.addEntry(this.g, 'status.debug', 0 /* StatusbarAlignment.LEFT */, 30 /* Low Priority */);
            };
            const setShowInStatusBar = () => {
                this.a = configurationService.getValue('debug').showInStatusBar;
                if (this.a === 'always' && !this.c) {
                    addStatusBarEntry();
                }
            };
            setShowInStatusBar();
            this.b.push(this.f.onDidChangeState(state => {
                if (state !== 0 /* State.Inactive */ && this.a === 'onFirstSessionStart' && !this.c) {
                    addStatusBarEntry();
                }
            }));
            this.b.push(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('debug.showInStatusBar')) {
                    setShowInStatusBar();
                    if (this.c && this.a === 'never') {
                        this.c.dispose();
                        this.c = undefined;
                    }
                }
            }));
            this.b.push(this.f.getConfigurationManager().onDidSelectConfiguration(e => {
                this.c?.update(this.g);
            }));
        }
        get g() {
            let text = '';
            const manager = this.f.getConfigurationManager();
            const name = manager.selectedConfiguration.name || '';
            const nameAndLaunchPresent = name && manager.selectedConfiguration.launch;
            if (nameAndLaunchPresent) {
                text = (manager.getLaunches().length > 1 ? `${name} (${manager.selectedConfiguration.launch.name})` : name);
            }
            return {
                name: nls.localize(0, null),
                text: '$(debug-alt-small) ' + text,
                ariaLabel: nls.localize(1, null, text),
                tooltip: nls.localize(2, null),
                command: 'workbench.action.debug.selectandstart'
            };
        }
        dispose() {
            this.c?.dispose();
            (0, lifecycle_1.$fc)(this.b);
        }
    };
    exports.$YRb = $YRb;
    exports.$YRb = $YRb = __decorate([
        __param(0, statusbar_1.$6$),
        __param(1, debug_1.$nH),
        __param(2, configuration_1.$8h)
    ], $YRb);
});
//# sourceMappingURL=debugStatus.js.map