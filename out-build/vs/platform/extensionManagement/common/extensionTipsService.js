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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/base/common/uri", "vs/platform/files/common/files", "vs/platform/product/common/productService", "vs/base/common/async", "vs/base/common/event", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/process", "vs/platform/extensionManagement/common/extensionManagementUtil"], function (require, exports, arrays_1, lifecycle_1, resources_1, uri_1, files_1, productService_1, async_1, event_1, path_1, platform_1, process_1, extensionManagementUtil_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$D4b = exports.$C4b = void 0;
    //#region Base Extension Tips Service
    let $C4b = class $C4b extends lifecycle_1.$kc {
        constructor(b, c) {
            super();
            this.b = b;
            this.c = c;
            this.a = new Map();
            if (this.c.configBasedExtensionTips) {
                Object.entries(this.c.configBasedExtensionTips).forEach(([, value]) => this.a.set(value.configPath, value));
            }
        }
        getConfigBasedTips(folder) {
            return this.f(folder);
        }
        async getImportantExecutableBasedTips() {
            return [];
        }
        async getOtherExecutableBasedTips() {
            return [];
        }
        async f(folder) {
            const result = [];
            for (const [configPath, tip] of this.a) {
                if (tip.configScheme && tip.configScheme !== folder.scheme) {
                    continue;
                }
                try {
                    const content = (await this.b.readFile((0, resources_1.$ig)(folder, configPath))).value.toString();
                    for (const [key, value] of Object.entries(tip.recommendations)) {
                        if (!value.contentPattern || new RegExp(value.contentPattern, 'mig').test(content)) {
                            result.push({
                                extensionId: key,
                                extensionName: value.name,
                                configName: tip.configName,
                                important: !!value.important,
                                isExtensionPack: !!value.isExtensionPack,
                                whenNotInstalled: value.whenNotInstalled
                            });
                        }
                    }
                }
                catch (error) { /* Ignore */ }
            }
            return result;
        }
    };
    exports.$C4b = $C4b;
    exports.$C4b = $C4b = __decorate([
        __param(0, files_1.$6j),
        __param(1, productService_1.$kj)
    ], $C4b);
    const promptedExecutableTipsStorageKey = 'extensionTips/promptedExecutableTips';
    const lastPromptedMediumImpExeTimeStorageKey = 'extensionTips/lastPromptedMediumImpExeTime';
    class $D4b extends $C4b {
        constructor(r, s, t, u, w, z, fileService, productService) {
            super(fileService, productService);
            this.r = r;
            this.s = s;
            this.t = t;
            this.u = u;
            this.w = w;
            this.z = z;
            this.g = new Map();
            this.h = new Map();
            this.j = new Map();
            this.m = new Map();
            this.n = new Map();
            if (productService.exeBasedExtensionTips) {
                Object.entries(productService.exeBasedExtensionTips).forEach(([key, exeBasedExtensionTip]) => {
                    const highImportanceRecommendations = [];
                    const mediumImportanceRecommendations = [];
                    const otherRecommendations = [];
                    Object.entries(exeBasedExtensionTip.recommendations).forEach(([extensionId, value]) => {
                        if (value.important) {
                            if (exeBasedExtensionTip.important) {
                                highImportanceRecommendations.push({ extensionId, extensionName: value.name, isExtensionPack: !!value.isExtensionPack });
                            }
                            else {
                                mediumImportanceRecommendations.push({ extensionId, extensionName: value.name, isExtensionPack: !!value.isExtensionPack });
                            }
                        }
                        else {
                            otherRecommendations.push({ extensionId, extensionName: value.name, isExtensionPack: !!value.isExtensionPack });
                        }
                    });
                    if (highImportanceRecommendations.length) {
                        this.g.set(key, { exeFriendlyName: exeBasedExtensionTip.friendlyName, windowsPath: exeBasedExtensionTip.windowsPath, recommendations: highImportanceRecommendations });
                    }
                    if (mediumImportanceRecommendations.length) {
                        this.h.set(key, { exeFriendlyName: exeBasedExtensionTip.friendlyName, windowsPath: exeBasedExtensionTip.windowsPath, recommendations: mediumImportanceRecommendations });
                    }
                    if (otherRecommendations.length) {
                        this.j.set(key, { exeFriendlyName: exeBasedExtensionTip.friendlyName, windowsPath: exeBasedExtensionTip.windowsPath, recommendations: otherRecommendations });
                    }
                });
            }
            /*
                3s has come out to be the good number to fetch and prompt important exe based recommendations
                Also fetch important exe based recommendations for reporting telemetry
            */
            this.B((0, async_1.$Ig)(async () => {
                await this.C();
                this.F();
                this.G();
            }, 3000));
        }
        async getImportantExecutableBasedTips() {
            const highImportanceExeTips = await this.O(this.g);
            const mediumImportanceExeTips = await this.O(this.h);
            return [...highImportanceExeTips, ...mediumImportanceExeTips];
        }
        getOtherExecutableBasedTips() {
            return this.O(this.j);
        }
        async C() {
            const highImportanceExeTips = await this.O(this.g);
            const mediumImportanceExeTips = await this.O(this.h);
            const local = await this.u.getInstalled();
            this.m = this.D(highImportanceExeTips, local);
            this.n = this.D(mediumImportanceExeTips, local);
        }
        D(importantExeBasedTips, local) {
            const importantExeBasedRecommendations = new Map();
            importantExeBasedTips.forEach(tip => importantExeBasedRecommendations.set(tip.extensionId.toLowerCase(), tip));
            const { installed, uninstalled: recommendations } = this.N([...importantExeBasedRecommendations.keys()], local);
            /* Log installed and uninstalled exe based recommendations */
            for (const extensionId of installed) {
                const tip = importantExeBasedRecommendations.get(extensionId);
                if (tip) {
                    this.t.publicLog2('exeExtensionRecommendations:alreadyInstalled', { extensionId, exeName: tip.exeName });
                }
            }
            for (const extensionId of recommendations) {
                const tip = importantExeBasedRecommendations.get(extensionId);
                if (tip) {
                    this.t.publicLog2('exeExtensionRecommendations:notInstalled', { extensionId, exeName: tip.exeName });
                }
            }
            const promptedExecutableTips = this.L();
            const tipsByExe = new Map();
            for (const extensionId of recommendations) {
                const tip = importantExeBasedRecommendations.get(extensionId);
                if (tip && (!promptedExecutableTips[tip.exeName] || !promptedExecutableTips[tip.exeName].includes(tip.extensionId))) {
                    let tips = tipsByExe.get(tip.exeName);
                    if (!tips) {
                        tips = [];
                        tipsByExe.set(tip.exeName, tips);
                    }
                    tips.push(tip);
                }
            }
            return tipsByExe;
        }
        /**
         * High importance tips are prompted once per restart session
         */
        F() {
            if (this.m.size === 0) {
                return;
            }
            const [exeName, tips] = [...this.m.entries()][0];
            this.H(tips)
                .then(result => {
                switch (result) {
                    case "reacted" /* RecommendationsNotificationResult.Accepted */:
                        this.M(tips[0].exeName, tips);
                        break;
                    case "ignored" /* RecommendationsNotificationResult.Ignored */:
                        this.m.delete(exeName);
                        break;
                    case "incompatibleWindow" /* RecommendationsNotificationResult.IncompatibleWindow */: {
                        // Recommended in incompatible window. Schedule the prompt after active window change
                        const onActiveWindowChange = event_1.Event.once(event_1.Event.latch(event_1.Event.any(this.s.onDidOpenWindow, this.s.onDidFocusWindow)));
                        this.B(onActiveWindowChange(() => this.F()));
                        break;
                    }
                    case "toomany" /* RecommendationsNotificationResult.TooMany */: {
                        // Too many notifications. Schedule the prompt after one hour
                        const disposable = this.B((0, async_1.$Ig)(() => { disposable.dispose(); this.F(); }, 60 * 60 * 1000 /* 1 hour */));
                        break;
                    }
                }
            });
        }
        /**
         * Medium importance tips are prompted once per 7 days
         */
        G() {
            if (this.n.size === 0) {
                return;
            }
            const lastPromptedMediumExeTime = this.I();
            const timeSinceLastPrompt = Date.now() - lastPromptedMediumExeTime;
            const promptInterval = 7 * 24 * 60 * 60 * 1000; // 7 Days
            if (timeSinceLastPrompt < promptInterval) {
                // Wait until interval and prompt
                const disposable = this.B((0, async_1.$Ig)(() => { disposable.dispose(); this.G(); }, promptInterval - timeSinceLastPrompt));
                return;
            }
            const [exeName, tips] = [...this.n.entries()][0];
            this.H(tips)
                .then(result => {
                switch (result) {
                    case "reacted" /* RecommendationsNotificationResult.Accepted */: {
                        // Accepted: Update the last prompted time and caches.
                        this.J(Date.now());
                        this.n.delete(exeName);
                        this.M(tips[0].exeName, tips);
                        // Schedule the next recommendation for next internval
                        const disposable1 = this.B((0, async_1.$Ig)(() => { disposable1.dispose(); this.G(); }, promptInterval));
                        break;
                    }
                    case "ignored" /* RecommendationsNotificationResult.Ignored */:
                        // Ignored: Remove from the cache and prompt next recommendation
                        this.n.delete(exeName);
                        this.G();
                        break;
                    case "incompatibleWindow" /* RecommendationsNotificationResult.IncompatibleWindow */: {
                        // Recommended in incompatible window. Schedule the prompt after active window change
                        const onActiveWindowChange = event_1.Event.once(event_1.Event.latch(event_1.Event.any(this.s.onDidOpenWindow, this.s.onDidFocusWindow)));
                        this.B(onActiveWindowChange(() => this.G()));
                        break;
                    }
                    case "toomany" /* RecommendationsNotificationResult.TooMany */: {
                        // Too many notifications. Schedule the prompt after one hour
                        const disposable2 = this.B((0, async_1.$Ig)(() => { disposable2.dispose(); this.G(); }, 60 * 60 * 1000 /* 1 hour */));
                        break;
                    }
                }
            });
        }
        async H(tips) {
            const installed = await this.u.getInstalled(1 /* ExtensionType.User */);
            const extensions = tips
                .filter(tip => !tip.whenNotInstalled || tip.whenNotInstalled.every(id => installed.every(local => !(0, extensionManagementUtil_1.$po)(local.identifier, { id }))))
                .map(({ extensionId }) => extensionId.toLowerCase());
            return this.z.promptImportantExtensionsInstallNotification({ extensions, source: 3 /* RecommendationSource.EXE */, name: tips[0].exeFriendlyName, searchValue: `@exe:"${tips[0].exeName}"` });
        }
        I() {
            let value = this.w.getNumber(lastPromptedMediumImpExeTimeStorageKey, -1 /* StorageScope.APPLICATION */);
            if (!value) {
                value = Date.now();
                this.J(value);
            }
            return value;
        }
        J(value) {
            this.w.store(lastPromptedMediumImpExeTimeStorageKey, value, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
        }
        L() {
            return JSON.parse(this.w.get(promptedExecutableTipsStorageKey, -1 /* StorageScope.APPLICATION */, '{}'));
        }
        M(exeName, tips) {
            const promptedExecutableTips = this.L();
            promptedExecutableTips[exeName] = tips.map(({ extensionId }) => extensionId.toLowerCase());
            this.w.store(promptedExecutableTipsStorageKey, JSON.stringify(promptedExecutableTips), -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
        }
        N(recommendationsToSuggest, local) {
            const installed = [], uninstalled = [];
            const installedExtensionsIds = local.reduce((result, i) => { result.add(i.identifier.id.toLowerCase()); return result; }, new Set());
            recommendationsToSuggest.forEach(id => {
                if (installedExtensionsIds.has(id.toLowerCase())) {
                    installed.push(id);
                }
                else {
                    uninstalled.push(id);
                }
            });
            return { installed, uninstalled };
        }
        async O(executableTips) {
            const result = [];
            const checkedExecutables = new Map();
            for (const exeName of executableTips.keys()) {
                const extensionTip = executableTips.get(exeName);
                if (!extensionTip || !(0, arrays_1.$Jb)(extensionTip.recommendations)) {
                    continue;
                }
                const exePaths = [];
                if (platform_1.$i) {
                    if (extensionTip.windowsPath) {
                        exePaths.push(extensionTip.windowsPath.replace('%USERPROFILE%', () => process_1.env['USERPROFILE'])
                            .replace('%ProgramFiles(x86)%', () => process_1.env['ProgramFiles(x86)'])
                            .replace('%ProgramFiles%', () => process_1.env['ProgramFiles'])
                            .replace('%APPDATA%', () => process_1.env['APPDATA'])
                            .replace('%WINDIR%', () => process_1.env['WINDIR']));
                    }
                }
                else {
                    exePaths.push((0, path_1.$9d)('/usr/local/bin', exeName));
                    exePaths.push((0, path_1.$9d)('/usr/bin', exeName));
                    exePaths.push((0, path_1.$9d)(this.r.fsPath, exeName));
                }
                for (const exePath of exePaths) {
                    let exists = checkedExecutables.get(exePath);
                    if (exists === undefined) {
                        exists = await this.b.exists(uri_1.URI.file(exePath));
                        checkedExecutables.set(exePath, exists);
                    }
                    if (exists) {
                        for (const { extensionId, extensionName, isExtensionPack, whenNotInstalled } of extensionTip.recommendations) {
                            result.push({
                                extensionId,
                                extensionName,
                                isExtensionPack,
                                exeName,
                                exeFriendlyName: extensionTip.exeFriendlyName,
                                windowsPath: extensionTip.windowsPath,
                                whenNotInstalled: whenNotInstalled
                            });
                        }
                    }
                }
            }
            return result;
        }
    }
    exports.$D4b = $D4b;
});
//#endregion
//# sourceMappingURL=extensionTipsService.js.map