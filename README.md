# pixiv-sync
Sync your pictures with your Pixiv account, along with an improved image viewer.

## Features
### Sync
- Removes unliked posts
- Downloads new posts
- Translates tags from japanese to english
- Checks for image corruption
- Creates data of all liked posts
- Creates image size data
- Support for private and non-private posts
### Viewer
- Uses data from sync to display images in a grid-like format
- Improved tag system
- Supports viewing private and non-private posts
- Ability to quickly re-sync images and data while changing config parameters
- Efficiently and quickly show all images without any need for pagination

## Setup
NPM will be used as the package manager, adapt the commands for your package manager if you use something else.
- Run `npm i`
- `cd` into `src/viewer` and run `npm i`manager
- Create `config.json`\
Use `config.example.json` as a base and fill out `userId` and `pictureDirectory`. Change any other configs if you want
- Create `.env`\
Use .example.env as a base and fill out `PIXIV_TOKEN`
- If you want to build the website: Build it and run `npm run start`
- Else if you want to run in dev mode, `cd` into src/viewer and run `npm run start`, then in another terminal run `npm run start`

### How to get your `userId`
Go to [Pixiv](https://pixiv.net) and click your profile button\
![Profile Button](https://cdn.discordapp.com/attachments/812499252642054184/1052593278761050152/image.png)\
Next, click the Bookmarks button\
![Bookmarks Button](https://cdn.discordapp.com/attachments/812499252642054184/1052593933772935238/image.png)
And finally get your User ID from the URL
![URL](https://cdn.discordapp.com/attachments/812499252642054184/1052594290087444581/image.png)

### How to format your `pictureDirectory`
In this example, the root pictures folder will be ~/Pictures/art\
You need to make folders called `images` and `private`, and then `deleted`\
inside both of those folders\

#### All folders:
- ~/Pictures/art/images
- ~/Pictures/art/images/deleted
- ~/Pictures/art/private
- ~/Pictures/art/private/deleted

### How to get your `PIXIV_TOKEN`
Go to [Pixiv](https://pixiv.net) and open Inspect Element (`CTRL + Shift + I` on most browsers) and go to the `Network` Tab
![Network Tab](https://cdn.discordapp.com/attachments/812499252642054184/1052605331454308432/image.png)\
Next on the first request to `pixiv.net` (Reload if you have to)
![Request](https://cdn.discordapp.com/attachments/812499252642054184/1052605978496991242/image.png)\
And then go to the `Cookies` tab and find PHPSESSID
![Cookies Tab](https://cdn.discordapp.com/attachments/812499252642054184/1052607832073183313/image.png)\
Finally, click the PHPSESSID value and copy everything after the _!

## Building
- `cd` into `src/viewer` and run `yarn build`