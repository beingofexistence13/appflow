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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/linkedList", "vs/base/common/strings", "vs/base/common/uri", "vs/editor/common/editorCommon", "vs/editor/common/model", "vs/platform/theme/common/themeService"], function (require, exports, dom, event_1, lifecycle_1, linkedList_1, strings, uri_1, editorCommon_1, model_1, themeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports._CSS_MAP = exports.GlobalStyleSheet = exports.ModelTransientSettingWatcher = exports.AbstractCodeEditorService = void 0;
    let AbstractCodeEditorService = class AbstractCodeEditorService extends lifecycle_1.Disposable {
        constructor(_themeService) {
            super();
            this._themeService = _themeService;
            this._onWillCreateCodeEditor = this._register(new event_1.Emitter());
            this.onWillCreateCodeEditor = this._onWillCreateCodeEditor.event;
            this._onCodeEditorAdd = this._register(new event_1.Emitter());
            this.onCodeEditorAdd = this._onCodeEditorAdd.event;
            this._onCodeEditorRemove = this._register(new event_1.Emitter());
            this.onCodeEditorRemove = this._onCodeEditorRemove.event;
            this._onWillCreateDiffEditor = this._register(new event_1.Emitter());
            this.onWillCreateDiffEditor = this._onWillCreateDiffEditor.event;
            this._onDiffEditorAdd = this._register(new event_1.Emitter());
            this.onDiffEditorAdd = this._onDiffEditorAdd.event;
            this._onDiffEditorRemove = this._register(new event_1.Emitter());
            this.onDiffEditorRemove = this._onDiffEditorRemove.event;
            this._onDidChangeTransientModelProperty = this._register(new event_1.Emitter());
            this.onDidChangeTransientModelProperty = this._onDidChangeTransientModelProperty.event;
            this._onDecorationTypeRegistered = this._register(new event_1.Emitter());
            this.onDecorationTypeRegistered = this._onDecorationTypeRegistered.event;
            this._decorationOptionProviders = new Map();
            this._editorStyleSheets = new Map();
            this._codeEditorOpenHandlers = new linkedList_1.LinkedList();
            this._transientWatchers = {};
            this._modelProperties = new Map();
            this._codeEditors = Object.create(null);
            this._diffEditors = Object.create(null);
            this._globalStyleSheet = null;
        }
        willCreateCodeEditor() {
            this._onWillCreateCodeEditor.fire();
        }
        addCodeEditor(editor) {
            this._codeEditors[editor.getId()] = editor;
            this._onCodeEditorAdd.fire(editor);
        }
        removeCodeEditor(editor) {
            if (delete this._codeEditors[editor.getId()]) {
                this._onCodeEditorRemove.fire(editor);
            }
        }
        listCodeEditors() {
            return Object.keys(this._codeEditors).map(id => this._codeEditors[id]);
        }
        willCreateDiffEditor() {
            this._onWillCreateDiffEditor.fire();
        }
        addDiffEditor(editor) {
            this._diffEditors[editor.getId()] = editor;
            this._onDiffEditorAdd.fire(editor);
        }
        removeDiffEditor(editor) {
            if (delete this._diffEditors[editor.getId()]) {
                this._onDiffEditorRemove.fire(editor);
            }
        }
        listDiffEditors() {
            return Object.keys(this._diffEditors).map(id => this._diffEditors[id]);
        }
        getFocusedCodeEditor() {
            let editorWithWidgetFocus = null;
            const editors = this.listCodeEditors();
            for (const editor of editors) {
                if (editor.hasTextFocus()) {
                    // bingo!
                    return editor;
                }
                if (editor.hasWidgetFocus()) {
                    editorWithWidgetFocus = editor;
                }
            }
            return editorWithWidgetFocus;
        }
        _getOrCreateGlobalStyleSheet() {
            if (!this._globalStyleSheet) {
                this._globalStyleSheet = this._createGlobalStyleSheet();
            }
            return this._globalStyleSheet;
        }
        _createGlobalStyleSheet() {
            return new GlobalStyleSheet(dom.createStyleSheet());
        }
        _getOrCreateStyleSheet(editor) {
            if (!editor) {
                return this._getOrCreateGlobalStyleSheet();
            }
            const domNode = editor.getContainerDomNode();
            if (!dom.isInShadowDOM(domNode)) {
                return this._getOrCreateGlobalStyleSheet();
            }
            const editorId = editor.getId();
            if (!this._editorStyleSheets.has(editorId)) {
                const refCountedStyleSheet = new RefCountedStyleSheet(this, editorId, dom.createStyleSheet(domNode));
                this._editorStyleSheets.set(editorId, refCountedStyleSheet);
            }
            return this._editorStyleSheets.get(editorId);
        }
        _removeEditorStyleSheets(editorId) {
            this._editorStyleSheets.delete(editorId);
        }
        registerDecorationType(description, key, options, parentTypeKey, editor) {
            let provider = this._decorationOptionProviders.get(key);
            if (!provider) {
                const styleSheet = this._getOrCreateStyleSheet(editor);
                const providerArgs = {
                    styleSheet: styleSheet,
                    key: key,
                    parentTypeKey: parentTypeKey,
                    options: options || Object.create(null)
                };
                if (!parentTypeKey) {
                    provider = new DecorationTypeOptionsProvider(description, this._themeService, styleSheet, providerArgs);
                }
                else {
                    provider = new DecorationSubTypeOptionsProvider(this._themeService, styleSheet, providerArgs);
                }
                this._decorationOptionProviders.set(key, provider);
                this._onDecorationTypeRegistered.fire(key);
            }
            provider.refCount++;
            return {
                dispose: () => {
                    this.removeDecorationType(key);
                }
            };
        }
        listDecorationTypes() {
            return Array.from(this._decorationOptionProviders.keys());
        }
        removeDecorationType(key) {
            const provider = this._decorationOptionProviders.get(key);
            if (provider) {
                provider.refCount--;
                if (provider.refCount <= 0) {
                    this._decorationOptionProviders.delete(key);
                    provider.dispose();
                    this.listCodeEditors().forEach((ed) => ed.removeDecorationsByType(key));
                }
            }
        }
        resolveDecorationOptions(decorationTypeKey, writable) {
            const provider = this._decorationOptionProviders.get(decorationTypeKey);
            if (!provider) {
                throw new Error('Unknown decoration type key: ' + decorationTypeKey);
            }
            return provider.getOptions(this, writable);
        }
        resolveDecorationCSSRules(decorationTypeKey) {
            const provider = this._decorationOptionProviders.get(decorationTypeKey);
            if (!provider) {
                return null;
            }
            return provider.resolveDecorationCSSRules();
        }
        setModelProperty(resource, key, value) {
            const key1 = resource.toString();
            let dest;
            if (this._modelProperties.has(key1)) {
                dest = this._modelProperties.get(key1);
            }
            else {
                dest = new Map();
                this._modelProperties.set(key1, dest);
            }
            dest.set(key, value);
        }
        getModelProperty(resource, key) {
            const key1 = resource.toString();
            if (this._modelProperties.has(key1)) {
                const innerMap = this._modelProperties.get(key1);
                return innerMap.get(key);
            }
            return undefined;
        }
        setTransientModelProperty(model, key, value) {
            const uri = model.uri.toString();
            let w;
            if (this._transientWatchers.hasOwnProperty(uri)) {
                w = this._transientWatchers[uri];
            }
            else {
                w = new ModelTransientSettingWatcher(uri, model, this);
                this._transientWatchers[uri] = w;
            }
            const previousValue = w.get(key);
            if (previousValue !== value) {
                w.set(key, value);
                this._onDidChangeTransientModelProperty.fire(model);
            }
        }
        getTransientModelProperty(model, key) {
            const uri = model.uri.toString();
            if (!this._transientWatchers.hasOwnProperty(uri)) {
                return undefined;
            }
            return this._transientWatchers[uri].get(key);
        }
        getTransientModelProperties(model) {
            const uri = model.uri.toString();
            if (!this._transientWatchers.hasOwnProperty(uri)) {
                return undefined;
            }
            return this._transientWatchers[uri].keys().map(key => [key, this._transientWatchers[uri].get(key)]);
        }
        _removeWatcher(w) {
            delete this._transientWatchers[w.uri];
        }
        async openCodeEditor(input, source, sideBySide) {
            for (const handler of this._codeEditorOpenHandlers) {
                const candidate = await handler(input, source, sideBySide);
                if (candidate !== null) {
                    return candidate;
                }
            }
            return null;
        }
        registerCodeEditorOpenHandler(handler) {
            const rm = this._codeEditorOpenHandlers.unshift(handler);
            return (0, lifecycle_1.toDisposable)(rm);
        }
    };
    exports.AbstractCodeEditorService = AbstractCodeEditorService;
    exports.AbstractCodeEditorService = AbstractCodeEditorService = __decorate([
        __param(0, themeService_1.IThemeService)
    ], AbstractCodeEditorService);
    class ModelTransientSettingWatcher {
        constructor(uri, model, owner) {
            this.uri = uri;
            this._values = {};
            model.onWillDispose(() => owner._removeWatcher(this));
        }
        set(key, value) {
            this._values[key] = value;
        }
        get(key) {
            return this._values[key];
        }
        keys() {
            return Object.keys(this._values);
        }
    }
    exports.ModelTransientSettingWatcher = ModelTransientSettingWatcher;
    class RefCountedStyleSheet {
        get sheet() {
            return this._styleSheet.sheet;
        }
        constructor(parent, editorId, styleSheet) {
            this._parent = parent;
            this._editorId = editorId;
            this._styleSheet = styleSheet;
            this._refCount = 0;
        }
        ref() {
            this._refCount++;
        }
        unref() {
            this._refCount--;
            if (this._refCount === 0) {
                this._styleSheet.parentNode?.removeChild(this._styleSheet);
                this._parent._removeEditorStyleSheets(this._editorId);
            }
        }
        insertRule(rule, index) {
            const sheet = this._styleSheet.sheet;
            sheet.insertRule(rule, index);
        }
        removeRulesContainingSelector(ruleName) {
            dom.removeCSSRulesContainingSelector(ruleName, this._styleSheet);
        }
    }
    class GlobalStyleSheet {
        get sheet() {
            return this._styleSheet.sheet;
        }
        constructor(styleSheet) {
            this._styleSheet = styleSheet;
        }
        ref() {
        }
        unref() {
        }
        insertRule(rule, index) {
            const sheet = this._styleSheet.sheet;
            sheet.insertRule(rule, index);
        }
        removeRulesContainingSelector(ruleName) {
            dom.removeCSSRulesContainingSelector(ruleName, this._styleSheet);
        }
    }
    exports.GlobalStyleSheet = GlobalStyleSheet;
    class DecorationSubTypeOptionsProvider {
        constructor(themeService, styleSheet, providerArgs) {
            this._styleSheet = styleSheet;
            this._styleSheet.ref();
            this._parentTypeKey = providerArgs.parentTypeKey;
            this.refCount = 0;
            this._beforeContentRules = new DecorationCSSRules(3 /* ModelDecorationCSSRuleType.BeforeContentClassName */, providerArgs, themeService);
            this._afterContentRules = new DecorationCSSRules(4 /* ModelDecorationCSSRuleType.AfterContentClassName */, providerArgs, themeService);
        }
        getOptions(codeEditorService, writable) {
            const options = codeEditorService.resolveDecorationOptions(this._parentTypeKey, true);
            if (this._beforeContentRules) {
                options.beforeContentClassName = this._beforeContentRules.className;
            }
            if (this._afterContentRules) {
                options.afterContentClassName = this._afterContentRules.className;
            }
            return options;
        }
        resolveDecorationCSSRules() {
            return this._styleSheet.sheet.cssRules;
        }
        dispose() {
            if (this._beforeContentRules) {
                this._beforeContentRules.dispose();
                this._beforeContentRules = null;
            }
            if (this._afterContentRules) {
                this._afterContentRules.dispose();
                this._afterContentRules = null;
            }
            this._styleSheet.unref();
        }
    }
    class DecorationTypeOptionsProvider {
        constructor(description, themeService, styleSheet, providerArgs) {
            this._disposables = new lifecycle_1.DisposableStore();
            this.description = description;
            this._styleSheet = styleSheet;
            this._styleSheet.ref();
            this.refCount = 0;
            const createCSSRules = (type) => {
                const rules = new DecorationCSSRules(type, providerArgs, themeService);
                this._disposables.add(rules);
                if (rules.hasContent) {
                    return rules.className;
                }
                return undefined;
            };
            const createInlineCSSRules = (type) => {
                const rules = new DecorationCSSRules(type, providerArgs, themeService);
                this._disposables.add(rules);
                if (rules.hasContent) {
                    return { className: rules.className, hasLetterSpacing: rules.hasLetterSpacing };
                }
                return null;
            };
            this.className = createCSSRules(0 /* ModelDecorationCSSRuleType.ClassName */);
            const inlineData = createInlineCSSRules(1 /* ModelDecorationCSSRuleType.InlineClassName */);
            if (inlineData) {
                this.inlineClassName = inlineData.className;
                this.inlineClassNameAffectsLetterSpacing = inlineData.hasLetterSpacing;
            }
            this.beforeContentClassName = createCSSRules(3 /* ModelDecorationCSSRuleType.BeforeContentClassName */);
            this.afterContentClassName = createCSSRules(4 /* ModelDecorationCSSRuleType.AfterContentClassName */);
            if (providerArgs.options.beforeInjectedText && providerArgs.options.beforeInjectedText.contentText) {
                const beforeInlineData = createInlineCSSRules(5 /* ModelDecorationCSSRuleType.BeforeInjectedTextClassName */);
                this.beforeInjectedText = {
                    content: providerArgs.options.beforeInjectedText.contentText,
                    inlineClassName: beforeInlineData?.className,
                    inlineClassNameAffectsLetterSpacing: beforeInlineData?.hasLetterSpacing || providerArgs.options.beforeInjectedText.affectsLetterSpacing
                };
            }
            if (providerArgs.options.afterInjectedText && providerArgs.options.afterInjectedText.contentText) {
                const afterInlineData = createInlineCSSRules(6 /* ModelDecorationCSSRuleType.AfterInjectedTextClassName */);
                this.afterInjectedText = {
                    content: providerArgs.options.afterInjectedText.contentText,
                    inlineClassName: afterInlineData?.className,
                    inlineClassNameAffectsLetterSpacing: afterInlineData?.hasLetterSpacing || providerArgs.options.afterInjectedText.affectsLetterSpacing
                };
            }
            this.glyphMarginClassName = createCSSRules(2 /* ModelDecorationCSSRuleType.GlyphMarginClassName */);
            const options = providerArgs.options;
            this.isWholeLine = Boolean(options.isWholeLine);
            this.stickiness = options.rangeBehavior;
            const lightOverviewRulerColor = options.light && options.light.overviewRulerColor || options.overviewRulerColor;
            const darkOverviewRulerColor = options.dark && options.dark.overviewRulerColor || options.overviewRulerColor;
            if (typeof lightOverviewRulerColor !== 'undefined'
                || typeof darkOverviewRulerColor !== 'undefined') {
                this.overviewRuler = {
                    color: lightOverviewRulerColor || darkOverviewRulerColor,
                    darkColor: darkOverviewRulerColor || lightOverviewRulerColor,
                    position: options.overviewRulerLane || model_1.OverviewRulerLane.Center
                };
            }
        }
        getOptions(codeEditorService, writable) {
            if (!writable) {
                return this;
            }
            return {
                description: this.description,
                inlineClassName: this.inlineClassName,
                beforeContentClassName: this.beforeContentClassName,
                afterContentClassName: this.afterContentClassName,
                className: this.className,
                glyphMarginClassName: this.glyphMarginClassName,
                isWholeLine: this.isWholeLine,
                overviewRuler: this.overviewRuler,
                stickiness: this.stickiness,
                before: this.beforeInjectedText,
                after: this.afterInjectedText
            };
        }
        resolveDecorationCSSRules() {
            return this._styleSheet.sheet.rules;
        }
        dispose() {
            this._disposables.dispose();
            this._styleSheet.unref();
        }
    }
    exports._CSS_MAP = {
        color: 'color:{0} !important;',
        opacity: 'opacity:{0};',
        backgroundColor: 'background-color:{0};',
        outline: 'outline:{0};',
        outlineColor: 'outline-color:{0};',
        outlineStyle: 'outline-style:{0};',
        outlineWidth: 'outline-width:{0};',
        border: 'border:{0};',
        borderColor: 'border-color:{0};',
        borderRadius: 'border-radius:{0};',
        borderSpacing: 'border-spacing:{0};',
        borderStyle: 'border-style:{0};',
        borderWidth: 'border-width:{0};',
        fontStyle: 'font-style:{0};',
        fontWeight: 'font-weight:{0};',
        fontSize: 'font-size:{0};',
        fontFamily: 'font-family:{0};',
        textDecoration: 'text-decoration:{0};',
        cursor: 'cursor:{0};',
        letterSpacing: 'letter-spacing:{0};',
        gutterIconPath: 'background:{0} center center no-repeat;',
        gutterIconSize: 'background-size:{0};',
        contentText: 'content:\'{0}\';',
        contentIconPath: 'content:{0};',
        margin: 'margin:{0};',
        padding: 'padding:{0};',
        width: 'width:{0};',
        height: 'height:{0};',
        verticalAlign: 'vertical-align:{0};',
    };
    class DecorationCSSRules {
        constructor(ruleType, providerArgs, themeService) {
            this._theme = themeService.getColorTheme();
            this._ruleType = ruleType;
            this._providerArgs = providerArgs;
            this._usesThemeColors = false;
            this._hasContent = false;
            this._hasLetterSpacing = false;
            let className = CSSNameHelper.getClassName(this._providerArgs.key, ruleType);
            if (this._providerArgs.parentTypeKey) {
                className = className + ' ' + CSSNameHelper.getClassName(this._providerArgs.parentTypeKey, ruleType);
            }
            this._className = className;
            this._unThemedSelector = CSSNameHelper.getSelector(this._providerArgs.key, this._providerArgs.parentTypeKey, ruleType);
            this._buildCSS();
            if (this._usesThemeColors) {
                this._themeListener = themeService.onDidColorThemeChange(theme => {
                    this._theme = themeService.getColorTheme();
                    this._removeCSS();
                    this._buildCSS();
                });
            }
            else {
                this._themeListener = null;
            }
        }
        dispose() {
            if (this._hasContent) {
                this._removeCSS();
                this._hasContent = false;
            }
            if (this._themeListener) {
                this._themeListener.dispose();
                this._themeListener = null;
            }
        }
        get hasContent() {
            return this._hasContent;
        }
        get hasLetterSpacing() {
            return this._hasLetterSpacing;
        }
        get className() {
            return this._className;
        }
        _buildCSS() {
            const options = this._providerArgs.options;
            let unthemedCSS, lightCSS, darkCSS;
            switch (this._ruleType) {
                case 0 /* ModelDecorationCSSRuleType.ClassName */:
                    unthemedCSS = this.getCSSTextForModelDecorationClassName(options);
                    lightCSS = this.getCSSTextForModelDecorationClassName(options.light);
                    darkCSS = this.getCSSTextForModelDecorationClassName(options.dark);
                    break;
                case 1 /* ModelDecorationCSSRuleType.InlineClassName */:
                    unthemedCSS = this.getCSSTextForModelDecorationInlineClassName(options);
                    lightCSS = this.getCSSTextForModelDecorationInlineClassName(options.light);
                    darkCSS = this.getCSSTextForModelDecorationInlineClassName(options.dark);
                    break;
                case 2 /* ModelDecorationCSSRuleType.GlyphMarginClassName */:
                    unthemedCSS = this.getCSSTextForModelDecorationGlyphMarginClassName(options);
                    lightCSS = this.getCSSTextForModelDecorationGlyphMarginClassName(options.light);
                    darkCSS = this.getCSSTextForModelDecorationGlyphMarginClassName(options.dark);
                    break;
                case 3 /* ModelDecorationCSSRuleType.BeforeContentClassName */:
                    unthemedCSS = this.getCSSTextForModelDecorationContentClassName(options.before);
                    lightCSS = this.getCSSTextForModelDecorationContentClassName(options.light && options.light.before);
                    darkCSS = this.getCSSTextForModelDecorationContentClassName(options.dark && options.dark.before);
                    break;
                case 4 /* ModelDecorationCSSRuleType.AfterContentClassName */:
                    unthemedCSS = this.getCSSTextForModelDecorationContentClassName(options.after);
                    lightCSS = this.getCSSTextForModelDecorationContentClassName(options.light && options.light.after);
                    darkCSS = this.getCSSTextForModelDecorationContentClassName(options.dark && options.dark.after);
                    break;
                case 5 /* ModelDecorationCSSRuleType.BeforeInjectedTextClassName */:
                    unthemedCSS = this.getCSSTextForModelDecorationContentClassName(options.beforeInjectedText);
                    lightCSS = this.getCSSTextForModelDecorationContentClassName(options.light && options.light.beforeInjectedText);
                    darkCSS = this.getCSSTextForModelDecorationContentClassName(options.dark && options.dark.beforeInjectedText);
                    break;
                case 6 /* ModelDecorationCSSRuleType.AfterInjectedTextClassName */:
                    unthemedCSS = this.getCSSTextForModelDecorationContentClassName(options.afterInjectedText);
                    lightCSS = this.getCSSTextForModelDecorationContentClassName(options.light && options.light.afterInjectedText);
                    darkCSS = this.getCSSTextForModelDecorationContentClassName(options.dark && options.dark.afterInjectedText);
                    break;
                default:
                    throw new Error('Unknown rule type: ' + this._ruleType);
            }
            const sheet = this._providerArgs.styleSheet;
            let hasContent = false;
            if (unthemedCSS.length > 0) {
                sheet.insertRule(`${this._unThemedSelector} {${unthemedCSS}}`, 0);
                hasContent = true;
            }
            if (lightCSS.length > 0) {
                sheet.insertRule(`.vs${this._unThemedSelector}, .hc-light${this._unThemedSelector} {${lightCSS}}`, 0);
                hasContent = true;
            }
            if (darkCSS.length > 0) {
                sheet.insertRule(`.vs-dark${this._unThemedSelector}, .hc-black${this._unThemedSelector} {${darkCSS}}`, 0);
                hasContent = true;
            }
            this._hasContent = hasContent;
        }
        _removeCSS() {
            this._providerArgs.styleSheet.removeRulesContainingSelector(this._unThemedSelector);
        }
        /**
         * Build the CSS for decorations styled via `className`.
         */
        getCSSTextForModelDecorationClassName(opts) {
            if (!opts) {
                return '';
            }
            const cssTextArr = [];
            this.collectCSSText(opts, ['backgroundColor'], cssTextArr);
            this.collectCSSText(opts, ['outline', 'outlineColor', 'outlineStyle', 'outlineWidth'], cssTextArr);
            this.collectBorderSettingsCSSText(opts, cssTextArr);
            return cssTextArr.join('');
        }
        /**
         * Build the CSS for decorations styled via `inlineClassName`.
         */
        getCSSTextForModelDecorationInlineClassName(opts) {
            if (!opts) {
                return '';
            }
            const cssTextArr = [];
            this.collectCSSText(opts, ['fontStyle', 'fontWeight', 'textDecoration', 'cursor', 'color', 'opacity', 'letterSpacing'], cssTextArr);
            if (opts.letterSpacing) {
                this._hasLetterSpacing = true;
            }
            return cssTextArr.join('');
        }
        /**
         * Build the CSS for decorations styled before or after content.
         */
        getCSSTextForModelDecorationContentClassName(opts) {
            if (!opts) {
                return '';
            }
            const cssTextArr = [];
            if (typeof opts !== 'undefined') {
                this.collectBorderSettingsCSSText(opts, cssTextArr);
                if (typeof opts.contentIconPath !== 'undefined') {
                    cssTextArr.push(strings.format(exports._CSS_MAP.contentIconPath, dom.asCSSUrl(uri_1.URI.revive(opts.contentIconPath))));
                }
                if (typeof opts.contentText === 'string') {
                    const truncated = opts.contentText.match(/^.*$/m)[0]; // only take first line
                    const escaped = truncated.replace(/['\\]/g, '\\$&');
                    cssTextArr.push(strings.format(exports._CSS_MAP.contentText, escaped));
                }
                this.collectCSSText(opts, ['verticalAlign', 'fontStyle', 'fontWeight', 'fontSize', 'fontFamily', 'textDecoration', 'color', 'opacity', 'backgroundColor', 'margin', 'padding'], cssTextArr);
                if (this.collectCSSText(opts, ['width', 'height'], cssTextArr)) {
                    cssTextArr.push('display:inline-block;');
                }
            }
            return cssTextArr.join('');
        }
        /**
         * Build the CSS for decorations styled via `glyphMarginClassName`.
         */
        getCSSTextForModelDecorationGlyphMarginClassName(opts) {
            if (!opts) {
                return '';
            }
            const cssTextArr = [];
            if (typeof opts.gutterIconPath !== 'undefined') {
                cssTextArr.push(strings.format(exports._CSS_MAP.gutterIconPath, dom.asCSSUrl(uri_1.URI.revive(opts.gutterIconPath))));
                if (typeof opts.gutterIconSize !== 'undefined') {
                    cssTextArr.push(strings.format(exports._CSS_MAP.gutterIconSize, opts.gutterIconSize));
                }
            }
            return cssTextArr.join('');
        }
        collectBorderSettingsCSSText(opts, cssTextArr) {
            if (this.collectCSSText(opts, ['border', 'borderColor', 'borderRadius', 'borderSpacing', 'borderStyle', 'borderWidth'], cssTextArr)) {
                cssTextArr.push(strings.format('box-sizing: border-box;'));
                return true;
            }
            return false;
        }
        collectCSSText(opts, properties, cssTextArr) {
            const lenBefore = cssTextArr.length;
            for (const property of properties) {
                const value = this.resolveValue(opts[property]);
                if (typeof value === 'string') {
                    cssTextArr.push(strings.format(exports._CSS_MAP[property], value));
                }
            }
            return cssTextArr.length !== lenBefore;
        }
        resolveValue(value) {
            if ((0, editorCommon_1.isThemeColor)(value)) {
                this._usesThemeColors = true;
                const color = this._theme.getColor(value.id);
                if (color) {
                    return color.toString();
                }
                return 'transparent';
            }
            return value;
        }
    }
    var ModelDecorationCSSRuleType;
    (function (ModelDecorationCSSRuleType) {
        ModelDecorationCSSRuleType[ModelDecorationCSSRuleType["ClassName"] = 0] = "ClassName";
        ModelDecorationCSSRuleType[ModelDecorationCSSRuleType["InlineClassName"] = 1] = "InlineClassName";
        ModelDecorationCSSRuleType[ModelDecorationCSSRuleType["GlyphMarginClassName"] = 2] = "GlyphMarginClassName";
        ModelDecorationCSSRuleType[ModelDecorationCSSRuleType["BeforeContentClassName"] = 3] = "BeforeContentClassName";
        ModelDecorationCSSRuleType[ModelDecorationCSSRuleType["AfterContentClassName"] = 4] = "AfterContentClassName";
        ModelDecorationCSSRuleType[ModelDecorationCSSRuleType["BeforeInjectedTextClassName"] = 5] = "BeforeInjectedTextClassName";
        ModelDecorationCSSRuleType[ModelDecorationCSSRuleType["AfterInjectedTextClassName"] = 6] = "AfterInjectedTextClassName";
    })(ModelDecorationCSSRuleType || (ModelDecorationCSSRuleType = {}));
    class CSSNameHelper {
        static getClassName(key, type) {
            return 'ced-' + key + '-' + type;
        }
        static getSelector(key, parentKey, ruleType) {
            let selector = '.monaco-editor .' + this.getClassName(key, ruleType);
            if (parentKey) {
                selector = selector + '.' + this.getClassName(parentKey, ruleType);
            }
            if (ruleType === 3 /* ModelDecorationCSSRuleType.BeforeContentClassName */) {
                selector += '::before';
            }
            else if (ruleType === 4 /* ModelDecorationCSSRuleType.AfterContentClassName */) {
                selector += '::after';
            }
            return selector;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWJzdHJhY3RDb2RlRWRpdG9yU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9icm93c2VyL3NlcnZpY2VzL2Fic3RyYWN0Q29kZUVkaXRvclNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBZ0J6RixJQUFlLHlCQUF5QixHQUF4QyxNQUFlLHlCQUEwQixTQUFRLHNCQUFVO1FBbUNqRSxZQUNnQixhQUE2QztZQUU1RCxLQUFLLEVBQUUsQ0FBQztZQUZ3QixrQkFBYSxHQUFiLGFBQWEsQ0FBZTtZQWhDNUMsNEJBQXVCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBUSxDQUFDLENBQUM7WUFDL0QsMkJBQXNCLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLEtBQUssQ0FBQztZQUUzRCxxQkFBZ0IsR0FBeUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBZSxDQUFDLENBQUM7WUFDckYsb0JBQWUsR0FBdUIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQztZQUVqRSx3QkFBbUIsR0FBeUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBZSxDQUFDLENBQUM7WUFDeEYsdUJBQWtCLEdBQXVCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUM7WUFFdkUsNEJBQXVCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBUSxDQUFDLENBQUM7WUFDL0QsMkJBQXNCLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLEtBQUssQ0FBQztZQUUzRCxxQkFBZ0IsR0FBeUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBZSxDQUFDLENBQUM7WUFDckYsb0JBQWUsR0FBdUIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FB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