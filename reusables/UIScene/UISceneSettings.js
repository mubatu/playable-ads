// ui-settings.js

/** CoC-style intro + deploy badge; merge into `UIScene` settings (with empty `buttons` / `joysticks` if needed). */
export function getCocPlayableUIConfig(barbarianStock) {
    return {
        introOverlays: [
            {
                id: 'coc-intro',
                title: 'Clash of Clans',
                subtitle:
                    'Tap any tile on the outer edge of the base to deploy a Barbarian. Destroy the Town Hall before time runs out.',
                buttonId: 'coc-play-btn',
                buttonText: 'PLAY NOW',
                visible: true,
                onPrimaryClick: () => window.dispatchEvent(new CustomEvent('coc-play-clicked'))
            }
        ],
        deployBadges: [
            {
                id: 'coc-deploy-badge',
                initialText: `${barbarianStock}/${barbarianStock}`,
                portraitBackground: 'radial-gradient(circle at 50% 35%, #ff8a3d 0%, #b65020 75%)',
                styles: {
                    wrapper: {
                        bottom: '18px',
                        right: '18px',
                        zIndex: '90'
                    }
                }
            }
        ]
    };
}

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
                window.dispatchEvent(new CustomEvent("play-now-clicked"));
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
    introOverlays: [],
    deployBadges: []
};