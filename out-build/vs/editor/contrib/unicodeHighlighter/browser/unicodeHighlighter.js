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
define(["require", "exports", "vs/base/common/async", "vs/base/common/codicons", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/strings", "vs/editor/browser/editorExtensions", "vs/editor/common/config/editorOptions", "vs/editor/common/model/textModel", "vs/editor/common/services/unicodeTextModelHighlighter", "vs/editor/common/services/editorWorker", "vs/editor/common/languages/language", "vs/editor/common/viewModel/viewModelDecorations", "vs/editor/contrib/hover/browser/hoverTypes", "vs/editor/contrib/hover/browser/markdownHoverParticipant", "vs/editor/contrib/unicodeHighlighter/browser/bannerController", "vs/nls!vs/editor/contrib/unicodeHighlighter/browser/unicodeHighlighter", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/platform/opener/common/opener", "vs/platform/quickinput/common/quickInput", "vs/platform/theme/common/iconRegistry", "vs/platform/workspace/common/workspaceTrust", "vs/css!./unicodeHighlighter"], function (require, exports, async_1, codicons_1, htmlContent_1, lifecycle_1, platform, strings_1, editorExtensions_1, editorOptions_1, textModel_1, unicodeTextModelHighlighter_1, editorWorker_1, language_1, viewModelDecorations_1, hoverTypes_1, markdownHoverParticipant_1, bannerController_1, nls, configuration_1, instantiation_1, opener_1, quickInput_1, iconRegistry_1, workspaceTrust_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$c$ = exports.$b$ = exports.$a$ = exports.$_0 = exports.$$0 = exports.$00 = exports.$90 = exports.$80 = exports.$70 = exports.$60 = void 0;
    exports.$60 = (0, iconRegistry_1.$9u)('extensions-warning-message', codicons_1.$Pj.warning, nls.localize(0, null));
    let $70 = class $70 extends lifecycle_1.$kc {
        static { this.ID = 'editor.contrib.unicodeHighlighter'; }
        constructor(h, j, m, instantiationService) {
            super();
            this.h = h;
            this.j = j;
            this.m = m;
            this.a = null;
            this.g = false;
            this.n = (state) => {
                if (state && state.hasMore) {
                    if (this.g) {
                        return;
                    }
                    // This document contains many non-basic ASCII characters.
                    const max = Math.max(state.ambiguousCharacterCount, state.nonBasicAsciiCharacterCount, state.invisibleCharacterCount);
                    let data;
                    if (state.nonBasicAsciiCharacterCount >= max) {
                        data = {
                            message: nls.localize(1, null),
                            command: new $b$(),
                        };
                    }
                    else if (state.ambiguousCharacterCount >= max) {
                        data = {
                            message: nls.localize(2, null),
                            command: new $_0(),
                        };
                    }
                    else if (state.invisibleCharacterCount >= max) {
                        data = {
                            message: nls.localize(3, null),
                            command: new $a$(),
                        };
                    }
                    else {
                        throw new Error('Unreachable');
                    }
                    this.f.show({
                        id: 'unicodeHighlightBanner',
                        message: data.message,
                        icon: exports.$60,
                        actions: [
                            {
                                label: data.command.shortLabel,
                                href: `command:${data.command.id}`
                            }
                        ],
                        onClose: () => {
                            this.g = true;
                        },
                    });
                }
                else {
                    this.f.hide();
                }
            };
            this.f = this.B(instantiationService.createInstance(bannerController_1.$50, h));
            this.B(this.h.onDidChangeModel(() => {
                this.g = false;
                this.s();
            }));
            this.b = h.getOption(124 /* EditorOption.unicodeHighlighting */);
            this.B(m.onDidChangeTrust(e => {
                this.s();
            }));
            this.B(h.onDidChangeConfiguration(e => {
                if (e.hasChanged(124 /* EditorOption.unicodeHighlighting */)) {
                    this.b = h.getOption(124 /* EditorOption.unicodeHighlighting */);
                    this.s();
                }
            }));
            this.s();
        }
        dispose() {
            if (this.a) {
                this.a.dispose();
                this.a = null;
            }
            super.dispose();
        }
        s() {
            this.n(null);
            if (this.a) {
                this.a.dispose();
                this.a = null;
            }
            if (!this.h.hasModel()) {
                return;
            }
            const options = resolveOptions(this.m.isWorkspaceTrusted(), this.b);
            if ([
                options.nonBasicASCII,
                options.ambiguousCharacters,
                options.invisibleCharacters,
            ].every((option) => option === false)) {
                // Don't do anything if the feature is fully disabled
                return;
            }
            const highlightOptions = {
                nonBasicASCII: options.nonBasicASCII,
                ambiguousCharacters: options.ambiguousCharacters,
                invisibleCharacters: options.invisibleCharacters,
                includeComments: options.includeComments,
                includeStrings: options.includeStrings,
                allowedCodePoints: Object.keys(options.allowedCharacters).map(c => c.codePointAt(0)),
                allowedLocales: Object.keys(options.allowedLocales).map(locale => {
                    if (locale === '_os') {
                        const osLocale = new Intl.NumberFormat().resolvedOptions().locale;
                        return osLocale;
                    }
                    else if (locale === '_vscode') {
                        return platform.$v;
                    }
                    return locale;
                }),
            };
            if (this.j.canComputeUnicodeHighlights(this.h.getModel().uri)) {
                this.a = new DocumentUnicodeHighlighter(this.h, highlightOptions, this.n, this.j);
            }
            else {
                this.a = new ViewportUnicodeHighlighter(this.h, highlightOptions, this.n);
            }
        }
        getDecorationInfo(decoration) {
            if (this.a) {
                return this.a.getDecorationInfo(decoration);
            }
            return null;
        }
    };
    exports.$70 = $70;
    exports.$70 = $70 = __decorate([
        __param(1, editorWorker_1.$4Y),
        __param(2, workspaceTrust_1.$$z),
        __param(3, instantiation_1.$Ah)
    ], $70);
    function resolveOptions(trusted, options) {
        return {
            nonBasicASCII: options.nonBasicASCII === editorOptions_1.inUntrustedWorkspace ? !trusted : options.nonBasicASCII,
            ambiguousCharacters: options.ambiguousCharacters,
            invisibleCharacters: options.invisibleCharacters,
            includeComments: options.includeComments === editorOptions_1.inUntrustedWorkspace ? !trusted : options.includeComments,
            includeStrings: options.includeStrings === editorOptions_1.inUntrustedWorkspace ? !trusted : options.includeStrings,
            allowedCharacters: options.allowedCharacters,
            allowedLocales: options.allowedLocales,
        };
    }
    let DocumentUnicodeHighlighter = class DocumentUnicodeHighlighter extends lifecycle_1.$kc {
        constructor(g, h, j, m) {
            super();
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.a = this.g.getModel();
            this.f = this.g.createDecorationsCollection();
            this.b = this.B(new async_1.$Sg(() => this.n(), 250));
            this.B(this.g.onDidChangeModelContent(() => {
                this.b.schedule();
            }));
            this.b.schedule();
        }
        dispose() {
            this.f.clear();
            super.dispose();
        }
        n() {
            if (this.a.isDisposed()) {
                return;
            }
            if (!this.a.mightContainNonBasicASCII()) {
                this.f.clear();
                return;
            }
            const modelVersionId = this.a.getVersionId();
            this.m
                .computedUnicodeHighlights(this.a.uri, this.h)
                .then((info) => {
                if (this.a.isDisposed()) {
                    return;
                }
                if (this.a.getVersionId() !== modelVersionId) {
                    // model changed in the meantime
                    return;
                }
                this.j(info);
                const decorations = [];
                if (!info.hasMore) {
                    // Don't show decoration if there are too many.
                    // In this case, a banner is shown.
                    for (const range of info.ranges) {
                        decorations.push({
                            range: range,
                            options: Decorations.instance.getDecorationFromOptions(this.h),
                        });
                    }
                }
                this.f.set(decorations);
            });
        }
        getDecorationInfo(decoration) {
            if (!this.f.has(decoration)) {
                return null;
            }
            const model = this.g.getModel();
            if (!(0, viewModelDecorations_1.$nY)(model, decoration)) {
                return null;
            }
            const text = model.getValueInRange(decoration.range);
            return {
                reason: computeReason(text, this.h),
                inComment: (0, viewModelDecorations_1.$oY)(model, decoration),
                inString: (0, viewModelDecorations_1.$pY)(model, decoration),
            };
        }
    };
    DocumentUnicodeHighlighter = __decorate([
        __param(3, editorWorker_1.$4Y)
    ], DocumentUnicodeHighlighter);
    class ViewportUnicodeHighlighter extends lifecycle_1.$kc {
        constructor(g, h, j) {
            super();
            this.g = g;
            this.h = h;
            this.j = j;
            this.a = this.g.getModel();
            this.f = this.g.createDecorationsCollection();
            this.b = this.B(new async_1.$Sg(() => this.m(), 250));
            this.B(this.g.onDidLayoutChange(() => {
                this.b.schedule();
            }));
            this.B(this.g.onDidScrollChange(() => {
                this.b.schedule();
            }));
            this.B(this.g.onDidChangeHiddenAreas(() => {
                this.b.schedule();
            }));
            this.B(this.g.onDidChangeModelContent(() => {
                this.b.schedule();
            }));
            this.b.schedule();
        }
        dispose() {
            this.f.clear();
            super.dispose();
        }
        m() {
            if (this.a.isDisposed()) {
                return;
            }
            if (!this.a.mightContainNonBasicASCII()) {
                this.f.clear();
                return;
            }
            const ranges = this.g.getVisibleRanges();
            const decorations = [];
            const totalResult = {
                ranges: [],
                ambiguousCharacterCount: 0,
                invisibleCharacterCount: 0,
                nonBasicAsciiCharacterCount: 0,
                hasMore: false,
            };
            for (const range of ranges) {
                const result = unicodeTextModelHighlighter_1.$xY.computeUnicodeHighlights(this.a, this.h, range);
                for (const r of result.ranges) {
                    totalResult.ranges.push(r);
                }
                totalResult.ambiguousCharacterCount += totalResult.ambiguousCharacterCount;
                totalResult.invisibleCharacterCount += totalResult.invisibleCharacterCount;
                totalResult.nonBasicAsciiCharacterCount += totalResult.nonBasicAsciiCharacterCount;
                totalResult.hasMore = totalResult.hasMore || result.hasMore;
            }
            if (!totalResult.hasMore) {
                // Don't show decorations if there are too many.
                // A banner will be shown instead.
                for (const range of totalResult.ranges) {
                    decorations.push({ range, options: Decorations.instance.getDecorationFromOptions(this.h) });
                }
            }
            this.j(totalResult);
            this.f.set(decorations);
        }
        getDecorationInfo(decoration) {
            if (!this.f.has(decoration)) {
                return null;
            }
            const model = this.g.getModel();
            const text = model.getValueInRange(decoration.range);
            if (!(0, viewModelDecorations_1.$nY)(model, decoration)) {
                return null;
            }
            return {
                reason: computeReason(text, this.h),
                inComment: (0, viewModelDecorations_1.$oY)(model, decoration),
                inString: (0, viewModelDecorations_1.$pY)(model, decoration),
            };
        }
    }
    class $80 {
        constructor(owner, range, decoration) {
            this.owner = owner;
            this.range = range;
            this.decoration = decoration;
        }
        isValidForHoverAnchor(anchor) {
            return (anchor.type === 1 /* HoverAnchorType.Range */
                && this.range.startColumn <= anchor.range.startColumn
                && this.range.endColumn >= anchor.range.endColumn);
        }
    }
    exports.$80 = $80;
    let $90 = class $90 {
        constructor(a, b, f) {
            this.a = a;
            this.b = b;
            this.f = f;
            this.hoverOrdinal = 5;
        }
        computeSync(anchor, lineDecorations) {
            if (!this.a.hasModel() || anchor.type !== 1 /* HoverAnchorType.Range */) {
                return [];
            }
            const model = this.a.getModel();
            const unicodeHighlighter = this.a.getContribution($70.ID);
            if (!unicodeHighlighter) {
                return [];
            }
            const result = [];
            const existedReason = new Set();
            let index = 300;
            for (const d of lineDecorations) {
                const highlightInfo = unicodeHighlighter.getDecorationInfo(d);
                if (!highlightInfo) {
                    continue;
                }
                const char = model.getValueInRange(d.range);
                // text refers to a single character.
                const codePoint = char.codePointAt(0);
                const codePointStr = formatCodePointMarkdown(codePoint);
                let reason;
                switch (highlightInfo.reason.kind) {
                    case 0 /* UnicodeHighlighterReasonKind.Ambiguous */: {
                        if ((0, strings_1.$2e)(highlightInfo.reason.confusableWith)) {
                            reason = nls.localize(4, null, codePointStr, formatCodePointMarkdown(highlightInfo.reason.confusableWith.codePointAt(0)));
                        }
                        else {
                            reason = nls.localize(5, null, codePointStr, formatCodePointMarkdown(highlightInfo.reason.confusableWith.codePointAt(0)));
                        }
                        break;
                    }
                    case 1 /* UnicodeHighlighterReasonKind.Invisible */:
                        reason = nls.localize(6, null, codePointStr);
                        break;
                    case 2 /* UnicodeHighlighterReasonKind.NonBasicAscii */:
                        reason = nls.localize(7, null, codePointStr);
                        break;
                }
                if (existedReason.has(reason)) {
                    continue;
                }
                existedReason.add(reason);
                const adjustSettingsArgs = {
                    codePoint: codePoint,
                    reason: highlightInfo.reason,
                    inComment: highlightInfo.inComment,
                    inString: highlightInfo.inString,
                };
                const adjustSettings = nls.localize(8, null);
                const uri = `command:${$c$.ID}?${encodeURIComponent(JSON.stringify(adjustSettingsArgs))}`;
                const markdown = new htmlContent_1.$Xj('', true)
                    .appendMarkdown(reason)
                    .appendText(' ')
                    .appendLink(uri, adjustSettings);
                result.push(new markdownHoverParticipant_1.$94(this, d.range, [markdown], false, index++));
            }
            return result;
        }
        renderHoverParts(context, hoverParts) {
            return (0, markdownHoverParticipant_1.$$4)(context, hoverParts, this.a, this.b, this.f);
        }
    };
    exports.$90 = $90;
    exports.$90 = $90 = __decorate([
        __param(1, language_1.$ct),
        __param(2, opener_1.$NT)
    ], $90);
    function codePointToHex(codePoint) {
        return `U+${codePoint.toString(16).padStart(4, '0')}`;
    }
    function formatCodePointMarkdown(codePoint) {
        let value = `\`${codePointToHex(codePoint)}\``;
        if (!strings_1.$if.isInvisibleCharacter(codePoint)) {
            // Don't render any control characters or any invisible characters, as they cannot be seen anyways.
            value += ` "${`${renderCodePointAsInlineCode(codePoint)}`}"`;
        }
        return value;
    }
    function renderCodePointAsInlineCode(codePoint) {
        if (codePoint === 96 /* CharCode.BackTick */) {
            return '`` ` ``';
        }
        return '`' + String.fromCodePoint(codePoint) + '`';
    }
    function computeReason(char, options) {
        return unicodeTextModelHighlighter_1.$xY.computeUnicodeHighlightReason(char, options);
    }
    class Decorations {
        constructor() {
            this.a = new Map();
        }
        static { this.instance = new Decorations(); }
        getDecorationFromOptions(options) {
            return this.b(!options.includeComments, !options.includeStrings);
        }
        b(hideInComments, hideInStrings) {
            const key = `${hideInComments}${hideInStrings}`;
            let options = this.a.get(key);
            if (!options) {
                options = textModel_1.$RC.createDynamic({
                    description: 'unicode-highlight',
                    stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
                    className: 'unicode-highlight',
                    showIfCollapsed: true,
                    overviewRuler: null,
                    minimap: null,
                    hideInCommentTokens: hideInComments,
                    hideInStringTokens: hideInStrings,
                });
                this.a.set(key, options);
            }
            return options;
        }
    }
    class $00 extends editorExtensions_1.$sV {
        static { this.ID = 'editor.action.unicodeHighlight.disableHighlightingInComments'; }
        constructor() {
            super({
                id: $_0.ID,
                label: nls.localize(10, null),
                alias: 'Disable highlighting of characters in comments',
                precondition: undefined
            });
            this.shortLabel = nls.localize(9, null);
        }
        async run(accessor, editor, args) {
            const configurationService = accessor?.get(configuration_1.$8h);
            if (configurationService) {
                this.runAction(configurationService);
            }
        }
        async runAction(configurationService) {
            await configurationService.updateValue(editorOptions_1.unicodeHighlightConfigKeys.includeComments, false, 2 /* ConfigurationTarget.USER */);
        }
    }
    exports.$00 = $00;
    class $$0 extends editorExtensions_1.$sV {
        static { this.ID = 'editor.action.unicodeHighlight.disableHighlightingInStrings'; }
        constructor() {
            super({
                id: $_0.ID,
                label: nls.localize(12, null),
                alias: 'Disable highlighting of characters in strings',
                precondition: undefined
            });
            this.shortLabel = nls.localize(11, null);
        }
        async run(accessor, editor, args) {
            const configurationService = accessor?.get(configuration_1.$8h);
            if (configurationService) {
                this.runAction(configurationService);
            }
        }
        async runAction(configurationService) {
            await configurationService.updateValue(editorOptions_1.unicodeHighlightConfigKeys.includeStrings, false, 2 /* ConfigurationTarget.USER */);
        }
    }
    exports.$$0 = $$0;
    class $_0 extends editorExtensions_1.$sV {
        static { this.ID = 'editor.action.unicodeHighlight.disableHighlightingOfAmbiguousCharacters'; }
        constructor() {
            super({
                id: $_0.ID,
                label: nls.localize(14, null),
                alias: 'Disable highlighting of ambiguous characters',
                precondition: undefined
            });
            this.shortLabel = nls.localize(13, null);
        }
        async run(accessor, editor, args) {
            const configurationService = accessor?.get(configuration_1.$8h);
            if (configurationService) {
                this.runAction(configurationService);
            }
        }
        async runAction(configurationService) {
            await configurationService.updateValue(editorOptions_1.unicodeHighlightConfigKeys.ambiguousCharacters, false, 2 /* ConfigurationTarget.USER */);
        }
    }
    exports.$_0 = $_0;
    class $a$ extends editorExtensions_1.$sV {
        static { this.ID = 'editor.action.unicodeHighlight.disableHighlightingOfInvisibleCharacters'; }
        constructor() {
            super({
                id: $a$.ID,
                label: nls.localize(16, null),
                alias: 'Disable highlighting of invisible characters',
                precondition: undefined
            });
            this.shortLabel = nls.localize(15, null);
        }
        async run(accessor, editor, args) {
            const configurationService = accessor?.get(configuration_1.$8h);
            if (configurationService) {
                this.runAction(configurationService);
            }
        }
        async runAction(configurationService) {
            await configurationService.updateValue(editorOptions_1.unicodeHighlightConfigKeys.invisibleCharacters, false, 2 /* ConfigurationTarget.USER */);
        }
    }
    exports.$a$ = $a$;
    class $b$ extends editorExtensions_1.$sV {
        static { this.ID = 'editor.action.unicodeHighlight.disableHighlightingOfNonBasicAsciiCharacters'; }
        constructor() {
            super({
                id: $b$.ID,
                label: nls.localize(18, null),
                alias: 'Disable highlighting of non basic ASCII characters',
                precondition: undefined
            });
            this.shortLabel = nls.localize(17, null);
        }
        async run(accessor, editor, args) {
            const configurationService = accessor?.get(configuration_1.$8h);
            if (configurationService) {
                this.runAction(configurationService);
            }
        }
        async runAction(configurationService) {
            await configurationService.updateValue(editorOptions_1.unicodeHighlightConfigKeys.nonBasicASCII, false, 2 /* ConfigurationTarget.USER */);
        }
    }
    exports.$b$ = $b$;
    class $c$ extends editorExtensions_1.$sV {
        static { this.ID = 'editor.action.unicodeHighlight.showExcludeOptions'; }
        constructor() {
            super({
                id: $c$.ID,
                label: nls.localize(19, null),
                alias: 'Show Exclude Options',
                precondition: undefined
            });
        }
        async run(accessor, editor, args) {
            const { codePoint, reason, inString, inComment } = args;
            const char = String.fromCodePoint(codePoint);
            const quickPickService = accessor.get(quickInput_1.$Gq);
            const configurationService = accessor.get(configuration_1.$8h);
            function getExcludeCharFromBeingHighlightedLabel(codePoint) {
                if (strings_1.$if.isInvisibleCharacter(codePoint)) {
                    return nls.localize(20, null, codePointToHex(codePoint));
                }
                return nls.localize(21, null, `${codePointToHex(codePoint)} "${char}"`);
            }
            const options = [];
            if (reason.kind === 0 /* UnicodeHighlighterReasonKind.Ambiguous */) {
                for (const locale of reason.notAmbiguousInLocales) {
                    options.push({
                        label: nls.localize(22, null, locale),
                        run: async () => {
                            excludeLocaleFromBeingHighlighted(configurationService, [locale]);
                        },
                    });
                }
            }
            options.push({
                label: getExcludeCharFromBeingHighlightedLabel(codePoint),
                run: () => excludeCharFromBeingHighlighted(configurationService, [codePoint])
            });
            if (inComment) {
                const action = new $00();
                options.push({ label: action.label, run: async () => action.runAction(configurationService) });
            }
            else if (inString) {
                const action = new $$0();
                options.push({ label: action.label, run: async () => action.runAction(configurationService) });
            }
            if (reason.kind === 0 /* UnicodeHighlighterReasonKind.Ambiguous */) {
                const action = new $_0();
                options.push({ label: action.label, run: async () => action.runAction(configurationService) });
            }
            else if (reason.kind === 1 /* UnicodeHighlighterReasonKind.Invisible */) {
                const action = new $a$();
                options.push({ label: action.label, run: async () => action.runAction(configurationService) });
            }
            else if (reason.kind === 2 /* UnicodeHighlighterReasonKind.NonBasicAscii */) {
                const action = new $b$();
                options.push({ label: action.label, run: async () => action.runAction(configurationService) });
            }
            else {
                expectNever(reason);
            }
            const result = await quickPickService.pick(options, { title: nls.localize(23, null) });
            if (result) {
                await result.run();
            }
        }
    }
    exports.$c$ = $c$;
    async function excludeCharFromBeingHighlighted(configurationService, charCodes) {
        const existingValue = configurationService.getValue(editorOptions_1.unicodeHighlightConfigKeys.allowedCharacters);
        let value;
        if ((typeof existingValue === 'object') && existingValue) {
            value = existingValue;
        }
        else {
            value = {};
        }
        for (const charCode of charCodes) {
            value[String.fromCodePoint(charCode)] = true;
        }
        await configurationService.updateValue(editorOptions_1.unicodeHighlightConfigKeys.allowedCharacters, value, 2 /* ConfigurationTarget.USER */);
    }
    async function excludeLocaleFromBeingHighlighted(configurationService, locales) {
        const existingValue = configurationService.inspect(editorOptions_1.unicodeHighlightConfigKeys.allowedLocales).user?.value;
        let value;
        if ((typeof existingValue === 'object') && existingValue) {
            // Copy value, as the existing value is read only
            value = Object.assign({}, existingValue);
        }
        else {
            value = {};
        }
        for (const locale of locales) {
            value[locale] = true;
        }
        await configurationService.updateValue(editorOptions_1.unicodeHighlightConfigKeys.allowedLocales, value, 2 /* ConfigurationTarget.USER */);
    }
    function expectNever(value) {
        throw new Error(`Unexpected value: ${value}`);
    }
    (0, editorExtensions_1.$xV)($_0);
    (0, editorExtensions_1.$xV)($a$);
    (0, editorExtensions_1.$xV)($b$);
    (0, editorExtensions_1.$xV)($c$);
    (0, editorExtensions_1.$AV)($70.ID, $70, 1 /* EditorContributionInstantiation.AfterFirstRender */);
    hoverTypes_1.$j3.register($90);
});
//# sourceMappingURL=unicodeHighlighter.js.map