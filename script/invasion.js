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
  document.body.onkeydown = (event) => keysHeld[event.key] = true
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

  startGame(); // Starts the game at the title screen.



  // GAME LOOP //

  function update() {
    gameStatus.gameFrame += 1;
    if (gameStatus.state == "ingame") {
      handleKeys();

      if (gameStatus.distance >= 900) {
        gameStatus.direction = 'left'
      }
    }
  }

  function handleKeys() {
    if (keysHeld['ArrowRight'] === true && gameStatus.direction === 'right') {
      gameStatus.distance += MOVE_SPEED
    }

    if (keysHeld['ArrowLeft'] === true && gameStatus.direction === 'left') {
      gameStatus.distance -= MOVE_SPEED
    }

    if (keysHeld[' '] === true) {
      MOVE_SPEED = 10
    }
  }



  // DRAWING //

  function draw() {
    if (gameStatus.state === "ingame") {
      drawIngame();
    } else if (gameStatus.state === "mainmenu") {
      drawMainMenu();
    } else if (gameStatus.state === "paused") {
      drawPauseScreen();
    } else if (gameStatus.state === "gameover") {
      drawGameOver();
    }
  }

  function drawMainMenu() {
    drawBackground();
    drawTitle();
  }

  function drawPauseScreen() {
    // TODO
  }

  function drawGameOver() {
    if (ctx.globalAlpha == 1) {
      ctx.save();
      ctx.globalAlpha = 0.01;
    }
    if (ctx.globalAlpha < 0.98) {
      ctx.globalAlpha += 0.01;
    }
    ctx.beginPath();
    ctx.rect(0, 0, 2000, 2000);
    ctx.fillStyle = "#FF0C0C";
    ctx.fill();
    ctx.closePath();
  }

  function drawTitle() {
    ctx.drawImage(images.titleimage, canvas.width / 2 - images.titleimage.width / 2, 100);
    ctx.drawImage(images.playbutton, canvas.width / 2 - images.playbutton.width / 2, 500);
  }

  function drawBackground() {
    // background
    ctx.beginPath();
    ctx.rect(0, 0, 2000, 2000);
    ctx.fillStyle = "#000000";
    ctx.fill();
    ctx.closePath();

    // drawRotated(images.space_big, 325, 325, gameStatus.gameFrame * BG_SPIN_SPEED, -675, -675);
    ctx.drawImage(images[41], 0 - gameStatus.distance, 200);
  }

  function drawPlayer() {
    // animated blob_s
    // if (gameStatus.gameFrame % 60 < 30) {
    //   ctx.drawImage(images.blob_s1, 650 / 2 - images.blob_s1.width / 2, 650 / 2 - 65 - images.blob_s1.height / 2);
    // } else {
    //   ctx.drawImage(images.blob_s2, 650 / 2 - images.blob_s2.width / 2, 650 / 2 - 65 - images.blob_s2.height / 2);
    // }
  }

  function drawParticles() {
    var i;
    for (i = 0; i < activeShots.length; i += 1) {
      //console.log(activeShots[i].targetY, activeShots[i].targetX);
      ctx.save();
      if (activeShots[i].animationStyle === "fade") {
        ctx.globalAlpha = 1 - (activeShots[i].activeSince * 1.0 / activeShots[i].visibleUntil);
      }
      var angle = Math.atan2(activeShots[i].originY - activeShots[i].targetY, activeShots[i].targetX - activeShots[i].originX);
      drawRotated(activeShots[i].image,
          activeShots[i].originX - (13 * Math.sin(angle)),
          activeShots[i].originY - (13 * Math.cos(angle)),
          360*angle/(2*Math.PI),
          0, 0);
      ctx.restore();
    }
  }

  // Helper function for drawing things rotated by some amount of degrees
  function drawRotated(img, x, y, degrees, dx, dy) {
    if (!dx || !dy) {
      dx = 0; dy = 0;
    }
    ctx.translate(x, y);
    ctx.rotate(-(degrees)/360 * 2 * Math.PI);
    ctx.drawImage(img, dx, dy);
    ctx.rotate(degrees/360 * 2 * Math.PI);
    ctx.translate(-x, -y);
  }

  function drawIngame() {

    // background
    drawBackground();

    // objects (characters, enemies, etc)
    // drawPlayer();

    // foreground (particle effects, etc)
    // drawParticles();
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
  function loadSound(filename, loop) {
    if (!sounds[filename.slice(0, -4)]) {
      var snd = new Audio(SOUND_PATH + filename);
      snd.ready = false;
      snd.addEventListener("canplaythrough", function () { snd.ready = true; });
      snd.volume = gameStatus.sfxVolume;
      sounds[filename.slice(0, -4)] = snd;
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

  // GAME START HANDLER //

  function startGame() {
    // First some preparations:

    // Load assets
    loadImage("41.jpg");
    loadImage("42.jpg");

    loadSound("lasershot6.wav");

    loadSound("TRACK1.mp3");
    sounds.TRACK1.volume = gameStatus.musicVolume;
    sounds.TRACK1.addEventListener("ended", function () {
      this.currentTime = 0;
      this.play();
    });
    sounds.TRACK1.play();

    function checkAssets() {
      if (gameStatus.ready) {
        var key;
        for (key in images) {
          if (!images[key].ready) {
            return 0;
          }
        }
        for (key in sounds) {
          if (!sounds[key].ready) {
            return 0;
          }
        }

        window.setInterval(function() {
          update();
          draw();
        }, 1000/FPS);
        window.clearInterval(intervalID);
      }
    }

    // Set up the game logic
    resetStatus();
    gameStatus.ready = true;

    // Check that the assets are ready and launch the game
    var intervalID = window.setInterval(function () {
      checkAssets();
    }, 200);


  }

  function resetStatus() {
    ctx.restore()
    gameStatus = {
      ready: false,
      get isReady() { return this.ready },
      gameFrame: 0,
      sfxVolume: 0.4,
      musicVolume: 0.5,
      distance: 0,
      loops: 0,
      direction: 'right',
    }

    gameStatus.state = 'ingame'
  }


})()
