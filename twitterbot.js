const Twitter = require('twitter');
require('dotenv').config()
let latestId = 1391462169166942200;
const USERNAME = "Zodiac_Getter";
let init = false;
const client = new Twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN_KEY ,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET 
});

const snooze = ms => new Promise((resolve) => setTimeout(resolve, ms));
const {dateComposer, getSigns} = require('./signGetter')

;(async()=>{
    mainLoop: while(true){
        await snooze(20_000);
        try{
        const data = await client.get('statuses/mentions_timeline',{});
        const target = data[0];
        if(target.id != latestId && target.user.screen_name != USERNAME){
            console.log(target);
            latestId = target.id;
            if(!init){
                init = true;
                continue mainLoop;
            }
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