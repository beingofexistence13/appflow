/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/nls", "vs/workbench/contrib/terminalContrib/quickFix/browser/quickFix"], function (require, exports, uri_1, nls_1, quickFix_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.pwshUnixCommandNotFoundError = exports.pwshGeneralError = exports.gitCreatePr = exports.gitPushSetUpstream = exports.freePort = exports.gitTwoDashes = exports.gitSimilar = exports.QuickFixSource = exports.PwshUnixCommandNotFoundErrorOutputRegex = exports.PwshGeneralErrorOutputRegex = exports.GitCreatePrOutputRegex = exports.GitPushOutputRegex = exports.FreePortOutputRegex = exports.GitSimilarOutputRegex = exports.GitTwoDashesRegex = exports.GitPushCommandLineRegex = exports.GitCommandLineRegex = void 0;
    exports.GitCommandLineRegex = /git/;
    exports.GitPushCommandLineRegex = /git\s+push/;
    exports.GitTwoDashesRegex = /error: did you mean `--(.+)` \(with two dashes\)\?/;
    exports.GitSimilarOutputRegex = /(?:(most similar commands? (is|are)))/;
    exports.FreePortOutputRegex = /(?:address already in use (?:0\.0\.0\.0|127\.0\.0\.1|localhost|::):|Unable to bind [^ ]*:|can't listen on port |listen EADDRINUSE [^ ]*:)(?<portNumber>\d{4,5})/;
    exports.GitPushOutputRegex = /git push --set-upstream origin (?<branchName>[^\s]+)/;
    // The previous line starts with "Create a pull request for \'([^\s]+)\' on GitHub by visiting:\s*"
    // it's safe to assume it's a github pull request if the URL includes `/pull/`
    exports.GitCreatePrOutputRegex = /remote:\s*(?<link>https:\/\/github\.com\/.+\/.+\/pull\/new\/.+)/;
    exports.PwshGeneralErrorOutputRegex = /Suggestion \[General\]:/;
    exports.PwshUnixCommandNotFoundErrorOutputRegex = /Suggestion \[cmd-not-found\]:/;
    var QuickFixSource;
    (function (QuickFixSource) {
        QuickFixSource["Builtin"] = "builtin";
    })(QuickFixSource || (exports.QuickFixSource = QuickFixSource = {}));
    function gitSimilar() {
        return {
            id: 'Git Similar',
            type: 'internal',
            commandLineMatcher: exports.GitCommandLineRegex,
            outputMatcher: {
                lineMatcher: exports.GitSimilarOutputRegex,
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
    exports.gitSimilar = gitSimilar;
    function gitTwoDashes() {
        return {
            id: 'Git Two Dashes',
            type: 'internal',
            commandLineMatcher: exports.GitCommandLineRegex,
            outputMatcher: {
                lineMatcher: exports.GitTwoDashesRegex,
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
    exports.gitTwoDashes = gitTwoDashes;
    function freePort(runCallback) {
        return {
            id: 'Free Port',
            type: 'internal',
            commandLineMatcher: /.+/,
            outputMatcher: {
                lineMatcher: exports.FreePortOutputRegex,
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
                const label = (0, nls_1.localize)("terminal.freePort", "Free port {0}", port);
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
    exports.freePort = freePort;
    function gitPushSetUpstream() {
        return {
            id: 'Git Push Set Upstream',
            type: 'internal',
            commandLineMatcher: exports.GitPushCommandLineRegex,
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
                lineMatcher: exports.GitPushOutputRegex,
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
    exports.gitPushSetUpstream = gitPushSetUpstream;
    function gitCreatePr() {
        return {
            id: 'Git Create Pr',
            type: 'internal',
            commandLineMatcher: exports.GitPushCommandLineRegex,
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
                lineMatcher: exports.GitCreatePrOutputRegex,
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
                const label = (0, nls_1.localize)("terminal.createPR", "Create PR {0}", link);
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
    exports.gitCreatePr = gitCreatePr;
    function pwshGeneralError() {
        return {
            id: 'Pwsh General Error',
            type: 'internal',
            commandLineMatcher: /.+/,
            outputMatcher: {
                lineMatcher: exports.PwshGeneralErrorOutputRegex,
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
                    if (lines[i].match(exports.PwshGeneralErrorOutputRegex)) {
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
    exports.pwshGeneralError = pwshGeneralError;
    function pwshUnixCommandNotFoundError() {
        return {
            id: 'Unix Command Not Found',
            type: 'internal',
            commandLineMatcher: /.+/,
            outputMatcher: {
                lineMatcher: exports.PwshUnixCommandNotFoundErrorOutputRegex,
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
                    if (lines[i].match(exports.PwshUnixCommandNotFoundErrorOutputRegex)) {
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
    exports.pwshUnixCommandNotFoundError = pwshUnixCommandNotFoundError;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxRdWlja0ZpeEJ1aWx0aW5BY3Rpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVybWluYWxDb250cmliL3F1aWNrRml4L2Jyb3dzZXIvdGVybWluYWxRdWlja0ZpeEJ1aWx0aW5BY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU1uRixRQUFBLG1CQUFtQixHQUFHLEtBQUssQ0FBQztJQUM1QixRQUFBLHVCQUF1QixHQUFHLFlBQVksQ0FBQztJQUN2QyxRQUFBLGlCQUFpQixHQUFHLG9EQUFvRCxDQUFDO0lBQ3pFLFFBQUEscUJBQXFCLEdBQUcsdUNBQXVDLENBQUM7SUFDaEUsUUFBQSxtQkFBbUIsR0FBRyxpS0FBaUssQ0FBQztJQUN4TCxRQUFBLGtCQUFrQixHQUFHLHNEQUFzRCxDQUFDO0lBQ3pGLG1HQUFtRztJQUNuRyw4RUFBOEU7SUFDakUsUUFBQSxzQkFBc0IsR0FBRyxpRUFBaUUsQ0FBQztJQUMzRixRQUFBLDJCQUEyQixHQUFHLHlCQUF5QixDQUFDO0lBQ3hELFFBQUEsdUNBQXVDLEdBQUcsK0JBQStCLENBQUM7SUFFdkYsSUFBa0IsY0FFakI7SUFGRCxXQUFrQixjQUFjO1FBQy9CLHFDQUFtQixDQUFBO0lBQ3BCLENBQUMsRUFGaUIsY0FBYyw4QkFBZCxjQUFjLFFBRS9CO0lBRUQsU0FBZ0IsVUFBVTtRQUN6QixPQUFPO1lBQ04sRUFBRSxFQUFFLGFBQWE7WUFDakIsSUFBSSxFQUFFLFVBQVU7WUFDaEIsa0JBQWtCLEVBQUUsMkJBQW1CO1lBQ3ZDLGFBQWEsRUFBRTtnQkFDZCxXQUFXLEVBQUUsNkJBQXFCO2dCQUNsQyxNQUFNLEVBQUUsUUFBUTtnQkFDaEIsTUFBTSxFQUFFLENBQUM7Z0JBQ1QsTUFBTSxFQUFFLEVBQUU7YUFDVjtZQUNELGlCQUFpQixFQUFFLE9BQU87WUFD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