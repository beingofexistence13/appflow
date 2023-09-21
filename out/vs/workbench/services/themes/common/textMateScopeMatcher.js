/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createMatchers = void 0;
    function createMatchers(selector, matchesName, results) {
        const tokenizer = newTokenizer(selector);
        let token = tokenizer.next();
        while (token !== null) {
            let priority = 0;
            if (token.length === 2 && token.charAt(1) === ':') {
                switch (token.charAt(0)) {
                    case 'R':
                        priority = 1;
                        break;
                    case 'L':
                        priority = -1;
                        break;
                    default:
                        console.log(`Unknown priority ${token} in scope selector`);
                }
                token = tokenizer.next();
            }
            const matcher = parseConjunction();
            if (matcher) {
                results.push({ matcher, priority });
            }
            if (token !== ',') {
                break;
            }
            token = tokenizer.next();
        }
        function parseOperand() {
            if (token === '-') {
                token = tokenizer.next();
                const expressionToNegate = parseOperand();
                if (!expressionToNegate) {
                    return null;
                }
                return matcherInput => {
                    const score = expressionToNegate(matcherInput);
                    return score < 0 ? 0 : -1;
                };
            }
            if (token === '(') {
                token = tokenizer.next();
                const expressionInParents = parseInnerExpression();
                if (token === ')') {
                    token = tokenizer.next();
                }
                return expressionInParents;
            }
            if (isIdentifier(token)) {
                const identifiers = [];
                do {
                    identifiers.push(token);
                    token = tokenizer.next();
                } while (isIdentifier(token));
                return matcherInput => matchesName(identifiers, matcherInput);
            }
            return null;
        }
        function parseConjunction() {
            let matcher = parseOperand();
            if (!matcher) {
                return null;
            }
            const matchers = [];
            while (matcher) {
                matchers.push(matcher);
                matcher = parseOperand();
            }
            return matcherInput => {
                let min = matchers[0](matcherInput);
                for (let i = 1; min >= 0 && i < matchers.length; i++) {
                    min = Math.min(min, matchers[i](matcherInput));
                }
                return min;
            };
        }
        function parseInnerExpression() {
            let matcher = parseConjunction();
            if (!matcher) {
                return null;
            }
            const matchers = [];
            while (matcher) {
                matchers.push(matcher);
                if (token === '|' || token === ',') {
                    do {
                        token = tokenizer.next();
                    } while (token === '|' || token === ','); // ignore subsequent commas
                }
                else {
                    break;
                }
                matcher = parseConjunction();
            }
            return matcherInput => {
                let max = matchers[0](matcherInput);
                for (let i = 1; i < matchers.length; i++) {
                    max = Math.max(max, matchers[i](matcherInput));
                }
                return max;
            };
        }
    }
    exports.createMatchers = createMatchers;
    function isIdentifier(token) {
        return !!token && !!token.match(/[\w\.:]+/);
    }
    function newTokenizer(input) {
        const regex = /([LR]:|[\w\.:][\w\.:\-]*|[\,\|\-\(\)])/g;
        let match = regex.exec(input);
        return {
            next: () => {
                if (!match) {
                    return null;
                }
                const res = match[0];
                match = regex.exec(input);
                return res;
            }
        };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dE1hdGVTY29wZU1hdGNoZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvdGhlbWVzL2NvbW1vbi90ZXh0TWF0ZVNjb3BlTWF0Y2hlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7SUFFaEcsWUFBWSxDQUFDOzs7SUFXYixTQUFnQixjQUFjLENBQUksUUFBZ0IsRUFBRSxXQUF5RCxFQUFFLE9BQWlDO1FBQy9JLE1BQU0sU0FBUyxHQUFHLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN6QyxJQUFJLEtBQUssR0FBRyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDN0IsT0FBTyxLQUFLLEtBQUssSUFBSSxFQUFFO1lBQ3RCLElBQUksUUFBUSxHQUFlLENBQUMsQ0FBQztZQUM3QixJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFO2dCQUNsRCxRQUFRLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUU7b0JBQ3hCLEtBQUssR0FBRzt3QkFBRSxRQUFRLEdBQUcsQ0FBQyxDQUFDO3dCQUFDLE1BQU07b0JBQzlCLEtBQUssR0FBRzt3QkFBRSxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUM7d0JBQUMsTUFBTTtvQkFDL0I7d0JBQ0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsS0FBSyxvQkFBb0IsQ0FBQyxDQUFDO2lCQUM1RDtnQkFDRCxLQUFLLEdBQUcsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDO2FBQ3pCO1lBQ0QsTUFBTSxPQUFPLEdBQUcsZ0JBQWdCLEVBQUUsQ0FBQztZQUNuQyxJQUFJLE9BQU8sRUFBRTtnQkFDWixPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxDQUFD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