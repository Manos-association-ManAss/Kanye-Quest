export default class mapa1 extends Phaser.Scene {
  constructor () {
    super('mapa1')
  }

  preload () {
    /* mapa */
    this.load.tilemapTiledJSON('mapa', '../assets/mapa/mapa.json')
    this.load.image('Tileset', '../assets/mapa/MapaTiles.png')

    /* personagem */
    this.load.spritesheet('YE', '../assets/YE.png', {
      frameWidth: 64,
      frameHeight: 64
    })
    this.load.spritesheet('tyler', '../assets/tyler.png', {
      frameWidth: 47,
      frameHeight: 64
    })
    this.load.spritesheet('YE-pulo', '../assets/YE-pulo.png', {
      frameWidth: 64,
      frameHeight: 64
    })
    this.load.spritesheet('tyler-pulo', '../assets/tyler-pulo.png', {
      frameWidth: 64,
      frameHeight: 64
    })
    this.load.spritesheet('tyler-poder', '../assets/projetilT.png', {
      frameWidth: 32,
      frameHeight: 32
    })
    this.load.spritesheet('ye-poder', '../assets/projetilY.png', {
      frameWidth: 32,
      frameHeight: 32
    })

    /* vilão */
    this.load.spritesheet('bike', '../assets/bike.png', {
      frameWidth: 64,
      frameHeight: 64
    })

    this.load.spritesheet('cudi', '../assets/cudi.png', {
      frameWidth: 64,
      frameHeight: 64
    })

    this.load.spritesheet('drake', '../assets/drake.png', {
      frameWidth: 64,
      frameHeight: 64
    })

    this.load.spritesheet('graduation', '../assets/graduation.png', {
      frameWidth: 64,
      frameHeight: 64
    })

    this.load.spritesheet('pau', '../assets/pau.png', {
      frameWidth: 64,
      frameHeight: 64
    })

    this.load.spritesheet('terra', '../assets/terra.png', {
      frameWidth: 64,
      frameHeight: 64
    })

    this.load.spritesheet('twitter', '../assets/twitter.png', {
      frameWidth: 64,
      frameHeight: 64
    })

    /* botões */
    this.load.spritesheet('direita', '../assets/direita.png', {
      frameWidth: 64,
      frameHeight: 64
    })
    this.load.spritesheet('esquerda', '../assets/esquerda.png', {
      frameWidth: 64,
      frameHeight: 64
    })
    this.load.spritesheet('cima', '../assets/cima.png', {
      frameWidth: 64,
      frameHeight: 64
    })
    this.load.spritesheet('poder', '../assets/poder.png', {
      frameWidth: 64,
      frameHeight: 64
    })

    this.load.audio('trilha', './assets/sons/allofthelights.mp3')
  }

  create () {
    this.trilha = this.sound.add('trilha')
    this.trilha.loop = true
    this.trilha.play()
    let poderTimer

    /* mapa */
    this.tilemapMapa = this.make.tilemap({
      key: 'mapa'
    })

    this.tilesetTile1 = this.tilemapMapa.addTilesetImage('Tileset')

    this.layerfundo = this.tilemapMapa.createLayer('fundo', [this.tilesetTile1])
    this.layeratras2 = this.tilemapMapa.createLayer('atras2', [this.tilesetTile1])
    this.layeratras = this.tilemapMapa.createLayer('atras', [this.tilesetTile1])
    this.layerblocos = this.tilemapMapa.createLayer('blocos', [this.tilesetTile1])
    this.layerfrente = this.tilemapMapa.createLayer('frente', [this.tilesetTile1])

    /* multiplayer */
    if (this.game.jogadores.primeiro === this.game.socket.id) {
      this.local = 'YE'
      this.remoto = 'tyler'
      this.personagem = this.physics.add.sprite(750, -280, this.local, 18)
      this.cameras.main.startFollow(this.personagem)
      this.personagemRemoto = this.add.sprite(750, -280, this.remoto, 18)
    } else if (this.game.jogadores.segundo === this.game.socket.id) {
      this.local = 'tyler'
      this.remoto = 'YE'
      this.personagemRemoto = this.add.sprite(-750, -280, this.remoto, 18)
      this.personagem = this.physics.add.sprite(-750, -280, this.local, 18)
      this.cameras.main.startFollow(this.personagem)

      navigator.mediaDevices.getUserMedia({ video: false, audio: true })
        .then((stream) => {
          this.game.localConnection = new RTCPeerConnection(this.game.ice_servers)

          this.game.localConnection.onicecandidate = function ({ candidate }) {
            candidate && globalThis.game.socket.emit('candidate', globalThis.game.sala, candidate)
          }

          this.game.localConnection.ontrack = function ({ streams: [stream] }) {
            globalThis.game.audio.srcObject = stream
          }

          stream.getTracks()
            .forEach((track) => this.game.localConnection.addTrack(track, stream))

          this.game.localConnection.createOffer()
            .then((offer) => this.game.localConnection.setLocalDescription(offer))
            .then(() => this.game.socket.emit('offer', this.game.sala, this.game.localConnection.localDescription))

          this.game.midias = stream
        })
        .catch((error) => console.error(error))
    }

    this.game.socket.on('offer', (description) => {
      this.game.remoteConnection = new RTCPeerConnection(this.game.ice_servers)

      this.game.remoteConnection.onicecandidate = function ({ candidate }) {
        candidate && globalThis.game.socket.emit('candidate', globalThis.game.sala, candidate)
      }

      this.game.remoteConnection.ontrack = function ({ streams: [midia] }) {
        globalThis.game.audio.srcObject = midia
      }

      this.game.midias.getTracks()
        .forEach((track) => this.game.remoteConnection.addTrack(track, this.game.midias))

      this.game.remoteConnection.setRemoteDescription(description)
        .then(() => this.game.remoteConnection.createAnswer())
        .then((answer) => this.game.remoteConnection.setLocalDescription(answer))
        .then(() => this.game.socket.emit('answer', this.game.sala, this.game.remoteConnection.localDescription))
    })

    this.game.socket.on('answer', (description) =>
      this.game.localConnection.setRemoteDescription(description)
    )

    this.game.socket.on('candidate', (candidate) => {
      const conn = this.game.localConnection || this.game.remoteConnection
      conn.addIceCandidate(new RTCIceCandidate(candidate))
    })

    this.cameras.main.startFollow(this.personagem)

    /* animações */
    this.anims.create({
      key: 'personagem-paradoE',
      frames: this.anims.generateFrameNumbers(this.local, {
        start: 24,
        end: 24
      }),
      frameRate: 1
    })

    this.anims.create({
      key: 'personagem-paradoD',
      frames: this.anims.generateFrameNumbers(this.local, {
        start: 23,
        end: 23
      }),
      frameRate: 1
    })

    this.anims.create({
      key: 'personagem-direita',
      frames: this.anims.generateFrameNumbers(this.local, {
        start: 0,
        end: 8
      }),
      frameRate: 12,
      repeat: -1
    })

    this.anims.create({
      key: 'personagem-esquerda',
      frames: this.anims.generateFrameNumbers(this.local, {
        start: 16,
        end: 22
      }),
      frameRate: 12,
      repeat: -1
    })

    this.anims.create({
      key: 'personagem-pulo',
      frames: this.anims.generateFrameNumbers(this.local, {
        start: 25,
        end: 27
      }),
      frameRate: 12,
      repeat: -1
    })

    this.anims.create({
      key: 'personagem-pulou',
      frames: this.anims.generateFrameNumbers(this.local, {
        start: 27,
        end: 30
      }),
      frameRate: 12,
      repeat: 1
    })

    this.anims.create({
      key: 'personagem-poderD',
      frames: this.anims.generateFrameNumbers(this.local, {
        start: 38,
        end: 46
      }),
      frameRate: 96,
      repeat: 0
    })

    this.anims.create({
      key: 'personagem-poderE',
      frames: this.anims.generateFrameNumbers(this.local, {
        start: 47,
        end: 55
      }),
      frameRate: 96,
      repeat: 0
    })

    this.anims.create({})

    /* botão pra direita */
    this.direita = this.add.sprite(190, 400, 'direita', 0)
      .setScrollFactor(0)
      .setInteractive()
      .on('pointerdown', () => {
        this.direita.setFrame(1)
        this.personagem.anims.play('personagem-direita', true)
        this.personagem.setVelocityX(200)
      })
      .on('pointerup', () => {
        this.direita.setFrame(0)
        this.personagem.anims.play('personagem-paradoD')
        this.personagem.setVelocityX(0)
      })

    /* botão pra esquerda */
    this.esquerda = this.add.sprite(90, 397, 'esquerda', 0)
      .setScrollFactor(0)
      .setInteractive()
      .on('pointerdown', () => {
        this.esquerda.setFrame(1)
        this.personagem.anims.play('personagem-esquerda', true)
        this.personagem.setVelocityX(-200)
      })
      .on('pointerup', () => {
        this.esquerda.setFrame(0)
        this.personagem.anims.play('personagem-paradoE')
        this.personagem.setVelocityX(0)
      })

    /* botão pra cima */
    this.cima = this.add.sprite(730, 397, 'cima', 0)
      .setScrollFactor(0)
      .setInteractive()
      .on('pointerdown', () => {
        this.cima.setFrame(1)
        if (this.personagem.body.blocked.down) {
          this.personagem.anims.play('personagem-pulo', true)
          this.personagem.setVelocityY(-500)
        }
      })
      .on('pointerup', () => {
        this.cima.setFrame(0)
        if (this.personagem.body.velocity.y === 0) {
          // Se o personagem estiver tocando o chão, reproduza a animação 'personagem-parado'
          this.personagem.anims.play('personagem-parado', true)
        } else {
          // Caso contrário, reproduza a animação 'personagem-pulou'
          this.personagem.anims.play('personagem-pulou', true)
        }
      })

    /* botão de poder pra Direita */
    this.poder = this.add.sprite(630, 400, 'poder', 0)
      .setScrollFactor(0)
      .setInteractive()
      .on('pointerdown', () => {
        this.poder.setFrame(1)
        this.personagem.anims.play('personagem-poderD', true)
        this.personagem.setVelocityX(0)

        this.personagem.on('animationcomplete-personagem-poderD', () => {
          this.personagem.anims.play('personagem-paradoD')
        })

        // Criar um projétil
        let projeteilSpritesheetKey
        if (this.local === 'YE') {
          projeteilSpritesheetKey = 'ye-poder'
        } else if (this.local === 'tyler') {
          projeteilSpritesheetKey = 'tyler-poder'
        }

        // Corrigir a posição inicial do projétil para evitar sobreposição com o personagem
        const projeteilLocal = this.physics.add.sprite(this.personagem.x, this.personagem.y - 10, projeteilSpritesheetKey)
        projeteilLocal.setVelocityX(800) // Mudar para 800 para ir para a direita

        // Configurar colisão do projétil com o layerfundo
        this.physics.add.collider(projeteilLocal, this.layerfundo, () => {
          projeteilLocal.destroy() // Destruir o projétil ao colidir com o layerfundo
        })

        // Configurar a gravidade apenas enquanto o projétil estiver visível
        projeteilLocal.body.setAllowGravity(false)

        // Remover o projétil da simulação de física quando não estiver mais visível
        projeteilLocal.on('animationcomplete', () => {
          projeteilLocal.destroy()

          // Iniciar o timer após a ação
          poderTimer = this.time.addEvent({ delay: 250, callback: () => { }, loop: false })
        })
      })
      .on('pointerup', () => {
        this.poder.setFrame(0)
        if (this.personagem.anims.currentAnim.key !== 'personagem-poderD') {
          this.personagem.anims.play('personagem-paradoD')
          this.personagem.setVelocityX(0)
        }
      })

    /* botão de poder pra Esquerda */
    this.poder = this.add.sprite(530, 400, 'poder', 0)
      .setScrollFactor(0)
      .setInteractive()
      .on('pointerdown', () => {
        // Verificar se o timer está completo (permite ação) antes de prosseguir
        if (!poderTimer || poderTimer.getProgress() === 1) {
          this.poder.setFrame(1)
          this.personagem.anims.play('personagem-poderE', true)
          this.personagem.setVelocityX(0)

          this.personagem.on('animationcomplete-personagem-poderE', () => {
            this.personagem.anims.play('personagem-paradoE')
          })

          // Criar um projétil
          let projeteilSpritesheetKey
          if (this.local === 'YE') {
            projeteilSpritesheetKey = 'ye-poder'
          } else if (this.local === 'tyler') {
            projeteilSpritesheetKey = 'tyler-poder'
          }

          // Corrigir a posição inicial do projétil para evitar sobreposição com o personagem
          const projeteilLocal = this.physics.add.sprite(this.personagem.x, this.personagem.y - 10, projeteilSpritesheetKey)
          projeteilLocal.setVelocityX(-800)

          // Configurar colisão do projétil com o layerfundo
          this.physics.add.collider(projeteilLocal, this.layerfundo, () => {
            projeteilLocal.destroy() // Destruir o projétil ao colidir com o layerfundo
          })

          // Configurar a gravidade apenas enquanto o projétil estiver visível
          projeteilLocal.body.setAllowGravity(false)

          // Remover o projétil da simulação de física quando não estiver mais visível
          projeteilLocal.on('animationcomplete', () => {
            projeteilLocal.destroy()
          })

          // Iniciar o timer após a ação
          poderTimer = this.time.addEvent({ delay: 250, callback: () => { }, loop: false })
        }
      })
      .on('pointerup', () => {
        this.poder.setFrame(0)
        if (this.personagem.anims.currentAnim.key !== 'personagem-poderE') {
          this.personagem.anims.play('personagem-paradoE')
          this.personagem.setVelocityX(0)
        }
      })

    /* vilões */
    const viloesConfig = [
      { key: 'bike', x: 200, y: 500, moveDistance: 100, moveDuration: 2000 },
      { key: 'cudi', x: 400, y: 500, moveDistance: 150, moveDuration: 3000 },
      { key: 'drake', x: 600, y: 500, moveDistance: 120, moveDuration: 2500 },
      { key: 'graduation', x: 600, y: 500, moveDistance: 120, moveDuration: 2500 },
      { key: 'pau', x: 600, y: 500, moveDistance: 120, moveDuration: 2500 },
      { key: 'terra', x: 600, y: 500, moveDistance: 120, moveDuration: 2500 },
      { key: 'twitter', x: 600, y: 500, moveDistance: 120, moveDuration: 2500 }
    ]

    viloesConfig.forEach(({ key, x, y, moveDistance, moveDuration }) => {
      const vilao = this.physics.add.sprite(x, y, key)
      this.physics.world.enable(vilao)

      // Configurando colisão com o layerfundo e o vilao
      this.physics.add.collider([this.layerfundo, vilao])

      // Adicionando movimento automático para o vilao
      this.tweens.add({
        targets: vilao,
        x: vilao.x + moveDistance,
        duration: moveDuration,
        ease: 'Linear',
        yoyo: true,
        repeat: -1
      })
    })

    this.layerfundo.setCollisionByProperty({ collides: true })
    this.layeratras2.setCollisionByProperty({ collides: true })
    this.layeratras.setCollisionByProperty({ collides: true })
    this.layerblocos.setCollisionByProperty({ collides: true })
    this.layerfrente.setCollisionByProperty({ collides: true })

    this.physics.add.collider(this.personagem, this.layerfrente)
    this.physics.add.collider(this.personagem, this.layerblocos)
    this.physics.add.collider(this.personagem, this.layeratras)
    this.physics.add.collider(this.personagem, this.layeratras2)
    this.physics.add.collider(this.personagem, this.layerfundo)
    this.physics.add.collider(this.personagem, this.bike)
    this.physics.add.collider(this.personagem, this.cudi)
    this.physics.add.collider(this.personagem, this.drake)
    this.physics.add.collider(this.personagem, this.graduation)
    this.physics.add.collider(this.personagem, this.pau)
    this.physics.add.collider(this.personagem, this.terra)
    this.physics.add.collider(this.personagem, this.twitter)
  }

  update () { }
}
