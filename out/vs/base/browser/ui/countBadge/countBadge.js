/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/strings", "vs/css!./countBadge"], function (require, exports, dom_1, strings_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CountBadge = exports.unthemedCountStyles = void 0;
    exports.unthemedCountStyles = {
        badgeBackground: '#4D4D4D',
        badgeForeground: '#FFFFFF',
        badgeBorder: undefined
    };
    class CountBadge {
        constructor(container, options, styles) {
            this.options = options;
            this.styles = styles;
            this.count = 0;
            this.element = (0, dom_1.append)(container, (0, dom_1.$)('.monaco-count-badge'));
            this.countFormat = this.options.countFormat || '{0}';
            this.titleFormat = this.options.titleFormat || '';
            this.setCount(this.options.count || 0);
        }
        setCount(count) {
            this.count = count;
            this.render();
        }
        setCountFormat(countFormat) {
            this.countFormat = countFormat;
            this.render();
        }
        setTitleFormat(titleFormat) {
            this.titleFormat = titleFormat;
            this.render();
        }
        render() {
            this.element.textContent = (0, strings_1.format)(this.countFormat, this.count);
            this.element.title = (0, strings_1.format)(this.titleFormat, this.count);
            this.element.style.backgroundColor = this.styles.badgeBackground ?? '';
            this.element.style.color = this.styles.badgeForeground ?? '';
            if (this.styles.badgeBorder) {
                this.element.style.border = `1px solid ${this.styles.badgeBorder}`;
            }
        }
    }
    exports.CountBadge = CountBadge;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY291bnRCYWRnZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvYnJvd3Nlci91aS9jb3VudEJhZGdlL2NvdW50QmFkZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBa0JuRixRQUFBLG1CQUFtQixHQUFzQjtRQUNyRCxlQUFlLEVBQUUsU0FBUztRQUMxQixlQUFlLEVBQUUsU0FBUztRQUMxQixXQUFXLEVBQUUsU0FBUztLQUN0QixDQUFDO0lBRUYsTUFBYSxVQUFVO1FBT3RCLFlBQVksU0FBc0IsRUFBbUIsT0FBMkIsRUFBbUIsTUFBeUI7WUFBdkUsWUFBTyxHQUFQLE9BQU8sQ0FBb0I7WUFBbUIsV0FBTSxHQUFOLE1BQU0sQ0FBbUI7WUFKcEgsVUFBSyxHQUFXLENBQUMsQ0FBQztZQU16QixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUEsWUFBTSxFQUFDLFNBQVMsRUFBRSxJQUFBLE9BQUMsRUFBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUM7WUFDM0QsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsSUFBSSxLQUFLLENBQUM7WUFDckQsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsSUFBSSxFQUFFLENBQUM7WUFDbEQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQztRQUN4QyxDQUFDO1FBRUQsUUFBUSxDQUFDLEtBQWE7WUFDckIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7WUFDbkIsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2YsQ0FBQztRQUVELGNBQWMsQ0FBQyxXQUFtQjtZQUNqQyxJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztZQUMvQixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDZixDQUFDO1FBRUQsY0FBYyxDQUFDLFdBQW1CO1lBQ2pDLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1lBQy9CLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNmLENBQUM7UUFFTyxNQUFNO1lBQ2IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEdBQUcsSUFBQSxnQkFBTSxFQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2hFLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLElBQUEsZ0JBQU0sRUFBQyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUUxRCxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLElBQUksRUFBRSxDQUFDO1lBQ3ZFLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsSUFBSSxFQUFFLENBQUM7WUFFN0QsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRTtnQkFDNUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLGFBQWEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQzthQUNuRTtRQUNGLENBQUM7S0FDRDtJQXpDRCxnQ0F5Q0MifQ==