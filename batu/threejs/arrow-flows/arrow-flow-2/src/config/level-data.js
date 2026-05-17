export const LEVELS = [
    {
        id: 'level_001_teaching_loop',
        grid: {
            rows: 5,
            cols: 5
        },
        arrows: [
            {
                id: 'pink_down_01',
                color: 'pink',
                direction: 'down',
                head: { row: 2, col: 0 },
                cells: [
                    { row: 0, col: 0 },
                    { row: 1, col: 0 },
                    { row: 2, col: 0 }
                ]
            },
            {
                id: 'yellow_down_01',
                color: 'yellow',
                direction: 'down',
                head: { row: 1, col: 2 },
                cells: [
                    { row: 0, col: 2 },
                    { row: 1, col: 2 }
                ]
            },
            {
                id: 'green_right_01',
                color: 'green',
                direction: 'right',
                head: { row: 4, col: 2 },
                cells: [
                    { row: 4, col: 1 },
                    { row: 4, col: 2 }
                ]
            },
            {
                id: 'orange_left_01',
                color: 'orange',
                direction: 'left',
                head: { row: 2, col: 3 },
                cells: [
                    { row: 2, col: 4 },
                    { row: 2, col: 3 }
                ]
            },
            {
                id: 'purple_up_01',
                color: 'purple',
                direction: 'up',
                head: { row: 3, col: 4 },
                cells: [
                    { row: 4, col: 4 },
                    { row: 3, col: 4 }
                ]
            }
        ],
        frame: {
            slotCount: 28,
            moveTickSeconds: 0.18
        },
        shooters: [
            {
                id: 'yellow_top_01',
                color: 'yellow',
                shots: 4,
                side: 'top',
                laneIndex: 2,
                isBlocked: false,
                directSlotIndex: 2,
                visibleSlots: [2]
            },
            {
                id: 'purple_top_01',
                color: 'purple',
                shots: 4,
                side: 'top',
                laneIndex: 6,
                isBlocked: false,
                directSlotIndex: 6,
                visibleSlots: [6]
            },
            {
                id: 'green_right_01',
                color: 'green',
                shots: 4,
                side: 'right',
                laneIndex: 4,
                isBlocked: false,
                directSlotIndex: 11,
                visibleSlots: [11]
            },
            {
                id: 'orange_bottom_01',
                color: 'orange',
                shots: 4,
                side: 'bottom',
                laneIndex: 3,
                isBlocked: false,
                directSlotIndex: 17,
                visibleSlots: [17]
            },
            {
                id: 'pink_left_01',
                color: 'pink',
                shots: 5,
                side: 'left',
                laneIndex: 2,
                isBlocked: false,
                directSlotIndex: 23,
                visibleSlots: [23]
            }
        ]
    }
];
