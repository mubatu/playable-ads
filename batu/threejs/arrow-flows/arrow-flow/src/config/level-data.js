export const LEVELS = [
    {
        id: 'level_001_intro_flow',
        grid: {
            rows: 5,
            cols: 4
        },
        arrows: [
            {
                id: 'green_left_01',
                color: 'green',
                direction: 'left',
                head: { row: 3, col: 1 },
                cells: [
                    { row: 3, col: 3 },
                    { row: 3, col: 2 },
                    { row: 3, col: 1 }
                ]
            },
            {
                id: 'yellow_down_01',
                color: 'yellow',
                direction: 'down',
                head: { row: 2, col: 3 },
                cells: [
                    { row: 0, col: 3 },
                    { row: 1, col: 3 },
                    { row: 2, col: 3 }
                ]
            },
            {
                id: 'purple_left_01',
                color: 'purple',
                direction: 'left',
                head: { row: 4, col: 0 },
                cells: [
                    { row: 4, col: 1 },
                    { row: 4, col: 0 }
                ]
            },
            {
                id: 'pink_down_01',
                color: 'pink',
                direction: 'down',
                head: { row: 2, col: 0 },
                cells: [
                    { row: 1, col: 0 },
                    { row: 2, col: 0 }
                ]
            },
            {
                id: 'orange_right_01',
                color: 'orange',
                direction: 'right',
                head: { row: 0, col: 1 },
                cells: [
                    { row: 0, col: 0 },
                    { row: 0, col: 1 }
                ]
            }
        ],
        frame: {
            slotCount: 36,
            entrySlotIndex: 18
        },
        shooters: [
            {
                id: 'pink_top_01',
                color: 'pink',
                shots: 2,
                side: 'top',
                laneIndex: 1,
                isBlocked: false,
                visibleSlots: [1]
            },
            {
                id: 'purple_top_02',
                color: 'purple',
                shots: 2,
                side: 'top',
                laneIndex: 7,
                isBlocked: false,
                visibleSlots: [7]
            },
            {
                id: 'yellow_right_01',
                color: 'yellow',
                shots: 3,
                side: 'right',
                laneIndex: 3,
                isBlocked: false,
                visibleSlots: [13]
            },
            {
                id: 'green_bottom_01',
                color: 'green',
                shots: 3,
                side: 'bottom',
                laneIndex: 3,
                isBlocked: false,
                visibleSlots: [21]
            },
            {
                id: 'orange_left_01',
                color: 'orange',
                shots: 2,
                side: 'left',
                laneIndex: 4,
                isBlocked: false,
                visibleSlots: [32]
            }
        ]
    }
];
