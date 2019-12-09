import React from 'react';
import './app.css';

import SudokuGrid from '../sudoku-grid/sudoku-grid';

function App({cells}) {
    return (
        <div className="app">
            <SudokuGrid cells={cells}/>
        </div>
    );
}

export default App;
