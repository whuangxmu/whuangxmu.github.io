function TimeStep() {
	var obj = new Object;
	obj.prepare = function() {
		var h="<ul>";
		for (var i=0; i<obj.nodes.length; i++)
		{
			h+="<li id=\"item"+(i+1)+"\">";
			h+="<p class=\"item item"+(i+1)+"\" title=\""+obj.nodes[i].tip+"\">";
			h+="<span class=\"notestep\">"+obj.nodes[i].title+"</span>";
			h+="</p></li>";
		}
		h+="</ul>";
		h+="<div class=\"clearfix\"></div>";
		$(".time-step-wrap").html(h);
		var item_width = Math.floor($(".time-step-wrap").width() / 7 - 10);
		var line_width = item_width - 60;
		$(".time-step-wrap li").width(item_width);
//		alert(item_width);

		h="<style>";
		h+=".time-step-wrap li + li p.item:before,.time-step-wrap li + li p.item.pass:before,.time-step-wrap li + li p.item.now:before,";
		h+=".time-step-wrap li:not(:last-of-type) p.item:after,.time-step-wrap li:not(:last-of-type) p.item.now:after,.time-step-wrap li:not(:last-of-type) p.item.pass:after {";
		h+=" width: " + line_width + "px; }";
		h+=".time-step-wrap li + li p.item:before,.time-step-wrap li + li p.item.pass:before,.time-step-wrap li + li p.item.now:before {";
		h+=" left: " + (-line_width-5) + "px;";
		h+="}";
		h+=".time-step-wrap li:not(:last-of-type) p.item:after,.time-step-wrap li:not(:last-of-type) p.item.now:after,.time-step-wrap li:not(:last-of-type) p.item.pass:after {";
		h+=" left: " + (line_width+15) + "px;";
		h+="}";
		h+="</style>";
		
		$(".time-step-wrap").append(h);
	};
	obj.run = function() {
		// time-step---start
	    let nowTime = new Date();
	    let endTime = obj.nodes[obj.nodes.length - 1].time;
	    let howmuchTime = (endTime - nowTime) / 1000;
	    let Time = Math.floor(howmuchTime);

	    //現在到結束時間的倒數日數
	    let Now2Final = Time[0];

	    let arrDayLeftFromNow = [];
	    for (let i = 0; i < obj.nodes.length; i++) {
	        let DayLeftFromNowForPush = Math.floor((obj.nodes[i].time - nowTime) / 1000);
	        arrDayLeftFromNow.push(DayLeftFromNowForPush);
	    }
	    let arrWidth = [];
	    for (let i = 0; i < arrDayLeftFromNow.length - 1; i++) {
	        let widthForPush = (Math.abs(arrDayLeftFromNow[i]) / (arrDayLeftFromNow[i + 1] - arrDayLeftFromNow[i])) * 45;
// 	        console.log(i+","+arrDayLeftFromNow[i]+"/"+(arrDayLeftFromNow[i + 1] - arrDayLeftFromNow[i])+"="+widthForPush);
	        arrWidth.push(widthForPush);
	    }

	    // 判斷now
	    for (let i = 0; i < obj.nodes.length; i++) {
	        if (arrDayLeftFromNow[i] <= 0) {
	            $('#item' + (i + 1) + '').addClass('checkA');
	        }
	        if (arrDayLeftFromNow[i] < 0) {
	            $('.item' + (i + 1) + '').addClass('pass');
	        } else {
	            $('.item' + (i + 1) + '').removeClass('pass');
	        }
	        if (arrDayLeftFromNow[i] > 0) {
	            $('#item' + (i + 1) + '').addClass('checkB');
	        }
	    }
	    $('.checkA:last').addClass('checkForNow');
	    $('.checkForNow p').addClass('now');
	    let addHTML = $('.now').html();
	    $('.now').html('' + addHTML + '<div class="nowcircle"></div>');

	    // 進度百分比
	    $('.checkB:first p').addClass('checkForStepLine');
	    for (let i = 0; i < obj.nodes.length; i++) {
	        let hasclassCheck = $('.item' + (i + 1) + '').hasClass('now');
	        if (hasclassCheck) {
	            $('.time-step-wrap li+li p.checkForStepLine').before('<div class="addline" style="position:absolute; left: -45px; top: 40px;display:inline; width:' + Math.floor(arrWidth[i]) + 'px; height:3px; background-color:#e21d38;z-index: 100;"></div>');
	        }
	    }
	}
	return obj;
}