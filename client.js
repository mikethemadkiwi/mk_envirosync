NISS = null
MAPSTART = null
CGTS = null
PSPAWN = null
////////////
DateTime = []
WeatherQueue = []
WindQueue = []
Frozen = []
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
function updateDate(){
    let hDay = GetClockDayOfMonth()
    let hMonth = GetClockMonth()
    let hYear = GetClockYear()
    let DOW = GetClockDayOfWeek()
    DateTime["Date"] = [hDay, hMonth, hYear, DOW];
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
    updateDate()
    emitNet('mk_env:PSPAWN', true)
    PSPAWN = true;
});
////////////
RegisterNetEvent("mk_env:canhasdt")
onNet('mk_env:canhasdt', () => { // if i am host, this will send my date to everyone for sync.
    updateDate()
    TriggerServerEvent('mk_env:hostdt', DateTime["Date"])
})
////////////
RegisterNetEvent("mk_env:dtupdate")
onNet('mk_env:dtupdate', (dtupdate) => {
    DateTime["Date"] = dtupdate
    SetClockDate(DateTime["Date"][0],DateTime["Date"][1],DateTime["Date"][2])
})
////////////
let ClientGameTimer = setTick(async() => {
    if( NISS==true ){       
        ClearOverrideWeather()
        ClearWeatherTypePersist() 
        NetworkClearClockTimeOverride()
        //time
        DateTime["Time"] = NetworkGetGlobalMultiplayerClock();
        draw2screen(`Time[ ${DateTime["Time"][0]}:${DateTime["Time"][1]}:${DateTime["Time"][2]} ]`, 255, 255, 255, 255, 0.05, 0.77, 0.5)
        if(DateTime["Date"]!=null){
            draw2screen(`DOW[ ${DateTime["Date"][3]} ] Date[ ${DateTime["Date"][0]}:${DateTime["Date"][1]}:${DateTime["Date"][2]} ]`, 255, 255, 255, 255, 0.05, 0.75, 0.5)
        }
        AdvanceClockTimeTo(DateTime["Time"][0], DateTime["Time"][1], DateTime["Time"][2]);
        // weather 
        SetRainLevel(-1)   // -1 denotes using current weather max val
        if(GetPrevWeatherTypeHashName()=='XMAS') {
            SetForceVehicleTrails(true)
            SetForcePedFootstepsTracks(true)
        } else {
            SetForceVehicleTrails(false)
            SetForcePedFootstepsTracks(false)
        }
    }
})