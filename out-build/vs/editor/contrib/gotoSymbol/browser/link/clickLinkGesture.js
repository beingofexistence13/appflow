/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform"], function (require, exports, event_1, lifecycle_1, platform) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$v3 = exports.$u3 = exports.$t3 = exports.$s3 = void 0;
    function hasModifier(e, modifier) {
        return !!e[modifier];
    }
    /**
     * An event that encapsulates the various trigger modifiers logic needed for go to definition.
     */
    class $s3 {
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
    exports.$s3 = $s3;
    /**
     * An event that encapsulates the various trigger modifiers logic needed for go to definition.
     */
    class $t3 {
        constructor(source, opts) {
            this.keyCodeIsTriggerKey = (source.keyCode === opts.triggerKey);
            this.keyCodeIsSideBySideKey = (source.keyCode === opts.triggerSideBySideKey);
            this.hasTriggerModifier = hasModifier(source, opts.triggerModifier);
        }
    }
    exports.$t3 = $t3;
    class $u3 {
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
    exports.$u3 = $u3;
    function createOptions(multiCursorModifier) {
        if (multiCursorModifier === 'altKey') {
            if (platform.$j) {
                return new $u3(57 /* KeyCode.Meta */, 'metaKey', 6 /* KeyCode.Alt */, 'altKey');
            }
            return new $u3(5 /* KeyCode.Ctrl */, 'ctrlKey', 6 /* KeyCode.Alt */, 'altKey');
        }
        if (platform.$j) {
            return new $u3(6 /* KeyCode.Alt */, 'altKey', 57 /* KeyCode.Meta */, 'metaKey');
        }
        return new $u3(6 /* KeyCode.Alt */, 'altKey', 5 /* KeyCode.Ctrl */, 'ctrlKey');
    }
    class $v3 extends lifecycle_1.$kc {
        constructor(editor, opts) {
            super();
            this.a = this.B(new event_1.$fd());
            this.onMouseMoveOrRelevantKeyDown = this.a.event;
            this.b = this.B(new event_1.$fd());
            this.onExecute = this.b.event;
            this.c = this.B(new event_1.$fd());
            this.onCancel = this.c.event;
            this.f = editor;
            this.g = opts?.extractLineNumberFromMouseEvent ?? ((e) => e.target.position ? e.target.position.lineNumber : 0);
            this.h = createOptions(this.f.getOption(77 /* EditorOption.multiCursorModifier */));
            this.j = null;
            this.m = false;
            this.n = 0;
            this.B(this.f.onDidChangeConfiguration((e) => {
                if (e.hasChanged(77 /* EditorOption.multiCursorModifier */)) {
                    const newOpts = createOptions(this.f.getOption(77 /* EditorOption.multiCursorModifier */));
                    if (this.h.equals(newOpts)) {
                        return;
                    }
                    this.h = newOpts;
                    this.j = null;
                    this.m = false;
                    this.n = 0;
                    this.c.fire();
                }
            }));
            this.B(this.f.onMouseMove((e) => this.s(new $s3(e, this.h))));
            this.B(this.f.onMouseDown((e) => this.t(new $s3(e, this.h))));
            this.B(this.f.onMouseUp((e) => this.u(new $s3(e, this.h))));
            this.B(this.f.onKeyDown((e) => this.w(new $t3(e, this.h))));
            this.B(this.f.onKeyUp((e) => this.y(new $t3(e, this.h))));
            this.B(this.f.onMouseDrag(() => this.z()));
            this.B(this.f.onDidChangeCursorSelection((e) => this.r(e)));
            this.B(this.f.onDidChangeModel((e) => this.z()));
            this.B(this.f.onDidChangeModelContent(() => this.z()));
            this.B(this.f.onDidScrollChange((e) => {
                if (e.scrollTopChanged || e.scrollLeftChanged) {
                    this.z();
                }
            }));
        }
        r(e) {
            if (e.selection && e.selection.startColumn !== e.selection.endColumn) {
                this.z(); // immediately stop this feature if the user starts to select (https://github.com/microsoft/vscode/issues/7827)
            }
        }
        s(mouseEvent) {
            this.j = mouseEvent;
            this.a.fire([mouseEvent, null]);
        }
        t(mouseEvent) {
            // We need to record if we had the trigger key on mouse down because someone might select something in the editor
            // holding the mouse down and then while mouse is down start to press Ctrl/Cmd to start a copy operation and then
            // release the mouse button without wanting to do the navigation.
            // With this flag we prevent goto definition if the mouse was down before the trigger key was pressed.
            this.m = mouseEvent.hasTriggerModifier;
            this.n = this.g(mouseEvent);
        }
        u(mouseEvent) {
            const currentLineNumber = this.g(mouseEvent);
            if (this.m && this.n && this.n === currentLineNumber) {
                this.b.fire(mouseEvent);
            }
        }
        w(e) {
            if (this.j
                && (e.keyCodeIsTriggerKey // User just pressed Ctrl/Cmd (normal goto definition)
                    || (e.keyCodeIsSideBySideKey && e.hasTriggerModifier) // User pressed Ctrl/Cmd+Alt (goto definition to the side)
                )) {
                this.a.fire([this.j, e]);
            }
            else if (e.hasTriggerModifier) {
                this.c.fire(); // remove decorations if user holds another key with ctrl/cmd to prevent accident goto declaration
            }
        }
        y(e) {
            if (e.keyCodeIsTriggerKey) {
                this.c.fire();
            }
        }
        z() {
            this.j = null;
            this.m = false;
            this.c.fire();
        }
    }
    exports.$v3 = $v3;
});
//# sourceMappingURL=clickLinkGesture.js.map