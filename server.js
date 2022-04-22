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
    SendFrozen(){            
        let fData = {}
        fData.FrozenTime = FrozenTime
        fData.Frozen = EnvConf.Frozen
        TriggerClientEvent('mk_env:setfrozen', -1, fData)
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
FrozenTime = [12,00,00]
WeatherQueue = []
WindQueue = []
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
RegisterNetEvent("mk_env:frozenstate")
onNet("mk_env:frozenstate", async ()=>{
    let _u = new mkFunction;
    _u.SendFrozen()
});
RegisterNetEvent("mk_env:hostdt")
onNet("mk_env:hostdt", async (dtsource)=>{
   if(global.source==MKENVPlayers[0].source){
       DateTime = dtsource
       TriggerClientEvent('mk_env:dtupdate', -1, DateTime)
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