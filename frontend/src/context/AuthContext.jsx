import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

axios.defaults.withCredentials = true;

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState("");
  const [userInfo,setUserInfo] = useState({});
  const [userInitial, setUserInitial] = useState("");

  const fetchUser = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/me');
      setUserInitial(res.data.initial);
      setUser(res.data.info.username);
      setUserInfo(res.data.info);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setUser("");
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, userInitial, setUserInitial, fetchUser, userInfo, setUserInfo }}>
      {children}
    </AuthContext.Provider>
  );
};

// export const useAuth = () => useContext(AuthContext);
