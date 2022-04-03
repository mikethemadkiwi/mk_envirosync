NISS = null
MAPSTART = null
CGTS = null
PSPAWN = null
////////////
DateTime = []
WeatherQueue = []
WindQueue = []
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

let ClientGameTimer = setTick(async() => {
    if( NISS==true ){       
        ClearOverrideWeather()
        ClearWeatherTypePersist() 
        NetworkClearClockTimeOverride()
        DateTime["Time"] = NetworkGetGlobalMultiplayerClock();
        let amihost = NetworkIsHost()
        if(amihost==true){
            let hDay = GetClockDayOfMonth()
            let hMonth = GetClockMonth()
            let hYear = GetClockYear()
            let DOW = GetClockDayOfWeek()
            DateTime["Date"] = [hDay, hMonth, hYear, DOW];
        }
        console.log(`isHost[ ${amihost} ] Time[ ${DateTime["Time"][0]}:${DateTime["Time"][1]}:${DateTime["Time"][2]} ]`)
        console.log(`DOW[ ${DateTime["Date"][3]} ] Date[ ${DateTime["Date"][0]}:${DateTime["Date"][1]}:${DateTime["Date"][2]} ]`)
        // AdvanceClockTimeTo(DateTime[0][0], DateTime[0][1], DateTime[0][2]);
    }
})