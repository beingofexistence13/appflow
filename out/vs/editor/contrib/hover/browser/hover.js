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
define(["require", "exports", "vs/base/common/keyCodes", "vs/base/common/lifecycle", "vs/editor/browser/editorExtensions", "vs/editor/common/core/range", "vs/editor/common/editorContextKeys", "vs/editor/common/languages/language", "vs/editor/contrib/gotoSymbol/browser/link/goToDefinitionAtPosition", "vs/editor/contrib/hover/browser/contentHover", "vs/editor/contrib/hover/browser/marginHover", "vs/platform/instantiation/common/instantiation", "vs/platform/opener/common/opener", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/editor/contrib/hover/browser/hoverTypes", "vs/editor/contrib/hover/browser/markdownHoverParticipant", "vs/editor/contrib/hover/browser/markerHoverParticipant", "vs/editor/contrib/inlineCompletions/browser/inlineCompletionsHintsWidget", "vs/platform/keybinding/common/keybinding", "vs/nls", "vs/base/common/async", "vs/css!./hover"], function (require, exports, keyCodes_1, lifecycle_1, editorExtensions_1, range_1, editorContextKeys_1, language_1, goToDefinitionAtPosition_1, contentHover_1, marginHover_1, instantiation_1, opener_1, colorRegistry_1, themeService_1, hoverTypes_1, markdownHoverParticipant_1, markerHoverParticipant_1, inlineCompletionsHintsWidget_1, keybinding_1, nls, async_1) {
    "use strict";
    var ModesHoverController_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ModesHoverController = void 0;
    // sticky hover widget which doesn't disappear on focus out and such
    const _sticky = false;
    let ModesHoverController = class ModesHoverController extends lifecycle_1.Disposable {
        static { ModesHoverController_1 = this; }
        static { this.ID = 'editor.contrib.hover'; }
        getWidgetContent() { return this._contentWidget?.getWidgetContent(); }
        static get(editor) {
            return editor.getContribution(ModesHoverController_1.ID);
        }
        constructor(_editor, _instantiationService, _openerService, _languageService, _keybindingService) {
            super();
            this._editor = _editor;
            this._instantiationService = _instantiationService;
            this._openerService = _openerService;
            this._languageService = _languageService;
            this._keybindingService = _keybindingService;
            this._toUnhook = new lifecycle_1.DisposableStore();
            this._hoverActivatedByColorDecoratorClick = false;
            this._isMouseDown = false;
            this._hoverClicked = false;
            this._contentWidget = null;
            this._glyphWidget = null;
            this._reactToEditorMouseMoveRunner = this._register(new async_1.RunOnceScheduler(() => this._reactToEditorMouseMove(this._mouseMoveEvent), 0));
            this._hookEvents();
            this._register(this._editor.onDidChangeConfiguration((e) => {
                if (e.hasChanged(60 /* EditorOption.hover */)) {
                    this._unhookEvents();
                    this._hookEvents();
                }
            }));
            this._register(this._editor.onMouseLeave(() => {
                this._mouseMoveEvent = undefined;
                this._reactToEditorMouseMoveRunner.cancel();
            }));
        }
        _hookEvents() {
            const hideWidgetsEventHandler = () => this._hideWidgets();
            const hoverOpts = this._editor.getOption(60 /* EditorOption.hover */);
            this._isHoverEnabled = hoverOpts.enabled;
            this._isHoverSticky = hoverOpts.sticky;
            this._hidingDelay = hoverOpts.hidingDelay;
            if (this._isHoverEnabled) {
                this._toUnhook.add(this._editor.onMouseDown((e) => this._onEditorMouseDown(e)));
                this._toUnhook.add(this._editor.onMouseUp((e) => this._onEditorMouseUp(e)));
                this._toUnhook.add(this._editor.onMouseMove((e) => this._onEditorMouseMove(e)));
                this._toUnhook.add(this._editor.onKeyDown((e) => this._onKeyDown(e)));
            }
            else {
                this._toUnhook.add(this._editor.onMouseMove((e) => this._onEditorMouseMove(e)));
                this._toUnhook.add(this._editor.onKeyDown((e) => this._onKeyDown(e)));
            }
            this._toUnhook.add(this._editor.onMouseLeave((e) => this._onEditorMouseLeave(e)));
            this._toUnhook.add(this._editor.onDidChangeModel(hideWidgetsEventHandler));
            this._toUnhook.add(this._editor.onDidScrollChange((e) => this._onEditorScrollChanged(e)));
        }
        _unhookEvents() {
            this._toUnhook.clear();
        }
        _onEditorScrollChanged(e) {
            if (e.scrollTopChanged || e.scrollLeftChanged) {
                this._hideWidgets();
            }
        }
        _onEditorMouseDown(mouseEvent) {
            this._isMouseDown = true;
            const target = mouseEvent.target;
            if (target.type === 9 /* MouseTargetType.CONTENT_WIDGET */ && target.detail === contentHover_1.ContentHoverWidget.ID) {
                this._hoverClicked = true;
                // mouse down on top of content hover widget
                return;
            }
            if (target.type === 12 /* MouseTargetType.OVERLAY_WIDGET */ && target.detail === marginHover_1.MarginHoverWidget.ID) {
                // mouse down on top of overlay hover widget
                return;
            }
            if (target.type !== 12 /* MouseTargetType.OVERLAY_WIDGET */) {
                this._hoverClicked = false;
            }
            if (!this._contentWidget?.widget.isResizing) {
                this._hideWidgets();
            }
        }
        _onEditorMouseUp(mouseEvent) {
            this._isMouseDown = false;
        }
        _onEditorMouseLeave(mouseEvent) {
            const targetEm = (mouseEvent.event.browserEvent.relatedTarget);
            if (this._contentWidget?.widget.isResizing || this._contentWidget?.containsNode(targetEm)) {
                // When the content widget is resizing
                // when the mouse is inside hover widget
                return;
            }
            if (!_sticky) {
                this._hideWidgets();
            }
        }
        _isMouseOverWidget(mouseEvent) {
            const target = mouseEvent.target;
            if (this._isHoverSticky
                && target.type === 9 /* MouseTargetType.CONTENT_WIDGET */
                && target.detail === contentHover_1.ContentHoverWidget.ID) {
                // mouse moved on top of content hover widget
                return true;
            }
            if (this._isHoverSticky
                && this._contentWidget?.containsNode(mouseEvent.event.browserEvent.view?.document.activeElement)
                && !mouseEvent.event.browserEvent.view?.getSelection()?.isCollapsed) {
                // selected text within content hover widget
                return true;
            }
            if (!this._isHoverSticky
                && target.type === 9 /* MouseTargetType.CONTENT_WIDGET */
                && target.detail === contentHover_1.ContentHoverWidget.ID
                && this._contentWidget?.isColorPickerVisible) {
                // though the hover is not sticky, the color picker needs to.
                return true;
            }
            if (this._isHoverSticky
                && target.type === 12 /* MouseTargetType.OVERLAY_WIDGET */
                && target.detail === marginHover_1.MarginHoverWidget.ID) {
                // mouse moved on top of overlay hover widget
                return true;
            }
            return false;
        }
        _onEditorMouseMove(mouseEvent) {
            this._mouseMoveEvent = mouseEvent;
            if (this._contentWidget?.isFocused || this._contentWidget?.isResizing) {
                return;
            }
            if (this._isMouseDown && this._hoverClicked) {
                return;
            }
            if (this._isHoverSticky && this._contentWidget?.isVisibleFromKeyboard) {
                // Sticky mode is on and the hover has been shown via keyboard
                // so moving the mouse has no effect
                return;
            }
            const mouseIsOverWidget = this._isMouseOverWidget(mouseEvent);
            // If the mouse is over the widget and the hiding timeout is defined, then cancel it
            if (mouseIsOverWidget) {
                this._reactToEditorMouseMoveRunner.cancel();
                return;
            }
            // If the mouse is not over the widget, and if sticky is on,
            // then give it a grace period before reacting to the mouse event
            if (this._contentWidget?.isVisible && this._isHoverSticky && this._hidingDelay > 0) {
                if (!this._reactToEditorMouseMoveRunner.isScheduled()) {
                    this._reactToEditorMouseMoveRunner.schedule(this._hidingDelay);
                }
                return;
            }
            this._reactToEditorMouseMove(mouseEvent);
        }
        _reactToEditorMouseMove(mouseEvent) {
            if (!mouseEvent) {
                return;
            }
            const target = mouseEvent.target;
            const mouseOnDecorator = target.element?.classList.contains('colorpicker-color-decoration');
            const decoratorActivatedOn = this._editor.getOption(146 /* EditorOption.colorDecoratorsActivatedOn */);
            if ((mouseOnDecorator && ((decoratorActivatedOn === 'click' && !this._hoverActivatedByColorDecoratorClick) ||
                (decoratorActivatedOn === 'hover' && !this._isHoverEnabled && !_sticky) ||
                (decoratorActivatedOn === 'clickAndHover' && !this._isHoverEnabled && !this._hoverActivatedByColorDecoratorClick)))
                || !mouseOnDecorator && !this._isHoverEnabled && !this._hoverActivatedByColorDecoratorClick) {
                this._hideWidgets();
                return;
            }
            const contentWidget = this._getOrCreateContentWidget();
            if (contentWidget.maybeShowAt(mouseEvent)) {
                this._glyphWidget?.hide();
                return;
            }
            if (target.type === 2 /* MouseTargetType.GUTTER_GLYPH_MARGIN */ && target.position) {
                this._contentWidget?.hide();
                if (!this._glyphWidget) {
                    this._glyphWidget = new marginHover_1.MarginHoverWidget(this._editor, this._languageService, this._openerService);
                }
                this._glyphWidget.startShowingAt(target.position.lineNumber);
                return;
            }
            if (_sticky) {
                return;
            }
            this._hideWidgets();
        }
        _onKeyDown(e) {
            if (!this._editor.hasModel()) {
                return;
            }
            const resolvedKeyboardEvent = this._keybindingService.softDispatch(e, this._editor.getDomNode());
            // If the beginning of a multi-chord keybinding is pressed, or the command aims to focus the hover, set the variable to true, otherwise false
            const mightTriggerFocus = (resolvedKeyboardEvent.kind === 1 /* ResultKind.MoreChordsNeeded */ || (resolvedKeyboardEvent.kind === 2 /* ResultKind.KbFound */ && resolvedKeyboardEvent.commandId === 'editor.action.showHover' && this._contentWidget?.isVisible));
            if (e.keyCode !== 5 /* KeyCode.Ctrl */ && e.keyCode !== 6 /* KeyCode.Alt */ && e.keyCode !== 57 /* KeyCode.Meta */ && e.keyCode !== 4 /* KeyCode.Shift */
                && !mightTriggerFocus) {
                // Do not hide hover when a modifier key is pressed
                this._hideWidgets();
            }
        }
        _hideWidgets() {
            if (_sticky) {
                return;
            }
            if ((this._isMouseDown && this._hoverClicked && this._contentWidget?.isColorPickerVisible) || inlineCompletionsHintsWidget_1.InlineSuggestionHintsContentWidget.dropDownVisible) {
                return;
            }
            this._hoverActivatedByColorDecoratorClick = false;
            this._hoverClicked = false;
            this._glyphWidget?.hide();
            this._contentWidget?.hide();
        }
        _getOrCreateContentWidget() {
            if (!this._contentWidget) {
                this._contentWidget = this._instantiationService.createInstance(contentHover_1.ContentHoverController, this._editor);
            }
            return this._contentWidget;
        }
        showContentHover(range, mode, source, focus, activatedByColorDecoratorClick = false) {
            this._hoverActivatedByColorDecoratorClick = activatedByColorDecoratorClick;
            this._getOrCreateContentWidget().startShowingAtRange(range, mode, source, focus);
        }
        focus() {
            this._contentWidget?.focus();
        }
        scrollUp() {
            this._contentWidget?.scrollUp();
        }
        scrollDown() {
            this._contentWidget?.scrollDown();
        }
        scrollLeft() {
            this._contentWidget?.scrollLeft();
        }
        scrollRight() {
            this._contentWidget?.scrollRight();
        }
        pageUp() {
            this._contentWidget?.pageUp();
        }
        pageDown() {
            this._contentWidget?.pageDown();
        }
        goToTop() {
            this._contentWidget?.goToTop();
        }
        goToBottom() {
            this._contentWidget?.goToBottom();
        }
        get isColorPickerVisible() {
            return this._contentWidget?.isColorPickerVisible;
        }
        get isHoverVisible() {
            return this._contentWidget?.isVisible;
        }
        dispose() {
            super.dispose();
            this._unhookEvents();
            this._toUnhook.dispose();
            this._glyphWidget?.dispose();
            this._contentWidget?.dispose();
        }
    };
    exports.ModesHoverController = ModesHoverController;
    exports.ModesHoverController = ModesHoverController = ModesHoverController_1 = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, opener_1.IOpenerService),
        __param(3, language_1.ILanguageService),
        __param(4, keybinding_1.IKeybindingService)
    ], ModesHoverController);
    class ShowOrFocusHoverAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.showHover',
                label: nls.localize({
                    key: 'showOrFocusHover',
                    comment: [
                        'Label for action that will trigger the showing/focusing of a hover in the editor.',
                        'If the hover is not visible, it will show the hover.',
                        'This allows for users to show the hover without using the mouse.',
                        'If the hover is already visible, it will take focus.'
                    ]
                }, "Show or Focus Hover"),
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
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 39 /* KeyCode.KeyI */),
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(accessor, editor, args) {
            if (!editor.hasModel()) {
                return;
            }
            const controller = ModesHoverController.get(editor);
            if (!controller) {
                return;
            }
            const position = editor.getPosition();
            const range = new range_1.Range(position.lineNumber, position.column, position.lineNumber, position.column);
            const focus = editor.getOption(2 /* EditorOption.accessibilitySupport */) === 2 /* AccessibilitySupport.Enabled */ || !!args?.focus;
            if (controller.isHoverVisible) {
                controller.focus();
            }
            else {
                controller.showContentHover(range, 1 /* HoverStartMode.Immediate */, 1 /* HoverStartSource.Keyboard */, focus);
            }
        }
    }
    class ShowDefinitionPreviewHoverAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.showDefinitionPreviewHover',
                label: nls.localize({
                    key: 'showDefinitionPreviewHover',
                    comment: [
                        'Label for action that will trigger the showing of definition preview hover in the editor.',
                        'This allows for users to show the definition preview hover without using the mouse.'
                    ]
                }, "Show Definition Preview Hover"),
                alias: 'Show Definition Preview Hover',
                precondition: undefined
            });
        }
        run(accessor, editor) {
            const controller = ModesHoverController.get(editor);
            if (!controller) {
                return;
            }
            const position = editor.getPosition();
            if (!position) {
                return;
            }
            const range = new range_1.Range(position.lineNumber, position.column, position.lineNumber, position.column);
            const goto = goToDefinitionAtPosition_1.GotoDefinitionAtPositionEditorContribution.get(editor);
            if (!goto) {
                return;
            }
            const promise = goto.startFindDefinitionFromCursor(position);
            promise.then(() => {
                controller.showContentHover(range, 1 /* HoverStartMode.Immediate */, 1 /* HoverStartSource.Keyboard */, true);
            });
        }
    }
    class ScrollUpHoverAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.scrollUpHover',
                label: nls.localize({
                    key: 'scrollUpHover',
                    comment: [
                        'Action that allows to scroll up in the hover widget with the up arrow when the hover widget is focused.'
                    ]
                }, "Scroll Up Hover"),
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
            const controller = ModesHoverController.get(editor);
            if (!controller) {
                return;
            }
            controller.scrollUp();
        }
    }
    class ScrollDownHoverAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.scrollDownHover',
                label: nls.localize({
                    key: 'scrollDownHover',
                    comment: [
                        'Action that allows to scroll down in the hover widget with the up arrow when the hover widget is focused.'
                    ]
                }, "Scroll Down Hover"),
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
            const controller = ModesHoverController.get(editor);
            if (!controller) {
                return;
            }
            controller.scrollDown();
        }
    }
    class ScrollLeftHoverAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.scrollLeftHover',
                label: nls.localize({
                    key: 'scrollLeftHover',
                    comment: [
                        'Action that allows to scroll left in the hover widget with the left arrow when the hover widget is focused.'
                    ]
                }, "Scroll Left Hover"),
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
            const controller = ModesHoverController.get(editor);
            if (!controller) {
                return;
            }
            controller.scrollLeft();
        }
    }
    class ScrollRightHoverAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.scrollRightHover',
                label: nls.localize({
                    key: 'scrollRightHover',
                    comment: [
                        'Action that allows to scroll right in the hover widget with the right arrow when the hover widget is focused.'
                    ]
                }, "Scroll Right Hover"),
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
            const controller = ModesHoverController.get(editor);
            if (!controller) {
                return;
            }
            controller.scrollRight();
        }
    }
    class PageUpHoverAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.pageUpHover',
                label: nls.localize({
                    key: 'pageUpHover',
                    comment: [
                        'Action that allows to page up in the hover widget with the page up command when the hover widget is focused.'
                    ]
                }, "Page Up Hover"),
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
            const controller = ModesHoverController.get(editor);
            if (!controller) {
                return;
            }
            controller.pageUp();
        }
    }
    class PageDownHoverAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.pageDownHover',
                label: nls.localize({
                    key: 'pageDownHover',
                    comment: [
                        'Action that allows to page down in the hover widget with the page down command when the hover widget is focused.'
                    ]
                }, "Page Down Hover"),
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
            const controller = ModesHoverController.get(editor);
            if (!controller) {
                return;
            }
            controller.pageDown();
        }
    }
    class GoToTopHoverAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.goToTopHover',
                label: nls.localize({
                    key: 'goToTopHover',
                    comment: [
                        'Action that allows to go to the top of the hover widget with the home command when the hover widget is focused.'
                    ]
                }, "Go To Top Hover"),
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
            const controller = ModesHoverController.get(editor);
            if (!controller) {
                return;
            }
            controller.goToTop();
        }
    }
    class GoToBottomHoverAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.goToBottomHover',
                label: nls.localize({
                    key: 'goToBottomHover',
                    comment: [
                        'Action that allows to go to the bottom in the hover widget with the end command when the hover widget is focused.'
                    ]
                }, "Go To Bottom Hover"),
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
            const controller = ModesHoverController.get(editor);
            if (!controller) {
                return;
            }
            controller.goToBottom();
        }
    }
    (0, editorExtensions_1.registerEditorContribution)(ModesHoverController.ID, ModesHoverController, 2 /* EditorContributionInstantiation.BeforeFirstInteraction */);
    (0, editorExtensions_1.registerEditorAction)(ShowOrFocusHoverAction);
    (0, editorExtensions_1.registerEditorAction)(ShowDefinitionPreviewHoverAction);
    (0, editorExtensions_1.registerEditorAction)(ScrollUpHoverAction);
    (0, editorExtensions_1.registerEditorAction)(ScrollDownHoverAction);
    (0, editorExtensions_1.registerEditorAction)(ScrollLeftHoverAction);
    (0, editorExtensions_1.registerEditorAction)(ScrollRightHoverAction);
    (0, editorExtensions_1.registerEditorAction)(PageUpHoverAction);
    (0, editorExtensions_1.registerEditorAction)(PageDownHoverAction);
    (0, editorExtensions_1.registerEditorAction)(GoToTopHoverAction);
    (0, editorExtensions_1.registerEditorAction)(GoToBottomHoverAction);
    hoverTypes_1.HoverParticipantRegistry.register(markdownHoverParticipant_1.MarkdownHoverParticipant);
    hoverTypes_1.HoverParticipantRegistry.register(markerHoverParticipant_1.MarkerHoverParticipant);
    // theming
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const hoverBorder = theme.getColor(colorRegistry_1.editorHoverBorder);
        if (hoverBorder) {
            collector.addRule(`.monaco-editor .monaco-hover .hover-row:not(:first-child):not(:empty) { border-top: 1px solid ${hoverBorder.transparent(0.5)}; }`);
            collector.addRule(`.monaco-editor .monaco-hover hr { border-top: 1px solid ${hoverBorder.transparent(0.5)}; }`);
            collector.addRule(`.monaco-editor .monaco-hover hr { border-bottom: 0px solid ${hoverBorder.transparent(0.5)}; }`);
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG92ZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9ob3Zlci9icm93c2VyL2hvdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFnQ2hHLG9FQUFvRTtJQUNwRSxNQUFNLE9BQU8sR0FBRyxLQUFLLENBRW5CO0lBRUssSUFBTSxvQkFBb0IsR0FBMUIsTUFBTSxvQkFBcUIsU0FBUSxzQkFBVTs7aUJBRTVCLE9BQUUsR0FBRyxzQkFBc0IsQUFBekIsQ0FBMEI7UUFNbkQsZ0JBQWdCLEtBQXlCLE9BQU8sSUFBSSxDQUFDLGNBQWMsRUFBRSxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsQ0FBQztRQWExRixNQUFNLENBQUMsR0FBRyxDQUFDLE1BQW1CO1lBQzdCLE9BQU8sTUFBTSxDQUFDLGVBQWUsQ0FBdUIsc0JBQW9CLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDOUUsQ0FBQztRQUVELFlBQTZCLE9BQW9CLEVBQ3pCLHFCQUE2RCxFQUNwRSxjQUErQyxFQUM3QyxnQkFBbUQsRUFDakQsa0JBQXVEO1lBRTNFLEtBQUssRUFBRSxDQUFDO1lBTm9CLFlBQU8sR0FBUCxPQUFPLENBQWE7WUFDUiwwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1lBQ25ELG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtZQUM1QixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1lBQ2hDLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7WUF6QjNELGNBQVMsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQWEzQyx5Q0FBb0MsR0FBWSxLQUFLLENBQUM7WUFlN0QsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7WUFDMUIsSUFBSSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUM7WUFDM0IsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7WUFD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