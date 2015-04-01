#Install The Dependencies

```
npm install

bower install

sudo NODE_ENV=development APP_ID=YOUR_APP_ID APP_SECRET=YOUR_APP_SECRET ROLE_ID=YOUR_ROLE_ID gulp

open https://localhost/
```

Do not put quotes around YOUR_APP_ID, YOUR_APP_SECRET or YOUR_ROLE_ID. Signup for a [Respoke account](https://portal.respoke.io/#/signup) to create your credentials in less than 10 seconds.

#How To Drive "The Interview Room"

##Join
1) Enter your full name and gravatar email address and hit "Join Interview":

![Join](http://i.imgur.com/PoJYMMU.png)


##Whiteboard
2) Click "Get Started" to start using the Whiteboard function. You can draw on the whiteboard. When you do, the group will recieve your drawings in real-time:

![Whiteboard](http://i.imgur.com/AX169KX.png)


##Logout
3) Click "Logout" to logout of the app:

![Logout](http://i.imgur.com/eFpBWHR.png)


##Toggle Video and Whiteboard
4) Click the "Toggle" button to toggle the drawing whiteboard and video whiteboard:

![Toggle](http://i.imgur.com/gGuAjfg.png)


##Video Controls
5) Hover over the video to show the video controls where you can "Mute Audio" or "Mute Video" or "Stop Video":

![Video Controls](http://i.imgur.com/hQqf6XA.png)


##Brokered Authentication
6) Checkout server.js to see how Brokered Authentication is implemented for producton apps:

![Authentication](http://i.imgur.com/fZHpnPz.png)


##Messages
7) Type a message and hit [enter] or click [send] to send the message:

![Send Message](http://i.imgur.com/kb2vt70.png)

![Chat Message](http://i.imgur.com/85Ps9YC.png)

Do this from a second instance of the app and you can start an "Audio Call", "Video Call" or "Screen Sharing" session with the group member you selected:

![Conversation](http://i.imgur.com/Mz8gAa8.png)

NOTE: Screensharing requires https and our open source [chrome extension](https://github.com/respoke/respoke-chrome-extension). Download the extension and add "https://localhost" to permissions and content_scripts#matches. Then [Load unpacked extension] at chrome://extensions/.


##DirectConnection
8) To see DirectConnection, click on the padlock to create a DirectConnection. Once connected, any messages you send will be to that user only instead of the entire group.

![DirectConnection](http://i.imgur.com/2Q0VdcQ.png)


##Group Discovery
9) To see Group Discovery, open two tabs of the app and login as different users. Both users will show up for each other (or as many users that join the group really):

![GroupDiscovery](http://i.imgur.com/zs5oybS.png)


##Presence
10) To see Presence, click on one of the logged in users to set their presence to away. Everyone in the group will see the presence updates:

![Presence](http://i.imgur.com/dt73vYm.png)


##Asterisk Integration
11) To call your Asterisk server, click on the Asterisk (*) symbol to the left. Click the Asterisk (*) symbol again to hangup:

![Asterisk](http://i.imgur.com/xew8mAc.png)


##Call Cell Phones and Landlines
12) To call a cell phone, voip phone or landline on the PSTN, click the Boxes symbol to the left of the Asterisk (*) symbol. An input box will popup. Enter a phone number in the following format +15555555555 and hit enter. You will start to hear a ring in your app, then the phone you called will start to ring as well.

![PSTN](http://i.imgur.com/ZEdfwv4.png)


#Running The Test Suite

Make sure your server is running:

```
sudo NODE_ENV=development APP_ID=YOUR_APP_ID APP_SECRET=YOUR_APP_SECRET ROLE_ID=YOUR_ROLE_ID gulp
```

Do not put quotes around YOUR_APP_ID, YOUR_APP_SECRET or YOUR_ROLE_ID.

Then run your tests:
```
gulp tests
```


#Deploying To Heroku
```
heroku create the-interview

heroku config:set NODE_ENV=production

heroku config:set APP_ID=YOUR_APP_ID

heroku config:set APP_SECRET=YOUR_APP_SECRET

heroku config:set ROLE_ID=YOUR_ROLE_ID

git push heroku master

heroku ps:scale web=1

heroku open
```