/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/nls!vs/workbench/contrib/terminalContrib/quickFix/browser/terminalQuickFixBuiltinActions", "vs/workbench/contrib/terminalContrib/quickFix/browser/quickFix"], function (require, exports, uri_1, nls_1, quickFix_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$eXb = exports.$dXb = exports.$cXb = exports.$bXb = exports.$aXb = exports.$_Wb = exports.$$Wb = exports.QuickFixSource = exports.$0Wb = exports.$9Wb = exports.$8Wb = exports.$7Wb = exports.$6Wb = exports.$5Wb = exports.$4Wb = exports.$3Wb = exports.$2Wb = void 0;
    exports.$2Wb = /git/;
    exports.$3Wb = /git\s+push/;
    exports.$4Wb = /error: did you mean `--(.+)` \(with two dashes\)\?/;
    exports.$5Wb = /(?:(most similar commands? (is|are)))/;
    exports.$6Wb = /(?:address already in use (?:0\.0\.0\.0|127\.0\.0\.1|localhost|::):|Unable to bind [^ ]*:|can't listen on port |listen EADDRINUSE [^ ]*:)(?<portNumber>\d{4,5})/;
    exports.$7Wb = /git push --set-upstream origin (?<branchName>[^\s]+)/;
    // The previous line starts with "Create a pull request for \'([^\s]+)\' on GitHub by visiting:\s*"
    // it's safe to assume it's a github pull request if the URL includes `/pull/`
    exports.$8Wb = /remote:\s*(?<link>https:\/\/github\.com\/.+\/.+\/pull\/new\/.+)/;
    exports.$9Wb = /Suggestion \[General\]:/;
    exports.$0Wb = /Suggestion \[cmd-not-found\]:/;
    var QuickFixSource;
    (function (QuickFixSource) {
        QuickFixSource["Builtin"] = "builtin";
    })(QuickFixSource || (exports.QuickFixSource = QuickFixSource = {}));
    function $$Wb() {
        return {
            id: 'Git Similar',
            type: 'internal',
            commandLineMatcher: exports.$2Wb,
            outputMatcher: {
                lineMatcher: exports.$5Wb,
                anchor: 'bottom',
                offset: 0,
                length: 10
            },
            commandExitResult: 'error',
            getQuickFixes: (matchResult) => {
                const regexMatch = matchResult.outputMatch?.regexMatch[0];
                if (!regexMatch || !matchResult.outputMatch) {
                    return;
                }
                const actions = [];
                const startIndex = matchResult.outputMatch.outputLines.findIndex(l => l.includes(regexMatch)) + 1;
                const results = matchResult.outputMatch.outputLines.map(r => r.trim());
                for (let i = startIndex; i < results.length; i++) {
                    const fixedCommand = results[i];
                    if (fixedCommand) {
                        actions.push({
                            id: 'Git Similar',
                            type: quickFix_1.TerminalQuickFixType.TerminalCommand,
                            terminalCommand: matchResult.commandLine.replace(/git\s+[^\s]+/, () => `git ${fixedCommand}`),
                            addNewLine: true,
                            source: "builtin" /* QuickFixSource.Builtin */
                        });
                    }
                }
                return actions;
            }
        };
    }
    exports.$$Wb = $$Wb;
    function $_Wb() {
        return {
            id: 'Git Two Dashes',
            type: 'internal',
            commandLineMatcher: exports.$2Wb,
            outputMatcher: {
                lineMatcher: exports.$4Wb,
                anchor: 'bottom',
                offset: 0,
                length: 2
            },
            commandExitResult: 'error',
            getQuickFixes: (matchResult) => {
                const problemArg = matchResult?.outputMatch?.regexMatch?.[1];
                if (!problemArg) {
                    return;
                }
                return {
                    type: quickFix_1.TerminalQuickFixType.TerminalCommand,
                    id: 'Git Two Dashes',
                    terminalCommand: matchResult.commandLine.replace(` -${problemArg}`, () => ` --${problemArg}`),
                    addNewLine: true,
                    source: "builtin" /* QuickFixSource.Builtin */
                };
            }
        };
    }
    exports.$_Wb = $_Wb;
    function $aXb(runCallback) {
        return {
            id: 'Free Port',
            type: 'internal',
            commandLineMatcher: /.+/,
            outputMatcher: {
                lineMatcher: exports.$6Wb,
                anchor: 'bottom',
                offset: 0,
                length: 30
            },
            commandExitResult: 'error',
            getQuickFixes: (matchResult) => {
                const port = matchResult?.outputMatch?.regexMatch?.groups?.portNumber;
                if (!port) {
                    return;
                }
                const label = (0, nls_1.localize)(0, null, port);
                return {
                    type: quickFix_1.TerminalQuickFixType.Port,
                    class: undefined,
                    tooltip: label,
                    id: 'Free Port',
                    label,
                    enabled: true,
                    source: "builtin" /* QuickFixSource.Builtin */,
                    run: () => runCallback(port, matchResult.commandLine)
                };
            }
        };
    }
    exports.$aXb = $aXb;
    function $bXb() {
        return {
            id: 'Git Push Set Upstream',
            type: 'internal',
            commandLineMatcher: exports.$3Wb,
            /**
                Example output on Windows:
                8: PS C:\Users\merogge\repos\xterm.js> git push
                7: fatal: The current branch sdjfskdjfdslkjf has no upstream branch.
                6: To push the current branch and set the remote as upstream, use
                5:
                4:	git push --set-upstream origin sdjfskdjfdslkjf
                3:
                2: To have this happen automatically for branches without a tracking
                1: upstream, see 'push.autoSetupRemote' in 'git help config'.
                0:
    
                Example output on macOS:
                5: meganrogge@Megans-MacBook-Pro xterm.js % git push
                4: fatal: The current branch merogge/asjdkfsjdkfsdjf has no upstream branch.
                3: To push the current branch and set the remote as upstream, use
                2:
                1:	git push --set-upstream origin merogge/asjdkfsjdkfsdjf
                0:
             */
            outputMatcher: {
                lineMatcher: exports.$7Wb,
                anchor: 'bottom',
                offset: 0,
                length: 8
            },
            commandExitResult: 'error',
            getQuickFixes: (matchResult) => {
                const matches = matchResult.outputMatch;
                const commandToRun = 'git push --set-upstream origin ${group:branchName}';
                if (!matches) {
                    return;
                }
                const groups = matches.regexMatch.groups;
                if (!groups) {
                    return;
                }
                const actions = [];
                let fixedCommand = commandToRun;
                for (const [key, value] of Object.entries(groups)) {
                    const varToResolve = '${group:' + `${key}` + '}';
                    if (!commandToRun.includes(varToResolve)) {
                        return [];
                    }
                    fixedCommand = fixedCommand.replaceAll(varToResolve, () => value);
                }
                if (fixedCommand) {
                    actions.push({
                        type: quickFix_1.TerminalQuickFixType.TerminalCommand,
                        id: 'Git Push Set Upstream',
                        terminalCommand: fixedCommand,
                        addNewLine: true,
                        source: "builtin" /* QuickFixSource.Builtin */
                    });
                    return actions;
                }
                return;
            }
        };
    }
    exports.$bXb = $bXb;
    function $cXb() {
        return {
            id: 'Git Create Pr',
            type: 'internal',
            commandLineMatcher: exports.$3Wb,
            // Example output:
            // ...
            // 10: remote:
            // 9:  remote: Create a pull request for 'my_branch' on GitHub by visiting:
            // 8:  remote:      https://github.com/microsoft/vscode/pull/new/my_branch
            // 7:  remote:
            // 6:  remote: GitHub found x vulnerabilities on microsoft/vscode's default branch (...). To find out more, visit:
            // 5:  remote:      https://github.com/microsoft/vscode/security/dependabot
            // 4:  remote:
            // 3:  To https://github.com/microsoft/vscode
            // 2:  * [new branch]              my_branch -> my_branch
            // 1:  Branch 'my_branch' set up to track remote branch 'my_branch' from 'origin'.
            // 0:
            outputMatcher: {
                lineMatcher: exports.$8Wb,
                anchor: 'bottom',
                offset: 4,
                // ~6 should only be needed here for security alerts, but the git provider can customize
                // the text, so use 12 to be safe.
                length: 12
            },
            commandExitResult: 'success',
            getQuickFixes: (matchResult) => {
                const link = matchResult?.outputMatch?.regexMatch?.groups?.link;
                if (!link) {
                    return;
                }
                const label = (0, nls_1.localize)(1, null, link);
                return {
                    id: 'Git Create Pr',
                    label,
                    enabled: true,
                    type: quickFix_1.TerminalQuickFixType.Opener,
                    uri: uri_1.URI.parse(link),
                    source: "builtin" /* QuickFixSource.Builtin */
                };
            }
        };
    }
    exports.$cXb = $cXb;
    function $dXb() {
        return {
            id: 'Pwsh General Error',
            type: 'internal',
            commandLineMatcher: /.+/,
            outputMatcher: {
                lineMatcher: exports.$9Wb,
                anchor: 'bottom',
                offset: 0,
                length: 10
            },
            commandExitResult: 'error',
            getQuickFixes: (matchResult) => {
                const lines = matchResult.outputMatch?.regexMatch.input?.split('\n');
                if (!lines) {
                    return;
                }
                // Find the start
                let i = 0;
                let inFeedbackProvider = false;
                for (; i < lines.length; i++) {
                    if (lines[i].match(exports.$9Wb)) {
                        inFeedbackProvider = true;
                        break;
                    }
                }
                if (!inFeedbackProvider) {
                    return;
                }
                const suggestions = lines[i + 1].match(/The most similar commands are: (?<values>.+)./)?.groups?.values?.split(', ');
                if (!suggestions) {
                    return;
                }
                const result = [];
                for (const suggestion of suggestions) {
                    result.push({
                        id: 'Pwsh General Error',
                        type: quickFix_1.TerminalQuickFixType.TerminalCommand,
                        terminalCommand: suggestion,
                        source: "builtin" /* QuickFixSource.Builtin */
                    });
                }
                return result;
            }
        };
    }
    exports.$dXb = $dXb;
    function $eXb() {
        return {
            id: 'Unix Command Not Found',
            type: 'internal',
            commandLineMatcher: /.+/,
            outputMatcher: {
                lineMatcher: exports.$0Wb,
                anchor: 'bottom',
                offset: 0,
                length: 10
            },
            commandExitResult: 'error',
            getQuickFixes: (matchResult) => {
                const lines = matchResult.outputMatch?.regexMatch.input?.split('\n');
                if (!lines) {
                    return;
                }
                // Find the start
                let i = 0;
                let inFeedbackProvider = false;
                for (; i < lines.length; i++) {
                    if (lines[i].match(exports.$0Wb)) {
                        inFeedbackProvider = true;
                        break;
                    }
                }
                if (!inFeedbackProvider) {
                    return;
                }
                // Always remove the first element as it's the "Suggestion [cmd-not-found]"" line
                const result = [];
                let inSuggestions = false;
                for (; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (line.length === 0) {
                        break;
                    }
                    const installCommand = line.match(/You also have .+ installed, you can run '(?<command>.+)' instead./)?.groups?.command;
                    if (installCommand) {
                        result.push({
                            id: 'Pwsh Unix Command Not Found Error',
                            type: quickFix_1.TerminalQuickFixType.TerminalCommand,
                            terminalCommand: installCommand,
                            source: "builtin" /* QuickFixSource.Builtin */
                        });
                        inSuggestions = false;
                        continue;
                    }
                    if (line.match(/Command '.+' not found, but can be installed with:/)) {
                        inSuggestions = true;
                        continue;
                    }
                    if (inSuggestions) {
                        result.push({
                            id: 'Pwsh Unix Command Not Found Error',
                            type: quickFix_1.TerminalQuickFixType.TerminalCommand,
                            terminalCommand: line.trim(),
                            source: "builtin" /* QuickFixSource.Builtin */
                        });
                    }
                }
                return result;
            }
        };
    }
    exports.$eXb = $eXb;
});
//# sourceMappingURL=terminalQuickFixBuiltinActions.js.map