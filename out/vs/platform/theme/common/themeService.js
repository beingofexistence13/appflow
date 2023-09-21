/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation", "vs/platform/registry/common/platform", "vs/platform/theme/common/theme"], function (require, exports, codicons_1, event_1, lifecycle_1, instantiation_1, platform, theme_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Themable = exports.registerThemingParticipant = exports.Extensions = exports.getThemeTypeSelector = exports.FolderThemeIcon = exports.FileThemeIcon = exports.themeColorFromId = exports.IThemeService = void 0;
    exports.IThemeService = (0, instantiation_1.createDecorator)('themeService');
    function themeColorFromId(id) {
        return { id };
    }
    exports.themeColorFromId = themeColorFromId;
    exports.FileThemeIcon = codicons_1.Codicon.file;
    exports.FolderThemeIcon = codicons_1.Codicon.folder;
    function getThemeTypeSelector(type) {
        switch (type) {
            case theme_1.ColorScheme.DARK: return 'vs-dark';
            case theme_1.ColorScheme.HIGH_CONTRAST_DARK: return 'hc-black';
            case theme_1.ColorScheme.HIGH_CONTRAST_LIGHT: return 'hc-light';
            default: return 'vs';
        }
    }
    exports.getThemeTypeSelector = getThemeTypeSelector;
    // static theming participant
    exports.Extensions = {
        ThemingContribution: 'base.contributions.theming'
    };
    class ThemingRegistry {
        constructor() {
            this.themingParticipants = [];
            this.themingParticipants = [];
            this.onThemingParticipantAddedEmitter = new event_1.Emitter();
        }
        onColorThemeChange(participant) {
            this.themingParticipants.push(participant);
            this.onThemingParticipantAddedEmitter.fire(participant);
            return (0, lifecycle_1.toDisposable)(() => {
                const idx = this.themingParticipants.indexOf(participant);
                this.themingParticipants.splice(idx, 1);
            });
        }
        get onThemingParticipantAdded() {
            return this.onThemingParticipantAddedEmitter.event;
        }
        getThemingParticipants() {
            return this.themingParticipants;
        }
    }
    const themingRegistry = new ThemingRegistry();
    platform.Registry.add(exports.Extensions.ThemingContribution, themingRegistry);
    function registerThemingParticipant(participant) {
        return themingRegistry.onColorThemeChange(participant);
    }
    exports.registerThemingParticipant = registerThemingParticipant;
    /**
     * Utility base class for all themable components.
     */
    class Themable extends lifecycle_1.Disposable {
        constructor(themeService) {
            super();
            this.themeService = themeService;
            this.theme = themeService.getColorTheme();
            // Hook up to theme changes
            this._register(this.themeService.onDidColorThemeChange(theme => this.onThemeChange(theme)));
        }
        onThemeChange(theme) {
            this.theme = theme;
            this.updateStyles();
        }
        updateStyles() {
            // Subclasses to override
        }
        getColor(id, modify) {
            let color = this.theme.getColor(id);
            if (color && modify) {
                color = modify(color, this.theme);
            }
            return color ? color.toString() : null;
        }
    }
    exports.Themable = Themable;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhlbWVTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vdGhlbWUvY29tbW9uL3RoZW1lU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFhbkYsUUFBQSxhQUFhLEdBQUcsSUFBQSwrQkFBZSxFQUFnQixjQUFjLENBQUMsQ0FBQztJQUU1RSxTQUFnQixnQkFBZ0IsQ0FBQyxFQUFtQjtRQUNuRCxPQUFPLEVBQUUsRUFBRSxFQUFFLENBQUM7SUFDZixDQUFDO0lBRkQsNENBRUM7SUFFWSxRQUFBLGFBQWEsR0FBRyxrQkFBTyxDQUFDLElBQUksQ0FBQztJQUM3QixRQUFBLGVBQWUsR0FBRyxrQkFBTyxDQUFDLE1BQU0sQ0FBQztJQUU5QyxTQUFnQixvQkFBb0IsQ0FBQyxJQUFpQjtRQUNyRCxRQUFRLElBQUksRUFBRTtZQUNiLEtBQUssbUJBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLFNBQVMsQ0FBQztZQUN4QyxLQUFLLG1CQUFXLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxPQUFPLFVBQVUsQ0FBQztZQUN2RCxLQUFLLG1CQUFXLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxPQUFPLFVBQVUsQ0FBQztZQUN4RCxPQUFPLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQztTQUNyQjtJQUNGLENBQUM7SUFQRCxvREFPQztJQXVGRCw2QkFBNkI7SUFDaEIsUUFBQSxVQUFVLEdBQUc7UUFDekIsbUJBQW1CLEVBQUUsNEJBQTRCO0tBQ2pELENBQUM7SUFjRixNQUFNLGVBQWU7UUFJcEI7WUFIUSx3QkFBbUIsR0FBMEIsRUFBRSxDQUFDO1lBSXZELElBQUksQ0FBQyxtQkFBbUIsR0FBRyxFQUFFLENBQUM7WUFDOUIsSUFBSSxDQUFDLGdDQUFnQyxHQUFHLElBQUksZUFBTyxFQUF1QixDQUFDO1FBQzVFLENBQUM7UUFFTSxrQkFBa0IsQ0FBQyxXQUFnQztZQUN6RCxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQzNDLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDeEQsT0FBTyxJQUFBLHdCQUFZLEVBQUMsR0FBRyxFQUFFO2dCQUN4QixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUMxRCxJQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN6QyxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxJQUFXLHlCQUF5QjtZQUNuQyxPQUFPLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxLQUFLLENBQUM7UUFDcEQsQ0FBQztRQUVNLHNCQUFzQjtZQUM1QixPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQztRQUNqQyxDQUFDO0tBQ0Q7SUFFRCxNQUFNLGVBQWUsR0FBRyxJQUFJLGVBQWUsRUFBRSxDQUFDO0lBQzlDLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGtCQUFVLENBQUMsbUJBQW1CLEVBQUUsZUFBZSxDQUFDLENBQUM7SUFFdkUsU0FBZ0IsMEJBQTBCLENBQUMsV0FBZ0M7UUFDMUUsT0FBTyxlQUFlLENBQUMsa0JBQWtCLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDeEQsQ0FBQztJQUZELGdFQUVDO0lBRUQ7O09BRUc7SUFDSCxNQUFhLFFBQVMsU0FBUSxzQkFBVTtRQUd2QyxZQUNXLFlBQTJCO1lBRXJDLEtBQUssRUFBRSxDQUFDO1lBRkUsaUJBQVksR0FBWixZQUFZLENBQWU7WUFJckMsSUFBSSxDQUFDLEtBQUssR0FBRyxZQUFZLENBQUMsYUFBYSxFQUFFLENBQUM7WUFFMUMsMkJBQTJCO1lBQzNCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdGLENBQUM7UUFFUyxhQUFhLENBQUMsS0FBa0I7WUFDekMsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7WUFFbkIsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3JCLENBQUM7UUFFRCxZQUFZO1lBQ1gseUJBQXlCO1FBQzFCLENBQUM7UUFFUyxRQUFRLENBQUMsRUFBVSxFQUFFLE1BQW9EO1lBQ2xGLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBRXBDLElBQUksS0FBSyxJQUFJLE1BQU0sRUFBRTtnQkFDcEIsS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ2xDO1lBRUQsT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQ3hDLENBQUM7S0FDRDtJQWpDRCw0QkFpQ0MifQ==