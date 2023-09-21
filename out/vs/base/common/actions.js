/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/nls"], function (require, exports, event_1, lifecycle_1, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toAction = exports.EmptySubmenuAction = exports.SubmenuAction = exports.Separator = exports.ActionRunner = exports.Action = void 0;
    class Action extends lifecycle_1.Disposable {
        constructor(id, label = '', cssClass = '', enabled = true, actionCallback) {
            super();
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this._enabled = true;
            this._id = id;
            this._label = label;
            this._cssClass = cssClass;
            this._enabled = enabled;
            this._actionCallback = actionCallback;
        }
        get id() {
            return this._id;
        }
        get label() {
            return this._label;
        }
        set label(value) {
            this._setLabel(value);
        }
        _setLabel(value) {
            if (this._label !== value) {
                this._label = value;
                this._onDidChange.fire({ label: value });
            }
        }
        get tooltip() {
            return this._tooltip || '';
        }
        set tooltip(value) {
            this._setTooltip(value);
        }
        _setTooltip(value) {
            if (this._tooltip !== value) {
                this._tooltip = value;
                this._onDidChange.fire({ tooltip: value });
            }
        }
        get class() {
            return this._cssClass;
        }
        set class(value) {
            this._setClass(value);
        }
        _setClass(value) {
            if (this._cssClass !== value) {
                this._cssClass = value;
                this._onDidChange.fire({ class: value });
            }
        }
        get enabled() {
            return this._enabled;
        }
        set enabled(value) {
            this._setEnabled(value);
        }
        _setEnabled(value) {
            if (this._enabled !== value) {
                this._enabled = value;
                this._onDidChange.fire({ enabled: value });
            }
        }
        get checked() {
            return this._checked;
        }
        set checked(value) {
            this._setChecked(value);
        }
        _setChecked(value) {
            if (this._checked !== value) {
                this._checked = value;
                this._onDidChange.fire({ checked: value });
            }
        }
        async run(event, data) {
            if (this._actionCallback) {
                await this._actionCallback(event);
            }
        }
    }
    exports.Action = Action;
    class ActionRunner extends lifecycle_1.Disposable {
        constructor() {
            super(...arguments);
            this._onWillRun = this._register(new event_1.Emitter());
            this.onWillRun = this._onWillRun.event;
            this._onDidRun = this._register(new event_1.Emitter());
            this.onDidRun = this._onDidRun.event;
        }
        async run(action, context) {
            if (!action.enabled) {
                return;
            }
            this._onWillRun.fire({ action });
            let error = undefined;
            try {
                await this.runAction(action, context);
            }
            catch (e) {
                error = e;
            }
            this._onDidRun.fire({ action, error });
        }
        async runAction(action, context) {
            await action.run(context);
        }
    }
    exports.ActionRunner = ActionRunner;
    class Separator {
        constructor() {
            this.id = Separator.ID;
            this.label = '';
            this.tooltip = '';
            this.class = 'separator';
            this.enabled = false;
            this.checked = false;
        }
        /**
         * Joins all non-empty lists of actions with separators.
         */
        static join(...actionLists) {
            let out = [];
            for (const list of actionLists) {
                if (!list.length) {
                    // skip
                }
                else if (out.length) {
                    out = [...out, new Separator(), ...list];
                }
                else {
                    out = list;
                }
            }
            return out;
        }
        static { this.ID = 'vs.actions.separator'; }
        async run() { }
    }
    exports.Separator = Separator;
    class SubmenuAction {
        get actions() { return this._actions; }
        constructor(id, label, actions, cssClass) {
            this.tooltip = '';
            this.enabled = true;
            this.checked = undefined;
            this.id = id;
            this.label = label;
            this.class = cssClass;
            this._actions = actions;
        }
        async run() { }
    }
    exports.SubmenuAction = SubmenuAction;
    class EmptySubmenuAction extends Action {
        static { this.ID = 'vs.actions.empty'; }
        constructor() {
            super(EmptySubmenuAction.ID, nls.localize('submenu.empty', '(empty)'), undefined, false);
        }
    }
    exports.EmptySubmenuAction = EmptySubmenuAction;
    function toAction(props) {
        return {
            id: props.id,
            label: props.label,
            class: undefined,
            enabled: props.enabled ?? true,
            checked: props.checked ?? false,
            run: async (...args) => props.run(),
            tooltip: props.label
        };
    }
    exports.toAction = toAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvY29tbW9uL2FjdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBbURoRyxNQUFhLE1BQU8sU0FBUSxzQkFBVTtRQWFyQyxZQUFZLEVBQVUsRUFBRSxRQUFnQixFQUFFLEVBQUUsV0FBbUIsRUFBRSxFQUFFLFVBQW1CLElBQUksRUFBRSxjQUE2QztZQUN4SSxLQUFLLEVBQUUsQ0FBQztZQVpDLGlCQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBc0IsQ0FBQyxDQUFDO1lBQ2xFLGdCQUFXLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUM7WUFNckMsYUFBUSxHQUFZLElBQUksQ0FBQztZQU1sQyxJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQztZQUNkLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1lBQ3BCLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO1lBQzFCLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO1lBQ3hCLElBQUksQ0FBQyxlQUFlLEdBQUcsY0FBYyxDQUFDO1FBQ3ZDLENBQUM7UUFFRCxJQUFJLEVBQUU7WUFDTCxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUM7UUFDakIsQ0FBQztRQUVELElBQUksS0FBSztZQUNSLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUNwQixDQUFDO1FBRUQsSUFBSSxLQUFLLENBQUMsS0FBYTtZQUN0QixJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3ZCLENBQUM7UUFFTyxTQUFTLENBQUMsS0FBYTtZQUM5QixJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssS0FBSyxFQUFFO2dCQUMxQixJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztnQkFD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