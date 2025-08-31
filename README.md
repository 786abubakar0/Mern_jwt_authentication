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
 	- It has a button to get total number of users that are registered from database to the logged in users. And it needs jwt validation. This button will be accessible for both admin and user role.
	- It also includes log out button that perform necessary actions regarding local state and sends logout request to the server too.

 ## userdata.js
	- It renders the all user's role data from database to the admin only. And it needs jwt validation. 
 	- It checks if user is not logged in then user is redirected to the login page.

## CSS styling
	- All the css files are stored in src/files/styles.
 	- Each react page has its own separate css file.
 	- Each component class name is prefixed with its file name to avoid conflicts. Like classname of button on login page will be like login__button. 


# Backend server.js
	- It has code 'port = process.env.PORT || 5000;' to assign port to run the server on.
 	- It has code 'MongoDbUrl = process.env.MONGOURI || 'mongodb://localhost:27017/myDatabase';' to assign the url for mongodb server.
  	- It has code 'FrontEndOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';' to asign the url of frontend.

## Database
	- It defines the MongoDb database schema and model.
 	- It connects with mongoDb.

## requestLimiter middleware
	- This middleware is used for protection from brute force attack.
 	- It limits the login or signup request.
  	- Maximum 6 request of login/signup can be made within 2 minutes window from same IP address.

## authenticateJWT middleware
	- This middleware is used to check whether accesstoken is valid and correct to give the access to the protected resource.
 	- If verification is successful, it attaches the user payload to the request and passes the control the next applied route.

## login route
	- It checks for valid username in database and compares the password using bcrypt.compare.
 	- If validation is passed then accessToken is signed for '15 minutes' and sent to the user with status code of 200.
  	- If validation passes, then it also creates refreshToken for '7 days' and it is sent in secure HttpOnly cookie.

 ## refresh_token route
 	- This is used whenever accessToken is failed to verify.
  	- It validates the refresh token from cookie and generates the new accessToken.

## signup routes
	- There are 3 consecutive signup routes.
 	- First route validates the user data like username should have minimum 5 characters, password should have minimum 8 characters, whether username alerady exists or not etc. It only allows 1 admin role at a time.
  	- Second route generates the hash for password.
   	- Third route saves the data in mongodb database and return the status code of 201.
	- Overall, 400 or 500 status code is sent in failure case and 201 status code is sent in successful sign up.  

## getUserCount route
	- This route is jwt protected. It jwt is verified then it returns the total number of users with status code of 200.

 ## getAllUserData route
 	- This route is also jwt protected. It return whole data of all user's with status code of 200.
  	- It only returns the user's data to the admin.

## logout route
	- It clears the cookie to remove the refreshToken and sends 200 status code in case of successful logout.


# Security Measure
	- To be safe from brute force attack, requestlimiter feature is used(on server side) to limit the login/signup requests from frontend. It only allows 6 attempts from single IP in 2 minute window.
 	- To be safe from csrf attacks, {sameSite: 'strict'} is used(on server side) in refreshToken cookie. Similarly {origin: FrontEndOrigin} is used in cors.
  	- To be safe from XSS attacks, express-validator is used(on server side) to escape the data.
 	- Password is saved in database after bcrypt hashing.
  	- On frontend, short lived accessToken is saved in local Storage while accessToken can't be accessed.
   	- User can't submit empty field from frontend, too.

# Deployment
	- I used render for deployment.
 	- In render, web service is used for backend deployment while static site is used for frontend deployment.
  	- For MongoDb, I used mongodb atlas.
	- We need three things urls, frontend url, backend url, mongodb url.
 	- In frontend, server url has to be changed or give through environement variable.
  	- In backend, fronend url is needed and also mongodb url is needed.
   	- I gave all urls through render environment variables.
	- The ip address of the server should be added in mongodb atlas to allow the database access to the server.
 	- A redirect rule is also added in render settings to redirect all routes to index.html due to the reason of how render server intercepts the frontend routes.

