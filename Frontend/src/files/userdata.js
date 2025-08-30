import "./styles/userdata.css"
import {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import apiClient from './api';

function UserData(){
    const navigate = useNavigate();
    const {user, logout} = useUser();
    const [allUserData, setallUserData] = useState([]);
    const get_user_data = async()=> {
        try {
        // Use apiClient to access the protected /profile endpoint
        const response = await apiClient.get('/getAllUserData');
        setallUserData(response.data.allUserData);
      } catch (error) {
        setallUserData([]);
        await apiClient.post('/logout');
        console.error('Failed to fetch user data:', error);
        alert("Failed to fetch data. ReLogin!");
        logout();        
      }
    };
    
    useEffect(() => {
    get_user_data();
    // eslint-disable-next-line
  },[]); 
    
    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]); 

    if (!user) {
        return <div>Loading Data ...</div>

    }
    
    return(
        <div className='userdata__main-container'>
        <div className='userdata__table-container'>
            <div className='userdata__heading'>Users Data</div>
            <table className='userdata__table'>
                <thead>
                    <tr>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Email</th>
                    </tr>
                </thead>
                <tbody>
                    {allUserData.map((user, index) => (
                    <tr key={index}>
                        <td>{user.name}</td>
                        <td>{user.username}</td>
                        <td>{user.role}</td>
                        <td>{user.email}</td>
                    </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
    );
}

export default UserData;
