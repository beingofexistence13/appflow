define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/common/languages/languageConfigurationRegistry"], function (require, exports, event_1, lifecycle_1, languageConfigurationRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$D0b = void 0;
    class $D0b extends lifecycle_1.$kc {
        constructor() {
            super();
            this.a = this.B(new languageConfigurationRegistry_1.$7t());
            this.b = this.B(new event_1.$fd());
            this.onDidChange = this.b.event;
            this.B(this.a.onDidChange((e) => this.b.fire(new languageConfigurationRegistry_1.$1t(e.languageId))));
        }
        register(languageId, configuration, priority) {
            return this.a.register(languageId, configuration, priority);
        }
        getLanguageConfiguration(languageId) {
            return this.a.getLanguageConfiguration(languageId) ??
                new languageConfigurationRegistry_1.$8t('unknown', {});
        }
    }
    exports.$D0b = $D0b;
});
//# sourceMappingURL=testLanguageConfigurationService.js.map