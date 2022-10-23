import fs from 'fs'

const makeJson = browser => ({
  "$schema": "https://raw.githubusercontent.com/Polymer/tachometer/master/config.schema.json",
  "sampleSize": 25,
  "timeout": 0,
  "benchmarks": [
    {
      "browser": {
        "name": browser
      },
      "measurement": [
        {
          "mode": "performance",
          "entryName": "total"
        }
      ],
      "expand": [
        {
          "name": "Shadow DOM",
          "url": "http://localhost:3000/?auto=true&useShadowDom=true&scopeStyles=false&advanceStyles=false"
        },
        {
          "name": "Unscoped",
          "url": "http://localhost:3000/?auto=true&useShadowDom=false&scopeStyles=false&advanceStyles=false"
        },
        {
          "name": "Unscoped - styles in advance",
          "url": "http://localhost:3000/?auto=true&useShadowDom=false&scopeStyles=false&advanceStyles=true"
        },
        {
          "name": "Scoping - classes - full",
          "url": "http://localhost:3000/?auto=true&useShadowDom=false&scopeStyles=true&advanceStyles=false&useClasses=true&scopeModeEvery=true"
        },
        {
          "name": "Scoping - classes - full - styles in advance",
          "url": "http://localhost:3000/?auto=true&useShadowDom=false&scopeStyles=true&advanceStyles=true&useClasses=true&scopeModeEvery=true"
        },
        {
          "name": "Shadow DOM - delay inserting nodes",
          "url": "http://localhost:3000/?auto=true&useShadowDom=true&scopeStyles=false&advanceStyles=false&delayInsertingDom=true"
        },
        {
          "name": "Unscoped - delay inserting nodes",
          "url": "http://localhost:3000/?auto=true&useShadowDom=false&scopeStyles=false&advanceStyles=false&delayInsertingDom=true"
        },
        {
          "name": "Unscoped - styles in advance - delay inserting nodes",
          "url": "http://localhost:3000/?auto=true&useShadowDom=false&scopeStyles=false&advanceStyles=true&delayInsertingDom=true"
        },
        {
          "name": "Scoping - classes - full - delay inserting nodes",
          "url": "http://localhost:3000/?auto=true&useShadowDom=false&scopeStyles=true&advanceStyles=false&useClasses=true&scopeModeEvery=true&delayInsertingDom=true"
        },
        {
          "name": "Scoping - classes - full - styles in advance - delay inserting nodes",
          "url": "http://localhost:3000/?auto=true&useShadowDom=false&scopeStyles=true&advanceStyles=true&useClasses=true&scopeModeEvery=true&delayInsertingDom=true"
        }
      ]
    }
  ]
})

for (const browser of ['chrome', 'firefox', 'safari']) {
  const filename = `${browser}.tachometer.json`
  fs.writeFileSync(filename, JSON.stringify(makeJson(browser), null, 2), 'utf8')
}
