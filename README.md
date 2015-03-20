#Install The Dependencies

```
npm install

bower install

sudo NODE_ENV=development gulp

open https://localhost/
```

#How To Drive
- Enter your full name and gravatar email address and hit "Join Interview".


- Click "Get Started" to start using the Whiteboard function. You can draw on the whiteboard. When you do, the group will recieve your drawings in real-time.


- Click "Logout" to logout of the app.


- Click the "Toggle" button to toggle the drawing whiteboard and video whiteboard.


- Hover over the video to show the video controls where you can "Mute Audio" or "Mute Video" or "Stop Video".


- Checkout server.js to see how Brokered Authentication is implemented for producton apps.


- Type a message and hit [enter] or click [send] to send the message. Do this from a second instance of the app and you can start an "Audio Call", "Video Call" or "Screen Sharing" session with the group member you selected. NOTE: Screensharing requires https and our open source [chrome extension](https://github.com/respoke/respoke-chrome-extension). Download the extension and add "https://localhost" to permissions and content_scripts#matches. Then [Load unpacked extension] at chrome://extensions/.


- To see DirectConnection, click on the padlock to create a DirectConnection. Once connected, any messages you send will be to that user only instead of the entire group.


- To see Group Discovery, open two tabs of the app and login as different users. Both users will show up for each other (or as many users that join the group really).


- To see Presence, click on one of the logged in users to set their presence to away. Everyone in the group will see the presence updates.


- To call your Asterisk server, click on the Asterisk (*) symbol to the left. Click the Asterisk (*) symbol again to hangup.


- To call a cell phone, voip phone or landline on the PSTN, click the Boxes symbol to the left of the Asterisk (*) symbol. An input box will popup. Enter a phone number in the following format +15555555555 and hit enter. You will start to hear a ring in your app, then the phone you called will start to ring as well.


#Running The Test Suite

Make sure your server is running:

```
sudo NODE_ENV=development gulp
```

Then run your tests:
```
gulp tests
```


#Deploying To Heroku
```
heroku create the-interview

heroku config:set NODE_ENV=production

git push heroku master

heroku ps:scale web=1

heroku open
```