javascript: var distanceLength = prompt("지도 검색범위: (20 단위로 입력)", 20);
distanceLength = distanceLength*1;
var distanceDepth = prompt("최장 거리: (숫자 아무거나!)",20);
distanceDepth = distanceDepth*1;
var doc = document;
if (window.frames.length > 0) doc = window.main.document;
var dept = doc.title.match(/\d+\|\d+/g);
var deptcoord = dept[0].split('|');

deptx = deptcoord[0] * 1;
depty = deptcoord[1] * 1;

mapx = deptx - (deptx % 20);
mapy = depty - (depty % 20);

infoText = deptx + "|" + depty + " 동줍 초기화 시작";

UI.InfoMessage(infoText);

var mapInfo = new Array();
mapSearch = "";
mapData = "";
for (var mappx = mapx - distanceLength; mappx <= mapx + distanceLength; mappx = mappx + 20) {
    for (var mappy = mapy - distanceLength; mappy <= mapy + distanceLength; mappy = mappy + 20) {
        mapSearch += "&" + mappx + "_" + mappy + "=0";
    }
}

infoText += "<br>지도 검색중...";

UI.InfoMessage(infoText);

$.get("https://ts1.tribalwarsmasters.net/map.php?v=2" + mapSearch, function (data, status) {
    infoText += "<br>지도 검색완료...";

    $.each(data, function (index, item) {

        UI.InfoMessage(infoText);
        vill = item.data.villages;


        UI.InfoMessage(infoText);

        $.each(vill, function (plusx, subdata) {
            $.each(subdata, function (plusy, villdata) {
                if (villdata[4] == "0") {
                    posx = (item.data.x * 1) + (plusx * 1);
                    posy = (item.data.y * 1) + (plusy * 1);

                    dis = Math.sqrt(Math.pow(deptx - posx, 2) + Math.pow(depty - posy, 2));

                    mapInfo.push([villdata[0], posx, posy, dis]);
                }
            });
        });
    });

    infoText += "<br>지도 분석완료...";

    UI.InfoMessage(infoText);

    mapInfo.sort(function (a, b) {
        var x = a[3];
        var y = b[3];
        if (x > y) return 1;
        if (x < y) return -1;
        return 0;
    });

    infoText += "<br>거리 정렬완료...";

    UI.InfoMessage(infoText);
	searchCount = 0;
    $.each(mapInfo, function (index, mapDD) {
		if(mapDD[3] <= distanceDepth){
	        mapData += mapDD[0] + " ";
			searchCount++;
		}
    });

    infoText += "<br>" + mapInfo.length + "개의 회광이 검색됨...<br>"+searchCount+"개의 회광이 등록됨...<br>-----동줍 초기화 완료-----";

    UI.InfoMessage(infoText, 5000);

    var dong_map_data = "dong_" + deptx + "|" + depty;
    var dong_count = "dong_count_" + deptx + "|" + depty;

    localStorage.setItem(dong_map_data, mapData);

    $.cookie(dong_count, 0, {
        expires: 365,
        path: '/'
    });
}, 'json');
void(0)
