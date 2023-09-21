/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/keybinding/common/keybinding", "vs/base/browser/event", "vs/base/common/color", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/browser/dom", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/base/browser/keyboardEvent", "vs/base/common/async", "vs/platform/layout/browser/layoutService", "vs/platform/registry/common/platform", "vs/platform/actions/common/actions", "vs/platform/storage/common/storage", "vs/base/common/numbers", "vs/platform/configuration/common/configurationRegistry", "vs/platform/log/common/log", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/platform/action/common/actionCommonCategories", "vs/workbench/services/workingCopy/common/workingCopyBackup", "vs/platform/dialogs/common/dialogs", "vs/workbench/services/output/common/output", "vs/workbench/services/log/common/logConstants", "vs/platform/files/common/files", "vs/platform/quickinput/common/quickInput", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/workbench/services/editor/common/editorService", "vs/platform/product/common/product", "vs/css!./media/actions"], function (require, exports, nls_1, keybinding_1, event_1, color_1, event_2, lifecycle_1, dom_1, configuration_1, contextkey_1, keyboardEvent_1, async_1, layoutService_1, platform_1, actions_1, storage_1, numbers_1, configurationRegistry_1, log_1, workingCopyService_1, actionCommonCategories_1, workingCopyBackup_1, dialogs_1, output_1, logConstants_1, files_1, quickInput_1, userDataProfile_1, editorService_1, product_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class InspectContextKeysAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.inspectContextKeys',
                title: { value: (0, nls_1.localize)('inspect context keys', "Inspect Context Keys"), original: 'Inspect Context Keys' },
                category: actionCommonCategories_1.Categories.Developer,
                f1: true
            });
        }
        run(accessor) {
            const contextKeyService = accessor.get(contextkey_1.IContextKeyService);
            const disposables = new lifecycle_1.DisposableStore();
            const stylesheet = (0, dom_1.createStyleSheet)();
            disposables.add((0, lifecycle_1.toDisposable)(() => {
                stylesheet.parentNode?.removeChild(stylesheet);
            }));
            (0, dom_1.createCSSRule)('*', 'cursor: crosshair !important;', stylesheet);
            const hoverFeedback = document.createElement('div');
            document.body.appendChild(hoverFeedback);
            disposables.add((0, lifecycle_1.toDisposable)(() => document.body.removeChild(hoverFeedback)));
            hoverFeedback.style.position = 'absolute';
            hoverFeedback.style.pointerEvents = 'none';
            hoverFeedback.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
            hoverFeedback.style.zIndex = '1000';
            const onMouseMove = disposables.add(new event_1.DomEmitter(document.body, 'mousemove', true));
            disposables.add(onMouseMove.event(e => {
                const target = e.target;
                const position = (0, dom_1.getDomNodePagePosition)(target);
                hoverFeedback.style.top = `${position.top}px`;
                hoverFeedback.style.left = `${position.left}px`;
                hoverFeedback.style.width = `${position.width}px`;
                hoverFeedback.style.height = `${position.height}px`;
            }));
            const onMouseDown = disposables.add(new event_1.DomEmitter(document.body, 'mousedown', true));
            event_2.Event.once(onMouseDown.event)(e => { e.preventDefault(); e.stopPropagation(); }, null, disposables);
            const onMouseUp = disposables.add(new event_1.DomEmitter(document.body, 'mouseup', true));
            event_2.Event.once(onMouseUp.event)(e => {
                e.preventDefault();
                e.stopPropagation();
                const context = contextKeyService.getContext(e.target);
                console.log(context.collectAllValues());
                (0, lifecycle_1.dispose)(disposables);
            }, null, disposables);
        }
    }
    class ToggleScreencastModeAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.toggleScreencastMode',
                title: { value: (0, nls_1.localize)('toggle screencast mode', "Toggle Screencast Mode"), original: 'Toggle Screencast Mode' },
                category: actionCommonCategories_1.Categories.Developer,
                f1: true
            });
        }
        run(accessor) {
            if (ToggleScreencastModeAction.disposable) {
                ToggleScreencastModeAction.disposable.dispose();
                ToggleScreencastModeAction.disposable = undefined;
                return;
            }
            const layoutService = accessor.get(layoutService_1.ILayoutService);
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const keybindingService = accessor.get(keybinding_1.IKeybindingService);
            const disposables = new lifecycle_1.DisposableStore();
            const container = layoutService.container;
            const mouseMarker = (0, dom_1.append)(container, (0, dom_1.$)('.screencast-mouse'));
            disposables.add((0, lifecycle_1.toDisposable)(() => mouseMarker.remove()));
            const onMouseDown = disposables.add(new event_1.DomEmitter(container, 'mousedown', true));
            const onMouseUp = disposables.add(new event_1.DomEmitter(container, 'mouseup', true));
            const onMouseMove = disposables.add(new event_1.DomEmitter(container, 'mousemove', true));
            const updateMouseIndicatorColor = () => {
                mouseMarker.style.borderColor = color_1.Color.fromHex(configurationService.getValue('screencastMode.mouseIndicatorColor')).toString();
            };
            let mouseIndicatorSize;
            const updateMouseIndicatorSize = () => {
                mouseIndicatorSize = (0, numbers_1.clamp)(configurationService.getValue('screencastMode.mouseIndicatorSize') || 20, 20, 100);
                mouseMarker.style.height = `${mouseIndicatorSize}px`;
                mouseMarker.style.width = `${mouseIndicatorSize}px`;
            };
            updateMouseIndicatorColor();
            updateMouseIndicatorSize();
            disposables.add(onMouseDown.event(e => {
                mouseMarker.style.top = `${e.clientY - mouseIndicatorSize / 2}px`;
                mouseMarker.style.left = `${e.clientX - mouseIndicatorSize / 2}px`;
                mouseMarker.style.display = 'block';
                mouseMarker.style.transform = `scale(${1})`;
                mouseMarker.style.transition = 'transform 0.1s';
                const mouseMoveListener = onMouseMove.event(e => {
                    mouseMarker.style.top = `${e.clientY - mouseIndicatorSize / 2}px`;
                    mouseMarker.style.left = `${e.clientX - mouseIndicatorSize / 2}px`;
                    mouseMarker.style.transform = `scale(${.8})`;
                });
                event_2.Event.once(onMouseUp.event)(() => {
                    mouseMarker.style.display = 'none';
                    mouseMoveListener.dispose();
                });
            }));
            const keyboardMarker = (0, dom_1.append)(container, (0, dom_1.$)('.screencast-keyboard'));
            disposables.add((0, lifecycle_1.toDisposable)(() => keyboardMarker.remove()));
            const updateKeyboardFontSize = () => {
                keyboardMarker.style.fontSize = `${(0, numbers_1.clamp)(configurationService.getValue('screencastMode.fontSize') || 56, 20, 100)}px`;
            };
            const updateKeyboardMarker = () => {
                keyboardMarker.style.bottom = `${(0, numbers_1.clamp)(configurationService.getValue('screencastMode.verticalOffset') || 0, 0, 90)}%`;
            };
            let keyboardMarkerTimeout;
            const updateKeyboardMarkerTimeout = () => {
                keyboardMarkerTimeout = (0, numbers_1.clamp)(configurationService.getValue('screencastMode.keyboardOverlayTimeout') || 800, 500, 5000);
            };
            updateKeyboardFontSize();
            updateKeyboardMarker();
            updateKeyboardMarkerTimeout();
            disposables.add(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('screencastMode.verticalOffset')) {
                    updateKeyboardMarker();
                }
                if (e.affectsConfiguration('screencastMode.fontSize')) {
                    updateKeyboardFontSize();
                }
                if (e.affectsConfiguration('screencastMode.keyboardOverlayTimeout')) {
                    updateKeyboardMarkerTimeout();
                }
                if (e.affectsConfiguration('screencastMode.mouseIndicatorColor')) {
                    updateMouseIndicatorColor();
                }
                if (e.affectsConfiguration('screencastMode.mouseIndicatorSize')) {
                    updateMouseIndicatorSize();
                }
            }));
            const onKeyDown = disposables.add(new event_1.DomEmitter(window, 'keydown', true));
            const onCompositionStart = disposables.add(new event_1.DomEmitter(window, 'compositionstart', true));
            const onCompositionUpdate = disposables.add(new event_1.DomEmitter(window, 'compositionupdate', true));
            const onCompositionEnd = disposables.add(new event_1.DomEmitter(window, 'compositionend', true));
            let length = 0;
            let composing = undefined;
            let imeBackSpace = false;
            const clearKeyboardScheduler = new async_1.RunOnceScheduler(() => {
                keyboardMarker.textContent = '';
                composing = undefined;
                length = 0;
            }, keyboardMarkerTimeout);
            disposables.add(onCompositionStart.event(e => {
                imeBackSpace = true;
            }));
            disposables.add(onCompositionUpdate.event(e => {
                if (e.data && imeBackSpace) {
                    if (length > 20) {
                        keyboardMarker.innerText = '';
                        length = 0;
                    }
                    composing = composing ?? (0, dom_1.append)(keyboardMarker, (0, dom_1.$)('span.key'));
                    composing.textContent = e.data;
                }
                else if (imeBackSpace) {
                    keyboardMarker.innerText = '';
                    (0, dom_1.append)(keyboardMarker, (0, dom_1.$)('span.key', {}, `Backspace`));
                }
                clearKeyboardScheduler.schedule();
            }));
            disposables.add(onCompositionEnd.event(e => {
                composing = undefined;
                length++;
            }));
            disposables.add(onKeyDown.event(e => {
                if (e.key === 'Process' || /[\uac00-\ud787\u3131-\u314e\u314f-\u3163\u3041-\u3094\u30a1-\u30f4\u30fc\u3005\u3006\u3024\u4e00-\u9fa5]/u.test(e.key)) {
                    if (e.code === 'Backspace') {
                        imeBackSpace = true;
                    }
                    else if (!e.code.includes('Key')) {
                        composing = undefined;
                        imeBackSpace = false;
                    }
                    else {
                        imeBackSpace = true;
                    }
                    clearKeyboardScheduler.schedule();
                    return;
                }
                if (e.isComposing) {
                    return;
                }
                const options = configurationService.getValue('screencastMode.keyboardOptions');
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                const shortcut = keybindingService.softDispatch(event, event.target);
                // Hide the single arrow key pressed
                if (shortcut.kind === 2 /* ResultKind.KbFound */ && shortcut.commandId && !(options.showSingleEditorCursorMoves ?? true) && (['cursorLeft', 'cursorRight', 'cursorUp', 'cursorDown'].includes(shortcut.commandId))) {
                    return;
                }
                if (event.ctrlKey || event.altKey || event.metaKey || event.shiftKey
                    || length > 20
                    || event.keyCode === 1 /* KeyCode.Backspace */ || event.keyCode === 9 /* KeyCode.Escape */
                    || event.keyCode === 16 /* KeyCode.UpArrow */ || event.keyCode === 18 /* KeyCode.DownArrow */
                    || event.keyCode === 15 /* KeyCode.LeftArrow */ || event.keyCode === 17 /* KeyCode.RightArrow */) {
                    keyboardMarker.innerText = '';
                    length = 0;
                }
                const keybinding = keybindingService.resolveKeyboardEvent(event);
                const command = (this._isKbFound(shortcut) && shortcut.commandId) ? actions_1.MenuRegistry.getCommand(shortcut.commandId) : null;
                let commandAndGroupLabel = '';
                let keyLabel = keybinding.getLabel();
                if (command) {
                    commandAndGroupLabel = typeof command.title === 'string' ? command.title : command.title.value;
                    if ((options.showCommandGroups ?? false) && command.category) {
                        commandAndGroupLabel = `${typeof command.category === 'string' ? command.category : command.category.value}: ${commandAndGroupLabel} `;
                    }
                    if (this._isKbFound(shortcut) && shortcut.commandId) {
                        const keybindings = keybindingService.lookupKeybindings(shortcut.commandId)
                            .filter(k => k.getLabel()?.endsWith(keyLabel ?? ''));
                        if (keybindings.length > 0) {
                            keyLabel = keybindings[keybindings.length - 1].getLabel();
                        }
                    }
                }
                if ((options.showCommands ?? true) && commandAndGroupLabel) {
                    (0, dom_1.append)(keyboardMarker, (0, dom_1.$)('span.title', {}, `${commandAndGroupLabel} `));
                }
                if ((options.showKeys ?? true) || (command && (options.showKeybindings ?? true))) {
                    // Fix label for arrow keys
                    keyLabel = keyLabel?.replace('UpArrow', '↑')
                        ?.replace('DownArrow', '↓')
                        ?.replace('LeftArrow', '←')
                        ?.replace('RightArrow', '→');
                    (0, dom_1.append)(keyboardMarker, (0, dom_1.$)('span.key', {}, keyLabel ?? ''));
                }
                length++;
                clearKeyboardScheduler.schedule();
            }));
            ToggleScreencastModeAction.disposable = disposables;
        }
        _isKbFound(resolutionResult) {
            return resolutionResult.kind === 2 /* ResultKind.KbFound */;
        }
    }
    class LogStorageAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.logStorage',
                title: { value: (0, nls_1.localize)({ key: 'logStorage', comment: ['A developer only action to log the contents of the storage for the current window.'] }, "Log Storage Database Contents"), original: 'Log Storage Database Contents' },
                category: actionCommonCategories_1.Categories.Developer,
                f1: true
            });
        }
        run(accessor) {
            const storageService = accessor.get(storage_1.IStorageService);
            const dialogService = accessor.get(dialogs_1.IDialogService);
            storageService.log();
            dialogService.info((0, nls_1.localize)('storageLogDialogMessage', "The storage database contents have been logged to the developer tools."), (0, nls_1.localize)('storageLogDialogDetails', "Open developer tools from the menu and select the Console tab."));
        }
    }
    class LogWorkingCopiesAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.logWorkingCopies',
                title: { value: (0, nls_1.localize)({ key: 'logWorkingCopies', comment: ['A developer only action to log the working copies that exist.'] }, "Log Working Copies"), original: 'Log Working Copies' },
                category: actionCommonCategories_1.Categories.Developer,
                f1: true
            });
        }
        async run(accessor) {
            const workingCopyService = accessor.get(workingCopyService_1.IWorkingCopyService);
            const workingCopyBackupService = accessor.get(workingCopyBackup_1.IWorkingCopyBackupService);
            const logService = accessor.get(log_1.ILogService);
            const outputService = accessor.get(output_1.IOutputService);
            const backups = await workingCopyBackupService.getBackups();
            const msg = [
                ``,
                `[Working Copies]`,
                ...(workingCopyService.workingCopies.length > 0) ?
                    workingCopyService.workingCopies.map(workingCopy => `${workingCopy.isDirty() ? '● ' : ''}${workingCopy.resource.toString(true)} (typeId: ${workingCopy.typeId || '<no typeId>'})`) :
                    ['<none>'],
                ``,
                `[Backups]`,
                ...(backups.length > 0) ?
                    backups.map(backup => `${backup.resource.toString(true)} (typeId: ${backup.typeId || '<no typeId>'})`) :
                    ['<none>'],
            ];
            logService.info(msg.join('\n'));
            outputService.showChannel(logConstants_1.windowLogId, true);
        }
    }
    class RemoveLargeStorageEntriesAction extends actions_1.Action2 {
        static { this.SIZE_THRESHOLD = 1024 * 16; } // 16kb
        constructor() {
            super({
                id: 'workbench.action.removeLargeStorageDatabaseEntries',
                title: { value: (0, nls_1.localize)('removeLargeStorageDatabaseEntries', "Remove Large Storage Database Entries..."), original: 'Remove Large Storage Database Entries...' },
                category: actionCommonCategories_1.Categories.Developer,
                f1: true
            });
        }
        async run(accessor) {
            const storageService = accessor.get(storage_1.IStorageService);
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const userDataProfileService = accessor.get(userDataProfile_1.IUserDataProfileService);
            const dialogService = accessor.get(dialogs_1.IDialogService);
            const items = [];
            for (const scope of [-1 /* StorageScope.APPLICATION */, 0 /* StorageScope.PROFILE */, 1 /* StorageScope.WORKSPACE */]) {
                if (scope === 0 /* StorageScope.PROFILE */ && userDataProfileService.currentProfile.isDefault) {
                    continue; // avoid duplicates
                }
                for (const target of [1 /* StorageTarget.MACHINE */, 0 /* StorageTarget.USER */]) {
                    for (const key of storageService.keys(scope, target)) {
                        const value = storageService.get(key, scope);
                        if (value && value.length > RemoveLargeStorageEntriesAction.SIZE_THRESHOLD) {
                            items.push({
                                key,
                                scope,
                                target,
                                size: value.length,
                                label: key,
                                description: files_1.ByteSize.formatSize(value.length),
                                detail: (0, nls_1.localize)('largeStorageItemDetail', "Scope: {0}, Target: {1}", scope === -1 /* StorageScope.APPLICATION */ ? (0, nls_1.localize)('global', "Global") : scope === 0 /* StorageScope.PROFILE */ ? (0, nls_1.localize)('profile', "Profile") : (0, nls_1.localize)('workspace', "Workspace"), target === 1 /* StorageTarget.MACHINE */ ? (0, nls_1.localize)('machine', "Machine") : (0, nls_1.localize)('user', "User")),
                            });
                        }
                    }
                }
            }
            items.sort((itemA, itemB) => itemB.size - itemA.size);
            const selectedItems = await new Promise(resolve => {
                const disposables = new lifecycle_1.DisposableStore();
                const picker = disposables.add(quickInputService.createQuickPick());
                picker.items = items;
                picker.canSelectMany = true;
                picker.ok = false;
                picker.customButton = true;
                picker.hideCheckAll = true;
                picker.customLabel = (0, nls_1.localize)('removeLargeStorageEntriesPickerButton', "Remove");
                picker.placeholder = (0, nls_1.localize)('removeLargeStorageEntriesPickerPlaceholder', "Select large entries to remove from storage");
                if (items.length === 0) {
                    picker.description = (0, nls_1.localize)('removeLargeStorageEntriesPickerDescriptionNoEntries', "There are no large storage entries to remove.");
                }
                picker.show();
                disposables.add(picker.onDidCustom(() => {
                    resolve(picker.selectedItems);
                    picker.hide();
                }));
                disposables.add(picker.onDidHide(() => disposables.dispose()));
            });
            if (selectedItems.length === 0) {
                return;
            }
            const { confirmed } = await dialogService.confirm({
                type: 'warning',
                message: (0, nls_1.localize)('removeLargeStorageEntriesConfirmRemove', "Do you want to remove the selected storage entries from the database?"),
                detail: (0, nls_1.localize)('removeLargeStorageEntriesConfirmRemoveDetail', "{0}\n\nThis action is irreversible and may result in data loss!", selectedItems.map(item => item.label).join('\n')),
                primaryButton: (0, nls_1.localize)({ key: 'removeLargeStorageEntriesButtonLabel', comment: ['&& denotes a mnemonic'] }, "&&Remove")
            });
            if (!confirmed) {
                return;
            }
            const scopesToOptimize = new Set();
            for (const item of selectedItems) {
                storageService.remove(item.key, item.scope);
                scopesToOptimize.add(item.scope);
            }
            for (const scope of scopesToOptimize) {
                await storageService.optimize(scope);
            }
        }
    }
    let tracker = undefined;
    let trackedDisposables = new Set();
    const DisposablesSnapshotStateContext = new contextkey_1.RawContextKey('dirtyWorkingCopies', 'stopped');
    class StartTrackDisposables extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.startTrackDisposables',
                title: { value: (0, nls_1.localize)('startTrackDisposables', "Start Tracking Disposables"), original: 'Start Tracking Disposables' },
                category: actionCommonCategories_1.Categories.Developer,
                f1: true,
                precondition: contextkey_1.ContextKeyExpr.and(DisposablesSnapshotStateContext.isEqualTo('pending').negate(), DisposablesSnapshotStateContext.isEqualTo('started').negate())
            });
        }
        run(accessor) {
            const disposablesSnapshotStateContext = DisposablesSnapshotStateContext.bindTo(accessor.get(contextkey_1.IContextKeyService));
            disposablesSnapshotStateContext.set('started');
            trackedDisposables.clear();
            tracker = new lifecycle_1.DisposableTracker();
            (0, lifecycle_1.setDisposableTracker)(tracker);
        }
    }
    class SnapshotTrackedDisposables extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.snapshotTrackedDisposables',
                title: { value: (0, nls_1.localize)('snapshotTrackedDisposables', "Snapshot Tracked Disposables"), original: 'Snapshot Tracked Disposables' },
                category: actionCommonCategories_1.Categories.Developer,
                f1: true,
                precondition: DisposablesSnapshotStateContext.isEqualTo('started')
            });
        }
        run(accessor) {
            const disposablesSnapshotStateContext = DisposablesSnapshotStateContext.bindTo(accessor.get(contextkey_1.IContextKeyService));
            disposablesSnapshotStateContext.set('pending');
            trackedDisposables = new Set(tracker?.computeLeakingDisposables(1000)?.leaks.map(disposable => disposable.value));
        }
    }
    class StopTrackDisposables extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.stopTrackDisposables',
                title: { value: (0, nls_1.localize)('stopTrackDisposables', "Stop Tracking Disposables"), original: 'Stop Tracking Disposables' },
                category: actionCommonCategories_1.Categories.Developer,
                f1: true,
                precondition: DisposablesSnapshotStateContext.isEqualTo('pending')
            });
        }
        run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const disposablesSnapshotStateContext = DisposablesSnapshotStateContext.bindTo(accessor.get(contextkey_1.IContextKeyService));
            disposablesSnapshotStateContext.set('stopped');
            if (tracker) {
                const disposableLeaks = new Set();
                for (const disposable of new Set(tracker.computeLeakingDisposables(1000)?.leaks) ?? []) {
                    if (trackedDisposables.has(disposable.value)) {
                        disposableLeaks.add(disposable);
                    }
                }
                const leaks = tracker.computeLeakingDisposables(1000, Array.from(disposableLeaks));
                if (leaks) {
                    editorService.openEditor({ resource: undefined, contents: leaks.details });
                }
            }
            (0, lifecycle_1.setDisposableTracker)(null);
            tracker = undefined;
            trackedDisposables.clear();
        }
    }
    // --- Actions Registration
    (0, actions_1.registerAction2)(InspectContextKeysAction);
    (0, actions_1.registerAction2)(ToggleScreencastModeAction);
    (0, actions_1.registerAction2)(LogStorageAction);
    (0, actions_1.registerAction2)(LogWorkingCopiesAction);
    (0, actions_1.registerAction2)(RemoveLargeStorageEntriesAction);
    if (!product_1.default.commit) {
        (0, actions_1.registerAction2)(StartTrackDisposables);
        (0, actions_1.registerAction2)(SnapshotTrackedDisposables);
        (0, actions_1.registerAction2)(StopTrackDisposables);
    }
    // --- Configuration
    // Screen Cast Mode
    const configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
    configurationRegistry.registerConfiguration({
        id: 'screencastMode',
        order: 9,
        title: (0, nls_1.localize)('screencastModeConfigurationTitle', "Screencast Mode"),
        type: 'object',
        properties: {
            'screencastMode.verticalOffset': {
                type: 'number',
                default: 20,
                minimum: 0,
                maximum: 90,
                description: (0, nls_1.localize)('screencastMode.location.verticalPosition', "Controls the vertical offset of the screencast mode overlay from the bottom as a percentage of the workbench height.")
            },
            'screencastMode.fontSize': {
                type: 'number',
                default: 56,
                minimum: 20,
                maximum: 100,
                description: (0, nls_1.localize)('screencastMode.fontSize', "Controls the font size (in pixels) of the screencast mode keyboard.")
            },
            'screencastMode.keyboardOptions': {
                type: 'object',
                description: (0, nls_1.localize)('screencastMode.keyboardOptions.description', "Options for customizing the keyboard overlay in screencast mode."),
                properties: {
                    'showKeys': {
                        type: 'boolean',
                        default: true,
                        description: (0, nls_1.localize)('screencastMode.keyboardOptions.showKeys', "Show raw keys.")
                    },
                    'showKeybindings': {
                        type: 'boolean',
                        default: true,
                        description: (0, nls_1.localize)('screencastMode.keyboardOptions.showKeybindings', "Show keyboard shortcuts.")
                    },
                    'showCommands': {
                        type: 'boolean',
                        default: true,
                        description: (0, nls_1.localize)('screencastMode.keyboardOptions.showCommands', "Show command names.")
                    },
                    'showCommandGroups': {
                        type: 'boolean',
                        default: false,
                        description: (0, nls_1.localize)('screencastMode.keyboardOptions.showCommandGroups', "Show command group names, when commands are also shown.")
                    },
                    'showSingleEditorCursorMoves': {
                        type: 'boolean',
                        default: true,
                        description: (0, nls_1.localize)('screencastMode.keyboardOptions.showSingleEditorCursorMoves', "Show single editor cursor move commands.")
                    }
                },
                default: {
                    'showKeys': true,
                    'showKeybindings': true,
                    'showCommands': true,
                    'showCommandGroups': false,
                    'showSingleEditorCursorMoves': true
                },
                additionalProperties: false
            },
            'screencastMode.keyboardOverlayTimeout': {
                type: 'number',
                default: 800,
                minimum: 500,
                maximum: 5000,
                description: (0, nls_1.localize)('screencastMode.keyboardOverlayTimeout', "Controls how long (in milliseconds) the keyboard overlay is shown in screencast mode.")
            },
            'screencastMode.mouseIndicatorColor': {
                type: 'string',
                format: 'color-hex',
                default: '#FF0000',
                description: (0, nls_1.localize)('screencastMode.mouseIndicatorColor', "Controls the color in hex (#RGB, #RGBA, #RRGGBB or #RRGGBBAA) of the mouse indicator in screencast mode.")
            },
            'screencastMode.mouseIndicatorSize': {
                type: 'number',
                default: 20,
                minimum: 20,
                maximum: 100,
                description: (0, nls_1.localize)('screencastMode.mouseIndicatorSize', "Controls the size (in pixels) of the mouse indicator in screencast mode.")
            },
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGV2ZWxvcGVyQWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL2FjdGlvbnMvZGV2ZWxvcGVyQWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQXNDaEcsTUFBTSx3QkFBeUIsU0FBUSxpQkFBTztRQUU3QztZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUscUNBQXFDO2dCQUN6QyxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsc0JBQXNCLEVBQUUsc0JBQXNCLENBQUMsRUFBRSxRQUFRLEVBQUUsc0JBQXNCLEVBQUU7Z0JBQzVHLFFBQVEsRUFBRSxtQ0FBVSxDQUFDLFNBQVM7Z0JBQzlCLEVBQUUsRUFBRSxJQUFJO2FBQ1IsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELEdBQUcsQ0FBQyxRQUEwQjtZQUM3QixNQUFNLGlCQUFpQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsK0JBQWtCLENBQUMsQ0FBQztZQUUzRCxNQUFNLFdBQVcsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUUxQyxNQUFNLFVBQVUsR0FBRyxJQUFBLHNCQUFnQixHQUFFLENBQUM7WUFDdEMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFBLHdCQUFZLEVBQUMsR0FBRyxFQUFFO2dCQUNqQyxVQUFVLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNoRCxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ0osSUFBQSxtQkFBYSxFQUFDLEdBQUcsRUFBRSwrQkFBK0IsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUVoRSxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3BELFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxD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