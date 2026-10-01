# Puzzle 的身份由 Region 劃分決定

進度存檔（Board、Solve Time、Hint 次數、是否 Solved）以 Puzzle 的 Region 劃分算出的指紋當作鍵，而不是檔案路徑或清單上的編號。因此用編輯器改動 Region 就等於產生一個新的 Puzzle：舊的存檔與通關打勾不再對應，玩家看到的是一題全新的題目。只換 Region 的字母（也就是顏色）則不算改動。這樣舊 Board 永遠不會套到不同的 Region 劃分上，也能在驗證時擋掉重複的題目；畫面上的「#3」只是依檔案排序的顯示編號。

## Considered Options

- **用檔案路徑當身份**：改動題目後身份不變，玩家的舊 Board 會套在新的 Region 上，產生莫名其妙的 Conflict。已否決。
