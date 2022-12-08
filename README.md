# LangameSlack

## Slack bot to help faciliate discussions between team members in a Slack workspace.

### Slack API setup

- Create a Slack app at https://api.slack.com/apps
- On the basic information tab, you will find your signing secret, which will be our signingSecret env variable
- On the same tab, create a app-level token that has both authorizations:read and connections:write permissions, the token that results will be our appToken env variable.
- Go to the OAuth and permissions tab and enter in the following: <img width="100" alt="Screen Shot 2022-12-07 at 2 02 02 PM" src="https://user-images.githubusercontent.com/17347501/206272374-99dfc92d-6aed-4eff-8a40-c8616a31c7a4.png">

  - place that token under the OAuthToken env variable
- Go to the Slash commands tab and create three commands: /g, and /settings. Set the description for each to whatever is wanted
- Click on Socket Mode and enable the slider next to "Enable Socket Mode"
- Go to the Install App tab and click "Reinstall to Workspace" to add the bot to the workspace
- Finally, go into the channel where you want the bot to function and enter /invite @Your-App-Name.

*NOTE* - If the bot isn't hosted, you need to run it locally using the commands below for the bot to respond.

### Local Setup
- yarn
- `ts-node index.ts`

### Commands

- /settings - sets when rooms are generated
- /g - generates a line from [langa](https://langa.me/)
