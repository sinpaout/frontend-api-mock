/* eslint-disable no-unused-vars, import/no-webpack-loader-syntax */
import urlParse from 'url-parse'
import { template } from 'lodash'
import $ from 'jquery'
import apiMapper from './apiMapper.yml'

const containerTemplate = template([
  '<div>',
  '  <header style="margin: 3px 0;cursor:pointer;">',
  '    Current mock:',
  '    <span style="font-weight: bold;" class="current"><%= current %></span>',
  '  </header>',
  '  <ul class="mocks" style="margin-top: 6px;">',
  '    <% _.forEach(patterns, function(p, name) { %>',
  '      <li style="margin-bottom: 3px">',
  '        <a href="#" class="select-mock" data-pattern-name="<%= name %>" style="color: #007bff">',
  '          <%= name %>: <%= p.description %>',
  '        </a>',
  '      </li>',
  '    <% }) %>',
  '  </ul>',
  '</div>'
].join(''))

console.log('apiMocker loaded');

let $container

const apiMocker = {
  currentPattern: sessionStorage.getItem('apiMockerPattern') || 'default'
}

window.apiMocker = apiMocker

apiMocker.setCurrentMock = function (patternName) {
  apiMocker.currentPattern = patternName || 'default'
  $container.find('.current').text(apiMocker.currentPattern)
  sessionStorage.setItem('apiMockerPattern', apiMocker.currentPattern)
  sessionStorage.removeItem('apiMockerCounter')
}

apiMocker.resetMock = function () {
  apiMocker.setCurrentMock('')
  sessionStorage.removeItem('apiMockerPattern')
  sessionStorage.removeItem('apiMockerCounter')
}

function buildMockList () {
  $container = $('<div>')
    .append(containerTemplate({
      patterns: apiMapper,
      current: apiMocker.currentPattern
    }))
    .appendTo('body')
  const $mocks = $container.find('.mocks').hide()

  $container.css({
    backgroundColor: '#fdfdfd',
    boxShadow: '0 1px 8px 0 rgba(0, 0, 0, 0.2)',
    display: 'flex',
    position: 'absolute',
    right: 0,
    top: 0,
    opacity: 0.6,
    zIndex: 9999
  })

  $container.on('click', function (event) {
    if ($mocks.is(':hidden')) {
      $container.css({opacity: '1'})
      $mocks.show()
    } else {
      $container.css({opacity: '0.4'})
      $mocks.hide()
    }
  })

  $container.on('click', '.select-mock', function (event) {
    event.preventDefault()
    event.stopPropagation()

    const patternName = $(event.target).data('pattern-name')

    apiMocker.setCurrentMock(patternName)
  })

  $(document).on('click', function (event) {
    if (!$(event.target).closest($container).length) {
      $container.css({opacity: '0.4'})
      $mocks.hide()
    }
  })
}

buildMockList()

function findMockPath (apiPath, config) {
  const defaultApi = apiMapper[apiMocker.currentPattern].api
  const mockApiPath = defaultApi[apiPath]

  if (typeof mockApiPath === 'string') {
    return mockApiPath
  }

  return null

  const counterState = JSON.parse(sessionStorage.getItem('apiMockerCounter') || '{}')
  if (Array.isArray(mockApiPath)) {
    const counter = counterState[apiPath] === undefined ? -1 : counterState[apiPath]
    counterState[apiPath] = (counter + 1) % mockApiPath.length
    sessionStorage.setItem('apiMockerCounter', JSON.stringify(counterState))
    return mockApiPath[counterState[apiPath]]
  }
}

// api.jsから参照できるようにするためにglobalにセットしておく
global.apiMockInterceptor = (config) => {
  try {
    const originalUrl = config.url
    const parsedUrl = urlParse(config.url)

    // URLの整形
    let apiPath = parsedUrl.pathname.replace(new RegExp(`^${config.baseURL}`), '')
    // 最後のスラッシュを削除
    apiPath = apiPath.replace(/\/$/ig, '')
    // モックがあるか検索
    const mockApiPath = findMockPath(apiPath, config)

    console.log('mockApiPath', mockApiPath);

    if (mockApiPath) {
      const data = config.data
      // メソッドを強制的にgetにする
      config.method = 'get'
      config.url = mockApiPath
      // モックされた元の情報をconsole出す
      console.info('api mocked', originalUrl, mockApiPath, data || 'No data')
    }

    return config
  } catch (error) {
    console.error('Error in apiMockInterceptor', error)
    console.error('Config is :', config)
    throw error
  }
}