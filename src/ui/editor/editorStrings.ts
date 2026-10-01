import type { CatalogProblem } from '../../core/catalog.ts'
import { MAX_SIZE, MIN_SIZE } from '../../core/rules.ts'
import type { EditorErrorKind } from './editorProtocol.ts'

/** Editor text, kept beside the dev-only editor so it never ships in the production build. */
export const editorStrings = {
  title: '題目編輯器',
  newPuzzle: '＋ 新增題目',
  libraryHeading: '題庫',
  libraryProblems: '有問題的檔案（未載入遊戲）',
  libraryProblem: (problem: CatalogProblem) =>
    `${problem.file.size}/${problem.file.name}：${
      {
        invalidName: '題目名稱不合規則',
        unreadable: '內容無法讀取',
        notAPuzzle: '不是合格的題目',
        wrongSizeFolder: '放錯尺寸資料夾',
        duplicate: '與其他題目重複',
      }[problem.kind]
    }`,
  notFound: '找不到這個題目，已改為新增題目。',
  size: '尺寸',
  name: '題目名稱',
  namePlaceholder: '例如 spiral-hard',
  nameRule: '題目名稱只能用小寫英文、數字、- 和 _。',
  eraser: '⌫',
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
  regionCount: (used: number, total: number) => `已使用 ${used} / ${total} 個區域。`,
  valid: '✓ 唯一解，可以儲存。',
  unassigned: (count: number) => `還有 ${count} 格沒有指定區域。`,
  missingRegions: (letters: string) => `還沒使用的區域：${letters}。`,
  disconnected: (letters: string) => `區域 ${letters} 沒有連在一起（斜角相接不算）。`,
  noSolution: '這個題目無解。',
  multipleSolutions: '這個題目有多個解，盤面上標出其中兩個（1 和 2），分歧處附近的區域需要調整。',
  errors: {
    invalidName: '題目名稱不合規則。',
    invalidSize: `尺寸必須介於 ${MIN_SIZE} 到 ${MAX_SIZE}。`,
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
} as const
