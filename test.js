var xul=require("./index.js");

var options={
	os: "linux-i686",
	version: "35.0.1",
	name: "Testing",
	vendor: "Adrián Arroyo",
	appVersion: "0.1.0",
	buildId: "00000001",
	id: "test@node-xulrunner",
	copyright: "2015 Adrián Arroyo Calle",
	width: 800,
	height: 600
};

xul.packageApp(options);
