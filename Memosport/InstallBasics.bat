::create Gulpfile.js
call npm init
::install libraries for taskrunners
call npm install --save-dev gulp --save-dev gulp-less --save-dev gulp-clean-css --save-dev gulp-concat
::link to local gulp in project
call npm link gulp
::install standard js-libraries
call npm install --save-dev jquery --save-dev requirejs
::install jquery visibility in Typescript
call npm install --save-dev @types/jquery
:: install knockout visibility in Typescript:
::call npm install --save-dev @types/knockout