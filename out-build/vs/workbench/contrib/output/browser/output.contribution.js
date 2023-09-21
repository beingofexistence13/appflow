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
define(["require", "exports", "vs/nls!vs/workbench/contrib/output/browser/output.contribution", "vs/base/browser/ui/aria/aria", "vs/base/common/keyCodes", "vs/editor/common/languages/modesRegistry", "vs/platform/registry/common/platform", "vs/platform/actions/common/actions", "vs/platform/instantiation/common/extensions", "vs/workbench/contrib/output/browser/outputServices", "vs/workbench/services/output/common/output", "vs/workbench/contrib/output/browser/outputView", "vs/workbench/browser/editor", "vs/workbench/contrib/output/browser/logViewer", "vs/platform/instantiation/common/descriptors", "vs/workbench/common/contributions", "vs/platform/instantiation/common/instantiation", "vs/editor/common/services/resolverService", "vs/workbench/common/views", "vs/workbench/browser/parts/views/viewPaneContainer", "vs/platform/configuration/common/configurationRegistry", "vs/platform/quickinput/common/quickInput", "vs/workbench/services/editor/common/editorService", "vs/base/common/types", "vs/platform/contextkey/common/contextkey", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry", "vs/platform/action/common/actionCommonCategories", "vs/workbench/common/editor", "vs/base/common/lifecycle"], function (require, exports, nls, aria, keyCodes_1, modesRegistry_1, platform_1, actions_1, extensions_1, outputServices_1, output_1, outputView_1, editor_1, logViewer_1, descriptors_1, contributions_1, instantiation_1, resolverService_1, views_1, viewPaneContainer_1, configurationRegistry_1, quickInput_1, editorService_1, types_1, contextkey_1, codicons_1, iconRegistry_1, actionCommonCategories_1, editor_2, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // Register Service
    (0, extensions_1.$mr)(output_1.$eJ, outputServices_1.$lVb, 1 /* InstantiationType.Delayed */);
    // Register Output Mode
    modesRegistry_1.$Xt.registerLanguage({
        id: output_1.$9I,
        extensions: [],
        mimetypes: [output_1.$7I]
    });
    // Register Log Output Mode
    modesRegistry_1.$Xt.registerLanguage({
        id: output_1.$_I,
        extensions: [],
        mimetypes: [output_1.$0I]
    });
    // register output container
    const outputViewIcon = (0, iconRegistry_1.$9u)('output-view-icon', codicons_1.$Pj.output, nls.localize(0, null));
    const VIEW_CONTAINER = platform_1.$8m.as(views_1.Extensions.ViewContainersRegistry).registerViewContainer({
        id: output_1.$aJ,
        title: { value: nls.localize(1, null), original: 'Output' },
        icon: outputViewIcon,
        order: 1,
        ctorDescriptor: new descriptors_1.$yh(viewPaneContainer_1.$Seb, [output_1.$aJ, { mergeViewWithContainerWhenSingleView: true }]),
        storageId: output_1.$aJ,
        hideIfEmpty: true,
    }, 1 /* ViewContainerLocation.Panel */, { doNotRegisterOpenCommand: true });
    platform_1.$8m.as(views_1.Extensions.ViewsRegistry).registerViews([{
            id: output_1.$aJ,
            name: nls.localize(2, null),
            containerIcon: outputViewIcon,
            canMoveView: true,
            canToggleVisibility: false,
            ctorDescriptor: new descriptors_1.$yh(outputView_1.$kVb),
            openCommandActionDescriptor: {
                id: 'workbench.action.output.toggleOutput',
                mnemonicTitle: nls.localize(3, null),
                keybindings: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 51 /* KeyCode.KeyU */,
                    linux: {
                        primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 38 /* KeyCode.KeyH */) // On Ubuntu Ctrl+Shift+U is taken by some global OS command
                    }
                },
                order: 1,
            }
        }], VIEW_CONTAINER);
    platform_1.$8m.as(editor_2.$GE.EditorPane).registerEditorPane(editor_1.$_T.create(logViewer_1.$oVb, logViewer_1.$oVb.LOG_VIEWER_EDITOR_ID, nls.localize(4, null)), [
        new descriptors_1.$yh(logViewer_1.$nVb)
    ]);
    let OutputContribution = class OutputContribution extends lifecycle_1.$kc {
        constructor(instantiationService, textModelService, a) {
            super();
            this.a = a;
            textModelService.registerTextModelContentProvider(output_1.$$I, instantiationService.createInstance(outputServices_1.$mVb));
            this.b();
        }
        b() {
            this.f();
            this.g();
            this.h();
            this.j();
            this.m();
            this.n();
            this.r();
        }
        f() {
            this.B((0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id: `workbench.output.action.switchBetweenOutputs`,
                        title: nls.localize(5, null),
                    });
                }
                async run(accessor, channelId) {
                    if (channelId) {
                        accessor.get(output_1.$eJ).showChannel(channelId, true);
                    }
                }
            }));
            const switchOutputMenu = new actions_1.$Ru('workbench.output.menu.switchOutput');
            this.B(actions_1.$Tu.appendMenuItem(actions_1.$Ru.ViewTitle, {
                submenu: switchOutputMenu,
                title: nls.localize(6, null),
                group: 'navigation',
                when: contextkey_1.$Ii.equals('view', output_1.$aJ),
                order: 1,
                isSelection: true
            }));
            const registeredChannels = new Map();
            this.B((0, lifecycle_1.$ic)(() => (0, lifecycle_1.$fc)(registeredChannels.values())));
            const registerOutputChannels = (channels) => {
                for (const channel of channels) {
                    const title = channel.label;
                    const group = channel.extensionId ? '0_ext_outputchannels' : '1_core_outputchannels';
                    registeredChannels.set(channel.id, (0, actions_1.$Xu)(class extends actions_1.$Wu {
                        constructor() {
                            super({
                                id: `workbench.action.output.show.${channel.id}`,
                                title,
                                toggled: output_1.$gJ.isEqualTo(channel.id),
                                menu: {
                                    id: switchOutputMenu,
                                    group,
                                }
                            });
                        }
                        async run(accessor) {
                            return accessor.get(output_1.$eJ).showChannel(channel.id, true);
                        }
                    }));
                }
            };
            registerOutputChannels(this.a.getChannelDescriptors());
            const outputChannelRegistry = platform_1.$8m.as(output_1.$fJ.OutputChannels);
            this.B(outputChannelRegistry.onDidRegisterChannel(e => {
                const channel = this.a.getChannelDescriptor(e);
                if (channel) {
                    registerOutputChannels([channel]);
                }
            }));
            this.B(outputChannelRegistry.onDidRemoveChannel(e => {
                registeredChannels.get(e)?.dispose();
                registeredChannels.delete(e);
            }));
        }
        g() {
            this.B((0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id: 'workbench.action.showOutputChannels',
                        title: { value: nls.localize(7, null), original: 'Show Output Channels...' },
                        category: { value: nls.localize(8, null), original: 'Output' },
                        f1: true
                    });
                }
                async run(accessor) {
                    const outputService = accessor.get(output_1.$eJ);
                    const quickInputService = accessor.get(quickInput_1.$Gq);
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
                    const entry = await quickInputService.pick(entries, { placeHolder: nls.localize(9, null) });
                    if (entry) {
                        return outputService.showChannel(entry.id);
                    }
                }
            }));
        }
        h() {
            this.B((0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id: `workbench.output.action.clearOutput`,
                        title: { value: nls.localize(10, null), original: 'Clear Output' },
                        category: actionCommonCategories_1.$Nl.View,
                        menu: [{
                                id: actions_1.$Ru.ViewTitle,
                                when: contextkey_1.$Ii.equals('view', output_1.$aJ),
                                group: 'navigation',
                                order: 2
                            }, {
                                id: actions_1.$Ru.CommandPalette
                            }, {
                                id: actions_1.$Ru.EditorContext,
                                when: output_1.$bJ
                            }],
                        icon: codicons_1.$Pj.clearAll
                    });
                }
                async run(accessor) {
                    const outputService = accessor.get(output_1.$eJ);
                    const activeChannel = outputService.getActiveChannel();
                    if (activeChannel) {
                        activeChannel.clear();
                        aria.$_P(nls.localize(11, null));
                    }
                }
            }));
        }
        j() {
            this.B((0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id: `workbench.output.action.toggleAutoScroll`,
                        title: { value: nls.localize(12, null), original: 'Toggle Auto Scrolling' },
                        tooltip: nls.localize(13, null),
                        menu: {
                            id: actions_1.$Ru.ViewTitle,
                            when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('view', output_1.$aJ)),
                            group: 'navigation',
                            order: 3,
                        },
                        icon: codicons_1.$Pj.lock,
                        toggled: {
                            condition: output_1.$dJ,
                            icon: codicons_1.$Pj.unlock,
                            tooltip: nls.localize(14, null)
                        }
                    });
                }
                async run(accessor) {
                    const outputView = accessor.get(views_1.$$E).getActiveViewWithId(output_1.$aJ);
                    outputView.scrollLock = !outputView.scrollLock;
                }
            }));
        }
        m() {
            this.B((0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id: `workbench.action.openActiveLogOutputFile`,
                        title: { value: nls.localize(15, null), original: 'Open Log Output File' },
                        menu: [{
                                id: actions_1.$Ru.ViewTitle,
                                when: contextkey_1.$Ii.equals('view', output_1.$aJ),
                                group: 'navigation',
                                order: 4
                            }],
                        icon: codicons_1.$Pj.goToFile,
                        precondition: output_1.$cJ
                    });
                }
                async run(accessor) {
                    const outputService = accessor.get(output_1.$eJ);
                    const editorService = accessor.get(editorService_1.$9C);
                    const instantiationService = accessor.get(instantiation_1.$Ah);
                    const logFileOutputChannelDescriptor = this.a(outputService);
                    if (logFileOutputChannelDescriptor) {
                        await editorService.openEditor(instantiationService.createInstance(logViewer_1.$nVb, logFileOutputChannelDescriptor), { pinned: true });
                    }
                }
                a(outputService) {
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
        n() {
            this.B((0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id: 'workbench.action.showLogs',
                        title: { value: nls.localize(16, null), original: 'Show Logs...' },
                        category: actionCommonCategories_1.$Nl.Developer,
                        menu: {
                            id: actions_1.$Ru.CommandPalette,
                        },
                    });
                }
                async run(accessor) {
                    const outputService = accessor.get(output_1.$eJ);
                    const quickInputService = accessor.get(quickInput_1.$Gq);
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
                        entries.push({ type: 'separator', label: nls.localize(17, null) });
                    }
                    for (const { id, label } of extensionLogs) {
                        entries.push({ id, label });
                    }
                    const entry = await quickInputService.pick(entries, { placeHolder: nls.localize(18, null) });
                    if (entry) {
                        return outputService.showChannel(entry.id);
                    }
                }
            }));
        }
        r() {
            this.B((0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id: 'workbench.action.openLogFile',
                        title: { value: nls.localize(19, null), original: 'Open Log File...' },
                        category: actionCommonCategories_1.$Nl.Developer,
                        menu: {
                            id: actions_1.$Ru.CommandPalette,
                        },
                        description: {
                            description: 'workbench.action.openLogFile',
                            args: [{
                                    name: 'logFile',
                                    schema: {
                                        markdownDescription: nls.localize(20, null),
                                        type: 'string'
                                    }
                                }]
                        },
                    });
                }
                async run(accessor, args) {
                    const outputService = accessor.get(output_1.$eJ);
                    const quickInputService = accessor.get(quickInput_1.$Gq);
                    const instantiationService = accessor.get(instantiation_1.$Ah);
                    const editorService = accessor.get(editorService_1.$9C);
                    const entries = outputService.getChannelDescriptors().filter(c => c.file && c.log)
                        .map(channel => ({ id: channel.id, label: channel.label, channel }));
                    const argName = args && typeof args === 'string' ? args : undefined;
                    let entry;
                    if (argName) {
                        entry = entries.find(e => e.id === argName);
                    }
                    if (!entry) {
                        entry = await quickInputService.pick(entries, { placeHolder: nls.localize(21, null) });
                    }
                    if (entry) {
                        (0, types_1.$uf)(entry.channel.file);
                        await editorService.openEditor(instantiationService.createInstance(logViewer_1.$nVb, entry.channel), { pinned: true });
                    }
                }
            }));
        }
    };
    OutputContribution = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, resolverService_1.$uA),
        __param(2, output_1.$eJ)
    ], OutputContribution);
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(OutputContribution, 3 /* LifecyclePhase.Restored */);
    platform_1.$8m.as(configurationRegistry_1.$an.Configuration).registerConfiguration({
        id: 'output',
        order: 30,
        title: nls.localize(22, null),
        type: 'object',
        properties: {
            'output.smartScroll.enabled': {
                type: 'boolean',
                description: nls.localize(23, null),
                default: true,
                scope: 3 /* ConfigurationScope.WINDOW */,
                tags: ['output']
            }
        }
    });
});
//# sourceMappingURL=output.contribution.js.map