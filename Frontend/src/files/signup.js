import "./styles/signup.css"
import {useState, useEffect} from 'react';
import axios from 'axios';
import { Link, useNavigate} from 'react-router-dom';
import { useUser } from './UserContext';


function SignupForm(){
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        role:'admin'
    });
    const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000';
    const {user} = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/profile');
        }
        }, [user, navigate]); 
    
    if (user) {
        return null; 
    }

    
    const handleOptionChange = (e) => {
        setFormData({...formData, [e.target.name]:e.target.value});
    };
    const handleChange = (e)=>{
        setFormData({...formData, [e.target.name]:e.target.value});
    };

    const handleSubmit = async(e)=>{
        e.preventDefault();
        try{
            await axios.post(SERVER_URL+"/signup", formData);
            alert('SignUp Successful!');
            setFormData({name: '', username: '',email: '', password: '', role:'admin'});
        }
        catch(error){
            console.error("There was an error while signup!", error);
            alert('Sign Up failed!!' + error.response.data);

        }
    };
    return(
    <div className='signup__main-container'>
        <div className='signup__signup-container'>
            <div className='signup__heading'>Sign Up{process.env.SERVER_URL}</div>
            <div className='signup__signup-form'>
                <form className="signup__form" onSubmit={handleSubmit}>
                    <div className='signup__form-item'>
                        <label htmlFor="name">Name</label>
                        <input type='text' id="name" name='name' value={formData.name} onChange={handleChange} required></input>
                    </div>

                    <div className='signup__form-item'>
                        <label htmlFor='email'>Email</label>
                        <input type='email' id='email' name='email' value={formData.email} onChange={handleChange} required></input>
                    </div>

                    <div className='signup__form-item'>
                        <label htmlFor='username'>Username</label>
                        <input type='text' id='username' name='username' value={formData.username} onChange={handleChange} required></input>
                    </div>

                    <div className='signup__form-item'>
                        <label htmlFor='password'>Password</label>
                        <input type='password' id='password' name='password' value={formData.password} onChange={handleChange} required></input>
                    </div>

                    <div className='signup__form-item'>
                        <div className="signup__radio">
                            <div>
                                <label>Admin</label>
                                <input type="radio" name="role" onChange={handleOptionChange} value="admin" checked={formData.role === 'admin'}/>
                            </div>

                            <div>
                                <label>User</label>
                                <input type="radio" name="role" onChange={handleOptionChange} value="user" checked={formData.role === 'user'}/>                             
                            </div>
                        </div>
                    </div>
                    <div className='signup__button-container'>
                        <Link to='/login'><button className='signup__login-button' type='button' id='login'>Login</button></Link>
                        <button className='signup__signup-button' type='submit' id='submit' value='Submit'>Sign up</button>

                    </div>
                    <div className='signup__submit-response'>Submit response</div>                   
                </form>
            </div>
        </div>
    </div>
    );
}

export default SignupForm;
