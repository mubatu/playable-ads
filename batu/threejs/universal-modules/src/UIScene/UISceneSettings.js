// ui-settings.js
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
    ],
    sliders: [
        {
            id: "flight-slider",
            initialValue: 50,
            min: 0,
            max: 100,
            step: 1,
            styles: {
                position: "absolute",
                bottom: "30px",
                right: "20px",
                width: "220px",
                zIndex: "10",
                padding: "8px",
                backgroundColor: "rgba(0,0,0,0.5)",
                borderRadius: "10px"
            },
            onValueChange: (value) => {
                window.gameControls = window.gameControls || {};
                window.gameControls.flight = value / 100;
            }
        }
    ],
    toggles: [
        {
            id: "sound-toggle",
            initialState: true,
            labels: { on: "Sound ON", off: "Sound OFF" },
            styles: {
                top: "20px",
                left: "20px",
                zIndex: "10"
            },
            onToggle: (isOn) => {
                console.log(`Sound ${isOn ? 'enabled' : 'disabled'}`);
            }
        }
    ],
    progressBars: [
        {
            id: "health-bar",
            initialValue: 75,
            max: 100,
            styles: {
                top: "60px",
                left: "20px",
                width: "200px",
                zIndex: "10"
            }
        }
    ],
    textInputs: [
        {
            id: "player-name",
            initialValue: "",
            placeholder: "Enter your name",
            maxLength: 20,
            styles: {
                top: "100px",
                left: "20px",
                width: "200px",
                zIndex: "10"
            },
            onChange: (value) => {
                console.log(`Name changed to: ${value}`);
            },
            onSubmit: (value) => {
                console.log(`Name submitted: ${value}`);
            }
        }
    ],
    dropdowns: [
        {
            id: "difficulty-select",
            options: [
                { label: "Easy", value: "easy" },
                { label: "Medium", value: "medium" },
                { label: "Hard", value: "hard" }
            ],
            selectedIndex: 1,
            styles: {
                top: "140px",
                left: "20px",
                width: "200px",
                zIndex: "10"
            },
            onSelect: (option, index) => {
                console.log(`Selected difficulty: ${option.label} (${option.value})`);
            }
        }
    ]
};