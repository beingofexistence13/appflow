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
    exports.$yyb = exports.$xyb = exports.$wyb = exports.$vyb = void 0;
    let $vyb = class $vyb extends lifecycle_1.$kc {
        constructor(z) {
            super();
            this.z = z;
            this.a = this.B(new event_1.$fd());
            this.onWillCreateCodeEditor = this.a.event;
            this.b = this.B(new event_1.$fd());
            this.onCodeEditorAdd = this.b.event;
            this.c = this.B(new event_1.$fd());
            this.onCodeEditorRemove = this.c.event;
            this.f = this.B(new event_1.$fd());
            this.onWillCreateDiffEditor = this.f.event;
            this.g = this.B(new event_1.$fd());
            this.onDiffEditorAdd = this.g.event;
            this.h = this.B(new event_1.$fd());
            this.onDiffEditorRemove = this.h.event;
            this.j = this.B(new event_1.$fd());
            this.onDidChangeTransientModelProperty = this.j.event;
            this.m = this.B(new event_1.$fd());
            this.onDecorationTypeRegistered = this.m.event;
            this.t = new Map();
            this.u = new Map();
            this.y = new linkedList_1.$tc();
            this.G = {};
            this.H = new Map();
            this.n = Object.create(null);
            this.r = Object.create(null);
            this.s = null;
        }
        willCreateCodeEditor() {
            this.a.fire();
        }
        addCodeEditor(editor) {
            this.n[editor.getId()] = editor;
            this.b.fire(editor);
        }
        removeCodeEditor(editor) {
            if (delete this.n[editor.getId()]) {
                this.c.fire(editor);
            }
        }
        listCodeEditors() {
            return Object.keys(this.n).map(id => this.n[id]);
        }
        willCreateDiffEditor() {
            this.f.fire();
        }
        addDiffEditor(editor) {
            this.r[editor.getId()] = editor;
            this.g.fire(editor);
        }
        removeDiffEditor(editor) {
            if (delete this.r[editor.getId()]) {
                this.h.fire(editor);
            }
        }
        listDiffEditors() {
            return Object.keys(this.r).map(id => this.r[id]);
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
        C() {
            if (!this.s) {
                this.s = this.D();
            }
            return this.s;
        }
        D() {
            return new $xyb(dom.$XO());
        }
        F(editor) {
            if (!editor) {
                return this.C();
            }
            const domNode = editor.getContainerDomNode();
            if (!dom.$TO(domNode)) {
                return this.C();
            }
            const editorId = editor.getId();
            if (!this.u.has(editorId)) {
                const refCountedStyleSheet = new RefCountedStyleSheet(this, editorId, dom.$XO(domNode));
                this.u.set(editorId, refCountedStyleSheet);
            }
            return this.u.get(editorId);
        }
        _removeEditorStyleSheets(editorId) {
            this.u.delete(editorId);
        }
        registerDecorationType(description, key, options, parentTypeKey, editor) {
            let provider = this.t.get(key);
            if (!provider) {
                const styleSheet = this.F(editor);
                const providerArgs = {
                    styleSheet: styleSheet,
                    key: key,
                    parentTypeKey: parentTypeKey,
                    options: options || Object.create(null)
                };
                if (!parentTypeKey) {
                    provider = new DecorationTypeOptionsProvider(description, this.z, styleSheet, providerArgs);
                }
                else {
                    provider = new DecorationSubTypeOptionsProvider(this.z, styleSheet, providerArgs);
                }
                this.t.set(key, provider);
                this.m.fire(key);
            }
            provider.refCount++;
            return {
                dispose: () => {
                    this.removeDecorationType(key);
                }
            };
        }
        listDecorationTypes() {
            return Array.from(this.t.keys());
        }
        removeDecorationType(key) {
            const provider = this.t.get(key);
            if (provider) {
                provider.refCount--;
                if (provider.refCount <= 0) {
                    this.t.delete(key);
                    provider.dispose();
                    this.listCodeEditors().forEach((ed) => ed.removeDecorationsByType(key));
                }
            }
        }
        resolveDecorationOptions(decorationTypeKey, writable) {
            const provider = this.t.get(decorationTypeKey);
            if (!provider) {
                throw new Error('Unknown decoration type key: ' + decorationTypeKey);
            }
            return provider.getOptions(this, writable);
        }
        resolveDecorationCSSRules(decorationTypeKey) {
            const provider = this.t.get(decorationTypeKey);
            if (!provider) {
                return null;
            }
            return provider.resolveDecorationCSSRules();
        }
        setModelProperty(resource, key, value) {
            const key1 = resource.toString();
            let dest;
            if (this.H.has(key1)) {
                dest = this.H.get(key1);
            }
            else {
                dest = new Map();
                this.H.set(key1, dest);
            }
            dest.set(key, value);
        }
        getModelProperty(resource, key) {
            const key1 = resource.toString();
            if (this.H.has(key1)) {
                const innerMap = this.H.get(key1);
                return innerMap.get(key);
            }
            return undefined;
        }
        setTransientModelProperty(model, key, value) {
            const uri = model.uri.toString();
            let w;
            if (this.G.hasOwnProperty(uri)) {
                w = this.G[uri];
            }
            else {
                w = new $wyb(uri, model, this);
                this.G[uri] = w;
            }
            const previousValue = w.get(key);
            if (previousValue !== value) {
                w.set(key, value);
                this.j.fire(model);
            }
        }
        getTransientModelProperty(model, key) {
            const uri = model.uri.toString();
            if (!this.G.hasOwnProperty(uri)) {
                return undefined;
            }
            return this.G[uri].get(key);
        }
        getTransientModelProperties(model) {
            const uri = model.uri.toString();
            if (!this.G.hasOwnProperty(uri)) {
                return undefined;
            }
            return this.G[uri].keys().map(key => [key, this.G[uri].get(key)]);
        }
        _removeWatcher(w) {
            delete this.G[w.uri];
        }
        async openCodeEditor(input, source, sideBySide) {
            for (const handler of this.y) {
                const candidate = await handler(input, source, sideBySide);
                if (candidate !== null) {
                    return candidate;
                }
            }
            return null;
        }
        registerCodeEditorOpenHandler(handler) {
            const rm = this.y.unshift(handler);
            return (0, lifecycle_1.$ic)(rm);
        }
    };
    exports.$vyb = $vyb;
    exports.$vyb = $vyb = __decorate([
        __param(0, themeService_1.$gv)
    ], $vyb);
    class $wyb {
        constructor(uri, model, owner) {
            this.uri = uri;
            this.a = {};
            model.onWillDispose(() => owner._removeWatcher(this));
        }
        set(key, value) {
            this.a[key] = value;
        }
        get(key) {
            return this.a[key];
        }
        keys() {
            return Object.keys(this.a);
        }
    }
    exports.$wyb = $wyb;
    class RefCountedStyleSheet {
        get sheet() {
            return this.c.sheet;
        }
        constructor(parent, editorId, styleSheet) {
            this.a = parent;
            this.b = editorId;
            this.c = styleSheet;
            this.d = 0;
        }
        ref() {
            this.d++;
        }
        unref() {
            this.d--;
            if (this.d === 0) {
                this.c.parentNode?.removeChild(this.c);
                this.a._removeEditorStyleSheets(this.b);
            }
        }
        insertRule(rule, index) {
            const sheet = this.c.sheet;
            sheet.insertRule(rule, index);
        }
        removeRulesContainingSelector(ruleName) {
            dom.$1O(ruleName, this.c);
        }
    }
    class $xyb {
        get sheet() {
            return this.a.sheet;
        }
        constructor(styleSheet) {
            this.a = styleSheet;
        }
        ref() {
        }
        unref() {
        }
        insertRule(rule, index) {
            const sheet = this.a.sheet;
            sheet.insertRule(rule, index);
        }
        removeRulesContainingSelector(ruleName) {
            dom.$1O(ruleName, this.a);
        }
    }
    exports.$xyb = $xyb;
    class DecorationSubTypeOptionsProvider {
        constructor(themeService, styleSheet, providerArgs) {
            this.a = styleSheet;
            this.a.ref();
            this.b = providerArgs.parentTypeKey;
            this.refCount = 0;
            this.c = new DecorationCSSRules(3 /* ModelDecorationCSSRuleType.BeforeContentClassName */, providerArgs, themeService);
            this.d = new DecorationCSSRules(4 /* ModelDecorationCSSRuleType.AfterContentClassName */, providerArgs, themeService);
        }
        getOptions(codeEditorService, writable) {
            const options = codeEditorService.resolveDecorationOptions(this.b, true);
            if (this.c) {
                options.beforeContentClassName = this.c.className;
            }
            if (this.d) {
                options.afterContentClassName = this.d.className;
            }
            return options;
        }
        resolveDecorationCSSRules() {
            return this.a.sheet.cssRules;
        }
        dispose() {
            if (this.c) {
                this.c.dispose();
                this.c = null;
            }
            if (this.d) {
                this.d.dispose();
                this.d = null;
            }
            this.a.unref();
        }
    }
    class DecorationTypeOptionsProvider {
        constructor(description, themeService, styleSheet, providerArgs) {
            this.a = new lifecycle_1.$jc();
            this.description = description;
            this.b = styleSheet;
            this.b.ref();
            this.refCount = 0;
            const createCSSRules = (type) => {
                const rules = new DecorationCSSRules(type, providerArgs, themeService);
                this.a.add(rules);
                if (rules.hasContent) {
                    return rules.className;
                }
                return undefined;
            };
            const createInlineCSSRules = (type) => {
                const rules = new DecorationCSSRules(type, providerArgs, themeService);
                this.a.add(rules);
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
            return this.b.sheet.rules;
        }
        dispose() {
            this.a.dispose();
            this.b.unref();
        }
    }
    exports.$yyb = {
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
            this.a = themeService.getColorTheme();
            this.f = ruleType;
            this.h = providerArgs;
            this.i = false;
            this.d = false;
            this.e = false;
            let className = CSSNameHelper.getClassName(this.h.key, ruleType);
            if (this.h.parentTypeKey) {
                className = className + ' ' + CSSNameHelper.getClassName(this.h.parentTypeKey, ruleType);
            }
            this.b = className;
            this.c = CSSNameHelper.getSelector(this.h.key, this.h.parentTypeKey, ruleType);
            this.j();
            if (this.i) {
                this.g = themeService.onDidColorThemeChange(theme => {
                    this.a = themeService.getColorTheme();
                    this.k();
                    this.j();
                });
            }
            else {
                this.g = null;
            }
        }
        dispose() {
            if (this.d) {
                this.k();
                this.d = false;
            }
            if (this.g) {
                this.g.dispose();
                this.g = null;
            }
        }
        get hasContent() {
            return this.d;
        }
        get hasLetterSpacing() {
            return this.e;
        }
        get className() {
            return this.b;
        }
        j() {
            const options = this.h.options;
            let unthemedCSS, lightCSS, darkCSS;
            switch (this.f) {
                case 0 /* ModelDecorationCSSRuleType.ClassName */:
                    unthemedCSS = this.l(options);
                    lightCSS = this.l(options.light);
                    darkCSS = this.l(options.dark);
                    break;
                case 1 /* ModelDecorationCSSRuleType.InlineClassName */:
                    unthemedCSS = this.m(options);
                    lightCSS = this.m(options.light);
                    darkCSS = this.m(options.dark);
                    break;
                case 2 /* ModelDecorationCSSRuleType.GlyphMarginClassName */:
                    unthemedCSS = this.o(options);
                    lightCSS = this.o(options.light);
                    darkCSS = this.o(options.dark);
                    break;
                case 3 /* ModelDecorationCSSRuleType.BeforeContentClassName */:
                    unthemedCSS = this.n(options.before);
                    lightCSS = this.n(options.light && options.light.before);
                    darkCSS = this.n(options.dark && options.dark.before);
                    break;
                case 4 /* ModelDecorationCSSRuleType.AfterContentClassName */:
                    unthemedCSS = this.n(options.after);
                    lightCSS = this.n(options.light && options.light.after);
                    darkCSS = this.n(options.dark && options.dark.after);
                    break;
                case 5 /* ModelDecorationCSSRuleType.BeforeInjectedTextClassName */:
                    unthemedCSS = this.n(options.beforeInjectedText);
                    lightCSS = this.n(options.light && options.light.beforeInjectedText);
                    darkCSS = this.n(options.dark && options.dark.beforeInjectedText);
                    break;
                case 6 /* ModelDecorationCSSRuleType.AfterInjectedTextClassName */:
                    unthemedCSS = this.n(options.afterInjectedText);
                    lightCSS = this.n(options.light && options.light.afterInjectedText);
                    darkCSS = this.n(options.dark && options.dark.afterInjectedText);
                    break;
                default:
                    throw new Error('Unknown rule type: ' + this.f);
            }
            const sheet = this.h.styleSheet;
            let hasContent = false;
            if (unthemedCSS.length > 0) {
                sheet.insertRule(`${this.c} {${unthemedCSS}}`, 0);
                hasContent = true;
            }
            if (lightCSS.length > 0) {
                sheet.insertRule(`.vs${this.c}, .hc-light${this.c} {${lightCSS}}`, 0);
                hasContent = true;
            }
            if (darkCSS.length > 0) {
                sheet.insertRule(`.vs-dark${this.c}, .hc-black${this.c} {${darkCSS}}`, 0);
                hasContent = true;
            }
            this.d = hasContent;
        }
        k() {
            this.h.styleSheet.removeRulesContainingSelector(this.c);
        }
        /**
         * Build the CSS for decorations styled via `className`.
         */
        l(opts) {
            if (!opts) {
                return '';
            }
            const cssTextArr = [];
            this.q(opts, ['backgroundColor'], cssTextArr);
            this.q(opts, ['outline', 'outlineColor', 'outlineStyle', 'outlineWidth'], cssTextArr);
            this.p(opts, cssTextArr);
            return cssTextArr.join('');
        }
        /**
         * Build the CSS for decorations styled via `inlineClassName`.
         */
        m(opts) {
            if (!opts) {
                return '';
            }
            const cssTextArr = [];
            this.q(opts, ['fontStyle', 'fontWeight', 'textDecoration', 'cursor', 'color', 'opacity', 'letterSpacing'], cssTextArr);
            if (opts.letterSpacing) {
                this.e = true;
            }
            return cssTextArr.join('');
        }
        /**
         * Build the CSS for decorations styled before or after content.
         */
        n(opts) {
            if (!opts) {
                return '';
            }
            const cssTextArr = [];
            if (typeof opts !== 'undefined') {
                this.p(opts, cssTextArr);
                if (typeof opts.contentIconPath !== 'undefined') {
                    cssTextArr.push(strings.$ne(exports.$yyb.contentIconPath, dom.$nP(uri_1.URI.revive(opts.contentIconPath))));
                }
                if (typeof opts.contentText === 'string') {
                    const truncated = opts.contentText.match(/^.*$/m)[0]; // only take first line
                    const escaped = truncated.replace(/['\\]/g, '\\$&');
                    cssTextArr.push(strings.$ne(exports.$yyb.contentText, escaped));
                }
                this.q(opts, ['verticalAlign', 'fontStyle', 'fontWeight', 'fontSize', 'fontFamily', 'textDecoration', 'color', 'opacity', 'backgroundColor', 'margin', 'padding'], cssTextArr);
                if (this.q(opts, ['width', 'height'], cssTextArr)) {
                    cssTextArr.push('display:inline-block;');
                }
            }
            return cssTextArr.join('');
        }
        /**
         * Build the CSS for decorations styled via `glyphMarginClassName`.
         */
        o(opts) {
            if (!opts) {
                return '';
            }
            const cssTextArr = [];
            if (typeof opts.gutterIconPath !== 'undefined') {
                cssTextArr.push(strings.$ne(exports.$yyb.gutterIconPath, dom.$nP(uri_1.URI.revive(opts.gutterIconPath))));
                if (typeof opts.gutterIconSize !== 'undefined') {
                    cssTextArr.push(strings.$ne(exports.$yyb.gutterIconSize, opts.gutterIconSize));
                }
            }
            return cssTextArr.join('');
        }
        p(opts, cssTextArr) {
            if (this.q(opts, ['border', 'borderColor', 'borderRadius', 'borderSpacing', 'borderStyle', 'borderWidth'], cssTextArr)) {
                cssTextArr.push(strings.$ne('box-sizing: border-box;'));
                return true;
            }
            return false;
        }
        q(opts, properties, cssTextArr) {
            const lenBefore = cssTextArr.length;
            for (const property of properties) {
                const value = this.r(opts[property]);
                if (typeof value === 'string') {
                    cssTextArr.push(strings.$ne(exports.$yyb[property], value));
                }
            }
            return cssTextArr.length !== lenBefore;
        }
        r(value) {
            if ((0, editorCommon_1.isThemeColor)(value)) {
                this.i = true;
                const color = this.a.getColor(value.id);
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
//# sourceMappingURL=abstractCodeEditorService.js.map