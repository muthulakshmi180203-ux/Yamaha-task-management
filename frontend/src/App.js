import React from 'react';
import Header from './components/Header';
import TaskOverview from './components/TaskOverview';
import './styles/App.css';

function App() {
    return (
        <div className="App">
            <div className="container">
                <Header />
                <TaskOverview />
                <div className="footer">
                    <p>Be Chill &copy; 2025 | 
                      <button className="link-button">Privacy Policy</button>
<button className="link-button">Terms of Use</button>


                    </p>
                </div>
            </div>
        </div>
    );
}

export default App;