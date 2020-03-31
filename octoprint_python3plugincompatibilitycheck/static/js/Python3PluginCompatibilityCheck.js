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
		self.errorMessage = ko.observable(false);
		self.checking = ko.observable(false);
		self.python_version = ko.observable(3.6);

		self.plugins = ko.observableArray([]);
		self.incompatible = ko.computed(function(){
			return ko.utils.arrayFilter(self.plugins(), function(item) {
				return self.pluginManagerViewModel.installedPlugins().includes(item.id()) && item.python_compat() == false;
			});
		});

		self.onSettingsHidden = function(){
			self.errorMessage(false);
			self.checking(false);
			self.plugins([]);
		};

		self.checkPlugins = function() {
			self.checking(true);
			$.ajax({
				url: API_BASEURL + "plugin/python3plugincompatibilitycheck",
				type: "GET",
				dataType: "json",
				data: {python_version:self.python_version()},
				contentType: "application/json; charset=UTF-8"
			}).done(function(data){
				self.plugins(ko.mapping.fromJS(data)());
				ko.utils.arrayForEach(self.incompatible(), function(item){
					var github_api_url = item.homepage().replace('https://github.com/','https://api.github.com/repos/');
					$.ajax({
						url: github_api_url,
						contentType: "application/json; charset=UTF-8"
					}).done(function(data){
						var last_updated = moment(data.pushed_at).format('L');
						$('#settings_plugin_python3plugincompatibilitycheck a').filter(function(){return $(this).attr('href').toLowerCase().indexOf(data.html_url.toLowerCase()) > -1}).after(' <small>(' + last_updated + ')</small>');
					}).fail(function(){
						self.errorMessage(true);
					}).always(function(){
						self.checking(false);
					});
				});
		})};
	};

	OCTOPRINT_VIEWMODELS.push({
		construct: Python3plugincompatibilitycheckViewModel,
		dependencies: [ "settingsViewModel", "pluginManagerViewModel" ],
		elements: [ "#settings_plugin_python3plugincompatibilitycheck" ]
	});
});
