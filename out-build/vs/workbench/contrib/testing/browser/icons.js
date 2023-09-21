/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/nls!vs/workbench/contrib/testing/browser/icons", "vs/platform/theme/common/iconRegistry", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/workbench/contrib/testing/browser/theme"], function (require, exports, codicons_1, nls_1, iconRegistry_1, themeService_1, themables_1, theme_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$eKb = exports.$dKb = exports.$cKb = exports.$bKb = exports.$aKb = exports.$_Jb = exports.$$Jb = exports.$0Jb = exports.$9Jb = exports.$8Jb = exports.$7Jb = exports.$6Jb = exports.$5Jb = exports.$4Jb = exports.$3Jb = exports.$2Jb = exports.$1Jb = exports.$ZJb = exports.$YJb = void 0;
    exports.$YJb = (0, iconRegistry_1.$9u)('test-view-icon', codicons_1.$Pj.beaker, (0, nls_1.localize)(0, null));
    exports.$ZJb = (0, iconRegistry_1.$9u)('test-results-icon', codicons_1.$Pj.checklist, (0, nls_1.localize)(1, null));
    exports.$1Jb = (0, iconRegistry_1.$9u)('testing-run-icon', codicons_1.$Pj.run, (0, nls_1.localize)(2, null));
    exports.$2Jb = (0, iconRegistry_1.$9u)('testing-rerun-icon', codicons_1.$Pj.refresh, (0, nls_1.localize)(3, null));
    exports.$3Jb = (0, iconRegistry_1.$9u)('testing-run-all-icon', codicons_1.$Pj.runAll, (0, nls_1.localize)(4, null));
    // todo: https://github.com/microsoft/vscode-codicons/issues/72
    exports.$4Jb = (0, iconRegistry_1.$9u)('testing-debug-all-icon', codicons_1.$Pj.debugAltSmall, (0, nls_1.localize)(5, null));
    exports.$5Jb = (0, iconRegistry_1.$9u)('testing-debug-icon', codicons_1.$Pj.debugAltSmall, (0, nls_1.localize)(6, null));
    exports.$6Jb = (0, iconRegistry_1.$9u)('testing-cancel-icon', codicons_1.$Pj.debugStop, (0, nls_1.localize)(7, null));
    exports.$7Jb = (0, iconRegistry_1.$9u)('testing-filter', codicons_1.$Pj.filter, (0, nls_1.localize)(8, null));
    exports.$8Jb = (0, iconRegistry_1.$9u)('testing-hidden', codicons_1.$Pj.eyeClosed, (0, nls_1.localize)(9, null));
    exports.$9Jb = (0, iconRegistry_1.$9u)('testing-show-as-list-icon', codicons_1.$Pj.listTree, (0, nls_1.localize)(10, null));
    exports.$0Jb = (0, iconRegistry_1.$9u)('testing-show-as-list-icon', codicons_1.$Pj.listFlat, (0, nls_1.localize)(11, null));
    exports.$$Jb = (0, iconRegistry_1.$9u)('testing-update-profiles', codicons_1.$Pj.gear, (0, nls_1.localize)(12, null));
    exports.$_Jb = (0, iconRegistry_1.$9u)('testing-refresh-tests', codicons_1.$Pj.refresh, (0, nls_1.localize)(13, null));
    exports.$aKb = (0, iconRegistry_1.$9u)('testing-turn-continuous-run-on', codicons_1.$Pj.eye, (0, nls_1.localize)(14, null));
    exports.$bKb = (0, iconRegistry_1.$9u)('testing-turn-continuous-run-off', codicons_1.$Pj.eyeClosed, (0, nls_1.localize)(15, null));
    exports.$cKb = (0, iconRegistry_1.$9u)('testing-continuous-is-on', codicons_1.$Pj.eye, (0, nls_1.localize)(16, null));
    exports.$dKb = (0, iconRegistry_1.$9u)('testing-cancel-refresh-tests', codicons_1.$Pj.stop, (0, nls_1.localize)(17, null));
    exports.$eKb = new Map([
        [6 /* TestResultState.Errored */, (0, iconRegistry_1.$9u)('testing-error-icon', codicons_1.$Pj.issues, (0, nls_1.localize)(18, null))],
        [4 /* TestResultState.Failed */, (0, iconRegistry_1.$9u)('testing-failed-icon', codicons_1.$Pj.error, (0, nls_1.localize)(19, null))],
        [3 /* TestResultState.Passed */, (0, iconRegistry_1.$9u)('testing-passed-icon', codicons_1.$Pj.pass, (0, nls_1.localize)(20, null))],
        [1 /* TestResultState.Queued */, (0, iconRegistry_1.$9u)('testing-queued-icon', codicons_1.$Pj.history, (0, nls_1.localize)(21, null))],
        [2 /* TestResultState.Running */, iconRegistry_1.$dv],
        [5 /* TestResultState.Skipped */, (0, iconRegistry_1.$9u)('testing-skipped-icon', codicons_1.$Pj.debugStepOver, (0, nls_1.localize)(22, null))],
        [0 /* TestResultState.Unset */, (0, iconRegistry_1.$9u)('testing-unset-icon', codicons_1.$Pj.circleOutline, (0, nls_1.localize)(23, null))],
    ]);
    (0, themeService_1.$mv)((theme, collector) => {
        for (const [state, icon] of exports.$eKb.entries()) {
            const color = theme_1.$XJb[state];
            if (!color) {
                continue;
            }
            collector.addRule(`.monaco-workbench ${themables_1.ThemeIcon.asCSSSelector(icon)} {
			color: ${theme.getColor(color)} !important;
		}`);
        }
        collector.addRule(`
		.monaco-editor ${themables_1.ThemeIcon.asCSSSelector(exports.$1Jb)},
		.monaco-editor ${themables_1.ThemeIcon.asCSSSelector(exports.$3Jb)} {
			color: ${theme.getColor(theme_1.$QJb)};
		}
	`);
    });
});
//# sourceMappingURL=icons.js.map