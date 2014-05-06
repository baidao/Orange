'use strict'

# highcharts loaded in require main file
# require jquery
define [], ->
  # productIdMap
  productIdMap = 
    "1":
      name: "现货白银"
      unit: "元/千克"
    "101":
      name: "黄金延期"
      unit: "元/克"
    "102":
      name: "白银延期"
      unit: "元/千克"
    "201":
      name: "伦敦金"
      unit: "美元/盎司"
    "202":
      name: "伦敦银"
      unit: "美元/盎司"
    "205":
      name: "香港黄金"
      unit: "港元/港两"
    "301":
      name: "美元指数"
      unit: "--"
    "302":
      name: "原油指数"
      unit: "美元/桶"
    "401":
      name: "现货白银9999"
      unit: "元/千克"
    "402":
      name: "现货白银9995"
      unit: "元/千克"

  #model
  timesharingList =
    #proxy
    proxy:{}
    #default
    productId: 1
    #default
    baseUrl: ''
    url: ->
      baseUrl = @baseUrl || throw new Error 'please set the request url in options'
      "#{baseUrl}?quotationType=1&id=#{@productId}"

    setProductId: (id) ->
      @productId = id

    setBaseUrl: (baseUrl) ->
      @baseUrl = baseUrl

    handleData: (list) ->
      list = list.filter (item) ->
        item['close'] isnt 0
      len = list.length
      list = list.slice if len - 300 >= 0 then len - 300 else 0
      data = []
      list.forEach (item) ->
        updatedAt = [item['updatetime'].slice(0, 4), '/', item['updatetime'].slice(4, 6), '/', item['updatetime'].slice(6)].join('');
        updatedAt = new Date(updatedAt) - 0;
        if item['close'] isnt 0
          price = item.close
          data.push [updatedAt, price]
      @data = data

    get: ->
      @data

    fetch: ->
      @trigger('TimeSharingDataFetchStart')
      $.get @url(), (resp) =>
        @handleData JSON.parse(resp).datas
        @trigger('TimeSharingDataFetched')
        @trigger('TimeSharingDataFetchEnd')

    on: (event, method) ->
      @proxy[event] = [] unless @proxy[event]
      @proxy[event].push method

    trigger: (event) ->
      method() for method in @proxy[event]

  class TimeSharingChart
    constructor: (element, opts) ->
      @initProductInfo opts
      @cacheElements element
      @bindEvents()
      @listenEvents()
      @fetch()

    initProductInfo: (opts) ->
      @setProductId opts.productId
      @setBaseUrl opts.baseUrl

    setProductId: (productId) ->
      timesharingList.setProductId productId if productId

    setBaseUrl: (baseUrl) ->
      timesharingList.setBaseUrl baseUrl

    cacheElements: (element) ->
      @$el = $ element
      @loading = $('<div class="loading-placeholder-graph translate-center">')

    bindEvents: ->
      $(window).bind 'resize', (e) => @renderTimeSharingChart()

    listenEvents: ->
      timesharingList.on 'TimeSharingDataFetchStart', @showLoading.bind @
      timesharingList.on 'TimeSharingDataFetchEnd', @hideLoading.bind @
      timesharingList.on 'TimeSharingDataFetched', @renderTimeSharingChart.bind @

    fetch: ->
      timesharingList.fetch()

    showLoading: ->
      @$el.append @loading

    hideLoading: ->
      @loading.remove()

    renderTimeSharingChart: ->
      @chart = new Highcharts.Chart @createOptions 
        productName: productIdMap[timesharingList.productId]['name']
        data: timesharingList.get()
        unit: productIdMap[timesharingList.productId]['unit']
        renderTo: @$el.get(0)

    createOptions: (options) ->
      chartOptions =
        chart:
          height: options.height || $(window).width() * 0.625
          width: options.width || $(window).width()
          alignTicks: true
          plotBorderWidth: 1
          borderWidth: 1
          borderColor: '#dddddd'
          renderTo: options.renderTo
        title:
          text: "#{options.productName}(#{options.unit})"
        series: [
          data: options.data
          animation: false
          type: 'line'
          pointInterval: 60 * 1000
          threshold: null
          showInLegend: false
          color: '#66c666'
        ]
        xAxis: [
          gridLineColor: 'gray'
          gridLineDashStyle: 'dot'
          gridLineWidth: 1
          tickColor: 'gray'
          lineColor: 'gray'
          labels:
            style:
              color: 'black'
            formatter: () ->
              d = new Date @value
              hour = d.getHours()
              minute = d.getMinutes()
              [(if hour < 10 then '0' + hour else hour), (if minute < 10 then '0' + minute else minute)].join ':'
        ]
        yAxis: [
          gridLineWidth: 1
          gridLineColor: 'gray'
          gridLineDashStyle: 'dot'
          labels:
            align: 'left'
            style:
              color: 'black'
        ]
        credits: false

  $.TimeSharingChart = TimeSharingChart
  $.fn.TimeSharingChart = (option) ->
    @each (index, element) ->
      timesharingChart = new TimeSharingChart element, option