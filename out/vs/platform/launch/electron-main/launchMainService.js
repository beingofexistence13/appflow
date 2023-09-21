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
define(["require", "exports", "electron", "vs/base/common/arrays", "vs/base/common/platform", "vs/base/common/uri", "vs/base/node/pfs", "vs/platform/configuration/common/configuration", "vs/platform/environment/node/argvHelper", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/url/common/url", "vs/platform/windows/electron-main/windows"], function (require, exports, electron_1, arrays_1, platform_1, uri_1, pfs_1, configuration_1, argvHelper_1, instantiation_1, log_1, url_1, windows_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LaunchMainService = exports.ILaunchMainService = exports.ID = void 0;
    exports.ID = 'launchMainService';
    exports.ILaunchMainService = (0, instantiation_1.createDecorator)(exports.ID);
    let LaunchMainService = class LaunchMainService {
        constructor(logService, windowsMainService, urlService, configurationService) {
            this.logService = logService;
            this.windowsMainService = windowsMainService;
            this.urlService = urlService;
            this.configurationService = configurationService;
        }
        async start(args, userEnv) {
            this.logService.trace('Received data from other instance: ', args, userEnv);
            // macOS: Electron > 7.x changed its behaviour to not
            // bring the application to the foreground when a window
            // is focused programmatically. Only via `app.focus` and
            // the option `steal: true` can you get the previous
            // behaviour back. The only reason to use this option is
            // when a window is getting focused while the application
            // is not in the foreground and since we got instructed
            // to open a new window from another instance, we ensure
            // that the app has focus.
            if (platform_1.isMacintosh) {
                electron_1.app.focus({ steal: true });
            }
            // Check early for open-url which is handled in URL service
            const urlsToOpen = this.parseOpenUrl(args);
            if (urlsToOpen.length) {
                let whenWindowReady = Promise.resolve();
                // Create a window if there is none
                if (this.windowsMainService.getWindowCount() === 0) {
                    const window = (0, arrays_1.firstOrDefault)(await this.windowsMainService.openEmptyWindow({ context: 4 /* OpenContext.DESKTOP */ }));
                    if (window) {
                        whenWindowReady = window.ready();
                    }
                }
                // Make sure a window is open, ready to receive the url event
                whenWindowReady.then(() => {
                    for (const { uri, originalUrl } of urlsToOpen) {
                        this.urlService.open(uri, { originalUrl });
                    }
                });
            }
            // Otherwise handle in windows service
            else {
                return this.startOpenWindow(args, userEnv);
            }
        }
        parseOpenUrl(args) {
            if (args['open-url'] && args._urls && args._urls.length > 0) {
                // --open-url must contain -- followed by the url(s)
                // process.argv is used over args._ as args._ are resolved to file paths at this point
                return (0, arrays_1.coalesce)(args._urls
                    .map(url => {
                    try {
                        return { uri: uri_1.URI.parse(url), originalUrl: url };
                    }
                    catch (err) {
                        return null;
                    }
                }));
            }
            return [];
        }
        async startOpenWindow(args, userEnv) {
            const context = (0, argvHelper_1.isLaunchedFromCli)(userEnv) ? 0 /* OpenContext.CLI */ : 4 /* OpenContext.DESKTOP */;
            let usedWindows = [];
            const waitMarkerFileURI = args.wait && args.waitMarkerFilePath ? uri_1.URI.file(args.waitMarkerFilePath) : undefined;
            const remoteAuthority = args.remote || undefined;
            const baseConfig = {
                context,
                cli: args,
                userEnv,
                waitMarkerFileURI,
                remoteAuthority,
                forceProfile: args.profile,
                forceTempProfile: args['profile-temp']
            };
            // Special case extension development
            if (!!args.extensionDevelopmentPath) {
                await this.windowsMainService.openExtensionDevelopmentHostWindow(args.extensionDevelopmentPath, baseConfig);
            }
            // Start without file/folder arguments
            else if (!args._.length && !args['folder-uri'] && !args['file-uri']) {
                let openNewWindow = false;
                // Force new window
                if (args['new-window'] || args['unity-launch'] || baseConfig.forceProfile || baseConfig.forceTempProfile) {
                    openNewWindow = true;
                }
                // Force reuse window
                else if (args['reuse-window']) {
                    openNewWindow = false;
                }
                // Otherwise check for settings
                else {
                    const windowConfig = this.configurationService.getValue('window');
                    const openWithoutArgumentsInNewWindowConfig = windowConfig?.openWithoutArgumentsInNewWindow || 'default' /* default */;
                    switch (openWithoutArgumentsInNewWindowConfig) {
                        case 'on':
                            openNewWindow = true;
                            break;
                        case 'off':
                            openNewWindow = false;
                            break;
                        default:
                            openNewWindow = !platform_1.isMacintosh; // prefer to restore running instance on macOS
                    }
                }
                // Open new Window
                if (openNewWindow) {
                    usedWindows = await this.windowsMainService.open({
                        ...baseConfig,
                        forceNewWindow: true,
                        forceEmpty: true
                    });
                }
                // Focus existing window or open if none opened
                else {
                    const lastActive = this.windowsMainService.getLastActiveWindow();
                    if (lastActive) {
                        this.windowsMainService.openExistingWindow(lastActive, baseConfig);
                        usedWindows = [lastActive];
                    }
                    else {
                        usedWindows = await this.windowsMainService.open({
                            ...baseConfig,
                            forceEmpty: true
                        });
                    }
                }
            }
            // Start with file/folder arguments
            else {
                usedWindows = await this.windowsMainService.open({
                    ...baseConfig,
                    forceNewWindow: args['new-window'],
                    preferNewWindow: !args['reuse-window'] && !args.wait,
                    forceReuseWindow: args['reuse-window'],
                    diffMode: args.diff,
                    mergeMode: args.merge,
                    addMode: args.add,
                    noRecentEntry: !!args['skip-add-to-recently-opened'],
                    gotoLineMode: args.goto
                });
            }
            // If the other instance is waiting to be killed, we hook up a window listener if one window
            // is being used and only then resolve the startup promise which will kill this second instance.
            // In addition, we poll for the wait marker file to be deleted to return.
            if (waitMarkerFileURI && usedWindows.length === 1 && usedWindows[0]) {
                return Promise.race([
                    usedWindows[0].whenClosedOrLoaded,
                    (0, pfs_1.whenDeleted)(waitMarkerFileURI.fsPath)
                ]).then(() => undefined, () => undefined);
            }
        }
        async getMainProcessId() {
            this.logService.trace('Received request for process ID from other instance.');
            return process.pid;
        }
    };
    exports.LaunchMainService = LaunchMainService;
    exports.LaunchMainService = LaunchMainService = __decorate([
        __param(0, log_1.ILogService),
        __param(1, windows_1.IWindowsMainService),
        __param(2, url_1.IURLService),
        __param(3, configuration_1.IConfigurationService)
    ], LaunchMainService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF1bmNoTWFpblNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9sYXVuY2gvZWxlY3Ryb24tbWFpbi9sYXVuY2hNYWluU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFrQm5GLFFBQUEsRUFBRSxHQUFHLG1CQUFtQixDQUFDO0lBQ3pCLFFBQUEsa0JBQWtCLEdBQUcsSUFBQSwrQkFBZSxFQUFxQixVQUFFLENBQUMsQ0FBQztJQWdCbkUsSUFBTSxpQkFBaUIsR0FBdkIsTUFBTSxpQkFBaUI7UUFJN0IsWUFDK0IsVUFBdUIsRUFDZixrQkFBdUMsRUFDL0MsVUFBdUIsRUFDYixvQkFBMkM7WUFIckQsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQUNmLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBcUI7WUFDL0MsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQUNiLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7UUFDaEYsQ0FBQztRQUVMLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBc0IsRUFBRSxPQUE0QjtZQUMvRCxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxxQ0FBcUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFFNUUscURBQXFEO1lBQ3JELHdEQUF3RDtZQUN4RCx3REFBd0Q7WUFDeEQsb0RBQW9EO1lBQ3BELHdEQUF3RDtZQUN4RCx5REFBeUQ7WUFDekQsdURBQXVEO1lBQ3ZELHdEQUF3RDtZQUN4RCwwQkFBMEI7WUFDMUIsSUFBSSxzQkFBVyxFQUFFO2dCQUNoQixjQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7YUFDM0I7WUFFRCwyREFBMkQ7WUFDM0QsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FB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