window.addEventListener("DOMContentLoaded", function(event) {
	window.addEventListener("message",messagehandler,false);
	parent.postMessage({
        mode: "page-load"
    }, '*');
});

var messagehandler = function(event){
	var data = event.data;
	var mode = data.mode;
	console.log("iframe page receive mode is "+mode);
	if(mode === "inject-circle"){
		var js_src = data.data.js_src,
			css_src = data.data.css_src;
		var elems = document.getElementsByTagName("script");
        for (var i = 0, len = elems.length; len > i; i++) {
            var ele = elems[i];
            var src = ele.getAttribute("src");
            if (null != src && -1 !== src.indexOf(js_src)) {
                this.pluginLoaded = true;
                break
            }
        }
        if (this.pluginLoaded) {
            return;
        }
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.charset = "UTF-8";
		script.src = js_src;
        document.head.appendChild(script);
        
        if(css_src){
        	 var css = document.createElement("link");
        	 css.type = "text/css";
        	 css.rel = "stylesheet";
        	 css.href = css_src;
             document.head.appendChild(css);
        }
	}
};


