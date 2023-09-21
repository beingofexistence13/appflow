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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/async", "vs/base/common/date", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/contextview/browser/contextView", "vs/workbench/services/hover/browser/hover"], function (require, exports, dom, async_1, date_1, htmlContent_1, lifecycle_1, nls_1, configuration_1, contextView_1, hover_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.updateLayout = exports.TerminalDecorationHoverManager = exports.DecorationSelector = void 0;
    var DecorationStyles;
    (function (DecorationStyles) {
        DecorationStyles[DecorationStyles["DefaultDimension"] = 16] = "DefaultDimension";
        DecorationStyles[DecorationStyles["MarginLeft"] = -17] = "MarginLeft";
    })(DecorationStyles || (DecorationStyles = {}));
    var DecorationSelector;
    (function (DecorationSelector) {
        DecorationSelector["CommandDecoration"] = "terminal-command-decoration";
        DecorationSelector["Hide"] = "hide";
        DecorationSelector["ErrorColor"] = "error";
        DecorationSelector["DefaultColor"] = "default-color";
        DecorationSelector["Default"] = "default";
        DecorationSelector["Codicon"] = "codicon";
        DecorationSelector["XtermDecoration"] = "xterm-decoration";
        DecorationSelector["OverviewRuler"] = ".xterm-decoration-overview-ruler";
        DecorationSelector["QuickFix"] = "quick-fix";
    })(DecorationSelector || (exports.DecorationSelector = DecorationSelector = {}));
    let TerminalDecorationHoverManager = class TerminalDecorationHoverManager extends lifecycle_1.Disposable {
        constructor(_hoverService, configurationService, contextMenuService) {
            super();
            this._hoverService = _hoverService;
            this._contextMenuVisible = false;
            this._register(contextMenuService.onDidShowContextMenu(() => this._contextMenuVisible = true));
            this._register(contextMenuService.onDidHideContextMenu(() => this._contextMenuVisible = false));
            this._hoverDelayer = this._register(new async_1.Delayer(configurationService.getValue('workbench.hover.delay')));
        }
        hideHover() {
            this._hoverDelayer.cancel();
            this._hoverService.hideHover();
        }
        createHover(element, command, hoverMessage) {
            return (0, lifecycle_1.combinedDisposable)(dom.addDisposableListener(element, dom.EventType.MOUSE_ENTER, () => {
                if (this._contextMenuVisible) {
                    return;
                }
                this._hoverDelayer.trigger(() => {
                    let hoverContent = `${(0, nls_1.localize)('terminalPromptContextMenu', "Show Command Actions")}`;
                    hoverContent += '\n\n---\n\n';
                    if (!command) {
                        if (hoverMessage) {
                            hoverContent = hoverMessage;
                        }
                        else {
                            return;
                        }
                    }
                    else if (command.markProperties || hoverMessage) {
                        if (command.markProperties?.hoverMessage || hoverMessage) {
                            hoverContent = command.markProperties?.hoverMessage || hoverMessage || '';
                        }
                        else {
                            return;
                        }
                    }
                    else if (command.exitCode) {
                        if (command.exitCode === -1) {
                            hoverContent += (0, nls_1.localize)('terminalPromptCommandFailed', 'Command executed {0} and failed', (0, date_1.fromNow)(command.timestamp, true));
                        }
                        else {
                            hoverContent += (0, nls_1.localize)('terminalPromptCommandFailedWithExitCode', 'Command executed {0} and failed (Exit Code {1})', (0, date_1.fromNow)(command.timestamp, true), command.exitCode);
                        }
                    }
                    else {
                        hoverContent += (0, nls_1.localize)('terminalPromptCommandSuccess', 'Command executed {0}', (0, date_1.fromNow)(command.timestamp, true));
                    }
                    this._hoverService.showHover({ content: new htmlContent_1.MarkdownString(hoverContent), target: element });
                });
            }), dom.addDisposableListener(element, dom.EventType.MOUSE_LEAVE, () => this.hideHover()), dom.addDisposableListener(element, dom.EventType.MOUSE_OUT, () => this.hideHover()));
        }
    };
    exports.TerminalDecorationHoverManager = TerminalDecorationHoverManager;
    exports.TerminalDecorationHoverManager = TerminalDecorationHoverManager = __decorate([
        __param(0, hover_1.IHoverService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, contextView_1.IContextMenuService)
    ], TerminalDecorationHoverManager);
    function updateLayout(configurationService, element) {
        if (!element) {
            return;
        }
        const fontSize = configurationService.inspect("terminal.integrated.fontSize" /* TerminalSettingId.FontSize */).value;
        const defaultFontSize = configurationService.inspect("terminal.integrated.fontSize" /* TerminalSettingId.FontSize */).defaultValue;
        const lineHeight = configurationService.inspect("terminal.integrated.lineHeight" /* TerminalSettingId.LineHeight */).value;
        if (typeof fontSize === 'number' && typeof defaultFontSize === 'number' && typeof lineHeight === 'number') {
            const scalar = (fontSize / defaultFontSize) <= 1 ? (fontSize / defaultFontSize) : 1;
            // must be inlined to override the inlined styles from xterm
            element.style.width = `${scalar * 16 /* DecorationStyles.DefaultDimension */}px`;
            element.style.height = `${scalar * 16 /* DecorationStyles.DefaultDimension */ * lineHeight}px`;
            element.style.fontSize = `${scalar * 16 /* DecorationStyles.DefaultDimension */}px`;
            element.style.marginLeft = `${scalar * -17 /* DecorationStyles.MarginLeft */}px`;
        }
    }
    exports.updateLayout = updateLayout;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVjb3JhdGlvblN0eWxlcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlcm1pbmFsL2Jyb3dzZXIveHRlcm0vZGVjb3JhdGlvblN0eWxlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFjaEcsSUFBVyxnQkFHVjtJQUhELFdBQVcsZ0JBQWdCO1FBQzFCLGdGQUFxQixDQUFBO1FBQ3JCLHFFQUFnQixDQUFBO0lBQ2pCLENBQUMsRUFIVSxnQkFBZ0IsS0FBaEIsZ0JBQWdCLFFBRzFCO0lBRUQsSUFBa0Isa0JBVWpCO0lBVkQsV0FBa0Isa0JBQWtCO1FBQ25DLHVFQUFpRCxDQUFBO1FBQ2pELG1DQUFhLENBQUE7UUFDYiwwQ0FBb0IsQ0FBQTtRQUNwQixvREFBOEIsQ0FBQTtRQUM5Qix5Q0FBbUIsQ0FBQTtRQUNuQix5Q0FBbUIsQ0FBQTtRQUNuQiwwREFBb0MsQ0FBQTtRQUNwQyx3RUFBa0QsQ0FBQTtRQUNsRCw0Q0FBc0IsQ0FBQTtJQUN2QixDQUFDLEVBVmlCLGtCQUFrQixrQ0FBbEIsa0JBQWtCLFFBVW5DO0lBRU0sSUFBTSw4QkFBOEIsR0FBcEMsTUFBTSw4QkFBK0IsU0FBUSxzQkFBVTtRQUk3RCxZQUEyQixhQUE2QyxFQUNoRCxvQkFBMkMsRUFDN0Msa0JBQXVDO1lBQzVELEtBQUssRUFBRSxDQUFDO1lBSG1DLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1lBRmhFLHdCQUFtQixHQUFZLEtBQUssQ0FBQztZQU01QyxJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUFDLG9CQUFvQixDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQy9GLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUMsb0JBQW9CLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLG1CQUFtQixHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDaEcsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMxRyxDQUFDO1FBRU0sU0FBUztZQUNmLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDNUIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNoQyxDQUFDO1FBRUQsV0FBVyxDQUFDLE9BQW9CLEVBQUUsT0FBcUMsRUFBRSxZQUFxQjtZQUM3RixPQUFPLElBQUEsOEJBQWtCLEVBQ3hCLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsR0FBRyxFQUFFO2dCQUNsRSxJQUFJLElBQUksQ0FBQyxtQkFBbUIsRUFBRTtvQkFDN0IsT0FBTztpQkFDUDtnQkFDRCxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUU7b0JBQy9CLElBQUksWUFBWSxHQUFHLEdBQUcsSUFBQSxjQUFRLEVBQUMsMkJBQTJCLEVBQUUsc0JBQXNCLENBQUMsRUFBRSxDQUFDO29CQUN0RixZQUFZLElBQUksYUFBYSxDQUFDO29CQUM5QixJQUFJLENBQUMsT0FBTyxFQUFFO3dCQUNiLElBQUksWUFBWSxFQUFFOzRCQUNqQixZQUFZLEdBQUcsWUFBWSxDQUFDO3lCQUM1Qjs2QkFBTTs0QkFDTixPQUFPO3lCQUNQO3FCQUNEO3lCQUFNLElBQUksT0FBTyxDQUFDLGNBQWMsSUFBSSxZQUFZLEVBQUU7d0JBQ2xELElBQUksT0FBTyxDQUFDLGNBQWMsRUFBRSxZQUFZLElBQUksWUFBWSxFQUFFOzRCQUN6RCxZQUFZLEdBQUcsT0FBTyxDQUFDLGNBQWMsRUFBRSxZQUFZLElBQUksWUFBWSxJQUFJLEVBQUUsQ0FBQzt5QkFDMUU7NkJBQU07NEJBQ04sT0FBTzt5QkFDUDtxQkFDRDt5QkFBTSxJQUFJLE9BQU8sQ0FBQyxRQUFRLEVBQUU7d0JBQzVCLElBQUksT0FBTyxDQUFDLFFBQVEsS0FBSyxDQUFDLENBQUMsRUFBRTs0QkFDNUIsWUFBWSxJQUFJLElBQUEsY0FBUSxFQUFDLDZCQUE2QixFQUFFLGlDQUFpQyxFQUFFLElBQUEsY0FBTyxFQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQzt5QkFDN0g7NkJBQU07NEJBQ04sWUFBWSxJQUFJLElBQUEsY0FBUSxFQUFDLHlDQUF5QyxFQUFFLGlEQUFpRCxFQUFFLElBQUEsY0FBTyxFQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLEVBQUUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO3lCQUMzSztxQkFDRDt5QkFBTTt3QkFDTixZQUFZLElBQUksSUFBQSxjQUFRLEVBQUMsOEJBQThCLEVBQUUsc0JBQXNCLEVBQUUsSUFBQSxjQUFPLEVBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO3FCQUNuSDtvQkFDRCxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFJLDRCQUFjLENBQUMsWUFBWSxDQUFDLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7Z0JBQzlGLENBQUMsQ0FBQyxDQUFDO1lBQ0osQ0FBQyxDQUFDLEVBQ0YsR0FBRyxDQUFDLHFCQUFxQixDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsRUFDckYsR0FBRyxDQUFDLHFCQUFxQixDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FDbkYsQ0FBQztRQUNILENBQUM7S0FFRCxDQUFBO0lBeERZLHdFQUE4Qjs2Q0FBOUIsOEJBQThCO1FBSTdCLFdBQUEscUJBQWEsQ0FBQTtRQUN4QixXQUFBLHFDQUFxQixDQUFBO1FBQ3JCLFdBQUEsaUNBQW1CLENBQUE7T0FOVCw4QkFBOEIsQ0F3RDFDO0lBRUQsU0FBZ0IsWUFBWSxDQUFDLG9CQUEyQyxFQUFFLE9BQXFCO1FBQzlGLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDYixPQUFPO1NBQ1A7UUFDRCxNQUFNLFFBQVEsR0FBRyxvQkFBb0IsQ0FBQyxPQUFPLGlFQUE0QixDQUFDLEtBQUssQ0FBQztRQUNoRixNQUFNLGVBQWUsR0FBRyxvQkFBb0IsQ0FBQyxPQUFPLGlFQUE0QixDQUFDLFlBQVksQ0FBQztRQUM5RixNQUFNLFVBQVUsR0FBRyxvQkFBb0IsQ0FBQyxPQUFPLHFFQUE4QixDQUFDLEtBQUssQ0FBQztRQUNwRixJQUFJLE9BQU8sUUFBUSxLQUFLLFFBQVEsSUFBSSxPQUFPLGVBQWUsS0FBSyxRQUFRLElBQUksT0FBTyxVQUFVLEtBQUssUUFBUSxFQUFFO1lBQzFHLE1BQU0sTUFBTSxHQUFHLENBQUMsUUFBUSxHQUFHLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEdBQUcsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwRiw0REFBNEQ7WUFDNUQsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsR0FBRyxNQUFNLDZDQUFvQyxJQUFJLENBQUM7WUFDeEUsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsR0FBRyxNQUFNLDZDQUFvQyxHQUFHLFVBQVUsSUFBSSxDQUFDO1lBQ3RGLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLEdBQUcsTUFBTSw2Q0FBb0MsSUFBSSxDQUFDO1lBQzNFLE9BQU8sQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLEdBQUcsTUFBTSx3Q0FBOEIsSUFBSSxDQUFDO1NBQ3ZFO0lBQ0YsQ0FBQztJQWZELG9DQWVDIn0=