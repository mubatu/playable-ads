export const CONFIG = {
    resolution: {
        width: 1080,
        height: 1920,
        devicePixelRatioLimit: 2
    },

    background: {
        sourceWidth: 1080,
        sourceHeight: 1920,
        worldHeight: 19.2,
        gradientTop: '#5d668d',
        gradientBottom: '#29314f',
        z: -5
    },

    camera: {
        boardYOffset: -0.45
    },

    grid: {
        rows: 5,
        cols: 5,
        cellSize: 1.08,
        cellGap: 0.12,
        cellHeight: 0.28
    },

    arrow: {
        exitIntervalSeconds: 0.09,
        exitAnimationSeconds: 0.12,
        clickablePulseDelaySeconds: 1.5,
        invalidTapFeedbackSeconds: 0.14
    },

    frame: {
        slotCount: 28,
        slotsPerSide: 7,
        moveTickSeconds: 0.18,
        entrySlotIndex: 0,
        margin: 1.05,
        loseOnlyWhenFullAndNoShot: true
    },

    shooter: {
        fireCooldownSeconds: 0,
        simultaneousFire: true,
        consumeShotOnSuccessfulDestroyOnly: true,
        inactiveWhenShotsReachZero: true,
        shotAnimationSeconds: 0.1
    },

    playableAd: {
        maxSessionSeconds: 30,
        showCTAOnWin: true,
        showCTAOnLose: true,
        showCTAOnTimeout: true,
        autoHintAfterSeconds: 1.5
    },

    tutorial: {
        enabled: true,
        assetUrl: '../block-blast/src/assets/hand-2.png',
        startDelayMs: 1400,
        duration: 0.9,
        loopDelay: 0.45,
        size: 122
    },

    colors: {
        pink: 0xff3fa6,
        yellow: 0xffdf34,
        green: 0x38e07b,
        orange: 0xff962f,
        purple: 0x8a58ff,
        frame: 0xaec3f5,
        frameDark: 0x7282bb,
        background: 0x555b7a,
        gridBase: 0x70789e,
        text: 0xffffff,
        invalid: 0xff4c5e
    },

    debug: {
        showFrameSlotIndices: false,
        showShooterSightLines: false,
        logStateChanges: false,
        startPaused: false
    }
};
