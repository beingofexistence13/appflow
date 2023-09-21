/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/date", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/workbench/contrib/comments/common/commentsConfiguration"], function (require, exports, dom, date_1, lifecycle_1, platform_1, commentsConfiguration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TimestampWidget = void 0;
    class TimestampWidget extends lifecycle_1.Disposable {
        constructor(configurationService, container, timeStamp) {
            super();
            this.configurationService = configurationService;
            this._date = dom.append(container, dom.$('span.timestamp'));
            this._date.style.display = 'none';
            this._useRelativeTime = this.useRelativeTimeSetting;
            this.setTimestamp(timeStamp);
        }
        get useRelativeTimeSetting() {
            return this.configurationService.getValue(commentsConfiguration_1.COMMENTS_SECTION).useRelativeTime;
        }
        async setTimestamp(timestamp) {
            if ((timestamp !== this._timestamp) || (this.useRelativeTimeSetting !== this._useRelativeTime)) {
                this.updateDate(timestamp);
            }
            this._timestamp = timestamp;
            this._useRelativeTime = this.useRelativeTimeSetting;
        }
        updateDate(timestamp) {
            if (!timestamp) {
                this._date.textContent = '';
                this._date.style.display = 'none';
            }
            else if ((timestamp !== this._timestamp)
                || (this.useRelativeTimeSetting !== this._useRelativeTime)) {
                this._date.style.display = '';
                let textContent;
                let tooltip;
                if (this.useRelativeTimeSetting) {
                    textContent = this.getRelative(timestamp);
                    tooltip = this.getDateString(timestamp);
                }
                else {
                    textContent = this.getDateString(timestamp);
                }
                this._date.textContent = textContent;
                if (tooltip) {
                    this._date.title = tooltip;
                }
            }
        }
        getRelative(date) {
            return (0, date_1.fromNow)(date, true, true);
        }
        getDateString(date) {
            return date.toLocaleString(platform_1.language);
        }
    }
    exports.TimestampWidget = TimestampWidget;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZXN0YW1wLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY29tbWVudHMvYnJvd3Nlci90aW1lc3RhbXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBU2hHLE1BQWEsZUFBZ0IsU0FBUSxzQkFBVTtRQUs5QyxZQUFvQixvQkFBMkMsRUFBRSxTQUFzQixFQUFFLFNBQWdCO1lBQ3hHLEtBQUssRUFBRSxDQUFDO1lBRFcseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUU5RCxJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO1lBQzVELElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7WUFDbEMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQztZQUNwRCxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzlCLENBQUM7UUFFRCxJQUFZLHNCQUFzQjtZQUNqQyxPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQXlCLHdDQUFnQixDQUFDLENBQUMsZUFBZSxDQUFDO1FBQ3JHLENBQUM7UUFFTSxLQUFLLENBQUMsWUFBWSxDQUFDLFNBQTJCO1lBQ3BELElBQUksQ0FBQyxTQUFTLEtBQUssSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNCQUFzQixLQUFLLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO2dCQUMvRixJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2FBQzNCO1lBQ0QsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7WUFDNUIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQztRQUNyRCxDQUFDO1FBRU8sVUFBVSxDQUFDLFNBQWdCO1lBQ2xDLElBQUksQ0FBQyxTQUFTLEVBQUU7Z0JBQ2YsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO2dCQUM1QixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO2FBQ2xDO2lCQUFNLElBQUksQ0FBQyxTQUFTLEtBQUssSUFBSSxDQUFDLFVBQVUsQ0FBQzttQkFDdEMsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLEtBQUssSUFBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUU7Z0JBQzVELElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7Z0JBQzlCLElBQUksV0FBbUIsQ0FBQztnQkFDeEIsSUFBSSxPQUEyQixDQUFDO2dCQUNoQyxJQUFJLElBQUksQ0FBQyxzQkFBc0IsRUFBRTtvQkFDaEMsV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBQzFDLE9BQU8sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2lCQUN4QztxQkFBTTtvQkFDTixXQUFXLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQztpQkFDNUM7Z0JBRUQsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO2dCQUNyQyxJQUFJLE9BQU8sRUFBRTtvQkFDWixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUM7aUJBQzNCO2FBQ0Q7UUFDRixDQUFDO1FBRU8sV0FBVyxDQUFDLElBQVU7WUFDN0IsT0FBTyxJQUFBLGNBQU8sRUFBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2xDLENBQUM7UUFFTyxhQUFhLENBQUMsSUFBVTtZQUMvQixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsbUJBQVEsQ0FBQyxDQUFDO1FBQ3RDLENBQUM7S0FDRDtJQXZERCwwQ0F1REMifQ==