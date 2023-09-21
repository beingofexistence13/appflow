/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ConsoleObservableLogger = exports.getLogger = exports.setLogger = void 0;
    let globalObservableLogger;
    function setLogger(logger) {
        globalObservableLogger = logger;
    }
    exports.setLogger = setLogger;
    function getLogger() {
        return globalObservableLogger;
    }
    exports.getLogger = getLogger;
    class ConsoleObservableLogger {
        constructor() {
            this.indentation = 0;
            this.changedObservablesSets = new WeakMap();
        }
        textToConsoleArgs(text) {
            return consoleTextToArgs([
                normalText(repeat('|  ', this.indentation)),
                text,
            ]);
        }
        formatInfo(info) {
            if (!info.hadValue) {
                return [
                    normalText(` `),
                    styled(formatValue(info.newValue, 60), {
                        color: 'green',
                    }),
                    normalText(` (initial)`),
                ];
            }
            return info.didChange
                ? [
                    normalText(` `),
                    styled(formatValue(info.oldValue, 70), {
                        color: 'red',
                        strikeThrough: true,
                    }),
                    normalText(` `),
                    styled(formatValue(info.newValue, 60), {
                        color: 'green',
                    }),
                ]
                : [normalText(` (unchanged)`)];
        }
        handleObservableChanged(observable, info) {
            console.log(...this.textToConsoleArgs([
                formatKind('observable value changed'),
                styled(observable.debugName, { color: 'BlueViolet' }),
                ...this.formatInfo(info),
            ]));
        }
        formatChanges(changes) {
            if (changes.size === 0) {
                return undefined;
            }
            return styled(' (changed deps: ' +
                [...changes].map((o) => o.debugName).join(', ') +
                ')', { color: 'gray' });
        }
        handleDerivedCreated(derived) {
            const existingHandleChange = derived.handleChange;
            this.changedObservablesSets.set(derived, new Set());
            derived.handleChange = (observable, change) => {
                this.changedObservablesSets.get(derived).add(observable);
                return existingHandleChange.apply(derived, [observable, change]);
            };
        }
        handleDerivedRecomputed(derived, info) {
            const changedObservables = this.changedObservablesSets.get(derived);
            console.log(...this.textToConsoleArgs([
                formatKind('derived recomputed'),
                styled(derived.debugName, { color: 'BlueViolet' }),
                ...this.formatInfo(info),
                this.formatChanges(changedObservables),
                { data: [{ fn: derived._computeFn }] }
            ]));
            changedObservables.clear();
        }
        handleFromEventObservableTriggered(observable, info) {
            console.log(...this.textToConsoleArgs([
                formatKind('observable from event triggered'),
                styled(observable.debugName, { color: 'BlueViolet' }),
                ...this.formatInfo(info),
                { data: [{ fn: observable._getValue }] }
            ]));
        }
        handleAutorunCreated(autorun) {
            const existingHandleChange = autorun.handleChange;
            this.changedObservablesSets.set(autorun, new Set());
            autorun.handleChange = (observable, change) => {
                this.changedObservablesSets.get(autorun).add(observable);
                return existingHandleChange.apply(autorun, [observable, change]);
            };
        }
        handleAutorunTriggered(autorun) {
            const changedObservables = this.changedObservablesSets.get(autorun);
            console.log(...this.textToConsoleArgs([
                formatKind('autorun'),
                styled(autorun.debugName, { color: 'BlueViolet' }),
                this.formatChanges(changedObservables),
                { data: [{ fn: autorun._runFn }] }
            ]));
            changedObservables.clear();
            this.indentation++;
        }
        handleAutorunFinished(autorun) {
            this.indentation--;
        }
        handleBeginTransaction(transaction) {
            let transactionName = transaction.getDebugName();
            if (transactionName === undefined) {
                transactionName = '';
            }
            console.log(...this.textToConsoleArgs([
                formatKind('transaction'),
                styled(transactionName, { color: 'BlueViolet' }),
                { data: [{ fn: transaction._fn }] }
            ]));
            this.indentation++;
        }
        handleEndTransaction() {
            this.indentation--;
        }
    }
    exports.ConsoleObservableLogger = ConsoleObservableLogger;
    function consoleTextToArgs(text) {
        const styles = new Array();
        const data = [];
        let firstArg = '';
        function process(t) {
            if ('length' in t) {
                for (const item of t) {
                    if (item) {
                        process(item);
                    }
                }
            }
            else if ('text' in t) {
                firstArg += `%c${t.text}`;
                styles.push(t.style);
                if (t.data) {
                    data.push(...t.data);
                }
            }
            else if ('data' in t) {
                data.push(...t.data);
            }
        }
        process(text);
        const result = [firstArg, ...styles];
        result.push(...data);
        return result;
    }
    function normalText(text) {
        return styled(text, { color: 'black' });
    }
    function formatKind(kind) {
        return styled(padStr(`${kind}: `, 10), { color: 'black', bold: true });
    }
    function styled(text, options = {
        color: 'black',
    }) {
        function objToCss(styleObj) {
            return Object.entries(styleObj).reduce((styleString, [propName, propValue]) => {
                return `${styleString}${propName}:${propValue};`;
            }, '');
        }
        const style = {
            color: options.color,
        };
        if (options.strikeThrough) {
            style['text-decoration'] = 'line-through';
        }
        if (options.bold) {
            style['font-weight'] = 'bold';
        }
        return {
            text,
            style: objToCss(style),
        };
    }
    function formatValue(value, availableLen) {
        switch (typeof value) {
            case 'number':
                return '' + value;
            case 'string':
                if (value.length + 2 <= availableLen) {
                    return `"${value}"`;
                }
                return `"${value.substr(0, availableLen - 7)}"+...`;
            case 'boolean':
                return value ? 'true' : 'false';
            case 'undefined':
                return 'undefined';
            case 'object':
                if (value === null) {
                    return 'null';
                }
                if (Array.isArray(value)) {
                    return formatArray(value, availableLen);
                }
                return formatObject(value, availableLen);
            case 'symbol':
                return value.toString();
            case 'function':
                return `[[Function${value.name ? ' ' + value.name : ''}]]`;
            default:
                return '' + value;
        }
    }
    function formatArray(value, availableLen) {
        let result = '[ ';
        let first = true;
        for (const val of value) {
            if (!first) {
                result += ', ';
            }
            if (result.length - 5 > availableLen) {
                result += '...';
                break;
            }
            first = false;
            result += `${formatValue(val, availableLen - result.length)}`;
        }
        result += ' ]';
        return result;
    }
    function formatObject(value, availableLen) {
        let result = '{ ';
        let first = true;
        for (const [key, val] of Object.entries(value)) {
            if (!first) {
                result += ', ';
            }
            if (result.length - 5 > availableLen) {
                result += '...';
                break;
            }
            first = false;
            result += `${key}: ${formatValue(val, availableLen - result.length)}`;
        }
        result += ' }';
        return result;
    }
    function repeat(str, count) {
        let result = '';
        for (let i = 1; i <= count; i++) {
            result += str;
        }
        return result;
    }
    function padStr(str, length) {
        while (str.length < length) {
            str += ' ';
        }
        return str;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2luZy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvY29tbW9uL29ic2VydmFibGVJbnRlcm5hbC9sb2dnaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU9oRyxJQUFJLHNCQUFxRCxDQUFDO0lBRTFELFNBQWdCLFNBQVMsQ0FBQyxNQUF5QjtRQUNsRCxzQkFBc0IsR0FBRyxNQUFNLENBQUM7SUFDakMsQ0FBQztJQUZELDhCQUVDO0lBRUQsU0FBZ0IsU0FBUztRQUN4QixPQUFPLHNCQUFzQixDQUFDO0lBQy9CLENBQUM7SUFGRCw4QkFFQztJQXlCRCxNQUFhLHVCQUF1QjtRQUFwQztZQUNTLGdCQUFXLEdBQUcsQ0FBQyxDQUFDO1lBMENQLDJCQUFzQixHQUFHLElBQUksT0FBTyxFQUFzQyxDQUFDO1FBcUY3RixDQUFDO1FBN0hRLGlCQUFpQixDQUFDLElBQWlCO1lBQzFDLE9BQU8saUJBQWlCLENBQUM7Z0JBQ3hCLFVBQVUsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDM0MsSUFBSTthQUNKLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFTyxVQUFVLENBQUMsSUFBd0I7WUFDMUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ25CLE9BQU87b0JBQ04sVUFBVSxDQUFDLEdBQUcsQ0FBQztvQkFDZixNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLEVBQUU7d0JBQ3RDLEtBQUssRUFBRSxPQUFPO3FCQUNkLENBQUM7b0JBQ0YsVUFBVSxDQUFDLFlBQVksQ0FBQztpQkFDeEIsQ0FBQzthQUNGO1lBQ0QsT0FBTyxJQUFJLENBQUMsU0FBUztnQkFDcEIsQ0FBQyxDQUFDO29CQUNELFVBQVUsQ0FBQyxHQUFHLENBQUM7b0JBQ2YsTUFBTSxD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