function isSafari() {
    var ua = navigator.userAgent.toLowerCase(); 
    return ua.indexOf('safari') != -1 && ua.indexOf('chrome') == -1;
}

var svgNS = "http://www.w3.org/2000/svg";
var color = ['#DE3F26','#606060','#48AF5E','#FFC800'];

function parseUInt(x) { return x < 0 ?
    (x > -128 ? x & 255 >>> 0 : (x > -32768 ? x & 65535 >>> 0 : x >>> 0)) : x; }

function statsRow(start_x,start_y,i,games,iter,check) {
    var name = template_engine(
        '<tspan xmlns="http://www.w3.org/2000/svg" x="{this.x}" y="{this.y}">{this.body}</tspan>',{
            x: start_x,
            y: start_y+25*iter,
            body: i18n(games[i].value[0][0].value) + " — " + parseUInt(games[i].value[0][1])});
    var element1 = svg(name);
    if (locale.tr[games[i].value[0][0].value] || !check) {
        document.getElementById('Stat-Right').appendChild(element1); 
        return iter+1; } else return iter;
}

function gameresultRow(start_x,start_y,i,results) {
     var name = results[i].value[0][0].value,
         round = results[i].value[0][2].value,
         total = results[i].value[0][3].value;
    var name = template_engine(
     '<tspan xmlns="http://www.w3.org/2000/svg" x="{this.x}" y="{this.y}">{this.body}</tspan>',{
            x: start_x,
            y: start_y+30*i,
            body: utf8decode(name) + "  " + round + "/" + total}); 
    var element1 = svg(name);
    document.getElementById('Overlay-Results').appendChild(element1);
}

function parseTransformAttribute(aa) {
    var a = aa.split(' ').join('');
    var b={};
    for (var i in a = a.match(/(\w+\((\-?\d+\.?\d*,?)+\))+/g)) { var c = a[i].match(/[\w\.\-]+/g); b[c.shift()] = c; }
    return b; }

function svg(html) { return new DOMParser().parseFromString(html, "text/xml").firstChild; }
function removeChilds(e) { var last; while (last = e.lastChild) e.removeChild(last); };

function setPlayerName(e, playerName) {
    var dx = 15;
    document.getElementById(e+"-Name").setAttribute("y",27);
    document.getElementById(e+"-Name").setAttribute("x",dx);
    document.getElementById(e+"-Name").textContent = playerName;
    document.getElementById(e+"-Pad").setAttribute('width', document.getElementById(e+"-Name").getBBox().width + 25); }

function template_engine(html, data) {
    var re = /{([^}]+)?}/g, code = 'var r=[];', cursor = 0;
    var add = function(line,js) {
        js? (code += 'r.push(' + line + ');') :
            (code += line != '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");' : ''); // "
        return add; }
    while(match = re.exec(html)) {
        add(html.slice(cursor, match.index))(match[1],true);
        cursor = match.index + match[0].length; }
    add(html.substr(cursor, html.length - cursor));
    code += 'return r.join("");';
    return new Function(code.replace(/[\r\t\n]/g, '')).apply(data); }

function discarder(name) { return template_engine(localStorage.getItem("svg/Discarder.svg?q=" + $.timestamp), { name: name }); }


function initDiscards() {
    [ {name:"Gabrielo-Discard", hand:"Player-Left-Hand"},
      {name:"Alina-Discard",    hand:"Player-Right-Hand"},
      {name:"Mustafa-Discard",  hand:"Player-Center-Hand"},
      {name:"You-Discard",      hand:"Player-Me-Hand"}                 ].map(function(e) {
        document.getElementById(e.name).appendChild(svg(discarder(e.hand)));
         });
}

function PatchSVG()
{

//    $('Player-Statistics').hide();

    var playerInifoOnClick = [
        "Point-Table" ];

       playerInifoOnClick.map(function(x) { 
            document.getElementById(x).style.cursor = "pointer";
            document.getElementById(x).onclick = requestPlayerInfo; });

    var onlineListOnClick = [
        "Online-Users",
        "Online-Users-Pad",
        "Online-Logo",
        "Users-Online-Message",
        "Users-Online-Number" ];

       onlineListOnClick.map(function(x) { 
            document.getElementById(x).style.cursor = "pointer";
            document.getElementById(x).onclick = showOnlineList; });

    [ "Flag-tr", "Flag-en" ].map(function(x) {
        document.getElementById(x).onclick = function() {
            switchLanguage(); translateScene(); } });

    var rulesOnClick = [
        "Rules",
        "Rules-Text",
        "Rules-Rectangle" ];

       rulesOnClick.map(function(x) { 
            document.getElementById(x).style.cursor = "pointer";
            document.getElementById(x).onclick = showRules; });

    Core(ControllerScope);
    Core(DragScope);
    Core(DropScope);
    Core(TimerScope);
    Core(PlayerScope);
    Core(OkeyApiProviderScope);
    Core(CardScope);
    Core(HandScope);
    Core(DeckScope);
    Core(RosterScope);

    if (currentLanguage() != "en") $("#Flag-en").hide();


    translateScene();

    initDiscards();
    initChat();
    initChatSample();
    initPauseOverlay();
    initEditorsSafari();

    if ((hours() < 6 || hours() >= 18)) {
        $("#Sky").attr({fill:"#0E4B69"});
        $("#City").attr({fill:"#3B5998"});
        $("body")[0].style.background = "#0E4B69";
    } else
    {
        $("#Sky").attr({fill:"#EDF9FF"});
        $("#City").attr({fill:"#DFF1F4"});
        $("body")[0].style.background= "#EDF9FF";
    }

    document.addEventListener('touchmove',function(e) {e.preventDefault();},false);
    $svg.attr({preserveAspectRatio:"xMidYMid meet",width:"100%",height:"100%"});

    $("#Player-Left").attr({transform:""});
    $("#Player-Left-Timer").attr({transform:"translate(214, 151)"});
    $("#Player-Left-Display").attr({transform:"translate(256, 151)"});
    $("#Player-Right").attr({transform:""});
    $("#Player-Right-Timer").attr({transform:"translate(628, 161)"});
    $("#Player-Right-Display").attr({transform:"translate(670, 161)"});
    $("#Player-Center").attr({transform:""});
    $("#Player-Center-Timer").attr({transform:"translate(444, 92)"});
    $("#Player-Center-Display").attr({transform:"translate(486, 92)"});
}

function sendSawOkey()
{
    ws.send(enc(tuple(atom('client'),tuple(atom('game_action'),scope.gameId,
        atom('okey_i_saw_okey'),[]))));
}

function initChatSample() {
    chatMessage("Chat","0","Maxim","Kakaranet:\n"+i18n("GameChat"));
    barHover();
    mouseWheelHandler({'detail':-100000,'wheelDelta':-100000});
    barHoverOut();
}

function onPlayerInfo(evt) {
    ws.send(enc(tuple(atom('client'),
        tuple(atom('stats_action'),bin(document.user),atom('game_okey'))))); }

function onPlayerInfoClose(evt) { document.getElementById('Player-Statistics').style.display = 'none'; }

// Run

function appRun() {
    $.load('Kakaranet-Scene.svg', function(x) { 

        var name = "Refined";
        var slot = document.getElementById(name);
        if (slot == null) return;
        slot.parentNode.replaceChild(svg(x),slot);
        $.load("svg/Discarder.svg", function(h) {
            PatchSVG();
            StartApp(); 
        });
    });
}

function showRules()
{
    $.load("svg/Okey-Rules.svg", function(h) {
        var rules = document.getElementById("Okey-Rules");
        if (null == rules) {
            var rulesElement = svg(h);
            document.getElementById("Kakaranet-Scene").appendChild(rulesElement);
            rules = document.getElementById("Okey-Rules");
            rules.setAttribute('transform', 'translate(210,86)');
            rules.setAttribute('onclick', 'onRulesClose(evt)');
        }
        translateScene();
        rules.style.display = 'block';
    });
}

function displayPlayerInfo(fun)
{
    $.load("svg/Player-Statistics.svg", function(h) {
        var rules = document.getElementById("Player-Statistics");
        if (null == rules) {
            var rulesElement = svg(h);
            document.getElementById("Kakaranet-Scene").appendChild(rulesElement);
            rules = document.getElementById("Player-Statistics");
            rules.setAttribute('transform', 'translate(210,86)');
            rules.setAttribute('onclick', 'onPlayerInfoClose(evt)');
        }
        rules.style.display = 'block';

        fun();

    });

}

function requestPlayerInfo()
{
    ws.send(enc(tuple(atom('client'),
        tuple(atom('stats_action'),bin(document.user),atom('game_okey')))));
}

function onPlayerInfoClose(evt) {
    document.getElementById('Player-Statistics').style.display = 'none';
}

function onRulesClose(evt) {
    document.getElementById('Okey-Rules').style.display = 'none';
}

function initEditorsSafari()
{
    if (isSafari()) 
    {
        $("#edit").css({position:"relative"});
        $("#onlineChatEdit").css({position:"relative"});
        $(window).on("resize", manualForeignObjectPositioning);
        $(window).on("orientationchange", manualForeignObjectPositioning);
        manualForeignObjectPositioning();
    }
}


function hours() { return (new Date()).getHours(); }

function initPauseOverlay() {

    var html = '<g xmlns="http://www.w3.org/2000/svg" id="overlay" style="display:none;">'+
        '<rect x="216" y="91" stroke-width="0" stroke="red" width="641" height="367" rx="6" fill="skyblue" opacity="0.9"></rect>'+
        '<g>'+
        '<text id="Overlay-Results" fill="white" font-family="Exo 2" font-size="20pt"></text>'+
        '<text id="Overlay-Text" fill="white" font-family="Exo 2" y="280" x="-116" text-anchor="middle" dx="641" font-size="30pt"> Someone '+i18n("Paused")+'</text></g>'+
        '</g>';
    var page = document.getElementById("Kakaranet-Scene");
    var kakush = document.getElementById("Kakush");
    page.insertBefore(svg(html),kakush);

    $("#overlay").on("click", hideOverlay);

}

function showRoundEnd(e)
{
    $overlay.show();
    var reason = dec(e.raw).value[0][3][1].value[0][1].value;
    var gameres = dec(e.raw).value[0][3][2].value[0][1];
    $("#Overlay-Results").empty();
    for (var i=0;i<gameres.length;i++) { gameresultRow(400,130,i,gameres); }
    if (reason == "tashes_out") {
        $("#Overlay-Text").text("Tashes out");
        $("#RevealDeckRoot").hide();
    }

}

function hideOverlay()
{
    $overlay.hide();
    $("#Overlay-Results").empty();
    if (scope.ended) scope.deck.fill([]);
}

function denyWrongReveal() {
    $overlay.show();
    $("#RevealDeck").hide();
    $("#Overlay-Text").text(i18n("WrongReveal"));
}

function showRevealHand(o) {

    var player    = o.value[0][3][0].value[0][1].value,
        discard   = o.value[0][3][1].value[0][1].value,
        deck      = o.value[0][3][2].value[0][1];

    $.load("svg/Deck.svg", function(h) {

        $reveal_deck = $("#RevealDeck");

        if (null == $reveal_deck.$el) {
            $overlay.append(svg(h));
            $reveal_deck = $("#RevealDeck");
            $("#RevealDeckRoot").on("click", hideOverlay);
        }

        $reveal_deck.each(function(card){ card.$el && card.$el.remove(); });

        for (var i=0;i<2;i++)
        for (var j=0;j<deck[i].length;j++) {
            var bin = deck[i][j];
            if (null != bin.value[0][2]) {
                var card = new scope.Card({
                    color: scope.CARD_COLORS[bin.value[0][1]-1],
                    value: bin.value[0][2] });
                card.$el.attr('transform', 'translate(' + (5+j*42) + ' ' + (10+i*62) + ')');
                $reveal_deck.append(card.$el[0]);
            }
        }

    });

    $overlay.show();
    $("#Overlay-Text").text(utf8decode(player) + " " + i18n("Revealed"));

}

    scope.playersPositions = 
        [
          [ "Me", "Right", "Center", "Left" ],
          [ "Left", "Me", "Right", "Center" ],
          [ "Center", "Left", "Me", "Right" ],
          [ "Right", "Center", "Left", "Me" ]
         ];

globalShiftX = 0;
globalRightPosition = 857;


appRun();

if (adaptiveDesign())
{
    $(window).on("orientationchange", relayout);
    $(window).on("resize", relayout);
}

function manualForeignObjectPositioning()
{
    var svgWidth = $svg[0].viewBox.baseVal.width,
        svgHeight = $svg[0].viewBox.baseVal.height;

    var sizeX = svgWidth / innerWidth,
        sizeY = svgHeight / innerHeight,
        size = Math.max(sizeX, sizeY) || 1;

    var realX, realY, scale, shiftX, shiftY;

    realX = 1/size * svgWidth;
    realY = 1/size * svgHeight;

    var barwidth=0,rightPosition=866,globalShiftX=0;

    if (sizeX < sizeY) {
//      console.log("Left and Right White Spaces. Do stretch the Width ");
        shiftY = 0;
        shiftX = (innerWidth - realX) / 2 * sizeX;

        globalShiftX = adaptiveDesign() ? (shiftX > 30 ? shiftX - 20 : 0) : 0;
        barwidth = scope.fixedChatBars ? 0 : globalShiftX;
        rightPosition = adaptiveDesign() ? (svgWidth+globalShiftX-(barwidth+206)) : 866 ;

    } else  {
//      console.log("Top and Bottom White Spaces. Do reorient, or adopt the Height.");
        shiftX = 0;
        shiftY = (innerHeight - realY) / 2;
    }

    $("#GameChatEditor").attr({x: (rightPosition * realY / svgHeight + shiftX / sizeX),
                               y: 504 * realY / svgHeight + shiftY,
                               width: 196 * realX / svgWidth,
                               height: 120 * realY / svgHeight});

    $("#OnlineChatEditor").attr({x: 10 * realX / svgWidth + shiftX / sizeX - 
                                   globalShiftX * realX / svgWidth,
                               y: 504 * realY / svgHeight + shiftY,
                               width: 196 * realX / svgWidth,
                               height: 120 * realY / svgHeight});
}

function relayout()
{

    var svgWidth = $svg[0].viewBox.baseVal.width,
        svgHeight = $svg[0].viewBox.baseVal.height;

    var sizeX = svgWidth / innerWidth,
        sizeY = svgHeight / innerHeight,
        size = Math.max(sizeX, sizeY) || 1;

    var realX, realY, scale, shiftX, shiftY;

    realX = 1/size * svgWidth;
    realY = 1/size * svgHeight;

    if (sizeX < sizeY) {
        //console.log("Left and Right White Spaces. Do stretch the Width "+svgWidth);

        shiftY = 0;
        shiftX = (innerWidth - realX) / 2 * sizeX;

        globalShiftX = shiftX > 30 ? shiftX - 20 : 0;

        var barwidth = scope.fixedChatBars ? 0 : globalShiftX;
        var rightPosition = svgWidth+globalShiftX-(barwidth+213);
        globalRightPosition = rightPosition;

//        $("#Chat")           .attr({x:0,transform:"translate("+(rightPosition)+" 0)",width:barwidth+206});
        $("#Right-Bar")      .attr({x:0,transform:"translate("+(rightPosition)+" 0)",width:barwidth+216});
        $("#Clip-Path-Right").attr({x:0,transform:"translate("+(rightPosition)+" 0)",width:barwidth+216});

        $("#Online-Users").attr({transform:"translate("+(-globalShiftX+10)+" 20)"});
        $("#Facebook-Login").attr({transform:"translate("+(rightPosition+(barwidth+216)-150)+" 20)"});

//        $("#Online-List").attr({x:0,transform:"translate("+(-globalShiftX)+" 100)",width:barwidth+206});
        $("#Left-Bar")           .attr({x:0,transform:"translate("+(-globalShiftX)+" 0)",  width:barwidth+216});
        $("#Clip-Path-Left")     .attr({x:0,transform:"translate("+(-globalShiftX)+" 100)",width:barwidth+216});
        $("#Clip-Path-Left-Chat").attr({x:0,transform:"translate("+(-globalShiftX)+" 0)",width:barwidth+216});

        onlineHover();
        mouseWheelHandler({'detail':0,'wheelDelta':0});
        onlineHoverOut();

        barHover();
        mouseWheelHandler({'detail':0,'wheelDelta':0});
        barHoverOut();

        if (!isSafari()) {
            $("#GameChatEditor").attr({x: 10+rightPosition});
            $("#OnlineChatEditor").attr({x: 10-globalShiftX});
        }

    } else  {
//      console.log("Top and Bottom White Spaces. Do reorient, or adopt the Height.");
        shiftX = 0;
        shiftY = (innerHeight - realY) / 2;

        // do nothing with Vertical Layout
        // possible changing orientation
    }

}


