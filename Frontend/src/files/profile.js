import "./styles/profile.css"
import {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';

import apiClient from './api';



function ProfilePage(){
    const navigate = useNavigate();
    const {user, logout} = useUser();
    const [userCount, setuserCount] = useState('--');
    const[isUserLoading, setIsUserLoading] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]); 

    if (!user) {
        return <div>Loading Profile ...</div>

    }

    const get_user_data = async()=> {
        navigate('/userdata');
    };

    const get_user_count = async () => {
      try {
        setIsUserLoading(true);
        // Use apiClient to access the protected /profile endpoint
        const response = await apiClient.get('/getUserCount');
        setIsUserLoading(false);
        setuserCount(response.data.userCount);
      } catch (error) {
        setIsUserLoading(false);
        await apiClient.post('/logout');
        console.error('Failed to fetch profile data:', error);
        alert("Failed to fetch count. ReLogin!");
        logout();
        
      }
    };
    
    
    const handleSubmit = async(e)=>{
        e.preventDefault();
        try{
            await apiClient.post('/logout');
            logout();
            navigate('/login');
        }
        catch(error){
            console.error("There was an error while logout!", error);
            alert('Log out failed!!');

        }
    };
      
    return(
        <div className='profile__main-container'>
        <div className='profile__logout-container'>
            <div className='profile__heading'>Welcome {user.name}!</div>
            <div className='profile__logout-form'>
                <form className='profile__form' onSubmit={handleSubmit}>
                    <div className='profile__form-item'>
                        <label htmlFor='username'>Username: {user.username}</label>
                    </div>

                    <div className='profile__form-item'>
                        <label htmlFor='email'>Email: {user.email}</label>
                    </div>
                    <div className='profile__form-item'>
                        <label htmlFor='role'>Role: {user.role}</label>
                    </div>
                    <div className='profile__form-item'>
                        <label htmlFor='usercount'>Total Users: {userCount}</label>
                    </div>
                    <div className='profile__data-item'>
                        <button className='profile__count-button' type='button' onClick={get_user_count} disabled={isUserLoading}>{isUserLoading ? 'Wait...' : 'Total Users'}</button>

                        {user.role === 'admin' && (
                            // This element is rendered only if role is admin
                            <button className='profile__data-button' type='button' onClick={get_user_data}>Users Data</button>
                        )}

                    </div>

                    <div className='profile__button-container'>
                        <button className='profile__logout-button' id='submit' value='Submit'>Logout</button>
                    </div>  
        
                </form>
            </div>
        </div>
    </div>
    );
}

export default ProfilePage;
