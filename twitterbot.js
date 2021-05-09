const Twitter = require('twitter');
let latestId = 1391462169166942200;
const USERNAME = "Zodiac_Getter"
const client = new Twitter({
    consumer_key: 'VKU8eZXn5fLExF4DGL40C6qaN',
    consumer_secret: 'faeK1Cczz27sdczCHFcwTTrKHQwwVWdPLloWIuaZtH0UxGJSZM',
    access_token_key: '1391408014524141571-1xmDMuywaV2ehxazu17Rwv725qMojs',
    access_token_secret: 'w6NGpsL2DOweLlEyWSGPK3lZJTBqr7C2DanTrjVrRs6IA'
});

const snooze = ms => new Promise((resolve) => setTimeout(resolve, ms));
const {dateComposer, getSigns} = require('./signGetter')

;(async()=>{
    mainLoop: while(true){
        await snooze(10_000);
        try{
        const data = await client.get('statuses/mentions_timeline',{});
        const target = data[0];
        if(target.id != latestId && target.user.screen_name != USERNAME){
            console.log(target);
            latestId = target.id;
            const message = target.text.split(' ');

            if(message.length < 4){
               await client.post('statuses/update',{status: "@"+target.user.screen_name+" Sorry! The tweet was not formatted properly. Make sure it is: \n@"+USERNAME+" DD-MM-YY hh:mm City", in_reply_to_status_id: target.id_str,auto_populate_reply_metadata:true});
               continue mainLoop;
            }           
            const date = message[1];
            const time = message[2];
            const city = message[3];

            console.log(date,time,city)
            if(date.replace(/-/g,'').length != 8){
                await client.post('statuses/update',{status: "@"+target.user.screen_name+" Sorry! The tweet was not formatted properly. Make sure it is: \n@"+USERNAME+" DD-MM-YY hh:mm City", in_reply_to_status_id: target.id_str,auto_populate_reply_metadata:true});
                continue mainLoop;
            }
            const formDate = dateComposer(date);
            for(let i = 0; i< formDate.length; i++){
                if(!formDate[i]){
                    continue mainLoop;
                }
            }

            const result = await getSigns(target.user.name, date, time, city)
            if(!result){
                await client.post('statuses/update',{status: "@"+target.user.screen_name+" Sorry! The tweet was not formatted properly. Make sure it is: \n@"+USERNAME+" DD-MM-YY hh:mm City", in_reply_to_status_id: target.id_str,auto_populate_reply_metadata:true});
                continue mainLoop;
            }
            await client.post('statuses/update',{status: result.rising ? "@"+target.user.screen_name+" You have your sun in "+result.sun.toLowerCase() + ", moon in " + result.moon.toLowerCase() + " and your rising in " + result.rising.toLowerCase() + " ;)" : "@"+target.user.screen_name+" You have your sun in "+result.sun.toLowerCase() + ", moon in " + result.moon.toLowerCase() + " ;)", in_reply_to_status_id: target.id_str,auto_populate_reply_metadata:true});




           // await client.post('statuses/update',{status: "@"+target.user.screen_name+" skrr", in_reply_to_status_id: target.id_str,auto_populate_reply_metadata:true})
        }else{
            console.log("Nada");
        }
    }catch(e){
        console.log("Error ", e)
    }
    }
})()