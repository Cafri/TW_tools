/* 
 * Author: Mori
 * Name: Farming Assistance
 * Version: 6.1
 * Date: 2015.12.19
 * Client script: javascript:$.getScript('https://moriya.kr:43468/tw/js/MoriFarming.js?dl=0');void 0;
 *
 */

var doc = document;
if (window.frames.length > 0) doc = window.parent.document;
var dept = doc.title.match(/\d+\|\d+/g);
var deptcoord = dept[0].split('|');
var tribalwars_url = "https://" + window.location.hostname;

deptx = deptcoord[0] * 1;
depty = deptcoord[1] * 1;

var dong_map_data = "dong_" + deptx + "|" + depty;
var dong_count_ = "dong_count_" + deptx + "|" + depty;

var coords = new Array();
coords = localStorage.getItem(dong_map_data).split(" ");

for(var i = coords.length - 1; i >= 0; i--)
{
    if(!(coords[i] >= 1)) {
        coords.pop(i);
        continue;
    }
    else {
        break;
    }
}
var coords_point = new Array();
var POINT;

var max_coords = coords.length - 1;
var bool_run = true;

dong_count = $.cookie(dong_count_);
if (dong_count == null) {
    dong_count = 0;
}
else if(dong_count >= max_coords) {
    dong_count = 0;
}

if (max_coords < 1) {
	UI.InfoMessage("동줍 초기화를 먼저 해주세요!!");
	bool_run = false;
}
else {
	for(var i = 0; i < coords.length; i++) {
		coords_point[i] = "10000";
	}
	getVillageCheck(1);
	bool_run = true;
}

function loop_run() {
	bool_run = true;
}

function get_param(name, template) {
    if (document.location.href.indexOf('am_farm') > -1) {

        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(document.forms[template].action);

        if (results == null) {
            return ""
        } else {
            return results[1];
        }
    } else {
        return ""
    }
}

var set_remove_village = -1;
var set_candidate_remove_village = -1;
var set_current_count = -1;
var txtFileV;

function getVillageCheck(check)
{
	window.console.log("in getVillageCheck");
	var villageLines = new Array();
	var lines = new Array();
	txtFileV = new XMLHttpRequest();
	if(check == 1) 	{
		txtFileV.onreadystatechange = point_loader;
		txtFileV.open("GET", tribalwars_url + "/map/village.txt", true);
		txtFileV.send(null);
	}
	else return;
}

function point_loader() {
	if (txtFileV.readyState === 4) { 
		if (txtFileV.status === 200) {
			villageLines = txtFileV.responseText.split("\n");

			var tmpArray = new Array();
			for (var i = 0; i < villageLines.length; i++)
				tmpArray[i]=villageLines[i].split(",");

			for(var i = 0; i < coords.length; i++)
			{
				for(var j = coords[i]; j > 0; j--)
				{
					if((coords[i]*=1) == (tmpArray[j][0]*=1)) {
						coords_point[i] = tmpArray[j][5];
						break;
					}
				}
			}
		}
	}
}

function removeCoords(vID)
{
	var infoText = "";
	var mapData = "";
	var find = 0;
	for(var i = 0; i < coords.length; i++)
	{
		if((coords[i]*=1) == (vID*=1))
		{
			coords.splice(i, 1);
			coords_point.splice(i, 1);
			infoText += vID + "유저마을 제거완료! 남은 좌표개수는" + coords.length;
			find = 1;
		}
	}

	for(var i = 0; i < coords.length-1; i++)
	{
		mapData += coords[i] + " ";
	}
	if(coords.length > 0) mapData += coords[coords.length-1];

	set_remove_village = -1;
	set_candidate_remove_village = -1;
	dong_count = set_current_count;

	localStorage.setItem(dong_map_data, mapData);

	coords = new Array();
	coords = localStorage.getItem(dong_map_data).split(" ");
	max_coords = coords.length - 1;

	if(find == 0) infoText += vID + "마을검색실패";
	UI.InfoMessage(infoText,5000);

	if(dong_count > max_coords) dong_count = 0;

	cmdRemove = 0;
}

var template_id;
var false_count = 0;

function dong() {

    if (bool_run) {
		if((coords_point[dong_count]*=1) >= (POINT*=1)) {
			template_id = get_param("template_id", 1);
		}
		else {
			template_id = get_param("template_id", 0);
		}
        $.post(tribalwars_url + game_data['link_base_pure'] + "am_farm&mode=farm&ajaxaction=farm&json=1&h=" + csrf_token, {
            "target": coords[dong_count],
            "template_id": template_id,
            "source": game_data["village"]["id"]
        }, function (data, status) {
            if (data.success) {
                UI.InfoMessage("동줍 : " + ((dong_count*=1)+1) + "/" + ((max_coords*=1)+1) + "번째 진행중.. (남은 기마 수:" + data.current_units.light + ")");
                dong_count++;
                false_count = 0;

                if (dong_count > max_coords) {
                    dong_count = 0;
                }

                $.cookie(dong_count_, dong_count, {
                    expires: 365,
                    path: '/'
                });

            } else {
                false_count++;
                bool_run = false;

				errorMessage = data.error;
				if(errorMessage == "Not enough units available") {
					UI.InfoMessage("동줍 : " + ((dong_count*=1)+1) + "/" + ((max_coords*=1)+1) + "번째 기마병 부족으로 대기중...(" + false_count + ")", 5000); 
                    setTimeout("loop_run()", 5000);
				}
				else if (errorMessage == "Invalid village." || errorMessage == "You are not allowed to attack a player.") {
					UI.InfoMessage(errorMessage, 5000);
					set_candidate_remove_village = coords[dong_count];
					set_current_count = dong_count;
					removeCoords(set_candidate_remove_village);
					false_count = 0;
                    setTimeout("loop_run()", 5000);
				}
				else if (errorMessage == "Your session has expired, please login again.") {
                    UI.ErrorMessage(errorMessage + "<br />세션 만료! 로그인 후 재시작해주세요.", 3 * 24 * 60 * 60 * 1000);
                    var subjectVal = '[TWBot] Session Expired : ' + game_data.world + ', ' + game_data.player.name;
                    var messageVal = 'Session Expired! : ' + Date($.now());
                    sendEmail(subjectVal, messageVal);
                }
				else {
                    UI.ErrorMessage(errorMessage + "<br />알 수 없는 에러입니다!", 5000);
                    setTimeout("loop_run()", 5000);
                }
            }
        }, 'json');
    }
}

	$(document).keydown(function(e){
		if(e.keyCode == 27){
			clearInterval(loop);
			UI.InfoMessage("사용자 요청으로 인해 동줍 중지!");
		}
	});

function sendEmail(subjectVal, messageVal) {
    var mailAddress = localStorage.getItem("mailAddress");
    if (mailAddress === '' || mailAddress != null) {
        var emailToVal = mailAddress;
        var emailFromVal = 'TWBot@gmail.com';

        $.ajax({
            type: "POST",
            url: "https://mandrillapp.com/api/1.0/messages/send.json",
            data: {
                'key': 'xhPYfWtZ5DA4gqHtAH4SYQ',
                'message': {
                    'from_email': emailFromVal,
                    'to': [{
                        'email': emailToVal,
                        'type': 'to'
                    }],
                    'autotext': 'true',
                    'subject': subjectVal,
                    'html': messageVal
                }
            }
        }).done(function (response) {
            console.log(response); // if you're into that sorta thing
        });
    }
}


if (document.location.href.indexOf('am_farm') > -1) {
    if (bool_run) {
		POINT = prompt("동줍 기준 점 입력.\n 만약 100을 입력 했을 경우, 100 미만은 A, 100 이상은 B 동줍이 됩니다.\n단, A와 B에는 같은 병종으로 입력해야 합니다.", 100);
		var mailAddress = localStorage.getItem("mailAddress");
		if(mailAddress == null) {
			localStorage.setItem("mailAddress", prompt("세션 만료 용 메일주소 입력"));
		}
        loop = setInterval("dong()", 500);
    }
} else {
    document.location.href = game_data['link_base_pure'] + "am_farm"
}
void(0)
