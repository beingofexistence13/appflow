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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/registry/common/platform", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/services/assignment/common/assignmentService", "vs/workbench/common/contributions"], function (require, exports, lifecycle_1, platform_1, nls_1, actions_1, configuration_1, notebookCommon_1, assignmentService_1, contributions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookProfileContribution = exports.NotebookProfileType = void 0;
    var NotebookProfileType;
    (function (NotebookProfileType) {
        NotebookProfileType["default"] = "default";
        NotebookProfileType["jupyter"] = "jupyter";
        NotebookProfileType["colab"] = "colab";
    })(NotebookProfileType || (exports.NotebookProfileType = NotebookProfileType = {}));
    const profiles = {
        [NotebookProfileType.default]: {
            [notebookCommon_1.NotebookSetting.focusIndicator]: 'gutter',
            [notebookCommon_1.NotebookSetting.insertToolbarLocation]: 'both',
            [notebookCommon_1.NotebookSetting.globalToolbar]: true,
            [notebookCommon_1.NotebookSetting.cellToolbarLocation]: { default: 'right' },
            [notebookCommon_1.NotebookSetting.compactView]: true,
            [notebookCommon_1.NotebookSetting.showCellStatusBar]: 'visible',
            [notebookCommon_1.NotebookSetting.consolidatedRunButton]: true,
            [notebookCommon_1.NotebookSetting.undoRedoPerCell]: false
        },
        [NotebookProfileType.jupyter]: {
            [notebookCommon_1.NotebookSetting.focusIndicator]: 'gutter',
            [notebookCommon_1.NotebookSetting.insertToolbarLocation]: 'notebookToolbar',
            [notebookCommon_1.NotebookSetting.globalToolbar]: true,
            [notebookCommon_1.NotebookSetting.cellToolbarLocation]: { default: 'left' },
            [notebookCommon_1.NotebookSetting.compactView]: true,
            [notebookCommon_1.NotebookSetting.showCellStatusBar]: 'visible',
            [notebookCommon_1.NotebookSetting.consolidatedRunButton]: false,
            [notebookCommon_1.NotebookSetting.undoRedoPerCell]: true
        },
        [NotebookProfileType.colab]: {
            [notebookCommon_1.NotebookSetting.focusIndicator]: 'border',
            [notebookCommon_1.NotebookSetting.insertToolbarLocation]: 'betweenCells',
            [notebookCommon_1.NotebookSetting.globalToolbar]: false,
            [notebookCommon_1.NotebookSetting.cellToolbarLocation]: { default: 'right' },
            [notebookCommon_1.NotebookSetting.compactView]: false,
            [notebookCommon_1.NotebookSetting.showCellStatusBar]: 'hidden',
            [notebookCommon_1.NotebookSetting.consolidatedRunButton]: true,
            [notebookCommon_1.NotebookSetting.undoRedoPerCell]: false
        }
    };
    async function applyProfile(configService, profile) {
        const promises = [];
        for (const settingKey in profile) {
            promises.push(configService.updateValue(settingKey, profile[settingKey]));
        }
        await Promise.all(promises);
    }
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'notebook.setProfile',
                title: (0, nls_1.localize)('setProfileTitle', "Set Profile")
            });
        }
        async run(accessor, args) {
            if (!isSetProfileArgs(args)) {
                return;
            }
            const configService = accessor.get(configuration_1.IConfigurationService);
            return applyProfile(configService, profiles[args.profile]);
        }
    });
    function isSetProfileArgs(args) {
        const setProfileArgs = args;
        return setProfileArgs.profile === NotebookProfileType.colab ||
            setProfileArgs.profile === NotebookProfileType.default ||
            setProfileArgs.profile === NotebookProfileType.jupyter;
    }
    let NotebookProfileContribution = class NotebookProfileContribution extends lifecycle_1.Disposable {
        constructor(configService, experimentService) {
            super();
            this.experimentService = experimentService;
            if (this.experimentService) {
                this.experimentService.getTreatment('notebookprofile').then(treatment => {
                    if (treatment === undefined) {
                        return;
                    }
                    else {
                        // check if settings are already modified
                        const focusIndicator = configService.getValue(notebookCommon_1.NotebookSetting.focusIndicator);
                        const insertToolbarPosition = configService.getValue(notebookCommon_1.NotebookSetting.insertToolbarLocation);
                        const globalToolbar = configService.getValue(notebookCommon_1.NotebookSetting.globalToolbar);
                        // const cellToolbarLocation = configService.getValue(NotebookSetting.cellToolbarLocation);
                        const compactView = configService.getValue(notebookCommon_1.NotebookSetting.compactView);
                        const showCellStatusBar = configService.getValue(notebookCommon_1.NotebookSetting.showCellStatusBar);
                        const consolidatedRunButton = configService.getValue(notebookCommon_1.NotebookSetting.consolidatedRunButton);
                        if (focusIndicator === 'border'
                            && insertToolbarPosition === 'both'
                            && globalToolbar === false
                            // && cellToolbarLocation === undefined
                            && compactView === true
                            && showCellStatusBar === 'visible'
                            && consolidatedRunButton === true) {
                            applyProfile(configService, profiles[treatment] ?? profiles[NotebookProfileType.default]);
                        }
                    }
                });
            }
        }
    };
    exports.NotebookProfileContribution = NotebookProfileContribution;
    exports.NotebookProfileContribution = NotebookProfileContribution = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, assignmentService_1.IWorkbenchAssignmentService)
    ], NotebookProfileContribution);
    const workbenchContributionsRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchContributionsRegistry.registerWorkbenchContribution(NotebookProfileContribution, 2 /* LifecyclePhase.Ready */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tQcm9maWxlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svYnJvd3Nlci9jb250cmliL3Byb2ZpbGUvbm90ZWJvb2tQcm9maWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWFoRyxJQUFZLG1CQUlYO0lBSkQsV0FBWSxtQkFBbUI7UUFDOUIsMENBQW1CLENBQUE7UUFDbkIsMENBQW1CLENBQUE7UUFDbkIsc0NBQWUsQ0FBQTtJQUNoQixDQUFDLEVBSlcsbUJBQW1CLG1DQUFuQixtQkFBbUIsUUFJOUI7SUFFRCxNQUFNLFFBQVEsR0FBRztRQUNoQixDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQzlCLENBQUMsZ0NBQWUsQ0FBQyxjQUFjLENBQUMsRUFBRSxRQUFRO1lBQzFDLENBQUMsZ0NBQWUsQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLE1BQU07WUFDL0MsQ0FBQyxnQ0FBZSxDQUFDLGFBQWEsQ0FBQyxFQUFFLElBQUk7WUFDckMsQ0FBQyxnQ0FBZSxDQUFDLG1CQUFtQixDQUFDLEVBQUUsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFO1lBQzNELENBQUMsZ0NBQWUsQ0FBQyxXQUFXLENBQUMsRUFBRSxJQUFJO1lBQ25DLENBQUMsZ0NBQWUsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLFNBQVM7WUFDOUMsQ0FBQyxnQ0FBZSxDQUFDLHFCQUFxQixDQUFDLEVBQUUsSUFBSTtZQUM3QyxDQUFDLGdDQUFlLENBQUMsZUFBZSxDQUFDLEVBQUUsS0FBSztTQUN4QztRQUNELENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDOUIsQ0FBQyxnQ0FBZSxDQUFDLGNBQWMsQ0FBQyxFQUFFLFFBQVE7WUFDMUMsQ0FBQyxnQ0FBZSxDQUFDLHFCQUFxQixDQUFDLEVBQUUs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