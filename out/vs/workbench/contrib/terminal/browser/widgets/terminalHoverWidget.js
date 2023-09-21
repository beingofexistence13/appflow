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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/browser/ui/widget", "vs/base/browser/dom", "vs/workbench/services/hover/browser/hover", "vs/platform/configuration/common/configuration"], function (require, exports, lifecycle_1, widget_1, dom, hover_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalHover = void 0;
    const $ = dom.$;
    let TerminalHover = class TerminalHover extends lifecycle_1.Disposable {
        constructor(_targetOptions, _text, _actions, _linkHandler, _hoverService, _configurationService) {
            super();
            this._targetOptions = _targetOptions;
            this._text = _text;
            this._actions = _actions;
            this._linkHandler = _linkHandler;
            this._hoverService = _hoverService;
            this._configurationService = _configurationService;
            this.id = 'hover';
        }
        attach(container) {
            const showLinkHover = this._configurationService.getValue("terminal.integrated.showLinkHover" /* TerminalSettingId.ShowLinkHover */);
            if (!showLinkHover) {
                return;
            }
            const target = new CellHoverTarget(container, this._targetOptions);
            const hover = this._hoverService.showHover({
                target,
                content: this._text,
                actions: this._actions,
                linkHandler: this._linkHandler,
                // .xterm-hover lets xterm know that the hover is part of a link
                additionalClasses: ['xterm-hover']
            });
            if (hover) {
                this._register(hover);
            }
        }
    };
    exports.TerminalHover = TerminalHover;
    exports.TerminalHover = TerminalHover = __decorate([
        __param(4, hover_1.IHoverService),
        __param(5, configuration_1.IConfigurationService)
    ], TerminalHover);
    class CellHoverTarget extends widget_1.Widget {
        get targetElements() { return this._targetElements; }
        constructor(container, _options) {
            super();
            this._options = _options;
            this._targetElements = [];
            this._domNode = $('div.terminal-hover-targets.xterm-hover');
            const rowCount = this._options.viewportRange.end.y - this._options.viewportRange.start.y + 1;
            // Add top target row
            const width = (this._options.viewportRange.end.y > this._options.viewportRange.start.y ? this._options.terminalDimensions.width - this._options.viewportRange.start.x : this._options.viewportRange.end.x - this._options.viewportRange.start.x + 1) * this._options.cellDimensions.width;
            const topTarget = $('div.terminal-hover-target.hoverHighlight');
            topTarget.style.left = `${this._options.viewportRange.start.x * this._options.cellDimensions.width}px`;
            topTarget.style.bottom = `${(this._options.terminalDimensions.height - this._options.viewportRange.start.y - 1) * this._options.cellDimensions.height}px`;
            topTarget.style.width = `${width}px`;
            topTarget.style.height = `${this._options.cellDimensions.height}px`;
            this._targetElements.push(this._domNode.appendChild(topTarget));
            // Add middle target rows
            if (rowCount > 2) {
                const middleTarget = $('div.terminal-hover-target.hoverHighlight');
                middleTarget.style.left = `0px`;
                middleTarget.style.bottom = `${(this._options.terminalDimensions.height - this._options.viewportRange.start.y - 1 - (rowCount - 2)) * this._options.cellDimensions.height}px`;
                middleTarget.style.width = `${this._options.terminalDimensions.width * this._options.cellDimensions.width}px`;
                middleTarget.style.height = `${(rowCount - 2) * this._options.cellDimensions.height}px`;
                this._targetElements.push(this._domNode.appendChild(middleTarget));
            }
            // Add bottom target row
            if (rowCount > 1) {
                const bottomTarget = $('div.terminal-hover-target.hoverHighlight');
                bottomTarget.style.left = `0px`;
                bottomTarget.style.bottom = `${(this._options.terminalDimensions.height - this._options.viewportRange.end.y - 1) * this._options.cellDimensions.height}px`;
                bottomTarget.style.width = `${(this._options.viewportRange.end.x + 1) * this._options.cellDimensions.width}px`;
                bottomTarget.style.height = `${this._options.cellDimensions.height}px`;
                this._targetElements.push(this._domNode.appendChild(bottomTarget));
            }
            if (this._options.modifierDownCallback && this._options.modifierUpCallback) {
                let down = false;
                this._register(dom.addDisposableListener(document, 'keydown', e => {
                    if (e.ctrlKey && !down) {
                        down = true;
                        this._options.modifierDownCallback();
                    }
                }));
                this._register(dom.addDisposableListener(document, 'keyup', e => {
                    if (!e.ctrlKey) {
                        down = false;
                        this._options.modifierUpCallback();
                    }
                }));
            }
            container.appendChild(this._domNode);
            this._register((0, lifecycle_1.toDisposable)(() => this._domNode?.remove()));
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxIb3ZlcldpZGdldC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlcm1pbmFsL2Jyb3dzZXIvd2lkZ2V0cy90ZXJtaW5hbEhvdmVyV2lkZ2V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVloRyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBVVQsSUFBTSxhQUFhLEdBQW5CLE1BQU0sYUFBYyxTQUFRLHNCQUFVO1FBRzVDLFlBQ2tCLGNBQXVDLEVBQ3ZDLEtBQXNCLEVBQ3RCLFFBQW9DLEVBQ3BDLFlBQWtDLEVBQ3BDLGFBQTZDLEVBQ3JDLHFCQUE2RDtZQUVwRixLQUFLLEVBQUUsQ0FBQztZQVBTLG1CQUFjLEdBQWQsY0FBYyxDQUF5QjtZQUN2QyxVQUFLLEdBQUwsS0FBSyxDQUFpQjtZQUN0QixhQUFRLEdBQVIsUUFBUSxDQUE0QjtZQUNwQyxpQkFBWSxHQUFaLFlBQVksQ0FBc0I7WUFDbkIsa0JBQWEsR0FBYixhQUFhLENBQWU7WUFDcEIsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtZQVI1RSxPQUFFLEdBQUcsT0FBTyxDQUFDO1FBV3RCLENBQUM7UUFFRCxNQUFNLENBQUMsU0FBc0I7WUFDNUIsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFFBQVEsMkVBQWlDLENBQUM7WUFDM0YsSUFBSSxDQUFDLGFBQWEsRUFBRTtnQkFDbkIsT0FBTzthQUNQO1lBQ0QsTUFBTSxNQUFNLEdBQUcsSUFBSSxlQUFlLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUNuRSxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQztnQkFDMUMsTUFBTTtnQkFDTixPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUs7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