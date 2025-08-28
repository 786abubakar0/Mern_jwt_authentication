import "./styles/login.css"
import {useState, useEffect} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import apiClient from './api'; 


function LoginForm(){
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    const { user, login } = useUser();
    const navigate = useNavigate();


   useEffect(() => {
          if (user) {
              navigate('/profile');
          }
      }, [user, navigate]); 
  
      if (user) {
          return null; 
      }


    const handleChange = (e)=>{
        setFormData({...formData, [e.target.name]:e.target.value});
    };

    const handleSubmit = async(e)=>{
        e.preventDefault();
        try{
            const response = await apiClient.post("http://localhost:5000/login", formData);
            alert('Login Successful!');
            const { user, accessToken } = response.data;
            localStorage.setItem("accessToken", accessToken);
            login(user);
            navigate('/profile');
            setFormData({username: '', password: ''});
        }
        catch(error){
            console.error("There was an error while login! ", error);
            alert('login failed!!' + error.response.data);

        }
    };
    return(
    <div className='login__main-container'>
        <div className='login__login-container'>
            <div className='login__heading'>Log In</div>
            <div className='login__login-form'>
                <form className='login__form' onSubmit={handleSubmit}>
                    <div className='login__form-item'>
                        <label htmlFor='username'>Username</label>
                        <input type='text' id='username' name='username' value={formData.username} onChange={handleChange} required></input>
                    </div>

                    <div className='login__form-item'>
                        <label htmlFor='password'>Password</label>
                        <input type='password' id='password' name='password' value={formData.password} onChange={handleChange} required></input>
                    </div>
                    <div className='login__button-container'>
                        <Link to="/signup"><button className='login__signup-button' type='button' id='signup'>Signup</button></Link>
                        <button className='login__login-button' type='submit' id='submit' value='Submit'>Login</button>

                    </div>
                    <div className='login__submit-response'>Submit response</div>
                    
                </form>
            </div>

        </div>
    </div>
    );
}

export default LoginForm;