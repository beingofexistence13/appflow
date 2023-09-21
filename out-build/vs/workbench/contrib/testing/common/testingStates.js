/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Wsb = exports.$Vsb = exports.$Usb = exports.$Tsb = exports.$Ssb = exports.$Rsb = exports.$Qsb = exports.$Psb = exports.$Osb = void 0;
    /**
     * List of display priorities for different run states. When tests update,
     * the highest-priority state from any of their children will be the state
     * reflected in the parent node.
     */
    exports.$Osb = {
        [2 /* TestResultState.Running */]: 6,
        [6 /* TestResultState.Errored */]: 5,
        [4 /* TestResultState.Failed */]: 4,
        [1 /* TestResultState.Queued */]: 3,
        [3 /* TestResultState.Passed */]: 2,
        [0 /* TestResultState.Unset */]: 0,
        [5 /* TestResultState.Skipped */]: 1,
    };
    const $Psb = (s) => s === 6 /* TestResultState.Errored */ || s === 4 /* TestResultState.Failed */;
    exports.$Psb = $Psb;
    const $Qsb = (s) => s === 6 /* TestResultState.Errored */ || s === 4 /* TestResultState.Failed */ || s === 3 /* TestResultState.Passed */;
    exports.$Qsb = $Qsb;
    exports.$Rsb = Object.entries(exports.$Osb).reduce((acc, [stateStr, priority]) => {
        const state = Number(stateStr);
        acc[state] = { statusNode: true, state, priority };
        return acc;
    }, {});
    const $Ssb = (a, b) => exports.$Osb[b] - exports.$Osb[a];
    exports.$Ssb = $Ssb;
    const $Tsb = (...states) => {
        switch (states.length) {
            case 0:
                return 0 /* TestResultState.Unset */;
            case 1:
                return states[0];
            case 2:
                return exports.$Osb[states[0]] > exports.$Osb[states[1]] ? states[0] : states[1];
            default: {
                let max = states[0];
                for (let i = 1; i < states.length; i++) {
                    if (exports.$Osb[max] < exports.$Osb[states[i]]) {
                        max = states[i];
                    }
                }
                return max;
            }
        }
    };
    exports.$Tsb = $Tsb;
    exports.$Usb = Object.keys(exports.$Osb).map(s => Number(s)).sort(exports.$Ssb);
    /**
     * Some states are considered terminal; once these are set for a given test run, they
     * are not reset back to a non-terminal state, or to a terminal state with lower
     * priority.
     */
    exports.$Vsb = {
        [3 /* TestResultState.Passed */]: 0,
        [5 /* TestResultState.Skipped */]: 1,
        [4 /* TestResultState.Failed */]: 2,
        [6 /* TestResultState.Errored */]: 3,
    };
    const $Wsb = () => {
        // shh! don't tell anyone this is actually an array!
        return new Uint32Array(exports.$Usb.length);
    };
    exports.$Wsb = $Wsb;
});
//# sourceMappingURL=testingStates.js.map