/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/hash", "vs/base/common/uri", "vs/platform/theme/common/iconRegistry", "vs/platform/theme/common/theme", "vs/base/common/themables", "vs/workbench/contrib/terminal/common/terminal", "vs/workbench/contrib/terminal/common/terminalColorRegistry"], function (require, exports, hash_1, uri_1, iconRegistry_1, theme_1, themables_1, terminal_1, terminalColorRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Yib = exports.$Xib = exports.$Wib = exports.$Vib = exports.$Uib = exports.$Tib = void 0;
    function $Tib(terminalOrColorKey) {
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
    exports.$Tib = $Tib;
    function $Uib(colorTheme) {
        const standardColors = [];
        for (const colorKey in terminalColorRegistry_1.$Ifb) {
            const color = colorTheme.getColor(colorKey);
            if (color && !colorKey.toLowerCase().includes('bright')) {
                standardColors.push(colorKey);
            }
        }
        return standardColors;
    }
    exports.$Uib = $Uib;
    function $Vib(colorTheme) {
        const standardColors = $Uib(colorTheme);
        const styleElement = document.createElement('style');
        let css = '';
        for (const colorKey of standardColors) {
            const colorClass = $Tib(colorKey);
            const color = colorTheme.getColor(colorKey);
            if (color) {
                css += (`.monaco-workbench .${colorClass} .codicon:first-child:not(.codicon-split-horizontal):not(.codicon-trashcan):not(.file-icon)` +
                    `{ color: ${color} !important; }`);
            }
        }
        styleElement.textContent = css;
        return styleElement;
    }
    exports.$Vib = $Vib;
    function $Wib(colorTheme, editor) {
        const standardColors = $Uib(colorTheme);
        let css = '';
        for (const colorKey of standardColors) {
            const colorClass = $Tib(colorKey);
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
    exports.$Wib = $Wib;
    function $Xib(terminal, colorScheme, extensionContributed) {
        const icon = terminal.icon;
        if (!icon) {
            return undefined;
        }
        const iconClasses = [];
        let uri = undefined;
        if (extensionContributed) {
            if (typeof icon === 'string' && (icon.startsWith('$(') || (0, iconRegistry_1.$0u)().getIcon(icon))) {
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
            const uriIconKey = (0, hash_1.$pi)(uri.path).toString(36);
            const className = `terminal-uri-icon-${uriIconKey}`;
            iconClasses.push(className);
            iconClasses.push(`terminal-uri-icon`);
        }
        return iconClasses;
    }
    exports.$Xib = $Xib;
    function $Yib(accessor, terminal) {
        if (!terminal.icon || (terminal.icon instanceof Object && !('id' in terminal.icon))) {
            return accessor.get(terminal_1.$EM).getDefaultIcon().id;
        }
        return typeof terminal.icon === 'string' ? terminal.icon : terminal.icon.id;
    }
    exports.$Yib = $Yib;
});
//# sourceMappingURL=terminalIcon.js.map