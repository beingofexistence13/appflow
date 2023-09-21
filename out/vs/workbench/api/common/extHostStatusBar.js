/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "./extHostTypes", "./extHost.protocol", "vs/nls", "vs/base/common/lifecycle", "vs/workbench/api/common/extHostTypeConverters", "vs/base/common/types"], function (require, exports, extHostTypes_1, extHost_protocol_1, nls_1, lifecycle_1, extHostTypeConverters_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostStatusBar = exports.ExtHostStatusBarEntry = void 0;
    class ExtHostStatusBarEntry {
        static { this.ID_GEN = 0; }
        static { this.ALLOWED_BACKGROUND_COLORS = new Map([
            ['statusBarItem.errorBackground', new extHostTypes_1.ThemeColor('statusBarItem.errorForeground')],
            ['statusBarItem.warningBackground', new extHostTypes_1.ThemeColor('statusBarItem.warningForeground')]
        ]); }
        #proxy;
        #commands;
        constructor(proxy, commands, staticItems, extension, id, alignment = extHostTypes_1.StatusBarAlignment.Left, priority) {
            this._disposed = false;
            this._text = '';
            this._staleCommandRegistrations = new lifecycle_1.DisposableStore();
            this.#proxy = proxy;
            this.#commands = commands;
            if (id && extension) {
                this._entryId = (0, extHostTypes_1.asStatusBarItemIdentifier)(extension.identifier, id);
                // if new item already exists mark it as visible and copy properties
                // this can only happen when an item was contributed by an extension
                const item = staticItems.get(this._entryId);
                if (item) {
                    alignment = item.alignLeft ? extHostTypes_1.StatusBarAlignment.Left : extHostTypes_1.StatusBarAlignment.Right;
                    priority = item.priority;
                    this._visible = true;
                    this.name = item.name;
                    this.text = item.text;
                    this.tooltip = item.tooltip;
                    this.command = item.command;
                    this.accessibilityInformation = item.accessibilityInformation;
                }
            }
            else {
                this._entryId = String(ExtHostStatusBarEntry.ID_GEN++);
            }
            this._extension = extension;
            this._id = id;
            this._alignment = alignment;
            this._priority = this.validatePriority(priority);
        }
        validatePriority(priority) {
            if (!(0, types_1.isNumber)(priority)) {
                return undefined; // using this method to catch `NaN` too!
            }
            // Our RPC mechanism use JSON to serialize data which does
            // not support `Infinity` so we need to fill in the number
            // equivalent as close as possible.
            // https://github.com/microsoft/vscode/issues/133317
            if (priority === Number.POSITIVE_INFINITY) {
                return Number.MAX_VALUE;
            }
            if (priority === Number.NEGATIVE_INFINITY) {
                return -Number.MAX_VALUE;
            }
            return priority;
        }
        get id() {
            return this._id ?? this._extension.identifier.value;
        }
        get alignment() {
            return this._alignment;
        }
        get priority() {
            return this._priority;
        }
        get text() {
            return this._text;
        }
        get name() {
            return this._name;
        }
        get tooltip() {
            return this._tooltip;
        }
        get color() {
            return this._color;
        }
        get backgroundColor() {
            return this._backgroundColor;
        }
        get command() {
            return this._command?.fromApi;
        }
        get accessibilityInformation() {
            return this._accessibilityInformation;
        }
        set text(text) {
            this._text = text;
            this.update();
        }
        set name(name) {
            this._name = name;
            this.update();
        }
        set tooltip(tooltip) {
            this._tooltip = tooltip;
            this.update();
        }
        set color(color) {
            this._color = color;
            this.update();
        }
        set backgroundColor(color) {
            if (color && !ExtHostStatusBarEntry.ALLOWED_BACKGROUND_COLORS.has(color.id)) {
                color = undefined;
            }
            this._backgroundColor = color;
            this.update();
        }
        set command(command) {
            if (this._command?.fromApi === command) {
                return;
            }
            if (this._latestCommandRegistration) {
                this._staleCommandRegistrations.add(this._latestCommandRegistration);
            }
            this._latestCommandRegistration = new lifecycle_1.DisposableStore();
            if (typeof command === 'string') {
                this._command = {
                    fromApi: command,
                    internal: this.#commands.toInternal({ title: '', command }, this._latestCommandRegistration),
                };
            }
            else if (command) {
                this._command = {
                    fromApi: command,
                    internal: this.#commands.toInternal(command, this._latestCommandRegistration),
                };
            }
            else {
                this._command = undefined;
            }
            this.update();
        }
        set accessibilityInformation(accessibilityInformation) {
            this._accessibilityInformation = accessibilityInformation;
            this.update();
        }
        show() {
            this._visible = true;
            this.update();
        }
        hide() {
            clearTimeout(this._timeoutHandle);
            this._visible = false;
            this.#proxy.$disposeEntry(this._entryId);
        }
        update() {
            if (this._disposed || !this._visible) {
                return;
            }
            clearTimeout(this._timeoutHandle);
            // Defer the update so that multiple changes to setters dont cause a redraw each
            this._timeoutHandle = setTimeout(() => {
                this._timeoutHandle = undefined;
                // If the id is not set, derive it from the extension identifier,
                // otherwise make sure to prefix it with the extension identifier
                // to get a more unique value across extensions.
                let id;
                if (this._extension) {
                    if (this._id) {
                        id = `${this._extension.identifier.value}.${this._id}`;
                    }
                    else {
                        id = this._extension.identifier.value;
                    }
                }
                else {
                    id = this._id;
                }
                // If the name is not set, derive it from the extension descriptor
                let name;
                if (this._name) {
                    name = this._name;
                }
                else {
                    name = (0, nls_1.localize)('extensionLabel', "{0} (Extension)", this._extension.displayName || this._extension.name);
                }
                // If a background color is set, the foreground is determined
                let color = this._color;
                if (this._backgroundColor) {
                    color = ExtHostStatusBarEntry.ALLOWED_BACKGROUND_COLORS.get(this._backgroundColor.id);
                }
                const tooltip = extHostTypeConverters_1.MarkdownString.fromStrict(this._tooltip);
                // Set to status bar
                this.#proxy.$setEntry(this._entryId, id, this._extension?.identifier.value, name, this._text, tooltip, this._command?.internal, color, this._backgroundColor, this._alignment === extHostTypes_1.StatusBarAlignment.Left, this._priority, this._accessibilityInformation);
                // clean-up state commands _after_ updating the UI
                this._staleCommandRegistrations.clear();
            }, 0);
        }
        dispose() {
            this.hide();
            this._disposed = true;
        }
    }
    exports.ExtHostStatusBarEntry = ExtHostStatusBarEntry;
    class StatusBarMessage {
        constructor(statusBar) {
            this._messages = [];
            this._item = statusBar.createStatusBarEntry(undefined, 'status.extensionMessage', extHostTypes_1.StatusBarAlignment.Left, Number.MIN_VALUE);
            this._item.name = (0, nls_1.localize)('status.extensionMessage', "Extension Status");
        }
        dispose() {
            this._messages.length = 0;
            this._item.dispose();
        }
        setMessage(message) {
            const data = { message }; // use object to not confuse equal strings
            this._messages.unshift(data);
            this._update();
            return new extHostTypes_1.Disposable(() => {
                const idx = this._messages.indexOf(data);
                if (idx >= 0) {
                    this._messages.splice(idx, 1);
                    this._update();
                }
            });
        }
        _update() {
            if (this._messages.length > 0) {
                this._item.text = this._messages[0].message;
                this._item.show();
            }
            else {
                this._item.hide();
            }
        }
    }
    class ExtHostStatusBar {
        constructor(mainContext, commands) {
            this._existingItems = new Map();
            this._proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadStatusBar);
            this._commands = commands;
            this._statusMessage = new StatusBarMessage(this);
        }
        $acceptStaticEntries(added) {
            for (const item of added) {
                this._existingItems.set(item.entryId, item);
            }
        }
        createStatusBarEntry(extension, id, alignment, priority) {
            return new ExtHostStatusBarEntry(this._proxy, this._commands, this._existingItems, extension, id, alignment, priority);
        }
        setStatusBarMessage(text, timeoutOrThenable) {
            const d = this._statusMessage.setMessage(text);
            let handle;
            if (typeof timeoutOrThenable === 'number') {
                handle = setTimeout(() => d.dispose(), timeoutOrThenable);
            }
            else if (typeof timeoutOrThenable !== 'undefined') {
                timeoutOrThenable.then(() => d.dispose(), () => d.dispose());
            }
            return new extHostTypes_1.Disposable(() => {
                d.dispose();
                clearTimeout(handle);
            });
        }
    }
    exports.ExtHostStatusBar = ExtHostStatusBar;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFN0YXR1c0Jhci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvY29tbW9uL2V4dEhvc3RTdGF0dXNCYXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBZWhHLE1BQWEscUJBQXFCO2lCQUVsQixXQUFNLEdBQUcsQ0FBQyxBQUFKLENBQUs7aUJBRVgsOEJBQXlCLEdBQUcsSUFBSSxHQUFHLENBQ2pEO1lBQ0MsQ0FBQywrQkFBK0IsRUFBRSxJQUFJLHlCQUFVLENBQUMsK0JBQStCLENBQUMsQ0FBQztZQUNsRixDQUFDLGlDQUFpQyxFQUFFLElBQUkseUJBQVUsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO1NBQ3RGLENBQ0QsQUFMdUMsQ0FLdEM7UUFFRixNQUFNLENBQTJCO1FBQ2pDLFNBQVMsQ0FBb0I7UUE4QjdCLFlBQVksS0FBK0IsRUFBRSxRQUEyQixFQUFFLFdBQWtELEVBQUUsU0FBaUMsRUFBRSxFQUFXLEVBQUUsWUFBdUMsaUNBQXlCLENBQUMsSUFBSSxFQUFFLFFBQWlCO1lBcEI5UCxjQUFTLEdBQVksS0FBSyxDQUFDO1lBRzNCLFVBQUssR0FBVyxFQUFFLENBQUM7WUFNViwrQkFBMEIsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQVluRSxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztZQUNwQixJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztZQUUxQixJQUFJLEVBQUUsSUFBSSxTQUFTLEVBQUU7Z0JBQ3BCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBQSx3Q0FBeUIsRUFBQyxTQUFTLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUNwRSxvRUFBb0U7Z0JBQ3BFLG9FQUFvRTtnQkFDcEUsTUFBTSxJQUFJLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFD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