var package=require("./src/package.js");

var api={
	packageApp: function(options){
		package(options);
	}
};

module.exports=api;
