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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/codicons", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/nls", "vs/platform/commands/common/commands", "vs/platform/label/common/label", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/platform/quickinput/common/quickInput", "vs/base/common/themables", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/notebookIcons", "vs/workbench/contrib/notebook/common/notebookKernelService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/base/common/uri", "vs/platform/opener/common/opener", "vs/workbench/contrib/notebook/browser/controller/coreActions"], function (require, exports, arrays_1, async_1, cancellation_1, codicons_1, event_1, lifecycle_1, strings_1, nls_1, commands_1, label_1, log_1, productService_1, quickInput_1, themables_1, extensions_1, notebookBrowser_1, notebookIcons_1, notebookKernelService_1, extensions_2, panecomposite_1, uri_1, opener_1, coreActions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.KernelPickerMRUStrategy = void 0;
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
                res.description = (0, nls_1.localize)('current1', "Currently Selected");
            }
            else {
                res.description = (0, nls_1.localize)('current2', "{0} - Currently Selected", res.description);
            }
        }
        return res;
    }
    class KernelPickerStrategyBase {
        constructor(_notebookKernelService, _productService, _quickInputService, _labelService, _logService, _paneCompositePartService, _extensionWorkbenchService, _extensionService, _commandService) {
            this._notebookKernelService = _notebookKernelService;
            this._productService = _productService;
            this._quickInputService = _quickInputService;
            this._labelService = _labelService;
            this._logService = _logService;
            this._paneCompositePartService = _paneCompositePartService;
            this._extensionWorkbenchService = _extensionWorkbenchService;
            this._extensionService = _extensionService;
            this._commandService = _commandService;
        }
        async showQuickPick(editor, wantedId, skipAutoRun) {
            const notebook = editor.textModel;
            const scopedContextKeyService = editor.scopedContextKeyService;
            const matchResult = this._getMatchingResult(notebook);
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
                    this._logService.warn(`wanted kernel DOES NOT EXIST, wanted: ${wantedId}, all: ${all.map(k => k.id)}`);
                    return false;
                }
            }
            if (newKernel) {
                this._selecteKernel(notebook, newKernel);
                return true;
            }
            const quickPick = this._quickInputService.createQuickPick();
            const quickPickItems = this._getKernelPickerQuickPickItems(notebook, matchResult, this._notebookKernelService, scopedContextKeyService);
            if (quickPickItems.length === 1 && supportAutoRun(quickPickItems[0]) && !skipAutoRun) {
                return await this._handleQuickPick(editor, quickPickItems[0], quickPickItems);
            }
            quickPick.items = quickPickItems;
            quickPick.canSelectMany = false;
            quickPick.placeholder = selected
                ? (0, nls_1.localize)('prompt.placeholder.change', "Change kernel for '{0}'", this._labelService.getUriLabel(notebook.uri, { relative: true }))
                : (0, nls_1.localize)('prompt.placeholder.select', "Select kernel for '{0}'", this._labelService.getUriLabel(notebook.uri, { relative: true }));
            quickPick.busy = this._notebookKernelService.getKernelDetectionTasks(notebook).length > 0;
            const kernelDetectionTaskListener = this._notebookKernelService.onDidChangeKernelDetectionTasks(() => {
                quickPick.busy = this._notebookKernelService.getKernelDetectionTasks(notebook).length > 0;
            });
            // run extension recommendataion task if quickPickItems is empty
            const extensionRecommendataionPromise = quickPickItems.length === 0
                ? (0, async_1.createCancelablePromise)(token => this._showInstallKernelExtensionRecommendation(notebook, quickPick, this._extensionWorkbenchService, token))
                : undefined;
            const kernelChangeEventListener = event_1.Event.debounce(event_1.Event.any(this._notebookKernelService.onDidChangeSourceActions, this._notebookKernelService.onDidAddKernel, this._notebookKernelService.onDidRemoveKernel, this._notebookKernelService.onDidChangeNotebookAffinity), (last, _current) => last, KERNEL_PICKER_UPDATE_DEBOUNCE)(async () => {
                // reset quick pick progress
                quickPick.busy = false;
                extensionRecommendataionPromise?.cancel();
                const currentActiveItems = quickPick.activeItems;
                const matchResult = this._getMatchingResult(notebook);
                const quickPickItems = this._getKernelPickerQuickPickItems(notebook, matchResult, this._notebookKernelService, scopedContextKeyService);
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
                return await this._handleQuickPick(editor, pick.selected, pick.items);
            }
            return false;
        }
        _getMatchingResult(notebook) {
            return this._notebookKernelService.getMatchingKernel(notebook);
        }
        async _handleQuickPick(editor, pick, quickPickItems) {
            if (isKernelPick(pick)) {
                const newKernel = pick.kernel;
                this._selecteKernel(editor.textModel, newKernel);
                return true;
            }
            // actions
            if (isSearchMarketplacePick(pick)) {
                await this._showKernelExtension(this._paneCompositePartService, this._extensionWorkbenchService, this._extensionService, editor.textModel.viewType, []);
                // suggestedExtension must be defined for this option to be shown, but still check to make TS happy
            }
            else if (isInstallExtensionPick(pick)) {
                await this._showKernelExtension(this._paneCompositePartService, this._extensionWorkbenchService, this._extensionService, editor.textModel.viewType, pick.extensionIds, this._productService.quality !== 'stable');
            }
            else if (isSourcePick(pick)) {
                // selected explicilty, it should trigger the execution?
                pick.action.runAction();
            }
            return true;
        }
        _selecteKernel(notebook, kernel) {
            this._notebookKernelService.selectKernelForNotebook(kernel, notebook);
        }
        async _showKernelExtension(paneCompositePartService, extensionWorkbenchService, extensionService, viewType, extIds, isInsiders) {
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
            const viewlet = await paneCompositePartService.openPaneComposite(extensions_1.VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */, true);
            const view = viewlet?.getViewPaneContainer();
            const pascalCased = viewType.split(/[^a-z0-9]/ig).map(strings_1.uppercaseFirstLetter).join('');
            view?.search(`@tag:notebookKernel${pascalCased}`);
        }
        async _showInstallKernelExtensionRecommendation(notebookTextModel, quickPick, extensionWorkbenchService, token) {
            quickPick.busy = true;
            const newQuickPickItems = await this._getKernelRecommendationsQuickPickItems(notebookTextModel, extensionWorkbenchService);
            quickPick.busy = false;
            if (token.isCancellationRequested) {
                return;
            }
            if (newQuickPickItems && quickPick.items.length === 0) {
                quickPick.items = newQuickPickItems;
            }
        }
        async _getKernelRecommendationsQuickPickItems(notebookTextModel, extensionWorkbenchService) {
            const quickPickItems = [];
            const language = this.getSuggestedLanguage(notebookTextModel);
            const suggestedExtension = language ? this.getSuggestedKernelFromLanguage(notebookTextModel.viewType, language) : undefined;
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
                    label: `$(${codicons_1.Codicon.lightbulb.id}) ` + (0, nls_1.localize)('installSuggestedKernel', 'Install/Enable suggested extensions'),
                    extensionIds: suggestedExtension.extensionIds
                });
            }
            // there is no kernel, show the install from marketplace
            quickPickItems.push({
                id: 'install',
                label: (0, nls_1.localize)('searchForKernels', "Browse marketplace for kernel extensions"),
            });
            return quickPickItems;
        }
        /**
         * Examine the most common language in the notebook
         * @param notebookTextModel The notebook text model
         * @returns What the suggested language is for the notebook. Used for kernal installing
         */
        getSuggestedLanguage(notebookTextModel) {
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
        getSuggestedKernelFromLanguage(viewType, language) {
            const recommendation = notebookBrowser_1.KERNEL_RECOMMENDATIONS.get(viewType)?.get(language);
            return recommendation;
        }
    }
    let KernelPickerMRUStrategy = class KernelPickerMRUStrategy extends KernelPickerStrategyBase {
        constructor(_notebookKernelService, _productService, _quickInputService, _labelService, _logService, _paneCompositePartService, _extensionWorkbenchService, _extensionService, _commandService, _notebookKernelHistoryService, _openerService) {
            super(_notebookKernelService, _productService, _quickInputService, _labelService, _logService, _paneCompositePartService, _extensionWorkbenchService, _extensionService, _commandService);
            this._notebookKernelHistoryService = _notebookKernelHistoryService;
            this._openerService = _openerService;
        }
        _getKernelPickerQuickPickItems(notebookTextModel, matchResult, notebookKernelService, scopedContextKeyService) {
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
                label: (0, nls_1.localize)('selectAnotherKernel.more', "Select Another Kernel..."),
                autoRun: shouldAutoRun
            });
            return quickPickItems;
        }
        _selecteKernel(notebook, kernel) {
            const currentInfo = this._notebookKernelService.getMatchingKernel(notebook);
            if (currentInfo.selected) {
                // there is already a selected kernel
                this._notebookKernelHistoryService.addMostRecentKernel(currentInfo.selected);
            }
            super._selecteKernel(notebook, kernel);
            this._notebookKernelHistoryService.addMostRecentKernel(kernel);
        }
        _getMatchingResult(notebook) {
            const { selected, all } = this._notebookKernelHistoryService.getKernels(notebook);
            const matchingResult = this._notebookKernelService.getMatchingKernel(notebook);
            return {
                selected: selected,
                all: matchingResult.all,
                suggestions: all,
                hidden: []
            };
        }
        async _handleQuickPick(editor, pick, items) {
            if (pick.id === 'selectAnother') {
                return this.displaySelectAnotherQuickPick(editor, items.length === 1 && items[0] === pick);
            }
            return super._handleQuickPick(editor, pick, items);
        }
        async displaySelectAnotherQuickPick(editor, kernelListEmpty) {
            const notebook = editor.textModel;
            const disposables = new lifecycle_1.DisposableStore();
            const quickPick = this._quickInputService.createQuickPick();
            const quickPickItem = await new Promise(resolve => {
                // select from kernel sources
                quickPick.title = kernelListEmpty ? (0, nls_1.localize)('select', "Select Kernel") : (0, nls_1.localize)('selectAnotherKernel', "Select Another Kernel");
                quickPick.placeholder = (0, nls_1.localize)('selectKernel.placeholder', "Type to choose a kernel source");
                quickPick.busy = true;
                quickPick.buttons = [this._quickInputService.backButton];
                quickPick.show();
                disposables.add(quickPick.onDidTriggerButton(button => {
                    if (button === this._quickInputService.backButton) {
                        resolve(button);
                    }
                }));
                quickPick.onDidTriggerItemButton(async (e) => {
                    if (isKernelSourceQuickPickItem(e.item) && e.item.documentation !== undefined) {
                        const uri = uri_1.URI.isUri(e.item.documentation) ? uri_1.URI.parse(e.item.documentation) : await this._commandService.executeCommand(e.item.documentation);
                        void this._openerService.open(uri, { openExternal: true });
                    }
                });
                disposables.add(quickPick.onDidAccept(async () => {
                    resolve(quickPick.selectedItems[0]);
                }));
                disposables.add(quickPick.onDidHide(() => {
                    resolve(undefined);
                }));
                this._calculdateKernelSources(editor).then(quickPickItems => {
                    quickPick.items = quickPickItems;
                    if (quickPick.items.length > 0) {
                        quickPick.busy = false;
                    }
                });
                disposables.add(event_1.Event.debounce(event_1.Event.any(this._notebookKernelService.onDidChangeSourceActions, this._notebookKernelService.onDidAddKernel, this._notebookKernelService.onDidRemoveKernel), (last, _current) => last, KERNEL_PICKER_UPDATE_DEBOUNCE)(async () => {
                    quickPick.busy = true;
                    const quickPickItems = await this._calculdateKernelSources(editor);
                    quickPick.items = quickPickItems;
                    quickPick.busy = false;
                }));
            });
            quickPick.hide();
            disposables.dispose();
            if (quickPickItem === this._quickInputService.backButton) {
                return this.showQuickPick(editor, undefined, true);
            }
            if (quickPickItem) {
                const selectedKernelPickItem = quickPickItem;
                if (isKernelSourceQuickPickItem(selectedKernelPickItem)) {
                    try {
                        const selectedKernelId = await this._executeCommand(notebook, selectedKernelPickItem.command);
                        if (selectedKernelId) {
                            const { all } = await this._getMatchingResult(notebook);
                            const kernel = all.find(kernel => kernel.id === `ms-toolsai.jupyter/${selectedKernelId}`);
                            if (kernel) {
                                await this._selecteKernel(notebook, kernel);
                                return true;
                            }
                            return true;
                        }
                        else {
                            return this.displaySelectAnotherQuickPick(editor, false);
                        }
                    }
                    catch (ex) {
                        return false;
                    }
                }
                else if (isKernelPick(selectedKernelPickItem)) {
                    await this._selecteKernel(notebook, selectedKernelPickItem.kernel);
                    return true;
                }
                else if (isGroupedKernelsPick(selectedKernelPickItem)) {
                    await this._selectOneKernel(notebook, selectedKernelPickItem.source, selectedKernelPickItem.kernels);
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
                    await this._showKernelExtension(this._paneCompositePartService, this._extensionWorkbenchService, this._extensionService, editor.textModel.viewType, []);
                    return true;
                }
                else if (isInstallExtensionPick(selectedKernelPickItem)) {
                    await this._showKernelExtension(this._paneCompositePartService, this._extensionWorkbenchService, this._extensionService, editor.textModel.viewType, selectedKernelPickItem.extensionIds, this._productService.quality !== 'stable');
                    return this.displaySelectAnotherQuickPick(editor, false);
                }
            }
            return false;
        }
        async _calculdateKernelSources(editor) {
            const notebook = editor.textModel;
            const sourceActionCommands = this._notebookKernelService.getSourceActions(notebook, editor.scopedContextKeyService);
            const actions = await this._notebookKernelService.getKernelSourceActions2(notebook);
            const matchResult = this._getMatchingResult(notebook);
            if (sourceActionCommands.length === 0 && matchResult.all.length === 0 && actions.length === 0) {
                return await this._getKernelRecommendationsQuickPickItems(notebook, this._extensionWorkbenchService) ?? [];
            }
            const others = matchResult.all.filter(item => item.extension.value !== notebookBrowser_1.JUPYTER_EXTENSION_ID);
            const quickPickItems = [];
            // group controllers by extension
            for (const group of (0, arrays_1.groupBy)(others, (a, b) => a.extension.value === b.extension.value ? 0 : 1)) {
                const extension = this._extensionService.extensions.find(extension => extension.identifier.value === group[0].extension.value);
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
                        iconClass: themables_1.ThemeIcon.asClassName(codicons_1.Codicon.info),
                        tooltip: (0, nls_1.localize)('learnMoreTooltip', 'Learn More'),
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
        async _selectOneKernel(notebook, source, kernels) {
            const quickPickItems = kernels.map(kernel => toKernelQuickPick(kernel, undefined));
            const quickPick = this._quickInputService.createQuickPick();
            quickPick.items = quickPickItems;
            quickPick.canSelectMany = false;
            quickPick.title = (0, nls_1.localize)('selectKernelFromExtension', "Select Kernel from {0}", source);
            quickPick.onDidAccept(async () => {
                if (quickPick.selectedItems && quickPick.selectedItems.length > 0 && isKernelPick(quickPick.selectedItems[0])) {
                    await this._selecteKernel(notebook, quickPick.selectedItems[0].kernel);
                }
                quickPick.hide();
                quickPick.dispose();
            });
            quickPick.onDidHide(() => {
                quickPick.dispose();
            });
            quickPick.show();
        }
        async _executeCommand(notebook, command) {
            const id = typeof command === 'string' ? command : command.id;
            const args = typeof command === 'string' ? [] : command.arguments ?? [];
            if (typeof command === 'string' || !command.arguments || !Array.isArray(command.arguments) || command.arguments.length === 0) {
                args.unshift({
                    uri: notebook.uri,
                    $mid: 14 /* MarshalledId.NotebookActionContext */
                });
            }
            if (typeof command === 'string') {
                return this._commandService.executeCommand(id);
            }
            else {
                return this._commandService.executeCommand(id, ...args);
            }
        }
        static updateKernelStatusAction(notebook, action, notebookKernelService, notebookKernelHistoryService) {
            const detectionTasks = notebookKernelService.getKernelDetectionTasks(notebook);
            if (detectionTasks.length) {
                const info = notebookKernelService.getMatchingKernel(notebook);
                action.enabled = true;
                action.class = themables_1.ThemeIcon.asClassName(themables_1.ThemeIcon.modify(notebookIcons_1.executingStateIcon, 'spin'));
                if (info.selected) {
                    action.label = info.selected.label;
                    const kernelInfo = info.selected.description ?? info.selected.detail;
                    action.tooltip = kernelInfo
                        ? (0, nls_1.localize)('kernels.selectedKernelAndKernelDetectionRunning', "Selected Kernel: {0} (Kernel Detection Tasks Running)", kernelInfo)
                        : (0, nls_1.localize)('kernels.detecting', "Detecting Kernels");
                }
                else {
                    action.label = (0, nls_1.localize)('kernels.detecting', "Detecting Kernels");
                }
                return;
            }
            const runningActions = notebookKernelService.getRunningSourceActions(notebook);
            const updateActionFromSourceAction = (sourceAction, running) => {
                const sAction = sourceAction.action;
                action.class = running ? themables_1.ThemeIcon.asClassName(themables_1.ThemeIcon.modify(notebookIcons_1.executingStateIcon, 'spin')) : themables_1.ThemeIcon.asClassName(notebookIcons_1.selectKernelIcon);
                action.label = sAction.label;
                action.enabled = true;
            };
            if (runningActions.length) {
                return updateActionFromSourceAction(runningActions[0] /** TODO handle multiple actions state */, true);
            }
            const { selected } = notebookKernelHistoryService.getKernels(notebook);
            if (selected) {
                action.label = selected.label;
                action.class = themables_1.ThemeIcon.asClassName(notebookIcons_1.selectKernelIcon);
                action.tooltip = selected.description ?? selected.detail ?? '';
            }
            else {
                action.label = (0, nls_1.localize)('select', "Select Kernel");
                action.class = themables_1.ThemeIcon.asClassName(notebookIcons_1.selectKernelIcon);
                action.tooltip = '';
            }
        }
        static async resolveKernel(notebook, notebookKernelService, notebookKernelHistoryService, commandService) {
            const alreadySelected = notebookKernelHistoryService.getKernels(notebook);
            if (alreadySelected.selected) {
                return alreadySelected.selected;
            }
            await commandService.executeCommand(coreActions_1.SELECT_KERNEL_ID);
            const { selected } = notebookKernelHistoryService.getKernels(notebook);
            return selected;
        }
    };
    exports.KernelPickerMRUStrategy = KernelPickerMRUStrategy;
    exports.KernelPickerMRUStrategy = KernelPickerMRUStrategy = __decorate([
        __param(0, notebookKernelService_1.INotebookKernelService),
        __param(1, productService_1.IProductService),
        __param(2, quickInput_1.IQuickInputService),
        __param(3, label_1.ILabelService),
        __param(4, log_1.ILogService),
        __param(5, panecomposite_1.IPaneCompositePartService),
        __param(6, extensions_1.IExtensionsWorkbenchService),
        __param(7, extensions_2.IExtensionService),
        __param(8, commands_1.ICommandService),
        __param(9, notebookKernelService_1.INotebookKernelHistoryService),
        __param(10, opener_1.IOpenerService)
    ], KernelPickerMRUStrategy);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tLZXJuZWxRdWlja1BpY2tTdHJhdGVneS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2Jyb3dzZXIvdmlld1BhcnRzL25vdGVib29rS2VybmVsUXVpY2tQaWNrU3RyYXRlZ3kudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBcUNoRyxTQUFTLFlBQVksQ0FBQyxJQUFvQztRQUN6RCxPQUFPLFFBQVEsSUFBSSxJQUFJLENBQUM7SUFDekIsQ0FBQztJQUVELFNBQVMsb0JBQW9CLENBQUMsSUFBb0M7UUFDakUsT0FBTyxTQUFTLElBQUksSUFBSSxDQUFDO0lBQzFCLENBQUM7SUFFRCxTQUFTLFlBQVksQ0FBQyxJQUFvQztRQUN6RCxPQUFPLFFBQVEsSUFBSSxJQUFJLENBQUM7SUFDekIsQ0FBQztJQUVELFNBQVMsc0JBQXNCLENBQUMsSUFBb0M7UUFDbkUsT0FBTyxJQUFJLENBQUMsRUFBRSxLQUFLLGtCQUFrQixJQUFJLGNBQWMsSUFBSSxJQUFJLENBQUM7SUFDakUsQ0FBQztJQUVELFNBQVMsdUJBQXVCLENBQUMsSUFBb0M7UUFDcEUsT0FBTyxJQUFJLENBQUMsRUFBRSxLQUFLLFNBQVMsQ0FBQztJQUM5QixDQUFDO0lBR0QsU0FBUywyQkFBMkIsQ0FBQyxJQUFvQjtRQUN4RCxPQUFPLFNBQVMsSUFBSSxJQUFJLENBQUM7SUFDMUIsQ0FBQztJQUVELFNBQVMsY0FBYyxDQUFDLElBQW9DO1FBQzNELE9BQU8sU0FBUyxJQUFJLElBQUksSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUM1QyxDQUFDO0lBRUQsTUFBTSw2QkFBNkIsR0FBRyxHQUFHLENBQUM7SUFZMUMsU0FBUyxpQkFBaUIsQ0FBQyxNQUF1QixFQUFFLFFBQXFDO1FBQ3hGLE1BQU0sR0FBRyxHQUFl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