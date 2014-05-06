'use strict'
# will be used for candlestick chart
define [], ->
  getDate = (dateStr) ->
    if dateStr.indexOf(' ') isnt -1
      updatedAt = [dateStr.slice(0,4), '/', dateStr.slice(4,6), '/', dateStr.slice(6)].join('')
      dateValue = new Date(updatedAt) - 0
    else
      updatedAt = [dateStr.slice(0,4), '/', dateStr.slice(4,6), '/', dateStr.slice(6,8)].join('')
      dateValue = new Date(updatedAt) - 0

  getPMA: (data, n) ->
    PMA = []
    sum = 0
    for i of data
      if i >= n
        sum += (data[i].close - data[i-n].close)
        PMA.push([getDate(data[i].tradedate), sum / n])
      else
        sum += data[i].close
    PMA

  getMACD: (data) ->
    sum = 0
    sumd = 0
    n = n || 12
    m = m || 26
    n1 = n1 || 9
    DI = []
    AX = []
    BX = []
    MACD = []
    DIF = []
    DEA = []
    for i in [0...data.length]
      DI.push (data[i].high+data[i].low+data[i].close*2)/4
      sum += DI[i]
      #AX数据
      if ((i+1) <= (n-1))
        AX.push 0
      else if i+1 == n
        AX.push sum / n
      else
        AX.push AX[i-1]* (n-1)/ (n+1) + data[i].close*2/(n+1)

      if i+1 <= m-1
        BX.push 0
        DIF.push [getDate(data[i].tradedate), 0]
      else if i+1 is m
        BX.push sum / m
        DIF.push [getDate(data[i].tradedate), AX[i]-BX[i]]
      else
        BX.push BX[i-1]* (m-1)/ (m+1) + data[i].close*2/(m+1)
        DIF.push [getDate(data[i].tradedate), AX[i]-BX[i]]

      sumd += DIF[i][1]
      if i+1 <= m+n1-2
        DEA.push [getDate(data[i].tradedate), 0]
      else if (i+1) is (m+n1-1)
        DEA.push [getDate(data[i].tradedate), sumd / n1]
      else
        value = DIF[i-1][1]*(n1-1) / (n1+1) + DIF[i][1]*2 / (n1+1)
        DEA.push [getDate(data[i].tradedate),value]
      MACDValue = (DIF[i][1]-DEA[i][1])*2
      MACD.push x: getDate(data[i].tradedate), y: MACDValue, color: if MACDValue >=0 then "#ff2d19" else "#33ff33"
    MACD: MACD
    DIF: DIF
    DEA: DEA