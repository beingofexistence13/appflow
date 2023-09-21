/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/nls!vs/workbench/contrib/debug/browser/debugIcons", "vs/platform/theme/common/iconRegistry"], function (require, exports, codicons_1, nls_1, iconRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Anb = exports.$znb = exports.$ynb = exports.$xnb = exports.$wnb = exports.$vnb = exports.$unb = exports.$tnb = exports.$snb = exports.$rnb = exports.$qnb = exports.$pnb = exports.$onb = exports.$nnb = exports.$mnb = exports.$lnb = exports.$knb = exports.$jnb = exports.$inb = exports.$hnb = exports.$gnb = exports.$fnb = exports.$enb = exports.$dnb = exports.$cnb = exports.$bnb = exports.$anb = exports.$_mb = exports.$$mb = exports.$0mb = exports.$9mb = exports.$8mb = exports.$7mb = exports.$6mb = exports.$5mb = exports.$4mb = exports.$3mb = exports.$2mb = exports.$1mb = exports.$Zmb = exports.$Ymb = exports.$Xmb = exports.$Wmb = exports.$Vmb = exports.$Umb = exports.$Tmb = void 0;
    exports.$Tmb = (0, iconRegistry_1.$9u)('debug-console-view-icon', codicons_1.$Pj.debugConsole, (0, nls_1.localize)(0, null));
    exports.$Umb = (0, iconRegistry_1.$9u)('run-view-icon', codicons_1.$Pj.debugAlt, (0, nls_1.localize)(1, null));
    exports.$Vmb = (0, iconRegistry_1.$9u)('variables-view-icon', codicons_1.$Pj.debugAlt, (0, nls_1.localize)(2, null));
    exports.$Wmb = (0, iconRegistry_1.$9u)('watch-view-icon', codicons_1.$Pj.debugAlt, (0, nls_1.localize)(3, null));
    exports.$Xmb = (0, iconRegistry_1.$9u)('callstack-view-icon', codicons_1.$Pj.debugAlt, (0, nls_1.localize)(4, null));
    exports.$Ymb = (0, iconRegistry_1.$9u)('breakpoints-view-icon', codicons_1.$Pj.debugAlt, (0, nls_1.localize)(5, null));
    exports.$Zmb = (0, iconRegistry_1.$9u)('loaded-scripts-view-icon', codicons_1.$Pj.debugAlt, (0, nls_1.localize)(6, null));
    exports.$1mb = {
        regular: (0, iconRegistry_1.$9u)('debug-breakpoint', codicons_1.$Pj.debugBreakpoint, (0, nls_1.localize)(7, null)),
        disabled: (0, iconRegistry_1.$9u)('debug-breakpoint-disabled', codicons_1.$Pj.debugBreakpointDisabled, (0, nls_1.localize)(8, null)),
        unverified: (0, iconRegistry_1.$9u)('debug-breakpoint-unverified', codicons_1.$Pj.debugBreakpointUnverified, (0, nls_1.localize)(9, null))
    };
    exports.$2mb = {
        regular: (0, iconRegistry_1.$9u)('debug-breakpoint-function', codicons_1.$Pj.debugBreakpointFunction, (0, nls_1.localize)(10, null)),
        disabled: (0, iconRegistry_1.$9u)('debug-breakpoint-function-disabled', codicons_1.$Pj.debugBreakpointFunctionDisabled, (0, nls_1.localize)(11, null)),
        unverified: (0, iconRegistry_1.$9u)('debug-breakpoint-function-unverified', codicons_1.$Pj.debugBreakpointFunctionUnverified, (0, nls_1.localize)(12, null))
    };
    exports.$3mb = {
        regular: (0, iconRegistry_1.$9u)('debug-breakpoint-conditional', codicons_1.$Pj.debugBreakpointConditional, (0, nls_1.localize)(13, null)),
        disabled: (0, iconRegistry_1.$9u)('debug-breakpoint-conditional-disabled', codicons_1.$Pj.debugBreakpointConditionalDisabled, (0, nls_1.localize)(14, null)),
        unverified: (0, iconRegistry_1.$9u)('debug-breakpoint-conditional-unverified', codicons_1.$Pj.debugBreakpointConditionalUnverified, (0, nls_1.localize)(15, null))
    };
    exports.$4mb = {
        regular: (0, iconRegistry_1.$9u)('debug-breakpoint-data', codicons_1.$Pj.debugBreakpointData, (0, nls_1.localize)(16, null)),
        disabled: (0, iconRegistry_1.$9u)('debug-breakpoint-data-disabled', codicons_1.$Pj.debugBreakpointDataDisabled, (0, nls_1.localize)(17, null)),
        unverified: (0, iconRegistry_1.$9u)('debug-breakpoint-data-unverified', codicons_1.$Pj.debugBreakpointDataUnverified, (0, nls_1.localize)(18, null)),
    };
    exports.$5mb = {
        regular: (0, iconRegistry_1.$9u)('debug-breakpoint-log', codicons_1.$Pj.debugBreakpointLog, (0, nls_1.localize)(19, null)),
        disabled: (0, iconRegistry_1.$9u)('debug-breakpoint-log-disabled', codicons_1.$Pj.debugBreakpointLogDisabled, (0, nls_1.localize)(20, null)),
        unverified: (0, iconRegistry_1.$9u)('debug-breakpoint-log-unverified', codicons_1.$Pj.debugBreakpointLogUnverified, (0, nls_1.localize)(21, null)),
    };
    exports.$6mb = (0, iconRegistry_1.$9u)('debug-hint', codicons_1.$Pj.debugHint, (0, nls_1.localize)(22, null));
    exports.$7mb = (0, iconRegistry_1.$9u)('debug-breakpoint-unsupported', codicons_1.$Pj.debugBreakpointUnsupported, (0, nls_1.localize)(23, null));
    exports.$8mb = [exports.$1mb, exports.$2mb, exports.$3mb, exports.$4mb, exports.$5mb];
    exports.$9mb = (0, iconRegistry_1.$9u)('debug-stackframe', codicons_1.$Pj.debugStackframe, (0, nls_1.localize)(24, null));
    exports.$0mb = (0, iconRegistry_1.$9u)('debug-stackframe-focused', codicons_1.$Pj.debugStackframeFocused, (0, nls_1.localize)(25, null));
    exports.$$mb = (0, iconRegistry_1.$9u)('debug-gripper', codicons_1.$Pj.gripper, (0, nls_1.localize)(26, null));
    exports.$_mb = (0, iconRegistry_1.$9u)('debug-restart-frame', codicons_1.$Pj.debugRestartFrame, (0, nls_1.localize)(27, null));
    exports.$anb = (0, iconRegistry_1.$9u)('debug-stop', codicons_1.$Pj.debugStop, (0, nls_1.localize)(28, null));
    exports.$bnb = (0, iconRegistry_1.$9u)('debug-disconnect', codicons_1.$Pj.debugDisconnect, (0, nls_1.localize)(29, null));
    exports.$cnb = (0, iconRegistry_1.$9u)('debug-restart', codicons_1.$Pj.debugRestart, (0, nls_1.localize)(30, null));
    exports.$dnb = (0, iconRegistry_1.$9u)('debug-step-over', codicons_1.$Pj.debugStepOver, (0, nls_1.localize)(31, null));
    exports.$enb = (0, iconRegistry_1.$9u)('debug-step-into', codicons_1.$Pj.debugStepInto, (0, nls_1.localize)(32, null));
    exports.$fnb = (0, iconRegistry_1.$9u)('debug-step-out', codicons_1.$Pj.debugStepOut, (0, nls_1.localize)(33, null));
    exports.$gnb = (0, iconRegistry_1.$9u)('debug-step-back', codicons_1.$Pj.debugStepBack, (0, nls_1.localize)(34, null));
    exports.$hnb = (0, iconRegistry_1.$9u)('debug-pause', codicons_1.$Pj.debugPause, (0, nls_1.localize)(35, null));
    exports.$inb = (0, iconRegistry_1.$9u)('debug-continue', codicons_1.$Pj.debugContinue, (0, nls_1.localize)(36, null));
    exports.$jnb = (0, iconRegistry_1.$9u)('debug-reverse-continue', codicons_1.$Pj.debugReverseContinue, (0, nls_1.localize)(37, null));
    exports.$knb = (0, iconRegistry_1.$9u)('debug-run', codicons_1.$Pj.run, (0, nls_1.localize)(38, null));
    exports.$lnb = (0, iconRegistry_1.$9u)('debug-start', codicons_1.$Pj.debugStart, (0, nls_1.localize)(39, null));
    exports.$mnb = (0, iconRegistry_1.$9u)('debug-configure', codicons_1.$Pj.gear, (0, nls_1.localize)(40, null));
    exports.$nnb = (0, iconRegistry_1.$9u)('debug-console', codicons_1.$Pj.gear, (0, nls_1.localize)(41, null));
    exports.$onb = (0, iconRegistry_1.$9u)('debug-remove-config', codicons_1.$Pj.trash, (0, nls_1.localize)(42, null));
    exports.$pnb = (0, iconRegistry_1.$9u)('debug-collapse-all', codicons_1.$Pj.collapseAll, (0, nls_1.localize)(43, null));
    exports.$qnb = (0, iconRegistry_1.$9u)('callstack-view-session', codicons_1.$Pj.bug, (0, nls_1.localize)(44, null));
    exports.$rnb = (0, iconRegistry_1.$9u)('debug-console-clear-all', codicons_1.$Pj.clearAll, (0, nls_1.localize)(45, null));
    exports.$snb = (0, iconRegistry_1.$9u)('watch-expressions-remove-all', codicons_1.$Pj.closeAll, (0, nls_1.localize)(46, null));
    exports.$tnb = (0, iconRegistry_1.$9u)('watch-expression-remove', codicons_1.$Pj.removeClose, (0, nls_1.localize)(47, null));
    exports.$unb = (0, iconRegistry_1.$9u)('watch-expressions-add', codicons_1.$Pj.add, (0, nls_1.localize)(48, null));
    exports.$vnb = (0, iconRegistry_1.$9u)('watch-expressions-add-function-breakpoint', codicons_1.$Pj.add, (0, nls_1.localize)(49, null));
    exports.$wnb = (0, iconRegistry_1.$9u)('breakpoints-remove-all', codicons_1.$Pj.closeAll, (0, nls_1.localize)(50, null));
    exports.$xnb = (0, iconRegistry_1.$9u)('breakpoints-activate', codicons_1.$Pj.activateBreakpoints, (0, nls_1.localize)(51, null));
    exports.$ynb = (0, iconRegistry_1.$9u)('debug-console-evaluation-input', codicons_1.$Pj.arrowSmallRight, (0, nls_1.localize)(52, null));
    exports.$znb = (0, iconRegistry_1.$9u)('debug-console-evaluation-prompt', codicons_1.$Pj.chevronRight, (0, nls_1.localize)(53, null));
    exports.$Anb = (0, iconRegistry_1.$9u)('debug-inspect-memory', codicons_1.$Pj.fileBinary, (0, nls_1.localize)(54, null));
});
//# sourceMappingURL=debugIcons.js.map