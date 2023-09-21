/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings", "vs/base/common/uri", "vs/base/common/path", "vs/base/common/objects", "vs/base/common/network", "vs/editor/common/core/range", "vs/base/common/cancellation", "vs/base/common/arrays"], function (require, exports, strings_1, uri_1, path_1, objects_1, network_1, range_1, cancellation_1, arrays_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$uF = exports.$tF = exports.$sF = exports.$rF = exports.$qF = exports.$pF = exports.$oF = exports.$nF = exports.$mF = exports.$lF = exports.$kF = exports.$jF = exports.$iF = void 0;
    const _formatPIIRegexp = /{([^}]+)}/g;
    function $iF(value, excludePII, args) {
        return value.replace(_formatPIIRegexp, function (match, group) {
            if (excludePII && group.length > 0 && group[0] !== '_') {
                return match;
            }
            return args && args.hasOwnProperty(group) ?
                args[group] :
                match;
        });
    }
    exports.$iF = $iF;
    /**
     * Filters exceptions (keys marked with "!") from the given object. Used to
     * ensure exception data is not sent on web remotes, see #97628.
     */
    function $jF(data) {
        const output = {};
        for (const key of Object.keys(data)) {
            if (!key.startsWith('!')) {
                output[key] = data[key];
            }
        }
        return output;
    }
    exports.$jF = $jF;
    function $kF(session) {
        return session.configuration.request === 'attach' && !$lF(session) && (!session.parentSession || $kF(session.parentSession));
    }
    exports.$kF = $kF;
    /**
     * Returns the session or any parent which is an extension host debug session.
     * Returns undefined if there's none.
     */
    function $lF(session) {
        let type = session.configuration.type;
        if (!type) {
            return;
        }
        if (type === 'vslsShare') {
            type = session.configuration.adapterProxy.configuration.type;
        }
        if ((0, strings_1.$Me)(type, 'extensionhost') || (0, strings_1.$Me)(type, 'pwa-extensionhost')) {
            return session;
        }
        return session.parentSession ? $lF(session.parentSession) : undefined;
    }
    exports.$lF = $lF;
    // only a debugger contributions with a label, program, or runtime attribute is considered a "defining" or "main" debugger contribution
    function $mF(dbg) {
        return dbg.type && (dbg.label || dbg.program || dbg.runtime);
    }
    exports.$mF = $mF;
    function $nF(lineContent, looseStart, looseEnd) {
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
    exports.$nF = $nF;
    async function $oF(languageFeaturesService, model, position, token) {
        if (languageFeaturesService.evaluatableExpressionProvider.has(model)) {
            const supports = languageFeaturesService.evaluatableExpressionProvider.ordered(model);
            const results = (0, arrays_1.$Fb)(await Promise.all(supports.map(async (support) => {
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
            const { start, end } = $nF(lineContent, position.column, position.column);
            // use regex to extract the sub-expression #9821
            const matchingExpression = lineContent.substring(start - 1, end);
            return {
                matchingExpression,
                range: new range_1.$ks(position.lineNumber, start, position.lineNumber, start + matchingExpression.length)
            };
        }
        return null;
    }
    exports.$oF = $oF;
    // RFC 2396, Appendix A: https://www.ietf.org/rfc/rfc2396.txt
    const _schemePattern = /^[a-zA-Z][a-zA-Z0-9\+\-\.]+:/;
    function $pF(s) {
        // heuristics: a valid uri starts with a scheme and
        // the scheme has at least 2 characters so that it doesn't look like a drive letter.
        return !!(s && s.match(_schemePattern));
    }
    exports.$pF = $pF;
    function stringToUri(source) {
        if (typeof source.path === 'string') {
            if (typeof source.sourceReference === 'number' && source.sourceReference > 0) {
                // if there is a source reference, don't touch path
            }
            else {
                if ($pF(source.path)) {
                    return uri_1.URI.parse(source.path);
                }
                else {
                    // assume path
                    if ((0, path_1.$8d)(source.path)) {
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
    function $qF(message, toUri) {
        const fixPath = toUri ? stringToUri : uriToString;
        // since we modify Source.paths in the message in place, we need to make a copy of it (see #61129)
        const msg = (0, objects_1.$Vm)(message);
        convertPaths(msg, (toDA, source) => {
            if (toDA && source) {
                source.path = fixPath(source);
            }
        });
        return msg;
    }
    exports.$qF = $qF;
    function $rF(message, toUri) {
        const fixPath = toUri ? stringToUri : uriToString;
        // since we modify Source.paths in the message in place, we need to make a copy of it (see #61129)
        const msg = (0, objects_1.$Vm)(message);
        convertPaths(msg, (toDA, source) => {
            if (!toDA && source) {
                source.path = fixPath(source);
            }
        });
        return msg;
    }
    exports.$rF = $rF;
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
    function $sF(array) {
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
    exports.$sF = $sF;
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
    async function $tF(configurationService, editorService) {
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
    exports.$tF = $tF;
    const $uF = (a, b) => !a || !b ? a === b : a.name === b.name && a.path === b.path && a.sourceReference === b.sourceReference;
    exports.$uF = $uF;
});
//# sourceMappingURL=debugUtils.js.map