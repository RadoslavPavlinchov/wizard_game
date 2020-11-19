let Application = PIXI.Application,
    Container = PIXI.Container,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    TextureCache = PIXI.utils.TextureCache,
    Sprite = PIXI.Sprite,
    Rectangle = PIXI.Rectangle;

let app = new Application( {
    antialias: true,
    transparent: false,
    resolution: 1
} );

app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.autoResize = true;
app.renderer.resize( window.innerWidth, window.innerHeight );

document.body.appendChild( app.view );

loader
    .add( "images/background/BG_1.png" )
    .add( "images/background/BG_6_Forest_1.png" )
    .add( "images/ground/ground.json" )
    .add( "images/hero/walk.json" )
    .add( "images/hero/jump.json" )
    .add( "images/power_ups/power_up.json" )
    .load( setup );

let animatedMage, idHero, idGround, groundStart, progressBar, innerBar, outerBar, walking,
    groundMiddle, ramp0, ramp1, ramp2, coin, state, message, gameScene, gameOverScene;
let coinsArr = [];

function setup() {

    gameScene = new Container();
    gameOverScene = new Container();
    gameOverScene.visible = false;

    //Create the progress bar
    progressBar = new PIXI.Container();
    progressBar.position.set( window.innerWidth - 300, window.innerHeight - 900 );

    //Create the black background rectangle
    outerBar = new PIXI.Graphics();
    outerBar.beginFill( 0x000000 );
    outerBar.drawRect( 0, 0, 132, 12 );
    outerBar.endFill();
    progressBar.addChild( outerBar );

    //Create the front red rectangle
    innerBar = new PIXI.Graphics();
    innerBar.beginFill( 0x29CC00 );
    innerBar.drawRect( 0, 2, 128, 8 );
    innerBar.endFill();
    progressBar.addChild( innerBar );

    // progressBar.outer = outerBar;
    innerBar.width = 1;

    //Create the text sprite and add it to the `gameOver` scene
    let style = new PIXI.TextStyle( {
        fontFamily: "Futura",
        fontSize: 64,
        fill: "white"
    } );

    message = new PIXI.Text( "Click to Retry", style );
    message.x = window.innerWidth / 2;
    message.y = window.innerHeight / 2;
    message.anchor.set( 0.5 );
    message.interactive = true;
    message.buttonMode = true;
    message.on( "click", function () {
        location.reload();
    } );

    gameOverScene.addChild( message );

    let backgroundSky = new Sprite(
        resources[ "images/background/BG_1.png" ].texture
    );
    backgroundSky.name = "sky";

    let backgroundNature = new Sprite(
        resources[ "images/background/BG_6_Forest_1.png" ].texture
    );
    backgroundNature.y = -100;


    let sheet = resources[ "images/hero/walk.json" ].spritesheet;
    animatedMage = new PIXI.extras.AnimatedSprite( sheet.animations[ "FW_Hero_1_Walking_" ] );
    animatedMage.animationSpeed = 0.5;
    animatedMage.vx = 0;
    animatedMage.vy = 0;
    animatedMage.y = 658;

    // let wizardSheet = resources[ "images/wizard/wizard.json" ].spritesheet;

    // walk = new PIXI.extras.AnimatedSprite( wizardSheet.animations[ "FW_Hero_1_Walking_" ] );
    // walk.animationSpeed = 0.5;
    // walk.vx = 0;
    // walk.vy = 0;

    // jump = new PIXI.extras.AnimatedSprite( wizardSheet.animations[ "FW_Hero_1_Jumping_" ] );
    // jump.animationSpeed = 0.5;
    // jump.vx = 0;
    // jump.vy = 0;

    // attack = new PIXI.extras.AnimatedSprite( wizardSheet.animations[ "FW_Hero_1_Attack_" ] );
    // attack.animationSpeed = 0.5;
    // attack.vx = 0;
    // attack.vy = 0;

    // die = new PIXI.extras.AnimatedSprite( wizardSheet.animations[ "FW_Hero_1_Die_" ] );
    // die.animationSpeed = 0.5;
    // die.vx = 0;
    // die.vy = 0;

    let coinSheet = resources[ "images/power_ups/power_up.json" ].spritesheet;


    idGround = resources[ "images/ground/ground.json" ].textures;

    groundStart = new Sprite( idGround[ "Ground_Platforms_03.png" ] );
    groundStart.x = -15;
    groundStart.y = 842;

    ramp0 = new Sprite( idGround[ "Ground_Platforms_24.png" ] );
    ramp0.x = 500;
    ramp0.y = 700;

    ramp1 = new Sprite( idGround[ "Ground_Platforms_25.png" ] );
    ramp1.x = 628;
    ramp1.y = 700;

    ramp2 = new Sprite( idGround[ "Ground_Platforms_26.png" ] );
    ramp2.x = 756;
    ramp2.y = 700;

    gameScene.addChild( backgroundSky );
    gameScene.addChild( backgroundNature );
    gameScene.addChild( progressBar );
    gameScene.addChild( groundStart );
    gameScene.addChild( ramp0 );
    gameScene.addChild( ramp1 );
    gameScene.addChild( ramp2 );

    // let numberOfMiddleTiles = 15,
    //     spacing = 128,
    //     xOffset = 112;

    for ( let i = 0; i < 15; i++ ) {
        let tile = new Sprite( idGround[ "Ground_Platforms_04.png" ] );
        let x = 128 * i + 112;
        tile.x = x;
        tile.y = 842;
        gameScene.addChild( tile );
    }

    gameScene.addChild( animatedMage );


    for ( let i = 0; i < 3; i++ ) {
        coin = new PIXI.extras.AnimatedSprite( coinSheet.animations[ "Coins" ] );
        let x = 650 * i + 250;
        coin.x = x;
        coin.y = 700;

        coin.animationSpeed = 0.25;

        coin.scale.x = 0.25;
        coin.scale.y = 0.25;

        coin.play();

        coinsArr.push( coin );

        gameScene.addChild( coin );
    }

    app.stage.addChild( gameScene );
    app.stage.addChild( gameOverScene );


    let left = keyboard( "ArrowLeft" ),
        up = keyboard( "ArrowUp" ),
        right = keyboard( "ArrowRight" ),
        down = keyboard( "ArrowDown" );

    left.press = () => {
        if ( jumping ) {
            return;
        }
        animatedMage.play();
        TweenMax.to( animatedMage, 0, { vx: -5, vy: 0 } );
    };

    left.release = () => {

        if ( !right.isDown && animatedMage.vy === 0 ) {
            animatedMage.stop();
            TweenMax.to( animatedMage, 0, { vx: 0 } );
        }
    };

    //Up
    let jumping = false;
    up.press = () => {
        if ( right.isDown ) {
            if ( jumping ) {
                return;
            }
            TweenMax.fromTo( animatedMage, 0.5,
                {
                    vy: -35,
                    vx: 20,
                },
                {
                    vy: 0,
                    vx: 0,
                    stop,
                    onStart: () => {
                        jumping = true;
                    },
                    onComplete: () => {
                        jumping = false;
                        if ( right.isDown ) {
                            console.log( "still walking right" );
                        }
                    }
                } );
        }

        if ( left.isDown ) {
            if ( jumping ) {
                return;
            }
            TweenMax.fromTo( animatedMage, 0.5,
                {
                    vy: -35,
                    vx: -20,
                },
                {
                    vy: 20,
                    vx: 0,
                    stop,
                    onStart: () => {
                        jumping = true;
                    },
                    onComplete: () => {
                        jumping = false;
                    }
                } );
        }

        if ( jumping ) {
            return;
        }

        TweenMax.fromTo( animatedMage, 0.5,
            {
                vy: -35,
                vx: 0,
            },
            {
                vy: 20,
                vx: 0,
                stop,
                onStart: () => {
                    jumping = true;
                },
                onComplete: () => {
                    jumping = false;
                }
            } );
    };
    // up.release = () => {
    //     // // if ( !down.isDown && animatedMage.vx === 0 ) {
    //     // TweenMax.to( animatedMage, 0.5, { vy: 0 } );
    //     // animatedMage.stop();
    //     // // }
    // };

    //Right
    right.press = () => {
        if ( jumping ) {
            return;
        }
        animatedMage.play();
        TweenMax.to( animatedMage, 0, {
            vx: 5, vy: 0
        } );
    };
    right.release = () => {
        if ( !left.isDown && animatedMage.vy === 0 ) {
            // animatedMage.vx = 0;
            TweenMax.to( animatedMage, 0, { vx: 0 } );
            animatedMage.stop();
        }
    };

    //Down
    down.press = () => {
        // animatedMage.vy = 5;
        // animatedMage.vx = 0;
    };
    down.release = () => {
        // if ( !up.isDown && animatedMage.vx === 0 ) {
        //     animatedMage.vy = 0;
        // }
    };

    state = play;

    //Start the game loop 
    app.ticker.add( delta => gameLoop( delta ) );
}

function gameLoop( delta ) {

    //Update the current game state:
    state( delta );
}

function play( delta ) {

    animatedMage.x += animatedMage.vx;
    animatedMage.y += animatedMage.vy;

    contain( animatedMage, { x: 10, y: 10, width: window.innerWidth, height: 851 } );

    if ( animatedMage.x + animatedMage.width * 0.8 > ramp0.x && // on ground
        animatedMage.x + animatedMage.width * 0.25 < ramp0.x + ramp0.width + ramp1.width + ramp2.width &&
        animatedMage.y !== 520 ) {
        animatedMage.vx = 0;
    }

    if ( animatedMage.x + animatedMage.width * 0.8 > ramp0.x && // on ramp
        animatedMage.x + animatedMage.width * 0.25 < ramp0.x + ramp0.width + ramp1.width + ramp2.width &&
        animatedMage.y + animatedMage.height > ramp0.y &&
        animatedMage.vy > 0 ) {

        animatedMage.y = 520;
    }

    if ( animatedMage.x + animatedMage.width * 0.8 > ramp0.x - 1 &&
        animatedMage.x + animatedMage.width * 0.25 < ramp0.x + ramp0.width + ramp1.width + ramp2.width &&
        animatedMage.y === 520 ) {

        if ( animatedMage.x + animatedMage.width / 2 < ramp0.x ) {
            animatedMage.y = 655;
            animatedMage.x = 380;
        }

        if ( ramp0.x + ramp0.width + ramp1.width + ramp2.width < animatedMage.x + animatedMage.width / 2 ) {
            animatedMage.y = 655;
            animatedMage.x = 850;
        }
    }

    // function hitCoin( hitCheck, coin ) {
    //     if ( hitCheck ) {
    //         if ( coinsArr[ 0 ].hit ) {
    //             return;
    //         }
    //         coin.hit = true;
    //         coin.visible = false;
    //         innerBar.width += outerBar.width / 3;
    //     }
    //          return;
    // }

    //  hitCoin( hitCheck, coin )

    // coinsArr.forEach( x => {
    //     hitTestRectangle( animatedMage, x );

    //     if ( x.hit ) {
    //         return;
    //     }
    //     x.hit = true;
    //     x.visible = false;
    //     innerBar.width += outerBar.width / 3;
    // } );

    if ( hitTestRectangle( animatedMage, coinsArr[ 0 ] ) ) {
        if ( coinsArr[ 0 ].hit ) {
            return;
        }
        coinsArr[ 0 ].hit = true;
        coinsArr[ 0 ].visible = false;
        innerBar.width += outerBar.width / 3;
    }

    if ( hitTestRectangle( animatedMage, coinsArr[ 1 ] ) ) {
        if ( coinsArr[ 1 ].hit ) {
            return;
        }
        coinsArr[ 1 ].hit = true;
        coinsArr[ 1 ].visible = false;
        innerBar.width += outerBar.width / 3;
    }

    if ( hitTestRectangle( animatedMage, coinsArr[ 2 ] ) ) {
        if ( coinsArr[ 2 ].hit ) {
            return;
        }
        coinsArr[ 2 ].hit = true;
        coinsArr[ 2 ].visible = false;
        innerBar.width += outerBar.width / 3;
    }

    if ( innerBar.width > outerBar.width ) {
        state = end;
    }

}

// function hitCoin( hitCheck, coin ) {
//     if ( hitCheck ) {
//         if ( coinsArr[ 0 ].hit ) {
//             return;
//         }
//         coin.hit = true;
//         coin.visible = false;
//         innerBar.width += outerBar.width / 3;
//     }
// }

function end() {
    gameScene.visible = false;
    gameOverScene.visible = true;
}

function contain( sprite, container ) {

    let collision = undefined;

    //Left
    if ( sprite.x < container.x ) {
        sprite.x = container.x;
        collision = "left";
    }

    //Top
    if ( sprite.y < container.y ) {
        sprite.y = container.y;
        collision = "top";
    }

    //Right
    if ( sprite.x + sprite.width > container.width ) {
        sprite.x = container.width - sprite.width;
        collision = "right";
    }

    //Bottom
    if ( sprite.y + sprite.height > container.height ) {
        sprite.y = container.height - sprite.height;
        collision = "bottom";
    }

    //Return the `collision` value
    return collision;
}

function hitTestRectangle( mage, box ) {

    //Define the variables we'll need to calculate
    let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

    //hit will determine whether there's a collision
    hit = false;

    //Find the center points of each sprite
    mage.centerX = mage.x + mage.width / 2;
    mage.centerY = mage.y + mage.height / 2;
    box.centerX = box.x + box.width / 2;
    box.centerY = box.y + box.height / 2;

    //Find the half-widths and half-heights of each sprite
    mage.halfWidth = mage.width / 2;
    mage.halfHeight = mage.height / 2;
    box.halfWidth = box.width / 2;
    box.halfHeight = box.height / 2;

    //Calculate the distance vector between the sprites
    vx = mage.centerX - box.centerX;
    vy = mage.centerY - box.centerY;

    //Figure out the combined half-widths and half-heights
    combinedHalfWidths = mage.halfWidth + box.halfWidth;
    combinedHalfHeights = mage.halfHeight + box.halfHeight;

    //Check for a collision on the x axis
    if ( Math.abs( vx ) < combinedHalfWidths ) {

        //A collision might be occurring. Check for a collision on the y axis
        if ( Math.abs( vy ) < combinedHalfHeights ) {

            //There's definitely a collision happening
            hit = true;
        } else {

            //There's no collision on the y axis
            hit = false;
        }
    } else {

        //There's no collision on the x axis
        hit = false;
    }

    //`hit` will be either `true` or `false`
    return hit;

};

function keyboard( value ) {
    let key = {};

    key.value = value;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;

    //The `downHandler`
    key.downHandler = event => {
        if ( event.key === key.value ) {
            if ( key.isUp && key.press ) key.press();
            key.isDown = true;
            key.isUp = false;
            event.preventDefault();
        }
    };

    //The `upHandler`
    key.upHandler = event => {
        if ( event.key === key.value ) {
            if ( key.isDown && key.release ) key.release();
            key.isDown = false;
            key.isUp = true;
            event.preventDefault();
        }
    };

    //Attach event listeners
    const downListener = key.downHandler.bind( key );
    const upListener = key.upHandler.bind( key );

    window.addEventListener(
        "keydown", downListener, false
    );
    window.addEventListener(
        "keyup", upListener, false
    );

    // Detach event listeners
    key.unsubscribe = () => {
        window.removeEventListener( "keydown", downListener );
        window.removeEventListener( "keyup", upListener );
    };

    return key;
}
