/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform"], function (require, exports, event_1, lifecycle_1, platform) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ClickLinkGesture = exports.ClickLinkOptions = exports.ClickLinkKeyboardEvent = exports.ClickLinkMouseEvent = void 0;
    function hasModifier(e, modifier) {
        return !!e[modifier];
    }
    /**
     * An event that encapsulates the various trigger modifiers logic needed for go to definition.
     */
    class ClickLinkMouseEvent {
        constructor(source, opts) {
            this.target = source.target;
            this.isLeftClick = source.event.leftButton;
            this.isMiddleClick = source.event.middleButton;
            this.isRightClick = source.event.rightButton;
            this.hasTriggerModifier = hasModifier(source.event, opts.triggerModifier);
            this.hasSideBySideModifier = hasModifier(source.event, opts.triggerSideBySideModifier);
            this.isNoneOrSingleMouseDown = (source.event.detail <= 1);
        }
    }
    exports.ClickLinkMouseEvent = ClickLinkMouseEvent;
    /**
     * An event that encapsulates the various trigger modifiers logic needed for go to definition.
     */
    class ClickLinkKeyboardEvent {
        constructor(source, opts) {
            this.keyCodeIsTriggerKey = (source.keyCode === opts.triggerKey);
            this.keyCodeIsSideBySideKey = (source.keyCode === opts.triggerSideBySideKey);
            this.hasTriggerModifier = hasModifier(source, opts.triggerModifier);
        }
    }
    exports.ClickLinkKeyboardEvent = ClickLinkKeyboardEvent;
    class ClickLinkOptions {
        constructor(triggerKey, triggerModifier, triggerSideBySideKey, triggerSideBySideModifier) {
            this.triggerKey = triggerKey;
            this.triggerModifier = triggerModifier;
            this.triggerSideBySideKey = triggerSideBySideKey;
            this.triggerSideBySideModifier = triggerSideBySideModifier;
        }
        equals(other) {
            return (this.triggerKey === other.triggerKey
                && this.triggerModifier === other.triggerModifier
                && this.triggerSideBySideKey === other.triggerSideBySideKey
                && this.triggerSideBySideModifier === other.triggerSideBySideModifier);
        }
    }
    exports.ClickLinkOptions = ClickLinkOptions;
    function createOptions(multiCursorModifier) {
        if (multiCursorModifier === 'altKey') {
            if (platform.isMacintosh) {
                return new ClickLinkOptions(57 /* KeyCode.Meta */, 'metaKey', 6 /* KeyCode.Alt */, 'altKey');
            }
            return new ClickLinkOptions(5 /* KeyCode.Ctrl */, 'ctrlKey', 6 /* KeyCode.Alt */, 'altKey');
        }
        if (platform.isMacintosh) {
            return new ClickLinkOptions(6 /* KeyCode.Alt */, 'altKey', 57 /* KeyCode.Meta */, 'metaKey');
        }
        return new ClickLinkOptions(6 /* KeyCode.Alt */, 'altKey', 5 /* KeyCode.Ctrl */, 'ctrlKey');
    }
    class ClickLinkGesture extends lifecycle_1.Disposable {
        constructor(editor, opts) {
            super();
            this._onMouseMoveOrRelevantKeyDown = this._register(new event_1.Emitter());
            this.onMouseMoveOrRelevantKeyDown = this._onMouseMoveOrRelevantKeyDown.event;
            this._onExecute = this._register(new event_1.Emitter());
            this.onExecute = this._onExecute.event;
            this._onCancel = this._register(new event_1.Emitter());
            this.onCancel = this._onCancel.event;
            this._editor = editor;
            this._extractLineNumberFromMouseEvent = opts?.extractLineNumberFromMouseEvent ?? ((e) => e.target.position ? e.target.position.lineNumber : 0);
            this._opts = createOptions(this._editor.getOption(77 /* EditorOption.multiCursorModifier */));
            this._lastMouseMoveEvent = null;
            this._hasTriggerKeyOnMouseDown = false;
            this._lineNumberOnMouseDown = 0;
            this._register(this._editor.onDidChangeConfiguration((e) => {
                if (e.hasChanged(77 /* EditorOption.multiCursorModifier */)) {
                    const newOpts = createOptions(this._editor.getOption(77 /* EditorOption.multiCursorModifier */));
                    if (this._opts.equals(newOpts)) {
                        return;
                    }
                    this._opts = newOpts;
                    this._lastMouseMoveEvent = null;
                    this._hasTriggerKeyOnMouseDown = false;
                    this._lineNumberOnMouseDown = 0;
                    this._onCancel.fire();
                }
            }));
            this._register(this._editor.onMouseMove((e) => this._onEditorMouseMove(new ClickLinkMouseEvent(e, this._opts))));
            this._register(this._editor.onMouseDown((e) => this._onEditorMouseDown(new ClickLinkMouseEvent(e, this._opts))));
            this._register(this._editor.onMouseUp((e) => this._onEditorMouseUp(new ClickLinkMouseEvent(e, this._opts))));
            this._register(this._editor.onKeyDown((e) => this._onEditorKeyDown(new ClickLinkKeyboardEvent(e, this._opts))));
            this._register(this._editor.onKeyUp((e) => this._onEditorKeyUp(new ClickLinkKeyboardEvent(e, this._opts))));
            this._register(this._editor.onMouseDrag(() => this._resetHandler()));
            this._register(this._editor.onDidChangeCursorSelection((e) => this._onDidChangeCursorSelection(e)));
            this._register(this._editor.onDidChangeModel((e) => this._resetHandler()));
            this._register(this._editor.onDidChangeModelContent(() => this._resetHandler()));
            this._register(this._editor.onDidScrollChange((e) => {
                if (e.scrollTopChanged || e.scrollLeftChanged) {
                    this._resetHandler();
                }
            }));
        }
        _onDidChangeCursorSelection(e) {
            if (e.selection && e.selection.startColumn !== e.selection.endColumn) {
                this._resetHandler(); // immediately stop this feature if the user starts to select (https://github.com/microsoft/vscode/issues/7827)
            }
        }
        _onEditorMouseMove(mouseEvent) {
            this._lastMouseMoveEvent = mouseEvent;
            this._onMouseMoveOrRelevantKeyDown.fire([mouseEvent, null]);
        }
        _onEditorMouseDown(mouseEvent) {
            // We need to record if we had the trigger key on mouse down because someone might select something in the editor
            // holding the mouse down and then while mouse is down start to press Ctrl/Cmd to start a copy operation and then
            // release the mouse button without wanting to do the navigation.
            // With this flag we prevent goto definition if the mouse was down before the trigger key was pressed.
            this._hasTriggerKeyOnMouseDown = mouseEvent.hasTriggerModifier;
            this._lineNumberOnMouseDown = this._extractLineNumberFromMouseEvent(mouseEvent);
        }
        _onEditorMouseUp(mouseEvent) {
            const currentLineNumber = this._extractLineNumberFromMouseEvent(mouseEvent);
            if (this._hasTriggerKeyOnMouseDown && this._lineNumberOnMouseDown && this._lineNumberOnMouseDown === currentLineNumber) {
                this._onExecute.fire(mouseEvent);
            }
        }
        _onEditorKeyDown(e) {
            if (this._lastMouseMoveEvent
                && (e.keyCodeIsTriggerKey // User just pressed Ctrl/Cmd (normal goto definition)
                    || (e.keyCodeIsSideBySideKey && e.hasTriggerModifier) // User pressed Ctrl/Cmd+Alt (goto definition to the side)
                )) {
                this._onMouseMoveOrRelevantKeyDown.fire([this._lastMouseMoveEvent, e]);
            }
            else if (e.hasTriggerModifier) {
                this._onCancel.fire(); // remove decorations if user holds another key with ctrl/cmd to prevent accident goto declaration
            }
        }
        _onEditorKeyUp(e) {
            if (e.keyCodeIsTriggerKey) {
                this._onCancel.fire();
            }
        }
        _resetHandler() {
            this._lastMouseMoveEvent = null;
            this._hasTriggerKeyOnMouseDown = false;
            this._onCancel.fire();
        }
    }
    exports.ClickLinkGesture = ClickLinkGesture;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpY2tMaW5rR2VzdHVyZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2dvdG9TeW1ib2wvYnJvd3Nlci9saW5rL2NsaWNrTGlua0dlc3R1cmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBV2hHLFNBQVMsV0FBVyxDQUFDLENBQTZFLEVBQUUsUUFBdUQ7UUFDMUosT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3RCLENBQUM7SUFFRDs7T0FFRztJQUNILE1BQWEsbUJBQW1CO1FBVS9CLFlBQVksTUFBeUIsRUFBRSxJQUFzQjtZQUM1RCxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7WUFDNUIsSUFBSSxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQztZQUMzQyxJQUFJLENBQUMsYUFBYSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDO1lBQy9DLElBQUksQ0FBQyxZQUFZLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUM7WUFDN0MsSUFBSSxDQUFDLGtCQUFrQixHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUMxRSxJQUFJLENBQUMscUJBQXFCLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLHlCQUF5QixDQUFDLENBQUM7WUFDdkYsSUFBSSxDQUFDLHVCQUF1QixHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDM0QsQ0FBQztLQUNEO0lBbkJELGtEQW1CQztJQUVEOztPQUVHO0lBQ0gsTUFBYSxzQkFBc0I7UUFNbEMsWUFBWSxNQUFzQixFQUFFLElBQXNC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