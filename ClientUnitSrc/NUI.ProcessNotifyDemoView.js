define('ProcessNotifyDemoView', ['ext-base', 'terrasoft', 'sandbox',
		'ProcessNotifyDemoViewResources'],
	function(Ext, Terrasoft, sandbox, resources) {

		function getFullViewModelSchema(sourceViewModelSchema) {
			var viewModelSchema = Terrasoft.utils.common.deepClone(sourceViewModelSchema);
			return viewModelSchema;
		}

		function getContainerConfig(id) {
			return {
				className: 'Terrasoft.Container',
				items: [],
				id: id,
				selectors: {
					wrapEl: '#' + id
				}
			};
		}

		function getServerLogContainer() {
			return document.getElementById('autoGeneratedContainer');
		}

		function generateMainView(viewModelSchema) {
			var viewConfig = getContainerConfig('autoGeneratedContainer');
			var headerConfig = getContainerConfig('header');
			headerConfig.items = [
				{
					className: 'Terrasoft.Component',
					id: 'header-name',
					html: '<div id="header-name" class="header-name"></div>',
					selectors: {
						wrapEl: '#header-name'
					}
				}
			];
			viewConfig.items = [headerConfig];
			return viewConfig;
		}

		return {
			generateMainView: generateMainView,
			getServerLogContainer: getServerLogContainer
		};
	});