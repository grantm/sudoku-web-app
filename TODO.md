Example of slow solver
https://sudokuexchange.com/play/?s=000000000500006100060040030020050040300007800001000000000100002430020050600008700&d=3

## Things to do:
(Not necessarily in priority order)

* Switch from deprecated document.fullscreen to document.fullscreenElement
* Investigate check reporting "may not have a unique solution" when no solution
  is possible
* Menu option to share with pencilmarks
* Investigate honouring back button to close modal/menu (without propagating
  state when sharing current URL)
* Tests for UI
* Allow pasting in a digit string in 'enter' mode
* Allow copy to digit string
* Review/playback mode with slider and step buttons
* Allow contributed themes
* Add native sharing implementation (https://css-tricks.com/on-the-web-share-api/)

## Things done
* Track progress in localStorage to allow resume after reload or back/fwd
* Protect against accidental reload or back button with "are you sure you want
  to leave this page?"
* Tests for model
* Render cell layout and text using SVG+CSS
* Mouse input for selecting cells
* Keyboard input for entering/clearing digits
* Keyboard input for selecting cells
* Inner & outer pencil marks
* Enter key to trigger a check & highlight errors
* Undo/redo support
* Set initial digits from querystring
* Input mode for setting initial digits
* Timer
* Highlight matching digits & pencil marks
* On-screen buttons for mobile/touch input
* Adapt screen layout for portrait vs landscape
* Implement restart
* Colour completed digits on virtual keyboard
* Cell colouring
* Pause timer
* Menu option to clear all pencilmarks
* Implement touch event handling
* Allow multiple-cell selection on mobile/touch
* Auto clean pencilmarks
* Double-tap digit to switch to digit mode
* Button to go fullscreen
* Dark mode theme
* Fun visual effect when puzzle is solved
* Block starting if grid has errors
* Validation of digit string in URL (81 digits + no conflicts)
* Settings dialog with selections persisted to LocalStorage
* Help text
* Function to check for unique solutions (new mode)
* Sharing options via social media
* Allow user to share difficulty level and/or solve time
* Add modal to allow selecting from recently shared puzzles
* Option to share via QRcode
