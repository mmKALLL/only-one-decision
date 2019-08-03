"use strict";

/* *****************************************************************************
 * Invasion - A game about defending your planet and escaping solitude.
 * Author: Esa Koskinen (mmKALLL)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2017 Esa Koskinen
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * *****************************************************************************/



(function () {

  /* CONSTANTS AND SETUP */
  var CONSOLE_DEBUG = true;
  var IMAGE_PATH = "img/";
  var SOUND_PATH = "sound/";


  const FPS = 60;
  var MOVE_SPEED = 0.8
  const BG_SPIN_SPEED = 0.03;

  const keysHeld = {}
  document.body.onkeydown = (event) => { keysHeld[event.key] = true; enableMusic() }
  document.body.onkeyup = (event) => keysHeld[event.key] = false

  var gameStatus = {
    ready: false,
    get isReady() { return this.ready },
    gameFrame: 0,
    sfxVolume: 0.4,
    musicVolume: 0.5,
  };

  var canvas = document.getElementById("gameCanvas");
  var ctx = canvas.getContext("2d");
  var images = {};
  var sounds = {};

  initializeGame(); // Starts the game at the title screen.



  // GAME LOOP //

  function update() {
    gameStatus.gameFrame += 1;
    if (gameStatus.state == "ingame") {
      handleKeys();

      if (gameStatus.distance >= images[41].width - canvas.width) {
        gameStatus.direction = 'left'
        keysHeld.ArrowRight = false
      }

      if (gameStatus.direction === 'left' && gameStatus.distance < -300 && gameStatus.carActive === undefined) {
        getHitByCar()
      }

      if (gameStatus.carActive === true) {
        gameStatus.carSize += 15
        images.car.width = gameStatus.carSize * 1.5
        images.car.height = gameStatus.carSize
        if (gameStatus.carSize > canvas.height) {
          gameStatus.carActive = false
        }
      }
    }
  }

  function handleKeys() {
    if (keysHeld['ArrowRight'] === true && gameStatus.distance < images[41].width - canvas.width) {
      gameStatus.distance += MOVE_SPEED
    }

    if (keysHeld['ArrowLeft'] === true && gameStatus.distance > -1200) {
      gameStatus.distance -= MOVE_SPEED
    }

    if (keysHeld[' '] === true) {
      MOVE_SPEED = 10
    }
  }

  function getHitByCar() {
    gameStatus.carActive = true
    gameStatus.carSize = 0
    sounds['car-crash'].play()
  }



  // DRAWING //

  function draw() {
    if (gameStatus.state === "ingame") {
      drawIngame()
    } else if (gameStatus.state === "mainmenu") {
      drawMainMenu()
    } else if (gameStatus.state === "gameover") {
      drawGameOver()
    }
  }

  function drawMainMenu() {
    drawBackground()
    drawTitle()
  }

  function drawGameOver() {
    if (ctx.globalAlpha == 1) {
      ctx.save();
      ctx.globalAlpha = 0.01
    }
    if (ctx.globalAlpha < 0.98) {
      ctx.globalAlpha += 0.01
    }
    ctx.beginPath()
    ctx.rect(0, 0, 2000, 2000)
    ctx.fillStyle = "#FF0C0C"
    ctx.fill()
    ctx.closePath()
  }

  function drawBackground() {
    // background
    ctx.beginPath()
    ctx.rect(0, 0, 2000, 2000)
    ctx.fillStyle = "#000000"
    ctx.fill()
    ctx.closePath()


    if (gameStatus.direction === 'right') {
      ctx.drawImage(images['41'], 0 - gameStatus.distance, 200)
    } else {
      ctx.drawImage(images['42'], 0 - gameStatus.distance, 200)
    }
  }

  // Helper function for drawing things rotated by some amount of degrees
  function drawRotated(img, x, y, degrees, dx, dy) {
    if (!dx || !dy) {
      dx = 0; dy = 0;
    }
    ctx.translate(x, y)
    ctx.rotate(-(degrees)/360 * 2 * Math.PI)
    ctx.drawImage(img, dx, dy)
    ctx.rotate(degrees/360 * 2 * Math.PI)
    ctx.translate(-x, -y)
  }

  function drawIngame() {

    // background
    drawBackground()

    if (gameStatus.carActive === true) {
      ctx.drawImage(images['car'], canvas.width / 2, 200)
    }
  }


  // HELPER FUNCTIONS //

  // Returns true if adding to images object was a success, false otherwise.
  function loadImage(filename) {
    if (!images[filename.slice(0, -4)]) {
      var img = new Image();
      img.ready = false;
      img.onload = function () { img.ready = true; };
      img.src = IMAGE_PATH + filename;
      images[filename.slice(0, -4)] = img;
      return true;
    } else {
      return false;
    }
  }

  // Returns true if adding to sounds object was a success, false otherwise.
  function loadSound(filename) {
    if (!sounds[filename.slice(0, -4)]) {
      var sound = new Audio(SOUND_PATH + filename);
      sound.ready = false;
      sound.addEventListener("canplaythrough", function () { sound.ready = true; });
      sound.volume = gameStatus.sfxVolume;
      sounds[filename.slice(0, -4)] = sound;
      return true;
    } else {
      return false;
    }
  }

  function changeSfxVolume(newVolume) {
    gameStatus.sfxVolume = newVolume;
    for (key in sounds) {
      sounds[key].volume = newVolume;
    }
  }

  function enableMusic() {
    if (!sounds.TRACK1.playing) {
      sounds.TRACK1.playing = true
      setTimeout(() => {
        sounds.TRACK1.play()
      }, 1200)
    }
  }

  // GAME START HANDLER //

  function initializeGame() {
    // First some preparations:
    loadAssets()

    // Check that the assets are ready and launch the game
    var intervalID = window.setInterval(function () {
      const assetsLoaded = checkAssets()
      if (assetsLoaded === true) {
        resetStatus()
        gameStatus.ready = true

        window.setInterval(function() {
          update()
          draw()
        }, 1000/FPS)
        window.clearInterval(intervalID)
      }
    }, 200)
  }

  function loadAssets() {
    // Load assets
    loadImage("41.jpg");
    loadImage("42.jpg");
    loadImage("car.jpg");

    loadSound("crash1.wav");
    sounds.crash1.addEventListener("ended", function () {
      sounds.burned.play();
    });
    loadSound("burned.wav");

    loadSound("TRACK1.mp3");
    sounds.TRACK1.volume = gameStatus.musicVolume;
    sounds.TRACK1.addEventListener("ended", function () {
      this.currentTime = 0;
      this.play();
    });

  }

  function checkAssets() {
    var key;
    for (key in images) {
      if (!images[key].ready) {
        return false
      }
    }
    for (key in sounds) {
      if (!sounds[key].ready) {
        return false
      }
    }
    return true
  }

  function resetStatus() {
    ctx.restore()
    gameStatus = {
      ready: false,
      get isReady() { return this.ready },
      gameFrame: 0,
      sfxVolume: 0.4,
      musicVolume: 0.5,
      distance: -200,
      loops: 0,
      direction: 'right',
    }

    gameStatus.state = 'ingame'
  }


})()
