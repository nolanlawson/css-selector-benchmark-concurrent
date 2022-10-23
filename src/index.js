import {
  randomNumber,
  randomString,
  randomColor,
  randomTag,
  randomBool,
  randomChoice,
  randomCoin,
  resetRandomSeed, randomAttribute
} from './rando.js';
import {scopeStyle} from './workerClient.js';

const $ = document.querySelector.bind(document)
const $$ = _ => [...document.querySelectorAll(_)]

const goButton = $('#go')
const useShadowDomInput = $('#useShadowDom')
const scopeStylesInput = $('#scopeStyles')
const numRulesInput = $('#numRules')
const numComponentsInput = $('#numComponents')
const numElementsInput = $('#numElements')
const numClassesInput = $('#numClasses')
const numAttributesInput = $('#numAttributes')
const advanceStylesInput = $('#advanceStyles')
const delayInsertingDomInput = $('#delayInsertingDom')
const useClassesInput = $('#useClasses')
const scopeModeInputLast = $('#scopeModeLast')
const scopeModeInputEvery = $('#scopeModeEvery')
const scopeModeInputPrefix = $('#scopeModePrefix')
const container = $('#container')
const display = $('#display')

let scopeId = 0
let componentTagNameIndex = 0

scopeStylesInput.addEventListener('change', () => {
  for (const input of [useClassesInput, scopeModeInputLast, scopeModeInputEvery, scopeModeInputPrefix]) {
    input.disabled = !scopeStylesInput.checked
  }
})

goButton.addEventListener('click', e => {
  e.preventDefault()
  runTest()
})

async function runTest() {
  goButton.disabled = true
  try {
    await doRunTest()
  } finally {
    goButton.disabled = false
  }
}

function generateAttributeValueSelector({ name, value }) {
  return `[${name}=${JSON.stringify(value)}]`
}

function generateRandomCssRule({ classes, attributes, tags }) {

  const allSelectorTypes = ['tag', 'class', 'attributeName', 'attributeValue', 'notClass', 'notAttribute', 'nthChild']

  function generateRandomFullSelector() {
    let str = ''
    do {
      const firstSelectorType = randomChoice(allSelectorTypes)
      str += generateRandomSelector(firstSelectorType)

      if (randomBool()) {
        // concatenating a tag to something else is not okay
        const secondSelectorType = randomChoice(allSelectorTypes.filter(_ => _ !== 'tag'))
        str += generateRandomSelector(secondSelectorType) // combinator selector
      }
      str += ' ' // descendant selector
    } while (randomBool())

    return str
  }

  function generateRandomSelector(selectorType) {
    switch (selectorType) {
      case 'tag':
        return tags.length ? randomChoice(tags) : randomString()
      case 'class':
        return '.' + (classes.length ? randomChoice(classes) : randomString())
      case 'attributeName':
        return '[' + (attributes.length ? randomChoice(attributes.map(_ => _.name)) : randomString()) + ']'
      case 'attributeValue':
        return generateAttributeValueSelector(attributes.length ? randomChoice(attributes) : { name: randomString(), value: randomString() })
      case 'notClass':
        return ':not(.' + (classes.length ? randomChoice(classes) : randomString()) + ')'
      case 'notAttribute':
        return ':not([' + (attributes.length ? randomChoice(attributes.map(_ => _.name)) : randomString()) + '])'
      case 'nthChild':
        return `:nth-child(${randomNumber(1, 5)})`
    }
  }

  const selector = generateRandomFullSelector()

  return `${selector} { background-color: ${randomColor()}; }`
}

function generateRandomCss({ numRules, classes, attributes, tags }) {
  let str = ''

  for (let i = 0; i < numRules; i++) {
    str += generateRandomCssRule({ classes, attributes, tags }) + '\n\n'
  }

  return str
}

function createStyleTag(css) {
  const style = document.createElement('style')
  style.textContent = css
  return style
}

function injectGlobalCss(css) {
  document.head.appendChild(createStyleTag(css))
}

function reset() {
  container.innerHTML = ''
  $$('style').forEach(style => style.remove())
  resetRandomSeed()
  scopeId = 0
  componentTagNameIndex = 0
}

// requestPostAnimationFrame polyfill
function requestPostAnimationFrame(cb) {
  requestAnimationFrame(() => {
    addEventListener('message', cb, { once: true })
    postMessage('', '*')
  })
}

async function doRunTest() {
  const numComponents = parseInt(numComponentsInput.value, 10)
  const numElementsPerComponent = parseInt(numElementsInput.value, 10)
  const numClassesPerElement = parseInt(numClassesInput.value, 10)
  const numAttributesPerElement = parseInt(numAttributesInput.value, 10)
  const numRulesPerComponent = parseInt(numRulesInput.value, 10)
  const useShadowDom = useShadowDomInput.checked
  const scopeStyles = scopeStylesInput.checked
  const advanceStyles = advanceStylesInput.checked
  const delayInsertingDom = delayInsertingDomInput.checked
  const useClasses = useClassesInput.checked
  const scopeMode = scopeModeInputLast.checked ? 'last' : scopeModeInputEvery.checked ? 'every' : 'prefix'

  reset()

  async function generateRandomScopedCss({ classes, attributes, tags, scopeToken, useClasses, scopeMode, componentTag }) {
    const css = generateRandomCss({ numRules: numRulesPerComponent, classes, attributes, tags })
    if (!scopeStyles) {
      return css
    }
    return (await scopeStyle({ css, token: scopeToken, useClasses, mode: scopeMode, componentTag }))
  }

  function createComponent({ scopeToken }) {
    const component = document.createElement(`my-component-${componentTagNameIndex++}`)

    let renderRoot = component
    if (useShadowDom) {
      const shadow = renderRoot.attachShadow({ mode: 'open' })
      renderRoot = shadow
    }

    let lastElm

    const tags = []
    const classes = []
    const attributes = []

    for (let i = 0; i < numElementsPerComponent; i++) {
      const tag = randomTag()
      tags.push(tag)
      const elm = document.createElement(tag)
      Object.assign(elm.style, {
        width: '1px',
        height: '1px',
        position: 'absolute',
        left: '0',
        right: '0'
      })

      for (let j = 0; j < numClassesPerElement; j++) {
        const clazz = randomString()
        classes.push(clazz)
        elm.classList.add(clazz)
      }

      for (let j = 0; j < numAttributesPerElement; j++) {
        const attribute = randomAttribute()
        const attributeValue = randomString()
        attributes.push({ name: attribute, value: attributeValue })
        elm.setAttribute(attribute, attributeValue)
      }

      if (scopeToken) {
        if (useClasses) {
          elm.classList.add(scopeToken)
        } else {
          elm.setAttribute(scopeToken, '')
        }
      }

      // Chance of making the tree deeper or keeping it flat
      if (lastElm && randomCoin(0.75)) {
        lastElm.appendChild(elm)
      } else {
        renderRoot.appendChild(elm)
      }

      lastElm = elm
    }

    return { component, tags, classes, attributes }
  }

  function createComponents(withStyle) {
    const newRoot = document.createElement('div')
    let lastComponent

    const deferredAppends = []

    for (let i = 0; i < numComponents; i++) {
      const scopeToken = scopeStyles && `scope-${++scopeId}`
      const { component, tags, classes, attributes } = createComponent({ scopeToken })

      // Chance of making the tree deeper or keeping it flat
      const goDeep = lastComponent && randomBool()

      const cachedLastComponent = lastComponent
      lastComponent = component

      const append = () => {
        if (goDeep) {
          (cachedLastComponent.shadowRoot ?? cachedLastComponent).appendChild(component)
        } else {
          newRoot.appendChild(component)
        }
      }

      const stylesheetAppend = withStyle ? (stylesheet) => {
        if (useShadowDom) {
          component.shadowRoot.appendChild(createStyleTag(stylesheet))
        } else {
          injectGlobalCss(stylesheet)
        }
      } : () => {}

      const stylesheetPromise = withStyle ? (async () => {
        return (await generateRandomScopedCss({ classes, tags, attributes, scopeToken, useClasses, scopeMode, componentTag: component.tagName.toLowerCase() }))
      })() : Promise.resolve()
      deferredAppends.push({ append, stylesheetAppend, stylesheetPromise })
    }
    return { newRoot, deferredAppends }
  }

  const { newRoot, deferredAppends } = createComponents(true)

  // wait for all web workers
  for (const deferredAppend of deferredAppends) {
    deferredAppend.stylesheet = await deferredAppend.stylesheetPromise
  }

  if (delayInsertingDom) {
    // insert some initial DOM so that there are some initial style costs
    const { newRoot: initialRoot, deferredAppends: initialAppends } = createComponents(false)
    container.appendChild(initialRoot)
    for (const { append } of initialAppends) {
      append()
    }
    await new Promise(resolve => requestPostAnimationFrame(() => resolve()))
  }

  performance.mark('start')

  container.appendChild(newRoot)
  if (advanceStyles) { // insert all styles in advance
    for (const { stylesheet, stylesheetAppend } of deferredAppends) {
      stylesheetAppend(stylesheet)
    }
  }
  for (const { append, stylesheetAppend, stylesheet } of deferredAppends) {
    if (!advanceStyles) { // insert styles on a per-component basis
      stylesheetAppend(stylesheet)
    }
    if (!delayInsertingDom) {
      append()
    }
    performance.mark('start_component_style')
    await new Promise(resolve => requestPostAnimationFrame(() => resolve()))
    performance.measure('component_style', 'start_component_style')
  }

  if (delayInsertingDom) {
    for (const { append } of deferredAppends) {
      append()
    }
    performance.mark('start_insert_dom')
    await new Promise(resolve => requestPostAnimationFrame(() => resolve()))
    performance.measure('insert_dom', 'start_insert_dom')
  }

  // end
  performance.measure('total', 'start')
  display.innerHTML += `${performance.getEntriesByName('total').slice(-1)[0].duration}ms\n`
  logChecksums()
}

async function logChecksums() {
  // Make sure the HTML is the same every time
  console.log('html digest', await digestMessage(container.getInnerHTML ? container.getInnerHTML({ includeShadowRoots: true }) : container.innerHTML))
  console.log('style digest', await digestMessage($$('style').map(_ => _.textContent).join('\n')))
}

async function digestMessage(message) {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const params = new URLSearchParams(location.search)

async function main() {
  if (params.get('auto') === 'true') {
    for (const input of $$('form input')) {
      const { id } = input
      const val = params.get(id)
      if (val) {
        if (input.type === 'number') {
          input.value = parseInt(val, 10)
        } else if (input.type === 'checkbox' || input.type === 'radio') {
          input.checked = val === 'true'
        }
      }
    }
    // Avoid measuring the style/layout of the form elements
    await new Promise(resolve => requestAnimationFrame(() => resolve()))
    await new Promise(resolve => requestAnimationFrame(() => resolve()))
    await doRunTest()
  }
}

main().catch(err => {
  console.error(err)
})