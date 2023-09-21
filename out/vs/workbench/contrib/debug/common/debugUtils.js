/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings", "vs/base/common/uri", "vs/base/common/path", "vs/base/common/objects", "vs/base/common/network", "vs/editor/common/core/range", "vs/base/common/cancellation", "vs/base/common/arrays"], function (require, exports, strings_1, uri_1, path_1, objects_1, network_1, range_1, cancellation_1, arrays_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.sourcesEqual = exports.saveAllBeforeDebugStart = exports.getVisibleAndSorted = exports.convertToVSCPaths = exports.convertToDAPaths = exports.isUri = exports.getEvaluatableExpressionAtPosition = exports.getExactExpressionStartAndEnd = exports.isDebuggerMainContribution = exports.getExtensionHostDebugSession = exports.isSessionAttach = exports.filterExceptionsFromTelemetry = exports.formatPII = void 0;
    const _formatPIIRegexp = /{([^}]+)}/g;
    function formatPII(value, excludePII, args) {
        return value.replace(_formatPIIRegexp, function (match, group) {
            if (excludePII && group.length > 0 && group[0] !== '_') {
                return match;
            }
            return args && args.hasOwnProperty(group) ?
                args[group] :
                match;
        });
    }
    exports.formatPII = formatPII;
    /**
     * Filters exceptions (keys marked with "!") from the given object. Used to
     * ensure exception data is not sent on web remotes, see #97628.
     */
    function filterExceptionsFromTelemetry(data) {
        const output = {};
        for (const key of Object.keys(data)) {
            if (!key.startsWith('!')) {
                output[key] = data[key];
            }
        }
        return output;
    }
    exports.filterExceptionsFromTelemetry = filterExceptionsFromTelemetry;
    function isSessionAttach(session) {
        return session.configuration.request === 'attach' && !getExtensionHostDebugSession(session) && (!session.parentSession || isSessionAttach(session.parentSession));
    }
    exports.isSessionAttach = isSessionAttach;
    /**
     * Returns the session or any parent which is an extension host debug session.
     * Returns undefined if there's none.
     */
    function getExtensionHostDebugSession(session) {
        let type = session.configuration.type;
        if (!type) {
            return;
        }
        if (type === 'vslsShare') {
            type = session.configuration.adapterProxy.configuration.type;
        }
        if ((0, strings_1.equalsIgnoreCase)(type, 'extensionhost') || (0, strings_1.equalsIgnoreCase)(type, 'pwa-extensionhost')) {
            return session;
        }
        return session.parentSession ? getExtensionHostDebugSession(session.parentSession) : undefined;
    }
    exports.getExtensionHostDebugSession = getExtensionHostDebugSession;
    // only a debugger contributions with a label, program, or runtime attribute is considered a "defining" or "main" debugger contribution
    function isDebuggerMainContribution(dbg) {
        return dbg.type && (dbg.label || dbg.program || dbg.runtime);
    }
    exports.isDebuggerMainContribution = isDebuggerMainContribution;
    function getExactExpressionStartAndEnd(lineContent, looseStart, looseEnd) {
        let matchingExpression = undefined;
        let startOffset = 0;
        // Some example supported expressions: myVar.prop, a.b.c.d, myVar?.prop, myVar->prop, MyClass::StaticProp, *myVar
        // Match any character except a set of characters which often break interesting sub-expressions
        const expression = /([^()\[\]{}<>\s+\-/%~#^;=|,`!]|\->)+/g;
        let result = null;
        // First find the full expression under the cursor
        while (result = expression.exec(lineContent)) {
            const start = result.index + 1;
            const end = start + result[0].length;
            if (start <= looseStart && end >= looseEnd) {
                matchingExpression = result[0];
                startOffset = start;
                break;
            }
        }
        // If there are non-word characters after the cursor, we want to truncate the expression then.
        // For example in expression 'a.b.c.d', if the focus was under 'b', 'a.b' would be evaluated.
        if (matchingExpression) {
            const subExpression = /\w+/g;
            let subExpressionResult = null;
            while (subExpressionResult = subExpression.exec(matchingExpression)) {
                const subEnd = subExpressionResult.index + 1 + startOffset + subExpressionResult[0].length;
                if (subEnd >= looseEnd) {
                    break;
                }
            }
            if (subExpressionResult) {
                matchingExpression = matchingExpression.substring(0, subExpression.lastIndex);
            }
        }
        return matchingExpression ?
            { start: startOffset, end: startOffset + matchingExpression.length - 1 } :
            { start: 0, end: 0 };
    }
    exports.getExactExpressionStartAndEnd = getExactExpressionStartAndEnd;
    async function getEvaluatableExpressionAtPosition(languageFeaturesService, model, position, token) {
        if (languageFeaturesService.evaluatableExpressionProvider.has(model)) {
            const supports = languageFeaturesService.evaluatableExpressionProvider.ordered(model);
            const results = (0, arrays_1.coalesce)(await Promise.all(supports.map(async (support) => {
                try {
                    return await support.provideEvaluatableExpression(model, position, token ?? cancellation_1.CancellationToken.None);
                }
                catch (err) {
                    return undefined;
                }
            })));
            if (results.length > 0) {
                let matchingExpression = results[0].expression;
                const range = results[0].range;
                if (!matchingExpression) {
                    const lineContent = model.getLineContent(position.lineNumber);
                    matchingExpression = lineContent.substring(range.startColumn - 1, range.endColumn - 1);
                }
                return { range, matchingExpression };
            }
        }
        else { // old one-size-fits-all strategy
            const lineContent = model.getLineContent(position.lineNumber);
            const { start, end } = getExactExpressionStartAndEnd(lineContent, position.column, position.column);
            // use regex to extract the sub-expression #9821
            const matchingExpression = lineContent.substring(start - 1, end);
            return {
                matchingExpression,
                range: new range_1.Range(position.lineNumber, start, position.lineNumber, start + matchingExpression.length)
            };
        }
        return null;
    }
    exports.getEvaluatableExpressionAtPosition = getEvaluatableExpressionAtPosition;
    // RFC 2396, Appendix A: https://www.ietf.org/rfc/rfc2396.txt
    const _schemePattern = /^[a-zA-Z][a-zA-Z0-9\+\-\.]+:/;
    function isUri(s) {
        // heuristics: a valid uri starts with a scheme and
        // the scheme has at least 2 characters so that it doesn't look like a drive letter.
        return !!(s && s.match(_schemePattern));
    }
    exports.isUri = isUri;
    function stringToUri(source) {
        if (typeof source.path === 'string') {
            if (typeof source.sourceReference === 'number' && source.sourceReference > 0) {
                // if there is a source reference, don't touch path
            }
            else {
                if (isUri(source.path)) {
                    return uri_1.URI.parse(source.path);
                }
                else {
                    // assume path
                    if ((0, path_1.isAbsolute)(source.path)) {
                        return uri_1.URI.file(source.path);
                    }
                    else {
                        // leave relative path as is
                    }
                }
            }
        }
        return source.path;
    }
    function uriToString(source) {
        if (typeof source.path === 'object') {
            const u = uri_1.URI.revive(source.path);
            if (u) {
                if (u.scheme === network_1.Schemas.file) {
                    return u.fsPath;
                }
                else {
                    return u.toString();
                }
            }
        }
        return source.path;
    }
    function convertToDAPaths(message, toUri) {
        const fixPath = toUri ? stringToUri : uriToString;
        // since we modify Source.paths in the message in place, we need to make a copy of it (see #61129)
        const msg = (0, objects_1.deepClone)(message);
        convertPaths(msg, (toDA, source) => {
            if (toDA && source) {
                source.path = fixPath(source);
            }
        });
        return msg;
    }
    exports.convertToDAPaths = convertToDAPaths;
    function convertToVSCPaths(message, toUri) {
        const fixPath = toUri ? stringToUri : uriToString;
        // since we modify Source.paths in the message in place, we need to make a copy of it (see #61129)
        const msg = (0, objects_1.deepClone)(message);
        convertPaths(msg, (toDA, source) => {
            if (!toDA && source) {
                source.path = fixPath(source);
            }
        });
        return msg;
    }
    exports.convertToVSCPaths = convertToVSCPaths;
    function convertPaths(msg, fixSourcePath) {
        switch (msg.type) {
            case 'event': {
                const event = msg;
                switch (event.event) {
                    case 'output':
                        fixSourcePath(false, event.body.source);
                        break;
                    case 'loadedSource':
                        fixSourcePath(false, event.body.source);
                        break;
                    case 'breakpoint':
                        fixSourcePath(false, event.body.breakpoint.source);
                        break;
                    default:
                        break;
                }
                break;
            }
            case 'request': {
                const request = msg;
                switch (request.command) {
                    case 'setBreakpoints':
                        fixSourcePath(true, request.arguments.source);
                        break;
                    case 'breakpointLocations':
                        fixSourcePath(true, request.arguments.source);
                        break;
                    case 'source':
                        fixSourcePath(true, request.arguments.source);
                        break;
                    case 'gotoTargets':
                        fixSourcePath(true, request.arguments.source);
                        break;
                    case 'launchVSCode':
                        request.arguments.args.forEach((arg) => fixSourcePath(false, arg));
                        break;
                    default:
                        break;
                }
                break;
            }
            case 'response': {
                const response = msg;
                if (response.success && response.body) {
                    switch (response.command) {
                        case 'stackTrace':
                            response.body.stackFrames.forEach(frame => fixSourcePath(false, frame.source));
                            break;
                        case 'loadedSources':
                            response.body.sources.forEach(source => fixSourcePath(false, source));
                            break;
                        case 'scopes':
                            response.body.scopes.forEach(scope => fixSourcePath(false, scope.source));
                            break;
                        case 'setFunctionBreakpoints':
                            response.body.breakpoints.forEach(bp => fixSourcePath(false, bp.source));
                            break;
                        case 'setBreakpoints':
                            response.body.breakpoints.forEach(bp => fixSourcePath(false, bp.source));
                            break;
                        case 'disassemble':
                            {
                                const di = response;
                                di.body?.instructions.forEach(di => fixSourcePath(false, di.location));
                            }
                            break;
                        default:
                            break;
                    }
                }
                break;
            }
        }
    }
    function getVisibleAndSorted(array) {
        return array.filter(config => !config.presentation?.hidden).sort((first, second) => {
            if (!first.presentation) {
                if (!second.presentation) {
                    return 0;
                }
                return 1;
            }
            if (!second.presentation) {
                return -1;
            }
            if (!first.presentation.group) {
                if (!second.presentation.group) {
                    return compareOrders(first.presentation.order, second.presentation.order);
                }
                return 1;
            }
            if (!second.presentation.group) {
                return -1;
            }
            if (first.presentation.group !== second.presentation.group) {
                return first.presentation.group.localeCompare(second.presentation.group);
            }
            return compareOrders(first.presentation.order, second.presentation.order);
        });
    }
    exports.getVisibleAndSorted = getVisibleAndSorted;
    function compareOrders(first, second) {
        if (typeof first !== 'number') {
            if (typeof second !== 'number') {
                return 0;
            }
            return 1;
        }
        if (typeof second !== 'number') {
            return -1;
        }
        return first - second;
    }
    async function saveAllBeforeDebugStart(configurationService, editorService) {
        const saveBeforeStartConfig = configurationService.getValue('debug.saveBeforeStart', { overrideIdentifier: editorService.activeTextEditorLanguageId });
        if (saveBeforeStartConfig !== 'none') {
            await editorService.saveAll();
            if (saveBeforeStartConfig === 'allEditorsInActiveGroup') {
                const activeEditor = editorService.activeEditorPane;
                if (activeEditor && activeEditor.input.resource?.scheme === network_1.Schemas.untitled) {
                    // Make sure to save the active editor in case it is in untitled file it wont be saved as part of saveAll #111850
                    await editorService.save({ editor: activeEditor.input, groupId: activeEditor.group.id });
                }
            }
        }
        await configurationService.reloadConfiguration();
    }
    exports.saveAllBeforeDebugStart = saveAllBeforeDebugStart;
    const sourcesEqual = (a, b) => !a || !b ? a === b : a.name === b.name && a.path === b.path && a.sourceReference === b.sourceReference;
    exports.sourcesEqual = sourcesEqual;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdVdGlscy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2RlYnVnL2NvbW1vbi9kZWJ1Z1V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWlCaEcsTUFBTSxnQkFBZ0IsR0FBRyxZQUFZLENBQUM7SUFFdEMsU0FBZ0IsU0FBUyxDQUFDLEtBQWEsRUFBRSxVQUFtQixFQUFFLElBQTJDO1FBQ3hHLE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxVQUFVLEtBQUssRUFBRSxLQUFLO1lBQzVELElBQUksVUFBVSxJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUU7Z0JBQ3ZELE9BQU8sS0FBSyxDQUFDO2FBQ2I7WUFFRCxPQUFPLElBQUksSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQzFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUNiLEtBQUssQ0FBQztRQUNSLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQVZELDhCQVVDO0lBRUQ7OztPQUdHO0lBQ0gsU0FBZ0IsNkJBQTZCLENBQXVDLElBQU87UUFDMUYsTUFBTSxNQUFNLEdBQWUsRUFBRSxDQUFDO1FBQzlCLEtBQUssTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQXlCLEVBQUU7WUFDNUQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ3pCLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDeEI7U0FDRDtRQUVELE9BQU8sTUFBTSxDQUFDO0lBQ2YsQ0FBQztJQVRELHNFQVNDO0lBR0QsU0FB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