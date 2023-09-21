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
define(["require", "exports", "vs/platform/list/browser/listService", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/common/keybinding", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/workbench/contrib/terminal/browser/terminal", "vs/nls!vs/workbench/contrib/terminal/browser/terminalTabsList", "vs/base/browser/dom", "vs/platform/instantiation/common/instantiation", "vs/base/browser/ui/actionbar/actionbar", "vs/platform/actions/common/actions", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/terminal/common/terminal", "vs/base/common/codicons", "vs/base/common/actions", "vs/workbench/browser/labels", "vs/workbench/services/decorations/common/decorations", "vs/workbench/services/hover/browser/hover", "vs/base/common/severity", "vs/base/common/lifecycle", "vs/base/browser/dnd", "vs/base/common/async", "vs/base/browser/ui/list/listView", "vs/base/common/uri", "vs/workbench/contrib/terminal/browser/terminalIcon", "vs/platform/contextview/browser/contextView", "vs/base/browser/ui/inputbox/inputBox", "vs/base/common/functional", "vs/platform/dnd/browser/dnd", "vs/workbench/contrib/terminal/common/terminalStrings", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/contrib/terminal/common/terminalContextKey", "vs/workbench/contrib/terminal/browser/terminalUri", "vs/workbench/contrib/terminal/browser/terminalTooltip", "vs/platform/theme/browser/defaultStyles", "vs/base/common/event", "vs/base/common/network", "vs/workbench/contrib/terminal/browser/terminalStatusList"], function (require, exports, listService_1, configuration_1, contextkey_1, keybinding_1, themeService_1, themables_1, terminal_1, nls_1, DOM, instantiation_1, actionbar_1, actions_1, menuEntryActionViewItem_1, terminal_2, codicons_1, actions_2, labels_1, decorations_1, hover_1, severity_1, lifecycle_1, dnd_1, async_1, listView_1, uri_1, terminalIcon_1, contextView_1, inputBox_1, functional_1, dnd_2, terminalStrings_1, lifecycle_2, terminalContextKey_1, terminalUri_1, terminalTooltip_1, defaultStyles_1, event_1, network_1, terminalStatusList_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$VVb = exports.TerminalTabsListSizes = void 0;
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
    let $VVb = class $VVb extends listService_1.$p4 {
        constructor(container, contextKeyService, listService, themeService, V, W, X, instantiationService, decorationsService, Y, lifecycleService, Z) {
            super('TerminalTabsList', container, {
                getHeight: () => 22 /* TerminalTabsListSizes.TabHeight */,
                getTemplateId: () => 'terminal.tabs'
            }, [instantiationService.createInstance(TerminalTabsRenderer, container, instantiationService.createInstance(labels_1.$Llb, labels_1.$Klb), () => this.getSelectedElements())], {
                horizontalScrolling: false,
                supportDynamicHeights: false,
                selectionNavigation: true,
                identityProvider: {
                    getId: e => e?.instanceId
                },
                accessibilityProvider: instantiationService.createInstance(TerminalTabsAccessibilityProvider),
                smoothScrolling: V.getValue('workbench.list.smoothScrolling'),
                multipleSelectionSupport: true,
                paddingBottom: 22 /* TerminalTabsListSizes.TabHeight */,
                dnd: instantiationService.createInstance(TerminalTabsDragAndDrop),
                openOnSingleClick: true
            }, contextKeyService, listService, V, instantiationService);
            this.V = V;
            this.W = W;
            this.X = X;
            this.Y = Y;
            this.Z = Z;
            const instanceDisposables = [
                this.X.onDidChangeInstances(() => this.refresh()),
                this.X.onDidChangeGroups(() => this.refresh()),
                this.X.onDidShow(() => this.refresh()),
                this.X.onDidChangeInstanceCapability(() => this.refresh()),
                this.W.onDidChangeInstanceTitle(() => this.refresh()),
                this.W.onDidChangeInstanceIcon(() => this.refresh()),
                this.W.onDidChangeInstancePrimaryStatus(() => this.refresh()),
                this.W.onDidChangeConnectionState(() => this.refresh()),
                this.Y.onDidColorThemeChange(() => this.refresh()),
                this.X.onDidChangeActiveInstance(e => {
                    if (e) {
                        const i = this.X.instances.indexOf(e);
                        this.setSelection([i]);
                        this.reveal(i);
                    }
                    this.refresh();
                })
            ];
            // Dispose of instance listeners on shutdown to avoid extra work and so tabs don't disappear
            // briefly
            lifecycleService.onWillShutdown(e => {
                (0, lifecycle_1.$fc)(instanceDisposables);
            });
            this.onMouseDblClick(async (e) => {
                const focus = this.getFocus();
                if (focus.length === 0) {
                    const instance = await this.W.createTerminal({ location: terminal_2.TerminalLocation.Panel });
                    this.X.setActiveInstance(instance);
                    await instance.focusWhenReady();
                }
                if (this.W.getEditingTerminal()?.instanceId === e.element?.instanceId) {
                    return;
                }
                if (this.ab() === 'doubleClick' && this.getFocus().length === 1) {
                    e.element?.focus(true);
                }
            });
            // on left click, if focus mode = single click, focus the element
            // unless multi-selection is in progress
            this.onMouseClick(async (e) => {
                if (this.W.getEditingTerminal()?.instanceId === e.element?.instanceId) {
                    return;
                }
                if (e.browserEvent.altKey && e.element) {
                    await this.W.createTerminal({ location: { parentTerminal: e.element } });
                }
                else if (this.ab() === 'singleClick') {
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
            this.S = terminalContextKey_1.TerminalContextKeys.tabsSingularSelection.bindTo(contextKeyService);
            this.U = terminalContextKey_1.TerminalContextKeys.splitTerminal.bindTo(contextKeyService);
            this.onDidChangeSelection(e => this.bb());
            this.onDidChangeFocus(() => this.bb());
            this.onDidOpen(async (e) => {
                const instance = e.element;
                if (!instance) {
                    return;
                }
                this.X.setActiveInstance(instance);
                if (!e.editorOptions.preserveFocus) {
                    await instance.focusWhenReady();
                }
            });
            if (!this.R) {
                this.R = this.y.add(instantiationService.createInstance(TabDecorationsProvider));
                this.y.add(decorationsService.registerDecorationsProvider(this.R));
            }
            this.refresh();
        }
        ab() {
            return this.V.getValue("terminal.integrated.tabs.focusMode" /* TerminalSettingId.TabsFocusMode */);
        }
        refresh(cancelEditing = true) {
            if (cancelEditing && this.W.isEditable(undefined)) {
                this.domFocus();
            }
            this.splice(0, this.length, this.X.instances.slice());
        }
        focusHover() {
            const instance = this.getSelectedElements()[0];
            if (!instance) {
                return;
            }
            this.Z.showHover({
                ...(0, terminalTooltip_1.$SVb)(instance),
                target: this.getHTMLElement(),
                trapFocus: true
            }, true);
        }
        bb() {
            this.S.set(this.getSelectedElements().length === 1);
            const instance = this.getFocusedElements();
            this.U.set(instance.length > 0 && this.X.instanceIsSplit(instance[0]));
        }
    };
    exports.$VVb = $VVb;
    exports.$VVb = $VVb = __decorate([
        __param(1, contextkey_1.$3i),
        __param(2, listService_1.$03),
        __param(3, themeService_1.$gv),
        __param(4, configuration_1.$8h),
        __param(5, terminal_1.$Mib),
        __param(6, terminal_1.$Oib),
        __param(7, instantiation_1.$Ah),
        __param(8, decorations_1.$Gcb),
        __param(9, themeService_1.$gv),
        __param(10, lifecycle_2.$7y),
        __param(11, hover_1.$zib)
    ], $VVb);
    let TerminalTabsRenderer = class TerminalTabsRenderer {
        constructor(a, b, c, d, f, g, h, j, k, l, m, n) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.k = k;
            this.l = l;
            this.m = m;
            this.n = n;
            this.templateId = 'terminal.tabs';
        }
        renderTemplate(container) {
            const element = DOM.$0O(container, $('.terminal-tabs-entry'));
            const context = {};
            const label = this.b.create(element, {
                supportHighlights: true,
                supportDescriptionHighlights: true,
                supportIcons: true,
                hoverDelegate: {
                    delay: this.j.getValue('workbench.hover.delay'),
                    showHover: options => {
                        return this.h.showHover({
                            ...options,
                            actions: context.hoverActions,
                            hideOnHover: true
                        });
                    }
                }
            });
            const actionsContainer = DOM.$0O(label.element, $('.actions'));
            const actionBar = new actionbar_1.$1P(actionsContainer, {
                actionViewItemProvider: action => action instanceof actions_1.$Vu
                    ? this.d.createInstance(menuEntryActionViewItem_1.$C3, action, undefined)
                    : undefined
            });
            return {
                element,
                label,
                actionBar,
                context,
                elementDisposables: new lifecycle_1.$jc(),
            };
        }
        shouldHideText() {
            return this.a ? this.a.clientWidth < 63 /* TerminalTabsListSizes.MidpointViewWidth */ : false;
        }
        shouldHideActionBar() {
            return this.a ? this.a.clientWidth <= 105 /* TerminalTabsListSizes.ActionbarMinimumWidth */ : false;
        }
        renderElement(instance, index, template) {
            const hasText = !this.shouldHideText();
            const group = this.g.getGroupForInstance(instance);
            if (!group) {
                throw new Error(`Could not find group for instance "${instance.instanceId}"`);
            }
            template.element.classList.toggle('has-text', hasText);
            template.element.classList.toggle('is-active', this.g.activeInstance === instance);
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
            const hoverInfo = (0, terminalTooltip_1.$SVb)(instance);
            template.context.hoverActions = hoverInfo.actions;
            const iconId = this.d.invokeFunction(terminalIcon_1.$Yib, instance);
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
            template.elementDisposables.add(DOM.$nO(template.element, DOM.$3O.AUXCLICK, e => {
                e.stopImmediatePropagation();
                if (e.button === 1 /*middle*/) {
                    this.f.safeDisposeTerminal(instance);
                }
            }));
            const extraClasses = [];
            const colorClass = (0, terminalIcon_1.$Tib)(instance);
            if (colorClass) {
                extraClasses.push(colorClass);
            }
            const uriClasses = (0, terminalIcon_1.$Xib)(instance, this.m.getColorTheme().type);
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
            const editableData = this.f.getEditableData(instance);
            template.label.element.classList.toggle('editable-tab', !!editableData);
            if (editableData) {
                template.elementDisposables.add(this.o(template.label.element.querySelector('.monaco-icon-label-container'), instance, editableData));
                template.actionBar.clear();
            }
        }
        o(container, instance, editableData) {
            const value = instance.title || '';
            const inputBox = new inputBox_1.$sR(container, this.n, {
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
                ariaLabel: (0, nls_1.localize)(0, null),
                inputBoxStyles: defaultStyles_1.$s2
            });
            inputBox.element.style.height = '22px';
            inputBox.value = value;
            inputBox.focus();
            inputBox.select({ start: 0, end: value.length });
            const done = (0, functional_1.$bb)((success, finishEditing) => {
                inputBox.element.style.display = 'none';
                const value = inputBox.value;
                (0, lifecycle_1.$fc)(toDispose);
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
                DOM.$oO(inputBox.inputElement, DOM.$3O.KEY_DOWN, (e) => {
                    e.stopPropagation();
                    if (e.equals(3 /* KeyCode.Enter */)) {
                        done(inputBox.isInputValid(), true);
                    }
                    else if (e.equals(9 /* KeyCode.Escape */)) {
                        done(false, true);
                    }
                }),
                DOM.$oO(inputBox.inputElement, DOM.$3O.KEY_UP, (e) => {
                    showInputBoxNotification();
                }),
                DOM.$nO(inputBox.inputElement, DOM.$3O.BLUR, () => {
                    done(inputBox.isInputValid(), true);
                })
            ];
            return (0, lifecycle_1.$ic)(() => {
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
                new actions_2.$gi("workbench.action.terminal.splitActiveTab" /* TerminalCommandId.SplitActiveTab */, terminalStrings_1.$pVb.split.short, themables_1.ThemeIcon.asClassName(codicons_1.$Pj.splitHorizontal), true, async () => {
                    this.q(instance, async (e) => {
                        this.f.createTerminal({ location: { parentTerminal: e } });
                    });
                }),
                new actions_2.$gi("workbench.action.terminal.killActiveTab" /* TerminalCommandId.KillActiveTab */, terminalStrings_1.$pVb.kill.short, themables_1.ThemeIcon.asClassName(codicons_1.$Pj.trashcan), true, async () => {
                    this.q(instance, e => this.f.safeDisposeTerminal(e));
                })
            ];
            // TODO: Cache these in a way that will use the correct instance
            template.actionBar.clear();
            for (const action of actions) {
                template.actionBar.push(action, { icon: true, label: false, keybinding: this.k.lookupKeybinding(action.id)?.getLabel() });
            }
        }
        q(instance, callback) {
            const selection = this.c();
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
            this.g.focusTabs();
            this.l.lastFocusedList?.focusNext();
        }
    };
    TerminalTabsRenderer = __decorate([
        __param(3, instantiation_1.$Ah),
        __param(4, terminal_1.$Mib),
        __param(5, terminal_1.$Oib),
        __param(6, hover_1.$zib),
        __param(7, configuration_1.$8h),
        __param(8, keybinding_1.$2D),
        __param(9, listService_1.$03),
        __param(10, themeService_1.$gv),
        __param(11, contextView_1.$VZ)
    ], TerminalTabsRenderer);
    let TerminalTabsAccessibilityProvider = class TerminalTabsAccessibilityProvider {
        constructor(a) {
            this.a = a;
        }
        getWidgetAriaLabel() {
            return (0, nls_1.localize)(1, null);
        }
        getAriaLabel(instance) {
            let ariaLabel = '';
            const tab = this.a.getGroupForInstance(instance);
            if (tab && tab.terminalInstances?.length > 1) {
                const terminalIndex = tab.terminalInstances.indexOf(instance);
                ariaLabel = (0, nls_1.localize)(2, null, instance.instanceId, instance.title, terminalIndex + 1, tab.terminalInstances.length);








            }
            else {
                ariaLabel = (0, nls_1.localize)(3, null, instance.instanceId, instance.title);






            }
            return ariaLabel;
        }
    };
    TerminalTabsAccessibilityProvider = __decorate([
        __param(0, terminal_1.$Oib)
    ], TerminalTabsAccessibilityProvider);
    let TerminalTabsDragAndDrop = class TerminalTabsDragAndDrop {
        constructor(d, f) {
            this.d = d;
            this.f = f;
            this.b = lifecycle_1.$kc.None;
            this.c = this.d.getPrimaryBackend();
        }
        getDragURI(instance) {
            if (this.d.getEditingTerminal()?.instanceId === instance.instanceId) {
                return null;
            }
            return instance.resource.toString();
        }
        getDragLabel(elements, originalEvent) {
            return elements.length === 1 ? elements[0].title : undefined;
        }
        onDragLeave() {
            this.a = undefined;
            this.b.dispose();
            this.b = lifecycle_1.$kc.None;
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
            if (data instanceof listView_1.$lQ) {
                if (!(0, dnd_2.$06)(originalEvent, dnd_1.$CP.FILES, dnd_1.$CP.RESOURCES, "Terminals" /* TerminalDataTransfers.Terminals */, dnd_2.$56.FILES)) {
                    return false;
                }
            }
            const didChangeAutoFocusInstance = this.a !== targetInstance;
            if (didChangeAutoFocusInstance) {
                this.b.dispose();
                this.a = targetInstance;
            }
            if (!targetInstance && !(0, dnd_2.$06)(originalEvent, "Terminals" /* TerminalDataTransfers.Terminals */)) {
                return data instanceof listView_1.$jQ;
            }
            if (didChangeAutoFocusInstance && targetInstance) {
                this.b = (0, async_1.$Ig)(() => {
                    this.d.setActiveInstance(targetInstance);
                    this.a = undefined;
                }, 500);
            }
            return {
                feedback: targetIndex ? [targetIndex] : undefined,
                accept: true,
                effect: 1 /* ListDragOverEffect.Move */
            };
        }
        async drop(data, targetInstance, targetIndex, originalEvent) {
            this.b.dispose();
            this.a = undefined;
            let sourceInstances;
            const promises = [];
            const resources = (0, terminalUri_1.$QVb)(originalEvent);
            if (resources) {
                for (const uri of resources) {
                    const instance = this.d.getInstanceFromResource(uri);
                    if (instance) {
                        sourceInstances = [instance];
                        this.d.moveToTerminalView(instance);
                    }
                    else if (this.c) {
                        const terminalIdentifier = (0, terminalUri_1.$OVb)(uri);
                        if (terminalIdentifier.instanceId) {
                            promises.push(this.c.requestDetachInstance(terminalIdentifier.workspaceId, terminalIdentifier.instanceId));
                        }
                    }
                }
            }
            if (promises.length) {
                let processes = await Promise.all(promises);
                processes = processes.filter(p => p !== undefined);
                let lastInstance;
                for (const attachPersistentProcess of processes) {
                    lastInstance = await this.d.createTerminal({ config: { attachPersistentProcess } });
                }
                if (lastInstance) {
                    this.d.setActiveInstance(lastInstance);
                }
                return;
            }
            if (sourceInstances === undefined) {
                if (!(data instanceof listView_1.$jQ)) {
                    this.g(targetInstance, originalEvent);
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
                this.f.moveGroupToEnd(sourceInstances[0]);
                this.d.setActiveInstance(sourceInstances[0]);
                return;
            }
            let focused = false;
            for (const instance of sourceInstances) {
                this.f.moveGroup(instance, targetInstance);
                if (!focused) {
                    this.d.setActiveInstance(instance);
                    focused = true;
                }
            }
        }
        async g(instance, e) {
            if (!instance || !e.dataTransfer) {
                return;
            }
            // Check if files were dragged from the tree explorer
            let resource;
            const rawResources = e.dataTransfer.getData(dnd_1.$CP.RESOURCES);
            if (rawResources) {
                resource = uri_1.URI.parse(JSON.parse(rawResources)[0]);
            }
            const rawCodeFiles = e.dataTransfer.getData(dnd_2.$56.FILES);
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
            this.d.setActiveInstance(instance);
            instance.focus();
            await instance.sendPath(resource, false);
        }
    };
    TerminalTabsDragAndDrop = __decorate([
        __param(0, terminal_1.$Mib),
        __param(1, terminal_1.$Oib)
    ], TerminalTabsDragAndDrop);
    let TabDecorationsProvider = class TabDecorationsProvider extends lifecycle_1.$kc {
        constructor(b) {
            super();
            this.b = b;
            this.label = (0, nls_1.localize)(4, null);
            this.a = this.B(new event_1.$fd());
            this.onDidChange = this.a.event;
            this.B(this.b.onDidChangeInstancePrimaryStatus(e => this.a.fire([e.resource])));
        }
        provideDecorations(resource) {
            if (resource.scheme !== network_1.Schemas.vscodeTerminal) {
                return undefined;
            }
            const instance = this.b.getInstanceFromResource(resource);
            if (!instance) {
                return undefined;
            }
            const primaryStatus = instance?.statusList?.primary;
            if (!primaryStatus?.icon) {
                return undefined;
            }
            return {
                color: (0, terminalStatusList_1.$mfb)(primaryStatus.severity),
                letter: primaryStatus.icon,
                tooltip: primaryStatus.tooltip
            };
        }
    };
    TabDecorationsProvider = __decorate([
        __param(0, terminal_1.$Mib)
    ], TabDecorationsProvider);
});
//# sourceMappingURL=terminalTabsList.js.map