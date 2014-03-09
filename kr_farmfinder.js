var author = "dalesmckay@gmail.com";
var minVer = "7.0";
var win = (window.frames.length > 0) ? window.main : window;
var ver = win.game_data.version.match(/[\d|\.]+/g);
if (!ver || (parseFloat(ver[1]) < minVer)) {
    alert("This script requires v" + minVer + " or higher.\nYou are running: v" + ver[1]);
} else {
    if (win.game_data.screen == "map") {
        var coords = [];
        var col, row, coord, 마을, 게이머, points;
        for (row = 0; row < TWMap.size[1]; row++) {
            for (col = 0; col < TWMap.size[0]; col++) {
                coord = TWMap.map.coordByPixel(TWMap.map.pos[0] + (TWMap.tileSize[0] * col), TWMap.map.pos[1] + (TWMap.tileSize[1] * row));
                if (coord) {
                    마을 = TWMap.villages[coord.join("")];
                    if (마을) {
                        게이머 = null;
                        if (parseInt(마을.소유주 || "0", 10)) {
                            게이머 = TWMap.players[마을.소유주];
                        }
                        points = parseInt(마을.points.replace(".", ""), 10);
                        if (게이머) {
                            if (게이머.name != win.game_data.게이머.name) {
                                if ((!마을_size.min || (points >= 마을_size.min)) && (!마을_size.max || (points <= 마을_size.max))) {
                                    coords.push(coord.join("|"));
                                }
                            }
                        } else {
                            if ((!barb_size.min || (points >= barb_size.min)) && (!barb_size.max || (points <= barb_size.max))) {
                                coords.push(coord.join("|"));
                            }
                        }
                    }
                }
            }
        }
        alert(coords.join(" "));
    } else {
        alert("Run this script from the Map.\nRedirecting now...");
        self.location = win.game_data.link_base_pure.replace(/screen\=/i, "screen=map");
    }
}
void(0);
