import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import AppRoute from './routes/AppRoute';
import store from './store';

// Check for clickjacking immediately
if (window.top !== window.self) {
  document.body.innerHTML = `
    <div class="flex justify-center items-center h-screen bg-gray-100 text-gray-600 text-center">
      <div>
        <h1 class="text-2xl font-semibold mb-4">
          Connection Refused.
        </h1>
        <p class="text-lg">
          This website cannot be displayed in a frame. It looks like this page
          is being loaded in an unauthorized manner.
        </p>
      </div>
    </div>
  `;
  throw new Error('Clickjacking attempt detected'); // Stop further execution
}

function App() {
  return (
    <BrowserRouter>
      <Provider store={store}>
        <AppRoute />
        <ToastContainer />
      </Provider>
    </BrowserRouter>
  );
}

export default App;
