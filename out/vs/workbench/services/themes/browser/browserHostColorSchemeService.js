/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/browser/browser", "vs/platform/instantiation/common/extensions", "vs/base/common/lifecycle", "vs/workbench/services/themes/common/hostColorSchemeService"], function (require, exports, event_1, browser_1, extensions_1, lifecycle_1, hostColorSchemeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BrowserHostColorSchemeService = void 0;
    class BrowserHostColorSchemeService extends lifecycle_1.Disposable {
        constructor() {
            super();
            this._onDidSchemeChangeEvent = this._register(new event_1.Emitter());
            this.registerListeners();
        }
        registerListeners() {
            (0, browser_1.addMatchMediaChangeListener)('(prefers-color-scheme: dark)', () => {
                this._onDidSchemeChangeEvent.fire();
            });
            (0, browser_1.addMatchMediaChangeListener)('(forced-colors: active)', () => {
                this._onDidSchemeChangeEvent.fire();
            });
        }
        get onDidChangeColorScheme() {
            return this._onDidSchemeChangeEvent.event;
        }
        get dark() {
            if (window.matchMedia(`(prefers-color-scheme: light)`).matches) {
                return false;
            }
            else if (window.matchMedia(`(prefers-color-scheme: dark)`).matches) {
                return true;
            }
            return false;
        }
        get highContrast() {
            if (window.matchMedia(`(forced-colors: active)`).matches) {
                return true;
            }
            return false;
        }
    }
    exports.BrowserHostColorSchemeService = BrowserHostColorSchemeService;
    (0, extensions_1.registerSingleton)(hostColorSchemeService_1.IHostColorSchemeService, BrowserHostColorSchemeService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3Nlckhvc3RDb2xvclNjaGVtZVNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvdGhlbWVzL2Jyb3dzZXIvYnJvd3Nlckhvc3RDb2xvclNjaGVtZVNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBUWhHLE1BQWEsNkJBQThCLFNBQVEsc0JBQVU7UUFNNUQ7WUFFQyxLQUFLLEVBQUUsQ0FBQztZQUpRLDRCQUF1QixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVEsQ0FBQyxDQUFDO1lBTTlFLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQzFCLENBQUM7UUFFTyxpQkFBaUI7WUFFeEIsSUFBQSxxQ0FBMkIsRUFBQyw4QkFBOEIsRUFBRSxHQUFHLEVBQUU7Z0JBQ2hFLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNyQyxDQUFDLENBQUMsQ0FBQztZQUNILElBQUEscUNBQTJCLEVBQUMseUJBQXlCLEVBQUUsR0FBRyxFQUFFO2dCQUMzRCxJQUFJLENBQUMsdUJBQXVCLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDckMsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsSUFBSSxzQkFBc0I7WUFDekIsT0FBTyxJQUFJLENBQUMsdUJBQXVCLENBQUMsS0FBSyxDQUFDO1FBQzNDLENBQUM7UUFFRCxJQUFJLElBQUk7WUFDUCxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsK0JBQStCLENBQUMsQ0FBQyxPQUFPLEVBQUU7Z0JBQy9ELE9BQU8sS0FBSyxDQUFDO2FBQ2I7aUJBQU0sSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLDhCQUE4QixDQUFDLENBQUMsT0FBTyxFQUFFO2dCQUNyRSxPQUFPLElBQUksQ0FBQzthQUNaO1lBQ0QsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRUQsSUFBSSxZQUFZO1lBQ2YsSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLHlCQUF5QixDQUFDLENBQUMsT0FBTyxFQUFFO2dCQUN6RCxPQUFPLElBQUksQ0FBQzthQUNaO1lBQ0QsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO0tBRUQ7SUEzQ0Qsc0VBMkNDO0lBRUQsSUFBQSw4QkFBaUIsRUFBQyxnREFBdUIsRUFBRSw2QkFBNkIsb0NBQTRCLENBQUMifQ==