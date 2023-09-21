/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons"], function (require, exports, codicons_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ThemeIcon = exports.themeColorFromId = exports.ThemeColor = void 0;
    var ThemeColor;
    (function (ThemeColor) {
        function isThemeColor(obj) {
            return obj && typeof obj === 'object' && typeof obj.id === 'string';
        }
        ThemeColor.isThemeColor = isThemeColor;
    })(ThemeColor || (exports.ThemeColor = ThemeColor = {}));
    function themeColorFromId(id) {
        return { id };
    }
    exports.themeColorFromId = themeColorFromId;
    var ThemeIcon;
    (function (ThemeIcon) {
        ThemeIcon.iconNameSegment = '[A-Za-z0-9]+';
        ThemeIcon.iconNameExpression = '[A-Za-z0-9-]+';
        ThemeIcon.iconModifierExpression = '~[A-Za-z]+';
        ThemeIcon.iconNameCharacter = '[A-Za-z0-9~-]';
        const ThemeIconIdRegex = new RegExp(`^(${ThemeIcon.iconNameExpression})(${ThemeIcon.iconModifierExpression})?$`);
        function asClassNameArray(icon) {
            const match = ThemeIconIdRegex.exec(icon.id);
            if (!match) {
                return asClassNameArray(codicons_1.Codicon.error);
            }
            const [, id, modifier] = match;
            const classNames = ['codicon', 'codicon-' + id];
            if (modifier) {
                classNames.push('codicon-modifier-' + modifier.substring(1));
            }
            return classNames;
        }
        ThemeIcon.asClassNameArray = asClassNameArray;
        function asClassName(icon) {
            return asClassNameArray(icon).join(' ');
        }
        ThemeIcon.asClassName = asClassName;
        function asCSSSelector(icon) {
            return '.' + asClassNameArray(icon).join('.');
        }
        ThemeIcon.asCSSSelector = asCSSSelector;
        function isThemeIcon(obj) {
            return obj && typeof obj === 'object' && typeof obj.id === 'string' && (typeof obj.color === 'undefined' || ThemeColor.isThemeColor(obj.color));
        }
        ThemeIcon.isThemeIcon = isThemeIcon;
        const _regexFromString = new RegExp(`^\\$\\((${ThemeIcon.iconNameExpression}(?:${ThemeIcon.iconModifierExpression})?)\\)$`);
        function fromString(str) {
            const match = _regexFromString.exec(str);
            if (!match) {
                return undefined;
            }
            const [, name] = match;
            return { id: name };
        }
        ThemeIcon.fromString = fromString;
        function fromId(id) {
            return { id };
        }
        ThemeIcon.fromId = fromId;
        function modify(icon, modifier) {
            let id = icon.id;
            const tildeIndex = id.lastIndexOf('~');
            if (tildeIndex !== -1) {
                id = id.substring(0, tildeIndex);
            }
            if (modifier) {
                id = `${id}~${modifier}`;
            }
            return { id };
        }
        ThemeIcon.modify = modify;
        function getModifier(icon) {
            const tildeIndex = icon.id.lastIndexOf('~');
            if (tildeIndex !== -1) {
                return icon.id.substring(tildeIndex + 1);
            }
            return undefined;
        }
        ThemeIcon.getModifier = getModifier;
        function isEqual(ti1, ti2) {
            return ti1.id === ti2.id && ti1.color?.id === ti2.color?.id;
        }
        ThemeIcon.isEqual = isEqual;
    })(ThemeIcon || (exports.ThemeIcon = ThemeIcon = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhlbWFibGVzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9jb21tb24vdGhlbWFibGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVloRyxJQUFpQixVQUFVLENBSTFCO0lBSkQsV0FBaUIsVUFBVTtRQUMxQixTQUFnQixZQUFZLENBQUMsR0FBUTtZQUNwQyxPQUFPLEdBQUcsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLElBQUksT0FBb0IsR0FBSSxDQUFDLEVBQUUsS0FBSyxRQUFRLENBQUM7UUFDbkYsQ0FBQztRQUZlLHVCQUFZLGVBRTNCLENBQUE7SUFDRixDQUFDLEVBSmdCLFVBQVUsMEJBQVYsVUFBVSxRQUkxQjtJQUVELFNBQWdCLGdCQUFnQixDQUFDLEVBQW1CO1FBQ25ELE9BQU8sRUFBRSxFQUFFLEVBQUUsQ0FBQztJQUNmLENBQUM7SUFGRCw0Q0FFQztJQVFELElBQWlCLFNBQVMsQ0F3RXpCO0lBeEVELFdBQWlCLFNBQVM7UUFDWix5QkFBZSxHQUFHLGNBQWMsQ0FBQztRQUNqQyw0QkFBa0IsR0FBRyxlQUFlLENBQUM7UUFDckMsZ0NBQXNCLEdBQUcsWUFBWSxDQUFDO1FBQ3RDLDJCQUFpQixHQUFHLGVBQWUsQ0FBQztRQUVqRCxNQUFNLGdCQUFnQixHQUFHLElBQUksTUFBTSxDQUFDLEtBQUssVUFBQSxrQkFBa0IsS0FBSyxVQUFBLHNCQUFzQixLQUFLLENBQUMsQ0FBQztRQUU3RixTQUFnQixnQkFBZ0IsQ0FBQyxJQUFlO1lBQy9DLE1BQU0sS0FBSyxHQUFHLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDN0MsSUFBSSxDQUFDLEtBQUssRUFBRTtnQkFDWCxPQUFPLGdCQUFnQixDQUFDLGtCQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDdkM7WUFDRCxNQUFNLENBQUMsRUFBRSxF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