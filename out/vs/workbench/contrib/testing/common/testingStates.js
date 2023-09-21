/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.makeEmptyCounts = exports.terminalStatePriorities = exports.statesInOrder = exports.maxPriority = exports.cmpPriority = exports.stateNodes = exports.isStateWithResult = exports.isFailedState = exports.statePriority = void 0;
    /**
     * List of display priorities for different run states. When tests update,
     * the highest-priority state from any of their children will be the state
     * reflected in the parent node.
     */
    exports.statePriority = {
        [2 /* TestResultState.Running */]: 6,
        [6 /* TestResultState.Errored */]: 5,
        [4 /* TestResultState.Failed */]: 4,
        [1 /* TestResultState.Queued */]: 3,
        [3 /* TestResultState.Passed */]: 2,
        [0 /* TestResultState.Unset */]: 0,
        [5 /* TestResultState.Skipped */]: 1,
    };
    const isFailedState = (s) => s === 6 /* TestResultState.Errored */ || s === 4 /* TestResultState.Failed */;
    exports.isFailedState = isFailedState;
    const isStateWithResult = (s) => s === 6 /* TestResultState.Errored */ || s === 4 /* TestResultState.Failed */ || s === 3 /* TestResultState.Passed */;
    exports.isStateWithResult = isStateWithResult;
    exports.stateNodes = Object.entries(exports.statePriority).reduce((acc, [stateStr, priority]) => {
        const state = Number(stateStr);
        acc[state] = { statusNode: true, state, priority };
        return acc;
    }, {});
    const cmpPriority = (a, b) => exports.statePriority[b] - exports.statePriority[a];
    exports.cmpPriority = cmpPriority;
    const maxPriority = (...states) => {
        switch (states.length) {
            case 0:
                return 0 /* TestResultState.Unset */;
            case 1:
                return states[0];
            case 2:
                return exports.statePriority[states[0]] > exports.statePriority[states[1]] ? states[0] : states[1];
            default: {
                let max = states[0];
                for (let i = 1; i < states.length; i++) {
                    if (exports.statePriority[max] < exports.statePriority[states[i]]) {
                        max = states[i];
                    }
                }
                return max;
            }
        }
    };
    exports.maxPriority = maxPriority;
    exports.statesInOrder = Object.keys(exports.statePriority).map(s => Number(s)).sort(exports.cmpPriority);
    /**
     * Some states are considered terminal; once these are set for a given test run, they
     * are not reset back to a non-terminal state, or to a terminal state with lower
     * priority.
     */
    exports.terminalStatePriorities = {
        [3 /* TestResultState.Passed */]: 0,
        [5 /* TestResultState.Skipped */]: 1,
        [4 /* TestResultState.Failed */]: 2,
        [6 /* TestResultState.Errored */]: 3,
    };
    const makeEmptyCounts = () => {
        // shh! don't tell anyone this is actually an array!
        return new Uint32Array(exports.statesInOrder.length);
    };
    exports.makeEmptyCounts = makeEmptyCounts;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGluZ1N0YXRlcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlc3RpbmcvY29tbW9uL3Rlc3RpbmdTdGF0ZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBTWhHOzs7O09BSUc7SUFDVSxRQUFBLGFBQWEsR0FBdUM7UUFDaEUsaUNBQXlCLEVBQUUsQ0FBQztRQUM1QixpQ0FBeUIsRUFBRSxDQUFDO1FBQzVCLGdDQUF3QixFQUFFLENBQUM7UUFDM0IsZ0NBQXdCLEVBQUUsQ0FBQztRQUMzQixnQ0FBd0IsRUFBRSxDQUFDO1FBQzNCLCtCQUF1QixFQUFFLENBQUM7UUFDMUIsaUNBQXlCLEVBQUUsQ0FBQztLQUM1QixDQUFDO0lBRUssTUFBTSxhQUFhLEdBQUcsQ0FBQyxDQUFrQixFQUFFLEVBQUUsQ0FBQyxDQUFDLG9DQUE0QixJQUFJLENBQUMsbUNBQTJCLENBQUM7SUFBdEcsUUFBQSxhQUFhLGlCQUF5RjtJQUM1RyxNQUFNLGlCQUFpQixHQUFHLENBQUMsQ0FBa0IsRUFBRSxFQUFFLENBQUMsQ0FBQyxvQ0FBNEIsSUFBSSxDQUFDLG1DQUEyQixJQUFJLENBQUMsbUNBQTJCLENBQUM7SUFBMUksUUFBQSxpQkFBaUIscUJBQXlIO0lBRTFJLFFBQUEsVUFBVSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMscUJBQWEsQ0FBQyxDQUFDLE1BQU0sQ0FDN0QsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLEVBQUUsRUFBRTtRQUM3QixNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFvQixDQUFDO1FBQ2xELEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxDQUFDO1FBQ25ELE9BQU8sR0FBRyxDQUFDO0lBQ1osQ0FBQyxFQUFFLEVBQStDLENBQ2xELENBQUM7SUFFSyxNQUFNLFdBQVcsR0FBRyxDQUFDLENBQWtCLEVBQUUsQ0FBa0IsRUFBRSxFQUFFLENBQUMscUJBQWEsQ0FBQyxDQUFDLENBQUMsR0FBRyxxQkFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQTlGLFFBQUEsV0FBVyxlQUFtRjtJQUVwRyxNQUFNLFdBQVcsR0FBRyxDQUFDLEdBQUcsTUFBeUIsRUFBRSxFQUFFO1FBQzNELFFBQVEsTUFBTSxDQUFDLE1BQU0sRUFBRTtZQUN0QixLQUFLLENBQUM7Z0JBQ0wscUNBQTZCO1lBQzlCLEtBQUssQ0FBQztnQkFDTCxPQUFPLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsQixLQUFLLENBQUM7Z0JBQ0wsT0FBTyxxQkFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLHFCQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BGLE9BQU8sQ0FBQyxDQUFDO2dCQUNSLElBQUksR0FBRyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDcEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQ3ZDLElBQUkscUJBQWEsQ0FBQyxHQUFHLENBQUMsR0FBRyxxQkFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO3dCQUNsRCxHQUFHLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUNoQjtpQkFDRDtnQkFFRCxPQUFPLEdBQUcsQ0FBQzthQUNYO1NBQ0Q7SUFDRixDQUFDLENBQUM7SUFuQlcsUUFBQSxXQUFXLGVBbUJ0QjtJQUVXLFFBQUEsYUFBYSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMscUJBQWEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQW9CLENBQUMsQ0FBQyxJQUFJLENBQUMsbUJBQVcsQ0FBQyxDQUFDO0lBRWpIOzs7O09BSUc7SUFDVSxRQUFBLHVCQUF1QixHQUEwQztRQUM3RSxnQ0FBd0IsRUFBRSxDQUFDO1FBQzNCLGlDQUF5QixFQUFFLENBQUM7UUFDNUIsZ0NBQXdCLEVBQUUsQ0FBQztRQUMzQixpQ0FBeUIsRUFBRSxDQUFDO0tBQzVCLENBQUM7SUFPSyxNQUFNLGVBQWUsR0FBRyxHQUFtQixFQUFFO1FBQ25ELG9EQUFvRDtRQUNwRCxPQUFPLElBQUksV0FBVyxDQUFDLHFCQUFhLENBQUMsTUFBTSxDQUE4QyxDQUFDO0lBQzNGLENBQUMsQ0FBQztJQUhXLFFBQUEsZUFBZSxtQkFHMUIifQ==