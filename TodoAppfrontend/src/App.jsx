import './style/App.css';
import { Routes, Route, useLocation } from 'react-router-dom';

import AddTask from './components/AddTask.jsx';
import List from './components/List.jsx';
import SignUp from './components/Signup.jsx';
import Login from './components/Login.jsx';
import Protected from './components/Protected.jsx';
import NavBar from './components/Navbar.jsx';
import UpdateTask from './components/UpdatedTask.jsx';
import Profile from './components/Profile.jsx';

function App() {
  const location = useLocation();
  const isAuthPage =
    location.pathname === '/login' ||
    location.pathname === '/signup';

  return (
    <div className="app-container">
      {!isAuthPage && <NavBar />}
      <main className={isAuthPage ? 'auth-main' : 'main-content'}>
        <Routes>
          <Route path="/" element={
              <Protected>
                <List />
              </Protected>
            }
          />
          <Route path="/add" element={
              <Protected>
                <AddTask />
              </Protected>
            }
          />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/update/:id" element={
              <Protected>
                <UpdateTask />
              </Protected>
            }
          />
          <Route path='/profile' element={<Protected><Profile /></Protected>} />
        </Routes>
      </main>
    </div>
  );
}
export default App;
