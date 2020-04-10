import React, { FC } from 'react';
import { Route } from 'react-router-dom';
import { Breadcrumb } from 'react-breadcrumbs';
import BreadcrumbTitle from './BreadcrumbTitle';

const CrumbRoute: FC<any> = ({ component: Component, includeSearch = false, render, ...props }) => (
  <Route
    {...props}
    render={(routeProps): JSX.Element => (
      <Breadcrumb
        data={{
          title: <BreadcrumbTitle title={props.title} />,
          pathname: routeProps.match.url,
          search: includeSearch ? routeProps.location.search : null,
        }}
      >
        {Component ? <Component {...routeProps} /> : render(routeProps)}
      </Breadcrumb>
    )}
  />
);

export default CrumbRoute;
