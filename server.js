const RootFolder = GetResourcePath(GetCurrentResourceName());
const resourceName = GetCurrentResourceName();
////////////
EnvConf = {
    UpdateTimer: 5000,
    Default:{
        Weather: "EXTRASUNNY",
        Wind:{
            Speed: 0.0,
            Direction: 0.0
        }
        // calendar dates??
    },
    Frozen:{
        Time: false,
        Weather: false,
        Wind: false
    },
    Duration:{
        Weather:{
            min:2,
            max:10,
        },
        Wind:{
            min:1,
            max:5,
        }
    }
}
////////////
class mkFunction {
    WaitFor(duration){
        return new Promise((resolve, reject)=>{
            let thistime = setTimeout(function(){
                resolve(true);
            }, duration)
        });
    }
    Log(msg){
        return new Promise((resolve, reject)=>{
            let dt = Date.now(); 
            console.log(`${dt} [${GetCurrentResourceName()}]`, msg);
            resolve(true);
        });
    }
}
////////////
MKENVPlayers = []
class serverIdentifiers {
    constructor(player) {
        this.source = player;
        this.name = GetPlayerName(player);
        this.numPlayerIdentifiers = GetNumPlayerIdentifiers(player);
        this.identifiers = [];
        for (let i = 0; i < GetNumPlayerIdentifiers(player); i++) {
            let identifier = GetPlayerIdentifier(player, i);
            let cmd = identifier.split(':');
            if(cmd[0]=='license'){this.license=identifier}
            this.identifiers.push(identifier);
        }        
    }
}
////////////
DateTime = []
WeatherQueue = []
WindQueue = []
////////////
WeatherTypes=[];
WeatherTypes["EXTRASUNNY"] = {hashName: "EXTRASUNNY", hashKey: -1750463879, hex: 0x97AA0A79}
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
class WeatherObj {
    constructor(weatherhash) {
        this.source = player;
        this.wHash = weatherhash
        this.camFilter = -1
        this.wIntensity = math.random(0.0, 1.0)
        let wdur = math.random(EnvConf.Duration.Weather.min, EnvConf.Duration.Weather.max)
        this.wDuration = (wdur * 60000)
    }
}
/////////////////////////////////////////////////////////////
/// Listeners and Events 
/////////////////////////////////////////////////////////////
on('onResourceStart', async (rName)=>{
    let _u = new mkFunction;
    if (resourceName != rName) { return; }
    else {
        _u.Log(`Script Started.`)
    }
});
on('onResourceStop', async (rName)=>{
    let _u = new mkFunction;
    if (resourceName != rName) { return; }
    else { 
        _u.Log(`Script Stopped.`)
    }
});
onNet("mk_env:NISS", async ()=>{
    let Identifiers = new serverIdentifiers(global.source);
    MKENVPlayers.push(Identifiers)
    console.log(`Syncing[${global.source}] ${Identifiers.name}`)
});

RegisterNetEvent("mk_env:hostdt")
onNet("mk_env:hostdt", async (dtsource)=>{
   if(global.source==MKENVPlayers[0].source){
    //    DateTime = dtsource
       console.log(dtsource)
    //    TriggerClientEvent('mk_env:dtupdate', -1, DateTime)
   }
   else{console.log('hostdt wot?')}
});
on('playerDropped', async (reason)=>{
    let Identifiers = new serverIdentifiers(global.source);    
    let removeIndex = MKENVPlayers.map(function(id) { return id.license; }).indexOf(Identifiers.license); 
    MKENVPlayers.splice(removeIndex, 1);
    console.log(`Desyncing[${global.source}] ${Identifiers.name}`)
});
////////////
// GameTick
////////////
let SERVERTICK = setTick(async() => {
    if(MKENVPlayers[0] != null){
        // console.log(`gonna use ${MKENVPlayers[0].source} for host`)
    }
})
////////////
// DT UPdate Loop
////////////
let DTLOOP = setInterval(function(){
    if(MKENVPlayers[0] != null){
        TriggerClientEvent('mk_env:canhasdt', MKENVPlayers[0].source)
    }
}, EnvConf.UpdateTimer)