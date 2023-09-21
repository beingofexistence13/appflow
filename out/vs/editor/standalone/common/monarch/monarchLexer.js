/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/common/languages", "vs/editor/common/languages/nullTokenize", "vs/editor/standalone/common/monarch/monarchCommon", "vs/platform/configuration/common/configuration"], function (require, exports, lifecycle_1, languages, nullTokenize_1, monarchCommon, configuration_1) {
    "use strict";
    var MonarchTokenizer_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MonarchTokenizer = void 0;
    const CACHE_STACK_DEPTH = 5;
    /**
     * Reuse the same stack elements up to a certain depth.
     */
    class MonarchStackElementFactory {
        static { this._INSTANCE = new MonarchStackElementFactory(CACHE_STACK_DEPTH); }
        static create(parent, state) {
            return this._INSTANCE.create(parent, state);
        }
        constructor(maxCacheDepth) {
            this._maxCacheDepth = maxCacheDepth;
            this._entries = Object.create(null);
        }
        create(parent, state) {
            if (parent !== null && parent.depth >= this._maxCacheDepth) {
                // no caching above a certain depth
                return new MonarchStackElement(parent, state);
            }
            let stackElementId = MonarchStackElement.getStackElementId(parent);
            if (stackElementId.length > 0) {
                stackElementId += '|';
            }
            stackElementId += state;
            let result = this._entries[stackElementId];
            if (result) {
                return result;
            }
            result = new MonarchStackElement(parent, state);
            this._entries[stackElementId] = result;
            return result;
        }
    }
    class MonarchStackElement {
        constructor(parent, state) {
            this.parent = parent;
            this.state = state;
            this.depth = (this.parent ? this.parent.depth : 0) + 1;
        }
        static getStackElementId(element) {
            let result = '';
            while (element !== null) {
                if (result.length > 0) {
                    result += '|';
                }
                result += element.state;
                element = element.parent;
            }
            return result;
        }
        static _equals(a, b) {
            while (a !== null && b !== null) {
                if (a === b) {
                    return true;
                }
                if (a.state !== b.state) {
                    return false;
                }
                a = a.parent;
                b = b.parent;
            }
            if (a === null && b === null) {
                return true;
            }
            return false;
        }
        equals(other) {
            return MonarchStackElement._equals(this, other);
        }
        push(state) {
            return MonarchStackElementFactory.create(this, state);
        }
        pop() {
            return this.parent;
        }
        popall() {
            let result = this;
            while (result.parent) {
                result = result.parent;
            }
            return result;
        }
        switchTo(state) {
            return MonarchStackElementFactory.create(this.parent, state);
        }
    }
    class EmbeddedLanguageData {
        constructor(languageId, state) {
            this.languageId = languageId;
            this.state = state;
        }
        equals(other) {
            return (this.languageId === other.languageId
                && this.state.equals(other.state));
        }
        clone() {
            const stateClone = this.state.clone();
            // save an object
            if (stateClone === this.state) {
                return this;
            }
            return new EmbeddedLanguageData(this.languageId, this.state);
        }
    }
    /**
     * Reuse the same line states up to a certain depth.
     */
    class MonarchLineStateFactory {
        static { this._INSTANCE = new MonarchLineStateFactory(CACHE_STACK_DEPTH); }
        static create(stack, embeddedLanguageData) {
            return this._INSTANCE.create(stack, embeddedLanguageData);
        }
        constructor(maxCacheDepth) {
            this._maxCacheDepth = maxCacheDepth;
            this._entries = Object.create(null);
        }
        create(stack, embeddedLanguageData) {
            if (embeddedLanguageData !== null) {
                // no caching when embedding
                return new MonarchLineState(stack, embeddedLanguageData);
            }
            if (stack !== null && stack.depth >= this._maxCacheDepth) {
                // no caching above a certain depth
                return new MonarchLineState(stack, embeddedLanguageData);
            }
            const stackElementId = MonarchStackElement.getStackElementId(stack);
            let result = this._entries[stackElementId];
            if (result) {
                return result;
            }
            result = new MonarchLineState(stack, null);
            this._entries[stackElementId] = result;
            return result;
        }
    }
    class MonarchLineState {
        constructor(stack, embeddedLanguageData) {
            this.stack = stack;
            this.embeddedLanguageData = embeddedLanguageData;
        }
        clone() {
            const embeddedlanguageDataClone = this.embeddedLanguageData ? this.embeddedLanguageData.clone() : null;
            // save an object
            if (embeddedlanguageDataClone === this.embeddedLanguageData) {
                return this;
            }
            return MonarchLineStateFactory.create(this.stack, this.embeddedLanguageData);
        }
        equals(other) {
            if (!(other instanceof MonarchLineState)) {
                return false;
            }
            if (!this.stack.equals(other.stack)) {
                return false;
            }
            if (this.embeddedLanguageData === null && other.embeddedLanguageData === null) {
                return true;
            }
            if (this.embeddedLanguageData === null || other.embeddedLanguageData === null) {
                return false;
            }
            return this.embeddedLanguageData.equals(other.embeddedLanguageData);
        }
    }
    class MonarchClassicTokensCollector {
        constructor() {
            this._tokens = [];
            this._languageId = null;
            this._lastTokenType = null;
            this._lastTokenLanguage = null;
        }
        enterLanguage(languageId) {
            this._languageId = languageId;
        }
        emit(startOffset, type) {
            if (this._lastTokenType === type && this._lastTokenLanguage === this._languageId) {
                return;
            }
            this._lastTokenType = type;
            this._lastTokenLanguage = this._languageId;
            this._tokens.push(new languages.Token(startOffset, type, this._languageId));
        }
        nestedLanguageTokenize(embeddedLanguageLine, hasEOL, embeddedLanguageData, offsetDelta) {
            const nestedLanguageId = embeddedLanguageData.languageId;
            const embeddedModeState = embeddedLanguageData.state;
            const nestedLanguageTokenizationSupport = languages.TokenizationRegistry.get(nestedLanguageId);
            if (!nestedLanguageTokenizationSupport) {
                this.enterLanguage(nestedLanguageId);
                this.emit(offsetDelta, '');
                return embeddedModeState;
            }
            const nestedResult = nestedLanguageTokenizationSupport.tokenize(embeddedLanguageLine, hasEOL, embeddedModeState);
            if (offsetDelta !== 0) {
                for (const token of nestedResult.tokens) {
                    this._tokens.push(new languages.Token(token.offset + offsetDelta, token.type, token.language));
                }
            }
            else {
                this._tokens = this._tokens.concat(nestedResult.tokens);
            }
            this._lastTokenType = null;
            this._lastTokenLanguage = null;
            this._languageId = null;
            return nestedResult.endState;
        }
        finalize(endState) {
            return new languages.TokenizationResult(this._tokens, endState);
        }
    }
    class MonarchModernTokensCollector {
        constructor(languageService, theme) {
            this._languageService = languageService;
            this._theme = theme;
            this._prependTokens = null;
            this._tokens = [];
            this._currentLanguageId = 0 /* LanguageId.Null */;
            this._lastTokenMetadata = 0;
        }
        enterLanguage(languageId) {
            this._currentLanguageId = this._languageService.languageIdCodec.encodeLanguageId(languageId);
        }
        emit(startOffset, type) {
            const metadata = this._theme.match(this._currentLanguageId, type) | 1024 /* MetadataConsts.BALANCED_BRACKETS_MASK */;
            if (this._lastTokenMetadata === metadata) {
                return;
            }
            this._lastTokenMetadata = metadata;
            this._tokens.push(startOffset);
            this._tokens.push(metadata);
        }
        static _merge(a, b, c) {
            const aLen = (a !== null ? a.length : 0);
            const bLen = b.length;
            const cLen = (c !== null ? c.length : 0);
            if (aLen === 0 && bLen === 0 && cLen === 0) {
                return new Uint32Array(0);
            }
            if (aLen === 0 && bLen === 0) {
                return c;
            }
            if (bLen === 0 && cLen === 0) {
                return a;
            }
            const result = new Uint32Array(aLen + bLen + cLen);
            if (a !== null) {
                result.set(a);
            }
            for (let i = 0; i < bLen; i++) {
                result[aLen + i] = b[i];
            }
            if (c !== null) {
                result.set(c, aLen + bLen);
            }
            return result;
        }
        nestedLanguageTokenize(embeddedLanguageLine, hasEOL, embeddedLanguageData, offsetDelta) {
            const nestedLanguageId = embeddedLanguageData.languageId;
            const embeddedModeState = embeddedLanguageData.state;
            const nestedLanguageTokenizationSupport = languages.TokenizationRegistry.get(nestedLanguageId);
            if (!nestedLanguageTokenizationSupport) {
                this.enterLanguage(nestedLanguageId);
                this.emit(offsetDelta, '');
                return embeddedModeState;
            }
            const nestedResult = nestedLanguageTokenizationSupport.tokenizeEncoded(embeddedLanguageLine, hasEOL, embeddedModeState);
            if (offsetDelta !== 0) {
                for (let i = 0, len = nestedResult.tokens.length; i < len; i += 2) {
                    nestedResult.tokens[i] += offsetDelta;
                }
            }
            this._prependTokens = MonarchModernTokensCollector._merge(this._prependTokens, this._tokens, nestedResult.tokens);
            this._tokens = [];
            this._currentLanguageId = 0;
            this._lastTokenMetadata = 0;
            return nestedResult.endState;
        }
        finalize(endState) {
            return new languages.EncodedTokenizationResult(MonarchModernTokensCollector._merge(this._prependTokens, this._tokens, null), endState);
        }
    }
    let MonarchTokenizer = MonarchTokenizer_1 = class MonarchTokenizer extends lifecycle_1.Disposable {
        constructor(languageService, standaloneThemeService, languageId, lexer, _configurationService) {
            super();
            this._configurationService = _configurationService;
            this._languageService = languageService;
            this._standaloneThemeService = standaloneThemeService;
            this._languageId = languageId;
            this._lexer = lexer;
            this._embeddedLanguages = Object.create(null);
            this.embeddedLoaded = Promise.resolve(undefined);
            // Set up listening for embedded modes
            let emitting = false;
            this._register(languages.TokenizationRegistry.onDidChange((e) => {
                if (emitting) {
                    return;
                }
                let isOneOfMyEmbeddedModes = false;
                for (let i = 0, len = e.changedLanguages.length; i < len; i++) {
                    const language = e.changedLanguages[i];
                    if (this._embeddedLanguages[language]) {
                        isOneOfMyEmbeddedModes = true;
                        break;
                    }
                }
                if (isOneOfMyEmbeddedModes) {
                    emitting = true;
                    languages.TokenizationRegistry.handleChange([this._languageId]);
                    emitting = false;
                }
            }));
            this._maxTokenizationLineLength = this._configurationService.getValue('editor.maxTokenizationLineLength', {
                overrideIdentifier: this._languageId
            });
            this._register(this._configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('editor.maxTokenizationLineLength')) {
                    this._maxTokenizationLineLength = this._configurationService.getValue('editor.maxTokenizationLineLength', {
                        overrideIdentifier: this._languageId
                    });
                }
            }));
        }
        getLoadStatus() {
            const promises = [];
            for (const nestedLanguageId in this._embeddedLanguages) {
                const tokenizationSupport = languages.TokenizationRegistry.get(nestedLanguageId);
                if (tokenizationSupport) {
                    // The nested language is already loaded
                    if (tokenizationSupport instanceof MonarchTokenizer_1) {
                        const nestedModeStatus = tokenizationSupport.getLoadStatus();
                        if (nestedModeStatus.loaded === false) {
                            promises.push(nestedModeStatus.promise);
                        }
                    }
                    continue;
                }
                if (!languages.TokenizationRegistry.isResolved(nestedLanguageId)) {
                    // The nested language is in the process of being loaded
                    promises.push(languages.TokenizationRegistry.getOrCreate(nestedLanguageId));
                }
            }
            if (promises.length === 0) {
                return {
                    loaded: true
                };
            }
            return {
                loaded: false,
                promise: Promise.all(promises).then(_ => undefined)
            };
        }
        getInitialState() {
            const rootState = MonarchStackElementFactory.create(null, this._lexer.start);
            return MonarchLineStateFactory.create(rootState, null);
        }
        tokenize(line, hasEOL, lineState) {
            if (line.length >= this._maxTokenizationLineLength) {
                return (0, nullTokenize_1.nullTokenize)(this._languageId, lineState);
            }
            const tokensCollector = new MonarchClassicTokensCollector();
            const endLineState = this._tokenize(line, hasEOL, lineState, tokensCollector);
            return tokensCollector.finalize(endLineState);
        }
        tokenizeEncoded(line, hasEOL, lineState) {
            if (line.length >= this._maxTokenizationLineLength) {
                return (0, nullTokenize_1.nullTokenizeEncoded)(this._languageService.languageIdCodec.encodeLanguageId(this._languageId), lineState);
            }
            const tokensCollector = new MonarchModernTokensCollector(this._languageService, this._standaloneThemeService.getColorTheme().tokenTheme);
            const endLineState = this._tokenize(line, hasEOL, lineState, tokensCollector);
            return tokensCollector.finalize(endLineState);
        }
        _tokenize(line, hasEOL, lineState, collector) {
            if (lineState.embeddedLanguageData) {
                return this._nestedTokenize(line, hasEOL, lineState, 0, collector);
            }
            else {
                return this._myTokenize(line, hasEOL, lineState, 0, collector);
            }
        }
        _findLeavingNestedLanguageOffset(line, state) {
            let rules = this._lexer.tokenizer[state.stack.state];
            if (!rules) {
                rules = monarchCommon.findRules(this._lexer, state.stack.state); // do parent matching
                if (!rules) {
                    throw monarchCommon.createError(this._lexer, 'tokenizer state is not defined: ' + state.stack.state);
                }
            }
            let popOffset = -1;
            let hasEmbeddedPopRule = false;
            for (const rule of rules) {
                if (!monarchCommon.isIAction(rule.action) || rule.action.nextEmbedded !== '@pop') {
                    continue;
                }
                hasEmbeddedPopRule = true;
                let regex = rule.regex;
                const regexSource = rule.regex.source;
                if (regexSource.substr(0, 4) === '^(?:' && regexSource.substr(regexSource.length - 1, 1) === ')') {
                    const flags = (regex.ignoreCase ? 'i' : '') + (regex.unicode ? 'u' : '');
                    regex = new RegExp(regexSource.substr(4, regexSource.length - 5), flags);
                }
                const result = line.search(regex);
                if (result === -1 || (result !== 0 && rule.matchOnlyAtLineStart)) {
                    continue;
                }
                if (popOffset === -1 || result < popOffset) {
                    popOffset = result;
                }
            }
            if (!hasEmbeddedPopRule) {
                throw monarchCommon.createError(this._lexer, 'no rule containing nextEmbedded: "@pop" in tokenizer embedded state: ' + state.stack.state);
            }
            return popOffset;
        }
        _nestedTokenize(line, hasEOL, lineState, offsetDelta, tokensCollector) {
            const popOffset = this._findLeavingNestedLanguageOffset(line, lineState);
            if (popOffset === -1) {
                // tokenization will not leave nested language
                const nestedEndState = tokensCollector.nestedLanguageTokenize(line, hasEOL, lineState.embeddedLanguageData, offsetDelta);
                return MonarchLineStateFactory.create(lineState.stack, new EmbeddedLanguageData(lineState.embeddedLanguageData.languageId, nestedEndState));
            }
            const nestedLanguageLine = line.substring(0, popOffset);
            if (nestedLanguageLine.length > 0) {
                // tokenize with the nested language
                tokensCollector.nestedLanguageTokenize(nestedLanguageLine, false, lineState.embeddedLanguageData, offsetDelta);
            }
            const restOfTheLine = line.substring(popOffset);
            return this._myTokenize(restOfTheLine, hasEOL, lineState, offsetDelta + popOffset, tokensCollector);
        }
        _safeRuleName(rule) {
            if (rule) {
                return rule.name;
            }
            return '(unknown)';
        }
        _myTokenize(lineWithoutLF, hasEOL, lineState, offsetDelta, tokensCollector) {
            tokensCollector.enterLanguage(this._languageId);
            const lineWithoutLFLength = lineWithoutLF.length;
            const line = (hasEOL && this._lexer.includeLF ? lineWithoutLF + '\n' : lineWithoutLF);
            const lineLength = line.length;
            let embeddedLanguageData = lineState.embeddedLanguageData;
            let stack = lineState.stack;
            let pos = 0;
            let groupMatching = null;
            // See https://github.com/microsoft/monaco-editor/issues/1235
            // Evaluate rules at least once for an empty line
            let forceEvaluation = true;
            while (forceEvaluation || pos < lineLength) {
                const pos0 = pos;
                const stackLen0 = stack.depth;
                const groupLen0 = groupMatching ? groupMatching.groups.length : 0;
                const state = stack.state;
                let matches = null;
                let matched = null;
                let action = null;
                let rule = null;
                let enteringEmbeddedLanguage = null;
                // check if we need to process group matches first
                if (groupMatching) {
                    matches = groupMatching.matches;
                    const groupEntry = groupMatching.groups.shift();
                    matched = groupEntry.matched;
                    action = groupEntry.action;
                    rule = groupMatching.rule;
                    // cleanup if necessary
                    if (groupMatching.groups.length === 0) {
                        groupMatching = null;
                    }
                }
                else {
                    // otherwise we match on the token stream
                    if (!forceEvaluation && pos >= lineLength) {
                        // nothing to do
                        break;
                    }
                    forceEvaluation = false;
                    // get the rules for this state
                    let rules = this._lexer.tokenizer[state];
                    if (!rules) {
                        rules = monarchCommon.findRules(this._lexer, state); // do parent matching
                        if (!rules) {
                            throw monarchCommon.createError(this._lexer, 'tokenizer state is not defined: ' + state);
                        }
                    }
                    // try each rule until we match
                    const restOfLine = line.substr(pos);
                    for (const rule of rules) {
                        if (pos === 0 || !rule.matchOnlyAtLineStart) {
                            matches = restOfLine.match(rule.regex);
                            if (matches) {
                                matched = matches[0];
                                action = rule.action;
                                break;
                            }
                        }
                    }
                }
                // We matched 'rule' with 'matches' and 'action'
                if (!matches) {
                    matches = [''];
                    matched = '';
                }
                if (!action) {
                    // bad: we didn't match anything, and there is no action to take
                    // we need to advance the stream or we get progress trouble
                    if (pos < lineLength) {
                        matches = [line.charAt(pos)];
                        matched = matches[0];
                    }
                    action = this._lexer.defaultToken;
                }
                if (matched === null) {
                    // should never happen, needed for strict null checking
                    break;
                }
                // advance stream
                pos += matched.length;
                // maybe call action function (used for 'cases')
                while (monarchCommon.isFuzzyAction(action) && monarchCommon.isIAction(action) && action.test) {
                    action = action.test(matched, matches, state, pos === lineLength);
                }
                let result = null;
                // set the result: either a string or an array of actions
                if (typeof action === 'string' || Array.isArray(action)) {
                    result = action;
                }
                else if (action.group) {
                    result = action.group;
                }
                else if (action.token !== null && action.token !== undefined) {
                    // do $n replacements?
                    if (action.tokenSubst) {
                        result = monarchCommon.substituteMatches(this._lexer, action.token, matched, matches, state);
                    }
                    else {
                        result = action.token;
                    }
                    // enter embedded language?
                    if (action.nextEmbedded) {
                        if (action.nextEmbedded === '@pop') {
                            if (!embeddedLanguageData) {
                                throw monarchCommon.createError(this._lexer, 'cannot pop embedded language if not inside one');
                            }
                            embeddedLanguageData = null;
                        }
                        else if (embeddedLanguageData) {
                            throw monarchCommon.createError(this._lexer, 'cannot enter embedded language from within an embedded language');
                        }
                        else {
                            enteringEmbeddedLanguage = monarchCommon.substituteMatches(this._lexer, action.nextEmbedded, matched, matches, state);
                        }
                    }
                    // state transformations
                    if (action.goBack) { // back up the stream..
                        pos = Math.max(0, pos - action.goBack);
                    }
                    if (action.switchTo && typeof action.switchTo === 'string') {
                        let nextState = monarchCommon.substituteMatches(this._lexer, action.switchTo, matched, matches, state); // switch state without a push...
                        if (nextState[0] === '@') {
                            nextState = nextState.substr(1); // peel off starting '@'
                        }
                        if (!monarchCommon.findRules(this._lexer, nextState)) {
                            throw monarchCommon.createError(this._lexer, 'trying to switch to a state \'' + nextState + '\' that is undefined in rule: ' + this._safeRuleName(rule));
                        }
                        else {
                            stack = stack.switchTo(nextState);
                        }
                    }
                    else if (action.transform && typeof action.transform === 'function') {
                        throw monarchCommon.createError(this._lexer, 'action.transform not supported');
                    }
                    else if (action.next) {
                        if (action.next === '@push') {
                            if (stack.depth >= this._lexer.maxStack) {
                                throw monarchCommon.createError(this._lexer, 'maximum tokenizer stack size reached: [' +
                                    stack.state + ',' + stack.parent.state + ',...]');
                            }
                            else {
                                stack = stack.push(state);
                            }
                        }
                        else if (action.next === '@pop') {
                            if (stack.depth <= 1) {
                                throw monarchCommon.createError(this._lexer, 'trying to pop an empty stack in rule: ' + this._safeRuleName(rule));
                            }
                            else {
                                stack = stack.pop();
                            }
                        }
                        else if (action.next === '@popall') {
                            stack = stack.popall();
                        }
                        else {
                            let nextState = monarchCommon.substituteMatches(this._lexer, action.next, matched, matches, state);
                            if (nextState[0] === '@') {
                                nextState = nextState.substr(1); // peel off starting '@'
                            }
                            if (!monarchCommon.findRules(this._lexer, nextState)) {
                                throw monarchCommon.createError(this._lexer, 'trying to set a next state \'' + nextState + '\' that is undefined in rule: ' + this._safeRuleName(rule));
                            }
                            else {
                                stack = stack.push(nextState);
                            }
                        }
                    }
                    if (action.log && typeof (action.log) === 'string') {
                        monarchCommon.log(this._lexer, this._lexer.languageId + ': ' + monarchCommon.substituteMatches(this._lexer, action.log, matched, matches, state));
                    }
                }
                // check result
                if (result === null) {
                    throw monarchCommon.createError(this._lexer, 'lexer rule has no well-defined action in rule: ' + this._safeRuleName(rule));
                }
                const computeNewStateForEmbeddedLanguage = (enteringEmbeddedLanguage) => {
                    // support language names, mime types, and language ids
                    const languageId = (this._languageService.getLanguageIdByLanguageName(enteringEmbeddedLanguage)
                        || this._languageService.getLanguageIdByMimeType(enteringEmbeddedLanguage)
                        || enteringEmbeddedLanguage);
                    const embeddedLanguageData = this._getNestedEmbeddedLanguageData(languageId);
                    if (pos < lineLength) {
                        // there is content from the embedded language on this line
                        const restOfLine = lineWithoutLF.substr(pos);
                        return this._nestedTokenize(restOfLine, hasEOL, MonarchLineStateFactory.create(stack, embeddedLanguageData), offsetDelta + pos, tokensCollector);
                    }
                    else {
                        return MonarchLineStateFactory.create(stack, embeddedLanguageData);
                    }
                };
                // is the result a group match?
                if (Array.isArray(result)) {
                    if (groupMatching && groupMatching.groups.length > 0) {
                        throw monarchCommon.createError(this._lexer, 'groups cannot be nested: ' + this._safeRuleName(rule));
                    }
                    if (matches.length !== result.length + 1) {
                        throw monarchCommon.createError(this._lexer, 'matched number of groups does not match the number of actions in rule: ' + this._safeRuleName(rule));
                    }
                    let totalLen = 0;
                    for (let i = 1; i < matches.length; i++) {
                        totalLen += matches[i].length;
                    }
                    if (totalLen !== matched.length) {
                        throw monarchCommon.createError(this._lexer, 'with groups, all characters should be matched in consecutive groups in rule: ' + this._safeRuleName(rule));
                    }
                    groupMatching = {
                        rule: rule,
                        matches: matches,
                        groups: []
                    };
                    for (let i = 0; i < result.length; i++) {
                        groupMatching.groups[i] = {
                            action: result[i],
                            matched: matches[i + 1]
                        };
                    }
                    pos -= matched.length;
                    // call recursively to initiate first result match
                    continue;
                }
                else {
                    // regular result
                    // check for '@rematch'
                    if (result === '@rematch') {
                        pos -= matched.length;
                        matched = ''; // better set the next state too..
                        matches = null;
                        result = '';
                        // Even though `@rematch` was specified, if `nextEmbedded` also specified,
                        // a state transition should occur.
                        if (enteringEmbeddedLanguage !== null) {
                            return computeNewStateForEmbeddedLanguage(enteringEmbeddedLanguage);
                        }
                    }
                    // check progress
                    if (matched.length === 0) {
                        if (lineLength === 0 || stackLen0 !== stack.depth || state !== stack.state || (!groupMatching ? 0 : groupMatching.groups.length) !== groupLen0) {
                            continue;
                        }
                        else {
                            throw monarchCommon.createError(this._lexer, 'no progress in tokenizer in rule: ' + this._safeRuleName(rule));
                        }
                    }
                    // return the result (and check for brace matching)
                    // todo: for efficiency we could pre-sanitize tokenPostfix and substitutions
                    let tokenType = null;
                    if (monarchCommon.isString(result) && result.indexOf('@brackets') === 0) {
                        const rest = result.substr('@brackets'.length);
                        const bracket = findBracket(this._lexer, matched);
                        if (!bracket) {
                            throw monarchCommon.createError(this._lexer, '@brackets token returned but no bracket defined as: ' + matched);
                        }
                        tokenType = monarchCommon.sanitize(bracket.token + rest);
                    }
                    else {
                        const token = (result === '' ? '' : result + this._lexer.tokenPostfix);
                        tokenType = monarchCommon.sanitize(token);
                    }
                    if (pos0 < lineWithoutLFLength) {
                        tokensCollector.emit(pos0 + offsetDelta, tokenType);
                    }
                }
                if (enteringEmbeddedLanguage !== null) {
                    return computeNewStateForEmbeddedLanguage(enteringEmbeddedLanguage);
                }
            }
            return MonarchLineStateFactory.create(stack, embeddedLanguageData);
        }
        _getNestedEmbeddedLanguageData(languageId) {
            if (!this._languageService.isRegisteredLanguageId(languageId)) {
                return new EmbeddedLanguageData(languageId, nullTokenize_1.NullState);
            }
            if (languageId !== this._languageId) {
                // Fire language loading event
                this._languageService.requestBasicLanguageFeatures(languageId);
                languages.TokenizationRegistry.getOrCreate(languageId);
                this._embeddedLanguages[languageId] = true;
            }
            const tokenizationSupport = languages.TokenizationRegistry.get(languageId);
            if (tokenizationSupport) {
                return new EmbeddedLanguageData(languageId, tokenizationSupport.getInitialState());
            }
            return new EmbeddedLanguageData(languageId, nullTokenize_1.NullState);
        }
    };
    exports.MonarchTokenizer = MonarchTokenizer;
    exports.MonarchTokenizer = MonarchTokenizer = MonarchTokenizer_1 = __decorate([
        __param(4, configuration_1.IConfigurationService)
    ], MonarchTokenizer);
    /**
     * Searches for a bracket in the 'brackets' attribute that matches the input.
     */
    function findBracket(lexer, matched) {
        if (!matched) {
            return null;
        }
        matched = monarchCommon.fixCase(lexer, matched);
        const brackets = lexer.brackets;
        for (const bracket of brackets) {
            if (bracket.open === matched) {
                return { token: bracket.token, bracketType: 1 /* monarchCommon.MonarchBracket.Open */ };
            }
            else if (bracket.close === matched) {
                return { token: bracket.token, bracketType: -1 /* monarchCommon.MonarchBracket.Close */ };
            }
        }
        return null;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9uYXJjaExleGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL3N0YW5kYWxvbmUvY29tbW9uL21vbmFyY2gvbW9uYXJjaExleGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFpQmhHLE1BQU0saUJBQWlCLEdBQUcsQ0FBQyxDQUFDO0lBRTVCOztPQUVHO0lBQ0gsTUFBTSwwQkFBMEI7aUJBRVAsY0FBUyxHQUFHLElBQUksMEJBQTBCLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUMvRSxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQWtDLEVBQUUsS0FBYTtZQUNyRSxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM3QyxDQUFDO1FBS0QsWUFBWSxhQUFxQjtZQUNoQyxJQUFJLENBQUMsY0FBYyxHQUFHLGFBQWEsQ0FBQztZQUNwQyxJQUFJLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckMsQ0FBQztRQUVNLE1BQU0sQ0FBQyxNQUFrQyxFQUFFLEtBQWE7WUFDOUQsSUFBSSxNQUFNLEtBQUssSUFBSSxJQUFJLE1BQU0sQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRTtnQkFDM0QsbUNBQW1DO2dCQUNuQyxPQUFPLElBQUksbUJBQW1CLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQzlDO1lBQ0QsSUFBSSxjQUFjLEdBQUcsbUJBQW1CLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbkUsSUFBSSxjQUFjLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDOUIsY0FBYyxJQUFJLEdBQUcsQ0FBQzthQUN0QjtZQUNELGNBQWMsSUFBSSxLQUFLLENBQUM7WUFFeEIsSUFB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