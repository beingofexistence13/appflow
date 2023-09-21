/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/hash", "vs/base/common/uri", "vs/platform/theme/common/iconRegistry", "vs/platform/theme/common/theme", "vs/base/common/themables", "vs/workbench/contrib/terminal/common/terminal", "vs/workbench/contrib/terminal/common/terminalColorRegistry"], function (require, exports, hash_1, uri_1, iconRegistry_1, theme_1, themables_1, terminal_1, terminalColorRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getIconId = exports.getUriClasses = exports.getColorStyleContent = exports.getColorStyleElement = exports.getStandardColors = exports.getColorClass = void 0;
    function getColorClass(terminalOrColorKey) {
        let color = undefined;
        if (typeof terminalOrColorKey === 'string') {
            color = terminalOrColorKey;
        }
        else if (terminalOrColorKey.color) {
            color = terminalOrColorKey.color.replace(/\./g, '_');
        }
        else if (themables_1.ThemeIcon.isThemeIcon(terminalOrColorKey.icon) && terminalOrColorKey.icon.color) {
            color = terminalOrColorKey.icon.color.id.replace(/\./g, '_');
        }
        if (color) {
            return `terminal-icon-${color.replace(/\./g, '_')}`;
        }
        return undefined;
    }
    exports.getColorClass = getColorClass;
    function getStandardColors(colorTheme) {
        const standardColors = [];
        for (const colorKey in terminalColorRegistry_1.ansiColorMap) {
            const color = colorTheme.getColor(colorKey);
            if (color && !colorKey.toLowerCase().includes('bright')) {
                standardColors.push(colorKey);
            }
        }
        return standardColors;
    }
    exports.getStandardColors = getStandardColors;
    function getColorStyleElement(colorTheme) {
        const standardColors = getStandardColors(colorTheme);
        const styleElement = document.createElement('style');
        let css = '';
        for (const colorKey of standardColors) {
            const colorClass = getColorClass(colorKey);
            const color = colorTheme.getColor(colorKey);
            if (color) {
                css += (`.monaco-workbench .${colorClass} .codicon:first-child:not(.codicon-split-horizontal):not(.codicon-trashcan):not(.file-icon)` +
                    `{ color: ${color} !important; }`);
            }
        }
        styleElement.textContent = css;
        return styleElement;
    }
    exports.getColorStyleElement = getColorStyleElement;
    function getColorStyleContent(colorTheme, editor) {
        const standardColors = getStandardColors(colorTheme);
        let css = '';
        for (const colorKey of standardColors) {
            const colorClass = getColorClass(colorKey);
            const color = colorTheme.getColor(colorKey);
            if (color) {
                if (editor) {
                    css += (`.monaco-workbench .show-file-icons .file-icon.terminal-tab.${colorClass}::before` +
                        `{ color: ${color} !important; }`);
                }
                else {
                    css += (`.monaco-workbench .${colorClass} .codicon:first-child:not(.codicon-split-horizontal):not(.codicon-trashcan):not(.file-icon)` +
                        `{ color: ${color} !important; }`);
                }
            }
        }
        return css;
    }
    exports.getColorStyleContent = getColorStyleContent;
    function getUriClasses(terminal, colorScheme, extensionContributed) {
        const icon = terminal.icon;
        if (!icon) {
            return undefined;
        }
        const iconClasses = [];
        let uri = undefined;
        if (extensionContributed) {
            if (typeof icon === 'string' && (icon.startsWith('$(') || (0, iconRegistry_1.getIconRegistry)().getIcon(icon))) {
                return iconClasses;
            }
            else if (typeof icon === 'string') {
                uri = uri_1.URI.parse(icon);
            }
        }
        if (icon instanceof uri_1.URI) {
            uri = icon;
        }
        else if (icon instanceof Object && 'light' in icon && 'dark' in icon) {
            uri = colorScheme === theme_1.ColorScheme.LIGHT ? icon.light : icon.dark;
        }
        if (uri instanceof uri_1.URI) {
            const uriIconKey = (0, hash_1.hash)(uri.path).toString(36);
            const className = `terminal-uri-icon-${uriIconKey}`;
            iconClasses.push(className);
            iconClasses.push(`terminal-uri-icon`);
        }
        return iconClasses;
    }
    exports.getUriClasses = getUriClasses;
    function getIconId(accessor, terminal) {
        if (!terminal.icon || (terminal.icon instanceof Object && !('id' in terminal.icon))) {
            return accessor.get(terminal_1.ITerminalProfileResolverService).getDefaultIcon().id;
        }
        return typeof terminal.icon === 'string' ? terminal.icon : terminal.icon.id;
    }
    exports.getIconId = getIconId;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxJY29uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVybWluYWwvYnJvd3Nlci90ZXJtaW5hbEljb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBbUJoRyxTQUFnQixhQUFhLENBQUMsa0JBQTZGO1FBQzFILElBQUksS0FBSyxHQUFHLFNBQVMsQ0FBQztRQUN0QixJQUFJLE9BQU8sa0JBQWtCLEtBQUssUUFBUSxFQUFFO1lBQzNDLEtBQUssR0FBRyxrQkFBa0IsQ0FBQztTQUMzQjthQUFNLElBQUksa0JBQWtCLENBQUMsS0FBSyxFQUFFO1lBQ3BDLEtBQUssR0FBRyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztTQUNyRDthQUFNLElBQUkscUJBQVMsQ0FBQyxXQUFXLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksa0JBQWtCLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRTtZQUMzRixLQUFLLEdBQUcsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztTQUM3RDtRQUNELElBQUksS0FBSyxFQUFFO1lBQ1YsT0FBTyxpQkFBaUIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQztTQUNwRDtRQUNELE9BQU8sU0FBUyxDQUFDO0lBQ2xCLENBQUM7SUFiRCxzQ0FhQztJQUVELFNBQWdCLGlCQUFpQixDQUFDLFVBQXVCO1FBQ3hELE1BQU0sY0FBYyxHQUFhLEVBQUUsQ0FBQztRQUVwQyxLQUFLLE1BQU0sUUFBUSxJQUFJLG9DQUFZLEVBQUU7WUFDcEMsTUFBTSxLQUFLLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyxR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