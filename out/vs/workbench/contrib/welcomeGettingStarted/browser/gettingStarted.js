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
define(["require", "exports", "vs/nls", "vs/platform/instantiation/common/instantiation", "vs/base/common/lifecycle", "vs/base/common/types", "vs/base/browser/dom", "vs/platform/commands/common/commands", "vs/platform/product/common/productService", "vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedService", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/platform/keybinding/common/keybinding", "vs/platform/telemetry/common/telemetry", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedIcons", "vs/platform/opener/common/opener", "vs/base/common/uri", "vs/workbench/browser/parts/editor/editorPane", "vs/platform/storage/common/storage", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/workspaces/common/workspaces", "vs/platform/workspace/common/workspace", "vs/platform/label/common/label", "vs/base/common/labels", "vs/workbench/services/host/browser/host", "vs/base/common/platform", "vs/base/common/async", "vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedInput", "vs/workbench/services/editor/common/editorGroupsService", "vs/platform/quickinput/common/quickInput", "vs/base/browser/ui/button/button", "vs/platform/opener/browser/link", "vs/base/browser/formattedTextRenderer", "vs/workbench/contrib/webview/browser/webview", "vs/editor/common/languages/language", "vs/workbench/services/extensions/common/extensions", "vs/base/common/uuid", "vs/platform/files/common/files", "vs/base/common/marshalling", "vs/platform/notification/common/notification", "vs/base/common/network", "vs/base/common/arrays", "vs/workbench/services/themes/common/workbenchThemeService", "vs/workbench/contrib/welcomeGettingStarted/common/gettingStartedContent", "vs/editor/contrib/markdownRenderer/browser/markdownRenderer", "./gettingStartedList", "vs/base/browser/keyboardEvent", "vs/platform/telemetry/common/telemetryUtils", "vs/workbench/common/contextkeys", "vs/workbench/browser/actions/workspaceActions", "vs/workbench/browser/actions/windowActions", "vs/base/browser/ui/toggle/toggle", "vs/base/common/codicons", "vs/workbench/contrib/welcomeGettingStarted/browser/startupPage", "vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedDetailsRenderer", "vs/platform/accessibility/common/accessibility", "vs/base/browser/ui/iconLabel/iconLabels", "vs/platform/theme/browser/defaultStyles", "vs/workbench/contrib/welcomeGettingStarted/browser/featuredExtensionService", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensions/common/extensions", "vs/base/common/errors", "vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedColors", "vs/css!./media/gettingStarted"], function (require, exports, nls_1, instantiation_1, lifecycle_1, types_1, dom_1, commands_1, productService_1, gettingStartedService_1, themeService_1, themables_1, keybinding_1, telemetry_1, scrollableElement_1, gettingStartedIcons_1, opener_1, uri_1, editorPane_1, storage_1, configuration_1, contextkey_1, workspaces_1, workspace_1, label_1, labels_1, host_1, platform_1, async_1, gettingStartedInput_1, editorGroupsService_1, quickInput_1, button_1, link_1, formattedTextRenderer_1, webview_1, language_1, extensions_1, uuid_1, files_1, marshalling_1, notification_1, network_1, arrays_1, workbenchThemeService_1, gettingStartedContent_1, markdownRenderer_1, gettingStartedList_1, keyboardEvent_1, telemetryUtils_1, contextkeys_1, workspaceActions_1, windowActions_1, toggle_1, codicons_1, startupPage_1, gettingStartedDetailsRenderer_1, accessibility_1, iconLabels_1, defaultStyles_1, featuredExtensionService_1, extensionManagement_1, extensions_2, errors_1) {
    "use strict";
    var GettingStartedPage_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GettingStartedInputSerializer = exports.GettingStartedPage = exports.inWelcomeContext = exports.allWalkthroughsHiddenContext = void 0;
    const SLIDE_TRANSITION_TIME_MS = 250;
    const configurationKey = 'workbench.startupEditor';
    exports.allWalkthroughsHiddenContext = new contextkey_1.RawContextKey('allWalkthroughsHidden', false);
    exports.inWelcomeContext = new contextkey_1.RawContextKey('inWelcome', false);
    const parsedStartEntries = gettingStartedContent_1.startEntries.map((e, i) => ({
        command: e.content.command,
        description: e.description,
        icon: { type: 'icon', icon: e.icon },
        id: e.id,
        order: i,
        title: e.title,
        when: contextkey_1.ContextKeyExpr.deserialize(e.when) ?? contextkey_1.ContextKeyExpr.true()
    }));
    const REDUCED_MOTION_KEY = 'workbench.welcomePage.preferReducedMotion';
    let GettingStartedPage = class GettingStartedPage extends editorPane_1.EditorPane {
        static { GettingStartedPage_1 = this; }
        static { this.ID = 'gettingStartedPage'; }
        constructor(commandService, productService, keybindingService, gettingStartedService, featuredExtensionService, configurationService, telemetryService, languageService, fileService, openerService, themeService, storageService, extensionService, instantiationService, notificationService, groupsService, contextService, quickInputService, workspacesService, labelService, hostService, webviewService, workspaceContextService, accessibilityService, extensionManagementService) {
            super(GettingStartedPage_1.ID, telemetryService, themeService, storageService);
            this.commandService = commandService;
            this.productService = productService;
            this.keybindingService = keybindingService;
            this.gettingStartedService = gettingStartedService;
            this.featuredExtensionService = featuredExtensionService;
            this.configurationService = configurationService;
            this.languageService = languageService;
            this.fileService = fileService;
            this.openerService = openerService;
            this.storageService = storageService;
            this.extensionService = extensionService;
            this.instantiationService = instantiationService;
            this.notificationService = notificationService;
            this.groupsService = groupsService;
            this.quickInputService = quickInputService;
            this.workspacesService = workspacesService;
            this.labelService = labelService;
            this.hostService = hostService;
            this.webviewService = webviewService;
            this.workspaceContextService = workspaceContextService;
            this.accessibilityService = accessibilityService;
            this.extensionManagementService = extensionManagementService;
            this.inProgressScroll = Promise.resolve();
            this.dispatchListeners = new lifecycle_1.DisposableStore();
            this.stepDisposables = new lifecycle_1.DisposableStore();
            this.detailsPageDisposables = new lifecycle_1.DisposableStore();
            this.mediaDisposables = new lifecycle_1.DisposableStore();
            this.buildSlideThrottle = new async_1.Throttler();
            this.hasScrolledToFirstCategory = false;
            this.currentMediaComponent = undefined;
            this.currentMediaType = undefined;
            this.container = (0, dom_1.$)('.gettingStartedContainer', {
                role: 'document',
                tabindex: 0,
                'aria-label': (0, nls_1.localize)('welcomeAriaLabel', "Overview of how to get up to speed with your editor.")
            });
            this.stepMediaComponent = (0, dom_1.$)('.getting-started-media');
            this.stepMediaComponent.id = (0, uuid_1.generateUuid)();
            this.categoriesSlideDisposables = this._register(new lifecycle_1.DisposableStore());
            this.detailsRenderer = new gettingStartedDetailsRenderer_1.GettingStartedDetailsRenderer(this.fileService, this.notificationService, this.extensionService, this.languageService);
            this.contextService = this._register(contextService.createScoped(this.container));
            exports.inWelcomeContext.bindTo(this.contextService).set(true);
            this.gettingStartedCategories = this.gettingStartedService.getWalkthroughs();
            this.featuredExtensions = this.featuredExtensionService.getExtensions();
            this._register(this.dispatchListeners);
            this.buildSlideThrottle = new async_1.Throttler();
            const rerender = () => {
                this.gettingStartedCategories = this.gettingStartedService.getWalkthroughs();
                this.featuredExtensions = this.featuredExtensionService.getExtensions();
                this.buildSlideThrottle.queue(async () => await this.buildCategoriesSlide());
            };
            this._register(this.extensionManagementService.onDidInstallExtensions(async (result) => {
                for (const e of result) {
                    const installedFeaturedExtension = (await this.featuredExtensions)?.find(ext => extensions_2.ExtensionIdentifier.equals(ext.id, e.identifier.id));
                    if (installedFeaturedExtension) {
                        this.hideExtension(e.identifier.id);
                    }
                }
            }));
            this._register(this.gettingStartedService.onDidAddWalkthrough(rerender));
            this._register(this.gettingStartedService.onDidRemoveWalkthrough(rerender));
            this.recentlyOpened = this.workspacesService.getRecentlyOpened();
            this._register(workspacesService.onDidChangeRecentlyOpened(() => {
                this.recentlyOpened = workspacesService.getRecentlyOpened();
                rerender();
            }));
            this._register(this.gettingStartedService.onDidChangeWalkthrough(category => {
                const ourCategory = this.gettingStartedCategories.find(c => c.id === category.id);
                if (!ourCategory) {
                    return;
                }
                ourCategory.title = category.title;
                ourCategory.description = category.description;
                this.container.querySelectorAll(`[x-category-title-for="${category.id}"]`).forEach(step => step.innerText = ourCategory.title);
                this.container.querySelectorAll(`[x-category-description-for="${category.id}"]`).forEach(step => step.innerText = ourCategory.description);
            }));
            this._register(this.gettingStartedService.onDidProgressStep(step => {
                const category = this.gettingStartedCategories.find(category => category.id === step.category);
                if (!category) {
                    throw Error('Could not find category with ID: ' + step.category);
                }
                const ourStep = category.steps.find(_step => _step.id === step.id);
                if (!ourStep) {
                    throw Error('Could not find step with ID: ' + step.id);
                }
                const stats = this.getWalkthroughCompletionStats(category);
                if (!ourStep.done && stats.stepsComplete === stats.stepsTotal - 1) {
                    this.hideCategory(category.id);
                }
                this._register(this.configurationService.onDidChangeConfiguration(e => {
                    if (e.affectsConfiguration(REDUCED_MOTION_KEY)) {
                        this.container.classList.toggle('animatable', this.shouldAnimate());
                    }
                }));
                ourStep.done = step.done;
                if (category.id === this.currentWalkthrough?.id) {
                    const badgeelements = (0, types_1.assertIsDefined)(document.querySelectorAll(`[data-done-step-id="${step.id}"]`));
                    badgeelements.forEach(badgeelement => {
                        if (step.done) {
                            badgeelement.parentElement?.setAttribute('aria-checked', 'true');
                            badgeelement.classList.remove(...themables_1.ThemeIcon.asClassNameArray(gettingStartedIcons_1.gettingStartedUncheckedCodicon));
                            badgeelement.classList.add('complete', ...themables_1.ThemeIcon.asClassNameArray(gettingStartedIcons_1.gettingStartedCheckedCodicon));
                        }
                        else {
                            badgeelement.parentElement?.setAttribute('aria-checked', 'false');
                            badgeelement.classList.remove('complete', ...themables_1.ThemeIcon.asClassNameArray(gettingStartedIcons_1.gettingStartedCheckedCodicon));
                            badgeelement.classList.add(...themables_1.ThemeIcon.asClassNameArray(gettingStartedIcons_1.gettingStartedUncheckedCodicon));
                        }
                    });
                }
                this.updateCategoryProgress();
            }));
        }
        // remove when 'workbench.welcomePage.preferReducedMotion' deprecated
        shouldAnimate() {
            if (this.configurationService.getValue(REDUCED_MOTION_KEY)) {
                return false;
            }
            if (this.accessibilityService.isMotionReduced()) {
                return false;
            }
            return true;
        }
        getWalkthroughCompletionStats(walkthrough) {
            const activeSteps = walkthrough.steps.filter(s => this.contextService.contextMatchesRules(s.when));
            return {
                stepsComplete: activeSteps.filter(s => s.done).length,
                stepsTotal: activeSteps.length,
            };
        }
        async setInput(newInput, options, context, token) {
            this.container.classList.remove('animatable');
            this.editorInput = newInput;
            await super.setInput(newInput, options, context, token);
            await this.buildCategoriesSlide();
            if (this.shouldAnimate()) {
                setTimeout(() => this.container.classList.add('animatable'), 0);
            }
        }
        async makeCategoryVisibleWhenAvailable(categoryID, stepId) {
            this.scrollToCategory(categoryID, stepId);
        }
        registerDispatchListeners() {
            this.dispatchListeners.clear();
            this.container.querySelectorAll('[x-dispatch]').forEach(element => {
                const [command, argument] = (element.getAttribute('x-dispatch') ?? '').split(':');
                if (command) {
                    this.dispatchListeners.add((0, dom_1.addDisposableListener)(element, 'click', (e) => {
                        e.stopPropagation();
                        this.runDispatchCommand(command, argument);
                    }));
                    this.dispatchListeners.add((0, dom_1.addDisposableListener)(element, 'keyup', (e) => {
                        const keyboardEvent = new keyboardEvent_1.StandardKeyboardEvent(e);
                        e.stopPropagation();
                        switch (keyboardEvent.keyCode) {
                            case 3 /* KeyCode.Enter */:
                            case 10 /* KeyCode.Space */:
                                this.runDispatchCommand(command, argument);
                                return;
                        }
                    }));
                }
            });
        }
        async runDispatchCommand(command, argument) {
            this.commandService.executeCommand('workbench.action.keepEditor');
            this.telemetryService.publicLog2('gettingStarted.ActionExecuted', { command, argument, walkthroughId: this.currentWalkthrough?.id });
            switch (command) {
                case 'scrollPrev': {
                    this.scrollPrev();
                    break;
                }
                case 'skip': {
                    this.runSkip();
                    break;
                }
                case 'showMoreRecents': {
                    this.commandService.executeCommand(windowActions_1.OpenRecentAction.ID);
                    break;
                }
                case 'seeAllWalkthroughs': {
                    await this.openWalkthroughSelector();
                    break;
                }
                case 'openFolder': {
                    if (this.contextService.contextMatchesRules(contextkey_1.ContextKeyExpr.and(contextkeys_1.WorkbenchStateContext.isEqualTo('workspace')))) {
                        this.commandService.executeCommand(workspaceActions_1.OpenFolderViaWorkspaceAction.ID);
                    }
                    else {
                        this.commandService.executeCommand(platform_1.isMacintosh ? 'workbench.action.files.openFileFolder' : 'workbench.action.files.openFolder');
                    }
                    break;
                }
                case 'selectCategory': {
                    this.scrollToCategory(argument);
                    this.gettingStartedService.markWalkthroughOpened(argument);
                    break;
                }
                case 'selectStartEntry': {
                    const selected = gettingStartedContent_1.startEntries.find(e => e.id === argument);
                    if (selected) {
                        this.runStepCommand(selected.content.command);
                    }
                    else {
                        throw Error('could not find start entry with id: ' + argument);
                    }
                    break;
                }
                case 'hideCategory': {
                    this.hideCategory(argument);
                    break;
                }
                // Use selectTask over selectStep to keep telemetry consistant:https://github.com/microsoft/vscode/issues/122256
                case 'selectTask': {
                    this.selectStep(argument);
                    break;
                }
                case 'toggleStepCompletion': {
                    this.toggleStepCompletion(argument);
                    break;
                }
                case 'allDone': {
                    this.markAllStepsComplete();
                    break;
                }
                case 'nextSection': {
                    const next = this.currentWalkthrough?.next;
                    if (next) {
                        this.scrollToCategory(next);
                    }
                    else {
                        console.error('Error scrolling to next section of', this.currentWalkthrough);
                    }
                    break;
                }
                case 'openExtensionPage': {
                    this.commandService.executeCommand('extension.open', argument);
                    break;
                }
                case 'hideExtension': {
                    this.hideExtension(argument);
                    break;
                }
                default: {
                    console.error('Dispatch to', command, argument, 'not defined');
                    break;
                }
            }
        }
        hideCategory(categoryId) {
            const selectedCategory = this.gettingStartedCategories.find(category => category.id === categoryId);
            if (!selectedCategory) {
                throw Error('Could not find category with ID ' + categoryId);
            }
            this.setHiddenCategories([...this.getHiddenCategories().add(categoryId)]);
            this.gettingStartedList?.rerender();
        }
        hideExtension(extensionId) {
            this.setHiddenCategories([...this.getHiddenCategories().add(extensionId)]);
            this.featuredExtensionsList?.rerender();
            this.registerDispatchListeners();
        }
        markAllStepsComplete() {
            if (this.currentWalkthrough) {
                this.currentWalkthrough?.steps.forEach(step => {
                    if (!step.done) {
                        this.gettingStartedService.progressStep(step.id);
                    }
                });
                this.hideCategory(this.currentWalkthrough?.id);
                this.scrollPrev();
            }
            else {
                throw Error('No walkthrough opened');
            }
        }
        toggleStepCompletion(argument) {
            const stepToggle = (0, types_1.assertIsDefined)(this.currentWalkthrough?.steps.find(step => step.id === argument));
            if (stepToggle.done) {
                this.gettingStartedService.deprogressStep(argument);
            }
            else {
                this.gettingStartedService.progressStep(argument);
            }
        }
        async openWalkthroughSelector() {
            const selection = await this.quickInputService.pick(this.gettingStartedCategories
                .filter(c => this.contextService.contextMatchesRules(c.when))
                .map(x => ({
                id: x.id,
                label: x.title,
                detail: x.description,
                description: x.source,
            })), { canPickMany: false, matchOnDescription: true, matchOnDetail: true, title: (0, nls_1.localize)('pickWalkthroughs', "Open Walkthrough...") });
            if (selection) {
                this.runDispatchCommand('selectCategory', selection.id);
            }
        }
        getHiddenCategories() {
            return new Set(JSON.parse(this.storageService.get(gettingStartedService_1.hiddenEntriesConfigurationKey, 0 /* StorageScope.PROFILE */, '[]')));
        }
        setHiddenCategories(hidden) {
            this.storageService.store(gettingStartedService_1.hiddenEntriesConfigurationKey, JSON.stringify(hidden), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
        }
        async buildMediaComponent(stepId) {
            if (!this.currentWalkthrough) {
                throw Error('no walkthrough selected');
            }
            const stepToExpand = (0, types_1.assertIsDefined)(this.currentWalkthrough.steps.find(step => step.id === stepId));
            if (this.currentMediaComponent === stepId) {
                return;
            }
            this.currentMediaComponent = stepId;
            this.stepDisposables.clear();
            this.stepDisposables.add({
                dispose: () => {
                    this.currentMediaComponent = undefined;
                }
            });
            if (this.currentMediaType !== stepToExpand.media.type) {
                this.currentMediaType = stepToExpand.media.type;
                this.mediaDisposables.add((0, lifecycle_1.toDisposable)(() => {
                    this.currentMediaType = undefined;
                }));
                (0, dom_1.clearNode)(this.stepMediaComponent);
                if (stepToExpand.media.type === 'svg') {
                    this.webview = this.mediaDisposables.add(this.webviewService.createWebviewElement({ title: undefined, options: { disableServiceWorker: true }, contentOptions: {}, extension: undefined }));
                    this.webview.mountTo(this.stepMediaComponent);
                }
                else if (stepToExpand.media.type === 'markdown') {
                    this.webview = this.mediaDisposables.add(this.webviewService.createWebviewElement({ options: {}, contentOptions: { localResourceRoots: [stepToExpand.media.root], allowScripts: true }, title: '', extension: undefined }));
                    this.webview.mountTo(this.stepMediaComponent);
                }
            }
            if (stepToExpand.media.type === 'image') {
                this.stepsContent.classList.add('image');
                this.stepsContent.classList.remove('markdown');
                const media = stepToExpand.media;
                const mediaElement = (0, dom_1.$)('img');
                (0, dom_1.clearNode)(this.stepMediaComponent);
                this.stepMediaComponent.appendChild(mediaElement);
                mediaElement.setAttribute('alt', media.altText);
                this.updateMediaSourceForColorMode(mediaElement, media.path);
                this.stepDisposables.add((0, dom_1.addDisposableListener)(this.stepMediaComponent, 'click', () => {
                    const hrefs = (0, arrays_1.flatten)(stepToExpand.description.map(lt => lt.nodes.filter((node) => typeof node !== 'string').map(node => node.href)));
                    if (hrefs.length === 1) {
                        const href = hrefs[0];
                        if (href.startsWith('http')) {
                            this.telemetryService.publicLog2('gettingStarted.ActionExecuted', { command: 'runStepAction', argument: href, walkthroughId: this.currentWalkthrough?.id });
                            this.openerService.open(href);
                        }
                    }
                }));
                this.stepDisposables.add(this.themeService.onDidColorThemeChange(() => this.updateMediaSourceForColorMode(mediaElement, media.path)));
            }
            else if (stepToExpand.media.type === 'svg') {
                this.stepsContent.classList.add('image');
                this.stepsContent.classList.remove('markdown');
                const media = stepToExpand.media;
                this.webview.setHtml(await this.detailsRenderer.renderSVG(media.path));
                let isDisposed = false;
                this.stepDisposables.add((0, lifecycle_1.toDisposable)(() => { isDisposed = true; }));
                this.stepDisposables.add(this.themeService.onDidColorThemeChange(async () => {
                    // Render again since color vars change
                    const body = await this.detailsRenderer.renderSVG(media.path);
                    if (!isDisposed) { // Make sure we weren't disposed of in the meantime
                        this.webview.setHtml(body);
                    }
                }));
                this.stepDisposables.add((0, dom_1.addDisposableListener)(this.stepMediaComponent, 'click', () => {
                    const hrefs = (0, arrays_1.flatten)(stepToExpand.description.map(lt => lt.nodes.filter((node) => typeof node !== 'string').map(node => node.href)));
                    if (hrefs.length === 1) {
                        const href = hrefs[0];
                        if (href.startsWith('http')) {
                            this.telemetryService.publicLog2('gettingStarted.ActionExecuted', { command: 'runStepAction', argument: href, walkthroughId: this.currentWalkthrough?.id });
                            this.openerService.open(href);
                        }
                    }
                }));
                this.stepDisposables.add(this.webview.onDidClickLink(link => {
                    if ((0, opener_1.matchesScheme)(link, network_1.Schemas.https) || (0, opener_1.matchesScheme)(link, network_1.Schemas.http) || ((0, opener_1.matchesScheme)(link, network_1.Schemas.command))) {
                        this.openerService.open(link, { allowCommands: true });
                    }
                }));
            }
            else if (stepToExpand.media.type === 'markdown') {
                this.stepsContent.classList.remove('image');
                this.stepsContent.classList.add('markdown');
                const media = stepToExpand.media;
                const rawHTML = await this.detailsRenderer.renderMarkdown(media.path, media.base);
                this.webview.setHtml(rawHTML);
                const serializedContextKeyExprs = rawHTML.match(/checked-on=\"([^'][^"]*)\"/g)?.map(attr => attr.slice('checked-on="'.length, -1)
                    .replace(/&#39;/g, '\'')
                    .replace(/&amp;/g, '&'));
                const postTrueKeysMessage = () => {
                    const enabledContextKeys = serializedContextKeyExprs?.filter(expr => this.contextService.contextMatchesRules(contextkey_1.ContextKeyExpr.deserialize(expr)));
                    if (enabledContextKeys) {
                        this.webview.postMessage({
                            enabledContextKeys
                        });
                    }
                };
                if (serializedContextKeyExprs) {
                    const contextKeyExprs = (0, arrays_1.coalesce)(serializedContextKeyExprs.map(expr => contextkey_1.ContextKeyExpr.deserialize(expr)));
                    const watchingKeys = new Set((0, arrays_1.flatten)(contextKeyExprs.map(expr => expr.keys())));
                    this.stepDisposables.add(this.contextService.onDidChangeContext(e => {
                        if (e.affectsSome(watchingKeys)) {
                            postTrueKeysMessage();
                        }
                    }));
                }
                let isDisposed = false;
                this.stepDisposables.add((0, lifecycle_1.toDisposable)(() => { isDisposed = true; }));
                this.stepDisposables.add(this.webview.onDidClickLink(link => {
                    if ((0, opener_1.matchesScheme)(link, network_1.Schemas.https) || (0, opener_1.matchesScheme)(link, network_1.Schemas.http) || ((0, opener_1.matchesScheme)(link, network_1.Schemas.command))) {
                        this.openerService.open(link, { allowCommands: true });
                    }
                }));
                if (rawHTML.indexOf('<code>') >= 0) {
                    // Render again when Theme changes since syntax highlighting of code blocks may have changed
                    this.stepDisposables.add(this.themeService.onDidColorThemeChange(async () => {
                        const body = await this.detailsRenderer.renderMarkdown(media.path, media.base);
                        if (!isDisposed) { // Make sure we weren't disposed of in the meantime
                            this.webview.setHtml(body);
                            postTrueKeysMessage();
                        }
                    }));
                }
                const layoutDelayer = new async_1.Delayer(50);
                this.layoutMarkdown = () => {
                    layoutDelayer.trigger(() => {
                        this.webview.postMessage({ layoutMeNow: true });
                    });
                };
                this.stepDisposables.add(layoutDelayer);
                this.stepDisposables.add({ dispose: () => this.layoutMarkdown = undefined });
                postTrueKeysMessage();
                this.stepDisposables.add(this.webview.onMessage(e => {
                    const message = e.message;
                    if (message.startsWith('command:')) {
                        this.openerService.open(message, { allowCommands: true });
                    }
                    else if (message.startsWith('setTheme:')) {
                        this.configurationService.updateValue(workbenchThemeService_1.ThemeSettings.COLOR_THEME, message.slice('setTheme:'.length), 2 /* ConfigurationTarget.USER */);
                    }
                    else {
                        console.error('Unexpected message', message);
                    }
                }));
            }
        }
        async selectStepLoose(id) {
            // Allow passing in id with a category appended or with just the id of the step
            if (id.startsWith(`${this.editorInput.selectedCategory}#`)) {
                this.selectStep(id);
            }
            else {
                const toSelect = this.editorInput.selectedCategory + '#' + id;
                this.selectStep(toSelect);
            }
        }
        async selectStep(id, delayFocus = true) {
            if (id) {
                let stepElement = this.container.querySelector(`[data-step-id="${id}"]`);
                if (!stepElement) {
                    // Selected an element that is not in-context, just fallback to whatever.
                    stepElement = this.container.querySelector(`[data-step-id]`);
                    if (!stepElement) {
                        // No steps around... just ignore.
                        return;
                    }
                    id = (0, types_1.assertIsDefined)(stepElement.getAttribute('data-step-id'));
                }
                stepElement.parentElement?.querySelectorAll('.expanded').forEach(node => {
                    if (node.getAttribute('data-step-id') !== id) {
                        node.classList.remove('expanded');
                        node.setAttribute('aria-expanded', 'false');
                    }
                });
                setTimeout(() => stepElement.focus(), delayFocus && this.shouldAnimate() ? SLIDE_TRANSITION_TIME_MS : 0);
                this.editorInput.selectedStep = id;
                stepElement.classList.add('expanded');
                stepElement.setAttribute('aria-expanded', 'true');
                this.buildMediaComponent(id);
                this.gettingStartedService.progressStep(id);
            }
            else {
                this.editorInput.selectedStep = undefined;
            }
            this.detailsPageScrollbar?.scanDomNode();
            this.detailsScrollbar?.scanDomNode();
        }
        updateMediaSourceForColorMode(element, sources) {
            const themeType = this.themeService.getColorTheme().type;
            const src = sources[themeType].toString(true).replace(/ /g, '%20');
            element.srcset = src.toLowerCase().endsWith('.svg') ? src : (src + ' 1.5x');
        }
        createEditor(parent) {
            if (this.detailsPageScrollbar) {
                this.detailsPageScrollbar.dispose();
            }
            if (this.categoriesPageScrollbar) {
                this.categoriesPageScrollbar.dispose();
            }
            this.categoriesSlide = (0, dom_1.$)('.gettingStartedSlideCategories.gettingStartedSlide');
            const prevButton = (0, dom_1.$)('button.prev-button.button-link', { 'x-dispatch': 'scrollPrev' }, (0, dom_1.$)('span.scroll-button.codicon.codicon-chevron-left'), (0, dom_1.$)('span.moreText', {}, (0, nls_1.localize)('welcome', "Welcome")));
            this.stepsSlide = (0, dom_1.$)('.gettingStartedSlideDetails.gettingStartedSlide', {}, prevButton);
            this.stepsContent = (0, dom_1.$)('.gettingStartedDetailsContent', {});
            this.detailsPageScrollbar = this._register(new scrollableElement_1.DomScrollableElement(this.stepsContent, { className: 'full-height-scrollable' }));
            this.categoriesPageScrollbar = this._register(new scrollableElement_1.DomScrollableElement(this.categoriesSlide, { className: 'full-height-scrollable categoriesScrollbar' }));
            this.stepsSlide.appendChild(this.detailsPageScrollbar.getDomNode());
            const gettingStartedPage = (0, dom_1.$)('.gettingStarted', {}, this.categoriesPageScrollbar.getDomNode(), this.stepsSlide);
            this.container.appendChild(gettingStartedPage);
            this.categoriesPageScrollbar.scanDomNode();
            this.detailsPageScrollbar.scanDomNode();
            parent.appendChild(this.container);
        }
        async buildCategoriesSlide() {
            this.categoriesSlideDisposables.clear();
            const showOnStartupCheckbox = new toggle_1.Toggle({
                icon: codicons_1.Codicon.check,
                actionClassName: 'getting-started-checkbox',
                isChecked: this.configurationService.getValue(configurationKey) === 'welcomePage',
                title: (0, nls_1.localize)('checkboxTitle', "When checked, this page will be shown on startup."),
                ...defaultStyles_1.defaultToggleStyles
            });
            showOnStartupCheckbox.domNode.id = 'showOnStartup';
            const showOnStartupLabel = (0, dom_1.$)('label.caption', { for: 'showOnStartup' }, (0, nls_1.localize)('welcomePage.showOnStartup', "Show welcome page on startup"));
            const onShowOnStartupChanged = () => {
                if (showOnStartupCheckbox.checked) {
                    this.telemetryService.publicLog2('gettingStarted.ActionExecuted', { command: 'showOnStartupChecked', argument: undefined, walkthroughId: this.currentWalkthrough?.id });
                    this.configurationService.updateValue(configurationKey, 'welcomePage');
                }
                else {
                    this.telemetryService.publicLog2('gettingStarted.ActionExecuted', { command: 'showOnStartupUnchecked', argument: undefined, walkthroughId: this.currentWalkthrough?.id });
                    this.configurationService.updateValue(configurationKey, 'none');
                }
            };
            this.categoriesSlideDisposables.add(showOnStartupCheckbox);
            this.categoriesSlideDisposables.add(showOnStartupCheckbox.onChange(() => {
                onShowOnStartupChanged();
            }));
            this.categoriesSlideDisposables.add((0, dom_1.addDisposableListener)(showOnStartupLabel, 'click', () => {
                showOnStartupCheckbox.checked = !showOnStartupCheckbox.checked;
                onShowOnStartupChanged();
            }));
            const header = (0, dom_1.$)('.header', {}, (0, dom_1.$)('h1.product-name.caption', {}, this.productService.nameLong), (0, dom_1.$)('p.subtitle.description', {}, (0, nls_1.localize)({ key: 'gettingStarted.editingEvolved', comment: ['Shown as subtitle on the Welcome page.'] }, "Editing evolved")));
            const leftColumn = (0, dom_1.$)('.categories-column.categories-column-left', {});
            const rightColumn = (0, dom_1.$)('.categories-column.categories-column-right', {});
            const startList = this.buildStartList();
            const recentList = this.buildRecentlyOpenedList();
            const featuredExtensionList = this.buildFeaturedExtensionsList();
            const gettingStartedList = this.buildGettingStartedWalkthroughsList();
            const footer = (0, dom_1.$)('.footer', {}, (0, dom_1.$)('p.showOnStartup', {}, showOnStartupCheckbox.domNode, showOnStartupLabel));
            const layoutLists = () => {
                if (gettingStartedList.itemCount) {
                    this.container.classList.remove('noWalkthroughs');
                    (0, dom_1.reset)(rightColumn, featuredExtensionList.getDomElement(), gettingStartedList.getDomElement());
                }
                else {
                    this.container.classList.add('noWalkthroughs');
                    (0, dom_1.reset)(rightColumn, featuredExtensionList.getDomElement());
                }
                setTimeout(() => this.categoriesPageScrollbar?.scanDomNode(), 50);
                layoutRecentList();
            };
            const layoutFeaturedExtension = () => {
                if (featuredExtensionList.itemCount) {
                    this.container.classList.remove('noExtensions');
                    (0, dom_1.reset)(rightColumn, featuredExtensionList.getDomElement(), gettingStartedList.getDomElement());
                }
                else {
                    this.container.classList.add('noExtensions');
                    (0, dom_1.reset)(rightColumn, gettingStartedList.getDomElement());
                }
                setTimeout(() => this.categoriesPageScrollbar?.scanDomNode(), 50);
                layoutRecentList();
            };
            const layoutRecentList = () => {
                if (this.container.classList.contains('noWalkthroughs') && this.container.classList.contains('noExtensions')) {
                    recentList.setLimit(10);
                    (0, dom_1.reset)(leftColumn, startList.getDomElement());
                    (0, dom_1.reset)(rightColumn, recentList.getDomElement());
                }
                else {
                    recentList.setLimit(5);
                    (0, dom_1.reset)(leftColumn, startList.getDomElement(), recentList.getDomElement());
                }
            };
            featuredExtensionList.onDidChange(layoutFeaturedExtension);
            layoutFeaturedExtension();
            gettingStartedList.onDidChange(layoutLists);
            layoutLists();
            (0, dom_1.reset)(this.categoriesSlide, (0, dom_1.$)('.gettingStartedCategoriesContainer', {}, header, leftColumn, rightColumn, footer));
            this.categoriesPageScrollbar?.scanDomNode();
            this.updateCategoryProgress();
            this.registerDispatchListeners();
            if (this.editorInput.selectedCategory) {
                this.currentWalkthrough = this.gettingStartedCategories.find(category => category.id === this.editorInput.selectedCategory);
                if (!this.currentWalkthrough) {
                    this.gettingStartedCategories = this.gettingStartedService.getWalkthroughs();
                    this.currentWalkthrough = this.gettingStartedCategories.find(category => category.id === this.editorInput.selectedCategory);
                    if (this.currentWalkthrough) {
                        this.buildCategorySlide(this.editorInput.selectedCategory, this.editorInput.selectedStep);
                        this.setSlide('details');
                        return;
                    }
                }
            }
            const someStepsComplete = this.gettingStartedCategories.some(category => category.steps.find(s => s.done));
            if (this.editorInput.showTelemetryNotice && this.productService.openToWelcomeMainPage) {
                const telemetryNotice = (0, dom_1.$)('p.telemetry-notice');
                this.buildTelemetryFooter(telemetryNotice);
                footer.appendChild(telemetryNotice);
            }
            else if (!this.productService.openToWelcomeMainPage && !someStepsComplete && !this.hasScrolledToFirstCategory) {
                const firstSessionDateString = this.storageService.get(telemetry_1.firstSessionDateStorageKey, -1 /* StorageScope.APPLICATION */) || new Date().toUTCString();
                const daysSinceFirstSession = ((+new Date()) - (+new Date(firstSessionDateString))) / 1000 / 60 / 60 / 24;
                const fistContentBehaviour = daysSinceFirstSession < 1 ? 'openToFirstCategory' : 'index';
                if (fistContentBehaviour === 'openToFirstCategory') {
                    const first = this.gettingStartedCategories.filter(c => !c.when || this.contextService.contextMatchesRules(c.when))[0];
                    this.hasScrolledToFirstCategory = true;
                    if (first) {
                        this.currentWalkthrough = first;
                        this.editorInput.selectedCategory = this.currentWalkthrough?.id;
                        this.buildCategorySlide(this.editorInput.selectedCategory, undefined);
                        this.setSlide('details');
                        return;
                    }
                }
            }
            this.setSlide('categories');
        }
        buildRecentlyOpenedList() {
            const renderRecent = (recent) => {
                let fullPath;
                let windowOpenable;
                if ((0, workspaces_1.isRecentFolder)(recent)) {
                    windowOpenable = { folderUri: recent.folderUri };
                    fullPath = recent.label || this.labelService.getWorkspaceLabel(recent.folderUri, { verbose: 2 /* Verbosity.LONG */ });
                }
                else {
                    fullPath = recent.label || this.labelService.getWorkspaceLabel(recent.workspace, { verbose: 2 /* Verbosity.LONG */ });
                    windowOpenable = { workspaceUri: recent.workspace.configPath };
                }
                const { name, parentPath } = (0, labels_1.splitRecentLabel)(fullPath);
                const li = (0, dom_1.$)('li');
                const link = (0, dom_1.$)('button.button-link');
                link.innerText = name;
                link.title = fullPath;
                link.setAttribute('aria-label', (0, nls_1.localize)('welcomePage.openFolderWithPath', "Open folder {0} with path {1}", name, parentPath));
                link.addEventListener('click', e => {
                    this.telemetryService.publicLog2('gettingStarted.ActionExecuted', { command: 'openRecent', argument: undefined, walkthroughId: this.currentWalkthrough?.id });
                    this.hostService.openWindow([windowOpenable], {
                        forceNewWindow: e.ctrlKey || e.metaKey,
                        remoteAuthority: recent.remoteAuthority || null // local window if remoteAuthority is not set or can not be deducted from the openable
                    });
                    e.preventDefault();
                    e.stopPropagation();
                });
                li.appendChild(link);
                const span = (0, dom_1.$)('span');
                span.classList.add('path');
                span.classList.add('detail');
                span.innerText = parentPath;
                span.title = fullPath;
                li.appendChild(span);
                return li;
            };
            if (this.recentlyOpenedList) {
                this.recentlyOpenedList.dispose();
            }
            const recentlyOpenedList = this.recentlyOpenedList = new gettingStartedList_1.GettingStartedIndexList({
                title: (0, nls_1.localize)('recent', "Recent"),
                klass: 'recently-opened',
                limit: 5,
                empty: (0, dom_1.$)('.empty-recent', {}, (0, nls_1.localize)('noRecents', "You have no recent folders,"), (0, dom_1.$)('button.button-link', { 'x-dispatch': 'openFolder' }, (0, nls_1.localize)('openFolder', "open a folder")), (0, nls_1.localize)('toStart', "to start.")),
                more: (0, dom_1.$)('.more', {}, (0, dom_1.$)('button.button-link', {
                    'x-dispatch': 'showMoreRecents',
                    title: (0, nls_1.localize)('show more recents', "Show All Recent Folders {0}", this.getKeybindingLabel(windowActions_1.OpenRecentAction.ID))
                }, (0, nls_1.localize)('showAll', "More..."))),
                renderElement: renderRecent,
                contextService: this.contextService
            });
            recentlyOpenedList.onDidChange(() => this.registerDispatchListeners());
            this.recentlyOpened.then(({ workspaces }) => {
                // Filter out the current workspace
                const workspacesWithID = workspaces
                    .filter(recent => !this.workspaceContextService.isCurrentWorkspace((0, workspaces_1.isRecentWorkspace)(recent) ? recent.workspace : recent.folderUri))
                    .map(recent => ({ ...recent, id: (0, workspaces_1.isRecentWorkspace)(recent) ? recent.workspace.id : recent.folderUri.toString() }));
                const updateEntries = () => {
                    recentlyOpenedList.setEntries(workspacesWithID);
                };
                updateEntries();
                recentlyOpenedList.register(this.labelService.onDidChangeFormatters(() => updateEntries()));
            }).catch(errors_1.onUnexpectedError);
            return recentlyOpenedList;
        }
        buildStartList() {
            const renderStartEntry = (entry) => (0, dom_1.$)('li', {}, (0, dom_1.$)('button.button-link', {
                'x-dispatch': 'selectStartEntry:' + entry.id,
                title: entry.description + ' ' + this.getKeybindingLabel(entry.command),
            }, this.iconWidgetFor(entry), (0, dom_1.$)('span', {}, entry.title)));
            if (this.startList) {
                this.startList.dispose();
            }
            const startList = this.startList = new gettingStartedList_1.GettingStartedIndexList({
                title: (0, nls_1.localize)('start', "Start"),
                klass: 'start-container',
                limit: 10,
                renderElement: renderStartEntry,
                rankElement: e => -e.order,
                contextService: this.contextService
            });
            startList.setEntries(parsedStartEntries);
            startList.onDidChange(() => this.registerDispatchListeners());
            return startList;
        }
        buildGettingStartedWalkthroughsList() {
            const renderGetttingStaredWalkthrough = (category) => {
                const renderNewBadge = (category.newItems || category.newEntry) && !category.isFeatured;
                const newBadge = (0, dom_1.$)('.new-badge', {});
                if (category.newEntry) {
                    (0, dom_1.reset)(newBadge, (0, dom_1.$)('.new-category', {}, (0, nls_1.localize)('new', "New")));
                }
                else if (category.newItems) {
                    (0, dom_1.reset)(newBadge, (0, dom_1.$)('.new-items', {}, (0, nls_1.localize)({ key: 'newItems', comment: ['Shown when a list of items has changed based on an update from a remote source'] }, "Updated")));
                }
                const featuredBadge = (0, dom_1.$)('.featured-badge', {});
                const descriptionContent = (0, dom_1.$)('.description-content', {});
                if (category.isFeatured) {
                    (0, dom_1.reset)(featuredBadge, (0, dom_1.$)('.featured', {}, (0, dom_1.$)('span.featured-icon.codicon.codicon-star-full')));
                    (0, dom_1.reset)(descriptionContent, ...(0, iconLabels_1.renderLabelWithIcons)(category.description));
                }
                const titleContent = (0, dom_1.$)('h3.category-title.max-lines-3', { 'x-category-title-for': category.id });
                (0, dom_1.reset)(titleContent, ...(0, iconLabels_1.renderLabelWithIcons)(category.title));
                return (0, dom_1.$)('button.getting-started-category' + (category.isFeatured ? '.featured' : ''), {
                    'x-dispatch': 'selectCategory:' + category.id,
                    'title': category.description
                }, featuredBadge, (0, dom_1.$)('.main-content', {}, this.iconWidgetFor(category), titleContent, renderNewBadge ? newBadge : (0, dom_1.$)('.no-badge'), (0, dom_1.$)('a.codicon.codicon-close.hide-category-button', {
                    'tabindex': 0,
                    'x-dispatch': 'hideCategory:' + category.id,
                    'title': (0, nls_1.localize)('close', "Hide"),
                    'role': 'button',
                    'aria-label': (0, nls_1.localize)('closeAriaLabel', "Hide"),
                })), descriptionContent, (0, dom_1.$)('.category-progress', { 'x-data-category-id': category.id, }, (0, dom_1.$)('.progress-bar-outer', { 'role': 'progressbar' }, (0, dom_1.$)('.progress-bar-inner'))));
            };
            if (this.gettingStartedList) {
                this.gettingStartedList.dispose();
            }
            const rankWalkthrough = (e) => {
                let rank = e.order;
                if (e.isFeatured) {
                    rank += 7;
                }
                if (e.newEntry) {
                    rank += 3;
                }
                if (e.newItems) {
                    rank += 2;
                }
                if (e.recencyBonus) {
                    rank += 4 * e.recencyBonus;
                }
                if (this.getHiddenCategories().has(e.id)) {
                    rank = null;
                }
                return rank;
            };
            const gettingStartedList = this.gettingStartedList = new gettingStartedList_1.GettingStartedIndexList({
                title: (0, nls_1.localize)('walkthroughs', "Walkthroughs"),
                klass: 'getting-started',
                limit: 5,
                footer: (0, dom_1.$)('span.button-link.see-all-walkthroughs', { 'x-dispatch': 'seeAllWalkthroughs', 'tabindex': 0 }, (0, nls_1.localize)('showAll', "More...")),
                renderElement: renderGetttingStaredWalkthrough,
                rankElement: rankWalkthrough,
                contextService: this.contextService,
            });
            gettingStartedList.onDidChange(() => {
                const hidden = this.getHiddenCategories();
                const someWalkthroughsHidden = hidden.size || gettingStartedList.itemCount < this.gettingStartedCategories.filter(c => this.contextService.contextMatchesRules(c.when)).length;
                this.container.classList.toggle('someWalkthroughsHidden', !!someWalkthroughsHidden);
                this.registerDispatchListeners();
                exports.allWalkthroughsHiddenContext.bindTo(this.contextService).set(gettingStartedList.itemCount === 0);
                this.updateCategoryProgress();
            });
            gettingStartedList.setEntries(this.gettingStartedCategories);
            exports.allWalkthroughsHiddenContext.bindTo(this.contextService).set(gettingStartedList.itemCount === 0);
            return gettingStartedList;
        }
        buildFeaturedExtensionsList() {
            const renderFeaturedExtensions = (entry) => {
                const descriptionContent = (0, dom_1.$)('.featured-description-content', {});
                (0, dom_1.reset)(descriptionContent, ...(0, iconLabels_1.renderLabelWithIcons)(entry.description));
                const titleContent = (0, dom_1.$)('h3.category-title.max-lines-3', { 'x-category-title-for': entry.id });
                (0, dom_1.reset)(titleContent, ...(0, iconLabels_1.renderLabelWithIcons)(entry.title));
                return (0, dom_1.$)('button.getting-started-category', {
                    'x-dispatch': 'openExtensionPage:' + entry.id,
                    'title': entry.description
                }, (0, dom_1.$)('.main-content', {}, (0, dom_1.$)('img.featured-icon.icon-widget', { src: entry.imagePath }), titleContent, (0, dom_1.$)('a.codicon.codicon-close.hide-category-button', {
                    'tabindex': 0,
                    'x-dispatch': 'hideExtension:' + entry.id,
                    'title': (0, nls_1.localize)('close', "Hide"),
                    'role': 'button',
                    'aria-label': (0, nls_1.localize)('closeAriaLabel', "Hide"),
                })), descriptionContent);
            };
            if (this.featuredExtensionsList) {
                this.featuredExtensionsList.dispose();
            }
            const featuredExtensionsList = this.featuredExtensionsList = new gettingStartedList_1.GettingStartedIndexList({
                title: this.featuredExtensionService.title,
                klass: 'featured-extensions',
                limit: 5,
                renderElement: renderFeaturedExtensions,
                rankElement: (extension) => { if (this.getHiddenCategories().has(extension.id)) {
                    return null;
                } return 0; },
                contextService: this.contextService,
            });
            this.featuredExtensions?.then(extensions => {
                featuredExtensionsList.setEntries(extensions);
            });
            this.featuredExtensionsList?.onDidChange(() => {
                this.registerDispatchListeners();
            });
            return featuredExtensionsList;
        }
        layout(size) {
            this.detailsScrollbar?.scanDomNode();
            this.categoriesPageScrollbar?.scanDomNode();
            this.detailsPageScrollbar?.scanDomNode();
            this.startList?.layout(size);
            this.gettingStartedList?.layout(size);
            this.featuredExtensionsList?.layout(size);
            this.recentlyOpenedList?.layout(size);
            if (this.editorInput?.selectedStep && this.currentMediaType) {
                this.mediaDisposables.clear();
                this.stepDisposables.clear();
                this.buildMediaComponent(this.editorInput.selectedStep);
            }
            this.layoutMarkdown?.();
            this.container.classList.toggle('height-constrained', size.height <= 600);
            this.container.classList.toggle('width-constrained', size.width <= 400);
            this.container.classList.toggle('width-semi-constrained', size.width <= 800);
            this.categoriesPageScrollbar?.scanDomNode();
            this.detailsPageScrollbar?.scanDomNode();
            this.detailsScrollbar?.scanDomNode();
        }
        updateCategoryProgress() {
            document.querySelectorAll('.category-progress').forEach(element => {
                const categoryID = element.getAttribute('x-data-category-id');
                const category = this.gettingStartedCategories.find(category => category.id === categoryID);
                if (!category) {
                    throw Error('Could not find category with ID ' + categoryID);
                }
                const stats = this.getWalkthroughCompletionStats(category);
                const bar = (0, types_1.assertIsDefined)(element.querySelector('.progress-bar-inner'));
                bar.setAttribute('aria-valuemin', '0');
                bar.setAttribute('aria-valuenow', '' + stats.stepsComplete);
                bar.setAttribute('aria-valuemax', '' + stats.stepsTotal);
                const progress = (stats.stepsComplete / stats.stepsTotal) * 100;
                bar.style.width = `${progress}%`;
                element.parentElement.classList.toggle('no-progress', stats.stepsComplete === 0);
                if (stats.stepsTotal === stats.stepsComplete) {
                    bar.title = (0, nls_1.localize)('gettingStarted.allStepsComplete', "All {0} steps complete!", stats.stepsComplete);
                }
                else {
                    bar.title = (0, nls_1.localize)('gettingStarted.someStepsComplete', "{0} of {1} steps complete", stats.stepsComplete, stats.stepsTotal);
                }
            });
        }
        async scrollToCategory(categoryID, stepId) {
            if (!this.gettingStartedCategories.some(c => c.id === categoryID)) {
                this.gettingStartedCategories = this.gettingStartedService.getWalkthroughs();
            }
            const ourCategory = this.gettingStartedCategories.find(c => c.id === categoryID);
            if (!ourCategory) {
                throw Error('Could not find category with ID: ' + categoryID);
            }
            this.inProgressScroll = this.inProgressScroll.then(async () => {
                (0, dom_1.reset)(this.stepsContent);
                this.editorInput.selectedCategory = categoryID;
                this.editorInput.selectedStep = stepId;
                this.currentWalkthrough = ourCategory;
                this.buildCategorySlide(categoryID);
                this.setSlide('details');
            });
        }
        iconWidgetFor(category) {
            const widget = category.icon.type === 'icon' ? (0, dom_1.$)(themables_1.ThemeIcon.asCSSSelector(category.icon.icon)) : (0, dom_1.$)('img.category-icon', { src: category.icon.path });
            widget.classList.add('icon-widget');
            return widget;
        }
        runStepCommand(href) {
            const isCommand = href.startsWith('command:');
            const toSide = href.startsWith('command:toSide:');
            const command = href.replace(/command:(toSide:)?/, 'command:');
            this.telemetryService.publicLog2('gettingStarted.ActionExecuted', { command: 'runStepAction', argument: href, walkthroughId: this.currentWalkthrough?.id });
            const fullSize = this.groupsService.contentDimension;
            if (toSide && fullSize.width > 700) {
                if (this.groupsService.count === 1) {
                    const sideGroup = this.groupsService.addGroup(this.groupsService.groups[0], 3 /* GroupDirection.RIGHT */);
                    this.groupsService.activateGroup(sideGroup);
                    const gettingStartedSize = Math.floor(fullSize.width / 2);
                    const gettingStartedGroup = this.groupsService.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */).find(group => (group.activeEditor instanceof gettingStartedInput_1.GettingStartedInput));
                    this.groupsService.setSize((0, types_1.assertIsDefined)(gettingStartedGroup), { width: gettingStartedSize, height: fullSize.height });
                }
                const nonGettingStartedGroup = this.groupsService.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */).find(group => !(group.activeEditor instanceof gettingStartedInput_1.GettingStartedInput));
                if (nonGettingStartedGroup) {
                    this.groupsService.activateGroup(nonGettingStartedGroup);
                    nonGettingStartedGroup.focus();
                }
            }
            if (isCommand) {
                const commandURI = uri_1.URI.parse(command);
                // execute as command
                let args = [];
                try {
                    args = (0, marshalling_1.parse)(decodeURIComponent(commandURI.query));
                }
                catch {
                    // ignore and retry
                    try {
                        args = (0, marshalling_1.parse)(commandURI.query);
                    }
                    catch {
                        // ignore error
                    }
                }
                if (!Array.isArray(args)) {
                    args = [args];
                }
                // If a step is requesting the OpenFolder action to be executed in an empty workspace...
                if ((commandURI.path === workspaceActions_1.OpenFileFolderAction.ID.toString() ||
                    commandURI.path === workspaceActions_1.OpenFolderAction.ID.toString()) &&
                    this.workspaceContextService.getWorkspace().folders.length === 0) {
                    const selectedStepIndex = this.currentWalkthrough?.steps.findIndex(step => step.id === this.editorInput.selectedStep);
                    // and there are a few more steps after this step which are yet to be completed...
                    if (selectedStepIndex !== undefined &&
                        selectedStepIndex > -1 &&
                        this.currentWalkthrough?.steps.slice(selectedStepIndex + 1).some(step => !step.done)) {
                        const restoreData = { folder: workspace_1.UNKNOWN_EMPTY_WINDOW_WORKSPACE.id, category: this.editorInput.selectedCategory, step: this.editorInput.selectedStep };
                        // save state to restore after reload
                        this.storageService.store(startupPage_1.restoreWalkthroughsConfigurationKey, JSON.stringify(restoreData), 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
                    }
                }
                this.commandService.executeCommand(commandURI.path, ...args).then(result => {
                    const toOpen = result?.openFolder;
                    if (toOpen) {
                        if (!uri_1.URI.isUri(toOpen)) {
                            console.warn('Warn: Running walkthrough command', href, 'yielded non-URI `openFolder` result', toOpen, '. It will be disregarded.');
                            return;
                        }
                        const restoreData = { folder: toOpen.toString(), category: this.editorInput.selectedCategory, step: this.editorInput.selectedStep };
                        this.storageService.store(startupPage_1.restoreWalkthroughsConfigurationKey, JSON.stringify(restoreData), 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
                        this.hostService.openWindow([{ folderUri: toOpen }]);
                    }
                });
            }
            else {
                this.openerService.open(command, { allowCommands: true });
            }
            if (!isCommand && (href.startsWith('https://') || href.startsWith('http://'))) {
                this.gettingStartedService.progressByEvent('onLink:' + href);
            }
        }
        buildStepMarkdownDescription(container, text) {
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
            for (const linkedText of text) {
                if (linkedText.nodes.length === 1 && typeof linkedText.nodes[0] !== 'string') {
                    const node = linkedText.nodes[0];
                    const buttonContainer = (0, dom_1.append)(container, (0, dom_1.$)('.button-container'));
                    const button = new button_1.Button(buttonContainer, { title: node.title, supportIcons: true, ...defaultStyles_1.defaultButtonStyles });
                    const isCommand = node.href.startsWith('command:');
                    const command = node.href.replace(/command:(toSide:)?/, 'command:');
                    button.label = node.label;
                    button.onDidClick(e => {
                        e.stopPropagation();
                        e.preventDefault();
                        this.runStepCommand(node.href);
                    }, null, this.detailsPageDisposables);
                    if (isCommand) {
                        const keybindingLabel = this.getKeybindingLabel(command);
                        if (keybindingLabel) {
                            container.appendChild((0, dom_1.$)('span.shortcut-message', {}, (0, nls_1.localize)('gettingStarted.keyboardTip', 'Tip: Use keyboard shortcut '), (0, dom_1.$)('span.keybinding', {}, keybindingLabel)));
                        }
                    }
                    this.detailsPageDisposables.add(button);
                }
                else {
                    const p = (0, dom_1.append)(container, (0, dom_1.$)('p'));
                    for (const node of linkedText.nodes) {
                        if (typeof node === 'string') {
                            const labelWithIcon = (0, iconLabels_1.renderLabelWithIcons)(node);
                            for (const element of labelWithIcon) {
                                if (typeof element === 'string') {
                                    p.appendChild((0, formattedTextRenderer_1.renderFormattedText)(element, { inline: true, renderCodeSegments: true }));
                                }
                                else {
                                    p.appendChild(element);
                                }
                            }
                        }
                        else {
                            const link = this.instantiationService.createInstance(link_1.Link, p, node, { opener: (href) => this.runStepCommand(href) });
                            this.detailsPageDisposables.add(link);
                        }
                    }
                }
            }
            return container;
        }
        clearInput() {
            this.stepDisposables.clear();
            super.clearInput();
        }
        buildCategorySlide(categoryID, selectedStep) {
            if (this.detailsScrollbar) {
                this.detailsScrollbar.dispose();
            }
            this.extensionService.whenInstalledExtensionsRegistered().then(() => {
                // Remove internal extension id specifier from exposed id's
                this.extensionService.activateByEvent(`onWalkthrough:${categoryID.replace(/[^#]+#/, '')}`);
            });
            this.detailsPageDisposables.clear();
            this.mediaDisposables.clear();
            const category = this.gettingStartedCategories.find(category => category.id === categoryID);
            if (!category) {
                throw Error('could not find category with ID ' + categoryID);
            }
            const categoryDescriptorComponent = (0, dom_1.$)('.getting-started-category', {}, this.iconWidgetFor(category), (0, dom_1.$)('.category-description-container', {}, (0, dom_1.$)('h2.category-title.max-lines-3', { 'x-category-title-for': category.id }, ...(0, iconLabels_1.renderLabelWithIcons)(category.title)), (0, dom_1.$)('.category-description.description.max-lines-3', { 'x-category-description-for': category.id }, ...(0, iconLabels_1.renderLabelWithIcons)(category.description))));
            const stepListContainer = (0, dom_1.$)('.step-list-container');
            this.detailsPageDisposables.add((0, dom_1.addDisposableListener)(stepListContainer, 'keydown', (e) => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                const currentStepIndex = () => category.steps.findIndex(e => e.id === this.editorInput.selectedStep);
                if (event.keyCode === 16 /* KeyCode.UpArrow */) {
                    const toExpand = category.steps.filter((step, index) => index < currentStepIndex() && this.contextService.contextMatchesRules(step.when));
                    if (toExpand.length) {
                        this.selectStep(toExpand[toExpand.length - 1].id, false);
                    }
                }
                if (event.keyCode === 18 /* KeyCode.DownArrow */) {
                    const toExpand = category.steps.find((step, index) => index > currentStepIndex() && this.contextService.contextMatchesRules(step.when));
                    if (toExpand) {
                        this.selectStep(toExpand.id, false);
                    }
                }
            }));
            let renderedSteps = undefined;
            const contextKeysToWatch = new Set(category.steps.flatMap(step => step.when.keys()));
            const buildStepList = () => {
                category.steps.sort((a, b) => a.order - b.order);
                const toRender = category.steps
                    .filter(step => this.contextService.contextMatchesRules(step.when));
                if ((0, arrays_1.equals)(renderedSteps, toRender, (a, b) => a.id === b.id)) {
                    return;
                }
                renderedSteps = toRender;
                (0, dom_1.reset)(stepListContainer, ...renderedSteps
                    .map(step => {
                    const codicon = (0, dom_1.$)('.codicon' + (step.done ? '.complete' + themables_1.ThemeIcon.asCSSSelector(gettingStartedIcons_1.gettingStartedCheckedCodicon) : themables_1.ThemeIcon.asCSSSelector(gettingStartedIcons_1.gettingStartedUncheckedCodicon)), {
                        'data-done-step-id': step.id,
                        'x-dispatch': 'toggleStepCompletion:' + step.id,
                        'role': 'checkbox',
                        'tabindex': '0',
                    });
                    const container = (0, dom_1.$)('.step-description-container', { 'x-step-description-for': step.id });
                    this.buildStepMarkdownDescription(container, step.description);
                    const stepTitle = (0, dom_1.$)('h3.step-title.max-lines-3', { 'x-step-title-for': step.id });
                    (0, dom_1.reset)(stepTitle, ...(0, iconLabels_1.renderLabelWithIcons)(step.title));
                    const stepDescription = (0, dom_1.$)('.step-container', {}, stepTitle, container);
                    if (step.media.type === 'image') {
                        stepDescription.appendChild((0, dom_1.$)('.image-description', { 'aria-label': (0, nls_1.localize)('imageShowing', "Image showing {0}", step.media.altText) }));
                    }
                    return (0, dom_1.$)('button.getting-started-step', {
                        'x-dispatch': 'selectTask:' + step.id,
                        'data-step-id': step.id,
                        'aria-expanded': 'false',
                        'aria-checked': '' + step.done,
                        'role': 'button',
                    }, codicon, stepDescription);
                }));
            };
            buildStepList();
            this.detailsPageDisposables.add(this.contextService.onDidChangeContext(e => {
                if (e.affectsSome(contextKeysToWatch)) {
                    buildStepList();
                    this.registerDispatchListeners();
                    this.selectStep(this.editorInput.selectedStep, false);
                }
            }));
            const showNextCategory = this.gettingStartedCategories.find(_category => _category.id === category.next);
            const stepsContainer = (0, dom_1.$)('.getting-started-detail-container', { 'role': 'list' }, stepListContainer, (0, dom_1.$)('.done-next-container', {}, (0, dom_1.$)('button.button-link.all-done', { 'x-dispatch': 'allDone' }, (0, dom_1.$)('span.codicon.codicon-check-all'), (0, nls_1.localize)('allDone', "Mark Done")), ...(showNextCategory
                ? [(0, dom_1.$)('button.button-link.next', { 'x-dispatch': 'nextSection' }, (0, nls_1.localize)('nextOne', "Next Section"), (0, dom_1.$)('span.codicon.codicon-arrow-right'))]
                : [])));
            this.detailsScrollbar = this._register(new scrollableElement_1.DomScrollableElement(stepsContainer, { className: 'steps-container' }));
            const stepListComponent = this.detailsScrollbar.getDomNode();
            const categoryFooter = (0, dom_1.$)('.getting-started-footer');
            if (this.editorInput.showTelemetryNotice && (0, telemetryUtils_1.getTelemetryLevel)(this.configurationService) !== 0 /* TelemetryLevel.NONE */ && this.productService.enableTelemetry) {
                this.buildTelemetryFooter(categoryFooter);
            }
            (0, dom_1.reset)(this.stepsContent, categoryDescriptorComponent, stepListComponent, this.stepMediaComponent, categoryFooter);
            const toExpand = category.steps.find(step => this.contextService.contextMatchesRules(step.when) && !step.done) ?? category.steps[0];
            this.selectStep(selectedStep ?? toExpand.id, !selectedStep);
            this.detailsScrollbar.scanDomNode();
            this.detailsPageScrollbar?.scanDomNode();
            this.registerDispatchListeners();
        }
        buildTelemetryFooter(parent) {
            const mdRenderer = this.instantiationService.createInstance(markdownRenderer_1.MarkdownRenderer, {});
            const privacyStatementCopy = (0, nls_1.localize)('privacy statement', "privacy statement");
            const privacyStatementButton = `[${privacyStatementCopy}](command:workbench.action.openPrivacyStatementUrl)`;
            const optOutCopy = (0, nls_1.localize)('optOut', "opt out");
            const optOutButton = `[${optOutCopy}](command:settings.filterByTelemetry)`;
            const text = (0, nls_1.localize)({ key: 'footer', comment: ['fist substitution is "vs code", second is "privacy statement", third is "opt out".'] }, "{0} collects usage data. Read our {1} and learn how to {2}.", this.productService.nameShort, privacyStatementButton, optOutButton);
            parent.append(mdRenderer.render({ value: text, isTrusted: true }).element);
            mdRenderer.dispose();
        }
        getKeybindingLabel(command) {
            command = command.replace(/^command:/, '');
            const label = this.keybindingService.lookupKeybinding(command)?.getLabel();
            if (!label) {
                return '';
            }
            else {
                return `(${label})`;
            }
        }
        async scrollPrev() {
            this.inProgressScroll = this.inProgressScroll.then(async () => {
                this.currentWalkthrough = undefined;
                this.editorInput.selectedCategory = undefined;
                this.editorInput.selectedStep = undefined;
                this.editorInput.showTelemetryNotice = false;
                this.selectStep(undefined);
                this.setSlide('categories');
                this.container.focus();
            });
        }
        runSkip() {
            this.commandService.executeCommand('workbench.action.closeActiveEditor');
        }
        escape() {
            if (this.editorInput.selectedCategory) {
                this.scrollPrev();
            }
            else {
                this.runSkip();
            }
        }
        setSlide(toEnable) {
            const slideManager = (0, types_1.assertIsDefined)(this.container.querySelector('.gettingStarted'));
            if (toEnable === 'categories') {
                slideManager.classList.remove('showDetails');
                slideManager.classList.add('showCategories');
                this.container.querySelector('.prev-button.button-link').style.display = 'none';
                this.container.querySelector('.gettingStartedSlideDetails').querySelectorAll('button').forEach(button => button.disabled = true);
                this.container.querySelector('.gettingStartedSlideCategories').querySelectorAll('button').forEach(button => button.disabled = false);
                this.container.querySelector('.gettingStartedSlideCategories').querySelectorAll('input').forEach(button => button.disabled = false);
            }
            else {
                slideManager.classList.add('showDetails');
                slideManager.classList.remove('showCategories');
                this.container.querySelector('.prev-button.button-link').style.display = 'block';
                this.container.querySelector('.gettingStartedSlideDetails').querySelectorAll('button').forEach(button => button.disabled = false);
                this.container.querySelector('.gettingStartedSlideCategories').querySelectorAll('button').forEach(button => button.disabled = true);
                this.container.querySelector('.gettingStartedSlideCategories').querySelectorAll('input').forEach(button => button.disabled = true);
            }
        }
        focus() {
            const active = document.activeElement;
            let parent = this.container.parentElement;
            while (parent && parent !== active) {
                parent = parent.parentElement;
            }
            if (parent) {
                // Only set focus if there is no other focued element outside this chain.
                // This prevents us from stealing back focus from other focused elements such as quick pick due to delayed load.
                this.container.focus();
            }
        }
    };
    exports.GettingStartedPage = GettingStartedPage;
    exports.GettingStartedPage = GettingStartedPage = GettingStartedPage_1 = __decorate([
        __param(0, commands_1.ICommandService),
        __param(1, productService_1.IProductService),
        __param(2, keybinding_1.IKeybindingService),
        __param(3, gettingStartedService_1.IWalkthroughsService),
        __param(4, featuredExtensionService_1.IFeaturedExtensionsService),
        __param(5, configuration_1.IConfigurationService),
        __param(6, telemetry_1.ITelemetryService),
        __param(7, language_1.ILanguageService),
        __param(8, files_1.IFileService),
        __param(9, opener_1.IOpenerService),
        __param(10, themeService_1.IThemeService),
        __param(11, storage_1.IStorageService),
        __param(12, extensions_1.IExtensionService),
        __param(13, instantiation_1.IInstantiationService),
        __param(14, notification_1.INotificationService),
        __param(15, editorGroupsService_1.IEditorGroupsService),
        __param(16, contextkey_1.IContextKeyService),
        __param(17, quickInput_1.IQuickInputService),
        __param(18, workspaces_1.IWorkspacesService),
        __param(19, label_1.ILabelService),
        __param(20, host_1.IHostService),
        __param(21, webview_1.IWebviewService),
        __param(22, workspace_1.IWorkspaceContextService),
        __param(23, accessibility_1.IAccessibilityService),
        __param(24, extensionManagement_1.IExtensionManagementService)
    ], GettingStartedPage);
    class GettingStartedInputSerializer {
        canSerialize(editorInput) {
            return true;
        }
        serialize(editorInput) {
            return JSON.stringify({ selectedCategory: editorInput.selectedCategory, selectedStep: editorInput.selectedStep });
        }
        deserialize(instantiationService, serializedEditorInput) {
            try {
                const { selectedCategory, selectedStep } = JSON.parse(serializedEditorInput);
                return new gettingStartedInput_1.GettingStartedInput({ selectedCategory, selectedStep });
            }
            catch { }
            return new gettingStartedInput_1.GettingStartedInput({});
        }
    }
    exports.GettingStartedInputSerializer = GettingStartedInputSerializer;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0dGluZ1N0YXJ0ZWQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi93ZWxjb21lR2V0dGluZ1N0YXJ0ZWQvYnJvd3Nlci9nZXR0aW5nU3RhcnRlZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBMEVoRyxNQUFNLHdCQUF3QixHQUFHLEdBQUcsQ0FBQztJQUNyQyxNQUFNLGdCQUFnQixHQUFHLHlCQUF5QixDQUFDO0lBRXRDLFFBQUEsNEJBQTRCLEdBQUcsSUFBSSwwQkFBYSxDQUFVLHVCQUF1QixFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzFGLFFBQUEsZ0JBQWdCLEdBQUcsSUFBSSwwQkFBYSxDQUFVLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQztJQVkvRSxNQUFNLGtCQUFrQixHQUE2QixvQ0FBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDaEYsT0FBTyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTztRQUMxQixXQUFXLEVBQUUsQ0FBQyxDQUFDLFdBQVc7UUFDMUIsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRTtRQUNwQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUU7UUFDUixLQUFLLEVBQUUsQ0FBQztRQUNSLEtBQUssRUFBRSxDQUFDLENBQUMsS0FBSztRQUNkLElBQUksRUFBRSwyQkFBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksMkJBQWMsQ0FBQyxJQUFJLEVBQUU7S0FDakUsQ0FBQyxDQUFDLENBQUM7SUFrQkosTUFBTSxrQkFBa0IsR0FBRywyQ0FBMkMsQ0FBQztJQUNoRSxJQUFNLGtCQUFrQixHQUF4QixNQUFNLGtCQUFt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