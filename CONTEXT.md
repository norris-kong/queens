# Queens

一款邏輯解謎遊戲：玩家在分成多個顏色 Region 的方形格盤上擺放 Queen，目標是每一列、每一行、每個 Region 都恰好有一個 Queen，且任兩個 Queen 互不相鄰。

## Language

**Puzzle**（題目）:
一個 N×N 的格盤，以及把它劃分成 N 個 Region 的方式；必須恰好有一個 Solution。Puzzle 的身份就是它的 Region 劃分：劃分改了，就是另一個 Puzzle。
_Avoid_: Map, layout, stage

**Puzzle Name**（題目名稱）:
作者替 Puzzle 取的名字，同一個 Size 內不可重複（不分大小寫）；新題目預設為所屬 Level 加流水號，例如 Beginner 1。決定題目在清單上的顯示順序，但不影響 Puzzle 的身份。玩家看不到 Puzzle Name，只看到 Level 和編號。
_Avoid_: Filename, title, ID

**Draft**（草稿）:
編輯中的 Region 劃分，還不保證符合 Puzzle 的條件（N×N、每個 Cell 都已分配、N 個相連的 Region、恰好一個 Solution）。全部符合後才能成為 Puzzle。
_Avoid_: Unfinished puzzle, template

**Size**（尺寸）:
Puzzle 的邊長 N（4 到 12），同時也是 Region 數與 Solution 中的 Queen 數。玩家看到的是它的 Level。
_Avoid_: Dimension

**Level**（關卡）:
Size 在玩家面前的名稱，與 Size 一一對應：4 Beginner、5 Easy、6 Relaxed、7 Normal、8 Intermediate、9 Challenging、10 Hard、11 Expert、12 Master。題目列表以 Level 分組，每個 Puzzle 只以編號呈現。
_Avoid_: Difficulty, tier, stage（Level 只由 Size 決定，不是替個別 Puzzle 評的難度）

**Solution**（解答）:
一組 N 個 Queen 的擺放位置，使每一列、每一行、每個 Region 都恰好有一個 Queen，且任兩個 Queen 不相鄰（含斜角）。由 Puzzle 的 Region 劃分推導而來，不是另外指定的。
_Avoid_: Answer, key

**Cell**（格子）:
格盤上的一個方格，恰好屬於一個 Region。
_Avoid_: Square, tile

**Region**（區域）:
格盤上以同一顏色標示、上下左右相連的一組 Cell（只靠斜角相接不算相連）；完成時每個 Region 內恰好有一個 Queen。
_Avoid_: Color region, area, zone, 色塊

**Queen**（皇后）:
玩家放在 Cell 上的棋子，畫面上以皇冠圖示呈現。
_Avoid_: W, crown, 皇冠

**Mark**（標記）:
玩家放在 Cell 上的註記，表示「判斷這格不能放 Queen」，畫面上顯示為 X。
_Avoid_: X, cross, flag

**Board**（盤面）:
玩家解某個 Puzzle 時的當前進度：每個 Cell 是空白、Mark 或 Queen 三者之一。Puzzle 本身不變，Board 會隨玩家操作改變。
_Avoid_: Grid, game state, progress

**Move**（一步）:
玩家一次改變 Board 的操作：一次點擊、一整次拖曳，或一次 Reset。沒有改變 Board 的操作不算 Move。Undo 一次退回一個 Move。
_Avoid_: Action, step, turn

**Conflict**（衝突）:
Board 上 Queen 與 Queen 之間的規則違反：同列、同行、同 Region，或相鄰（含斜角）。只看 Board 就能判定，不需要 Solution。
_Avoid_: Violation, error

**Solved**（通關）:
Board 上恰好有 N 個 Queen 且沒有任何 Conflict 的狀態；因為 Solution 唯一，此時 Queen 的位置必定等於 Solution。與 Mark 無關。
_Avoid_: Win, complete, cleared

**Hint**（提示）:
玩家主動請求的協助：系統在 Board 上標示一個位置（一個 Mistake，或一個該放 Queen 的 Cell）。只標示、不改變 Board，不算 Move。
_Avoid_: Clue, tip, Locate

**Solve Time**（解題時間）:
玩家在某個 Puzzle 上實際花費的時間；只在遊戲畫面可見時累積，Reset 不會歸零，Solved 時停止。
_Avoid_: Timer, clock, elapsed

**Mistake**（錯誤）:
Board 上與 Solution 不一致的內容：放在 Solution 以外的 Queen，或打在 Solution 位置上的 Mark。必須對照 Solution 才能判定。
_Avoid_: Wrong move, error
