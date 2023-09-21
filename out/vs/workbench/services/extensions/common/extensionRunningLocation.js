/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RemoteRunningLocation = exports.LocalWebWorkerRunningLocation = exports.LocalProcessRunningLocation = void 0;
    class LocalProcessRunningLocation {
        constructor(affinity) {
            this.affinity = affinity;
            this.kind = 1 /* ExtensionHostKind.LocalProcess */;
        }
        equals(other) {
            return (this.kind === other.kind && this.affinity === other.affinity);
        }
        asString() {
            if (this.affinity === 0) {
                return 'LocalProcess';
            }
            return `LocalProcess${this.affinity}`;
        }
    }
    exports.LocalProcessRunningLocation = LocalProcessRunningLocation;
    class LocalWebWorkerRunningLocation {
        constructor(affinity) {
            this.affinity = affinity;
            this.kind = 2 /* ExtensionHostKind.LocalWebWorker */;
        }
        equals(other) {
            return (this.kind === other.kind && this.affinity === other.affinity);
        }
        asString() {
            if (this.affinity === 0) {
                return 'LocalWebWorker';
            }
            return `LocalWebWorker${this.affinity}`;
        }
    }
    exports.LocalWebWorkerRunningLocation = LocalWebWorkerRunningLocation;
    class RemoteRunningLocation {
        constructor() {
            this.kind = 3 /* ExtensionHostKind.Remote */;
            this.affinity = 0;
        }
        equals(other) {
            return (this.kind === other.kind);
        }
        asString() {
            return 'Remote';
        }
    }
    exports.RemoteRunningLocation = RemoteRunningLocation;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uUnVubmluZ0xvY2F0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2V4dGVuc2lvbnMvY29tbW9uL2V4dGVuc2lvblJ1bm5pbmdMb2NhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFJaEcsTUFBYSwyQkFBMkI7UUFFdkMsWUFDaUIsUUFBZ0I7WUFBaEIsYUFBUSxHQUFSLFFBQVEsQ0FBUTtZQUZqQixTQUFJLDBDQUFrQztRQUdsRCxDQUFDO1FBQ0UsTUFBTSxDQUFDLEtBQStCO1lBQzVDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdkUsQ0FBQztRQUNNLFFBQVE7WUFDZCxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssQ0FBQyxFQUFFO2dCQUN4QixPQUFPLGNBQWMsQ0FBQzthQUN0QjtZQUNELE9BQU8sZUFBZSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDdkMsQ0FBQztLQUNEO0lBZEQsa0VBY0M7SUFFRCxNQUFhLDZCQUE2QjtRQUV6QyxZQUNpQixRQUFnQjtZQUFoQixhQUFRLEdBQVIsUUFBUSxDQUFRO1lBRmpCLFNBQUksNENBQW9DO1FBR3BELENBQUM7UUFDRSxNQUFNLENBQUMsS0FBK0I7WUFDNUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssS0FBSyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN2RSxDQUFDO1FBQ00sUUFBUTtZQUNkLElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxDQUFDLEVBQUU7Z0JBQ3hCLE9BQU8sZ0JBQWdCLENBQUM7YUFDeEI7WUFDRCxPQUFPLGlCQUFpQixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDekMsQ0FBQztLQUNEO0lBZEQsc0VBY0M7SUFFRCxNQUFhLHFCQUFxQjtRQUFsQztZQUNpQixTQUFJLG9DQUE0QjtZQUNoQyxhQUFRLEdBQUcsQ0FBQyxDQUFDO1FBTzlCLENBQUM7UUFOTyxNQUFNLENBQUMsS0FBK0I7WUFDNUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ25DLENBQUM7UUFDTSxRQUFRO1lBQ2QsT0FBTyxRQUFRLENBQUM7UUFDakIsQ0FBQztLQUNEO0lBVEQsc0RBU0MifQ==