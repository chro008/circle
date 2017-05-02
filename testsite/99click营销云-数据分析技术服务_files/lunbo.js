$(function(){
	var n=0;
	var timer=null;
	var btrue=false;
	timer=setInterval(timerTab,3000);	
	function timerTab(){		
		n++;
		if(n>=7){ 
			n=0;
		}
		tabAnaly();		
	}

	/*点击*/
	function clickBtn(){
		
		$(".next1").click(function(){
			/*if(btrue){
				return false;
			}
			btrue=true;*/
			n++;
			if(n>=7){n=0}
			tabAnaly();
			
		});
		$(".prev1").click(function(){
			/*if(btrue){
				return false;
			}
			btrue=true;*/
			n--;
			if(n<0){n=0}
			tabAnaly()	
		});
	}
	clickBtn();
/*自动轮播*/	
	function tabAnaly(){
		if(0<=n&&n<=2 || n==5){
			$(".img-show ul").animate({"left":(-n%3*230)+"px"},back)
			function back(){
				btrue=false;
			}
		}	
		$(".tupian li:eq("+n+")").addClass("no caseAct").siblings("li").removeClass("no caseAct");
		$(".Analysis_"+(n+1)).show().siblings("div").stop().hide();	
	}
	
		/*移入移除清除定时器*/
	$(".next1").mouseover(function(){
		clearTimeout(timer);
	});
	$(".prev1").mouseover(function(){
		clearTimeout(timer);
	});
	$(".next1").mouseout(function(){
		timer=setInterval(timerTab,3000);
	});
	$(".prev1").mouseout(function(){
		timer=setInterval(timerTab,3000);
	});
	/*移入图片暂停*/
	$(".img-show").mouseenter(function(){
		clearTimeout(timer);
	});
	$(".img-show").mouseleave(function(){
		timer=setInterval(timerTab,3000);
	});
	$(".tupian li").click(function(){
		var iNow=$(this).index();
		n=iNow;
		tabAnaly();	
	});
})