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
define(["require", "exports", "vs/nls", "vs/base/browser/ui/aria/aria", "vs/base/common/keyCodes", "vs/editor/common/languages/modesRegistry", "vs/platform/registry/common/platform", "vs/platform/actions/common/actions", "vs/platform/instantiation/common/extensions", "vs/workbench/contrib/output/browser/outputServices", "vs/workbench/services/output/common/output", "vs/workbench/contrib/output/browser/outputView", "vs/workbench/browser/editor", "vs/workbench/contrib/output/browser/logViewer", "vs/platform/instantiation/common/descriptors", "vs/workbench/common/contributions", "vs/platform/instantiation/common/instantiation", "vs/editor/common/services/resolverService", "vs/workbench/common/views", "vs/workbench/browser/parts/views/viewPaneContainer", "vs/platform/configuration/common/configurationRegistry", "vs/platform/quickinput/common/quickInput", "vs/workbench/services/editor/common/editorService", "vs/base/common/types", "vs/platform/contextkey/common/contextkey", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry", "vs/platform/action/common/actionCommonCategories", "vs/workbench/common/editor", "vs/base/common/lifecycle"], function (require, exports, nls, aria, keyCodes_1, modesRegistry_1, platform_1, actions_1, extensions_1, outputServices_1, output_1, outputView_1, editor_1, logViewer_1, descriptors_1, contributions_1, instantiation_1, resolverService_1, views_1, viewPaneContainer_1, configurationRegistry_1, quickInput_1, editorService_1, types_1, contextkey_1, codicons_1, iconRegistry_1, actionCommonCategories_1, editor_2, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // Register Service
    (0, extensions_1.registerSingleton)(output_1.IOutputService, outputServices_1.OutputService, 1 /* InstantiationType.Delayed */);
    // Register Output Mode
    modesRegistry_1.ModesRegistry.registerLanguage({
        id: output_1.OUTPUT_MODE_ID,
        extensions: [],
        mimetypes: [output_1.OUTPUT_MIME]
    });
    // Register Log Output Mode
    modesRegistry_1.ModesRegistry.registerLanguage({
        id: output_1.LOG_MODE_ID,
        extensions: [],
        mimetypes: [output_1.LOG_MIME]
    });
    // register output container
    const outputViewIcon = (0, iconRegistry_1.registerIcon)('output-view-icon', codicons_1.Codicon.output, nls.localize('outputViewIcon', 'View icon of the output view.'));
    const VIEW_CONTAINER = platform_1.Registry.as(views_1.Extensions.ViewContainersRegistry).registerViewContainer({
        id: output_1.OUTPUT_VIEW_ID,
        title: { value: nls.localize('output', "Output"), original: 'Output' },
        icon: outputViewIcon,
        order: 1,
        ctorDescriptor: new descriptors_1.SyncDescriptor(viewPaneContainer_1.ViewPaneContainer, [output_1.OUTPUT_VIEW_ID, { mergeViewWithContainerWhenSingleView: true }]),
        storageId: output_1.OUTPUT_VIEW_ID,
        hideIfEmpty: true,
    }, 1 /* ViewContainerLocation.Panel */, { doNotRegisterOpenCommand: true });
    platform_1.Registry.as(views_1.Extensions.ViewsRegistry).registerViews([{
            id: output_1.OUTPUT_VIEW_ID,
            name: nls.localize('output', "Output"),
            containerIcon: outputViewIcon,
            canMoveView: true,
            canToggleVisibility: false,
            ctorDescriptor: new descriptors_1.SyncDescriptor(outputView_1.OutputViewPane),
            openCommandActionDescriptor: {
                id: 'workbench.action.output.toggleOutput',
                mnemonicTitle: nls.localize({ key: 'miToggleOutput', comment: ['&& denotes a mnemonic'] }, "&&Output"),
                keybindings: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 51 /* KeyCode.KeyU */,
                    linux: {
                        primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 38 /* KeyCode.KeyH */) // On Ubuntu Ctrl+Shift+U is taken by some global OS command
                    }
                },
                order: 1,
            }
        }], VIEW_CONTAINER);
    platform_1.Registry.as(editor_2.EditorExtensions.EditorPane).registerEditorPane(editor_1.EditorPaneDescriptor.create(logViewer_1.LogViewer, logViewer_1.LogViewer.LOG_VIEWER_EDITOR_ID, nls.localize('logViewer', "Log Viewer")), [
        new descriptors_1.SyncDescriptor(logViewer_1.LogViewerInput)
    ]);
    let OutputContribution = class OutputContribution extends lifecycle_1.Disposable {
        constructor(instantiationService, textModelService, outputService) {
            super();
            this.outputService = outputService;
            textModelService.registerTextModelContentProvider(output_1.LOG_SCHEME, instantiationService.createInstance(outputServices_1.LogContentProvider));
            this.registerActions();
        }
        registerActions() {
            this.registerSwitchOutputAction();
            this.registerShowOutputChannelsAction();
            this.registerClearOutputAction();
            this.registerToggleAutoScrollAction();
            this.registerOpenActiveLogOutputFileAction();
            this.registerShowLogsAction();
            this.registerOpenLogFileAction();
        }
        registerSwitchOutputAction() {
            this._register((0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: `workbench.output.action.switchBetweenOutputs`,
                        title: nls.localize('switchBetweenOutputs.label', "Switch Output"),
                    });
                }
                async run(accessor, channelId) {
                    if (channelId) {
                        accessor.get(output_1.IOutputService).showChannel(channelId, true);
                    }
                }
            }));
            const switchOutputMenu = new actions_1.MenuId('workbench.output.menu.switchOutput');
            this._register(actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ViewTitle, {
                submenu: switchOutputMenu,
                title: nls.localize('switchToOutput.label', "Switch Output"),
                group: 'navigation',
                when: contextkey_1.ContextKeyExpr.equals('view', output_1.OUTPUT_VIEW_ID),
                order: 1,
                isSelection: true
            }));
            const registeredChannels = new Map();
            this._register((0, lifecycle_1.toDisposable)(() => (0, lifecycle_1.dispose)(registeredChannels.values())));
            const registerOutputChannels = (channels) => {
                for (const channel of channels) {
                    const title = channel.label;
                    const group = channel.extensionId ? '0_ext_outputchannels' : '1_core_outputchannels';
                    registeredChannels.set(channel.id, (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                        constructor() {
                            super({
                                id: `workbench.action.output.show.${channel.id}`,
                                title,
                                toggled: output_1.ACTIVE_OUTPUT_CHANNEL_CONTEXT.isEqualTo(channel.id),
                                menu: {
                                    id: switchOutputMenu,
                                    group,
                                }
                            });
                        }
                        async run(accessor) {
                            return accessor.get(output_1.IOutputService).showChannel(channel.id, true);
                        }
                    }));
                }
            };
            registerOutputChannels(this.outputService.getChannelDescriptors());
            const outputChannelRegistry = platform_1.Registry.as(output_1.Extensions.OutputChannels);
            this._register(outputChannelRegistry.onDidRegisterChannel(e => {
                const channel = this.outputService.getChannelDescriptor(e);
                if (channel) {
                    registerOutputChannels([channel]);
                }
            }));
            this._register(outputChannelRegistry.onDidRemoveChannel(e => {
                registeredChannels.get(e)?.dispose();
                registeredChannels.delete(e);
            }));
        }
        registerShowOutputChannelsAction() {
            this._register((0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.action.showOutputChannels',
                        title: { value: nls.localize('showOutputChannels', "Show Output Channels..."), original: 'Show Output Channels...' },
                        category: { value: nls.localize('output', "Output"), original: 'Output' },
                        f1: true
                    });
                }
                async run(accessor) {
                    const outputService = accessor.get(output_1.IOutputService);
                    const quickInputService = accessor.get(quickInput_1.IQuickInputService);
                    const extensionChannels = [], coreChannels = [];
                    for (const channel of outputService.getChannelDescriptors()) {
                        if (channel.extensionId) {
                            extensionChannels.push(channel);
                        }
                        else {
                            coreChannels.push(channel);
                        }
                    }
                    const entries = [];
                    for (const { id, label } of extensionChannels) {
                        entries.push({ id, label });
                    }
                    if (extensionChannels.length && coreChannels.length) {
                        entries.push({ type: 'separator' });
                    }
                    for (const { id, label } of coreChannels) {
                        entries.push({ id, label });
                    }
                    const entry = await quickInputService.pick(entries, { placeHolder: nls.localize('selectOutput', "Select Output Channel") });
                    if (entry) {
                        return outputService.showChannel(entry.id);
                    }
                }
            }));
        }
        registerClearOutputAction() {
            this._register((0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: `workbench.output.action.clearOutput`,
                        title: { value: nls.localize('clearOutput.label', "Clear Output"), original: 'Clear Output' },
                        category: actionCommonCategories_1.Categories.View,
                        menu: [{
                                id: actions_1.MenuId.ViewTitle,
                                when: contextkey_1.ContextKeyExpr.equals('view', output_1.OUTPUT_VIEW_ID),
                                group: 'navigation',
                                order: 2
                            }, {
                                id: actions_1.MenuId.CommandPalette
                            }, {
                                id: actions_1.MenuId.EditorContext,
                                when: output_1.CONTEXT_IN_OUTPUT
                            }],
                        icon: codicons_1.Codicon.clearAll
                    });
                }
                async run(accessor) {
                    const outputService = accessor.get(output_1.IOutputService);
                    const activeChannel = outputService.getActiveChannel();
                    if (activeChannel) {
                        activeChannel.clear();
                        aria.status(nls.localize('outputCleared', "Output was cleared"));
                    }
                }
            }));
        }
        registerToggleAutoScrollAction() {
            this._register((0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: `workbench.output.action.toggleAutoScroll`,
                        title: { value: nls.localize('toggleAutoScroll', "Toggle Auto Scrolling"), original: 'Toggle Auto Scrolling' },
                        tooltip: nls.localize('outputScrollOff', "Turn Auto Scrolling Off"),
                        menu: {
                            id: actions_1.MenuId.ViewTitle,
                            when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', output_1.OUTPUT_VIEW_ID)),
                            group: 'navigation',
                            order: 3,
                        },
                        icon: codicons_1.Codicon.lock,
                        toggled: {
                            condition: output_1.CONTEXT_OUTPUT_SCROLL_LOCK,
                            icon: codicons_1.Codicon.unlock,
                            tooltip: nls.localize('outputScrollOn', "Turn Auto Scrolling On")
                        }
                    });
                }
                async run(accessor) {
                    const outputView = accessor.get(views_1.IViewsService).getActiveViewWithId(output_1.OUTPUT_VIEW_ID);
                    outputView.scrollLock = !outputView.scrollLock;
                }
            }));
        }
        registerOpenActiveLogOutputFileAction() {
            this._register((0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: `workbench.action.openActiveLogOutputFile`,
                        title: { value: nls.localize('openActiveLogOutputFile', "Open Log Output File"), original: 'Open Log Output File' },
                        menu: [{
                                id: actions_1.MenuId.ViewTitle,
                                when: contextkey_1.ContextKeyExpr.equals('view', output_1.OUTPUT_VIEW_ID),
                                group: 'navigation',
                                order: 4
                            }],
                        icon: codicons_1.Codicon.goToFile,
                        precondition: output_1.CONTEXT_ACTIVE_LOG_OUTPUT
                    });
                }
                async run(accessor) {
                    const outputService = accessor.get(output_1.IOutputService);
                    const editorService = accessor.get(editorService_1.IEditorService);
                    const instantiationService = accessor.get(instantiation_1.IInstantiationService);
                    const logFileOutputChannelDescriptor = this.getLogFileOutputChannelDescriptor(outputService);
                    if (logFileOutputChannelDescriptor) {
                        await editorService.openEditor(instantiationService.createInstance(logViewer_1.LogViewerInput, logFileOutputChannelDescriptor), { pinned: true });
                    }
                }
                getLogFileOutputChannelDescriptor(outputService) {
                    const channel = outputService.getActiveChannel();
                    if (channel) {
                        const descriptor = outputService.getChannelDescriptors().filter(c => c.id === channel.id)[0];
                        if (descriptor && descriptor.file && descriptor.log) {
                            return descriptor;
                        }
                    }
                    return null;
                }
            }));
        }
        registerShowLogsAction() {
            this._register((0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.action.showLogs',
                        title: { value: nls.localize('showLogs', "Show Logs..."), original: 'Show Logs...' },
                        category: actionCommonCategories_1.Categories.Developer,
                        menu: {
                            id: actions_1.MenuId.CommandPalette,
                        },
                    });
                }
                async run(accessor) {
                    const outputService = accessor.get(output_1.IOutputService);
                    const quickInputService = accessor.get(quickInput_1.IQuickInputService);
                    const extensionLogs = [], logs = [];
                    for (const channel of outputService.getChannelDescriptors()) {
                        if (channel.log) {
                            if (channel.extensionId) {
                                extensionLogs.push(channel);
                            }
                            else {
                                logs.push(channel);
                            }
                        }
                    }
                    const entries = [];
                    for (const { id, label } of logs) {
                        entries.push({ id, label });
                    }
                    if (extensionLogs.length && logs.length) {
                        entries.push({ type: 'separator', label: nls.localize('extensionLogs', "Extension Logs") });
                    }
                    for (const { id, label } of extensionLogs) {
                        entries.push({ id, label });
                    }
                    const entry = await quickInputService.pick(entries, { placeHolder: nls.localize('selectlog', "Select Log") });
                    if (entry) {
                        return outputService.showChannel(entry.id);
                    }
                }
            }));
        }
        registerOpenLogFileAction() {
            this._register((0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.action.openLogFile',
                        title: { value: nls.localize('openLogFile', "Open Log File..."), original: 'Open Log File...' },
                        category: actionCommonCategories_1.Categories.Developer,
                        menu: {
                            id: actions_1.MenuId.CommandPalette,
                        },
                        description: {
                            description: 'workbench.action.openLogFile',
                            args: [{
                                    name: 'logFile',
                                    schema: {
                                        markdownDescription: nls.localize('logFile', "The id of the log file to open, for example `\"window\"`. Currently the best way to get this is to get the ID by checking the `workbench.action.output.show.<id>` commands"),
                                        type: 'string'
                                    }
                                }]
                        },
                    });
                }
                async run(accessor, args) {
                    const outputService = accessor.get(output_1.IOutputService);
                    const quickInputService = accessor.get(quickInput_1.IQuickInputService);
                    const instantiationService = accessor.get(instantiation_1.IInstantiationService);
                    const editorService = accessor.get(editorService_1.IEditorService);
                    const entries = outputService.getChannelDescriptors().filter(c => c.file && c.log)
                        .map(channel => ({ id: channel.id, label: channel.label, channel }));
                    const argName = args && typeof args === 'string' ? args : undefined;
                    let entry;
                    if (argName) {
                        entry = entries.find(e => e.id === argName);
                    }
                    if (!entry) {
                        entry = await quickInputService.pick(entries, { placeHolder: nls.localize('selectlogFile', "Select Log File") });
                    }
                    if (entry) {
                        (0, types_1.assertIsDefined)(entry.channel.file);
                        await editorService.openEditor(instantiationService.createInstance(logViewer_1.LogViewerInput, entry.channel), { pinned: true });
                    }
                }
            }));
        }
    };
    OutputContribution = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, resolverService_1.ITextModelService),
        __param(2, output_1.IOutputService)
    ], OutputContribution);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(OutputContribution, 3 /* LifecyclePhase.Restored */);
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration({
        id: 'output',
        order: 30,
        title: nls.localize('output', "Output"),
        type: 'object',
        properties: {
            'output.smartScroll.enabled': {
                type: 'boolean',
                description: nls.localize('output.smartScroll.enabled', "Enable/disable the ability of smart scrolling in the output view. Smart scrolling allows you to lock scrolling automatically when you click in the output view and unlocks when you click in the last line."),
                default: true,
                scope: 3 /* ConfigurationScope.WINDOW */,
                tags: ['output']
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0cHV0LmNvbnRyaWJ1dGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL291dHB1dC9icm93c2VyL291dHB1dC5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7SUFnQ2hHLG1CQUFtQjtJQUNuQixJQUFBLDhCQUFpQixFQUFDLHVCQUFjLEVBQUUsOEJBQWEsb0NBQTRCLENBQUM7SUFFNUUsdUJBQXVCO0lBQ3ZCLDZCQUFhLENBQUMsZ0JBQWdCLENBQUM7UUFDOUIsRUFBRSxFQUFFLHVCQUFjO1FBQ2xCLFVBQVUsRUFBRSxFQUFFO1FBQ2QsU0FBUyxFQUFFLENBQUMsb0JBQVcsQ0FBQztLQUN4QixDQUFDLENBQUM7SUFFSCwyQkFBMkI7SUFDM0IsNkJBQWEsQ0FBQyxnQkFBZ0IsQ0FBQztRQUM5QixFQUFFLEVBQUUsb0JBQVc7UUFDZixVQUFVLEVBQUUsRUFBRTtRQUNkLFNBQVMsRUFBRSxDQUFDLGlCQUFRLENBQUM7S0FDckIsQ0FBQyxDQUFDO0lBRUgsNEJBQTRCO0lBQzVCLE1BQU0sY0FBYyxHQUFHLElBQUEsMkJBQVksRUFBQyxrQkFBa0IsRUFBRSxrQkFBTyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUFFLCtCQUErQixDQUFDLENBQUMsQ0FBQztJQUN6SSxNQUFNLGNBQWMsR0FBa0IsbUJBQVEsQ0FBQyxFQUFFLENBQTBCLGtCQUF1QixDQUFDLHNCQUFzQixDQUFDLENBQUMscUJBQXFCLENBQUM7UUFDaEosRUFBRSxFQUFFLHVCQUFjO1FBQ2xCLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFO1FBQ3RFLElBQUksRUFBRSxjQUFj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