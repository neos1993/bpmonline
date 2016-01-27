define("UserQuestionProcessElementPage", ["ext-base", "terrasoft", "sandbox", "Activity",
	"UserQuestionProcessElementPageResources", "LoadProcessModules", "ProcessModule", "LookupUtilities",
	"ProcessModuleUtilities", "CardModule"],
	function(Ext, Terrasoft, sandbox, Activity, resources, LoadProcessModules, ProcessModule, LookupUtilities,
		ProcessModuleUtilities, CardModule) {
		var processElementUId = null;
		var executionData = null;
		var isProcessMode = true;
		var viewModel = null;
		var viewConfig;

		function getContainerConfig(id) {
			return {
				className: "Terrasoft.Container",
				items: [],
				id: id,
				selectors: {
					wrapEl: "#" + id
				}
			};
		}

		function getViewConfigItems(items) {
			if (executionData.decisionMode === 0) {
				addRadioButtonEditConfigs(items, executionData.decisionOptions);
			} else {
				addCheckBoxEditConfigs(items, executionData.decisionOptions);
			}
		}

		function addCheckBoxEditConfigs(items, decisionOptions) {
			var i = 0;
			Terrasoft.each(decisionOptions, function(decisionOption) {
				var tagValue = "questionOption";
				var container = getContainerConfig("checkBoxContainer" + i);
				container.classes = {
					wrapClassName: "custom-view-container"
				};
				container.items.push(
					{
						className: "Terrasoft.CheckBoxEdit",
						classes: {
							wrapClass: ["custom-control-container"]
						},
						tag: tagValue,
						checked: {
							bindTo: decisionOption.Name.toString()
						}
					}
				);
				container.items.push(
					{
						className: "Terrasoft.Label",
						classes: {
							labelClass: "t-label custom-label-container"
						},
						caption: decisionOption.Caption,
						tag: tagValue
					}
				);
				items.push(container);
				i++;
			});
		}

		function addRadioButtonEditConfigs(items, decisionOptions) {
			var i = 0;
			Terrasoft.each(decisionOptions, function(decisionOption) {
				var tagValue = decisionOption.Name;
				var container = getContainerConfig("checkBoxContainer" + i);
				container.classes = {
					wrapClassName: "custom-view-container"
				};
				container.items.push(
					{
						className: "Terrasoft.RadioButton",
						classes: {
							wrapClass: ["custom-control-container"]
						},
						tag: tagValue,
						checked: {
							bindTo: "radioButtonsGroup"
						}
					}
				);
				container.items.push(
					{
						className: "Terrasoft.Label",
						caption: decisionOption.Caption,
						classes: {
							labelClass: "t-label custom-label-container"
						},
						tag: tagValue
					}
				);
				items.push(container);
				i++;
			});
		}

		function getResultDecisions() {
			var resultDecisions = [];
			if (executionData.decisionMode === 0) {
				var decisionName = viewModel.get("radioButtonsGroup");
				Terrasoft.each(executionData.decisionOptions, function(decisionOption) {
					if (decisionOption.Name === decisionName) {
						resultDecisions.push(decisionOption.Id);
					}
				});
			} else {
				Terrasoft.each(executionData.decisionOptions, function(decisionOption) {
					var value = viewModel.get(decisionOption.Name.toString());
					if (value === true) {
						resultDecisions.push(decisionOption.Id);
					}
				});
			}
			return resultDecisions;
		}

		function getView() {
			viewConfig = getContainerConfig("autoGeneratedContainer");
			var headerConfig = getContainerConfig("header");
			Ext.apply(headerConfig, {
				classes: {
					wrapClassName: ["header"]
				}
			});
			headerConfig.items = [
				{
					className: "Terrasoft.Container",
					id: "header-name-container",
					classes: {
						wrapClassName: ["header-name-container"]
					},
					selectors: {
						wrapEl: "#header-name-container"
					},
					items: [
						{
							className: "Terrasoft.Label",
							id: "header-name",
							caption: resources.localizableStrings.HeaderCaption
						}
					]
				},
				{
					className: "Terrasoft.Container",
					id: "card-command-line-container",
					classes: {
						wrapClassName: ["card-command-line"]
					},
					selectors: {
						wrapEl: "#card-command-line-container"
					},
					items: []
				}
			];
			var utilsConfig = getContainerConfig("utils");
			var buttonConfig = {
				className: "Terrasoft.Button"
			};
			var firstButtonConfig = {
				caption: resources.localizableStrings.OkButtonCaption,
				style: Terrasoft.controls.ButtonEnums.style.GREEN,
				click: {
					bindTo: "ok"
				}
			};
			var buttonsConfig = [];
			buttonsConfig.push(Ext.apply({}, firstButtonConfig, buttonConfig));
			var delayExecutionButton = Ext.apply({}, {
				caption: resources.localizableStrings.DoLaterButtonCaption,
				style: Terrasoft.controls.ButtonEnums.style.DEFAULT,
				visible: {
					bindTo: "delayExecutionButtonVisible"
				},
				click: {
					bindTo: "delayExecution"
				}
			}, buttonConfig);
			buttonsConfig.push(delayExecutionButton);
			var secondButton = Ext.apply({}, {
				style: Terrasoft.controls.ButtonEnums.style.DEFAULT,
				caption: resources.localizableStrings.CancelButtonCaption,
				click: {
					bindTo: "cancel"
				}
			}, buttonConfig);
			buttonsConfig.push(secondButton);
			buttonsConfig.push({
				className: "Terrasoft.Button",
				visible: false,
				style: Terrasoft.controls.ButtonEnums.style.DEFAULT,
				caption: resources.localizableStrings.GotoButtonCaption,
				menu: {
					items: []
				}
			});
			var utilsLeftConfig = getContainerConfig("utils-left");
			utilsLeftConfig.items = buttonsConfig;
			utilsConfig.items.push(utilsLeftConfig);
			var customPanelConfig = getContainerConfig("autoGeneratedCustomContainer");
			Ext.apply(customPanelConfig, {
				styles: {
					wrapStyles: {
						width: "100%"
					}
				}
			});
			var leftPanelConfig = getContainerConfig("autoGeneratedLeftContainer");
			Ext.apply(leftPanelConfig, {
				styles: {
					wrapStyles: {
						width: "280px",
						"float": "left"
					}
				},
				items: [
					{
						className: "Terrasoft.Label",
						classes: {
							labelClass: ["user-question-text"]
						},
						caption: {
							bindTo: "questionText"
						}
					}
				]
			});
			getViewConfigItems(leftPanelConfig.items);
			var rightPanelConfig = getContainerConfig("autoGeneratedRightContainer");
			Ext.apply(rightPanelConfig, {
				styles: {
					wrapStyles: {
						"margin-left": "327px"
					}
				},
				items: [
					getContainerConfig("processExecutionContextContainer")
				]
			});
			viewConfig.items = [
				headerConfig,
				getContainerConfig("process-reminder"),
				utilsConfig,
				getContainerConfig("delay-execution")
			];
			viewConfig.items = Ext.Array.merge(viewConfig.items,
				[customPanelConfig, leftPanelConfig, rightPanelConfig]);
			/*
			BusinessRuleModule.prepareViewRule(fullViewModelSchema, info.rules);
			if (fullViewModelSchema.schema.customPanel) {
			generateView(customPanelConfig, fullViewModelSchema.schema.customPanel,
			fullViewModelSchema.bindings, action);
			}
			generateView(rightPanelConfig, fullViewModelSchema.schema.rightPanel,
			fullViewModelSchema.bindings, action);
			*/
			return Ext.create("Terrasoft.Container", viewConfig);
		}

		function getViewModel() {
			var properties = {
				questionText: executionData.questionText,
				isDecisionRequired: executionData.isDecisionRequired,
				radioButtonsGroup: null
			};
			var i = 0;
			if (executionData.decisionMode === 0) {
				Terrasoft.each(executionData.decisionOptions, function(decisionOption) {
					if (decisionOption.DefChecked === true) {
						properties.radioButtonsGroup = decisionOption.Name;
					}
					i++;
				});
			} else {
				Terrasoft.each(executionData.decisionOptions, function(decisionOption) {
					if (decisionOption.DefChecked === true) {
						properties[decisionOption.Name.toString()] = true;
					} else {
						properties[decisionOption.Name.toString()] = false;
					}
					i++;
				});
			}
			var viewModel = Ext.create("Terrasoft.BaseViewModel", {
				values: properties,
				methods: {
					delayExecution: function() {
						var delayExecutionContainer = Ext.get("delay-execution");
						sandbox.loadModule("DelayExecutionModule", {
							renderTo: delayExecutionContainer
						});
					},
					ok: function() {
						var resultDecisions = getResultDecisions(this);
						if (resultDecisions.length === 0 && properties.isDecisionRequired === true) {
							this.showInformationDialog(resources.localizableStrings.WarningMessage);
							return false;
						}
						resultDecisions = Ext.encode(resultDecisions);
						ProcessModule.services.completeExecution(this, processElementUId,
							"?ResultDecisions=" + resultDecisions,
							function(success, completeExecutionData) {
								var currentState = sandbox.publish("GetHistoryState");
								var state = currentState.state || {};
								var executionData = state.executionData;
								var count = ProcessModuleUtilities.getProcExecDataCollectionCount(executionData);
								if ((completeExecutionData && completeExecutionData.nextPrcElReady) ||
										(count === 1 && executionData.currentProcElUId !== processElementUId)) {
									if (executionData.previousProcElUId &&
											executionData.previousProcElUId.procElUId === processElementUId) {
										delete executionData.previousProcElUId;
									}
									return;
								} else {
									if (count === 0 || (count === 1 &&
										executionData.currentProcElUId === processElementUId)) {
										Terrasoft.Router.back();
									} else if (count > 1) {
										ProcessModule.changeNextProcExecDataHistoryState(executionData);
									}
								}
							});
					},
					cancel: function() {
						Terrasoft.Router.back();
					}
				}
			});
			return viewModel;
		}

		function replaceHistoryState(state) {
			var currentHash = state.hash;
			var currentState = state.state || {};
			if (currentState.moduleId === sandbox.id) {
				return;
			}
			var newState = Terrasoft.deepClone(currentState);
			newState.moduleId = sandbox.id;
			sandbox.publish("ReplaceHistoryState", {
				stateObj: newState,
				pageTitle: null,
				hash: currentHash.historyState,
				silent: true
			});
		}

		function loadCommandLine() {
			var commandLineContainer = Ext.get("card-command-line-container");
			sandbox.loadModule("CommandLineModule", {
				renderTo: commandLineContainer
			});
		}

		function init() {
			var state = sandbox.publish("GetHistoryState");
			replaceHistoryState(state);
		}

		function render(renderTo) {
			var view = null;
			if (viewModel) {
				//var config = Terrasoft.deepClone(viewConfig);
				//var genView = Ext.create(config.className || "Terrasoft.Container", config);
				view = getView();
				view.bind(viewModel);
				view.render(renderTo);
				//requiredLabelReset(viewModel);
				return;
			}
			executionData = sandbox.publish("GetProcessExecData");
			if (Array.isArray(executionData)) {
				executionData = executionData[executionData.currentItemIndex];
			}
			if (!Ext.isEmpty(executionData) && !Ext.isEmpty(executionData.activityRecordId)) {
				processElementUId = executionData.procElUId;
				view = getView();
				sandbox.subscribe("OpenCardModule", function(args) {
					viewModel.scrollTo = document.body.scrollTop || document.documentElement.scrollTop;
					var params = sandbox.publish("GetHistoryState");
					sandbox.publish("PushHistoryState", {hash: params.hash.historyState});
					sandbox.loadModule("CardModule", {
						renderTo: renderTo,
						id: args,
						keepAlive: true
					});
				}, [sandbox.id]);
				viewModel = getViewModel();
				viewModel.set("isProcessMode", isProcessMode);
				viewModel.set("delayExecutionButtonVisible",
					LoadProcessModules.isDelayExecutionButtonVisible(sandbox, isProcessMode));
				view.bind(viewModel);
				view.render(renderTo);
				LoadProcessModules.loadProcessModules(sandbox, isProcessMode);
				loadCommandLine();
			}
			sandbox.subscribe("ShowLookupPage", function(config) {
				LookupUtilities.Open(sandbox, config, function(args) {
					sandbox.publish("LookupResultSelected", args);
				}, this, renderTo);
			}, [sandbox.id]);
		}

		return {
			init: init,
			render: render
		};

	});