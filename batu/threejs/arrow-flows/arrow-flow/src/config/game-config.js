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
        gradientTop: '#253047',
        gradientBottom: '#101827',
        z: -5
    },
    camera: {
        type: 'orthographic',
        boardYOffset: 0.45
    },
    grid: {
        rows: 5,
        cols: 4,
        cellSize: 1.02,
        cellGap: 0.12,
        cellHeight: 0.18,
        basePadding: 0.28
    },
    arrow: {
        exitIntervalSeconds: 0.14,
        exitAnimationSeconds: 0.14,
        clickablePulseDelaySeconds: 1.5,
        invalidTapFeedbackSeconds: 0.14
    },
    frame: {
        slotCount: 36,
        moveTickSeconds: 0.18,
        entrySlotIndex: 18,
        allowChainedMovementPerTick: false,
        loseOnlyWhenFullAndNoShot: true
    },
    shooter: {
        fireCooldownSeconds: 0,
        simultaneousFire: true,
        consumeShotOnSuccessfulDestroyOnly: true,
        inactiveWhenShotsReachZero: true,
        shotAnimationSeconds: 0.08
    },
    input: {
        enableMouse: true,
        enableTouch: true,
        raycastAgainstArrowGroups: true
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
        assetUrl: 'src/assets/hand-2.png',
        gesture: 'tap',
        size: 116,
        duration: 0.8,
        loopDelay: 0.55,
        startDelayMs: 1100
    },
    colors: {
        pink: 0xff4fa3,
        yellow: 0xffdc3c,
        green: 0x35d66b,
        orange: 0xff9438,
        purple: 0x9b68ff,
        frame: 0x89a3cf,
        background: 0x253047,
        gridBase: 0x46536f,
        gridCell: 0x61708d,
        blocked: 0x343c51,
        white: 0xffffff
    },
    debug: {
        showFrameSlotIndices: false,
        showShooterSightLines: false,
        logStateChanges: false,
        startPaused: false
    }
};
