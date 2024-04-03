//defines scene 1
let sceneOne = {
    key: "sceneOne",
    active: true,
    preload: sceneOnePreload,
    create: sceneOneCreate,
    update: sceneOneUpdate
}

//defines scene 2
let sceneTwo = {
    key: "sceneTwo",
    active: false,
    preload: sceneTwoPreload,
    create: sceneTwoCreate,
    update: sceneTwoUpdate
}

//defines scene 3
let sceneThree = {
    key: "sceneThree",
    active: false,
    preload: sceneThreePreload,
    create: sceneThreeCreate,
    update: sceneThreeUpdate
}

//the game configuration
let config = {
    type: Phaser.WEBGL,
    scale: {
        width: 800,
        height: 600,
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: "arcade",
    },
    scene: [sceneOne, sceneTwo, sceneThree]
}

let game = new Phaser.Game(config);

//game objects
let asteroid;
let background;
let planet;
let ufo;
var asteroidNumber = 0;
var score = 0;
let scoreText;
var highScore = 0;
let highScoreText;
var shields = 100;
let shieldText;
var timer;
let playerWon;
let instructionsText;
let clickToStartText;
let descriptionText;

function sceneOnePreload() {
    //loads the background image for the start screen
    this.load.image("title", "assets/earth.png");

    //music found at https://opengameart.org/content/another-space-background-track
    this.load.audio("sceneOneMusic", "assets/ObservingTheStar.ogg");
}

function sceneOneCreate() {
    //creates the background image for the start screen
    sceneOneBackground = this.add.image(400, 300, "title");

    //set up the text for the high score
    highScoreText = this.add.text(16, 10, "High Score: " + highScore, { fontFamily: "Rokkitt", fontSize: "12px" });

    //text for game instructions
    instructionsText = this.add.text(16, 230, "Use Arrow Keys to Move.\nClick to go through scenes.\nPress 'F' for Fullscreen and\nESC to exit.\n\nTo Save the Planet Use the\nUFO to Destroy Asteroids.",
        { fontFamily: "Rokkitt", fontSize: "24px" });

    //text that tells player to click to start
    clickToStartText = this.add.text(345, 100, "CLICK TO", { fontFamily: "Rokkitt", fontSize: "24px" });

    //text that says start
    this.add.text(300, 125, "START", { fontFamily: "Rokkitt", fontSize: "64px", fontStyle: "bold", fill: "#999" });

    //gives tips on how to play
    descriptionText = this.add.text(510, 215, "Try to maintain the shields\nand get a score high\nenough to win.\n\nTo continue and get a\nhigher score, try leaving\na couple asteroids.",
        { fontFamily: "Rokkitt", fontSize: "24px" });

    //allows user to turn on fullscreen mode using the "f" key
    let fkey = this.input.keyboard.addKey("F");
    fkey.on(
        "down",
        function () {
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
            } else {
                this.scale.startFullscreen();
            }
        },
        this
    );

    //the music for the game
    sceneOneSound = this.sound.add("sceneOneMusic");
    sceneOneSound.play(
        {
            volume: 0.2,
            loop: true
        }
    );

    //create a transition from the scene if clicked
    this.input.on("pointerup", sceneOneTransition, this);
}

function sceneOneUpdate() {

}

function sceneOneTransition() {
    console.log('clicked#1');
    //transitions from scene one to scene two
    this.scene.transition(
        {
            target: "sceneTwo",
            duration: 500,
            moveBelow: true,
            allowInput: false,
            onUpdate: function (progress) {
                sceneOneBackground.alpha = 1 - progress;
            }
        }
    );
    this.scene.start("secondScene");
}

let ufoSoundEffect;

function sceneTwoPreload() {
    //loads scene two assets
    this.load.image("asteroid", "assets/asteroid.png");
    this.load.image("background", "assets/background.jpg");
    this.load.image("planet", "assets/earth.png");
    //this.load.image("ufo", "assets/ufo.png");
    this.load.spritesheet(
        "ufo",
        "assets/ufo-spritesheet.png", {
        frameWidth: 16,
        frameHeight: 16,
        endFrame: 2
    });
    //sound effect from https://opengameart.org/content/space-ship-shield-sounds
    this.load.audio("ufoSound", "assets/space shield sounds - 7.wav");
}

function sceneTwoCreate() {
    //creates the background for scene two
    sceneTwoBackground = this.add.image(400, 300, "background");

    ufoSoundEffect = this.sound.add("ufoSound");

    //the ufo object and its properties
    ufo = this.physics.add.sprite(400, 500, "ufo");
    ufo.setScale(3, 1.5);
    ufo.setCollideWorldBounds(true);
    ufo.setBounce(0.9);

    let ufoFrames = this.anims.generateFrameNumbers(
        "ufo",
        {
            start: 0,
            end: 2,
            first: 1
        }
    );
    this.anims.create(
        {
            key: "ufoAnimation",
            frames: ufoFrames,
            frameRate: 3,
            repeat: -1
        }
    );

    ufo.anims.play("ufoAnimation");

    //asteroid object
    asteroid = "asteroid";
    asteroidNumber = 0;

    //planet object
    planet = this.physics.add.staticImage(400, 300, "planet");
    planet.setCircle(96, 0, 0);

    //set up the text for the high score
    highScoreText = this.add.text(16, 10, "High Score: " + highScore, { fontFamily: "Rokkitt", fontSize: 12 });

    //sets up the text for the score
    scoreText = this.add.text(16, 25, "Score: " + score, { fontFamily: "Rokkitt" });

    //the text for the shields
    shieldText = this.add.text(16, 40, "Shields: " + shields + "%", { fontFamily: "Rokkitt" });

    //a timer for shield regeneration
    timer = this.time.addEvent({
        delay: 500,
        callback: increaseShields,
        loop: true
    });

    //console.log(timer);

    //a timer to spawn asteroids
    asteroidTimer = this.time.addEvent({
        delay: 10000,
        callback: addAsteroids,
        loop: true
    });

    console.log(asteroidTimer);

    //colliders
    this.physics.add.collider(ufo, planet, null, null, this);
    this.physics.add.collider(ufo, asteroid, hitAsteroid, null, this);
    this.physics.add.collider(planet, asteroid, hitPlanet, null, this);
    this.physics.add.collider(asteroid, asteroid, null, null, this);

    arrowKeys = this.input.keyboard.createCursorKeys();
}

function sceneTwoUpdate() {
    //makes the ufo move
    if (arrowKeys.left.isDown) {
        ufo.setVelocityX(-220);
        ufo.setVelocityY(0);
    } else if (arrowKeys.right.isDown) {
        ufo.setVelocityX(220);
        ufo.setVelocityY(0);
    } else if (arrowKeys.up.isDown) {
        ufo.setVelocityY(-180);
        ufo.setVelocityX(0);
    } else if (arrowKeys.down.isDown) {
        ufo.setVelocityY(180);
        ufo.setVelocityX(0);
    } else {
        //ufo.setVelocity(0);
    }

    //adds more asteroids if they are all destroyed
    if (asteroidNumber == 0 || asteroidTimer == true) {

        //adds asteroids
        asteroid = this.physics.add.group({
            key: "asteroid",
            repeat: 9,
            setXY: { x: 75, y: 100, stepX: 70 }
        });

        //rotates the asteroids
        this.tweens.add(
            {
                targets: asteroid.getChildren(),
                duration: 20000,
                repeat: -1,
                angle: '+=360',
            }
        );

        asteroid.children.iterate(function (astGroup) {

            //randomly chooses the state from these options
            switch (Phaser.Math.Between(1, 3)) {
                case 1:
                    astGroup.custom_state = "drift";
                    break;
                case 2:
                    astGroup.custom_state = "fast fall";
                    break;
                case 3:
                    astGroup.custom_state = "slow fall";
                    break;
            }
        });

        //defines the different states for the asteroids
        asteroid.children.iterate(function (astGroup) {

            astGroup.setBounce(1);
            astGroup.setCollideWorldBounds(true);

            switch (astGroup.custom_state) {
                case "drift":
                    astGroup.setVelocityY(Phaser.Math.FloatBetween(-10, 10));
                    astGroup.setVelocityX(Phaser.Math.FloatBetween(-15, 15));
                    break;
                case "fast fall":
                    astGroup.setVelocityX(Phaser.Math.FloatBetween(20, -20));
                    astGroup.setVelocityY(Phaser.Math.FloatBetween(15, 20));
                    break;
                case "slow fall":
                    astGroup.setVelocityX(Phaser.Math.FloatBetween(10, -10));
                    astGroup.setVelocityY(Phaser.Math.FloatBetween(10, 15));
                    break;
            }
        });

        this.physics.add.collider(ufo, asteroid, hitAsteroid, null, this);
        this.physics.add.collider(planet, asteroid, hitPlanet, null, this);
        this.physics.add.collider(asteroid, asteroid, null, null, this);

        asteroidNumber += 10;
        asteroidTimer = false;
        console.log(asteroidTimer);
    }

    // TODO: pausing works but resuming doesn't
    /*let pkey = this.input.keyboard.addKey("P");
    pkey.on(
        "down",
        function () {
            if (this.scene.pause() === true) {
                
                this.scene.pause(false);
                //this.scene.resume();
                console.log("the scene is resumed");
            } else if (this.scene.pause() === false) {
                this.scene.pause(true);
                //this.scene.resume();
                this.add.text(230, 125, "Paused", { fontFamily: "Rokkitt", fontSize: "64px", fontStyle: "bold", fill: "#999" });
            }
            //this.scene.pause(true);
            this.add.text(230, 125, "Paused", { fontFamily: "Rokkitt", fontSize: "64px", fontStyle: "bold", fill: "#999" });
            //this.scene.resume();
            console.log("the scene is paused!");
        },
        this
    );*/
}

//deals with the ufo hitting asteroids
function hitAsteroid(ufo, asteroid) {

    //disables asteroids
    asteroid.disableBody(true, true);

    score += 10;
    //console.log(score);

    scoreText.setText("Score: " + score);

    //keeps track of how many asteroids there are.
    asteroidNumber -= 1;
    console.log(asteroidNumber);

    //lowers the shields by 3%
    shields -= 3;
    shieldText.setText("Shields: " + shields + "%");

    //ends game if shields run out
    if (shields < 0) {
        this.physics.pause();
        ufo.setTint(0xff0000);

        getHighScore();
        score = 0;

        playerWon = false;

        //asteroidNumber = 10;
        asteroidNumber = 0;

        shields = 100;

        this.add.text(230, 125, "GAME OVER", { fontFamily: "Rokkitt", fontSize: "64px", fontStyle: "bold", fill: "#999" });

        //create a transition from the scene if clicked
        this.input.on("pointerup", sceneTwoTransition, this);
    }

    //adds a scene for if the player wins the game
    if (asteroidNumber <= 0 && score >= 500 && shields >= 5) {

        playerWon = true;

        this.physics.pause();

        getHighScore();

        score = 0;

        asteroid.disableBody(true);

        asteroidNumber = 0;

        shields = 100;

        this.add.text(130, 125, "THE PLANET IS SAVED!", { fontFamily: "Rokkitt", fontSize: "48px", fontStyle: "bold", fill: "#999" });

        //create a transition from the scene if clicked
        this.input.on("pointerup", sceneTwoTransition, this);
    }

    //collects the high score
    getHighScore();

    ufoSoundEffect.play(
        {
            volume: 0.1,
            loop: false
        }
    );

}

function addAsteroids() {

    if (asteroidNumber <= 40) {
        asteroidTimer = true;
    }
    //asteroidTimer = true;
    console.log(asteroidTimer);
    
}

//ends game if asteroid hits earth
function hitPlanet(planet, asteroid) {

    //stops the game
    this.physics.pause();
    planet.setTint(0xff0000);

    score = 0;

    asteroidNumber = 0;

    playerWon = false;

    this.add.text(230, 125, "GAME OVER", { fontFamily: "Rokkitt", fontSize: "64px", fontStyle: "bold", fill: "#999" });

    //create a transition from the scene if clicked
    this.input.on("pointerup", sceneTwoTransition, this);

}

function increaseShields() {

    //adds 1% to the shields every 0.5 seconds
    if (shields >= 0 && shields < 100) {
        shields += 1;
    }

    shieldText.setText("Shields: " + shields + "%");
    console.log(shields);

}

function getHighScore() {
    if (score > highScore) {
        highScore = score;
        highScoreText.setText("High Score: " + highScore);
    }
}

function sceneTwoTransition() {
    console.log('clicked#2');
    //transitions from scene one to scene two
    this.scene.transition(
        {
            target: "sceneThree",
            duration: 500,
            moveBelow: true,
            allowInput: false,
            onUpdate: function (progress) {
                sceneTwoBackground.alpha = 1 - progress;
            }
        }
    );
    this.scene.start("thirdScene");
}

function sceneThreePreload() {
    this.load.image("background", "earth.png");
    //this.load.image("regularUfo", "assets/ufo.png");
    this.load.spritesheet(
        "endUfo",
        "assets/ufo-spritesheet.png", {
        frameWidth: 16,
        frameHeight: 16,
        endFrame: 2
    });
}

function sceneThreeCreate() {
    //creates the background image for the start screen
    sceneThreeBackground = this.add.image(400, 300, "background");

    if (playerWon == true) {
        this.add.text(130, 125, "THE PLANET IS SAVED!", { fontFamily: "Rokkitt", fontSize: "48px", fontStyle: "bold", fill: "#999" });

        endUfo = this.physics.add.sprite(400, 300, "endUfo");
        endUfo.setScale(3, 1.5);

        let endUfoFrames = this.anims.generateFrameNumbers(
            "endUfo",
            {
                start: 0,
                end: 2,
                first: 1
            }
        );
        this.anims.create(
            {
                key: "endUfoAnimation",
                frames: endUfoFrames,
                frameRate: 3,
                repeat: -1
            }
        );

        endUfo.anims.play("endUfoAnimation");

        ufoSoundEffect.play(
            {
                volume: 0.1,
                loop: false
            }
        );

        playerWon = false;

    } else {
        this.add.text(230, 125, "GAME OVER", { fontFamily: "Rokkitt", fontSize: "64px", fontStyle: "bold", fill: "#999" });
    }

    shields = 100;

    //create a transition from the scene if clicked
    this.input.on("pointerup", sceneThreeTransition, this);
}

function sceneThreeUpdate() {

}

function sceneThreeTransition() {
    console.log('clicked#3');
    //transitions from scene one to scene two
    this.scene.transition(
        {
            target: "sceneOne",
            duration: 500,
            moveBelow: true,
            allowInput: false,
            onUpdate: function (progress) {
                sceneThreeBackground.alpha = 1 - progress;
            }
        }
    );
    this.scene.start("firstScene");
}

