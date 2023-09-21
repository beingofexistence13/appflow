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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/codicons", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/nls!vs/workbench/contrib/notebook/browser/viewParts/notebookKernelQuickPickStrategy", "vs/platform/commands/common/commands", "vs/platform/label/common/label", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/platform/quickinput/common/quickInput", "vs/base/common/themables", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/notebookIcons", "vs/workbench/contrib/notebook/common/notebookKernelService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/base/common/uri", "vs/platform/opener/common/opener", "vs/workbench/contrib/notebook/browser/controller/coreActions"], function (require, exports, arrays_1, async_1, cancellation_1, codicons_1, event_1, lifecycle_1, strings_1, nls_1, commands_1, label_1, log_1, productService_1, quickInput_1, themables_1, extensions_1, notebookBrowser_1, notebookIcons_1, notebookKernelService_1, extensions_2, panecomposite_1, uri_1, opener_1, coreActions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$0qb = void 0;
    function isKernelPick(item) {
        return 'kernel' in item;
    }
    function isGroupedKernelsPick(item) {
        return 'kernels' in item;
    }
    function isSourcePick(item) {
        return 'action' in item;
    }
    function isInstallExtensionPick(item) {
        return item.id === 'installSuggested' && 'extensionIds' in item;
    }
    function isSearchMarketplacePick(item) {
        return item.id === 'install';
    }
    function isKernelSourceQuickPickItem(item) {
        return 'command' in item;
    }
    function supportAutoRun(item) {
        return 'autoRun' in item && !!item.autoRun;
    }
    const KERNEL_PICKER_UPDATE_DEBOUNCE = 200;
    function toKernelQuickPick(kernel, selected) {
        const res = {
            kernel,
            picked: kernel.id === selected?.id,
            label: kernel.label,
            description: kernel.description,
            detail: kernel.detail
        };
        if (kernel.id === selected?.id) {
            if (!res.description) {
                res.description = (0, nls_1.localize)(0, null);
            }
            else {
                res.description = (0, nls_1.localize)(1, null, res.description);
            }
        }
        return res;
    }
    class KernelPickerStrategyBase {
        constructor(c, d, f, g, h, i, j, l, m) {
            this.c = c;
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
            this.j = j;
            this.l = l;
            this.m = m;
        }
        async showQuickPick(editor, wantedId, skipAutoRun) {
            const notebook = editor.textModel;
            const scopedContextKeyService = editor.scopedContextKeyService;
            const matchResult = this.n(notebook);
            const { selected, all } = matchResult;
            let newKernel;
            if (wantedId) {
                for (const candidate of all) {
                    if (candidate.id === wantedId) {
                        newKernel = candidate;
                        break;
                    }
                }
                if (!newKernel) {
                    this.h.warn(`wanted kernel DOES NOT EXIST, wanted: ${wantedId}, all: ${all.map(k => k.id)}`);
                    return false;
                }
            }
            if (newKernel) {
                this.q(notebook, newKernel);
                return true;
            }
            const quickPick = this.f.createQuickPick();
            const quickPickItems = this.o(notebook, matchResult, this.c, scopedContextKeyService);
            if (quickPickItems.length === 1 && supportAutoRun(quickPickItems[0]) && !skipAutoRun) {
                return await this.p(editor, quickPickItems[0], quickPickItems);
            }
            quickPick.items = quickPickItems;
            quickPick.canSelectMany = false;
            quickPick.placeholder = selected
                ? (0, nls_1.localize)(2, null, this.g.getUriLabel(notebook.uri, { relative: true }))
                : (0, nls_1.localize)(3, null, this.g.getUriLabel(notebook.uri, { relative: true }));
            quickPick.busy = this.c.getKernelDetectionTasks(notebook).length > 0;
            const kernelDetectionTaskListener = this.c.onDidChangeKernelDetectionTasks(() => {
                quickPick.busy = this.c.getKernelDetectionTasks(notebook).length > 0;
            });
            // run extension recommendataion task if quickPickItems is empty
            const extensionRecommendataionPromise = quickPickItems.length === 0
                ? (0, async_1.$ug)(token => this.s(notebook, quickPick, this.j, token))
                : undefined;
            const kernelChangeEventListener = event_1.Event.debounce(event_1.Event.any(this.c.onDidChangeSourceActions, this.c.onDidAddKernel, this.c.onDidRemoveKernel, this.c.onDidChangeNotebookAffinity), (last, _current) => last, KERNEL_PICKER_UPDATE_DEBOUNCE)(async () => {
                // reset quick pick progress
                quickPick.busy = false;
                extensionRecommendataionPromise?.cancel();
                const currentActiveItems = quickPick.activeItems;
                const matchResult = this.n(notebook);
                const quickPickItems = this.o(notebook, matchResult, this.c, scopedContextKeyService);
                quickPick.keepScrollPosition = true;
                // recalcuate active items
                const activeItems = [];
                for (const item of currentActiveItems) {
                    if (isKernelPick(item)) {
                        const kernelId = item.kernel.id;
                        const sameItem = quickPickItems.find(pi => isKernelPick(pi) && pi.kernel.id === kernelId);
                        if (sameItem) {
                            activeItems.push(sameItem);
                        }
                    }
                    else if (isSourcePick(item)) {
                        const sameItem = quickPickItems.find(pi => isSourcePick(pi) && pi.action.action.id === item.action.action.id);
                        if (sameItem) {
                            activeItems.push(sameItem);
                        }
                    }
                }
                quickPick.items = quickPickItems;
                quickPick.activeItems = activeItems;
            }, this);
            const pick = await new Promise((resolve, reject) => {
                quickPick.onDidAccept(() => {
                    const item = quickPick.selectedItems[0];
                    if (item) {
                        resolve({ selected: item, items: quickPick.items });
                    }
                    else {
                        resolve({ selected: undefined, items: quickPick.items });
                    }
                    quickPick.hide();
                });
                quickPick.onDidHide(() => {
                    kernelDetectionTaskListener.dispose();
                    kernelChangeEventListener.dispose();
                    quickPick.dispose();
                    resolve({ selected: undefined, items: quickPick.items });
                });
                quickPick.show();
            });
            if (pick.selected) {
                return await this.p(editor, pick.selected, pick.items);
            }
            return false;
        }
        n(notebook) {
            return this.c.getMatchingKernel(notebook);
        }
        async p(editor, pick, quickPickItems) {
            if (isKernelPick(pick)) {
                const newKernel = pick.kernel;
                this.q(editor.textModel, newKernel);
                return true;
            }
            // actions
            if (isSearchMarketplacePick(pick)) {
                await this.r(this.i, this.j, this.l, editor.textModel.viewType, []);
                // suggestedExtension must be defined for this option to be shown, but still check to make TS happy
            }
            else if (isInstallExtensionPick(pick)) {
                await this.r(this.i, this.j, this.l, editor.textModel.viewType, pick.extensionIds, this.d.quality !== 'stable');
            }
            else if (isSourcePick(pick)) {
                // selected explicilty, it should trigger the execution?
                pick.action.runAction();
            }
            return true;
        }
        q(notebook, kernel) {
            this.c.selectKernelForNotebook(kernel, notebook);
        }
        async r(paneCompositePartService, extensionWorkbenchService, extensionService, viewType, extIds, isInsiders) {
            // If extension id is provided attempt to install the extension as the user has requested the suggested ones be installed
            const extensionsToInstall = [];
            const extensionsToEnable = [];
            for (const extId of extIds) {
                const extension = (await extensionWorkbenchService.getExtensions([{ id: extId }], cancellation_1.CancellationToken.None))[0];
                if (extension.enablementState === 6 /* EnablementState.DisabledGlobally */ || extension.enablementState === 7 /* EnablementState.DisabledWorkspace */ || extension.enablementState === 2 /* EnablementState.DisabledByEnvironment */) {
                    extensionsToEnable.push(extension);
                }
                else {
                    const canInstall = await extensionWorkbenchService.canInstall(extension);
                    if (canInstall) {
                        extensionsToInstall.push(extension);
                    }
                }
            }
            if (extensionsToInstall.length || extensionsToEnable.length) {
                await Promise.all([...extensionsToInstall.map(async (extension) => {
                        await extensionWorkbenchService.install(extension, {
                            installPreReleaseVersion: isInsiders ?? false,
                            context: { skipWalkthrough: true }
                        }, 15 /* ProgressLocation.Notification */);
                    }), ...extensionsToEnable.map(async (extension) => {
                        switch (extension.enablementState) {
                            case 7 /* EnablementState.DisabledWorkspace */:
                                await extensionWorkbenchService.setEnablement([extension], 9 /* EnablementState.EnabledWorkspace */);
                                return;
                            case 6 /* EnablementState.DisabledGlobally */:
                                await extensionWorkbenchService.setEnablement([extension], 8 /* EnablementState.EnabledGlobally */);
                                return;
                            case 2 /* EnablementState.DisabledByEnvironment */:
                                await extensionWorkbenchService.setEnablement([extension], 3 /* EnablementState.EnabledByEnvironment */);
                                return;
                            default:
                                break;
                        }
                    })]);
                await extensionService.activateByEvent(`onNotebook:${viewType}`);
                return;
            }
            const viewlet = await paneCompositePartService.openPaneComposite(extensions_1.$Ofb, 0 /* ViewContainerLocation.Sidebar */, true);
            const view = viewlet?.getViewPaneContainer();
            const pascalCased = viewType.split(/[^a-z0-9]/ig).map(strings_1.$bf).join('');
            view?.search(`@tag:notebookKernel${pascalCased}`);
        }
        async s(notebookTextModel, quickPick, extensionWorkbenchService, token) {
            quickPick.busy = true;
            const newQuickPickItems = await this.t(notebookTextModel, extensionWorkbenchService);
            quickPick.busy = false;
            if (token.isCancellationRequested) {
                return;
            }
            if (newQuickPickItems && quickPick.items.length === 0) {
                quickPick.items = newQuickPickItems;
            }
        }
        async t(notebookTextModel, extensionWorkbenchService) {
            const quickPickItems = [];
            const language = this.u(notebookTextModel);
            const suggestedExtension = language ? this.v(notebookTextModel.viewType, language) : undefined;
            if (suggestedExtension) {
                await extensionWorkbenchService.queryLocal();
                const extensions = extensionWorkbenchService.installed.filter(e => (e.enablementState === 3 /* EnablementState.EnabledByEnvironment */ || e.enablementState === 8 /* EnablementState.EnabledGlobally */ || e.enablementState === 9 /* EnablementState.EnabledWorkspace */)
                    && suggestedExtension.extensionIds.includes(e.identifier.id));
                if (extensions.length === suggestedExtension.extensionIds.length) {
                    // it's installed but might be detecting kernels
                    return undefined;
                }
                // We have a suggested kernel, show an option to install it
                quickPickItems.push({
                    id: 'installSuggested',
                    description: suggestedExtension.displayName ?? suggestedExtension.extensionIds.join(', '),
                    label: `$(${codicons_1.$Pj.lightbulb.id}) ` + (0, nls_1.localize)(4, null),
                    extensionIds: suggestedExtension.extensionIds
                });
            }
            // there is no kernel, show the install from marketplace
            quickPickItems.push({
                id: 'install',
                label: (0, nls_1.localize)(5, null),
            });
            return quickPickItems;
        }
        /**
         * Examine the most common language in the notebook
         * @param notebookTextModel The notebook text model
         * @returns What the suggested language is for the notebook. Used for kernal installing
         */
        u(notebookTextModel) {
            const metaData = notebookTextModel.metadata;
            let suggestedKernelLanguage = metaData.custom?.metadata?.language_info?.name;
            // TODO how do we suggest multi language notebooks?
            if (!suggestedKernelLanguage) {
                const cellLanguages = notebookTextModel.cells.map(cell => cell.language).filter(language => language !== 'markdown');
                // Check if cell languages is all the same
                if (cellLanguages.length > 1) {
                    const firstLanguage = cellLanguages[0];
                    if (cellLanguages.every(language => language === firstLanguage)) {
                        suggestedKernelLanguage = firstLanguage;
                    }
                }
            }
            return suggestedKernelLanguage;
        }
        /**
         * Given a language and notebook view type suggest a kernel for installation
         * @param language The language to find a suggested kernel extension for
         * @returns A recommednation object for the recommended extension, else undefined
         */
        v(viewType, language) {
            const recommendation = notebookBrowser_1.$Ybb.get(viewType)?.get(language);
            return recommendation;
        }
    }
    let $0qb = class $0qb extends KernelPickerStrategyBase {
        constructor(_notebookKernelService, _productService, _quickInputService, _labelService, _logService, _paneCompositePartService, _extensionWorkbenchService, _extensionService, _commandService, w, x) {
            super(_notebookKernelService, _productService, _quickInputService, _labelService, _logService, _paneCompositePartService, _extensionWorkbenchService, _extensionService, _commandService);
            this.w = w;
            this.x = x;
        }
        o(notebookTextModel, matchResult, notebookKernelService, scopedContextKeyService) {
            const quickPickItems = [];
            if (matchResult.selected) {
                const kernelItem = toKernelQuickPick(matchResult.selected, matchResult.selected);
                quickPickItems.push(kernelItem);
            }
            matchResult.suggestions.filter(kernel => kernel.id !== matchResult.selected?.id).map(kernel => toKernelQuickPick(kernel, matchResult.selected))
                .forEach(kernel => {
                quickPickItems.push(kernel);
            });
            const shouldAutoRun = quickPickItems.length === 0;
            if (quickPickItems.length > 0) {
                quickPickItems.push({
                    type: 'separator'
                });
            }
            // select another kernel quick pick
            quickPickItems.push({
                id: 'selectAnother',
                label: (0, nls_1.localize)(6, null),
                autoRun: shouldAutoRun
            });
            return quickPickItems;
        }
        q(notebook, kernel) {
            const currentInfo = this.c.getMatchingKernel(notebook);
            if (currentInfo.selected) {
                // there is already a selected kernel
                this.w.addMostRecentKernel(currentInfo.selected);
            }
            super.q(notebook, kernel);
            this.w.addMostRecentKernel(kernel);
        }
        n(notebook) {
            const { selected, all } = this.w.getKernels(notebook);
            const matchingResult = this.c.getMatchingKernel(notebook);
            return {
                selected: selected,
                all: matchingResult.all,
                suggestions: all,
                hidden: []
            };
        }
        async p(editor, pick, items) {
            if (pick.id === 'selectAnother') {
                return this.C(editor, items.length === 1 && items[0] === pick);
            }
            return super.p(editor, pick, items);
        }
        async C(editor, kernelListEmpty) {
            const notebook = editor.textModel;
            const disposables = new lifecycle_1.$jc();
            const quickPick = this.f.createQuickPick();
            const quickPickItem = await new Promise(resolve => {
                // select from kernel sources
                quickPick.title = kernelListEmpty ? (0, nls_1.localize)(7, null) : (0, nls_1.localize)(8, null);
                quickPick.placeholder = (0, nls_1.localize)(9, null);
                quickPick.busy = true;
                quickPick.buttons = [this.f.backButton];
                quickPick.show();
                disposables.add(quickPick.onDidTriggerButton(button => {
                    if (button === this.f.backButton) {
                        resolve(button);
                    }
                }));
                quickPick.onDidTriggerItemButton(async (e) => {
                    if (isKernelSourceQuickPickItem(e.item) && e.item.documentation !== undefined) {
                        const uri = uri_1.URI.isUri(e.item.documentation) ? uri_1.URI.parse(e.item.documentation) : await this.m.executeCommand(e.item.documentation);
                        void this.x.open(uri, { openExternal: true });
                    }
                });
                disposables.add(quickPick.onDidAccept(async () => {
                    resolve(quickPick.selectedItems[0]);
                }));
                disposables.add(quickPick.onDidHide(() => {
                    resolve(undefined);
                }));
                this.D(editor).then(quickPickItems => {
                    quickPick.items = quickPickItems;
                    if (quickPick.items.length > 0) {
                        quickPick.busy = false;
                    }
                });
                disposables.add(event_1.Event.debounce(event_1.Event.any(this.c.onDidChangeSourceActions, this.c.onDidAddKernel, this.c.onDidRemoveKernel), (last, _current) => last, KERNEL_PICKER_UPDATE_DEBOUNCE)(async () => {
                    quickPick.busy = true;
                    const quickPickItems = await this.D(editor);
                    quickPick.items = quickPickItems;
                    quickPick.busy = false;
                }));
            });
            quickPick.hide();
            disposables.dispose();
            if (quickPickItem === this.f.backButton) {
                return this.showQuickPick(editor, undefined, true);
            }
            if (quickPickItem) {
                const selectedKernelPickItem = quickPickItem;
                if (isKernelSourceQuickPickItem(selectedKernelPickItem)) {
                    try {
                        const selectedKernelId = await this.F(notebook, selectedKernelPickItem.command);
                        if (selectedKernelId) {
                            const { all } = await this.n(notebook);
                            const kernel = all.find(kernel => kernel.id === `ms-toolsai.jupyter/${selectedKernelId}`);
                            if (kernel) {
                                await this.q(notebook, kernel);
                                return true;
                            }
                            return true;
                        }
                        else {
                            return this.C(editor, false);
                        }
                    }
                    catch (ex) {
                        return false;
                    }
                }
                else if (isKernelPick(selectedKernelPickItem)) {
                    await this.q(notebook, selectedKernelPickItem.kernel);
                    return true;
                }
                else if (isGroupedKernelsPick(selectedKernelPickItem)) {
                    await this.E(notebook, selectedKernelPickItem.source, selectedKernelPickItem.kernels);
                    return true;
                }
                else if (isSourcePick(selectedKernelPickItem)) {
                    // selected explicilty, it should trigger the execution?
                    try {
                        await selectedKernelPickItem.action.runAction();
                        return true;
                    }
                    catch (ex) {
                        return false;
                    }
                }
                else if (isSearchMarketplacePick(selectedKernelPickItem)) {
                    await this.r(this.i, this.j, this.l, editor.textModel.viewType, []);
                    return true;
                }
                else if (isInstallExtensionPick(selectedKernelPickItem)) {
                    await this.r(this.i, this.j, this.l, editor.textModel.viewType, selectedKernelPickItem.extensionIds, this.d.quality !== 'stable');
                    return this.C(editor, false);
                }
            }
            return false;
        }
        async D(editor) {
            const notebook = editor.textModel;
            const sourceActionCommands = this.c.getSourceActions(notebook, editor.scopedContextKeyService);
            const actions = await this.c.getKernelSourceActions2(notebook);
            const matchResult = this.n(notebook);
            if (sourceActionCommands.length === 0 && matchResult.all.length === 0 && actions.length === 0) {
                return await this.t(notebook, this.j) ?? [];
            }
            const others = matchResult.all.filter(item => item.extension.value !== notebookBrowser_1.$Wbb);
            const quickPickItems = [];
            // group controllers by extension
            for (const group of (0, arrays_1.$xb)(others, (a, b) => a.extension.value === b.extension.value ? 0 : 1)) {
                const extension = this.l.extensions.find(extension => extension.identifier.value === group[0].extension.value);
                const source = extension?.displayName ?? extension?.description ?? group[0].extension.value;
                if (group.length > 1) {
                    quickPickItems.push({
                        label: source,
                        kernels: group
                    });
                }
                else {
                    quickPickItems.push({
                        label: group[0].label,
                        kernel: group[0]
                    });
                }
            }
            const validActions = actions.filter(action => action.command);
            quickPickItems.push(...validActions.map(action => {
                const buttons = action.documentation ? [{
                        iconClass: themables_1.ThemeIcon.asClassName(codicons_1.$Pj.info),
                        tooltip: (0, nls_1.localize)(10, null),
                    }] : [];
                return {
                    id: typeof action.command === 'string' ? action.command : action.command.id,
                    label: action.label,
                    description: action.description,
                    command: action.command,
                    documentation: action.documentation,
                    buttons
                };
            }));
            for (const sourceAction of sourceActionCommands) {
                const res = {
                    action: sourceAction,
                    picked: false,
                    label: sourceAction.action.label,
                    tooltip: sourceAction.action.tooltip
                };
                quickPickItems.push(res);
            }
            return quickPickItems;
        }
        async E(notebook, source, kernels) {
            const quickPickItems = kernels.map(kernel => toKernelQuickPick(kernel, undefined));
            const quickPick = this.f.createQuickPick();
            quickPick.items = quickPickItems;
            quickPick.canSelectMany = false;
            quickPick.title = (0, nls_1.localize)(11, null, source);
            quickPick.onDidAccept(async () => {
                if (quickPick.selectedItems && quickPick.selectedItems.length > 0 && isKernelPick(quickPick.selectedItems[0])) {
                    await this.q(notebook, quickPick.selectedItems[0].kernel);
                }
                quickPick.hide();
                quickPick.dispose();
            });
            quickPick.onDidHide(() => {
                quickPick.dispose();
            });
            quickPick.show();
        }
        async F(notebook, command) {
            const id = typeof command === 'string' ? command : command.id;
            const args = typeof command === 'string' ? [] : command.arguments ?? [];
            if (typeof command === 'string' || !command.arguments || !Array.isArray(command.arguments) || command.arguments.length === 0) {
                args.unshift({
                    uri: notebook.uri,
                    $mid: 14 /* MarshalledId.NotebookActionContext */
                });
            }
            if (typeof command === 'string') {
                return this.m.executeCommand(id);
            }
            else {
                return this.m.executeCommand(id, ...args);
            }
        }
        static updateKernelStatusAction(notebook, action, notebookKernelService, notebookKernelHistoryService) {
            const detectionTasks = notebookKernelService.getKernelDetectionTasks(notebook);
            if (detectionTasks.length) {
                const info = notebookKernelService.getMatchingKernel(notebook);
                action.enabled = true;
                action.class = themables_1.ThemeIcon.asClassName(themables_1.ThemeIcon.modify(notebookIcons_1.$Jpb, 'spin'));
                if (info.selected) {
                    action.label = info.selected.label;
                    const kernelInfo = info.selected.description ?? info.selected.detail;
                    action.tooltip = kernelInfo
                        ? (0, nls_1.localize)(12, null, kernelInfo)
                        : (0, nls_1.localize)(13, null);
                }
                else {
                    action.label = (0, nls_1.localize)(14, null);
                }
                return;
            }
            const runningActions = notebookKernelService.getRunningSourceActions(notebook);
            const updateActionFromSourceAction = (sourceAction, running) => {
                const sAction = sourceAction.action;
                action.class = running ? themables_1.ThemeIcon.asClassName(themables_1.ThemeIcon.modify(notebookIcons_1.$Jpb, 'spin')) : themables_1.ThemeIcon.asClassName(notebookIcons_1.$tpb);
                action.label = sAction.label;
                action.enabled = true;
            };
            if (runningActions.length) {
                return updateActionFromSourceAction(runningActions[0] /** TODO handle multiple actions state */, true);
            }
            const { selected } = notebookKernelHistoryService.getKernels(notebook);
            if (selected) {
                action.label = selected.label;
                action.class = themables_1.ThemeIcon.asClassName(notebookIcons_1.$tpb);
                action.tooltip = selected.description ?? selected.detail ?? '';
            }
            else {
                action.label = (0, nls_1.localize)(15, null);
                action.class = themables_1.ThemeIcon.asClassName(notebookIcons_1.$tpb);
                action.tooltip = '';
            }
        }
        static async resolveKernel(notebook, notebookKernelService, notebookKernelHistoryService, commandService) {
            const alreadySelected = notebookKernelHistoryService.getKernels(notebook);
            if (alreadySelected.selected) {
                return alreadySelected.selected;
            }
            await commandService.executeCommand(coreActions_1.$6ob);
            const { selected } = notebookKernelHistoryService.getKernels(notebook);
            return selected;
        }
    };
    exports.$0qb = $0qb;
    exports.$0qb = $0qb = __decorate([
        __param(0, notebookKernelService_1.$Bbb),
        __param(1, productService_1.$kj),
        __param(2, quickInput_1.$Gq),
        __param(3, label_1.$Vz),
        __param(4, log_1.$5i),
        __param(5, panecomposite_1.$Yeb),
        __param(6, extensions_1.$Pfb),
        __param(7, extensions_2.$MF),
        __param(8, commands_1.$Fr),
        __param(9, notebookKernelService_1.$Cbb),
        __param(10, opener_1.$NT)
    ], $0qb);
});
//# sourceMappingURL=notebookKernelQuickPickStrategy.js.map