NISS = null
MAPSTART = null
CGTS = null
PSPAWN = null
////////////
DateTime = []
WeatherQueue = []
WindQueue = []
////////////
function draw2screen(text, r, g, b, a, x, y, scale){
    SetTextFont(4)
    SetTextProportional(true)
    SetTextScale(scale, scale)
    SetTextColour(r, g, b, a)
    SetTextDropShadow(0, 0, 0, 0, 255)
    SetTextEdge(1, 0, 0, 0, 255)
    SetTextDropShadow()
    SetTextOutline()
    BeginTextCommandDisplayText("STRING")
    AddTextComponentSubstringPlayerName(text)
    EndTextCommandDisplayText(x, y)
}
////////////
let nisstimer = setTick(async() => {
    if( NetworkIsSessionStarted() ){
        emitNet('mk_env:NISS', true)
        NISS = true;
        clearTick(nisstimer);
    }
})
on('onClientMapStart', ()=>{
    MAPSTART = true;
})
on('onClientGameTypeStart', ()=>{
    CGTS = true;
})
on('playerSpawned', ()=>{
    PSPAWN = true;
});
////////////
let ClientGameTimer = setTick(async() => {
    if( NISS==true ){       
        ClearOverrideWeather()
        ClearWeatherTypePersist() 
        NetworkClearClockTimeOverride()
        DateTime["Time"] = NetworkGetGlobalMultiplayerClock();
        draw2screen(`Time[ ${DateTime["Time"][0]}:${DateTime["Time"][1]}:${DateTime["Time"][2]} ]`, 255, 255, 255, 255, 0.05, 0.77, 0.5)
        let amihost = NetworkIsHost()
        if(amihost==true){
            let hDay = GetClockDayOfMonth()
            let hMonth = GetClockMonth()
            let hYear = GetClockYear()
            let DOW = GetClockDayOfWeek()
            DateTime["Date"] = [hDay, hMonth, hYear, DOW];
            draw2screen(`isHost[ ${amihost} ]  DOW[ ${DateTime["Date"][3]} ] Date[ ${DateTime["Date"][0]}:${DateTime["Date"][1]}:${DateTime["Date"][2]} ]`, 255, 255, 255, 255, 0.05, 0.75, 0.5)
        }
        // AdvanceClockTimeTo(DateTime[0][0], DateTime[0][1], DateTime[0][2]);
    }
})