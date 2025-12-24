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
                      <a href="/privacy-policy">Privacy Policy</a> | 
<a href="/terms-of-use">Terms of Use</a>

                    </p>
                </div>
            </div>
        </div>
    );
}

export default App;