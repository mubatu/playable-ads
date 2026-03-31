// ui-settings.js
import {JumpCommand} from "../Command/JumpCommand";

export const UISettings = {
    buttons: [
        {
            id: "download-btn",
            text: "PLAY NOW",
            styles: {
                // Positioning
                position: "absolute",
                bottom: "30px",
                left: "50%",
                transform: "translateX(-50%)",

                // Aesthetics
                padding: "15px 40px",
                fontSize: "24px",
                fontWeight: "bold",
                backgroundColor: "#ff5722",
                color: "#ffffff",
                border: "none",
                borderRadius: "30px",
                cursor: "pointer",
                boxShadow: "0px 4px 10px rgba(0,0,0,0.3)",

                // Ensure it sits above the canvas
                zIndex: "10"
            },
            onClick: () => {
                window.open("https://www.google.com", "_blank");
                // Ad network redirect logic goes here
            }
        },
        {
            id: "jump-btn",
            text: "JUMP",
            styles: {
                // Positioned on the bottom-right for the right thumb
                position: "absolute",
                bottom: "50px",
                right: "50px",

                // Make it a circular action button
                width: "80px",
                height: "80px",
                fontSize: "16px",
                fontWeight: "bold",
                backgroundColor: "#4CAF50",
                color: "#ffffff",
                border: "3px solid #ffffff",
                borderRadius: "50%", // Makes it a perfect circle
                cursor: "pointer",
                boxShadow: "0px 4px 10px rgba(0,0,0,0.5)",

                // Prevent text selection on rapid tapping
                userSelect: "none",
                zIndex: "10"
            },
            // 1. Give the button the command
            command: new JumpCommand(),

            // 2. Hand the command instance to the global window
            onInit: (commandInstance) => {
                window.playerJumpCommand = commandInstance;
            },

            // 3. When clicked, just set the trigger flag
            onClick: () => {
                window.isJumpRequested = true;
                console.log("clicked")
            }
        }
    ],
    joysticks: [
        {
            id: "movement-joystick",
            maxRadius: 60,
            styles: {
                bottom: "50px",
                left: "50px",
                zIndex: "10"
            },
            // Capture the command reference when the joystick is built
            onInit: (commandInstance) => {
                window.playerMovementCommand = commandInstance;
                // Or store it in a dedicated GameManager/InputManager
            }
        }
    ]
};