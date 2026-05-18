# **Title: MIDA-Mega-Tool: A Destiny 2 Gear Customization System**
## Project - Sean Liu
## Description: 
My application was built to help users create their favorite gear customization rolls seemlessly. The website I used for gear customization was recently brought offline and I think it would be a great service towards the community to provide a fan-made tool to help others easily create weapon combinations. My goal is to provide the community with a resource to promote the game and make the game systems easier to understand for new players.

### Target Audience
The target audience I'm aiming for is for other Destiny 2 players to see what I was able to accomplish in web developemnt and show them how it isn't as hard as it seems to navigate the Bungie.net API and manifest API. This should hopefully motivate new gamers to create a public facing webapp for games that share the characteristic of an public API and build experimental community tools for others to use.

## Dev & User Manual

### Prerequisites:

Install locally:

- Node.js 20
  
```
npm install

npm run dev
```

External accounts/services you need:

- a Bungie API key: Register [here](https://www.bungie.net/en/Application)
- a Supabase project
- optional: a Vercel project if you want to deploy

## Environment Variables

In your env file, this is required for local development:

```env
BUNGIE_API_KEY=your_bungie_api_key
NEXT_PUBLIC_BUNGIE_API_KEY=your_bungie_api_key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```
  
## For the Devs...
#### _Supabase Connection_
The project uses Supabase for many of the text fields and other non-image items so that it can properly store popular weapons as part of a trending weapons list on the home front page. This uses a GET request to do so. When a player accesses a weapon page, there is a POST request sent that will update the name of an item with an increment of +1 to the amount of views the weapon has recieved, that list will then be shown to visitors on the front page descending in views. 

#### _APIs Used_

While Supabase was used for tracking weapon popularity, the [Bungie Manifest API](https://destinydevs.github.io/BungieNetPlatform/docs/Manifest) and [Bungie.net API](https://bungie-net.github.io/) were used for weapon images and rolls. An [API](https://cdn.jsdelivr.net/gh/altbdoor/d2-api-human@data) by [altbdoor](https://github.com/altbdoor) on GitHub was used as well to match weapons with their respective perk pools correctly.

_GET Requests_: Used during fetching weapon popularity, used for all images of icons, weapon models, and weapon perk selections directly from the Bungie API manifest. Also used to query for weapon names in the manifest and the has the weapon name was associated with.

_Post Requests_: Used to update the view count in Supabase.

### _Future Work_
The current problem of the GET requests for the weapons is that each time you send a GET HTTP request, you have to drag all the image links and stat values directly from the API manifest and that can take upwards of 20 seconds from each weapon. The next major step is to take all weapons, approximately 300 MB of code, and upload it as a large SQL database to Supabase.

[Vercel Link](https://mida-mega-tool-next.vercel.app)
  
