define("ProcessSchemaElementPropertiesEdit", ["BaseSchemaModuleV2", "css!CommonCSSV2", "ProcessModuleUtilities"],
	function() {
	/**
	 * @class Terrasoft.configuration.CardModule
	 * Это класс, который используется для создания модуля карточки
	 */
	return Ext.define("Terrasoft.ProcessDesigner.ProcessSchemaElementPropertiesEdit", {
		alternateClassName: "Terrasoft.ProcessSchemaElementPropertiesEdit",
		extend: "Terrasoft.BaseSchemaModule",

		isSchemaConfigInitialized: true,

		useHistoryState: false,

		autoGeneratedContainerSuffix: "-prSchElPropCt",

		tag: null,

		/**
		 * Инициализация модуля.
		 * @protected
		 */
		init: function() {
			this.callParent(arguments);
			var sandbox = this.sandbox;
			sandbox.registerMessages({
				"ReRenderPropertiesPage": {
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE,
					mode: Terrasoft.MessageMode.PTP
				}
			});
			sandbox.subscribe("ReRenderPropertiesPage", this.onReRenderPropertiesPage, this);
		},

		getViewModelConfig: function() {
			var viewModelConfig = this.callParent(arguments);
			viewModelConfig.tag = this.tag;
			return viewModelConfig;
		},

		/**
		 * Выполняет отрисовку страницы свойств элементов.
		 * @param {String} renderToId Ссылка на контейнер, в котором будет отображаться представление.
		 */
		onReRenderPropertiesPage: function(renderToId) {
			var el = Ext.get(renderToId);
			this.render(el);
		}
	});
});