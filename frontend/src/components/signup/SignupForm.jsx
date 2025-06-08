import { useReducer, useState, useEffect, useContext } from "react";
import { Link,useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const initialState = {
  username: "",
  email: "",
  password: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "UPDATE_FIELD":
      return { ...state, [action.field]: action.value };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

const SignupForm = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [message, setMessage] = useState({type:"",text:""});
  const [showPassword, setShowPassword] = useState(false);
  const {fetchUser} = useContext(AuthContext);

  const navigate = useNavigate();

  useEffect(() => {
      if (message.text) {
        if (message.type === "error") {
          toast.error(message.text);
        } else if (message.type === "success") {
          toast.success(message.text);
        }
      }
    }, [message]);

  const handleChange = (e) => {
    dispatch({
      type: "UPDATE_FIELD",
      field: e.target.name,
      value: e.target.value,
    });
  };

  const validateForm = () => {
    // Trim username before validation and update state
    const trimmedUsername = state.username.trim();
    if (trimmedUsername !== state.username) {
      dispatch({ type: "UPDATE_FIELD", field: "username", value: trimmedUsername });
    }

    // Username: no spaces in between
    if (/\s/.test(trimmedUsername)) {
      setMessage({ type: "error", text: "Username cannot contain spaces." });
      return false;
    }

    // Email validation regex
    const email = state.email;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) && email) {
      setMessage({ type: "error", text: "Please enter a valid email address." });
      return false;
    }

    // Password validation: length >= 6, contains letter, number, special char
    const password = state.password;
    if (password.length < 6 && password) {
      setMessage({ type: "error", text: "Password must be at least 6 characters long." });
      return false;
    }
    if (!/[a-zA-Z]/.test(password) && password) {
      setMessage({ type: "error", text: "Password must contain at least one letter." });
      return false;
    }
    if (!/[0-9]/.test(password) && password) {
      setMessage({ type: "error", text: "Password must contain at least one number." });
      return false;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password) && password) {
      setMessage({ type: "error", text: "Password must contain at least one special character." });
      return false;
    }

    if(!trimmedUsername || !email || !password) {
      setMessage({ type: "error", text: "All fields are required." });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      const response = await axios.post("http://localhost:5000/api/auth/register", state);
      // console.log(response.data);
      setMessage({type:response.data.type,text:response.data.message});
      fetchUser();
      dispatch({ type: "RESET" });
      if(response.data.type == "success"){
        navigate('/');
      }
    } catch (error) {
      setMessage({ type: "error", text: "Signup failed. Please try again." });
    }
  };

  return (
    <div className="md:w-[650px] h-[75vh] rounded-2xl flex">
      {/* Image Section */}
      <div className="hidden md:block p-8 bg-[url(/signup_image.png)] bg-[contain] bg-center bg-no-repeat bg-[#FAEBCE] w-[60%] rounded-s-2xl text-[orange] relative ">
        <h1 className="absolute bottom-[50px] left-[55px] text-4xl font-bold ">
          Welcome !!
        </h1>
      </div>

      {/* Form Section */}
      <div className="bg-[#ff9100] md:rounded-e-2xl md:rounded-none rounded-2xl ">
        <h2 className="text-2xl text-[white] font-bold text-center underline underline-offset-4 pt-16 p-9">
          Sign Up
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4 p-4 text-[orange] ">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={state.username}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
          <input
            type="email"
            name="email"
            placeholder="example@xyz.com"
            value={state.email}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={state.password}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-500 hover:text-[orange]"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <button
            type="submit"
            onClick={handleSubmit}
            className="w-full p-3 text-white bg-black rounded-lg hover:bg-[#0e0d0d] hover:text-[orange] transition duration-200"
          >
            Sign Up
          </button>
        </form>
        
        <p className="text-center text-[15px] text-[black]">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-white underline hover:underline-offset-2"
          >
            Login here
          </Link>
        </p>
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
};

export default SignupForm;
