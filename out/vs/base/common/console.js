/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri"], function (require, exports, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.log = exports.getFirstFrame = exports.parse = exports.isRemoteConsoleLog = void 0;
    function isRemoteConsoleLog(obj) {
        const entry = obj;
        return entry && typeof entry.type === 'string' && typeof entry.severity === 'string';
    }
    exports.isRemoteConsoleLog = isRemoteConsoleLog;
    function parse(entry) {
        const args = [];
        let stack;
        // Parse Entry
        try {
            const parsedArguments = JSON.parse(entry.arguments);
            // Check for special stack entry as last entry
            const stackArgument = parsedArguments[parsedArguments.length - 1];
            if (stackArgument && stackArgument.__$stack) {
                parsedArguments.pop(); // stack is handled specially
                stack = stackArgument.__$stack;
            }
            args.push(...parsedArguments);
        }
        catch (error) {
            args.push('Unable to log remote console arguments', entry.arguments);
        }
        return { args, stack };
    }
    exports.parse = parse;
    function getFirstFrame(arg0) {
        if (typeof arg0 !== 'string') {
            return getFirstFrame(parse(arg0).stack);
        }
        // Parse a source information out of the stack if we have one. Format can be:
        // at vscode.commands.registerCommand (/Users/someone/Desktop/test-ts/out/src/extension.js:18:17)
        // or
        // at /Users/someone/Desktop/test-ts/out/src/extension.js:18:17
        // or
        // at c:\Users\someone\Desktop\end-js\extension.js:19:17
        // or
        // at e.$executeContributedCommand(c:\Users\someone\Desktop\end-js\extension.js:19:17)
        const stack = arg0;
        if (stack) {
            const topFrame = findFirstFrame(stack);
            // at [^\/]* => line starts with "at" followed by any character except '/' (to not capture unix paths too late)
            // (?:(?:[a-zA-Z]+:)|(?:[\/])|(?:\\\\) => windows drive letter OR unix root OR unc root
            // (?:.+) => simple pattern for the path, only works because of the line/col pattern after
            // :(?:\d+):(?:\d+) => :line:column data
            const matches = /at [^\/]*((?:(?:[a-zA-Z]+:)|(?:[\/])|(?:\\\\))(?:.+)):(\d+):(\d+)/.exec(topFrame || '');
            if (matches && matches.length === 4) {
                return {
                    uri: uri_1.URI.file(matches[1]),
                    line: Number(matches[2]),
                    column: Number(matches[3])
                };
            }
        }
        return undefined;
    }
    exports.getFirstFrame = getFirstFrame;
    function findFirstFrame(stack) {
        if (!stack) {
            return stack;
        }
        const newlineIndex = stack.indexOf('\n');
        if (newlineIndex === -1) {
            return stack;
        }
        return stack.substring(0, newlineIndex);
    }
    function log(entry, label) {
        const { args, stack } = parse(entry);
        const isOneStringArg = typeof args[0] === 'string' && args.length === 1;
        let topFrame = findFirstFrame(stack);
        if (topFrame) {
            topFrame = `(${topFrame.trim()})`;
        }
        let consoleArgs = [];
        // First arg is a string
        if (typeof args[0] === 'string') {
            if (topFrame && isOneStringArg) {
                consoleArgs = [`%c[${label}] %c${args[0]} %c${topFrame}`, color('blue'), color(''), color('grey')];
            }
            else {
                consoleArgs = [`%c[${label}] %c${args[0]}`, color('blue'), color(''), ...args.slice(1)];
            }
        }
        // First arg is something else, just apply all
        else {
            consoleArgs = [`%c[${label}]%`, color('blue'), ...args];
        }
        // Stack: add to args unless already added
        if (topFrame && !isOneStringArg) {
            consoleArgs.push(topFrame);
        }
        // Log it
        if (typeof console[entry.severity] !== 'function') {
            throw new Error('Unknown console method');
        }
        console[entry.severity].apply(console, consoleArgs);
    }
    exports.log = log;
    function color(color) {
        return `color: ${color}`;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc29sZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvY29tbW9uL2NvbnNvbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBb0JoRyxTQUFnQixrQkFBa0IsQ0FBQyxHQUFRO1FBQzFDLE1BQU0sS0FBSyxHQUFHLEdBQXdCLENBQUM7UUFFdkMsT0FBTyxLQUFLLElBQUksT0FBTyxLQUFLLENBQUMsSUFBSSxLQUFLLFFBQVEsSUFBSSxPQUFPLEtBQUssQ0FBQyxRQUFRLEtBQUssUUFBUSxDQUFDO0lBQ3RGLENBQUM7SUFKRCxnREFJQztJQUVELFNBQWdCLEtBQUssQ0FBQyxLQUF3QjtRQUM3QyxNQUFNLElBQUksR0FBVSxFQUFFLENBQUM7UUFDdkIsSUFBSSxLQUF5QixDQUFDO1FBRTlCLGNBQWM7UUFDZCxJQUFJO1lBQ0gsTUFBTSxlQUFlLEdBQVUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFM0QsOENBQThDO1lBQzlDLE1BQU0sYUFBYSxHQUFHLGVBQWUsQ0FBQyxlQUFlLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBbUIsQ0FBQztZQUNwRixJQUFJLGFBQWEsSUFBSSxhQUFhLENBQUMsUUFBUSxFQUFFO2dCQUM1QyxlQUFlLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyw2QkFBNkI7Z0JBQ3BELEtBQUssR0FBRyxhQUFhLENBQUMsUUFBUSxDQUFDO2FBQy9CO1lBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLGVBQWUsQ0FBQyxDQUFDO1NBQzlCO1FBQUMsT0FBTyxLQUFLLEVBQUU7WUFDZixJQUFJLENBQUMsSUFBSSxDQUFDLHdDQUF3QyxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUNyRTtRQUVELE9BQU8sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUM7SUFDeEIsQ0FBQztJ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