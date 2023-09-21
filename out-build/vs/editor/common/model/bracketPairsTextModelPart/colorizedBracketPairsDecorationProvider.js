/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/common/core/range", "vs/editor/common/core/editorColorRegistry", "vs/platform/theme/common/themeService"], function (require, exports, event_1, lifecycle_1, range_1, editorColorRegistry_1, themeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$QB = void 0;
    class $QB extends lifecycle_1.$kc {
        constructor(g) {
            super();
            this.g = g;
            this.b = new ColorProvider();
            this.f = new event_1.$fd();
            this.onDidChange = this.f.event;
            this.a = g.getOptions().bracketPairColorizationOptions;
            this.B(g.bracketPairs.onDidChange(e => {
                this.f.fire();
            }));
        }
        //#region TextModel events
        handleDidChangeOptions(e) {
            this.a = this.g.getOptions().bracketPairColorizationOptions;
        }
        //#endregion
        getDecorationsInRange(range, ownerId, filterOutValidation, onlyMinimapDecorations) {
            if (onlyMinimapDecorations) {
                // Bracket pair colorization decorations are not rendered in the minimap
                return [];
            }
            if (ownerId === undefined) {
                return [];
            }
            if (!this.a.enabled) {
                return [];
            }
            const result = this.g.bracketPairs.getBracketsInRange(range, true).map(bracket => ({
                id: `bracket${bracket.range.toString()}-${bracket.nestingLevel}`,
                options: {
                    description: 'BracketPairColorization',
                    inlineClassName: this.b.getInlineClassName(bracket, this.a.independentColorPoolPerBracketType),
                },
                ownerId: 0,
                range: bracket.range,
            })).toArray();
            return result;
        }
        getAllDecorations(ownerId, filterOutValidation) {
            if (ownerId === undefined) {
                return [];
            }
            if (!this.a.enabled) {
                return [];
            }
            return this.getDecorationsInRange(new range_1.$ks(1, 1, this.g.getLineCount(), 1), ownerId, filterOutValidation);
        }
    }
    exports.$QB = $QB;
    class ColorProvider {
        constructor() {
            this.unexpectedClosingBracketClassName = 'unexpected-closing-bracket';
        }
        getInlineClassName(bracket, independentColorPoolPerBracketType) {
            if (bracket.isInvalid) {
                return this.unexpectedClosingBracketClassName;
            }
            return this.getInlineClassNameOfLevel(independentColorPoolPerBracketType ? bracket.nestingLevelOfEqualBracketType : bracket.nestingLevel);
        }
        getInlineClassNameOfLevel(level) {
            // To support a dynamic amount of colors up to 6 colors,
            // we use a number that is a lcm of all numbers from 1 to 6.
            return `bracket-highlighting-${level % 30}`;
        }
    }
    (0, themeService_1.$mv)((theme, collector) => {
        const colors = [
            editorColorRegistry_1.$vB,
            editorColorRegistry_1.$wB,
            editorColorRegistry_1.$xB,
            editorColorRegistry_1.$yB,
            editorColorRegistry_1.$zB,
            editorColorRegistry_1.$AB
        ];
        const colorProvider = new ColorProvider();
        collector.addRule(`.monaco-editor .${colorProvider.unexpectedClosingBracketClassName} { color: ${theme.getColor(editorColorRegistry_1.$BB)}; }`);
        const colorValues = colors
            .map(c => theme.getColor(c))
            .filter((c) => !!c)
            .filter(c => !c.isTransparent());
        for (let level = 0; level < 30; level++) {
            const color = colorValues[level % colorValues.length];
            collector.addRule(`.monaco-editor .${colorProvider.getInlineClassNameOfLevel(level)} { color: ${color}; }`);
        }
    });
});
//# sourceMappingURL=colorizedBracketPairsDecorationProvider.js.map