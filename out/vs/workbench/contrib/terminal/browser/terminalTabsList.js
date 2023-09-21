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
define(["require", "exports", "vs/platform/list/browser/listService", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/common/keybinding", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/workbench/contrib/terminal/browser/terminal", "vs/nls", "vs/base/browser/dom", "vs/platform/instantiation/common/instantiation", "vs/base/browser/ui/actionbar/actionbar", "vs/platform/actions/common/actions", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/terminal/common/terminal", "vs/base/common/codicons", "vs/base/common/actions", "vs/workbench/browser/labels", "vs/workbench/services/decorations/common/decorations", "vs/workbench/services/hover/browser/hover", "vs/base/common/severity", "vs/base/common/lifecycle", "vs/base/browser/dnd", "vs/base/common/async", "vs/base/browser/ui/list/listView", "vs/base/common/uri", "vs/workbench/contrib/terminal/browser/terminalIcon", "vs/platform/contextview/browser/contextView", "vs/base/browser/ui/inputbox/inputBox", "vs/base/common/functional", "vs/platform/dnd/browser/dnd", "vs/workbench/contrib/terminal/common/terminalStrings", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/contrib/terminal/common/terminalContextKey", "vs/workbench/contrib/terminal/browser/terminalUri", "vs/workbench/contrib/terminal/browser/terminalTooltip", "vs/platform/theme/browser/defaultStyles", "vs/base/common/event", "vs/base/common/network", "vs/workbench/contrib/terminal/browser/terminalStatusList"], function (require, exports, listService_1, configuration_1, contextkey_1, keybinding_1, themeService_1, themables_1, terminal_1, nls_1, DOM, instantiation_1, actionbar_1, actions_1, menuEntryActionViewItem_1, terminal_2, codicons_1, actions_2, labels_1, decorations_1, hover_1, severity_1, lifecycle_1, dnd_1, async_1, listView_1, uri_1, terminalIcon_1, contextView_1, inputBox_1, functional_1, dnd_2, terminalStrings_1, lifecycle_2, terminalContextKey_1, terminalUri_1, terminalTooltip_1, defaultStyles_1, event_1, network_1, terminalStatusList_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalTabList = exports.TerminalTabsListSizes = void 0;
    const $ = DOM.$;
    var TerminalTabsListSizes;
    (function (TerminalTabsListSizes) {
        TerminalTabsListSizes[TerminalTabsListSizes["TabHeight"] = 22] = "TabHeight";
        TerminalTabsListSizes[TerminalTabsListSizes["NarrowViewWidth"] = 46] = "NarrowViewWidth";
        TerminalTabsListSizes[TerminalTabsListSizes["WideViewMinimumWidth"] = 80] = "WideViewMinimumWidth";
        TerminalTabsListSizes[TerminalTabsListSizes["DefaultWidth"] = 120] = "DefaultWidth";
        TerminalTabsListSizes[TerminalTabsListSizes["MidpointViewWidth"] = 63] = "MidpointViewWidth";
        TerminalTabsListSizes[TerminalTabsListSizes["ActionbarMinimumWidth"] = 105] = "ActionbarMinimumWidth";
        TerminalTabsListSizes[TerminalTabsListSizes["MaximumWidth"] = 500] = "MaximumWidth";
    })(TerminalTabsListSizes || (exports.TerminalTabsListSizes = TerminalTabsListSizes = {}));
    let TerminalTabList = class TerminalTabList extends listService_1.WorkbenchList {
        constructor(container, contextKeyService, listService, themeService, _configurationService, _terminalService, _terminalGroupService, instantiationService, decorationsService, _themeService, lifecycleService, _hoverService) {
            super('TerminalTabsList', container, {
                getHeight: () => 22 /* TerminalTabsListSizes.TabHeight */,
                getTemplateId: () => 'terminal.tabs'
            }, [instantiationService.createInstance(TerminalTabsRenderer, container, instantiationService.createInstance(labels_1.ResourceLabels, labels_1.DEFAULT_LABELS_CONTAINER), () => this.getSelectedElements())], {
                horizontalScrolling: false,
                supportDynamicHeights: false,
                selectionNavigation: true,
                identityProvider: {
                    getId: e => e?.instanceId
                },
                accessibilityProvider: instantiationService.createInstance(TerminalTabsAccessibilityProvider),
                smoothScrolling: _configurationService.getValue('workbench.list.smoothScrolling'),
                multipleSelectionSupport: true,
                paddingBottom: 22 /* TerminalTabsListSizes.TabHeight */,
                dnd: instantiationService.createInstance(TerminalTabsDragAndDrop),
                openOnSingleClick: true
            }, contextKeyService, listService, _configurationService, instantiationService);
            this._configurationService = _configurationService;
            this._terminalService = _terminalService;
            this._terminalGroupService = _terminalGroupService;
            this._themeService = _themeService;
            this._hoverService = _hoverService;
            const instanceDisposables = [
                this._terminalGroupService.onDidChangeInstances(() => this.refresh()),
                this._terminalGroupService.onDidChangeGroups(() => this.refresh()),
                this._terminalGroupService.onDidShow(() => this.refresh()),
                this._terminalGroupService.onDidChangeInstanceCapability(() => this.refresh()),
                this._terminalService.onDidChangeInstanceTitle(() => this.refresh()),
                this._terminalService.onDidChangeInstanceIcon(() => this.refresh()),
                this._terminalService.onDidChangeInstancePrimaryStatus(() => this.refresh()),
                this._terminalService.onDidChangeConnectionState(() => this.refresh()),
                this._themeService.onDidColorThemeChange(() => this.refresh()),
                this._terminalGroupService.onDidChangeActiveInstance(e => {
                    if (e) {
                        const i = this._terminalGroupService.instances.indexOf(e);
                        this.setSelection([i]);
                        this.reveal(i);
                    }
                    this.refresh();
                })
            ];
            // Dispose of instance listeners on shutdown to avoid extra work and so tabs don't disappear
            // briefly
            lifecycleService.onWillShutdown(e => {
                (0, lifecycle_1.dispose)(instanceDisposables);
            });
            this.onMouseDblClick(async (e) => {
                const focus = this.getFocus();
                if (focus.length === 0) {
                    const instance = await this._terminalService.createTerminal({ location: terminal_2.TerminalLocation.Panel });
                    this._terminalGroupService.setActiveInstance(instance);
                    await instance.focusWhenReady();
                }
                if (this._terminalService.getEditingTerminal()?.instanceId === e.element?.instanceId) {
                    return;
                }
                if (this._getFocusMode() === 'doubleClick' && this.getFocus().length === 1) {
                    e.element?.focus(true);
                }
            });
            // on left click, if focus mode = single click, focus the element
            // unless multi-selection is in progress
            this.onMouseClick(async (e) => {
                if (this._terminalService.getEditingTerminal()?.instanceId === e.element?.instanceId) {
                    return;
                }
                if (e.browserEvent.altKey && e.element) {
                    await this._terminalService.createTerminal({ location: { parentTerminal: e.element } });
                }
                else if (this._getFocusMode() === 'singleClick') {
                    if (this.getSelection().length <= 1) {
                        e.element?.focus(true);
                    }
                }
            });
            // on right click, set the focus to that element
            // unless multi-selection is in progress
            this.onContextMenu(e => {
                if (!e.element) {
                    this.setSelection([]);
                    return;
                }
                const selection = this.getSelectedElements();
                if (!selection || !selection.find(s => e.element === s)) {
                    this.setFocus(e.index !== undefined ? [e.index] : []);
                }
            });
            this._terminalTabsSingleSelectedContextKey = terminalContextKey_1.TerminalContextKeys.tabsSingularSelection.bindTo(contextKeyService);
            this._isSplitContextKey = terminalContextKey_1.TerminalContextKeys.splitTerminal.bindTo(contextKeyService);
            this.onDidChangeSelection(e => this._updateContextKey());
            this.onDidChangeFocus(() => this._updateContextKey());
            this.onDidOpen(async (e) => {
                const instance = e.element;
                if (!instance) {
                    return;
                }
                this._terminalGroupService.setActiveInstance(instance);
                if (!e.editorOptions.preserveFocus) {
                    await instance.focusWhenReady();
                }
            });
            if (!this._decorationsProvider) {
                this._decorationsProvider = this.disposables.add(instantiationService.createInstance(TabDecorationsProvider));
                this.disposables.add(decorationsService.registerDecorationsProvider(this._decorationsProvider));
            }
            this.refresh();
        }
        _getFocusMode() {
            return this._configurationService.getValue("terminal.integrated.tabs.focusMode" /* TerminalSettingId.TabsFocusMode */);
        }
        refresh(cancelEditing = true) {
            if (cancelEditing && this._terminalService.isEditable(undefined)) {
                this.domFocus();
            }
            this.splice(0, this.length, this._terminalGroupService.instances.slice());
        }
        focusHover() {
            const instance = this.getSelectedElements()[0];
            if (!instance) {
                return;
            }
            this._hoverService.showHover({
                ...(0, terminalTooltip_1.getInstanceHoverInfo)(instance),
                target: this.getHTMLElement(),
                trapFocus: true
            }, true);
        }
        _updateContextKey() {
            this._terminalTabsSingleSelectedContextKey.set(this.getSelectedElements().length === 1);
            const instance = this.getFocusedElements();
            this._isSplitContextKey.set(instance.length > 0 && this._terminalGroupService.instanceIsSplit(instance[0]));
        }
    };
    exports.TerminalTabList = TerminalTabList;
    exports.TerminalTabList = TerminalTabList = __decorate([
        __param(1, contextkey_1.IContextKeyService),
        __param(2, listService_1.IListService),
        __param(3, themeService_1.IThemeService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, terminal_1.ITerminalService),
        __param(6, terminal_1.ITerminalGroupService),
        __param(7, instantiation_1.IInstantiationService),
        __param(8, decorations_1.IDecorationsService),
        __param(9, themeService_1.IThemeService),
        __param(10, lifecycle_2.ILifecycleService),
        __param(11, hover_1.IHoverService)
    ], TerminalTabList);
    let TerminalTabsRenderer = class TerminalTabsRenderer {
        constructor(_container, _labels, _getSelection, _instantiationService, _terminalService, _terminalGroupService, _hoverService, _configurationService, _keybindingService, _listService, _themeService, _contextViewService) {
            this._container = _container;
            this._labels = _labels;
            this._getSelection = _getSelection;
            this._instantiationService = _instantiationService;
            this._terminalService = _terminalService;
            this._terminalGroupService = _terminalGroupService;
            this._hoverService = _hoverService;
            this._configurationService = _configurationService;
            this._keybindingService = _keybindingService;
            this._listService = _listService;
            this._themeService = _themeService;
            this._contextViewService = _contextViewService;
            this.templateId = 'terminal.tabs';
        }
        renderTemplate(container) {
            const element = DOM.append(container, $('.terminal-tabs-entry'));
            const context = {};
            const label = this._labels.create(element, {
                supportHighlights: true,
                supportDescriptionHighlights: true,
                supportIcons: true,
                hoverDelegate: {
                    delay: this._configurationService.getValue('workbench.hover.delay'),
                    showHover: options => {
                        return this._hoverService.showHover({
                            ...options,
                            actions: context.hoverActions,
                            hideOnHover: true
                        });
                    }
                }
            });
            const actionsContainer = DOM.append(label.element, $('.actions'));
            const actionBar = new actionbar_1.ActionBar(actionsContainer, {
                actionViewItemProvider: action => action instanceof actions_1.MenuItemAction
                    ? this._instantiationService.createInstance(menuEntryActionViewItem_1.MenuEntryActionViewItem, action, undefined)
                    : undefined
            });
            return {
                element,
                label,
                actionBar,
                context,
                elementDisposables: new lifecycle_1.DisposableStore(),
            };
        }
        shouldHideText() {
            return this._container ? this._container.clientWidth < 63 /* TerminalTabsListSizes.MidpointViewWidth */ : false;
        }
        shouldHideActionBar() {
            return this._container ? this._container.clientWidth <= 105 /* TerminalTabsListSizes.ActionbarMinimumWidth */ : false;
        }
        renderElement(instance, index, template) {
            const hasText = !this.shouldHideText();
            const group = this._terminalGroupService.getGroupForInstance(instance);
            if (!group) {
                throw new Error(`Could not find group for instance "${instance.instanceId}"`);
            }
            template.element.classList.toggle('has-text', hasText);
            template.element.classList.toggle('is-active', this._terminalGroupService.activeInstance === instance);
            let prefix = '';
            if (group.terminalInstances.length > 1) {
                const terminalIndex = group.terminalInstances.indexOf(instance);
                if (terminalIndex === 0) {
                    prefix = `┌ `;
                }
                else if (terminalIndex === group.terminalInstances.length - 1) {
                    prefix = `└ `;
                }
                else {
                    prefix = `├ `;
                }
            }
            const hoverInfo = (0, terminalTooltip_1.getInstanceHoverInfo)(instance);
            template.context.hoverActions = hoverInfo.actions;
            const iconId = this._instantiationService.invokeFunction(terminalIcon_1.getIconId, instance);
            const hasActionbar = !this.shouldHideActionBar();
            let label = '';
            if (!hasText) {
                const primaryStatus = instance.statusList.primary;
                // Don't show ignore severity
                if (primaryStatus && primaryStatus.severity > severity_1.default.Ignore) {
                    label = `${prefix}$(${primaryStatus.icon?.id || iconId})`;
                }
                else {
                    label = `${prefix}$(${iconId})`;
                }
            }
            else {
                this.fillActionBar(instance, template);
                label = prefix;
                // Only add the title if the icon is set, this prevents the title jumping around for
                // example when launching with a ShellLaunchConfig.name and no icon
                if (instance.icon) {
                    label += `$(${iconId}) ${instance.title}`;
                }
            }
            if (!hasActionbar) {
                template.actionBar.clear();
            }
            // Kill terminal on middle click
            template.elementDisposables.add(DOM.addDisposableListener(template.element, DOM.EventType.AUXCLICK, e => {
                e.stopImmediatePropagation();
                if (e.button === 1 /*middle*/) {
                    this._terminalService.safeDisposeTerminal(instance);
                }
            }));
            const extraClasses = [];
            const colorClass = (0, terminalIcon_1.getColorClass)(instance);
            if (colorClass) {
                extraClasses.push(colorClass);
            }
            const uriClasses = (0, terminalIcon_1.getUriClasses)(instance, this._themeService.getColorTheme().type);
            if (uriClasses) {
                extraClasses.push(...uriClasses);
            }
            template.label.setResource({
                resource: instance.resource,
                name: label,
                description: hasText ? instance.description : undefined
            }, {
                fileDecorations: {
                    colors: true,
                    badges: hasText
                },
                title: {
                    markdown: hoverInfo.content,
                    markdownNotSupportedFallback: undefined
                },
                extraClasses
            });
            const editableData = this._terminalService.getEditableData(instance);
            template.label.element.classList.toggle('editable-tab', !!editableData);
            if (editableData) {
                template.elementDisposables.add(this._renderInputBox(template.label.element.querySelector('.monaco-icon-label-container'), instance, editableData));
                template.actionBar.clear();
            }
        }
        _renderInputBox(container, instance, editableData) {
            const value = instance.title || '';
            const inputBox = new inputBox_1.InputBox(container, this._contextViewService, {
                validationOptions: {
                    validation: (value) => {
                        const message = editableData.validationMessage(value);
                        if (!message || message.severity !== severity_1.default.Error) {
                            return null;
                        }
                        return {
                            content: message.content,
                            formatContent: true,
                            type: 3 /* MessageType.ERROR */
                        };
                    }
                },
                ariaLabel: (0, nls_1.localize)('terminalInputAriaLabel', "Type terminal name. Press Enter to confirm or Escape to cancel."),
                inputBoxStyles: defaultStyles_1.defaultInputBoxStyles
            });
            inputBox.element.style.height = '22px';
            inputBox.value = value;
            inputBox.focus();
            inputBox.select({ start: 0, end: value.length });
            const done = (0, functional_1.once)((success, finishEditing) => {
                inputBox.element.style.display = 'none';
                const value = inputBox.value;
                (0, lifecycle_1.dispose)(toDispose);
                inputBox.element.remove();
                if (finishEditing) {
                    editableData.onFinish(value, success);
                }
            });
            const showInputBoxNotification = () => {
                if (inputBox.isInputValid()) {
                    const message = editableData.validationMessage(inputBox.value);
                    if (message) {
                        inputBox.showMessage({
                            content: message.content,
                            formatContent: true,
                            type: message.severity === severity_1.default.Info ? 1 /* MessageType.INFO */ : message.severity === severity_1.default.Warning ? 2 /* MessageType.WARNING */ : 3 /* MessageType.ERROR */
                        });
                    }
                    else {
                        inputBox.hideMessage();
                    }
                }
            };
            showInputBoxNotification();
            const toDispose = [
                inputBox,
                DOM.addStandardDisposableListener(inputBox.inputElement, DOM.EventType.KEY_DOWN, (e) => {
                    e.stopPropagation();
                    if (e.equals(3 /* KeyCode.Enter */)) {
                        done(inputBox.isInputValid(), true);
                    }
                    else if (e.equals(9 /* KeyCode.Escape */)) {
                        done(false, true);
                    }
                }),
                DOM.addStandardDisposableListener(inputBox.inputElement, DOM.EventType.KEY_UP, (e) => {
                    showInputBoxNotification();
                }),
                DOM.addDisposableListener(inputBox.inputElement, DOM.EventType.BLUR, () => {
                    done(inputBox.isInputValid(), true);
                })
            ];
            return (0, lifecycle_1.toDisposable)(() => {
                done(false, false);
            });
        }
        disposeElement(instance, index, templateData) {
            templateData.elementDisposables.clear();
            templateData.actionBar.clear();
        }
        disposeTemplate(templateData) {
            templateData.elementDisposables.dispose();
            templateData.label.dispose();
            templateData.actionBar.dispose();
        }
        fillActionBar(instance, template) {
            // If the instance is within the selection, split all selected
            const actions = [
                new actions_2.Action("workbench.action.terminal.splitActiveTab" /* TerminalCommandId.SplitActiveTab */, terminalStrings_1.terminalStrings.split.short, themables_1.ThemeIcon.asClassName(codicons_1.Codicon.splitHorizontal), true, async () => {
                    this._runForSelectionOrInstance(instance, async (e) => {
                        this._terminalService.createTerminal({ location: { parentTerminal: e } });
                    });
                }),
                new actions_2.Action("workbench.action.terminal.killActiveTab" /* TerminalCommandId.KillActiveTab */, terminalStrings_1.terminalStrings.kill.short, themables_1.ThemeIcon.asClassName(codicons_1.Codicon.trashcan), true, async () => {
                    this._runForSelectionOrInstance(instance, e => this._terminalService.safeDisposeTerminal(e));
                })
            ];
            // TODO: Cache these in a way that will use the correct instance
            template.actionBar.clear();
            for (const action of actions) {
                template.actionBar.push(action, { icon: true, label: false, keybinding: this._keybindingService.lookupKeybinding(action.id)?.getLabel() });
            }
        }
        _runForSelectionOrInstance(instance, callback) {
            const selection = this._getSelection();
            if (selection.includes(instance)) {
                for (const s of selection) {
                    if (s) {
                        callback(s);
                    }
                }
            }
            else {
                callback(instance);
            }
            this._terminalGroupService.focusTabs();
            this._listService.lastFocusedList?.focusNext();
        }
    };
    TerminalTabsRenderer = __decorate([
        __param(3, instantiation_1.IInstantiationService),
        __param(4, terminal_1.ITerminalService),
        __param(5, terminal_1.ITerminalGroupService),
        __param(6, hover_1.IHoverService),
        __param(7, configuration_1.IConfigurationService),
        __param(8, keybinding_1.IKeybindingService),
        __param(9, listService_1.IListService),
        __param(10, themeService_1.IThemeService),
        __param(11, contextView_1.IContextViewService)
    ], TerminalTabsRenderer);
    let TerminalTabsAccessibilityProvider = class TerminalTabsAccessibilityProvider {
        constructor(_terminalGroupService) {
            this._terminalGroupService = _terminalGroupService;
        }
        getWidgetAriaLabel() {
            return (0, nls_1.localize)('terminal.tabs', "Terminal tabs");
        }
        getAriaLabel(instance) {
            let ariaLabel = '';
            const tab = this._terminalGroupService.getGroupForInstance(instance);
            if (tab && tab.terminalInstances?.length > 1) {
                const terminalIndex = tab.terminalInstances.indexOf(instance);
                ariaLabel = (0, nls_1.localize)({
                    key: 'splitTerminalAriaLabel',
                    comment: [
                        `The terminal's ID`,
                        `The terminal's title`,
                        `The terminal's split number`,
                        `The terminal group's total split number`
                    ]
                }, "Terminal {0} {1}, split {2} of {3}", instance.instanceId, instance.title, terminalIndex + 1, tab.terminalInstances.length);
            }
            else {
                ariaLabel = (0, nls_1.localize)({
                    key: 'terminalAriaLabel',
                    comment: [
                        `The terminal's ID`,
                        `The terminal's title`
                    ]
                }, "Terminal {0} {1}", instance.instanceId, instance.title);
            }
            return ariaLabel;
        }
    };
    TerminalTabsAccessibilityProvider = __decorate([
        __param(0, terminal_1.ITerminalGroupService)
    ], TerminalTabsAccessibilityProvider);
    let TerminalTabsDragAndDrop = class TerminalTabsDragAndDrop {
        constructor(_terminalService, _terminalGroupService) {
            this._terminalService = _terminalService;
            this._terminalGroupService = _terminalGroupService;
            this._autoFocusDisposable = lifecycle_1.Disposable.None;
            this._primaryBackend = this._terminalService.getPrimaryBackend();
        }
        getDragURI(instance) {
            if (this._terminalService.getEditingTerminal()?.instanceId === instance.instanceId) {
                return null;
            }
            return instance.resource.toString();
        }
        getDragLabel(elements, originalEvent) {
            return elements.length === 1 ? elements[0].title : undefined;
        }
        onDragLeave() {
            this._autoFocusInstance = undefined;
            this._autoFocusDisposable.dispose();
            this._autoFocusDisposable = lifecycle_1.Disposable.None;
        }
        onDragStart(data, originalEvent) {
            if (!originalEvent.dataTransfer) {
                return;
            }
            const dndData = data.getData();
            if (!Array.isArray(dndData)) {
                return;
            }
            // Attach terminals type to event
            const terminals = dndData.filter(e => 'instanceId' in e);
            if (terminals.length > 0) {
                originalEvent.dataTransfer.setData("Terminals" /* TerminalDataTransfers.Terminals */, JSON.stringify(terminals.map(e => e.resource.toString())));
            }
        }
        onDragOver(data, targetInstance, targetIndex, originalEvent) {
            if (data instanceof listView_1.NativeDragAndDropData) {
                if (!(0, dnd_2.containsDragType)(originalEvent, dnd_1.DataTransfers.FILES, dnd_1.DataTransfers.RESOURCES, "Terminals" /* TerminalDataTransfers.Terminals */, dnd_2.CodeDataTransfers.FILES)) {
                    return false;
                }
            }
            const didChangeAutoFocusInstance = this._autoFocusInstance !== targetInstance;
            if (didChangeAutoFocusInstance) {
                this._autoFocusDisposable.dispose();
                this._autoFocusInstance = targetInstance;
            }
            if (!targetInstance && !(0, dnd_2.containsDragType)(originalEvent, "Terminals" /* TerminalDataTransfers.Terminals */)) {
                return data instanceof listView_1.ElementsDragAndDropData;
            }
            if (didChangeAutoFocusInstance && targetInstance) {
                this._autoFocusDisposable = (0, async_1.disposableTimeout)(() => {
                    this._terminalService.setActiveInstance(targetInstance);
                    this._autoFocusInstance = undefined;
                }, 500);
            }
            return {
                feedback: targetIndex ? [targetIndex] : undefined,
                accept: true,
                effect: 1 /* ListDragOverEffect.Move */
            };
        }
        async drop(data, targetInstance, targetIndex, originalEvent) {
            this._autoFocusDisposable.dispose();
            this._autoFocusInstance = undefined;
            let sourceInstances;
            const promises = [];
            const resources = (0, terminalUri_1.getTerminalResourcesFromDragEvent)(originalEvent);
            if (resources) {
                for (const uri of resources) {
                    const instance = this._terminalService.getInstanceFromResource(uri);
                    if (instance) {
                        sourceInstances = [instance];
                        this._terminalService.moveToTerminalView(instance);
                    }
                    else if (this._primaryBackend) {
                        const terminalIdentifier = (0, terminalUri_1.parseTerminalUri)(uri);
                        if (terminalIdentifier.instanceId) {
                            promises.push(this._primaryBackend.requestDetachInstance(terminalIdentifier.workspaceId, terminalIdentifier.instanceId));
                        }
                    }
                }
            }
            if (promises.length) {
                let processes = await Promise.all(promises);
                processes = processes.filter(p => p !== undefined);
                let lastInstance;
                for (const attachPersistentProcess of processes) {
                    lastInstance = await this._terminalService.createTerminal({ config: { attachPersistentProcess } });
                }
                if (lastInstance) {
                    this._terminalService.setActiveInstance(lastInstance);
                }
                return;
            }
            if (sourceInstances === undefined) {
                if (!(data instanceof listView_1.ElementsDragAndDropData)) {
                    this._handleExternalDrop(targetInstance, originalEvent);
                    return;
                }
                const draggedElement = data.getData();
                if (!draggedElement || !Array.isArray(draggedElement)) {
                    return;
                }
                sourceInstances = [];
                for (const e of draggedElement) {
                    if ('instanceId' in e) {
                        sourceInstances.push(e);
                    }
                }
            }
            if (!targetInstance) {
                this._terminalGroupService.moveGroupToEnd(sourceInstances[0]);
                this._terminalService.setActiveInstance(sourceInstances[0]);
                return;
            }
            let focused = false;
            for (const instance of sourceInstances) {
                this._terminalGroupService.moveGroup(instance, targetInstance);
                if (!focused) {
                    this._terminalService.setActiveInstance(instance);
                    focused = true;
                }
            }
        }
        async _handleExternalDrop(instance, e) {
            if (!instance || !e.dataTransfer) {
                return;
            }
            // Check if files were dragged from the tree explorer
            let resource;
            const rawResources = e.dataTransfer.getData(dnd_1.DataTransfers.RESOURCES);
            if (rawResources) {
                resource = uri_1.URI.parse(JSON.parse(rawResources)[0]);
            }
            const rawCodeFiles = e.dataTransfer.getData(dnd_2.CodeDataTransfers.FILES);
            if (!resource && rawCodeFiles) {
                resource = uri_1.URI.file(JSON.parse(rawCodeFiles)[0]);
            }
            if (!resource && e.dataTransfer.files.length > 0 && e.dataTransfer.files[0].path /* Electron only */) {
                // Check if the file was dragged from the filesystem
                resource = uri_1.URI.file(e.dataTransfer.files[0].path);
            }
            if (!resource) {
                return;
            }
            this._terminalService.setActiveInstance(instance);
            instance.focus();
            await instance.sendPath(resource, false);
        }
    };
    TerminalTabsDragAndDrop = __decorate([
        __param(0, terminal_1.ITerminalService),
        __param(1, terminal_1.ITerminalGroupService)
    ], TerminalTabsDragAndDrop);
    let TabDecorationsProvider = class TabDecorationsProvider extends lifecycle_1.Disposable {
        constructor(_terminalService) {
            super();
            this._terminalService = _terminalService;
            this.label = (0, nls_1.localize)('label', "Terminal");
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this._register(this._terminalService.onDidChangeInstancePrimaryStatus(e => this._onDidChange.fire([e.resource])));
        }
        provideDecorations(resource) {
            if (resource.scheme !== network_1.Schemas.vscodeTerminal) {
                return undefined;
            }
            const instance = this._terminalService.getInstanceFromResource(resource);
            if (!instance) {
                return undefined;
            }
            const primaryStatus = instance?.statusList?.primary;
            if (!primaryStatus?.icon) {
                return undefined;
            }
            return {
                color: (0, terminalStatusList_1.getColorForSeverity)(primaryStatus.severity),
                letter: primaryStatus.icon,
                tooltip: primaryStatus.tooltip
            };
        }
    };
    TabDecorationsProvider = __decorate([
        __param(0, terminal_1.ITerminalService)
    ], TabDecorationsProvider);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxUYWJzTGlzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlcm1pbmFsL2Jyb3dzZXIvdGVybWluYWxUYWJzTGlzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFpRGhHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFFaEIsSUFBa0IscUJBUWpCO0lBUkQsV0FBa0IscUJBQXFCO1FBQ3RDLDRFQUFjLENBQUE7UUFDZCx3RkFBb0IsQ0FBQTtRQUNwQixrR0FBeUIsQ0FBQTtRQUN6QixtRkFBa0IsQ0FBQTtRQUNsQiw0RkFBNEcsQ0FBQTtRQUM1RyxxR0FBMkIsQ0FBQTtRQUMzQixtRkFBa0IsQ0FBQTtJQUNuQixDQUFDLEVBUmlCLHFCQUFxQixxQ0FBckIscUJBQXFCLFFBUXRDO0lBRU0sSUFBTSxlQUFlLEdBQXJCLE1BQU0sZUFBZ0IsU0FBUSwyQkFBZ0M7UUFLcEUsWUFDQyxTQUFzQixFQUNGLGlCQUFxQyxFQUMzQyxXQUF5QixFQUN4QixZQUEyQixFQUNGLHFCQUE0QyxFQUNqRCxnQkFBa0MsRUFDN0IscUJBQTRDLEVBQzdELG9CQUEyQyxFQUM3QyxrQkFBdUMsRUFDNUIsYUFBNEIsRUFDekMsZ0JBQW1DLEVBQ3RCLGFBQTRCO1lBRTVELEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxTQUFTLEVBQ2xDO2dCQUNDLFNBQVMsRUFBRSxHQUFHLEVBQUUseUNBQWdDO2dCQUNoRCxhQUFhLEVBQUUsR0FBRyxFQUFFLENBQUMsZUFBZTthQUNwQyxFQUNELENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLG9CQUFvQixFQUFFLFNBQVMsRUFBRSxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsdUJBQWMsRUFBRSxpQ0FBd0IsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxt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