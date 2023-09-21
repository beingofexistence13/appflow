/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/languages/nullTokenize", "vs/base/common/lifecycle", "vs/base/common/observable"], function (require, exports, nullTokenize_1, lifecycle_1, observable_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TokenizationSupportWithLineLimit = void 0;
    class TokenizationSupportWithLineLimit extends lifecycle_1.Disposable {
        get backgroundTokenizerShouldOnlyVerifyTokens() {
            return this._actual.backgroundTokenizerShouldOnlyVerifyTokens;
        }
        constructor(_encodedLanguageId, _actual, _maxTokenizationLineLength) {
            super();
            this._encodedLanguageId = _encodedLanguageId;
            this._actual = _actual;
            this._maxTokenizationLineLength = _maxTokenizationLineLength;
            this._register((0, observable_1.keepObserved)(this._maxTokenizationLineLength));
        }
        getInitialState() {
            return this._actual.getInitialState();
        }
        tokenize(line, hasEOL, state) {
            throw new Error('Not supported!');
        }
        tokenizeEncoded(line, hasEOL, state) {
            // Do not attempt to tokenize if a line is too long
            if (line.length >= this._maxTokenizationLineLength.get()) {
                return (0, nullTokenize_1.nullTokenizeEncoded)(this._encodedLanguageId, state);
            }
            return this._actual.tokenizeEncoded(line, hasEOL, state);
        }
        createBackgroundTokenizer(textModel, store) {
            if (this._actual.createBackgroundTokenizer) {
                return this._actual.createBackgroundTokenizer(textModel, store);
            }
            else {
                return undefined;
            }
        }
    }
    exports.TokenizationSupportWithLineLimit = TokenizationSupportWithLineLimit;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9rZW5pemF0aW9uU3VwcG9ydFdpdGhMaW5lTGltaXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvdGV4dE1hdGUvYnJvd3Nlci90b2tlbml6YXRpb25TdXBwb3J0L3Rva2VuaXphdGlvblN1cHBvcnRXaXRoTGluZUxpbWl0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVNoRyxNQUFhLGdDQUFpQyxTQUFRLHNCQUFVO1FBQy9ELElBQUkseUNBQXlDO1lBQzVDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyx5Q0FBeUMsQ0FBQztRQUMvRCxDQUFDO1FBRUQsWUFDa0Isa0JBQThCLEVBQzlCLE9BQTZCLEVBQzdCLDBCQUErQztZQUVoRSxLQUFLLEVBQUUsQ0FBQztZQUpTLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBWTtZQUM5QixZQUFPLEdBQVAsT0FBTyxDQUFzQjtZQUM3QiwrQkFBMEIsR0FBMUIsMEJBQTBCLENBQXFCO1lBSWhFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBQSx5QkFBWSxFQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLENBQUM7UUFDL0QsQ0FBQztRQUVELGVBQWU7WUFDZCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDdkMsQ0FBQztRQUVELFFBQVEsQ0FBQyxJQUFZLEVBQUUsTUFBZSxFQUFFLEtBQWE7WUFDcEQsTUFBTSxJQUFJLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ25DLENBQUM7UUFFRCxlQUFlLENBQUMsSUFBWSxFQUFFLE1BQWUsRUFBRSxLQUFhO1lBQzNELG1EQUFtRDtZQUNuRCxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLDBCQUEwQixDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUN6RCxPQUFPLElBQUEsa0NBQW1CLEVBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQzNEO1lBRUQsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzFELENBQUM7UUFFRCx5QkFBeUIsQ0FBQyxTQUFxQixFQUFFLEtBQW1DO1lBQ25GLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyx5QkFBeUIsRUFBRTtnQkFDM0MsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLHlCQUF5QixDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQzthQUNoRTtpQkFBTTtnQkFDTixPQUFPLFNBQVMsQ0FBQzthQUNqQjtRQUNGLENBQUM7S0FDRDtJQXZDRCw0RUF1Q0MifQ==