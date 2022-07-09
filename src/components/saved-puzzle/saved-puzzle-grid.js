import SudokuMiniGrid from '../sudoku-grid/sudoku-mini-grid';


function SavedPuzzleGrid({puzzleState, showRatings}) {
    const puzzle = {
        digits: puzzleState.initialDigits,
        completedDigits: puzzleState.completedDigits,
        difficulty: puzzleState.difficultyRating,
    };
    return (
        <SudokuMiniGrid puzzle={puzzle} showRatings={showRatings} />
    );
}


export default SavedPuzzleGrid;
