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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/registry/common/platform", "vs/nls!vs/workbench/contrib/notebook/browser/contrib/profile/notebookProfile", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/services/assignment/common/assignmentService", "vs/workbench/common/contributions"], function (require, exports, lifecycle_1, platform_1, nls_1, actions_1, configuration_1, notebookCommon_1, assignmentService_1, contributions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$vFb = exports.NotebookProfileType = void 0;
    var NotebookProfileType;
    (function (NotebookProfileType) {
        NotebookProfileType["default"] = "default";
        NotebookProfileType["jupyter"] = "jupyter";
        NotebookProfileType["colab"] = "colab";
    })(NotebookProfileType || (exports.NotebookProfileType = NotebookProfileType = {}));
    const profiles = {
        [NotebookProfileType.default]: {
            [notebookCommon_1.$7H.focusIndicator]: 'gutter',
            [notebookCommon_1.$7H.insertToolbarLocation]: 'both',
            [notebookCommon_1.$7H.globalToolbar]: true,
            [notebookCommon_1.$7H.cellToolbarLocation]: { default: 'right' },
            [notebookCommon_1.$7H.compactView]: true,
            [notebookCommon_1.$7H.showCellStatusBar]: 'visible',
            [notebookCommon_1.$7H.consolidatedRunButton]: true,
            [notebookCommon_1.$7H.undoRedoPerCell]: false
        },
        [NotebookProfileType.jupyter]: {
            [notebookCommon_1.$7H.focusIndicator]: 'gutter',
            [notebookCommon_1.$7H.insertToolbarLocation]: 'notebookToolbar',
            [notebookCommon_1.$7H.globalToolbar]: true,
            [notebookCommon_1.$7H.cellToolbarLocation]: { default: 'left' },
            [notebookCommon_1.$7H.compactView]: true,
            [notebookCommon_1.$7H.showCellStatusBar]: 'visible',
            [notebookCommon_1.$7H.consolidatedRunButton]: false,
            [notebookCommon_1.$7H.undoRedoPerCell]: true
        },
        [NotebookProfileType.colab]: {
            [notebookCommon_1.$7H.focusIndicator]: 'border',
            [notebookCommon_1.$7H.insertToolbarLocation]: 'betweenCells',
            [notebookCommon_1.$7H.globalToolbar]: false,
            [notebookCommon_1.$7H.cellToolbarLocation]: { default: 'right' },
            [notebookCommon_1.$7H.compactView]: false,
            [notebookCommon_1.$7H.showCellStatusBar]: 'hidden',
            [notebookCommon_1.$7H.consolidatedRunButton]: true,
            [notebookCommon_1.$7H.undoRedoPerCell]: false
        }
    };
    async function applyProfile(configService, profile) {
        const promises = [];
        for (const settingKey in profile) {
            promises.push(configService.updateValue(settingKey, profile[settingKey]));
        }
        await Promise.all(promises);
    }
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'notebook.setProfile',
                title: (0, nls_1.localize)(0, null)
            });
        }
        async run(accessor, args) {
            if (!isSetProfileArgs(args)) {
                return;
            }
            const configService = accessor.get(configuration_1.$8h);
            return applyProfile(configService, profiles[args.profile]);
        }
    });
    function isSetProfileArgs(args) {
        const setProfileArgs = args;
        return setProfileArgs.profile === NotebookProfileType.colab ||
            setProfileArgs.profile === NotebookProfileType.default ||
            setProfileArgs.profile === NotebookProfileType.jupyter;
    }
    let $vFb = class $vFb extends lifecycle_1.$kc {
        constructor(configService, a) {
            super();
            this.a = a;
            if (this.a) {
                this.a.getTreatment('notebookprofile').then(treatment => {
                    if (treatment === undefined) {
                        return;
                    }
                    else {
                        // check if settings are already modified
                        const focusIndicator = configService.getValue(notebookCommon_1.$7H.focusIndicator);
                        const insertToolbarPosition = configService.getValue(notebookCommon_1.$7H.insertToolbarLocation);
                        const globalToolbar = configService.getValue(notebookCommon_1.$7H.globalToolbar);
                        // const cellToolbarLocation = configService.getValue(NotebookSetting.cellToolbarLocation);
                        const compactView = configService.getValue(notebookCommon_1.$7H.compactView);
                        const showCellStatusBar = configService.getValue(notebookCommon_1.$7H.showCellStatusBar);
                        const consolidatedRunButton = configService.getValue(notebookCommon_1.$7H.consolidatedRunButton);
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
    exports.$vFb = $vFb;
    exports.$vFb = $vFb = __decorate([
        __param(0, configuration_1.$8h),
        __param(1, assignmentService_1.$drb)
    ], $vFb);
    const workbenchContributionsRegistry = platform_1.$8m.as(contributions_1.Extensions.Workbench);
    workbenchContributionsRegistry.registerWorkbenchContribution($vFb, 2 /* LifecyclePhase.Ready */);
});
//# sourceMappingURL=notebookProfile.js.map