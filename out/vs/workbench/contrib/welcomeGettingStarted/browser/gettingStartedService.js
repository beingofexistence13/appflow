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
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/base/common/event", "vs/platform/storage/common/storage", "vs/workbench/common/memento", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/base/common/lifecycle", "vs/platform/userDataSync/common/userDataSync", "vs/base/common/uri", "vs/base/common/resources", "vs/base/common/network", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/contrib/welcomeGettingStarted/common/gettingStartedContent", "vs/workbench/services/assignment/common/assignmentService", "vs/workbench/services/host/browser/host", "vs/platform/configuration/common/configuration", "vs/base/common/linkedText", "vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedExtensionPoint", "vs/platform/instantiation/common/extensions", "vs/base/common/path", "vs/base/common/arrays", "vs/workbench/common/views", "vs/nls", "vs/platform/telemetry/common/telemetry", "vs/workbench/services/extensions/common/workspaceContains", "vs/platform/workspace/common/workspace", "vs/base/common/cancellation", "vs/workbench/services/extensionManagement/common/extensionManagement"], function (require, exports, instantiation_1, event_1, storage_1, memento_1, actions_1, commands_1, contextkey_1, lifecycle_1, userDataSync_1, uri_1, resources_1, network_1, extensionManagement_1, gettingStartedContent_1, assignmentService_1, host_1, configuration_1, linkedText_1, gettingStartedExtensionPoint_1, extensions_1, path_1, arrays_1, views_1, nls_1, telemetry_1, workspaceContains_1, workspace_1, cancellation_1, extensionManagement_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.convertInternalMediaPathToFileURI = exports.WalkthroughsService = exports.walkthroughMetadataConfigurationKey = exports.hiddenEntriesConfigurationKey = exports.IWalkthroughsService = exports.HasMultipleNewFileEntries = void 0;
    exports.HasMultipleNewFileEntries = new contextkey_1.RawContextKey('hasMultipleNewFileEntries', false);
    exports.IWalkthroughsService = (0, instantiation_1.createDecorator)('walkthroughsService');
    exports.hiddenEntriesConfigurationKey = 'workbench.welcomePage.hiddenCategories';
    exports.walkthroughMetadataConfigurationKey = 'workbench.welcomePage.walkthroughMetadata';
    const BUILT_IN_SOURCE = (0, nls_1.localize)('builtin', "Built-In");
    // Show walkthrough as "new" for 7 days after first install
    const DAYS = 24 * 60 * 60 * 1000;
    const NEW_WALKTHROUGH_TIME = 7 * DAYS;
    let WalkthroughsService = class WalkthroughsService extends lifecycle_1.Disposable {
        constructor(storageService, commandService, instantiationService, workspaceContextService, contextService, userDataSyncEnablementService, configurationService, extensionManagementService, hostService, viewsService, telemetryService, tasExperimentService) {
            super();
            this.storageService = storageService;
            this.commandService = commandService;
            this.instantiationService = instantiationService;
            this.workspaceContextService = workspaceContextService;
            this.contextService = contextService;
            this.userDataSyncEnablementService = userDataSyncEnablementService;
            this.configurationService = configurationService;
            this.extensionManagementService = extensionManagementService;
            this.hostService = hostService;
            this.viewsService = viewsService;
            this.telemetryService = telemetryService;
            this.tasExperimentService = tasExperimentService;
            this._onDidAddWalkthrough = new event_1.Emitter();
            this.onDidAddWalkthrough = this._onDidAddWalkthrough.event;
            this._onDidRemoveWalkthrough = new event_1.Emitter();
            this.onDidRemoveWalkthrough = this._onDidRemoveWalkthrough.event;
            this._onDidChangeWalkthrough = new event_1.Emitter();
            this.onDidChangeWalkthrough = this._onDidChangeWalkthrough.event;
            this._onDidProgressStep = new event_1.Emitter();
            this.onDidProgressStep = this._onDidProgressStep.event;
            this.sessionEvents = new Set();
            this.completionListeners = new Map();
            this.gettingStartedContributions = new Map();
            this.steps = new Map();
            this.sessionInstalledExtensions = new Set();
            this.categoryVisibilityContextKeys = new Set();
            this.stepCompletionContextKeyExpressions = new Set();
            this.stepCompletionContextKeys = new Set();
            this.metadata = new Map(JSON.parse(this.storageService.get(exports.walkthroughMetadataConfigurationKey, 0 /* StorageScope.PROFILE */, '[]')));
            this.memento = new memento_1.Memento('gettingStartedService', this.storageService);
            this.stepProgress = this.memento.getMemento(0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            this.initCompletionEventListeners();
            exports.HasMultipleNewFileEntries.bindTo(this.contextService).set(false);
            this.registerWalkthroughs();
        }
        registerWalkthroughs() {
            gettingStartedContent_1.walkthroughs.forEach(async (category, index) => {
                this._registerWalkthrough({
                    ...category,
                    icon: { type: 'icon', icon: category.icon },
                    order: gettingStartedContent_1.walkthroughs.length - index,
                    source: BUILT_IN_SOURCE,
                    when: contextkey_1.ContextKeyExpr.deserialize(category.when) ?? contextkey_1.ContextKeyExpr.true(),
                    steps: category.content.steps.map((step, index) => {
                        return ({
                            ...step,
                            completionEvents: step.completionEvents ?? [],
                            description: parseDescription(step.description),
                            category: category.id,
                            order: index,
                            when: contextkey_1.ContextKeyExpr.deserialize(step.when) ?? contextkey_1.ContextKeyExpr.true(),
                            media: step.media.type === 'image'
                                ? {
                                    type: 'image',
                                    altText: step.media.altText,
                                    path: convertInternalMediaPathsToBrowserURIs(step.media.path)
                                }
                                : step.media.type === 'svg'
                                    ? {
                                        type: 'svg',
                                        altText: step.media.altText,
                                        path: (0, exports.convertInternalMediaPathToFileURI)(step.media.path).with({ query: JSON.stringify({ moduleId: 'vs/workbench/contrib/welcomeGettingStarted/common/media/' + step.media.path }) })
                                    }
                                    : {
                                        type: 'markdown',
                                        path: (0, exports.convertInternalMediaPathToFileURI)(step.media.path).with({ query: JSON.stringify({ moduleId: 'vs/workbench/contrib/welcomeGettingStarted/common/media/' + step.media.path }) }),
                                        base: network_1.FileAccess.asFileUri('vs/workbench/contrib/welcomeGettingStarted/common/media/'),
                                        root: network_1.FileAccess.asFileUri('vs/workbench/contrib/welcomeGettingStarted/common/media/'),
                                    },
                        });
                    })
                });
            });
            gettingStartedExtensionPoint_1.walkthroughsExtensionPoint.setHandler((_, { added, removed }) => {
                added.map(e => this.registerExtensionWalkthroughContributions(e.description));
                removed.map(e => this.unregisterExtensionWalkthroughContributions(e.description));
            });
        }
        initCompletionEventListeners() {
            this._register(this.commandService.onDidExecuteCommand(command => this.progressByEvent(`onCommand:${command.commandId}`)));
            this.extensionManagementService.getInstalled().then(installed => {
                installed.forEach(ext => this.progressByEvent(`extensionInstalled:${ext.identifier.id.toLowerCase()}`));
            });
            this._register(this.extensionManagementService.onDidInstallExtensions(async (result) => {
                const hadLastFoucs = await this.hostService.hadLastFocus();
                for (const e of result) {
                    const skipWalkthrough = e?.context?.[extensionManagement_1.EXTENSION_INSTALL_SKIP_WALKTHROUGH_CONTEXT] || e?.context?.[extensionManagement_1.EXTENSION_INSTALL_DEP_PACK_CONTEXT];
                    // If the window had last focus and the install didn't specify to skip the walkthrough
                    // Then add it to the sessionInstallExtensions to be opened
                    if (hadLastFoucs && !skipWalkthrough) {
                        this.sessionInstalledExtensions.add(e.identifier.id.toLowerCase());
                    }
                    this.progressByEvent(`extensionInstalled:${e.identifier.id.toLowerCase()}`);
                }
            }));
            this._register(this.contextService.onDidChangeContext(event => {
                if (event.affectsSome(this.stepCompletionContextKeys)) {
                    this.stepCompletionContextKeyExpressions.forEach(expression => {
                        if (event.affectsSome(new Set(expression.keys())) && this.contextService.contextMatchesRules(expression)) {
                            this.progressByEvent(`onContext:` + expression.serialize());
                        }
                    });
                }
            }));
            this._register(this.viewsService.onDidChangeViewVisibility(e => {
                if (e.visible) {
                    this.progressByEvent('onView:' + e.id);
                }
            }));
            this._register(this.configurationService.onDidChangeConfiguration(e => {
                e.affectedKeys.forEach(key => { this.progressByEvent('onSettingChanged:' + key); });
            }));
            if (this.userDataSyncEnablementService.isEnabled()) {
                this.progressByEvent('onEvent:sync-enabled');
            }
            this._register(this.userDataSyncEnablementService.onDidChangeEnablement(() => {
                if (this.userDataSyncEnablementService.isEnabled()) {
                    this.progressByEvent('onEvent:sync-enabled');
                }
            }));
        }
        markWalkthroughOpened(id) {
            const walkthrough = this.gettingStartedContributions.get(id);
            const prior = this.metadata.get(id);
            if (prior && walkthrough) {
                this.metadata.set(id, { ...prior, manaullyOpened: true, stepIDs: walkthrough.steps.map(s => s.id) });
            }
            this.storageService.store(exports.walkthroughMetadataConfigurationKey, JSON.stringify([...this.metadata.entries()]), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
        }
        async registerExtensionWalkthroughContributions(extension) {
            const convertExtensionPathToFileURI = (path) => path.startsWith('https://')
                ? uri_1.URI.parse(path, true)
                : network_1.FileAccess.uriToFileUri((0, resources_1.joinPath)(extension.extensionLocation, path));
            const convertExtensionRelativePathsToBrowserURIs = (path) => {
                const convertPath = (path) => path.startsWith('https://')
                    ? uri_1.URI.parse(path, true)
                    : network_1.FileAccess.uriToBrowserUri((0, resources_1.joinPath)(extension.extensionLocation, path));
                if (typeof path === 'string') {
                    const converted = convertPath(path);
                    return { hcDark: converted, hcLight: converted, dark: converted, light: converted };
                }
                else {
                    return {
                        hcDark: convertPath(path.hc),
                        hcLight: convertPath(path.hcLight ?? path.light),
                        light: convertPath(path.light),
                        dark: convertPath(path.dark)
                    };
                }
            };
            if (!(extension.contributes?.walkthroughs?.length)) {
                return;
            }
            let sectionToOpen;
            let sectionToOpenIndex = Math.min(); // '+Infinity';
            await Promise.all(extension.contributes?.walkthroughs?.map(async (walkthrough, index) => {
                const categoryID = extension.identifier.value + '#' + walkthrough.id;
                const isNewlyInstalled = !this.metadata.get(categoryID);
                if (isNewlyInstalled) {
                    this.metadata.set(categoryID, { firstSeen: +new Date(), stepIDs: walkthrough.steps?.map(s => s.id) ?? [], manaullyOpened: false });
                }
                const override = await Promise.race([
                    this.tasExperimentService?.getTreatment(`gettingStarted.overrideCategory.${extension.identifier.value + '.' + walkthrough.id}.when`),
                    new Promise(resolve => setTimeout(() => resolve(walkthrough.when), 5000))
                ]);
                if (this.sessionInstalledExtensions.has(extension.identifier.value.toLowerCase())
                    && this.contextService.contextMatchesRules(contextkey_1.ContextKeyExpr.deserialize(override ?? walkthrough.when) ?? contextkey_1.ContextKeyExpr.true())) {
                    this.sessionInstalledExtensions.delete(extension.identifier.value.toLowerCase());
                    if (index < sectionToOpenIndex && isNewlyInstalled) {
                        sectionToOpen = categoryID;
                        sectionToOpenIndex = index;
                    }
                }
                const steps = (walkthrough.steps ?? []).map((step, index) => {
                    const description = parseDescription(step.description || '');
                    const fullyQualifiedID = extension.identifier.value + '#' + walkthrough.id + '#' + step.id;
                    let media;
                    if (!step.media) {
                        throw Error('missing media in walkthrough step: ' + walkthrough.id + '@' + step.id);
                    }
                    if (step.media.image) {
                        const altText = step.media.altText;
                        if (altText === undefined) {
                            console.error('Walkthrough item:', fullyQualifiedID, 'is missing altText for its media element.');
                        }
                        media = { type: 'image', altText, path: convertExtensionRelativePathsToBrowserURIs(step.media.image) };
                    }
                    else if (step.media.markdown) {
                        media = {
                            type: 'markdown',
                            path: convertExtensionPathToFileURI(step.media.markdown),
                            base: convertExtensionPathToFileURI((0, path_1.dirname)(step.media.markdown)),
                            root: network_1.FileAccess.uriToFileUri(extension.extensionLocation),
                        };
                    }
                    else if (step.media.svg) {
                        media = {
                            type: 'svg',
                            path: convertExtensionPathToFileURI(step.media.svg),
                            altText: step.media.svg,
                        };
                    }
                    // Throw error for unknown walkthrough format
                    else {
                        throw new Error('Unknown walkthrough format detected for ' + fullyQualifiedID);
                    }
                    return ({
                        description,
                        media,
                        completionEvents: step.completionEvents?.filter(x => typeof x === 'string') ?? [],
                        id: fullyQualifiedID,
                        title: step.title,
                        when: contextkey_1.ContextKeyExpr.deserialize(step.when) ?? contextkey_1.ContextKeyExpr.true(),
                        category: categoryID,
                        order: index,
                    });
                });
                let isFeatured = false;
                if (walkthrough.featuredFor) {
                    const folders = this.workspaceContextService.getWorkspace().folders.map(f => f.uri);
                    const token = new cancellation_1.CancellationTokenSource();
                    setTimeout(() => token.cancel(), 2000);
                    isFeatured = await this.instantiationService.invokeFunction(a => (0, workspaceContains_1.checkGlobFileExists)(a, folders, walkthrough.featuredFor, token.token));
                }
                const iconStr = walkthrough.icon ?? extension.icon;
                const walkthoughDescriptor = {
                    description: walkthrough.description,
                    title: walkthrough.title,
                    id: categoryID,
                    isFeatured,
                    source: extension.displayName ?? extension.name,
                    order: 0,
                    steps,
                    icon: {
                        type: 'image',
                        path: iconStr
                            ? network_1.FileAccess.uriToBrowserUri((0, resources_1.joinPath)(extension.extensionLocation, iconStr)).toString(true)
                            : extensionManagement_2.DefaultIconPath
                    },
                    when: contextkey_1.ContextKeyExpr.deserialize(override ?? walkthrough.when) ?? contextkey_1.ContextKeyExpr.true(),
                };
                this._registerWalkthrough(walkthoughDescriptor);
                this._onDidAddWalkthrough.fire(this.resolveWalkthrough(walkthoughDescriptor));
            }));
            this.storageService.store(exports.walkthroughMetadataConfigurationKey, JSON.stringify([...this.metadata.entries()]), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            if (sectionToOpen && this.configurationService.getValue('workbench.welcomePage.walkthroughs.openOnInstall')) {
                this.telemetryService.publicLog2('gettingStarted.didAutoOpenWalkthrough', { id: sectionToOpen });
                this.commandService.executeCommand('workbench.action.openWalkthrough', sectionToOpen, true);
            }
        }
        unregisterExtensionWalkthroughContributions(extension) {
            if (!(extension.contributes?.walkthroughs?.length)) {
                return;
            }
            extension.contributes?.walkthroughs?.forEach(section => {
                const categoryID = extension.identifier.value + '#' + section.id;
                section.steps.forEach(step => {
                    const fullyQualifiedID = extension.identifier.value + '#' + section.id + '#' + step.id;
                    this.steps.delete(fullyQualifiedID);
                });
                this.gettingStartedContributions.delete(categoryID);
                this._onDidRemoveWalkthrough.fire(categoryID);
            });
        }
        getWalkthrough(id) {
            const walkthrough = this.gettingStartedContributions.get(id);
            if (!walkthrough) {
                throw Error('Trying to get unknown walkthrough: ' + id);
            }
            return this.resolveWalkthrough(walkthrough);
        }
        getWalkthroughs() {
            const registeredCategories = [...this.gettingStartedContributions.values()];
            const categoriesWithCompletion = registeredCategories
                .map(category => {
                return {
                    ...category,
                    content: {
                        type: 'steps',
                        steps: category.steps
                    }
                };
            })
                .filter(category => category.content.type !== 'steps' || category.content.steps.length)
                .map(category => this.resolveWalkthrough(category));
            return categoriesWithCompletion;
        }
        resolveWalkthrough(category) {
            const stepsWithProgress = category.steps.map(step => this.getStepProgress(step));
            const hasOpened = this.metadata.get(category.id)?.manaullyOpened;
            const firstSeenDate = this.metadata.get(category.id)?.firstSeen;
            const isNew = firstSeenDate && firstSeenDate > (+new Date() - NEW_WALKTHROUGH_TIME);
            const lastStepIDs = this.metadata.get(category.id)?.stepIDs;
            const rawCategory = this.gettingStartedContributions.get(category.id);
            if (!rawCategory) {
                throw Error('Could not find walkthrough with id ' + category.id);
            }
            const currentStepIds = rawCategory.steps.map(s => s.id);
            const hasNewSteps = lastStepIDs && (currentStepIds.length !== lastStepIDs.length || currentStepIds.some((id, index) => id !== lastStepIDs[index]));
            let recencyBonus = 0;
            if (firstSeenDate) {
                const currentDate = +new Date();
                const timeSinceFirstSeen = currentDate - firstSeenDate;
                recencyBonus = Math.max(0, (NEW_WALKTHROUGH_TIME - timeSinceFirstSeen) / NEW_WALKTHROUGH_TIME);
            }
            return {
                ...category,
                recencyBonus,
                steps: stepsWithProgress,
                newItems: !!hasNewSteps,
                newEntry: !!(isNew && !hasOpened),
            };
        }
        getStepProgress(step) {
            return {
                ...step,
                done: false,
                ...this.stepProgress[step.id]
            };
        }
        progressStep(id) {
            const oldProgress = this.stepProgress[id];
            if (!oldProgress || oldProgress.done !== true) {
                this.stepProgress[id] = { done: true };
                this.memento.saveMemento();
                const step = this.getStep(id);
                if (!step) {
                    throw Error('Tried to progress unknown step');
                }
                this._onDidProgressStep.fire(this.getStepProgress(step));
            }
        }
        deprogressStep(id) {
            delete this.stepProgress[id];
            this.memento.saveMemento();
            const step = this.getStep(id);
            this._onDidProgressStep.fire(this.getStepProgress(step));
        }
        progressByEvent(event) {
            if (this.sessionEvents.has(event)) {
                return;
            }
            this.sessionEvents.add(event);
            this.completionListeners.get(event)?.forEach(id => this.progressStep(id));
        }
        registerWalkthrough(walkthoughDescriptor) {
            this._registerWalkthrough({
                ...walkthoughDescriptor,
                steps: walkthoughDescriptor.steps.map(step => ({ ...step, description: parseDescription(step.description) }))
            });
        }
        _registerWalkthrough(walkthroughDescriptor) {
            const oldCategory = this.gettingStartedContributions.get(walkthroughDescriptor.id);
            if (oldCategory) {
                console.error(`Skipping attempt to overwrite walkthrough. (${walkthroughDescriptor.id})`);
                return;
            }
            this.gettingStartedContributions.set(walkthroughDescriptor.id, walkthroughDescriptor);
            walkthroughDescriptor.steps.forEach(step => {
                if (this.steps.has(step.id)) {
                    throw Error('Attempting to register step with id ' + step.id + ' twice. Second is dropped.');
                }
                this.steps.set(step.id, step);
                step.when.keys().forEach(key => this.categoryVisibilityContextKeys.add(key));
                this.registerDoneListeners(step);
            });
            walkthroughDescriptor.when.keys().forEach(key => this.categoryVisibilityContextKeys.add(key));
        }
        registerDoneListeners(step) {
            if (step.doneOn) {
                console.error(`wakthrough step`, step, `uses deprecated 'doneOn' property. Adopt 'completionEvents' to silence this warning`);
                return;
            }
            if (!step.completionEvents.length) {
                step.completionEvents = (0, arrays_1.coalesce)((0, arrays_1.flatten)(step.description
                    .filter(linkedText => linkedText.nodes.length === 1) // only buttons
                    .map(linkedText => linkedText.nodes
                    .filter(((node) => typeof node !== 'string'))
                    .map(({ href }) => {
                    if (href.startsWith('command:')) {
                        return 'onCommand:' + href.slice('command:'.length, href.includes('?') ? href.indexOf('?') : undefined);
                    }
                    if (href.startsWith('https://') || href.startsWith('http://')) {
                        return 'onLink:' + href;
                    }
                    return undefined;
                }))));
            }
            if (!step.completionEvents.length) {
                step.completionEvents.push('stepSelected');
            }
            for (let event of step.completionEvents) {
                const [_, eventType, argument] = /^([^:]*):?(.*)$/.exec(event) ?? [];
                if (!eventType) {
                    console.error(`Unknown completionEvent ${event} when registering step ${step.id}`);
                    continue;
                }
                switch (eventType) {
                    case 'onLink':
                    case 'onEvent':
                    case 'onView':
                    case 'onSettingChanged':
                        break;
                    case 'onContext': {
                        const expression = contextkey_1.ContextKeyExpr.deserialize(argument);
                        if (expression) {
                            this.stepCompletionContextKeyExpressions.add(expression);
                            expression.keys().forEach(key => this.stepCompletionContextKeys.add(key));
                            event = eventType + ':' + expression.serialize();
                            if (this.contextService.contextMatchesRules(expression)) {
                                this.sessionEvents.add(event);
                            }
                        }
                        else {
                            console.error('Unable to parse context key expression:', expression, 'in walkthrough step', step.id);
                        }
                        break;
                    }
                    case 'onStepSelected':
                    case 'stepSelected':
                        event = 'stepSelected:' + step.id;
                        break;
                    case 'onCommand':
                        event = eventType + ':' + argument.replace(/^toSide:/, '');
                        break;
                    case 'onExtensionInstalled':
                    case 'extensionInstalled':
                        event = 'extensionInstalled:' + argument.toLowerCase();
                        break;
                    default:
                        console.error(`Unknown completionEvent ${event} when registering step ${step.id}`);
                        continue;
                }
                this.registerCompletionListener(event, step);
            }
        }
        registerCompletionListener(event, step) {
            if (!this.completionListeners.has(event)) {
                this.completionListeners.set(event, new Set());
            }
            this.completionListeners.get(event)?.add(step.id);
        }
        getStep(id) {
            const step = this.steps.get(id);
            if (!step) {
                throw Error('Attempting to access step which does not exist in registry ' + id);
            }
            return step;
        }
    };
    exports.WalkthroughsService = WalkthroughsService;
    exports.WalkthroughsService = WalkthroughsService = __decorate([
        __param(0, storage_1.IStorageService),
        __param(1, commands_1.ICommandService),
        __param(2, instantiation_1.IInstantiationService),
        __param(3, workspace_1.IWorkspaceContextService),
        __param(4, contextkey_1.IContextKeyService),
        __param(5, userDataSync_1.IUserDataSyncEnablementService),
        __param(6, configuration_1.IConfigurationService),
        __param(7, extensionManagement_1.IExtensionManagementService),
        __param(8, host_1.IHostService),
        __param(9, views_1.IViewsService),
        __param(10, telemetry_1.ITelemetryService),
        __param(11, assignmentService_1.IWorkbenchAssignmentService)
    ], WalkthroughsService);
    const parseDescription = (desc) => desc.split('\n').filter(x => x).map(text => (0, linkedText_1.parseLinkedText)(text));
    const convertInternalMediaPathToFileURI = (path) => path.startsWith('https://')
        ? uri_1.URI.parse(path, true)
        : network_1.FileAccess.asFileUri(`vs/workbench/contrib/welcomeGettingStarted/common/media/${path}`);
    exports.convertInternalMediaPathToFileURI = convertInternalMediaPathToFileURI;
    const convertInternalMediaPathToBrowserURI = (path) => path.startsWith('https://')
        ? uri_1.URI.parse(path, true)
        : network_1.FileAccess.asBrowserUri(`vs/workbench/contrib/welcomeGettingStarted/common/media/${path}`);
    const convertInternalMediaPathsToBrowserURIs = (path) => {
        if (typeof path === 'string') {
            const converted = convertInternalMediaPathToBrowserURI(path);
            return { hcDark: converted, hcLight: converted, dark: converted, light: converted };
        }
        else {
            return {
                hcDark: convertInternalMediaPathToBrowserURI(path.hc),
                hcLight: convertInternalMediaPathToBrowserURI(path.hcLight ?? path.light),
                light: convertInternalMediaPathToBrowserURI(path.light),
                dark: convertInternalMediaPathToBrowserURI(path.dark)
            };
        }
    };
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'resetGettingStartedProgress',
                category: { original: 'Developer', value: (0, nls_1.localize)('developer', "Developer") },
                title: { original: 'Reset Welcome Page Walkthrough Progress', value: (0, nls_1.localize)('resetWelcomePageWalkthroughProgress', "Reset Welcome Page Walkthrough Progress") },
                f1: true
            });
        }
        run(accessor) {
            const gettingStartedService = accessor.get(exports.IWalkthroughsService);
            const storageService = accessor.get(storage_1.IStorageService);
            storageService.store(exports.hiddenEntriesConfigurationKey, JSON.stringify([]), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            storageService.store(exports.walkthroughMetadataConfigurationKey, JSON.stringify([]), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            const memento = new memento_1.Memento('gettingStartedService', accessor.get(storage_1.IStorageService));
            const record = memento.getMemento(0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            for (const key in record) {
                if (Object.prototype.hasOwnProperty.call(record, key)) {
                    try {
                        gettingStartedService.deprogressStep(key);
                    }
                    catch (e) {
                        console.error(e);
                    }
                }
            }
            memento.saveMemento();
        }
    });
    (0, extensions_1.registerSingleton)(exports.IWalkthroughsService, WalkthroughsService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0dGluZ1N0YXJ0ZWRTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvd2VsY29tZUdldHRpbmdTdGFydGVkL2Jyb3dzZXIvZ2V0dGluZ1N0YXJ0ZWRTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWtDbkYsUUFBQSx5QkFBeUIsR0FBRyxJQUFJLDBCQUFhLENBQVUsMkJBQTJCLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFFM0YsUUFBQSxvQkFBb0IsR0FBRyxJQUFBLCtCQUFlLEVBQXVCLHFCQUFxQixDQUFDLENBQUM7SUFFcEYsUUFBQSw2QkFBNkIsR0FBRyx3Q0FBd0MsQ0FBQztJQUV6RSxRQUFBLG1DQUFtQyxHQUFHLDJDQUEyQyxDQUFDO0lBRy9GLE1BQU0sZUFBZSxHQUFHLElBQUEsY0FBUSxFQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQztJQWdFeEQsMkRBQTJEO0lBQzNELE1BQU0sSUFBSSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQztJQUNqQyxNQUFNLG9CQUFvQixHQUFHLENBQUMsR0FBRyxJQUFJLENBQUM7SUFFL0IsSUFBTSxtQkFBbUIsR0FBekIsTUFBTSxtQkFBb0IsU0FBUSxzQkFBVTtRQTZCbEQsWUFDa0IsY0FBZ0QsRUFDaEQsY0FBZ0QsRUFDMUMsb0JBQTRELEVBQ3pELHVCQUFrRSxFQUN4RSxjQUFtRCxFQUN2Qyw2QkFBOEUsRUFDdkYsb0JBQTRELEVBQ3RELDBCQUF3RSxFQUN2RixXQUEwQyxFQUN6QyxZQUE0QyxFQUN4QyxnQkFBb0QsRUFDMUMsb0JBQWtFO1lBRS9GLEtBQUssRUFBRSxDQUFDO1lBYjBCLG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQUMvQixtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFDekIseUJBQW9C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