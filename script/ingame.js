'use strict';

/* *****************************************************************************
 * Only One Decision - A simple game about finding a friend.
 * Author: Esa Koskinen (mmKALLL)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2019 Esa Koskinen
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * *****************************************************************************/



(function () {

  /* CONSTANTS AND SETUP */
  var CONSOLE_DEBUG = true
  var IMAGE_PATH = 'img/'
  var SOUND_PATH = 'sound/'
  var MUSIC_PATH = 'music/'
  const SEMAPHORE_X_MONO = 2730
  const SEMAPHORE_X_COLOR = 2435

  const FPS = 60
  const DEFAULT_MOVE_SPEED = 0.96
  var MOVE_SPEED = DEFAULT_MOVE_SPEED

  const keysHeld = {}
  document.body.onkeydown = (event) => { keysHeld[event.key] = true }
  document.body.onpointerdown = (event) => { event.preventDefault(); keysHeld['pointer'] = true }
  document.body.onkeyup = (event) => keysHeld[event.key] = false
  document.body.onpointerup = (event) => { event.preventDefault(); keysHeld['pointer'] = false }
  // document.body.onpointerout = (event) => { event.preventDefault(); keysHeld['pointer'] = false }

  document.body.addEventListener('keydown', () => {
    playMusic(musics.TRACK1)
    musics.TRACK1.donotplay = true
  }, { once: true })

  document.body.addEventListener('pointerdown', () => {
    playMusic(musics.TRACK1)
    musics.TRACK1.donotplay = true
  }, { once: true })

  var gameStatus = {
    ready: false,
    get isReady() { return this.ready },
    gameFrame: 0,
    sfxVolume: 0.5,
    musicVolume: 0.5,
  }

  var canvas = document.getElementById('gameCanvas')
  var ctx = canvas.getContext('2d')
  var images = {}
  var sounds = {}
  var musics = {}

  initializeGame() // Starts the game at the title screen.



  // GAME LOOP //

  function update() {
    console.log(gameStatus.distance)
    gameStatus.gameFrame += 1
    if (gameStatus.state == 'ingame') {
      handleKeys()

      // Hidden ending
      if (gameStatus.distance < -800) {
        document.getElementById('gameDiv').innerHTML = 'Thank you for playing.<br><br>By Chika, Esa, and Jouni'
        gameStatus.state = 'arstarstrs'
        if (musics.TRACK6.playing === false) {
          playMusic(musics.TRACK6)
        }
      }

      if (gameStatus.distance >= 7160 && gameStatus.direction === 'right') {
        turnAround()
      }

      if (gameStatus.distance >= 4560 && gameStatus.direction === 'right' && musics.TRACK1.playing === true) {
        fadeMusic(musics.TRACK1)
        playMusic(musics.TRACK4)
        MOVE_SPEED = 0.83
      }

      if (gameStatus.distance >= 4560 && gameStatus.direction === 'right' && musics.TRACK10.playing === true) {
        fadeMusic(musics.TRACK10)
        playMusic(musics.TRACK11)
        MOVE_SPEED = 0.65
      }


      if (gameStatus.distance >= 6300 && gameStatus.direction === 'right') {
        MOVE_SPEED = 0.6
      }

      if (gameStatus.distance >= 6800 && gameStatus.direction === 'right') {
        MOVE_SPEED = 0.49
      }

      // victory
      if (gameStatus.distance <= 180 && gameStatus.direction === 'left' && !musics.TRACK6.playing) {
        fadeMusic(musics.TRACK8)
        fadeMusic(musics.TRACK9)
        fadeMusic(musics.TRACK10)
        playMusic(musics.TRACK6)

        keysHeld[' '] = false
        keysHeld['pointer'] = false
      }

      // wait for traffic light
      if (gameStatus.semaphoreStartTime === undefined && gameStatus.direction === 'left' && gameStatus.distance < 2800 && !gameStatus.carActive) {
        gameStatus.semaphoreStartTime = Date.now()
      }

      if (Date.now() - gameStatus.semaphoreStartTime > 15000) {
        gameStatus.semaphoreGreen = true
      }

      // bad ending
      if (!gameStatus.semaphoreGreen === true && gameStatus.direction === 'left' && gameStatus.distance < 2250 && gameStatus.carActive === undefined) {
        getHitByCar()
      }

      if (gameStatus.carActive === true) {
        gameStatus.carSize += 18
        images.car.width = gameStatus.carSize * 1.6
        images.car.height = gameStatus.carSize * 0.9

        // Car finished
        if (gameStatus.carSize > 500) {
          gameStatus.carActive = false
          gameStatus.direction = 'right'
          gameStatus.semaphoreStartTime === undefined
          gameStatus.distance = 1080
          gameStatus.loops += 1

          fadeMusic(musics.TRACK8)
          fadeMusic(musics.TRACK9)
          playMusic(musics.TRACK10)
          playSound('vanquish')
          flashScreen('#FF2020', 0.01)

          setTimeout(() => {
            gameStatus.state = 'ingame'
            ctx.restore()
            canvas.width = 200
            MOVE_SPEED = 0.75
          }, 1466) // 90 frames
        }
      }
    }
  }

  function handleKeys() {
    if (keysHeld['u'] === true) {
      MOVE_SPEED = 10 // for debug purposes
    }

    if (keysHeld['ArrowRight'] === true && gameStatus.direction === 'right') {
      gameStatus.distance += MOVE_SPEED
    }

    if (keysHeld['ArrowLeft'] === true && gameStatus.direction === 'left' && gameStatus.distance > 180) {
      gameStatus.distance -= MOVE_SPEED
    }

    if (keysHeld['pointer'] === true || keysHeld[' '] === true) {
      gameStatus.distance += gameStatus.direction === 'right' ? MOVE_SPEED : 0 - MOVE_SPEED
    }
  }

  function getHitByCar() {
    gameStatus.carActive = true
    gameStatus.carSize = 0
    gameStatus.loops += 1
    sounds['crash1'].play()
  }

  function turnAround() {
    gameStatus.direction = 'left'
    gameStatus.distance = 6837
    MOVE_SPEED = DEFAULT_MOVE_SPEED + 0.07
    keysHeld.ArrowRight = false
    keysHeld.pointer = false
    fadeMusic(musics.TRACK1)
    fadeMusic(musics.TRACK4)
    fadeMusic(musics.TRACK10)
    if (musics.TRACK11.playing === true) {
      fadeMusic(musics.TRACK11)
      window.setTimeout(() => playMusic(musics.TRACK9), 7500)
    } else {
      window.setTimeout(() => playMusic(musics.TRACK8), 6000)
    }

    playSound('vanquish')
    flashScreen('#FFFFFF', 0.03)

    canvas.width = 800
  }



  // DRAWING //

  function draw() {
    if (gameStatus.state === 'ingame') {
      drawIngame()
    } else if (gameStatus.state === 'mainmenu') {
      drawMainMenu()
    } else if (gameStatus.state === 'screen-flash') {
      flashScreen(gameStatus.flashColor, gameStatus.flashDelta)
    }
  }

  function drawMainMenu() {
    drawBackground()
    drawTitle()
  }

  // MAXIMUM DELTA SHOULD BE 0.04 -> 25 frames
  function flashScreen(colorString, delta) {
    console.log(gameStatus.state, ctx.globalAlpha)
    if (ctx.globalAlpha == 1) {
      ctx.save()
      ctx.globalAlpha = 0.01
      gameStatus.state = 'screen-flash'
      gameStatus.flashColor = colorString
      gameStatus.flashDelta = delta
    }
    if (ctx.globalAlpha < 0.95) {
      ctx.globalAlpha += delta
    }
    if (ctx.globalAlpha > 0.95) {
      gameStatus.state = 'ingame'
      ctx.restore()
    }
    ctx.beginPath()
    ctx.rect(0, 0, 1500, 1500)
    ctx.fillStyle = colorString
    ctx.fill()
    ctx.closePath()
  }

  function drawBackground() {
    // background
    ctx.beginPath()
    ctx.rect(0, 0, 2000, 2000)
    ctx.fillStyle = '#000000'
    ctx.fill()
    ctx.closePath()


    if (gameStatus.direction === 'right') {
      ctx.drawImage(images['BG_mono'], 0 - gameStatus.distance, 50)
      ctx.drawImage(images['semaphore_red_mono2'], SEMAPHORE_X_MONO - gameStatus.distance, 80)
    } else {
      ctx.drawImage(images['BG_color'], 0 - gameStatus.distance, 50)
      if (gameStatus.semaphoreGreen === true) {
        ctx.drawImage(images['semaphore_blue_color'], SEMAPHORE_X_COLOR - gameStatus.distance, 80)
      } else {
        ctx.drawImage(images['semaphore_red_color'], SEMAPHORE_X_COLOR - gameStatus.distance, 80)
      }
    }
  }

  // Helper function for drawing things rotated by some amount of degrees
  function drawRotated(img, x, y, degrees, dx, dy) {
    if (!dx || !dy) {
      dx = 0
      dy = 0
    }
    ctx.translate(x, y)
    ctx.rotate(-(degrees)/360 * 2 * Math.PI)
    ctx.drawImage(img, dx, dy)
    ctx.rotate(degrees/360 * 2 * Math.PI)
    ctx.translate(-x, -y)
  }

  function drawIngame() {

    // background & semaphore
    drawBackground()

    // drawCar
    if (gameStatus.carActive === true) {
      ctx.drawImage(images['car'], canvas.width / 2 - gameStatus.carSize * 0.6, 100, gameStatus.carSize * 1.5, gameStatus.carSize)
    }
  }


  // HELPER FUNCTIONS //

  // Returns true if adding to images object was a success, false otherwise.
  function loadImage(filename) {
    if (!images[filename.slice(0, -4)]) {
      var img = new Image()
      img.ready = false
      img.onload = function () { img.ready = true }
      img.src = IMAGE_PATH + filename
      images[filename.slice(0, -4)] = img
      return true
    } else {
      return false
    }
  }

  // Returns true if adding to sounds object was a success, false otherwise.
  function loadSound(filename) {
    if (!sounds[filename.slice(0, -4)]) {
      var sound = new Audio(SOUND_PATH + filename)
      sound.ready = false
      sound.addEventListener('canplaythrough', function () { sound.ready = true })
      sound.volume = gameStatus.sfxVolume
      sounds[filename.slice(0, -4)] = sound
      return true
    } else {
      return false
    }
  }

  // Returns true if adding to musics object was a success, false otherwise.
  function loadMusic(filename) {
    if (!musics[filename.slice(0, -4)]) {
      var track = new Audio(MUSIC_PATH + filename)
      track.ready = false
      track.playing = false
      track.addEventListener('canplaythrough', function () { track.ready = true })
      track.loop = true
      track.volume = gameStatus.musicVolume
      musics[filename.slice(0, -4)] = track
      return true
    } else {
      return false
    }
  }

  function changeSfxVolume(newVolume) {
    gameStatus.sfxVolume = newVolume
    for (key in sounds) {
      sounds[key].volume = newVolume
    }
  }

  function fadeMusic(track) {
    if (track.playing === true) {
      const intervalID = window.setInterval(() => {
        if (track.volume > 0) {
          track.volume = Math.max(0, track.volume - 0.004)
        } else {
          track.playing = false
          track.pause()
          track.currentTime = 0
          track.volume = gameStatus.musicVolume
          window.clearInterval(intervalID)
        }
      }, 50)
    }
  }

  function playMusic(track) {
    if (!track.playing && track.donotplay !== true) {
      console.log('play ' + track)
      track.playing = true
      setTimeout(() => {
        track.play()
      }, 1200)
    }
  }

  function playSound(sound) {
    sounds[sound].play()
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
    loadImage('BG_mono.jpg')
    loadImage('BG_color.jpg')
    loadImage('semaphore_red_mono2.png')
    loadImage('semaphore_red_color.png')
    loadImage('semaphore_blue_mono.png')
    loadImage('semaphore_blue_color.png')
    loadImage('car.png')

    loadSound('vanquish.wav')
    loadSound('burned.wav')
    loadSound('crash1.wav')
    sounds.crash1.addEventListener('ended', () => {
      sounds.burned.play()
    })

    loadMusic('TRACK1.mp3')
    loadMusic('TRACK4.mp3')
    loadMusic('TRACK6.mp3')
    loadMusic('TRACK8.mp3')
    loadMusic('TRACK9.mp3')
    loadMusic('TRACK10.mp3')
    loadMusic('TRACK11.mp3')

    musics.TRACK6.loop = false
  }

  function checkAssets() {
    var key
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
    for (key in musics) {
      if (!musics[key].ready) {
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
      sfxVolume: 0.5,
      musicVolume: 0.5,
      distance: 2430,
      direction: 'right',
      loops: 0,
    }

    gameStatus.state = 'ingame'
  }


})()
