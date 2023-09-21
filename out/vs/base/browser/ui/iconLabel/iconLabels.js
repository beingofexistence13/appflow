/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/themables"], function (require, exports, dom, themables_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.renderIcon = exports.renderLabelWithIcons = void 0;
    const labelWithIconsRegex = new RegExp(`(\\\\)?\\$\\((${themables_1.ThemeIcon.iconNameExpression}(?:${themables_1.ThemeIcon.iconModifierExpression})?)\\)`, 'g');
    function renderLabelWithIcons(text) {
        const elements = new Array();
        let match;
        let textStart = 0, textStop = 0;
        while ((match = labelWithIconsRegex.exec(text)) !== null) {
            textStop = match.index || 0;
            if (textStart < textStop) {
                elements.push(text.substring(textStart, textStop));
            }
            textStart = (match.index || 0) + match[0].length;
            const [, escaped, codicon] = match;
            elements.push(escaped ? `$(${codicon})` : renderIcon({ id: codicon }));
        }
        if (textStart < text.length) {
            elements.push(text.substring(textStart));
        }
        return elements;
    }
    exports.renderLabelWithIcons = renderLabelWithIcons;
    function renderIcon(icon) {
        const node = dom.$(`span`);
        node.classList.add(...themables_1.ThemeIcon.asClassNameArray(icon));
        return node;
    }
    exports.renderIcon = renderIcon;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWNvbkxhYmVscy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvYnJvd3Nlci91aS9pY29uTGFiZWwvaWNvbkxhYmVscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFLaEcsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLE1BQU0sQ0FBQyxpQkFBaUIscUJBQVMsQ0FBQyxrQkFBa0IsTUFBTSxxQkFBUyxDQUFDLHNCQUFzQixRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDekksU0FBZ0Isb0JBQW9CLENBQUMsSUFBWTtRQUNoRCxNQUFNLFFBQVEsR0FBRyxJQUFJLEtBQUssRUFBNEIsQ0FBQztRQUN2RCxJQUFJLEtBQTZCLENBQUM7UUFFbEMsSUFBSSxTQUFTLEdBQUcsQ0FBQyxFQUFFLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFDaEMsT0FBTyxDQUFDLEtBQUssR0FBRyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxJQUFJLEVBQUU7WUFDekQsUUFBUSxHQUFHLEtBQUssQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDO1lBQzVCLElBQUksU0FBUyxHQUFHLFFBQVEsRUFBRTtnQkFDekIsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO2FBQ25EO1lBQ0QsU0FBUyxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO1lBRWpELE1BQU0sQ0FBQyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxLQUFLLENBQUM7WUFDbkMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDdkU7UUFFRCxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQzVCLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1NBQ3pDO1FBQ0QsT0FBTyxRQUFRLENBQUM7SUFDakIsQ0FBQztJQXBCRCxvREFvQkM7SUFFRCxTQUFnQixVQUFVLENBQUMsSUFBZTtRQUN6QyxNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzNCLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcscUJBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3hELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUpELGdDQUlDIn0=