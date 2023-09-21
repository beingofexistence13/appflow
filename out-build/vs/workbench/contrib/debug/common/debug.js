/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/debug/common/debug", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation"], function (require, exports, nls, contextkey_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BreakpointWidgetContext = exports.$nH = exports.DebuggerString = exports.DebugConfigurationProviderTriggerKind = exports.$mH = exports.MemoryRangeType = exports.$lH = exports.State = exports.$kH = exports.$jH = exports.$iH = exports.$hH = exports.$gH = exports.$fH = exports.$eH = exports.$dH = exports.$cH = exports.$bH = exports.$aH = exports.$_G = exports.$$G = exports.$0G = exports.$9G = exports.$8G = exports.$7G = exports.$6G = exports.$5G = exports.$4G = exports.$3G = exports.$2G = exports.$1G = exports.$ZG = exports.$YG = exports.$XG = exports.$WG = exports.$VG = exports.$UG = exports.$TG = exports.$SG = exports.$RG = exports.$QG = exports.$PG = exports.$OG = exports.$NG = exports.$MG = exports.$LG = exports.$KG = exports.$JG = exports.$IG = exports.$HG = exports.$GG = exports.$FG = exports.$EG = exports.$DG = exports.$CG = exports.$BG = exports.$AG = exports.$zG = exports.$yG = exports.$xG = exports.$wG = exports.$vG = exports.$uG = exports.$tG = exports.$sG = exports.$rG = exports.$qG = exports.$pG = exports.$oG = exports.$nG = exports.$mG = exports.$lG = exports.$kG = exports.$jG = void 0;
    exports.$jG = 'workbench.view.debug';
    exports.$kG = 'workbench.debug.variablesView';
    exports.$lG = 'workbench.debug.watchExpressionsView';
    exports.$mG = 'workbench.debug.callStackView';
    exports.$nG = 'workbench.debug.loadedScriptsView';
    exports.$oG = 'workbench.debug.breakPointsView';
    exports.$pG = 'workbench.debug.disassemblyView';
    exports.$qG = 'workbench.panel.repl';
    exports.$rG = 'workbench.panel.repl.view';
    exports.$sG = new contextkey_1.$2i('debugType', undefined, { type: 'string', description: nls.localize(0, null) });
    exports.$tG = new contextkey_1.$2i('debugConfigurationType', undefined, { type: 'string', description: nls.localize(1, null) });
    exports.$uG = new contextkey_1.$2i('debugState', 'inactive', { type: 'string', description: nls.localize(2, null) });
    exports.$vG = 'debugUx';
    exports.$wG = new contextkey_1.$2i(exports.$vG, 'default', { type: 'string', description: nls.localize(3, null) });
    exports.$xG = new contextkey_1.$2i('hasDebugged', false, { type: 'boolean', description: nls.localize(4, null) });
    exports.$yG = new contextkey_1.$2i('inDebugMode', false, { type: 'boolean', description: nls.localize(5, null) });
    exports.$zG = new contextkey_1.$2i('inDebugRepl', false, { type: 'boolean', description: nls.localize(6, null) });
    exports.$AG = new contextkey_1.$2i('breakpointWidgetVisible', false, { type: 'boolean', description: nls.localize(7, null) });
    exports.$BG = new contextkey_1.$2i('inBreakpointWidget', false, { type: 'boolean', description: nls.localize(8, null) });
    exports.$CG = new contextkey_1.$2i('breakpointsFocused', true, { type: 'boolean', description: nls.localize(9, null) });
    exports.$DG = new contextkey_1.$2i('watchExpressionsFocused', true, { type: 'boolean', description: nls.localize(10, null) });
    exports.$EG = new contextkey_1.$2i('watchExpressionsExist', false, { type: 'boolean', description: nls.localize(11, null) });
    exports.$FG = new contextkey_1.$2i('variablesFocused', true, { type: 'boolean', description: nls.localize(12, null) });
    exports.$GG = new contextkey_1.$2i('expressionSelected', false, { type: 'boolean', description: nls.localize(13, null) });
    exports.$HG = new contextkey_1.$2i('breakpointInputFocused', false, { type: 'boolean', description: nls.localize(14, null) });
    exports.$IG = new contextkey_1.$2i('callStackItemType', undefined, { type: 'string', description: nls.localize(15, null) });
    exports.$JG = new contextkey_1.$2i('callStackSessionIsAttach', false, { type: 'boolean', description: nls.localize(16, null) });
    exports.$KG = new contextkey_1.$2i('callStackItemStopped', false, { type: 'boolean', description: nls.localize(17, null) });
    exports.$LG = new contextkey_1.$2i('callStackSessionHasOneThread', false, { type: 'boolean', description: nls.localize(18, null) });
    exports.$MG = new contextkey_1.$2i('watchItemType', undefined, { type: 'string', description: nls.localize(19, null) });
    exports.$NG = new contextkey_1.$2i('canViewMemory', undefined, { type: 'boolean', description: nls.localize(20, null) });
    exports.$OG = new contextkey_1.$2i('breakpointItemType', undefined, { type: 'string', description: nls.localize(21, null) });
    exports.$PG = new contextkey_1.$2i('breakpointSupportsCondition', false, { type: 'boolean', description: nls.localize(22, null) });
    exports.$QG = new contextkey_1.$2i('loadedScriptsSupported', false, { type: 'boolean', description: nls.localize(23, null) });
    exports.$RG = new contextkey_1.$2i('loadedScriptsItemType', undefined, { type: 'string', description: nls.localize(24, null) });
    exports.$SG = new contextkey_1.$2i('focusedSessionIsAttach', false, { type: 'boolean', description: nls.localize(25, null) });
    exports.$TG = new contextkey_1.$2i('stepBackSupported', false, { type: 'boolean', description: nls.localize(26, null) });
    exports.$UG = new contextkey_1.$2i('restartFrameSupported', false, { type: 'boolean', description: nls.localize(27, null) });
    exports.$VG = new contextkey_1.$2i('stackFrameSupportsRestart', false, { type: 'boolean', description: nls.localize(28, null) });
    exports.$WG = new contextkey_1.$2i('jumpToCursorSupported', false, { type: 'boolean', description: nls.localize(29, null) });
    exports.$XG = new contextkey_1.$2i('stepIntoTargetsSupported', false, { type: 'boolean', description: nls.localize(30, null) });
    exports.$YG = new contextkey_1.$2i('breakpointsExist', false, { type: 'boolean', description: nls.localize(31, null) });
    exports.$ZG = new contextkey_1.$2i('debuggersAvailable', false, { type: 'boolean', description: nls.localize(32, null) });
    exports.$1G = new contextkey_1.$2i('debugExtensionAvailable', true, { type: 'boolean', description: nls.localize(33, null) });
    exports.$2G = new contextkey_1.$2i('debugProtocolVariableMenuContext', undefined, { type: 'string', description: nls.localize(34, null) });
    exports.$3G = new contextkey_1.$2i('debugSetVariableSupported', false, { type: 'boolean', description: nls.localize(35, null) });
    exports.$4G = new contextkey_1.$2i('debugSetExpressionSupported', false, { type: 'boolean', description: nls.localize(36, null) });
    exports.$5G = new contextkey_1.$2i('breakWhenValueChangesSupported', false, { type: 'boolean', description: nls.localize(37, null) });
    exports.$6G = new contextkey_1.$2i('breakWhenValueIsAccessedSupported', false, { type: 'boolean', description: nls.localize(38, null) });
    exports.$7G = new contextkey_1.$2i('breakWhenValueIsReadSupported', false, { type: 'boolean', description: nls.localize(39, null) });
    exports.$8G = new contextkey_1.$2i('terminateDebuggeeSupported', false, { type: 'boolean', description: nls.localize(40, null) });
    exports.$9G = new contextkey_1.$2i('suspendDebuggeeSupported', false, { type: 'boolean', description: nls.localize(41, null) });
    exports.$0G = new contextkey_1.$2i('variableEvaluateNamePresent', false, { type: 'boolean', description: nls.localize(42, null) });
    exports.$$G = new contextkey_1.$2i('variableIsReadonly', false, { type: 'boolean', description: nls.localize(43, null) });
    exports.$_G = new contextkey_1.$2i('exceptionWidgetVisible', false, { type: 'boolean', description: nls.localize(44, null) });
    exports.$aH = new contextkey_1.$2i('multiSessionRepl', false, { type: 'boolean', description: nls.localize(45, null) });
    exports.$bH = new contextkey_1.$2i('multiSessionDebug', false, { type: 'boolean', description: nls.localize(46, null) });
    exports.$cH = new contextkey_1.$2i('disassembleRequestSupported', false, { type: 'boolean', description: nls.localize(47, null) });
    exports.$dH = new contextkey_1.$2i('disassemblyViewFocus', false, { type: 'boolean', description: nls.localize(48, null) });
    exports.$eH = new contextkey_1.$2i('languageSupportsDisassembleRequest', false, { type: 'boolean', description: nls.localize(49, null) });
    exports.$fH = new contextkey_1.$2i('focusedStackFrameHasInstructionReference', false, { type: 'boolean', description: nls.localize(50, null) });
    const $gH = (debugType) => nls.localize(51, null, debugType);
    exports.$gH = $gH;
    exports.$hH = 'editor.contrib.debug';
    exports.$iH = 'editor.contrib.breakpoint';
    exports.$jH = 'debug';
    exports.$kH = {
        enum: ['neverOpen', 'openOnSessionStart', 'openOnFirstSessionStart'],
        default: 'openOnFirstSessionStart',
        description: nls.localize(52, null)
    };
    var State;
    (function (State) {
        State[State["Inactive"] = 0] = "Inactive";
        State[State["Initializing"] = 1] = "Initializing";
        State[State["Stopped"] = 2] = "Stopped";
        State[State["Running"] = 3] = "Running";
    })(State || (exports.State = State = {}));
    function $lH(state) {
        switch (state) {
            case 1 /* State.Initializing */: return 'initializing';
            case 2 /* State.Stopped */: return 'stopped';
            case 3 /* State.Running */: return 'running';
            default: return 'inactive';
        }
    }
    exports.$lH = $lH;
    var MemoryRangeType;
    (function (MemoryRangeType) {
        MemoryRangeType[MemoryRangeType["Valid"] = 0] = "Valid";
        MemoryRangeType[MemoryRangeType["Unreadable"] = 1] = "Unreadable";
        MemoryRangeType[MemoryRangeType["Error"] = 2] = "Error";
    })(MemoryRangeType || (exports.MemoryRangeType = MemoryRangeType = {}));
    exports.$mH = 'vscode-debug-memory';
    var DebugConfigurationProviderTriggerKind;
    (function (DebugConfigurationProviderTriggerKind) {
        /**
         *	`DebugConfigurationProvider.provideDebugConfigurations` is called to provide the initial debug configurations for a newly created launch.json.
         */
        DebugConfigurationProviderTriggerKind[DebugConfigurationProviderTriggerKind["Initial"] = 1] = "Initial";
        /**
         * `DebugConfigurationProvider.provideDebugConfigurations` is called to provide dynamically generated debug configurations when the user asks for them through the UI (e.g. via the "Select and Start Debugging" command).
         */
        DebugConfigurationProviderTriggerKind[DebugConfigurationProviderTriggerKind["Dynamic"] = 2] = "Dynamic";
    })(DebugConfigurationProviderTriggerKind || (exports.DebugConfigurationProviderTriggerKind = DebugConfigurationProviderTriggerKind = {}));
    var DebuggerString;
    (function (DebuggerString) {
        DebuggerString["UnverifiedBreakpoints"] = "unverifiedBreakpoints";
    })(DebuggerString || (exports.DebuggerString = DebuggerString = {}));
    // Debug service interfaces
    exports.$nH = (0, instantiation_1.$Bh)('debugService');
    // Editor interfaces
    var BreakpointWidgetContext;
    (function (BreakpointWidgetContext) {
        BreakpointWidgetContext[BreakpointWidgetContext["CONDITION"] = 0] = "CONDITION";
        BreakpointWidgetContext[BreakpointWidgetContext["HIT_COUNT"] = 1] = "HIT_COUNT";
        BreakpointWidgetContext[BreakpointWidgetContext["LOG_MESSAGE"] = 2] = "LOG_MESSAGE";
    })(BreakpointWidgetContext || (exports.BreakpointWidgetContext = BreakpointWidgetContext = {}));
});
//# sourceMappingURL=debug.js.map