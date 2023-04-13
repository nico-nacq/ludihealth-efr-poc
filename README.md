# Ludi'Health EFR game : SAXONAUTE (Proof of concept)

A two days project made during LudiHealth first edition. This is a proof of concept for a video game that would encourage patients with respiratory difficulties to perform exercises and controls in a playful way. The main feature is that the game is controlled by a device that captures the breath of the player.


## Screenshots

## Getting started

The project is devided in three parts : 

## Server : Getting raw input data from the device and send it to the app

The device is plugged to a python server that will get device raw input data and send it over the network through websockets.

### Prerequisites

* Python 3.6
* Adequate flow-meter hardware pluged on USB and running

### Installing

 * Clone this repo on the computer where the flow-meter device is plugged-in.
```sh
# In any virtual environment
python3 -m pip install pyserial websockets asyncio
```
 * Edit server IP in `./server/server.py:8`
 * Then simply run ```python3 ./server/server.py```


## Game WebApp : Getting device info from the server and use it for the game


The app is a simple HTML/JS/CSS web app that uses websockets to get input raw data from the device and make a character moves with this input. 

As a fallback or test purpose only, the mouse can be used to emulate the flow-meter input.


### Prerequisites

* An access to Internet in order to load `npm/chart.js`
* A modern browser

### Installing and run

 * Clone this repo 
 * Edit server IP in `./app/script.js:1`
 * Open in a browser `./app/index.html`

### Features
 
 - **Move the charater** : You can breath in to make the character move up, breath out to make them go down.
 - **Adaptive music** : The music adapts depending on the way you breath (in or out).
 - **Test mode** : You can wait for the app to detect the websocket server, or you can run in test mode (mouse Y position on screen will be used to fake the device input)
 - **Run an exercice** : You can run an exercice by pressing `1`, `2` or `3` on your keyboard. It will display dots that the user should follow by using the device.
 - **Record and play an exercice** : You can record the actual *breathing path* of the character by pressing `r` key, and you can play the path by pressing `enter`. Dots will be displayed to encourage the user to breath the same way as it was recorded.
 - **Analytics** : The breathing frequency, breathing length are calculated in realtime and displayed in the bottom left box. A chart displays input in realtime.

## Backoffice draft

The backoffice aimed to demonstrate how the game could be personalized for the patient by a doctor by ajusting some variables. This is just empty shell for demonstration purpose only.

### Installing and run


Clone this repo and open in a browser `./backoffice/settings.html`

## Contributing

Report an issue or make a pull request. We would appreciate ! If you do something with this project, feel free to contact us. We may add your project in the related projects section.


## License

This source code is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Artwork: CC-BY @Luc Fouillard

Music: CC-BY @Guillaume Cottez 


## Contributors

- Nicolas Nacq (for the app)
- Geoffroy Bailly (for the python server and the backoffice concept)
- Luc Fouillard (Artworks)
- Guillaume Cottez (Music)

## Related projects

 - breathinggames.net