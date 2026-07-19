import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HeroSection from './components/HeroSection'
import Home from './pages/Home'
import { Outlet } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from './context/AuthContext'
import Loader from './components/ui/Loader'
// import { Tooltip } from './components/ui/tooltip'
function App() {

  const { loading } = useContext(AuthContext);

  if(loading) {
    return (
      <div className="min-h-[100vh] bg-[#181C22] flex items-center justify-center "><Loader /></div>
    );
  }

  return (
    <>
    <Navbar />
    <Outlet />
    {/* <Footer /> */}
    </>
  )
}

export default App
