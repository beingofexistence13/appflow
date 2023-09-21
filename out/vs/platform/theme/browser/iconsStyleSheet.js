/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/themables", "vs/platform/theme/common/iconRegistry"], function (require, exports, dom_1, event_1, lifecycle_1, themables_1, iconRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UnthemedProductIconTheme = exports.getIconsStyleSheet = void 0;
    function getIconsStyleSheet(themeService) {
        const disposable = new lifecycle_1.DisposableStore();
        const onDidChangeEmmiter = disposable.add(new event_1.Emitter());
        const iconRegistry = (0, iconRegistry_1.getIconRegistry)();
        disposable.add(iconRegistry.onDidChange(() => onDidChangeEmmiter.fire()));
        if (themeService) {
            disposable.add(themeService.onDidProductIconThemeChange(() => onDidChangeEmmiter.fire()));
        }
        return {
            dispose: () => disposable.dispose(),
            onDidChange: onDidChangeEmmiter.event,
            getCSS() {
                const productIconTheme = themeService ? themeService.getProductIconTheme() : new UnthemedProductIconTheme();
                const usedFontIds = {};
                const formatIconRule = (contribution) => {
                    const definition = productIconTheme.getIcon(contribution);
                    if (!definition) {
                        return undefined;
                    }
                    const fontContribution = definition.font;
                    if (fontContribution) {
                        usedFontIds[fontContribution.id] = fontContribution.definition;
                        return `.codicon-${contribution.id}:before { content: '${definition.fontCharacter}'; font-family: ${(0, dom_1.asCSSPropertyValue)(fontContribution.id)}; }`;
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
                    const src = definition.src.map(l => `${(0, dom_1.asCSSUrl)(l.location)} format('${l.format}')`).join(', ');
                    rules.push(`@font-face { src: ${src}; font-family: ${(0, dom_1.asCSSPropertyValue)(id)};${fontWeight}${fontStyle} font-display: block; }`);
                }
                return rules.join('\n');
            }
        };
    }
    exports.getIconsStyleSheet = getIconsStyleSheet;
    class UnthemedProductIconTheme {
        getIcon(contribution) {
            const iconRegistry = (0, iconRegistry_1.getIconRegistry)();
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
    exports.UnthemedProductIconTheme = UnthemedProductIconTheme;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWNvbnNTdHlsZVNoZWV0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vdGhlbWUvYnJvd3Nlci9pY29uc1N0eWxlU2hlZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBY2hHLFNBQWdCLGtCQUFrQixDQUFDLFlBQXVDO1FBQ3pFLE1BQU0sVUFBVSxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1FBRXpDLE1BQU0sa0JBQWtCLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLGVBQU8sRUFBUSxDQUFDLENBQUM7UUFDL0QsTUFBTSxZQUFZLEdBQUcsSUFBQSw4QkFBZSxHQUFFLENBQUM7UUFDdkMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDLGtCQUFrQixDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMxRSxJQUFJLFlBQVksRUFBRTtZQUNqQixVQUFVLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQywyQkFBMkIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDMUY7UUFFRCxPQUFPO1lBQ04sT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUU7WUFDbkMsV0FBVyxFQUFFLGtCQUFrQixDQUFDLEtBQUs7WUFDckMsTUFBTTtnQkFDTCxNQUFNLGdCQUFnQixHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksd0JBQXdCLEVBQUUsQ0FBQztnQkFDNUcsTUFBTSxXQUFXLEdBQXlDLEVBQUUsQ0FBQztnQkFDN0QsTUFBTSxjQUFjLEdBQUcsQ0FBQyxZQUE4QixFQUFzQixFQUFFO29CQUM3RSxNQUFNLFVBQVUsR0FBRyxn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