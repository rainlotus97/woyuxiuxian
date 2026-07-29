import fs from 'node:fs'
import path from 'node:path'

const cdpHttpUrl = process.env.UI_CDP_URL ?? 'http://127.0.0.1:9222'
const appUrl = process.env.UI_APP_URL ?? 'http://127.0.0.1:5173'
const outputDir = process.env.UI_REGRESSION_OUT ?? '/tmp/woyu-ui-regression'

const viewports = [
  { id: '320x740', width: 320, height: 740 },
  { id: '390x844', width: 390, height: 844 },
  { id: '430x932', width: 430, height: 932 },
  { id: '1440x900', width: 1440, height: 900 }
]

const routes = [
  { id: 'cultivation', path: '/game/cultivation', layoutMode: 'normal' },
  { id: 'adventure', path: '/game/adventure', layoutMode: 'normal' },
  { id: 'map', path: '/game/map', layoutMode: 'normal' },
  { id: 'sect', path: '/game/sect', layoutMode: 'normal' },
  { id: 'companion', path: '/game/companion', layoutMode: 'normal' },
  { id: 'inventory', path: '/game/inventory', layoutMode: 'normal' },
  { id: 'profile', path: '/game/profile', layoutMode: 'normal' },
  { id: 'shop', path: '/game/shop', layoutMode: 'normal' },
  { id: 'story', path: '/game/story', layoutMode: 'immersive' },
  { id: 'settings', path: '/game/settings', layoutMode: 'normal' },
  { id: 'battle', path: '/game/battle?areaId=area_%E7%82%BC%E6%B0%94_01_00', layoutMode: 'battle' }
]

const mobileLayoutTolerancePx = 1

function wait(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function getPageTarget() {
  const response = await fetch(`${cdpHttpUrl}/json/list`)
  if (!response.ok) throw new Error(`CDP target list failed: ${response.status}`)
  const targets = await response.json()
  const page = targets.find(target => target.type === 'page')
  if (!page?.webSocketDebuggerUrl) {
    throw new Error(`No Chrome page target at ${cdpHttpUrl}. Start Chrome with remote debugging first.`)
  }
  return page.webSocketDebuggerUrl
}

function createCdpClient(webSocketUrl) {
  const socket = new WebSocket(webSocketUrl)
  const pending = new Map()
  let nextId = 1

  const connected = new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true })
    socket.addEventListener('error', reject, { once: true })
  })

  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data)
    if (!message.id) return
    const resolver = pending.get(message.id)
    if (!resolver) return
    pending.delete(message.id)
    resolver(message)
  })

  async function call(method, params = {}) {
    await connected
    const id = nextId++
    const result = new Promise(resolve => pending.set(id, resolve))
    socket.send(JSON.stringify({ id, method, params }))
    return result
  }

  return { call, close: () => socket.close() }
}

function compareMobileLayoutGeometry(current, baseline) {
  const differences = []
  const compare = (label, currentValue, baselineValue) => {
    if (typeof currentValue !== 'number' || typeof baselineValue !== 'number') return
    if (Math.abs(currentValue - baselineValue) > mobileLayoutTolerancePx) {
      differences.push(`${label} moved or changed size: ${currentValue}/${baselineValue}px`)
    }
  }

  for (const field of ['left', 'right', 'top', 'bottom', 'width', 'height']) {
    compare(`.nav-shell ${field}`, current.navShell?.[field], baseline.navShell?.[field])
    compare(`.main-tab-bar ${field}`, current.mainTabBar?.[field], baseline.mainTabBar?.[field])
  }

  const currentItems = current.tabItems ?? []
  const baselineItems = baseline.tabItems ?? []
  if (currentItems.length !== baselineItems.length) {
    differences.push(`tab item count changed: ${currentItems.length}/${baselineItems.length}`)
  }
  for (let index = 0; index < Math.min(currentItems.length, baselineItems.length); index += 1) {
    for (const field of ['left', 'right', 'top', 'bottom', 'width', 'height']) {
      compare(`tab item ${index + 1} ${field}`, currentItems[index]?.[field], baselineItems[index]?.[field])
    }
  }

  return differences
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true })
  const client = createCdpClient(await getPageTarget())
  const results = []
  const mobileNormalLayoutBaselines = new Map()

  try {
    await client.call('Page.enable')
    await client.call('Runtime.enable')

    for (const viewport of viewports) {
      await client.call('Emulation.setDeviceMetricsOverride', {
        width: viewport.width,
        height: viewport.height,
        deviceScaleFactor: 1,
        mobile: viewport.width < 600
      })

      for (const route of routes) {
        await client.call('Page.navigate', { url: `${appUrl}${route.path}` })
        await wait(route.id === 'battle' ? 950 : 520)

        if (route.id === 'sect') {
          await client.call('Runtime.evaluate', {
            expression: `(() => {
              const tab = [...document.querySelectorAll('.tab-btn')].find(node => node.textContent?.includes('设施'))
              tab?.click()
            })()`
          })
          await wait(120)
        }

        if (route.id === 'inventory') {
          const zeroFilterEvaluation = await client.call('Runtime.evaluate', {
            expression: `(() => {
              const button = [...document.querySelectorAll('[data-ui-filter]')]
                .find(node => Number(node.dataset.uiFilterCount) === 0)
              button?.click()
              return Boolean(button)
            })()`,
            returnByValue: true
          })
          const clickedZeroFilter = zeroFilterEvaluation.result?.result?.value
          if (clickedZeroFilter) {
            await wait(100)
            const emptyEvaluation = await client.call('Runtime.evaluate', {
              expression: `(() => ({
                hasItems: document.querySelectorAll('[data-ui-card="inventory-item"]').length > 0,
                hasEmpty: Boolean(document.querySelector('[data-ui-empty-state="inventory"]'))
              }))()`,
              returnByValue: true
            })
            const emptyMetrics = emptyEvaluation.result?.result?.value
            if (emptyMetrics?.hasItems || !emptyMetrics?.hasEmpty) {
              throw new Error(`inventory zero-count filter did not render an empty state at ${viewport.id}`)
            }
            await client.call('Runtime.evaluate', {
              expression: `document.querySelector('[data-ui-filter="all"]')?.click()`
            })
            await wait(80)
          }
        }

        if (route.id === 'shop') {
          const optionsEvaluation = await client.call('Runtime.evaluate', {
            expression: `(() => ({
              categoryCount: document.querySelectorAll('.category-tabs button').length,
              qualityValues: [...(document.querySelector('.quality-select select')?.options ?? [])]
                .map(option => option.value)
            }))()`,
            returnByValue: true
          })
          const shopOptions = optionsEvaluation.result?.result?.value ?? { categoryCount: 0, qualityValues: [] }
          for (let categoryIndex = 0; categoryIndex < shopOptions.categoryCount; categoryIndex += 1) {
            for (const quality of shopOptions.qualityValues) {
              const qualityLiteral = JSON.stringify(quality)
              await client.call('Runtime.evaluate', {
                expression: `(() => {
                  document.querySelectorAll('.category-tabs button')[${categoryIndex}]?.click()
                  const select = document.querySelector('.quality-select select')
                  if (select) {
                    select.value = ${qualityLiteral}
                    select.dispatchEvent(new Event('change', { bubbles: true }))
                  }
                })()`
              })
              await wait(70)
              const shopStateEvaluation = await client.call('Runtime.evaluate', {
                expression: `(() => {
                  const itemCount = document.querySelectorAll('[data-ui-card="shop-item"]').length
                  const hasList = Boolean(document.querySelector('[data-ui-list="shop"]'))
                  const hasEmpty = Boolean(document.querySelector('[data-ui-empty-state="shop"]'))
                  const grid = document.querySelector('[data-ui-list="shop"]')
                  const last = grid?.lastElementChild
                  let scrollError = ''
                  if (grid && grid.scrollHeight > grid.clientHeight + 1 && last) {
                    grid.scrollTop = grid.scrollHeight
                    const gridRect = grid.getBoundingClientRect()
                    const lastRect = last.getBoundingClientRect()
                    if (lastRect.bottom > gridRect.bottom + 2) scrollError = 'last shop item cannot be scrolled into view'
                  }
                  return { itemCount, hasList, hasEmpty, scrollError }
                })()`,
                returnByValue: true
              })
              const shopState = shopStateEvaluation.result?.result?.value
              if (!shopState || (shopState.itemCount === 0 && !shopState.hasEmpty) || (shopState.itemCount > 0 && !shopState.hasList) || (shopState.itemCount > 0 && shopState.hasEmpty) || shopState.scrollError) {
                throw new Error(`shop filter regression failed at ${viewport.id}: ${JSON.stringify(shopState)}`)
              }
            }
          }
          await client.call('Runtime.evaluate', {
            expression: `(() => {
              document.querySelector('.category-tabs button')?.click()
              const select = document.querySelector('.quality-select select')
              if (select?.options[0]) {
                select.value = select.options[0].value
                select.dispatchEvent(new Event('change', { bubbles: true }))
              }
            })()`
          })
          await wait(80)
        }

        const contentScrollEvaluation = await client.call('Runtime.evaluate', {
          expression: `(() => {
            const candidates = [
              document.querySelector('.adventure-view'),
              document.querySelector('.sect-entry-drawer'),
              document.querySelector('.sect-content-drawer'),
              document.querySelector('.companions-panel'),
              document.querySelector('.panel-layout'),
              document.querySelector('.shop-grid'),
              document.querySelector('.settings-content-drawer')
            ].filter(Boolean)
            const container = candidates.find(node => node.scrollHeight > node.clientHeight + 2)
            if (!container) return { checked: false, error: '' }
            container.scrollTop = container.scrollHeight
            const containerRect = container.getBoundingClientRect()
            const actionable = [...container.querySelectorAll('button, a, select, [role="button"]')]
              .filter(node => {
                const rect = node.getBoundingClientRect()
                return rect.width > 0 && rect.height > 0
              })
            const last = actionable.at(-1)
            if (!last) return { checked: true, error: 'scrollable content has no actionable last item' }
            const lastRect = last.getBoundingClientRect()
            const error = lastRect.bottom > containerRect.bottom + 2
              ? 'last actionable item cannot be reached inside its content panel'
              : ''
            container.scrollTop = 0
            return {
              checked: true,
              error
            }
          })()`,
          returnByValue: true
        })
        const contentScroll = contentScrollEvaluation.result?.result?.value
        if (contentScroll?.error) {
          throw new Error(`${route.id} content panel regression failed at ${viewport.id}: ${contentScroll.error}`)
        }

        const checkMobileNormalLayout = viewport.width < 600 && route.layoutMode === 'normal'
        const evaluation = await client.call('Runtime.evaluate', {
          expression: `(() => {
            const battle = document.querySelector('.battle-page')
            const canvas = document.querySelector('.canvas-battle-host canvas')
            const mainShell = document.querySelector('.main-shell')
            const uiErrors = []
            const mobileLayout = {
              checked: ${checkMobileNormalLayout},
              valid: false,
              errors: [],
              navShell: null,
              mainTabBar: null,
              tabItems: [],
              outerScroll: null
            }
            const measureSquares = (selector, label) => {
              const nodes = [...document.querySelectorAll(selector)]
              for (const node of nodes) {
                const rect = node.getBoundingClientRect()
                const size = Math.max(rect.width, rect.height)
                if (size <= 0 || Math.abs(rect.width - rect.height) > Math.max(2, size * 0.08)) {
                  uiErrors.push(label + ' is not square: ' + Math.round(rect.width) + 'x' + Math.round(rect.height))
                }
              }
              return nodes.length
            }
            const requireListOrEmpty = (listSelector, itemSelector, emptySelector, label) => {
              const itemCount = document.querySelectorAll(itemSelector).length
              const hasEmptyState = Boolean(document.querySelector(emptySelector))
              if (itemCount === 0 && !hasEmptyState) {
                uiErrors.push(label + ' has neither items nor an empty state')
              }
              if (itemCount > 0 && hasEmptyState) {
                uiErrors.push(label + ' has items and an empty state at the same time')
              }
              if (itemCount > 0 && !document.querySelector(listSelector)) {
                uiErrors.push(label + ' has items without its list container')
              }
              return itemCount
            }
            for (const image of document.querySelectorAll('[data-ui-art="image"] img')) {
              if (!image.complete || image.naturalWidth <= 0) {
                uiErrors.push('generated art image did not load')
              }
              if (getComputedStyle(image).objectFit !== 'contain') {
                uiErrors.push('generated art image is not using contain fit')
              }
            }
            for (const fallback of document.querySelectorAll('[data-ui-art="fallback"]')) {
              if (!fallback.getAttribute('aria-label')) {
                uiErrors.push('fallback art is missing an accessible label')
              }
            }

            if ('${route.id}' === 'inventory') {
              requireListOrEmpty('[data-ui-list="inventory"]', '[data-ui-card="inventory-item"]', '[data-ui-empty-state="inventory"]', 'inventory')
              measureSquares('[data-ui-list="inventory"] [data-ui-art]', 'inventory art')
            }
            if ('${route.id}' === 'shop') {
              requireListOrEmpty('[data-ui-list="shop"]', '[data-ui-card="shop-item"]', '[data-ui-empty-state="shop"]', 'shop')
              measureSquares('[data-ui-card="shop-item"] [data-ui-art]', 'shop art')
            }
            if ('${route.id}' === 'sect') {
              const facilityCount = document.querySelectorAll('[data-ui-card="sect-facility"]').length
              if (facilityCount > 0) {
                measureSquares('[data-ui-card="sect-facility"] .facility-icon', 'sect facility icon')
              } else if (!document.querySelector('[data-ui-empty-state="sect"]')) {
                uiErrors.push('sect has neither facilities nor recruit empty state')
              }
            }
            if ('${route.id}' === 'map') {
              const nodeCount = document.querySelectorAll('.map-node').length
              if (nodeCount === 0 && !document.querySelector('[data-ui-empty-state="map"]')) {
                uiErrors.push('map has neither nodes nor an empty state')
              }
              if (nodeCount > 0) measureSquares('.map-node-orb', 'map node icon')
            }

            if (mobileLayout.checked) {
              const html = document.documentElement
              const body = document.body
              const measureScroll = node => node
                ? {
                    scrollHeight: node.scrollHeight,
                    clientHeight: node.clientHeight
                  }
                : null
              const documentScroll = {
                scrollHeight: Math.max(html.scrollHeight, body.scrollHeight),
                clientHeight: innerHeight
              }
              mobileLayout.outerScroll = {
                document: documentScroll,
                html: measureScroll(html),
                body: measureScroll(body),
                mainShell: measureScroll(mainShell)
              }
              for (const [label, metrics] of Object.entries(mobileLayout.outerScroll)) {
                if (!metrics) {
                  mobileLayout.errors.push(label + ' is missing')
                } else if (metrics.scrollHeight > metrics.clientHeight + 1) {
                  mobileLayout.errors.push(label + ' has outer vertical scroll: ' + metrics.scrollHeight + '/' + metrics.clientHeight + 'px')
                }
              }

              const navShell = document.querySelector('.nav-shell')
              const mainTabBar = document.querySelector('.main-tab-bar')
              const tabItems = [...document.querySelectorAll('.main-tab-bar .x-tab-bar__item')]
              if (!navShell || !mainTabBar || tabItems.length === 0) {
                mobileLayout.errors.push('normal mobile layout is missing nav-shell, main-tab-bar, or tab items')
              } else {
                const pixel = value => Math.round(value * 100) / 100
                const navRect = navShell.getBoundingClientRect()
                const mainTabBarRect = mainTabBar.getBoundingClientRect()
                const navStyle = getComputedStyle(navShell)
                const bottomOffset = Number.parseFloat(navStyle.bottom)
                const itemRects = tabItems.map(item => {
                  const rect = item.getBoundingClientRect()
                  return {
                    left: pixel(rect.left),
                    right: pixel(rect.right),
                    top: pixel(rect.top),
                    bottom: pixel(rect.bottom),
                    width: pixel(rect.width),
                    height: pixel(rect.height)
                  }
                })

                mobileLayout.navShell = {
                  left: pixel(navRect.left),
                  right: pixel(navRect.right),
                  top: pixel(navRect.top),
                  bottom: pixel(navRect.bottom),
                  width: pixel(navRect.width),
                  height: pixel(navRect.height)
                }
                mobileLayout.mainTabBar = {
                  left: pixel(mainTabBarRect.left),
                  right: pixel(mainTabBarRect.right),
                  top: pixel(mainTabBarRect.top),
                  bottom: pixel(mainTabBarRect.bottom),
                  width: pixel(mainTabBarRect.width),
                  height: pixel(mainTabBarRect.height)
                }
                mobileLayout.tabItems = itemRects

                if (navStyle.position !== 'fixed' || !Number.isFinite(bottomOffset) || Math.abs(bottomOffset) > 1) {
                  mobileLayout.errors.push('nav-shell is not fixed to bottom: position=' + navStyle.position + ', bottom=' + navStyle.bottom)
                }
                if (Math.abs(navRect.bottom - innerHeight) > 1) {
                  mobileLayout.errors.push('nav-shell bottom is not stable at viewport bottom: ' + pixel(navRect.bottom) + '/' + innerHeight + 'px')
                }
                if (navRect.height <= 0) {
                  mobileLayout.errors.push('nav-shell has no usable height: ' + pixel(navRect.height) + 'px')
                }
                if (!navShell.contains(mainTabBar)) {
                  mobileLayout.errors.push('main-tab-bar is outside nav-shell')
                }
                if (mainTabBarRect.top < navRect.top - 1 || mainTabBarRect.bottom > navRect.bottom + 1 || mainTabBarRect.height <= 0) {
                  mobileLayout.errors.push('main-tab-bar is outside nav-shell or has no stable height: ' + pixel(mainTabBarRect.top) + '-' + pixel(mainTabBarRect.bottom) + 'px')
                }

                const firstItem = itemRects[0]
                for (let index = 0; index < itemRects.length; index += 1) {
                  const item = itemRects[index]
                  if (item.height <= 0 || item.top < mainTabBarRect.top - 1 || item.bottom > mainTabBarRect.bottom + 1) {
                    mobileLayout.errors.push('tab item ' + (index + 1) + ' is outside main-tab-bar or has no usable height')
                  }
                  if (firstItem && (Math.abs(item.bottom - firstItem.bottom) > 1 || Math.abs(item.height - firstItem.height) > 1)) {
                    mobileLayout.errors.push('tab item ' + (index + 1) + ' bottom/height is not aligned with the tab bar')
                  }
                }
              }
              mobileLayout.valid = mobileLayout.errors.length === 0
            }

            const verticalOverflow = document.documentElement.scrollHeight > innerHeight + 1
              || document.body.scrollHeight > innerHeight + 1
              || Boolean(mainShell && mainShell.scrollHeight > mainShell.clientHeight + 1)

            return {
              route: location.pathname,
              viewport: [innerWidth, innerHeight],
              documentWidth: document.documentElement.scrollWidth,
              bodyWidth: document.body.scrollWidth,
              hasHorizontalOverflow: document.documentElement.scrollWidth > innerWidth + 1 || document.body.scrollWidth > innerWidth + 1,
              hasVerticalOverflow: verticalOverflow,
              hasBattleCanvas: Boolean(battle && canvas && canvas.getBoundingClientRect().width > 0 && canvas.getBoundingClientRect().height > 0),
              hasAppRoot: Boolean(document.querySelector('#app')),
              mobileLayout,
              uiErrors
            }
          })()`,
          returnByValue: true
        })
        const metrics = evaluation.result?.result?.value
        if (!metrics?.hasAppRoot) throw new Error(`${route.id} did not render #app`)
        if (metrics.hasHorizontalOverflow) {
          throw new Error(`${route.id} has horizontal overflow at ${viewport.id}: ${metrics.documentWidth}/${metrics.bodyWidth}px`)
        }
        if (metrics.mobileLayout?.errors?.length) {
          throw new Error(`${route.id} mobile normal layout regression failed at ${viewport.id}: ${metrics.mobileLayout.errors.join('; ')}`)
        }
        if (metrics.mobileLayout?.checked && metrics.mobileLayout.valid) {
          const baseline = mobileNormalLayoutBaselines.get(viewport.id)
          if (!baseline) {
            mobileNormalLayoutBaselines.set(viewport.id, metrics.mobileLayout)
          } else {
            const geometryErrors = compareMobileLayoutGeometry(metrics.mobileLayout, baseline)
            if (geometryErrors.length) {
              throw new Error(`${route.id} mobile normal layout geometry changed at ${viewport.id}: ${geometryErrors.join('; ')}`)
            }
          }
        }
        if (metrics.hasVerticalOverflow) {
          throw new Error(`${route.id} has vertical overflow at ${viewport.id}`)
        }
        if (metrics.uiErrors?.length) {
          throw new Error(`${route.id} UI checks failed at ${viewport.id}: ${metrics.uiErrors.join('; ')}`)
        }
        if (route.id === 'battle' && !metrics.hasBattleCanvas) {
          throw new Error(`battle canvas did not render at ${viewport.id}`)
        }

        const screenshot = await client.call('Page.captureScreenshot', {
          format: 'png',
          captureBeyondViewport: false
        })
        const screenshotPath = path.join(outputDir, `${route.id}-${viewport.id}.png`)
        fs.writeFileSync(screenshotPath, Buffer.from(screenshot.result.data, 'base64'))
        results.push({ route: route.id, viewport: viewport.id, screenshotPath, ...metrics })
        console.log(`PASS ${route.id} ${viewport.id}`)
      }
    }
  } finally {
    client.close()
  }

  fs.writeFileSync(path.join(outputDir, 'report.json'), JSON.stringify(results, null, 2))
  console.log(`UI regression report: ${results.length} screenshots in ${outputDir}`)
}

main().catch(error => {
  console.error(error.message)
  process.exitCode = 1
})
