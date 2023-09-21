/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/event", "vs/base/common/event", "vs/base/browser/keyboardEvent", "vs/base/browser/touch", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/common/idGenerator", "vs/base/common/linkedText", "vs/nls!vs/platform/quickinput/browser/quickInputUtils", "vs/css!./media/quickInput"], function (require, exports, dom, event_1, event_2, keyboardEvent_1, touch_1, iconLabels_1, idGenerator_1, linkedText_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$AAb = exports.$zAb = void 0;
    const iconPathToClass = {};
    const iconClassGenerator = new idGenerator_1.$7L('quick-input-button-icon-');
    function $zAb(iconPath) {
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
            dom.$ZO(`.${iconClass}, .hc-light .${iconClass}`, `background-image: ${dom.$nP(iconPath.light || iconPath.dark)}`);
            dom.$ZO(`.vs-dark .${iconClass}, .hc-black .${iconClass}`, `background-image: ${dom.$nP(iconPath.dark)}`);
            iconPathToClass[key] = iconClass;
        }
        return iconClass;
    }
    exports.$zAb = $zAb;
    function $AAb(description, container, actionHandler) {
        dom.$_O(container);
        const parsed = (0, linkedText_1.$IS)(description);
        let tabIndex = 0;
        for (const node of parsed.nodes) {
            if (typeof node === 'string') {
                container.append(...(0, iconLabels_1.$xQ)(node));
            }
            else {
                let title = node.title;
                if (!title && node.href.startsWith('command:')) {
                    title = (0, nls_1.localize)(0, null, node.href.substring('command:'.length));
                }
                else if (!title) {
                    title = node.href;
                }
                const anchor = dom.$('a', { href: node.href, title, tabIndex: tabIndex++ }, node.label);
                anchor.style.textDecoration = 'underline';
                const handleOpen = (e) => {
                    if (dom.$4O(e)) {
                        dom.$5O.stop(e, true);
                    }
                    actionHandler.callback(node.href);
                };
                const onClick = actionHandler.disposables.add(new event_1.$9P(anchor, dom.$3O.CLICK)).event;
                const onKeydown = actionHandler.disposables.add(new event_1.$9P(anchor, dom.$3O.KEY_DOWN)).event;
                const onSpaceOrEnter = event_2.Event.chain(onKeydown, $ => $.filter(e => {
                    const event = new keyboardEvent_1.$jO(e);
                    return event.equals(10 /* KeyCode.Space */) || event.equals(3 /* KeyCode.Enter */);
                }));
                actionHandler.disposables.add(touch_1.$EP.addTarget(anchor));
                const onTap = actionHandler.disposables.add(new event_1.$9P(anchor, touch_1.EventType.Tap)).event;
                event_2.Event.any(onClick, onTap, onSpaceOrEnter)(handleOpen, null, actionHandler.disposables);
                container.appendChild(anchor);
            }
        }
    }
    exports.$AAb = $AAb;
});
//# sourceMappingURL=quickInputUtils.js.map