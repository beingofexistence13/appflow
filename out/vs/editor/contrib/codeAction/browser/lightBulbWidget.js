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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/touch", "vs/base/common/codicons", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/themables", "vs/editor/common/model/utils", "vs/editor/contrib/codeAction/browser/codeAction", "vs/nls", "vs/platform/keybinding/common/keybinding", "vs/css!./lightBulbWidget"], function (require, exports, dom, touch_1, codicons_1, event_1, lifecycle_1, themables_1, utils_1, codeAction_1, nls, keybinding_1) {
    "use strict";
    var LightBulbWidget_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LightBulbWidget = void 0;
    var LightBulbState;
    (function (LightBulbState) {
        let Type;
        (function (Type) {
            Type[Type["Hidden"] = 0] = "Hidden";
            Type[Type["Showing"] = 1] = "Showing";
        })(Type = LightBulbState.Type || (LightBulbState.Type = {}));
        LightBulbState.Hidden = { type: 0 /* Type.Hidden */ };
        class Showing {
            constructor(actions, trigger, editorPosition, widgetPosition) {
                this.actions = actions;
                this.trigger = trigger;
                this.editorPosition = editorPosition;
                this.widgetPosition = widgetPosition;
                this.type = 1 /* Type.Showing */;
            }
        }
        LightBulbState.Showing = Showing;
    })(LightBulbState || (LightBulbState = {}));
    let LightBulbWidget = class LightBulbWidget extends lifecycle_1.Disposable {
        static { LightBulbWidget_1 = this; }
        static { this.ID = 'editor.contrib.lightbulbWidget'; }
        static { this._posPref = [0 /* ContentWidgetPositionPreference.EXACT */]; }
        constructor(_editor, keybindingService) {
            super();
            this._editor = _editor;
            this._onClick = this._register(new event_1.Emitter());
            this.onClick = this._onClick.event;
            this._state = LightBulbState.Hidden;
            this._domNode = dom.$('div.lightBulbWidget');
            this._register(touch_1.Gesture.ignoreTarget(this._domNode));
            this._editor.addContentWidget(this);
            this._register(this._editor.onDidChangeModelContent(_ => {
                // cancel when the line in question has been removed
                const editorModel = this._editor.getModel();
                if (this.state.type !== 1 /* LightBulbState.Type.Showing */ || !editorModel || this.state.editorPosition.lineNumber >= editorModel.getLineCount()) {
                    this.hide();
                }
            }));
            this._register(dom.addStandardDisposableGenericMouseDownListener(this._domNode, e => {
                if (this.state.type !== 1 /* LightBulbState.Type.Showing */) {
                    return;
                }
                // Make sure that focus / cursor location is not lost when clicking widget icon
                this._editor.focus();
                e.preventDefault();
                // a bit of extra work to make sure the menu
                // doesn't cover the line-text
                const { top, height } = dom.getDomNodePagePosition(this._domNode);
                const lineHeight = this._editor.getOption(66 /* EditorOption.lineHeight */);
                let pad = Math.floor(lineHeight / 3);
                if (this.state.widgetPosition.position !== null && this.state.widgetPosition.position.lineNumber < this.state.editorPosition.lineNumber) {
                    pad += lineHeight;
                }
                this._onClick.fire({
                    x: e.posx,
                    y: top + height + pad,
                    actions: this.state.actions,
                    trigger: this.state.trigger,
                });
            }));
            this._register(dom.addDisposableListener(this._domNode, 'mouseenter', (e) => {
                if ((e.buttons & 1) !== 1) {
                    return;
                }
                // mouse enters lightbulb while the primary/left button
                // is being pressed -> hide the lightbulb
                this.hide();
            }));
            this._register(this._editor.onDidChangeConfiguration(e => {
                // hide when told to do so
                if (e.hasChanged(64 /* EditorOption.lightbulb */) && !this._editor.getOption(64 /* EditorOption.lightbulb */).enabled) {
                    this.hide();
                }
            }));
            this._register(event_1.Event.runAndSubscribe(keybindingService.onDidUpdateKeybindings, () => {
                this._preferredKbLabel = keybindingService.lookupKeybinding(codeAction_1.autoFixCommandId)?.getLabel() ?? undefined;
                this._quickFixKbLabel = keybindingService.lookupKeybinding(codeAction_1.quickFixCommandId)?.getLabel() ?? undefined;
                this._updateLightBulbTitleAndIcon();
            }));
        }
        dispose() {
            super.dispose();
            this._editor.removeContentWidget(this);
        }
        getId() {
            return 'LightBulbWidget';
        }
        getDomNode() {
            return this._domNode;
        }
        getPosition() {
            return this._state.type === 1 /* LightBulbState.Type.Showing */ ? this._state.widgetPosition : null;
        }
        update(actions, trigger, atPosition) {
            if (actions.validActions.length <= 0) {
                return this.hide();
            }
            const options = this._editor.getOptions();
            if (!options.get(64 /* EditorOption.lightbulb */).enabled) {
                return this.hide();
            }
            const model = this._editor.getModel();
            if (!model) {
                return this.hide();
            }
            const { lineNumber, column } = model.validatePosition(atPosition);
            const tabSize = model.getOptions().tabSize;
            const fontInfo = options.get(50 /* EditorOption.fontInfo */);
            const lineContent = model.getLineContent(lineNumber);
            const indent = (0, utils_1.computeIndentLevel)(lineContent, tabSize);
            const lineHasSpace = fontInfo.spaceWidth * indent > 22;
            const isFolded = (lineNumber) => {
                return lineNumber > 2 && this._editor.getTopForLineNumber(lineNumber) === this._editor.getTopForLineNumber(lineNumber - 1);
            };
            let effectiveLineNumber = lineNumber;
            if (!lineHasSpace) {
                if (lineNumber > 1 && !isFolded(lineNumber - 1)) {
                    effectiveLineNumber -= 1;
                }
                else if (!isFolded(lineNumber + 1)) {
                    effectiveLineNumber += 1;
                }
                else if (column * fontInfo.spaceWidth < 22) {
                    // cannot show lightbulb above/below and showing
                    // it inline would overlay the cursor...
                    return this.hide();
                }
            }
            this.state = new LightBulbState.Showing(actions, trigger, atPosition, {
                position: { lineNumber: effectiveLineNumber, column: 1 },
                preference: LightBulbWidget_1._posPref
            });
            this._editor.layoutContentWidget(this);
        }
        hide() {
            if (this.state === LightBulbState.Hidden) {
                return;
            }
            this.state = LightBulbState.Hidden;
            this._editor.layoutContentWidget(this);
        }
        get state() { return this._state; }
        set state(value) {
            this._state = value;
            this._updateLightBulbTitleAndIcon();
        }
        _updateLightBulbTitleAndIcon() {
            if (this.state.type === 1 /* LightBulbState.Type.Showing */ && this.state.actions.hasAutoFix) {
                // update icon
                this._domNode.classList.remove(...themables_1.ThemeIcon.asClassNameArray(codicons_1.Codicon.lightBulb));
                this._domNode.classList.add(...themables_1.ThemeIcon.asClassNameArray(codicons_1.Codicon.lightbulbAutofix));
                if (this._preferredKbLabel) {
                    this.title = nls.localize('preferredcodeActionWithKb', "Show Code Actions. Preferred Quick Fix Available ({0})", this._preferredKbLabel);
                    return;
                }
            }
            // update icon
            this._domNode.classList.remove(...themables_1.ThemeIcon.asClassNameArray(codicons_1.Codicon.lightbulbAutofix));
            this._domNode.classList.add(...themables_1.ThemeIcon.asClassNameArray(codicons_1.Codicon.lightBulb));
            if (this._quickFixKbLabel) {
                this.title = nls.localize('codeActionWithKb', "Show Code Actions ({0})", this._quickFixKbLabel);
            }
            else {
                this.title = nls.localize('codeAction', "Show Code Actions");
            }
        }
        set title(value) {
            this._domNode.title = value;
        }
    };
    exports.LightBulbWidget = LightBulbWidget;
    exports.LightBulbWidget = LightBulbWidget = LightBulbWidget_1 = __decorate([
        __param(1, keybinding_1.IKeybindingService)
    ], LightBulbWidget);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlnaHRCdWxiV2lkZ2V0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvY29kZUFjdGlvbi9icm93c2VyL2xpZ2h0QnVsYldpZGdldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBa0JoRyxJQUFVLGNBQWMsQ0FxQnZCO0lBckJELFdBQVUsY0FBYztRQUV2QixJQUFrQixJQUdqQjtRQUhELFdBQWtCLElBQUk7WUFDckIsbUNBQU0sQ0FBQTtZQUNOLHFDQUFPLENBQUE7UUFDUixDQUFDLEVBSGlCLElBQUksR0FBSixtQkFBSSxLQUFKLG1CQUFJLFFBR3JCO1FBRVkscUJBQU0sR0FBRyxFQUFFLElBQUkscUJBQWEsRUFBVyxDQUFDO1FBRXJELE1BQWEsT0FBTztZQUduQixZQUNpQixPQUFzQixFQUN0QixPQUEwQixFQUMxQixjQUF5QixFQUN6QixjQUFzQztnQkFIdEMsWUFBTyxHQUFQLE9BQU8sQ0FBZTtnQkFDdEIsWUFBTyxHQUFQLE9BQU8sQ0FBbUI7Z0JBQzFCLG1CQUFjLEdBQWQsY0FBYyxDQUFXO2dCQUN6QixtQkFBYyxHQUFkLGNBQWMsQ0FBd0I7Z0JBTjlDLFNBQUksd0JBQWdCO1lBT3pCLENBQUM7U0FDTDtRQVRZLHNCQUFPLFVBU25CLENBQUE7SUFHRixDQUFDLEVBckJTLGNBQWMsS0FBZCxjQUFjLFFBcUJ2QjtJQUVNLElBQU0sZUFBZSxHQUFyQixNQUFNLGVBQWdCLFNBQVEsc0JBQVU7O2lCQUV2QixPQUFFLEdBQUcsZ0NBQWdDLEFBQW5DLENBQW9DO2lCQUVyQyxhQUFRLEdBQUcsK0NBQXVDLEFBQTFDLENBQTJDO1FBWTNFLFlBQ2tCLE9BQW9CLEVBQ2pCLGlCQUFxQztZQUV6RCxLQUFLLEVBQUUsQ0FBQztZQUhTLFlBQU8sR0FBUCxPQUFPLENBQWE7WUFUckIsYUFBUSxHQUFHLElBQUksQ0FB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