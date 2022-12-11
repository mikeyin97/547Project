CPSC547 Project - Wastewater Treatment Plants (WWTP) Visualization

A visualization dashboard for global WWTP, allowing for the overview and comparison of WWTP metrics across countries. This project uses d3.js and React as the front-end tools for the application. 

The project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app), which provides the basic scaffolding for React web applications. This projects the basic code to set up an initial front-end UI on localhost, which you can find at [this commit](https://github.com/mikeyin97/547Project/commit/d0f7afa45c901bca580919b23a392caab5f794b7). The other code used in the project was written by the team (sometimes with the help of online resources), which can be found in the [commit history](https://github.com/mikeyin97/547Project/commits/main).


## Using the Application

### Dependencies
- node
- yarn

### Starting the Application
- navigate to the application root file

        cd my-app

- install node modules (libraries)

        yarn install

- start the application

        yarn start

- navigate to the homepage on the browser, at localhost:3000/about 


## File Directory

```
my-app

└───node-modules - libraries that accompany the front-end 
    └───    ...

└───public - a static build of the webpage (from Create-React-App; not used)
    └───    ...

└───src - React objects that form the front end of the webpage (bulk of the user-written code lives here)
    |   index.js - entry point of the front-end, renders App.js
    |   index.css
    |   App.js - set up routes to different pages and maintain global variables across all pages. 
    |   App.css
    └─── components - extendable and modular components 
    └─── data - cleaned and formatted data (in json format) to be passed into the front end
    └─── hooks - hook to use D3.js 
    └─── pages - React hooks for the various pages
    |   ... - other bootstrap-included files for testing, debugging, etc. 

|   package.json - provides information on the front-end build, including app name, starting scripts, etc.

|   ... - other module related files that help build the front-end
```