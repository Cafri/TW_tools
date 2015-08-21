var _0xa9fe = ["/game.php?village=", "id", "village", "&screen=overview_villages&mode=incomings&group=0&type=unignored&subtype=all", "incomings", "player", "get", ".rightshadow", "insertAfter", "<h1> Label Botting! - Operating now.</h1>", "sitter", "0", "liframeURL", "helpers", "/game.php?t=", "&village=", "liframe", "load", "firstLabel", "one", "createHiddenFrame", "body", "appendTo", "pause", "Timing", "contentWindow", "stopLabel", "<h1> Session Expired! Restart now! </h1>", "100px", "absolute", "-1000px", "css", "src", "attr", "<iframe />", "count", "#bot_check_image", "find", "contents", "size", "html", "#serverTime", " ", "#serverDate", "<h1> Bot Protection! Restart now! ", "</h1>", "click", ".selectAll", ".btn-default[value=표시]", "reloadID", "clearTimeout", "span.quickedit:contains(\"공격\")", "data-id", "push", "ids", "each", "span[data-id=", "]", "a.rename-icon", "Noble", "***NOBLE***", "replace", "val", "input[type=text]", " - ", "input.btn", "checkLabel", "DetectTower", "log", "prevAttackCount", "reload", "init"];
var TagBot = {
    liframeURL: _0xa9fe[0] + game_data[_0xa9fe[2]][_0xa9fe[1]] + _0xa9fe[3],
    liframe: {},
    prevAttackCount: game_data[_0xa9fe[5]][_0xa9fe[4]],
    reloadID: null,
    count: 0,
    init: function() {
        $(_0xa9fe[9])[_0xa9fe[8]]($(_0xa9fe[7])[_0xa9fe[6]](0));
        if (game_data[_0xa9fe[5]][_0xa9fe[10]] !== _0xa9fe[11]) {
            ChoBot[_0xa9fe[13]][_0xa9fe[12]] = _0xa9fe[14] + game_data[_0xa9fe[5]][_0xa9fe[1]] + _0xa9fe[15] + game_data[_0xa9fe[2]][_0xa9fe[1]] + _0xa9fe[3]
        };
        TagBot[_0xa9fe[16]] = TagBot[_0xa9fe[20]](TagBot[_0xa9fe[12]])[_0xa9fe[19]](_0xa9fe[17], TagBot[_0xa9fe[18]])
    },
    createHiddenFrame: function(_0xbc6bx2) {
        return $(_0xa9fe[34])[_0xa9fe[33]](_0xa9fe[32], _0xbc6bx2)[_0xa9fe[31]]({
            width: _0xa9fe[28],
            height: _0xa9fe[28],
            position: _0xa9fe[29],
            left: _0xa9fe[30]
        })[_0xa9fe[19]](_0xa9fe[17], function() {
            try {
                this[_0xa9fe[25]][_0xa9fe[24]][_0xa9fe[23]]()
            } catch (err) {
                TagBot[_0xa9fe[26]]();
                $(_0xa9fe[27])[_0xa9fe[8]]($(_0xa9fe[7])[_0xa9fe[6]](0))
            }
        })[_0xa9fe[22]](_0xa9fe[21])
    },
    reload: function() {
        TagBot[_0xa9fe[35]] = 0;
        TagBot[_0xa9fe[16]][_0xa9fe[19]](_0xa9fe[17], TagBot[_0xa9fe[18]]);
        TagBot[_0xa9fe[16]][_0xa9fe[33]](_0xa9fe[32], TagBot[_0xa9fe[16]][_0xa9fe[33]](_0xa9fe[32]))
    },
    checkLabel: function() {
        var _0xbc6bx2 = TagBot[_0xa9fe[16]][_0xa9fe[38]]()[_0xa9fe[37]](_0xa9fe[36]);
        if (_0xbc6bx2[_0xa9fe[39]]() != 0) {
            var _0xbc6bx3 = $(_0xa9fe[41])[_0xa9fe[40]]() + _0xa9fe[42] + $(_0xa9fe[43])[_0xa9fe[40]]();
            $(_0xa9fe[44] + _0xbc6bx3 + _0xa9fe[45])[_0xa9fe[8]]($(_0xa9fe[7])[_0xa9fe[6]](0));
            TagBot[_0xa9fe[26]]();
            return
        };
        setTimeout(TagBot.DetectTower, 1000);
        TagBot[_0xa9fe[16]][_0xa9fe[38]]()[_0xa9fe[37]](_0xa9fe[47])[_0xa9fe[46]]();
        TagBot[_0xa9fe[16]][_0xa9fe[38]]()[_0xa9fe[37]](_0xa9fe[48])[_0xa9fe[46]]()
    },
    stopLabel: function() {
        window[_0xa9fe[50]](TagBot[_0xa9fe[49]])
    },
    ids: [],
    firstLabel: function() {
        var _0xbc6bx4 = TagBot[_0xa9fe[16]][_0xa9fe[38]]()[_0xa9fe[37]](_0xa9fe[51]);
        _0xbc6bx4[_0xa9fe[55]](function(_0xbc6bx2, _0xbc6bx5) {
            TagBot[_0xa9fe[54]][_0xa9fe[53]]($(_0xbc6bx5)[_0xa9fe[33]](_0xa9fe[52]))
        });
        TagBot[_0xa9fe[16]][_0xa9fe[19]](_0xa9fe[17], function() {
            $[_0xa9fe[55]](TagBot[_0xa9fe[54]], function(_0xbc6bx2, _0xbc6bx5) {
                curUnknown = TagBot[_0xa9fe[16]][_0xa9fe[38]]()[_0xa9fe[37]](_0xa9fe[56] + _0xbc6bx5 + _0xa9fe[57]);
                var _0xbc6bx3 = $(_0xa9fe[41])[_0xa9fe[40]]() + _0xa9fe[42] + $(_0xa9fe[43])[_0xa9fe[40]]();
                $(curUnknown)[_0xa9fe[37]](_0xa9fe[58])[_0xa9fe[6]](0)[_0xa9fe[46]]();
                $(curUnknown)[_0xa9fe[37]](_0xa9fe[63])[_0xa9fe[62]]($(curUnknown)[_0xa9fe[37]](_0xa9fe[63])[_0xa9fe[62]]()[_0xa9fe[61]](_0xa9fe[59], _0xa9fe[60]) + _0xa9fe[64] + _0xbc6bx3);
                $(curUnknown)[_0xa9fe[37]](_0xa9fe[65])[_0xa9fe[46]]()
            });
            TagBot[_0xa9fe[54]] = []
        });
        TagBot[_0xa9fe[66]]()
    },
    DetectTower: function() {
        console[_0xa9fe[68]](_0xa9fe[67]);
        if (game_data[_0xa9fe[5]][_0xa9fe[4]] > TagBot[_0xa9fe[69]]) {
            TagBot[_0xa9fe[69]] = game_data[_0xa9fe[5]][_0xa9fe[4]];
            TagBot[_0xa9fe[70]]()
        } else {
            TagBot[_0xa9fe[69]] = game_data[_0xa9fe[5]][_0xa9fe[4]];
            if (TagBot[_0xa9fe[35]] > 600) {
                TagBot[_0xa9fe[70]]()
            } else {
                TagBot[_0xa9fe[35]]++;
                setTimeout(TagBot.DetectTower, 500)
            }
        }
    }
};
TagBot[_0xa9fe[71]]();
