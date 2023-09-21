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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/common/actions", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/decorators", "vs/base/common/lifecycle", "vs/base/common/network", "vs/nls", "vs/platform/action/common/actionCommonCategories", "vs/platform/actions/common/actions", "vs/platform/clipboard/common/clipboardService", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/extensions/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/label/common/label", "vs/platform/list/browser/listService", "vs/platform/notification/common/notification", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/workbench/browser/parts/editor/editorPane", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/contrib/extensions/common/runtimeExtensionsInput", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/extensions/common/extensionRunningLocation", "vs/workbench/services/extensions/common/extensions", "vs/css!./media/runtimeExtensionsEditor"], function (require, exports, dom_1, actionbar_1, iconLabels_1, actions_1, arrays_1, async_1, decorators_1, lifecycle_1, network_1, nls, actionCommonCategories_1, actions_2, clipboardService_1, contextkey_1, contextView_1, extensions_1, instantiation_1, label_1, listService_1, notification_1, storage_1, telemetry_1, colorRegistry_1, themeService_1, editorPane_1, extensions_2, runtimeExtensionsInput_1, editorService_1, environmentService_1, extensionManagement_1, extensionRunningLocation_1, extensions_3) {
    "use strict";
    var AbstractRuntimeExtensionsEditor_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ShowRuntimeExtensionsAction = exports.AbstractRuntimeExtensionsEditor = void 0;
    let AbstractRuntimeExtensionsEditor = class AbstractRuntimeExtensionsEditor extends editorPane_1.EditorPane {
        static { AbstractRuntimeExtensionsEditor_1 = this; }
        static { this.ID = 'workbench.editor.runtimeExtensions'; }
        constructor(telemetryService, themeService, contextKeyService, _extensionsWorkbenchService, _extensionService, _notificationService, _contextMenuService, _instantiationService, storageService, _labelService, _environmentService, _clipboardService) {
            super(AbstractRuntimeExtensionsEditor_1.ID, telemetryService, themeService, storageService);
            this._extensionsWorkbenchService = _extensionsWorkbenchService;
            this._extensionService = _extensionService;
            this._notificationService = _notificationService;
            this._contextMenuService = _contextMenuService;
            this._instantiationService = _instantiationService;
            this._labelService = _labelService;
            this._environmentService = _environmentService;
            this._clipboardService = _clipboardService;
            this._list = null;
            this._elements = null;
            this._updateSoon = this._register(new async_1.RunOnceScheduler(() => this._updateExtensions(), 200));
            this._register(this._extensionService.onDidChangeExtensionsStatus(() => this._updateSoon.schedule()));
            this._updateExtensions();
        }
        async _updateExtensions() {
            this._elements = await this._resolveExtensions();
            this._list?.splice(0, this._list.length, this._elements);
        }
        async _resolveExtensions() {
            // We only deal with extensions with source code!
            await this._extensionService.whenInstalledExtensionsRegistered();
            const extensionsDescriptions = this._extensionService.extensions.filter((extension) => {
                return Boolean(extension.main) || Boolean(extension.browser);
            });
            const marketplaceMap = new extensions_1.ExtensionIdentifierMap();
            const marketPlaceExtensions = await this._extensionsWorkbenchService.queryLocal();
            for (const extension of marketPlaceExtensions) {
                marketplaceMap.set(extension.identifier.id, extension);
            }
            const statusMap = this._extensionService.getExtensionsStatus();
            // group profile segments by extension
            const segments = new extensions_1.ExtensionIdentifierMap();
            const profileInfo = this._getProfileInfo();
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
                    unresponsiveProfile: this._getUnresponsiveProfile(extensionDescription.identifier)
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
        createEditor(parent) {
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
                    const element = (0, dom_1.append)(root, (0, dom_1.$)('.extension'));
                    const iconContainer = (0, dom_1.append)(element, (0, dom_1.$)('.icon-container'));
                    const icon = (0, dom_1.append)(iconContainer, (0, dom_1.$)('img.icon'));
                    const desc = (0, dom_1.append)(element, (0, dom_1.$)('div.desc'));
                    const headerContainer = (0, dom_1.append)(desc, (0, dom_1.$)('.header-container'));
                    const header = (0, dom_1.append)(headerContainer, (0, dom_1.$)('.header'));
                    const name = (0, dom_1.append)(header, (0, dom_1.$)('div.name'));
                    const version = (0, dom_1.append)(header, (0, dom_1.$)('span.version'));
                    const msgContainer = (0, dom_1.append)(desc, (0, dom_1.$)('div.msg'));
                    const actionbar = new actionbar_1.ActionBar(desc, { animated: false });
                    actionbar.onDidRun(({ error }) => error && this._notificationService.error(error));
                    const timeContainer = (0, dom_1.append)(element, (0, dom_1.$)('.time'));
                    const activationTime = (0, dom_1.append)(timeContainer, (0, dom_1.$)('div.activation-time'));
                    const profileTime = (0, dom_1.append)(timeContainer, (0, dom_1.$)('div.profile-time'));
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
                    data.elementDisposables = (0, lifecycle_1.dispose)(data.elementDisposables);
                    data.root.classList.toggle('odd', index % 2 === 1);
                    data.elementDisposables.push((0, dom_1.addDisposableListener)(data.icon, 'error', () => data.icon.src = element.marketplaceInfo?.iconUrlFallback || extensionManagement_1.DefaultIconPath, { once: true }));
                    data.icon.src = element.marketplaceInfo?.iconUrl || extensionManagement_1.DefaultIconPath;
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
                    const slowExtensionAction = this._createSlowExtensionAction(element);
                    if (slowExtensionAction) {
                        data.actionbar.push(slowExtensionAction, { icon: false, label: true });
                    }
                    if ((0, arrays_1.isNonEmptyArray)(element.status.runtimeErrors)) {
                        const reportExtensionIssueAction = this._createReportExtensionIssueAction(element);
                        if (reportExtensionIssueAction) {
                            data.actionbar.push(reportExtensionIssueAction, { icon: false, label: true });
                        }
                    }
                    let title;
                    if (activationTimes) {
                        const activationId = activationTimes.activationReason.extensionId.value;
                        const activationEvent = activationTimes.activationReason.activationEvent;
                        if (activationEvent === '*') {
                            title = nls.localize({
                                key: 'starActivation',
                                comment: [
                                    '{0} will be an extension identifier'
                                ]
                            }, "Activated by {0} on start-up", activationId);
                        }
                        else if (/^workspaceContains:/.test(activationEvent)) {
                            const fileNameOrGlob = activationEvent.substr('workspaceContains:'.length);
                            if (fileNameOrGlob.indexOf('*') >= 0 || fileNameOrGlob.indexOf('?') >= 0) {
                                title = nls.localize({
                                    key: 'workspaceContainsGlobActivation',
                                    comment: [
                                        '{0} will be a glob pattern',
                                        '{1} will be an extension identifier'
                                    ]
                                }, "Activated by {1} because a file matching {0} exists in your workspace", fileNameOrGlob, activationId);
                            }
                            else {
                                title = nls.localize({
                                    key: 'workspaceContainsFileActivation',
                                    comment: [
                                        '{0} will be a file name',
                                        '{1} will be an extension identifier'
                                    ]
                                }, "Activated by {1} because file {0} exists in your workspace", fileNameOrGlob, activationId);
                            }
                        }
                        else if (/^workspaceContainsTimeout:/.test(activationEvent)) {
                            const glob = activationEvent.substr('workspaceContainsTimeout:'.length);
                            title = nls.localize({
                                key: 'workspaceContainsTimeout',
                                comment: [
                                    '{0} will be a glob pattern',
                                    '{1} will be an extension identifier'
                                ]
                            }, "Activated by {1} because searching for {0} took too long", glob, activationId);
                        }
                        else if (activationEvent === 'onStartupFinished') {
                            title = nls.localize({
                                key: 'startupFinishedActivation',
                                comment: [
                                    'This refers to an extension. {0} will be an activation event.'
                                ]
                            }, "Activated by {0} after start-up finished", activationId);
                        }
                        else if (/^onLanguage:/.test(activationEvent)) {
                            const language = activationEvent.substr('onLanguage:'.length);
                            title = nls.localize('languageActivation', "Activated by {1} because you opened a {0} file", language, activationId);
                        }
                        else {
                            title = nls.localize({
                                key: 'workspaceGenericActivation',
                                comment: [
                                    '{0} will be an activation event, like e.g. \'language:typescript\', \'debug\', etc.',
                                    '{1} will be an extension identifier'
                                ]
                            }, "Activated by {1} on {0}", activationEvent, activationId);
                        }
                    }
                    else {
                        title = nls.localize('extensionActivating', "Extension is activating...");
                    }
                    data.activationTime.title = title;
                    (0, dom_1.clearNode)(data.msgContainer);
                    if (this._getUnresponsiveProfile(element.description.identifier)) {
                        const el = (0, dom_1.$)('span', undefined, ...(0, iconLabels_1.renderLabelWithIcons)(` $(alert) Unresponsive`));
                        el.title = nls.localize('unresponsive.title', "Extension has caused the extension host to freeze.");
                        data.msgContainer.appendChild(el);
                    }
                    if ((0, arrays_1.isNonEmptyArray)(element.status.runtimeErrors)) {
                        const el = (0, dom_1.$)('span', undefined, ...(0, iconLabels_1.renderLabelWithIcons)(`$(bug) ${nls.localize('errors', "{0} uncaught errors", element.status.runtimeErrors.length)}`));
                        data.msgContainer.appendChild(el);
                    }
                    if (element.status.messages && element.status.messages.length > 0) {
                        const el = (0, dom_1.$)('span', undefined, ...(0, iconLabels_1.renderLabelWithIcons)(`$(alert) ${element.status.messages[0].message}`));
                        data.msgContainer.appendChild(el);
                    }
                    let extraLabel = null;
                    if (element.status.runningLocation && element.status.runningLocation.equals(new extensionRunningLocation_1.LocalWebWorkerRunningLocation(0))) {
                        extraLabel = `$(globe) web worker`;
                    }
                    else if (element.description.extensionLocation.scheme === network_1.Schemas.vscodeRemote) {
                        const hostLabel = this._labelService.getHostLabel(network_1.Schemas.vscodeRemote, this._environmentService.remoteAuthority);
                        if (hostLabel) {
                            extraLabel = `$(remote) ${hostLabel}`;
                        }
                        else {
                            extraLabel = `$(remote) ${element.description.extensionLocation.authority}`;
                        }
                    }
                    else if (element.status.runningLocation && element.status.runningLocation.affinity > 0) {
                        extraLabel = element.status.runningLocation instanceof extensionRunningLocation_1.LocalWebWorkerRunningLocation
                            ? `$(globe) web worker ${element.status.runningLocation.affinity + 1}`
                            : `$(server-process) local process ${element.status.runningLocation.affinity + 1}`;
                    }
                    if (extraLabel) {
                        const el = (0, dom_1.$)('span', undefined, ...(0, iconLabels_1.renderLabelWithIcons)(extraLabel));
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
                    data.disposables = (0, lifecycle_1.dispose)(data.disposables);
                }
            };
            this._list = this._instantiationService.createInstance(listService_1.WorkbenchList, 'RuntimeExtensions', parent, delegate, [renderer], {
                multipleSelectionSupport: false,
                setRowLineHeight: false,
                horizontalScrolling: false,
                overrideStyles: {
                    listBackground: colorRegistry_1.editorBackground
                },
                accessibilityProvider: new class {
                    getWidgetAriaLabel() {
                        return nls.localize('runtimeExtensions', "Runtime Extensions");
                    }
                    getAriaLabel(element) {
                        return element.description.name;
                    }
                }
            });
            this._list.splice(0, this._list.length, this._elements || undefined);
            this._list.onContextMenu((e) => {
                if (!e.element) {
                    return;
                }
                const actions = [];
                actions.push(new actions_1.Action('runtimeExtensionsEditor.action.copyId', nls.localize('copy id', "Copy id ({0})", e.element.description.identifier.value), undefined, true, () => {
                    this._clipboardService.writeText(e.element.description.identifier.value);
                }));
                const reportExtensionIssueAction = this._createReportExtensionIssueAction(e.element);
                if (reportExtensionIssueAction) {
                    actions.push(reportExtensionIssueAction);
                }
                actions.push(new actions_1.Separator());
                if (e.element.marketplaceInfo) {
                    actions.push(new actions_1.Action('runtimeExtensionsEditor.action.disableWorkspace', nls.localize('disable workspace', "Disable (Workspace)"), undefined, true, () => this._extensionsWorkbenchService.setEnablement(e.element.marketplaceInfo, 7 /* EnablementState.DisabledWorkspace */)));
                    actions.push(new actions_1.Action('runtimeExtensionsEditor.action.disable', nls.localize('disable', "Disable"), undefined, true, () => this._extensionsWorkbenchService.setEnablement(e.element.marketplaceInfo, 6 /* EnablementState.DisabledGlobally */)));
                }
                actions.push(new actions_1.Separator());
                const profileAction = this._createProfileAction();
                if (profileAction) {
                    actions.push(profileAction);
                }
                const saveExtensionHostProfileAction = this.saveExtensionHostProfileAction;
                if (saveExtensionHostProfileAction) {
                    actions.push(saveExtensionHostProfileAction);
                }
                this._contextMenuService.showContextMenu({
                    getAnchor: () => e.anchor,
                    getActions: () => actions
                });
            });
        }
        get saveExtensionHostProfileAction() {
            return this._createSaveExtensionHostProfileAction();
        }
        layout(dimension) {
            this._list?.layout(dimension.height);
        }
    };
    exports.AbstractRuntimeExtensionsEditor = AbstractRuntimeExtensionsEditor;
    __decorate([
        decorators_1.memoize
    ], AbstractRuntimeExtensionsEditor.prototype, "saveExtensionHostProfileAction", null);
    exports.AbstractRuntimeExtensionsEditor = AbstractRuntimeExtensionsEditor = AbstractRuntimeExtensionsEditor_1 = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, themeService_1.IThemeService),
        __param(2, contextkey_1.IContextKeyService),
        __param(3, extensions_2.IExtensionsWorkbenchService),
        __param(4, extensions_3.IExtensionService),
        __param(5, notification_1.INotificationService),
        __param(6, contextView_1.IContextMenuService),
        __param(7, instantiation_1.IInstantiationService),
        __param(8, storage_1.IStorageService),
        __param(9, label_1.ILabelService),
        __param(10, environmentService_1.IWorkbenchEnvironmentService),
        __param(11, clipboardService_1.IClipboardService)
    ], AbstractRuntimeExtensionsEditor);
    class ShowRuntimeExtensionsAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.action.showRuntimeExtensions',
                title: { value: nls.localize('showRuntimeExtensions', "Show Running Extensions"), original: 'Show Running Extensions' },
                category: actionCommonCategories_1.Categories.Developer,
                f1: true,
                menu: {
                    id: actions_2.MenuId.ViewContainerTitle,
                    when: contextkey_1.ContextKeyExpr.equals('viewContainer', 'workbench.view.extensions'),
                    group: '2_enablement',
                    order: 3
                }
            });
        }
        async run(accessor) {
            await accessor.get(editorService_1.IEditorService).openEditor(runtimeExtensionsInput_1.RuntimeExtensionsInput.instance, { pinned: true });
        }
    }
    exports.ShowRuntimeExtensionsAction = ShowRuntimeExtensionsAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWJzdHJhY3RSdW50aW1lRXh0ZW5zaW9uc0VkaXRvci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2V4dGVuc2lvbnMvYnJvd3Nlci9hYnN0cmFjdFJ1bnRpbWVFeHRlbnNpb25zRWRpdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUE2RHpGLElBQWUsK0JBQStCLEdBQTlDLE1BQWUsK0JBQWdDLFNBQVEsdUJBQVU7O2lCQUVoRCxPQUFFLEdBQVcsb0NBQW9DLEFBQS9DLENBQWdEO1FBTXpFLFlBQ29CLGdCQUFtQyxFQUN2QyxZQUEyQixFQUN0QixpQkFBcUMsRUFDWCwyQkFBd0QsRUFDbEUsaUJBQW9DLEVBQ2pDLG9CQUEwQyxFQUMzQyxtQkFBd0MsRUFDcEMscUJBQTRDLEVBQ3JFLGNBQStCLEVBQ2hCLGFBQTRCLEVBQ2IsbUJBQWlELEVBQzVELGlCQUFvQztZQUV4RSxLQUFLLENBQUMsaUNBQStCLENBQUMsRUFBRSxFQUFFLGdCQUFnQixFQUFFLFlBQVksRUFBRSxjQUFjLENBQUMsQ0FBQztZQVY1QyxnQ0FBMkIsR0FBM0IsMkJBQTJCLENBQTZCO1lBQ2xFLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBbUI7WUFDakMseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFzQjtZQUMzQyx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFCO1lBQ3BDLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFFdEQsa0JBQWEsR0FBYixhQUFhLENBQWU7WUFDYix3QkFBbUIsR0FBbkIsbUJBQW1CLENBQThCO1lBQzVELHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBbUI7WUFJeEUsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7WUFDbEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7WUFDdEIsSUFBSSxDQUFDLFdB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