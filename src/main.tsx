import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import LandingPage from './routes/LandingPage'
import LoginPage from './routes/LoginPage'
import SignupPage from './routes/SignupPage'
import ProfilePage from './routes/app/ProfilePage'
import CreateRidePage from './routes/app/CreateRidePage'
import { useQuery, gql } from '@apollo/client';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';


function App() {
const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />
  },
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/signup",
    element: <SignupPage />
  },
  {
    path: "/app/profile",
    element: <ProfilePage />
  },
  {
    path: "/app/createride",
    element: <CreateRidePage />
  }

])

return (
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
}

const client = new ApolloClient({
  uri: ' http://localhost:5000/',
  cache: new InMemoryCache(),
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ApolloProvider client={client}>
  <App />
</ApolloProvider>,
)

export default App;