import { App } from "@slack/bolt";
import 'dotenv/config'


const app = new App({
    token: process.env.OAuthToken,
    signingSecret: process.env.signingSecret,
    socketMode:true,
    appToken: process.env.appToken
});

const disabledUserIds:string[]  = []

const defaultSupportHero = {slackName: "", timezone: ""}
let supportHero = {...defaultSupportHero}

/*
params are username (ex @kevinoconnell42@gmail.com) and timezone (ex. America/New_York)
@returns whispered message to user giving the name of the new support hero.
*/
app.command("/sethero", async ({ command, ack,client }) => {
  try {
    ack()
    const id: string = command.user_id
    const commandParam = command.text.trim().split(" ")
    if(commandParam.length !== 2) {
      const result = await client.chat.postEphemeral({
        channel: command.channel_id,
        user: id,
        text: `This command needs two parameters, one of which is the tagged Support Hero and the other is their timezone.`,
      });
      return
    }
    const userInfo = await app.client.users.info({user: id})
    if(!userInfo.user || !userInfo.user.is_admin) {
      const result = await client.chat.postEphemeral({
        channel: command.channel_id,
        user: id,
        text: "You do not have admin privileges ",
      });
      return
    }
    if(commandParam[0].charAt(0) !== "@") {
      const result = await client.chat.postEphemeral({
        channel: command.channel_id,
        user: id,
        text: "The first parameter needs to be a tagged member in this workspace",
      });
      return
    }
    supportHero = {slackName: `<${commandParam[0]}>`,timezone: commandParam[1] ? commandParam[1] : ""}
  const result = await client.chat.postEphemeral({
    channel: command.channel_id,
    user: id,
    text: `Support Hero is now ${supportHero.slackName} in ${supportHero.timezone}`,
  });
  } catch (error) {
    console.log("err")
    console.error(error);
  }
});
/*
@returns whispered message telling user the bot is disabled for them or that it is already disabled.
*/
app.command("/disable", async ({ command, ack,client }) => {
  try {

    ack()
    const id: string = command.user_id
    let text = ""
    if(disabledUserIds.includes(id)) {
    text = "The bot is already disabled!"
    }
    else  {
      disabledUserIds.push(id)
      text = "The bot is now disabled!"
    }
    const result = await client.chat.postEphemeral({
      channel: command.channel_id,
      user: id,
      text
    });
  } catch (error) {
    console.log("err")
    console.error(error);
  }
});
/*
@returns whispered message telling user the bot is enabled for them or that it is already enabled.
*/
app.command("/enable", async ({ command, ack,client}) => {
  try {
    ack()
    const id: string = command.user_id
    let text = ""
    const userIdIndex: number = disabledUserIds.findIndex((value) => value == id)
    if(userIdIndex !== -1) {
      disabledUserIds.splice(userIdIndex,1)
      text= "The bot is now enabled!"
    }
    else {
      text = "The bot is already enabled!"
    }
    const result = await client.chat.postEphemeral({
      channel: command.channel_id,
      user: id,
      text
    });
  } catch (error) {
    console.log("err")
    console.error(error);
  }
});
/*
listener for events that occur in channels the bot is in
*/
app.event("message",async ({ message,client }) => {
  // Getting weird type error
  const finishedMessage = message as any
  if(supportHero === defaultSupportHero) {
    const result = await client.chat.postEphemeral({
      channel: message.channel,
      user: finishedMessage.user,
      text: "There is no support hero available currently.",
    });
    return
  }
    try {
      
    if(!disabledUserIds.includes(finishedMessage.user)) {
    const msg  = `It looks like you're asking the community for help. Our Support Hero this week is ${supportHero.slackName}, who is based in ${supportHero.timezone}. We recommend checking <https://posthog.com/questions|our support site> to see if your question has already been answered - but, if not, we'll respond <https://posthog.com/handbook/engineering/support-hero#prioritizing-requests|as quickly as we can>.`
    const result = await client.chat.postEphemeral({
      channel: message.channel,
      user: finishedMessage.user,
      text: msg,
    });
    console.log(result)
  }
    }
    catch (error) {
        console.log("err")
        console.error(error);
    }
  });
app.start(3000)