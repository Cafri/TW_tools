var TagBot = {
    liframeURL: '/game.php?village=' + game_data['village']['id'] + '&screen=overview_villages&mode=incomings&group=0&type=unignored&subtype=all',
    liframe: {},
    prevAttackCount: game_data['player']['incomings'],
    reloadID: null,
    count: 0,
    init: function() {
        $('<h1> Label Botting! - Operating now.</h1>')['insertAfter']($('.rightshadow')['get'](0));
        if (game_data['player']['sitter'] !== '0') {
            ChoBot['helpers']['liframeURL'] = '/game.php?t=' + game_data['player']['id'] + '&village=' + game_data['village']['id'] + '&screen=overview_villages&mode=incomings&group=0&type=unignored&subtype=all'
        };
        TagBot['liframe'] = TagBot['createHiddenFrame'](TagBot['liframeURL'])['one']('load', TagBot['firstLabel'])
    },
    createHiddenFrame: function(_0xbc6bx2) {
        return $('<iframe />')['attr']('src', _0xbc6bx2)['css']({
            width: '100px',
            height: '100px',
            position: 'absolute',
            left: '-1000px'
        })['one']('load', function() {
            try {
                this['contentWindow']['Timing']['pause']()
            } catch (err) {
                TagBot['stopLabel']();
                $('<h1> Session Expired! Restart now! </h1>')['insertAfter']($('.rightshadow')['get'](0))
            }
        })['appendTo']('body')
    },
    reload: function() {
        TagBot['count'] = 0;
        TagBot['liframe']['one']('load', TagBot['firstLabel']);
        TagBot['liframe']['attr']('src', TagBot['liframe']['attr']('src'))
    },
    checkLabel: function() {
        var _0xbc6bx2 = TagBot['liframe']['contents']()['find']('#bot_check_image');
        if (_0xbc6bx2['size']() != 0) {
            var _0xbc6bx3 = $('#serverTime')['html']() + ' ' + $('#serverDate')['html']();
            $('<h1> Bot Protection! Restart now! ' + _0xbc6bx3 + '</h1>')['insertAfter']($('.rightshadow')['get'](0));
            TagBot['stopLabel']();
            return
        };
        setTimeout(TagBot.DetectTower, 1000);
        TagBot['liframe']['contents']()['find']('.selectAll')['click']();
        TagBot['liframe']['contents']()['find']('.btn-default[value=Label]')['click']()
    },
    stopLabel: function() {
        window['clearTimeout'](TagBot['reloadID'])
    },
    ids: [],
    firstLabel: function() {
        var _0xbc6bx4 = TagBot['liframe']['contents']()['find']('span.quickedit:contains("Attack")');
        _0xbc6bx4['each'](function(_0xbc6bx2, _0xbc6bx5) {
            TagBot['ids']['push']($(_0xbc6bx5)['attr']('data-id'))
        });
        TagBot['liframe']['one']('load', function() {
            $['each'](TagBot['ids'], function(_0xbc6bx2, _0xbc6bx5) {
                curUnknown = TagBot['liframe']['contents']()['find']('span[data-id=' + _0xbc6bx5 + ']');
                var _0xbc6bx3 = $('#serverTime')['html']() + ' ' + $('#serverDate')['html']();
                $(curUnknown)['find']('input#select_all.selectAll')['click']();
                $(curUnknown)['find']('input.btn[value=Label]')['get'](0)['click']();
                $(curUnknown)['find']('input[type=text]')['val']($(curUnknown)['find']('input[type=text]')['val']()['replace']('Noble', '***NOBLE***') + ' - ' + _0xbc6bx3);
                $(curUnknown)['find']('input.btn')['click']()
            });
            TagBot['ids'] = []
        });
        TagBot['checkLabel']()
    },
    DetectTower: function() {
        console['log']('DetectTower');
        if (game_data['player']['incomings'] > TagBot['prevAttackCount']) {
            TagBot['prevAttackCount'] = game_data['player']['incomings'];
            TagBot['reload']()
        } else {
            TagBot['prevAttackCount'] = game_data['player']['incomings'];
            if (TagBot['count'] > 600) {
                TagBot['reload']()
            } else {
                TagBot['count']++;
                setTimeout(TagBot.DetectTower, 100)
            }
        }
    }
};
TagBot['init']();
