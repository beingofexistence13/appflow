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
define(["require", "exports", "vs/base/common/uri", "vs/base/common/event", "vs/base/common/lifecycle", "vs/workbench/contrib/scm/common/scm", "../common/extHost.protocol", "vs/workbench/services/extensions/common/extHostCustomers", "vs/base/common/sequence", "vs/base/common/cancellation", "vs/base/common/themables", "vs/workbench/contrib/scm/common/quickDiff"], function (require, exports, uri_1, event_1, lifecycle_1, scm_1, extHost_protocol_1, extHostCustomers_1, sequence_1, cancellation_1, themables_1, quickDiff_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadSCM = void 0;
    function getSCMHistoryItemIcon(historyItem) {
        if (!historyItem.icon) {
            return undefined;
        }
        else if (uri_1.URI.isUri(historyItem.icon)) {
            return uri_1.URI.revive(historyItem.icon);
        }
        else if (themables_1.ThemeIcon.isThemeIcon(historyItem.icon)) {
            return historyItem.icon;
        }
        else {
            const icon = historyItem.icon;
            return { light: uri_1.URI.revive(icon.light), dark: uri_1.URI.revive(icon.dark) };
        }
    }
    class MainThreadSCMResourceGroup {
        get hideWhenEmpty() { return !!this.features.hideWhenEmpty; }
        constructor(sourceControlHandle, handle, provider, features, label, id) {
            this.sourceControlHandle = sourceControlHandle;
            this.handle = handle;
            this.provider = provider;
            this.features = features;
            this.label = label;
            this.id = id;
            this.elements = [];
            this._onDidSplice = new event_1.Emitter();
            this.onDidSplice = this._onDidSplice.event;
            this._onDidChange = new event_1.Emitter();
            this.onDidChange = this._onDidChange.event;
        }
        toJSON() {
            return {
                $mid: 4 /* MarshalledId.ScmResourceGroup */,
                sourceControlHandle: this.sourceControlHandle,
                groupHandle: this.handle
            };
        }
        splice(start, deleteCount, toInsert) {
            this.elements.splice(start, deleteCount, ...toInsert);
            this._onDidSplice.fire({ start, deleteCount, toInsert });
        }
        $updateGroup(features) {
            this.features = { ...this.features, ...features };
            this._onDidChange.fire();
        }
        $updateGroupLabel(label) {
            this.label = label;
            this._onDidChange.fire();
        }
    }
    class MainThreadSCMResource {
        constructor(proxy, sourceControlHandle, groupHandle, handle, sourceUri, resourceGroup, decorations, contextValue, command) {
            this.proxy = proxy;
            this.sourceControlHandle = sourceControlHandle;
            this.groupHandle = groupHandle;
            this.handle = handle;
            this.sourceUri = sourceUri;
            this.resourceGroup = resourceGroup;
            this.decorations = decorations;
            this.contextValue = contextValue;
            this.command = command;
        }
        open(preserveFocus) {
            return this.proxy.$executeResourceCommand(this.sourceControlHandle, this.groupHandle, this.handle, preserveFocus);
        }
        toJSON() {
            return {
                $mid: 3 /* MarshalledId.ScmResource */,
                sourceControlHandle: this.sourceControlHandle,
                groupHandle: this.groupHandle,
                handle: this.handle
            };
        }
    }
    class MainThreadSCMHistoryProvider {
        get actionButton() { return this._actionButton; }
        set actionButton(actionButton) {
            this._actionButton = actionButton;
            this._onDidChangeActionButton.fire();
        }
        get currentHistoryItemGroup() { return this._currentHistoryItemGroup; }
        set currentHistoryItemGroup(historyItemGroup) {
            this._currentHistoryItemGroup = historyItemGroup;
            this._onDidChangeCurrentHistoryItemGroup.fire();
        }
        constructor(proxy, handle) {
            this.proxy = proxy;
            this.handle = handle;
            this._onDidChangeActionButton = new event_1.Emitter();
            this.onDidChangeActionButton = this._onDidChangeActionButton.event;
            this._onDidChangeCurrentHistoryItemGroup = new event_1.Emitter();
            this.onDidChangeCurrentHistoryItemGroup = this._onDidChangeCurrentHistoryItemGroup.event;
        }
        async resolveHistoryItemGroupBase(historyItemGroupId) {
            return this.proxy.$resolveHistoryItemGroupBase(this.handle, historyItemGroupId, cancellation_1.CancellationToken.None);
        }
        async resolveHistoryItemGroupCommonAncestor(historyItemGroupId1, historyItemGroupId2) {
            return this.proxy.$resolveHistoryItemGroupCommonAncestor(this.handle, historyItemGroupId1, historyItemGroupId2, cancellation_1.CancellationToken.None);
        }
        async provideHistoryItems(historyItemGroupId, options) {
            const historyItems = await this.proxy.$provideHistoryItems(this.handle, historyItemGroupId, options, cancellation_1.CancellationToken.None);
            return historyItems?.map(historyItem => ({ ...historyItem, icon: getSCMHistoryItemIcon(historyItem), }));
        }
        async provideHistoryItemChanges(historyItemId) {
            const changes = await this.proxy.$provideHistoryItemChanges(this.handle, historyItemId, cancellation_1.CancellationToken.None);
            return changes?.map(change => ({
                uri: uri_1.URI.revive(change.uri),
                originalUri: change.originalUri && uri_1.URI.revive(change.originalUri),
                modifiedUri: change.modifiedUri && uri_1.URI.revive(change.modifiedUri),
                renameUri: change.renameUri && uri_1.URI.revive(change.renameUri)
            }));
        }
    }
    class MainThreadSCMProvider {
        static { this.ID_HANDLE = 0; }
        get id() { return this._id; }
        get handle() { return this._handle; }
        get label() { return this._label; }
        get rootUri() { return this._rootUri; }
        get inputBoxDocumentUri() { return this._inputBoxDocumentUri; }
        get contextValue() { return this._contextValue; }
        get commitTemplate() { return this.features.commitTemplate || ''; }
        get historyProvider() { return this._historyProvider; }
        get acceptInputCommand() { return this.features.acceptInputCommand; }
        get actionButton() { return this.features.actionButton ?? undefined; }
        get statusBarCommands() { return this.features.statusBarCommands; }
        get count() { return this.features.count; }
        get onDidChangeStatusBarCommands() { return this._onDidChangeStatusBarCommands.event; }
        constructor(proxy, _handle, _contextValue, _label, _rootUri, _inputBoxDocumentUri, _quickDiffService) {
            this.proxy = proxy;
            this._handle = _handle;
            this._contextValue = _contextValue;
            this._label = _label;
            this._rootUri = _rootUri;
            this._inputBoxDocumentUri = _inputBoxDocumentUri;
            this._quickDiffService = _quickDiffService;
            this._id = `scm${MainThreadSCMProvider.ID_HANDLE++}`;
            this.groups = new sequence_1.Sequence();
            this._groupsByHandle = Object.create(null);
            // get groups(): ISequence<ISCMResourceGroup> {
            // 	return {
            // 		elements: this._groups,
            // 		onDidSplice: this._onDidSplice.event
            // 	};
            // 	// return this._groups
            // 	// 	.filter(g => g.resources.elements.length > 0 || !g.features.hideWhenEmpty);
            // }
            this._onDidChangeResources = new event_1.Emitter();
            this.onDidChangeResources = this._onDidChangeResources.event;
            this.features = {};
            this._onDidChangeCommitTemplate = new event_1.Emitter();
            this.onDidChangeCommitTemplate = this._onDidChangeCommitTemplate.event;
            this._onDidChangeStatusBarCommands = new event_1.Emitter();
            this._onDidChangeHistoryProvider = new event_1.Emitter();
            this.onDidChangeHistoryProvider = this._onDidChangeHistoryProvider.event;
            this._onDidChange = new event_1.Emitter();
            this.onDidChange = this._onDidChange.event;
            this.isSCM = true;
        }
        $updateSourceControl(features) {
            this.features = { ...this.features, ...features };
            this._onDidChange.fire();
            if (typeof features.commitTemplate !== 'undefined') {
                this._onDidChangeCommitTemplate.fire(this.commitTemplate);
            }
            if (typeof features.statusBarCommands !== 'undefined') {
                this._onDidChangeStatusBarCommands.fire(this.statusBarCommands);
            }
            if (features.hasQuickDiffProvider && !this._quickDiff) {
                this._quickDiff = this._quickDiffService.addQuickDiffProvider({
                    label: features.quickDiffLabel ?? this.label,
                    rootUri: this.rootUri,
                    isSCM: this.isSCM,
                    getOriginalResource: (uri) => this.getOriginalResource(uri)
                });
            }
            else if (features.hasQuickDiffProvider === false && this._quickDiff) {
                this._quickDiff.dispose();
                this._quickDiff = undefined;
            }
            if (features.hasHistoryProvider && !this._historyProvider) {
                this._historyProvider = new MainThreadSCMHistoryProvider(this.proxy, this.handle);
                this._onDidChangeHistoryProvider.fire();
            }
            else if (features.hasHistoryProvider === false && this._historyProvider) {
                this._historyProvider = undefined;
                this._onDidChangeHistoryProvider.fire();
            }
        }
        $registerGroups(_groups) {
            const groups = _groups.map(([handle, id, label, features]) => {
                const group = new MainThreadSCMResourceGroup(this.handle, handle, this, features, label, id);
                this._groupsByHandle[handle] = group;
                return group;
            });
            this.groups.splice(this.groups.elements.length, 0, groups);
        }
        $updateGroup(handle, features) {
            const group = this._groupsByHandle[handle];
            if (!group) {
                return;
            }
            group.$updateGroup(features);
        }
        $updateGroupLabel(handle, label) {
            const group = this._groupsByHandle[handle];
            if (!group) {
                return;
            }
            group.$updateGroupLabel(label);
        }
        $spliceGroupResourceStates(splices) {
            for (const [groupHandle, groupSlices] of splices) {
                const group = this._groupsByHandle[groupHandle];
                if (!group) {
                    console.warn(`SCM group ${groupHandle} not found in provider ${this.label}`);
                    continue;
                }
                // reverse the splices sequence in order to apply them correctly
                groupSlices.reverse();
                for (const [start, deleteCount, rawResources] of groupSlices) {
                    const resources = rawResources.map(rawResource => {
                        const [handle, sourceUri, icons, tooltip, strikeThrough, faded, contextValue, command] = rawResource;
                        const [light, dark] = icons;
                        const icon = themables_1.ThemeIcon.isThemeIcon(light) ? light : uri_1.URI.revive(light);
                        const iconDark = (themables_1.ThemeIcon.isThemeIcon(dark) ? dark : uri_1.URI.revive(dark)) || icon;
                        const decorations = {
                            icon: icon,
                            iconDark: iconDark,
                            tooltip,
                            strikeThrough,
                            faded
                        };
                        return new MainThreadSCMResource(this.proxy, this.handle, groupHandle, handle, uri_1.URI.revive(sourceUri), group, decorations, contextValue || undefined, command);
                    });
                    group.splice(start, deleteCount, resources);
                }
            }
            this._onDidChangeResources.fire();
        }
        $unregisterGroup(handle) {
            const group = this._groupsByHandle[handle];
            if (!group) {
                return;
            }
            delete this._groupsByHandle[handle];
            this.groups.splice(this.groups.elements.indexOf(group), 1);
            this._onDidChangeResources.fire();
        }
        async getOriginalResource(uri) {
            if (!this.features.hasQuickDiffProvider) {
                return null;
            }
            const result = await this.proxy.$provideOriginalResource(this.handle, uri, cancellation_1.CancellationToken.None);
            return result && uri_1.URI.revive(result);
        }
        $onDidChangeHistoryProviderActionButton(actionButton) {
            if (!this._historyProvider) {
                return;
            }
            this._historyProvider.actionButton = actionButton ?? undefined;
        }
        $onDidChangeHistoryProviderCurrentHistoryItemGroup(currentHistoryItemGroup) {
            if (!this._historyProvider) {
                return;
            }
            this._historyProvider.currentHistoryItemGroup = currentHistoryItemGroup ?? undefined;
        }
        toJSON() {
            return {
                $mid: 5 /* MarshalledId.ScmProvider */,
                handle: this.handle
            };
        }
        dispose() {
            this._quickDiff?.dispose();
        }
    }
    let MainThreadSCM = class MainThreadSCM {
        constructor(extHostContext, scmService, scmViewService, quickDiffService) {
            this.scmService = scmService;
            this.scmViewService = scmViewService;
            this.quickDiffService = quickDiffService;
            this._repositories = new Map();
            this._repositoryDisposables = new Map();
            this._disposables = new lifecycle_1.DisposableStore();
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostSCM);
        }
        dispose() {
            (0, lifecycle_1.dispose)(this._repositories.values());
            this._repositories.clear();
            (0, lifecycle_1.dispose)(this._repositoryDisposables.values());
            this._repositoryDisposables.clear();
            this._disposables.dispose();
        }
        $registerSourceControl(handle, id, label, rootUri, inputBoxDocumentUri) {
            const provider = new MainThreadSCMProvider(this._proxy, handle, id, label, rootUri ? uri_1.URI.revive(rootUri) : undefined, uri_1.URI.revive(inputBoxDocumentUri), this.quickDiffService);
            const repository = this.scmService.registerSCMProvider(provider);
            this._repositories.set(handle, repository);
            const disposable = (0, lifecycle_1.combinedDisposable)(event_1.Event.filter(this.scmViewService.onDidFocusRepository, r => r === repository)(_ => this._proxy.$setSelectedSourceControl(handle)), repository.input.onDidChange(({ value }) => this._proxy.$onInputBoxValueChange(handle, value)));
            if (this.scmViewService.focusedRepository === repository) {
                setTimeout(() => this._proxy.$setSelectedSourceControl(handle), 0);
            }
            if (repository.input.value) {
                setTimeout(() => this._proxy.$onInputBoxValueChange(handle, repository.input.value), 0);
            }
            this._repositoryDisposables.set(handle, disposable);
        }
        $updateSourceControl(handle, features) {
            const repository = this._repositories.get(handle);
            if (!repository) {
                return;
            }
            const provider = repository.provider;
            provider.$updateSourceControl(features);
        }
        $unregisterSourceControl(handle) {
            const repository = this._repositories.get(handle);
            if (!repository) {
                return;
            }
            this._repositoryDisposables.get(handle).dispose();
            this._repositoryDisposables.delete(handle);
            repository.dispose();
            this._repositories.delete(handle);
        }
        $registerGroups(sourceControlHandle, groups, splices) {
            const repository = this._repositories.get(sourceControlHandle);
            if (!repository) {
                return;
            }
            const provider = repository.provider;
            provider.$registerGroups(groups);
            provider.$spliceGroupResourceStates(splices);
        }
        $updateGroup(sourceControlHandle, groupHandle, features) {
            const repository = this._repositories.get(sourceControlHandle);
            if (!repository) {
                return;
            }
            const provider = repository.provider;
            provider.$updateGroup(groupHandle, features);
        }
        $updateGroupLabel(sourceControlHandle, groupHandle, label) {
            const repository = this._repositories.get(sourceControlHandle);
            if (!repository) {
                return;
            }
            const provider = repository.provider;
            provider.$updateGroupLabel(groupHandle, label);
        }
        $spliceResourceStates(sourceControlHandle, splices) {
            const repository = this._repositories.get(sourceControlHandle);
            if (!repository) {
                return;
            }
            const provider = repository.provider;
            provider.$spliceGroupResourceStates(splices);
        }
        $unregisterGroup(sourceControlHandle, handle) {
            const repository = this._repositories.get(sourceControlHandle);
            if (!repository) {
                return;
            }
            const provider = repository.provider;
            provider.$unregisterGroup(handle);
        }
        $setInputBoxValue(sourceControlHandle, value) {
            const repository = this._repositories.get(sourceControlHandle);
            if (!repository) {
                return;
            }
            repository.input.setValue(value, false);
        }
        $setInputBoxPlaceholder(sourceControlHandle, placeholder) {
            const repository = this._repositories.get(sourceControlHandle);
            if (!repository) {
                return;
            }
            repository.input.placeholder = placeholder;
        }
        $setInputBoxEnablement(sourceControlHandle, enabled) {
            const repository = this._repositories.get(sourceControlHandle);
            if (!repository) {
                return;
            }
            repository.input.enabled = enabled;
        }
        $setInputBoxVisibility(sourceControlHandle, visible) {
            const repository = this._repositories.get(sourceControlHandle);
            if (!repository) {
                return;
            }
            repository.input.visible = visible;
        }
        $showValidationMessage(sourceControlHandle, message, type) {
            const repository = this._repositories.get(sourceControlHandle);
            if (!repository) {
                return;
            }
            repository.input.showValidationMessage(message, type);
        }
        $setValidationProviderIsEnabled(sourceControlHandle, enabled) {
            const repository = this._repositories.get(sourceControlHandle);
            if (!repository) {
                return;
            }
            if (enabled) {
                repository.input.validateInput = async (value, pos) => {
                    const result = await this._proxy.$validateInput(sourceControlHandle, value, pos);
                    return result && { message: result[0], type: result[1] };
                };
            }
            else {
                repository.input.validateInput = async () => undefined;
            }
        }
        $onDidChangeHistoryProviderActionButton(sourceControlHandle, actionButton) {
            const repository = this._repositories.get(sourceControlHandle);
            if (!repository) {
                return;
            }
            const provider = repository.provider;
            provider.$onDidChangeHistoryProviderActionButton(actionButton);
        }
        $onDidChangeHistoryProviderCurrentHistoryItemGroup(sourceControlHandle, historyItemGroup) {
            const repository = this._repositories.get(sourceControlHandle);
            if (!repository) {
                return;
            }
            const provider = repository.provider;
            provider.$onDidChangeHistoryProviderCurrentHistoryItemGroup(historyItemGroup);
        }
    };
    exports.MainThreadSCM = MainThreadSCM;
    exports.MainThreadSCM = MainThreadSCM = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadSCM),
        __param(1, scm_1.ISCMService),
        __param(2, scm_1.ISCMViewService),
        __param(3, quickDiff_1.IQuickDiffService)
    ], MainThreadSCM);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZFNDTS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvYnJvd3Nlci9tYWluVGhyZWFkU0NNLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWlCaEcsU0FBUyxxQkFBcUIsQ0FBQyxXQUE4QjtRQUM1RCxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRTtZQUN0QixPQUFPLFNBQVMsQ0FBQztTQUNqQjthQUFNLElBQUksU0FBRyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDdkMsT0FBTyxTQUFHLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNwQzthQUFNLElBQUkscUJBQVMsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ25ELE9BQU8sV0FBVyxDQUFDLElBQUksQ0FBQztTQUN4QjthQUFNO1lBQ04sTUFBTSxJQUFJLEdBQUcsV0FBVyxDQUFDLElBQXFELENBQUM7WUFDL0UsT0FBTyxFQUFFLEtBQUssRUFBRSxTQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxJQUFJLEVBQUUsU0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztTQUN0RTtJQUNGLENBQUM7SUFFRCxNQUFNLDBCQUEwQjtRQU8vQixJQUFJLGFBQWEsS0FBYyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7UUFLdEUsWUFDa0IsbUJBQTJCLEVBQzNCLE1BQWMsRUFDeEIsUUFBc0IsRUFDdEIsUUFBMEIsRUFDMUIsS0FBYSxFQUNiLEVBQVU7WUFMQSx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQVE7WUFDM0IsV0FBTSxHQUFO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