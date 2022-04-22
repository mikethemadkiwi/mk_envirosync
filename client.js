NISS = null
MAPSTART = null
CGTS = null
PSPAWN = null
////////////
DateTime = []
WeatherQueue = []
WindQueue = []
Frozen = {
    Time: false,
    Weather: false,
    Wind: false
}
FrozenTime = [12, 0, 0]
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
        //defaults for DT
        DateTime["Time"] = NetworkGetGlobalMultiplayerClock();
        updateDate()
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
RegisterNetEvent("mk_env:setfrozen")
onNet('mk_env:setfrozen', (fData) => { // if i am host, this will send my date to everyone for sync.
   Frozen = fData.Frozen
   FrozenTime = fData.FrozenTime
})
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
    if (!Frozen.Time) {
        SetClockDate(DateTime["Date"][0],DateTime["Date"][1],DateTime["Date"][2])
    }
})
////////////
let ClientGameTimer = setTick(async() => {
    if( NISS==true ){       
        ClearOverrideWeather()
        ClearWeatherTypePersist() 
        NetworkClearClockTimeOverride()
        ///////////////////////////////////////
        // time freeze or update
        ///////////////////////////////////////        
        if (!Frozen.Time) {
            DateTime["Time"] = NetworkGetGlobalMultiplayerClock();
            AdvanceClockTimeTo(DateTime["Time"][0], DateTime["Time"][1], DateTime["Time"][2]);
            draw2screen(`Time[ ${DateTime["Time"][0]}:${DateTime["Time"][1]}:${DateTime["Time"][2]} ]`, 255, 255, 255, 255, 0.02, 0.15, 0.4)
        }
        else{            
			NetworkOverrideClockTime(FrozenTime[0], FrozenTime[1], FrozenTime[2])
            draw2screen(`Time[ ${FrozenTime[0]}:${FrozenTime[1]}:${FrozenTime[2]} ]`, 255, 255, 255, 255, 0.02, 0.15, 0.4)
        }
        ///////////////////////////////////////
        // weather
        ///////////////////////////////////////
        let wPrev = GetPrevWeatherTypeHashName();
        let wNext = GetNextWeatherTypeHashName();
        let wtransP, wtransN, wTrans = GetWeatherTypeTransition();
        if (!Frozen.Weather) {
            if(GetPrevWeatherTypeHashName()=='XMAS') {
                SetForceVehicleTrails(true)
                SetForcePedFootstepsTracks(true)
            } else {
                SetForceVehicleTrails(false)
                SetForcePedFootstepsTracks(false)
            }
        }
        else{

        }
        // Wind    
        if (!Frozen.Wind) {

        }
        else {

        }
        ///////////////////////////////////////
        // Draws or LastLogic
        /////////////////////////////////////// 
        if(DateTime["Date"]!=null){
            draw2screen(`DOW[ ${DateTime["Date"][3]} ] Date[ ${DateTime["Date"][0]}/${DateTime["Date"][1]}/${DateTime["Date"][2]} ]`, 255, 255, 255, 255, 0.02, 0.17, 0.4)
        }
        draw2screen(`Weather[ ${wPrev}/${wNext} ] ${wTrans}%`, 255, 255, 255, 255, 0.02, 0.19, 0.4)
        ///////////////////////////////////////
    }
})