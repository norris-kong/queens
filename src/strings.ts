import type { HintKind } from './core/hint.ts'
import { levelName } from './core/level.ts'

/** Every piece of interface text, in one place so another language can be added later. */
export const strings = {
  appTitle: 'Queens',
  tagline: '在每一列、每一行、每個區域，各放一個皇后。',
  rulesLink: '遊戲規則',
  editorLink: '題目編輯器',
  backToList: '‹ 題目列表',
  sizeHeading: (size: number) => `${size} × ${size}`,
  levelHeading: levelName,
  puzzleLabel: (number: number, name: string) => `#${number} ${name}`,
  puzzleTitle: (size: number, number: number) => `${levelName(size)} ${number}`,
  status: {
    solved: { icon: '✓', label: '已通關' },
    inProgress: { icon: '●', label: '進行中' },
  },
  emptyLibrary: '題庫裡還沒有題目。',
  puzzleNotFound: '找不到這個題目，可能已被刪除或改名。',
  pageNotFound: '找不到這個頁面。',

  undo: '復原',
  reset: '重來',
  hint: '提示',
  hints: {
    misplacedQueen: '這個皇后放錯了位置。',
    misplacedMark: '這個 X 擋住了正確答案。',
    placeQueen: '這一格應該放皇后。',
  } satisfies Record<HintKind, string>,
  solvedTitle: '通關！',
  solvedStats: (time: string, hints: number) => `解題時間 ${time} · 使用提示 ${hints} 次`,
  nextPuzzle: '下一題',
  replay: '重玩',
  lastPuzzle: '這是最後一題了！',

  cellLabel: (row: number, col: number, state: string) => `第 ${row + 1} 列第 ${col + 1} 行，${state}`,
  cellStates: { empty: '空白', mark: 'X', queen: '皇后' },
  boardLabel: '盤面',

  rulesTitle: '遊戲規則',
  rules: [
    '目標：每一列、每一行、每個區域（同一種顏色的格子）都恰好有一個皇后。',
    '點一下放 X，再點一下變皇后，再點一下清空。用 X 標記「這裡不能放皇后」。',
    '兩個皇后不能相鄰，斜角相鄰也不行。',
  ],
  rulesTips: '在格子上拖曳可以連續打 X；從 X 開始拖曳則會連續擦掉 X。',
  examplesTitle: '範例',
  examples: {
    row: '一列只能有一個皇后，同一列的其他格子都可以打 X。',
    column: '一行也只能有一個皇后。',
    region: '同一個區域出現兩個皇后時，整個區域會標成紅色。',
    adjacent: '皇后互相碰到（含斜角）時，兩格都會標成紅色。',
  },

} as const
