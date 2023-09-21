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
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/base/common/event", "vs/platform/storage/common/storage", "vs/workbench/common/memento", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/base/common/lifecycle", "vs/platform/userDataSync/common/userDataSync", "vs/base/common/uri", "vs/base/common/resources", "vs/base/common/network", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/contrib/welcomeGettingStarted/common/gettingStartedContent", "vs/workbench/services/assignment/common/assignmentService", "vs/workbench/services/host/browser/host", "vs/platform/configuration/common/configuration", "vs/base/common/linkedText", "vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedExtensionPoint", "vs/platform/instantiation/common/extensions", "vs/base/common/path", "vs/base/common/arrays", "vs/workbench/common/views", "vs/nls!vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedService", "vs/platform/telemetry/common/telemetry", "vs/workbench/services/extensions/common/workspaceContains", "vs/platform/workspace/common/workspace", "vs/base/common/cancellation", "vs/workbench/services/extensionManagement/common/extensionManagement"], function (require, exports, instantiation_1, event_1, storage_1, memento_1, actions_1, commands_1, contextkey_1, lifecycle_1, userDataSync_1, uri_1, resources_1, network_1, extensionManagement_1, gettingStartedContent_1, assignmentService_1, host_1, configuration_1, linkedText_1, gettingStartedExtensionPoint_1, extensions_1, path_1, arrays_1, views_1, nls_1, telemetry_1, workspaceContains_1, workspace_1, cancellation_1, extensionManagement_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$2Xb = exports.$1Xb = exports.$ZXb = exports.$YXb = exports.$XXb = exports.$WXb = void 0;
    exports.$WXb = new contextkey_1.$2i('hasMultipleNewFileEntries', false);
    exports.$XXb = (0, instantiation_1.$Bh)('walkthroughsService');
    exports.$YXb = 'workbench.welcomePage.hiddenCategories';
    exports.$ZXb = 'workbench.welcomePage.walkthroughMetadata';
    const BUILT_IN_SOURCE = (0, nls_1.localize)(0, null);
    // Show walkthrough as "new" for 7 days after first install
    const DAYS = 24 * 60 * 60 * 1000;
    const NEW_WALKTHROUGH_TIME = 7 * DAYS;
    let $1Xb = class $1Xb extends lifecycle_1.$kc {
        constructor(F, G, H, I, J, L, M, N, O, P, Q, R) {
            super();
            this.F = F;
            this.G = G;
            this.H = H;
            this.I = I;
            this.J = J;
            this.L = L;
            this.M = M;
            this.N = N;
            this.O = O;
            this.P = P;
            this.Q = Q;
            this.R = R;
            this.b = new event_1.$fd();
            this.onDidAddWalkthrough = this.b.event;
            this.c = new event_1.$fd();
            this.onDidRemoveWalkthrough = this.c.event;
            this.g = new event_1.$fd();
            this.onDidChangeWalkthrough = this.g.event;
            this.h = new event_1.$fd();
            this.onDidProgressStep = this.h.event;
            this.n = new Set();
            this.r = new Map();
            this.t = new Map();
            this.u = new Map();
            this.w = new Set();
            this.y = new Set();
            this.z = new Set();
            this.C = new Set();
            this.D = new Map(JSON.parse(this.F.get(exports.$ZXb, 0 /* StorageScope.PROFILE */, '[]')));
            this.j = new memento_1.$YT('gettingStartedService', this.F);
            this.m = this.j.getMemento(0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            this.U();
            exports.$WXb.bindTo(this.J).set(false);
            this.S();
        }
        S() {
            gettingStartedContent_1.$UXb.forEach(async (category, index) => {
                this._registerWalkthrough({
                    ...category,
                    icon: { type: 'icon', icon: category.icon },
                    order: gettingStartedContent_1.$UXb.length - index,
                    source: BUILT_IN_SOURCE,
                    when: contextkey_1.$Ii.deserialize(category.when) ?? contextkey_1.$Ii.true(),
                    steps: category.content.steps.map((step, index) => {
                        return ({
                            ...step,
                            completionEvents: step.completionEvents ?? [],
                            description: parseDescription(step.description),
                            category: category.id,
                            order: index,
                            when: contextkey_1.$Ii.deserialize(step.when) ?? contextkey_1.$Ii.true(),
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
                                        path: (0, exports.$2Xb)(step.media.path).with({ query: JSON.stringify({ moduleId: 'vs/workbench/contrib/welcomeGettingStarted/common/media/' + step.media.path }) })
                                    }
                                    : {
                                        type: 'markdown',
                                        path: (0, exports.$2Xb)(step.media.path).with({ query: JSON.stringify({ moduleId: 'vs/workbench/contrib/welcomeGettingStarted/common/media/' + step.media.path }) }),
                                        base: network_1.$2f.asFileUri('vs/workbench/contrib/welcomeGettingStarted/common/media/'),
                                        root: network_1.$2f.asFileUri('vs/workbench/contrib/welcomeGettingStarted/common/media/'),
                                    },
                        });
                    })
                });
            });
            gettingStartedExtensionPoint_1.$VXb.setHandler((_, { added, removed }) => {
                added.map(e => this.W(e.description));
                removed.map(e => this.X(e.description));
            });
        }
        U() {
            this.B(this.G.onDidExecuteCommand(command => this.progressByEvent(`onCommand:${command.commandId}`)));
            this.N.getInstalled().then(installed => {
                installed.forEach(ext => this.progressByEvent(`extensionInstalled:${ext.identifier.id.toLowerCase()}`));
            });
            this.B(this.N.onDidInstallExtensions(async (result) => {
                const hadLastFoucs = await this.O.hadLastFocus();
                for (const e of result) {
                    const skipWalkthrough = e?.context?.[extensionManagement_1.$Pn] || e?.context?.[extensionManagement_1.$Rn];
                    // If the window had last focus and the install didn't specify to skip the walkthrough
                    // Then add it to the sessionInstallExtensions to be opened
                    if (hadLastFoucs && !skipWalkthrough) {
                        this.w.add(e.identifier.id.toLowerCase());
                    }
                    this.progressByEvent(`extensionInstalled:${e.identifier.id.toLowerCase()}`);
                }
            }));
            this.B(this.J.onDidChangeContext(event => {
                if (event.affectsSome(this.C)) {
                    this.z.forEach(expression => {
                        if (event.affectsSome(new Set(expression.keys())) && this.J.contextMatchesRules(expression)) {
                            this.progressByEvent(`onContext:` + expression.serialize());
                        }
                    });
                }
            }));
            this.B(this.P.onDidChangeViewVisibility(e => {
                if (e.visible) {
                    this.progressByEvent('onView:' + e.id);
                }
            }));
            this.B(this.M.onDidChangeConfiguration(e => {
                e.affectedKeys.forEach(key => { this.progressByEvent('onSettingChanged:' + key); });
            }));
            if (this.L.isEnabled()) {
                this.progressByEvent('onEvent:sync-enabled');
            }
            this.B(this.L.onDidChangeEnablement(() => {
                if (this.L.isEnabled()) {
                    this.progressByEvent('onEvent:sync-enabled');
                }
            }));
        }
        markWalkthroughOpened(id) {
            const walkthrough = this.t.get(id);
            const prior = this.D.get(id);
            if (prior && walkthrough) {
                this.D.set(id, { ...prior, manaullyOpened: true, stepIDs: walkthrough.steps.map(s => s.id) });
            }
            this.F.store(exports.$ZXb, JSON.stringify([...this.D.entries()]), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
        }
        async W(extension) {
            const convertExtensionPathToFileURI = (path) => path.startsWith('https://')
                ? uri_1.URI.parse(path, true)
                : network_1.$2f.uriToFileUri((0, resources_1.$ig)(extension.extensionLocation, path));
            const convertExtensionRelativePathsToBrowserURIs = (path) => {
                const convertPath = (path) => path.startsWith('https://')
                    ? uri_1.URI.parse(path, true)
                    : network_1.$2f.uriToBrowserUri((0, resources_1.$ig)(extension.extensionLocation, path));
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
                const isNewlyInstalled = !this.D.get(categoryID);
                if (isNewlyInstalled) {
                    this.D.set(categoryID, { firstSeen: +new Date(), stepIDs: walkthrough.steps?.map(s => s.id) ?? [], manaullyOpened: false });
                }
                const override = await Promise.race([
                    this.R?.getTreatment(`gettingStarted.overrideCategory.${extension.identifier.value + '.' + walkthrough.id}.when`),
                    new Promise(resolve => setTimeout(() => resolve(walkthrough.when), 5000))
                ]);
                if (this.w.has(extension.identifier.value.toLowerCase())
                    && this.J.contextMatchesRules(contextkey_1.$Ii.deserialize(override ?? walkthrough.when) ?? contextkey_1.$Ii.true())) {
                    this.w.delete(extension.identifier.value.toLowerCase());
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
                            base: convertExtensionPathToFileURI((0, path_1.$_d)(step.media.markdown)),
                            root: network_1.$2f.uriToFileUri(extension.extensionLocation),
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
                        when: contextkey_1.$Ii.deserialize(step.when) ?? contextkey_1.$Ii.true(),
                        category: categoryID,
                        order: index,
                    });
                });
                let isFeatured = false;
                if (walkthrough.featuredFor) {
                    const folders = this.I.getWorkspace().folders.map(f => f.uri);
                    const token = new cancellation_1.$pd();
                    setTimeout(() => token.cancel(), 2000);
                    isFeatured = await this.H.invokeFunction(a => (0, workspaceContains_1.$Alb)(a, folders, walkthrough.featuredFor, token.token));
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
                            ? network_1.$2f.uriToBrowserUri((0, resources_1.$ig)(extension.extensionLocation, iconStr)).toString(true)
                            : extensionManagement_2.$gcb
                    },
                    when: contextkey_1.$Ii.deserialize(override ?? walkthrough.when) ?? contextkey_1.$Ii.true(),
                };
                this._registerWalkthrough(walkthoughDescriptor);
                this.b.fire(this.Y(walkthoughDescriptor));
            }));
            this.F.store(exports.$ZXb, JSON.stringify([...this.D.entries()]), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            if (sectionToOpen && this.M.getValue('workbench.welcomePage.walkthroughs.openOnInstall')) {
                this.Q.publicLog2('gettingStarted.didAutoOpenWalkthrough', { id: sectionToOpen });
                this.G.executeCommand('workbench.action.openWalkthrough', sectionToOpen, true);
            }
        }
        X(extension) {
            if (!(extension.contributes?.walkthroughs?.length)) {
                return;
            }
            extension.contributes?.walkthroughs?.forEach(section => {
                const categoryID = extension.identifier.value + '#' + section.id;
                section.steps.forEach(step => {
                    const fullyQualifiedID = extension.identifier.value + '#' + section.id + '#' + step.id;
                    this.u.delete(fullyQualifiedID);
                });
                this.t.delete(categoryID);
                this.c.fire(categoryID);
            });
        }
        getWalkthrough(id) {
            const walkthrough = this.t.get(id);
            if (!walkthrough) {
                throw Error('Trying to get unknown walkthrough: ' + id);
            }
            return this.Y(walkthrough);
        }
        getWalkthroughs() {
            const registeredCategories = [...this.t.values()];
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
                .map(category => this.Y(category));
            return categoriesWithCompletion;
        }
        Y(category) {
            const stepsWithProgress = category.steps.map(step => this.Z(step));
            const hasOpened = this.D.get(category.id)?.manaullyOpened;
            const firstSeenDate = this.D.get(category.id)?.firstSeen;
            const isNew = firstSeenDate && firstSeenDate > (+new Date() - NEW_WALKTHROUGH_TIME);
            const lastStepIDs = this.D.get(category.id)?.stepIDs;
            const rawCategory = this.t.get(category.id);
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
        Z(step) {
            return {
                ...step,
                done: false,
                ...this.m[step.id]
            };
        }
        progressStep(id) {
            const oldProgress = this.m[id];
            if (!oldProgress || oldProgress.done !== true) {
                this.m[id] = { done: true };
                this.j.saveMemento();
                const step = this.bb(id);
                if (!step) {
                    throw Error('Tried to progress unknown step');
                }
                this.h.fire(this.Z(step));
            }
        }
        deprogressStep(id) {
            delete this.m[id];
            this.j.saveMemento();
            const step = this.bb(id);
            this.h.fire(this.Z(step));
        }
        progressByEvent(event) {
            if (this.n.has(event)) {
                return;
            }
            this.n.add(event);
            this.r.get(event)?.forEach(id => this.progressStep(id));
        }
        registerWalkthrough(walkthoughDescriptor) {
            this._registerWalkthrough({
                ...walkthoughDescriptor,
                steps: walkthoughDescriptor.steps.map(step => ({ ...step, description: parseDescription(step.description) }))
            });
        }
        _registerWalkthrough(walkthroughDescriptor) {
            const oldCategory = this.t.get(walkthroughDescriptor.id);
            if (oldCategory) {
                console.error(`Skipping attempt to overwrite walkthrough. (${walkthroughDescriptor.id})`);
                return;
            }
            this.t.set(walkthroughDescriptor.id, walkthroughDescriptor);
            walkthroughDescriptor.steps.forEach(step => {
                if (this.u.has(step.id)) {
                    throw Error('Attempting to register step with id ' + step.id + ' twice. Second is dropped.');
                }
                this.u.set(step.id, step);
                step.when.keys().forEach(key => this.y.add(key));
                this.$(step);
            });
            walkthroughDescriptor.when.keys().forEach(key => this.y.add(key));
        }
        $(step) {
            if (step.doneOn) {
                console.error(`wakthrough step`, step, `uses deprecated 'doneOn' property. Adopt 'completionEvents' to silence this warning`);
                return;
            }
            if (!step.completionEvents.length) {
                step.completionEvents = (0, arrays_1.$Fb)((0, arrays_1.$Pb)(step.description
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
                        const expression = contextkey_1.$Ii.deserialize(argument);
                        if (expression) {
                            this.z.add(expression);
                            expression.keys().forEach(key => this.C.add(key));
                            event = eventType + ':' + expression.serialize();
                            if (this.J.contextMatchesRules(expression)) {
                                this.n.add(event);
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
                this.ab(event, step);
            }
        }
        ab(event, step) {
            if (!this.r.has(event)) {
                this.r.set(event, new Set());
            }
            this.r.get(event)?.add(step.id);
        }
        bb(id) {
            const step = this.u.get(id);
            if (!step) {
                throw Error('Attempting to access step which does not exist in registry ' + id);
            }
            return step;
        }
    };
    exports.$1Xb = $1Xb;
    exports.$1Xb = $1Xb = __decorate([
        __param(0, storage_1.$Vo),
        __param(1, commands_1.$Fr),
        __param(2, instantiation_1.$Ah),
        __param(3, workspace_1.$Kh),
        __param(4, contextkey_1.$3i),
        __param(5, userDataSync_1.$Pgb),
        __param(6, configuration_1.$8h),
        __param(7, extensionManagement_1.$2n),
        __param(8, host_1.$VT),
        __param(9, views_1.$$E),
        __param(10, telemetry_1.$9k),
        __param(11, assignmentService_1.$drb)
    ], $1Xb);
    const parseDescription = (desc) => desc.split('\n').filter(x => x).map(text => (0, linkedText_1.$IS)(text));
    const $2Xb = (path) => path.startsWith('https://')
        ? uri_1.URI.parse(path, true)
        : network_1.$2f.asFileUri(`vs/workbench/contrib/welcomeGettingStarted/common/media/${path}`);
    exports.$2Xb = $2Xb;
    const convertInternalMediaPathToBrowserURI = (path) => path.startsWith('https://')
        ? uri_1.URI.parse(path, true)
        : network_1.$2f.asBrowserUri(`vs/workbench/contrib/welcomeGettingStarted/common/media/${path}`);
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
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'resetGettingStartedProgress',
                category: { original: 'Developer', value: (0, nls_1.localize)(1, null) },
                title: { original: 'Reset Welcome Page Walkthrough Progress', value: (0, nls_1.localize)(2, null) },
                f1: true
            });
        }
        run(accessor) {
            const gettingStartedService = accessor.get(exports.$XXb);
            const storageService = accessor.get(storage_1.$Vo);
            storageService.store(exports.$YXb, JSON.stringify([]), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            storageService.store(exports.$ZXb, JSON.stringify([]), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            const memento = new memento_1.$YT('gettingStartedService', accessor.get(storage_1.$Vo));
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
    (0, extensions_1.$mr)(exports.$XXb, $1Xb, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=gettingStartedService.js.map