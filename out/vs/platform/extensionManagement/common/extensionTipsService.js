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
    exports.AbstractNativeExtensionTipsService = exports.ExtensionTipsService = void 0;
    //#region Base Extension Tips Service
    let ExtensionTipsService = class ExtensionTipsService extends lifecycle_1.Disposable {
        constructor(fileService, productService) {
            super();
            this.fileService = fileService;
            this.productService = productService;
            this.allConfigBasedTips = new Map();
            if (this.productService.configBasedExtensionTips) {
                Object.entries(this.productService.configBasedExtensionTips).forEach(([, value]) => this.allConfigBasedTips.set(value.configPath, value));
            }
        }
        getConfigBasedTips(folder) {
            return this.getValidConfigBasedTips(folder);
        }
        async getImportantExecutableBasedTips() {
            return [];
        }
        async getOtherExecutableBasedTips() {
            return [];
        }
        async getValidConfigBasedTips(folder) {
            const result = [];
            for (const [configPath, tip] of this.allConfigBasedTips) {
                if (tip.configScheme && tip.configScheme !== folder.scheme) {
                    continue;
                }
                try {
                    const content = (await this.fileService.readFile((0, resources_1.joinPath)(folder, configPath))).value.toString();
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
    exports.ExtensionTipsService = ExtensionTipsService;
    exports.ExtensionTipsService = ExtensionTipsService = __decorate([
        __param(0, files_1.IFileService),
        __param(1, productService_1.IProductService)
    ], ExtensionTipsService);
    const promptedExecutableTipsStorageKey = 'extensionTips/promptedExecutableTips';
    const lastPromptedMediumImpExeTimeStorageKey = 'extensionTips/lastPromptedMediumImpExeTime';
    class AbstractNativeExtensionTipsService extends ExtensionTipsService {
        constructor(userHome, windowEvents, telemetryService, extensionManagementService, storageService, extensionRecommendationNotificationService, fileService, productService) {
            super(fileService, productService);
            this.userHome = userHome;
            this.windowEvents = windowEvents;
            this.telemetryService = telemetryService;
            this.extensionManagementService = extensionManagementService;
            this.storageService = storageService;
            this.extensionRecommendationNotificationService = extensionRecommendationNotificationService;
            this.highImportanceExecutableTips = new Map();
            this.mediumImportanceExecutableTips = new Map();
            this.allOtherExecutableTips = new Map();
            this.highImportanceTipsByExe = new Map();
            this.mediumImportanceTipsByExe = new Map();
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
                        this.highImportanceExecutableTips.set(key, { exeFriendlyName: exeBasedExtensionTip.friendlyName, windowsPath: exeBasedExtensionTip.windowsPath, recommendations: highImportanceRecommendations });
                    }
                    if (mediumImportanceRecommendations.length) {
                        this.mediumImportanceExecutableTips.set(key, { exeFriendlyName: exeBasedExtensionTip.friendlyName, windowsPath: exeBasedExtensionTip.windowsPath, recommendations: mediumImportanceRecommendations });
                    }
                    if (otherRecommendations.length) {
                        this.allOtherExecutableTips.set(key, { exeFriendlyName: exeBasedExtensionTip.friendlyName, windowsPath: exeBasedExtensionTip.windowsPath, recommendations: otherRecommendations });
                    }
                });
            }
            /*
                3s has come out to be the good number to fetch and prompt important exe based recommendations
                Also fetch important exe based recommendations for reporting telemetry
            */
            this._register((0, async_1.disposableTimeout)(async () => {
                await this.collectTips();
                this.promptHighImportanceExeBasedTip();
                this.promptMediumImportanceExeBasedTip();
            }, 3000));
        }
        async getImportantExecutableBasedTips() {
            const highImportanceExeTips = await this.getValidExecutableBasedExtensionTips(this.highImportanceExecutableTips);
            const mediumImportanceExeTips = await this.getValidExecutableBasedExtensionTips(this.mediumImportanceExecutableTips);
            return [...highImportanceExeTips, ...mediumImportanceExeTips];
        }
        getOtherExecutableBasedTips() {
            return this.getValidExecutableBasedExtensionTips(this.allOtherExecutableTips);
        }
        async collectTips() {
            const highImportanceExeTips = await this.getValidExecutableBasedExtensionTips(this.highImportanceExecutableTips);
            const mediumImportanceExeTips = await this.getValidExecutableBasedExtensionTips(this.mediumImportanceExecutableTips);
            const local = await this.extensionManagementService.getInstalled();
            this.highImportanceTipsByExe = this.groupImportantTipsByExe(highImportanceExeTips, local);
            this.mediumImportanceTipsByExe = this.groupImportantTipsByExe(mediumImportanceExeTips, local);
        }
        groupImportantTipsByExe(importantExeBasedTips, local) {
            const importantExeBasedRecommendations = new Map();
            importantExeBasedTips.forEach(tip => importantExeBasedRecommendations.set(tip.extensionId.toLowerCase(), tip));
            const { installed, uninstalled: recommendations } = this.groupByInstalled([...importantExeBasedRecommendations.keys()], local);
            /* Log installed and uninstalled exe based recommendations */
            for (const extensionId of installed) {
                const tip = importantExeBasedRecommendations.get(extensionId);
                if (tip) {
                    this.telemetryService.publicLog2('exeExtensionRecommendations:alreadyInstalled', { extensionId, exeName: tip.exeName });
                }
            }
            for (const extensionId of recommendations) {
                const tip = importantExeBasedRecommendations.get(extensionId);
                if (tip) {
                    this.telemetryService.publicLog2('exeExtensionRecommendations:notInstalled', { extensionId, exeName: tip.exeName });
                }
            }
            const promptedExecutableTips = this.getPromptedExecutableTips();
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
        promptHighImportanceExeBasedTip() {
            if (this.highImportanceTipsByExe.size === 0) {
                return;
            }
            const [exeName, tips] = [...this.highImportanceTipsByExe.entries()][0];
            this.promptExeRecommendations(tips)
                .then(result => {
                switch (result) {
                    case "reacted" /* RecommendationsNotificationResult.Accepted */:
                        this.addToRecommendedExecutables(tips[0].exeName, tips);
                        break;
                    case "ignored" /* RecommendationsNotificationResult.Ignored */:
                        this.highImportanceTipsByExe.delete(exeName);
                        break;
                    case "incompatibleWindow" /* RecommendationsNotificationResult.IncompatibleWindow */: {
                        // Recommended in incompatible window. Schedule the prompt after active window change
                        const onActiveWindowChange = event_1.Event.once(event_1.Event.latch(event_1.Event.any(this.windowEvents.onDidOpenWindow, this.windowEvents.onDidFocusWindow)));
                        this._register(onActiveWindowChange(() => this.promptHighImportanceExeBasedTip()));
                        break;
                    }
                    case "toomany" /* RecommendationsNotificationResult.TooMany */: {
                        // Too many notifications. Schedule the prompt after one hour
                        const disposable = this._register((0, async_1.disposableTimeout)(() => { disposable.dispose(); this.promptHighImportanceExeBasedTip(); }, 60 * 60 * 1000 /* 1 hour */));
                        break;
                    }
                }
            });
        }
        /**
         * Medium importance tips are prompted once per 7 days
         */
        promptMediumImportanceExeBasedTip() {
            if (this.mediumImportanceTipsByExe.size === 0) {
                return;
            }
            const lastPromptedMediumExeTime = this.getLastPromptedMediumExeTime();
            const timeSinceLastPrompt = Date.now() - lastPromptedMediumExeTime;
            const promptInterval = 7 * 24 * 60 * 60 * 1000; // 7 Days
            if (timeSinceLastPrompt < promptInterval) {
                // Wait until interval and prompt
                const disposable = this._register((0, async_1.disposableTimeout)(() => { disposable.dispose(); this.promptMediumImportanceExeBasedTip(); }, promptInterval - timeSinceLastPrompt));
                return;
            }
            const [exeName, tips] = [...this.mediumImportanceTipsByExe.entries()][0];
            this.promptExeRecommendations(tips)
                .then(result => {
                switch (result) {
                    case "reacted" /* RecommendationsNotificationResult.Accepted */: {
                        // Accepted: Update the last prompted time and caches.
                        this.updateLastPromptedMediumExeTime(Date.now());
                        this.mediumImportanceTipsByExe.delete(exeName);
                        this.addToRecommendedExecutables(tips[0].exeName, tips);
                        // Schedule the next recommendation for next internval
                        const disposable1 = this._register((0, async_1.disposableTimeout)(() => { disposable1.dispose(); this.promptMediumImportanceExeBasedTip(); }, promptInterval));
                        break;
                    }
                    case "ignored" /* RecommendationsNotificationResult.Ignored */:
                        // Ignored: Remove from the cache and prompt next recommendation
                        this.mediumImportanceTipsByExe.delete(exeName);
                        this.promptMediumImportanceExeBasedTip();
                        break;
                    case "incompatibleWindow" /* RecommendationsNotificationResult.IncompatibleWindow */: {
                        // Recommended in incompatible window. Schedule the prompt after active window change
                        const onActiveWindowChange = event_1.Event.once(event_1.Event.latch(event_1.Event.any(this.windowEvents.onDidOpenWindow, this.windowEvents.onDidFocusWindow)));
                        this._register(onActiveWindowChange(() => this.promptMediumImportanceExeBasedTip()));
                        break;
                    }
                    case "toomany" /* RecommendationsNotificationResult.TooMany */: {
                        // Too many notifications. Schedule the prompt after one hour
                        const disposable2 = this._register((0, async_1.disposableTimeout)(() => { disposable2.dispose(); this.promptMediumImportanceExeBasedTip(); }, 60 * 60 * 1000 /* 1 hour */));
                        break;
                    }
                }
            });
        }
        async promptExeRecommendations(tips) {
            const installed = await this.extensionManagementService.getInstalled(1 /* ExtensionType.User */);
            const extensions = tips
                .filter(tip => !tip.whenNotInstalled || tip.whenNotInstalled.every(id => installed.every(local => !(0, extensionManagementUtil_1.areSameExtensions)(local.identifier, { id }))))
                .map(({ extensionId }) => extensionId.toLowerCase());
            return this.extensionRecommendationNotificationService.promptImportantExtensionsInstallNotification({ extensions, source: 3 /* RecommendationSource.EXE */, name: tips[0].exeFriendlyName, searchValue: `@exe:"${tips[0].exeName}"` });
        }
        getLastPromptedMediumExeTime() {
            let value = this.storageService.getNumber(lastPromptedMediumImpExeTimeStorageKey, -1 /* StorageScope.APPLICATION */);
            if (!value) {
                value = Date.now();
                this.updateLastPromptedMediumExeTime(value);
            }
            return value;
        }
        updateLastPromptedMediumExeTime(value) {
            this.storageService.store(lastPromptedMediumImpExeTimeStorageKey, value, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
        }
        getPromptedExecutableTips() {
            return JSON.parse(this.storageService.get(promptedExecutableTipsStorageKey, -1 /* StorageScope.APPLICATION */, '{}'));
        }
        addToRecommendedExecutables(exeName, tips) {
            const promptedExecutableTips = this.getPromptedExecutableTips();
            promptedExecutableTips[exeName] = tips.map(({ extensionId }) => extensionId.toLowerCase());
            this.storageService.store(promptedExecutableTipsStorageKey, JSON.stringify(promptedExecutableTips), -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
        }
        groupByInstalled(recommendationsToSuggest, local) {
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
        async getValidExecutableBasedExtensionTips(executableTips) {
            const result = [];
            const checkedExecutables = new Map();
            for (const exeName of executableTips.keys()) {
                const extensionTip = executableTips.get(exeName);
                if (!extensionTip || !(0, arrays_1.isNonEmptyArray)(extensionTip.recommendations)) {
                    continue;
                }
                const exePaths = [];
                if (platform_1.isWindows) {
                    if (extensionTip.windowsPath) {
                        exePaths.push(extensionTip.windowsPath.replace('%USERPROFILE%', () => process_1.env['USERPROFILE'])
                            .replace('%ProgramFiles(x86)%', () => process_1.env['ProgramFiles(x86)'])
                            .replace('%ProgramFiles%', () => process_1.env['ProgramFiles'])
                            .replace('%APPDATA%', () => process_1.env['APPDATA'])
                            .replace('%WINDIR%', () => process_1.env['WINDIR']));
                    }
                }
                else {
                    exePaths.push((0, path_1.join)('/usr/local/bin', exeName));
                    exePaths.push((0, path_1.join)('/usr/bin', exeName));
                    exePaths.push((0, path_1.join)(this.userHome.fsPath, exeName));
                }
                for (const exePath of exePaths) {
                    let exists = checkedExecutables.get(exePath);
                    if (exists === undefined) {
                        exists = await this.fileService.exists(uri_1.URI.file(exePath));
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
    exports.AbstractNativeExtensionTipsService = AbstractNativeExtensionTipsService;
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uVGlwc1NlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9leHRlbnNpb25NYW5hZ2VtZW50L2NvbW1vbi9leHRlbnNpb25UaXBzU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFzQmhHLHFDQUFxQztJQUU5QixJQUFNLG9CQUFvQixHQUExQixNQUFNLG9CQUFxQixTQUFRLHNCQUFVO1FBTW5ELFlBQ2UsV0FBNEMsRUFDekMsY0FBZ0Q7WUFFakUsS0FBSyxFQUFFLENBQUM7WUFIeUIsZ0JBQVcsR0FBWCxXQUFXLENBQWM7WUFDeEIsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBSmpELHVCQUFrQixHQUE2QyxJQUFJLEdBQUcsRUFBdUMsQ0FBQztZQU85SCxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsd0JBQXdCLEVBQUU7Z0JBQ2pELE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7YUFDMUk7UUFDRixDQUFDO1FBRUQsa0JBQWtCLENBQUMsTUFBVztZQUM3QixPQUFPLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM3QyxDQUFDO1FBRUQsS0FBSyxDQUFDLCtCQUErQjtZQUNwQyxPQUFPLEVBQUUsQ0FBQztRQUNYLENBQUM7UUFFRCxLQUFLLENBQUMsMkJBQTJCO1lBQ2hDLE9BQU8sRUFBRSxDQUFDO1FBQ1gsQ0FBQztRQUVPLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxNQUFXO1lBQ2hELE1BQU0s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