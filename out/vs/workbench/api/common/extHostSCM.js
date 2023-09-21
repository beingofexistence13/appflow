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
    var ExtHostSCM_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostSCM = exports.ExtHostSCMInputBox = void 0;
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
        return (0, comparers_1.comparePaths)(aPath, bPath);
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
        let result = (0, comparers_1.comparePaths)(a.resourceUri.fsPath, b.resourceUri.fsPath, true);
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
        return (0, arrays_1.equals)(a, b, commandEquals);
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
    class ExtHostSCMInputBox {
        #proxy;
        #extHostDocuments;
        get value() {
            return this._value;
        }
        set value(value) {
            value = value ?? '';
            this.#proxy.$setInputBoxValue(this._sourceControlHandle, value);
            this.updateValue(value);
        }
        get onDidChange() {
            return this._onDidChange.event;
        }
        get placeholder() {
            return this._placeholder;
        }
        set placeholder(placeholder) {
            this.#proxy.$setInputBoxPlaceholder(this._sourceControlHandle, placeholder);
            this._placeholder = placeholder;
        }
        get validateInput() {
            (0, extensions_2.checkProposedApiEnabled)(this._extension, 'scmValidation');
            return this._validateInput;
        }
        set validateInput(fn) {
            (0, extensions_2.checkProposedApiEnabled)(this._extension, 'scmValidation');
            if (fn && typeof fn !== 'function') {
                throw new Error(`[${this._extension.identifier.value}]: Invalid SCM input box validation function`);
            }
            this._validateInput = fn;
            this.#proxy.$setValidationProviderIsEnabled(this._sourceControlHandle, !!fn);
        }
        get enabled() {
            return this._enabled;
        }
        set enabled(enabled) {
            enabled = !!enabled;
            if (this._enabled === enabled) {
                return;
            }
            this._enabled = enabled;
            this.#proxy.$setInputBoxEnablement(this._sourceControlHandle, enabled);
        }
        get visible() {
            return this._visible;
        }
        set visible(visible) {
            visible = !!visible;
            if (this._visible === visible) {
                return;
            }
            this._visible = visible;
            this.#proxy.$setInputBoxVisibility(this._sourceControlHandle, visible);
        }
        get document() {
            (0, extensions_2.checkProposedApiEnabled)(this._extension, 'scmTextDocument');
            return this.#extHostDocuments.getDocument(this._documentUri);
        }
        constructor(_extension, _extHostDocuments, proxy, _sourceControlHandle, _documentUri) {
            this._extension = _extension;
            this._sourceControlHandle = _sourceControlHandle;
            this._documentUri = _documentUri;
            this._value = '';
            this._onDidChange = new event_1.Emitter();
            this._placeholder = '';
            this._enabled = true;
            this._visible = true;
            this.#extHostDocuments = _extHostDocuments;
            this.#proxy = proxy;
        }
        showValidationMessage(message, type) {
            (0, extensions_2.checkProposedApiEnabled)(this._extension, 'scmValidation');
            this.#proxy.$showValidationMessage(this._sourceControlHandle, message, type);
        }
        $onInputBoxValueChange(value) {
            this.updateValue(value);
        }
        updateValue(value) {
            this._value = value;
            this._onDidChange.fire(value);
        }
    }
    exports.ExtHostSCMInputBox = ExtHostSCMInputBox;
    class ExtHostSourceControlResourceGroup {
        static { this._handlePool = 0; }
        get disposed() { return this._disposed; }
        get id() { return this._id; }
        get label() { return this._label; }
        set label(label) {
            this._label = label;
            this._proxy.$updateGroupLabel(this._sourceControlHandle, this.handle, label);
        }
        get hideWhenEmpty() { return this._hideWhenEmpty; }
        set hideWhenEmpty(hideWhenEmpty) {
            this._hideWhenEmpty = hideWhenEmpty;
            this._proxy.$updateGroup(this._sourceControlHandle, this.handle, this.features);
        }
        get features() {
            return {
                hideWhenEmpty: this.hideWhenEmpty
            };
        }
        get resourceStates() { return [...this._resourceStates]; }
        set resourceStates(resources) {
            this._resourceStates = [...resources];
            this._onDidUpdateResourceStates.fire();
        }
        constructor(_proxy, _commands, _sourceControlHandle, _id, _label) {
            this._proxy = _proxy;
            this._commands = _commands;
            this._sourceControlHandle = _sourceControlHandle;
            this._id = _id;
            this._label = _label;
            this._resourceHandlePool = 0;
            this._resourceStates = [];
            this._resourceStatesMap = new Map();
            this._resourceStatesCommandsMap = new Map();
            this._resourceStatesDisposablesMap = new Map();
            this._onDidUpdateResourceStates = new event_1.Emitter();
            this.onDidUpdateResourceStates = this._onDidUpdateResourceStates.event;
            this._disposed = false;
            this._onDidDispose = new event_1.Emitter();
            this.onDidDispose = this._onDidDispose.event;
            this._handlesSnapshot = [];
            this._resourceSnapshot = [];
            this._hideWhenEmpty = undefined;
            this.handle = ExtHostSourceControlResourceGroup._handlePool++;
        }
        getResourceState(handle) {
            return this._resourceStatesMap.get(handle);
        }
        $executeResourceCommand(handle, preserveFocus) {
            const command = this._resourceStatesCommandsMap.get(handle);
            if (!command) {
                return Promise.resolve(undefined);
            }
            return (0, async_1.asPromise)(() => this._commands.executeCommand(command.command, ...(command.arguments || []), preserveFocus));
        }
        _takeResourceStateSnapshot() {
            const snapshot = [...this._resourceStates].sort(compareResourceStates);
            const diffs = (0, arrays_1.sortedDiff)(this._resourceSnapshot, snapshot, compareResourceStates);
            const splices = diffs.map(diff => {
                const toInsert = diff.toInsert.map(r => {
                    const handle = this._resourceHandlePool++;
                    this._resourceStatesMap.set(handle, r);
                    const sourceUri = r.resourceUri;
                    let command;
                    if (r.command) {
                        if (r.command.command === 'vscode.open' || r.command.command === 'vscode.diff') {
                            const disposables = new lifecycle_1.DisposableStore();
                            command = this._commands.converter.toInternal(r.command, disposables);
                            this._resourceStatesDisposablesMap.set(handle, disposables);
                        }
                        else {
                            this._resourceStatesCommandsMap.set(handle, r.command);
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
                const handlesToDelete = this._handlesSnapshot.splice(start, deleteCount, ...handles);
                for (const handle of handlesToDelete) {
                    this._resourceStatesMap.delete(handle);
                    this._resourceStatesCommandsMap.delete(handle);
                    this._resourceStatesDisposablesMap.get(handle)?.dispose();
                    this._resourceStatesDisposablesMap.delete(handle);
                }
            }
            this._resourceSnapshot = snapshot;
            return rawResourceSplices;
        }
        dispose() {
            this._disposed = true;
            this._onDidDispose.fire();
        }
    }
    class ExtHostSourceControl {
        static { this._handlePool = 0; }
        #proxy;
        get id() {
            return this._id;
        }
        get label() {
            return this._label;
        }
        get rootUri() {
            return this._rootUri;
        }
        get inputBox() { return this._inputBox; }
        get count() {
            return this._count;
        }
        set count(count) {
            if (this._count === count) {
                return;
            }
            this._count = count;
            this.#proxy.$updateSourceControl(this.handle, { count });
        }
        get quickDiffProvider() {
            return this._quickDiffProvider;
        }
        set quickDiffProvider(quickDiffProvider) {
            this._quickDiffProvider = quickDiffProvider;
            let quickDiffLabel = undefined;
            if ((0, extensions_2.isProposedApiEnabled)(this._extension, 'quickDiffProvider')) {
                quickDiffLabel = quickDiffProvider?.label;
            }
            this.#proxy.$updateSourceControl(this.handle, { hasQuickDiffProvider: !!quickDiffProvider, quickDiffLabel });
        }
        get historyProvider() {
            (0, extensions_2.checkProposedApiEnabled)(this._extension, 'scmHistoryProvider');
            return this._historyProvider;
        }
        set historyProvider(historyProvider) {
            (0, extensions_2.checkProposedApiEnabled)(this._extension, 'scmHistoryProvider');
            this._historyProvider = historyProvider;
            this._historyProviderDisposable.value = new lifecycle_1.DisposableStore();
            this.#proxy.$updateSourceControl(this.handle, { hasHistoryProvider: !!historyProvider });
            if (historyProvider) {
                this._historyProviderDisposable.value.add(historyProvider.onDidChangeCurrentHistoryItemGroup(() => {
                    if (historyItemGroupEquals(this._historyProviderCurrentHistoryItemGroup, historyProvider?.currentHistoryItemGroup)) {
                        return;
                    }
                    this._historyProviderCurrentHistoryItemGroup = historyProvider?.currentHistoryItemGroup;
                    this.#proxy.$onDidChangeHistoryProviderCurrentHistoryItemGroup(this.handle, this._historyProviderCurrentHistoryItemGroup);
                }));
                this._historyProviderDisposable.value.add(historyProvider.onDidChangeActionButton(() => {
                    (0, extensions_2.checkProposedApiEnabled)(this._extension, 'scmActionButton');
                    this._historyProviderActionButtonDisposable.value = new lifecycle_1.DisposableStore();
                    const internal = historyProvider.actionButton !== undefined ?
                        {
                            command: this._commands.converter.toInternal(historyProvider.actionButton.command, this._historyProviderActionButtonDisposable.value),
                            description: historyProvider.actionButton.description,
                            enabled: historyProvider.actionButton.enabled
                        } : undefined;
                    this.#proxy.$onDidChangeHistoryProviderActionButton(this.handle, internal ?? null);
                }));
            }
        }
        get commitTemplate() {
            return this._commitTemplate;
        }
        set commitTemplate(commitTemplate) {
            if (commitTemplate === this._commitTemplate) {
                return;
            }
            this._commitTemplate = commitTemplate;
            this.#proxy.$updateSourceControl(this.handle, { commitTemplate });
        }
        get acceptInputCommand() {
            return this._acceptInputCommand;
        }
        set acceptInputCommand(acceptInputCommand) {
            this._acceptInputDisposables.value = new lifecycle_1.DisposableStore();
            this._acceptInputCommand = acceptInputCommand;
            const internal = this._commands.converter.toInternal(acceptInputCommand, this._acceptInputDisposables.value);
            this.#proxy.$updateSourceControl(this.handle, { acceptInputCommand: internal });
        }
        get actionButton() {
            (0, extensions_2.checkProposedApiEnabled)(this._extension, 'scmActionButton');
            return this._actionButton;
        }
        set actionButton(actionButton) {
            (0, extensions_2.checkProposedApiEnabled)(this._extension, 'scmActionButton');
            this._actionButtonDisposables.value = new lifecycle_1.DisposableStore();
            this._actionButton = actionButton;
            const internal = actionButton !== undefined ?
                {
                    command: this._commands.converter.toInternal(actionButton.command, this._actionButtonDisposables.value),
                    secondaryCommands: actionButton.secondaryCommands?.map(commandGroup => {
                        return commandGroup.map(command => this._commands.converter.toInternal(command, this._actionButtonDisposables.value));
                    }),
                    description: actionButton.description,
                    enabled: actionButton.enabled
                } : undefined;
            this.#proxy.$updateSourceControl(this.handle, { actionButton: internal ?? null });
        }
        get statusBarCommands() {
            return this._statusBarCommands;
        }
        set statusBarCommands(statusBarCommands) {
            if (this._statusBarCommands && statusBarCommands && commandListEquals(this._statusBarCommands, statusBarCommands)) {
                return;
            }
            this._statusBarDisposables.value = new lifecycle_1.DisposableStore();
            this._statusBarCommands = statusBarCommands;
            const internal = (statusBarCommands || []).map(c => this._commands.converter.toInternal(c, this._statusBarDisposables.value));
            this.#proxy.$updateSourceControl(this.handle, { statusBarCommands: internal });
        }
        get selected() {
            return this._selected;
        }
        constructor(_extension, _extHostDocuments, proxy, _commands, _id, _label, _rootUri) {
            this._extension = _extension;
            this._commands = _commands;
            this._id = _id;
            this._label = _label;
            this._rootUri = _rootUri;
            this._groups = new Map();
            this._count = undefined;
            this._quickDiffProvider = undefined;
            this._historyProviderDisposable = new lifecycle_1.MutableDisposable();
            this._historyProviderActionButtonDisposable = new lifecycle_1.MutableDisposable();
            this._commitTemplate = undefined;
            this._acceptInputDisposables = new lifecycle_1.MutableDisposable();
            this._acceptInputCommand = undefined;
            this._actionButtonDisposables = new lifecycle_1.MutableDisposable();
            this._statusBarDisposables = new lifecycle_1.MutableDisposable();
            this._statusBarCommands = undefined;
            this._selected = false;
            this._onDidChangeSelection = new event_1.Emitter();
            this.onDidChangeSelection = this._onDidChangeSelection.event;
            this.handle = ExtHostSourceControl._handlePool++;
            this.createdResourceGroups = new Map();
            this.updatedResourceGroups = new Set();
            this.#proxy = proxy;
            const inputBoxDocumentUri = uri_1.URI.from({
                scheme: network_1.Schemas.vscodeSourceControl,
                path: `${_id}/scm${this.handle}/input`,
                query: _rootUri ? `rootUri=${encodeURIComponent(_rootUri.toString())}` : undefined
            });
            this._inputBox = new ExtHostSCMInputBox(_extension, _extHostDocuments, this.#proxy, this.handle, inputBoxDocumentUri);
            this.#proxy.$registerSourceControl(this.handle, _id, _label, _rootUri, inputBoxDocumentUri);
        }
        createResourceGroup(id, label) {
            const group = new ExtHostSourceControlResourceGroup(this.#proxy, this._commands, this.handle, id, label);
            const disposable = event_1.Event.once(group.onDidDispose)(() => this.createdResourceGroups.delete(group));
            this.createdResourceGroups.set(group, disposable);
            this.eventuallyAddResourceGroups();
            return group;
        }
        eventuallyAddResourceGroups() {
            const groups = [];
            const splices = [];
            for (const [group, disposable] of this.createdResourceGroups) {
                disposable.dispose();
                const updateListener = group.onDidUpdateResourceStates(() => {
                    this.updatedResourceGroups.add(group);
                    this.eventuallyUpdateResourceStates();
                });
                event_1.Event.once(group.onDidDispose)(() => {
                    this.updatedResourceGroups.delete(group);
                    updateListener.dispose();
                    this._groups.delete(group.handle);
                    this.#proxy.$unregisterGroup(this.handle, group.handle);
                });
                groups.push([group.handle, group.id, group.label, group.features]);
                const snapshot = group._takeResourceStateSnapshot();
                if (snapshot.length > 0) {
                    splices.push([group.handle, snapshot]);
                }
                this._groups.set(group.handle, group);
            }
            this.#proxy.$registerGroups(this.handle, groups, splices);
            this.createdResourceGroups.clear();
        }
        eventuallyUpdateResourceStates() {
            const splices = [];
            this.updatedResourceGroups.forEach(group => {
                const snapshot = group._takeResourceStateSnapshot();
                if (snapshot.length === 0) {
                    return;
                }
                splices.push([group.handle, snapshot]);
            });
            if (splices.length > 0) {
                this.#proxy.$spliceResourceStates(this.handle, splices);
            }
            this.updatedResourceGroups.clear();
        }
        getResourceGroup(handle) {
            return this._groups.get(handle);
        }
        setSelectionState(selected) {
            this._selected = selected;
            this._onDidChangeSelection.fire(selected);
        }
        dispose() {
            this._acceptInputDisposables.dispose();
            this._actionButtonDisposables.dispose();
            this._statusBarDisposables.dispose();
            this._groups.forEach(group => group.dispose());
            this.#proxy.$unregisterSourceControl(this.handle);
        }
    }
    __decorate([
        (0, decorators_1.debounce)(100)
    ], ExtHostSourceControl.prototype, "eventuallyAddResourceGroups", null);
    __decorate([
        (0, decorators_1.debounce)(100)
    ], ExtHostSourceControl.prototype, "eventuallyUpdateResourceStates", null);
    let ExtHostSCM = class ExtHostSCM {
        static { ExtHostSCM_1 = this; }
        static { this._handlePool = 0; }
        get onDidChangeActiveProvider() { return this._onDidChangeActiveProvider.event; }
        constructor(mainContext, _commands, _extHostDocuments, logService) {
            this._commands = _commands;
            this._extHostDocuments = _extHostDocuments;
            this.logService = logService;
            this._sourceControls = new Map();
            this._sourceControlsByExtension = new extensions_1.ExtensionIdentifierMap();
            this._onDidChangeActiveProvider = new event_1.Emitter();
            this._proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadSCM);
            this._telemetry = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadTelemetry);
            _commands.registerArgumentProcessor({
                processArgument: arg => {
                    if (arg && arg.$mid === 3 /* MarshalledId.ScmResource */) {
                        const sourceControl = this._sourceControls.get(arg.sourceControlHandle);
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
                        const sourceControl = this._sourceControls.get(arg.sourceControlHandle);
                        if (!sourceControl) {
                            return arg;
                        }
                        return sourceControl.getResourceGroup(arg.groupHandle);
                    }
                    else if (arg && arg.$mid === 5 /* MarshalledId.ScmProvider */) {
                        const sourceControl = this._sourceControls.get(arg.handle);
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
            this.logService.trace('ExtHostSCM#createSourceControl', extension.identifier.value, id, label, rootUri);
            this._telemetry.$publicLog2('api/scm/createSourceControl', {
                extensionId: extension.identifier.value,
            });
            const handle = ExtHostSCM_1._handlePool++;
            const sourceControl = new ExtHostSourceControl(extension, this._extHostDocuments, this._proxy, this._commands, id, label, rootUri);
            this._sourceControls.set(handle, sourceControl);
            const sourceControls = this._sourceControlsByExtension.get(extension.identifier) || [];
            sourceControls.push(sourceControl);
            this._sourceControlsByExtension.set(extension.identifier, sourceControls);
            return sourceControl;
        }
        // Deprecated
        getLastInputBox(extension) {
            this.logService.trace('ExtHostSCM#getLastInputBox', extension.identifier.value);
            const sourceControls = this._sourceControlsByExtension.get(extension.identifier);
            const sourceControl = sourceControls && sourceControls[sourceControls.length - 1];
            return sourceControl && sourceControl.inputBox;
        }
        $provideOriginalResource(sourceControlHandle, uriComponents, token) {
            const uri = uri_1.URI.revive(uriComponents);
            this.logService.trace('ExtHostSCM#$provideOriginalResource', sourceControlHandle, uri.toString());
            const sourceControl = this._sourceControls.get(sourceControlHandle);
            if (!sourceControl || !sourceControl.quickDiffProvider || !sourceControl.quickDiffProvider.provideOriginalResource) {
                return Promise.resolve(null);
            }
            return (0, async_1.asPromise)(() => sourceControl.quickDiffProvider.provideOriginalResource(uri, token))
                .then(r => r || null);
        }
        $onInputBoxValueChange(sourceControlHandle, value) {
            this.logService.trace('ExtHostSCM#$onInputBoxValueChange', sourceControlHandle);
            const sourceControl = this._sourceControls.get(sourceControlHandle);
            if (!sourceControl) {
                return Promise.resolve(undefined);
            }
            sourceControl.inputBox.$onInputBoxValueChange(value);
            return Promise.resolve(undefined);
        }
        $executeResourceCommand(sourceControlHandle, groupHandle, handle, preserveFocus) {
            this.logService.trace('ExtHostSCM#$executeResourceCommand', sourceControlHandle, groupHandle, handle);
            const sourceControl = this._sourceControls.get(sourceControlHandle);
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
            this.logService.trace('ExtHostSCM#$validateInput', sourceControlHandle);
            const sourceControl = this._sourceControls.get(sourceControlHandle);
            if (!sourceControl) {
                return Promise.resolve(undefined);
            }
            if (!sourceControl.inputBox.validateInput) {
                return Promise.resolve(undefined);
            }
            return (0, async_1.asPromise)(() => sourceControl.inputBox.validateInput(value, cursorPosition)).then(result => {
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
            this.logService.trace('ExtHostSCM#$setSelectedSourceControl', selectedSourceControlHandle);
            if (selectedSourceControlHandle !== undefined) {
                this._sourceControls.get(selectedSourceControlHandle)?.setSelectionState(true);
            }
            if (this._selectedSourceControlHandle !== undefined) {
                this._sourceControls.get(this._selectedSourceControlHandle)?.setSelectionState(false);
            }
            this._selectedSourceControlHandle = selectedSourceControlHandle;
            return Promise.resolve(undefined);
        }
        async $resolveHistoryItemGroupBase(sourceControlHandle, historyItemGroupId, token) {
            const historyProvider = this._sourceControls.get(sourceControlHandle)?.historyProvider;
            return await historyProvider?.resolveHistoryItemGroupBase(historyItemGroupId, token) ?? undefined;
        }
        async $resolveHistoryItemGroupCommonAncestor(sourceControlHandle, historyItemGroupId1, historyItemGroupId2, token) {
            const historyProvider = this._sourceControls.get(sourceControlHandle)?.historyProvider;
            return await historyProvider?.resolveHistoryItemGroupCommonAncestor(historyItemGroupId1, historyItemGroupId2, token) ?? undefined;
        }
        async $provideHistoryItems(sourceControlHandle, historyItemGroupId, options, token) {
            const historyProvider = this._sourceControls.get(sourceControlHandle)?.historyProvider;
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
            const historyProvider = this._sourceControls.get(sourceControlHandle)?.historyProvider;
            return await historyProvider?.provideHistoryItemChanges(historyItemId, token) ?? undefined;
        }
    };
    exports.ExtHostSCM = ExtHostSCM;
    exports.ExtHostSCM = ExtHostSCM = ExtHostSCM_1 = __decorate([
        __param(3, log_1.ILogService)
    ], ExtHostSCM);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFNDTS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvY29tbW9uL2V4dEhvc3RTQ00udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQThCaEcsU0FBUyxlQUFlLENBQUMsV0FBNkQ7UUFDckYsSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUNqQixPQUFPLFNBQVMsQ0FBQztTQUNqQjthQUFNLElBQUksT0FBTyxXQUFXLENBQUMsUUFBUSxLQUFLLFFBQVEsRUFBRTtZQUNwRCxPQUFPLFNBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ3RDO2FBQU0sSUFBSSxTQUFHLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUMzQyxPQUFPLFdBQVcsQ0FBQyxRQUFRLENBQUM7U0FDNUI7YUFBTSxJQUFJLHFCQUFTLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUN2RCxPQUFPLFdBQVcsQ0FBQyxRQUFRLENBQUM7U0FDNUI7YUFBTTtZQUNOLE9BQU8sU0FBUyxDQUFDO1NBQ2pCO0lBQ0YsQ0FBQztJQUVELFNBQVMscUJBQXFCLENBQUMsV0FBNEM7UUFDMUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUU7WUFDdEIsT0FBTyxTQUFTLENBQUM7U0FDakI7YUFBTSxJQUFJLFNBQUcsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3ZDLE9BQU8sV0FBVyxDQUFDLElBQUksQ0FBQztTQUN4QjthQUFNLElBQUkscUJBQVMsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ25ELE9BQU8sV0FBVyxDQUFDLElBQUksQ0FBQztTQUN4QjthQUFNO1lBQ04sTUFBTSxJQUFJLEdBQUcs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