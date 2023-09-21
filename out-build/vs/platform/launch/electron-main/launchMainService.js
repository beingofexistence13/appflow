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
    exports.$k6b = exports.$j6b = exports.ID = void 0;
    exports.ID = 'launchMainService';
    exports.$j6b = (0, instantiation_1.$Bh)(exports.ID);
    let $k6b = class $k6b {
        constructor(a, b, c, d) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
        }
        async start(args, userEnv) {
            this.a.trace('Received data from other instance: ', args, userEnv);
            // macOS: Electron > 7.x changed its behaviour to not
            // bring the application to the foreground when a window
            // is focused programmatically. Only via `app.focus` and
            // the option `steal: true` can you get the previous
            // behaviour back. The only reason to use this option is
            // when a window is getting focused while the application
            // is not in the foreground and since we got instructed
            // to open a new window from another instance, we ensure
            // that the app has focus.
            if (platform_1.$j) {
                electron_1.app.focus({ steal: true });
            }
            // Check early for open-url which is handled in URL service
            const urlsToOpen = this.e(args);
            if (urlsToOpen.length) {
                let whenWindowReady = Promise.resolve();
                // Create a window if there is none
                if (this.b.getWindowCount() === 0) {
                    const window = (0, arrays_1.$Mb)(await this.b.openEmptyWindow({ context: 4 /* OpenContext.DESKTOP */ }));
                    if (window) {
                        whenWindowReady = window.ready();
                    }
                }
                // Make sure a window is open, ready to receive the url event
                whenWindowReady.then(() => {
                    for (const { uri, originalUrl } of urlsToOpen) {
                        this.c.open(uri, { originalUrl });
                    }
                });
            }
            // Otherwise handle in windows service
            else {
                return this.f(args, userEnv);
            }
        }
        e(args) {
            if (args['open-url'] && args._urls && args._urls.length > 0) {
                // --open-url must contain -- followed by the url(s)
                // process.argv is used over args._ as args._ are resolved to file paths at this point
                return (0, arrays_1.$Fb)(args._urls
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
        async f(args, userEnv) {
            const context = (0, argvHelper_1.$Gl)(userEnv) ? 0 /* OpenContext.CLI */ : 4 /* OpenContext.DESKTOP */;
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
                await this.b.openExtensionDevelopmentHostWindow(args.extensionDevelopmentPath, baseConfig);
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
                    const windowConfig = this.d.getValue('window');
                    const openWithoutArgumentsInNewWindowConfig = windowConfig?.openWithoutArgumentsInNewWindow || 'default' /* default */;
                    switch (openWithoutArgumentsInNewWindowConfig) {
                        case 'on':
                            openNewWindow = true;
                            break;
                        case 'off':
                            openNewWindow = false;
                            break;
                        default:
                            openNewWindow = !platform_1.$j; // prefer to restore running instance on macOS
                    }
                }
                // Open new Window
                if (openNewWindow) {
                    usedWindows = await this.b.open({
                        ...baseConfig,
                        forceNewWindow: true,
                        forceEmpty: true
                    });
                }
                // Focus existing window or open if none opened
                else {
                    const lastActive = this.b.getLastActiveWindow();
                    if (lastActive) {
                        this.b.openExistingWindow(lastActive, baseConfig);
                        usedWindows = [lastActive];
                    }
                    else {
                        usedWindows = await this.b.open({
                            ...baseConfig,
                            forceEmpty: true
                        });
                    }
                }
            }
            // Start with file/folder arguments
            else {
                usedWindows = await this.b.open({
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
            this.a.trace('Received request for process ID from other instance.');
            return process.pid;
        }
    };
    exports.$k6b = $k6b;
    exports.$k6b = $k6b = __decorate([
        __param(0, log_1.$5i),
        __param(1, windows_1.$B5b),
        __param(2, url_1.$IT),
        __param(3, configuration_1.$8h)
    ], $k6b);
});
//# sourceMappingURL=launchMainService.js.map