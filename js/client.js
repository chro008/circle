var Util = {
    bind: function(ele, type, listener, usecapture) {
        if (usecapture) {
            usecapture = false;
        }

        if (null != ele) {
            if (null != document.addEventListener) {
                ele.addEventListener(type, listener, usecapture);
            } else if (null != document.attachEvent) {
                ele.attachEvent("on" + type, listener)
            } else {
                ele["on" + type] = listener;
            }
            return true
        }
    },
    unbind: function(ele, type, listener, usecapture) {
        if (null != ele) {
            if (null != document.removeEventListener) {
                ele.removeEventListener(type, listener, usecapture);
            } else if (null != document.detachEvent) {
                ele.detachEvent("on" + type, listener);
            } else {
                ele["on" + type] = null;
            }
            return true;
        }
    },
    bindOnce: function(ele, type, listener, usecapture) {
        null == usecapture && (usecapture = false);
        this.unbind(ele, type, listener, usecapture);
        return this.bind(ele, type, listener, usecapture)
    },
    hasAttr: function(ele, attr) {
        return ele.hasAttribute ? ele.hasAttribute(attr) : !!ele[attr]
    }
};

var DomOutline = function (options) {//依赖js
    options = options || {};

    var pub = {};
    var self = {
        opts: {
            namespace: options.namespace || 'sz-circle',
            borderWidth: options.borderWidth || 2,
            onClick: options.onClick || false,
            onCancel: options.cancelCircle || false,
            filter: options.filter || false	//{dom:[],id:[],class:[],name:[]}  不需要勾选的元素
        },
        keyCodes: {
            BACKSPACE: 8,
            SHIFT: 16,
            ESC: 27,
            DELETE: 46
        },
        active: false,
        initialized: false,
        elements: {}
    };

    function writeStylesheet(css) {
        var element = document.createElement('style');
        element.type = 'text/css';
        document.getElementsByTagName('head')[0].appendChild(element);

        if (element.styleSheet) {
            element.styleSheet.cssText = css; // IE
        } else {
            element.innerHTML = css; // Non-IE
        }
    }

    function initStylesheet() {
        if (self.initialized !== true) {
            var css = '' +
                '.' + self.opts.namespace + ' {' +
                '    background: #09c;' +
                '    position: absolute;' +
                '    z-index: 1000000;' +
                '}' +
                '.' + self.opts.namespace + '_label {' +
                '    background: #09c;' +
                '    border-radius: 2px;' +
                '    color: #fff;' +
                '    font: bold 12px/12px Helvetica, sans-serif;' +
                '    padding: 4px 6px;' +
                '    position: absolute;' +
                '    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.25);' +
                '    z-index: 1000001;' +
                '}';

            writeStylesheet(css);
            self.initialized = true;
        }
    }

    function createOutlineElements() {
        //self.elements.label = jQuery('<div></div>').addClass(self.opts.namespace + '_label').appendTo('body');
        self.elements.top = jQuery('<div></div>').addClass(self.opts.namespace).appendTo('body');
        self.elements.bottom = jQuery('<div></div>').addClass(self.opts.namespace).appendTo('body');
        self.elements.left = jQuery('<div></div>').addClass(self.opts.namespace).appendTo('body');
        self.elements.right = jQuery('<div></div>').addClass(self.opts.namespace).appendTo('body');
    }

    function removeOutlineElements() {
        jQuery.each(self.elements, function(name, element) {
            element.remove();
        });
    }

    function compileLabelText(element, width, height) {
        var label = element.tagName.toLowerCase();
        if (element.id) {
            label += '#' + element.id;
        }
        if (element.className) {
            label += ('.' + jQuery.trim(element.className).replace(/ /g, '.')).replace(/\.\.+/g, '.');
        }
        return label + ' (' + Math.round(width) + 'x' + Math.round(height) + ')';
    }

    function getScrollTop() {
        if (!self.elements.window) {
            self.elements.window = jQuery(window);
        }
        return self.elements.window.scrollTop();
    }

    function updateOutlinePosition(e) {
        if (e.target.className.indexOf(self.opts.namespace) !== -1) {
            return;
        }
        if (self.opts.filter) {
        	if(isNotValidElement(e.target)){
        		return;
        	}
        }      
        pub.element = e.target;

        var b = self.opts.borderWidth;
        var scroll_top = getScrollTop();
        var pos = pub.element.getBoundingClientRect();
        var top = pos.top + scroll_top;

        //var label_text = compileLabelText(pub.element, pos.width, pos.height);
        var label_top = Math.max(0, top - 20 - b, scroll_top);
        var label_left = Math.max(0, pos.left - b);

        //self.elements.label.css({ top: label_top, left: label_left }).text(label_text);
        self.elements.top.css({ top: Math.max(0, top - b), left: pos.left - b, width: pos.width + b, height: b });
        self.elements.bottom.css({ top: top + pos.height, left: pos.left - b, width: pos.width + b, height: b });
        self.elements.left.css({ top: top - b, left: Math.max(0, pos.left - b), width: b, height: pos.height + b });
        self.elements.right.css({ top: top - b, left: pos.left + pos.width, width: b, height: pos.height + (b * 2) });
    }
    
    function isNotValidElement(element){
    	var flag = false;
    	var filter = self.opts.filter;
    	if(filter.dom && filter.dom.length>0){
    		for(var i=0,l=filter.dom.length;i<l;i++){
    			if(jQuery(element).is(filter.dom[i])){
    				flag = true;
    				break;
    			}
    		}
    	}
    	if(flag === true){
    		return true;
    	}
    	
    	if(filter.id && filter.id.length>0){
    		for(var i=0,l=filter.id.length;i<l;i++){
    			if(jQuery(element).parents("#"+filter.id[i]).length>0 || jQuery(element).attr("id") === filter.id[i]){
    				flag = true;
    				break;
    			}
    		}
    	}
		if(flag === true){
    		return true;
    	}
    }

    function stopOnEscape(e) {
        if (e.keyCode === self.keyCodes.ESC || e.keyCode === self.keyCodes.BACKSPACE || e.keyCode === self.keyCodes.DELETE) {
            pub.stop();
        }else if(e.keyCode === self.keyCodes.SHIFT){
        	if(self.active !== true){
        		pub.start();
        	}else{
        		pub.stop();
        	}
        }
        
        if(self.active !== true){		//如果取消了 圈选
        	if(self.opts.onCancel){
            	self.opts.onCancel();
            }
        }

        return false;
    }

    function clickHandler(e) {
        pub.stop();
        self.opts.onClick(pub.element,e);
        return false;
    }

    pub.start = function () {
        initStylesheet();
        if (self.active !== true) {
            self.active = true;
            createOutlineElements();
            jQuery('body').on('mousemove.' + self.opts.namespace, updateOutlinePosition);
            jQuery('body').on('keyup.' + self.opts.namespace, stopOnEscape);
            if (self.opts.onClick) {
                setTimeout(function () {
                    jQuery('body').on('click.' + self.opts.namespace, function(e){
                        if (self.opts.filter) {
                        	if(isNotValidElement(e.target)){
                                return false;
                            }
                        }
                        clickHandler.call(this, e);
                    });
                }, 50);
            }
        }
    };

    pub.stop = function () {
        self.active = false;
        removeOutlineElements();
        jQuery('body').off('mousemove.' + self.opts.namespace)
            .off('keyup.' + self.opts.namespace)
            .off('click.' + self.opts.namespace);
    };

    return pub;
};

var MainController = function(){
	bindEvent();
	var outlineObj = DomOutline({ 
		onClick: clickCallback.bind(this),
		cancelCircle: cancelCallback.bind(this),
		filter:{"id":["sz-circle_container"]}
	}),
	operate_element,circle_container,circle_data,high_light,circle_start;
	
	function MainController(){}
	
	function bindEvent(){
		console.log("iframe start bind event");
		Util.bind(window, "message",
			function(evt) {
				var data = evt.data;
				var mode = data.mode;
				
				if (mode == "init-circle") {
					circle_data = data.data.circle_data;
					circle_start = data.data.circle_start;
					initCircle();
				} else if (mode == "high-light") {
					high_light = data.data.high_light;
					initHighLight();
				}else if(mode === "console-log-callback"){
					console.log(window.parent);
				}
			}
		);
	}
	
	function initCircle() {
		if(circle_start){
			console.log("init-circle");
			initCircleContainer();
			outlineObj.start();
		}else{
			closeCircleContainer();
			outlineObj.stop();
		}
	};
	
	function clickCallback(element,event){//点击全选元素的callback
		operate_element = element;
		addCoverShow();
		freshCircleContainer();
		outlineObj.start();
		event.stopPropagation();
	};
	
	function cancelCallback(){//取消全选
		console.log("cancel circle");
		closeCircleContainer();
		
		parent.postMessage({
		    mode: "cancel_circle"
		}, '*');
		
	};
	
	function addCoverShow(){
		$("body").find(".sz-circle-cover").remove();
		var coverObj = jQuery("<div class='sz-circle-cover'></div>").appendTo("body");
		var scrollTop = $(window).scrollTop();
		var rect = operate_element.getBoundingClientRect();
		coverObj.css({height:rect.height,width:rect.width,left:rect.left,top:(rect.top+scrollTop)});
	};
	
	function initCircleContainer(){
		circle_container = document.getElementById("sz-circle_container");
		if(!circle_container){
			circle_container = document.createElement("div");
			circle_container.id = "sz-circle_container";
			circle_container.style.cssText = "width:200px;height:300px;position:absolute;border:1px solid #CCC;"
				+"background-color:white;box-shadow: 0px 0px 3.5em;border-radius: 2px;display:none;";
			document.body.appendChild(circle_container);
			
			var container_body = document.createElement("div");
			container_body.name = "body";
			container_body.style.padding = "20px";
			circle_container.appendChild(container_body);
			
			var label = document.createElement("label");
			label.innerHTML = "名称";
			container_body.appendChild(label);
			
			var input = document.createElement("input");
			input.type = "text";
			input.name = "name";
			container_body.appendChild(input);
			
			var submit = document.createElement("input");
			submit.type = "button";
			submit.name = "submit";
			submit.value = "保存";
			container_body.appendChild(submit);
			submit.onclick = saveCircleData;
			
			var cancel = document.createElement("input");
			cancel.type = "button";
			cancel.name = "cancel";
			cancel.value = "取消";
			container_body.appendChild(cancel);
			
			cancel.onclick = closeCircleContainer;
		}
	};
	
	function freshCircleContainer(){
		if(circle_container === null || circle_container === undefined){
			initCircleContainer();
		}
		var scrollTop = $(window).scrollTop();
		var rect = operate_element.getBoundingClientRect();
		
		var left = rect.left + rect.width;
		var top = rect.top + rect.height + scrollTop;
		
		var container_height = parseInt((circle_container.style.height+"").replace("px",""));
		var container_width = parseInt((circle_container.style.width+"").replace("px",""));
		
		var window_width = document.body.scrollWidth;
		var window_height = document.body.scrollHeight;
		
		left = (left + container_width)>=window_width?(left-container_width):left;
		top = (top + container_height)>=window_height?(top-container_height):top;
		
		circle_container.style.top = top + "px";
		circle_container.style.left = left + "px";
		circle_container.style.display = "block";
		
		var ele_circle_data = getElementCircleData();
		var name = (ele_circle_data?ele_circle_data.name:null) || operate_element.innerText;
		$(circle_container).find("input[name='name']").val(name)
	};
	
	function getElementCircleData(){
		var xpath = createXPathFromElement(operate_element);
		var temp_circle_data = circle_data||[],xpath1;
		for(var i=0,l=temp_circle_data.length;i<l;i++){
			xpath1 = decodeURIComponent(temp_circle_data[i].xpath);
			if(xpath === xpath1){
				return temp_circle_data[i];
			}
		}
		return null;
	}
	
	function saveCircleData(){
		var data = {};
		data.name = $(circle_container).find("input[name='name']").val();
		data.xpath = createXPathFromElement(operate_element);
		
		closeCircleContainer();
		
		parent.postMessage({
	        mode: "save-data",
	        data: data
	    }, '*');
	};
	
	function closeCircleContainer(){
		operate_element = null;
		$("body").find(".sz-circle-cover").remove();
		if(circle_container){
			circle_container.style.display = "none";
		}
	};
	
	function initHighLight(){
		console.log("high_light:",high_light);
		$("body").find(".sz-circle-define").remove();
		
		if(high_light){
			var temp_circle_data = circle_data||[],
				xpath,element;
			for(var i=0,l=temp_circle_data.length;i<l;i++){
				xpath = decodeURIComponent(temp_circle_data[i].xpath)
				element = lookupElementByXPath(xpath);
				createDefineElementShow(element);
			}
		}
	};
	
	function createDefineElementShow(element){
		var defineObj = jQuery("<div class='sz-circle-define'></div>").appendTo("body");
		var scrollTop = $(window).scrollTop();
		var rect = element.getBoundingClientRect();
		defineObj.css({height:rect.height,width:rect.width,left:rect.left,top:(rect.top+scrollTop)});
		defineObj.click(function(event){
			console.log("define obj click function:");
			console.log(element);
			clickCallback(element,event);
			event.stopPropagation();
		});
		defineObj.mousemove(function(){
			$(element).trigger("mousemove");
			event.stopPropagation();
		})
	};
	
	function createXPathFromElement(elm) { 
	    var allNodes = document.getElementsByTagName('*'); 
	    for (var segs = []; elm && elm.nodeType == 1; elm = elm.parentNode){ 
	        if (elm.hasAttribute('id')) { 
	                var uniqueIdCount = 0; 
	                for (var n=0;n < allNodes.length;n++) { 
	                    if (allNodes[n].hasAttribute('id') && allNodes[n].id == elm.id) uniqueIdCount++; 
	                    if (uniqueIdCount > 1) break; 
	                }; 
	                if ( uniqueIdCount == 1) { 
	                    segs.unshift('id("' + elm.getAttribute('id') + '")'); 
	                    return segs.join('/'); 
	                } else { 
	                    segs.unshift(elm.localName.toLowerCase() + '[@id="' + elm.getAttribute('id') + '"]'); 
	                } 
	        } /*else if (elm.hasAttribute('class')) { 
	            segs.unshift(elm.localName.toLowerCase() + '[@class="' + elm.getAttribute('class') + '"]'); 
	        }*/ else { 
	            for (i = 1, sib = elm.previousSibling; sib; sib = sib.previousSibling) { 
	                if (sib.localName == elm.localName)  i++; }; 
	                segs.unshift(elm.localName.toLowerCase() + '[' + i + ']'); 
	        }; 
	    }; 
	    return segs.length ? '/' + segs.join('/') : null; 
	}; 

	function lookupElementByXPath(xpath) { 
	    var evaluator = new XPathEvaluator(); 
	    var result = evaluator.evaluate(xpath, document.documentElement, null,XPathResult.FIRST_ORDERED_NODE_TYPE, null); 
	    return  result.singleNodeValue; 
	} 
	
	return MainController;
}();


new MainController();

parent.postMessage({
    mode: "client_circle_injected"
}, '*');


