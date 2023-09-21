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
    exports.$Mkb = void 0;
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
        constructor(c, d, provider, features, label, id) {
            this.c = c;
            this.d = d;
            this.provider = provider;
            this.features = features;
            this.label = label;
            this.id = id;
            this.elements = [];
            this.a = new event_1.$fd();
            this.onDidSplice = this.a.event;
            this.b = new event_1.$fd();
            this.onDidChange = this.b.event;
        }
        toJSON() {
            return {
                $mid: 4 /* MarshalledId.ScmResourceGroup */,
                sourceControlHandle: this.c,
                groupHandle: this.d
            };
        }
        splice(start, deleteCount, toInsert) {
            this.elements.splice(start, deleteCount, ...toInsert);
            this.a.fire({ start, deleteCount, toInsert });
        }
        $updateGroup(features) {
            this.features = { ...this.features, ...features };
            this.b.fire();
        }
        $updateGroupLabel(label) {
            this.label = label;
            this.b.fire();
        }
    }
    class MainThreadSCMResource {
        constructor(a, b, c, d, sourceUri, resourceGroup, decorations, contextValue, command) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.sourceUri = sourceUri;
            this.resourceGroup = resourceGroup;
            this.decorations = decorations;
            this.contextValue = contextValue;
            this.command = command;
        }
        open(preserveFocus) {
            return this.a.$executeResourceCommand(this.b, this.c, this.d, preserveFocus);
        }
        toJSON() {
            return {
                $mid: 3 /* MarshalledId.ScmResource */,
                sourceControlHandle: this.b,
                groupHandle: this.c,
                handle: this.d
            };
        }
    }
    class MainThreadSCMHistoryProvider {
        get actionButton() { return this.c; }
        set actionButton(actionButton) {
            this.c = actionButton;
            this.a.fire();
        }
        get currentHistoryItemGroup() { return this.d; }
        set currentHistoryItemGroup(historyItemGroup) {
            this.d = historyItemGroup;
            this.b.fire();
        }
        constructor(e, f) {
            this.e = e;
            this.f = f;
            this.a = new event_1.$fd();
            this.onDidChangeActionButton = this.a.event;
            this.b = new event_1.$fd();
            this.onDidChangeCurrentHistoryItemGroup = this.b.event;
        }
        async resolveHistoryItemGroupBase(historyItemGroupId) {
            return this.e.$resolveHistoryItemGroupBase(this.f, historyItemGroupId, cancellation_1.CancellationToken.None);
        }
        async resolveHistoryItemGroupCommonAncestor(historyItemGroupId1, historyItemGroupId2) {
            return this.e.$resolveHistoryItemGroupCommonAncestor(this.f, historyItemGroupId1, historyItemGroupId2, cancellation_1.CancellationToken.None);
        }
        async provideHistoryItems(historyItemGroupId, options) {
            const historyItems = await this.e.$provideHistoryItems(this.f, historyItemGroupId, options, cancellation_1.CancellationToken.None);
            return historyItems?.map(historyItem => ({ ...historyItem, icon: getSCMHistoryItemIcon(historyItem), }));
        }
        async provideHistoryItemChanges(historyItemId) {
            const changes = await this.e.$provideHistoryItemChanges(this.f, historyItemId, cancellation_1.CancellationToken.None);
            return changes?.map(change => ({
                uri: uri_1.URI.revive(change.uri),
                originalUri: change.originalUri && uri_1.URI.revive(change.originalUri),
                modifiedUri: change.modifiedUri && uri_1.URI.revive(change.modifiedUri),
                renameUri: change.renameUri && uri_1.URI.revive(change.renameUri)
            }));
        }
    }
    class MainThreadSCMProvider {
        static { this.a = 0; }
        get id() { return this.b; }
        get handle() { return this.m; }
        get label() { return this.o; }
        get rootUri() { return this.p; }
        get inputBoxDocumentUri() { return this.q; }
        get contextValue() { return this.n; }
        get commitTemplate() { return this.e.commitTemplate || ''; }
        get historyProvider() { return this.k; }
        get acceptInputCommand() { return this.e.acceptInputCommand; }
        get actionButton() { return this.e.actionButton ?? undefined; }
        get statusBarCommands() { return this.e.statusBarCommands; }
        get count() { return this.e.count; }
        get onDidChangeStatusBarCommands() { return this.g.event; }
        constructor(l, m, n, o, p, q, s) {
            this.l = l;
            this.m = m;
            this.n = n;
            this.o = o;
            this.p = p;
            this.q = q;
            this.s = s;
            this.b = `scm${MainThreadSCMProvider.a++}`;
            this.groups = new sequence_1.$cb();
            this.c = Object.create(null);
            // get groups(): ISequence<ISCMResourceGroup> {
            // 	return {
            // 		elements: this._groups,
            // 		onDidSplice: this._onDidSplice.event
            // 	};
            // 	// return this._groups
            // 	// 	.filter(g => g.resources.elements.length > 0 || !g.features.hideWhenEmpty);
            // }
            this.d = new event_1.$fd();
            this.onDidChangeResources = this.d.event;
            this.e = {};
            this.f = new event_1.$fd();
            this.onDidChangeCommitTemplate = this.f.event;
            this.g = new event_1.$fd();
            this.h = new event_1.$fd();
            this.onDidChangeHistoryProvider = this.h.event;
            this.i = new event_1.$fd();
            this.onDidChange = this.i.event;
            this.isSCM = true;
        }
        $updateSourceControl(features) {
            this.e = { ...this.e, ...features };
            this.i.fire();
            if (typeof features.commitTemplate !== 'undefined') {
                this.f.fire(this.commitTemplate);
            }
            if (typeof features.statusBarCommands !== 'undefined') {
                this.g.fire(this.statusBarCommands);
            }
            if (features.hasQuickDiffProvider && !this.j) {
                this.j = this.s.addQuickDiffProvider({
                    label: features.quickDiffLabel ?? this.label,
                    rootUri: this.rootUri,
                    isSCM: this.isSCM,
                    getOriginalResource: (uri) => this.getOriginalResource(uri)
                });
            }
            else if (features.hasQuickDiffProvider === false && this.j) {
                this.j.dispose();
                this.j = undefined;
            }
            if (features.hasHistoryProvider && !this.k) {
                this.k = new MainThreadSCMHistoryProvider(this.l, this.handle);
                this.h.fire();
            }
            else if (features.hasHistoryProvider === false && this.k) {
                this.k = undefined;
                this.h.fire();
            }
        }
        $registerGroups(_groups) {
            const groups = _groups.map(([handle, id, label, features]) => {
                const group = new MainThreadSCMResourceGroup(this.handle, handle, this, features, label, id);
                this.c[handle] = group;
                return group;
            });
            this.groups.splice(this.groups.elements.length, 0, groups);
        }
        $updateGroup(handle, features) {
            const group = this.c[handle];
            if (!group) {
                return;
            }
            group.$updateGroup(features);
        }
        $updateGroupLabel(handle, label) {
            const group = this.c[handle];
            if (!group) {
                return;
            }
            group.$updateGroupLabel(label);
        }
        $spliceGroupResourceStates(splices) {
            for (const [groupHandle, groupSlices] of splices) {
                const group = this.c[groupHandle];
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
                        return new MainThreadSCMResource(this.l, this.handle, groupHandle, handle, uri_1.URI.revive(sourceUri), group, decorations, contextValue || undefined, command);
                    });
                    group.splice(start, deleteCount, resources);
                }
            }
            this.d.fire();
        }
        $unregisterGroup(handle) {
            const group = this.c[handle];
            if (!group) {
                return;
            }
            delete this.c[handle];
            this.groups.splice(this.groups.elements.indexOf(group), 1);
            this.d.fire();
        }
        async getOriginalResource(uri) {
            if (!this.e.hasQuickDiffProvider) {
                return null;
            }
            const result = await this.l.$provideOriginalResource(this.handle, uri, cancellation_1.CancellationToken.None);
            return result && uri_1.URI.revive(result);
        }
        $onDidChangeHistoryProviderActionButton(actionButton) {
            if (!this.k) {
                return;
            }
            this.k.actionButton = actionButton ?? undefined;
        }
        $onDidChangeHistoryProviderCurrentHistoryItemGroup(currentHistoryItemGroup) {
            if (!this.k) {
                return;
            }
            this.k.currentHistoryItemGroup = currentHistoryItemGroup ?? undefined;
        }
        toJSON() {
            return {
                $mid: 5 /* MarshalledId.ScmProvider */,
                handle: this.handle
            };
        }
        dispose() {
            this.j?.dispose();
        }
    }
    let $Mkb = class $Mkb {
        constructor(extHostContext, e, f, g) {
            this.e = e;
            this.f = f;
            this.g = g;
            this.b = new Map();
            this.c = new Map();
            this.d = new lifecycle_1.$jc();
            this.a = extHostContext.getProxy(extHost_protocol_1.$2J.ExtHostSCM);
        }
        dispose() {
            (0, lifecycle_1.$fc)(this.b.values());
            this.b.clear();
            (0, lifecycle_1.$fc)(this.c.values());
            this.c.clear();
            this.d.dispose();
        }
        $registerSourceControl(handle, id, label, rootUri, inputBoxDocumentUri) {
            const provider = new MainThreadSCMProvider(this.a, handle, id, label, rootUri ? uri_1.URI.revive(rootUri) : undefined, uri_1.URI.revive(inputBoxDocumentUri), this.g);
            const repository = this.e.registerSCMProvider(provider);
            this.b.set(handle, repository);
            const disposable = (0, lifecycle_1.$hc)(event_1.Event.filter(this.f.onDidFocusRepository, r => r === repository)(_ => this.a.$setSelectedSourceControl(handle)), repository.input.onDidChange(({ value }) => this.a.$onInputBoxValueChange(handle, value)));
            if (this.f.focusedRepository === repository) {
                setTimeout(() => this.a.$setSelectedSourceControl(handle), 0);
            }
            if (repository.input.value) {
                setTimeout(() => this.a.$onInputBoxValueChange(handle, repository.input.value), 0);
            }
            this.c.set(handle, disposable);
        }
        $updateSourceControl(handle, features) {
            const repository = this.b.get(handle);
            if (!repository) {
                return;
            }
            const provider = repository.provider;
            provider.$updateSourceControl(features);
        }
        $unregisterSourceControl(handle) {
            const repository = this.b.get(handle);
            if (!repository) {
                return;
            }
            this.c.get(handle).dispose();
            this.c.delete(handle);
            repository.dispose();
            this.b.delete(handle);
        }
        $registerGroups(sourceControlHandle, groups, splices) {
            const repository = this.b.get(sourceControlHandle);
            if (!repository) {
                return;
            }
            const provider = repository.provider;
            provider.$registerGroups(groups);
            provider.$spliceGroupResourceStates(splices);
        }
        $updateGroup(sourceControlHandle, groupHandle, features) {
            const repository = this.b.get(sourceControlHandle);
            if (!repository) {
                return;
            }
            const provider = repository.provider;
            provider.$updateGroup(groupHandle, features);
        }
        $updateGroupLabel(sourceControlHandle, groupHandle, label) {
            const repository = this.b.get(sourceControlHandle);
            if (!repository) {
                return;
            }
            const provider = repository.provider;
            provider.$updateGroupLabel(groupHandle, label);
        }
        $spliceResourceStates(sourceControlHandle, splices) {
            const repository = this.b.get(sourceControlHandle);
            if (!repository) {
                return;
            }
            const provider = repository.provider;
            provider.$spliceGroupResourceStates(splices);
        }
        $unregisterGroup(sourceControlHandle, handle) {
            const repository = this.b.get(sourceControlHandle);
            if (!repository) {
                return;
            }
            const provider = repository.provider;
            provider.$unregisterGroup(handle);
        }
        $setInputBoxValue(sourceControlHandle, value) {
            const repository = this.b.get(sourceControlHandle);
            if (!repository) {
                return;
            }
            repository.input.setValue(value, false);
        }
        $setInputBoxPlaceholder(sourceControlHandle, placeholder) {
            const repository = this.b.get(sourceControlHandle);
            if (!repository) {
                return;
            }
            repository.input.placeholder = placeholder;
        }
        $setInputBoxEnablement(sourceControlHandle, enabled) {
            const repository = this.b.get(sourceControlHandle);
            if (!repository) {
                return;
            }
            repository.input.enabled = enabled;
        }
        $setInputBoxVisibility(sourceControlHandle, visible) {
            const repository = this.b.get(sourceControlHandle);
            if (!repository) {
                return;
            }
            repository.input.visible = visible;
        }
        $showValidationMessage(sourceControlHandle, message, type) {
            const repository = this.b.get(sourceControlHandle);
            if (!repository) {
                return;
            }
            repository.input.showValidationMessage(message, type);
        }
        $setValidationProviderIsEnabled(sourceControlHandle, enabled) {
            const repository = this.b.get(sourceControlHandle);
            if (!repository) {
                return;
            }
            if (enabled) {
                repository.input.validateInput = async (value, pos) => {
                    const result = await this.a.$validateInput(sourceControlHandle, value, pos);
                    return result && { message: result[0], type: result[1] };
                };
            }
            else {
                repository.input.validateInput = async () => undefined;
            }
        }
        $onDidChangeHistoryProviderActionButton(sourceControlHandle, actionButton) {
            const repository = this.b.get(sourceControlHandle);
            if (!repository) {
                return;
            }
            const provider = repository.provider;
            provider.$onDidChangeHistoryProviderActionButton(actionButton);
        }
        $onDidChangeHistoryProviderCurrentHistoryItemGroup(sourceControlHandle, historyItemGroup) {
            const repository = this.b.get(sourceControlHandle);
            if (!repository) {
                return;
            }
            const provider = repository.provider;
            provider.$onDidChangeHistoryProviderCurrentHistoryItemGroup(historyItemGroup);
        }
    };
    exports.$Mkb = $Mkb;
    exports.$Mkb = $Mkb = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadSCM),
        __param(1, scm_1.$fI),
        __param(2, scm_1.$gI),
        __param(3, quickDiff_1.$aeb)
    ], $Mkb);
});
//# sourceMappingURL=mainThreadSCM.js.map