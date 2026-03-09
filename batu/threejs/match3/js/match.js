(function (window) {
    'use strict';

    function toKey(row, col) {
        return row + ':' + col;
    }

    function addCells(matchMap, cells) {
        for (var i = 0; i < cells.length; i += 1) {
            var row = cells[i].row;
            var col = cells[i].col;
            matchMap[toKey(row, col)] = {
                row: row,
                col: col
            };
        }
    }

    function getPatternColor(board, cells) {
        if (cells.length === 0) {
            return -1;
        }

        var color = board.getColor(cells[0].row, cells[0].col);
        if (color < 0) {
            return -1;
        }

        for (var i = 1; i < cells.length; i += 1) {
            if (board.getColor(cells[i].row, cells[i].col) !== color) {
                return -1;
            }
        }

        return color;
    }

    function tryMatchPattern(board, cells, matchMap) {
        if (getPatternColor(board, cells) >= 0) {
            addCells(matchMap, cells);
        }
    }

    function detectSquareMatches(board, matchMap) {
        var rows = board.getRows();
        var cols = board.getCols();

        for (var row = 0; row < rows - 1; row += 1) {
            for (var col = 0; col < cols - 1; col += 1) {
                tryMatchPattern(board, [
                    { row: row, col: col },
                    { row: row, col: col + 1 },
                    { row: row + 1, col: col },
                    { row: row + 1, col: col + 1 }
                ], matchMap);
            }
        }
    }

    function detectLMatches(board, matchMap) {
        var rows = board.getRows();
        var cols = board.getCols();

        for (var row = 0; row < rows - 2; row += 1) {
            for (var col = 0; col < cols - 2; col += 1) {
                // L-right:
                // xxx
                //   x
                //   x
                tryMatchPattern(board, [
                    { row: row, col: col },
                    { row: row, col: col + 1 },
                    { row: row, col: col + 2 },
                    { row: row + 1, col: col + 2 },
                    { row: row + 2, col: col + 2 }
                ], matchMap);

                // L-left:
                // xxx
                // x
                // x
                tryMatchPattern(board, [
                    { row: row, col: col },
                    { row: row, col: col + 1 },
                    { row: row, col: col + 2 },
                    { row: row + 1, col: col },
                    { row: row + 2, col: col }
                ], matchMap);
            }
        }
    }

    function detectTMatches(board, matchMap) {
        var rows = board.getRows();
        var cols = board.getCols();

        for (var row = 0; row < rows - 3; row += 1) {
            for (var col = 0; col < cols - 2; col += 1) {
                // T-left:
                // x
                // xxx
                // x
                // x
                tryMatchPattern(board, [
                    { row: row, col: col },
                    { row: row + 1, col: col },
                    { row: row + 1, col: col + 1 },
                    { row: row + 1, col: col + 2 },
                    { row: row + 2, col: col },
                    { row: row + 3, col: col }
                ], matchMap);

                // T-right:
                //   x
                // xxx
                //   x
                //   x
                tryMatchPattern(board, [
                    { row: row, col: col + 2 },
                    { row: row + 1, col: col },
                    { row: row + 1, col: col + 1 },
                    { row: row + 1, col: col + 2 },
                    { row: row + 2, col: col + 2 },
                    { row: row + 3, col: col + 2 }
                ], matchMap);
            }
        }
    }

    function detectLinePatterns(board) {
        var rows = board.getRows();
        var cols = board.getCols();
        var patterns = [];
        var row;
        var col;

        for (row = 0; row < rows; row += 1) {
            col = 0;
            while (col < cols) {
                var color = board.getColor(row, col);
                if (color < 0) {
                    col += 1;
                    continue;
                }

                var endCol = col;
                while (endCol + 1 < cols && board.getColor(row, endCol + 1) === color) {
                    endCol += 1;
                }

                var runLength = endCol - col + 1;
                if (runLength >= 3 && runLength <= 5) {
                    var horizontalPattern = [];
                    for (var markCol = col; markCol <= endCol; markCol += 1) {
                        horizontalPattern.push({
                            row: row,
                            col: markCol
                        });
                    }
                    patterns.push(horizontalPattern);
                }

                col = endCol + 1;
            }
        }

        for (col = 0; col < cols; col += 1) {
            row = 0;
            while (row < rows) {
                var verticalColor = board.getColor(row, col);
                if (verticalColor < 0) {
                    row += 1;
                    continue;
                }

                var endRow = row;
                while (endRow + 1 < rows && board.getColor(endRow + 1, col) === verticalColor) {
                    endRow += 1;
                }

                var verticalLength = endRow - row + 1;
                if (verticalLength >= 3 && verticalLength <= 5) {
                    var verticalPattern = [];
                    for (var markRow = row; markRow <= endRow; markRow += 1) {
                        verticalPattern.push({
                            row: markRow,
                            col: col
                        });
                    }
                    patterns.push(verticalPattern);
                }

                row = endRow + 1;
            }
        }

        return patterns;
    }

    function findMatches(board) {
        var matchMap = {};
        var specialMatchMap = {};
        var matchedCells = [];
        var linePatterns = [];
        var lineIndex;

        detectSquareMatches(board, specialMatchMap);
        detectLMatches(board, specialMatchMap);
        detectTMatches(board, specialMatchMap);

        for (var specialKey in specialMatchMap) {
            if (Object.prototype.hasOwnProperty.call(specialMatchMap, specialKey)) {
                matchMap[specialKey] = specialMatchMap[specialKey];
            }
        }

        linePatterns = detectLinePatterns(board);
        for (lineIndex = 0; lineIndex < linePatterns.length; lineIndex += 1) {
            var pattern = linePatterns[lineIndex];
            var overlapWithSpecial = 0;
            var extraOutsideSpecial = 0;

            for (var patternCellIndex = 0; patternCellIndex < pattern.length; patternCellIndex += 1) {
                var patternCell = pattern[patternCellIndex];
                var key = toKey(patternCell.row, patternCell.col);

                if (specialMatchMap[key]) {
                    overlapWithSpecial += 1;
                } else {
                    extraOutsideSpecial += 1;
                }
            }

            if (overlapWithSpecial >= 2 && extraOutsideSpecial > 0) {
                continue;
            }

            addCells(matchMap, pattern);
        }

        for (var key in matchMap) {
            if (Object.prototype.hasOwnProperty.call(matchMap, key)) {
                matchedCells.push(matchMap[key]);
            }
        }

        return matchedCells;
    }

    window.GameMatch = {
        findMatches: findMatches
    };
})(window);
