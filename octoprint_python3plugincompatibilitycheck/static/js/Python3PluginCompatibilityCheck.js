/*
 * View model for Python 3 Plugin Compatibility Check
 *
 * Author: jneilliii
 * License: AGPLv3
 */
$(function() {
	function Python3plugincompatibilitycheckViewModel(parameters) {
		var self = this;

		self.settingsViewModel = parameters[0];
		self.pluginManagerViewModel = parameters[1];

		self.plugins = ko.observableArray([]);
		self.incompatible = ko.computed(function(){
			return ko.utils.arrayFilter(self.plugins(), function(item) {
				return self.pluginManagerViewModel.installedPlugins().includes(item.id()) && item.compatibility.python().indexOf('<4') < 0;
			});
		});

		self.onSettingsHidden = function(){
			self.plugins([]);
		};

		self.checkPlugins = function() {
			$.ajax({
				url: API_BASEURL + "plugin/python3plugincompatibilitycheck",
				contentType: "application/json; charset=UTF-8"
			}).done(function(data){
				self.plugins(ko.mapping.fromJS(data)());
				console.log(self.pluginManagerViewModel.installedPlugins());
				console.log(self.plugins());
		})};
	};

	OCTOPRINT_VIEWMODELS.push({
		construct: Python3plugincompatibilitycheckViewModel,
		dependencies: [ "settingsViewModel", "pluginManagerViewModel" ],
		elements: [ "#settings_plugin_python3plugincompatibilitycheck" ]
	});
});
