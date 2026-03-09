(function (window) {
    'use strict';

    function toKey(row, col) {
        return row + ':' + col;
    }

    function collectLineSeeds(board, seedMap) {
        var rows = board.getRows();
        var cols = board.getCols();

        for (var row = 0; row < rows; row += 1) {
            var col = 0;

            while (col < cols) {
                var color = board.getColor(row, col);
                if (color < 0) {
                    col += 1;
                    continue;
                }

                var endCol = col + 1;
                while (endCol < cols && board.getColor(row, endCol) === color) {
                    endCol += 1;
                }

                if (endCol - col >= 3) {
                    for (var x = col; x < endCol; x += 1) {
                        seedMap[toKey(row, x)] = true;
                    }
                }

                col = endCol;
            }
        }

        for (var colIndex = 0; colIndex < cols; colIndex += 1) {
            var rowIndex = 0;

            while (rowIndex < rows) {
                var verticalColor = board.getColor(rowIndex, colIndex);
                if (verticalColor < 0) {
                    rowIndex += 1;
                    continue;
                }

                var endRow = rowIndex + 1;
                while (endRow < rows && board.getColor(endRow, colIndex) === verticalColor) {
                    endRow += 1;
                }

                if (endRow - rowIndex >= 3) {
                    for (var y = rowIndex; y < endRow; y += 1) {
                        seedMap[toKey(y, colIndex)] = true;
                    }
                }

                rowIndex = endRow;
            }
        }
    }

    function collectSquareSeeds(board, seedMap) {
        var rows = board.getRows();
        var cols = board.getCols();

        for (var row = 0; row < rows - 1; row += 1) {
            for (var col = 0; col < cols - 1; col += 1) {
                var color = board.getColor(row, col);
                if (color < 0) {
                    continue;
                }

                if (
                    board.getColor(row, col + 1) === color &&
                    board.getColor(row + 1, col) === color &&
                    board.getColor(row + 1, col + 1) === color
                ) {
                    seedMap[toKey(row, col)] = true;
                    seedMap[toKey(row, col + 1)] = true;
                    seedMap[toKey(row + 1, col)] = true;
                    seedMap[toKey(row + 1, col + 1)] = true;
                }
            }
        }
    }

    function findMatches(board) {
        var rows = board.getRows();
        var cols = board.getCols();
        var seedMap = {};
        var matchedCells = [];

        collectLineSeeds(board, seedMap);
        collectSquareSeeds(board, seedMap);

        for (var row = 0; row < rows; row += 1) {
            for (var col = 0; col < cols; col += 1) {
                if (seedMap[toKey(row, col)]) {
                    matchedCells.push({
                        row: row,
                        col: col
                    });
                }
            }
        }

        return matchedCells;
    }

    window.GameMatch = {
        findMatches: findMatches
    };
})(window);
