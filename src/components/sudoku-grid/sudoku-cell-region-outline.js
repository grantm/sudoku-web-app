import { calculateOutlinePath } from '../../lib/region-outlines';

export default function SudokuCellRegionOutline({className, cellSet, dim}) {
    if (!cellSet || cellSet.length === 0) {
        return null;
    }
    const cellDim = dim.cell;
    const pointOffset = dim.outlinePoints;
    const pathData = calculateOutlinePath(cellSet).map(step => {
        const [i, p, op] = step;
        const svgOp = op === 'm' ? 'M' : 'L';
        const x = cellDim[i].x + pointOffset[p][0];
        const y = cellDim[i].y + pointOffset[p][1];
        return `${svgOp} ${x} ${y}`;
    }).join(' ');
    return <path className={className} d={pathData} strokeLinecap="round" strokeLinejoin="round" />;
}
