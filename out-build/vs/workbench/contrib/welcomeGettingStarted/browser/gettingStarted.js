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
define(["require", "exports", "vs/nls!vs/workbench/contrib/welcomeGettingStarted/browser/gettingStarted", "vs/platform/instantiation/common/instantiation", "vs/base/common/lifecycle", "vs/base/common/types", "vs/base/browser/dom", "vs/platform/commands/common/commands", "vs/platform/product/common/productService", "vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedService", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/platform/keybinding/common/keybinding", "vs/platform/telemetry/common/telemetry", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedIcons", "vs/platform/opener/common/opener", "vs/base/common/uri", "vs/workbench/browser/parts/editor/editorPane", "vs/platform/storage/common/storage", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/workspaces/common/workspaces", "vs/platform/workspace/common/workspace", "vs/platform/label/common/label", "vs/base/common/labels", "vs/workbench/services/host/browser/host", "vs/base/common/platform", "vs/base/common/async", "vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedInput", "vs/workbench/services/editor/common/editorGroupsService", "vs/platform/quickinput/common/quickInput", "vs/base/browser/ui/button/button", "vs/platform/opener/browser/link", "vs/base/browser/formattedTextRenderer", "vs/workbench/contrib/webview/browser/webview", "vs/editor/common/languages/language", "vs/workbench/services/extensions/common/extensions", "vs/base/common/uuid", "vs/platform/files/common/files", "vs/base/common/marshalling", "vs/platform/notification/common/notification", "vs/base/common/network", "vs/base/common/arrays", "vs/workbench/services/themes/common/workbenchThemeService", "vs/workbench/contrib/welcomeGettingStarted/common/gettingStartedContent", "vs/editor/contrib/markdownRenderer/browser/markdownRenderer", "./gettingStartedList", "vs/base/browser/keyboardEvent", "vs/platform/telemetry/common/telemetryUtils", "vs/workbench/common/contextkeys", "vs/workbench/browser/actions/workspaceActions", "vs/workbench/browser/actions/windowActions", "vs/base/browser/ui/toggle/toggle", "vs/base/common/codicons", "vs/workbench/contrib/welcomeGettingStarted/browser/startupPage", "vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedDetailsRenderer", "vs/platform/accessibility/common/accessibility", "vs/base/browser/ui/iconLabel/iconLabels", "vs/platform/theme/browser/defaultStyles", "vs/workbench/contrib/welcomeGettingStarted/browser/featuredExtensionService", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensions/common/extensions", "vs/base/common/errors", "vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedColors", "vs/css!./media/gettingStarted"], function (require, exports, nls_1, instantiation_1, lifecycle_1, types_1, dom_1, commands_1, productService_1, gettingStartedService_1, themeService_1, themables_1, keybinding_1, telemetry_1, scrollableElement_1, gettingStartedIcons_1, opener_1, uri_1, editorPane_1, storage_1, configuration_1, contextkey_1, workspaces_1, workspace_1, label_1, labels_1, host_1, platform_1, async_1, gettingStartedInput_1, editorGroupsService_1, quickInput_1, button_1, link_1, formattedTextRenderer_1, webview_1, language_1, extensions_1, uuid_1, files_1, marshalling_1, notification_1, network_1, arrays_1, workbenchThemeService_1, gettingStartedContent_1, markdownRenderer_1, gettingStartedList_1, keyboardEvent_1, telemetryUtils_1, contextkeys_1, workspaceActions_1, windowActions_1, toggle_1, codicons_1, startupPage_1, gettingStartedDetailsRenderer_1, accessibility_1, iconLabels_1, defaultStyles_1, featuredExtensionService_1, extensionManagement_1, extensions_2, errors_1) {
    "use strict";
    var $VYb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$WYb = exports.$VYb = exports.$UYb = exports.$TYb = void 0;
    const SLIDE_TRANSITION_TIME_MS = 250;
    const configurationKey = 'workbench.startupEditor';
    exports.$TYb = new contextkey_1.$2i('allWalkthroughsHidden', false);
    exports.$UYb = new contextkey_1.$2i('inWelcome', false);
    const parsedStartEntries = gettingStartedContent_1.$TXb.map((e, i) => ({
        command: e.content.command,
        description: e.description,
        icon: { type: 'icon', icon: e.icon },
        id: e.id,
        order: i,
        title: e.title,
        when: contextkey_1.$Ii.deserialize(e.when) ?? contextkey_1.$Ii.true()
    }));
    const REDUCED_MOTION_KEY = 'workbench.welcomePage.preferReducedMotion';
    let $VYb = class $VYb extends editorPane_1.$0T {
        static { $VYb_1 = this; }
        static { this.ID = 'gettingStartedPage'; }
        constructor(Ab, Bb, Cb, Db, Eb, Fb, telemetryService, Gb, Hb, Ib, themeService, Jb, Kb, Lb, Mb, Nb, contextService, Ob, Pb, Qb, Rb, Sb, Tb, Ub, Vb) {
            super($VYb_1.ID, telemetryService, themeService, Jb);
            this.Ab = Ab;
            this.Bb = Bb;
            this.Cb = Cb;
            this.Db = Db;
            this.Eb = Eb;
            this.Fb = Fb;
            this.Gb = Gb;
            this.Hb = Hb;
            this.Ib = Ib;
            this.Jb = Jb;
            this.Kb = Kb;
            this.Lb = Lb;
            this.Mb = Mb;
            this.Nb = Nb;
            this.Ob = Ob;
            this.Pb = Pb;
            this.Qb = Qb;
            this.Rb = Rb;
            this.Sb = Sb;
            this.Tb = Tb;
            this.Ub = Ub;
            this.Vb = Vb;
            this.g = Promise.resolve();
            this.j = new lifecycle_1.$jc();
            this.m = new lifecycle_1.$jc();
            this.r = new lifecycle_1.$jc();
            this.u = new lifecycle_1.$jc();
            this.kb = new async_1.$Ag();
            this.nb = false;
            this.gc = undefined;
            this.hc = undefined;
            this.lb = (0, dom_1.$)('.gettingStartedContainer', {
                role: 'document',
                tabindex: 0,
                'aria-label': (0, nls_1.localize)(0, null)
            });
            this.vb = (0, dom_1.$)('.getting-started-media');
            this.vb.id = (0, uuid_1.$4f)();
            this.zb = this.B(new lifecycle_1.$jc());
            this.yb = new gettingStartedDetailsRenderer_1.$QYb(this.Hb, this.Mb, this.Kb, this.Gb);
            this.mb = this.B(contextService.createScoped(this.lb));
            exports.$UYb.bindTo(this.mb).set(true);
            this.eb = this.Db.getWalkthroughs();
            this.fb = this.Eb.getExtensions();
            this.B(this.j);
            this.kb = new async_1.$Ag();
            const rerender = () => {
                this.eb = this.Db.getWalkthroughs();
                this.fb = this.Eb.getExtensions();
                this.kb.queue(async () => await this.mc());
            };
            this.B(this.Vb.onDidInstallExtensions(async (result) => {
                for (const e of result) {
                    const installedFeaturedExtension = (await this.fb)?.find(ext => extensions_2.$Vl.equals(ext.id, e.identifier.id));
                    if (installedFeaturedExtension) {
                        this.ac(e.identifier.id);
                    }
                }
            }));
            this.B(this.Db.onDidAddWalkthrough(rerender));
            this.B(this.Db.onDidRemoveWalkthrough(rerender));
            this.y = this.Pb.getRecentlyOpened();
            this.B(Pb.onDidChangeRecentlyOpened(() => {
                this.y = Pb.getRecentlyOpened();
                rerender();
            }));
            this.B(this.Db.onDidChangeWalkthrough(category => {
                const ourCategory = this.eb.find(c => c.id === category.id);
                if (!ourCategory) {
                    return;
                }
                ourCategory.title = category.title;
                ourCategory.description = category.description;
                this.lb.querySelectorAll(`[x-category-title-for="${category.id}"]`).forEach(step => step.innerText = ourCategory.title);
                this.lb.querySelectorAll(`[x-category-description-for="${category.id}"]`).forEach(step => step.innerText = ourCategory.description);
            }));
            this.B(this.Db.onDidProgressStep(step => {
                const category = this.eb.find(category => category.id === step.category);
                if (!category) {
                    throw Error('Could not find category with ID: ' + step.category);
                }
                const ourStep = category.steps.find(_step => _step.id === step.id);
                if (!ourStep) {
                    throw Error('Could not find step with ID: ' + step.id);
                }
                const stats = this.Xb(category);
                if (!ourStep.done && stats.stepsComplete === stats.stepsTotal - 1) {
                    this.$b(category.id);
                }
                this.B(this.Fb.onDidChangeConfiguration(e => {
                    if (e.affectsConfiguration(REDUCED_MOTION_KEY)) {
                        this.lb.classList.toggle('animatable', this.Wb());
                    }
                }));
                ourStep.done = step.done;
                if (category.id === this.gb?.id) {
                    const badgeelements = (0, types_1.$uf)(document.querySelectorAll(`[data-done-step-id="${step.id}"]`));
                    badgeelements.forEach(badgeelement => {
                        if (step.done) {
                            badgeelement.parentElement?.setAttribute('aria-checked', 'true');
                            badgeelement.classList.remove(...themables_1.ThemeIcon.asClassNameArray(gettingStartedIcons_1.$JYb));
                            badgeelement.classList.add('complete', ...themables_1.ThemeIcon.asClassNameArray(gettingStartedIcons_1.$KYb));
                        }
                        else {
                            badgeelement.parentElement?.setAttribute('aria-checked', 'false');
                            badgeelement.classList.remove('complete', ...themables_1.ThemeIcon.asClassNameArray(gettingStartedIcons_1.$KYb));
                            badgeelement.classList.add(...themables_1.ThemeIcon.asClassNameArray(gettingStartedIcons_1.$JYb));
                        }
                    });
                }
                this.rc();
            }));
        }
        // remove when 'workbench.welcomePage.preferReducedMotion' deprecated
        Wb() {
            if (this.Fb.getValue(REDUCED_MOTION_KEY)) {
                return false;
            }
            if (this.Ub.isMotionReduced()) {
                return false;
            }
            return true;
        }
        Xb(walkthrough) {
            const activeSteps = walkthrough.steps.filter(s => this.mb.contextMatchesRules(s.when));
            return {
                stepsComplete: activeSteps.filter(s => s.done).length,
                stepsTotal: activeSteps.length,
            };
        }
        async setInput(newInput, options, context, token) {
            this.lb.classList.remove('animatable');
            this.f = newInput;
            await super.setInput(newInput, options, context, token);
            await this.mc();
            if (this.Wb()) {
                setTimeout(() => this.lb.classList.add('animatable'), 0);
            }
        }
        async makeCategoryVisibleWhenAvailable(categoryID, stepId) {
            this.sc(categoryID, stepId);
        }
        Yb() {
            this.j.clear();
            this.lb.querySelectorAll('[x-dispatch]').forEach(element => {
                const [command, argument] = (element.getAttribute('x-dispatch') ?? '').split(':');
                if (command) {
                    this.j.add((0, dom_1.$nO)(element, 'click', (e) => {
                        e.stopPropagation();
                        this.Zb(command, argument);
                    }));
                    this.j.add((0, dom_1.$nO)(element, 'keyup', (e) => {
                        const keyboardEvent = new keyboardEvent_1.$jO(e);
                        e.stopPropagation();
                        switch (keyboardEvent.keyCode) {
                            case 3 /* KeyCode.Enter */:
                            case 10 /* KeyCode.Space */:
                                this.Zb(command, argument);
                                return;
                        }
                    }));
                }
            });
        }
        async Zb(command, argument) {
            this.Ab.executeCommand('workbench.action.keepEditor');
            this.P.publicLog2('gettingStarted.ActionExecuted', { command, argument, walkthroughId: this.gb?.id });
            switch (command) {
                case 'scrollPrev': {
                    this.zc();
                    break;
                }
                case 'skip': {
                    this.Ac();
                    break;
                }
                case 'showMoreRecents': {
                    this.Ab.executeCommand(windowActions_1.$1tb.ID);
                    break;
                }
                case 'seeAllWalkthroughs': {
                    await this.dc();
                    break;
                }
                case 'openFolder': {
                    if (this.mb.contextMatchesRules(contextkey_1.$Ii.and(contextkeys_1.$Pcb.isEqualTo('workspace')))) {
                        this.Ab.executeCommand(workspaceActions_1.$5tb.ID);
                    }
                    else {
                        this.Ab.executeCommand(platform_1.$j ? 'workbench.action.files.openFileFolder' : 'workbench.action.files.openFolder');
                    }
                    break;
                }
                case 'selectCategory': {
                    this.sc(argument);
                    this.Db.markWalkthroughOpened(argument);
                    break;
                }
                case 'selectStartEntry': {
                    const selected = gettingStartedContent_1.$TXb.find(e => e.id === argument);
                    if (selected) {
                        this.uc(selected.content.command);
                    }
                    else {
                        throw Error('could not find start entry with id: ' + argument);
                    }
                    break;
                }
                case 'hideCategory': {
                    this.$b(argument);
                    break;
                }
                // Use selectTask over selectStep to keep telemetry consistant:https://github.com/microsoft/vscode/issues/122256
                case 'selectTask': {
                    this.jc(argument);
                    break;
                }
                case 'toggleStepCompletion': {
                    this.cc(argument);
                    break;
                }
                case 'allDone': {
                    this.bc();
                    break;
                }
                case 'nextSection': {
                    const next = this.gb?.next;
                    if (next) {
                        this.sc(next);
                    }
                    else {
                        console.error('Error scrolling to next section of', this.gb);
                    }
                    break;
                }
                case 'openExtensionPage': {
                    this.Ab.executeCommand('extension.open', argument);
                    break;
                }
                case 'hideExtension': {
                    this.ac(argument);
                    break;
                }
                default: {
                    console.error('Dispatch to', command, argument, 'not defined');
                    break;
                }
            }
        }
        $b(categoryId) {
            const selectedCategory = this.eb.find(category => category.id === categoryId);
            if (!selectedCategory) {
                throw Error('Could not find category with ID ' + categoryId);
            }
            this.fc([...this.ec().add(categoryId)]);
            this.qb?.rerender();
        }
        ac(extensionId) {
            this.fc([...this.ec().add(extensionId)]);
            this.rb?.rerender();
            this.Yb();
        }
        bc() {
            if (this.gb) {
                this.gb?.steps.forEach(step => {
                    if (!step.done) {
                        this.Db.progressStep(step.id);
                    }
                });
                this.$b(this.gb?.id);
                this.zc();
            }
            else {
                throw Error('No walkthrough opened');
            }
        }
        cc(argument) {
            const stepToggle = (0, types_1.$uf)(this.gb?.steps.find(step => step.id === argument));
            if (stepToggle.done) {
                this.Db.deprogressStep(argument);
            }
            else {
                this.Db.progressStep(argument);
            }
        }
        async dc() {
            const selection = await this.Ob.pick(this.eb
                .filter(c => this.mb.contextMatchesRules(c.when))
                .map(x => ({
                id: x.id,
                label: x.title,
                detail: x.description,
                description: x.source,
            })), { canPickMany: false, matchOnDescription: true, matchOnDetail: true, title: (0, nls_1.localize)(1, null) });
            if (selection) {
                this.Zb('selectCategory', selection.id);
            }
        }
        ec() {
            return new Set(JSON.parse(this.Jb.get(gettingStartedService_1.$YXb, 0 /* StorageScope.PROFILE */, '[]')));
        }
        fc(hidden) {
            this.Jb.store(gettingStartedService_1.$YXb, JSON.stringify(hidden), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
        }
        async ic(stepId) {
            if (!this.gb) {
                throw Error('no walkthrough selected');
            }
            const stepToExpand = (0, types_1.$uf)(this.gb.steps.find(step => step.id === stepId));
            if (this.gc === stepId) {
                return;
            }
            this.gc = stepId;
            this.m.clear();
            this.m.add({
                dispose: () => {
                    this.gc = undefined;
                }
            });
            if (this.hc !== stepToExpand.media.type) {
                this.hc = stepToExpand.media.type;
                this.u.add((0, lifecycle_1.$ic)(() => {
                    this.hc = undefined;
                }));
                (0, dom_1.$lO)(this.vb);
                if (stepToExpand.media.type === 'svg') {
                    this.wb = this.u.add(this.Sb.createWebviewElement({ title: undefined, options: { disableServiceWorker: true }, contentOptions: {}, extension: undefined }));
                    this.wb.mountTo(this.vb);
                }
                else if (stepToExpand.media.type === 'markdown') {
                    this.wb = this.u.add(this.Sb.createWebviewElement({ options: {}, contentOptions: { localResourceRoots: [stepToExpand.media.root], allowScripts: true }, title: '', extension: undefined }));
                    this.wb.mountTo(this.vb);
                }
            }
            if (stepToExpand.media.type === 'image') {
                this.ub.classList.add('image');
                this.ub.classList.remove('markdown');
                const media = stepToExpand.media;
                const mediaElement = (0, dom_1.$)('img');
                (0, dom_1.$lO)(this.vb);
                this.vb.appendChild(mediaElement);
                mediaElement.setAttribute('alt', media.altText);
                this.kc(mediaElement, media.path);
                this.m.add((0, dom_1.$nO)(this.vb, 'click', () => {
                    const hrefs = (0, arrays_1.$Pb)(stepToExpand.description.map(lt => lt.nodes.filter((node) => typeof node !== 'string').map(node => node.href)));
                    if (hrefs.length === 1) {
                        const href = hrefs[0];
                        if (href.startsWith('http')) {
                            this.P.publicLog2('gettingStarted.ActionExecuted', { command: 'runStepAction', argument: href, walkthroughId: this.gb?.id });
                            this.Ib.open(href);
                        }
                    }
                }));
                this.m.add(this.n.onDidColorThemeChange(() => this.kc(mediaElement, media.path)));
            }
            else if (stepToExpand.media.type === 'svg') {
                this.ub.classList.add('image');
                this.ub.classList.remove('markdown');
                const media = stepToExpand.media;
                this.wb.setHtml(await this.yb.renderSVG(media.path));
                let isDisposed = false;
                this.m.add((0, lifecycle_1.$ic)(() => { isDisposed = true; }));
                this.m.add(this.n.onDidColorThemeChange(async () => {
                    // Render again since color vars change
                    const body = await this.yb.renderSVG(media.path);
                    if (!isDisposed) { // Make sure we weren't disposed of in the meantime
                        this.wb.setHtml(body);
                    }
                }));
                this.m.add((0, dom_1.$nO)(this.vb, 'click', () => {
                    const hrefs = (0, arrays_1.$Pb)(stepToExpand.description.map(lt => lt.nodes.filter((node) => typeof node !== 'string').map(node => node.href)));
                    if (hrefs.length === 1) {
                        const href = hrefs[0];
                        if (href.startsWith('http')) {
                            this.P.publicLog2('gettingStarted.ActionExecuted', { command: 'runStepAction', argument: href, walkthroughId: this.gb?.id });
                            this.Ib.open(href);
                        }
                    }
                }));
                this.m.add(this.wb.onDidClickLink(link => {
                    if ((0, opener_1.$OT)(link, network_1.Schemas.https) || (0, opener_1.$OT)(link, network_1.Schemas.http) || ((0, opener_1.$OT)(link, network_1.Schemas.command))) {
                        this.Ib.open(link, { allowCommands: true });
                    }
                }));
            }
            else if (stepToExpand.media.type === 'markdown') {
                this.ub.classList.remove('image');
                this.ub.classList.add('markdown');
                const media = stepToExpand.media;
                const rawHTML = await this.yb.renderMarkdown(media.path, media.base);
                this.wb.setHtml(rawHTML);
                const serializedContextKeyExprs = rawHTML.match(/checked-on=\"([^'][^"]*)\"/g)?.map(attr => attr.slice('checked-on="'.length, -1)
                    .replace(/&#39;/g, '\'')
                    .replace(/&amp;/g, '&'));
                const postTrueKeysMessage = () => {
                    const enabledContextKeys = serializedContextKeyExprs?.filter(expr => this.mb.contextMatchesRules(contextkey_1.$Ii.deserialize(expr)));
                    if (enabledContextKeys) {
                        this.wb.postMessage({
                            enabledContextKeys
                        });
                    }
                };
                if (serializedContextKeyExprs) {
                    const contextKeyExprs = (0, arrays_1.$Fb)(serializedContextKeyExprs.map(expr => contextkey_1.$Ii.deserialize(expr)));
                    const watchingKeys = new Set((0, arrays_1.$Pb)(contextKeyExprs.map(expr => expr.keys())));
                    this.m.add(this.mb.onDidChangeContext(e => {
                        if (e.affectsSome(watchingKeys)) {
                            postTrueKeysMessage();
                        }
                    }));
                }
                let isDisposed = false;
                this.m.add((0, lifecycle_1.$ic)(() => { isDisposed = true; }));
                this.m.add(this.wb.onDidClickLink(link => {
                    if ((0, opener_1.$OT)(link, network_1.Schemas.https) || (0, opener_1.$OT)(link, network_1.Schemas.http) || ((0, opener_1.$OT)(link, network_1.Schemas.command))) {
                        this.Ib.open(link, { allowCommands: true });
                    }
                }));
                if (rawHTML.indexOf('<code>') >= 0) {
                    // Render again when Theme changes since syntax highlighting of code blocks may have changed
                    this.m.add(this.n.onDidColorThemeChange(async () => {
                        const body = await this.yb.renderMarkdown(media.path, media.base);
                        if (!isDisposed) { // Make sure we weren't disposed of in the meantime
                            this.wb.setHtml(body);
                            postTrueKeysMessage();
                        }
                    }));
                }
                const layoutDelayer = new async_1.$Dg(50);
                this.xb = () => {
                    layoutDelayer.trigger(() => {
                        this.wb.postMessage({ layoutMeNow: true });
                    });
                };
                this.m.add(layoutDelayer);
                this.m.add({ dispose: () => this.xb = undefined });
                postTrueKeysMessage();
                this.m.add(this.wb.onMessage(e => {
                    const message = e.message;
                    if (message.startsWith('command:')) {
                        this.Ib.open(message, { allowCommands: true });
                    }
                    else if (message.startsWith('setTheme:')) {
                        this.Fb.updateValue(workbenchThemeService_1.ThemeSettings.COLOR_THEME, message.slice('setTheme:'.length), 2 /* ConfigurationTarget.USER */);
                    }
                    else {
                        console.error('Unexpected message', message);
                    }
                }));
            }
        }
        async selectStepLoose(id) {
            // Allow passing in id with a category appended or with just the id of the step
            if (id.startsWith(`${this.f.selectedCategory}#`)) {
                this.jc(id);
            }
            else {
                const toSelect = this.f.selectedCategory + '#' + id;
                this.jc(toSelect);
            }
        }
        async jc(id, delayFocus = true) {
            if (id) {
                let stepElement = this.lb.querySelector(`[data-step-id="${id}"]`);
                if (!stepElement) {
                    // Selected an element that is not in-context, just fallback to whatever.
                    stepElement = this.lb.querySelector(`[data-step-id]`);
                    if (!stepElement) {
                        // No steps around... just ignore.
                        return;
                    }
                    id = (0, types_1.$uf)(stepElement.getAttribute('data-step-id'));
                }
                stepElement.parentElement?.querySelectorAll('.expanded').forEach(node => {
                    if (node.getAttribute('data-step-id') !== id) {
                        node.classList.remove('expanded');
                        node.setAttribute('aria-expanded', 'false');
                    }
                });
                setTimeout(() => stepElement.focus(), delayFocus && this.Wb() ? SLIDE_TRANSITION_TIME_MS : 0);
                this.f.selectedStep = id;
                stepElement.classList.add('expanded');
                stepElement.setAttribute('aria-expanded', 'true');
                this.ic(id);
                this.Db.progressStep(id);
            }
            else {
                this.f.selectedStep = undefined;
            }
            this.ib?.scanDomNode();
            this.jb?.scanDomNode();
        }
        kc(element, sources) {
            const themeType = this.n.getColorTheme().type;
            const src = sources[themeType].toString(true).replace(/ /g, '%20');
            element.srcset = src.toLowerCase().endsWith('.svg') ? src : (src + ' 1.5x');
        }
        ab(parent) {
            if (this.ib) {
                this.ib.dispose();
            }
            if (this.hb) {
                this.hb.dispose();
            }
            this.tb = (0, dom_1.$)('.gettingStartedSlideCategories.gettingStartedSlide');
            const prevButton = (0, dom_1.$)('button.prev-button.button-link', { 'x-dispatch': 'scrollPrev' }, (0, dom_1.$)('span.scroll-button.codicon.codicon-chevron-left'), (0, dom_1.$)('span.moreText', {}, (0, nls_1.localize)(2, null)));
            this.sb = (0, dom_1.$)('.gettingStartedSlideDetails.gettingStartedSlide', {}, prevButton);
            this.ub = (0, dom_1.$)('.gettingStartedDetailsContent', {});
            this.ib = this.B(new scrollableElement_1.$UP(this.ub, { className: 'full-height-scrollable' }));
            this.hb = this.B(new scrollableElement_1.$UP(this.tb, { className: 'full-height-scrollable categoriesScrollbar' }));
            this.sb.appendChild(this.ib.getDomNode());
            const gettingStartedPage = (0, dom_1.$)('.gettingStarted', {}, this.hb.getDomNode(), this.sb);
            this.lb.appendChild(gettingStartedPage);
            this.hb.scanDomNode();
            this.ib.scanDomNode();
            parent.appendChild(this.lb);
        }
        async mc() {
            this.zb.clear();
            const showOnStartupCheckbox = new toggle_1.$KQ({
                icon: codicons_1.$Pj.check,
                actionClassName: 'getting-started-checkbox',
                isChecked: this.Fb.getValue(configurationKey) === 'welcomePage',
                title: (0, nls_1.localize)(3, null),
                ...defaultStyles_1.$m2
            });
            showOnStartupCheckbox.domNode.id = 'showOnStartup';
            const showOnStartupLabel = (0, dom_1.$)('label.caption', { for: 'showOnStartup' }, (0, nls_1.localize)(4, null));
            const onShowOnStartupChanged = () => {
                if (showOnStartupCheckbox.checked) {
                    this.P.publicLog2('gettingStarted.ActionExecuted', { command: 'showOnStartupChecked', argument: undefined, walkthroughId: this.gb?.id });
                    this.Fb.updateValue(configurationKey, 'welcomePage');
                }
                else {
                    this.P.publicLog2('gettingStarted.ActionExecuted', { command: 'showOnStartupUnchecked', argument: undefined, walkthroughId: this.gb?.id });
                    this.Fb.updateValue(configurationKey, 'none');
                }
            };
            this.zb.add(showOnStartupCheckbox);
            this.zb.add(showOnStartupCheckbox.onChange(() => {
                onShowOnStartupChanged();
            }));
            this.zb.add((0, dom_1.$nO)(showOnStartupLabel, 'click', () => {
                showOnStartupCheckbox.checked = !showOnStartupCheckbox.checked;
                onShowOnStartupChanged();
            }));
            const header = (0, dom_1.$)('.header', {}, (0, dom_1.$)('h1.product-name.caption', {}, this.Bb.nameLong), (0, dom_1.$)('p.subtitle.description', {}, (0, nls_1.localize)(5, null)));
            const leftColumn = (0, dom_1.$)('.categories-column.categories-column-left', {});
            const rightColumn = (0, dom_1.$)('.categories-column.categories-column-right', {});
            const startList = this.oc();
            const recentList = this.nc();
            const featuredExtensionList = this.qc();
            const gettingStartedList = this.pc();
            const footer = (0, dom_1.$)('.footer', {}, (0, dom_1.$)('p.showOnStartup', {}, showOnStartupCheckbox.domNode, showOnStartupLabel));
            const layoutLists = () => {
                if (gettingStartedList.itemCount) {
                    this.lb.classList.remove('noWalkthroughs');
                    (0, dom_1.$_O)(rightColumn, featuredExtensionList.getDomElement(), gettingStartedList.getDomElement());
                }
                else {
                    this.lb.classList.add('noWalkthroughs');
                    (0, dom_1.$_O)(rightColumn, featuredExtensionList.getDomElement());
                }
                setTimeout(() => this.hb?.scanDomNode(), 50);
                layoutRecentList();
            };
            const layoutFeaturedExtension = () => {
                if (featuredExtensionList.itemCount) {
                    this.lb.classList.remove('noExtensions');
                    (0, dom_1.$_O)(rightColumn, featuredExtensionList.getDomElement(), gettingStartedList.getDomElement());
                }
                else {
                    this.lb.classList.add('noExtensions');
                    (0, dom_1.$_O)(rightColumn, gettingStartedList.getDomElement());
                }
                setTimeout(() => this.hb?.scanDomNode(), 50);
                layoutRecentList();
            };
            const layoutRecentList = () => {
                if (this.lb.classList.contains('noWalkthroughs') && this.lb.classList.contains('noExtensions')) {
                    recentList.setLimit(10);
                    (0, dom_1.$_O)(leftColumn, startList.getDomElement());
                    (0, dom_1.$_O)(rightColumn, recentList.getDomElement());
                }
                else {
                    recentList.setLimit(5);
                    (0, dom_1.$_O)(leftColumn, startList.getDomElement(), recentList.getDomElement());
                }
            };
            featuredExtensionList.onDidChange(layoutFeaturedExtension);
            layoutFeaturedExtension();
            gettingStartedList.onDidChange(layoutLists);
            layoutLists();
            (0, dom_1.$_O)(this.tb, (0, dom_1.$)('.gettingStartedCategoriesContainer', {}, header, leftColumn, rightColumn, footer));
            this.hb?.scanDomNode();
            this.rc();
            this.Yb();
            if (this.f.selectedCategory) {
                this.gb = this.eb.find(category => category.id === this.f.selectedCategory);
                if (!this.gb) {
                    this.eb = this.Db.getWalkthroughs();
                    this.gb = this.eb.find(category => category.id === this.f.selectedCategory);
                    if (this.gb) {
                        this.wc(this.f.selectedCategory, this.f.selectedStep);
                        this.Bc('details');
                        return;
                    }
                }
            }
            const someStepsComplete = this.eb.some(category => category.steps.find(s => s.done));
            if (this.f.showTelemetryNotice && this.Bb.openToWelcomeMainPage) {
                const telemetryNotice = (0, dom_1.$)('p.telemetry-notice');
                this.xc(telemetryNotice);
                footer.appendChild(telemetryNotice);
            }
            else if (!this.Bb.openToWelcomeMainPage && !someStepsComplete && !this.nb) {
                const firstSessionDateString = this.Jb.get(telemetry_1.$_k, -1 /* StorageScope.APPLICATION */) || new Date().toUTCString();
                const daysSinceFirstSession = ((+new Date()) - (+new Date(firstSessionDateString))) / 1000 / 60 / 60 / 24;
                const fistContentBehaviour = daysSinceFirstSession < 1 ? 'openToFirstCategory' : 'index';
                if (fistContentBehaviour === 'openToFirstCategory') {
                    const first = this.eb.filter(c => !c.when || this.mb.contextMatchesRules(c.when))[0];
                    this.nb = true;
                    if (first) {
                        this.gb = first;
                        this.f.selectedCategory = this.gb?.id;
                        this.wc(this.f.selectedCategory, undefined);
                        this.Bc('details');
                        return;
                    }
                }
            }
            this.Bc('categories');
        }
        nc() {
            const renderRecent = (recent) => {
                let fullPath;
                let windowOpenable;
                if ((0, workspaces_1.$hU)(recent)) {
                    windowOpenable = { folderUri: recent.folderUri };
                    fullPath = recent.label || this.Qb.getWorkspaceLabel(recent.folderUri, { verbose: 2 /* Verbosity.LONG */ });
                }
                else {
                    fullPath = recent.label || this.Qb.getWorkspaceLabel(recent.workspace, { verbose: 2 /* Verbosity.LONG */ });
                    windowOpenable = { workspaceUri: recent.workspace.configPath };
                }
                const { name, parentPath } = (0, labels_1.$nA)(fullPath);
                const li = (0, dom_1.$)('li');
                const link = (0, dom_1.$)('button.button-link');
                link.innerText = name;
                link.title = fullPath;
                link.setAttribute('aria-label', (0, nls_1.localize)(6, null, name, parentPath));
                link.addEventListener('click', e => {
                    this.P.publicLog2('gettingStarted.ActionExecuted', { command: 'openRecent', argument: undefined, walkthroughId: this.gb?.id });
                    this.Rb.openWindow([windowOpenable], {
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
            if (this.ob) {
                this.ob.dispose();
            }
            const recentlyOpenedList = this.ob = new gettingStartedList_1.$NYb({
                title: (0, nls_1.localize)(7, null),
                klass: 'recently-opened',
                limit: 5,
                empty: (0, dom_1.$)('.empty-recent', {}, (0, nls_1.localize)(8, null), (0, dom_1.$)('button.button-link', { 'x-dispatch': 'openFolder' }, (0, nls_1.localize)(9, null)), (0, nls_1.localize)(10, null)),
                more: (0, dom_1.$)('.more', {}, (0, dom_1.$)('button.button-link', {
                    'x-dispatch': 'showMoreRecents',
                    title: (0, nls_1.localize)(11, null, this.yc(windowActions_1.$1tb.ID))
                }, (0, nls_1.localize)(12, null))),
                renderElement: renderRecent,
                contextService: this.mb
            });
            recentlyOpenedList.onDidChange(() => this.Yb());
            this.y.then(({ workspaces }) => {
                // Filter out the current workspace
                const workspacesWithID = workspaces
                    .filter(recent => !this.Tb.isCurrentWorkspace((0, workspaces_1.$gU)(recent) ? recent.workspace : recent.folderUri))
                    .map(recent => ({ ...recent, id: (0, workspaces_1.$gU)(recent) ? recent.workspace.id : recent.folderUri.toString() }));
                const updateEntries = () => {
                    recentlyOpenedList.setEntries(workspacesWithID);
                };
                updateEntries();
                recentlyOpenedList.register(this.Qb.onDidChangeFormatters(() => updateEntries()));
            }).catch(errors_1.$Y);
            return recentlyOpenedList;
        }
        oc() {
            const renderStartEntry = (entry) => (0, dom_1.$)('li', {}, (0, dom_1.$)('button.button-link', {
                'x-dispatch': 'selectStartEntry:' + entry.id,
                title: entry.description + ' ' + this.yc(entry.command),
            }, this.tc(entry), (0, dom_1.$)('span', {}, entry.title)));
            if (this.pb) {
                this.pb.dispose();
            }
            const startList = this.pb = new gettingStartedList_1.$NYb({
                title: (0, nls_1.localize)(13, null),
                klass: 'start-container',
                limit: 10,
                renderElement: renderStartEntry,
                rankElement: e => -e.order,
                contextService: this.mb
            });
            startList.setEntries(parsedStartEntries);
            startList.onDidChange(() => this.Yb());
            return startList;
        }
        pc() {
            const renderGetttingStaredWalkthrough = (category) => {
                const renderNewBadge = (category.newItems || category.newEntry) && !category.isFeatured;
                const newBadge = (0, dom_1.$)('.new-badge', {});
                if (category.newEntry) {
                    (0, dom_1.$_O)(newBadge, (0, dom_1.$)('.new-category', {}, (0, nls_1.localize)(14, null)));
                }
                else if (category.newItems) {
                    (0, dom_1.$_O)(newBadge, (0, dom_1.$)('.new-items', {}, (0, nls_1.localize)(15, null)));
                }
                const featuredBadge = (0, dom_1.$)('.featured-badge', {});
                const descriptionContent = (0, dom_1.$)('.description-content', {});
                if (category.isFeatured) {
                    (0, dom_1.$_O)(featuredBadge, (0, dom_1.$)('.featured', {}, (0, dom_1.$)('span.featured-icon.codicon.codicon-star-full')));
                    (0, dom_1.$_O)(descriptionContent, ...(0, iconLabels_1.$xQ)(category.description));
                }
                const titleContent = (0, dom_1.$)('h3.category-title.max-lines-3', { 'x-category-title-for': category.id });
                (0, dom_1.$_O)(titleContent, ...(0, iconLabels_1.$xQ)(category.title));
                return (0, dom_1.$)('button.getting-started-category' + (category.isFeatured ? '.featured' : ''), {
                    'x-dispatch': 'selectCategory:' + category.id,
                    'title': category.description
                }, featuredBadge, (0, dom_1.$)('.main-content', {}, this.tc(category), titleContent, renderNewBadge ? newBadge : (0, dom_1.$)('.no-badge'), (0, dom_1.$)('a.codicon.codicon-close.hide-category-button', {
                    'tabindex': 0,
                    'x-dispatch': 'hideCategory:' + category.id,
                    'title': (0, nls_1.localize)(16, null),
                    'role': 'button',
                    'aria-label': (0, nls_1.localize)(17, null),
                })), descriptionContent, (0, dom_1.$)('.category-progress', { 'x-data-category-id': category.id, }, (0, dom_1.$)('.progress-bar-outer', { 'role': 'progressbar' }, (0, dom_1.$)('.progress-bar-inner'))));
            };
            if (this.qb) {
                this.qb.dispose();
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
                if (this.ec().has(e.id)) {
                    rank = null;
                }
                return rank;
            };
            const gettingStartedList = this.qb = new gettingStartedList_1.$NYb({
                title: (0, nls_1.localize)(18, null),
                klass: 'getting-started',
                limit: 5,
                footer: (0, dom_1.$)('span.button-link.see-all-walkthroughs', { 'x-dispatch': 'seeAllWalkthroughs', 'tabindex': 0 }, (0, nls_1.localize)(19, null)),
                renderElement: renderGetttingStaredWalkthrough,
                rankElement: rankWalkthrough,
                contextService: this.mb,
            });
            gettingStartedList.onDidChange(() => {
                const hidden = this.ec();
                const someWalkthroughsHidden = hidden.size || gettingStartedList.itemCount < this.eb.filter(c => this.mb.contextMatchesRules(c.when)).length;
                this.lb.classList.toggle('someWalkthroughsHidden', !!someWalkthroughsHidden);
                this.Yb();
                exports.$TYb.bindTo(this.mb).set(gettingStartedList.itemCount === 0);
                this.rc();
            });
            gettingStartedList.setEntries(this.eb);
            exports.$TYb.bindTo(this.mb).set(gettingStartedList.itemCount === 0);
            return gettingStartedList;
        }
        qc() {
            const renderFeaturedExtensions = (entry) => {
                const descriptionContent = (0, dom_1.$)('.featured-description-content', {});
                (0, dom_1.$_O)(descriptionContent, ...(0, iconLabels_1.$xQ)(entry.description));
                const titleContent = (0, dom_1.$)('h3.category-title.max-lines-3', { 'x-category-title-for': entry.id });
                (0, dom_1.$_O)(titleContent, ...(0, iconLabels_1.$xQ)(entry.title));
                return (0, dom_1.$)('button.getting-started-category', {
                    'x-dispatch': 'openExtensionPage:' + entry.id,
                    'title': entry.description
                }, (0, dom_1.$)('.main-content', {}, (0, dom_1.$)('img.featured-icon.icon-widget', { src: entry.imagePath }), titleContent, (0, dom_1.$)('a.codicon.codicon-close.hide-category-button', {
                    'tabindex': 0,
                    'x-dispatch': 'hideExtension:' + entry.id,
                    'title': (0, nls_1.localize)(20, null),
                    'role': 'button',
                    'aria-label': (0, nls_1.localize)(21, null),
                })), descriptionContent);
            };
            if (this.rb) {
                this.rb.dispose();
            }
            const featuredExtensionsList = this.rb = new gettingStartedList_1.$NYb({
                title: this.Eb.title,
                klass: 'featured-extensions',
                limit: 5,
                renderElement: renderFeaturedExtensions,
                rankElement: (extension) => { if (this.ec().has(extension.id)) {
                    return null;
                } return 0; },
                contextService: this.mb,
            });
            this.fb?.then(extensions => {
                featuredExtensionsList.setEntries(extensions);
            });
            this.rb?.onDidChange(() => {
                this.Yb();
            });
            return featuredExtensionsList;
        }
        layout(size) {
            this.jb?.scanDomNode();
            this.hb?.scanDomNode();
            this.ib?.scanDomNode();
            this.pb?.layout(size);
            this.qb?.layout(size);
            this.rb?.layout(size);
            this.ob?.layout(size);
            if (this.f?.selectedStep && this.hc) {
                this.u.clear();
                this.m.clear();
                this.ic(this.f.selectedStep);
            }
            this.xb?.();
            this.lb.classList.toggle('height-constrained', size.height <= 600);
            this.lb.classList.toggle('width-constrained', size.width <= 400);
            this.lb.classList.toggle('width-semi-constrained', size.width <= 800);
            this.hb?.scanDomNode();
            this.ib?.scanDomNode();
            this.jb?.scanDomNode();
        }
        rc() {
            document.querySelectorAll('.category-progress').forEach(element => {
                const categoryID = element.getAttribute('x-data-category-id');
                const category = this.eb.find(category => category.id === categoryID);
                if (!category) {
                    throw Error('Could not find category with ID ' + categoryID);
                }
                const stats = this.Xb(category);
                const bar = (0, types_1.$uf)(element.querySelector('.progress-bar-inner'));
                bar.setAttribute('aria-valuemin', '0');
                bar.setAttribute('aria-valuenow', '' + stats.stepsComplete);
                bar.setAttribute('aria-valuemax', '' + stats.stepsTotal);
                const progress = (stats.stepsComplete / stats.stepsTotal) * 100;
                bar.style.width = `${progress}%`;
                element.parentElement.classList.toggle('no-progress', stats.stepsComplete === 0);
                if (stats.stepsTotal === stats.stepsComplete) {
                    bar.title = (0, nls_1.localize)(22, null, stats.stepsComplete);
                }
                else {
                    bar.title = (0, nls_1.localize)(23, null, stats.stepsComplete, stats.stepsTotal);
                }
            });
        }
        async sc(categoryID, stepId) {
            if (!this.eb.some(c => c.id === categoryID)) {
                this.eb = this.Db.getWalkthroughs();
            }
            const ourCategory = this.eb.find(c => c.id === categoryID);
            if (!ourCategory) {
                throw Error('Could not find category with ID: ' + categoryID);
            }
            this.g = this.g.then(async () => {
                (0, dom_1.$_O)(this.ub);
                this.f.selectedCategory = categoryID;
                this.f.selectedStep = stepId;
                this.gb = ourCategory;
                this.wc(categoryID);
                this.Bc('details');
            });
        }
        tc(category) {
            const widget = category.icon.type === 'icon' ? (0, dom_1.$)(themables_1.ThemeIcon.asCSSSelector(category.icon.icon)) : (0, dom_1.$)('img.category-icon', { src: category.icon.path });
            widget.classList.add('icon-widget');
            return widget;
        }
        uc(href) {
            const isCommand = href.startsWith('command:');
            const toSide = href.startsWith('command:toSide:');
            const command = href.replace(/command:(toSide:)?/, 'command:');
            this.P.publicLog2('gettingStarted.ActionExecuted', { command: 'runStepAction', argument: href, walkthroughId: this.gb?.id });
            const fullSize = this.Nb.contentDimension;
            if (toSide && fullSize.width > 700) {
                if (this.Nb.count === 1) {
                    const sideGroup = this.Nb.addGroup(this.Nb.groups[0], 3 /* GroupDirection.RIGHT */);
                    this.Nb.activateGroup(sideGroup);
                    const gettingStartedSize = Math.floor(fullSize.width / 2);
                    const gettingStartedGroup = this.Nb.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */).find(group => (group.activeEditor instanceof gettingStartedInput_1.$MYb));
                    this.Nb.setSize((0, types_1.$uf)(gettingStartedGroup), { width: gettingStartedSize, height: fullSize.height });
                }
                const nonGettingStartedGroup = this.Nb.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */).find(group => !(group.activeEditor instanceof gettingStartedInput_1.$MYb));
                if (nonGettingStartedGroup) {
                    this.Nb.activateGroup(nonGettingStartedGroup);
                    nonGettingStartedGroup.focus();
                }
            }
            if (isCommand) {
                const commandURI = uri_1.URI.parse(command);
                // execute as command
                let args = [];
                try {
                    args = (0, marshalling_1.$0g)(decodeURIComponent(commandURI.query));
                }
                catch {
                    // ignore and retry
                    try {
                        args = (0, marshalling_1.$0g)(commandURI.query);
                    }
                    catch {
                        // ignore error
                    }
                }
                if (!Array.isArray(args)) {
                    args = [args];
                }
                // If a step is requesting the OpenFolder action to be executed in an empty workspace...
                if ((commandURI.path === workspaceActions_1.$6tb.ID.toString() ||
                    commandURI.path === workspaceActions_1.$4tb.ID.toString()) &&
                    this.Tb.getWorkspace().folders.length === 0) {
                    const selectedStepIndex = this.gb?.steps.findIndex(step => step.id === this.f.selectedStep);
                    // and there are a few more steps after this step which are yet to be completed...
                    if (selectedStepIndex !== undefined &&
                        selectedStepIndex > -1 &&
                        this.gb?.steps.slice(selectedStepIndex + 1).some(step => !step.done)) {
                        const restoreData = { folder: workspace_1.$Oh.id, category: this.f.selectedCategory, step: this.f.selectedStep };
                        // save state to restore after reload
                        this.Jb.store(startupPage_1.$OYb, JSON.stringify(restoreData), 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
                    }
                }
                this.Ab.executeCommand(commandURI.path, ...args).then(result => {
                    const toOpen = result?.openFolder;
                    if (toOpen) {
                        if (!uri_1.URI.isUri(toOpen)) {
                            console.warn('Warn: Running walkthrough command', href, 'yielded non-URI `openFolder` result', toOpen, '. It will be disregarded.');
                            return;
                        }
                        const restoreData = { folder: toOpen.toString(), category: this.f.selectedCategory, step: this.f.selectedStep };
                        this.Jb.store(startupPage_1.$OYb, JSON.stringify(restoreData), 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
                        this.Rb.openWindow([{ folderUri: toOpen }]);
                    }
                });
            }
            else {
                this.Ib.open(command, { allowCommands: true });
            }
            if (!isCommand && (href.startsWith('https://') || href.startsWith('http://'))) {
                this.Db.progressByEvent('onLink:' + href);
            }
        }
        vc(container, text) {
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
            for (const linkedText of text) {
                if (linkedText.nodes.length === 1 && typeof linkedText.nodes[0] !== 'string') {
                    const node = linkedText.nodes[0];
                    const buttonContainer = (0, dom_1.$0O)(container, (0, dom_1.$)('.button-container'));
                    const button = new button_1.$7Q(buttonContainer, { title: node.title, supportIcons: true, ...defaultStyles_1.$i2 });
                    const isCommand = node.href.startsWith('command:');
                    const command = node.href.replace(/command:(toSide:)?/, 'command:');
                    button.label = node.label;
                    button.onDidClick(e => {
                        e.stopPropagation();
                        e.preventDefault();
                        this.uc(node.href);
                    }, null, this.r);
                    if (isCommand) {
                        const keybindingLabel = this.yc(command);
                        if (keybindingLabel) {
                            container.appendChild((0, dom_1.$)('span.shortcut-message', {}, (0, nls_1.localize)(24, null), (0, dom_1.$)('span.keybinding', {}, keybindingLabel)));
                        }
                    }
                    this.r.add(button);
                }
                else {
                    const p = (0, dom_1.$0O)(container, (0, dom_1.$)('p'));
                    for (const node of linkedText.nodes) {
                        if (typeof node === 'string') {
                            const labelWithIcon = (0, iconLabels_1.$xQ)(node);
                            for (const element of labelWithIcon) {
                                if (typeof element === 'string') {
                                    p.appendChild((0, formattedTextRenderer_1.$7P)(element, { inline: true, renderCodeSegments: true }));
                                }
                                else {
                                    p.appendChild(element);
                                }
                            }
                        }
                        else {
                            const link = this.Lb.createInstance(link_1.$40, p, node, { opener: (href) => this.uc(href) });
                            this.r.add(link);
                        }
                    }
                }
            }
            return container;
        }
        clearInput() {
            this.m.clear();
            super.clearInput();
        }
        wc(categoryID, selectedStep) {
            if (this.jb) {
                this.jb.dispose();
            }
            this.Kb.whenInstalledExtensionsRegistered().then(() => {
                // Remove internal extension id specifier from exposed id's
                this.Kb.activateByEvent(`onWalkthrough:${categoryID.replace(/[^#]+#/, '')}`);
            });
            this.r.clear();
            this.u.clear();
            const category = this.eb.find(category => category.id === categoryID);
            if (!category) {
                throw Error('could not find category with ID ' + categoryID);
            }
            const categoryDescriptorComponent = (0, dom_1.$)('.getting-started-category', {}, this.tc(category), (0, dom_1.$)('.category-description-container', {}, (0, dom_1.$)('h2.category-title.max-lines-3', { 'x-category-title-for': category.id }, ...(0, iconLabels_1.$xQ)(category.title)), (0, dom_1.$)('.category-description.description.max-lines-3', { 'x-category-description-for': category.id }, ...(0, iconLabels_1.$xQ)(category.description))));
            const stepListContainer = (0, dom_1.$)('.step-list-container');
            this.r.add((0, dom_1.$nO)(stepListContainer, 'keydown', (e) => {
                const event = new keyboardEvent_1.$jO(e);
                const currentStepIndex = () => category.steps.findIndex(e => e.id === this.f.selectedStep);
                if (event.keyCode === 16 /* KeyCode.UpArrow */) {
                    const toExpand = category.steps.filter((step, index) => index < currentStepIndex() && this.mb.contextMatchesRules(step.when));
                    if (toExpand.length) {
                        this.jc(toExpand[toExpand.length - 1].id, false);
                    }
                }
                if (event.keyCode === 18 /* KeyCode.DownArrow */) {
                    const toExpand = category.steps.find((step, index) => index > currentStepIndex() && this.mb.contextMatchesRules(step.when));
                    if (toExpand) {
                        this.jc(toExpand.id, false);
                    }
                }
            }));
            let renderedSteps = undefined;
            const contextKeysToWatch = new Set(category.steps.flatMap(step => step.when.keys()));
            const buildStepList = () => {
                category.steps.sort((a, b) => a.order - b.order);
                const toRender = category.steps
                    .filter(step => this.mb.contextMatchesRules(step.when));
                if ((0, arrays_1.$sb)(renderedSteps, toRender, (a, b) => a.id === b.id)) {
                    return;
                }
                renderedSteps = toRender;
                (0, dom_1.$_O)(stepListContainer, ...renderedSteps
                    .map(step => {
                    const codicon = (0, dom_1.$)('.codicon' + (step.done ? '.complete' + themables_1.ThemeIcon.asCSSSelector(gettingStartedIcons_1.$KYb) : themables_1.ThemeIcon.asCSSSelector(gettingStartedIcons_1.$JYb)), {
                        'data-done-step-id': step.id,
                        'x-dispatch': 'toggleStepCompletion:' + step.id,
                        'role': 'checkbox',
                        'tabindex': '0',
                    });
                    const container = (0, dom_1.$)('.step-description-container', { 'x-step-description-for': step.id });
                    this.vc(container, step.description);
                    const stepTitle = (0, dom_1.$)('h3.step-title.max-lines-3', { 'x-step-title-for': step.id });
                    (0, dom_1.$_O)(stepTitle, ...(0, iconLabels_1.$xQ)(step.title));
                    const stepDescription = (0, dom_1.$)('.step-container', {}, stepTitle, container);
                    if (step.media.type === 'image') {
                        stepDescription.appendChild((0, dom_1.$)('.image-description', { 'aria-label': (0, nls_1.localize)(25, null, step.media.altText) }));
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
            this.r.add(this.mb.onDidChangeContext(e => {
                if (e.affectsSome(contextKeysToWatch)) {
                    buildStepList();
                    this.Yb();
                    this.jc(this.f.selectedStep, false);
                }
            }));
            const showNextCategory = this.eb.find(_category => _category.id === category.next);
            const stepsContainer = (0, dom_1.$)('.getting-started-detail-container', { 'role': 'list' }, stepListContainer, (0, dom_1.$)('.done-next-container', {}, (0, dom_1.$)('button.button-link.all-done', { 'x-dispatch': 'allDone' }, (0, dom_1.$)('span.codicon.codicon-check-all'), (0, nls_1.localize)(26, null)), ...(showNextCategory
                ? [(0, dom_1.$)('button.button-link.next', { 'x-dispatch': 'nextSection' }, (0, nls_1.localize)(27, null), (0, dom_1.$)('span.codicon.codicon-arrow-right'))]
                : [])));
            this.jb = this.B(new scrollableElement_1.$UP(stepsContainer, { className: 'steps-container' }));
            const stepListComponent = this.jb.getDomNode();
            const categoryFooter = (0, dom_1.$)('.getting-started-footer');
            if (this.f.showTelemetryNotice && (0, telemetryUtils_1.$jo)(this.Fb) !== 0 /* TelemetryLevel.NONE */ && this.Bb.enableTelemetry) {
                this.xc(categoryFooter);
            }
            (0, dom_1.$_O)(this.ub, categoryDescriptorComponent, stepListComponent, this.vb, categoryFooter);
            const toExpand = category.steps.find(step => this.mb.contextMatchesRules(step.when) && !step.done) ?? category.steps[0];
            this.jc(selectedStep ?? toExpand.id, !selectedStep);
            this.jb.scanDomNode();
            this.ib?.scanDomNode();
            this.Yb();
        }
        xc(parent) {
            const mdRenderer = this.Lb.createInstance(markdownRenderer_1.$K2, {});
            const privacyStatementCopy = (0, nls_1.localize)(28, null);
            const privacyStatementButton = `[${privacyStatementCopy}](command:workbench.action.openPrivacyStatementUrl)`;
            const optOutCopy = (0, nls_1.localize)(29, null);
            const optOutButton = `[${optOutCopy}](command:settings.filterByTelemetry)`;
            const text = (0, nls_1.localize)(30, null, this.Bb.nameShort, privacyStatementButton, optOutButton);
            parent.append(mdRenderer.render({ value: text, isTrusted: true }).element);
            mdRenderer.dispose();
        }
        yc(command) {
            command = command.replace(/^command:/, '');
            const label = this.Cb.lookupKeybinding(command)?.getLabel();
            if (!label) {
                return '';
            }
            else {
                return `(${label})`;
            }
        }
        async zc() {
            this.g = this.g.then(async () => {
                this.gb = undefined;
                this.f.selectedCategory = undefined;
                this.f.selectedStep = undefined;
                this.f.showTelemetryNotice = false;
                this.jc(undefined);
                this.Bc('categories');
                this.lb.focus();
            });
        }
        Ac() {
            this.Ab.executeCommand('workbench.action.closeActiveEditor');
        }
        escape() {
            if (this.f.selectedCategory) {
                this.zc();
            }
            else {
                this.Ac();
            }
        }
        Bc(toEnable) {
            const slideManager = (0, types_1.$uf)(this.lb.querySelector('.gettingStarted'));
            if (toEnable === 'categories') {
                slideManager.classList.remove('showDetails');
                slideManager.classList.add('showCategories');
                this.lb.querySelector('.prev-button.button-link').style.display = 'none';
                this.lb.querySelector('.gettingStartedSlideDetails').querySelectorAll('button').forEach(button => button.disabled = true);
                this.lb.querySelector('.gettingStartedSlideCategories').querySelectorAll('button').forEach(button => button.disabled = false);
                this.lb.querySelector('.gettingStartedSlideCategories').querySelectorAll('input').forEach(button => button.disabled = false);
            }
            else {
                slideManager.classList.add('showDetails');
                slideManager.classList.remove('showCategories');
                this.lb.querySelector('.prev-button.button-link').style.display = 'block';
                this.lb.querySelector('.gettingStartedSlideDetails').querySelectorAll('button').forEach(button => button.disabled = false);
                this.lb.querySelector('.gettingStartedSlideCategories').querySelectorAll('button').forEach(button => button.disabled = true);
                this.lb.querySelector('.gettingStartedSlideCategories').querySelectorAll('input').forEach(button => button.disabled = true);
            }
        }
        focus() {
            const active = document.activeElement;
            let parent = this.lb.parentElement;
            while (parent && parent !== active) {
                parent = parent.parentElement;
            }
            if (parent) {
                // Only set focus if there is no other focued element outside this chain.
                // This prevents us from stealing back focus from other focused elements such as quick pick due to delayed load.
                this.lb.focus();
            }
        }
    };
    exports.$VYb = $VYb;
    exports.$VYb = $VYb = $VYb_1 = __decorate([
        __param(0, commands_1.$Fr),
        __param(1, productService_1.$kj),
        __param(2, keybinding_1.$2D),
        __param(3, gettingStartedService_1.$XXb),
        __param(4, featuredExtensionService_1.$RYb),
        __param(5, configuration_1.$8h),
        __param(6, telemetry_1.$9k),
        __param(7, language_1.$ct),
        __param(8, files_1.$6j),
        __param(9, opener_1.$NT),
        __param(10, themeService_1.$gv),
        __param(11, storage_1.$Vo),
        __param(12, extensions_1.$MF),
        __param(13, instantiation_1.$Ah),
        __param(14, notification_1.$Yu),
        __param(15, editorGroupsService_1.$5C),
        __param(16, contextkey_1.$3i),
        __param(17, quickInput_1.$Gq),
        __param(18, workspaces_1.$fU),
        __param(19, label_1.$Vz),
        __param(20, host_1.$VT),
        __param(21, webview_1.$Lbb),
        __param(22, workspace_1.$Kh),
        __param(23, accessibility_1.$1r),
        __param(24, extensionManagement_1.$2n)
    ], $VYb);
    class $WYb {
        canSerialize(editorInput) {
            return true;
        }
        serialize(editorInput) {
            return JSON.stringify({ selectedCategory: editorInput.selectedCategory, selectedStep: editorInput.selectedStep });
        }
        deserialize(instantiationService, serializedEditorInput) {
            try {
                const { selectedCategory, selectedStep } = JSON.parse(serializedEditorInput);
                return new gettingStartedInput_1.$MYb({ selectedCategory, selectedStep });
            }
            catch { }
            return new gettingStartedInput_1.$MYb({});
        }
    }
    exports.$WYb = $WYb;
});
//# sourceMappingURL=gettingStarted.js.map