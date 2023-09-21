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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/common/actions", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/decorators", "vs/base/common/lifecycle", "vs/base/common/network", "vs/nls!vs/workbench/contrib/extensions/browser/abstractRuntimeExtensionsEditor", "vs/platform/action/common/actionCommonCategories", "vs/platform/actions/common/actions", "vs/platform/clipboard/common/clipboardService", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/extensions/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/label/common/label", "vs/platform/list/browser/listService", "vs/platform/notification/common/notification", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/workbench/browser/parts/editor/editorPane", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/contrib/extensions/common/runtimeExtensionsInput", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/extensions/common/extensionRunningLocation", "vs/workbench/services/extensions/common/extensions", "vs/css!./media/runtimeExtensionsEditor"], function (require, exports, dom_1, actionbar_1, iconLabels_1, actions_1, arrays_1, async_1, decorators_1, lifecycle_1, network_1, nls, actionCommonCategories_1, actions_2, clipboardService_1, contextkey_1, contextView_1, extensions_1, instantiation_1, label_1, listService_1, notification_1, storage_1, telemetry_1, colorRegistry_1, themeService_1, editorPane_1, extensions_2, runtimeExtensionsInput_1, editorService_1, environmentService_1, extensionManagement_1, extensionRunningLocation_1, extensions_3) {
    "use strict";
    var $6Ub_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$7Ub = exports.$6Ub = void 0;
    let $6Ub = class $6Ub extends editorPane_1.$0T {
        static { $6Ub_1 = this; }
        static { this.ID = 'workbench.editor.runtimeExtensions'; }
        constructor(telemetryService, themeService, contextKeyService, m, r, s, u, y, storageService, eb, fb, gb) {
            super($6Ub_1.ID, telemetryService, themeService, storageService);
            this.m = m;
            this.r = r;
            this.s = s;
            this.u = u;
            this.y = y;
            this.eb = eb;
            this.fb = fb;
            this.gb = gb;
            this.c = null;
            this.f = null;
            this.g = this.B(new async_1.$Sg(() => this.hb(), 200));
            this.B(this.r.onDidChangeExtensionsStatus(() => this.g.schedule()));
            this.hb();
        }
        async hb() {
            this.f = await this.ib();
            this.c?.splice(0, this.c.length, this.f);
        }
        async ib() {
            // We only deal with extensions with source code!
            await this.r.whenInstalledExtensionsRegistered();
            const extensionsDescriptions = this.r.extensions.filter((extension) => {
                return Boolean(extension.main) || Boolean(extension.browser);
            });
            const marketplaceMap = new extensions_1.$Xl();
            const marketPlaceExtensions = await this.m.queryLocal();
            for (const extension of marketPlaceExtensions) {
                marketplaceMap.set(extension.identifier.id, extension);
            }
            const statusMap = this.r.getExtensionsStatus();
            // group profile segments by extension
            const segments = new extensions_1.$Xl();
            const profileInfo = this.lb();
            if (profileInfo) {
                let currentStartTime = profileInfo.startTime;
                for (let i = 0, len = profileInfo.deltas.length; i < len; i++) {
                    const id = profileInfo.ids[i];
                    const delta = profileInfo.deltas[i];
                    let extensionSegments = segments.get(id);
                    if (!extensionSegments) {
                        extensionSegments = [];
                        segments.set(id, extensionSegments);
                    }
                    extensionSegments.push(currentStartTime);
                    currentStartTime = currentStartTime + delta;
                    extensionSegments.push(currentStartTime);
                }
            }
            let result = [];
            for (let i = 0, len = extensionsDescriptions.length; i < len; i++) {
                const extensionDescription = extensionsDescriptions[i];
                let extProfileInfo = null;
                if (profileInfo) {
                    const extensionSegments = segments.get(extensionDescription.identifier) || [];
                    let extensionTotalTime = 0;
                    for (let j = 0, lenJ = extensionSegments.length / 2; j < lenJ; j++) {
                        const startTime = extensionSegments[2 * j];
                        const endTime = extensionSegments[2 * j + 1];
                        extensionTotalTime += (endTime - startTime);
                    }
                    extProfileInfo = {
                        segments: extensionSegments,
                        totalTime: extensionTotalTime
                    };
                }
                result[i] = {
                    originalIndex: i,
                    description: extensionDescription,
                    marketplaceInfo: marketplaceMap.get(extensionDescription.identifier),
                    status: statusMap[extensionDescription.identifier.value],
                    profileInfo: extProfileInfo || undefined,
                    unresponsiveProfile: this.mb(extensionDescription.identifier)
                };
            }
            result = result.filter(element => element.status.activationStarted);
            // bubble up extensions that have caused slowness
            const isUnresponsive = (extension) => extension.unresponsiveProfile === profileInfo;
            const profileTime = (extension) => extension.profileInfo?.totalTime ?? 0;
            const activationTime = (extension) => (extension.status.activationTimes?.codeLoadingTime ?? 0) +
                (extension.status.activationTimes?.activateCallTime ?? 0);
            result = result.sort((a, b) => {
                if (isUnresponsive(a) || isUnresponsive(b)) {
                    return +isUnresponsive(b) - +isUnresponsive(a);
                }
                else if (profileTime(a) || profileTime(b)) {
                    return profileTime(b) - profileTime(a);
                }
                else if (activationTime(a) || activationTime(b)) {
                    return activationTime(b) - activationTime(a);
                }
                return a.originalIndex - b.originalIndex;
            });
            return result;
        }
        ab(parent) {
            parent.classList.add('runtime-extensions-editor');
            const TEMPLATE_ID = 'runtimeExtensionElementTemplate';
            const delegate = new class {
                getHeight(element) {
                    return 70;
                }
                getTemplateId(element) {
                    return TEMPLATE_ID;
                }
            };
            const renderer = {
                templateId: TEMPLATE_ID,
                renderTemplate: (root) => {
                    const element = (0, dom_1.$0O)(root, (0, dom_1.$)('.extension'));
                    const iconContainer = (0, dom_1.$0O)(element, (0, dom_1.$)('.icon-container'));
                    const icon = (0, dom_1.$0O)(iconContainer, (0, dom_1.$)('img.icon'));
                    const desc = (0, dom_1.$0O)(element, (0, dom_1.$)('div.desc'));
                    const headerContainer = (0, dom_1.$0O)(desc, (0, dom_1.$)('.header-container'));
                    const header = (0, dom_1.$0O)(headerContainer, (0, dom_1.$)('.header'));
                    const name = (0, dom_1.$0O)(header, (0, dom_1.$)('div.name'));
                    const version = (0, dom_1.$0O)(header, (0, dom_1.$)('span.version'));
                    const msgContainer = (0, dom_1.$0O)(desc, (0, dom_1.$)('div.msg'));
                    const actionbar = new actionbar_1.$1P(desc, { animated: false });
                    actionbar.onDidRun(({ error }) => error && this.s.error(error));
                    const timeContainer = (0, dom_1.$0O)(element, (0, dom_1.$)('.time'));
                    const activationTime = (0, dom_1.$0O)(timeContainer, (0, dom_1.$)('div.activation-time'));
                    const profileTime = (0, dom_1.$0O)(timeContainer, (0, dom_1.$)('div.profile-time'));
                    const disposables = [actionbar];
                    return {
                        root,
                        element,
                        icon,
                        name,
                        version,
                        actionbar,
                        activationTime,
                        profileTime,
                        msgContainer,
                        disposables,
                        elementDisposables: [],
                    };
                },
                renderElement: (element, index, data) => {
                    data.elementDisposables = (0, lifecycle_1.$fc)(data.elementDisposables);
                    data.root.classList.toggle('odd', index % 2 === 1);
                    data.elementDisposables.push((0, dom_1.$nO)(data.icon, 'error', () => data.icon.src = element.marketplaceInfo?.iconUrlFallback || extensionManagement_1.$gcb, { once: true }));
                    data.icon.src = element.marketplaceInfo?.iconUrl || extensionManagement_1.$gcb;
                    if (!data.icon.complete) {
                        data.icon.style.visibility = 'hidden';
                        data.icon.onload = () => data.icon.style.visibility = 'inherit';
                    }
                    else {
                        data.icon.style.visibility = 'inherit';
                    }
                    data.name.textContent = (element.marketplaceInfo?.displayName || element.description.identifier.value).substr(0, 50);
                    data.version.textContent = element.description.version;
                    const activationTimes = element.status.activationTimes;
                    if (activationTimes) {
                        const syncTime = activationTimes.codeLoadingTime + activationTimes.activateCallTime;
                        data.activationTime.textContent = activationTimes.activationReason.startup ? `Startup Activation: ${syncTime}ms` : `Activation: ${syncTime}ms`;
                    }
                    else {
                        data.activationTime.textContent = `Activating...`;
                    }
                    data.actionbar.clear();
                    const slowExtensionAction = this.nb(element);
                    if (slowExtensionAction) {
                        data.actionbar.push(slowExtensionAction, { icon: false, label: true });
                    }
                    if ((0, arrays_1.$Jb)(element.status.runtimeErrors)) {
                        const reportExtensionIssueAction = this.ob(element);
                        if (reportExtensionIssueAction) {
                            data.actionbar.push(reportExtensionIssueAction, { icon: false, label: true });
                        }
                    }
                    let title;
                    if (activationTimes) {
                        const activationId = activationTimes.activationReason.extensionId.value;
                        const activationEvent = activationTimes.activationReason.activationEvent;
                        if (activationEvent === '*') {
                            title = nls.localize(0, null, activationId);





                        }
                        else if (/^workspaceContains:/.test(activationEvent)) {
                            const fileNameOrGlob = activationEvent.substr('workspaceContains:'.length);
                            if (fileNameOrGlob.indexOf('*') >= 0 || fileNameOrGlob.indexOf('?') >= 0) {
                                title = nls.localize(1, null, fileNameOrGlob, activationId);






                            }
                            else {
                                title = nls.localize(2, null, fileNameOrGlob, activationId);






                            }
                        }
                        else if (/^workspaceContainsTimeout:/.test(activationEvent)) {
                            const glob = activationEvent.substr('workspaceContainsTimeout:'.length);
                            title = nls.localize(3, null, glob, activationId);






                        }
                        else if (activationEvent === 'onStartupFinished') {
                            title = nls.localize(4, null, activationId);





                        }
                        else if (/^onLanguage:/.test(activationEvent)) {
                            const language = activationEvent.substr('onLanguage:'.length);
                            title = nls.localize(5, null, language, activationId);
                        }
                        else {
                            title = nls.localize(6, null, activationEvent, activationId);






                        }
                    }
                    else {
                        title = nls.localize(7, null);
                    }
                    data.activationTime.title = title;
                    (0, dom_1.$lO)(data.msgContainer);
                    if (this.mb(element.description.identifier)) {
                        const el = (0, dom_1.$)('span', undefined, ...(0, iconLabels_1.$xQ)(` $(alert) Unresponsive`));
                        el.title = nls.localize(8, null);
                        data.msgContainer.appendChild(el);
                    }
                    if ((0, arrays_1.$Jb)(element.status.runtimeErrors)) {
                        const el = (0, dom_1.$)('span', undefined, ...(0, iconLabels_1.$xQ)(`$(bug) ${nls.localize(9, null, element.status.runtimeErrors.length)}`));
                        data.msgContainer.appendChild(el);
                    }
                    if (element.status.messages && element.status.messages.length > 0) {
                        const el = (0, dom_1.$)('span', undefined, ...(0, iconLabels_1.$xQ)(`$(alert) ${element.status.messages[0].message}`));
                        data.msgContainer.appendChild(el);
                    }
                    let extraLabel = null;
                    if (element.status.runningLocation && element.status.runningLocation.equals(new extensionRunningLocation_1.$HF(0))) {
                        extraLabel = `$(globe) web worker`;
                    }
                    else if (element.description.extensionLocation.scheme === network_1.Schemas.vscodeRemote) {
                        const hostLabel = this.eb.getHostLabel(network_1.Schemas.vscodeRemote, this.fb.remoteAuthority);
                        if (hostLabel) {
                            extraLabel = `$(remote) ${hostLabel}`;
                        }
                        else {
                            extraLabel = `$(remote) ${element.description.extensionLocation.authority}`;
                        }
                    }
                    else if (element.status.runningLocation && element.status.runningLocation.affinity > 0) {
                        extraLabel = element.status.runningLocation instanceof extensionRunningLocation_1.$HF
                            ? `$(globe) web worker ${element.status.runningLocation.affinity + 1}`
                            : `$(server-process) local process ${element.status.runningLocation.affinity + 1}`;
                    }
                    if (extraLabel) {
                        const el = (0, dom_1.$)('span', undefined, ...(0, iconLabels_1.$xQ)(extraLabel));
                        data.msgContainer.appendChild(el);
                    }
                    if (element.profileInfo) {
                        data.profileTime.textContent = `Profile: ${(element.profileInfo.totalTime / 1000).toFixed(2)}ms`;
                    }
                    else {
                        data.profileTime.textContent = '';
                    }
                },
                disposeTemplate: (data) => {
                    data.disposables = (0, lifecycle_1.$fc)(data.disposables);
                }
            };
            this.c = this.y.createInstance(listService_1.$p4, 'RuntimeExtensions', parent, delegate, [renderer], {
                multipleSelectionSupport: false,
                setRowLineHeight: false,
                horizontalScrolling: false,
                overrideStyles: {
                    listBackground: colorRegistry_1.$ww
                },
                accessibilityProvider: new class {
                    getWidgetAriaLabel() {
                        return nls.localize(10, null);
                    }
                    getAriaLabel(element) {
                        return element.description.name;
                    }
                }
            });
            this.c.splice(0, this.c.length, this.f || undefined);
            this.c.onContextMenu((e) => {
                if (!e.element) {
                    return;
                }
                const actions = [];
                actions.push(new actions_1.$gi('runtimeExtensionsEditor.action.copyId', nls.localize(11, null, e.element.description.identifier.value), undefined, true, () => {
                    this.gb.writeText(e.element.description.identifier.value);
                }));
                const reportExtensionIssueAction = this.ob(e.element);
                if (reportExtensionIssueAction) {
                    actions.push(reportExtensionIssueAction);
                }
                actions.push(new actions_1.$ii());
                if (e.element.marketplaceInfo) {
                    actions.push(new actions_1.$gi('runtimeExtensionsEditor.action.disableWorkspace', nls.localize(12, null), undefined, true, () => this.m.setEnablement(e.element.marketplaceInfo, 7 /* EnablementState.DisabledWorkspace */)));
                    actions.push(new actions_1.$gi('runtimeExtensionsEditor.action.disable', nls.localize(13, null), undefined, true, () => this.m.setEnablement(e.element.marketplaceInfo, 6 /* EnablementState.DisabledGlobally */)));
                }
                actions.push(new actions_1.$ii());
                const profileAction = this.qb();
                if (profileAction) {
                    actions.push(profileAction);
                }
                const saveExtensionHostProfileAction = this.kb;
                if (saveExtensionHostProfileAction) {
                    actions.push(saveExtensionHostProfileAction);
                }
                this.u.showContextMenu({
                    getAnchor: () => e.anchor,
                    getActions: () => actions
                });
            });
        }
        get kb() {
            return this.pb();
        }
        layout(dimension) {
            this.c?.layout(dimension.height);
        }
    };
    exports.$6Ub = $6Ub;
    __decorate([
        decorators_1.$6g
    ], $6Ub.prototype, "kb", null);
    exports.$6Ub = $6Ub = $6Ub_1 = __decorate([
        __param(0, telemetry_1.$9k),
        __param(1, themeService_1.$gv),
        __param(2, contextkey_1.$3i),
        __param(3, extensions_2.$Pfb),
        __param(4, extensions_3.$MF),
        __param(5, notification_1.$Yu),
        __param(6, contextView_1.$WZ),
        __param(7, instantiation_1.$Ah),
        __param(8, storage_1.$Vo),
        __param(9, label_1.$Vz),
        __param(10, environmentService_1.$hJ),
        __param(11, clipboardService_1.$UZ)
    ], $6Ub);
    class $7Ub extends actions_2.$Wu {
        constructor() {
            super({
                id: 'workbench.action.showRuntimeExtensions',
                title: { value: nls.localize(14, null), original: 'Show Running Extensions' },
                category: actionCommonCategories_1.$Nl.Developer,
                f1: true,
                menu: {
                    id: actions_2.$Ru.ViewContainerTitle,
                    when: contextkey_1.$Ii.equals('viewContainer', 'workbench.view.extensions'),
                    group: '2_enablement',
                    order: 3
                }
            });
        }
        async run(accessor) {
            await accessor.get(editorService_1.$9C).openEditor(runtimeExtensionsInput_1.$5Ub.instance, { pinned: true });
        }
    }
    exports.$7Ub = $7Ub;
});
//# sourceMappingURL=abstractRuntimeExtensionsEditor.js.map