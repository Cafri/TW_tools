/*
	만든이 : cranix
	홈페이지 : http://cranix.net
	메일 : cranix@cranix.net

	-사용법-

	1. <head> 태그에 아래 초기화 부분을 넣습니다.
---------------------------------------------------------------------------------------------------------
var cmp = new CranixMusicPlayer("cmp"); // 파라메터는 반드시 변수명과 같은문자를 넘겨줍니다.
cmp.addMusic("그냥 걸었어","임종환 - 그냥 걸었어.mp3");  // cmp.addMusic("[제목]","[주소]");
---------------------------------------------------------------------------------------------------------

	2. 플레이어가 나오길 원하는 위치에 아래 소스를 삽입합니다.
---------------------------------------------------------------------------------------------------------
<script>
cmp.writePlayer();
</script>
---------------------------------------------------------------------------------------------------------
*/

// class CranixMusic {
function CranixMusicPlayer(name,width) {
	// 버튼을 임의로 설정할수 있습니다.
	this.playButton = "▷";
	this.pauseButton = "∥";
	this.stopButton = "□";
	this.nextButton = "≫";

	// 플레이어의 크기를 설정합니다.
	this.width = 300;
	if (width){
		this.width = width;
	}
	

	this.objName = name;
	this.musicArray = new Array();
	this.playerObj = null;
	this.playIndex = -1;
	this.playTime = 0;
	this.playTimer = null;
	this.nextTimer = null;
	this.isPause = false;
	this.isInit = false;

	this.initPlayer = cmp_initPlayer;
	this.addMusic = cmp_addMusic;
	this.size = cmp_size;


	this.play = cmp_play;
	this.pause = cmp_pause;
	this.stop = cmp_stop;
	this.next = cmp_next;
	this.checkTime = cmp_checkTime;
	this.getHtml = cmp_getHtml;
	this.updateLCD = cmp_updateLCD;
	this.getRemainTime = cmp_getRemainTime;
	this.writePlayer = cmp_writePlayer;
	this.playStateChange = cmp_playStateChange;
	this.endNext = cmp_endNext;
	this.auto = cmp_auto;

}
function cmp_getRemainTime() {
	var m = Math.floor(this.playTime/60)+"";
	var s = Math.floor(this.playTime%60)+"";

	if (m.length == 1)
		m = "0"+m;
	if (s.length == 1)
		s = "0"+s;

	return m+":"+s;
}

function cmp_updateLCD() {
	var html = '';
	var data = this.musicArray[this.playIndex];
	cmp_LCD.innerHTML = "<b>[재생]</b> "+ data.title;
	cmp_TIME.innerHTML = this.getRemainTime();
}
function cmp_getHtml() {
	var html = '';
	html += '<table width="'+this.width+'" border="0" cellspacing="0" cellpadding="0"  style="background:black;color:white;font-size:9pt;padding-left:2;padding-right:2;padding-top:3;padding-bottom:1">';
	html += '<tr>';
	html += '<td width=1>[</td>';
	html += '<td width=25 id="cmp_TIME">';
	html += '<span  style="text-align:center;width:100%;"></span>';
	html += '</td>';
	html += '<td width=1>]</td>';
	html += '<td>';
	html += '<marquee id="cmp_LCD" width="100%" direction="right" scrollamount="2" scrolldelay="10"></marquee>';
	html += '</td>';
	html += '<td width=35 align="right">';
	html += '<span id="cmp_btn_PLAY" style="cursor:hand;" onclick="'+this.objName+'.auto()">'+this.playButton+'</span>';
	html += '<span id="cmp_btn_STOP" style="cursor:hand;" onclick="'+this.objName+'.stop()">'+this.stopButton+'</span>';
	html += '<span id="cmp_btn_NEXT" style="cursor:hand;" onclick="'+this.objName+'.next()">'+this.nextButton+'</span>';
	html += '</td>';
	html += '</tr>';
	html += '</table><script>'+this.objName+'.initPlayer()</script>';
	return html;
}
function cmp_writePlayer() {
	document.write(this.getHtml());
}

function cmp_checkTime(time) {
	if (time) {
		if (this.playTime == 0)
			this.playTime = time;
	}
	else {
		this.updateLCD();
		if (this.playTime != 0)
			this.playTime--;
	}
	clearTimeout(this.playTimer);
	this.playTimer = setTimeout(this.objName+".checkTime()",1000);
}

function cmp_auto() {
	if (this.playIndex == -1)
		this.next();
	else {
		if (this.isPause)
			this.play();
		else
			this.pause();
	}
}

function cmp_play() {
	this.checkTime();
	cmp_btn_PLAY.innerHTML = this.pauseButton;
	this.playerObj.play();
	this.isPause = false;
}
function cmp_pause() {
	var data = this.musicArray[this.playIndex];
	cmp_LCD.innerHTML = "<b>[일시정지]</b> "+ data.title;
	cmp_btn_PLAY.innerHTML = this.playButton;
	this.isPause = true;
	clearTimeout(this.playTimer);
	this.playerObj.pause();
}
function cmp_stop() {
	cmp_LCD.innerHTML = "<b>[정지]</b>";
	cmp_btn_PLAY.innerHTML = this.playButton;
	this.playerObj.stop();
	clearTimeout(this.playTimer);
	this.playIndex = -1;
	this.playTime = 0;
	this.isPause = false;
}
function cmp_next() {
	this.stop();
	this.playIndex = Math.floor(Math.random() * this.size());
	var data = this.musicArray[this.playIndex];
	this.playerObj.open(data.url);
	this.play();
}

function cmp_endNext() {
	if (cranixMusicPlayer.playState != 2) {
		this.next();
		clearTimeout(this.nextTimer);
		this.nextTimer = setTimeout(this.objName+".endNext()",1000);
	}
	else {
		clearTimeout(this.nextTimer);
		this.nextTimer = null;
	}
}


function cmp_playStateChange(state) {
	var res = null;
	switch(state) {
		case(0) : res = "Undefined - Windows Media Player is in an undefined state."; break;
		case(1) : res = "Ready - Ready to begin playing."; break;
		case(2) : this.checkTime(cranixMusicPlayer.duration);res="play!"; break;
		case(3) : res = "..."; break;
		case(4) : res = "ScanForward - The current media clip is fast forwarding."; break;
		case(5) : res = "ScanReverse - The current media clip is fast rewinding."; break;
		case(6) : res = "Buffering - The current media clip is getting additional data from the server."; break;
		case(7) : res = "Waiting - Connection is established, however the server is not sending bits. Waiting for session to begin."; break;
		case(8) : res = "MediaEnded - Media has completed playback and is at its end."; break;
		case(9) : res = "Transitioning - Preparing new media."; break;
		case(10) : res = "Ready - Ready to begin playing."; break;
		case(11) : res = "Reconnecting - Reconnecting to stream."; break;
		default : res = "Unknown Status."; break;
	}
}


function cmp_initPlayer() {
	if (!this.isInit) {
		var spanObj = document.createElement("span");
		var html ='';
		html += '<object id="cranixMusicPlayer" classid="CLSID:22D6f312-B0F6-11D0-94AB-0080C74C7E95" style="display:none">';
		html += '<param name="AutoStart" value="true">';
		html += '<param name="TransparentAtStart" value="True">';
		html += '<param name="ShowDisplay" value="0">';
		html += '<param name="FileName" value="">';
		html += '</object>';

		html +='<script FOR="cranixMusicPlayer" EVENT="EndOfStream">';
		html +=this.objName+'.endNext();';
		html +='</'+'script>';

		html +='<script FOR="cranixMusicPlayer" Event="PlayStateChange(lOldState, lNewState)">';
		html +=this.objName+'.playStateChange(cranixMusicPlayer.playState);';
		html +='</'+'script>';

		spanObj.innerHTML = html;
		document.body.appendChild(spanObj);

		this.playerObj = spanObj.getElementsByTagName("object")[0];
		this.isInit = true;
		this.auto();
	}
}
function cmp_addMusic(t,u) {
	var cmd = new CranixMusicData(t,u);
	this.musicArray[this.musicArray.length] = cmd;
}

function cmp_size() {
	return this.musicArray.length;
}
// } end CranixMusic;

// class CranixMusicData {
function CranixMusicData(t,u) {
	this.title = t;
	this.url = u;
}
// } end CranixMusicData;
