import SignupForm from "./files/signup.js";
import LoginForm from "./files/login.js";
import ProfilePage from "./files/profile.js"
import UserData from "./files/userdata.js"
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserProvider } from './files/UserContext';


function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/userdata" element={<UserData />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/profile" element={<ProfilePage />}/>
          <Route path="/" element={<SignupForm />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
