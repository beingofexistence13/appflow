/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/themables", "vs/platform/theme/common/iconRegistry"], function (require, exports, dom_1, event_1, lifecycle_1, themables_1, iconRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$zzb = exports.$yzb = void 0;
    function $yzb(themeService) {
        const disposable = new lifecycle_1.$jc();
        const onDidChangeEmmiter = disposable.add(new event_1.$fd());
        const iconRegistry = (0, iconRegistry_1.$0u)();
        disposable.add(iconRegistry.onDidChange(() => onDidChangeEmmiter.fire()));
        if (themeService) {
            disposable.add(themeService.onDidProductIconThemeChange(() => onDidChangeEmmiter.fire()));
        }
        return {
            dispose: () => disposable.dispose(),
            onDidChange: onDidChangeEmmiter.event,
            getCSS() {
                const productIconTheme = themeService ? themeService.getProductIconTheme() : new $zzb();
                const usedFontIds = {};
                const formatIconRule = (contribution) => {
                    const definition = productIconTheme.getIcon(contribution);
                    if (!definition) {
                        return undefined;
                    }
                    const fontContribution = definition.font;
                    if (fontContribution) {
                        usedFontIds[fontContribution.id] = fontContribution.definition;
                        return `.codicon-${contribution.id}:before { content: '${definition.fontCharacter}'; font-family: ${(0, dom_1.$oP)(fontContribution.id)}; }`;
                    }
                    // default font (codicon)
                    return `.codicon-${contribution.id}:before { content: '${definition.fontCharacter}'; }`;
                };
                const rules = [];
                for (const contribution of iconRegistry.getIcons()) {
                    const rule = formatIconRule(contribution);
                    if (rule) {
                        rules.push(rule);
                    }
                }
                for (const id in usedFontIds) {
                    const definition = usedFontIds[id];
                    const fontWeight = definition.weight ? `font-weight: ${definition.weight};` : '';
                    const fontStyle = definition.style ? `font-style: ${definition.style};` : '';
                    const src = definition.src.map(l => `${(0, dom_1.$nP)(l.location)} format('${l.format}')`).join(', ');
                    rules.push(`@font-face { src: ${src}; font-family: ${(0, dom_1.$oP)(id)};${fontWeight}${fontStyle} font-display: block; }`);
                }
                return rules.join('\n');
            }
        };
    }
    exports.$yzb = $yzb;
    class $zzb {
        getIcon(contribution) {
            const iconRegistry = (0, iconRegistry_1.$0u)();
            let definition = contribution.defaults;
            while (themables_1.ThemeIcon.isThemeIcon(definition)) {
                const c = iconRegistry.getIcon(definition.id);
                if (!c) {
                    return undefined;
                }
                definition = c.defaults;
            }
            return definition;
        }
    }
    exports.$zzb = $zzb;
});
//# sourceMappingURL=iconsStyleSheet.js.map