# coding=utf-8
from __future__ import absolute_import

import octoprint.plugin
from octoprint.util import version
import requests
import flask

class Python3plugincompatibilitycheckPlugin(octoprint.plugin.SettingsPlugin,
											octoprint.plugin.AssetPlugin,
											octoprint.plugin.TemplatePlugin,
											octoprint.plugin.SimpleApiPlugin):

	##~~ SettingsPlugin mixin

	def get_settings_defaults(self):
		return dict(
			# put your plugin's default settings here
		)

	##~~ AssetPlugin mixin

	def get_assets(self):
		# Define your plugin's asset files to automatically include in the
		# core UI here.
		return dict(
			js=["js/Python3PluginCompatibilityCheck.js"]
		)

	# def onClientOpened(self):
		# self._plugin_manager.send_plugin_message(self._identifier, dict(plugins=response))

	# def get_api_commands(self):
		# return dict()

	def on_api_get(self, request):
		webresponse = requests.get("https://plugins.octoprint.org/plugins.json")
		plugins = webresponse.json()
		if request.args.get("python_version"):
			check_against = request.args.get("python_version")
			for entry in plugins:
				to_check = entry.get("compatibility", dict()).get("python", ">=2.7,<3")
				entry["python_compat"] = version.is_python_compatible(to_check, python_version=check_against)
		return flask.jsonify(plugins)

	##~~ Softwareupdate hook

	def get_update_information(self):
		# Define the configuration for your plugin to use with the Software Update
		# Plugin here. See https://docs.octoprint.org/en/master/bundledplugins/softwareupdate.html
		# for details.
		return dict(
			Python3PluginCompatibilityCheck=dict(
				displayName="Python 3 Check",
				displayVersion=self._plugin_version,

				# version check: github repository
				type="github_release",
				user="jneilliii",
				repo="OctoPrint-Python3PluginCompatibilityCheck",
				current=self._plugin_version,

				# update method: pip
				pip="https://github.com/jneilliii/OctoPrint-Python3PluginCompatibilityCheck/releases/download/{target_version}/{target_version}.zip"
			)
		)

__plugin_name__ = "Python 3 Check"
__plugin_pythoncompat__ = ">=2.7,<3" # only python 2

def __plugin_load__():
	global __plugin_implementation__
	__plugin_implementation__ = Python3plugincompatibilitycheckPlugin()

	global __plugin_hooks__
	__plugin_hooks__ = {
		"octoprint.plugin.softwareupdate.check_config": __plugin_implementation__.get_update_information
	}

