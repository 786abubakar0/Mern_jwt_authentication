const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit'); // Import the helper function
const { body, validationResult } = require('express-validator');

const port = process.env.PORT || 5000;
const MongoDbUrl = process.env.MONGOURI || 'mongodb://localhost:27017/myDatabase';
const FrontEndOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';

const app = express();
const ACCESS_TOKEN_SECRET = 'dafdaf232adsf3243fgfa34sruewrunchr';
const REFRESH_TOKEN_SECRET = 'zcio45344cn8d748b3434ncue4y8373dd';


const requestLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 6, // Max 6 requests per IP per window
  message: 'Too many login attempts from this IP, please try again after 2 minutes',
  keyGenerator: (req, res) => {
    return ipKeyGenerator(req.ip); // Tracks attempts by IP address
  },
});


// Connect to MongoDB
mongoose.connect(MongoDbUrl)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Define a Mongoose schema and model
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  username: String,
  hash: String,
  role: String,
});

const User = mongoose.model('SignUp', userSchema);

// Middleware
app.use(bodyParser.json());
app.use(cookieParser());

const corsOptions = {
  origin: FrontEndOrigin, // frontend origin
  credentials: true, // allows to send cookies
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));

// This middleware will be used to protect certain routes.
const authenticateJWT = (req, res, next) => {
  // Get the access token from the Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ msg: 'Authorization header is missing.' });
  }

  const token = authHeader.split(' ')[1]; // Format: Bearer <token>
  if (!token) {
    return res.status(401).json({ msg: 'Access token is missing.' });
  }

  // Verify the access token
  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      // If the token is invalid or expired, respond with 401
      console.error('JWT verification failed:', err.message);
      return res.status(401).json({ msg: 'Access token expired or invalid.' });
    }
    // If verification is successful, attach the user payload to the request
    req.user = user;
    next();
  });
};

/* Login Routes */
app.post('/login', [
    body('username').trim().escape(),
  ],requestLimiter, async(req, res)=>{
  try{
    const user = await User.findOne({username : req.body.username});
   if (!user) {
    
      return res.status(400).send("Invalid credentials! ");
    }
    
    const isMatch = await bcrypt.compare(req.body.password, user.hash);
    if (!isMatch) {
      return res.status(400).send('Invalid credentials');
    }

    const accessToken = jwt.sign({
    id: user.id,
    username: user.username,
  }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

  // Generate a long-lived refresh token (e.g., 7 days)
  const refreshToken = jwt.sign({
    id: user.id,
    username: user.username,
  }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });


  // Store the refresh token in an HttpOnly cookie for security
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
    secure: process.env.NODE_ENV === 'production', // Use secure in production
    sameSite: 'strict', // Protects against CSRF attacks
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
  });

  // Send the access token back to the client
   return res.status(200).json({
    msg: 'Login Successfully',
    user:{name: user.name, username: user.username,email: user.email, role: user.role},
    accessToken: accessToken
  });

  }
  catch(err){
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


app.post('/refresh_token', (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ msg: 'No refresh token provided.' });
  }

  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      // If the refresh token is invalid or expired, clear the cookie and force re-login
      console.error('Refresh token verification failed:', err.message);
      res.clearCookie('refreshToken');
      return res.status(401).json({ msg: 'Refresh token expired or invalid.' });
    }

    // Generate a new access token
    const newAccessToken = jwt.sign({
      id: user.id,
      username: user.username,
    }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

    res.status(200).json({ accessToken: newAccessToken });
  });
});


/* Registration routes */
// data validation for signup
app.post('/signup', [
    body('name').trim().escape(),
    body('username').trim().escape().isLength({ min: 5 }).withMessage('Username must be at least 5 characters long.'),
    body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email address.'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.'),
    body('role').trim().escape(),

  ],requestLimiter, async (req, res, next)=>{

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send('\nInvalid entries: \nUsername: min 5 characters, password: min 8 characters');
    }
  try{
    const user = await User.findOne({username :req.body.username});

    if(user){
      return res.status(500).send('UserName already exists!');
    }
    
    if(req.body.role == 'admin'){
        const user2 = await User.findOne({role : req.body.role});
        if(user2){
          return res.status(500).send('Admin role already exists!');
        }
        else{
          next();
        }
    }
    else{
      next();
    }
  }
  catch(err){
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// generating hash password for signup
app.post('/signup', async (req, res, next)=>{
  try{
    const password = req.body.password;
    const salt = await bcrypt.genSalt(5);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.hashData = {hashedPassword: hashedPassword};
    next();
  }
  catch(error){
    console.error(err.message);
    return res.status(500).send('Server error');
  }

});

//adding signup data to database 
app.post('/signup', async (req, res) => {
  try {
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      username: req.body.username,
      role: req.body.role,
      hash: req.hashData.hashedPassword
    });

    await newUser.save();
    res.status(201).send('Form data saved successfully!');
  } catch (error) {
    res.status(500).send('Error saving data.');
  }
});

//Routes for profile
// A protected route that requires a valid access token
app.get('/profile', authenticateJWT, async (req, res) => {
  // If the middleware passes, req.user will contain the user payload
  const user = await User.findOne({username : req.user.username});

  res.status(200).json({
    msg: `Welcome to your profile, ${req.user.username}!`,
    userData: user
  });
});

// A protected route that requires a valid access token. It returns total users count
app.get('/getUserCount', authenticateJWT, async (req, res) => {
  const totalCount = await User.countDocuments({role:'user'});
  res.status(200).json({
    msg: 'Total User count',
    userCount: totalCount
  });
});

// A protected route that requires a valid access token. It returns data of all users
app.get('/getAllUserData', authenticateJWT, async (req, res) => {
  // If the middleware passes, req.user will contain the user payload
  const userData = await User.findOne({username: req.user.username});

  if(userData.role == 'admin'){
    const allUserData = await User.find({role: 'user'});
    res.status(200).json({
    msg: 'Total User data',
    allUserData: allUserData
  });
  }
  else{    res.status(403).send('Forbidden: You do not have permission to access this resource.');

  }

});


// Logout route
app.post('/logout', (req, res) => {
  // Clear the HttpOnly cookie containing the refresh token
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.status(200).json({ message: 'Logged out successfully.' });
});

app.get('/', (req, res) => {
  res.send('Your server is running!');
});
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
