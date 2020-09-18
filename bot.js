/*
this is a twitch bot that finds old names for league 
*/

const tmi = require('tmi.js');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

// Define configuration options
const opts = {
  identity: {
    username: process.env.BOT_USERNAME,
    password: process.env.OAUTH_TOKEN
  },
  channels: [
    process.env.CHANNEL_NAME,
    process.env.CHANNEL_NAME_2
  //  process.env.CHANNEL_NAME_3//a channel with too much spam is too distracting idk
  ]
};

// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();

// Called every time a message comes in
async function onMessageHandler (target, context, msg, self) {
  if (self) { return; } // Ignore messages from the bot

  console.log(msg)
  // Remove whitespace from chat message
  const find_name = msg.trim().substring(5).trim().replace(/\+/g, " ")
  const commandName = msg.trim().substring(0, 5);
  //client.say(target, `looking up ${commandAccount} cmd name ${commandName}`);
  //client.say(target, `msg 2`)
  
  // If the command is known, let's execute it
  if (commandName === '!find' || commandName == '!prev' || commandName == '!preu') {
    //console.log(process.env.IN_LOOKUP)
    if(process.env.IN_LOOKUP == 1)
    {
      var current = process.env.LF
      client.say(target, `MrDestructoid sorry I am looking up ${current} right now, try again in a bit`)
      return
    }
    else
    {
      process.env.IN_LOOKUP = 1
      process.env.LF = find_name
      //console.log(process.env.IN_LOOKUP)
    }
    if(find_name.replace(' ', '').toUpperCase().replace(/ /g, "") == 'THETANKMAN')
    {
      client.say(target, `Kappa`)
      process.env.IN_LOOKUP = 0
      return
    }
    //console.log('hello???')
    var transferred = ['NA1']
    let region_id_map = new Map()
    var request = new XMLHttpRequest();
    var result = undefined
    var platform_id = 'NA1'
    if (commandName == '!preu')
    {
      platform_id = 'EUW1'
      transferred = ['EUW1']
    }
    //console.log('wtf')
    //while(result == undefined)
    {
      await wait_a_bit()
      const special_fucker = encodeURIComponent(find_name) //nice guess btw
      console.log('hello' + platform_id)
      const req = 'https://'+platform_id+'.api.riotgames.com/lol/summoner/v4/summoners/by-name/'+special_fucker+'?api_key='+process.env.API_KEY
      console.log(req)
      request.open('GET', req, false);  // `false` makes the request synchronous
      request.send(null);
      //console.log(request.responseText)
      if(request.responseText == '{"status":{"message":"Data not found - summoner not found","status_code":404}}')
      {
        client.say(target, `${find_name} not found, check spelling`)
        process.env.IN_LOOKUP = 0
        return
      }
      result = JSON.parse(request.responseText)
    }
    const sum_info = result
    var acc_id = result.accountId
    region_id_map.set(platform_id, acc_id)
        
    
    var len = 100
    var begin = 0
    var old_names = [String(find_name).trim()]
    var oldest_time = 0
    while(len == 100)
    {
      console.log('looping')
        result = JSON.parse('{"fuck":"off"}')
        while(result.matches == undefined)
        {
          await wait_a_bit()
          request.open('GET', 'https://'+platform_id+'.api.riotgames.com/lol/match/v4/matchlists/by-account/'+acc_id+'?beginIndex='+begin+'&api_key='+process.env.API_KEY, false);
          request.send(null)
          result = JSON.parse(request.responseText)
          //console.log(result)
        }
       // matchlists.push(result)
        len = result.matches.length
        var game_id_1 = result.matches[len - 1].gameId
        var game_id_list = [game_id_1]
        platform_id = result.matches[len - 1].platformId
        var platform_id_list = [platform_id]
        oldest_time = result.matches[len-1].timestamp
        if(len == 100)
        {
          game_id_list.push(result.matches[50].gameId)
          platform_id_list.push(result.matches[50].platformId)
          oldest_time = result.matches[50].timestamp
        }
        var games_len = game_id_list.length
        begin = begin + 100
        console.log(begin)
      
        for(var g=0;g<games_len;g++)
        {
          var game_id = game_id_list[g]
          platform_id = platform_id_list[g]
          var in_list = false
          var t_len = transferred.length
          for(var t=0;t<t_len;t++)
          {
            if(transferred[t] == platform_id)
            {
              in_list = true
              t = t_len
            }
          }
          if(!in_list)
          {
            transferred.push(platform_id)
          }
          acc_id = region_id_map.get(platform_id)
          if(acc_id == undefined)
          {
            console.log('need to look up acc id for '+platform_id)
            var puuid = sum_info.puuid
            console.log('use ' + puuid)
            request.open('GET', 'https://'+platform_id+'.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/'+puuid+'?api_key='+process.env.API_KEY, false);
            request.send(null)
            result = JSON.parse(request.responseText)
            acc_id = result.accountId
            region_id_map.set(platform_id, acc_id)
            //https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/ZNc9HrQ78LPoo2vvcVUEsttyVLeiufuPYxGkkc7ezFyIb1cNMg04eIKDBFsF-788qr7ngNoHNzvXnw?api_key=RGAPI-394dbf6a-6541-4d67-b649-ab2d357fa373
          }
          console.log(acc_id)
          //console.log(game_id)
          result = JSON.parse('{"fuck":"off"}')
          while(result.participantIdentities == undefined)
          {
            await wait_a_bit()
            console.log('https://'+platform_id+'.api.riotgames.com/lol/match/v4/matches/'+game_id+'?api_key='+process.env.API_KEY)
            request.open('GET', 'https://'+platform_id+'.api.riotgames.com/lol/match/v4/matches/'+game_id+'?api_key='+process.env.API_KEY, false);
            request.send(null)
            result = JSON.parse(request.responseText)
            //console.log(result)
            console.log('stuck')
            
          }
          var p_array = result.participantIdentities
          console.log('len ' + p_array.length)
          var p_len = p_array.length //for some reason not 10??? bot games or what
          for(var i=0;i<p_len;i++)
          {
            var acc_game = p_array[i].player.accountId
            var acc_game_2 = p_array[i].player.currentAccountId
            //console.log(acc_game + ' ' + acc_id)
            if(acc_game == acc_id || acc_game_2 == acc_id)
            {
                var new_name = p_array[i].player.summonerName
                console.log('!!!! '+new_name)
                var found = old_names.length
                var not_found = true
                for(var j=0;j<found;j++)
                {
                  //console.log(old_names[j].toUpperCase())
                  //console.log(new_name.toUpperCase())
                  if(old_names[j].toUpperCase() == new_name.toUpperCase())
                  {
                    not_found = false
                    old_names[j] = new_name //usually does nothing but make sure the first name in list is right
                    j = found
                  }
                }
                if(not_found)
                {
                  old_names.push(new_name)
                }
            }
          }
          console.log('done with game '+g)
        }
    }
    
    var last = new Date(oldest_time)
    var since = last.toLocaleString('en-us', { month: "short" }) + ' ' + last.getFullYear()
    var name_list = ''
    var names_len = old_names.length
    for(var i=1;i<names_len - 1;i++)
    {
      name_list = name_list + old_names[i] + ', '
    }
    name_list = name_list + old_names[names_len - 1]
    var transfer_string = ''
    var num_regions = transferred.length
    if(num_regions > 1)
    {
      let golden_door = new Map([
          ['BR1', 'Brazil'],
          ['EUN1', 'Europe Nordic East'],
          ['EUW1', 'Europe West'],
          ['JP1', 'Japan'],
          ['KR', 'Korea'],
          ['LA1', 'Latin America North'],
          ['LA2', 'Latin America South'],
          ['OC1', 'Oceania'],
          ['RU', 'Russia'],
          ['TR1', 'Turkey']
      ]);
      transfer_string = '. ' + old_names[0] + ' transferred account to ' + golden_door.get(transferred[0]) + ' from '
      for(var t=1;t<num_regions - 1;t++)
      {
        transfer_string = transfer_string + golden_door.get(transferred[t]) + ', '
      }
      transfer_string = transfer_string + golden_door.get(transferred[num_regions - 1]) + '.'
    }
    if(names_len == 1)
    {
      client.say(target, `since ${since}, no old names found for ${old_names[0]}${transfer_string}`)
    }
    else
    {
      client.say(target, `since ${since}, old names found for ${old_names[0]}: ${name_list}${transfer_string}`)
    }
    process.env.IN_LOOKUP = 0
    }
}

function wait_a_bit() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('resolved');
    }, 1500);
  });
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}
