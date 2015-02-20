var mozdownload=require("mozilla-download");
var Q=require("q");
var http=require("follow-redirects").http;
var fs=require("fs.extra");
var mkdirp=require("mkdirp");
var statusBar=require("status-bar");
var path = require ("path");
var Decompress=require("decompress");
var rimraf=require("rimraf");
var winston=require("winston");
var Liquid=require("liquid-node");
var engine=new Liquid.Engine();


function download(url,dest,callback){
	var file=fs.createWriteStream(dest);
	var bar;
	var request=http.get(url,function(response){
		bar = statusBar.create ({ total: response.headers["content-length"] }).on ("render", function (stats){
			process.stdout.write (
				path.basename (url) + " " +
				this.format.storage (stats.currentSize) + " " +
				this.format.speed (stats.speed) + " " +
				this.format.time (stats.elapsedTime) + " " +
				this.format.time (stats.remainingTime) + " [" +
				this.format.progressBar (stats.percentage) + "] " +
				this.format.percentage (stats.percentage));
			process.stdout.cursorTo (0);
		 });
		response.pipe(file);
		response.pipe(bar);
		response.on("end",callback);
	});
}

function downloadRuntime(options) {
	var url="http://releases.mozilla.org/pub/mozilla.org/xulrunner/releases/35.0.1/runtimes/xulrunner-35.0.1.en-US.linux-i686.tar.bz2";
	var defer=Q.defer();
	var bar;
	
	var file=fs.createWriteStream("./runtimes/xul-runner.tar.bz2");
	var request=http.get(url,function(response){
		bar = statusBar.create ({ total: response.headers["content-length"] }).on ("render", function (stats){
			process.stdout.write (
				path.basename (url) + " " +
				this.format.storage (stats.currentSize) + " " +
				this.format.speed (stats.speed) + " " +
				this.format.time (stats.elapsedTime) + " " +
				this.format.time (stats.remainingTime) + " [" +
				this.format.progressBar (stats.percentage) + "] " +
				this.format.percentage (stats.percentage));
			process.stdout.cursorTo (0);
		 });
		response.pipe(file);
		response.pipe(bar);
		response.on("end",function(){
			defer.resolve();
		});
	});
	
	return defer.promise;
}

function extractRuntime(options)
{
	winston.info("Extracting XUL Runner");
	var deferred=Q.defer();
	if(options.os=="win32")
	{
		var file="./runtimes/xul-runner.zip";
		var decompress=new Decompress()
			.src(file)
			.dest("./runtimes/xul-runner-win32")
			.use(Decompress.zip({strip: 1}));
		decompress.run(function(err,files){
			winston.info("Extracted XUL Runner");
			deferred.resolve();
		});
	}
	else
	{
		var file="./runtimes/xul-runner.tar.bz2";
		var decompress=new Decompress({mode: "777"})
			.src(file)
			.dest("./runtimes/xul-runner-"+options.os)
			.use(Decompress.tarbz2({strip: 1}));
		decompress.run(function(err,files){
			winston.info("Extracted XUL Runner");
			deferred.resolve();
		});
	}

	return deferred.promise;
}

function downloadNode(options)
{
	var defer=Q.defer();
	var url="http://nodejs.org/dist/v0.12.0/node-v0.12.0-linux-x86.tar.gz";
	var bar;
	
	var file=fs.createWriteStream("./runtimes/node.tar.gz");
	var request=http.get(url,function(response){
		bar = statusBar.create ({ total: response.headers["content-length"] }).on ("render", function (stats){
			process.stdout.write (
				path.basename (url) + " " +
				this.format.storage (stats.currentSize) + " " +
				this.format.speed (stats.speed) + " " +
				this.format.time (stats.elapsedTime) + " " +
				this.format.time (stats.remainingTime) + " [" +
				this.format.progressBar (stats.percentage) + "] " +
				this.format.percentage (stats.percentage));
			process.stdout.cursorTo (0);
		 });
		response.pipe(file);
		response.pipe(bar);
		response.on("end",function(){
			defer.resolve();
		});
	});
	
	return defer.promise;
}
function extractNode(promise,options)
{
	var deferred=Q.defer();
	winston.info("Extracting Node.js");
	var file="./runtimes/node.tar.gz";
	var decompress=new Decompress({mode: "777"})
		.src(file)
		.dest("./runtimes/node-tmp")
		.use(Decompress.targz({strip: 1}));
	decompress.run(function(err,files){
		winston.info("Extracted Node.js");
		fs.createReadStream("./runtimes/node-tmp/bin/node").pipe(fs.createWriteStream("./runtimes/node",{mode: 0777}));
		rimraf.sync("./runtimes/node-tmp");
		deferred.resolve();
	});
	return deferred.promise;
}

function useTemplate(options) {
	winston.info("Using template");
	mkdirp.sync("build");
	var templateOptions={
		name: options.name,
		vendor: options.vendor,
		version: options.appVersion,
		buildid: options.buildId,
		id: options.id,
		copyright: options.copyright,
		width: options.width,
		height: options.height
	};
	var appIniTemplate=fs.readFileSync("template/application.ini");
	var appIni=fs.createWriteStream("build/application.ini");
	engine.parseAndRender(appIniTemplate,templateOptions)
	.then(function(result){
		appIni.on("open",function(){
			appIni.write(result);
			appIni.end();
		});
	});
	fs.copy("template/chrome.manifest","build/chrome.manifest");
	fs.copy("template/chrome/chrome.manifest","build/chrome/chrome.manifest");
	mkdirp.sync("build/defaults/preferences");
	fs.copy("template/defaults/preferences/prefs.js","build/defaults/preferences/prefs.js");
	mkdirp.sync("build/chrome/content");
	fs.copy("template/chrome/content/app.js","build/chrome/content/app.js");
	mkdirp.sync("build/chrome/content/runtimes");
	fs.copy("runtimes/node","build/chrome/content/runtimes/node",function(){
		fs.chmodSync("build/chrome/content/runtimes/node","777");
	});
	fs.copyRecursive("runtimes/xul-runner-linux-i686","build/xulrunner",function(){});
	fs.copy("runtimes/xul-runner-linux-i686/xulrunner-stub","build/app",function(){
		fs.chmodSync("build/app","777");
	});
	fs.copyRecursive("app","build/chrome/content/app",function(){});
	//MAIN.XUL is TEMPLATE
	var mainXulTemplate=fs.readFileSync("template/chrome/content/main.xul");
	var mainXul=fs.createWriteStream("build/chrome/content/main.xul");
	engine.parseAndRender(mainXulTemplate,templateOptions)
	.then(function(result){
		mainXul.on("open",function(){
			mainXul.write(result);
			mainXul.end();
		});
	});
}

function packageApp(options)
{
	winston.info("Node XULRunner 0.1");
	
	fs.exists("./runtimes/ok",function(exist){
		if(exist){
			winston.info("Setup OK");
			useTemplate(options);
		}else{
			winston.warn("Creating setup");
			mkdirp.sync("runtimes");
			
			Q.fcall(function(){
				return downloadRuntime(options);
			}).then(function(){
				return extractRuntime(options);
			}).done();
			
			Q.fcall(function(){
				return downloadNode(options);
			}).then(function(){
				return extractNode(options);
			}).done();
			
			var ok=fs.createWriteStream("./runtimes/ok");
			ok.on("open",function(fd){
				ok.write("Setup OK\r\n");
				ok.end();
			});
			
		}
	});
}

module.exports=packageApp;
