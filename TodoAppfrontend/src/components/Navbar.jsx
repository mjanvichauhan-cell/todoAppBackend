import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../style/navbar.css';
import { useEffect, useState } from 'react';
function NavBar() {
    const [login, setLogin] = useState(localStorage.getItem('login'));
    const navigate = useNavigate();
    const location = useLocation();
    const logout = () => {
        localStorage.removeItem('login');
        setLogin(null);
        navigate('/login');
    };
    useEffect(() => {
        const handleStorage = () => {
            setLogin(localStorage.getItem('login'));
        };
        window.addEventListener('localStorage-change', handleStorage);
        return () => {
            window.removeEventListener('localStorage-change', handleStorage);
        };
    }, []);
    return (
        <nav className="navbar">
            <Link to="/" className="logo">
                <span className="logo-icon">✓</span>
                <span>TaskFlow</span>
            </Link>
            {login && (
                <div className="nav-links">
                    <Link to="/" className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}> Dashboard </Link>
                    <Link to="/add" className={location.pathname === '/add' ? 'nav-link active' : 'nav-link'} > + Add Task </Link>
                    <Link to="/profile" className={location.pathname === '/profile' ? 'nav-link active' : 'nav-link'}>Profile</Link>
                    <button className="logout-btn" onClick={logout}> Logout </button>
                </div>
            )}
        </nav>
    );
}

export default NavBar;