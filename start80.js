javascript: var doc = document;

if (window.frames.length > 0) doc = window.main.document;
var dept = doc.title.match(/\d+\|\d+/g);
var deptcoord = dept[0].split('|');

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

var max_coords = coords.length - 1;

dong_count = $.cookie(dong_count_);
if (dong_count == null) {
    dong_count = 0;
}
else if(dong_count >= max_coords) {
    dong_count = 0
}

if (max_coords < 1) {
    UI.InfoMessage("동줍 초기화를 먼저 해주세요!!");
    bool_run = false;
} else {
    bool_run = true;
}

function loop_run() {
    bool_run = true;
}


function get_param(name) {
    if (document.location.href.indexOf('am_farm') > -1) {

        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(document.forms[0].action);

        if (results == null) {
            return ""
        } else {
            return results[1];
        }
    }
    else {
        return ""
    }
}

var template_id = get_param("template_id");
var false_count = 0;
var wait_delete = -1;
var wait_delete_bool = false;

function dong() {

    if (bool_run) {
        $.post("https://en80.tribalwars.net" + game_data['link_base_pure'] + "am_farm&mode=farm&ajaxaction=farm&json=1&h=" + 
csrf_token, {
            "target": coords[dong_count],
            "template_id": template_id,
            "source": game_data["village"]["id"]
        }, function (data, status) {
            if (data.success) {
                UI.InfoMessage("동줍 : " + ((dong_count * 1) + 1) + "/" + max_coords + "번째 진행중.. (남은 기마 수:" + 
data.current_units.light + ")");
                dong_count++;
                false_count = 0;
                if(wait_delete_bool == true) {
                    UI.InfoMessage("좌표 삭제 중... ", 10000);
                    coords.splice(wait_delete,1);
                    var mapData = "";
                    for(var i = 0; i < (max_coords - 1); i++)
                    {
                        mapData += coords[i] + " ";
                    }
                    localStorage.setItem(dong_map_data, mapData);
					coords = new Array();
					coords = localStorage.getItem(dong_map_data).split(" ");
					max_coords--;
                    wait_delete_bool = false;
                    wait_delete = -1;
                }

                if (dong_count == max_coords) {
                    dong_count = 0;
                }

                $.cookie(dong_count_, dong_count, {
                    expires: 365,
                    path: '/'
                });

            } else {
                false_count++;
                bool_run = false;
                if(wait_delete_bool == true)
				{
					dong_count = wait_delete;
					wait_delete = -1;
					wait_delete_bool = false;
				}
                if(false_count > 10) {
                    wait_delete_bool = true;
                    wait_delete = dong_count;
                    false_count = 0;
                    dong_count++;
                    if (dong_count == max_coords) {
                        dong_count = 0;
                    }
                    $.cookie(dong_count_, dong_count, {
                        expires: 365,
                        path: '/'
                    });
                    setTimeout("loop_run()", 1);
                }
                else {
                    UI.InfoMessage("동줍 : " + dong_count + "/" + max_coords + "번째 기마병 부족으로 대기중...(" + false_count + ")", 5000);      
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

if (document.location.href.indexOf('am_farm') > -1) {
    if (bool_run) {
        loop = setInterval("dong()", 500);
    }
} else {
    document.location.href = game_data['link_base_pure'] + "am_farm"
}
void(0)
