// npm install express
// npm install socket.io

//var sys         = require('sys'),
 //       express = require('express');
 //       app         = express.createServer('127.0.0.1'),
 //       io          = require('socket.io'); 
 
var app = require('express')();
var http = require('http').Server(app);
var https = require('https');
var io = require('socket.io')(http);
var mkdirp = require('mkdirp');
var express = require('express');
var fs = require('fs');

var options = {
		  key: fs.readFileSync(__dirname + '/keys/key.pem'),
		  cert: fs.readFileSync(__dirname + '/keys/cert.pem')
};

//var useroffset = 1700;
//var forumid = 37;
//var time = '2015-6-5 21:00:00pm EST';
//var forumstr = '25AF07EB-98AB-2AD9-295975CAC7A76974'; r

var useroffset = "";
var forumid = "";
var time = "";
var forumstr = ""; 
var prefix = "";
var dir = "";

fs.readFile(__dirname + "\\settings.json", function (err, data) {
	   ans = JSON.parse(data);
	   
	   useroffset = ans.useroffset;
	   forumid = ans.forumid;
	   time = ans.time;
	   forumstr = ans.forumstr; //t
	   prefix = ans.prefix;
	   console.log(forumid);
	   mkdirp(__dirname+"\\"+forumid+"\\", function(err) { });
	   mkdirp(__dirname+"\\"+forumid+"\\click\\", function(err) { });
	   mkdirp(__dirname+"\\"+forumid+"\\emails\\", function(err) { });
	   mkdirp(__dirname+"\\"+forumid+"\\proposal\\", function(err) { });
	   mkdirp(__dirname+"\\"+forumid+"\\pretest\\", function(err) { });
	   mkdirp(__dirname+"\\"+forumid+"\\posttest\\", function(err) { });
	   mkdirp(__dirname+"\\"+forumid+"\\step1\\", function(err) { });
	   mkdirp(__dirname+"\\"+forumid+"\\step2\\", function(err) { });
	   mkdirp(__dirname+"\\"+forumid+"\\step3\\", function(err) { });
	   mkdirp(__dirname+"\\"+forumid+"\\step4\\", function(err) { });
	   mkdirp(__dirname+"\\"+forumid+"\\step5\\", function(err) { });
	   mkdirp(__dirname+"\\"+forumid+"\\grouping\\", function(err) { });
	   dir = __dirname+"\\"+forumid+"\\";
});

var cntuser = 0;
var map = {};
var idmap = {};
var url = require('url');
var tfidf = require('./tfidf.js');
app.use(express.static(__dirname + '/public'));
var ntfidf = require('./tfidf-new.js');
var memePicker = require('./memePicker.js');
var request = require('request');
//java -cp DocClustering.jar clustering.DocClustering
var parseString = require('xml2js').parseString;
var xml2js = require('xml2js');
var xpath = require("xml2js-xpath");
var newxpath = require('xpath'),
dom = require('xmldom').DOMParser;
var child_process = require('child_process');
var totaluser = 0;
var memePicker = child_process.spawn("java", ["-cp", "DocClustering.jar", "clustering.DocClustering"],
{
    cwd: __dirname
});
var cnt = 1;

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}


function run_cmd_noinput(cmd, callBack ) {
 //   var spawn = require('child_process').spawn;
 //   var child = spawn(cmd, args);
 //   var resp = "";
 //   callBack("done"); 
	
	var exec = require('child_process').exec;
	var child = exec(cmd);
	
	child.on('exit', function(code, signal) {
	    console.log('closing code: ' + code+'  '+signal);
	    
	    callBack("done"); 
	});
} 


function run_cmd_onlyonce(cmd, str, callBack ) {
	
	  var filename = dir + "grouping/result_"+str+".json";
	  fs.exists(filename, function(exists) {
		  if (exists) {
			  
		    fs.readFile(filename, function (err, data) {

		        if (err) {
		            console.log("filename wrong " + filename);
		          
		        } try {               
		           ans = JSON.parse(data);
		           console.log(ans.result+"   here");
		           callBack(ans.result);
		           
		        } catch (e) {
		            console.error("run_cmd: Error reading file " + filename+"  "+e);
		        }
		    }); 
		  }else {
			  console.log("not exist!!");
			    var exec = require('child_process').exec;
				var child = exec(cmd);
				sleep(2500);
				child.on('exit', function(code, signal) {
				   
				    fs.readFile(filename, function (err, data) {

				        if (err) {
				            console.log("filename wrong " + filename);
				          
				        } try {               
				           ans = JSON.parse(data);
				           console.log(ans.result+"   here");
				           callBack(ans.result);
				           
				        } catch (e) {
				            console.error("run_cmd: Error reading file " + filename+"  "+e);
				        }
				    }); 
				});
			 
		  }
		});
	
  /*  var spawn = require('child_process').spawn;
    var child = spawn(cmd, args);
    var resp = "";
    child.stdin.write(str + "\n");
    child.stdout.on('data', function (buffer) { resp += buffer.toString(); });  	
       
    str = str.replace("\\\\","");
			str = str.replace("/","");
			str = str.replace(":","");
			str = str.replace("\\*","");
			str = str.replace("\\?","");
			str = str.replace("\"","");
			str = str.replace("<","");
			str = str.replace(">","");
			str = str.replace("|","");
		sleep(1000);
		//for mac
  //   var filename =__dirname + "/result_"+str+".json";
  
    fs.readFile(filename, function (err, data) {

        if (err) {
            console.log("filename wrong " + filename);
          
        } try {               
            ans = JSON.parse(data);
           console.log(ans.result+"   here");
           callBack(ans.result);
           
        } catch (e) {
            console.error("run_cmd: Error reading file " + filename+"  "+e);
        }
    });  */
  	//child.stdout.on('end', function() {  console.log("resp  "+resp); callBack (resp); });    	
} 


function run_cmd(cmd, args, str, callBack ) {
    var spawn = require('child_process').spawn;
    var child = spawn(cmd, args);
    var resp = "";
    child.stdin.write(str + "\n");
    child.stdout.on('data', function (buffer) { resp += buffer.toString(); });  	
       
    str = str.replace("\\\\","");
			str = str.replace("/","");
			str = str.replace(":","");
			str = str.replace("\\*","");
			str = str.replace("\\?","");
			str = str.replace("\"","");
			str = str.replace("<","");
			str = str.replace(">","");
			str = str.replace("|","");
		sleep(2000);
		//for mac
  //   var filename =__dirname + "/result_"+str+".json";
    var filename = dir + "grouping/result_"+str+".json";
    fs.readFile(filename, function (err, data) {

        if (err) {
            console.log("filename wrong " + filename);
          
        } try {               
            ans = JSON.parse(data);
           console.log(ans.result+"   here");
           callBack(ans.result);
           
        } catch (e) {
            console.error("run_cmd: Error reading file " + filename+"  "+e);
        }
    }); 
  	//child.stdout.on('end', function() {  console.log("resp  "+resp); callBack (resp); });    	
} 


function kmeanscluster() {

  // Data source: LinkedIn
  // Initial data are businesses that need to be clustered according to their size (nb of employees) and revenue (in mln$)

  var data = [ 
      {'company': 'Microsoft' , 'size': 91259, 'revenue': 60420},
      {'company': 'IBM' , 'size': 400000, 'revenue': 98787},
      {'company': 'Skype' , 'size': 700, 'revenue': 716},
      {'company': 'SAP' , 'size': 48000, 'revenue': 11567},
      {'company': 'Yahoo!' , 'size': 14000 , 'revenue': 6426 },
      {'company': 'eBay' , 'size': 15000, 'revenue': 8700},
   ] ;

  // Create the labels and the vectors describing the data

  var labels = new Array ;
  var vectors = new Array ;
  for (var i = 0 ; i < data.length ; i++) {
      labels[i] = data[i]['company'] ;
      vectors[i] = [ data[i]['size'] , data[i]['revenue']] ;
  }

  var vector = [ 500 , 1000] ;
  var root = figue.kmeans (3, vectors);
  console.log(root.centroids);
  var best = whichcluster(root.centroids,vector);
  console.log(best);
}

function euclidianDistance (vec1 , vec2) {
                var N = vec1.length ;
                var d = 0 ;
                for (var i = 0 ; i < N ; i++)
                        d += Math.pow (vec1[i] - vec2[i], 2)
                d = Math.sqrt (d) ;
                return d ;
}

function whichcluster(centroids,vector)
{
	   var best ;
	 var mindist = Number.MAX_VALUE ;
     for (var j = 0 ; j < centroids.length ; j++) {
       dist = euclidianDistance(centroids[j], vector)
       if (dist < mindist) {
         mindist = dist ;
             best = j ;
        }
    }
    
    return best;
}


app.get('/feedback.html', function (req, res) {
	//http://luoyang.lti.cs.cmu.edu:5000/pretask.html?wid=try&nickname=try&ansmetal=no&anstourist=yes&ansbird=no&ansgas=yes&ansreliable=no&ansfarm=no&anssafe=no&anssustain=yes&ansstorage=no&userforumurl=5
	var serverdate = new Date().getTime();
	
	console.log(req.url);
	cntuser++;
	var uid = url.parse(req.url, true).query.userforumurl;
	var turkid = url.parse(req.url, true).query.wid;
	var nickname = url.parse(req.url, true).query.nickname;
	var energy = ["coal","wind","nuclear","hydro"];
//	var ans = ["","","","","","","",""];
	var pretest= ""+url.parse(req.url,true).query.pretest;
//	ans[0] = url.parse(req.url, true).query.ansbudget;
//	ans[1] = url.parse(req.url, true).query.ansmetal;
//	ans[2]= url.parse(req.url, true).query.anstourist;
////	ans[3] = url.parse(req.url, true).query.ansbird;
//	ans[3] = url.parse(req.url, true).query.ansgas;
//	ans[4]= url.parse(req.url, true).query.ansreliable;
//	ans[5]= url.parse(req.url, true).query.ansfarm;
//	ans[6]= url.parse(req.url, true).query.anssustain;
	
	var correct_ans = [["yes","no","i","no","yes","i","no"],
	           ["yes","yes","no","yes","no","yes","yes"],
	           ["no","no","i","yes","yes","i","no"],
	           ["no","yes","no","yes","yes","i","yes"]];
	var req = ["1. This city has a tight energy budget.",
	           "2. The city is concerned with heavy metal waste.",
	           "3. The city is a famous tourist city for its natural bird and fish habitats.", 
	           "4. The city is trying to reduce greenhouse gas emissions.",
	           "5. The city needs a stable and reliable energy source.",
	           "6. The city is near the coast.",
	           "7. The city prefers renewable energy."];
	var reason = [["Coal is the cheapest energy source.",
				"Wind is a cheap energy source.",
				"It is expensive to build a nuclear power plant.",
				"It is expensive to build a hydro power plant."],
				["Coal power produces heavy metal waste.",
				"Wind is a clean energy source.",
				"Nuclear power can have heavy metal waste.",
				"Hydro power is a clean energy."],
				["Coal power is irrelevant to this character.",
				"Wind turbine can be harmful to birds.",
				"Nuclear power is irrelevant to this character.",
				"Hydro power plant can change landscape dramatically."],	      	        
				["Coal power emits greenhouse gas.",
				"Wind power is carbon neutral.",
				"Nuclear power is carbon neutral.",
				"Hydro power is carbon neutral."],
				["Coal power is stable.",
				"Wind power can be sporadic.",
				"Nuclear power is stable.",
				"Hydro power is stable."],
				["Coal power is irrelevant to this character.",
				"Wind farms can often be built offshore.",
				"Nuclear power is irrelevant to this character.",
				"Hydro power is irrelevant to this character."],
				["Coal power is not a renewable energy.",
				"Wind power is renewable.",
				"Nuclear power is not a renewable energy.",
				"Hydro power is renewable."]];
	fs.writeFile( dir + "pretest/"+uid+".json", JSON.stringify(pretest), function (err) { if (err) { console.log("Error writing logs"); console.log(err); } });
		
	res.send('<html>\n<head>\n<style>\n'+
			 '.hiddeninput { visibility: hidden;}\n'+
			    '#header {\n'+
			    'background-color:gray;\n'+
			    'color:white;\n'+
			    'padding:3px;\n'+
				'}\n'+
				'#nav {\n'+
				    'line-height:30px;\n'+
				    'color:black;\n'+
				    'width:80%;\n'+
				    'float:middle;\n'+
				    'padding:5px;\n'+	      
				'}\n'+
				'#section {\n'+
				    'width:30%;\n'+
				    'float:left;\n'+
				    'color:black;\n'+
				    'padding:10px;\n'+	 	 
				'}\n'+
				'.textfield {\n'+
				  'position: relative;\n'+
				'}\n'+
				'.textfield .hint {\n'+
				  'display: none;\n'+
				  'position: absolute;\n'+
				  'width: 10em;\n'+
				  'bottom: 1.0em;\n'+
				  'left: 4.0em;\n'+
				  'background: #ff9;\n'+
				  'padding: 0 0.2em;\n'+
				  'border: solid 1px;\n'+
				'}\n'+
		    '</style>\n<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js">\n</script>\n'+
				'<link rel="stylesheet" href="/compiled/flipclock.css">\n<script src="/compiled/flipclock.js"></script>\n'+
				'</head>\n'+
				'<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>\n'+
				  '<script src="/socket.io/socket.io.js"></script>\n'+
				  '<link rel="stylesheet" href="./compiled/flipclock.css">\n'+
				  '<script src="./compiled/flipclock.js"></script>\n'+
				  '<script>\n'+
				 
				  'var contents = [\'</div><p><b>Coal energy</b> refers to power produced by coal burning generators or industrial applications using large amounts of coal for heat, including steel manufacturing. Coal is a mineral found in abundance in most parts of the world, thus it is an economical energy source. </p><p><strong>Pros of coal energy</strong></p><p>Coal is cheap and plentiful in many areas of the world, including Europe and North America. Coal deposits are typically located close to the surface and cover large areas, allowing many coal mines to operate for decades using relatively safe and inexpensive mining techniques.</p><p><strong>Large deposits of coal available</strong></p><p>There are plentiful coal supplies in Western countries for many decades, which can be used for power generation and manufacturing use. This fact helps decrease the dependence on Middle Eastern oil. The United States has massive coal deposits, many of which have been mined for years with no end in site.</p><p><strong>Safe and easy to store</strong></p><p>Coal is very stable and can be stored and transported safely. Oil, natural gas, hydrogen and other volatile fuels can be explosive and must be handled and stored carefully.</p><p><strong>Easily converted to energy</strong></p><p>Coal production doesn&#8217;t require extensive secondary technologies to produce a useable fuel. Coal obtained directly from the mine is a very effective fuel for both the generation of electricity and in the manufacturing of steel.</p><p><strong>New technologies allows greater use and application</strong></p><p>Powdered, gaseous and liquid coal products have been developed that burn cleaner and hotter than conventional coal.</p><p><strong>Cons of coal energy</strong></p><p>Coal is a major source of several pollutants including carbon dioxide, a green house gas, and sulfur dioxide, a component of acid rain.</p><p><strong>Speeds up global warming</strong></p><p>Coal use in industry and power production is one of the major contributors to global warming by the industrial world. Both the heat from burning the coal and the greenhouse gases released during combustion are counted as major factors in the global warming crisis.</p><p><strong>Polluting chemicals that are dangerous for health</strong></p><p>Other toxins are released from the burning of coal that can be dangerous to the health of nearby populations. People with asthma are particularly sensitive to many of these pollutants.</p><p><strong>It is still non-renewable</strong></p><p>While coal reserves exist that will last for many decades, it is a non-renewable fossil fuel and will eventually be consumed. Coal is produced over eons of time under extreme conditions. It can&#8217;t be synthesized from contemporary carbon sources.</p><p><strong>Devastating environmental effects</strong></p><p>Coal mining techniques are often very damaging to the surrounding natural habitats. Strip mining is one of the most environmentally devastating mining procedures, is a common way of getting at coal deposits.</p><p><strong>Mining accidents</strong></p><p>While coal is located close to the surface, maintaining a stable mine structure requires leaving valuable coal intact. The urge to cut the safety factor as close as possible makes coal mines prone to cave ins and this can lead to the lost of human lives.</p><p><strong>Transportation of coal can be costly</strong></p><p>While coal can be transported safely, it is a very heavy and bulky load. Providing coal supplies to areas where coal is not available is very expensive. Much of the world’s coal supply is moved over water, especially between large exporting countries like Australia to large importing countries like China.</p><div class="adsw clear">\',\n'+
				  '\'</div><p><b>Wind energy</b> refers primarily to electrical power created by wind powered generators.</p><p><strong>Pros of wind energy</strong></p><p>Wind energy is more consistent than solar energy in many areas, since the wind blows at night as well as in the daytime.</p><p><strong>Low startup cost</strong></p><p>Wind energy is the cheapest form of new electricity generation available today. Wind power is more expensive than power from old, established power plants, but is cost competitive with any new power plant.</p><p><strong>Works everywhere there is enough wind</strong></p><p>Unlike hydroelectric energy, which requires very specific geographical conditions to work, wind turbines can be set up nearly anywhere. Both urban and rural areas can make use of wind energy.</p><p><strong>Great for remote areas</strong></p><p>Wind generators are self sufficient, and can be set up anywhere there is a fairly constant breeze. That makes them very useful in remote areas where it is difficult or expensive to deliver electrical power from conventional generating plants.</p><p><strong>By the way, its clean</strong></p><p>Wind energy is clean and renewable, with no polluting byproducts.</p><p><strong>Durable and efficient</strong></p><p>Modern wind turbines are very durable and efficient, capable of delivering clean power in a variety of wind conditions for years with minimal maintenance.</p><p><strong>Can be stored or used for other purpose</strong></p><p>Wind power is also used for mechanical purposes, primarily to pump water uphill into reservoirs or storage tanks. This water can later be used for drinking, irrigation or manufacturing. It can also be run through water turbines to generate electrical power.</p><p><strong>Cons of wind energy</strong></p><p>The wind is far from constant in most areas of the world. Calm days and nights will provide little if any electrical power. Like solar power, electricity generated from wind power must be stored or used to supplement the electricity supplied by more conventional methods.</p><p><strong>Takes a lot of wind to make it economical</strong></p><p>It takes a lot of wind turbines to make significant amounts of electrical power. This usually results in large scale operations called turbine farms, which have some negative aspects:</p><ol><li>Turbine farms take up a lot of land area, which can&#8217;t be effectively used for other purposes.</li><li>Turbine farms can disrupt the normal wind and weather patterns of the area, affecting rainfall.</li><li>Wind turbines are a hazard to birds, especially when located in migratory paths.</li></ol><p><strong>Higher maintenance cost</strong></p><p>Wind turbines require more maintenance than other kinds or renewable electrical generation systems. It must be kept free of ice and snow in colder climates, and must be well lubricated at all times. It is estimated that maintenance may cost between 20%-25% of total average cost per kWh produced and it goes up as the wind turbine gets older.</p><p><strong>Can get damaged from strong winds</strong></p><p>High winds can have an adverse affect on wind turbines, causing them to become damaged from the excessive stress. Wind turbines in areas where tornadoes, hurricanes and severe thunderstorms are common are likely to have a fairly short working life.</p><p><strong>It is noisy</strong></p><p>Wind turbines are noisy, especially in large scale installations. The sound pollution created by a turbine farm can be very difficult to live with.</p><p><strong>Going offshore adds more cost</strong></p><p>Many find placing turbine farms offshore or in remote areas a good solution for these problems, but that still makes transmission of the power an issue that must be overcome.</p><p><strong>Not easy to install for urban areas</strong></p><p>Where most homes can make use of solar panels for heating or generating electricity, properties in urban areas can&#8217;t easily install an effective wind power system.</p></ol><div class="adsw clear">\',\n'+
				  '\'</div><p><b>Nuclear energy</b> has some significant advantages over other traditional energy resources. It produces less pollution than other sources of energy and it reduces the levels of CO<sub>2</sub> released into the atmosphere for each unit of energy produced in comparison to other sources of energy that rely on fossil fuel or coal to provide power. The energy obtained is by far more intense than other sources, nuclear energy is economical in the long run.</p><p><strong>Cost effective</strong></p><p>Because of the fact that nuclear power produces more energy with less effort, it is therefore more cost competitive.</p><p><strong>Cons of nuclear energy</strong></p><p>On the other hand, nuclear energy has certain disadvantages too. The by-product of nuclear energy, which is a toxic waste, is a major problem for nuclear energy. It takes great effort to safely and properly store the waste and this is why the storage costs are extremely high, thus adding up to the final price paid for this type of energy. The planning and construction for a nuclear power plant takes about 10 to 30 years, so this cannot be considered as a fast and cheap way to obtain energy.</p><p><strong>Accidents can happen</strong></p><p>For safety reasons, radioactive toxic waste has to be stored in a safe, secure place for the next 10,000 years. The risk of accidents is very likely too as Chernobyl is an example of how accidents can occur. A single, minuscule perforation in one of the storage tanks can mean disaster for thousands of years. The consequences from an accident in one of these power plants are enormous if compared to accidents in a coal plan for instance. The disaster would mean permanent radioactivity on the ground, which is the case for Chernobyl. </p><p><strong>Not built for sustainability</strong></p><p>The main element needed to produce nuclear energy is Uranium. It is said that total deposit of Uranium available underground can only last for about 60 to 250 years, so nuclear power is not really a permanent, sustainable source of energy.</p></ol><div class="adsw clear">\',\n'+
				  '\'</div><p><b>Hydroelectric energy</b> refers to plants that generate electricity by causing huge amounts of water from a river or waterfall to flow through turbines.<strong><br /> </strong></p><p><strong>Pros of hydroelectric energy</strong></p><p>If properly designed and situated, a hydroelectric plant can generate consistent levels of power day and night, regardless of the weather. Thus hydro power is a reliable energy source. This is in contrast to wind and solar power which depend on proper conditions to generate electricity.</p><p><strong>Clean and renewable power</strong></p><p>Their operation is cleaner and less of a threat to the environment than fossil fuel or nuclear powered plants. They don&#8217;t consume fuel at all, but use gravity and the natural flow of water to generate power, thus making hydroelectric power a very renewable power source.</p><p><strong>Source of fresh water</strong></p><p>The reservoirs used by many plants to maintain a stable water supply for generating electricity are also used for recreational purposes by local residents and tourists. Reservoirs can also supply the surrounding region with a ready supply of water for drinking, irrigation, agricultural and manufacturing purposes.</p><p><strong>Opening up commercial shipping routes</strong></p><p>Changes to the water flow of the selected river can enhance commercial uses. In many cases, the hydroelectric project has opened waterways to commercial shipping that previously had been too shallow to handle the larger ships. One good example is the Three Gorges Dam in China, which opened up shipping routes into rural China.</p><p><strong>Cons of hydroelectric power</strong></p><p>Hydroelectric plants are very expensive to build, especially if a particularly wide dam structure is to be used to control the water flow.</p><p><strong>The local environment is severely impacted</strong></p><p>Entire habitats can be either flooded or dried out by the changes required to redirect the water. Farms, towns and even cities must often be abandoned to make way for new river channels, reservoirs and the plant itself.</p><p><strong>Pollution from water flow</strong></p><p>Changes in the water flow can cause pollution to build up in areas of the rivers feeding the plant that were previously clean and usable. Plants buried under the water will rot, releasing many greenhouse gasses.</p><p><strong>Disturbing natural scenery</strong></p><p>Due to shipping safety concerns, the plant and the accompanying dam are often placed in remote locations. Wilderness enthusiasts feel that these artificial structures detract from the natural scenery.</p><p><strong>Possible flash flood</strong></p><p>The dams employed by most hydroelectric plants to contain and control the water can bust, causing a devastating flash flood in the lowlands below.</p><p><strong>Temporary water supply issues</strong></p><p>Creating most hydroelectric plants creates significant changes to the local water table. This can affect irrigation and water supplies for hundreds of miles around the plant.</p><p><strong>Large water reservoirs and earthquakes</strong></p><p>The use of large scale reservoirs has lead many experts to believe that it can cause earthquakes. There is no way to predict what effect relocating and concentrating so many millions of tons of water will have on local tectonic activity. Many believe that it could caused previously stable plates to shift, creating a severe earthquake.</p><div class="adsw clear">\'];\n'+
				  '$(function(){\n'+
					   "var socket = io('http://luoyang.lti.cs.cmu.edu:3001/*', {'sync disconnect on unload': true });\n"+
					   "socket.emit('connection', { my: 'data' });\n"+
					    'document.getElementById("nav").innerHTML = contents[('+uid+'-1)%4]; \n'+   
					    'function clicklog(txt) {\n'+
			      	    'var res;\n'+
			      	    '$.ajax({\n'+
			      	        'url: "/clicklog.html?text=" + encodeURIComponent(txt),\n'+
			      	        'type: \'GET\',\n'+
			      	        'async: false,\n'+
			      	        'success: function (data) {\n'+
			      	           'console.log("done logging "+ txt);\n'+
			      	        '},\n'+
			      	        'error: function (jxhr) {\n'+
			      	            'console.log(jxhr.responseText);\n'+
			      	        '}\n'+
			      	    '});\n'+
			      	    'return res;\n'+
			      	'}\n'+      	
		  '});\n'+
		  '</script>\n'+
				'<body>\n'+
				'<script type="text/javascript">\n'+
				 '</script>\n'+
				 '<div class="main">\n'+
				  '<div id="header">\n'+
				  '<p><strong><font size="6">Step 2/6: Read the following article carefully. The following task will be based on this article.</strong></font></p>\n'+
				  '</div>\n'+
				//  '<div class="login well">\n'+
				  '<div id="nav">\n'+         
	                 '<br><br>\n'+
	                 '</div>\n'+ 
	 				'</div>\n'+
	 				'<div class="form">\n'+
				  '<br> Click this button to go to the next step:<br>\n'+
				'<form method="get" action="pretask2/'+uid+'&'+nickname+'&'+turkid+'">\n'+
				'<input type="submit" class = "button blue brackets" value="Next Step" />\n</form>\n'+
				 
//			    '</div>\n'+
				'</div></body>\n</html>\n');
});

app.get('/pretask2/:input', function (req, res) {
	//'<form method="get" action="pretask1/'+uid+'&'+nickname+'">\n'+
	var serverdate = new Date().getTime();
	
	console.log(req.url);
	cntuser++;
	var str = req.params.input;
 	var r = str.split("&");
 	 console.log("step 2 "+str+"  "+r[0]+"  "+r[1]+"  "+r[2]);
 	 var uid = r[0];
 	 var nickname = r[1];
 	 var turkid = r[2];
	
 	var cntuid = useroffset+1*uid;
 		
	  try {
	fs.writeFile(dir + "step2/"+uid+".json", JSON.stringify(turkid)+"\n"+JSON.stringify(nickname)+"\n"+JSON.stringify(new Date().getTime()), function (err) { if (err) { console.log("Error writing logs"); console.log(err); } });	   
				 
  res.send('<!DOCTYPE html>\n'+
		  '<html>\n'+
		  '<head>\n'+
		  '<style>\n'+
		  'table, td {\n'+
		  'border: 1px solid black;\n'+
		  '}\n'+
		  '.hiddeninput { visibility: hidden;}\n'+
		  '#nav {\n'+
		  'line-height:30px;\n'+
		  'color:black;\n'+
		  'height:200px;\n'+
		  'width:45%;\n'+
		  'float:left;\n'+
		  'padding:5px;\n'+
		  '}\n'+
		  '#section {\n'+
		  'width:45%;\n'+
		  'float:left;\n'+
		  'color:black;\n'+
		  'padding:10px;\n'+
		  '}\n'+
		  '</style>\n'+
		  '</head>\n'+
		  '<body>\n'+
		  '<script src=\'https://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js\'></script>\n'+
		  '<div id="nav">\n'+
		  '<object type="text/html" data="http://luoyang.lti.cs.cmu.edu:3001/task'+(uid-1)%4+'.html" width="100%" height="800px" style="overflow:auto;border:5px ridge blue"></object>\n'+
		  '</div>\n'+
		  '<div id="section">\n'+
		  '<b>Step 3/6. Write an energy proposal for City A, based on the task description on the left.</b>\n'+
		  '<form method="get" action="pretask/'+uid+'&'+nickname+'">\n'+		 
		  '<b>Your Proposal:</b><br/><td><textarea name="value" cols="80" rows="15" value=""></textarea>\n'+
		  '<input type="submit" class = "button blue brackets" value="Next Step" />\n'+
		  '</form>\n'+
		  '</div></div>\n'+
		  '</body>\n'+
		  '</html>\n'); 
			    
    
    } catch (e) {
        console.error(e+ "  DARN!!!!!")
    }

});

app.get('/pretask2/pretask/:input', function (req, res) {
	//http://luoyang.lti.cs.cmu.edu:5000/pretask.html?wid=try&nickname=try&ansmetal=no&anstourist=yes&ansbird=no&ansgas=yes&ansreliable=no&ansfarm=no&anssafe=no&anssustain=yes&ansstorage=no&userforumurl=5
	var serverdate = new Date().getTime();
	
	console.log(req.url);
	cntuser++;
	var str = req.params.input;
 	 var r = str.split("&");
 	 console.log(str+"  "+r[0]+"  "+r[1]);
 	  var uid = r[0];
 	  var nickname = r[1];
	var text = ""+url.parse(req.url, true).query.value;
	
	
	fs.writeFile( dir + "proposal/"+uid+".json", JSON.stringify(text), function (err) { if (err) { console.log("Error writing logs"); console.log(err); } });	   
	fs.writeFile(dir + "step3/"+uid+".json", JSON.stringify(new Date().getTime()), function (err) { if (err) { console.log("Error writing logs"); console.log(err); } });	   
	
	var cntuid = useroffset +1*uid;
//	var forumurl =	"http://baldwin-cf.isri.cmu.edu:8500/forum/security/index.cfm?uid="+cntuid+"&key="+nickname;
	var forumurl =  "http://deliberationforum.com/security/index.cfm?uid="+cntuid+"&key="+nickname;
	console.log("forumurl "+forumurl);
	// run_cmd_noinput("java -cp mysql-connector-java-5.1.24-bin.jar;InsertUser.jar mturk.DB "+nickname+" "+cntuid+" "+forumid, function (data){ 
	text = '"'+text.replace(/\s+/g, '|')+'"';
	
	 run_cmd_noinput("java -cp mysql-connector-java-5.1.24-bin.jar;InsertPost.jar mturk.DB "+text+" "+cntuid+" "+forumid+" "+nickname, function (data){ 				
	 console.log("here step 2 java -cp mysql-connector-java-5.1.24-bin.jar;InsertPost.jar mturk.DB "+text+" "+cntuid+" "+forumid+" "+nickname);
	
	  try {
 res.send('<html>\n<head>\n<style>\n .form { visibility: hidden;}\n'+
		  'table { border-collapse: collapse }\n'+
		  'table, td { border: 1px solid black; }\n'+
		  '</style>\n<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.5.2/jquery.min.js">\n</script>\n'+

		'<link rel="stylesheet" href="./compiled/flipclock.css">\n<script src="./compiled/flipclock.js"></script>\n'+

		'</head>\n<body>\n'+

		'<script type="text/javascript">\n'+

		'var clock;\n'+

		'$(document).ready(function(){\n'+	       

		'var currentDate = new Date('+serverdate+');\n'+	
		'var futureDate  = new Date(Date.UTC(2020, 09, 17, 14, 05, 0));\n'+
		'var diff = futureDate.getTime() / 1000 - currentDate.getTime() / 1000;\n'+	
		 'console.log("here future "+futureDate.toString()+"  "+diff);\n'+
		 'if(diff>0){\n'+	
		 "clock = $('.clock').FlipClock(diff, {"+
			"clockFace: 'DailyCounter',"+
			'countdown: true,\n'+
			'showSeconds: true\n'+
		'});\n'+       
		  'setTimeout(function(){\n'+	 
		  	 'alert("Please start Step 5 by clicking on the button at the bottom of the page when you are done posting, thanks!!");\n'+	
		 	'document.getElementById("instructions").style.visibility = "visible";\n'+
		   '}, diff*1000);\n'+	
		'}else{\n'+	
		'document.getElementById("instructions").style.visibility = "visible";\n'+  
		'}\n'+	

		'});\n'+

		'</script>\n'+
		'<div class="clock" style="margin:2em;"></div>\n'+
		'<p><strong><font size="6">Step 4/6: Provide feedback to the other Turkers\' proposals</strong></font></p>\n'+
		'Please join the forum discussion below and post at least <b>FIVE</b> replies to the proposals posted by the other Turkers.<br>\n'+
		'Participants have written their proposal from the standpoint of a goal that might be different from the one you were assigned, namely proposing a power source that is most economical; \n'+
		'carbon neutral and economical in the long run, environmentally friendly energy and reliable, environmentally friendly and has low startup cost.\n'+  
		'You should evaluate their proposal from the standpoint of how convincing it is in light of your assigned goal as you see it applying to the requirements for the city, even if their goal was different. \n'+ 
		'Thus, when you reply to a post, please <b>elaborate</b>, <b>build upon</b>, <b>question</b> or <b>argue against</b> the ideas presented in that post from your own goal perspective, drawing from the argumentation in your own proposal where appropriate.\n'+
		'<br><br><b>Proposal Discussion</b><br>\n'+
		'Your proposal is making a recommendation to the administration of City A, which has to choose one type of energy source from coal power, wind power, nuclear power and hydro power.\n'+
		'<br>\n'+
		'City A\'s requirements:<br>\n'+
		'1. The city is concerned with heavy metal waste.<br>\n'+
		'2. The city is a famous tourist city for its natural bird and fish habitats.<br>\n'+
		'3. The city is trying to reduce greenhouse gas emissions.<br>\n'+
		'4. The city needs a stable and reliable energy source.<br>\n'+
		'5. The city prefers affordable energy.<br>\n'+
		'<br>\n'+
		'<iframe src="'+forumurl+'" width=850 height=600></iframe>\n'+

		'<br>Step 5 is a collaborative task, which will start at <b>'+time+'</b>. There will be a pop-up window notification. A clickable button will show up below then. Please click the button to go to the final collaboration step.<br>\n'+

		'<div id="instructions" class="form">\n<form method="get" action="nexttask/'+uid+'&'+nickname+'">\n'+

		'<input type="submit" class = "button blue brackets" value="Next Step" />\n</form>\n'+

		'</div></body>\n</html>\n');
  
    
    } catch (e) {
        console.error(e+ "  DARN!!!!!")
    }
	});
});


app.get('/pretask2/pretask/nexttask/:input', function (req, res) {	
	// urls[('+uid+'-1)%4]
	var energy = ["coal","wind","nuclear","hydro"];
	var str = req.params.input;
  	 var r = str.split("&");
  	 console.log(str+"  "+r[0]+"  "+r[1]);
  	  var userid = r[0];
  	  var nickname = r[1];
  	fs.writeFile(dir + "step4/"+userid+".json", JSON.stringify(new Date().getTime()), function (err) { if (err) { console.log("Error writing logs"); console.log(err); } });	   
	var goal = ["is the most economical","is environmentally friendly and has low startup cost","is carbon neutral and economical in the long run",
	             "is environmentally friendly energy and reliable"];
	
	console.log("step 4 cmd");
	console.log("java -cp GroupUsersNick.jar mturk.ClusteringNick "+useroffset+" "+forumstr+" "+forumid);
	   	run_cmd_onlyonce("java -cp GroupUsersNick.jar mturk.ClusteringNick "+useroffset+" "+forumstr+" "+forumid, userid, function (data){
	//   	  run_cmd("java", ["-cp", "GroupUsersNick.jar", "mturk.ClusteringNick"], userid, function (data){
	   		//bazaar link
	   		
//	   		link = "http://bazaar-chat.lti.cs.cmu.edu:80/login?roomName=mturk&roomId=4111&mturkid="+userid+"&username="+nickname+"&perspective="+(userid-1)%4;
	   		//if(data%2==0){
	   		//link="http://bazaar.lti.cs.cmu.edu:80/login?roomName=mturk&roomId="+"170512"+"&mturkid="+userid+"&username="+nickname+"&perspective="+(userid-1)%4+"&html=index_xu";	
	   		
	   			
		   	// link = "http://hyderabad.lti.cs.cmu.edu:80/login?html=xu&roomName=mturk&roomId="+prefix+data+"&mturkid="+userid+"&username="+nickname+"&perspective="+(userid-1)%4;
	   		// link = "http://bazaar.lti.cs.cmu.edu:80/login?roomName=mturk&roomId=1710092"+"&mturkid="+userid+"&username="+nickname+"&perspective="+(userid-1)%4+"&html=xu";
	   		//}
//	   		else{
////	   		link = "http://hyderabad.lti.cs.cmu.edu:80/login?html=xu&roomName=mturkno&roomId="+prefix+data+"&mturkid="+userid+"&username="+nickname+"&perspective="+(userid-1)%4;
		   	link="http://bazaar.lti.cs.cmu.edu:80/login?roomName=mturk&roomId="+prefix+data+"&mturkid="+userid+"&username="+nickname+"&perspective="+(userid-1)%4+"&html=xu2";		   		
//	   		}
	   		//	   		
//	   		link = "http://128.2.214.35:9001/p/"+prefix+data+"?userName="+nickname+"&alwaysShowChat=true&chatAndUsers=true&noColors=false";
	   		console.log("step 4 "+link);
	   		//http://baldwin-cf.isri.cmu.edu:8500/forum/admin/fdetail.cfm?key=D04CC2B8-A71C-3020-56EF76767F9411B5

	   		res.send('<html>\n<head>\n<style>\n'+
	   			  	'table { border-collapse: collapse }\n'+
	   			  	'table, td { border: 1px solid black; }\n'+
	   			  	'.hiddeninput { visibility: hidden;}\n'+
	   			    '</style>\n<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js">\n</script>\n'+
	   			    '<link rel="stylesheet" href="./compiled/flipclock.css">\n<script src="./compiled/flipclock.js"></script>\n'+
	   				'</head>\n<body>\n'+
	   				'<script type="text/javascript">\n'+
	   				'var clock;\n'+
	   				'$(document).ready(function(){\n'+
	   				'var fiveMinutes = 60 * 15,\n'+
	   				'display = document.querySelector("#time");\n'+
	   				'startTimer(fiveMinutes, display);\n'+
			 		'setTimeout(function(){\n'+
			 		'document.getElementById("instructions").style.display = "block";\n'+
			 		'}, 900000);\n'+
			 		'$("input[name=\'plan\']").click(function () {\n'+
			      	'clicklog("'+userid+'|"+$(this).val());\n'+
			      	'});\n'+	      	
			 		'function startTimer(duration, display) {\n'+
			 		    'var timer = duration, minutes, seconds;\n'+
			 		    'setInterval(function () {\n'+
			 		        'minutes = parseInt(timer / 60, 10)\n'+
			 		        'seconds = parseInt(timer % 60, 10);\n'+
			 		        'minutes = minutes < 10 ? "0" + minutes : minutes;\n'+
			 		        'seconds = seconds < 10 ? "0" + seconds : seconds;\n'+
			 		        'display.textContent = minutes + ":" + seconds;\n'+
			 		        'if (--timer < 0) {\n'+
			 		            'timer = 0;;\n'+
			 		        '}\n'+
			 		    '}, 1000);\n'+
			 		 '}\n'+	   			
	   				 'var diff = 900;\n'+		
	   				 'clock = $(\'.clock\').FlipClock(diff, {\n'+
	   				 'clockFace: \'DailyCounter\',\n'+
	   				 'countdown: true\n'+
	   				 '});\n});\n'+
	   				 'function check() {\n'+
	   				 'if(document.getElementById("plan1").checked){clicklog("'+userid+'|final1");}\n'+
	   				 'else if(document.getElementById("plan2").checked){clicklog("'+userid+'|final2");}\n'+
	   				 'else if(document.getElementById("plan3").checked){clicklog("'+userid+'|fianl3");}\n'+
	   				 'else if(document.getElementById("plan4").checked){clicklog("'+userid+'|fianl4");}\n'+
	   				 'alert("Are you done editing the document above?");\n'+
	   				 '}\n'+
	   				'function clicklog(txt) {\n'+
		      	    'var res;\n'+
		      	    '$.ajax({\n'+
		      	        'url: "/clicklog.html?text=" + encodeURIComponent(txt),\n'+
		      	        'type: \'GET\',\n'+
		      	        'async: false,\n'+
		      	        'success: function (data) {\n'+
		      	           'console.log("done logging "+ txt);\n'+
		      	        '},\n'+
		      	        'error: function (jxhr) {\n'+
		      	            'console.log(jxhr.responseText);\n'+
		      	        '}\n'+
		      	    '});\n'+
		      	    'return res;\n'+
		      	    '}\n'+      	
	   				 '</script>\n'+
	   				 '<b><strong><font size="6">Step 5/6: Collaborate with your teammates on choosing an energy plan for City B </strong></font></b><br>\n'+
		   				'<b>Task Description:</b><br>\n'+	   				     
		   				'In this step, you will work together with other Turkers to recommend a way of distributing resources across energy types for the administration of City B. City B requires 12,000,000 MWh electricity a year from four types of energy sources: coal power, wind power, nuclear power and hydro power. We have provided 4 different plans to choose from, each of which emphasizes one energy source as primary. Specifically the plans describe how much energy should be generated from each of the four energy sources, listed in the table below. Your team needs to negotiate which plan is the best way of meeting your assigned goals, given the city\'s requirements and information below.<br>\n'+ 
		   				"<br>City B's requirements and information:<br>\n"+
		   				'1. City B has a tight yearly energy budget of $900,000,000.<br>\n'+
		   				'Coal power costs $30/MWh. Nuclear power costs $90/MWh. Wind power costs $80/MWh. Hydro power costs $110/MWh.<br>\n'+
		   				'2. The city is concerned with chemical waste. If the main energy source releases toxic chemical waste, there is a waste disposal cost of $2/MWh.<br>\n'+
		   				'3. The city is a famous tourist city for its natural bird habitats.<br>\n'+
		   				'4. The city is trying to reduce greenhouse gas emissions. If the main energy source release greenhouse gases, there will be a "Carbon tax" of $10/MWh of electricity.<br>\n'+
		   				'5. The city has several large hospitals that need a stable and reliable energy source.<br>\n'+
		   				'6. The city prefers renewable energy. If renewable energies generate more than 30% of the electricity, there will be a renewable tax credit of $1/MWh for the electricity that is generated by renewable energies.<br>\n'+
		   				'7. The city prefers energy sources whose cost is stable.<br>\n'+
		   				'8. The city is concerned with water pollution.<br><br>\n'+

		   		//	'<form>\n'+		   			 	
		   			 '<table id="myTable">\n'+
		   			 '<tbody><tr>\n'+
		   			 '<td><b>Energy Plan</b> </td>\n'+
		   			 '<td></td>\n'+
		   			 '<td><b>Cost</b> </td>\n'+
		   			 '<td><b>Waste disposal cost</b></td>\n'+
		   			 '<td><b>Carbon tax</b></td>\n'+
		   			 '<td><b>Renewable tax credit</b></td>\n'+
		   			 '<td><b>Total</b></td>\n'+
		   			 '</tr>\n'+
		   			 '<tr>\n'+
		   			 '<td><b>Plan1</b>. Coal:40% Wind:20% Nuclear:20% Hydro:20% </td>\n'+
		   			 '<td></td>\n'+
		   			 '<td>$816,000,000 </td>\n'+
		   			 '<td>$14,400,000 </td>\n'+
		   			 '<td>$48,000,000 </td>\n'+
		   			 '<td>$9,600,000 </td>\n'+
		   			 '<td>$868,800,000 </td>\n'+
		   			 '</tr>\n'+
		   			 '<tr>\n'+
		   			 '<td><b>Plan2</b>. Coal:20% Wind:40% Nuclear:20% Hydro:20% </td>\n'+
		   			 '<td></td>\n'+
		   			 '<td>$936,000,000 </td>\n'+
		   			 '<td>$0 </td>\n'+
		   			 '<td>$0 </td>\n'+
		   			 '<td>$14,400,000 </td>\n'+
		   			 '<td>$921,600,000 </td>\n'+
		   			 '</tr>\n'+
		   			 '<tr>\n'+
		   			 '<td><b>Plan3</b>. Coal:20% Wind:20% Nuclear:40% Hydro:20% </td>\n'+
		   			 '<td></td>\n'+
		   			 '<td>$960,000,000 </td>\n'+
		   			 '<td>$14,400,000 </td>\n'+
		   			 '<td>$0 </td>\n'+
		   			 '<td>$9,600,000 </td>\n'+
		   			 '<td>$964,800,000 </td>\n'+
		   			 '</tr>\n'+
		   			 '<tr>\n'+
		   			 '<td><b>Plan4</b>. Coal:20% Wind:20% Nuclear:20% Hydro:40% </td>\n'+
		   			 '<td></td>\n'+
		   			 '<td>$1,008,000,000 </td>\n'+
		   			 '<td>$0 </td>\n'+
		   			 '<td>$0 </td>\n'+
		   			 '<td>$14,400,000 </td>\n'+
		   			 '<td>$993,600,000 </td>\n'+
		   			 '</tr>\n'+
		   			 '</table>\n'+
		   			'<br><br><b>Which plan do you think '+goal[(userid-1)%4]+'?</b><br>\n'+
		   		  '<input name="plan" id="plan1" type="radio" value="1"/>Plan 1.\n'+  
                  '<input name="plan" id="plan2" type="radio" value="2" />Plan 2.\n'+  
                  '<input name="plan" id="plan3" type="radio" value="3" />Plan 3.\n'+ 
                  '<input name="plan" id="plan4" type="radio" value="4" />Plan 4.\n'+ 		   			
                  '<br><br><b>Evaluation:</b><br>\n'+
		   			'<b>Your individual contribution</b> to the joint proposal will be evaluated based on whether you have argued for an energy plan that '+goal[(userid-1)%4]+'.<br>\n'+
	   				'<b>The quality of your team proposal</b> will be evaluated in terms of (1) how many requirements you considered for choosing the energy plan and (2) trade-offs/reasons/comparisons listed as your reasons. You have <b>15</b> minutes in which to make a decision and write up the proposal, so you will have to be efficient.<br>\n'+
	   				
		   			'<br><b>Bonus!</b><br>\n'+
	   				'We will award $0.5 bonus to each team member based on the quality of your proposal. Write the proposal in the Etherpad window on the left.<br>\n'+
	   				'We will award $0.5 bonus to team members who actively discuss with the other team members in the chat window on the right.<br><br>\n'+
	   			
	   				'<iframe src="'+link+'" width=1200 height=600></iframe>\n'+
	   				'<br>A clickable button will show up below after <span id="time">15:00</span> minutes. Click the button to proceed to the final step.<br>\n'+
	   				'<div id="instructions" style="display:none">\n'+
	   				'<div class="form">\n<form method="get" action="finish/'+userid+'">\n'+
	   				'<input type="submit" class = "button blue brackets" value="Next Step" onclick="check()"/>\n</form>\n'+
	   				'</div></div></body>\n</html>\n');

	   	    });
	         	
});

app.get('/pretask2/pretask/nexttask/finish/:input', function (req, res) {
	var userid = req.params.input; 
	fs.writeFile(dir + "step5/"+userid+".json", JSON.stringify(new Date().getTime()), function (err) { if (err) { console.log("Error writing logs"); console.log(err); } });	   
	
	  	res.send('<html>\n'+
	  		  '<head>\n'+
	  		   '<title>Mturk</title>\n'+
	  		    '<style>\n'+
	  		    '.hiddeninput { visibility: hidden;}\n'+
	  		    '#header {\n'+
	  		    'background-color:gray;\n'+
	  		    'color:white;\n'+
	  		    'padding:5px;\n'+
	  			'}\n'+
	  			'#nav {\n'+
	  			    'line-height:30px;\n'+
	  			    'color:black;\n'+
	  			    'height:300px;\n'+
	  			    'width:45%;\n'+
	  			    'float:left;\n'+
	  			    'padding:5px;\n'+	      
	  			'}\n'+
	  			'#section {\n'+
	  			    'width:45%;\n'+
	  			    'float:left;\n'+
	  			    'color:black;\n'+
	  			    'padding:10px;\n'+	 	 
	  			'}\n'+
	  			'.textfield {\n'+
	  			  'position: relative;\n'+
	  			'}\n'+
	  			'.textfield .hint {\n'+
	  			  'display: none;\n'+
	  			  'position: absolute;\n'+
	  			  'width: 10em;\n'+
	  			  'bottom: 1.0em;\n'+
	  			  'left: 4.0em;\n'+
	  			  'background: #ff9;\n'+
	  			  'padding: 0 0.2em;\n'+
	  			  'border: solid 1px;\n'+
	  			'}\n'+
	  		    '</style>\n'+
	  		  '</head>\n'+
	  		  '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>\n'+
	  		  '<script src="/socket.io/socket.io.js"></script>\n'+
	  		  '<link rel="stylesheet" href="./compiled/flipclock.css">\n'+
	  		  '<script src="./compiled/flipclock.js"></script>\n'+
//	  		  '<script>\n'+
//	  		  'var energy = ["coal","wind","nuclear","hydro"];\n'+
//	  		  'var contents = [\'</div><p><b>Coal energy</b> refers to power produced by coal burning generators or industrial applications using large amounts of coal for heat, including steel manufacturing. Coal is a mineral found in abundance in most parts of the world, thus it is an economical energy source. </p><p><strong>Pros of coal energy</strong></p><p>Coal is cheap and plentiful in many areas of the world, including Europe and North America. Coal deposits are typically located close to the surface and cover large areas, allowing many coal mines to operate for decades using relatively safe and inexpensive mining techniques.</p><p><strong>Large deposits of coal available</strong></p><p>There are plentiful coal supplies in Western countries for many decades, which can be used for power generation and manufacturing use. This fact helps decrease the dependence on Middle Eastern oil. The United States has massive coal deposits, many of which have been mined for years with no end in site.</p><p><strong>Safe and easy to store</strong></p><p>Coal is very stable and can be stored and transported safely. Oil, natural gas, hydrogen and other volatile fuels can be explosive and must be handled and stored carefully.</p><p><strong>Easily converted to energy</strong></p><p>Coal production doesn&#8217;t require extensive secondary technologies to produce a useable fuel. Coal obtained directly from the mine is a very effective fuel for both the generation of electricity and in the manufacturing of steel.</p><p><strong>New technologies allows greater use and application</strong></p><p>Powdered, gaseous and liquid coal products have been developed that burn cleaner and hotter than conventional coal.</p><p><strong>Cons of coal energy</strong></p><p>Coal is a major source of several pollutants including carbon dioxide, a green house gas, and sulfur dioxide, a component of acid rain.</p><p><strong>Speeds up global warming</strong></p><p>Coal use in industry and power production is one of the major contributors to global warming by the industrial world. Both the heat from burning the coal and the greenhouse gases released during combustion are counted as major factors in the global warming crisis.</p><p><strong>Polluting chemicals that are dangerous for health</strong></p><p>Other toxins are released from the burning of coal that can be dangerous to the health of nearby populations. People with asthma are particularly sensitive to many of these pollutants.</p><p><strong>It is still non-renewable</strong></p><p>While coal reserves exist that will last for many decades, it is a non-renewable fossil fuel and will eventually be consumed. Coal is produced over eons of time under extreme conditions. It can&#8217;t be synthesized from contemporary carbon sources.</p><p><strong>Devastating environmental effects</strong></p><p>Coal mining techniques are often very damaging to the surrounding natural habitats. Strip mining is one of the most environmentally devastating mining procedures, is a common way of getting at coal deposits.</p><p><strong>Mining accidents</strong></p><p>While coal is located close to the surface, maintaining a stable mine structure requires leaving valuable coal intact. The urge to cut the safety factor as close as possible makes coal mines prone to cave ins and this can lead to the lost of human lives.</p><p><strong>Transportation of coal can be costly</strong></p><p>While coal can be transported safely, it is a very heavy and bulky load. Providing coal supplies to areas where coal is not available is very expensive. Much of the world’s coal supply is moved over water, especially between large exporting countries like Australia to large importing countries like China.</p><div class="adsw clear">\',\n'+
//	  		  '\'</div><p><b>Wind energy</b> refers primarily to electrical power created by wind powered generators.</p><p><strong>Pros of wind energy</strong></p><p>Wind energy is more consistent than solar energy in many areas, since the wind blows at night as well as in the daytime.</p><p><strong>Low startup cost</strong></p><p>Wind energy is the cheapest form of new electricity generation available today. Wind power is more expensive than power from old, established power plants, but is cost competitive with any new power plant.</p><p><strong>Works everywhere there is enough wind</strong></p><p>Unlike hydroelectric energy, which requires very specific geographical conditions to work, wind turbines can be set up nearly anywhere. Both urban and rural areas can make use of wind energy.</p><p><strong>Great for remote areas</strong></p><p>Wind generators are self sufficient, and can be set up anywhere there is a fairly constant breeze. That makes them very useful in remote areas where it is difficult or expensive to deliver electrical power from conventional generating plants.</p><p><strong>By the way, its clean</strong></p><p>Wind energy is clean and renewable, with no polluting byproducts.</p><p><strong>Durable and efficient</strong></p><p>Modern wind turbines are very durable and efficient, capable of delivering clean power in a variety of wind conditions for years with minimal maintenance.</p><p><strong>Can be stored or used for other purpose</strong></p><p>Wind power is also used for mechanical purposes, primarily to pump water uphill into reservoirs or storage tanks. This water can later be used for drinking, irrigation or manufacturing. It can also be run through water turbines to generate electrical power.</p><p><strong>Cons of wind energy</strong></p><p>The wind is far from constant in most areas of the world. Calm days and nights will provide little if any electrical power. Like solar power, electricity generated from wind power must be stored or used to supplement the electricity supplied by more conventional methods.</p><p><strong>Takes a lot of wind to make it economical</strong></p><p>It takes a lot of wind turbines to make significant amounts of electrical power. This usually results in large scale operations called turbine farms, which have some negative aspects:</p><ol><li>Turbine farms take up a lot of land area, which can&#8217;t be effectively used for other purposes.</li><li>Turbine farms can disrupt the normal wind and weather patterns of the area, affecting rainfall.</li><li>Wind turbines are a hazard to birds, especially when located in migratory paths.</li></ol><p><strong>Higher maintenance cost</strong></p><p>Wind turbines require more maintenance than other kinds or renewable electrical generation systems. It must be kept free of ice and snow in colder climates, and must be well lubricated at all times. It is estimated that maintenance may cost between 20%-25% of total average cost per kWh produced and it goes up as the wind turbine gets older.</p><p><strong>Can get damaged from strong winds</strong></p><p>High winds can have an adverse affect on wind turbines, causing them to become damaged from the excessive stress. Wind turbines in areas where tornadoes, hurricanes and severe thunderstorms are common are likely to have a fairly short working life.</p><p><strong>It is noisy</strong></p><p>Wind turbines are noisy, especially in large scale installations. The sound pollution created by a turbine farm can be very difficult to live with.</p><p><strong>Going offshore adds more cost</strong></p><p>Many find placing turbine farms offshore or in remote areas a good solution for these problems, but that still makes transmission of the power an issue that must be overcome.</p><p><strong>Not easy to install for urban areas</strong></p><p>Where most homes can make use of solar panels for heating or generating electricity, properties in urban areas can&#8217;t easily install an effective wind power system.</p></ol><div class="adsw clear">\',\n'+
//	  		  '\'</div><p><b>Nuclear energy</b> has some significant advantages over other traditional energy resources. It produces less pollution than other sources of energy and it reduces the levels of CO<sub>2</sub> released into the atmosphere for each unit of energy produced in comparison to other sources of energy that rely on fossil fuel or coal to provide power. The energy obtained is by far more intense than other sources, nuclear energy is economical in the long run.</p><p><strong>Cost effective</strong></p><p>Because of the fact that nuclear power produces more energy with less effort, it is therefore more cost competitive.</p><p><strong>Cons of nuclear energy</strong></p><p>On the other hand, nuclear energy has certain disadvantages too. The by-product of nuclear energy, which is a toxic waste, is a major problem for nuclear energy. It takes great effort to safely and properly store the waste and this is why the storage costs are extremely high, thus adding up to the final price paid for this type of energy. The planning and construction for a nuclear power plant takes about 10 to 30 years, so this cannot be considered as a fast and cheap way to obtain energy.</p><p><strong>Accidents can happen</strong></p><p>For safety reasons, radioactive toxic waste has to be stored in a safe, secure place for the next 10,000 years. The risk of accidents is very likely too as Chernobyl is an example of how accidents can occur. A single, minuscule perforation in one of the storage tanks can mean disaster for thousands of years. The consequences from an accident in one of these power plants are enormous if compared to accidents in a coal plan for instance. The disaster would mean permanent radioactivity on the ground, which is the case for Chernobyl. </p><p><strong>Not built for sustainability</strong></p><p>The main element needed to produce nuclear energy is Uranium. It is said that total deposit of Uranium available underground can only last for about 60 to 250 years, so nuclear power is not really a permanent, sustainable source of energy.</p></ol><div class="adsw clear">\',\n'+
//	  		  '\'</div><p><b>Hydroelectric energy</b> refers to plants that generate electricity by causing huge amounts of water from a river or waterfall to flow through turbines.<strong><br /> </strong></p><p><strong>Pros of hydroelectric energy</strong></p><p>If properly designed and situated, a hydroelectric plant can generate consistent levels of power day and night, regardless of the weather. Thus hydro power is a reliable energy source. This is in contrast to wind and solar power which depend on proper conditions to generate electricity.</p><p><strong>Clean and renewable power</strong></p><p>Their operation is cleaner and less of a threat to the environment than fossil fuel or nuclear powered plants. They don&#8217;t consume fuel at all, but use gravity and the natural flow of water to generate power, thus making hydroelectric power a very renewable power source.</p><p><strong>Source of fresh water</strong></p><p>The reservoirs used by many plants to maintain a stable water supply for generating electricity are also used for recreational purposes by local residents and tourists. Reservoirs can also supply the surrounding region with a ready supply of water for drinking, irrigation, agricultural and manufacturing purposes.</p><p><strong>Opening up commercial shipping routes</strong></p><p>Changes to the water flow of the selected river can enhance commercial uses. In many cases, the hydroelectric project has opened waterways to commercial shipping that previously had been too shallow to handle the larger ships. One good example is the Three Gorges Dam in China, which opened up shipping routes into rural China.</p><p><strong>Cons of hydroelectric power</strong></p><p>Hydroelectric plants are very expensive to build, especially if a particularly wide dam structure is to be used to control the water flow.</p><p><strong>The local environment is severely impacted</strong></p><p>Entire habitats can be either flooded or dried out by the changes required to redirect the water. Farms, towns and even cities must often be abandoned to make way for new river channels, reservoirs and the plant itself.</p><p><strong>Pollution from water flow</strong></p><p>Changes in the water flow can cause pollution to build up in areas of the rivers feeding the plant that were previously clean and usable. Plants buried under the water will rot, releasing many greenhouse gasses.</p><p><strong>Disturbing natural scenery</strong></p><p>Due to shipping safety concerns, the plant and the accompanying dam are often placed in remote locations. Wilderness enthusiasts feel that these artificial structures detract from the natural scenery.</p><p><strong>Possible flash flood</strong></p><p>The dams employed by most hydroelectric plants to contain and control the water can bust, causing a devastating flash flood in the lowlands below.</p><p><strong>Temporary water supply issues</strong></p><p>Creating most hydroelectric plants creates significant changes to the local water table. This can affect irrigation and water supplies for hundreds of miles around the plant.</p><p><strong>Large water reservoirs and earthquakes</strong></p><p>The use of large scale reservoirs has lead many experts to believe that it can cause earthquakes. There is no way to predict what effect relocating and concentrating so many millions of tons of water will have on local tectonic activity. Many believe that it could caused previously stable plates to shift, creating a severe earthquake.</p><div class="adsw clear">\'];\n'+
//	  		  '$(function(){\n'+
//	  			   "var socket = io('http://luoyang.lti.cs.cmu.edu:3000/*', {'sync disconnect on unload': true });\n"+
//	  			   "socket.emit('connection', { my: 'data' });\n"+
//	  			 	       
//	  			      		      	
//	  			      	'function clicklog(txt) {\n'+
//	  			      	    'var res;\n'+
//	  			      	    '$.ajax({\n'+
//	  			      	        'url: "/clicklog.html?text=" + encodeURIComponent(txt),\n'+
//	  			      	        'type: \'GET\',\n'+
//	  			      	        'async: false,\n'+
//	  			      	        'success: function (data) {\n'+
//	  			      	           'console.log("done logging "+ txt);\n'+
//	  			      	        '},\n'+
//	  			      	        'error: function (jxhr) {\n'+
//	  			      	            'console.log(jxhr.responseText);\n'+
//	  			      	        '}\n'+
//	  			      	    '});\n'+
//	  			      	    'return res;\n'+
//	  			      	'}\n'+      	
//	  		  '});\n'+
//	  		  '</script>\n'+
	  		  '<body>\n'+
	  		  '<div class="main">\n'+
	  		  '<div id="instructions" class="hidden">\n'+
	  		  '<div id="header">\n'+
	  		  '<p><strong><font size="6">Step 6/6: Final Step: Complete the following task with your best knowledge.</strong></font></p>\n'+
	  		  '<div class="form">\n<form method="get" action="done.html/'+userid+'">\n'+	  		                 '<div id="nav">\n'+
	  		            
	  		                 '<b>Read the following instructions carefully, and write a proposal based on your best knowledge. You are not allowed to refer to external resources in this task. </b><br>\n'+
	  		                 '<br>\n'+
	  		                 'Crystal City is a city undergoing rapid economic growth, and thus is in need of large volume of reliable energy. It is a busy city with a high volume of traffic and a growing population. It is home to a famous tech-oriented university, which means the city has access to a sophisticated workforce. The city is in a windy area, and is rich in natural resources, including fossil fuels and water. However, based on the city&#8217;s commitment to development, it has a limited budget for financing energy.<br>\n'+
	  		                 '<br>\n'+
	  		                 'Please write a 80-120-word energy proposal for Crystal City. You need to choose from four types of energy: <strong>A. coal energy B. wind energy C. nuclear energy D. hydroelectric energy.</strong> You can either choose one or any combination of the four. Please be specific about your reasons.<br>\n'+
	  		                 '<br>\n'+
	  		                 'Explain your arguments well, and demonstrate awareness of differing priorities and the pros and cons of the different sources in relation to the characteristics of the city. Your proposal will be evaluated on its thoughtfulness and comprehensiveness. You will get $0.5 bonus if your proposal achieves a top ranking score.<br>\n'+
	  		                 '</div>\n'+
	  		                 '<div id="section">\n'+
	  		                 '<b>Your Proposal:</b><br/><td><textarea name="posttest" cols="80" rows="15" value=""></textarea>\n'+
	  		                 '<p>After you finish writing the proposal, please click the following button to get the submission code. \n'+
	  		               
	  			
	  						'<input type="submit" class = "button blue brackets" value="Submit" />\n</form>\n'+
	  						 '</div>\n'+
	  		             '</div>\n'+
	  		     '</div>\n'+
	  		    '</div>\n'+
	  		 '</div>\n'+
	  		 '<!-- /container -->\n'+
	  		  '</body>\n'+
	  		'</html>');
});

app.get('/pretask2/pretask/nexttask/finish/done.html/:input', function (req, res) {
	var userid = req.params.input;
	var email = url.parse(req.url, true).query.email;
	var posttest= ""+url.parse(req.url, true).query.posttest
	fs.writeFile(dir + "emails/"+cntuser+".json", userid+" "+email+" "+JSON.stringify(new Date().getTime()), function (err) { if (err) { console.log("Error writing logs"); console.log(err); } });
	
	fs.writeFile( dir + "posttest/"+userid+".json", JSON.stringify(posttest), function (err) { if (err) { console.log("Error writing logs"); console.log(err); } });
	
	  	res.send('<html>\n<head>\n<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js">\n</script>\n'+
				'</head>\n<body>\n'+
				'Thanks! You can submit the HIT. Your submission code: 1345');
	
});


app.get('/clicklog.html', function (req, res) {
    var query = url.parse(req.url, true).query.text;
    var s = query.split("|");
    var uid = s[0];
    var click = s[1];
	var filename = dir + 'click/'+uid+'.click';	 
    
	fs.appendFile(filename, click +'\n', function (err) { if (err) { console.log("Failed to log, error:"+err); } });
	res.send("log result done");
});

app.get('/endpoint', function(req, res){
//  res.sendfile(__dirname + '/public/index.html');
	 
	var uid = url.parse(req.url, true).query.uid;
	console.log('a user connected uid = '+uid+'  totaluser= '+totaluser);
	var serverdate = new Date().getTime();
	fs.writeFile(dir + "step1/"+uid+".json", JSON.stringify(new Date().getTime()), function (err) { if (err) { console.log("Error writing logs"); console.log(err); } });	   

	res.send('<html>\n'+
  '<head>\n'+
   '<title>Mturk</title>\n'+
    '<style>\n'+
    '.hiddeninput { visibility: hidden;}\n'+
    '#header {\n'+
    'background-color:gray;\n'+
    'color:white;\n'+
    'padding:5px;\n'+
	'}\n'+
	'#nav {\n'+
	    'line-height:30px;\n'+
	    'color:black;\n'+
	    'height:300px;\n'+
	    'width:45%;\n'+
	    'float:left;\n'+
	    'padding:5px;\n'+	      
	'}\n'+
	'#section {\n'+
	    'width:45%;\n'+
	    'float:left;\n'+
	    'color:black;\n'+
	    'padding:10px;\n'+	 	 
	'}\n'+
	'.textfield {\n'+
	  'position: relative;\n'+
	'}\n'+
	'.textfield .hint {\n'+
	  'display: none;\n'+
	  'position: absolute;\n'+
	  'width: 10em;\n'+
	  'bottom: 1.0em;\n'+
	  'left: 4.0em;\n'+
	  'background: #ff9;\n'+
	  'padding: 0 0.2em;\n'+
	  'border: solid 1px;\n'+
	'}\n'+
    '</style>\n'+
  '</head>\n'+
  '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>\n'+
  '<script src="/socket.io/socket.io.js"></script>\n'+
  '<link rel="stylesheet" href="./compiled/flipclock.css">\n'+
  '<script src="./compiled/flipclock.js"></script>\n'+
  '<script>\n'+
  'var energy = ["coal","wind","nuclear","hydro"];\n'+
  'var contents = [\'</div><p><b>Coal energy</b> refers to power produced by coal burning generators or industrial applications using large amounts of coal for heat, including steel manufacturing. Coal is a mineral found in abundance in most parts of the world, thus it is an economical energy source. </p><p><strong>Pros of coal energy</strong></p><p>Coal is cheap and plentiful in many areas of the world, including Europe and North America. Coal deposits are typically located close to the surface and cover large areas, allowing many coal mines to operate for decades using relatively safe and inexpensive mining techniques.</p><p><strong>Large deposits of coal available</strong></p><p>There are plentiful coal supplies in Western countries for many decades, which can be used for power generation and manufacturing use. This fact helps decrease the dependence on Middle Eastern oil. The United States has massive coal deposits, many of which have been mined for years with no end in site.</p><p><strong>Safe and easy to store</strong></p><p>Coal is very stable and can be stored and transported safely. Oil, natural gas, hydrogen and other volatile fuels can be explosive and must be handled and stored carefully.</p><p><strong>Easily converted to energy</strong></p><p>Coal production doesn&#8217;t require extensive secondary technologies to produce a useable fuel. Coal obtained directly from the mine is a very effective fuel for both the generation of electricity and in the manufacturing of steel.</p><p><strong>New technologies allows greater use and application</strong></p><p>Powdered, gaseous and liquid coal products have been developed that burn cleaner and hotter than conventional coal.</p><p><strong>Cons of coal energy</strong></p><p>Coal is a major source of several pollutants including carbon dioxide, a green house gas, and sulfur dioxide, a component of acid rain.</p><p><strong>Speeds up global warming</strong></p><p>Coal use in industry and power production is one of the major contributors to global warming by the industrial world. Both the heat from burning the coal and the greenhouse gases released during combustion are counted as major factors in the global warming crisis.</p><p><strong>Polluting chemicals that are dangerous for health</strong></p><p>Other toxins are released from the burning of coal that can be dangerous to the health of nearby populations. People with asthma are particularly sensitive to many of these pollutants.</p><p><strong>It is still non-renewable</strong></p><p>While coal reserves exist that will last for many decades, it is a non-renewable fossil fuel and will eventually be consumed. Coal is produced over eons of time under extreme conditions. It can&#8217;t be synthesized from contemporary carbon sources.</p><p><strong>Devastating environmental effects</strong></p><p>Coal mining techniques are often very damaging to the surrounding natural habitats. Strip mining is one of the most environmentally devastating mining procedures, is a common way of getting at coal deposits.</p><p><strong>Mining accidents</strong></p><p>While coal is located close to the surface, maintaining a stable mine structure requires leaving valuable coal intact. The urge to cut the safety factor as close as possible makes coal mines prone to cave ins and this can lead to the lost of human lives.</p><p><strong>Transportation of coal can be costly</strong></p><p>While coal can be transported safely, it is a very heavy and bulky load. Providing coal supplies to areas where coal is not available is very expensive. Much of the world’s coal supply is moved over water, especially between large exporting countries like Australia to large importing countries like China.</p><div class="adsw clear">\',\n'+
  '\'</div><p><b>Wind energy</b> refers primarily to electrical power created by wind powered generators.</p><p><strong>Pros of wind energy</strong></p><p>Wind energy is more consistent than solar energy in many areas, since the wind blows at night as well as in the daytime.</p><p><strong>Low startup cost</strong></p><p>Wind energy is the cheapest form of new electricity generation available today. Wind power is more expensive than power from old, established power plants, but is cost competitive with any new power plant.</p><p><strong>Works everywhere there is enough wind</strong></p><p>Unlike hydroelectric energy, which requires very specific geographical conditions to work, wind turbines can be set up nearly anywhere. Both urban and rural areas can make use of wind energy.</p><p><strong>Great for remote areas</strong></p><p>Wind generators are self sufficient, and can be set up anywhere there is a fairly constant breeze. That makes them very useful in remote areas where it is difficult or expensive to deliver electrical power from conventional generating plants.</p><p><strong>By the way, its clean</strong></p><p>Wind energy is clean and renewable, with no polluting byproducts.</p><p><strong>Durable and efficient</strong></p><p>Modern wind turbines are very durable and efficient, capable of delivering clean power in a variety of wind conditions for years with minimal maintenance.</p><p><strong>Can be stored or used for other purpose</strong></p><p>Wind power is also used for mechanical purposes, primarily to pump water uphill into reservoirs or storage tanks. This water can later be used for drinking, irrigation or manufacturing. It can also be run through water turbines to generate electrical power.</p><p><strong>Cons of wind energy</strong></p><p>The wind is far from constant in most areas of the world. Calm days and nights will provide little if any electrical power. Like solar power, electricity generated from wind power must be stored or used to supplement the electricity supplied by more conventional methods.</p><p><strong>Takes a lot of wind to make it economical</strong></p><p>It takes a lot of wind turbines to make significant amounts of electrical power. This usually results in large scale operations called turbine farms, which have some negative aspects:</p><ol><li>Turbine farms take up a lot of land area, which can&#8217;t be effectively used for other purposes.</li><li>Turbine farms can disrupt the normal wind and weather patterns of the area, affecting rainfall.</li><li>Wind turbines are a hazard to birds, especially when located in migratory paths.</li></ol><p><strong>Higher maintenance cost</strong></p><p>Wind turbines require more maintenance than other kinds or renewable electrical generation systems. It must be kept free of ice and snow in colder climates, and must be well lubricated at all times. It is estimated that maintenance may cost between 20%-25% of total average cost per kWh produced and it goes up as the wind turbine gets older.</p><p><strong>Can get damaged from strong winds</strong></p><p>High winds can have an adverse affect on wind turbines, causing them to become damaged from the excessive stress. Wind turbines in areas where tornadoes, hurricanes and severe thunderstorms are common are likely to have a fairly short working life.</p><p><strong>It is noisy</strong></p><p>Wind turbines are noisy, especially in large scale installations. The sound pollution created by a turbine farm can be very difficult to live with.</p><p><strong>Going offshore adds more cost</strong></p><p>Many find placing turbine farms offshore or in remote areas a good solution for these problems, but that still makes transmission of the power an issue that must be overcome.</p><p><strong>Not easy to install for urban areas</strong></p><p>Where most homes can make use of solar panels for heating or generating electricity, properties in urban areas can&#8217;t easily install an effective wind power system.</p></ol><div class="adsw clear">\',\n'+
  '\'</div><p><b>Nuclear energy</b> has some significant advantages over other traditional energy resources. It produces less pollution than other sources of energy and it reduces the levels of CO<sub>2</sub> released into the atmosphere for each unit of energy produced in comparison to other sources of energy that rely on fossil fuel or coal to provide power. The energy obtained is by far more intense than other sources, nuclear energy is economical in the long run.</p><p><strong>Cost effective</strong></p><p>Because of the fact that nuclear power produces more energy with less effort, it is therefore more cost competitive.</p><p><strong>Cons of nuclear energy</strong></p><p>On the other hand, nuclear energy has certain disadvantages too. The by-product of nuclear energy, which is a toxic waste, is a major problem for nuclear energy. It takes great effort to safely and properly store the waste and this is why the storage costs are extremely high, thus adding up to the final price paid for this type of energy. The planning and construction for a nuclear power plant takes about 10 to 30 years, so this cannot be considered as a fast and cheap way to obtain energy.</p><p><strong>Accidents can happen</strong></p><p>For safety reasons, radioactive toxic waste has to be stored in a safe, secure place for the next 10,000 years. The risk of accidents is very likely too as Chernobyl is an example of how accidents can occur. A single, minuscule perforation in one of the storage tanks can mean disaster for thousands of years. The consequences from an accident in one of these power plants are enormous if compared to accidents in a coal plan for instance. The disaster would mean permanent radioactivity on the ground, which is the case for Chernobyl. </p><p><strong>Not built for sustainability</strong></p><p>The main element needed to produce nuclear energy is Uranium. It is said that total deposit of Uranium available underground can only last for about 60 to 250 years, so nuclear power is not really a permanent, sustainable source of energy.</p></ol><div class="adsw clear">\',\n'+
  '\'</div><p><b>Hydroelectric energy</b> refers to plants that generate electricity by causing huge amounts of water from a river or waterfall to flow through turbines.<strong><br /> </strong></p><p><strong>Pros of hydroelectric energy</strong></p><p>If properly designed and situated, a hydroelectric plant can generate consistent levels of power day and night, regardless of the weather. Thus hydro power is a reliable energy source. This is in contrast to wind and solar power which depend on proper conditions to generate electricity.</p><p><strong>Clean and renewable power</strong></p><p>Their operation is cleaner and less of a threat to the environment than fossil fuel or nuclear powered plants. They don&#8217;t consume fuel at all, but use gravity and the natural flow of water to generate power, thus making hydroelectric power a very renewable power source.</p><p><strong>Source of fresh water</strong></p><p>The reservoirs used by many plants to maintain a stable water supply for generating electricity are also used for recreational purposes by local residents and tourists. Reservoirs can also supply the surrounding region with a ready supply of water for drinking, irrigation, agricultural and manufacturing purposes.</p><p><strong>Opening up commercial shipping routes</strong></p><p>Changes to the water flow of the selected river can enhance commercial uses. In many cases, the hydroelectric project has opened waterways to commercial shipping that previously had been too shallow to handle the larger ships. One good example is the Three Gorges Dam in China, which opened up shipping routes into rural China.</p><p><strong>Cons of hydroelectric power</strong></p><p>Hydroelectric plants are very expensive to build, especially if a particularly wide dam structure is to be used to control the water flow.</p><p><strong>The local environment is severely impacted</strong></p><p>Entire habitats can be either flooded or dried out by the changes required to redirect the water. Farms, towns and even cities must often be abandoned to make way for new river channels, reservoirs and the plant itself.</p><p><strong>Pollution from water flow</strong></p><p>Changes in the water flow can cause pollution to build up in areas of the rivers feeding the plant that were previously clean and usable. Plants buried under the water will rot, releasing many greenhouse gasses.</p><p><strong>Disturbing natural scenery</strong></p><p>Due to shipping safety concerns, the plant and the accompanying dam are often placed in remote locations. Wilderness enthusiasts feel that these artificial structures detract from the natural scenery.</p><p><strong>Possible flash flood</strong></p><p>The dams employed by most hydroelectric plants to contain and control the water can bust, causing a devastating flash flood in the lowlands below.</p><p><strong>Temporary water supply issues</strong></p><p>Creating most hydroelectric plants creates significant changes to the local water table. This can affect irrigation and water supplies for hundreds of miles around the plant.</p><p><strong>Large water reservoirs and earthquakes</strong></p><p>The use of large scale reservoirs has lead many experts to believe that it can cause earthquakes. There is no way to predict what effect relocating and concentrating so many millions of tons of water will have on local tectonic activity. Many believe that it could caused previously stable plates to shift, creating a severe earthquake.</p><div class="adsw clear">\'];\n'+
  '$(function(){\n'+
	   "var socket = io('http://luoyang.lti.cs.cmu.edu:3001/*', {'sync disconnect on unload': true });\n"+
	   "socket.emit('connection', { my: 'data' });\n"+
	//    'document.getElementById("nav").innerHTML = contents[('+uid+'-1)%4]; \n'+   
	 //   'var xyz = document.getElementsByName("name");\n'+ 
	 //   'for(var i=0;i<xyz.length;i++)\n'+ 
	 //   '{\n'+ 
	 //   	'xyz[i].innerHTML = energy[('+uid+'-1)%4];\n'+ 	    
	 //   '}\n'+ 	       
	      	'document.getElementById("forumurl").value = '+uid+';\n'+
	      	'console.log('+uid+');\n'+	      	
	      	'var u = ('+uid+'-1)%4;\n'+
	      	'$("input[name=\'ansbudget\']").click(function () {\n'+	
	      	'clicklog("'+uid+'|ansbudget_"+$(this).val());\n'+	
	      		'if(u == 0){\n'+	 
	      	        '$("#show-me1").text("Coal is the cheapest energy source.");\n'+	 
	      	    '$("#show-me1").css("display", ($(this).val() === "no"||$(this).val() === "i") ? "block":"none");\n'+	         
	      	    '}else if(u == 1)\n'+	 
	      	    '{\n'+	 
	      	        '$("#show-me1").text("Wind is a cheap energy source.");\n'+	 
	      	        '$("#show-me1").css("display", ($(this).val() === "no"||$(this).val() === "i") ? "block":"none");\n'+	    
	      	    '}else if(u == 2)\n'+	 
	      	    '{\n'+	 
	      	        '$("#show-me1").text("It is expensive to build a nuclear power plant.");\n'+	 
	      	        '$("#show-me1").css("display", ($(this).val() === "yes"||$(this).val() === "i") ? "block":"none");\n'+	    
	      	    '}\n'+	 
	      	    'else if(u == 3)\n'+	 
	      	    '{\n'+	 
	      	        '$("#show-me1").text("It is expensive to build a hydro power plant.");\n'+	 
	      	        '$("#show-me1").css("display", ($(this).val() === "yes"||$(this).val() === "i") ? "block":"none");\n'+	    
	      	    '}\n'+	 
	      	'});\n'+	 
	      	'$("input[name=\'ansmetal\']").click(function () {\n'+
	    	'clicklog("'+uid+'|ansmetal_"+$(this).val());\n'+
	      	      'if(u == 0){\n'+	 
	      	        '$("#show-me2").text("Coal power produces heavy metal waste.");\n'+	 
	      	    '$("#show-me2").css("display", ($(this).val() === "yes"||$(this).val() === "i") ? "block":"none");\n'+	         
	      	    '}else if(u == 1)\n'+	 
	      	    '{\n'+	 
	      	       '$("#show-me2").text("Wind is a clean energy source.");\n'+	 
	      	        '$("#show-me2").css("display", ($(this).val() === "no"||$(this).val() === "i") ? "block":"none");\n'+	    
	      	    '}else if(u == 2)\n'+	 
	      	    '{\n'+	 
	      	        '$("#show-me2").text("Nuclear power can have heavy metal waste.");\n'+	 
	      	        '$("#show-me2").css("display", ($(this).val() === "yes"||$(this).val() === "i") ? "block":"none");\n'+	    
	      	    '}\n'+	 
	      	    'else if(u == 3)\n'+	 
	      	    '{\n'+	 
	      	       '$("#show-me2").text("Hydro power is a clean energy.");\n'+	 
	      	        '$("#show-me2").css("display", ($(this).val() === "no"||$(this).val() === "i") ? "block":"none");\n'+	    
	      	    '}\n'+	 
	      	'});\n'+	 
	      	'$("input[name=\'anstourist\']").click(function () {\n'+
	      	'clicklog("'+uid+'|anstourist_"+$(this).val());\n'+
	      	        'if(u == 0){\n'+	 
	      	        '$("#show-me3").text("Coal power is irrelevant to this character.");\n'+	 
	      	    '$("#show-me3").css("display", ($(this).val() === "no"||$(this).val() === "yes") ? "block":"none");\n'+	         
	      	    '}else if(u == 1)\n'+	 
	      	    '{\n'+	 
	      	        '$("#show-me3").text("Wind power is irrelevant to this character.");\n'+	 
	      	        '$("#show-me3").css("display", ($(this).val() === "no"||$(this).val() === "yes") ? "block":"none");\n'+	    
	      	    '}else if(u == 2)\n'+	 
	      	    '{\n'+	 
	      	        '$("#show-me3").text("Nuclear power is irrelevant to this character.");\n'+	 
	      	        '$("#show-me3").css("display", ($(this).val() === "no"||$(this).val() === "yes") ? "block":"none");\n'+	    
	      	    '}\n'+	 
	      	    'else if(u == 3)\n'+	 
	      	    '{\n'+	 
	      	        '$("#show-me3").text("Hydro power plant can change landscape dramatically.");\n'+	 
	      	        '$("#show-me3").css("display", ($(this).val() === "yes"||$(this).val() === "i") ? "block":"none");\n'+	    
	      	    '}\n'+	 
	      	'});\n'+	 
	      	'$("input[name=\'ansbird\']").click(function () {\n'+
	      	'clicklog("'+uid+'|ansbird_"+$(this).val());\n'+
	      	 'if(u == 0){\n'+	 
	      	        '$("#show-me4").text("Coal power is irrelevant to this character.");\n'+	 
	      	    '$("#show-me4").css("display", ($(this).val() === "no"||$(this).val() === "yes") ? "block":"none");\n'+	         
	      	    '}else if(u == 1)\n'+	 
	      	    '{\n'+	 
	      	        '$("#show-me4").text("Wind turbine can be harmful to birds.");\n'+	 
	      	        '$("#show-me4").css("display", ($(this).val() === "i"||$(this).val() === "yes") ? "block":"none");\n'+	    
	      	    '}else if(u == 2)\n'+	 
	      	    '{\n'+	 
	      	        '$("#show-me4").text("Nuclear power is irrelevant to this character.");\n'+	 
	      	        '$("#show-me4").css("display", ($(this).val() === "no"||$(this).val() === "yes") ? "block":"none");\n'+	    
	      	    '}\n'+	 
	      	    'else if(u == 3)\n'+	 
	      	    '{\n'+	 
	      	        '$("#show-me4").text("Hydro power is irrelevant to this character.");\n'+	 
	      	        '$("#show-me4").css("display", ($(this).val() === "yes"||$(this).val() === "no") ? "block":"none");\n'+	    
	      	    '}\n'+	 
	      	'});\n'+	      	
	      	'$("input[name=\'ansgas\']").click(function () {\n'+
	      	'clicklog("'+uid+'|ansgas_"+$(this).val());\n'+
	      	   'if(u == 0){\n'+	 
	      	        '$("#show-me5").text("Coal power emits greenhouse gas.");\n'+	 
	      	    '$("#show-me5").css("display", ($(this).val() === "i"||$(this).val() === "yes") ? "block":"none");\n'+	         
	      	    '}else if(u == 1)\n'+	 
	      	    '{\n'+	 
	      	        '$("#show-me5").text("Wind power is carbon neutral.");\n'+	 
	      	        '$("#show-me5").css("display", ($(this).val() === "i"||$(this).val() === "no") ? "block":"none");\n'+	   
	      	    '}else if(u == 2)\n'+	 
	      	    '{\n'+	 
	      	        '$("#show-me5").text("Nuclear power is carbon neutral.");\n'+	 
	      	        '$("#show-me5").css("display", ($(this).val() === "i"||$(this).val() === "no") ? "block":"none");\n'+	    
	      	    '}\n'+	 
	      	    'else if(u == 3)\n'+	 
	      	    '{\n'+	 
	      	        '$("#show-me5").text("Hydro power is carbon neutral.");\n'+	 
	      	        '$("#show-me5").css("display", ($(this).val() === "i"||$(this).val() === "no") ? "block":"none");\n'+	    
	      	    '}\n'+	 
	      	'});\n'+	 
	      	'$("input[name=\'ansreliable\']").click(function () {\n'+
	      	'clicklog("'+uid+'|ansreliable_"+$(this).val());\n'+
	      	      'if(u == 0){\n'+	 
	      	        '$("#show-me6").text("Coal power is stable.");\n'+	 
	      	    '$("#show-me6").css("display", ($(this).val() === "i"||$(this).val() === "no") ? "block":"none");\n'+	         
	      	    '}else if(u == 1)\n'+	 
	      	    '{\n'+	 
	      	        '$("#show-me6").text("Wind power can be sporadic.");\n'+	 
	      	        '$("#show-me6").css("display", ($(this).val() === "i"||$(this).val() === "yes") ? "block":"none");\n'+	    
	      	    '}else if(u == 2)\n'+	 
	      	    '{\n'+	 
	      	        '$("#show-me6").text("Nuclear power is stable.");\n'+	 
	      	        '$("#show-me6").css("display", ($(this).val() === "i"||$(this).val() === "no") ? "block":"none");\n'+	    
	      	    '}\n'+	 
	      	    'else if(u == 3)\n'+	 
	      	    '{\n'+	 
	      	        '$("#show-me6").text("Hydro power is stable.");\n'+	 
	      	        '$("#show-me6").css("display", ($(this).val() === "i"||$(this).val() === "no") ? "block":"none");\n'+	   
	      	    '}\n'+	 
	      	'});\n'+	 
	      	'$("input[name=\'ansfarm\']").click(function () {\n'+
	      	'clicklog("'+uid+'|ansfarm_"+$(this).val());\n'+
	      	     'if(u == 0){\n'+	 
	      	        '$("#show-me7").text("Coal power is irrelevant to this character.");\n'+	 
	      	    '$("#show-me7").css("display", ($(this).val() === "no"||$(this).val() === "yes") ? "block":"none");\n'+	         
	      	    '}else if(u == 1)\n'+	 
	      	    '{\n'+	 
	      	        '$("#show-me7").text("Wind farms are often chosen.");\n'+	 
	      	        '$("#show-me7").css("display", ($(this).val() === "i"||$(this).val() === "no") ? "block":"none");\n'+	    
	      	    '}else if(u == 2)\n'+	 
	      	    '{\n'+	 
	      	        '$("#show-me7").text("Nuclear power is irrelevant to this character.");\n'+	 
	      	        '$("#show-me7").css("display", ($(this).val() === "no"||$(this).val() === "yes") ? "block":"none");\n'+	    
	      	    '}\n'+	 
	      	    'else if(u == 3)\n'+	 
	      	    '{\n'+	 
	      	        '$("#show-me7").text("Hydro power is irrelevant to this character.");\n'+	 
	      	        '$("#show-me7").css("display", ($(this).val() === "yes"||$(this).val() === "no") ? "block":"none");\n'+	    
	      	    '}\n'+	 
	      	'});\n'+	 
	      	'$("input[name=\'anssustain\']").click(function () {\n'+
	      	'clicklog("'+uid+'|anssustain_"+$(this).val());\n'+
	      	     'if(u == 0){\n'+	 
	      	        '$("#show-me8").text("Coal power is not a renewable energy.");\n'+	 
	      	    '$("#show-me8").css("display", ($(this).val() === "i"||$(this).val() === "yes") ? "block":"none");\n'+	         
	      	    '}else if(u == 1)\n'+	 
	      	    '{\n'+	 
	      	        '$("#show-me8").text("Wind power is renewable.");\n'+	 
	      	        '$("#show-me8").css("display", ($(this).val() === "i"||$(this).val() === "no") ? "block":"none");\n'+	    
	      	    '}else if(u == 2)\n'+	 
	      	    '{\n'+	 
	      	        '$("#show-me8").text("Nuclear power is not a renewable energy.");\n'+	 
	      	        '$("#show-me8").css("display", ($(this).val() === "i"||$(this).val() === "yes") ? "block":"none");\n'+	    
	      	    '}\n'+	 
	      	    'else if(u == 3)\n'+	 
	      	    '{\n'+	 
	      	        '$("#show-me8").text("Hydro power is renewable.");\n'+	 
	      	        '$("#show-me8").css("display", ($(this).val() === "i"||$(this).val() === "no") ? "block":"none");\n'+	    
	      	    '}\n'+	 
	      	'});\n'+	      	
	      	'function clicklog(txt) {\n'+
	      	    'var res;\n'+
	      	    '$.ajax({\n'+
	      	        'url: "/clicklog.html?text=" + encodeURIComponent(txt),\n'+
	      	        'type: \'GET\',\n'+
	      	        'async: false,\n'+
	      	        'success: function (data) {\n'+
	      	           'console.log("done logging "+ txt);\n'+
	      	        '},\n'+
	      	        'error: function (jxhr) {\n'+
	      	            'console.log(jxhr.responseText);\n'+
	      	        '}\n'+
	      	    '});\n'+
	      	    'return res;\n'+
	      	'}\n'+      	
  '});\n'+
  '</script>\n'+
  '<body>\n'+
  '<div class="main">\n'+
  '<div id="instructions" class="hidden">\n'+
  '<div id="header">\n'+
  '<p><strong><font size="6">Step 1/6: Complete the following task with your best knowledge.</strong></font></p>\n'+
     '<div class="login well">\n'+
      	'Please enter your MTurk ID and a nickname you will use later in the forum discussion and collaboration. \n'+         
         '<br><br>\n'+
         '<div class="form">\n'+
             '<form id="url" method="get" action="feedback.html">\n'+
                 'Your Mturk ID:<br>\n'+
                 '<input id="value" size="20" name="wid" value=""/>\n'+
                 '<br>\n'+
                 'Your Nickname:<br>\n'+
                 '<input id="nickvalue" size="20" name="nickname" value=""/>\n'+
                 '<br></div>\n'+
              
                 '<div id="nav">\n'+
            
                 '<b>Read the following instructions carefully, and write a proposal based on your best knowledge. You are not allowed to refer to external resources in this task. </b><br>\n'+
                 '<br>\n'+
                 'Diamond City is a city undergoing rapid economic growth, and thus is in need of large volume of reliable energy. It is a busy city with a high volume of traffic and a growing population. It is home to a famous tech-oriented university, which means the city has access to a sophisticated workforce. The city is in a windy area, and is rich in natural resources, including fossil fuels and water. However, based on the city&#8217;s commitment to development, it has a limited budget for financing energy.<br>\n'+
                 '<br>\n'+
                 'Please write a 80-120-word energy proposal for Diamond City. You need to choose from four types of energy: <strong>A. coal energy B. wind energy C. nuclear energy D. hydroelectric energy.</strong> You can either choose one or any combination of the four. Please be specific about your reasons.<br>\n'+
                 '<br>\n'+
                 'Explain your arguments well, and demonstrate awareness of differing priorities and the pros and cons of the different sources in relation to the characteristics of the city. Your proposal will be evaluated on its thoughtfulness and comprehensiveness. You will get $0.5 bonus if your proposal achieves a top ranking score.<br>\n'+
                 '</div>\n'+
                 '<div id="section">\n'+
                 
//                 '<form method="get" action="pretask/'+uid+'&'+nickname+'">\n'+		 
//       		  '<b>Your Proposal:</b><br/><td><textarea name="value" cols="80" rows="15" value=""></textarea>\n'+
//       		  '<input type="submit" class = "button blue brackets" value="Next Step" />\n'+
//       		  '</form>\n'+
                 '<b>Your Proposal:</b><br/><td><textarea name="pretest" cols="80" rows="15" value=""></textarea>\n'+
                 '<p>After you finish writing the proposal, please click the following button to go to Step 2 \n'+
                 '<input id="forumurl" class="hiddeninput" type="text" name="userforumurl" value=""><br>\n'+
                 '<input type="submit" class = "button blue brackets" value="Next Step" />\n'+
             '</form>\n'+
             '</div>\n'+
         '</div>\n'+
     '</div>\n'+
    '</div>\n'+
 '</div>\n'+
 '<!-- /container -->\n'+
  '</body>\n'+
'</html>');
});

//https://luoyang.lti.cs.cmu.edu:3000/?uid=2&assignmentId=ASSIGNMENT_ID_NOT_AVAILABLE&hitId=3WPCIUYH1A9ZZSRGVG1LD6P4ZSKTDR


io.on('connection', function(socket){
  totaluser++;
  console.log('A user connected! Totaluser = '+totaluser);
  
  socket.on('disconnect', function() {
	  totaluser--;
      console.log('A user disconnected! Totaluser = '+totaluser);
  });
 
});


http.listen(3001, function(){
  console.log('listening on :3001');
});


//https.createServer(options, app).listen(3000);