define("InvoiceSectionV2", ["ProductSalesUtils"],
	function(ProductSalesUtils) {
		return {
			entitySchemaName: "Invoice",
			details: /**SCHEMA_DETAILS*/{}/**SCHEMA_DETAILS*/,
			diff: /**SCHEMA_DIFF*/[]/**SCHEMA_DIFF*/,
			methods: {
				/**
				 * Открывает модуль или карточку в цепочке
				 * @param config
				 * @overridden
				 * @returns {Boolean}
				 */
				openCardInChain: function(config) {
					if (config && !config.hasOwnProperty("OpenProductSelectionModule")) {
						return this.callParent(arguments);
					}
					return ProductSalesUtils.openProductSelectionModuleInChain(config, this.sandbox);
				}
			}
		};
	});