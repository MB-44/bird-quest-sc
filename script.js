var Jigsaw = function () {
    var container;
    var puzzleImg = {};
    var pieces = [];
    var gridSize = 3;
    var puzzleSize = 700; 
    var timerInterval;
    var timeRemaining = 3;
    var gameActive = false;

    var Piece = function (row, col, size) {
        this.row = row;
        this.col = col;
        this.originalRow = row;
        this.originalCol = col;
        this.size = size;
        this.newRow = row;
        this.newCol = col;
        this.startRow = row;
        this.startCol = col;

        this.movePiece = function (row, col) {
            this.newRow = row;
            this.newCol = col;
            $(this.pieceEle).animate({
                left: this.newRow * size,
                top: this.newCol * size,
            }, {
                duration: 350,
                easing: 'linear',
                complete: checkWinCondition
            });
        };

        this.createPiece = function (container) {
            this.pieceEle = document.createElement('div');
            $(this.pieceEle).css({
                position: 'absolute',
                left: row * size,
                top: col * size,
                height: (size - 4) + 'px',
                width: (size - 4) + 'px',
                margin: '2px',
                'background-image': 'url(' + puzzleImg.url + ')',
                'background-position-x': -this.row * size + 'px',
                'background-position-y': -this.col * size + 'px',
                'background-size': puzzleSize + 'px',
                'background-repeat': 'no-repeat',
                'cursor': 'pointer',
                'box-sizing': 'border-box',
                'border': '1px solid #aaa'
            });
            $(container).append(this.pieceEle);
        };

        this.removePiece = function () {
            $(this.pieceEle).remove();
        };
    };

    function initPuzzle(opt) {
        opt = opt || {};
        gridSize = Math.max(opt.gridSize || 3, 3);
        container = opt.container;

        $(container).css({
            width: puzzleSize + 'px',
            height: puzzleSize + 'px'
        });

        loadPuzzleImage(opt.image);
    }

    function loadPuzzleImage(image) {
        $('#message').text("Loading puzzle...");

        let img = document.createElement('img');
        img.onload = function () {
            puzzleImg.height = img.naturalHeight;
            puzzleImg.width = img.naturalWidth;
            puzzleImg.url = img.src;

            preparePieces();
            setTimeout(function () {
                resetGame();
                startTimer();
                $('#message').text("");
            }, 1000);
        };
        img.onerror = function() {
            $('#message').text("Error loading image. Using default pattern.");
            createDefaultImage();
        };

        img.src = image || 'https://via.placeholder.com/300';
    }

    function createDefaultImage() {
        puzzleImg.url = '';
        puzzleImg.height = puzzleSize;
        puzzleImg.width = puzzleSize;

        preparePieces();
        setTimeout(function () {
            for (var i = 0; i < pieces.length; i++) {
                var hue = Math.floor(Math.random() * 360);
                $(pieces[i].pieceEle).css({
                    'background-image': 'none',
                    'background-color': 'hsl(' + hue + ', 70%, 60%)',
                });
            }
            resetGame();
            startTimer();
            $('#message').text("");
        }, 1000);
    }

    function startTimer() {
        gameActive = true;
        timeRemaining = 3;
        updateTimerDisplay();

        clearInterval(timerInterval);
        timerInterval = setInterval(function() {
            timeRemaining--;
            updateTimerDisplay();

            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                gameActive = false;
                $('#message').text("You've run out of time! ");
                setTimeout(function(){
                    window.location.href = "end.html?msg=" + encodeURIComponent("You've run out of time! ");
                }, 500);
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        $('#timer').text(timeRemaining);
    }

    function resetGame() {
        for (var i = 0; i < pieces.length; i++) {
            pieces[i].originalRow = pieces[i].row;
            pieces[i].originalCol = pieces[i].col;
        }

        shuffle(pieces);
        var index = 0;
        for (var i = 0; i < gridSize; i++) {
            for (var j = 0; j < gridSize; j++) {
                if (index >= pieces.length) continue;

                var piece = pieces[index];
                piece.movePiece(i, j);
                piece.startRow = i;
                piece.startCol = j;

                $(piece.pieceEle).off('click').on('click', function () {
                    if (!gameActive) return;

                    var clickedPiece;
                    for (var k = 0; k < pieces.length; k++) {
                        if (this === pieces[k].pieceEle) {
                            clickedPiece = pieces[k];
                            break;
                        }
                    }
                    if (!clickedPiece) return;

                    var directions = [
                        {row: 0, col: -1},
                        {row: -1, col: 0},
                        {row: 1, col: 0},
                        {row: 0, col: 1}
                    ];

                    for (var d = 0; d < directions.length; d++) {
                        var newRow = clickedPiece.newRow + directions[d].row;
                        var newCol = clickedPiece.newCol + directions[d].col;

                        if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
                            if (!getPiece(newRow, newCol)) {
                                clickedPiece.movePiece(newRow, newCol);
                                return;
                            }
                        }
                    }
                });

                index++;
            }
        }
        $('#message').text("");
    }

    function checkWinCondition() {
        if (!gameActive) return;

        var win = true;
        for (var i = 0; i < pieces.length; i++) {
            if (pieces[i].newRow !== pieces[i].originalRow || 
                pieces[i].newCol !== pieces[i].originalCol) {
                win = false;
                break;
            }
        }

        if (win) {
            gameActive = false;
            clearInterval(timerInterval);
            $('#message').text("Congratulations! You won!");
            setTimeout(function(){
                window.location.href = "end.html?msg=" + encodeURIComponent("Congratulations! You won!");
            }, 500);
        }
    }

    function getPiece(row, col) {
        for (var i = 0; i < pieces.length; i++) {
            if (pieces[i].newRow === row && pieces[i].newCol === col) {
                return pieces[i];
            }
        }
        return null;
    }

    function preparePieces() {
        pieces = [];
        $(container).empty();

        var pieceSize = puzzleSize / gridSize;
        for (var i = 0; i < gridSize; i++) {
            for (var j = 0; j < gridSize; j++) {
                if (i === gridSize - 1 && j === gridSize - 1) continue;

                var piece = new Piece(i, j, pieceSize);
                piece.createPiece(container);
                pieces.push(piece);
            }
        }
    }

    function shuffle(array) {
        var m = array.length, t, i;
        while (m) {
            i = Math.floor(Math.random() * m--);
            t = array[m];
            array[m] = array[i];
            array[i] = t;
        }
        return array;
    }

    function resetToStart() {
        clearInterval(timerInterval);
        timeRemaining = 3;
        updateTimerDisplay();
        for (var i = 0; i < pieces.length; i++) {
            pieces[i].movePiece(pieces[i].startRow, pieces[i].startCol);
        }
        startTimer();
    }

    return {
        init: initPuzzle,
        restart: function() {
            clearInterval(timerInterval);
            resetGame();
            startTimer();
        },
        reset: resetToStart
    };
};

$(document).ready(function () {
    var jigsaw = new Jigsaw();
    jigsaw.init({
        container: '#puzzle-container',
        image: 'img/bird.png', 
        gridSize: 3
    });

    $('#restart-button').on('click', function() {
        jigsaw.restart();
    });

    $('#reset-button').on('click', function() {
        jigsaw.reset();
    });
});