import { Grid } from "./party.store"

export const getGridIndexTo2dCoordinates = (index: number) => {
  switch (index) {
    case 0:
      return { x: 0, y: 0 }
    case 1:
      return { x: 0, y: 1 }
    case 2:
      return { x: 0, y: 2 }
    case 3:
      return { x: 1, y: 0 }
    case 4:
      return { x: 1, y: 1 }
    case 5:
      return { x: 1, y: 2 }
    case 6:
      return { x: 2, y: 0 }
    case 7:
      return { x: 2, y: 1 }
    case 8:
      return { x: 2, y: 2 }
    default:
      return { x: -1, y: -1 }
  }
}

export const get2dCoordinatesToGridIndex = (coordinate: { x: number, y: number }) => {
  if (coordinate.x === 0 && coordinate.y === 0) {
    return 0;
  }
  else if (coordinate.x === 0 && coordinate.y === 1) {
    return 1;
  }
  else if (coordinate.x === 0 && coordinate.y === 2) {
    return 2;
  }
  else if (coordinate.x === 1 && coordinate.y === 0) {
    return 3;
  }
  else if (coordinate.x === 1 && coordinate.y === 1) {
    return 4;
  }
  else if (coordinate.x === 1 && coordinate.y === 2) {
    return 5;
  }
  else if (coordinate.x === 2 && coordinate.y === 0) {
    return 6;
  }
  else if (coordinate.x === 2 && coordinate.y === 1) {
    return 7;
  }
  else if (coordinate.x === 2 && coordinate.y === 2) {
    return 8;
  }
  else {
    return -1;
  }
}

const gridsWinner = (grid: Grid[]) => {
  const lineWon = winByLine(grid)
  if (typeof lineWon === 'number') {
    return { lineWon }
  }

  const columnWon = winByColumn(grid)

  if (typeof columnWon === 'number') {
    return { columnWon }
  }

  const diagonalWon = winByDiagonal(grid)
  if (typeof diagonalWon === 'number') {
    return { diagonalWon }
  }

  const antiDiagonalWon = winByAntiDiagonal(grid)
  if (typeof antiDiagonalWon === 'number') {
    return { antiDiagonalWon }
  }

  return false
}

const winByLine = (grid: Grid[]) => {
  for (let i = 0; i < 3; i++) {
    let first = 0, last = 3;
    const gridSplitted = grid.slice(first, last);
    let hasWon = true
    for (let j = 1; j < 3; j++) {
      if (gridSplitted[0].sign === undefined || gridSplitted[j].sign === undefined || gridSplitted[0].sign !== gridSplitted[j].sign) {
        hasWon = false
        break;
      }
    }
    if (hasWon) {
      return i
    }
    first += 3, last += 3
  }
  return false
}

const winByColumn = (grid: Grid[]) => {
  for (let i = 0; i < 3; i++) {
    const firstValue = grid[i];
    let hasWon = true
    for (let j = i + 3; j <= i + 6; j += 3) {
      if (firstValue.sign === undefined || grid[j].sign === undefined || firstValue.sign !== grid[j].sign) {
        hasWon = false
        break;
      }
    }
    if (hasWon) {
      return i
    }
  }
  return false
}

const winByDiagonal = (grid: Grid[]) => {
  const firstValue = grid[0];
  let hasWon = true
  for (let i = 4; i < 9; i += 4) {
    if (firstValue.sign === undefined || firstValue.sign !== grid[i].sign) {
      hasWon = false
      break;
    }
  }
  if (hasWon) {
    return 0
  }
  return false
}

const winByAntiDiagonal = (grid: Grid[]) => {
  const firstValue = grid[2];
  let hasWon = true
  for (let i = 4; i < 7; i += 2) {
    if (firstValue.sign === undefined || firstValue.sign !== grid[i].sign) {
      hasWon = false
      break;
    }
  }
  if (hasWon) {
    return 2
  }
  return false
}

export const lineGridIndexs = (grid: Grid[]) => {
  const gridWon = gridsWinner(grid)

  if (gridWon) {
    if (typeof gridWon.lineWon === 'number') {
      switch (gridWon.lineWon) {
        case 0:
          return [0, 1, 2]
        case 1:
          return [3, 4, 5]
        case 2:
          return [6, 7, 8]
      }
    }


    if (typeof gridWon.columnWon === 'number') {
      switch (gridWon.columnWon) {
        case 0:
          return [0, 3, 6]
        case 1:
          return [1, 4, 7]
        case 2:
          return [2, 5, 8]
      }
    }

    if (typeof gridWon.diagonalWon === 'number') {
      return [0, 4, 8]
    }

    if (typeof gridWon.antiDiagonalWon === 'number') {
      return [2, 4, 6]
    }
  }
  return []
}