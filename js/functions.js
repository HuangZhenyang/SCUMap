//计算两点间距离的函数
function getDistance(lo1, la1, lo2, la2) {
	var x1, y1, x2, y2, distance, point1 = new PrjPoint(),
		point2 = new PrjPoint(),
		position1 = [],
		position2 = [];

	point1.SetLoLa(lo1, la1);
	point2.SetLoLa(lo2, la2);

	position1 = point1.Getxy(x1, y1);
	position2 = point2.Getxy(x2, y2);

	distance = Math.sqrt((position1[0] - position2[0]) * (position1[0] - position2[0]) + (position1[1] - position2[1]) * (position1[1] - position2[1]));

	return distance;
}

//创建右键菜单
//设置起点
var setStartPoint = function (e, ee, marker) {
		let sp = marker.getPosition();
		let positionname = "";
		for (i = 0; i < scupoint.length; ++i) {
			if ((scupoint[i].lng === sp.lng) && (scupoint[i].lat === sp.lat)) {
				positionname = scupoint[i].name;
			}
		}
		document.getElementById("startPointText").value = positionname;

		marker.setAnimation(BMAP_ANIMATION_DROP); // BOUNCE


	}
	//设置终点
var setEndPoint = function (e, ee, marker) {
	let ep = marker.getPosition();
	let positionname = "";
	for (i = 0; i < scupoint.length; ++i) {
		if ((scupoint[i].lng === ep.lng) && (scupoint[i].lat === ep.lat)) {
			positionname = scupoint[i].name;
		}
	}
	document.getElementById("endPointText").value = positionname;

	marker.setAnimation(BMAP_ANIMATION_DROP); //下坠的动画
}


//Floyd算法函数
function floyd(graph, P) {
	var D = new Array(Constant.graph_n); // 存两点间最短路径的二维矩阵
	//初始化D
	for (i = 0; i < Constant.graph_n; ++i) { //存两点间最短路径的二维矩阵
		D[i] = new Array(Constant.graph_n);
	}
	for (i = 0; i < Constant.graph_n; ++i) {
		for (j = 0; j < Constant.graph_n; ++j) {
			D[i][j] = graph[i][j];
		}
	}

	//计算所有的k paths
	for (let k = 0; k < Constant.graph_n; ++k) {
		for (let i = 0; i < Constant.graph_n; ++i) {
			for (let j = 0; j < Constant.graph_n; ++j) {
				if (D[i][j] > (D[i][k] + D[k][j])) {

					D[i][j] = D[i][k] + D[k][j];

					P[i][j] = k;
				}
			}
		}
	}

	return [D, P];
}

//获取从点x到y的路径
//如果为0，则说明可以直接到达。
function getPath(P, x, y) {
	if (P[x][y] === 0) {
		//shortestpath.push(-1);
		return;
	}

	getPath(P, x, P[x][y]);
	//输出k
	//alert(P[x][y]);
	shortestpath.push(P[x][y]);
	getPath(P, P[x][y], y);

}
//得到最短路径并调用drawPath()画在地图上
function getShortestDistance() {
	var startpointname = document.getElementById("startPointText").value;
	var endpointname = document.getElementById("endPointText").value;
	if (startpointname === "" && endpointname === "") {
		alert("请选择起点和终点");
		return;
	} else if (startpointname === "") {
		alert("请选择起点");
		return;
	} else if (endpointname === "") {
		alert("请选择终点");
		return;
	}
	var startpoint, endpoint, temppoint, temppoint1, temppoint2; // 起点，终点，中间点，中间点1， 中间点2

	var sindex = 0,
		eindex = 0;

	//得到这两个点在scupoint中的下标
	for (let i = 0; i < scupoint.length; ++i) {
		if (scupoint[i].name === startpointname) {
			sindex = i;
		}
		if (scupoint[i].name === endpointname) {
			eindex = i;
		}
	}
	//起点终点都是地图上可见的scupoint
	startpoint = new BMap.Point(scupoint[sindex].lng, scupoint[sindex].lat);
	endpoint = new BMap.Point(scupoint[eindex].lng, scupoint[eindex].lat);
	//调用Floyd函数，计算距离
	//[D, P] = floyd(graph, P);
	//将最短距离显示在文本框里
	document.getElementById("result").value = D[sindex][eindex].toFixed(2);

	drawPath(startpoint, endpoint, sindex, eindex);

	addHistory(startpointname, endpointname, sindex, eindex);

}

//将路径画在地图上
function drawPath(startpoint, endpoint, sindex, eindex) {
	var temppoint, temppoint1, temppoint2;
	//获取两个点之间最短路径需要经过哪些点
	getPath(P, sindex, eindex);

	//画出最短距离路径
	if (shortestpath.length === 0) { //没有经过中间点说明这两点直接到达是距离最短	
		polyline = new BMap.Polyline([startpoint, endpoint], {
			strokeColor: "blue",
			strokeWeight: 6,
			strokeOpacity: 0.5
		}); //定义折线
		map.addOverlay(polyline); //添加折线到地图上
		polylines.push(polyline); //将折线存到数组里，以便下一次计算距离时从地图上删掉这次的路径

		points.push(startpoint, endpoint); //将起始点和终点存到points数组里，画路书的时候用

	} else if (shortestpath.length === 1) {
		//只经过一个中间点
		if (shortestpath[0] < Constant.scupoint_n) {
			temppoint = new BMap.Point(scupoint[shortestpath[0]].lng, scupoint[shortestpath[0]].lat);

		} else {
			temppoint = new BMap.Point(hiddenpoint[shortestpath[0] - Constant.scupoint_n].lng, hiddenpoint[shortestpath[0] - Constant.scupoint_n].lat);

		}
		polyline = new BMap.Polyline([startpoint, temppoint], {
			strokeColor: "blue",
			strokeWeight: 6,
			strokeOpacity: 0.5
		}); //定义起点--中间结点折线
		map.addOverlay(polyline); //添加折线到地图上
		polylines.push(polyline); //将折线存到数组里，以便下一次计算距离时从地图上删掉这次的路径

		polyline = new BMap.Polyline([temppoint, endpoint], {
			strokeColor: "blue",
			strokeWeight: 6,
			strokeOpacity: 0.5
		}); //定义中间结点--终点折线
		map.addOverlay(polyline); //添加折线到地图上
		polylines.push(polyline); //将折线存到数组里，以便下一次计算距离时从地图上删掉这次的路径

		points.push(startpoint, temppoint, endpoint); //将点存到点集里，画路书的时候用


	} else {
		//经过两个及两个以上的结点
		//画起点--第一个中间结点
		if (shortestpath[0] < Constant.scupoint_n) {
			temppoint1 = new BMap.Point(scupoint[shortestpath[0]].lng, scupoint[shortestpath[0]].lat);

		} else {
			temppoint1 = new BMap.Point(hiddenpoint[shortestpath[0] - Constant.scupoint_n].lng, hiddenpoint[shortestpath[0] - Constant.scupoint_n].lat);

		}
		polyline = new BMap.Polyline([startpoint, temppoint1], {
			strokeColor: "blue",
			strokeWeight: 6,
			strokeOpacity: 0.5
		}); //定义起点--第一个中间结点折线
		map.addOverlay(polyline); //添加折线到地图上
		polylines.push(polyline); //将折线存到数组里，以便下一次计算距离时从地图上删掉这次的路径

		points.push(startpoint, temppoint1); //存进点集，画路书

		//画中间结点的折线
		for (let i = 0; i < shortestpath.length - 1; ++i) {
			//判断中间结点是scupoint还是hiddenpoint
			if (shortestpath[i] < Constant.scupoint_n && 　shortestpath[i + 1] < Constant.scupoint_n) {
				//两个都是scupoint
				temppoint1 = new BMap.Point(scupoint[shortestpath[i]].lng, scupoint[shortestpath[i]].lat);
				temppoint2 = new BMap.Point(scupoint[shortestpath[i + 1]].lng, scupoint[shortestpath[i + 1]].lat);

			} else if (shortestpath[i] < Constant.scupoint_n && 　shortestpath[i + 1] >= Constant.scupoint_n) {
				temppoint1 = new BMap.Point(scupoint[shortestpath[i]].lng, scupoint[shortestpath[i]].lat);
				temppoint2 = new BMap.Point(hiddenpoint[shortestpath[i + 1] - Constant.scupoint_n].lng, hiddenpoint[shortestpath[i + 1] - Constant.scupoint_n].lat);
			} else if (shortestpath[i] >= Constant.scupoint_n && 　shortestpath[i + 1] < Constant.scupoint_n) {
				temppoint1 = new BMap.Point(hiddenpoint[shortestpath[i] - Constant.scupoint_n].lng, hiddenpoint[shortestpath[i] - Constant.scupoint_n].lat);
				temppoint2 = new BMap.Point(scupoint[shortestpath[i + 1]].lng, scupoint[shortestpath[i + 1]].lat);
			} else if (shortestpath[i] >= Constant.scupoint_n && 　shortestpath[i + 1] >= Constant.scupoint_n) {
				temppoint1 = new BMap.Point(hiddenpoint[shortestpath[i] - Constant.scupoint_n].lng, hiddenpoint[shortestpath[i] - Constant.scupoint_n].lat);
				temppoint2 = new BMap.Point(hiddenpoint[shortestpath[i + 1] - Constant.scupoint_n].lng, hiddenpoint[shortestpath[i + 1] - Constant.scupoint_n].lat);
			}

			polyline = new BMap.Polyline([temppoint1, temppoint2], {
				strokeColor: "blue",
				strokeWeight: 6,
				strokeOpacity: 0.5
			}); //定义中间结点折线
			map.addOverlay(polyline); //添加折线到地图上
			polylines.push(polyline); //将折线存到数组里，以便下一次计算距离时从地图上删掉这次的路径

			points.push(temppoint2); //存进点集，画路书
		}

		if (shortestpath[shortestpath.length - 1] < Constant.scupoint_n) {
			temppoint2 = new BMap.Point(scupoint[shortestpath[shortestpath.length - 1]].lng, scupoint[shortestpath[shortestpath.length - 1]].lat);

		} else {
			temppoint2 = new BMap.Point(hiddenpoint[shortestpath[shortestpath.length - 1] - Constant.scupoint_n].lng, hiddenpoint[shortestpath[shortestpath.length - 1] - Constant.scupoint_n].lat);

		}


		polyline = new BMap.Polyline([temppoint2, endpoint], {
			strokeColor: "blue",
			strokeWeight: 6,
			strokeOpacity: 0.5
		}); //定义最后一个中间结点--终点折线
		map.addOverlay(polyline); //添加折线到地图上
		polylines.push(polyline); //将折线存到数组里，以便下一次计算距离时从地图上删掉这次的路径

		points.push(endpoint); //存进点集，画路书
	}

	//路线规划
	routePlan();

	//画路书
	drawLuShu();
}

//点击计算按钮以后触发该函数，用于初始化变量，以及调用获取最短距离的函数
function start() {
	shortestpath.length = 0;
	for (let i = 0; i < polylines.length; ++i) {
		map.removeOverlay(polylines[i]);
	}
	polylines.length = 0;
	points.length = 0;

	getShortestDistance();
}


//鼠标左键单击显示信息窗口
function addClickHandler(content, marker) {
	marker.addEventListener("click", function (e) {
		openInfo(content, e)
	});
}
//打开信息窗口
function openInfo(content, e) {
	var p = e.target;
	var point = new BMap.Point(p.getPosition().lng, p.getPosition().lat);
	var infoWindow = new BMap.InfoWindow(content, opts); // 创建信息窗口对象 
	map.openInfoWindow(infoWindow, point); //开启信息窗口
}

//清除路径函数
function clearPaths() {
	var routeplan = document.getElementById("routePlanText");
	for (let i = 0; i < polylines.length; ++i) {
		map.removeOverlay(polylines[i]);
	}
	polylines.length = 0;
	shortestpath.length = 0;

	//把文本框内容清除
	setText("", "", "");

	//清除路径规划
	routeplan.value = "";

	//清除路径规划提示信息
	tip = "";

	points.length = 0;
}

//切换夜间模式函数
function transferToNight() {
	if (document.getElementById("cb1").checked === true) {
		changeMapStyle('midnight')
		sel.value = 'midnight';

	} else {
		changeMapStyle('normal')
		sel.value = 'normal';

	}
}

function changeMapStyle(style) {
	map.setMapStyle({
		style: style
	});
	$('#desc').html(mapstyles[style].desc);
}


//添加历史记录
function addHistory(startpointname, endpointname, sindex, eindex) {

	var historylist = document.getElementById("history");
	var option, text, value;

	text = startpointname + "--" + endpointname;
	value = sindex + "_" + eindex;
	for (let i = 0; i < historylist.length; ++i) {
		if (value == historylist.options[i].value) {
			return;
		}
	}

	option = new Option(text, value);
	historylist.options.add(option);

}

//显示历史记录被选中的路线
function setPolyline() {
	var value = document.getElementById("history").options[document.getElementById("history").selectedIndex].value;

	//清除地图上的路径
	clearPaths();

	//画上用户选择的历史记录路径
	var sindex = value.split("_")[0],
		eindex = value.split("_")[1];

	var startpoint = new BMap.Point(scupoint[sindex].lng, scupoint[sindex].lat),
		endpoint = new BMap.Point(scupoint[eindex].lng, scupoint[eindex].lat);

	drawPath(startpoint, endpoint, sindex, eindex);

	setText(scupoint[sindex].name, scupoint[eindex].name, D[sindex][eindex]);


}

//清除历史记录
function clearHistory() {
	var historylist = document.getElementById("history"),
		routeplan = document.getElementById("routePlanText");
	var l = historylist.length; // 因为清掉以后historylist长度会变化
	for (let i = 0; i < l; ++i) {
		historylist.remove(0); // 清掉以后historylist里的元素下边会改变
	}

	//清除地图上的路径
	clearPaths();

	//清除文本框的内容
	setText("", "", "");

	//清除路径信息
	routeplan.value = "";
}

//路书的开始函数
function startLuShu() {
	lushu.start();
}
//路书的暂停函数
function pauseLuShu() {
	lushu.pause();
}

//画路书
function drawLuShu() {
	map.setViewport(points);
	lushu = new BMapLib.LuShu(map, points, {
		defaultContent: "", //"从天安门到百度大厦"
		autoView: true, //是否开启自动视野调整，如果开启那么路书在运动过程中会根据视野自动调整
		icon: myicon,
		speed: 400,
		enableRotation: false, //是否设置marker随着道路的走向进行旋转
		landmarkPois: []
	});
}

//设置文本框的内容
function setText(sText, eText, rText) {
	var startPointText = document.getElementById("startPointText"),
		endPointText = document.getElementById("endPointText"),
		result = document.getElementById("result");
	startPointText.value = sText;
	endPointText.value = eText;
	result.value = rText;

}

//得到两点间的方向角
function getDirection(sLng, sLat, eLng, eLat) {
	if (eLng > sLng && eLat > sLat) {
		return 1;
	} else if (eLng < sLng && eLat > sLat) {
		return 2;
	} else if (eLng < sLng && eLat < sLat) {
		return 3;
	} else if (eLng > sLng && eLat < sLat) {
		return 4;
	}
}

//路线规划函数
function routePlan() {
	var sindex, eindex, direction, tip = "",
		routePlanText = document.getElementById("routePlanText");
	for (let i = 0; i < points.length - 1; ++i) {
		sindex = getIndex(points[i]);
		eindex = getIndex(points[i + 1]);
		//alert("sindex为"+sindex+"  eindex为"+eindex);
		direction = getDirection(points[i].lng, points[i].lat, points[i + 1].lng, points[i + 1].lat);
		//alert(direction);

		if (direction === 1) {
			//alert("东北");
			tip += "向东北";
		} else if (direction === 2) {
			//alert("西北");
			tip += "向西北";
		} else if (direction === 3) {
			//alert("西南");
			tip += "向西南";
		} else if (direction === 4) {
			//alert("东南");
			tip += "向东南";
		}
		//alert(D[sindex][eindex]);
		tip += ("走" + (D[sindex][eindex].toFixed(2)) + "米");
		//tip += "走";
		//tip += parseFloat(D[sindex][eindex]).toFixed(2);
		//tip += "米";
		if (eindex < scupoint.length) {
			tip += ("到达" + scupoint[eindex].name);
		}
		tip += ";\r\n";

	}
	alert(tip);
	routePlanText.value = tip;
}

//找到矩阵中的下标
function getIndex(point) {
	for (let i = 0; i < scupoint.length; ++i) {
		if (point.lng === scupoint[i].lng && point.lat === scupoint[i].lat) {
			return i;
		}
	}

	for (let i = 0; i < hiddenpoint.length; ++i) {
		if (point.lng === hiddenpoint[i].lng && point.lat === hiddenpoint[i].lat) {
			return i + scupoint.length;
		}
	}

}
