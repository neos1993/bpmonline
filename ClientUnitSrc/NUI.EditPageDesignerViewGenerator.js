define('EditPageDesignerViewGenerator', ['ext-base', 'terrasoft', 'sandbox', 'CardViewGenerator', 'ConfigurationEnums',
'EditPageDesignerViewGeneratorResources', 'EditPageDesignerHelper', 'ColumnHelper'],
function(Ext, Terrasoft, sandbox, CardViewGenerator, ConfigurationEnums,
	resources, EditPageDesignerHelper, ColumnHelper) {

	Ext.define('Terrasoft.Configuration.EditPageDesignerViewGenerator', {
		alternateClassName: 'Terrasoft.EditPageDesignerViewGenerator',
		extend: 'Terrasoft.CardViewGenerator',

		generateHeaderConfig: function() {
			var headerConfig = this.getContainerConfig('header', ['header']);
			var headerNameContainer = this.getContainerConfig('header-name-container', ['header-name-container']);
			var cardCommandLineContainer =
				this.getContainerConfig('card-command-line-container', ['card-command-line']);
			headerNameContainer.items = [{
				className: 'Terrasoft.Label',
				id: 'header-name',
				caption: {
					bindTo: 'getHeader'
				}
			}];
			headerConfig.items = [
				headerNameContainer,
				cardCommandLineContainer
			];
			return headerConfig;
		},

		generateTypesConfig: function() {
			var types = [];
			for (var typeName in ColumnHelper.Type) {
				var type = ColumnHelper.Type[typeName];
				types.push({
					caption: type.caption,
					tag: type,
					click: {
						bindTo: 'addNewColumn'
					}
				});
			}
			return types;
		},

		generateUtilsConfig: function() {
			var utilsConfig = this.getContainerConfig('utils');
			var utilsLeftConfig = this.getContainerConfig('utils-left');
			var firstButtonConfig = {
				className: 'Terrasoft.Button',
				caption: resources.localizableStrings.SaveButtonCaption,
				style: Terrasoft.controls.ButtonEnums.style.GREEN,
				click: {
					bindTo: 'save'
				}
			};
			utilsLeftConfig.items.push(firstButtonConfig);
			var secondButton = {
				className: 'Terrasoft.Button',
				style: Terrasoft.controls.ButtonEnums.style.DEFAULT,
				caption: resources.localizableStrings.CancelButtonCaption,
				click: {
					bindTo: 'cancel'
				}
			};
			utilsLeftConfig.items.push(secondButton);
			var typeItems = this.generateTypesConfig();
			var addButton = {
				className: 'Terrasoft.Button',
				style: Terrasoft.controls.ButtonEnums.style.DEFAULT,
				caption: resources.localizableStrings.AddColumnButtonCaption,
				menu: {
					items: [{
						caption: resources.localizableStrings.AddColumnMenuItemCaption,
						click: {
							bindTo: 'addColumn'
						}
					}, {
						caption: resources.localizableStrings.AddNewColumnMenuItemCaption,
						menu: {
							items: typeItems
						}
					}, {
						caption: resources.localizableStrings.AddGroupMenuItemCaption,
						click: {
							bindTo: 'addGroup'
						}
					}]
				}
			};
			utilsLeftConfig.items.push(addButton);
			var utilsRightConfig = this.getContainerConfig('utils-right');
			utilsConfig.items.push(utilsLeftConfig, utilsRightConfig);
			return utilsConfig;
		},

		getItemActionsConfig: function() {
			return [{
				className: 'Terrasoft.Button',
				style: Terrasoft.controls.ButtonEnums.style.BLUE,
				imageConfig: resources.localizableImages.UpButtonImage,
				tag: 'upField',
				tabIndex: -1,
				classes: {
					wrapperClass: ['designer-action-button']
				}
			}, {
				className: 'Terrasoft.Button',
				style: Terrasoft.controls.ButtonEnums.style.BLUE,
				imageConfig: resources.localizableImages.DownButtonImage,
				tag: 'downField',
				tabIndex: -1,
				classes: {
					wrapperClass: ['designer-action-button']
				}
			}, {
				className: 'Terrasoft.Button',
				style: Terrasoft.controls.ButtonEnums.style.BLUE,
				imageConfig: resources.localizableImages.LeftButtonImage,
				tag: 'moveLeft',
				tabIndex: -1,
				classes: {
					wrapperClass: ['designer-action-button']
				}
			}, {
				className: 'Terrasoft.Button',
				style: Terrasoft.controls.ButtonEnums.style.BLUE,
				imageConfig: resources.localizableImages.RightButtonImage,
				tag: 'moveRight',
				tabIndex: -1,
				classes: {
					wrapperClass: ['designer-action-button', 'designer-action-button-group-start']
				}
			}, {
				className: 'Terrasoft.Button',
				style: Terrasoft.controls.ButtonEnums.style.BLUE,
				imageConfig: resources.localizableImages.EditButtonImage,
				tag: 'edit',
				tabIndex: -1,
				classes: {
					wrapperClass: ['designer-action-button']
				}
			}, {
				className: 'Terrasoft.Button',
				style: Terrasoft.controls.ButtonEnums.style.BLUE,
				imageConfig: resources.localizableImages.HideButtonImage,
				tag: 'hide',
				tabIndex: -1,
				classes: {
					wrapperClass: ['designer-action-button']
				}
			}];
		},

		generateMainView: function() {
			var viewConfig = this.getContainerConfig('autoGeneratedContainer');
			var headerConfig = this.generateHeaderConfig();
			var utilsConfig = this.generateUtilsConfig();
			var blockerConfig = this.getContainerConfig('blockUIbackground');
			blockerConfig.visible = {
				bindTo: 'blockElementVisible'
			};
			viewConfig.items = [
				headerConfig,
				utilsConfig,
				blockerConfig
			];
			return viewConfig;

		},

		isEdit: function(action) {
			var isEdit = this.callParent(arguments);
			return isEdit || (action === ConfigurationEnums.CardState.EditStructure);
		},

		editStructureDefBindings: function(prop, item) {
			switch (prop) {
				case 'imageLoaded':
				case 'plainTextMode':
				case 'defaultFontFamily':
				case 'images':
				case 'value':
				case 'checked':
				case 'click':
					return null;
				case 'enabled':
					return false;
				case 'visible':
					return true;
				default:
					return item[prop];
			}
		},

		updateItemsForEditStructure: function(items) {
			Terrasoft.each(items, function(item) {
				if (item.className === 'Terrasoft.ControlGroup') {
					item.collapsed = false;
				}
				if (item.className === 'Terrasoft.controls.HtmlEdit') {
					item.className = 'Terrasoft.TextEdit';
					if (item.margin) {
						delete item.margin;
					}
				}
				item.enabled = false;
				for (var prop in item) {
					if (prop === 'items') {
						this.updateItemsForEditStructure(item.items);
						continue;
					}
					if (item[prop] && (item[prop].hasOwnProperty('bindTo') || prop === 'defaultFontFamily')) {
						var value = this.editStructureDefBindings(prop, item);
						if (value === null) {
							delete item[prop];
						} else {
							item[prop] = value;
						}
					}
				}
			}, this);
		},

		generateImageSchemaItemView: function() {
			var imageConfig = this.callParent(arguments);
			Ext.apply(imageConfig, {
				uploadButtonEnabled: false,
				clearButtonEnabled: false
			});
			return imageConfig;
		},

		getDesignLabelConfig: function(schemaItem) {
			return {
				caption: schemaItem.caption || '',
				className: 'Terrasoft.Label',
				classes: {
					labelClass: ['ts-controlgroup-wrap']
				},
				id: 'group-caption-' + schemaItem.name + this.instancePrefix,
				selectors: {
					wrapEl: '#group-caption-' + schemaItem.name + this.instancePrefix
				},
				tag: schemaItem.name
			};
		},

		generateGroupSchemaItemView: function(schemaItem, config) {
			var labelConfig = this.getDesignLabelConfig(schemaItem);
			var itemsContainer = this.getContainerConfig('fieldGroupContainer-' + schemaItem.name, [
				'ts-controlgroup-container',
				'ts-controlgroup-container-shown',
				'control-group-container'
			]);
			var itemConfig = Terrasoft.deepClone(config);
			Ext.apply(itemConfig, {
				container: itemsContainer,
				columnsObject: schemaItem.items
			});
			this.generateSchemaView(itemConfig);
			return [
				labelConfig,
				itemsContainer
			];
		},

		getTabbedContainerConfig: function(schemaItem) {
			var containerId = schemaItem.EditStructureContainerId;
			var wrapClasses = ['designer-item-container'];
			var schemaItemType = schemaItem.type;
			if (schemaItemType === Terrasoft.ViewModelSchemaItem.GROUP) {
				wrapClasses.push('ts-controlgroup-wrap');
			}
			if (schemaItemType === Terrasoft.ViewModelSchemaItem.DETAIL) {
				wrapClasses.push('ts-controlDetail-wrap');
			}
			var containerConfig = this.getContainerConfig(containerId, wrapClasses);
			containerConfig.tpl = [
				'<div id="{id}" style="{wrapStyles}" class="{wrapClassName}" tabindex="{tabIndex}">',
				'{%this.renderItems(out, values)%}',
				'</div>'
			];
			Ext.apply(containerConfig, {
				tag: {
					itemName: schemaItem.name,
					containerId: containerId
				},
				afterrender: {
					bindTo: 'containerRendered'
				},
				afterrerender: {
					bindTo: 'containerRendered'
				}
			});
			return containerConfig;
		},

		getDetailConfig: function(schemaItem) {
			return this.getDesignLabelConfig(schemaItem);
		},

		generateSchemaItemView: function(schemaItem) {
			var fieldContainer = this.getTabbedContainerConfig(schemaItem);
			if (schemaItem.info) {
				delete schemaItem.info;
			}
			var schemaItemViewConfig = this.callParent(arguments);
			Ext.Array.push(fieldContainer.items, schemaItemViewConfig);
			return fieldContainer;
		},

		generateSchemaView: function(config) {
			this.callParent(arguments);
			var container = config.container;
			var items = container.items;
			this.updateItemsForEditStructure(items);
		},

		getCustomElementConfig: function() {
			return null;
		},

		generateCardView: function(viewModelSchema, info) {
			var fullViewModelSchema = this.getFullViewModelSchema(viewModelSchema);
			var entitySchema = fullViewModelSchema.entitySchema;
			var customPanelConfig = this.getContainerConfig('autoGeneratedCustomContainer');
			var leftPanelConfig = this.getContainerConfig('autoGeneratedLeftContainer');
			var rightPanelConfig = this.getContainerConfig('autoGeneratedRightContainer');
			var action = ConfigurationEnums.CardState.EditStructure;
			if (fullViewModelSchema.schema.customPanel) {
				this.generateView(
					customPanelConfig,
					fullViewModelSchema.schema.customPanel,
					fullViewModelSchema.bindings,
					action,
					entitySchema,
					info);
			}
			this.generateView(
				leftPanelConfig,
				fullViewModelSchema.schema.leftPanel,
				fullViewModelSchema.bindings,
				action,
				entitySchema,
				info);
			this.generateView(
				rightPanelConfig,
				fullViewModelSchema.schema.rightPanel,
				fullViewModelSchema.bindings,
				action,
				entitySchema,
				info);
			var cardViewConfig = this.getContainerConfig('autoGeneratedCardViewContainer');
			cardViewConfig.items = [
				customPanelConfig,
				leftPanelConfig,
				rightPanelConfig
			];
			return cardViewConfig;
		},

		generate: function() {
			return this.generateMainView.apply(this, arguments);
		},

		generateCard: function() {
			return this.generateCardView.apply(this, arguments);
		}

	});

	var editPageViewGenerator = Ext.create('Terrasoft.EditPageDesignerViewGenerator');
	return editPageViewGenerator;

});
