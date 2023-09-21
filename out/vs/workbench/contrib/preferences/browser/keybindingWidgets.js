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
define(["require", "exports", "vs/nls", "vs/base/common/platform", "vs/base/common/lifecycle", "vs/base/common/event", "vs/base/browser/ui/keybindingLabel/keybindingLabel", "vs/base/browser/ui/widget", "vs/base/browser/dom", "vs/base/browser/ui/aria/aria", "vs/base/browser/keyboardEvent", "vs/base/browser/fastDomNode", "vs/platform/keybinding/common/keybinding", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/colorRegistry", "vs/workbench/contrib/preferences/browser/preferencesWidgets", "vs/base/common/async", "vs/platform/contextkey/common/contextkey", "vs/platform/theme/browser/defaultStyles", "vs/css!./media/keybindings"], function (require, exports, nls, platform_1, lifecycle_1, event_1, keybindingLabel_1, widget_1, dom, aria, keyboardEvent_1, fastDomNode_1, keybinding_1, contextView_1, instantiation_1, colorRegistry_1, preferencesWidgets_1, async_1, contextkey_1, defaultStyles_1) {
    "use strict";
    var DefineKeybindingWidget_1, DefineKeybindingOverlayWidget_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DefineKeybindingOverlayWidget = exports.DefineKeybindingWidget = exports.KeybindingsSearchWidget = void 0;
    let KeybindingsSearchWidget = class KeybindingsSearchWidget extends preferencesWidgets_1.SearchWidget {
        constructor(parent, options, contextViewService, instantiationService, contextKeyService, keybindingService) {
            super(parent, options, contextViewService, instantiationService, contextKeyService, keybindingService);
            this.recordDisposables = this._register(new lifecycle_1.DisposableStore());
            this._onKeybinding = this._register(new event_1.Emitter());
            this.onKeybinding = this._onKeybinding.event;
            this._onEnter = this._register(new event_1.Emitter());
            this.onEnter = this._onEnter.event;
            this._onEscape = this._register(new event_1.Emitter());
            this.onEscape = this._onEscape.event;
            this._onBlur = this._register(new event_1.Emitter());
            this.onBlur = this._onBlur.event;
            this._register((0, lifecycle_1.toDisposable)(() => this.stopRecordingKeys()));
            this._chords = null;
            this._inputValue = '';
        }
        clear() {
            this._chords = null;
            super.clear();
        }
        startRecordingKeys() {
            this.recordDisposables.add(dom.addDisposableListener(this.inputBox.inputElement, dom.EventType.KEY_DOWN, (e) => this._onKeyDown(new keyboardEvent_1.StandardKeyboardEvent(e))));
            this.recordDisposables.add(dom.addDisposableListener(this.inputBox.inputElement, dom.EventType.BLUR, () => this._onBlur.fire()));
            this.recordDisposables.add(dom.addDisposableListener(this.inputBox.inputElement, dom.EventType.INPUT, () => {
                // Prevent other characters from showing up
                this.setInputValue(this._inputValue);
            }));
        }
        stopRecordingKeys() {
            this._chords = null;
            this.recordDisposables.clear();
        }
        setInputValue(value) {
            this._inputValue = value;
            this.inputBox.value = this._inputValue;
        }
        _onKeyDown(keyboardEvent) {
            keyboardEvent.preventDefault();
            keyboardEvent.stopPropagation();
            const options = this.options;
            if (!options.recordEnter && keyboardEvent.equals(3 /* KeyCode.Enter */)) {
                this._onEnter.fire();
                return;
            }
            if (keyboardEvent.equals(9 /* KeyCode.Escape */)) {
                this._onEscape.fire();
                return;
            }
            this.printKeybinding(keyboardEvent);
        }
        printKeybinding(keyboardEvent) {
            const keybinding = this.keybindingService.resolveKeyboardEvent(keyboardEvent);
            const info = `code: ${keyboardEvent.browserEvent.code}, keyCode: ${keyboardEvent.browserEvent.keyCode}, key: ${keyboardEvent.browserEvent.key} => UI: ${keybinding.getAriaLabel()}, user settings: ${keybinding.getUserSettingsLabel()}, dispatch: ${keybinding.getDispatchChords()[0]}`;
            const options = this.options;
            if (!this._chords) {
                this._chords = [];
            }
            // TODO: note that we allow a keybinding "shift shift", but this widget doesn't allow input "shift shift" because the first "shift" will be incomplete - this is _not_ a regression
            const hasIncompleteChord = this._chords.length > 0 && this._chords[this._chords.length - 1].getDispatchChords()[0] === null;
            if (hasIncompleteChord) {
                this._chords[this._chords.length - 1] = keybinding;
            }
            else {
                if (this._chords.length === 2) { // TODO: limit chords # to 2 for now
                    this._chords = [];
                }
                this._chords.push(keybinding);
            }
            const value = this._chords.map((keybinding) => keybinding.getUserSettingsLabel() || '').join(' ');
            this.setInputValue(options.quoteRecordedKeys ? `"${value}"` : value);
            this.inputBox.inputElement.title = info;
            this._onKeybinding.fire(this._chords);
        }
    };
    exports.KeybindingsSearchWidget = KeybindingsSearchWidget;
    exports.KeybindingsSearchWidget = KeybindingsSearchWidget = __decorate([
        __param(2, contextView_1.IContextViewService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, contextkey_1.IContextKeyService),
        __param(5, keybinding_1.IKeybindingService)
    ], KeybindingsSearchWidget);
    let DefineKeybindingWidget = class DefineKeybindingWidget extends widget_1.Widget {
        static { DefineKeybindingWidget_1 = this; }
        static { this.WIDTH = 400; }
        static { this.HEIGHT = 110; }
        constructor(parent, instantiationService) {
            super();
            this.instantiationService = instantiationService;
            this._chords = null;
            this._isVisible = false;
            this._onHide = this._register(new event_1.Emitter());
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this._onShowExistingKeybindings = this._register(new event_1.Emitter());
            this.onShowExistingKeybidings = this._onShowExistingKeybindings.event;
            this._domNode = (0, fastDomNode_1.createFastDomNode)(document.createElement('div'));
            this._domNode.setDisplay('none');
            this._domNode.setClassName('defineKeybindingWidget');
            this._domNode.setWidth(DefineKeybindingWidget_1.WIDTH);
            this._domNode.setHeight(DefineKeybindingWidget_1.HEIGHT);
            const message = nls.localize('defineKeybinding.initial', "Press desired key combination and then press ENTER.");
            dom.append(this._domNode.domNode, dom.$('.message', undefined, message));
            this._domNode.domNode.style.backgroundColor = (0, colorRegistry_1.asCssVariable)(colorRegistry_1.editorWidgetBackground);
            this._domNode.domNode.style.color = (0, colorRegistry_1.asCssVariable)(colorRegistry_1.editorWidgetForeground);
            this._domNode.domNode.style.boxShadow = `0 2px 8px ${(0, colorRegistry_1.asCssVariable)(colorRegistry_1.widgetShadow)}`;
            this._keybindingInputWidget = this._register(this.instantiationService.createInstance(KeybindingsSearchWidget, this._domNode.domNode, { ariaLabel: message, history: [], inputBoxStyles: defaultStyles_1.defaultInputBoxStyles }));
            this._keybindingInputWidget.startRecordingKeys();
            this._register(this._keybindingInputWidget.onKeybinding(keybinding => this.onKeybinding(keybinding)));
            this._register(this._keybindingInputWidget.onEnter(() => this.hide()));
            this._register(this._keybindingInputWidget.onEscape(() => this.clearOrHide()));
            this._register(this._keybindingInputWidget.onBlur(() => this.onCancel()));
            this._outputNode = dom.append(this._domNode.domNode, dom.$('.output'));
            this._showExistingKeybindingsNode = dom.append(this._domNode.domNode, dom.$('.existing'));
            if (parent) {
                dom.append(parent, this._domNode.domNode);
            }
        }
        get domNode() {
            return this._domNode.domNode;
        }
        define() {
            this._keybindingInputWidget.clear();
            return async_1.Promises.withAsyncBody(async (c) => {
                if (!this._isVisible) {
                    this._isVisible = true;
                    this._domNode.setDisplay('block');
                    this._chords = null;
                    this._keybindingInputWidget.setInputValue('');
                    dom.clearNode(this._outputNode);
                    dom.clearNode(this._showExistingKeybindingsNode);
                    // Input is not getting focus without timeout in safari
                    // https://github.com/microsoft/vscode/issues/108817
                    await (0, async_1.timeout)(0);
                    this._keybindingInputWidget.focus();
                }
                const disposable = this._onHide.event(() => {
                    c(this.getUserSettingsLabel());
                    disposable.dispose();
                });
            });
        }
        layout(layout) {
            const top = Math.round((layout.height - DefineKeybindingWidget_1.HEIGHT) / 2);
            this._domNode.setTop(top);
            const left = Math.round((layout.width - DefineKeybindingWidget_1.WIDTH) / 2);
            this._domNode.setLeft(left);
        }
        printExisting(numberOfExisting) {
            if (numberOfExisting > 0) {
                const existingElement = dom.$('span.existingText');
                const text = numberOfExisting === 1 ? nls.localize('defineKeybinding.oneExists', "1 existing command has this keybinding", numberOfExisting) : nls.localize('defineKeybinding.existing', "{0} existing commands have this keybinding", numberOfExisting);
                dom.append(existingElement, document.createTextNode(text));
                aria.alert(text);
                this._showExistingKeybindingsNode.appendChild(existingElement);
                existingElement.onmousedown = (e) => { e.preventDefault(); };
                existingElement.onmouseup = (e) => { e.preventDefault(); };
                existingElement.onclick = () => { this._onShowExistingKeybindings.fire(this.getUserSettingsLabel()); };
            }
        }
        onKeybinding(keybinding) {
            this._chords = keybinding;
            dom.clearNode(this._outputNode);
            dom.clearNode(this._showExistingKeybindingsNode);
            const firstLabel = new keybindingLabel_1.KeybindingLabel(this._outputNode, platform_1.OS, defaultStyles_1.defaultKeybindingLabelStyles);
            firstLabel.set(this._chords?.[0] ?? undefined);
            if (this._chords) {
                for (let i = 1; i < this._chords.length; i++) {
                    this._outputNode.appendChild(document.createTextNode(nls.localize('defineKeybinding.chordsTo', "chord to")));
                    const chordLabel = new keybindingLabel_1.KeybindingLabel(this._outputNode, platform_1.OS, defaultStyles_1.defaultKeybindingLabelStyles);
                    chordLabel.set(this._chords[i]);
                }
            }
            const label = this.getUserSettingsLabel();
            if (label) {
                this._onDidChange.fire(label);
            }
        }
        getUserSettingsLabel() {
            let label = null;
            if (this._chords) {
                label = this._chords.map(keybinding => keybinding.getUserSettingsLabel()).join(' ');
            }
            return label;
        }
        onCancel() {
            this._chords = null;
            this.hide();
        }
        clearOrHide() {
            if (this._chords === null) {
                this.hide();
            }
            else {
                this._chords = null;
                this._keybindingInputWidget.clear();
                dom.clearNode(this._outputNode);
                dom.clearNode(this._showExistingKeybindingsNode);
            }
        }
        hide() {
            this._domNode.setDisplay('none');
            this._isVisible = false;
            this._onHide.fire();
        }
    };
    exports.DefineKeybindingWidget = DefineKeybindingWidget;
    exports.DefineKeybindingWidget = DefineKeybindingWidget = DefineKeybindingWidget_1 = __decorate([
        __param(1, instantiation_1.IInstantiationService)
    ], DefineKeybindingWidget);
    let DefineKeybindingOverlayWidget = class DefineKeybindingOverlayWidget extends lifecycle_1.Disposable {
        static { DefineKeybindingOverlayWidget_1 = this; }
        static { this.ID = 'editor.contrib.defineKeybindingWidget'; }
        constructor(_editor, instantiationService) {
            super();
            this._editor = _editor;
            this._widget = this._register(instantiationService.createInstance(DefineKeybindingWidget, null));
            this._editor.addOverlayWidget(this);
        }
        getId() {
            return DefineKeybindingOverlayWidget_1.ID;
        }
        getDomNode() {
            return this._widget.domNode;
        }
        getPosition() {
            return {
                preference: null
            };
        }
        dispose() {
            this._editor.removeOverlayWidget(this);
            super.dispose();
        }
        start() {
            if (this._editor.hasModel()) {
                this._editor.revealPositionInCenterIfOutsideViewport(this._editor.getPosition(), 0 /* ScrollType.Smooth */);
            }
            const layoutInfo = this._editor.getLayoutInfo();
            this._widget.layout(new dom.Dimension(layoutInfo.width, layoutInfo.height));
            return this._widget.define();
        }
    };
    exports.DefineKeybindingOverlayWidget = DefineKeybindingOverlayWidget;
    exports.DefineKeybindingOverlayWidget = DefineKeybindingOverlayWidget = DefineKeybindingOverlayWidget_1 = __decorate([
        __param(1, instantiation_1.IInstantiationService)
    ], DefineKeybindingOverlayWidget);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5YmluZGluZ1dpZGdldHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9wcmVmZXJlbmNlcy9icm93c2VyL2tleWJpbmRpbmdXaWRnZXRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUErQnpGLElBQU0sdUJBQXVCLEdBQTdCLE1BQU0sdUJBQXdCLFNBQVEsaUNBQVk7UUFtQnhELFlBQVksTUFBbUIsRUFBRSxPQUFpQyxFQUM1QyxrQkFBdUMsRUFDckMsb0JBQTJDLEVBQzlDLGlCQUFxQyxFQUNyQyxpQkFBcUM7WUFFekQsS0FBSyxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsb0JBQW9CLEVBQUUsaUJBQWlCLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztZQXBCdkYsc0JBQWlCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLDJCQUFlLEVBQUUsQ0FBQyxDQUFDO1lBRW5FLGtCQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBK0IsQ0FBQyxDQUFDO1lBQzFFLGlCQUFZLEdBQXVDLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDO1lBRTdFLGFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFRLENBQUMsQ0FBQztZQUM5QyxZQUFPLEdBQWdCLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO1lBRTVDLGNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFRLENBQUMsQ0FBQztZQUMvQyxhQUFRLEdBQWdCLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDO1lBRTlDLFlBQU8sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFRLENBQUMsQ0FBQztZQUM3QyxXQUFNLEdB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