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
define(["require", "exports", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/browser/touch", "vs/base/common/strings", "vs/base/common/uri", "vs/base/common/lifecycle", "vs/workbench/browser/parts/editor/editorPane", "vs/platform/telemetry/common/telemetry", "vs/workbench/contrib/welcomeWalkthrough/browser/walkThroughInput", "vs/platform/opener/common/opener", "vs/editor/common/services/textResourceConfiguration", "vs/editor/browser/widget/codeEditorWidget", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/nls!vs/workbench/contrib/welcomeWalkthrough/browser/walkThroughPart", "vs/platform/storage/common/storage", "vs/platform/contextkey/common/contextkey", "vs/platform/configuration/common/configuration", "vs/base/common/types", "vs/platform/commands/common/commands", "vs/platform/theme/common/themeService", "vs/base/common/keybindingLabels", "vs/base/common/platform", "vs/base/common/objects", "vs/platform/notification/common/notification", "vs/base/browser/dom", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/contrib/welcomeWalkthrough/common/walkThroughUtils", "vs/css!./media/walkThroughPart"], function (require, exports, scrollableElement_1, touch_1, strings, uri_1, lifecycle_1, editorPane_1, telemetry_1, walkThroughInput_1, opener_1, textResourceConfiguration_1, codeEditorWidget_1, instantiation_1, keybinding_1, nls_1, storage_1, contextkey_1, configuration_1, types_1, commands_1, themeService_1, keybindingLabels_1, platform_1, objects_1, notification_1, dom_1, editorGroupsService_1, extensions_1) {
    "use strict";
    var $4Yb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$4Yb = exports.$3Yb = void 0;
    exports.$3Yb = new contextkey_1.$2i('interactivePlaygroundFocus', false);
    const UNBOUND_COMMAND = (0, nls_1.localize)(0, null);
    const WALK_THROUGH_EDITOR_VIEW_STATE_PREFERENCE_KEY = 'walkThroughEditorViewState';
    let $4Yb = class $4Yb extends editorPane_1.$0T {
        static { $4Yb_1 = this; }
        static { this.ID = 'workbench.editor.walkThroughPart'; }
        constructor(telemetryService, themeService, textResourceConfigurationService, s, u, y, storageService, $, eb, fb, gb, editorGroupService) {
            super($4Yb_1.ID, telemetryService, themeService, storageService);
            this.s = s;
            this.u = u;
            this.y = y;
            this.$ = $;
            this.eb = eb;
            this.fb = fb;
            this.gb = gb;
            this.a = new lifecycle_1.$jc();
            this.b = [];
            this.g = exports.$3Yb.bindTo(this.$);
            this.r = this.cb(editorGroupService, textResourceConfigurationService, WALK_THROUGH_EDITOR_VIEW_STATE_PREFERENCE_KEY);
        }
        ab(container) {
            this.c = document.createElement('div');
            this.c.classList.add('welcomePageFocusElement');
            this.c.tabIndex = 0;
            this.c.style.outlineStyle = 'none';
            this.f = new scrollableElement_1.$UP(this.c, {
                horizontal: 1 /* ScrollbarVisibility.Auto */,
                vertical: 1 /* ScrollbarVisibility.Auto */
            });
            this.a.add(this.f);
            container.appendChild(this.f.getDomNode());
            this.mb();
            this.nb();
            this.a.add(this.f.onScroll(e => this.ib()));
        }
        ib() {
            const scrollDimensions = this.f.getScrollDimensions();
            const scrollPosition = this.f.getScrollPosition();
            const scrollHeight = scrollDimensions.scrollHeight;
            if (scrollHeight && this.input instanceof walkThroughInput_1.$1Yb) {
                const scrollTop = scrollPosition.scrollTop;
                const height = scrollDimensions.height;
                this.input.relativeScrollPosition(scrollTop / scrollHeight, (scrollTop + height) / scrollHeight);
            }
        }
        jb(event) {
            event.preventDefault();
            event.stopPropagation();
            const scrollPosition = this.f.getScrollPosition();
            this.f.setScrollPosition({ scrollTop: scrollPosition.scrollTop - event.translationY });
        }
        lb(element, type, listener, useCapture) {
            element.addEventListener(type, listener, useCapture);
            return (0, lifecycle_1.$ic)(() => { element.removeEventListener(type, listener, useCapture); });
        }
        mb() {
            this.a.add(this.lb(this.c, 'mousedown', e => {
                this.focus();
            }));
            this.a.add(this.lb(this.c, 'focus', e => {
                this.g.set(true);
            }));
            this.a.add(this.lb(this.c, 'blur', e => {
                this.g.reset();
            }));
            this.a.add(this.lb(this.c, 'focusin', (e) => {
                // Work around scrolling as side-effect of setting focus on the offscreen zone widget (#18929)
                if (e.target instanceof HTMLElement && e.target.classList.contains('zone-widget-container')) {
                    const scrollPosition = this.f.getScrollPosition();
                    this.c.scrollTop = scrollPosition.scrollTop;
                    this.c.scrollLeft = scrollPosition.scrollLeft;
                }
                if (e.target instanceof HTMLElement) {
                    this.j = e.target;
                }
            }));
        }
        nb() {
            this.c.addEventListener('click', event => {
                for (let node = event.target; node; node = node.parentNode) {
                    if (node instanceof HTMLAnchorElement && node.href) {
                        const baseElement = window.document.getElementsByTagName('base')[0] || window.location;
                        if (baseElement && node.href.indexOf(baseElement.href) >= 0 && node.hash) {
                            const scrollTarget = this.c.querySelector(node.hash);
                            const innerContent = this.c.firstElementChild;
                            if (scrollTarget && innerContent) {
                                const targetTop = scrollTarget.getBoundingClientRect().top - 20;
                                const containerTop = innerContent.getBoundingClientRect().top;
                                this.f.setScrollPosition({ scrollTop: targetTop - containerTop });
                            }
                        }
                        else {
                            this.ob(uri_1.URI.parse(node.href));
                        }
                        event.preventDefault();
                        break;
                    }
                    else if (node instanceof HTMLButtonElement) {
                        const href = node.getAttribute('data-href');
                        if (href) {
                            this.ob(uri_1.URI.parse(href));
                        }
                        break;
                    }
                    else if (node === event.currentTarget) {
                        break;
                    }
                }
            });
        }
        ob(uri) {
            if (uri.scheme === 'command' && uri.path === 'git.clone' && !commands_1.$Gr.getCommand('git.clone')) {
                this.fb.info((0, nls_1.localize)(1, null));
                return;
            }
            this.u.open(this.pb(uri), { allowCommands: true });
        }
        pb(uri) {
            if (uri.scheme !== 'command' || !(this.input instanceof walkThroughInput_1.$1Yb)) {
                return uri;
            }
            const query = uri.query ? JSON.parse(uri.query) : {};
            query.from = this.input.getTelemetryFrom();
            return uri.with({ query: JSON.stringify(query) });
        }
        layout(dimension) {
            this.m = dimension;
            (0, dom_1.$DO)(this.c, dimension.width, dimension.height);
            this.qb();
            this.b.forEach(disposable => {
                if (disposable instanceof codeEditorWidget_1.$uY) {
                    disposable.layout();
                }
            });
            const walkthroughInput = this.input instanceof walkThroughInput_1.$1Yb && this.input;
            if (walkthroughInput && walkthroughInput.layout) {
                walkthroughInput.layout(dimension);
            }
            this.f.scanDomNode();
        }
        qb() {
            const innerContent = this.c.firstElementChild;
            if (this.m && innerContent) {
                innerContent.classList.toggle('max-height-685px', this.m.height <= 685);
            }
        }
        focus() {
            let active = document.activeElement;
            while (active && active !== this.c) {
                active = active.parentElement;
            }
            if (!active) {
                (this.j || this.c).focus();
            }
            this.g.set(true);
        }
        arrowUp() {
            const scrollPosition = this.f.getScrollPosition();
            this.f.setScrollPosition({ scrollTop: scrollPosition.scrollTop - this.rb() });
        }
        arrowDown() {
            const scrollPosition = this.f.getScrollPosition();
            this.f.setScrollPosition({ scrollTop: scrollPosition.scrollTop + this.rb() });
        }
        rb() {
            let fontSize = this.eb.getValue('editor.fontSize');
            if (typeof fontSize !== 'number' || fontSize < 1) {
                fontSize = 12;
            }
            return 3 * fontSize;
        }
        pageUp() {
            const scrollDimensions = this.f.getScrollDimensions();
            const scrollPosition = this.f.getScrollPosition();
            this.f.setScrollPosition({ scrollTop: scrollPosition.scrollTop - scrollDimensions.height });
        }
        pageDown() {
            const scrollDimensions = this.f.getScrollDimensions();
            const scrollPosition = this.f.getScrollPosition();
            this.f.setScrollPosition({ scrollTop: scrollPosition.scrollTop + scrollDimensions.height });
        }
        setInput(input, options, context, token) {
            const store = new lifecycle_1.$jc();
            this.b.push(store);
            this.c.innerText = '';
            return super.setInput(input, options, context, token)
                .then(async () => {
                if (input.resource.path.endsWith('.md')) {
                    await this.gb.whenInstalledExtensionsRegistered();
                }
                return input.resolve();
            })
                .then(model => {
                if (token.isCancellationRequested) {
                    return;
                }
                const content = model.main;
                if (!input.resource.path.endsWith('.md')) {
                    (0, dom_1.$vP)(this.c, content);
                    this.qb();
                    this.ub();
                    this.b.push(this.y.onDidUpdateKeybindings(() => this.ub()));
                    input.onReady?.(this.c.firstElementChild, store);
                    this.f.scanDomNode();
                    this.xb(input);
                    this.ib();
                    return;
                }
                const innerContent = document.createElement('div');
                innerContent.classList.add('walkThroughContent'); // only for markdown files
                const markdown = this.tb(content);
                (0, dom_1.$vP)(innerContent, markdown);
                this.c.appendChild(innerContent);
                model.snippets.forEach((snippet, i) => {
                    const model = snippet.textEditorModel;
                    if (!model) {
                        return;
                    }
                    const id = `snippet-${model.uri.fragment}`;
                    const div = innerContent.querySelector(`#${id.replace(/[\\.]/g, '\\$&')}`);
                    const options = this.sb(model.getLanguageId());
                    const telemetryData = {
                        target: this.input instanceof walkThroughInput_1.$1Yb ? this.input.getTelemetryFrom() : undefined,
                        snippet: i
                    };
                    const editor = this.s.createInstance(codeEditorWidget_1.$uY, div, options, {
                        telemetryData: telemetryData
                    });
                    editor.setModel(model);
                    this.b.push(editor);
                    const updateHeight = (initial) => {
                        const lineHeight = editor.getOption(66 /* EditorOption.lineHeight */);
                        const height = `${Math.max(model.getLineCount() + 1, 4) * lineHeight}px`;
                        if (div.style.height !== height) {
                            div.style.height = height;
                            editor.layout();
                            if (!initial) {
                                this.f.scanDomNode();
                            }
                        }
                    };
                    updateHeight(true);
                    this.b.push(editor.onDidChangeModelContent(() => updateHeight(false)));
                    this.b.push(editor.onDidChangeCursorPosition(e => {
                        const innerContent = this.c.firstElementChild;
                        if (innerContent) {
                            const targetTop = div.getBoundingClientRect().top;
                            const containerTop = innerContent.getBoundingClientRect().top;
                            const lineHeight = editor.getOption(66 /* EditorOption.lineHeight */);
                            const lineTop = (targetTop + (e.position.lineNumber - 1) * lineHeight) - containerTop;
                            const lineBottom = lineTop + lineHeight;
                            const scrollDimensions = this.f.getScrollDimensions();
                            const scrollPosition = this.f.getScrollPosition();
                            const scrollTop = scrollPosition.scrollTop;
                            const height = scrollDimensions.height;
                            if (scrollTop > lineTop) {
                                this.f.setScrollPosition({ scrollTop: lineTop });
                            }
                            else if (scrollTop < lineBottom - height) {
                                this.f.setScrollPosition({ scrollTop: lineBottom - height });
                            }
                        }
                    }));
                    this.b.push(this.eb.onDidChangeConfiguration(e => {
                        if (e.affectsConfiguration('editor') && snippet.textEditorModel) {
                            editor.updateOptions(this.sb(snippet.textEditorModel.getLanguageId()));
                        }
                    }));
                });
                this.qb();
                this.vb();
                this.b.push(this.eb.onDidChangeConfiguration(e => {
                    if (e.affectsConfiguration('editor.multiCursorModifier')) {
                        this.vb();
                    }
                }));
                input.onReady?.(innerContent, store);
                this.f.scanDomNode();
                this.xb(input);
                this.ib();
                this.b.push(touch_1.$EP.addTarget(innerContent));
                this.b.push((0, dom_1.$nO)(innerContent, touch_1.EventType.Change, e => this.jb(e)));
            });
        }
        sb(language) {
            const config = (0, objects_1.$Vm)(this.eb.getValue('editor', { overrideIdentifier: language }));
            return {
                ...(0, types_1.$lf)(config) ? config : Object.create(null),
                scrollBeyondLastLine: false,
                scrollbar: {
                    verticalScrollbarSize: 14,
                    horizontal: 'auto',
                    useShadows: true,
                    verticalHasArrows: false,
                    horizontalHasArrows: false,
                    alwaysConsumeMouseWheel: false
                },
                overviewRulerLanes: 3,
                fixedOverflowWidgets: false,
                lineNumbersMinChars: 1,
                minimap: { enabled: false },
            };
        }
        tb(input) {
            return input.replace(/kb\(([a-z.\d\-]+)\)/gi, (match, kb) => {
                const keybinding = this.y.lookupKeybinding(kb);
                const shortcut = keybinding ? keybinding.getLabel() || '' : UNBOUND_COMMAND;
                return `<span class="shortcut">${strings.$pe(shortcut)}</span>`;
            });
        }
        ub() {
            const keys = this.c.querySelectorAll('.shortcut[data-command]');
            Array.prototype.forEach.call(keys, (key) => {
                const command = key.getAttribute('data-command');
                const keybinding = command && this.y.lookupKeybinding(command);
                const label = keybinding ? keybinding.getLabel() || '' : UNBOUND_COMMAND;
                while (key.firstChild) {
                    key.removeChild(key.firstChild);
                }
                key.appendChild(document.createTextNode(label));
            });
            const ifkeys = this.c.querySelectorAll('.if_shortcut[data-command]');
            Array.prototype.forEach.call(ifkeys, (key) => {
                const command = key.getAttribute('data-command');
                const keybinding = command && this.y.lookupKeybinding(command);
                key.style.display = !keybinding ? 'none' : '';
            });
        }
        vb() {
            const labels = keybindingLabels_1.$OR.modifierLabels[platform_1.OS];
            const value = this.eb.getValue('editor.multiCursorModifier');
            const modifier = labels[value === 'ctrlCmd' ? (platform_1.OS === 2 /* OperatingSystem.Macintosh */ ? 'metaKey' : 'ctrlKey') : 'altKey'];
            const keys = this.c.querySelectorAll('.multi-cursor-modifier');
            Array.prototype.forEach.call(keys, (key) => {
                while (key.firstChild) {
                    key.removeChild(key.firstChild);
                }
                key.appendChild(document.createTextNode(modifier));
            });
        }
        wb(input) {
            const scrollPosition = this.f.getScrollPosition();
            if (this.group) {
                this.r.saveEditorState(this.group, input, {
                    viewState: {
                        scrollTop: scrollPosition.scrollTop,
                        scrollLeft: scrollPosition.scrollLeft
                    }
                });
            }
        }
        xb(input) {
            if (this.group) {
                const state = this.r.loadEditorState(this.group, input);
                if (state) {
                    this.f.setScrollPosition(state.viewState);
                }
            }
        }
        clearInput() {
            if (this.input instanceof walkThroughInput_1.$1Yb) {
                this.wb(this.input);
            }
            this.b = (0, lifecycle_1.$fc)(this.b);
            super.clearInput();
        }
        G() {
            if (this.input instanceof walkThroughInput_1.$1Yb) {
                this.wb(this.input);
            }
            super.G();
        }
        dispose() {
            this.g.reset();
            this.b = (0, lifecycle_1.$fc)(this.b);
            this.a.dispose();
            super.dispose();
        }
    };
    exports.$4Yb = $4Yb;
    exports.$4Yb = $4Yb = $4Yb_1 = __decorate([
        __param(0, telemetry_1.$9k),
        __param(1, themeService_1.$gv),
        __param(2, textResourceConfiguration_1.$FA),
        __param(3, instantiation_1.$Ah),
        __param(4, opener_1.$NT),
        __param(5, keybinding_1.$2D),
        __param(6, storage_1.$Vo),
        __param(7, contextkey_1.$3i),
        __param(8, configuration_1.$8h),
        __param(9, notification_1.$Yu),
        __param(10, extensions_1.$MF),
        __param(11, editorGroupsService_1.$5C)
    ], $4Yb);
});
//# sourceMappingURL=walkThroughPart.js.map