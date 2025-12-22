import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Layout from "./layout";
import { Heading, Spinner, Center } from "@chakra-ui/react";

/**
 * PrivateRoute component
 * Protects routes based on authentication and roles
 *
 * Usage:
 * <PrivateRoute allowedRoles={['admin', 'staff']}>
 *   <Dashboard />
 * </PrivateRoute>
 */
const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  // Show loading spinner while auth status is being checked
  if (loading) {
    return (
      <Layout>
        <Center h="80vh">
          <Spinner size="xl" color="blue.500" />
        </Center>
      </Layout>
    );
  }

  // Redirect unauthenticated users to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles is not specified, allow all authenticated users
  if (!allowedRoles || allowedRoles.includes(user.role)) {
    return children;
  }

  // If user is logged in but lacks permissions
  return (
    <Layout>
      <Center h="80vh">
        <Heading size="lg" color="red.500">
          Access Denied — You do not have permission to view this page.
        </Heading>
      </Center>
    </Layout>
  );
};

export default PrivateRoute;
