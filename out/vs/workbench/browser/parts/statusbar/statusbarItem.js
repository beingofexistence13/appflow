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
define(["require", "exports", "vs/base/common/errorMessage", "vs/base/common/lifecycle", "vs/base/browser/ui/iconLabel/simpleIconLabel", "vs/platform/commands/common/commands", "vs/platform/telemetry/common/telemetry", "vs/workbench/services/statusbar/browser/statusbar", "vs/platform/theme/common/themeService", "vs/editor/common/editorCommon", "vs/base/browser/dom", "vs/platform/notification/common/notification", "vs/base/common/types", "vs/base/browser/keyboardEvent", "vs/base/browser/ui/iconLabel/iconLabels", "vs/platform/theme/common/iconRegistry", "vs/base/browser/ui/iconLabel/iconLabelHover", "vs/base/common/htmlContent", "vs/base/browser/touch"], function (require, exports, errorMessage_1, lifecycle_1, simpleIconLabel_1, commands_1, telemetry_1, statusbar_1, themeService_1, editorCommon_1, dom_1, notification_1, types_1, keyboardEvent_1, iconLabels_1, iconRegistry_1, iconLabelHover_1, htmlContent_1, touch_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StatusbarEntryItem = void 0;
    let StatusbarEntryItem = class StatusbarEntryItem extends lifecycle_1.Disposable {
        get name() {
            return (0, types_1.assertIsDefined)(this.entry).name;
        }
        get hasCommand() {
            return typeof this.entry?.command !== 'undefined';
        }
        constructor(container, entry, hoverDelegate, commandService, notificationService, telemetryService, themeService) {
            super();
            this.container = container;
            this.hoverDelegate = hoverDelegate;
            this.commandService = commandService;
            this.notificationService = notificationService;
            this.telemetryService = telemetryService;
            this.themeService = themeService;
            this.entry = undefined;
            this.foregroundListener = this._register(new lifecycle_1.MutableDisposable());
            this.backgroundListener = this._register(new lifecycle_1.MutableDisposable());
            this.commandMouseListener = this._register(new lifecycle_1.MutableDisposable());
            this.commandTouchListener = this._register(new lifecycle_1.MutableDisposable());
            this.commandKeyboardListener = this._register(new lifecycle_1.MutableDisposable());
            this.hover = undefined;
            // Label Container
            this.labelContainer = document.createElement('a');
            this.labelContainer.tabIndex = -1; // allows screen readers to read title, but still prevents tab focus.
            this.labelContainer.setAttribute('role', 'button');
            this.labelContainer.className = 'statusbar-item-label';
            this._register(touch_1.Gesture.addTarget(this.labelContainer)); // enable touch
            // Label (with support for progress)
            this.label = new StatusBarCodiconLabel(this.labelContainer);
            this.container.appendChild(this.labelContainer);
            // Beak Container
            this.beakContainer = document.createElement('div');
            this.beakContainer.className = 'status-bar-item-beak-container';
            this.container.appendChild(this.beakContainer);
            this.update(entry);
        }
        update(entry) {
            // Update: Progress
            this.label.showProgress = entry.showProgress ?? false;
            // Update: Text
            if (!this.entry || entry.text !== this.entry.text) {
                this.label.text = entry.text;
                if (entry.text) {
                    (0, dom_1.show)(this.labelContainer);
                }
                else {
                    (0, dom_1.hide)(this.labelContainer);
                }
            }
            // Update: ARIA label
            //
            // Set the aria label on both elements so screen readers would read
            // the correct thing without duplication #96210
            if (!this.entry || entry.ariaLabel !== this.entry.ariaLabel) {
                this.container.setAttribute('aria-label', entry.ariaLabel);
                this.labelContainer.setAttribute('aria-label', entry.ariaLabel);
            }
            if (!this.entry || entry.role !== this.entry.role) {
                this.labelContainer.setAttribute('role', entry.role || 'button');
            }
            // Update: Hover
            if (!this.entry || !this.isEqualTooltip(this.entry, entry)) {
                const hoverContents = (0, htmlContent_1.isMarkdownString)(entry.tooltip) ? { markdown: entry.tooltip, markdownNotSupportedFallback: undefined } : entry.tooltip;
                if (this.hover) {
                    this.hover.update(hoverContents);
                }
                else {
                    this.hover = this._register((0, iconLabelHover_1.setupCustomHover)(this.hoverDelegate, this.container, hoverContents));
                }
            }
            // Update: Command
            if (!this.entry || entry.command !== this.entry.command) {
                this.commandMouseListener.clear();
                this.commandTouchListener.clear();
                this.commandKeyboardListener.clear();
                const command = entry.command;
                if (command && (command !== statusbar_1.ShowTooltipCommand || this.hover) /* "Show Hover" is only valid when we have a hover */) {
                    this.commandMouseListener.value = (0, dom_1.addDisposableListener)(this.labelContainer, dom_1.EventType.CLICK, () => this.executeCommand(command));
                    this.commandTouchListener.value = (0, dom_1.addDisposableListener)(this.labelContainer, touch_1.EventType.Tap, () => this.executeCommand(command));
                    this.commandKeyboardListener.value = (0, dom_1.addDisposableListener)(this.labelContainer, dom_1.EventType.KEY_DOWN, e => {
                        const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                        if (event.equals(10 /* KeyCode.Space */) || event.equals(3 /* KeyCode.Enter */)) {
                            dom_1.EventHelper.stop(e);
                            this.executeCommand(command);
                        }
                    });
                    this.labelContainer.classList.remove('disabled');
                }
                else {
                    this.labelContainer.classList.add('disabled');
                }
            }
            // Update: Beak
            if (!this.entry || entry.showBeak !== this.entry.showBeak) {
                if (entry.showBeak) {
                    this.container.classList.add('has-beak');
                }
                else {
                    this.container.classList.remove('has-beak');
                }
            }
            const hasBackgroundColor = !!entry.backgroundColor || (entry.kind && entry.kind !== 'standard');
            // Update: Kind
            if (!this.entry || entry.kind !== this.entry.kind) {
                for (const kind of statusbar_1.StatusbarEntryKinds) {
                    this.container.classList.remove(`${kind}-kind`);
                }
                if (entry.kind && entry.kind !== 'standard') {
                    this.container.classList.add(`${entry.kind}-kind`);
                }
                this.container.classList.toggle('has-background-color', hasBackgroundColor);
            }
            // Update: Foreground
            if (!this.entry || entry.color !== this.entry.color) {
                this.applyColor(this.labelContainer, entry.color);
            }
            // Update: Background
            if (!this.entry || entry.backgroundColor !== this.entry.backgroundColor) {
                this.container.classList.toggle('has-background-color', hasBackgroundColor);
                this.applyColor(this.container, entry.backgroundColor, true);
            }
            // Remember for next round
            this.entry = entry;
        }
        isEqualTooltip({ tooltip }, { tooltip: otherTooltip }) {
            if (tooltip === undefined) {
                return otherTooltip === undefined;
            }
            if ((0, htmlContent_1.isMarkdownString)(tooltip)) {
                return (0, htmlContent_1.isMarkdownString)(otherTooltip) && (0, htmlContent_1.markdownStringEqual)(tooltip, otherTooltip);
            }
            return tooltip === otherTooltip;
        }
        async executeCommand(command) {
            // Custom command from us: Show tooltip
            if (command === statusbar_1.ShowTooltipCommand) {
                this.hover?.show(true /* focus */);
            }
            // Any other command is going through command service
            else {
                const id = typeof command === 'string' ? command : command.id;
                const args = typeof command === 'string' ? [] : command.arguments ?? [];
                this.telemetryService.publicLog2('workbenchActionExecuted', { id, from: 'status bar' });
                try {
                    await this.commandService.executeCommand(id, ...args);
                }
                catch (error) {
                    this.notificationService.error((0, errorMessage_1.toErrorMessage)(error));
                }
            }
        }
        applyColor(container, color, isBackground) {
            let colorResult = undefined;
            if (isBackground) {
                this.backgroundListener.clear();
            }
            else {
                this.foregroundListener.clear();
            }
            if (color) {
                if ((0, editorCommon_1.isThemeColor)(color)) {
                    colorResult = this.themeService.getColorTheme().getColor(color.id)?.toString();
                    const listener = this.themeService.onDidColorThemeChange(theme => {
                        const colorValue = theme.getColor(color.id)?.toString();
                        if (isBackground) {
                            container.style.backgroundColor = colorValue ?? '';
                        }
                        else {
                            container.style.color = colorValue ?? '';
                        }
                    });
                    if (isBackground) {
                        this.backgroundListener.value = listener;
                    }
                    else {
                        this.foregroundListener.value = listener;
                    }
                }
                else {
                    colorResult = color;
                }
            }
            if (isBackground) {
                container.style.backgroundColor = colorResult ?? '';
            }
            else {
                container.style.color = colorResult ?? '';
            }
        }
    };
    exports.StatusbarEntryItem = StatusbarEntryItem;
    exports.StatusbarEntryItem = StatusbarEntryItem = __decorate([
        __param(3, commands_1.ICommandService),
        __param(4, notification_1.INotificationService),
        __param(5, telemetry_1.ITelemetryService),
        __param(6, themeService_1.IThemeService)
    ], StatusbarEntryItem);
    class StatusBarCodiconLabel extends simpleIconLabel_1.SimpleIconLabel {
        constructor(container) {
            super(container);
            this.container = container;
            this.progressCodicon = (0, iconLabels_1.renderIcon)(iconRegistry_1.syncing);
            this.currentText = '';
            this.currentShowProgress = false;
        }
        set showProgress(showProgress) {
            if (this.currentShowProgress !== showProgress) {
                this.currentShowProgress = showProgress;
                this.progressCodicon = (0, iconLabels_1.renderIcon)(showProgress === 'loading' ? iconRegistry_1.spinningLoading : iconRegistry_1.syncing);
                this.text = this.currentText;
            }
        }
        set text(text) {
            // Progress: insert progress codicon as first element as needed
            // but keep it stable so that the animation does not reset
            if (this.currentShowProgress) {
                // Append as needed
                if (this.container.firstChild !== this.progressCodicon) {
                    this.container.appendChild(this.progressCodicon);
                }
                // Remove others
                for (const node of Array.from(this.container.childNodes)) {
                    if (node !== this.progressCodicon) {
                        node.remove();
                    }
                }
                // If we have text to show, add a space to separate from progress
                let textContent = text ?? '';
                if (textContent) {
                    textContent = ` ${textContent}`;
                }
                // Append new elements
                (0, dom_1.append)(this.container, ...(0, iconLabels_1.renderLabelWithIcons)(textContent));
            }
            // No Progress: no special handling
            else {
                super.text = text;
            }
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdHVzYmFySXRlbS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL3BhcnRzL3N0YXR1c2Jhci9zdGF0dXNiYXJJdGVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXlCekYsSUFBTSxrQkFBa0IsR0FBeEIsTUFBTSxrQkFBbUIsU0FBUSxzQkFBVTtRQWtCakQsSUFBSSxJQUFJO1lBQ1AsT0FBTyxJQUFBLHVCQUFlLEVBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQztRQUN6QyxDQUFDO1FBRUQsSUFBSSxVQUFVO1lBQ2IsT0FBTyxPQUFPLElBQUksQ0FBQyxLQUFLLEVBQUUsT0FBTyxLQUFLLFdBQVcsQ0FBQztRQUNuRCxDQUFDO1FBRUQsWUFDUyxTQUFzQixFQUM5QixLQUFzQixFQUNMLGFBQTZCLEVBQzdCLGNBQWdELEVBQzNDLG1CQUEwRCxFQUM3RCxnQkFBb0QsRUFDeEQsWUFBNEM7WUFFM0QsS0FBSyxFQUFFLENBQUM7WUFSQSxjQUFTLEdBQVQsU0FBUyxDQUFhO1lBRWIsa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBQ1osbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBQzFCLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBc0I7WUFDNUMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtZQUN2QyxpQkFBWSxHQUFaLFlBQVksQ0FBZTtZQTdCcEQsVUFBSyxHQUFnQyxTQUFTLENBQUM7WUFFdEMsdUJBQWtCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLDZCQUFpQixFQUFFLENBQUMsQ0FBQztZQUM3RCx1QkFBa0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksNkJBQWlCLEVBQUUsQ0FBQyxDQUFDO1lBRTdELHlCQUFvQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFB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