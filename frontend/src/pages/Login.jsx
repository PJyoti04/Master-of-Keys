import LoginForm from '../components/login/LoginForm'

function Login() {
  return (
    <div className='h-[calc(100vh-80px)] w-full bg-[var(--bg)] font-mono text-white flex items-center justify-center'>
        <LoginForm />
    </div>
  )
}

export default Login