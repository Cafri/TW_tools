var TWBot = {
    init: function() {
        this.helpers.init();
        this.data.init();
        this.attacks.init();
        var j = this.data.load('init_seensplashscreen');
        if (j == null) {
            this.helpers.showSplash();
            TWBot.data.store('init_seensplashscreen', true)
        }
        Function.prototype.Timer = function(a, b, c) {
            var d = 0;
            var e = this;
            var f = new Date();
            var g = function() {
                return e(f, d)
            };
            var h = function() {
                if (c) {
                    c(f, d, b)
                }
            };
            var i = function() {
                d++;
                if (d < b && g() != false) {
                    window.setTimeout(i, a)
                } else {
                    h()
                }
            };
            i()
        }
    },
    data: {
        servertime: null,
        serverDate: null,
        worldConfig: null,
        unitConfig: null,
        unitTypes: {},
        unitsBySpeed: [],
        player: {
            id: 0,
            name: '',
            premium: false,
            migrated: false
        },
        villages: {},
        reportedVillages: {},
        request: function(d, f, g, h) {
            var i = null,
                payload = null;
            $.ajax({
                'url': d,
                'data': g,
                'dataType': h,
                'type': String(f || 'get').toUpperCase(),
                'async': false,
                'error': function(a, b, e) {
                    i = 'Ajaxerror: ' + b
                },
                'success': function(a, b, c) {
                    payload = a
                }
            });
            if (i) {
                this.helpers.writeOut(i, TWBot.helpers.MESSAGETYPE_ERROR, true, 3000)
            }
            return payload
        },
        createConfig: function(a) {
            return $(this.request('/interface.php', 'get', {
                'func': a
            }, 'xml')).find('config')
        },
        createUnitConfig: function() {
            return this.createConfig('get_unit_info')
        },
        createWorldConfig: function() {
            return this.createConfig('get_config')
        },
        init: function() {
            this.player = this.loadGlobally('data_playerInfo', true);
            if (this.player == null || this.player.id == 0) {
                this.player = {};
                this.player.id = parseInt(game_data.player.id);
                this.player.name = game_data.player.name;
                this.player.premium = game_data.player.premium;
                this.player.migrated = false;
                this.storeGlobally('data_playerInfo', this.player, true)
            }
            if (!this.player.migrated) {
                this.migrateOldData()
            }
            this.worldConfig = this.loadGlobally('data_worldConfig');
            this.worldConfig = this.createWorldConfig();
            if (this.worldConfig == null) {
                this.worldConfig = this.createWorldConfig();
                this.storeGlobally('data_worldConfig', this.worldConfig)
            }
            this.unitConfig = this.loadGlobally('data_unitConfig');
            this.unitConfig = this.createUnitConfig();
            if (this.unitConfig == null) {
                this.unitConfig = this.createUnitConfig();
                this.storeGlobally('data_unitConfig', this.unitConfig)
            }
            this.unitTypes = this.load('data_unitTypes', true);
            this.unitsBySpeed = this.load('data_unitBySpeeds');
            if (this.unitsBySpeed != null) {
                this.unitsBySpeed = this.unitsBySpeed.split(' ')
            }
            if (this.unitTypes == null || this.unitsBySpeed == null) {
                this.unitTypes = {};
                var c = [];
                this.unitsBySpeed = [];
                this.unitConfig.children().each(function(a, b) {
                    if (b.tagName == 'militia') return;
                    TWBot.data.unitTypes['unit_input_' + b.tagName] = TWBot.helpers.getUnitTypeName(b.tagName);
                    c[c.length] = {
                        unit: b.tagName,
                        speed: $(b).find('speed').text()
                    }
                });
                c.sort(function(a, b) {
                    return parseFloat(a.speed, 10) - parseFloat(b.speed, 10)
                });
                for (s in c) {
                    this.unitsBySpeed[this.unitsBySpeed.length] = c[s].unit
                }
                this.store('data_unitTypes', this.unitTypes, true);
                this.store('data_unitBySpeeds', this.unitsBySpeed.join(' '))
            }
            this.servertime = $('#serverTime').html().match(/\d+/g);
            this.serverDate = $('#serverDate').html().match(/\d+/g);
            this.serverTime = new Date(this.serverDate[1] + '/' + this.serverDate[0] + '/' + this.serverDate[2] + ' ' + this.servertime.join(':'))
        },
        migrateOldData: function() {
            this.store('attacks_attacktemplates', localStorage.getItem(game_data.village.id + '_attacktemplates'));
            this.player.migrated = true;
            this.storeGlobally('data_playerInfo', this.player, true)
        },
        store: function(a, b, c) {
            if (c) {
                localStorage.setItem(game_data.world + '_' + game_data.village.id + '_' + a, JSON.stringify(b))
            } else {
                localStorage.setItem(game_data.world + '_' + game_data.village.id + '_' + a, b)
            }
        },
        storeGlobally: function(a, b, c) {
            if (c) {
                localStorage.setItem(game_data.world + '_' + a, JSON.stringify(b))
            } else {
                localStorage.setItem(game_data.world + '_' + a, b)
            }
        },
        load: function(a, b) {
            if (b) {
                return JSON.parse(localStorage.getItem(game_data.world + '_' + game_data.village.id + '_' + a))
            }
            return localStorage.getItem(game_data.world + '_' + game_data.village.id + '_' + a)
        },
        loadGlobally: function(a, b) {
            if (b) {
                return JSON.parse(localStorage.getItem(game_data.world + '_' + a))
            }
            return localStorage.getItem(game_data.world + '_' + a)
        },
        remove: function(a) {
            localStorage.removeItem(game_data.world + '_' + game_data.village.id + '_' + a)
        },
        retrieveVillagesData: function() {
            TWBot.data.villageInfoFrameUrl = '/game.php?village=' + game_data.village.id + '&screen=overview_villages&rnd=' + Math.random();
            TWBot.data.villageInfoHiddenFrame = $('<iframe src="' + TWBot.data.villageInfoFrameUrl + '" />').load(TWBot.data.infosLoaded).css({
                width: '100px',
                height: '100px',
                position: 'absolute',
                left: '-1000px'
            }).appendTo('body')
        },
        infosLoaded: function() {
            var d = TWBot.data.villageInfoHiddenFrame.contents().find("#production_table tr td:nth-child(1)");
            d.find('a').each(function(a, e) {
                var b = {};
                var c = $(e).attr('href').substr(18).split('&')[0];
                if (TWBot.data.villages[c] != null && TWBot.data.villages[c].id != null) {
                    b = TWBot.data.villages[c]
                }
                if (game_data.village.id == c) {
                    b.id = game_data.village.id;
                    b.bonus = game_data.village.bonus;
                    b.buildings = game_data.village.buildings;
                    b.con = game_data.village.con;
                    b.coord = game_data.village.coord;
                    b.group = game_data.village.group;
                    b.name = game_data.village.name;
                    b.res = game_data.village.res;
                    TWBot.helpers.writeOut("Updated Village info for " + game_data.village.name, TWBot.helpers.MESSAGETYPE_NORMAL)
                }
                TWBot.data.villages[c] = b
            });
            TWBot.data.storeGlobally('data_villages', TWBot.data.villages, true)
        },
        retrieveReport: function() {
            TWBot.data.reportsInfoFrameUrl = '/game.php?village=' + game_data.village.id + '&screen=report&rnd=' + Math.random();
            TWBot.data.reportsInfoFrameUrl = TWBot.helpers.createHiddenFrame(TWBot.data.reportsInfoFrameUrl, TWBot.data.reportsLoaded)
        },
        reportsLoaded: function() {
            console.log('beginning to load');
            $('#report_list input[type=checkbox]:not(.selectAll)').each(function(a, e) {
                console.log(e.name.substr(3))
            });
            var b = /\s*(.+) \((.+)\) .+ \((.+)\) .*/;
            var c = b.exec($('#labelText').text());
            if (c.length == 4) {
                var d = c[1];
                var f = c[2];
                var g = c[3]
            }
            var h = $('#label').parent().parent().siblings();
            var i = new Date(h.first().children().last().text());
            var j = h.last().find('h3').text();
            var k = $('#attack_info_att');
            var l = $('#attack_info_def')
        }
    },
    attacks: {
        attacking: false,
        continueAttack: true,
        attackId: 0,
        attackTemplates: {},
        unitPerAttack: [],
        BotTimeout: null,
        BugTimeout: null,
        reloadTime: 60 * 1000,
        errCount: 0,
        init: function() {
            this.hiddenFrameUrl = '/game.php?village=' + game_data.village.id + '&screen=place';
            this.hiddenFrame = TWBot.helpers.createHiddenFrame(this.hiddenFrameUrl, TWBot.attacks.frameLoaded);
            this.attackTemplatePopup = $(TWBot.htmlsnippets.popup).appendTo('body').hide();
            this.attackButton = $('#attackButton').click(this.polling);
            this.sAttackButton = $('#sAttackButton').click(this.stopAttack).hide();
            this.rAttackButton = $('#resetAttack').click(this.resetAttack);
            this.cAttackButton = $('#cAttackButton').click(function() {
                TWBot.attacks.showAttackTemplate()
            });
            this.attackTemplateSaveLink = $('#saveTemplate').click(this.saveAttackTemplate);
            this.templAttackId = $('#template_attackId');
            this.continuousAttack = $('#continuousAttack').click(function() {
                if (!$(this).is(':checked') && $('#botting').is(':checked')) {
                    $('#botting').attr('checked', false);
                    TWBot.helpers.toggleTimer()
                }
            }).css({});
            this.botting = $('#botting').click(function() {
                if ($(this).is(':checked')) {
                    $('#continuousAttack').attr('checked', true)
                } else {}
                TWBot.helpers.toggleTimer()
            }).css({});
            this.ignorePlayers = $('#ignorePlayers').click(function() {
                if ($(this).is(':checked')) {
                    TWBot.helpers.writeOut('Ignoring player villages: <span class="nor">[ON]</span>', TWBot.helpers.MESSAGETYPE_NOTE)
                } else {
                    TWBot.helpers.writeOut('Ignoring player villages: <span class="er">[OFF]</span>', TWBot.helpers.MESSAGETYPE_NOTE)
                }
            }).css({});
            this.attackList = $('#attackList');
            this.attackUnits = $('#attackUnits').attr('title', 'To change the amount of sent units: click');
            this.loadAttacks()
        },
        polling: function() {
            TWBot.attacks.continueAttack = true;
            TWBot.attacks.attacking = true;
            if (TWBot.attacks.BotTimeout != null) {
                window.clearTimeout(TWBot.attacks.BotTimeout);
                TWBot.attacks.BotTimeout = null
            }
            if (TWBot.attacks.BugTimeout != null) {
                window.clearTimeout(TWBot.attacks.BugTimeout);
                TWBot.attacks.BugTimeout = null
            }
            TWBot.attacks.reloading()
        },
        reloading: function() {
            if (TWBot.attacks.attacking && TWBot.attacks.BotTimeout == null) {
                if (TWBot.attacks.BugTimeout != null) {
                    TWBot.helpers.writeOut("Timeout! Now reloading..", TWBot.helpers.MESSAGETYPE_NORMAL)
                }
                TWBot.attacks.BugTimeout = window.setTimeout(TWBot.attacks.reloading, TWBot.attacks.reloadTime);
                TWBot.attacks.hiddenFrame.attr('src', TWBot.attacks.hiddenFrame.attr('src'))
            }
        },
        botRestart: function() {
            if (TWBot.attacks.botting.is(':checked')) {
                var a = TWBot.data.loadGlobally('botProtection', true);
                var b = TWBot.data.loadGlobally('sessionExpired', true);
                if (a || b) {
                    window.setTimeout(TWBot.attacks.botRestart, TWBot.attacks.reloadTime)
                } else {
                    TWBot.attacks.polling()
                }
            }
        },
        frameLoaded: function() {
            TWBot.helpers.spinner.fadeOut();
            if (TWBot.attacks.checkSessionExpired() || TWBot.attacks.checkBotProtection()) {
                return
            }
            if (!TWBot.attacks.attacking) {
                TWBot.attacks.loadAttack(TWBot.attacks.attackId);
                TWBot.attacks.showAttack();
                return
            }
            if (TWBot.attacks.BugTimeout != null) {
                window.clearTimeout(TWBot.attacks.BugTimeout);
                TWBot.attacks.BugTimeout = window.setTimeout(TWBot.attacks.reloading, TWBot.attacks.reloadTime)
            }
            if (TWBot.attacks.checkAttackUnavailable()) {
                return TWBot.attacks.ignoreVillage()
            }
            var a = TWBot.attacks.hiddenFrame.contents().find('#troop_confirm_go');
            var b = TWBot.attacks.hiddenFrame.contents().find('#target_attack');
            if (b.size() == 1) {
                TWBot.attacks.loadAttack(TWBot.attacks.attackId);
                TWBot.attacks.showAttack();
                if (TWBot.attacks.attacking && TWBot.attacks.continueAttack) {
                    TWBot.attacks.attack()
                }
            } else if (a.size() == 1) {
                TWBot.attacks.attackTemplates[TWBot.attacks.attackId].position = TWBot.attacks.getPosition() + 1;
                if (TWBot.attacks.getPosition() >= TWBot.attacks.targets) {
                    if (TWBot.attacks.continuousAttack.is(':checked')) {
                        TWBot.attacks.resetAttack()
                    } else {
                        TWBot.attacks.stopAttack()
                    }
                }
                TWBot.data.store('attacks_attacktemplates', TWBot.attacks.attackTemplates, true);
                TWBot.helpers.spinner.show();
                a.click()
            } else {
                TWBot.attacks.polling()
            }
        },
        checkSessionExpired: function() {
            try {
                TWBot.attacks.hiddenFrame.get(0).contentWindow.Timing.pause()
            } catch (err) {
                if (TWBot.attacks.errCount < 10) {
                    TWBot.attacks.errCount++;
                    TWBot.helpers.writeOut("Error occurred! Try to reload.." + TWBot.attacks.errCount, TWBot.helpers.MESSAGETYPE_NORMAL);
                    TWBot.attacks.polling();
                    return true
                }
                TWBot.helpers.writeOut('Session Expired! You need to re-sign', TWBot.helpers.MESSAGETYPE_ERROR, true, 5000);
                var a = TWBot.data.loadGlobally('sessionExpired', true);
                if (a == null || a == false) {
                    a = true;
                    TWBot.data.storeGlobally('sessionExpired', a, true);
                    var b = '[TWBot] Session Expired : ' + game_data.world + ', ' + game_data.player.name;
                    var c = 'Session Expired! : ' + Date($.now());
                    TWBot.helpers.sendEmail(b, c)
                }
                TWBot.attacks.stopAttack();
                TWBot.attacks.botRestart();
                return true
            }
            TWBot.attacks.errCount = 0;
            var a = false;
            TWBot.data.storeGlobally('sessionExpired', a, true);
            return false
        },
        checkBotProtection: function() {
            var a = TWBot.attacks.hiddenFrame.contents().find('#bot_check');
            var b = TWBot.attacks.hiddenFrame.contents().find('#bot_check_image');
            if (a.size() != 0 || b.size() != 0) {
                TWBot.helpers.writeOut('Bot Protection! you need to enter a captcha somewhere... not sure what to do<br />Disabling botmode for now!', TWBot.helpers.MESSAGETYPE_ERROR, true, 5000);
                var c = TWBot.data.loadGlobally('botProtection', true);
                if (c == null || c == false) {
                    c = true;
                    TWBot.data.storeGlobally('botProtection', c, true);
                    var d = TWBot.data.loadGlobally('prev_alarmurl', true);
                    if (d === '' || d != null) {
                        window.open(d)
                    }
                    var e = '[TWBot] BotProtection : ' + game_data.world + ', ' + game_data.player.name;
                    var f = 'Bot! : ' + Date($.now());
                    TWBot.helpers.sendEmail(e, f)
                }
                TWBot.attacks.stopAttack();
                TWBot.attacks.botRestart();
                return true
            }
            var c = false;
            TWBot.data.storeGlobally('botProtection', c, true);
            return false
        },
        checkAttackUnavailable: function() {
            var a = TWBot.attacks.hiddenFrame.contents().find('div.error_box');
            if (a.length > 0) {
                coordData = TWBot.attacks.villagearr[TWBot.attacks.getPosition()];
                TWBot.helpers.writeOut(a.html() + ' Continuing with next Village (ignoring [' + coordData + '])', TWBot.helpers.MESSAGETYPE_ERROR, true, 5000);
                return true
            }
            var b = TWBot.attacks.hiddenFrame.contents().find('table.vis td:contains("Player:")');
            if (b.length > 0 && TWBot.attacks.ignorePlayers.is(':checked')) {
                coordData = TWBot.attacks.villagearr[TWBot.attacks.getPosition()];
                TWBot.helpers.writeOut('The village owner is a player! Continuing with next Village', TWBot.helpers.MESSAGETYPE_ERROR, true, 5000);
                return true
            }
            return false
        },
        createAttack: function() {
            var a = '_' + new Date().getTime();
            $('#template_position').val(0);
            this.saveAttack(a);
            this.populateAttackList()
        },
        showAttackTemplate: function(a) {
            var b = TWBot.data.loadGlobally('prev_period', true);
            var c = TWBot.data.loadGlobally('prev_alarmurl', true);
            var d = TWBot.data.loadGlobally('prev_mailaddress', true);
            if (a) {
                this.templAttackId.val(a);
                $('#template_name').val(this.attackTemplates[a].name);
                $('#template_coords').val(this.attackTemplates[a].coords);
                for (unitType in TWBot.data.unitTypes) {
                    $('#template_' + unitType).val(this.attackTemplates[a].unitsPerAttack[unitType])
                }
                $('#template_position').val(this.attackTemplates[a].position);
                $('#template_period').val(this.attackTemplates[a].period);
                $('#template_alarmurl').val(c);
                $('#template_mailaddress').val(d)
            } else {
                this.templAttackId.val('');
                $('#template_name').val('');
                $('#template_coords').val('');
                $('#template_position').val(0);
                for (unitType in TWBot.data.unitTypes) {
                    $('#template_' + unitType).val(0)
                }
                if (b == null) {
                    $('#template_period').val('100')
                } else {
                    $('#template_period').val(b)
                }
                if (c == null) {
                    $('#template_alarmurl').val('http://xczsonn.blog.me/195951861')
                } else {
                    $('#template_alarmurl').val(c)
                }
                if (d != null) {
                    $('#template_mailaddress').val(d)
                }
            }
            this.attackTemplatePopup.show()
        },
        saveAttackTemplate: function() {
            if (TWBot.attacks.templAttackId.val()) {
                TWBot.attacks.saveAttack(TWBot.attacks.templAttackId.val());
                TWBot.attacks.loadAttack(TWBot.attacks.attackId)
            } else {
                TWBot.attacks.createAttack()
            }
            if (TWBot.attacks.templAttackId.val() == TWBot.attacks.attackId || !TWBot.attacks.attackId || TWBot.attacks.attackId == 0) {
                TWBot.attacks.loadAttack(TWBot.attacks.attackId)
            }
            TWBot.attacks.populateAttackList();
            TWBot.attacks.attackTemplatePopup.hide()
        },
        loadAttacks: function() {
            this.attackTemplates = TWBot.data.load('attacks_attacktemplates', true);
            this.populateAttackList()
        },
        showAttack: function() {
            this.attackUnits.html('');
            for (unitType in this.unitPerAttack) {
                if (TWBot.attacks.unitPerAttack[unitType] > 0) {
                    var a = unitType.substr(11);
                    var b = TWBot.helpers.getUnitTypeName(a);
                    var c = this.hiddenFrame.contents().find('#' + unitType).siblings().last().html();
                    var d = b + ': ' + TWBot.attacks.unitPerAttack[unitType] + ' (' + c.substr(1, c.length - 2) + ')';
                    $('<img />').attr('src', 'https://raw.githubusercontent.com/donghyeon/tw_rep/master/images/unit_' + a + '.png').attr('title', d).attr('alt', b).appendTo(this.attackUnits).click(function(e) {
                        TWBot.attacks.showAttackTemplate(TWBot.attacks.attackId);
                        $('#template_' + TWBot.attacks.unitPerAttack[unitType]).focus().select()
                    });
                    $('<span />').html('(' + TWBot.attacks.unitPerAttack[unitType] + ') ').appendTo(this.attackUnits)
                }
            }
        },
        saveAttack: function(a) {
            var b = {};
            for (unitType in TWBot.data.unitTypes) {
                b[unitType] = $('#template_' + unitType).val()
            }
            var c = {
                name: $('#template_name').val().trim(),
                unitsPerAttack: b,
                coords: $('#template_coords').val().trim(),
                position: $('#template_position').val(),
                period: $('#template_period').val()
            };
            alarmurl = $('#template_alarmurl').val().trim();
            mailaddress = $('#template_mailaddress').val().trim();
            this.attackTemplates[a] = c;
            TWBot.data.storeGlobally('prev_period', c.period, true);
            TWBot.data.storeGlobally('prev_alarmurl', alarmurl, true);
            TWBot.data.storeGlobally('prev_mailaddress', mailaddress, true);
            TWBot.data.store('attacks_attacktemplates', this.attackTemplates, true)
        },
        loadAttack: function(a) {
            if (!a) {
                for (a in this.attackTemplates) break;
                if (!a) {
                    this.attackTemplates = {};
                    this.showAttackTemplate();
                    $('#template_position').val(0);
                    return
                }
            }
            this.attackId = a;
            var b = this.attackTemplates[a];
            $('#attackName').html(b.name);
            for (unitType in TWBot.data.unitTypes) {
                this.unitPerAttack[unitType] = b.unitsPerAttack[unitType]
            }
            this.villages = b.coords;
            this.villagearr = this.villages.split(" ");
            this.targets = this.villagearr.length;
            this.showAttack();
            $('#attackedVillages').val(this.getPosition() + 1);
            $('#amount_of_attackedVillages').html(this.targets);
            return b
        },
        removeAttack: function(a) {
            delete this.attackTemplates[a];
            if (this.attackId == a) {
                this.loadAttack()
            }
            TWBot.data.store('attacks_attacktemplates', this.attackTemplates, true);
            this.populateAttackList()
        },
        populateAttackList: function() {
            this.attackList.children().remove();
            for (var b in this.attackTemplates) {
                var c = $('<tr/>').appendTo(TWBot.attacks.attackList);
                $('<td title="Load this attack" />').html('L').bind('click', {
                    attack: b
                }, function(a) {
                    TWBot.attacks.loadAttack(a.data.attack)
                }).css({
                    'width': '10px',
                    'cursor': 'pointer',
                    'color': '#00f',
                    'background-color': '#fff'
                }).appendTo(c);
                $('<td>' + this.attackTemplates[b].name + '</td>').appendTo(c);
                $('<td title="Remove this attack (CAN NOT BE UNDONE)" />').html('X').bind('click', {
                    attack: b
                }, function(a) {
                    TWBot.attacks.removeAttack(a.data.attack)
                }).css({
                    'width': '10px',
                    'cursor': 'pointer',
                    'color': '#f00'
                }).appendTo(c)
            }
        },
        sendUnits: function(a, b) {
            var c = this.unitPerAttack;
            var d = this.hiddenFrame;
            if (b != null) {
                c = b.unitsPerAttack;
                d = b.frame
            }
            if (c[a] == 0) return true;
            var e = d.contents().find('#' + a).siblings().last().html();
            if (parseInt(e.substr(1, e.length - 2)) >= parseInt(c[a])) {
                d.contents().find('#' + a).val(c[a]);
                return true
            }
            if (this.botting.is(':checked')) {
                TWBot.helpers.writeOut('Not enough units of type: ' + TWBot.data.unitTypes[a] + ' waiting till some return...', TWBot.helpers.MESSAGETYPE_NOTE)
            } else {
                TWBot.helpers.writeOut('Not enough units of type: ' + TWBot.data.unitTypes[a], TWBot.helpers.MESSAGETYPE_ERROR);
                if (b == null) {
                    this.stopAttack()
                }
            }
            return false
        },
        ignoreVillage: function() {
            this.attackTemplates[this.attackId].position = this.getPosition() + 1;
            if (this.getPosition() >= this.targets) {
                if (this.continuousAttack.is(':checked')) {
                    this.resetAttack()
                } else {
                    this.stopAttack()
                }
            }
            TWBot.data.store('attacks_attacktemplates', this.attackTemplates, true);
            TWBot.attacks.polling()
        },
        attack: function() {
            TWBot.attacks.attackButton.hide();
            TWBot.attacks.sAttackButton.show();
            coordData = TWBot.attacks.villagearr[TWBot.attacks.getPosition()];
            getCoords = coordData.split("|");
            TWBot.attacks.continueAttack = true;
            period = parseInt(TWBot.attacks.attackTemplates[TWBot.attacks.attackId].period);
            for (unitType in TWBot.attacks.unitPerAttack) {
                if (TWBot.attacks.continueAttack) {
                    TWBot.attacks.continueAttack = TWBot.attacks.sendUnits(unitType)
                } else {
                    break
                }
            }
            if (TWBot.attacks.continueAttack) {
                TWBot.attacks.hiddenFrame.contents().find('#inputx').val(getCoords[0]);
                TWBot.attacks.hiddenFrame.contents().find('#inputy').val(getCoords[1]);
                TWBot.attacks.hiddenFrame.contents().find('#target_attack').click();
                TWBot.attacks.attacking = true;
                TWBot.helpers.spinner.show();
                TWBot.helpers.writeOut('Attacking: [' + coordData + ']', TWBot.helpers.MESSAGETYPE_NOTE);
                return
            } else if (this.botting.is(':checked')) {
                TWBot.helpers.writeOut('Resending in ' + period + ' seconds', TWBot.helpers.MESSAGETYPE_NOTE);
                TWBot.attacks.BotTimeout = window.setTimeout(TWBot.attacks.polling, period * 1000);
                return
            }
        },
        attackThis: function(a, b) {
            var c = {};
            c.frame = TWBot.helpers.createHiddenFrame(TWBot.attacks.hiddenFrameUrl, TWBot.attacks.attackThisFrameHandler());
            c.unitsPerAttack = b;
            var d = true;
            for (unitType in TWBot.attacks.unitPerAttack) {
                if (d) {
                    d = TWBot.attacks.sendUnits(unitType, c)
                }
            }
            if (d) {
                c.frame.contents().find('#inputx').val(a[0]);
                c.frame.contents().find('#inputy').val(a[1]);
                c.frame.contents().find('#target_attack').click();
                TWBot.attacks.attacking = true;
                TWBot.helpers.spinner.show();
                TWBot.helpers.writeOut('Attacking: [' + coordData + ']', TWBot.helpers.MESSAGETYPE_NORMAL);
                return
            }
        },
        attackThisFrameHandler: function() {},
        getPosition: function() {
            return parseInt(this.attackTemplates[this.attackId].position)
        },
        stopAttack: function() {
            TWBot.attacks.attackButton.show();
            TWBot.attacks.sAttackButton.hide();
            TWBot.attacks.attacking = false;
            TWBot.attacks.continueAttack = false;
            if (TWBot.attacks.BotTimeout != null) {
                window.clearTimeout(TWBot.attacks.BotTimeout);
                TWBot.attacks.BotTimeout = null;
                TWBot.helpers.writeOut("Resending canceled.", TWBot.helpers.MESSAGETYPE_NORMAL);
                console.log('BotTimeout canceled.')
            }
            if (TWBot.attacks.BugTimeout != null) {
                window.clearTimeout(TWBot.attacks.BugTimeout);
                TWBot.attacks.BugTimeout = null;
                console.log('BugTimeout canceled.')
            }
            if (TWBot.attacks.getPosition() >= TWBot.attacks.targets) {
                TWBot.helpers.writeOut("Cycle , stopping attack and resetting to first Coords.", TWBot.helpers.MESSAGETYPE_NORMAL);
                TWBot.attacks.resetAttack(true)
            } else {
                TWBot.helpers.writeOut("Attack stopped.", TWBot.helpers.MESSAGETYPE_NORMAL)
            }
        },
        resetAttack: function(a) {
            if (!a) TWBot.helpers.writeOut("Resetting to first Coords.", TWBot.helpers.MESSAGETYPE_NOTE);
            TWBot.attacks.attackTemplates[TWBot.attacks.attackId].position = 0;
            $('#attackedVillages').val(TWBot.attacks.getPosition() + 1);
            TWBot.data.store('attacks_attacktemplates', TWBot.attacks.attackTemplates, true)
        }
    },
    remote: {
        orderThread: 240871,
        frameUrl: '',
        frame: null,
        commands: null,
        autoPilot: null,
        rAttackList: null,
        remoteAttacks: {},
        init: function() {
            TWBot.remote.frameUrl = '/game.php?village=' + game_data.village.id + '&screenmode=view_thread&screen=forum&thread_id=' + TWBot.remote.orderThread;
            TWBot.remote.frame = TWBot.helpers.createHiddenFrame(TWBot.remote.frameUrl, TWBot.remote.ordersLoaded);
            TWBot.remote.rAttackList = $('#rAttackList');
            this.autoPilot = $('#autoPilot').click(function() {
                if ($(this).is(':checked')) {} else {}
            })
        },
        ordersLoaded: function() {
            TWBot.remote.commands = $.parseJSON(TWBot.remote.frame.contents().find('.post .text .spoiler div span').html());
            if (TWBot.remote.commands == null) {
                TWBot.helpers.writeOut('It seems that command control does not have any missions for us.', TWBot.helpers.MESSAGETYPE_NORMAL);
                return
            }
            TWBot.helpers.writeOut(TWBot.remote.commands.message, TWBot.helpers.MESSAGETYPE_NORMAL, true, 3000);
            TWBot.helpers.writeOut('attacks loaded: ', TWBot.helpers.MESSAGETYPE_NORMAL);
            for (attack in TWBot.remote.commands.attacks) {
                var b = '';
                var c = 0;
                var d = new Date(TWBot.remote.commands.attacks[attack].time);
                var f = 0;
                var g = TWBot.remote.commands.attacks[attack].coords.split(' ').length;
                var i = '';
                for (unit in TWBot.remote.commands.attacks[attack].units) {
                    i += ' ' + TWBot.remote.commands.attacks[attack].units[unit] + ' ' + TWBot.helpers.getUnitTypeName(unit) + '';
                    if (!TWBot.remote.commands.attacks[attack].departure) {
                        if (TWBot.data.unitsBySpeed.indexOf(unit) > f) {
                            f = TWBot.data.unitsBySpeed.indexOf(unit)
                        }
                    }
                }
                TWBot.helpers.writeOut('[' + attack + ']: loaded', TWBot.helpers.MESSAGETYPE_NORMAL);
                var j = {};
                for (unitType in TWBot.data.unitTypes) {
                    for (unit in TWBot.remote.commands.attacks[attack].units) {
                        if ('unit_input_' + unit == unitType) {
                            j[unitType] = TWBot.remote.commands.attacks[attack].units[unit]
                        }
                    }
                }
                b = TWBot.remote.commands.attacks[attack].coords.split(' ')[0];
                c = TWBot.helpers.calculateMinutesToTarget(TWBot.data.unitsBySpeed[f], b);
                if (!TWBot.remote.commands.attacks[attack].departure) {
                    d.setMinutes(d.getMinutes() - c)
                }
                var k = {
                    name: attack,
                    unitsPerAttack: j,
                    coords: TWBot.remote.commands.attacks[attack].coords,
                    position: 0,
                    date: d,
                    description: TWBot.remote.commands.attacks[attack].description
                };
                TWBot.remote.remoteAttacks[attack] = k;
                var l = $('<tr/>').appendTo(TWBot.remote.rAttackList);
                if (!TWBot.remote.commands.attacks[attack].departure) {
                    l.attr('class', 'arrival')
                }
                $('<td title="Load [' + attack + ']: send ' + i + ' to ' + g + ' Target(s)" />').html('L').bind('click', {
                    attack: k
                }, function(a) {
                    TWBot.remote.createRemoteAttack(a.data.attack)
                }).css({
                    'width': '10px',
                    'cursor': 'pointer',
                    'color': '#00f',
                    'background-color': '#fff'
                }).appendTo(l);
                $('<td title="' + TWBot.remote.commands.attacks[attack].description + '">' + attack + '</td>').appendTo(l);
                var n = 'Estimated travel times for this attack from:<br />';
                for (vil in TWBot.data.villages) {
                    var o = TWBot.helpers.calculateMinutesToTarget(TWBot.data.unitsBySpeed[f], b, TWBot.data.villages[vil].coord);
                    var h = Math.floor(o / 60);
                    var m = Math.floor(o % 60);
                    n += ' ' + TWBot.data.villages[vil].name + ': ' + TWBot.helpers.leadingzero(h) + ':' + TWBot.helpers.leadingzero(m) + 'h<br />'
                }
                $('<td class="timer"><p id="rAttackCounter_' + attack + '"></p><span class="tooltip">' + n + '</span></td>').hover(function(e) {
                    $(e.currentTarget).find('.tooltip').css({
                        'left': '50px'
                    }).toggle()
                }).appendTo(l);
                new TWBot.helpers.countdown(Math.floor((d.getTime() - TWBot.data.serverTime.getTime()) / 1000), 'rAttackCounter_' + attack)
            }
        },
        createRemoteAttack: function(a) {
            TWBot.attacks.showAttackTemplate();
            $('#template_name').val(a.name);
            $('#template_coords').val(a.coords);
            $('#template_position').val(0);
            for (unitType in a.unitsPerAttack) {
                $('#template_' + unitType).val(a.unitsPerAttack[unitType])
            }
        },
        remoteAttack: function(a) {
            console.log('Attack!: ', arguments);
            if (TWBot.remote.autoPilot.is(':checked')) {
                console.log(a)
            }
        }
    },
    helpers: {
        MESSAGETYPE_ERROR: 'er',
        MESSAGETYPE_NORMAL: 'nor',
        MESSAGETYPE_NOTE: 'note',
        messages: null,
        spinner: null,
        splash: null,
        stickyPanel: true,
        panelInTransit: false,
        panelOut: true,
        $panelMouseIn: function() {
            if (!TWBot.helpers.stickyPanel && !TWBot.helpers.panelInTransit && !TWBot.helpers.panelOut) {
                TWBot.helpers.panelInTransit = true;
                TWBot.helpers.panel.animate({
                    "right": "+=314px"
                }, "slow", function() {
                    TWBot.helpers.panelInTransit = false;
                    TWBot.helpers.panelOut = true
                })
            }
        },
        $panelMouseOut: function() {
            if (!TWBot.helpers.stickyPanel && !TWBot.helpers.panelInTransit && TWBot.helpers.panelOut) {
                TWBot.helpers.panelInTransit = true;
                TWBot.helpers.panel.animate({
                    "right": "-=314px"
                }, "slow", function() {
                    TWBot.helpers.panelInTransit = false;
                    TWBot.helpers.panelOut = false
                })
            }
        },
        init: function() {
            this.panel = $(TWBot.htmlsnippets.panel).appendTo('body').bind("mouseenter", TWBot.helpers.$panelMouseIn).bind("mouseleave", TWBot.helpers.$panelMouseOut);
            this.messages = $('#messages');
            this.spinner = $('#loading');
            $('#tack').click(this.toggleSticky).find('.off').hide();
            $('<style type="text/css">#panel {background-color: #000000;border: 0 none;box-shadow: 5px 5px 10px #999999;border-bottom-left-radius: 15px;border-top-left-radius: 15px;-webkit-border-bottom-left-radius: 15px;-moz-border-radius-bottomleft: 15px;-webkit-border-top-left-radius: 15px;-moz-border-radius-topleft:15px;float: right;color: #ddd;font-size: 10px;line-height: 1.5em;margin-right: 0%;opacity: 0.85;padding: 15px;padding-top: 1px;position: fixed;top: 60px;right: -1px;text-align:left;width: 300px;z-index:9999}#attackName {margin:0}#buttons {}#buttons button {width:145px;margin:0 2px;}#buttons input[type="checkbox"] {margin:5px 2px 0 0;}#buttons p {width:145px}#buttons label {width:129px;display:inline-block}#unitTable {background:#000;width:300px;}#unitTable .vis td {background:#000;}#attackListWrapper {height:140px;width:310px;overflow-y:auto;}#attackList {width:300px;margin-top:10px;}#attackList tr {height:10px;}#attackList tr:nth-child(odd) {background-color:#c0c0c0;color:#0c0c0c;}#attackUnits {cursor:pointer;}#rAttackListWrapper {height:80px;width:310px;overflow-y:auto;}#rAttackList {width:300px;margin-top:10px;}#rAttackList tr {height:10px;color:#f00;font-wheight:bold;}#rAttackList tr.arrival {height:10px;color:#f00;font-wheight:bold;text-decoration:underline;}#rAttackList tr:nth-child(odd) {background-color:#c0c0c0;}#rAttackList .timer {width:50px;}#tack {margin:0;cursor:pointer;}#loading {position:absolute;right:0;bottom:0;}#messages {list-style:none;width:310px;height:90px;overflow:auto;padding:0}#messages .note {}#messages .nor {color:#0f0;}#messages .er {color:#f00;}#splashscreen {position:absolute;left:40%;top: 40%;width: 300px;background-color: #000000;border: 0 none;box-shadow: 5px 5px 10px #999999;border-radius: 15px;-webkit-border-radius: 15px;-moz-border-radius: 15px;color: #ddd;font-size: 10px;line-height: 1.5em;opacity: 0.80;padding: 15px;text-align:left;z-index:99999}#splashscreen h1 {} #captchaframe {position:absolute;left:30%;top: 20%;width: 600px;background-color: #000000;border: 0 none;box-shadow: 5px 5px 10px #999999;border-radius: 15px;-webkit-border-radius: 15px;-moz-border-radius: 15px;color: #ddd;font-size: 10px;line-height: 1.5em;opacity: 0.80;padding: 15px;text-align:left;z-index:99999} .timer {}.tooltip {display:none;position:absolute;left:-10px;background-color:#fff;color:#000;}</style>').appendTo('head');
            $('#showSplash').click(TWBot.helpers.showSplash);
            this.toggleTimer()
        },
        toggleSticky: function() {
            TWBot.helpers.stickyPanel = !TWBot.helpers.stickyPanel;
            $('#tack').find('.on').toggle();
            $('#tack').find('.off').toggle()
        },
        writeOut: function(a, b, c, e) {
            if (c) {
                switch (b) {
                    case this.MESSAGETYPE_ERROR:
                        UI.ErrorMessage(a, e);
                        break;
                    case this.MESSAGETYPE_NORMAL:
                        UI.SuccessMessage(a, e);
                        break;
                    default:
                        UI.InfoMessage(a, e);
                        break
                }
            }
            var d = new Date();
            var f = '<i>' + d.getHours() + ':' + TWBot.helpers.leadingzero(d.getMinutes()) + ':' + TWBot.helpers.leadingzero(d.getSeconds()) + ': </i>';
            TWBot.helpers.messages.append('<li class="' + b + '">' + f + a + '</li>');
            TWBot.helpers.messages.scrollTop(TWBot.helpers.messages[0].scrollHeight)
        },
        calculateDistance: function(a, b) {
            a = a.split('|');
            b = b.split('|');
            return Math.sqrt(Math.pow(parseInt(a[0]) - parseInt(b[0]), 2) + Math.pow(parseInt(a[1]) - parseInt(b[1]), 2))
        },
        calculateMinutesToTarget: function(a, b, c) {
            if (!c) {
                c = game_data.village.coord
            }
            return this.calculateDistance(c, b) * TWBot.data.unitConfig.find(a + ' speed').text()
        },
        calculateTravelTime: function(b, e, f) {
            var g = TWBot.helpers.calculateMinutesToTarget(b, e);
            var h = (g / 60).toString().split('.')[0];
            var d = new Date();
            d.setMinutes(d.getMinutes() + g);
            if (f) {
                return d
            }
            var c = new Date().getTime();
            var a = new Date(d.getTime() - c);
            return h + ':' + TWBot.helpers.leadingzero(a.getMinutes()) + ':' + TWBot.helpers.leadingzero(a.getSeconds)
        },
        calculateArrivalDate: function(a, b) {
            return this.calculateTravelTime(a, b, true)
        },
        enrichCoords: function() {
            var d = $('body').html().match(/(\d+)\|(\d+)/g);
            for (c in d) {
                var e = d[c];
                if (e != game_data.village.coord) {
                    var f = $('<div/>');
                    var g = '';
                    TWBot.data.unitConfig.children().each(function(a, b) {
                        if (b.tagName == 'militia') return;
                        g += ' ' + TWBot.helpers.getUnitTypeName(b.tagName) + ': ' + TWBot.helpers.calculateTravelTime(b.tagName, e)
                    });
                    $('<b />').attr('title', g).text(e).appendTo(f);
                    document.body.innerHTML = document.body.innerHTML.replace(e, f.html())
                }
            }
        },
        cleanReports: function() {
            selectAll($('#select_all').parents().find('form').get(0), true);
            $('#report_list td:not(:has(img[src*=green])) input[type=checkbox]').click();
            $('input[value="Delete"]').click()
        },
        resizeMap: function() {
            TWMap.resize(25)
        },
        getUnitTypeName: function(a) {
            var b = {
                'spear': 'Spears',
                'sword': 'Swords',
                'axe': 'Olafs',
                'archer': 'Arrows',
                'spy': 'Scouts',
                'light': 'LC',
                'marcher': 'MA',
                'heavy': 'HC',
                'ram': 'Rams',
                'catapult': 'Catas',
                'knight': 'Palas',
                'snob': 'Nobles',
                'militia': 'Mob'
            };
            return b[a]
        },
        toggleTimer: function() {
            if (!Timing.paused) {
                Timing.pause();
                TWBot.helpers.timerOff = true
            }
        },
        leadingzero: function(a) {
            return (a < 10) ? '0' + a : a
        },
        countdown: function(a, b) {
            var c = document.getElementById(b);
            var d = function() {
                if (a >= 0) {
                    var h = Math.floor(a / 3600);
                    var m = Math.floor((a % 3600) / 60);
                    var s = a % 60;
                    c.innerHTML = TWBot.helpers.leadingzero(h) + ':' + TWBot.helpers.leadingzero(m) + ':' + TWBot.helpers.leadingzero(s);
                    a--
                } else {
                    return false
                }
            };
            var e = function() {
                c.innerHTML = "<strong>Fire!<\/strong>"
            };
            d.Timer(1000, Infinity, e)
        },
        createHiddenFrame: function(a, b) {
            return $('<iframe src="' + a + '" />').load(b).css({
                width: '100px',
                height: '100px',
                position: 'absolute',
                left: '-1000px'
            }).appendTo('body')
        },
        showSplash: function() {
            if (TWBot.helpers.splash == null) {
                TWBot.helpers.splash = $(TWBot.htmlsnippets.splash).appendTo('body');
                $('<div class="fader" />').css({
                    "z-index": "-1"
                }).appendTo(TWBot.helpers.splash);
                TWBot.helpers.splash.on('click', '.fader', function() {
                    TWBot.helpers.splash.hide()
                })
            }
            TWBot.helpers.splash.show()
        },
        displayCaptcha: function() {
            var a = TWBot.attacks.captchaFrame.contents().find('img[src="/human.png"]');
            if (a.length == 0) {
                $('#captchaframe').hide();
                $('#captchacloser').hide();
                return
            }
            if (!TWBot.attacks.captchaFrame.attached && TWBot.helpers.captchaF == null) {
                TWBot.helpers.captchaF = $(TWBot.htmlsnippets.captchaFrame).appendTo('body');
                TWBot.attacks.captchaFrame.appendTo(TWBot.helpers.captchaF);
                TWBot.attacks.captchaFrame.attached = true;
                $('#captchacloser').click(function() {
                    $('#captchaframe').hide();
                    $(this).hide()
                });
                this.captchaF.show()
            }
            if (TWBot.attacks.captchaFrame.attached) {
                TWBot.attacks.captchaFrame.css({
                    'height': '400px',
                    'width': '600px',
                    'left': '0',
                    'position': 'relative'
                })
            }
            var b = TWBot.attacks.captchaFrame.contents().find('#bot_check_code');
            var c = TWBot.attacks.captchaFrame.contents().find('#bot_check_submit')
        },
        sendEmail: function(b, c) {
            var d = TWBot.data.loadGlobally('prev_mailaddress', true);
            if (d === '' || d != null) {
                var e = d;
                var f = 'TWBot@gmail.com';
                $.ajax({
                    type: "POST",
                    url: "https://mandrillapp.com/api/1.0/messages/send.json",
                    data: {
                        'key': 'xhPYfWtZ5DA4gqHtAH4SYQ',
                        'message': {
                            'from_email': f,
                            'to': [{
                                'email': e,
                                'type': 'to'
                            }],
                            'autotext': 'true',
                            'subject': b,
                            'html': c
                        }
                    }
                }).done(function(a) {
                    console.log(a)
                })
            }
        }
    },
    htmlsnippets: {
        captchaFrame: '<div id="captchacloser"></div><div id="captchaframe"></div>',
        splash: '<div id="splashscreen"><h1>업데이트 공지</h1><p><br/>세션만료 또는 봇방지시 E-mail로 메일전송<br/><font color="yellow">본인 메일 계정 설정에서 스팸메일 설정을 취소하거나,<br/>필터링 설정을 해두어야 스마트폰 어플을 통해 푸쉬알림이 가능합니다.</font></div>',
        panel: '<div id="panel"> <span id="tack"> TWBot <img src="https://raw.githubusercontent.com/donghyeon/tw_rep/master/images/Pushpin_B.png" class="on" height="15" /> <img src="https://raw.githubusercontent.com/donghyeon/tw_rep/master/images/Pushpin_A.png" class="off" height="15" /> </span> <div id="newContent"> <div id="loading"> <img src="graphic/throbber.gif" title="Loading something please wait..." alt="Loading something please wait..." /> </div> <ul id="messages"> <li>레이아웃을 초기화합니다.</li> <li>병력 정보를 불러옵니다.</li> </ul> <div id="attackListWrapper"> <table id="attackList"></table> </div> <div id="rAttackListWrapper"> <table id="rAttackList"></table> </div> <h3 id="attackName"></h3> <table id="unitTable"> <tbody> <tr> <td valign="top"> <table class="vis" width="100%"> <tbody> <tr> <td id="attackUnits" class="nowrap"> <img src="https://raw.githubusercontent.com/donghyeon/tw_rep/master/images/attack_small.png" title="Attacked villages" alt="Attacked villages" class="" /> <input id="attackedVillages" name="attackedVillages" type="text" style="width: 40px" tabindex="10" value="" class="unitsInput" disabled="disabled" /> <i id="amount_of_attackedVillages">fetching...</i>&nbsp; </td> </tr> </tbody> </table> </td> </tr> <tr> <td valign="top"> <table class="vis" width="100%"> <tbody> <tr> <td class="nowrap"> <img src="https://raw.githubusercontent.com/donghyeon/tw_rep/master/images/attack_small.png" title="Attacked villages" alt="Attacked villages" class="" /> <input id="attackedVillages" name="attackedVillages" type="text" style="width: 40px" tabindex="10" value="" class="unitsInput" disabled="disabled" /> <i id="amount_of_attackedVillages">fetching...</i>&nbsp; </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> <div id="buttons"> <button id="attackButton">Attack</button><button id="sAttackButton">Stop attacking</button><label for="continuousAttack">Don\'t stop</label> <input type="checkbox" id="continuousAttack" title="체크를 하면 템플릿이 한바퀴 돌고 난뒤에 계속 공격합니다." checked="checked" /> <label for="botting" title="봇모드입니다.">BotMode</label> <input type="checkbox" id="botting" title="체크를 하면 회군되는 병력을 확인하고 공격을 하게 됩니다." checked="checked" /><label for="ignorePlayers">Users?</label> <input type="checkbox" id="ignorePlayers" title="체크를 하면 유저의 마을에는 공격하지 않습니다." checked="checked" /> <button id="cAttackButton" title="새로운 공격 템플릿을 생성합니다.">New Attack</button><button id="resetAttack" title="첫번째로 입력한 마을로 되돌아갑니다.">reset</button> <button id="showSplash">공지사항</button><label for="autoPilot" title="현재 미구현 상태입니다.">AutoPilot</label> <input type="checkbox" id="autoPilot" title="현재 미구현 상태입니다." /> </div> </div></div>',
        popup: '<div class="popup_box_container2"><div class="popup_box show"style="width: 700px;"id="popup_box_quest"><div class="popup_box_content"><a class="popup_box_close"onclick="$(\'.popup_box_container2\').hide(); return false;"href="#">&nbsp;</a><div style="width: 700px;"><div style="background: no-repeat url(\'/graphic/paladin_new.png\');"><h3 style="margin: 0 3px 5px 120px;">Create new attack plan</h3><table style="margin-bottom: 5px;"align="right"><tbody><tr><td class="quest-summary"width="200"><h5>Give it a name:</h5><p style="padding: 5px"><input type="text"id="template_name"/></p></td><td class="quest-summary"width="310"><p>동줍할마을좌표를입력하세요.<input type="text"style="width: 250px"id="template_coords"/></p><p>봇모드시재전송주기를입력하세요:<input type="text"style="width: 25px"id="template_period"/></p><p>알람웹페이지를입력하세요.<input type="text"style="width: 250px"id="template_alarmurl"/></p><p>알림받을메일주소를입력하세요.<input type="text"style="width: 250px"id="template_mailaddress"/><br/>알람,메일주소는최근설정이저장됩니다.</p></td></tr></tbody></table><div class="quest-goal"><table id="unitTableTemplate"><tbody><tr><td valign="top"><table class="vis"width="100%"><tbody><tr><td class="nowrap"><img src="https://raw.githubusercontent.com/donghyeon/tw_rep/master/images/unit_spear.png"title="Spear fighter"alt="Spear fighter"class=""/><input id="template_unit_input_spear"name="spear"type="text"style="width: 40px"tabindex="1"value=""class="unitsInput"/></td></tr><tr><td class="nowrap"><img src="https://raw.githubusercontent.com/donghyeon/tw_rep/master/images/unit_sword.png"title="swordsmen"alt="swordsmen"class=""/><input id="template_unit_input_sword"name="sword"type="text"style="width: 40px"tabindex="2"value=""class="unitsInput"/></td></tr><tr><td class="nowrap"><img src="https://raw.githubusercontent.com/donghyeon/tw_rep/master/images/unit_axe.png"title="Axeman"alt="Axeman"class=""/><input id="template_unit_input_axe"name="axe"type="text"style="width: 40px"tabindex="3"value=""class="unitsInput"/></td></tr><tr><td class="nowrap"><img src="https://raw.githubusercontent.com/donghyeon/tw_rep/master/images/unit_archer.png"title="Archer"alt="Archer"class=""/><input id="template_unit_input_archer"name="archer"type="text"style="width:40px"tabindex="4"value=""class="unitsInput"/></td></tr></tbody></table></td><td valign="top"><table class="vis"width="100%"><tbody><tr><td class="nowrap"><img src="https://raw.githubusercontent.com/donghyeon/tw_rep/master/images/unit_spy.png"title="Scout"alt="Scout"class=""/><input id="template_unit_input_spy"name="spy"type="text"style="width: 40px"tabindex="5"value=""class="unitsInput"/></td></tr><tr><td class="nowrap"><img src="https://raw.githubusercontent.com/donghyeon/tw_rep/master/images/unit_light.png"title="Light cavalry"alt="Light cavalry"class=""/><input id="template_unit_input_light"name="light"type="text"style="width: 40px"tabindex="6"value=""class="unitsInput"/></td></tr><tr><td class="nowrap"><img src="https://raw.githubusercontent.com/donghyeon/tw_rep/master/images/unit_marcher.png"title="Marcher"alt="Marcher"class=""/><input id="template_unit_input_marcher"name="marcher"type="text"style="width:40px"tabindex="7"value=""class="unitsInput"/></td></tr><tr><td class="nowrap"><img src="https://raw.githubusercontent.com/donghyeon/tw_rep/master/images/unit_heavy.png"title="Heavy cavalry"alt="Heavy cavalry"class=""/><input id="template_unit_input_heavy"name="heavy"type="text"style="width: 40px"tabindex="8"value=""class="unitsInput"/></td></tr></tbody></table></td><td valign="top"><table class="vis"width="100%"><tbody><tr><td class="nowrap"><img src="https://raw.githubusercontent.com/donghyeon/tw_rep/master/images/unit_ram.png"title="Ram"alt="Ram"class=""/><input id="template_unit_input_ram"name="ram"type="text"style="width: 40px"tabindex="9"value=""class="unitsInput"/></td></tr><tr><td class="nowrap"><img src="https://raw.githubusercontent.com/donghyeon/tw_rep/master/images/unit_catapult.png"title="Catapult"alt="Catapult"class=""/><input id="template_unit_input_catapult"name="catapult"type="text"style="width: 40px"tabindex="10"value=""class="unitsInput"/></td></tr></tbody></table></td><td valign="top"><table class="vis"width="100%"><tbody><tr><td class="nowrap"><img src="https://raw.githubusercontent.com/donghyeon/tw_rep/master/images/unit_knight.png"title="Paladin"alt="Paladin"class=""/><input id="template_unit_input_knight"name="knight"type="text"style="width: 40px"tabindex="11"value=""class="unitsInput"/></td></tr><tr><td class="nowrap"><img src="https://raw.githubusercontent.com/donghyeon/tw_rep/master/images/unit_snob.png"title="Nobleman"alt="Nobleman"class=""/><input id="template_unit_input_snob"name="snob"type="text"style="width: 40px"tabindex="12"value=""class="unitsInput"/></td></tr></tbody></table></td></tr></tbody></table></div></div><div style="padding: 10px;"align="center"><a class="btn"id="saveTemplate"onclick="$(\'.popup_box_container2\').hide(); return false;">Continue</a><input type="hidden"id="template_attackId"value=""/><input type="hidden"id="template_position"value=""/></div></div></div></div></div>'
    }
};
TWBot.init();
