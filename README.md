# node-xulrunner
![Travis CI](https://travis-ci.org/AdrianArroyoCalle/node-xulrunner.png)
Like NW.js and node-webkit but with Gecko using XUL Runner.

Use node.js for your local app and use the magic Node.js powers here.

## Usage

### Cloning

This package provides an API and templates. The easyest way to use it is running
```sh

git clone http://github.com/AdrianArroyoCalle/node-xulrunner 

```

Then you can put your app in the app/ folder, modify the test.js file and run

```sh

node test.js

```

### NPM API

We also provide an API for future tools like grunt-xulrunner or gulp-xulrunner

```sh

npm install node-xulrunner --save

```


```js

var xul=require("node-xulrunner");

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

```

But you must provide your own template folder.

# app/ structure

app/ is where your app lives. node-xulrunner loads the main.js file and then you have the control. Use Express if you like to serve the HTML pages.

