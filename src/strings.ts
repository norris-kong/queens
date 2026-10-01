import type { CatalogProblem } from './core/catalog.ts'
import type { HintKind } from './core/hint.ts'
import type { EditorErrorKind } from './ui/editor/editorApi.ts'

/** Every piece of interface text, in one place so another language can be added later. */
export const strings = {
  appTitle: 'Queens',
  tagline: '在每一列、每一行、每個顏色區域，各放一個皇后。',
  rulesLink: '遊戲規則',
  editorLink: '題目編輯器',
  backToList: '‹ 題目列表',
  sizeHeading: (size: number) => `${size} × ${size}`,
  puzzleLabel: (number: number, name: string | null) => (name === null ? `#${number}` : `#${number} ${name}`),
  puzzleTitle: (size: number, number: number, name: string | null) =>
    `${size}×${size} #${number}${name === null ? '' : ` ${name}`}`,
  statusCompleted: '已完成',
  statusInProgress: '進行中',
  emptyLibrary: '題庫裡還沒有題目。',
  puzzleNotFound: '找不到這個題目，可能已被刪除或改名。',
  pageNotFound: '找不到這個頁面。',

  undo: '復原',
  reset: '重來',
  hint: '提示',
  hints: {
    wrongQueen: '這個皇后放錯了位置。',
    wrongMark: '這個 X 擋住了正確答案。',
    placeQueen: '這一格應該放皇后。',
  } satisfies Record<HintKind, string>,
  solvedTitle: '完成！',
  solvedStats: (time: string, hints: number) => `解題時間 ${time} · 使用提示 ${hints} 次`,
  nextPuzzle: '下一題',
  replay: '重玩',
  lastPuzzle: '這是最後一題了！',

  cellLabel: (row: number, col: number, state: string) => `第 ${row + 1} 列第 ${col + 1} 行，${state}`,
  cellStates: { empty: '空白', mark: 'X', queen: '皇后' },
  boardLabel: '盤面',

  rulesTitle: '遊戲規則',
  rules: [
    '目標：每一列、每一行、每個顏色區域都恰好有一個皇后。',
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

  editor: {
    title: '題目編輯器',
    newPuzzle: '＋ 新增題目',
    libraryHeading: '題庫',
    libraryProblems: '有問題的檔案（未載入遊戲）',
    libraryProblem: (problem: CatalogProblem) =>
      `${problem.file.size}/${problem.file.name}：${
        {
          invalidName: '檔名不合規則',
          unreadable: '內容無法讀取',
          notAPuzzle: '不是合格的題目',
          wrongSizeFolder: '放錯尺寸資料夾',
          duplicate: '與其他題目重複',
        }[problem.kind]
      }`,
    notFound: '找不到這個題目，已改為新增題目。',
    size: '尺寸',
    name: '檔名',
    namePlaceholder: '例如 spiral-hard',
    nameRule: '檔名只能用小寫英文、數字、- 和 _。',
    eraser: '橡皮擦',
    regionSwatch: (letter: string) => `區域 ${letter}`,
    eraserLabel: '橡皮擦：把格子改回未分配',
    confirmResize: '改變尺寸會清空目前的盤面，確定嗎？',
    confirmDelete: (name: string) => `確定要刪除「${name}」嗎？`,
    save: '儲存',
    saving: '儲存中…',
    playtest: '試玩',
    backToEditing: '‹ 回到編輯',
    remove: '刪除',
    reportHeading: '檢查結果',
    valid: '✓ 唯一解，可以儲存。',
    unassigned: (count: number) => `還有 ${count} 格沒有指定區域。`,
    missingRegions: (letters: string) => `還沒使用的區域：${letters}。`,
    disconnected: (letters: string) => `區域 ${letters} 沒有連在一起（斜角相接不算）。`,
    noSolution: '這個題目無解。',
    multipleSolutions: '這個題目有多個解，盤面上標出其中兩個（1 和 2），分歧處附近的區域需要調整。',
    errors: {
      invalidName: '檔名不合規則。',
      invalidSize: '尺寸必須介於 4 到 12。',
      unreadable: '題目內容無法讀取。',
      notAPuzzle: '這還不是合格的題目。',
      wrongSize: '題目尺寸與資料夾不符。',
      nameTaken: '這個尺寸已經有同名的題目。',
      duplicate: '題庫裡已經有一模一樣的題目。',
      notFound: '原本的題目已經不存在。',
      badRequest: '請求格式錯誤。',
      serverError: '開發伺服器發生錯誤，請看終端機的訊息。',
      network: '連不到開發伺服器，請確認 pnpm dev 正在執行。',
    } satisfies Record<EditorErrorKind, string>,
    duplicateOf: (size: number, name: string) => `（與 ${size}/${name} 相同）`,
  },
} as const
