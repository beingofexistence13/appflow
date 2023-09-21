/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/workbench/contrib/notebook/browser/view/cellPart"], function (require, exports, DOM, cellPart_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CellDecorations = void 0;
    class CellDecorations extends cellPart_1.CellContentPart {
        constructor(rootContainer, decorationContainer) {
            super();
            this.rootContainer = rootContainer;
            this.decorationContainer = decorationContainer;
        }
        didRenderCell(element) {
            const removedClassNames = [];
            this.rootContainer.classList.forEach(className => {
                if (/^nb\-.*$/.test(className)) {
                    removedClassNames.push(className);
                }
            });
            removedClassNames.forEach(className => {
                this.rootContainer.classList.remove(className);
            });
            this.decorationContainer.innerText = '';
            const generateCellTopDecorations = () => {
                this.decorationContainer.innerText = '';
                element.getCellDecorations().filter(options => options.topClassName !== undefined).forEach(options => {
                    this.decorationContainer.append(DOM.$(`.${options.topClassName}`));
                });
            };
            this.cellDisposables.add(element.onCellDecorationsChanged((e) => {
                const modified = e.added.find(e => e.topClassName) || e.removed.find(e => e.topClassName);
                if (modified) {
                    generateCellTopDecorations();
                }
            }));
            generateCellTopDecorations();
        }
    }
    exports.CellDecorations = CellDecorations;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbERlY29yYXRpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svYnJvd3Nlci92aWV3L2NlbGxQYXJ0cy9jZWxsRGVjb3JhdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBTWhHLE1BQWEsZUFBZ0IsU0FBUSwwQkFBZTtRQUNuRCxZQUNVLGFBQTBCLEVBQzFCLG1CQUFnQztZQUV6QyxLQUFLLEVBQUUsQ0FBQztZQUhDLGtCQUFhLEdBQWIsYUFBYSxDQUFhO1lBQzFCLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBYTtRQUcxQyxDQUFDO1FBRVEsYUFBYSxDQUFDLE9BQXVCO1lBQzdDLE1BQU0saUJBQWlCLEdBQWEsRUFBRSxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRTtnQkFDaEQsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFO29CQUMvQixpQkFBaUIsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7aUJBQ2xDO1lBQ0YsQ0FBQyxDQUFDLENBQUM7WUFFSCxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUU7Z0JBQ3JDLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNoRCxDQUFDLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1lBRXhDLE1BQU0sMEJBQTBCLEdBQUcsR0FBRyxFQUFFO2dCQUN2QyxJQUFJLENBQUMsbUJBQW1CLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztnQkFFeEMsT0FBTyxDQUFDLGtCQUFrQixFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLFlBQVksS0FBSyxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7b0JBQ3BHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxZQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JFLENBQUMsQ0FBQyxDQUFDO1lBQ0osQ0FBQyxDQUFDO1lBRUYsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7Z0JBQy9ELE1BQU0sUUFBUSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUUxRixJQUFJLFFBQVEsRUFBRTtvQkFDYiwwQkFBMEIsRUFBRSxDQUFDO2lCQUM3QjtZQUNGLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSiwwQkFBMEIsRUFBRSxDQUFDO1FBQzlCLENBQUM7S0FDRDtJQXhDRCwwQ0F3Q0MifQ==