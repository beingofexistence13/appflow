/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/browser/actions/developerActions", "vs/platform/keybinding/common/keybinding", "vs/base/browser/event", "vs/base/common/color", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/browser/dom", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/base/browser/keyboardEvent", "vs/base/common/async", "vs/platform/layout/browser/layoutService", "vs/platform/registry/common/platform", "vs/platform/actions/common/actions", "vs/platform/storage/common/storage", "vs/base/common/numbers", "vs/platform/configuration/common/configurationRegistry", "vs/platform/log/common/log", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/platform/action/common/actionCommonCategories", "vs/workbench/services/workingCopy/common/workingCopyBackup", "vs/platform/dialogs/common/dialogs", "vs/workbench/services/output/common/output", "vs/workbench/services/log/common/logConstants", "vs/platform/files/common/files", "vs/platform/quickinput/common/quickInput", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/workbench/services/editor/common/editorService", "vs/platform/product/common/product", "vs/css!./media/actions"], function (require, exports, nls_1, keybinding_1, event_1, color_1, event_2, lifecycle_1, dom_1, configuration_1, contextkey_1, keyboardEvent_1, async_1, layoutService_1, platform_1, actions_1, storage_1, numbers_1, configurationRegistry_1, log_1, workingCopyService_1, actionCommonCategories_1, workingCopyBackup_1, dialogs_1, output_1, logConstants_1, files_1, quickInput_1, userDataProfile_1, editorService_1, product_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class InspectContextKeysAction extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.inspectContextKeys',
                title: { value: (0, nls_1.localize)(0, null), original: 'Inspect Context Keys' },
                category: actionCommonCategories_1.$Nl.Developer,
                f1: true
            });
        }
        run(accessor) {
            const contextKeyService = accessor.get(contextkey_1.$3i);
            const disposables = new lifecycle_1.$jc();
            const stylesheet = (0, dom_1.$XO)();
            disposables.add((0, lifecycle_1.$ic)(() => {
                stylesheet.parentNode?.removeChild(stylesheet);
            }));
            (0, dom_1.$ZO)('*', 'cursor: crosshair !important;', stylesheet);
            const hoverFeedback = document.createElement('div');
            document.body.appendChild(hoverFeedback);
            disposables.add((0, lifecycle_1.$ic)(() => document.body.removeChild(hoverFeedback)));
            hoverFeedback.style.position = 'absolute';
            hoverFeedback.style.pointerEvents = 'none';
            hoverFeedback.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
            hoverFeedback.style.zIndex = '1000';
            const onMouseMove = disposables.add(new event_1.$9P(document.body, 'mousemove', true));
            disposables.add(onMouseMove.event(e => {
                const target = e.target;
                const position = (0, dom_1.$FO)(target);
                hoverFeedback.style.top = `${position.top}px`;
                hoverFeedback.style.left = `${position.left}px`;
                hoverFeedback.style.width = `${position.width}px`;
                hoverFeedback.style.height = `${position.height}px`;
            }));
            const onMouseDown = disposables.add(new event_1.$9P(document.body, 'mousedown', true));
            event_2.Event.once(onMouseDown.event)(e => { e.preventDefault(); e.stopPropagation(); }, null, disposables);
            const onMouseUp = disposables.add(new event_1.$9P(document.body, 'mouseup', true));
            event_2.Event.once(onMouseUp.event)(e => {
                e.preventDefault();
                e.stopPropagation();
                const context = contextKeyService.getContext(e.target);
                console.log(context.collectAllValues());
                (0, lifecycle_1.$fc)(disposables);
            }, null, disposables);
        }
    }
    class ToggleScreencastModeAction extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.toggleScreencastMode',
                title: { value: (0, nls_1.localize)(1, null), original: 'Toggle Screencast Mode' },
                category: actionCommonCategories_1.$Nl.Developer,
                f1: true
            });
        }
        run(accessor) {
            if (ToggleScreencastModeAction.disposable) {
                ToggleScreencastModeAction.disposable.dispose();
                ToggleScreencastModeAction.disposable = undefined;
                return;
            }
            const layoutService = accessor.get(layoutService_1.$XT);
            const configurationService = accessor.get(configuration_1.$8h);
            const keybindingService = accessor.get(keybinding_1.$2D);
            const disposables = new lifecycle_1.$jc();
            const container = layoutService.container;
            const mouseMarker = (0, dom_1.$0O)(container, (0, dom_1.$)('.screencast-mouse'));
            disposables.add((0, lifecycle_1.$ic)(() => mouseMarker.remove()));
            const onMouseDown = disposables.add(new event_1.$9P(container, 'mousedown', true));
            const onMouseUp = disposables.add(new event_1.$9P(container, 'mouseup', true));
            const onMouseMove = disposables.add(new event_1.$9P(container, 'mousemove', true));
            const updateMouseIndicatorColor = () => {
                mouseMarker.style.borderColor = color_1.$Os.fromHex(configurationService.getValue('screencastMode.mouseIndicatorColor')).toString();
            };
            let mouseIndicatorSize;
            const updateMouseIndicatorSize = () => {
                mouseIndicatorSize = (0, numbers_1.$Hl)(configurationService.getValue('screencastMode.mouseIndicatorSize') || 20, 20, 100);
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
            const keyboardMarker = (0, dom_1.$0O)(container, (0, dom_1.$)('.screencast-keyboard'));
            disposables.add((0, lifecycle_1.$ic)(() => keyboardMarker.remove()));
            const updateKeyboardFontSize = () => {
                keyboardMarker.style.fontSize = `${(0, numbers_1.$Hl)(configurationService.getValue('screencastMode.fontSize') || 56, 20, 100)}px`;
            };
            const updateKeyboardMarker = () => {
                keyboardMarker.style.bottom = `${(0, numbers_1.$Hl)(configurationService.getValue('screencastMode.verticalOffset') || 0, 0, 90)}%`;
            };
            let keyboardMarkerTimeout;
            const updateKeyboardMarkerTimeout = () => {
                keyboardMarkerTimeout = (0, numbers_1.$Hl)(configurationService.getValue('screencastMode.keyboardOverlayTimeout') || 800, 500, 5000);
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
            const onKeyDown = disposables.add(new event_1.$9P(window, 'keydown', true));
            const onCompositionStart = disposables.add(new event_1.$9P(window, 'compositionstart', true));
            const onCompositionUpdate = disposables.add(new event_1.$9P(window, 'compositionupdate', true));
            const onCompositionEnd = disposables.add(new event_1.$9P(window, 'compositionend', true));
            let length = 0;
            let composing = undefined;
            let imeBackSpace = false;
            const clearKeyboardScheduler = new async_1.$Sg(() => {
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
                    composing = composing ?? (0, dom_1.$0O)(keyboardMarker, (0, dom_1.$)('span.key'));
                    composing.textContent = e.data;
                }
                else if (imeBackSpace) {
                    keyboardMarker.innerText = '';
                    (0, dom_1.$0O)(keyboardMarker, (0, dom_1.$)('span.key', {}, `Backspace`));
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
                const event = new keyboardEvent_1.$jO(e);
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
                const command = (this.a(shortcut) && shortcut.commandId) ? actions_1.$Tu.getCommand(shortcut.commandId) : null;
                let commandAndGroupLabel = '';
                let keyLabel = keybinding.getLabel();
                if (command) {
                    commandAndGroupLabel = typeof command.title === 'string' ? command.title : command.title.value;
                    if ((options.showCommandGroups ?? false) && command.category) {
                        commandAndGroupLabel = `${typeof command.category === 'string' ? command.category : command.category.value}: ${commandAndGroupLabel} `;
                    }
                    if (this.a(shortcut) && shortcut.commandId) {
                        const keybindings = keybindingService.lookupKeybindings(shortcut.commandId)
                            .filter(k => k.getLabel()?.endsWith(keyLabel ?? ''));
                        if (keybindings.length > 0) {
                            keyLabel = keybindings[keybindings.length - 1].getLabel();
                        }
                    }
                }
                if ((options.showCommands ?? true) && commandAndGroupLabel) {
                    (0, dom_1.$0O)(keyboardMarker, (0, dom_1.$)('span.title', {}, `${commandAndGroupLabel} `));
                }
                if ((options.showKeys ?? true) || (command && (options.showKeybindings ?? true))) {
                    // Fix label for arrow keys
                    keyLabel = keyLabel?.replace('UpArrow', '↑')
                        ?.replace('DownArrow', '↓')
                        ?.replace('LeftArrow', '←')
                        ?.replace('RightArrow', '→');
                    (0, dom_1.$0O)(keyboardMarker, (0, dom_1.$)('span.key', {}, keyLabel ?? ''));
                }
                length++;
                clearKeyboardScheduler.schedule();
            }));
            ToggleScreencastModeAction.disposable = disposables;
        }
        a(resolutionResult) {
            return resolutionResult.kind === 2 /* ResultKind.KbFound */;
        }
    }
    class LogStorageAction extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.logStorage',
                title: { value: (0, nls_1.localize)(2, null), original: 'Log Storage Database Contents' },
                category: actionCommonCategories_1.$Nl.Developer,
                f1: true
            });
        }
        run(accessor) {
            const storageService = accessor.get(storage_1.$Vo);
            const dialogService = accessor.get(dialogs_1.$oA);
            storageService.log();
            dialogService.info((0, nls_1.localize)(3, null), (0, nls_1.localize)(4, null));
        }
    }
    class LogWorkingCopiesAction extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.logWorkingCopies',
                title: { value: (0, nls_1.localize)(5, null), original: 'Log Working Copies' },
                category: actionCommonCategories_1.$Nl.Developer,
                f1: true
            });
        }
        async run(accessor) {
            const workingCopyService = accessor.get(workingCopyService_1.$TC);
            const workingCopyBackupService = accessor.get(workingCopyBackup_1.$EA);
            const logService = accessor.get(log_1.$5i);
            const outputService = accessor.get(output_1.$eJ);
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
            outputService.showChannel(logConstants_1.$mhb, true);
        }
    }
    class RemoveLargeStorageEntriesAction extends actions_1.$Wu {
        static { this.a = 1024 * 16; } // 16kb
        constructor() {
            super({
                id: 'workbench.action.removeLargeStorageDatabaseEntries',
                title: { value: (0, nls_1.localize)(6, null), original: 'Remove Large Storage Database Entries...' },
                category: actionCommonCategories_1.$Nl.Developer,
                f1: true
            });
        }
        async run(accessor) {
            const storageService = accessor.get(storage_1.$Vo);
            const quickInputService = accessor.get(quickInput_1.$Gq);
            const userDataProfileService = accessor.get(userDataProfile_1.$CJ);
            const dialogService = accessor.get(dialogs_1.$oA);
            const items = [];
            for (const scope of [-1 /* StorageScope.APPLICATION */, 0 /* StorageScope.PROFILE */, 1 /* StorageScope.WORKSPACE */]) {
                if (scope === 0 /* StorageScope.PROFILE */ && userDataProfileService.currentProfile.isDefault) {
                    continue; // avoid duplicates
                }
                for (const target of [1 /* StorageTarget.MACHINE */, 0 /* StorageTarget.USER */]) {
                    for (const key of storageService.keys(scope, target)) {
                        const value = storageService.get(key, scope);
                        if (value && value.length > RemoveLargeStorageEntriesAction.a) {
                            items.push({
                                key,
                                scope,
                                target,
                                size: value.length,
                                label: key,
                                description: files_1.$Ak.formatSize(value.length),
                                detail: (0, nls_1.localize)(7, null, scope === -1 /* StorageScope.APPLICATION */ ? (0, nls_1.localize)(8, null) : scope === 0 /* StorageScope.PROFILE */ ? (0, nls_1.localize)(9, null) : (0, nls_1.localize)(10, null), target === 1 /* StorageTarget.MACHINE */ ? (0, nls_1.localize)(11, null) : (0, nls_1.localize)(12, null)),
                            });
                        }
                    }
                }
            }
            items.sort((itemA, itemB) => itemB.size - itemA.size);
            const selectedItems = await new Promise(resolve => {
                const disposables = new lifecycle_1.$jc();
                const picker = disposables.add(quickInputService.createQuickPick());
                picker.items = items;
                picker.canSelectMany = true;
                picker.ok = false;
                picker.customButton = true;
                picker.hideCheckAll = true;
                picker.customLabel = (0, nls_1.localize)(13, null);
                picker.placeholder = (0, nls_1.localize)(14, null);
                if (items.length === 0) {
                    picker.description = (0, nls_1.localize)(15, null);
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
                message: (0, nls_1.localize)(16, null),
                detail: (0, nls_1.localize)(17, null, selectedItems.map(item => item.label).join('\n')),
                primaryButton: (0, nls_1.localize)(18, null)
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
    const DisposablesSnapshotStateContext = new contextkey_1.$2i('dirtyWorkingCopies', 'stopped');
    class StartTrackDisposables extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.startTrackDisposables',
                title: { value: (0, nls_1.localize)(19, null), original: 'Start Tracking Disposables' },
                category: actionCommonCategories_1.$Nl.Developer,
                f1: true,
                precondition: contextkey_1.$Ii.and(DisposablesSnapshotStateContext.isEqualTo('pending').negate(), DisposablesSnapshotStateContext.isEqualTo('started').negate())
            });
        }
        run(accessor) {
            const disposablesSnapshotStateContext = DisposablesSnapshotStateContext.bindTo(accessor.get(contextkey_1.$3i));
            disposablesSnapshotStateContext.set('started');
            trackedDisposables.clear();
            tracker = new lifecycle_1.$_b();
            (0, lifecycle_1.$ac)(tracker);
        }
    }
    class SnapshotTrackedDisposables extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.snapshotTrackedDisposables',
                title: { value: (0, nls_1.localize)(20, null), original: 'Snapshot Tracked Disposables' },
                category: actionCommonCategories_1.$Nl.Developer,
                f1: true,
                precondition: DisposablesSnapshotStateContext.isEqualTo('started')
            });
        }
        run(accessor) {
            const disposablesSnapshotStateContext = DisposablesSnapshotStateContext.bindTo(accessor.get(contextkey_1.$3i));
            disposablesSnapshotStateContext.set('pending');
            trackedDisposables = new Set(tracker?.computeLeakingDisposables(1000)?.leaks.map(disposable => disposable.value));
        }
    }
    class StopTrackDisposables extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.stopTrackDisposables',
                title: { value: (0, nls_1.localize)(21, null), original: 'Stop Tracking Disposables' },
                category: actionCommonCategories_1.$Nl.Developer,
                f1: true,
                precondition: DisposablesSnapshotStateContext.isEqualTo('pending')
            });
        }
        run(accessor) {
            const editorService = accessor.get(editorService_1.$9C);
            const disposablesSnapshotStateContext = DisposablesSnapshotStateContext.bindTo(accessor.get(contextkey_1.$3i));
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
            (0, lifecycle_1.$ac)(null);
            tracker = undefined;
            trackedDisposables.clear();
        }
    }
    // --- Actions Registration
    (0, actions_1.$Xu)(InspectContextKeysAction);
    (0, actions_1.$Xu)(ToggleScreencastModeAction);
    (0, actions_1.$Xu)(LogStorageAction);
    (0, actions_1.$Xu)(LogWorkingCopiesAction);
    (0, actions_1.$Xu)(RemoveLargeStorageEntriesAction);
    if (!product_1.default.commit) {
        (0, actions_1.$Xu)(StartTrackDisposables);
        (0, actions_1.$Xu)(SnapshotTrackedDisposables);
        (0, actions_1.$Xu)(StopTrackDisposables);
    }
    // --- Configuration
    // Screen Cast Mode
    const configurationRegistry = platform_1.$8m.as(configurationRegistry_1.$an.Configuration);
    configurationRegistry.registerConfiguration({
        id: 'screencastMode',
        order: 9,
        title: (0, nls_1.localize)(22, null),
        type: 'object',
        properties: {
            'screencastMode.verticalOffset': {
                type: 'number',
                default: 20,
                minimum: 0,
                maximum: 90,
                description: (0, nls_1.localize)(23, null)
            },
            'screencastMode.fontSize': {
                type: 'number',
                default: 56,
                minimum: 20,
                maximum: 100,
                description: (0, nls_1.localize)(24, null)
            },
            'screencastMode.keyboardOptions': {
                type: 'object',
                description: (0, nls_1.localize)(25, null),
                properties: {
                    'showKeys': {
                        type: 'boolean',
                        default: true,
                        description: (0, nls_1.localize)(26, null)
                    },
                    'showKeybindings': {
                        type: 'boolean',
                        default: true,
                        description: (0, nls_1.localize)(27, null)
                    },
                    'showCommands': {
                        type: 'boolean',
                        default: true,
                        description: (0, nls_1.localize)(28, null)
                    },
                    'showCommandGroups': {
                        type: 'boolean',
                        default: false,
                        description: (0, nls_1.localize)(29, null)
                    },
                    'showSingleEditorCursorMoves': {
                        type: 'boolean',
                        default: true,
                        description: (0, nls_1.localize)(30, null)
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
                description: (0, nls_1.localize)(31, null)
            },
            'screencastMode.mouseIndicatorColor': {
                type: 'string',
                format: 'color-hex',
                default: '#FF0000',
                description: (0, nls_1.localize)(32, null)
            },
            'screencastMode.mouseIndicatorSize': {
                type: 'number',
                default: 20,
                minimum: 20,
                maximum: 100,
                description: (0, nls_1.localize)(33, null)
            },
        }
    });
});
//# sourceMappingURL=developerActions.js.map