import React from 'react'
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom'
import LoginPage from 'src/pages/auth/LoginPage/LoginPage'
import PortalPage from 'src/pages/PortalPage'
import { routePath } from 'src/routeConfig'
import { SWRProvider } from 'src/services/hooks'
import { AuthorizationProvider } from './contexts/authorization.context'

const App: React.FC = () => (
  <SWRProvider>
    <AuthorizationProvider>

      <BrowserRouter>
        <Switch>
          <Route path={routePath.login} component={LoginPage} />
          <Route path={routePath.appMatcher} component={PortalPage} />
          <Route exact path={routePath.root}><Redirect to={routePath.dashboard} /></Route>
          <Route>
            <Redirect to={routePath.notFound} />
          </Route>
        </Switch>
      </BrowserRouter>
    </AuthorizationProvider>
  </SWRProvider>
)

export default App
