import { type DailyDate, dailySize, weekdayOf } from './core/daily.ts'
import type { HintKind } from './core/hint.ts'
import { levelName } from './core/level.ts'

const WEEKDAY_NAMES = ['日', '一', '二', '三', '四', '五', '六']

/** "10月12日（一）" */
function dayLabel(date: DailyDate): string {
  const [, month, day] = date.split('-').map(Number)
  return `${month}月${day}日（${WEEKDAY_NAMES[weekdayOf(date)]}）`
}

/** Every piece of interface text, in one place so another language can be added later. */
export const strings = {
  appTitle: 'Queens',
  tagline: '在每一列、每一行、每個區域，各放一個圖案。',
  rulesLink: '遊戲規則',
  editorLink: '題目編輯器',
  backToList: '‹ 題目列表',
  sizeHeading: (size: number) => `${size} × ${size}`,
  levelsHeading: '等級',
  backToLevel: (size: number) => `‹ ${levelName(size)}`,
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
    misplacedQueen: '這個圖案放錯了位置。',
    misplacedMark: '這個 X 擋住了正確答案。',
    placeQueen: '這一格應該放圖案。',
  } satisfies Record<HintKind, string>,
  solvedTitle: '通關！',
  solvedStats: (time: string, hints: number) => `解題時間 ${time} · 使用提示 ${hints} 次`,
  nextPuzzle: '下一題',
  replay: '重玩',
  lastPuzzle: '這是最後一題了！',

  dailyHeading: '每日題目',
  dayLabel,
  dailyCardLine: (date: DailyDate) => `${dayLabel(date)} · ${levelName(dailySize(date))}`,
  dailyTitle: (date: DailyDate) => `每日題目 · ${dayLabel(date)}`,
  dailyLevel: (date: DailyDate) => levelName(dailySize(date)),
  calendarLink: '月曆 ›',
  backToCalendar: '‹ 月曆',
  backToCalendarButton: '回月曆',
  dailyUnavailable: '這一天沒有每日題目。',
  monthTitle: (month: string) => {
    const [year, monthNumber] = month.split('-').map(Number)
    return `${year} 年 ${monthNumber} 月`
  },
  previousMonth: '上個月',
  nextMonth: '下個月',
  /** Calendar column headings, Monday first, so each week reads from the smallest Size to the largest. */
  calendarWeekdays: ['一', '二', '三', '四', '五', '六', '日'],
  generating: '出題中…',
  generateFailed: '這次沒能出好題目，請重新整理再試一次。',

  nightmareHeading: 'Nightmare',
  nightmareEntry: (stage: number, size: number) => `第 ${stage} 關 · ${size} × ${size}`,
  nightmareTitle: (stage: number) => `Nightmare 第 ${stage} 關`,
  nextStage: '下一關',
  toNightmare: '挑戰 Nightmare',

  linkedInTitle: 'LinkedIn Queens',
  linkedInEntry: (count: number, solved: number) => `${count} 題 · 已通關 ${solved}`,
  linkedInNote:
    '這些題目出自 LinkedIn 的每日遊戲 Queens，版權屬於 LinkedIn，經由社群整理的 archivedqueens.com 收集。本站是獨立的同好作品，與 LinkedIn、Microsoft 無關。',
  linkedInPuzzleTitle: (number: number) => `LinkedIn #${number}`,
  backToLinkedIn: '‹ LinkedIn 題目',

  cellLabel: (row: number, col: number, state: string) => `第 ${row + 1} 列第 ${col + 1} 行，${state}`,
  cellStates: { empty: '空白', mark: 'X', queen: '圖案' },
  boardLabel: '盤面',

  rulesTitle: '遊戲規則',
  rules: [
    '目標：每一列、每一行、每個區域（同一種顏色的格子）都恰好有一個圖案。',
    '點一下放 X，再點一下變圖案，再點一下清空。用 X 標記「這裡不能放圖案」。',
    '兩個圖案不能相鄰，斜角相鄰也不行。',
  ],
  rulesTips: '在格子上拖曳可以連續打 X；從 X 開始拖曳則會連續擦掉 X。',
  examplesTitle: '範例',
  examples: {
    row: '一列只能有一個圖案，同一列的其他格子都可以打 X。',
    column: '一行也只能有一個圖案。',
    region: '同一個區域出現兩個圖案時，整個區域會標成紅色。',
    adjacent: '圖案互相碰到（含斜角）時，兩格都會標成紅色。',
  },

} as const
