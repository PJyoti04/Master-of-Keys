import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HeroSection from './components/HeroSection'
import Home from './pages/Home'
import { Outlet } from 'react-router-dom'
// import { Tooltip } from './components/ui/tooltip'
function App() {

  return (
    <>
    <Navbar />
    <Outlet />
    <Footer />
    </>
  )
}

export default App
