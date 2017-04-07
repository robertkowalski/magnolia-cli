#!/bin/bash

npm i jscodeshift@0.3.30
npm i "https://github.com/cpojer/js-codemod#e1ecfb0e2ba0c621bb21b71afcb79f1fdfce2613"

node_modules/.bin/jscodeshift -t node_modules/js-codemod/transforms/no-vars.js lib/ test/ bin/
node_modules/.bin/standard --fix
