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
WeatherTypes=[];
WeatherTypes["EXTRASUNNY"] = {hashKey: -1750463879, hex: 0x97AA0A79}
WeatherTypes["CLEAR"] = {hashKey: 916995460, hex: 0x36A83D84}
WeatherTypes["CLOUDS"] = {hashKey: 821931868, hex: 0x30FDAF5C}
WeatherTypes["OVERCAST"] = {hashKey: -1148613331, hex: 0xBB898D2D}
WeatherTypes["RAIN"] = {hashKey: 1420204096, hex: 0x54A69840}
WeatherTypes["CLEARING"] = {hashKey: 1840358669, hex: 0x6DB1A50D}
WeatherTypes["THUNDER"] = {hashKey: -1233681761, hex: 0xB677829F}
WeatherTypes["SMOG"] = {hashKey: 282916021, hex: 0x10DCF4B5}
WeatherTypes["FOGGY"] = {hashKey: -1368164796, hex: 0xAE737644}
WeatherTypes["XMAS"] = {hashKey: -1429616491, hex: 0xAAC9C895}
WeatherTypes["SNOWLIGHT"] = {hashKey: 603685163, hex: 0x23FB812B}
WeatherTypes["BLIZZARD"] = {hashKey: 669657108, hex: 0x27EA2814}
WeatherTypes["HALLOWEEN"] = {hashKey: -921030142, hex: null}
WeatherTypes["SNOW"] = {hashKey: -273223690, hex: null}
WeatherTypes["NEUTRAL"] = {hashKey: -1530260698, hex: null}
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
function DayOfWeekInt(Dint){
    let days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
    return days[Dint]
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
        draw2screen(`~o~[ MK_EnviroSync ]`, 255, 255, 255, 255, 0.02, 0.13, 0.4)
        ///////////////////////////////////////
        // time freeze or update
        ///////////////////////////////////////        
        if (!Frozen.Time) {
            DateTime["Time"] = NetworkGetGlobalMultiplayerClock();
            AdvanceClockTimeTo(DateTime["Time"][0], DateTime["Time"][1], DateTime["Time"][2]);
            draw2screen(`~o~Time[~w~ ${DateTime["Time"][0]}:${DateTime["Time"][1]}:${DateTime["Time"][2]}~o~ ]`, 255, 255, 255, 255, 0.02, 0.15, 0.4)
        }
        else{            
			NetworkOverrideClockTime(FrozenTime[0], FrozenTime[1], FrozenTime[2])
            draw2screen(`~o~Time[ ~w~${FrozenTime[0]}:${FrozenTime[1]}:${FrozenTime[2]} ~o~]`, 255, 255, 255, 255, 0.02, 0.15, 0.4)
        }
        ///////////////////////////////////////
        // weather
        ///////////////////////////////////////
        let wPrev = GetPrevWeatherTypeHashName();
        let wNext = GetNextWeatherTypeHashName();
        let wTrans = GetWeatherTypeTransition();
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
            let dDay = DayOfWeekInt(DateTime["Date"][3])
            draw2screen(`~o~DOW[~w~${dDay} ~o~] Date[ ~w~${DateTime["Date"][0]}/${DateTime["Date"][1]}/${DateTime["Date"][2]} ~o~]`, 255, 255, 255, 255, 0.02, 0.17, 0.4)
        }
        // let percwTrans = wTrans.toFixed(3)
        let perc1 = wTrans[2].toFixed(2);
        let perc2 = perc1 * 100;
        
        let prevName = WeatherTypes.map(function(id) { return id.hashKey; }).indexOf(wPrev);
        console.log(prevName)
        draw2screen(`~o~Weather[ ~w~${wPrev} | ${perc2}% | ${wNext}~o~]`, 255, 255, 255, 255, 0.02, 0.19, 0.4)
        ///////////////////////////////////////
    }
})
// https://docs.fivem.net/natives/?_0xFC4842A34657BFCB