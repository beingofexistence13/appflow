/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/event", "vs/base/common/event", "vs/base/browser/keyboardEvent", "vs/base/browser/touch", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/common/idGenerator", "vs/base/common/linkedText", "vs/nls", "vs/css!./media/quickInput"], function (require, exports, dom, event_1, event_2, keyboardEvent_1, touch_1, iconLabels_1, idGenerator_1, linkedText_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.renderQuickInputDescription = exports.getIconClass = void 0;
    const iconPathToClass = {};
    const iconClassGenerator = new idGenerator_1.IdGenerator('quick-input-button-icon-');
    function getIconClass(iconPath) {
        if (!iconPath) {
            return undefined;
        }
        let iconClass;
        const key = iconPath.dark.toString();
        if (iconPathToClass[key]) {
            iconClass = iconPathToClass[key];
        }
        else {
            iconClass = iconClassGenerator.nextId();
            dom.createCSSRule(`.${iconClass}, .hc-light .${iconClass}`, `background-image: ${dom.asCSSUrl(iconPath.light || iconPath.dark)}`);
            dom.createCSSRule(`.vs-dark .${iconClass}, .hc-black .${iconClass}`, `background-image: ${dom.asCSSUrl(iconPath.dark)}`);
            iconPathToClass[key] = iconClass;
        }
        return iconClass;
    }
    exports.getIconClass = getIconClass;
    function renderQuickInputDescription(description, container, actionHandler) {
        dom.reset(container);
        const parsed = (0, linkedText_1.parseLinkedText)(description);
        let tabIndex = 0;
        for (const node of parsed.nodes) {
            if (typeof node === 'string') {
                container.append(...(0, iconLabels_1.renderLabelWithIcons)(node));
            }
            else {
                let title = node.title;
                if (!title && node.href.startsWith('command:')) {
                    title = (0, nls_1.localize)('executeCommand', "Click to execute command '{0}'", node.href.substring('command:'.length));
                }
                else if (!title) {
                    title = node.href;
                }
                const anchor = dom.$('a', { href: node.href, title, tabIndex: tabIndex++ }, node.label);
                anchor.style.textDecoration = 'underline';
                const handleOpen = (e) => {
                    if (dom.isEventLike(e)) {
                        dom.EventHelper.stop(e, true);
                    }
                    actionHandler.callback(node.href);
                };
                const onClick = actionHandler.disposables.add(new event_1.DomEmitter(anchor, dom.EventType.CLICK)).event;
                const onKeydown = actionHandler.disposables.add(new event_1.DomEmitter(anchor, dom.EventType.KEY_DOWN)).event;
                const onSpaceOrEnter = event_2.Event.chain(onKeydown, $ => $.filter(e => {
                    const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                    return event.equals(10 /* KeyCode.Space */) || event.equals(3 /* KeyCode.Enter */);
                }));
                actionHandler.disposables.add(touch_1.Gesture.addTarget(anchor));
                const onTap = actionHandler.disposables.add(new event_1.DomEmitter(anchor, touch_1.EventType.Tap)).event;
                event_2.Event.any(onClick, onTap, onSpaceOrEnter)(handleOpen, null, actionHandler.disposables);
                container.appendChild(anchor);
            }
        }
    }
    exports.renderQuickInputDescription = renderQuickInputDescription;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVpY2tJbnB1dFV0aWxzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vcXVpY2tpbnB1dC9icm93c2VyL3F1aWNrSW5wdXRVdGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFnQmhHLE1BQU0sZUFBZSxHQUEyQixFQUFFLENBQUM7SUFDbkQsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLHlCQUFXLENBQUMsMEJBQTBCLENBQUMsQ0FBQztJQUV2RSxTQUFnQixZQUFZLENBQUMsUUFBZ0Q7UUFDNUUsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNkLE9BQU8sU0FBUyxDQUFDO1NBQ2pCO1FBQ0QsSUFBSSxTQUFpQixDQUFDO1FBRXRCLE1BQU0sR0FBRyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDckMsSUFBSSxlQUFlLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDekIsU0FBUyxHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUNqQzthQUFNO1lBQ04sU0FBUyxHQUFHLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ3hDLEdBQUcsQ0FBQyxhQUFhLENBQUMsSUFBSSxTQUFTLGdCQUFnQixTQUFTLEVBQUUsRUFBRSxxQkFBcUIsR0FBRyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDbEksR0FBRyxDQUFDLGFBQWEsQ0FBQyxhQUFhLFNBQVMsZ0JBQWdCLFNBQVMsRUFBRSxFQUFFLHFCQUFxQixHQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDekgsZUFBZSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFNBQVMsQ0FBQztTQUNqQztRQUVELE9BQU8sU0FBUyxDQUFDO0lBQ2xC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