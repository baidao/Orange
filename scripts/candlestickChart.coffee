'use strict'

define [
  './chart_algorithm'
  ], (ChartAlgorithm) ->
  # 图形type
  quotationTypeMaps =
    '日K': 1
    '周K': 7
    '月K': 30
    '5分': 5
    '10分': 10

  # model
  candlesticklist =
    #proxy
    proxy: {}
    #default
    productId: 1
    #default
    type: '日K'
    #default
    baseUrl: ''
    url: ->
      baseUrl = @baseUrl || throw new Error 'please set the request url in options'
      type = @type or '日K'
      id = @productId
      d = new Date
      tradedate = [d.getFullYear(), (if d.getMonth() < 9 then "0#{d.getMonth()+1}" else d.getMonth() + 1), (if d.getDate() < 9 then "0#{d.getDate()}" else d.getDate())].join ''
      if ['日K', '周K', '月K'].indexOf(type) isnt -1
        limit = 300
        "#{baseUrl}?id=#{id}&quotationType=#{quotationTypeMaps[@type]}&limit=#{limit}&tradedate=#{tradedate}"
      else
        limit = 300
        "#{baseUrl}?id=#{id}&quotationType=#{quotationTypeMaps[@type]}&limit=#{limit}&tradeDate=#{tradedate}"

    setProductId: (id) ->
      @productId = id

    setType: (type) ->
      @type = type

    setBaseUrl: (baseUrl) ->
      @baseUrl = baseUrl

    handleData: (data) ->
      if '5分' is @type
        returnedNumber = 66
      else if '日K' is @type
        returnedNumber = 66
      else if '周K' is @type
        returnedNumber = 66
      else if '月K' is @type
        returnedNumber = 66
      else
        returnedNumber = 120
      ohlc = []
      for item in data
        if item.tradedate.indexOf(' ') isnt -1
          updatedAt = [item['tradedate'].slice(0,4), '/', item['tradedate'].slice(4,6), '/', item['tradedate'].slice(6)].join('')
          dateValue = new Date(updatedAt) - 0
        else
          updatedAt = [item['tradedate'].slice(0,4), '/', item['tradedate'].slice(4,6), '/', item['tradedate'].slice(6,8)].join('')
          dateValue = new Date(updatedAt) - 0
        ohlc.push [
          dateValue,
          item.open,
          item.high,
          item.low,
          item.close
        ]
      result = {}
      macd = ChartAlgorithm.getMACD(data)

      ohlcLen = ohlc.length
      result.ohlc = ohlc[ohlcLen-returnedNumber..ohlcLen-1]

      min = result.ohlc[0][3]
      max = result.ohlc[0][2]
      for item in result.ohlc
        min = item[3] if item[3] < min
        max = item[2] if item[2] > max

      result.min = min
      result.max = max
      PMA5 = ChartAlgorithm.getPMA(data, 5)
      result.PMA5 = PMA5[PMA5.length-returnedNumber..PMA5.length-1]
      PMA10 = ChartAlgorithm.getPMA(data, 10)
      result.PMA10 = PMA10[PMA10.length-returnedNumber..PMA10.length-1]
      PMA20 = ChartAlgorithm.getPMA(data, 20)
      result.PMA20 = PMA20[PMA20.length-returnedNumber..PMA20.length-1]
      MACDLen = macd.MACD.length
      result.MACD = macd.MACD[MACDLen-returnedNumber..MACDLen]
      DIFLen = macd.DIF.length
      result.DIF = macd.DIF[DIFLen-returnedNumber..DIFLen]
      DEALen = macd.DEA.length
      result.DEA = macd.DEA[DEALen-returnedNumber..DEALen]
      @data = result

    fetch: () ->
      @trigger('CandleStickDataFetchStart')
      $.get @url(), (resp) =>
        @handleData JSON.parse(resp).datas
        @trigger('CandleStickDataFetched')
        @trigger('CandleStickDataFetchEnd')

    on: (event, method) ->
      @proxy[event] = [] unless @proxy[event]
      @proxy[event].push method

    trigger: (event) ->
      method() for method in @proxy[event]

  class CandleStickChart
    constructor: (element, opts) ->
      @initProductInfo opts
      @initChartParams()      
      @cacheElements element
      @bindEvents()
      @listenEvents()
      @fetch()

    initProductInfo: (opts) ->
      @setProductId opts.productId
      @setType opts.type
      @setBaseUrl opts.baseUrl

    initChartParams: ->
      @PMA5Color = '#11f0c3'
      @PMA10Color = '#ff4c94'
      @PMA20Color = '#ffb400'

    setProductId: (productId) ->
      candlesticklist.setProductId productId if productId

    setType: (type) ->
      candlesticklist.setType type if type

    setBaseUrl: (baseUrl) ->
      candlesticklist.setBaseUrl baseUrl

    cacheElements: (element) ->
      @$el = $ element
      @loading = $('<div class="loading-placeholder-graph translate-center">')

    bindEvents: ->
      $(window).bind 'resize', (e) => @renderCandleStickChart()

    listenEvents: ->
      candlesticklist.on 'CandleStickDataFetchStart', @showLoading.bind @
      candlesticklist.on 'CandleStickDataFetchEnd', @hideLoading.bind @
      candlesticklist.on 'CandleStickDataFetched', @renderCandleStickChart.bind @

    fetch: ->
      candlesticklist.fetch()

    showLoading: ->
      @$el.append @loading

    hideLoading: ->
      @loading.remove()

    renderCandleStickChart: () ->
      currentPMA5 = Math.round candlesticklist.data.PMA5[candlesticklist.data.PMA5.length-1][1]
      currentPMA10 = Math.round candlesticklist.data.PMA10[candlesticklist.data.PMA10.length-1][1]
      currentPMA20 = Math.round candlesticklist.data.PMA20[candlesticklist.data.PMA20.length-1][1]

      subtitleText = '<span style="color:' + @PMA5Color + '; margin-right: 6px">5MA:' + currentPMA5 + '</span>'
      subtitleText += '<span style="color:' + @PMA10Color + '; margin-right: 6px">10MA:' + currentPMA10 + '</span>'
      subtitleText += '<span style="color:' + @PMA20Color + '; margin-right: 6px">20MA:' + currentPMA20 + '</span>'
      @chart = new Highcharts.Chart @createOptions 
        data: candlesticklist.data
        subtitleText: subtitleText
        renderTo: @$el.get(0)

    createOptions: (options) ->
      ohlc = null
      tickPixelInterval = 80
      ((type) ->
        switch type
          when '5分'
            tickPixelInterval = 50
            xLabelFormatter = 'HH:mm'
          when '10分'
            tickPixelInterval = 50
            xLabelFormatter = 'HH:mm'
      )(options.type)
      width = $(window).width()
      height = $(window).height() - (if window.innerWidth < window.innerHeight then 188 else 45)
      chart:
        width: width
        animation: false
        height: height
        plotBorderWidth: 1
        borderColor: '#2c2c2c'
        plotBorderColor: '#2c2c2c'
        marginRight: 0
        marginLeft: 0
        backgroundColor: '#1f1d1d'
        renderTo: options.renderTo
      tooltip: false
      navigator: false
      scrollbar: false
      rangeSelector: false
      title:
        text: ''
      subtitle:
        align: 'left'
        useHTML: 'true'
        text: options.subtitleText or ''
      loading:
        style:
          backgroundColor: ''
          backgroundRepeat: "no-repeat"
          backgroundPosition: "center center"
      yAxis:[
        min: options.data.min or null
        max: options.data.max or null
        offset: 0
        height: 8 / 15 * height
        gridLineWidth: 1
        gridLineColor: '#2c2c2c'
        lineWidth: 1
        lineColor: '#2c2c2c'
        startOnTick: false
        labels:
          align: 'left'
          x: 5
          y: 5
          style:
            color: '#999'
            fontSize: '0.75rem'
            fontFamily: "HelveticaNeueLTPro"
        showFirstLabel: true
        showLastLabel: true
      ,
        top: 11 / 15 * height
        height: height / 4
        offset: 0
        lineWidth: 1
        endOnTick: true
        gridLineWidth: 1
        gridLineColor: '#2c2c2c'
        lineColor: '#2c2c2c'
        showLastLabel: true
        labels:
          align: 'left'
          x: 5
          y: 5
          style:
            color: '#999'
            fontSize: '0.75rem'
            fontFamily: "HelveticaNeueLTPro"
      ]
      xAxis: [
        labels:
          formatter: ->
            d = new Date @value
            [d.getFullYear(), (if d.getMonth() < 9 then "0#{d.getMonth()+1}" else d.getMonth() + 1), (if d.getDate() < 9 then "0#{d.getDate()}" else d.getDate())].join '/'
          style:
            color: '#999'
            fontSize: '0.75rem'
            fontFamily: "HelveticaNeueLTPro"
        lineColor: '#2c2c2c'
        tickLength: 5
        tickWidth: 1
        lineWidth: 1
        startOnTick: false
        endOnTick: false
        tickColor: '#2c2c2c'
        tickPixelInterval: tickPixelInterval
      ]
      plotOptions:
        candlestick:
          color: '#33ff33'
          upColor: '#ff2d19'
          lineColor: '#33ff33'
          upLineColor: '#ff2d19'
          dataGrouping: false
        column:
          dataGrouping:
            enabled: false
        line:
          lineWidth: 1
      series:[
        type: 'line'
        data: options.data.ohlc or []
        yAxis: 0
        name: 'K线'
        animation: false
      ,
        type: 'line'
        data: options.data.PMA5 or []
        yAxis: 0
        color: @PMA5Color
        width: 1
        name: 'PMA5'
        animation: false
      ,
        type: 'line'
        data: options.data.PMA10 or []
        yAxis: 0
        color: @PMA10Color
        width: 1
        name: 'PMA10'
        animation: false
      ,
        type: 'line'
        data: options.data.PMA20 or []
        yAxis: 0
        color: @PMA20Color
        width: 1
        name: 'PMA20'
        animation: false
      ,
        data: options.data.MACD or []
        type: 'column'
        yAxis: 1
        name: 'MACD'
        animation: false
      ,
        data: options.data.DEA or []
        type: 'line'
        yAxis: 1
        color: 'red'
        name: 'DEA'
        animation: false
      ,
        data: options.data.DIF or []
        type: 'line'
        yAxis: 1
        color: 'green'
        name: 'DIF'
        animation: false
      ]
      credits: false

  $.CandleStickChart = CandleStickChart
  $.fn.CandleStickChart = (option) ->
    @each (index, element) ->
      candlestickchart = new CandleStickChart element, option