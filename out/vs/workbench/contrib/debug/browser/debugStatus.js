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
define(["require", "exports", "vs/nls", "vs/base/common/lifecycle", "vs/workbench/contrib/debug/common/debug", "vs/platform/configuration/common/configuration", "vs/workbench/services/statusbar/browser/statusbar"], function (require, exports, nls, lifecycle_1, debug_1, configuration_1, statusbar_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DebugStatusContribution = void 0;
    let DebugStatusContribution = class DebugStatusContribution {
        constructor(statusBarService, debugService, configurationService) {
            this.statusBarService = statusBarService;
            this.debugService = debugService;
            this.toDispose = [];
            const addStatusBarEntry = () => {
                this.entryAccessor = this.statusBarService.addEntry(this.entry, 'status.debug', 0 /* StatusbarAlignment.LEFT */, 30 /* Low Priority */);
            };
            const setShowInStatusBar = () => {
                this.showInStatusBar = configurationService.getValue('debug').showInStatusBar;
                if (this.showInStatusBar === 'always' && !this.entryAccessor) {
                    addStatusBarEntry();
                }
            };
            setShowInStatusBar();
            this.toDispose.push(this.debugService.onDidChangeState(state => {
                if (state !== 0 /* State.Inactive */ && this.showInStatusBar === 'onFirstSessionStart' && !this.entryAccessor) {
                    addStatusBarEntry();
                }
            }));
            this.toDispose.push(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('debug.showInStatusBar')) {
                    setShowInStatusBar();
                    if (this.entryAccessor && this.showInStatusBar === 'never') {
                        this.entryAccessor.dispose();
                        this.entryAccessor = undefined;
                    }
                }
            }));
            this.toDispose.push(this.debugService.getConfigurationManager().onDidSelectConfiguration(e => {
                this.entryAccessor?.update(this.entry);
            }));
        }
        get entry() {
            let text = '';
            const manager = this.debugService.getConfigurationManager();
            const name = manager.selectedConfiguration.name || '';
            const nameAndLaunchPresent = name && manager.selectedConfiguration.launch;
            if (nameAndLaunchPresent) {
                text = (manager.getLaunches().length > 1 ? `${name} (${manager.selectedConfiguration.launch.name})` : name);
            }
            return {
                name: nls.localize('status.debug', "Debug"),
                text: '$(debug-alt-small) ' + text,
                ariaLabel: nls.localize('debugTarget', "Debug: {0}", text),
                tooltip: nls.localize('selectAndStartDebug', "Select and start debug configuration"),
                command: 'workbench.action.debug.selectandstart'
            };
        }
        dispose() {
            this.entryAccessor?.dispose();
            (0, lifecycle_1.dispose)(this.toDispose);
        }
    };
    exports.DebugStatusContribution = DebugStatusContribution;
    exports.DebugStatusContribution = DebugStatusContribution = __decorate([
        __param(0, statusbar_1.IStatusbarService),
        __param(1, debug_1.IDebugService),
        __param(2, configuration_1.IConfigurationService)
    ], DebugStatusContribution);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdTdGF0dXMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9kZWJ1Zy9icm93c2VyL2RlYnVnU3RhdHVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVN6RixJQUFNLHVCQUF1QixHQUE3QixNQUFNLHVCQUF1QjtRQU1uQyxZQUNvQixnQkFBb0QsRUFDeEQsWUFBNEMsRUFDcEMsb0JBQTJDO1lBRjlCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFDdkMsaUJBQVksR0FBWixZQUFZLENBQWU7WUFMcEQsY0FBUyxHQUFrQixFQUFFLENBQUM7WUFTckMsTUFBTSxpQkFBaUIsR0FBRyxHQUFHLEVBQUU7Z0JBQzlCLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLGNBQWMsbUNBQTJCLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQ2pJLENBQUMsQ0FBQztZQUVGLE1BQU0sa0JBQWtCLEdBQUcsR0FBRyxFQUFFO2dCQUMvQixJQUFJLENBQUMsZUFBZSxHQUFHLG9CQUFvQixDQUFDLFFBQVEsQ0FBc0IsT0FBTyxDQUFDLENBQUMsZUFBZSxDQUFDO2dCQUNuRyxJQUFJLElBQUksQ0FBQyxlQUFlLEtBQUssUUFBUSxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRTtvQkFDN0QsaUJBQWlCLEVBQUUsQ0FBQztpQkFDcEI7WUFDRixDQUFDLENBQUM7WUFDRixrQkFBa0IsRUFBRSxDQUFDO1lBRXJCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQzlELElBQUksS0FBSywyQkFBbUIsSUFBSSxJQUFJLENBQUMsZUFBZSxL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