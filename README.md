# Overall there are 2 main directories:
	- Frontend
 			* It contains all files of whole react project (excluding node_modules folder) created through npx command 'npx create-react-app my-app'. 
			* All created files are places in 'src/files' folder.
	 		* All css files are created in 'src/files/styles' folder.
 	-Server
		* There is server.js file which contain node, express code which handles all the logic of backend.
		* It also contains files about project configuration like package.json.

# Overall review of all code files/changes (Frontend)
	- In public/index.html, only few 'link' tags are added for font import from google fonts.
 	- In src/App.js, routes are defined for each page. (login, signup, profile, userdata).
	- In src/files, there are 6 (login, signup, profile, userdata, api, UserContext) files and 1 (styles) directory.

## UserContext.js
	- Context api is used in this file.
 	- It stores the user info which is used to detect and extract the signed in user.
	- It manages localstorage to store and remove the user info, for login and logout.

## api.js
	- Overall, this file handles the jwt token refresh or any request which is protected and requires authentication.
 	- By default, it returns the axios.create object which is used to send request for resources(which also includes protected resources) from server.
	- There is line of code 'SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';' where in local run it set the server url on localhost on 5000 port.
	- It handles the token refresh logic in case request is rejected from the server. 
 	- It creates the queue to avoid infinite requests from server in case token is invalid/expired.
	- It manages the local storage for accessToken storage.
 	- It handles the cookie for refreshToken through intereceptors.

## signup.js
	- It renders signup form to user.
 	- It also includes this line of code 'SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';' 
	- Frontend logic for signup form is handled in this file.
 	- It checks that if user is already logged in through context api, then it redirects the user to profile page.
	- It doesn't require need protected resources therefore it doesn't use api.js.

## login.js
	- It renders the login form to user.
 	- It also includes this line of code 'SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';' 
	- It checks that if user is already logged in through context api, then it redirects the user to profile page.
	- If user logs in successfully then it stores the accessToken in localstorage.

 ## profile.js
 	- It renders the user data stored in mongoDb database.
	- It checks if user is not logged in then user is redirected to the login page.
 	- It has a button to get total number of users that are registered from database to the logged in users.
	- It also includes log out function that 
 
 
 	

