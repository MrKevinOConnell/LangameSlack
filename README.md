# SupportHeroJr

## Slack bot to help faciliate support discussions in the [PostHog](https://github.com/PostHog/posthog) Slack workspace.

### Slack API setup

- Create a Slack app at https://api.slack.com/apps
- On the basic information tab, you will find your signing secret, which will be our signingSecret env variable
- On the same tab, create a app-level token that has both authorizations:read and connections:write permissions, the token that results will be our appToken env variable.
- Go to the OAuth and permissions tab and copy the "Bot User OAuth Token", place that token under the OAuthToken env variable
- Go to the Slash commands tab and create three commands: /disable, /enable and /sethero. Set the description for each to whatever is wanted
- Click on Socket Mode and enable the slider next to "Enable Socket Mode"
- Go to the Install App tab and click "Reinstall to Workspace" to add the bot to the workspace
- Finally, go into the channel where you want the bot to function and enter /invite @Your-App-Name.

*NOTE* - If the bot isn't hosted, you need to run it locally using the commands below for the bot to respond.

### Local Setup
- yarn
- `ts-node index.ts`

### Commands

- /disable - disables the selected user from recieving messages from the bot
- /enable - enables the user to get messages from the bot again
- /sethero - sets the current support hero, has 2 params, a mentioned slack member and a timezone (ex. 'America/New_York'), the timezone cannot contain spaces.
