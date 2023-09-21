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
define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/common/core/position", "vs/nls", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/common/keybinding", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/css!./renameInputField"], function (require, exports, lifecycle_1, position_1, nls_1, contextkey_1, keybinding_1, colorRegistry_1, themeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RenameInputField = exports.CONTEXT_RENAME_INPUT_VISIBLE = void 0;
    exports.CONTEXT_RENAME_INPUT_VISIBLE = new contextkey_1.RawContextKey('renameInputVisible', false, (0, nls_1.localize)('renameInputVisible', "Whether the rename input widget is visible"));
    let RenameInputField = class RenameInputField {
        constructor(_editor, _acceptKeybindings, _themeService, _keybindingService, contextKeyService) {
            this._editor = _editor;
            this._acceptKeybindings = _acceptKeybindings;
            this._themeService = _themeService;
            this._keybindingService = _keybindingService;
            this._disposables = new lifecycle_1.DisposableStore();
            this.allowEditorOverflow = true;
            this._visibleContextKey = exports.CONTEXT_RENAME_INPUT_VISIBLE.bindTo(contextKeyService);
            this._editor.addContentWidget(this);
            this._disposables.add(this._editor.onDidChangeConfiguration(e => {
                if (e.hasChanged(50 /* EditorOption.fontInfo */)) {
                    this._updateFont();
                }
            }));
            this._disposables.add(_themeService.onDidColorThemeChange(this._updateStyles, this));
        }
        dispose() {
            this._disposables.dispose();
            this._editor.removeContentWidget(this);
        }
        getId() {
            return '__renameInputWidget';
        }
        getDomNode() {
            if (!this._domNode) {
                this._domNode = document.createElement('div');
                this._domNode.className = 'monaco-editor rename-box';
                this._input = document.createElement('input');
                this._input.className = 'rename-input';
                this._input.type = 'text';
                this._input.setAttribute('aria-label', (0, nls_1.localize)('renameAriaLabel', "Rename input. Type new name and press Enter to commit."));
                this._domNode.appendChild(this._input);
                this._label = document.createElement('div');
                this._label.className = 'rename-label';
                this._domNode.appendChild(this._label);
                this._updateFont();
                this._updateStyles(this._themeService.getColorTheme());
            }
            return this._domNode;
        }
        _updateStyles(theme) {
            if (!this._input || !this._domNode) {
                return;
            }
            const widgetShadowColor = theme.getColor(colorRegistry_1.widgetShadow);
            const widgetBorderColor = theme.getColor(colorRegistry_1.widgetBorder);
            this._domNode.style.backgroundColor = String(theme.getColor(colorRegistry_1.editorWidgetBackground) ?? '');
            this._domNode.style.boxShadow = widgetShadowColor ? ` 0 0 8px 2px ${widgetShadowColor}` : '';
            this._domNode.style.border = widgetBorderColor ? `1px solid ${widgetBorderColor}` : '';
            this._domNode.style.color = String(theme.getColor(colorRegistry_1.inputForeground) ?? '');
            this._input.style.backgroundColor = String(theme.getColor(colorRegistry_1.inputBackground) ?? '');
            // this._input.style.color = String(theme.getColor(inputForeground) ?? '');
            const border = theme.getColor(colorRegistry_1.inputBorder);
            this._input.style.borderWidth = border ? '1px' : '0px';
            this._input.style.borderStyle = border ? 'solid' : 'none';
            this._input.style.borderColor = border?.toString() ?? 'none';
        }
        _updateFont() {
            if (!this._input || !this._label) {
                return;
            }
            const fontInfo = this._editor.getOption(50 /* EditorOption.fontInfo */);
            this._input.style.fontFamily = fontInfo.fontFamily;
            this._input.style.fontWeight = fontInfo.fontWeight;
            this._input.style.fontSize = `${fontInfo.fontSize}px`;
            this._label.style.fontSize = `${fontInfo.fontSize * 0.8}px`;
        }
        getPosition() {
            if (!this._visible) {
                return null;
            }
            return {
                position: this._position,
                preference: [2 /* ContentWidgetPositionPreference.BELOW */, 1 /* ContentWidgetPositionPreference.ABOVE */]
            };
        }
        beforeRender() {
            const [accept, preview] = this._acceptKeybindings;
            this._label.innerText = (0, nls_1.localize)({ key: 'label', comment: ['placeholders are keybindings, e.g "F2 to Rename, Shift+F2 to Preview"'] }, "{0} to Rename, {1} to Preview", this._keybindingService.lookupKeybinding(accept)?.getLabel(), this._keybindingService.lookupKeybinding(preview)?.getLabel());
            return null;
        }
        afterRender(position) {
            if (!position) {
                // cancel rename when input widget isn't rendered anymore
                this.cancelInput(true);
            }
        }
        acceptInput(wantsPreview) {
            this._currentAcceptInput?.(wantsPreview);
        }
        cancelInput(focusEditor) {
            this._currentCancelInput?.(focusEditor);
        }
        getInput(where, value, selectionStart, selectionEnd, supportPreview, token) {
            this._domNode.classList.toggle('preview', supportPreview);
            this._position = new position_1.Position(where.startLineNumber, where.startColumn);
            this._input.value = value;
            this._input.setAttribute('selectionStart', selectionStart.toString());
            this._input.setAttribute('selectionEnd', selectionEnd.toString());
            this._input.size = Math.max((where.endColumn - where.startColumn) * 1.1, 20);
            const disposeOnDone = new lifecycle_1.DisposableStore();
            return new Promise(resolve => {
                this._currentCancelInput = (focusEditor) => {
                    this._currentAcceptInput = undefined;
                    this._currentCancelInput = undefined;
                    resolve(focusEditor);
                    return true;
                };
                this._currentAcceptInput = (wantsPreview) => {
                    if (this._input.value.trim().length === 0 || this._input.value === value) {
                        // empty or whitespace only or not changed
                        this.cancelInput(true);
                        return;
                    }
                    this._currentAcceptInput = undefined;
                    this._currentCancelInput = undefined;
                    resolve({
                        newName: this._input.value,
                        wantsPreview: supportPreview && wantsPreview
                    });
                };
                disposeOnDone.add(token.onCancellationRequested(() => this.cancelInput(true)));
                disposeOnDone.add(this._editor.onDidBlurEditorWidget(() => this.cancelInput(!this._domNode?.ownerDocument.hasFocus())));
                this._show();
            }).finally(() => {
                disposeOnDone.dispose();
                this._hide();
            });
        }
        _show() {
            this._editor.revealLineInCenterIfOutsideViewport(this._position.lineNumber, 0 /* ScrollType.Smooth */);
            this._visible = true;
            this._visibleContextKey.set(true);
            this._editor.layoutContentWidget(this);
            setTimeout(() => {
                this._input.focus();
                this._input.setSelectionRange(parseInt(this._input.getAttribute('selectionStart')), parseInt(this._input.getAttribute('selectionEnd')));
            }, 100);
        }
        _hide() {
            this._visible = false;
            this._visibleContextKey.reset();
            this._editor.layoutContentWidget(this);
        }
    };
    exports.RenameInputField = RenameInputField;
    exports.RenameInputField = RenameInputField = __decorate([
        __param(2, themeService_1.IThemeService),
        __param(3, keybinding_1.IKeybindingService),
        __param(4, contextkey_1.IContextKeyService)
    ], RenameInputField);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuYW1lSW5wdXRGaWVsZC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL3JlbmFtZS9icm93c2VyL3JlbmFtZUlucHV0RmllbGQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBaUJuRixRQUFBLDRCQUE0QixHQUFHLElBQUksMEJBQWEsQ0FBVSxvQkFBb0IsRUFBRSxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsb0JBQW9CLEVBQUUsNENBQTRDLENBQUMsQ0FBQyxDQUFDO0lBTzNLLElBQU0sZ0JBQWdCLEdBQXRCLE1BQU0sZ0JBQWdCO1FBWTVCLFlBQ2tCLE9BQW9CLEVBQ3BCLGtCQUFvQyxFQUN0QyxhQUE2QyxFQUN4QyxrQkFBdUQsRUFDdkQsaUJBQXFDO1lBSnhDLFlBQU8sR0FBUCxPQUFPLENBQWE7WUFDcEIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFrQjtZQUNyQixrQkFBYSxHQUFiLGFBQWEsQ0FBZTtZQUN2Qix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1lBUjNELGlCQUFZLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFFN0Msd0JBQW1CLEdBQVksSUFBSSxDQUFDO1lBUzVDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxvQ0FBNEIsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUVqRixJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXBDLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQy9ELElBQUksQ0FBQyxDQUFDLFVBQVUsZ0NBQXVCLEVBQUU7b0JBQ3hDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztpQkFDbkI7WUFDRixDQUFDLENBQUMs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