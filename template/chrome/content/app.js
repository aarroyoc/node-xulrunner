/**
 app.js - bridge between node and xul
*/
/**
 * TODO:
 * - Build script with liquid
 * - Copy folders
 * - Test app
 * - Sync Node and XUL
 * */

function startNode(){
	var FileUtils = Components.utils.import("resource://gre/modules/FileUtils.jsm").FileUtils;
	Components.utils.import("resource://gre/modules/Services.jsm");
	//var nsifile = new FileUtils.File("chrome://node-xulrunner/content/app/main.js");
	var file = Services.dirsvc.get("AChrom", Components.interfaces.nsIFile);
	file.append("content");
	file.append("runtimes");
	file.append("node");
	var nsifile = Services.dirsvc.get("AChrom", Components.interfaces.nsIFile);
	nsifile.append("content");
	nsifile.append("app");
	nsifile.append("main.js");
	var exe = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile);
	exe.initWithPath(file.path);
	var run = Components.classes['@mozilla.org/process/util;1'].createInstance(Components.interfaces.nsIProcess);
	run.init(exe);
	var parameters=[nsifile.path];
	run.runAsync(parameters,parameters.length);
	
	function QuitObserver()
	{
	  this.register();
	}
	QuitObserver.prototype = {
	  observe: function(subject, topic, data) {
		  console.log("QUIT");
		 run.kill();
	  },
	  register: function() {
		var observerService = Components.classes["@mozilla.org/observer-service;1"]
							  .getService(Components.interfaces.nsIObserverService);
		observerService.addObserver(this, "quit-application", false);
	  },
	  unregister: function() {
		var observerService = Components.classes["@mozilla.org/observer-service;1"]
								.getService(Components.interfaces.nsIObserverService);
		observerService.removeObserver(this, "quit-application");
	  }
	}
	var observer=new QuitObserver();
}

function openNodeSite() {
	var navigator=document.getElementById("navigator");
	setTimeout(function(){
		navigator.loadURI("http://localhost:4200");
	},5000);
}
