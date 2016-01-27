define("MultiCurrencyEditUtilities", ["MultiCurrencyEditUtilitiesResources"], function(resources) {
	/**
	 * @class Terrasoft.configuration.mixins.MultiCurrencyEditUtilities
	 * Миксин, реализующий работу с мультивалютным элементом управления.
	 */
	Ext.define("Terrasoft.configuration.mixins.MultiCurrencyEditUtilities", {
		alternateClassName: "Terrasoft.MultiCurrencyEditUtilities",

		//region Methods: Private

		/**
		 * Заполняет коллекцию валют.
		 * @private
		 */
		fillCurrencyRateList: function(collection) {
			var currencyRateList = this.get("CurrencyRateList");
			currencyRateList.clear();
			var list = new Terrasoft.Collection();
			collection.each(function(item) {
				var id = item.get("CurrencyId");
				var name = item.get("Name");
				if (list.contains(id)) {
					var msgTemplate = resources.localizableStrings.CurrencyRatesOverlappingMessage;
					var msg = this.Ext.String.format(msgTemplate, name);
					this.log(msg, Terrasoft.LogMessageType.WARNING);
					return;
				}
				list.add(id, {
					value: id,
					displayValue: name,
					ShortName: item.get("ShortName"),
					Symbol: item.get("Symbol"),
					Rate: item.get("Rate"),
					Division: item.get("Division")
				});
			}, this);
			currencyRateList.loadAll(list);
		},

		//endregion

		//region Methods: Protected

		/**
		 * Инициализирует коллекцию валют.
		 * @protected
		 */
		initCurrencyRateList: function() {
			this.set("CurrencyRateList", new Terrasoft.Collection());
			var currencyRateDate = new Date();
			var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
				rootSchemaName: "CurrencyRate",
				serverESQCacheParameters: {
					cacheLevel: Terrasoft.ESQServerCacheLevels.SESSION,
					cacheGroup: "CurrencyRateListGroup",
					cacheItemName: "CurrencyRateListItem"
				}
			});
			var columnName = esq.addColumn("Currency.Name", "Name");
			columnName.orderDirection = Terrasoft.OrderDirection.ASC;
			columnName.orderPosition = 0;
			var columnStartDate = esq.addColumn("StartDate");
			columnStartDate.orderDirection = Terrasoft.OrderDirection.DESC;
			columnStartDate.orderPosition = 1;
			esq.addColumn("Currency.Id", "CurrencyId");
			esq.addColumn("Currency.Symbol", "Symbol");
			esq.addColumn("Currency.ShortName", "ShortName");
			esq.addColumn("Currency.Division", "Division");
			esq.addColumn("Rate");
			var filters = esq.filters;
			filters.addItem(Terrasoft.createColumnFilterWithParameter(
				Terrasoft.ComparisonType.LESS_OR_EQUAL, "StartDate", currencyRateDate));
			var endDateFilterGroup = this.Ext.create("Terrasoft.FilterGroup");
			endDateFilterGroup.logicalOperation = Terrasoft.LogicalOperatorType.OR;
			endDateFilterGroup.addItem(Terrasoft.createColumnFilterWithParameter(
				Terrasoft.ComparisonType.GREATER_OR_EQUAL, "EndDate", currencyRateDate));
			endDateFilterGroup.addItem(Terrasoft.createIsNullFilter(
				this.Ext.create("Terrasoft.ColumnExpression", {columnPath: "EndDate"})));
			filters.addItem(endDateFilterGroup);
			esq.getEntityCollection(function(result) {
				if (result.success) {
					var collection = result.collection;
					if (collection.isEmpty()) {
						var msg = resources.localizableStrings.NoCurrenciesMessage;
						this.log(msg, Terrasoft.LogMessageType.ERROR);
						return;
					}
					this.fillCurrencyRateList(collection);
				}
			}, this);
		},

		/**
		 * Инициализирует базовую валюту.
		 * @protected
		 */
		initPrimaryCurrency: function() {
			this.Terrasoft.SysSettings.querySysSettingsItem("PrimaryCurrency",
				function(value) {
					this.set("PrimaryCurrency", value);
				}, this);
		},

		//endregion

		//region Methods: Public

		/**
		 * Инициализирует миксин мультивалютного элемента управления.
		 */
		init: function() {
			this.initCurrencyRateList();
			this.initPrimaryCurrency();
		}

		//endregion

	});

	return Terrasoft.MultiCurrencyEditUtilities;
});