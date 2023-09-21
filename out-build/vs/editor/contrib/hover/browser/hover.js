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
define(["require", "exports", "vs/base/common/keyCodes", "vs/base/common/lifecycle", "vs/editor/browser/editorExtensions", "vs/editor/common/core/range", "vs/editor/common/editorContextKeys", "vs/editor/common/languages/language", "vs/editor/contrib/gotoSymbol/browser/link/goToDefinitionAtPosition", "vs/editor/contrib/hover/browser/contentHover", "vs/editor/contrib/hover/browser/marginHover", "vs/platform/instantiation/common/instantiation", "vs/platform/opener/common/opener", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/editor/contrib/hover/browser/hoverTypes", "vs/editor/contrib/hover/browser/markdownHoverParticipant", "vs/editor/contrib/hover/browser/markerHoverParticipant", "vs/editor/contrib/inlineCompletions/browser/inlineCompletionsHintsWidget", "vs/platform/keybinding/common/keybinding", "vs/nls!vs/editor/contrib/hover/browser/hover", "vs/base/common/async", "vs/css!./hover"], function (require, exports, keyCodes_1, lifecycle_1, editorExtensions_1, range_1, editorContextKeys_1, language_1, goToDefinitionAtPosition_1, contentHover_1, marginHover_1, instantiation_1, opener_1, colorRegistry_1, themeService_1, hoverTypes_1, markdownHoverParticipant_1, markerHoverParticipant_1, inlineCompletionsHintsWidget_1, keybinding_1, nls, async_1) {
    "use strict";
    var $Q6_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Q6 = void 0;
    // sticky hover widget which doesn't disappear on focus out and such
    const _sticky = false;
    let $Q6 = class $Q6 extends lifecycle_1.$kc {
        static { $Q6_1 = this; }
        static { this.ID = 'editor.contrib.hover'; }
        getWidgetContent() { return this.b?.getWidgetContent(); }
        static get(editor) {
            return editor.getContribution($Q6_1.ID);
        }
        constructor(t, u, w, y, z) {
            super();
            this.t = t;
            this.u = u;
            this.w = w;
            this.y = y;
            this.z = z;
            this.a = new lifecycle_1.$jc();
            this.n = false;
            this.f = false;
            this.g = false;
            this.b = null;
            this.c = null;
            this.r = this.B(new async_1.$Sg(() => this.M(this.s), 0));
            this.C();
            this.B(this.t.onDidChangeConfiguration((e) => {
                if (e.hasChanged(60 /* EditorOption.hover */)) {
                    this.D();
                    this.C();
                }
            }));
            this.B(this.t.onMouseLeave(() => {
                this.s = undefined;
                this.r.cancel();
            }));
        }
        C() {
            const hideWidgetsEventHandler = () => this.O();
            const hoverOpts = this.t.getOption(60 /* EditorOption.hover */);
            this.h = hoverOpts.enabled;
            this.j = hoverOpts.sticky;
            this.m = hoverOpts.hidingDelay;
            if (this.h) {
                this.a.add(this.t.onMouseDown((e) => this.G(e)));
                this.a.add(this.t.onMouseUp((e) => this.H(e)));
                this.a.add(this.t.onMouseMove((e) => this.L(e)));
                this.a.add(this.t.onKeyDown((e) => this.N(e)));
            }
            else {
                this.a.add(this.t.onMouseMove((e) => this.L(e)));
                this.a.add(this.t.onKeyDown((e) => this.N(e)));
            }
            this.a.add(this.t.onMouseLeave((e) => this.I(e)));
            this.a.add(this.t.onDidChangeModel(hideWidgetsEventHandler));
            this.a.add(this.t.onDidScrollChange((e) => this.F(e)));
        }
        D() {
            this.a.clear();
        }
        F(e) {
            if (e.scrollTopChanged || e.scrollLeftChanged) {
                this.O();
            }
        }
        G(mouseEvent) {
            this.f = true;
            const target = mouseEvent.target;
            if (target.type === 9 /* MouseTargetType.CONTENT_WIDGET */ && target.detail === contentHover_1.$34.ID) {
                this.g = true;
                // mouse down on top of content hover widget
                return;
            }
            if (target.type === 12 /* MouseTargetType.OVERLAY_WIDGET */ && target.detail === marginHover_1.$54.ID) {
                // mouse down on top of overlay hover widget
                return;
            }
            if (target.type !== 12 /* MouseTargetType.OVERLAY_WIDGET */) {
                this.g = false;
            }
            if (!this.b?.widget.isResizing) {
                this.O();
            }
        }
        H(mouseEvent) {
            this.f = false;
        }
        I(mouseEvent) {
            const targetEm = (mouseEvent.event.browserEvent.relatedTarget);
            if (this.b?.widget.isResizing || this.b?.containsNode(targetEm)) {
                // When the content widget is resizing
                // when the mouse is inside hover widget
                return;
            }
            if (!_sticky) {
                this.O();
            }
        }
        J(mouseEvent) {
            const target = mouseEvent.target;
            if (this.j
                && target.type === 9 /* MouseTargetType.CONTENT_WIDGET */
                && target.detail === contentHover_1.$34.ID) {
                // mouse moved on top of content hover widget
                return true;
            }
            if (this.j
                && this.b?.containsNode(mouseEvent.event.browserEvent.view?.document.activeElement)
                && !mouseEvent.event.browserEvent.view?.getSelection()?.isCollapsed) {
                // selected text within content hover widget
                return true;
            }
            if (!this.j
                && target.type === 9 /* MouseTargetType.CONTENT_WIDGET */
                && target.detail === contentHover_1.$34.ID
                && this.b?.isColorPickerVisible) {
                // though the hover is not sticky, the color picker needs to.
                return true;
            }
            if (this.j
                && target.type === 12 /* MouseTargetType.OVERLAY_WIDGET */
                && target.detail === marginHover_1.$54.ID) {
                // mouse moved on top of overlay hover widget
                return true;
            }
            return false;
        }
        L(mouseEvent) {
            this.s = mouseEvent;
            if (this.b?.isFocused || this.b?.isResizing) {
                return;
            }
            if (this.f && this.g) {
                return;
            }
            if (this.j && this.b?.isVisibleFromKeyboard) {
                // Sticky mode is on and the hover has been shown via keyboard
                // so moving the mouse has no effect
                return;
            }
            const mouseIsOverWidget = this.J(mouseEvent);
            // If the mouse is over the widget and the hiding timeout is defined, then cancel it
            if (mouseIsOverWidget) {
                this.r.cancel();
                return;
            }
            // If the mouse is not over the widget, and if sticky is on,
            // then give it a grace period before reacting to the mouse event
            if (this.b?.isVisible && this.j && this.m > 0) {
                if (!this.r.isScheduled()) {
                    this.r.schedule(this.m);
                }
                return;
            }
            this.M(mouseEvent);
        }
        M(mouseEvent) {
            if (!mouseEvent) {
                return;
            }
            const target = mouseEvent.target;
            const mouseOnDecorator = target.element?.classList.contains('colorpicker-color-decoration');
            const decoratorActivatedOn = this.t.getOption(146 /* EditorOption.colorDecoratorsActivatedOn */);
            if ((mouseOnDecorator && ((decoratorActivatedOn === 'click' && !this.n) ||
                (decoratorActivatedOn === 'hover' && !this.h && !_sticky) ||
                (decoratorActivatedOn === 'clickAndHover' && !this.h && !this.n)))
                || !mouseOnDecorator && !this.h && !this.n) {
                this.O();
                return;
            }
            const contentWidget = this.P();
            if (contentWidget.maybeShowAt(mouseEvent)) {
                this.c?.hide();
                return;
            }
            if (target.type === 2 /* MouseTargetType.GUTTER_GLYPH_MARGIN */ && target.position) {
                this.b?.hide();
                if (!this.c) {
                    this.c = new marginHover_1.$54(this.t, this.y, this.w);
                }
                this.c.startShowingAt(target.position.lineNumber);
                return;
            }
            if (_sticky) {
                return;
            }
            this.O();
        }
        N(e) {
            if (!this.t.hasModel()) {
                return;
            }
            const resolvedKeyboardEvent = this.z.softDispatch(e, this.t.getDomNode());
            // If the beginning of a multi-chord keybinding is pressed, or the command aims to focus the hover, set the variable to true, otherwise false
            const mightTriggerFocus = (resolvedKeyboardEvent.kind === 1 /* ResultKind.MoreChordsNeeded */ || (resolvedKeyboardEvent.kind === 2 /* ResultKind.KbFound */ && resolvedKeyboardEvent.commandId === 'editor.action.showHover' && this.b?.isVisible));
            if (e.keyCode !== 5 /* KeyCode.Ctrl */ && e.keyCode !== 6 /* KeyCode.Alt */ && e.keyCode !== 57 /* KeyCode.Meta */ && e.keyCode !== 4 /* KeyCode.Shift */
                && !mightTriggerFocus) {
                // Do not hide hover when a modifier key is pressed
                this.O();
            }
        }
        O() {
            if (_sticky) {
                return;
            }
            if ((this.f && this.g && this.b?.isColorPickerVisible) || inlineCompletionsHintsWidget_1.$O6.dropDownVisible) {
                return;
            }
            this.n = false;
            this.g = false;
            this.c?.hide();
            this.b?.hide();
        }
        P() {
            if (!this.b) {
                this.b = this.u.createInstance(contentHover_1.$24, this.t);
            }
            return this.b;
        }
        showContentHover(range, mode, source, focus, activatedByColorDecoratorClick = false) {
            this.n = activatedByColorDecoratorClick;
            this.P().startShowingAtRange(range, mode, source, focus);
        }
        focus() {
            this.b?.focus();
        }
        scrollUp() {
            this.b?.scrollUp();
        }
        scrollDown() {
            this.b?.scrollDown();
        }
        scrollLeft() {
            this.b?.scrollLeft();
        }
        scrollRight() {
            this.b?.scrollRight();
        }
        pageUp() {
            this.b?.pageUp();
        }
        pageDown() {
            this.b?.pageDown();
        }
        goToTop() {
            this.b?.goToTop();
        }
        goToBottom() {
            this.b?.goToBottom();
        }
        get isColorPickerVisible() {
            return this.b?.isColorPickerVisible;
        }
        get isHoverVisible() {
            return this.b?.isVisible;
        }
        dispose() {
            super.dispose();
            this.D();
            this.a.dispose();
            this.c?.dispose();
            this.b?.dispose();
        }
    };
    exports.$Q6 = $Q6;
    exports.$Q6 = $Q6 = $Q6_1 = __decorate([
        __param(1, instantiation_1.$Ah),
        __param(2, opener_1.$NT),
        __param(3, language_1.$ct),
        __param(4, keybinding_1.$2D)
    ], $Q6);
    class ShowOrFocusHoverAction extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.showHover',
                label: nls.localize(0, null),








                description: {
                    description: `Show or Focus Hover`,
                    args: [{
                            name: 'args',
                            schema: {
                                type: 'object',
                                properties: {
                                    'focus': {
                                        description: 'Controls if when triggered with the keyboard, the hover should take focus immediately.',
                                        type: 'boolean',
                                        default: false
                                    }
                                },
                            }
                        }]
                },
                alias: 'Show or Focus Hover',
                precondition: undefined,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 39 /* KeyCode.KeyI */),
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(accessor, editor, args) {
            if (!editor.hasModel()) {
                return;
            }
            const controller = $Q6.get(editor);
            if (!controller) {
                return;
            }
            const position = editor.getPosition();
            const range = new range_1.$ks(position.lineNumber, position.column, position.lineNumber, position.column);
            const focus = editor.getOption(2 /* EditorOption.accessibilitySupport */) === 2 /* AccessibilitySupport.Enabled */ || !!args?.focus;
            if (controller.isHoverVisible) {
                controller.focus();
            }
            else {
                controller.showContentHover(range, 1 /* HoverStartMode.Immediate */, 1 /* HoverStartSource.Keyboard */, focus);
            }
        }
    }
    class ShowDefinitionPreviewHoverAction extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.showDefinitionPreviewHover',
                label: nls.localize(1, null),






                alias: 'Show Definition Preview Hover',
                precondition: undefined
            });
        }
        run(accessor, editor) {
            const controller = $Q6.get(editor);
            if (!controller) {
                return;
            }
            const position = editor.getPosition();
            if (!position) {
                return;
            }
            const range = new range_1.$ks(position.lineNumber, position.column, position.lineNumber, position.column);
            const goto = goToDefinitionAtPosition_1.$X4.get(editor);
            if (!goto) {
                return;
            }
            const promise = goto.startFindDefinitionFromCursor(position);
            promise.then(() => {
                controller.showContentHover(range, 1 /* HoverStartMode.Immediate */, 1 /* HoverStartSource.Keyboard */, true);
            });
        }
    }
    class ScrollUpHoverAction extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.scrollUpHover',
                label: nls.localize(2, null),





                alias: 'Scroll Up Hover',
                precondition: editorContextKeys_1.EditorContextKeys.hoverFocused,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.hoverFocused,
                    primary: 16 /* KeyCode.UpArrow */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(accessor, editor) {
            const controller = $Q6.get(editor);
            if (!controller) {
                return;
            }
            controller.scrollUp();
        }
    }
    class ScrollDownHoverAction extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.scrollDownHover',
                label: nls.localize(3, null),





                alias: 'Scroll Down Hover',
                precondition: editorContextKeys_1.EditorContextKeys.hoverFocused,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.hoverFocused,
                    primary: 18 /* KeyCode.DownArrow */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(accessor, editor) {
            const controller = $Q6.get(editor);
            if (!controller) {
                return;
            }
            controller.scrollDown();
        }
    }
    class ScrollLeftHoverAction extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.scrollLeftHover',
                label: nls.localize(4, null),





                alias: 'Scroll Left Hover',
                precondition: editorContextKeys_1.EditorContextKeys.hoverFocused,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.hoverFocused,
                    primary: 15 /* KeyCode.LeftArrow */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(accessor, editor) {
            const controller = $Q6.get(editor);
            if (!controller) {
                return;
            }
            controller.scrollLeft();
        }
    }
    class ScrollRightHoverAction extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.scrollRightHover',
                label: nls.localize(5, null),





                alias: 'Scroll Right Hover',
                precondition: editorContextKeys_1.EditorContextKeys.hoverFocused,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.hoverFocused,
                    primary: 17 /* KeyCode.RightArrow */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(accessor, editor) {
            const controller = $Q6.get(editor);
            if (!controller) {
                return;
            }
            controller.scrollRight();
        }
    }
    class PageUpHoverAction extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.pageUpHover',
                label: nls.localize(6, null),





                alias: 'Page Up Hover',
                precondition: editorContextKeys_1.EditorContextKeys.hoverFocused,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.hoverFocused,
                    primary: 11 /* KeyCode.PageUp */,
                    secondary: [512 /* KeyMod.Alt */ | 16 /* KeyCode.UpArrow */],
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(accessor, editor) {
            const controller = $Q6.get(editor);
            if (!controller) {
                return;
            }
            controller.pageUp();
        }
    }
    class PageDownHoverAction extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.pageDownHover',
                label: nls.localize(7, null),





                alias: 'Page Down Hover',
                precondition: editorContextKeys_1.EditorContextKeys.hoverFocused,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.hoverFocused,
                    primary: 12 /* KeyCode.PageDown */,
                    secondary: [512 /* KeyMod.Alt */ | 18 /* KeyCode.DownArrow */],
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(accessor, editor) {
            const controller = $Q6.get(editor);
            if (!controller) {
                return;
            }
            controller.pageDown();
        }
    }
    class GoToTopHoverAction extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.goToTopHover',
                label: nls.localize(8, null),





                alias: 'Go To Bottom Hover',
                precondition: editorContextKeys_1.EditorContextKeys.hoverFocused,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.hoverFocused,
                    primary: 14 /* KeyCode.Home */,
                    secondary: [2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */],
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(accessor, editor) {
            const controller = $Q6.get(editor);
            if (!controller) {
                return;
            }
            controller.goToTop();
        }
    }
    class GoToBottomHoverAction extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.goToBottomHover',
                label: nls.localize(9, null),





                alias: 'Go To Bottom Hover',
                precondition: editorContextKeys_1.EditorContextKeys.hoverFocused,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.hoverFocused,
                    primary: 13 /* KeyCode.End */,
                    secondary: [2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */],
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(accessor, editor) {
            const controller = $Q6.get(editor);
            if (!controller) {
                return;
            }
            controller.goToBottom();
        }
    }
    (0, editorExtensions_1.$AV)($Q6.ID, $Q6, 2 /* EditorContributionInstantiation.BeforeFirstInteraction */);
    (0, editorExtensions_1.$xV)(ShowOrFocusHoverAction);
    (0, editorExtensions_1.$xV)(ShowDefinitionPreviewHoverAction);
    (0, editorExtensions_1.$xV)(ScrollUpHoverAction);
    (0, editorExtensions_1.$xV)(ScrollDownHoverAction);
    (0, editorExtensions_1.$xV)(ScrollLeftHoverAction);
    (0, editorExtensions_1.$xV)(ScrollRightHoverAction);
    (0, editorExtensions_1.$xV)(PageUpHoverAction);
    (0, editorExtensions_1.$xV)(PageDownHoverAction);
    (0, editorExtensions_1.$xV)(GoToTopHoverAction);
    (0, editorExtensions_1.$xV)(GoToBottomHoverAction);
    hoverTypes_1.$j3.register(markdownHoverParticipant_1.$04);
    hoverTypes_1.$j3.register(markerHoverParticipant_1.$g5);
    // theming
    (0, themeService_1.$mv)((theme, collector) => {
        const hoverBorder = theme.getColor(colorRegistry_1.$5w);
        if (hoverBorder) {
            collector.addRule(`.monaco-editor .monaco-hover .hover-row:not(:first-child):not(:empty) { border-top: 1px solid ${hoverBorder.transparent(0.5)}; }`);
            collector.addRule(`.monaco-editor .monaco-hover hr { border-top: 1px solid ${hoverBorder.transparent(0.5)}; }`);
            collector.addRule(`.monaco-editor .monaco-hover hr { border-bottom: 0px solid ${hoverBorder.transparent(0.5)}; }`);
        }
    });
});
//# sourceMappingURL=hover.js.map