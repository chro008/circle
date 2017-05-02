var circle_data;
var high_light = false;
var circle_start = false;


window.addEventListener("DOMContentLoaded",function(){
	console.log("parent page is loaded...");
	window.addEventListener("message",messagehandler,false);
});


function ConsoleLog(){
	console.log("parent.console.log");
}


var messagehandler = function(event){
	var data = event.data;
	var mode = data.mode;
	var win = document.getElementById("circle-window-iframe").contentWindow;
	console.log("parent page receive mode is "+mode);
	if(mode === "page-load"){	//客户页面 iframe 加载完毕
		win.postMessage({
	        mode: "inject-circle",
	        data: {"js_src":"C:/Users/lixiaoming.JISHUD-PC/Desktop/circle/js/client.js",
	        	"css_src":"C:/Users/lixiaoming.JISHUD-PC/Desktop/circle/css/client.css"}
	    }, '*');
	}else if(mode === "client_circle_injected"){	//客户页面加载完毕  圈选js
		
		getCircleDatas();
		
		var highlight_obj = document.getElementsByName("highlight-circle")[0];
		var circlestart_obj = document.getElementsByName("circle-start")[0];
		
		highlight_obj.onclick = function(){
			high_light = !high_light;
			highlight_obj.style.cssText = high_light?"border-bottom: 2px solid #ea6947;color: #ea6947;":"";
			win.postMessage({
                mode: "high-light",
                data:{"high_light":high_light}
            }, '*');
		};
		
		circlestart_obj.onclick = function(){
			circle_start = !circle_start;
			circlestart_obj.style.cssText = circle_start?"border-bottom: 2px solid #ea6947;color: #ea6947;":"";
			getCircleDatas();
		}
	}else if(mode === "save-data"){
		console.log(data.data);
		saveData(data.data);
	}else if(mode === "cancel-circle"){
		var circlestart_obj = document.getElementsByName("circle-start")[0];
		$(circlestart_obj).trigger("click");
	}
	
};

function save_callback(result){
	console.log("save:",result);
	getCircleDatas();
}

function get_callback(result){
	if(result){
		console.log("get:",result);
		circle_data = JSON.parse(result);
	}else{
		circle_data = circle_data || [];
	}
	
	var win = document.getElementById("circle-window-iframe").contentWindow;
	win.postMessage({
        mode: "init-circle",
        data: {"circle_data":circle_data,"circle_start":circle_start}
    }, '*');
}

function getCircleDatas(){
	if(circle_start){
		var u = "http://192.168.12.35:8080/sfbms/circle/getDatas?cb=get_callback&random="+Math.random();
		
		if(document.getElementById("get_jsonp")){
			document.getElementById("get_jsonp").remove();
		}
		var d = document.createElement("script");
		d.setAttribute("type", "text/javascript");
		d.id = "get_jsonp";
		d.src = u;
		document.body.appendChild(d);
	}else{
		get_callback();
	}
}

function saveData(data){
	var param = "";
    for(var key in data){
    	param += "&"+key+"="+encodeURIComponent(encodeURIComponent(data[key]));
    }
	var u = "http://192.168.12.35:8080/sfbms/circle/saveData?cb=save_callback"+param+"&random="+Math.random();
	if(document.getElementById("save_jsonp")){
		document.getElementById("save_jsonp").remove();
	}
	var d = document.createElement("script");
	d.setAttribute("type", "text/javascript");
	d.id = "save_jsonp";
	d.src = u;
	document.body.appendChild(d);
}


function getXMLHttpRequest() {
	var xhr;
	if (window.ActiveXObject) {
		xhr = new ActiveXObject("Microsoft.XMLHTTP");
	} else if (window.XMLHttpRequest) {
		xhr = new XMLHttpRequest();
	} else {
		xhr = null;
	}
	return xhr;
}