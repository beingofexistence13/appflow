define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/common/languages/languageConfigurationRegistry"], function (require, exports, event_1, lifecycle_1, languageConfigurationRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestLanguageConfigurationService = void 0;
    class TestLanguageConfigurationService extends lifecycle_1.Disposable {
        constructor() {
            super();
            this._registry = this._register(new languageConfigurationRegistry_1.LanguageConfigurationRegistry());
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this._register(this._registry.onDidChange((e) => this._onDidChange.fire(new languageConfigurationRegistry_1.LanguageConfigurationServiceChangeEvent(e.languageId))));
        }
        register(languageId, configuration, priority) {
            return this._registry.register(languageId, configuration, priority);
        }
        getLanguageConfiguration(languageId) {
            return this._registry.getLanguageConfiguration(languageId) ??
                new languageConfigurationRegistry_1.ResolvedLanguageConfiguration('unknown', {});
        }
    }
    exports.TestLanguageConfigurationService = TestLanguageConfigurationService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdExhbmd1YWdlQ29uZmlndXJhdGlvblNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvdGVzdC9jb21tb24vbW9kZXMvdGVzdExhbmd1YWdlQ29uZmlndXJhdGlvblNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQVNBLE1BQWEsZ0NBQWlDLFNBQVEsc0JBQVU7UUFRL0Q7WUFDQyxLQUFLLEVBQUUsQ0FBQztZQU5RLGNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksNkRBQTZCLEVBQUUsQ0FBQyxDQUFDO1lBRWhFLGlCQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBMkMsQ0FBQyxDQUFDO1lBQ3ZGLGdCQUFXLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUM7WUFJckQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSx1RUFBdUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdEksQ0FBQztRQUVELFFBQVEsQ0FBQyxVQUFrQixFQUFFLGFBQW9DLEVBQUUsUUFBaUI7WUFDbkYsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsYUFBYSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3JFLENBQUM7UUFFRCx3QkFBd0IsQ0FBQyxVQUFrQjtZQUMxQyxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsd0JBQXdCLENBQUMsVUFBVSxDQUFDO2dCQUN6RCxJQUFJLDZEQUE2QixDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNuRCxDQUFDO0tBQ0Q7SUFyQkQsNEVBcUJDIn0=