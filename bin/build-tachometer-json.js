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
          "url": "http://localhost:3000/?auto=true&useShadowDom=true&scopeStyles=false"
        },
        {
          "name": "Unscoped",
          "url": "http://localhost:3000/?auto=true&useShadowDom=false&scopeStyles=false&advanceStyle=false"
        },
        {
          "name": "Unscoped - styles in advance",
          "url": "http://localhost:3000/?auto=true&useShadowDom=false&scopeStyles=false&advanceStyle=true"
        },
        {
          "name": "Scoping - classes - full",
          "url": "http://localhost:3000/?auto=true&useShadowDom=false&scopeStyles=true&advanceStyle=false&useClasses=true&scopeModeEvery=true"
        },
        {
          "name": "Scoping - classes - full - styles in advance",
          "url": "http://localhost:3000/?auto=true&useShadowDom=false&scopeStyles=true&advanceStyle=true&useClasses=true&scopeModeEvery=true"
        }
      ]
    }
  ]
})

for (const browser of ['chrome', 'firefox', 'safari']) {
  const filename = `${browser}.tachometer.json`
  fs.writeFileSync(filename, JSON.stringify(makeJson(browser), null, 2), 'utf8')
}
