/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestClipboardService = void 0;
    class TestClipboardService {
        constructor() {
            this.text = undefined;
            this.findText = undefined;
            this.resources = undefined;
        }
        async writeText(text, type) {
            this.text = text;
        }
        async readText(type) {
            return this.text ?? '';
        }
        async readFindText() {
            return this.findText ?? '';
        }
        async writeFindText(text) {
            this.findText = text;
        }
        async writeResources(resources) {
            this.resources = resources;
        }
        async readResources() {
            return this.resources ?? [];
        }
        async hasResources() {
            return Array.isArray(this.resources) && this.resources.length > 0;
        }
    }
    exports.TestClipboardService = TestClipboardService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdENsaXBib2FyZFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9jbGlwYm9hcmQvdGVzdC9jb21tb24vdGVzdENsaXBib2FyZFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBS2hHLE1BQWEsb0JBQW9CO1FBQWpDO1lBSVMsU0FBSSxHQUF1QixTQUFTLENBQUM7WUFVckMsYUFBUSxHQUF1QixTQUFTLENBQUM7WUFVekMsY0FBUyxHQUFzQixTQUFTLENBQUM7UUFhbEQsQ0FBQztRQS9CQSxLQUFLLENBQUMsU0FBUyxDQUFDLElBQVksRUFBRSxJQUFhO1lBQzFDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLENBQUM7UUFFRCxLQUFLLENBQUMsUUFBUSxDQUFDLElBQWE7WUFDM0IsT0FBTyxJQUFJLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUN4QixDQUFDO1FBSUQsS0FBSyxDQUFDLFlBQVk7WUFDakIsT0FBTyxJQUFJLENBQUMsUUFBUSxJQUFJLEVBQUUsQ0FBQztRQUM1QixDQUFDO1FBRUQsS0FBSyxDQUFDLGFBQWEsQ0FBQyxJQUFZO1lBQy9CLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1FBQ3RCLENBQUM7UUFJRCxLQUFLLENBQUMsY0FBYyxDQUFDLFNBQWdCO1lBQ3BDLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzVCLENBQUM7UUFFRCxLQUFLLENBQUMsYUFBYTtZQUNsQixPQUFPLElBQUksQ0FBQyxTQUFTLElBQUksRUFBRSxDQUFDO1FBQzdCLENBQUM7UUFFRCxLQUFLLENBQUMsWUFBWTtZQUNqQixPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUNuRSxDQUFDO0tBQ0Q7SUFyQ0Qsb0RBcUNDIn0=