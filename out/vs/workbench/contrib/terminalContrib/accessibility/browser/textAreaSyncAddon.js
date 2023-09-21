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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/accessibility/common/accessibility", "vs/platform/terminal/common/terminal", "vs/base/common/decorators", "vs/base/browser/dom"], function (require, exports, lifecycle_1, accessibility_1, terminal_1, decorators_1, dom_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextAreaSyncAddon = void 0;
    let TextAreaSyncAddon = class TextAreaSyncAddon extends lifecycle_1.Disposable {
        activate(terminal) {
            this._terminal = terminal;
            if (this._accessibilityService.isScreenReaderOptimized()) {
                this._registerSyncListeners();
            }
        }
        constructor(_capabilities, _accessibilityService, _logService) {
            super();
            this._capabilities = _capabilities;
            this._accessibilityService = _accessibilityService;
            this._logService = _logService;
            this._listeners = this._register(new lifecycle_1.MutableDisposable());
            this._register(this._accessibilityService.onDidChangeScreenReaderOptimized(() => {
                if (this._accessibilityService.isScreenReaderOptimized()) {
                    this._syncTextArea();
                    this._registerSyncListeners();
                }
                else {
                    this._listeners.clear();
                }
            }));
        }
        _registerSyncListeners() {
            if (this._accessibilityService.isScreenReaderOptimized() && this._terminal?.textarea) {
                this._listeners.value = new lifecycle_1.DisposableStore();
                this._listeners.value.add(this._terminal.onCursorMove(() => this._syncTextArea()));
                this._listeners.value.add(this._terminal.onData(() => this._syncTextArea()));
                this._listeners.value.add((0, dom_1.addDisposableListener)(this._terminal.textarea, 'focus', () => this._syncTextArea()));
            }
        }
        _syncTextArea() {
            this._logService.debug('TextAreaSyncAddon#syncTextArea');
            const textArea = this._terminal?.textarea;
            if (!textArea) {
                this._logService.debug(`TextAreaSyncAddon#syncTextArea: no textarea`);
                return;
            }
            this._updateCommandAndCursor();
            if (this._currentCommand !== textArea.value) {
                textArea.value = this._currentCommand || '';
                this._logService.debug(`TextAreaSyncAddon#syncTextArea: text changed to "${this._currentCommand}"`);
            }
            else if (!this._currentCommand) {
                textArea.value = '';
                this._logService.debug(`TextAreaSyncAddon#syncTextArea: text cleared`);
            }
            if (this._cursorX !== textArea.selectionStart) {
                textArea.selectionStart = this._cursorX ?? 0;
                textArea.selectionEnd = this._cursorX ?? 0;
                this._logService.debug(`TextAreaSyncAddon#syncTextArea: selection start/end changed to ${this._cursorX}`);
            }
        }
        _updateCommandAndCursor() {
            if (!this._terminal) {
                return;
            }
            const commandCapability = this._capabilities.get(2 /* TerminalCapability.CommandDetection */);
            const currentCommand = commandCapability?.currentCommand;
            if (!currentCommand) {
                this._logService.debug(`TextAreaSyncAddon#updateCommandAndCursor: no current command`);
                return;
            }
            const buffer = this._terminal.buffer.active;
            const lineNumber = currentCommand.commandStartMarker?.line;
            if (!lineNumber) {
                return;
            }
            const commandLine = buffer.getLine(lineNumber)?.translateToString(true);
            if (!commandLine) {
                this._logService.debug(`TextAreaSyncAddon#updateCommandAndCursor: no line`);
                return;
            }
            if (currentCommand.commandStartX !== undefined) {
                this._currentCommand = commandLine.substring(currentCommand.commandStartX);
                this._cursorX = buffer.cursorX - currentCommand.commandStartX;
            }
            else {
                this._currentCommand = undefined;
                this._cursorX = undefined;
                this._logService.debug(`TextAreaSyncAddon#updateCommandAndCursor: no commandStartX`);
            }
        }
    };
    exports.TextAreaSyncAddon = TextAreaSyncAddon;
    __decorate([
        (0, decorators_1.debounce)(50)
    ], TextAreaSyncAddon.prototype, "_syncTextArea", null);
    exports.TextAreaSyncAddon = TextAreaSyncAddon = __decorate([
        __param(1, accessibility_1.IAccessibilityService),
        __param(2, terminal_1.ITerminalLogService)
    ], TextAreaSyncAddon);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dEFyZWFTeW5jQWRkb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXJtaW5hbENvbnRyaWIvYWNjZXNzaWJpbGl0eS9icm93c2VyL3RleHRBcmVhU3luY0FkZG9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWV6RixJQUFNLGlCQUFpQixHQUF2QixNQUFNLGlCQUFrQixTQUFRLHNCQUFVO1FBTWhELFFBQVEsQ0FBQyxRQUFrQjtZQUMxQixJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztZQUMxQixJQUFJLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyx1QkFBdUIsRUFBRSxFQUFFO2dCQUN6RCxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQzthQUM5QjtRQUNGLENBQUM7UUFFRCxZQUNrQixhQUF1QyxFQUNqQyxxQkFBNkQsRUFDL0QsV0FBaUQ7WUFFdEUsS0FBSyxFQUFFLENBQUM7WUFKUyxrQkFBYSxHQUFiLGFBQWEsQ0FBMEI7WUFDaEIsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtZQUM5QyxnQkFBVyxHQUFYLFdBQVcsQ0FBcUI7WUFkL0QsZUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSw2QkFBaUIsRUFBbUIsQ0FBQyxDQUFDO1lBaUI3RSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxnQ0FBZ0MsQ0FBQyxHQUFHLEVBQUU7Z0JBQy9FLElBQUksSUFBSSxDQUFDLHFCQUFxQixDQUFDLHVCQUF1QixFQUFFLEVBQUU7b0JBQ3pELElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztvQkFDckIsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7aUJBQzlCO3FCQUFNO29CQUNOLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7aUJBQ3hC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