/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/registry/common/platform", "vs/nls!vs/workbench/browser/parts/editor/editor.contribution", "vs/workbench/browser/editor", "vs/workbench/common/editor", "vs/workbench/common/contextkeys", "vs/workbench/common/editor/sideBySideEditorInput", "vs/workbench/browser/parts/editor/textResourceEditor", "vs/workbench/browser/parts/editor/sideBySideEditor", "vs/workbench/common/editor/diffEditorInput", "vs/workbench/services/untitled/common/untitledTextEditorInput", "vs/workbench/common/editor/textResourceEditorInput", "vs/workbench/browser/parts/editor/textDiffEditor", "vs/workbench/browser/parts/editor/binaryDiffEditor", "vs/workbench/browser/parts/editor/editorStatus", "vs/platform/action/common/actionCommonCategories", "vs/platform/actions/common/actions", "vs/platform/instantiation/common/descriptors", "vs/workbench/browser/parts/editor/editorActions", "vs/workbench/browser/parts/editor/editorCommands", "vs/workbench/browser/quickaccess", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/contextkey/common/contextkey", "vs/base/common/platform", "vs/editor/browser/editorExtensions", "vs/workbench/browser/codeeditor", "vs/workbench/common/contributions", "vs/workbench/browser/parts/editor/editorAutoSave", "vs/platform/quickinput/common/quickAccess", "vs/workbench/browser/parts/editor/editorQuickAccess", "vs/base/common/network", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry", "vs/workbench/services/untitled/common/untitledTextEditorHandler", "vs/workbench/browser/parts/editor/editorConfiguration", "vs/workbench/browser/actions/layoutActions"], function (require, exports, platform_1, nls_1, editor_1, editor_2, contextkeys_1, sideBySideEditorInput_1, textResourceEditor_1, sideBySideEditor_1, diffEditorInput_1, untitledTextEditorInput_1, textResourceEditorInput_1, textDiffEditor_1, binaryDiffEditor_1, editorStatus_1, actionCommonCategories_1, actions_1, descriptors_1, editorActions_1, editorCommands_1, quickaccess_1, keybindingsRegistry_1, contextkey_1, platform_2, editorExtensions_1, codeeditor_1, contributions_1, editorAutoSave_1, quickAccess_1, editorQuickAccess_1, network_1, codicons_1, iconRegistry_1, untitledTextEditorHandler_1, editorConfiguration_1, layoutActions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#region Editor Registrations
    platform_1.$8m.as(editor_2.$GE.EditorPane).registerEditorPane(editor_1.$_T.create(textResourceEditor_1.$Evb, textResourceEditor_1.$Evb.ID, (0, nls_1.localize)(0, null)), [
        new descriptors_1.$yh(untitledTextEditorInput_1.$Bvb),
        new descriptors_1.$yh(textResourceEditorInput_1.$7eb)
    ]);
    platform_1.$8m.as(editor_2.$GE.EditorPane).registerEditorPane(editor_1.$_T.create(textDiffEditor_1.$$tb, textDiffEditor_1.$$tb.ID, (0, nls_1.localize)(1, null)), [
        new descriptors_1.$yh(diffEditorInput_1.$3eb)
    ]);
    platform_1.$8m.as(editor_2.$GE.EditorPane).registerEditorPane(editor_1.$_T.create(binaryDiffEditor_1.$Kvb, binaryDiffEditor_1.$Kvb.ID, (0, nls_1.localize)(2, null)), [
        new descriptors_1.$yh(diffEditorInput_1.$3eb)
    ]);
    platform_1.$8m.as(editor_2.$GE.EditorPane).registerEditorPane(editor_1.$_T.create(sideBySideEditor_1.$dub, sideBySideEditor_1.$dub.ID, (0, nls_1.localize)(3, null)), [
        new descriptors_1.$yh(sideBySideEditorInput_1.$VC)
    ]);
    platform_1.$8m.as(editor_2.$GE.EditorFactory).registerEditorSerializer(untitledTextEditorInput_1.$Bvb.ID, untitledTextEditorHandler_1.$uxb);
    platform_1.$8m.as(editor_2.$GE.EditorFactory).registerEditorSerializer(sideBySideEditorInput_1.$VC.ID, sideBySideEditorInput_1.$XC);
    platform_1.$8m.as(editor_2.$GE.EditorFactory).registerEditorSerializer(diffEditorInput_1.$3eb.ID, diffEditorInput_1.$4eb);
    //#endregion
    //#region Workbench Contributions
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(editorAutoSave_1.$rxb, 2 /* LifecyclePhase.Ready */);
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(editorStatus_1.$Lvb, 2 /* LifecyclePhase.Ready */);
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(untitledTextEditorHandler_1.$vxb, 2 /* LifecyclePhase.Ready */);
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(editorConfiguration_1.$wxb, 2 /* LifecyclePhase.Ready */);
    (0, editorExtensions_1.$AV)(codeeditor_1.$srb.ID, codeeditor_1.$srb, 1 /* EditorContributionInstantiation.AfterFirstRender */);
    //#endregion
    //#region Quick Access
    const quickAccessRegistry = platform_1.$8m.as(quickAccess_1.$8p.Quickaccess);
    const editorPickerContextKey = 'inEditorsPicker';
    const editorPickerContext = contextkey_1.$Ii.and(quickaccess_1.$Vtb, contextkey_1.$Ii.has(editorPickerContextKey));
    quickAccessRegistry.registerQuickAccessProvider({
        ctor: editorQuickAccess_1.$aub,
        prefix: editorQuickAccess_1.$aub.PREFIX,
        contextKey: editorPickerContextKey,
        placeholder: (0, nls_1.localize)(4, null),
        helpEntries: [{ description: (0, nls_1.localize)(5, null), commandId: editorActions_1.$Kwb.ID }]
    });
    quickAccessRegistry.registerQuickAccessProvider({
        ctor: editorQuickAccess_1.$bub,
        prefix: editorQuickAccess_1.$bub.PREFIX,
        contextKey: editorPickerContextKey,
        placeholder: (0, nls_1.localize)(6, null),
        helpEntries: [{ description: (0, nls_1.localize)(7, null), commandId: editorActions_1.$Lwb.ID }]
    });
    quickAccessRegistry.registerQuickAccessProvider({
        ctor: editorQuickAccess_1.$cub,
        prefix: editorQuickAccess_1.$cub.PREFIX,
        contextKey: editorPickerContextKey,
        placeholder: (0, nls_1.localize)(8, null),
        helpEntries: [{ description: (0, nls_1.localize)(9, null), commandId: editorActions_1.$Mwb.ID }]
    });
    //#endregion
    //#region Actions & Commands
    // Editor Status
    (0, actions_1.$Xu)(editorStatus_1.$Nvb);
    (0, actions_1.$Xu)(editorStatus_1.$Ovb);
    (0, actions_1.$Xu)(editorStatus_1.$Pvb);
    // Editor Management (new style)
    (0, actions_1.$Xu)(editorActions_1.$xwb);
    (0, actions_1.$Xu)(editorActions_1.$ywb);
    (0, actions_1.$Xu)(editorActions_1.$rwb);
    (0, actions_1.$Xu)(editorActions_1.$swb);
    (0, actions_1.$Xu)(editorActions_1.$twb);
    (0, actions_1.$Xu)(editorActions_1.$uwb);
    (0, actions_1.$Xu)(editorActions_1.$vwb);
    (0, actions_1.$Xu)(editorActions_1.$wwb);
    (0, actions_1.$Xu)(editorActions_1.$Swb);
    (0, actions_1.$Xu)(editorActions_1.$Twb);
    (0, actions_1.$Xu)(editorActions_1.$Uwb);
    (0, actions_1.$Xu)(editorActions_1.$Vwb);
    (0, actions_1.$Xu)(editorActions_1.$Iwb);
    (0, actions_1.$Xu)(editorActions_1.$Jwb);
    (0, actions_1.$Xu)(editorActions_1.$Lwb);
    (0, actions_1.$Xu)(editorActions_1.$Mwb);
    (0, actions_1.$Xu)(editorActions_1.$Kwb);
    (0, actions_1.$Xu)(editorActions_1.$bwb);
    (0, actions_1.$Xu)(editorActions_1.$cwb);
    (0, actions_1.$Xu)(editorActions_1.$awb);
    (0, actions_1.$Xu)(editorActions_1.$dwb);
    (0, actions_1.$Xu)(editorActions_1.$ewb);
    (0, actions_1.$Xu)(editorActions_1.$_vb);
    (0, actions_1.$Xu)(editorActions_1.$Qvb);
    (0, actions_1.$Xu)(editorActions_1.$Rvb);
    (0, actions_1.$Xu)(editorActions_1.$Svb);
    (0, actions_1.$Xu)(editorActions_1.$Tvb);
    (0, actions_1.$Xu)(editorActions_1.$Uvb);
    (0, actions_1.$Xu)(editorActions_1.$Vvb);
    (0, actions_1.$Xu)(editorActions_1.$Wvb);
    (0, actions_1.$Xu)(editorActions_1.$Xvb);
    (0, actions_1.$Xu)(editorActions_1.$Yvb);
    (0, actions_1.$Xu)(editorActions_1.$owb);
    (0, actions_1.$Xu)(editorActions_1.$pwb);
    (0, actions_1.$Xu)(editorActions_1.$qwb);
    (0, actions_1.$Xu)(editorActions_1.$nwb);
    (0, actions_1.$Xu)(editorActions_1.$Xwb);
    (0, actions_1.$Xu)(editorActions_1.$Ywb);
    (0, actions_1.$Xu)(editorActions_1.$fwb);
    (0, actions_1.$Xu)(editorActions_1.$gwb);
    (0, actions_1.$Xu)(editorActions_1.$hwb);
    (0, actions_1.$Xu)(editorActions_1.$iwb);
    (0, actions_1.$Xu)(editorActions_1.$jwb);
    (0, actions_1.$Xu)(editorActions_1.$kwb);
    (0, actions_1.$Xu)(editorActions_1.$lwb);
    (0, actions_1.$Xu)(editorActions_1.$mwb);
    (0, actions_1.$Xu)(editorActions_1.$Zwb);
    (0, actions_1.$Xu)(editorActions_1.$1wb);
    (0, actions_1.$Xu)(editorActions_1.$6wb);
    (0, actions_1.$Xu)(editorActions_1.$7wb);
    (0, actions_1.$Xu)(editorActions_1.$4wb);
    (0, actions_1.$Xu)(editorActions_1.$5wb);
    (0, actions_1.$Xu)(editorActions_1.$2wb);
    (0, actions_1.$Xu)(editorActions_1.$3wb);
    (0, actions_1.$Xu)(editorActions_1.$8wb);
    (0, actions_1.$Xu)(editorActions_1.$9wb);
    (0, actions_1.$Xu)(editorActions_1.$bxb);
    (0, actions_1.$Xu)(editorActions_1.$cxb);
    (0, actions_1.$Xu)(editorActions_1.$_wb);
    (0, actions_1.$Xu)(editorActions_1.$axb);
    (0, actions_1.$Xu)(editorActions_1.$0wb);
    (0, actions_1.$Xu)(editorActions_1.$$wb);
    (0, actions_1.$Xu)(editorActions_1.$Zvb);
    (0, actions_1.$Xu)(editorActions_1.$1vb);
    (0, actions_1.$Xu)(editorActions_1.$2vb);
    (0, actions_1.$Xu)(editorActions_1.$4vb);
    (0, actions_1.$Xu)(editorActions_1.$3vb);
    (0, actions_1.$Xu)(editorActions_1.$5vb);
    (0, actions_1.$Xu)(editorActions_1.$6vb);
    (0, actions_1.$Xu)(editorActions_1.$7vb);
    (0, actions_1.$Xu)(editorActions_1.$8vb);
    (0, actions_1.$Xu)(editorActions_1.$lxb);
    (0, actions_1.$Xu)(editorActions_1.$mxb);
    (0, actions_1.$Xu)(editorActions_1.$nxb);
    (0, actions_1.$Xu)(editorActions_1.$oxb);
    (0, actions_1.$Xu)(editorActions_1.$zwb);
    (0, actions_1.$Xu)(editorActions_1.$Awb);
    (0, actions_1.$Xu)(editorActions_1.$Bwb);
    (0, actions_1.$Xu)(editorActions_1.$Cwb);
    (0, actions_1.$Xu)(editorActions_1.$Dwb);
    (0, actions_1.$Xu)(editorActions_1.$Ewb);
    (0, actions_1.$Xu)(editorActions_1.$Fwb);
    (0, actions_1.$Xu)(editorActions_1.$Gwb);
    (0, actions_1.$Xu)(editorActions_1.$Hwb);
    (0, actions_1.$Xu)(editorActions_1.$Wwb);
    (0, actions_1.$Xu)(editorActions_1.$dxb);
    (0, actions_1.$Xu)(editorActions_1.$exb);
    (0, actions_1.$Xu)(editorActions_1.$fxb);
    (0, actions_1.$Xu)(editorActions_1.$gxb);
    (0, actions_1.$Xu)(editorActions_1.$hxb);
    (0, actions_1.$Xu)(editorActions_1.$ixb);
    (0, actions_1.$Xu)(editorActions_1.$kxb);
    (0, actions_1.$Xu)(editorActions_1.$jxb);
    (0, actions_1.$Xu)(editorActions_1.$pxb);
    (0, actions_1.$Xu)(editorActions_1.$qxb);
    (0, actions_1.$Xu)(editorActions_1.$Nwb);
    (0, actions_1.$Xu)(editorActions_1.$Owb);
    (0, actions_1.$Xu)(editorActions_1.$Pwb);
    (0, actions_1.$Xu)(editorActions_1.$Qwb);
    (0, actions_1.$Xu)(editorActions_1.$Rwb);
    const quickAccessNavigateNextInEditorPickerId = 'workbench.action.quickOpenNavigateNextInEditorPicker';
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: quickAccessNavigateNextInEditorPickerId,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 50,
        handler: (0, quickaccess_1.$Ytb)(quickAccessNavigateNextInEditorPickerId, true),
        when: editorPickerContext,
        primary: 2048 /* KeyMod.CtrlCmd */ | 2 /* KeyCode.Tab */,
        mac: { primary: 256 /* KeyMod.WinCtrl */ | 2 /* KeyCode.Tab */ }
    });
    const quickAccessNavigatePreviousInEditorPickerId = 'workbench.action.quickOpenNavigatePreviousInEditorPicker';
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: quickAccessNavigatePreviousInEditorPickerId,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 50,
        handler: (0, quickaccess_1.$Ytb)(quickAccessNavigatePreviousInEditorPickerId, false),
        when: editorPickerContext,
        primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 2 /* KeyCode.Tab */,
        mac: { primary: 256 /* KeyMod.WinCtrl */ | 1024 /* KeyMod.Shift */ | 2 /* KeyCode.Tab */ }
    });
    (0, editorCommands_1.$2ub)();
    //#endregion Workbench Actions
    //#region Menus
    // macOS: Touchbar
    if (platform_2.$j) {
        actions_1.$Tu.appendMenuItem(actions_1.$Ru.TouchBarContext, {
            command: { id: editorActions_1.$ywb.ID, title: editorActions_1.$ywb.LABEL, icon: { dark: network_1.$2f.asFileUri('vs/workbench/browser/parts/editor/media/back-tb.png') } },
            group: 'navigation',
            order: 0
        });
        actions_1.$Tu.appendMenuItem(actions_1.$Ru.TouchBarContext, {
            command: { id: editorActions_1.$xwb.ID, title: editorActions_1.$xwb.LABEL, icon: { dark: network_1.$2f.asFileUri('vs/workbench/browser/parts/editor/media/forward-tb.png') } },
            group: 'navigation',
            order: 1
        });
    }
    // Empty Editor Group Toolbar
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EmptyEditorGroup, { command: { id: editorCommands_1.$tub, title: (0, nls_1.localize)(10, null), icon: codicons_1.$Pj.lock }, group: 'navigation', order: 10, when: contextkeys_1.$hdb });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EmptyEditorGroup, { command: { id: editorCommands_1.$kub, title: (0, nls_1.localize)(11, null), icon: codicons_1.$Pj.close }, group: 'navigation', order: 20 });
    // Empty Editor Group Context Menu
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EmptyEditorGroupContext, { command: { id: editorCommands_1.$Gub, title: (0, nls_1.localize)(12, null) }, group: '2_split', order: 10 });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EmptyEditorGroupContext, { command: { id: editorCommands_1.$Hub, title: (0, nls_1.localize)(13, null) }, group: '2_split', order: 20 });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EmptyEditorGroupContext, { command: { id: editorCommands_1.$Iub, title: (0, nls_1.localize)(14, null) }, group: '2_split', order: 30 });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EmptyEditorGroupContext, { command: { id: editorCommands_1.$Jub, title: (0, nls_1.localize)(15, null) }, group: '2_split', order: 40 });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EmptyEditorGroupContext, { command: { id: editorCommands_1.$rub, title: (0, nls_1.localize)(16, null), toggled: contextkeys_1.$hdb }, group: '3_lock', order: 10, when: contextkeys_1.$idb });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EmptyEditorGroupContext, { command: { id: editorCommands_1.$kub, title: (0, nls_1.localize)(17, null) }, group: '4_close', order: 10, when: contextkeys_1.$idb });
    // Editor Tab Container Context Menu
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorTabsBarContext, { command: { id: editorCommands_1.$Gub, title: (0, nls_1.localize)(18, null) }, group: '2_split', order: 10 });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorTabsBarContext, { command: { id: editorCommands_1.$Hub, title: (0, nls_1.localize)(19, null) }, group: '2_split', order: 20 });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorTabsBarContext, { command: { id: editorCommands_1.$Iub, title: (0, nls_1.localize)(20, null) }, group: '2_split', order: 30 });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorTabsBarContext, { command: { id: editorCommands_1.$Jub, title: (0, nls_1.localize)(21, null) }, group: '2_split', order: 40 });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorTabsBarContext, { command: { id: layoutActions_1.$Stb.ID, title: (0, nls_1.localize)(22, null), toggled: contextkey_1.$Ii.has('config.workbench.editor.showTabs') }, group: '3_config', order: 10 });
    // Editor Title Context Menu
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorTitleContext, { command: { id: editorCommands_1.$iub, title: (0, nls_1.localize)(23, null) }, group: '1_close', order: 10 });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorTitleContext, { command: { id: editorCommands_1.$lub, title: (0, nls_1.localize)(24, null), precondition: contextkeys_1.$ddb.notEqualsTo('1') }, group: '1_close', order: 20 });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorTitleContext, { command: { id: editorCommands_1.$hub, title: (0, nls_1.localize)(25, null), precondition: contextkeys_1.$5cb.toNegated() }, group: '1_close', order: 30, when: contextkeys_1.$pdb });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorTitleContext, { command: { id: editorCommands_1.$eub, title: (0, nls_1.localize)(26, null) }, group: '1_close', order: 40 });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorTitleContext, { command: { id: editorCommands_1.$fub, title: (0, nls_1.localize)(27, null) }, group: '1_close', order: 50 });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorTitleContext, { command: { id: editorCommands_1.$vub, title: (0, nls_1.localize)(28, null) }, group: '1_open', order: 10, when: contextkeys_1.$_cb });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorTitleContext, { command: { id: editorCommands_1.$pub, title: (0, nls_1.localize)(29, null), precondition: contextkeys_1.$3cb.toNegated() }, group: '3_preview', order: 10, when: contextkey_1.$Ii.has('config.workbench.editor.enablePreview') });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorTitleContext, { command: { id: editorCommands_1.$wub, title: (0, nls_1.localize)(30, null) }, group: '3_preview', order: 20, when: contextkeys_1.$6cb.toNegated() });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorTitleContext, { command: { id: editorCommands_1.$xub, title: (0, nls_1.localize)(31, null) }, group: '3_preview', order: 20, when: contextkeys_1.$6cb });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorTitleContext, { command: { id: editorCommands_1.$Gub, title: (0, nls_1.localize)(32, null) }, group: '5_split', order: 10 });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorTitleContext, { command: { id: editorCommands_1.$Hub, title: (0, nls_1.localize)(33, null) }, group: '5_split', order: 20 });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorTitleContext, { command: { id: editorCommands_1.$Iub, title: (0, nls_1.localize)(34, null) }, group: '5_split', order: 30 });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorTitleContext, { command: { id: editorCommands_1.$Jub, title: (0, nls_1.localize)(35, null) }, group: '5_split', order: 40 });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorTitleContext, { command: { id: editorCommands_1.$Kub, title: (0, nls_1.localize)(36, null) }, group: '6_split_in_group', order: 10, when: contextkeys_1.$0cb });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorTitleContext, { command: { id: editorCommands_1.$Mub, title: (0, nls_1.localize)(37, null) }, group: '6_split_in_group', order: 10, when: contextkeys_1.$cdb });
    // Editor Title Menu
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorTitle, { command: { id: editorCommands_1.$yub, title: (0, nls_1.localize)(38, null), toggled: contextkey_1.$Ii.equals('config.diffEditor.renderSideBySide', false) }, group: '1_diff', order: 10, when: contextkey_1.$Ii.has('isInDiffEditor') });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorTitle, { command: { id: editorCommands_1.$uub, title: (0, nls_1.localize)(39, null) }, group: '3_open', order: 10 });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorTitle, { command: { id: editorCommands_1.$fub, title: (0, nls_1.localize)(40, null) }, group: '5_close', order: 10 });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorTitle, { command: { id: editorCommands_1.$eub, title: (0, nls_1.localize)(41, null) }, group: '5_close', order: 20 });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorTitle, { command: { id: layoutActions_1.$Stb.ID, title: (0, nls_1.localize)(42, null), toggled: contextkey_1.$Ii.has('config.workbench.editor.showTabs') }, group: '7_settings', order: 5, when: contextkey_1.$Ii.has('config.workbench.editor.showTabs').negate() /* only shown here when tabs are disabled */ });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorTitle, { command: { id: editorCommands_1.$qub, title: (0, nls_1.localize)(43, null), toggled: contextkey_1.$Ii.has('config.workbench.editor.enablePreview') }, group: '7_settings', order: 10 });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorTitle, { command: { id: editorCommands_1.$rub, title: (0, nls_1.localize)(44, null), toggled: contextkeys_1.$hdb }, group: '8_lock', order: 10, when: contextkeys_1.$idb });
    function appendEditorToolItem(primary, when, order, alternative, precondition) {
        const item = {
            command: {
                id: primary.id,
                title: primary.title,
                icon: primary.icon,
                precondition
            },
            group: 'navigation',
            when,
            order
        };
        if (alternative) {
            item.alt = {
                id: alternative.id,
                title: alternative.title,
                icon: alternative.icon
            };
        }
        actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorTitle, item);
    }
    const SPLIT_ORDER = 100000; // towards the end
    const CLOSE_ORDER = 1000000; // towards the far end
    // Editor Title Menu: Split Editor
    appendEditorToolItem({
        id: editorActions_1.$Qvb.ID,
        title: (0, nls_1.localize)(45, null),
        icon: codicons_1.$Pj.splitHorizontal
    }, contextkey_1.$Ii.not('splitEditorsVertically'), SPLIT_ORDER, {
        id: editorCommands_1.$Hub,
        title: (0, nls_1.localize)(46, null),
        icon: codicons_1.$Pj.splitVertical
    });
    appendEditorToolItem({
        id: editorActions_1.$Qvb.ID,
        title: (0, nls_1.localize)(47, null),
        icon: codicons_1.$Pj.splitVertical
    }, contextkey_1.$Ii.has('splitEditorsVertically'), SPLIT_ORDER, {
        id: editorCommands_1.$Jub,
        title: (0, nls_1.localize)(48, null),
        icon: codicons_1.$Pj.splitHorizontal
    });
    // Side by side: layout
    appendEditorToolItem({
        id: editorCommands_1.$Nub,
        title: (0, nls_1.localize)(49, null),
        icon: codicons_1.$Pj.editorLayout
    }, contextkeys_1.$cdb, SPLIT_ORDER - 1);
    // Editor Title Menu: Close (tabs disabled, normal editor)
    appendEditorToolItem({
        id: editorCommands_1.$iub,
        title: (0, nls_1.localize)(50, null),
        icon: codicons_1.$Pj.close
    }, contextkey_1.$Ii.and(contextkeys_1.$pdb.toNegated(), contextkeys_1.$2cb.toNegated(), contextkeys_1.$6cb.toNegated()), CLOSE_ORDER, {
        id: editorCommands_1.$fub,
        title: (0, nls_1.localize)(51, null),
        icon: codicons_1.$Pj.closeAll
    });
    // Editor Title Menu: Close (tabs disabled, dirty editor)
    appendEditorToolItem({
        id: editorCommands_1.$iub,
        title: (0, nls_1.localize)(52, null),
        icon: codicons_1.$Pj.closeDirty
    }, contextkey_1.$Ii.and(contextkeys_1.$pdb.toNegated(), contextkeys_1.$2cb, contextkeys_1.$6cb.toNegated()), CLOSE_ORDER, {
        id: editorCommands_1.$fub,
        title: (0, nls_1.localize)(53, null),
        icon: codicons_1.$Pj.closeAll
    });
    // Editor Title Menu: Close (tabs disabled, sticky editor)
    appendEditorToolItem({
        id: editorCommands_1.$xub,
        title: (0, nls_1.localize)(54, null),
        icon: codicons_1.$Pj.pinned
    }, contextkey_1.$Ii.and(contextkeys_1.$pdb.toNegated(), contextkeys_1.$2cb.toNegated(), contextkeys_1.$6cb), CLOSE_ORDER, {
        id: editorCommands_1.$iub,
        title: (0, nls_1.localize)(55, null),
        icon: codicons_1.$Pj.close
    });
    // Editor Title Menu: Close (tabs disabled, dirty & sticky editor)
    appendEditorToolItem({
        id: editorCommands_1.$xub,
        title: (0, nls_1.localize)(56, null),
        icon: codicons_1.$Pj.pinnedDirty
    }, contextkey_1.$Ii.and(contextkeys_1.$pdb.toNegated(), contextkeys_1.$2cb, contextkeys_1.$6cb), CLOSE_ORDER, {
        id: editorCommands_1.$iub,
        title: (0, nls_1.localize)(57, null),
        icon: codicons_1.$Pj.close
    });
    // Unlock Group: only when group is locked
    appendEditorToolItem({
        id: editorCommands_1.$tub,
        title: (0, nls_1.localize)(58, null),
        icon: codicons_1.$Pj.lock
    }, contextkeys_1.$hdb, CLOSE_ORDER - 1);
    const previousChangeIcon = (0, iconRegistry_1.$9u)('diff-editor-previous-change', codicons_1.$Pj.arrowUp, (0, nls_1.localize)(59, null));
    const nextChangeIcon = (0, iconRegistry_1.$9u)('diff-editor-next-change', codicons_1.$Pj.arrowDown, (0, nls_1.localize)(60, null));
    const toggleWhitespace = (0, iconRegistry_1.$9u)('diff-editor-toggle-whitespace', codicons_1.$Pj.whitespace, (0, nls_1.localize)(61, null));
    // Diff Editor Title Menu: Previous Change
    appendEditorToolItem({
        id: editorCommands_1.$Aub,
        title: (0, nls_1.localize)(62, null),
        icon: previousChangeIcon
    }, contextkeys_1.$bdb, 10);
    // Diff Editor Title Menu: Next Change
    appendEditorToolItem({
        id: editorCommands_1.$zub,
        title: (0, nls_1.localize)(63, null),
        icon: nextChangeIcon
    }, contextkeys_1.$bdb, 11);
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorTitle, {
        command: {
            id: editorCommands_1.$Fub,
            title: (0, nls_1.localize)(64, null),
            icon: toggleWhitespace,
            precondition: contextkeys_1.$bdb,
            toggled: contextkey_1.$Ii.equals('config.diffEditor.ignoreTrimWhitespace', false),
        },
        group: 'navigation',
        when: contextkeys_1.$bdb,
        order: 20,
    });
    // Editor Commands for Command Palette
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.CommandPalette, { command: { id: editorCommands_1.$pub, title: { value: (0, nls_1.localize)(65, null), original: 'Keep Editor' }, category: actionCommonCategories_1.$Nl.View }, when: contextkey_1.$Ii.has('config.workbench.editor.enablePreview') });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.CommandPalette, { command: { id: editorCommands_1.$wub, title: { value: (0, nls_1.localize)(66, null), original: 'Pin Editor' }, category: actionCommonCategories_1.$Nl.View } });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.CommandPalette, { command: { id: editorCommands_1.$xub, title: { value: (0, nls_1.localize)(67, null), original: 'Unpin Editor' }, category: actionCommonCategories_1.$Nl.View } });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.CommandPalette, { command: { id: editorCommands_1.$iub, title: { value: (0, nls_1.localize)(68, null), original: 'Close Editor' }, category: actionCommonCategories_1.$Nl.View } });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.CommandPalette, { command: { id: editorCommands_1.$jub, title: { value: (0, nls_1.localize)(69, null), original: 'Close Pinned Editor' }, category: actionCommonCategories_1.$Nl.View } });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.CommandPalette, { command: { id: editorCommands_1.$fub, title: { value: (0, nls_1.localize)(70, null), original: 'Close All Editors in Group' }, category: actionCommonCategories_1.$Nl.View } });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.CommandPalette, { command: { id: editorCommands_1.$eub, title: { value: (0, nls_1.localize)(71, null), original: 'Close Saved Editors in Group' }, category: actionCommonCategories_1.$Nl.View } });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.CommandPalette, { command: { id: editorCommands_1.$lub, title: { value: (0, nls_1.localize)(72, null), original: 'Close Other Editors in Group' }, category: actionCommonCategories_1.$Nl.View } });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.CommandPalette, { command: { id: editorCommands_1.$hub, title: { value: (0, nls_1.localize)(73, null), original: 'Close Editors to the Right in Group' }, category: actionCommonCategories_1.$Nl.View }, when: contextkeys_1.$5cb.toNegated() });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.CommandPalette, { command: { id: editorCommands_1.$gub, title: { value: (0, nls_1.localize)(74, null), original: 'Close Editor Group' }, category: actionCommonCategories_1.$Nl.View }, when: contextkeys_1.$idb });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.CommandPalette, { command: { id: editorCommands_1.$vub, title: { value: (0, nls_1.localize)(75, null), original: 'Reopen Editor With...' }, category: actionCommonCategories_1.$Nl.View }, when: contextkeys_1.$_cb });
    // File menu
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarRecentMenu, {
        group: '1_editor',
        command: {
            id: editorActions_1.$Iwb.ID,
            title: (0, nls_1.localize)(76, null),
            precondition: contextkey_1.$Ii.has('canReopenClosedEditor')
        },
        order: 1
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarRecentMenu, {
        group: 'z_clear',
        command: {
            id: editorActions_1.$Jwb.ID,
            title: (0, nls_1.localize)(77, null)
        },
        order: 1
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarFileMenu, {
        title: (0, nls_1.localize)(78, null),
        submenu: actions_1.$Ru.MenubarShare,
        group: '45_share',
        order: 1,
    });
    // Layout menu
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarViewMenu, {
        group: '2_appearance',
        title: (0, nls_1.localize)(79, null),
        submenu: actions_1.$Ru.MenubarLayoutMenu,
        order: 2
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarLayoutMenu, {
        group: '1_split',
        command: {
            id: editorCommands_1.$Gub,
            title: {
                original: 'Split Up',
                value: (0, nls_1.localize)(80, null),
                mnemonicTitle: (0, nls_1.localize)(81, null),
            }
        },
        order: 1
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarLayoutMenu, {
        group: '1_split',
        command: {
            id: editorCommands_1.$Hub,
            title: {
                original: 'Split Down',
                value: (0, nls_1.localize)(82, null),
                mnemonicTitle: (0, nls_1.localize)(83, null)
            }
        },
        order: 2
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarLayoutMenu, {
        group: '1_split',
        command: {
            id: editorCommands_1.$Iub,
            title: {
                original: 'Split Left',
                value: (0, nls_1.localize)(84, null),
                mnemonicTitle: (0, nls_1.localize)(85, null)
            }
        },
        order: 3
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarLayoutMenu, {
        group: '1_split',
        command: {
            id: editorCommands_1.$Jub,
            title: {
                original: 'Split Right',
                value: (0, nls_1.localize)(86, null),
                mnemonicTitle: (0, nls_1.localize)(87, null)
            }
        },
        order: 4
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarLayoutMenu, {
        group: '2_split_in_group',
        command: {
            id: editorCommands_1.$Kub,
            title: {
                original: 'Split in Group',
                value: (0, nls_1.localize)(88, null),
                mnemonicTitle: (0, nls_1.localize)(89, null)
            }
        },
        when: contextkeys_1.$0cb,
        order: 1
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarLayoutMenu, {
        group: '2_split_in_group',
        command: {
            id: editorCommands_1.$Mub,
            title: {
                original: 'Join in Group',
                value: (0, nls_1.localize)(90, null),
                mnemonicTitle: (0, nls_1.localize)(91, null)
            }
        },
        when: contextkeys_1.$cdb,
        order: 1
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarLayoutMenu, {
        group: '3_layouts',
        command: {
            id: editorActions_1.$dxb.ID,
            title: {
                original: 'Single',
                value: (0, nls_1.localize)(92, null),
                mnemonicTitle: (0, nls_1.localize)(93, null)
            }
        },
        order: 1
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarLayoutMenu, {
        group: '3_layouts',
        command: {
            id: editorActions_1.$exb.ID,
            title: {
                original: 'Two Columns',
                value: (0, nls_1.localize)(94, null),
                mnemonicTitle: (0, nls_1.localize)(95, null)
            }
        },
        order: 3
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarLayoutMenu, {
        group: '3_layouts',
        command: {
            id: editorActions_1.$fxb.ID,
            title: {
                original: 'Three Columns',
                value: (0, nls_1.localize)(96, null),
                mnemonicTitle: (0, nls_1.localize)(97, null)
            }
        },
        order: 4
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarLayoutMenu, {
        group: '3_layouts',
        command: {
            id: editorActions_1.$gxb.ID,
            title: {
                original: 'Two Rows',
                value: (0, nls_1.localize)(98, null),
                mnemonicTitle: (0, nls_1.localize)(99, null)
            }
        },
        order: 5
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarLayoutMenu, {
        group: '3_layouts',
        command: {
            id: editorActions_1.$hxb.ID,
            title: {
                original: 'Three Rows',
                value: (0, nls_1.localize)(100, null),
                mnemonicTitle: (0, nls_1.localize)(101, null)
            }
        },
        order: 6
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarLayoutMenu, {
        group: '3_layouts',
        command: {
            id: editorActions_1.$ixb.ID,
            title: {
                original: 'Grid (2x2)',
                value: (0, nls_1.localize)(102, null),
                mnemonicTitle: (0, nls_1.localize)(103, null)
            }
        },
        order: 7
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarLayoutMenu, {
        group: '3_layouts',
        command: {
            id: editorActions_1.$kxb.ID,
            title: {
                original: 'Two Rows Right',
                value: (0, nls_1.localize)(104, null),
                mnemonicTitle: (0, nls_1.localize)(105, null)
            }
        },
        order: 8
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarLayoutMenu, {
        group: '3_layouts',
        command: {
            id: editorActions_1.$jxb.ID,
            title: {
                original: 'Two Columns Bottom',
                value: (0, nls_1.localize)(106, null),
                mnemonicTitle: (0, nls_1.localize)(107, null)
            }
        },
        order: 9
    });
    // Main Menu Bar Contributions:
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarGoMenu, {
        group: '1_history_nav',
        command: {
            id: 'workbench.action.navigateToLastEditLocation',
            title: (0, nls_1.localize)(108, null),
            precondition: contextkey_1.$Ii.has('canNavigateToLastEditLocation')
        },
        order: 3
    });
    // Switch Editor
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarSwitchEditorMenu, {
        group: '1_sideBySide',
        command: {
            id: editorCommands_1.$Oub,
            title: (0, nls_1.localize)(109, null)
        },
        when: contextkey_1.$Ii.or(contextkeys_1.$cdb, contextkeys_1.$bdb),
        order: 1
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarSwitchEditorMenu, {
        group: '1_sideBySide',
        command: {
            id: editorCommands_1.$Pub,
            title: (0, nls_1.localize)(110, null)
        },
        when: contextkey_1.$Ii.or(contextkeys_1.$cdb, contextkeys_1.$bdb),
        order: 2
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarSwitchEditorMenu, {
        group: '2_any',
        command: {
            id: 'workbench.action.nextEditor',
            title: (0, nls_1.localize)(111, null)
        },
        order: 1
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarSwitchEditorMenu, {
        group: '2_any',
        command: {
            id: 'workbench.action.previousEditor',
            title: (0, nls_1.localize)(112, null)
        },
        order: 2
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarSwitchEditorMenu, {
        group: '3_any_used',
        command: {
            id: 'workbench.action.openNextRecentlyUsedEditor',
            title: (0, nls_1.localize)(113, null)
        },
        order: 1
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarSwitchEditorMenu, {
        group: '3_any_used',
        command: {
            id: 'workbench.action.openPreviousRecentlyUsedEditor',
            title: (0, nls_1.localize)(114, null)
        },
        order: 2
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarSwitchEditorMenu, {
        group: '4_group',
        command: {
            id: 'workbench.action.nextEditorInGroup',
            title: (0, nls_1.localize)(115, null)
        },
        order: 1
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarSwitchEditorMenu, {
        group: '4_group',
        command: {
            id: 'workbench.action.previousEditorInGroup',
            title: (0, nls_1.localize)(116, null)
        },
        order: 2
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarSwitchEditorMenu, {
        group: '5_group_used',
        command: {
            id: 'workbench.action.openNextRecentlyUsedEditorInGroup',
            title: (0, nls_1.localize)(117, null)
        },
        order: 1
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarSwitchEditorMenu, {
        group: '5_group_used',
        command: {
            id: 'workbench.action.openPreviousRecentlyUsedEditorInGroup',
            title: (0, nls_1.localize)(118, null)
        },
        order: 2
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarGoMenu, {
        group: '2_editor_nav',
        title: (0, nls_1.localize)(119, null),
        submenu: actions_1.$Ru.MenubarSwitchEditorMenu,
        order: 1
    });
    // Switch Group
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarSwitchGroupMenu, {
        group: '1_focus_index',
        command: {
            id: 'workbench.action.focusFirstEditorGroup',
            title: (0, nls_1.localize)(120, null)
        },
        order: 1
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarSwitchGroupMenu, {
        group: '1_focus_index',
        command: {
            id: 'workbench.action.focusSecondEditorGroup',
            title: (0, nls_1.localize)(121, null)
        },
        order: 2
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarSwitchGroupMenu, {
        group: '1_focus_index',
        command: {
            id: 'workbench.action.focusThirdEditorGroup',
            title: (0, nls_1.localize)(122, null),
            precondition: contextkeys_1.$idb
        },
        order: 3
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarSwitchGroupMenu, {
        group: '1_focus_index',
        command: {
            id: 'workbench.action.focusFourthEditorGroup',
            title: (0, nls_1.localize)(123, null),
            precondition: contextkeys_1.$idb
        },
        order: 4
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarSwitchGroupMenu, {
        group: '1_focus_index',
        command: {
            id: 'workbench.action.focusFifthEditorGroup',
            title: (0, nls_1.localize)(124, null),
            precondition: contextkeys_1.$idb
        },
        order: 5
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarSwitchGroupMenu, {
        group: '2_next_prev',
        command: {
            id: 'workbench.action.focusNextGroup',
            title: (0, nls_1.localize)(125, null),
            precondition: contextkeys_1.$idb
        },
        order: 1
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarSwitchGroupMenu, {
        group: '2_next_prev',
        command: {
            id: 'workbench.action.focusPreviousGroup',
            title: (0, nls_1.localize)(126, null),
            precondition: contextkeys_1.$idb
        },
        order: 2
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarSwitchGroupMenu, {
        group: '3_directional',
        command: {
            id: 'workbench.action.focusLeftGroup',
            title: (0, nls_1.localize)(127, null),
            precondition: contextkeys_1.$idb
        },
        order: 1
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarSwitchGroupMenu, {
        group: '3_directional',
        command: {
            id: 'workbench.action.focusRightGroup',
            title: (0, nls_1.localize)(128, null),
            precondition: contextkeys_1.$idb
        },
        order: 2
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarSwitchGroupMenu, {
        group: '3_directional',
        command: {
            id: 'workbench.action.focusAboveGroup',
            title: (0, nls_1.localize)(129, null),
            precondition: contextkeys_1.$idb
        },
        order: 3
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarSwitchGroupMenu, {
        group: '3_directional',
        command: {
            id: 'workbench.action.focusBelowGroup',
            title: (0, nls_1.localize)(130, null),
            precondition: contextkeys_1.$idb
        },
        order: 4
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarGoMenu, {
        group: '2_editor_nav',
        title: (0, nls_1.localize)(131, null),
        submenu: actions_1.$Ru.MenubarSwitchGroupMenu,
        order: 2
    });
});
//#endregion
//# sourceMappingURL=editor.contribution.js.map