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
define(["require", "exports", "vs/base/common/uri", "vs/base/common/event", "vs/base/common/decorators", "vs/base/common/lifecycle", "vs/base/common/async", "./extHost.protocol", "vs/base/common/arrays", "vs/base/common/comparers", "vs/platform/log/common/log", "vs/platform/extensions/common/extensions", "vs/base/common/themables", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/services/extensions/common/extensions", "vs/base/common/network"], function (require, exports, uri_1, event_1, decorators_1, lifecycle_1, async_1, extHost_protocol_1, arrays_1, comparers_1, log_1, extensions_1, themables_1, extHostTypeConverters_1, extensions_2, network_1) {
    "use strict";
    var $4bc_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$4bc = exports.$3bc = void 0;
    function getIconResource(decorations) {
        if (!decorations) {
            return undefined;
        }
        else if (typeof decorations.iconPath === 'string') {
            return uri_1.URI.file(decorations.iconPath);
        }
        else if (uri_1.URI.isUri(decorations.iconPath)) {
            return decorations.iconPath;
        }
        else if (themables_1.ThemeIcon.isThemeIcon(decorations.iconPath)) {
            return decorations.iconPath;
        }
        else {
            return undefined;
        }
    }
    function getHistoryItemIconDto(historyItem) {
        if (!historyItem.icon) {
            return undefined;
        }
        else if (uri_1.URI.isUri(historyItem.icon)) {
            return historyItem.icon;
        }
        else if (themables_1.ThemeIcon.isThemeIcon(historyItem.icon)) {
            return historyItem.icon;
        }
        else {
            const icon = historyItem.icon;
            return { light: icon.light, dark: icon.dark };
        }
    }
    function compareResourceThemableDecorations(a, b) {
        if (!a.iconPath && !b.iconPath) {
            return 0;
        }
        else if (!a.iconPath) {
            return -1;
        }
        else if (!b.iconPath) {
            return 1;
        }
        const aPath = typeof a.iconPath === 'string' ? a.iconPath : uri_1.URI.isUri(a.iconPath) ? a.iconPath.fsPath : a.iconPath.id;
        const bPath = typeof b.iconPath === 'string' ? b.iconPath : uri_1.URI.isUri(b.iconPath) ? b.iconPath.fsPath : b.iconPath.id;
        return (0, comparers_1.$hq)(aPath, bPath);
    }
    function compareResourceStatesDecorations(a, b) {
        let result = 0;
        if (a.strikeThrough !== b.strikeThrough) {
            return a.strikeThrough ? 1 : -1;
        }
        if (a.faded !== b.faded) {
            return a.faded ? 1 : -1;
        }
        if (a.tooltip !== b.tooltip) {
            return (a.tooltip || '').localeCompare(b.tooltip || '');
        }
        result = compareResourceThemableDecorations(a, b);
        if (result !== 0) {
            return result;
        }
        if (a.light && b.light) {
            result = compareResourceThemableDecorations(a.light, b.light);
        }
        else if (a.light) {
            return 1;
        }
        else if (b.light) {
            return -1;
        }
        if (result !== 0) {
            return result;
        }
        if (a.dark && b.dark) {
            result = compareResourceThemableDecorations(a.dark, b.dark);
        }
        else if (a.dark) {
            return 1;
        }
        else if (b.dark) {
            return -1;
        }
        return result;
    }
    function compareCommands(a, b) {
        if (a.command !== b.command) {
            return a.command < b.command ? -1 : 1;
        }
        if (a.title !== b.title) {
            return a.title < b.title ? -1 : 1;
        }
        if (a.tooltip !== b.tooltip) {
            if (a.tooltip !== undefined && b.tooltip !== undefined) {
                return a.tooltip < b.tooltip ? -1 : 1;
            }
            else if (a.tooltip !== undefined) {
                return 1;
            }
            else if (b.tooltip !== undefined) {
                return -1;
            }
        }
        if (a.arguments === b.arguments) {
            return 0;
        }
        else if (!a.arguments) {
            return -1;
        }
        else if (!b.arguments) {
            return 1;
        }
        else if (a.arguments.length !== b.arguments.length) {
            return a.arguments.length - b.arguments.length;
        }
        for (let i = 0; i < a.arguments.length; i++) {
            const aArg = a.arguments[i];
            const bArg = b.arguments[i];
            if (aArg === bArg) {
                continue;
            }
            return aArg < bArg ? -1 : 1;
        }
        return 0;
    }
    function compareResourceStates(a, b) {
        let result = (0, comparers_1.$hq)(a.resourceUri.fsPath, b.resourceUri.fsPath, true);
        if (result !== 0) {
            return result;
        }
        if (a.command && b.command) {
            result = compareCommands(a.command, b.command);
        }
        else if (a.command) {
            return 1;
        }
        else if (b.command) {
            return -1;
        }
        if (result !== 0) {
            return result;
        }
        if (a.decorations && b.decorations) {
            result = compareResourceStatesDecorations(a.decorations, b.decorations);
        }
        else if (a.decorations) {
            return 1;
        }
        else if (b.decorations) {
            return -1;
        }
        return result;
    }
    function compareArgs(a, b) {
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) {
                return false;
            }
        }
        return true;
    }
    function commandEquals(a, b) {
        return a.command === b.command
            && a.title === b.title
            && a.tooltip === b.tooltip
            && (a.arguments && b.arguments ? compareArgs(a.arguments, b.arguments) : a.arguments === b.arguments);
    }
    function commandListEquals(a, b) {
        return (0, arrays_1.$sb)(a, b, commandEquals);
    }
    function historyItemGroupEquals(a, b) {
        if (a === b) {
            return true;
        }
        if (!a || !b) {
            return false;
        }
        return a.id === b.id && a.label === b.label && a.upstream?.id === b.upstream?.id && a.upstream?.label === b.upstream?.label;
    }
    class $3bc {
        #proxy;
        #extHostDocuments;
        get value() {
            return this.d;
        }
        set value(value) {
            value = value ?? '';
            this.#proxy.$setInputBoxValue(this.l, value);
            this.n(value);
        }
        get onDidChange() {
            return this.e.event;
        }
        get placeholder() {
            return this.f;
        }
        set placeholder(placeholder) {
            this.#proxy.$setInputBoxPlaceholder(this.l, placeholder);
            this.f = placeholder;
        }
        get validateInput() {
            (0, extensions_2.$QF)(this.k, 'scmValidation');
            return this.g;
        }
        set validateInput(fn) {
            (0, extensions_2.$QF)(this.k, 'scmValidation');
            if (fn && typeof fn !== 'function') {
                throw new Error(`[${this.k.identifier.value}]: Invalid SCM input box validation function`);
            }
            this.g = fn;
            this.#proxy.$setValidationProviderIsEnabled(this.l, !!fn);
        }
        get enabled() {
            return this.h;
        }
        set enabled(enabled) {
            enabled = !!enabled;
            if (this.h === enabled) {
                return;
            }
            this.h = enabled;
            this.#proxy.$setInputBoxEnablement(this.l, enabled);
        }
        get visible() {
            return this.j;
        }
        set visible(visible) {
            visible = !!visible;
            if (this.j === visible) {
                return;
            }
            this.j = visible;
            this.#proxy.$setInputBoxVisibility(this.l, visible);
        }
        get document() {
            (0, extensions_2.$QF)(this.k, 'scmTextDocument');
            return this.#extHostDocuments.getDocument(this.m);
        }
        constructor(k, _extHostDocuments, proxy, l, m) {
            this.k = k;
            this.l = l;
            this.m = m;
            this.d = '';
            this.e = new event_1.$fd();
            this.f = '';
            this.h = true;
            this.j = true;
            this.#extHostDocuments = _extHostDocuments;
            this.#proxy = proxy;
        }
        showValidationMessage(message, type) {
            (0, extensions_2.$QF)(this.k, 'scmValidation');
            this.#proxy.$showValidationMessage(this.l, message, type);
        }
        $onInputBoxValueChange(value) {
            this.n(value);
        }
        n(value) {
            this.d = value;
            this.e.fire(value);
        }
    }
    exports.$3bc = $3bc;
    class ExtHostSourceControlResourceGroup {
        static { this.d = 0; }
        get disposed() { return this.l; }
        get id() { return this.u; }
        get label() { return this.v; }
        set label(label) {
            this.v = label;
            this.q.$updateGroupLabel(this.t, this.handle, label);
        }
        get hideWhenEmpty() { return this.p; }
        set hideWhenEmpty(hideWhenEmpty) {
            this.p = hideWhenEmpty;
            this.q.$updateGroup(this.t, this.handle, this.features);
        }
        get features() {
            return {
                hideWhenEmpty: this.hideWhenEmpty
            };
        }
        get resourceStates() { return [...this.f]; }
        set resourceStates(resources) {
            this.f = [...resources];
            this.k.fire();
        }
        constructor(q, s, t, u, v) {
            this.q = q;
            this.s = s;
            this.t = t;
            this.u = u;
            this.v = v;
            this.e = 0;
            this.f = [];
            this.g = new Map();
            this.h = new Map();
            this.j = new Map();
            this.k = new event_1.$fd();
            this.onDidUpdateResourceStates = this.k.event;
            this.l = false;
            this.m = new event_1.$fd();
            this.onDidDispose = this.m.event;
            this.n = [];
            this.o = [];
            this.p = undefined;
            this.handle = ExtHostSourceControlResourceGroup.d++;
        }
        getResourceState(handle) {
            return this.g.get(handle);
        }
        $executeResourceCommand(handle, preserveFocus) {
            const command = this.h.get(handle);
            if (!command) {
                return Promise.resolve(undefined);
            }
            return (0, async_1.$zg)(() => this.s.executeCommand(command.command, ...(command.arguments || []), preserveFocus));
        }
        _takeResourceStateSnapshot() {
            const snapshot = [...this.f].sort(compareResourceStates);
            const diffs = (0, arrays_1.$Bb)(this.o, snapshot, compareResourceStates);
            const splices = diffs.map(diff => {
                const toInsert = diff.toInsert.map(r => {
                    const handle = this.e++;
                    this.g.set(handle, r);
                    const sourceUri = r.resourceUri;
                    let command;
                    if (r.command) {
                        if (r.command.command === 'vscode.open' || r.command.command === 'vscode.diff') {
                            const disposables = new lifecycle_1.$jc();
                            command = this.s.converter.toInternal(r.command, disposables);
                            this.j.set(handle, disposables);
                        }
                        else {
                            this.h.set(handle, r.command);
                        }
                    }
                    const icon = getIconResource(r.decorations);
                    const lightIcon = r.decorations && getIconResource(r.decorations.light) || icon;
                    const darkIcon = r.decorations && getIconResource(r.decorations.dark) || icon;
                    const icons = [lightIcon, darkIcon];
                    const tooltip = (r.decorations && r.decorations.tooltip) || '';
                    const strikeThrough = r.decorations && !!r.decorations.strikeThrough;
                    const faded = r.decorations && !!r.decorations.faded;
                    const contextValue = r.contextValue || '';
                    const rawResource = [handle, sourceUri, icons, tooltip, strikeThrough, faded, contextValue, command];
                    return { rawResource, handle };
                });
                return { start: diff.start, deleteCount: diff.deleteCount, toInsert };
            });
            const rawResourceSplices = splices
                .map(({ start, deleteCount, toInsert }) => [start, deleteCount, toInsert.map(i => i.rawResource)]);
            const reverseSplices = splices.reverse();
            for (const { start, deleteCount, toInsert } of reverseSplices) {
                const handles = toInsert.map(i => i.handle);
                const handlesToDelete = this.n.splice(start, deleteCount, ...handles);
                for (const handle of handlesToDelete) {
                    this.g.delete(handle);
                    this.h.delete(handle);
                    this.j.get(handle)?.dispose();
                    this.j.delete(handle);
                }
            }
            this.o = snapshot;
            return rawResourceSplices;
        }
        dispose() {
            this.l = true;
            this.m.fire();
        }
    }
    class ExtHostSourceControl {
        static { this.d = 0; }
        #proxy;
        get id() {
            return this.A;
        }
        get label() {
            return this.B;
        }
        get rootUri() {
            return this.C;
        }
        get inputBox() { return this.f; }
        get count() {
            return this.g;
        }
        set count(count) {
            if (this.g === count) {
                return;
            }
            this.g = count;
            this.#proxy.$updateSourceControl(this.x, { count });
        }
        get quickDiffProvider() {
            return this.h;
        }
        set quickDiffProvider(quickDiffProvider) {
            this.h = quickDiffProvider;
            let quickDiffLabel = undefined;
            if ((0, extensions_2.$PF)(this.y, 'quickDiffProvider')) {
                quickDiffLabel = quickDiffProvider?.label;
            }
            this.#proxy.$updateSourceControl(this.x, { hasQuickDiffProvider: !!quickDiffProvider, quickDiffLabel });
        }
        get historyProvider() {
            (0, extensions_2.$QF)(this.y, 'scmHistoryProvider');
            return this.j;
        }
        set historyProvider(historyProvider) {
            (0, extensions_2.$QF)(this.y, 'scmHistoryProvider');
            this.j = historyProvider;
            this.k.value = new lifecycle_1.$jc();
            this.#proxy.$updateSourceControl(this.x, { hasHistoryProvider: !!historyProvider });
            if (historyProvider) {
                this.k.value.add(historyProvider.onDidChangeCurrentHistoryItemGroup(() => {
                    if (historyItemGroupEquals(this.l, historyProvider?.currentHistoryItemGroup)) {
                        return;
                    }
                    this.l = historyProvider?.currentHistoryItemGroup;
                    this.#proxy.$onDidChangeHistoryProviderCurrentHistoryItemGroup(this.x, this.l);
                }));
                this.k.value.add(historyProvider.onDidChangeActionButton(() => {
                    (0, extensions_2.$QF)(this.y, 'scmActionButton');
                    this.m.value = new lifecycle_1.$jc();
                    const internal = historyProvider.actionButton !== undefined ?
                        {
                            command: this.z.converter.toInternal(historyProvider.actionButton.command, this.m.value),
                            description: historyProvider.actionButton.description,
                            enabled: historyProvider.actionButton.enabled
                        } : undefined;
                    this.#proxy.$onDidChangeHistoryProviderActionButton(this.x, internal ?? null);
                }));
            }
        }
        get commitTemplate() {
            return this.n;
        }
        set commitTemplate(commitTemplate) {
            if (commitTemplate === this.n) {
                return;
            }
            this.n = commitTemplate;
            this.#proxy.$updateSourceControl(this.x, { commitTemplate });
        }
        get acceptInputCommand() {
            return this.p;
        }
        set acceptInputCommand(acceptInputCommand) {
            this.o.value = new lifecycle_1.$jc();
            this.p = acceptInputCommand;
            const internal = this.z.converter.toInternal(acceptInputCommand, this.o.value);
            this.#proxy.$updateSourceControl(this.x, { acceptInputCommand: internal });
        }
        get actionButton() {
            (0, extensions_2.$QF)(this.y, 'scmActionButton');
            return this.s;
        }
        set actionButton(actionButton) {
            (0, extensions_2.$QF)(this.y, 'scmActionButton');
            this.q.value = new lifecycle_1.$jc();
            this.s = actionButton;
            const internal = actionButton !== undefined ?
                {
                    command: this.z.converter.toInternal(actionButton.command, this.q.value),
                    secondaryCommands: actionButton.secondaryCommands?.map(commandGroup => {
                        return commandGroup.map(command => this.z.converter.toInternal(command, this.q.value));
                    }),
                    description: actionButton.description,
                    enabled: actionButton.enabled
                } : undefined;
            this.#proxy.$updateSourceControl(this.x, { actionButton: internal ?? null });
        }
        get statusBarCommands() {
            return this.u;
        }
        set statusBarCommands(statusBarCommands) {
            if (this.u && statusBarCommands && commandListEquals(this.u, statusBarCommands)) {
                return;
            }
            this.t.value = new lifecycle_1.$jc();
            this.u = statusBarCommands;
            const internal = (statusBarCommands || []).map(c => this.z.converter.toInternal(c, this.t.value));
            this.#proxy.$updateSourceControl(this.x, { statusBarCommands: internal });
        }
        get selected() {
            return this.v;
        }
        constructor(y, _extHostDocuments, proxy, z, A, B, C) {
            this.y = y;
            this.z = z;
            this.A = A;
            this.B = B;
            this.C = C;
            this.e = new Map();
            this.g = undefined;
            this.h = undefined;
            this.k = new lifecycle_1.$lc();
            this.m = new lifecycle_1.$lc();
            this.n = undefined;
            this.o = new lifecycle_1.$lc();
            this.p = undefined;
            this.q = new lifecycle_1.$lc();
            this.t = new lifecycle_1.$lc();
            this.u = undefined;
            this.v = false;
            this.w = new event_1.$fd();
            this.onDidChangeSelection = this.w.event;
            this.x = ExtHostSourceControl.d++;
            this.D = new Map();
            this.E = new Set();
            this.#proxy = proxy;
            const inputBoxDocumentUri = uri_1.URI.from({
                scheme: network_1.Schemas.vscodeSourceControl,
                path: `${A}/scm${this.x}/input`,
                query: C ? `rootUri=${encodeURIComponent(C.toString())}` : undefined
            });
            this.f = new $3bc(y, _extHostDocuments, this.#proxy, this.x, inputBoxDocumentUri);
            this.#proxy.$registerSourceControl(this.x, A, B, C, inputBoxDocumentUri);
        }
        createResourceGroup(id, label) {
            const group = new ExtHostSourceControlResourceGroup(this.#proxy, this.z, this.x, id, label);
            const disposable = event_1.Event.once(group.onDidDispose)(() => this.D.delete(group));
            this.D.set(group, disposable);
            this.eventuallyAddResourceGroups();
            return group;
        }
        eventuallyAddResourceGroups() {
            const groups = [];
            const splices = [];
            for (const [group, disposable] of this.D) {
                disposable.dispose();
                const updateListener = group.onDidUpdateResourceStates(() => {
                    this.E.add(group);
                    this.eventuallyUpdateResourceStates();
                });
                event_1.Event.once(group.onDidDispose)(() => {
                    this.E.delete(group);
                    updateListener.dispose();
                    this.e.delete(group.handle);
                    this.#proxy.$unregisterGroup(this.x, group.handle);
                });
                groups.push([group.handle, group.id, group.label, group.features]);
                const snapshot = group._takeResourceStateSnapshot();
                if (snapshot.length > 0) {
                    splices.push([group.handle, snapshot]);
                }
                this.e.set(group.handle, group);
            }
            this.#proxy.$registerGroups(this.x, groups, splices);
            this.D.clear();
        }
        eventuallyUpdateResourceStates() {
            const splices = [];
            this.E.forEach(group => {
                const snapshot = group._takeResourceStateSnapshot();
                if (snapshot.length === 0) {
                    return;
                }
                splices.push([group.handle, snapshot]);
            });
            if (splices.length > 0) {
                this.#proxy.$spliceResourceStates(this.x, splices);
            }
            this.E.clear();
        }
        getResourceGroup(handle) {
            return this.e.get(handle);
        }
        setSelectionState(selected) {
            this.v = selected;
            this.w.fire(selected);
        }
        dispose() {
            this.o.dispose();
            this.q.dispose();
            this.t.dispose();
            this.e.forEach(group => group.dispose());
            this.#proxy.$unregisterSourceControl(this.x);
        }
    }
    __decorate([
        (0, decorators_1.$7g)(100)
    ], ExtHostSourceControl.prototype, "eventuallyAddResourceGroups", null);
    __decorate([
        (0, decorators_1.$7g)(100)
    ], ExtHostSourceControl.prototype, "eventuallyUpdateResourceStates", null);
    let $4bc = class $4bc {
        static { $4bc_1 = this; }
        static { this.d = 0; }
        get onDidChangeActiveProvider() { return this.j.event; }
        constructor(mainContext, l, m, n) {
            this.l = l;
            this.m = m;
            this.n = n;
            this.g = new Map();
            this.h = new extensions_1.$Xl();
            this.j = new event_1.$fd();
            this.e = mainContext.getProxy(extHost_protocol_1.$1J.MainThreadSCM);
            this.f = mainContext.getProxy(extHost_protocol_1.$1J.MainThreadTelemetry);
            l.registerArgumentProcessor({
                processArgument: arg => {
                    if (arg && arg.$mid === 3 /* MarshalledId.ScmResource */) {
                        const sourceControl = this.g.get(arg.sourceControlHandle);
                        if (!sourceControl) {
                            return arg;
                        }
                        const group = sourceControl.getResourceGroup(arg.groupHandle);
                        if (!group) {
                            return arg;
                        }
                        return group.getResourceState(arg.handle);
                    }
                    else if (arg && arg.$mid === 4 /* MarshalledId.ScmResourceGroup */) {
                        const sourceControl = this.g.get(arg.sourceControlHandle);
                        if (!sourceControl) {
                            return arg;
                        }
                        return sourceControl.getResourceGroup(arg.groupHandle);
                    }
                    else if (arg && arg.$mid === 5 /* MarshalledId.ScmProvider */) {
                        const sourceControl = this.g.get(arg.handle);
                        if (!sourceControl) {
                            return arg;
                        }
                        return sourceControl;
                    }
                    return arg;
                }
            });
        }
        createSourceControl(extension, id, label, rootUri) {
            this.n.trace('ExtHostSCM#createSourceControl', extension.identifier.value, id, label, rootUri);
            this.f.$publicLog2('api/scm/createSourceControl', {
                extensionId: extension.identifier.value,
            });
            const handle = $4bc_1.d++;
            const sourceControl = new ExtHostSourceControl(extension, this.m, this.e, this.l, id, label, rootUri);
            this.g.set(handle, sourceControl);
            const sourceControls = this.h.get(extension.identifier) || [];
            sourceControls.push(sourceControl);
            this.h.set(extension.identifier, sourceControls);
            return sourceControl;
        }
        // Deprecated
        getLastInputBox(extension) {
            this.n.trace('ExtHostSCM#getLastInputBox', extension.identifier.value);
            const sourceControls = this.h.get(extension.identifier);
            const sourceControl = sourceControls && sourceControls[sourceControls.length - 1];
            return sourceControl && sourceControl.inputBox;
        }
        $provideOriginalResource(sourceControlHandle, uriComponents, token) {
            const uri = uri_1.URI.revive(uriComponents);
            this.n.trace('ExtHostSCM#$provideOriginalResource', sourceControlHandle, uri.toString());
            const sourceControl = this.g.get(sourceControlHandle);
            if (!sourceControl || !sourceControl.quickDiffProvider || !sourceControl.quickDiffProvider.provideOriginalResource) {
                return Promise.resolve(null);
            }
            return (0, async_1.$zg)(() => sourceControl.quickDiffProvider.provideOriginalResource(uri, token))
                .then(r => r || null);
        }
        $onInputBoxValueChange(sourceControlHandle, value) {
            this.n.trace('ExtHostSCM#$onInputBoxValueChange', sourceControlHandle);
            const sourceControl = this.g.get(sourceControlHandle);
            if (!sourceControl) {
                return Promise.resolve(undefined);
            }
            sourceControl.inputBox.$onInputBoxValueChange(value);
            return Promise.resolve(undefined);
        }
        $executeResourceCommand(sourceControlHandle, groupHandle, handle, preserveFocus) {
            this.n.trace('ExtHostSCM#$executeResourceCommand', sourceControlHandle, groupHandle, handle);
            const sourceControl = this.g.get(sourceControlHandle);
            if (!sourceControl) {
                return Promise.resolve(undefined);
            }
            const group = sourceControl.getResourceGroup(groupHandle);
            if (!group) {
                return Promise.resolve(undefined);
            }
            return group.$executeResourceCommand(handle, preserveFocus);
        }
        $validateInput(sourceControlHandle, value, cursorPosition) {
            this.n.trace('ExtHostSCM#$validateInput', sourceControlHandle);
            const sourceControl = this.g.get(sourceControlHandle);
            if (!sourceControl) {
                return Promise.resolve(undefined);
            }
            if (!sourceControl.inputBox.validateInput) {
                return Promise.resolve(undefined);
            }
            return (0, async_1.$zg)(() => sourceControl.inputBox.validateInput(value, cursorPosition)).then(result => {
                if (!result) {
                    return Promise.resolve(undefined);
                }
                const message = extHostTypeConverters_1.MarkdownString.fromStrict(result.message);
                if (!message) {
                    return Promise.resolve(undefined);
                }
                return Promise.resolve([message, result.type]);
            });
        }
        $setSelectedSourceControl(selectedSourceControlHandle) {
            this.n.trace('ExtHostSCM#$setSelectedSourceControl', selectedSourceControlHandle);
            if (selectedSourceControlHandle !== undefined) {
                this.g.get(selectedSourceControlHandle)?.setSelectionState(true);
            }
            if (this.k !== undefined) {
                this.g.get(this.k)?.setSelectionState(false);
            }
            this.k = selectedSourceControlHandle;
            return Promise.resolve(undefined);
        }
        async $resolveHistoryItemGroupBase(sourceControlHandle, historyItemGroupId, token) {
            const historyProvider = this.g.get(sourceControlHandle)?.historyProvider;
            return await historyProvider?.resolveHistoryItemGroupBase(historyItemGroupId, token) ?? undefined;
        }
        async $resolveHistoryItemGroupCommonAncestor(sourceControlHandle, historyItemGroupId1, historyItemGroupId2, token) {
            const historyProvider = this.g.get(sourceControlHandle)?.historyProvider;
            return await historyProvider?.resolveHistoryItemGroupCommonAncestor(historyItemGroupId1, historyItemGroupId2, token) ?? undefined;
        }
        async $provideHistoryItems(sourceControlHandle, historyItemGroupId, options, token) {
            const historyProvider = this.g.get(sourceControlHandle)?.historyProvider;
            const historyItems = await historyProvider?.provideHistoryItems(historyItemGroupId, options, token);
            return historyItems?.map(item => ({
                id: item.id,
                parentIds: item.parentIds,
                label: item.label,
                description: item.description,
                icon: getHistoryItemIconDto(item),
                timestamp: item.timestamp,
            })) ?? undefined;
        }
        async $provideHistoryItemChanges(sourceControlHandle, historyItemId, token) {
            const historyProvider = this.g.get(sourceControlHandle)?.historyProvider;
            return await historyProvider?.provideHistoryItemChanges(historyItemId, token) ?? undefined;
        }
    };
    exports.$4bc = $4bc;
    exports.$4bc = $4bc = $4bc_1 = __decorate([
        __param(3, log_1.$5i)
    ], $4bc);
});
//# sourceMappingURL=extHostSCM.js.map