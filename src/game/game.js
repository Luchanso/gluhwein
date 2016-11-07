class Game extends Phaser.State {
  constructor() {
    super()
  }

  init() {

  }

  preload() {
    window.myText = this.game.add.text(this.game.width / 2, 250, 'Foxy Foxy Foxy', {
      font: "45px Open Sans",
      fill: "#26d98e"
    })
    myText.anchor.setTo(0.5, 0.5)
    this.createAudio()
    this.createContext()
    this.load.image('paw', '/assets/img/paw.png')
  }

  create() {
    this.createGraphics()
    document.body.appendChild(audio)
    audio.play()
  }

  update() {

  }

  render() {

  }

  createGraphics() {
    window.g = this.add.graphics(this.game.width / 2, this.game.height / 2)
    window.line = this.add.graphics(0, 0)

    this.reDraw()

    let t = new Phaser.Sprite(this.game, 0, 0, "paw")
    t.width = 100
    t.height = 100
    t.tint = 0
    t.anchor.setTo(0.5, 0.5)
    g.addChild(t)
  }

  createContext() {
    window.myCtx = new AudioContext()
    window.myNode = myCtx.createScriptProcessor(2048, 1, 1)
    window.analyser = myCtx.createAnalyser()

    analyser.smoothingTimeConstant = 0.5
    analyser.fftSize = 128 * 2

    window.bands = new Uint8Array(analyser.frequencyBinCount)

    audio.addEventListener('canplay', () => {
      let source = myCtx.createMediaElementSource(audio)

      source.connect(analyser)
      analyser.connect(myNode)

      myNode.connect(myCtx.destination)
      source.connect(myCtx.destination)

      myNode.onaudioprocess = () => {
        analyser.getByteFrequencyData(bands)

        let sum = bands.reduce((sum, item) => {
          return sum + item
        })

        let useful = bands.filter(item => {
          return item > 0
        }).length

        let avg =  sum / bands.length
        let med = this.median(bands)
        let len = bands.length
        let max = len * 255

        this.game.debug.text("Bands Sum: " + sum, 15, 70)
        this.game.debug.text("Bands Avg: " + avg, 15, 90)
        this.game.debug.text("Bands Median: " + med, 15, 110)
        this.game.debug.text("Bands Useful: " + useful, 15, 130)
        this.game.debug.text("Bands Length: " + len, 15, 150)
        this.game.debug.text("Bands Max: " + max, 15, 170)

        myText.alpha = g.alpha = avg / 128 > 1 ? 1 : avg / 128
        g.width = 100 * avg / 128
        g.height = 100 * avg / 128
        g.rotation = Math.PI / 2 * med / 128

        this.reDraw(bands)
      }
    })
  }

  createAudio() {
    window.audio = new Audio()
    audio.controls = true
    audio.src = '/assets/audio/test.mp3'
  }

  reDraw(bands) {
    g.clear()
    g.beginFill(0x26d98e)
    g.drawRect(-50, -50, 100, 100)

    if (bands) {
      line.clear()
      line.lineStyle(1, 0x26d98e)
      line.moveTo(0, this.game.height / 2)

      bands.forEach((item, i) => {
        line.lineTo(this.game.width / 128 * i, (this.game.height) / 255 * (255 - item))
        // line.lineTo(this.game.width / 128 * i, (this.game.height / 2) / 255 * (item))
      })
    }


  }

  median(values) {
    values.sort((a, b) => {
      return a - b
    })

    let half = Math.floor(values.length / 2)

    if (values.length % 2) return values[half]
    else                   return (values[half - 1] + values[half]) / 2.0
  }
}
