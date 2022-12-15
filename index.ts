import { App } from "@slack/bolt";
import 'dotenv/config'
import axios from 'axios'
import { convertTZ, result } from "./utils";
import * as cron from 'node-schedule';
import moment from 'moment';
import { createClient } from "@supabase/supabase-js";


const generateLine = async (topics: string[]): Promise<string> => {
  const key = process.env.API_KEY;
  const response = await axios.post(
      "https://api.langa.me/v1/conversation/starter",
      { topics, limit: 1 },
      { headers: { "X-Api-Key": key, "accept-encoding": "*" } }
    );
   return response.data.results[0].conversation_starter.en;
}
const app = new App({
    token: process.env.OAuthToken,
    signingSecret: process.env.signingSecret,
    socketMode:true,
    appToken: process.env.appToken
});
const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_KEY as string,{
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  })

let pattern = "*/2 * * * *"

const generateRooms  = async () => {
  try {
    const channels =  (await app.client.conversations.list({types: "public_channel,private_channel"})).channels
    const channel = channels ? channels.filter((channel) => {
return channel.name == 'langame'
    })[0].id : null 
    console.log("channel",channel)
    if(channel) {
    let members =(await app.client.conversations.members({ channel })).members
    members = members && members.filter((member) => {
      return member != 'U04DDC2LH3R'
    }).sort()
   
    console.log("members",members)
    const lastMember = members && members.length %2 !== 0 ? members.pop() : null
    const pairs = result(members as string[])
    
    if(lastMember) {
      pairs[pairs.length - 1] = [...pairs[pairs.length -  1],lastMember]
      console.log("pairs",pairs)
    }
    for(const pair of pairs) {
      let name = `${moment(new Date()).format("l").toString().replace(/\//g, '-')}`
      const topic = (await generateLine(['philosophy']))
      if(topic) {
      for(const person of pair) {
        const userInfo = await app.client.users.info({user: person})
        name = name + userInfo.user?.name as string
      }
      name = name.replace(' ','-').replace(/\./g,'').toLowerCase()
      name.slice(0, -1);
     let tempName = (' ' + name).slice(1);
     let number = 0
      const channelNames = channels && channels.map((channel)=> channel.name)
      console.log("channel names",channelNames)
      while(channelNames && channelNames.includes(tempName)) {
        tempName = name + "-" + number
        number = number + 1;
      }
      name = tempName
      console.log("FINAL NAME",name)
      const room = (await app.client.conversations.create({ name, is_private: true }))
      
      const channel = room && room.channel ? room.channel.id : null
      if(channel) {
        await app.client.conversations.setTopic({channel,topic})
        app.client.conversations.invite({channel,users: pair.join()})
        const result = await app.client.chat.postMessage({
          channel: channel,
          text: topic,
          attachments: [
              {
                  text: "Did you like the line generated?",
                  fallback: "Error rating line!",
                  callback_id: "line_result",
                  color: "#3AA3E3",
                  actions: [
                      {
                          name: "yes",
                          text: "Yes",
                          type: "button",
                          value: "1"
                      },
                      {
                          name: "no",
                          text: "No",
                          style: "danger",
                          type: "button",
                          value: "0",
                      }
                  ]
              }
          ]
        });
      }
     
      


    }
    }
    }
  } catch (error: any) {
    console.log("err")
    console.error(error);
    const result = await app.client.chat.postMessage({
      channel: "C04DTNRG12P",
      text: `There was an error generating rooms: ` + error.message as string
    });
  }
}
/*
@returns void, does the cron command for creating private rooms with members.
*/
const cronMessage = async () => {
  console.log("PATTERN", pattern)
  await generateRooms()
}
let job = cron.scheduleJob(pattern, async () => {
  console.log("IN CRON", new Date())
  await cronMessage()
});

/*
@returns question.
*/
app.command("/g", async ({ command, ack,client}) => {
  const text = await (await generateLine(['philosophy']))
 await client.chat.postMessage({
  channel: command.channel_id,
  text
});
});

app.command("/settings", async ({ command, ack,client}) => {
  try {
    ack()
    const trigger_id = command.trigger_id
    const id: string = command.user_id
    const userResult = await client.users.info({user: id, include_locale: true})
    const result = userResult.user && userResult.user.is_admin && await client.views.open({
      // Pass a valid trigger_id within 3 seconds of receiving it
      trigger_id,
      // View payload
      view: {
        
        type: 'modal',
        // View identifier
        callback_id: 'view_1',
        title: {
          type: 'plain_text',
          text: 'Modal title'
        },
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: 'Settings'
            },
          },
          /*
          {
            type: 'input',
            block_id: 'input_c',
            label: {
              type: 'plain_text',
              text: 'Please select topics.'
            },
            element: {
              type: 'plain_text_input',
              action_id: 'dreamy_input',
              multiline: true,
              placeholder: {type: 'plain_text',
              text: "Philosophy, Deep talk",
              emoji: false }
            },
          },
          */
          {
            block_id: "days",
            type: "input",
            element: {
              type: "checkboxes",
              options: [
                {
                  text: {
                    type: "plain_text",
                    text: "Monday",
                    emoji: true
                  },
                  value: "Mon"
                },
                {
                  text: {
                    type: "plain_text",
                    text: "Tuesday",
                    emoji: true
                  },
                  value: "Tue"
                },
                {
                  text: {
                    type: "plain_text",
                    text: "Wednesday",
                    emoji: true
                  },
                  value: "Wed"
                },
                {
                  text: {
                    type: "plain_text",
                    text: "Thursday",
                    emoji: true
                  },
                  value: "Thu"
                },
                {
                  text: {
                    type: "plain_text",
                    text: "Friday",
                    emoji: true
                  },
                  value: "Fri"
                },
                {
                  text: {
                    type: "plain_text",
                    text: "Saturday",
                    emoji: true
                  },
                  value: "Sat"
                },
                {
                  text: {
                    type: "plain_text",
                    text: "Sunday",
                    emoji: true
                  },
                  value: "Sun"
                }
              ],
              action_id: "days_of_week",
  
            },
            label: {
              type: "plain_text",
              text: "Choose days of the week to generate questions",
              emoji: true
            }
          },
          {
            type: "input",
            block_id: "input_time",
             label: {
              type: "plain_text",
              text: "Select a time to generate questions."
            },
            element: {
              type: "timepicker",
              action_id: "timepicker123",
              initial_time: "12:00",
              placeholder: {
                type: "plain_text",
                text: "Select a time to generate questions."
              }
            }
          }
        ],
        submit: {
          type: 'plain_text',
          text: 'Submit'
        }
      }
      
    });
  } catch (error) {
    console.log("err")
    console.error(error);
  }
});

  app.view('view_1', async ({ ack, body, view, client, logger }) => {
    // Acknowledge the view_submission request
    await ack();
    // Do whatever you want with the input data - here we're saving it to a DB then sending the user a verification of their submission
    // Assume there's an input block with `block_1` as the block_id and `input_a`
    //const topics = view['state']['values']['input_c']['dreamy_input'].value
    const time = view['state']['values']['input_time']['timepicker123'].selected_time
    const daysValue = view['state']['values']['days']['days_of_week'].selected_options
    const days = daysValue && daysValue.map((day: any) => day.value).join(',')
    console.log("DAYS",days)
    const timeSplit = time && time.split(":") 
    console.log('time',time)
    const user = body['user']['id'] as any
  
   
    // Message to send user
    // Save to DB (TODO)
    if(timeSplit) {
    pattern = `${timeSplit[1]} ${timeSplit[0]} * * ${days}`
    console.log("NEW PATTERN SET!",pattern)
    }
    let newJob = job.reschedule(pattern)
    
    console.log("new job",newJob)
    // Message the user
    try {
      await client.chat.postMessage({
        channel: user,
        text: time && days ? `time is now ${time}`:  "There was an issue establishing new settings."
      });
    }
    catch (error) {
      console.log('error',error)
    }
  });

  
  app.action({type: "interactive_message", callback_id: 'line_result'},  async ({ body, client, ack, logger }) => {
    await ack();
      const action = body.actions[0] as any
      const rating = action.value
      const team_id = body.team?.id
      const user_id = body.user.id
      const text = body.original_message && body.original_message.text
      const categories = ['philosophy']
      
      const { data, error: addUserError } = await supabase
      .from('slackbot')
      .insert([
        {user_id, question: text, categories, rating, team_id}
      ])
      if(addUserError) {
        console.log("ERROR WHEN RATING CARD", addUserError.message)
      }
      client.chat.update({channel: body.channel.id, ts: body.message_ts as string, text, attachments: [{
        text: "Thank you for the feedback!"
      }] 
      })
    // Update the message to reflect the action
  });

 
app.start(3000)
